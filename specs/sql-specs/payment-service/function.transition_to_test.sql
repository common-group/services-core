BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(3);

    insert into core.core_settings(name, value) values ('subscription_interval', '1 month');

    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.catalog_payments', 'payment_service.payment_status', 'json'], 'boolean');
    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.subscriptions', 'payment_service.subscription_status', 'json'], 'boolean');


    CREATE OR REPLACE FUNCTION test_subscription_transition_canceling_to_canceled()
    returns setof text language plpgsql
    as $$
        declare
            _subscription payment_service.subscriptions;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('canceling', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _subscription;

            -- transition subscription to canceled
            perform payment_service.transition_to(_subscription, 'canceled', '{}');

            -- reload subscription
            select * from payment_service.subscriptions
                where id = _subscription.id
                into _subscription;

            return next ok(_subscription.status = 'canceled', 'should turn status to canceled');

        end;
    $$;
    select test_subscription_transition_canceling_to_canceled();
ROLLBACK;
