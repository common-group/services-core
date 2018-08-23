BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(5);
    
    prepare cancel_subscriptions as select * from payment_service.cancel_subscriptions();

    SELECT function_returns('payment_service', 'cancel_subscriptions', 'json', 'should be defined');

    CREATE OR REPLACE FUNCTION test_cancel_subscriptions()
    returns setof text language plpgsql
    as $$
        declare
            _subscription payment_service.subscriptions;
            _non_canceling_sub payment_service.subscriptions;
            _canceling_sub_in_time payment_service.subscriptions;

        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('canceling', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _subscription;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _non_canceling_sub;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('canceling', (now() - '5 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _canceling_sub_in_time;

            -- generate payment
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', (now() - '1 month + 3 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb, _subscription.id),
                ('paid', (now() - '1 month + 3 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb, _non_canceling_sub.id),
                ('paid', (now() - '5 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb, _canceling_sub_in_time.id);

            return next lives_ok('EXECUTE cancel_subscriptions', 'should execute');

            -- select * subsciption again to check status
            select * from payment_service.subscriptions
                where id = _subscription.id
                into _subscription;

            select * from payment_service.subscriptions
                where id = _non_canceling_sub.id
                into _non_canceling_sub;

            select * from payment_service.subscriptions
                where id = _canceling_sub_in_time.id
                into _canceling_sub_in_time;

            return next ok(_subscription.status = 'canceled', 'should turn subscription to canceled');
            return next ok(_non_canceling_sub.status = 'active', 'should not turn subscription to canceled');
            return next ok(_canceling_sub_in_time.status = 'canceling', 'should mantain on canceling when not in time to cancel');
        end;
    $$;

    select test_cancel_subscriptions();

    SELECT * FROM finish();
ROLLBACK;
