BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    -- \i /specs/sql-support/insert_global_notifications.sql

    select plan(5);

    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.catalog_payments', 'payment_service.payment_status', 'json'], 'boolean');
    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.subscriptions', 'payment_service.subscription_status', 'json'], 'boolean');


    CREATE OR REPLACE FUNCTION test_subscription_transition_when_deleted()
    returns setof text language plpgsql
    as $$
        declare
            _subscription payment_service.subscriptions;
            _canceled_notification notification_service.notifications;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _subscription;

            -- should not transit subscription to any status
            return next is(payment_service.transition_to(_subscription, 'active', '{}'), false, 'should not change subscription status');
        end;
    $$;
    select * from test_subscription_transition_when_deleted();

    CREATE OR REPLACE FUNCTION test_subscription_transition_canceling_to_canceled()
    returns setof text language plpgsql
    as $$
        declare
            _subscription payment_service.subscriptions;
            _canceled_notification notification_service.notifications;
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

            -- get canceled notification
            select n.* from notification_service.notifications n
                join notification_service.notification_global_templates ngt 
                    on ngt.id = n.notification_global_template_id
                where n.user_id = _subscription.user_id
                    and ngt.label = 'canceled_subscription'
                    and (n.data -> 'relations' ->> 'subscription_id')::uuid = _subscription.id
                into _canceled_notification;

            return next ok(_canceled_notification.id is not null, 'should have a canceled_subscription notification');

        end;
    $$;
    select test_subscription_transition_canceling_to_canceled();

    SELECT * FROM finish();
ROLLBACK;
