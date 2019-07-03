BEGIN;

    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(4);

    create or replace function test_get_subscribers_count_amount_and_mean_subscription()
    returns setof text language plpgsql as $$
    declare
        _a_project project_service.projects;
        _a_subscription payment_service.subscriptions;
        _a_catalog_payment payment_service.catalog_payments;
        _number_of_payments integer;
        _payments_amount integer;
        _insights_new_subscribers json;
    begin

        _payments_amount := 2400; -- R$ 24,00
        _number_of_payments := 8;

        -- generate project
        insert into project_service.projects
        (permalink, platform_id, user_id, name, mode, status)
        values
        ('permalink', __seed_platform_id(), __seed_first_user_id(), 'proj', 'sub', 'online')
        returning * into _a_project;


        FOR i IN 1..8 LOOP
            -- generate subscription
            insert into payment_service.subscriptions
            (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
            values ('active', '2018-01-05T00:00:00.000'::timestamp, __seed_platform_id(), __seed_first_user_id(), _a_project.id, __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb, __seed_first_user_credit_card_id())
            returning * into _a_subscription;

            -- generate payment
            insert into payment_service.catalog_payments
            (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
            values ('paid', '2018-01-05T00:00:00.000'::timestamp, 'pagarme', __seed_platform_id(), __seed_first_user_id(), _a_project.id, json_build_object('payment_method', 'boleto', 'amount', _payments_amount), _a_subscription.id)
            returning * into _a_catalog_payment;

            -- generate payment status transition
            insert into payment_service.payment_status_transitions
            (catalog_payment_id, from_status, to_status, created_at) 
            values (_a_catalog_payment.id, 'pending', 'paid', '2018-01-05T00:00:00.000'::timestamp);
        END LOOP;

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


        select 
            analytics_service_api
                .new_subscribers_from_period(
                    _a_project.id, -- project_id
                    '2018-01-01'::timestamp, -- start_date
                    '2018-01-08'::timestamp  -- end_date
                )
        into _insights_new_subscribers;

        return next is(
            cast(_insights_new_subscribers->>'subscriptions_count' as integer),
            _number_of_payments,
            'should have 8 new subscriptions from 2018/01/01 to 2018/01/07'
        );

        return next is(
            cast(_insights_new_subscribers->>'mean_amount' as integer),
            _payments_amount,
            'should be R$ 24,00 mean amount for new subscriptions from 2018/01/01 to 2018/01/07'
        );

        return next is(
            cast(_insights_new_subscribers->>'total_amount' as integer),
            _payments_amount * _number_of_payments,
            'should be R$ 192,00 of total amount for new subscriptions from 2018/01/01 to 2018/01/07'
        );
    end;
    $$;
    select * from test_get_subscribers_count_amount_and_mean_subscription();
ROLLBACK;
