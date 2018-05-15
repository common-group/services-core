BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    --\i /specs/sql-support/insert_global_notifications.sql

    select plan(4);

    SELECT can('payment_service', ARRAY['notify_expiring_slips']);
    SELECT function_returns('payment_service', 'notify_expiring_slips', 'json');

    CREATE OR REPLACE FUNCTION test_notify_slip()
    returns setof text language plpgsql
    as $$
        declare
            _active_subscription payment_service.subscriptions;
            _in_time_subscription payment_service.subscriptions;
            _result json;
        begin
            -- generate subscriptions
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _active_subscription;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _in_time_subscription;

            -- generate payments on subscriptions
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id, gateway_general_data) 
                values ('pending', (now() - '1 month + 4 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id, json_build_object('boleto_expiration_date', now() + '6 hours'::interval)::jsonb),
                ('pending', (now() - '1 month + 4 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _in_time_subscription.id, json_build_object('boleto_expiration_date', now() + '2 days'::interval)::jsonb);

            insert into notification_service.notification_global_templates
                (label, subject, template) values 
                ('expiring_slip', 'title', 'body');

            _result := payment_service.notify_expiring_slips();
            return next is((_result ->> 'total_payments_affected')::integer, 1);
            return next is(((_result ->> 'affected_payments_ids')::json->>0)::uuid, _active_subscription.id);
        end;
    $$;
    SELECT * FROM test_notify_slip();

  SELECT * FROM finish();
ROLLBACK;
