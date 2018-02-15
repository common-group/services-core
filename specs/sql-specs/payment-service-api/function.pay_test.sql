BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(25);

    SELECT function_returns(
        'payment_service_api', 'pay', ARRAY['json'], 'json' 
    );

    prepare pay_with_data as select * from payment_service_api.pay(__json_data_payment($1::json));

    create or replace function test_pay_with_anon()
    returns setof text language plpgsql as $$
    declare
    begin
        -- test with anonymous role
        set local role anonymous;
        set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';
        return next throws_like('EXECUTE pay_with_data(''{}'')', '%insufficient_privilege', 'anonymous cannot perform pay operation');
    end;
    $$;
    select test_pay_with_anon();

    create or replace function test_pay_with_platform_user()
    returns setof text language plpgsql as $$
    declare
    _count_expected numeric default 0;
    begin
        set local role platform_user;
        set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';

        -- ip header should be found
        return next throws_matching('EXECUTE pay_with_data(''{}'')', '.+x-forwarded-for', 'should raise when ip header not found');
        set local "request.header.x-forwarded-for" to '127.0.0.1'; 

        -- should not valid when project is not sub
        return next throws_matching('EXECUTE pay_with_data(''{"project_id": "'||__seed_aon_project_id()||'"}'')', 'only_sub_projects', 'should raise when project is not sub mode');

        -- test valid data with platform_user
        return next lives_ok('EXECUTE pay_with_data(''{"external_id": "1234"}'')', 'platform_user can call pay');

        -- test unique external_id payment
        return next throws_matching('EXECUTE pay_with_data(''{"external_id": "1234"}'')', '.+uniq_payments_ext_id' ,'platform_user cant use same external_id twice');

        -- test document cpf validation
        return next throws_matching('EXECUTE pay_with_data(''{"customer_document_number": "987.264.123-23"}'')', 'invalid_document' ,'should be error when document_number is invalid');

        -- check if payment has inserted
        select count(1) from payment_service.catalog_payments
        where user_id = 'd44378a2-3637-447c-9f57-dc20fff574db'
        and external_id = '1234'
        into _count_expected;
        return next ok(_count_expected = 1, 'should have inserted payment');
    end;
    $$;
    select test_pay_with_platform_user();

    create or replace function test_pay_with_scoped_user()
    returns setof text language plpgsql as $$
    declare
    _count_expected numeric default 0;
    _generated_payment payment_service.catalog_payments;
    _generated_subscription payment_service.subscriptions;
    begin
        -- test valid data with scoped_user
        set local role scoped_user;
        set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
        set local request.jwt.claim.user_id to 'bb8f4478-df41-411c-8ed7-12c034044c0e';
        set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found

        -- test document cpf validation
        return next throws_matching('EXECUTE pay_with_data(''{"customer_document_number": "987.264.123-23"}'')', 'invalid_document' ,'should be error when document_number is invalid');

        -- test card document cpf validation
        return next throws_matching('EXECUTE pay_with_data(''{"card_hash": "foo_hash_card", "payment_method": "credit_card", "credit_card_owner_document": "987.264.123-23"}'')', 'invalid_card_owner_document' ,'should be error when credit_card_owner_document is invalid');

        -- should exeute pay with boleto
        return next lives_ok('EXECUTE pay_with_data(''{"external_id":"12345"}'')', 'scoped_user can call pay');

        -- should exeute pay with credit_card and generate a subscription
        return next lives_ok('EXECUTE pay_with_data(''{"credit_card_owner_document": "", "external_id":"12346", "card_hash": "foo_card_hash", "payment_method": "credit_card", "anonymous": true, "subscription": true}'')', 'scoped_user can call pay with credit card');

        -- check if payment for user is generated
        select count(1) from payment_service.catalog_payments
        where user_id = 'd44378a2-3637-447c-9f57-dc20fff574db'
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next is(
            _count_expected::numeric,
            1::numeric, 
            'should not add more payment to passed user_id when is not the same of scoped_user request');

        -- check if external id is ignored
        select count(1) from payment_service.catalog_payments
        where external_id in('12345', '12346')
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next is(_count_expected::numeric, 0::numeric, 'should ignore external_id when scoped_user');

        select count(1) from payment_service.catalog_payments
        where user_id = 'bb8f4478-df41-411c-8ed7-12c034044c0e'
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next is(_count_expected::numeric, 2::numeric, 'should persist payments to scoped_user');

        select * from payment_service.catalog_payments
        where user_id = 'bb8f4478-df41-411c-8ed7-12c034044c0e'
            and data ->> 'payment_method'::text = 'credit_card'
        order by created_at desc limit 1
        into _generated_payment;
        return next is((_generated_payment.data->>'anonymous')::boolean, true, 'should mark with anonymous the last payment');
        return next is((_generated_payment.subscription_id is not null), true, 'should generate a subscription on payment');

        select * from payment_service.subscriptions where id = _generated_payment.subscription_id
        into _generated_subscription;
        return next is((_generated_subscription.checkout_data->>'anonymous')::boolean, true, 'should generate subscription with anon in checkout data');
    end;
    $$;

    select test_pay_with_scoped_user();

    create or replace function test_repay_error_with_scoped_user()
    returns setof text language plpgsql as $$
    declare
        _payment payment_service.catalog_payments;
        _pay_response json;
    begin
        -- test valid data with scoped_user
        set local role scoped_user;
        set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
        set local request.jwt.claim.user_id to 'bb8f4478-df41-411c-8ed7-12c034044c0e';
        set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found

        -- generate payment
        insert into payment_service.catalog_payments
            (id, gateway, platform_id, user_id, project_id, data) 
                values ('7642bff3-95db-467b-9576-eb23f43ab8ee', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}')
            returning * into _payment;

        return next throws_matching('EXECUTE pay_with_data(''{"payment_id": "7642bff3-95db-467b-9576-eb23f43ab8ee"}'')', 'cant pay this payment' ,'cant repay when not my payment');

        -- update payment to my user
        update payment_service.catalog_payments
            set user_id = __seed_second_user_id()
            where id = _payment.id
            returning * into _payment;

        return next throws_matching('EXECUTE pay_with_data(''{"payment_id": "7642bff3-95db-467b-9576-eb23f43ab8ee"}'')', 'cant pay this payment' ,'cant repay when not in error status');

        -- update payment to error status
        update payment_service.catalog_payments
            set status = 'error'
            where id = _payment.id
            returning * into _payment;

        -- should exeute pay
        return next lives_ok('EXECUTE pay_with_data(''{"payment_id": "7642bff3-95db-467b-9576-eb23f43ab8ee", "subscription": true}'')', 'scoped_user can call pay');
        
        -- reload payment
        select * from payment_service.catalog_payments
            where id = _payment.id
            into _payment;

        return next is(_payment.status, 'pending', 'put payment in pending again');
        return next ok(_payment.subscription_id is null, 'should not generate a subscriptin');

        --select * from payment_service_api.pay(
        --    __json_data_payment()
        --) into _pay_response;
    end;
    $$;

    select test_repay_error_with_scoped_user();


    create or replace function test_pay_with_foreign_user()
    returns setof text language plpgsql as $$
    declare
    _count_expected numeric default 0;
    _generated_payment payment_service.catalog_payments;
    _generated_subscription payment_service.subscriptions;
    begin
        -- test valid data with scoped_user
        set local role scoped_user;
        set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
        set local request.jwt.claim.user_id to 'bb8f4478-df41-411c-8ed7-12c034044c0e';
        set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found

        -- test card document cpf validation
        return next lives_ok(
            'EXECUTE pay_with_data(''{"subscription": true, "is_international": true, "card_hash": "foo_hash_card", "payment_method": "credit_card", "credit_card_owner_document": "", "customer_document_number": "", "customer_document_type": "", "subscription": "", "customer_address_number": "", "customer_phone_ddi": ""}''::json)',
            'should persist payment without vaildate documents and some address field');

        -- cant generate boleto for international payments
        return next throws_matching(
            'EXECUTE pay_with_data(''{"subscription": true, "is_international": true, "payment_method": "boleto", "customer_document_number": "", "customer_document_type": "", "subscription": ""}''::json)',
            'invalid_payment_method' ,
            'cant generate a boleto when foreign payment');
    end;
    $$;

    select test_pay_with_foreign_user();



    select * from finish();

    ROLLBACK;
