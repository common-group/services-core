BEGIN;

    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(6);

    select has_view('payment_service_api', 'subscriptions_per_month', 'check if view is defined');

    create or replace function test_list_subscriptions_per_month()
    returns setof text language plpgsql as $$
    declare
        _subscription_jan_1 payment_service.subscriptions;
        _subscription_jan_2 payment_service.subscriptions;
        _subscription_feb payment_service.subscriptions;
        _subscription_second_user payment_service.subscriptions;
        _payment_jan_1 payment_service.catalog_payments;
        _payment_jan_2 payment_service.catalog_payments;
        _payment_feb payment_service.catalog_payments;
    begin

        -- generate subscriptions in january
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('active', '2018/01/01'::timestamp, __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _subscription_jan_1;

        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('active', '2018/01/01'::timestamp, __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _subscription_jan_2;
        -- generate 1 subscription in february
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
        values ('active', '2018/02/01'::timestamp, __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb, __seed_first_user_credit_card_id())
        returning * into _subscription_feb;

        -- generate payments
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', '2018/01/01'::timestamp, 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription_jan_1.id)
        returning * into _payment_jan_1;

        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', '2018/01/01'::timestamp, 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription_jan_2.id)
        returning * into _payment_jan_2;

        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', '2018/02/01'::timestamp, 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription_feb.id)
        returning * into _payment_feb;

        -- recurring payment, should not count as new subscriber
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', '2018/02/01'::timestamp, 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription_jan_1.id);

        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        -- test with anoymous role

        set local role anonymous;
        return next throws_matching(
            'select * from payment_service_api.subscriptions_per_month',
            'permission denied',
            'should not permit anonymous to list monthly subscriptions'
        );
        perform clean_sets();

        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
        set local role scoped_user;

        return next is(
            (select total_subscriptions from payment_service_api.subscriptions_per_month where month = date_trunc('month', '2018/01/01'::timestamp)),
            2::bigint,
            'should have 2 subscriptions total in january'
        );

        return next is(
            (select total_subscriptions from payment_service_api.subscriptions_per_month where month = date_trunc('month', '2018/02/01'::timestamp)),
            2::bigint,
            'should have 2 subscriptions total in february'
        );

        return next is(
            (select new_subscriptions from payment_service_api.subscriptions_per_month where month = date_trunc('month', '2018/01/01'::timestamp)),
            2::bigint,
            'should have 2 new subscriptions total in january'
        );

        return next is(
            (select new_subscriptions from payment_service_api.subscriptions_per_month where month = date_trunc('month', '2018/02/01'::timestamp)),
            1::bigint,
            'should have 1 new subscriptions total in january'
        );
    end;
    $$;
    select * from test_list_subscriptions_per_month();
ROLLBACK;
