BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql

    SELECT plan(10);

    SELECT function_returns('payment_service', 'subscriptions_charge', '{}'::text[], 'json');

    CREATE OR REPLACE FUNCTION test_subscriptions_charge()
    RETURNS SETOF text LANGUAGE plpgsql
    as $$
        declare
            _active_subscription payment_service.subscriptions;
            _in_time_subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
            _count_expected integer;
            _result json;
        begin

            -- generate subscriptions
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _active_subscription;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', now(), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _in_time_subscription;

            -- generate payments on subscriptions
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', (now() - '1 month + 4 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id),
                ('paid', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _in_time_subscription.id);

            _result := payment_service.subscriptions_charge();
            return next is((_result ->> 'total_affected')::integer, 1);
            return next is(((_result ->> 'affected_ids')::json->>0)::uuid, _active_subscription.id);

            -- reload subscriptions
            select * from payment_service.subscriptions
                where id = _active_subscription.id
                into _active_subscription;

            select * from payment_service.subscriptions
                where id = _in_time_subscription.id
                into _in_time_subscription;

            -- get last payment generated for subscription
            select * from payment_service.catalog_payments
                where subscription_id = _active_subscription.id
                order by created_at desc limit 1
                into _generated_payment;

            return next is(_generated_payment.status, 'pending');


            select count(1) from payment_service.catalog_payments
                where subscription_id = _active_subscription.id
                into _count_expected;
            return next is(_count_expected, 2, 'should generate more one payment');

            select count(1) from payment_service.catalog_payments
                where subscription_id = _in_time_subscription.id
                into _count_expected;
            return next is(_count_expected, 1, 'should not generate more one payment to in time subscription');

            -- run again should not charge the same subscription
            _result := payment_service.subscriptions_charge();
            return next is((_result ->> 'total_affected')::integer, 0);
            return next is(((_result ->> 'affected_ids')::json->>0)::uuid, null::uuid);

            -- generate another subscription to be charged
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _active_subscription;
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', (now() - '1 month + 4 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id);

            -- move project to rejected
            update project_service.projects
                set status = 'rejected'
                where id = __seed_project_id();

            -- run again should not charge the new subscription for rejected project
            _result := payment_service.subscriptions_charge();
            return next is((_result ->> 'total_affected')::integer, 0);
            return next is(((_result ->> 'affected_ids')::json->>0)::uuid, null::uuid);

        end;
    $$;

    select * from test_subscriptions_charge();

    SELECT * FROM finish();
ROLLBACK;
