BEGIN;

    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(10);

    select has_view('payment_service_api', 'payments', 'check if view is defined');

    create or replace function test_list_payments()
    returns setof text language plpgsql as $$
    declare
        _subscription payment_service.subscriptions;
        _subscription_second_user payment_service.subscriptions;
        _deleted_subscription payment_service.subscriptions;
        _payment payment_service.catalog_payments;
        _payment_second_user payment_service.catalog_payments;
        _payment_from_deleted payment_service.catalog_payments;
        _result payment_service_api.payments;
    begin

        -- generate active subscription into _subscription
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _subscription;

        -- generate deleted subscription into _deleted_subscription
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _deleted_subscription;

        -- generate active subscription into _subscription_second_user
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _subscription_second_user;

        -- generate payment on _subscription
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id)
        returning * into _payment;

        -- generate payment on _subscription
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', now(), 'pagarme', __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription_second_user.id)
        returning * into _payment_second_user;

        -- generate payment on _deleted_subscription
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _deleted_subscription.id)
        returning * into _payment_from_deleted;

        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        -- test with anoymous role

        set local role anonymous;
        return next throws_matching(
            'select * from payment_service_api.payments',
            'permission denied',
            'should not permit anonymous to list payments'
        );
        perform clean_sets();

        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        set local role scoped_user;
        
        return next is(
            (select count(1) from payment_service_api.payments where subscription_id = _deleted_subscription.id),
            0::bigint,
            'should not list payments from deleted subscriptions'
        );

        return next is(
            (select count(1) from payment_service_api.payments),
            1::bigint,
            'should can list all payments from user on project'
        );
        select * from payment_service_api.payments into _result;
        return next is(_result.id, _payment.id, 'scoped user can see only they payment');

        -- test with project owner
        perform clean_sets();
        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_second_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        set local role scoped_user;

        return next is(
            (select count(1) from payment_service_api.payments where subscription_id = _deleted_subscription.id),
            0::bigint,
            'should not list payments from deleted subscriptions'
        );

        select * from payment_service_api.payments 
        where subscription_id = _subscription.id into _result;
        return next is(_result.id, _payment.id, 'project owner can see another users payments made on project');

        return next is(
            (select count(1) from payment_service_api.payments),
            2::bigint,
            'should can list all payments on project'
        );

        -- test with another that is not payer and not project owner
        perform clean_sets();

        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_third_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        set local role scoped_user;

        return next is(
            (select count(1) from payment_service_api.payments),
            0::bigint,
            'can see nothing when not have any payment or project that received payments'
        );
        perform clean_sets();

        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        set local role platform_user;

        return next is(
            (select count(1) from payment_service_api.payments),
            2::bigint,
            'platform admin can see all payments'
        );
    end;
    $$;
    select * from test_list_payments();
ROLLBACK;
