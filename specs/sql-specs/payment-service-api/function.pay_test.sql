BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(12);

    SELECT function_returns(
        'payment_service_api', 'pay', ARRAY['json'], 'json' 
    );

    prepare pay_with_data as select * from payment_service_api.pay(__json_data_payment($1::json));

    savepoint init;

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
    begin
        -- test valid data with scoped_user
        set local role scoped_user;
        set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
        set local request.jwt.claim.user_id to 'bb8f4478-df41-411c-8ed7-12c034044c0e';
        set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found

        -- test document cpf validation
        return next throws_matching('EXECUTE pay_with_data(''{"customer_document_number": "987.264.123-23"}'')', 'invalid_document' ,'should be error when document_number is invalid');

        -- should exeute pay
        return next lives_ok('EXECUTE pay_with_data(''{"external_id":"12345"}'')', 'scoped_user can call pay');

        -- check if payment for user is generated
        select count(1) from payment_service.catalog_payments
        where user_id = 'd44378a2-3637-447c-9f57-dc20fff574db'
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next ok(_count_expected = 1, 'should add more payment to passed user_id when is not the same of scoped_user request');

        -- check if external id is ignored
        select count(1) from payment_service.catalog_payments
        where external_id = '12345'
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next ok(_count_expected = 0, 'should ignore external_id when scoped_user');

        select count(1) from payment_service.catalog_payments
        where user_id = 'bb8f4478-df41-411c-8ed7-12c034044c0e'
        and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
        return next ok(_count_expected = 1, 'should persist a payment to scoped_user');
    end;
    $$;
    select test_pay_with_scoped_user();

    select * from finish();

    ROLLBACK;
