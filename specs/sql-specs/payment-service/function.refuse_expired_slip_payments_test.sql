-- Start transaction and plan the tests.
BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    SELECT plan(18);

    SELECT function_returns('payment_service', 'refuse_expired_slip_payments', '{}'::text[], 'json');

    CREATE OR REPLACE FUNCTION test_refuse_expired_slip()
    returns setof text language plpgsql
    as $$
        declare
            _expired_payment payment_service.catalog_payments;
            _non_expired_payment payment_service.catalog_payments;
            _result json;
        begin
            -- generate payments
            insert into payment_service.catalog_payments
                (gateway, platform_id, user_id, project_id, data, gateway_general_data) 
                values ('pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now())::jsonb)
                returning * into _non_expired_payment;

            insert into payment_service.catalog_payments
            (gateway, platform_id, user_id, project_id, data, gateway_general_data) 
            values ('pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now() - '3 days'::interval)::jsonb)
            returning * into _non_expired_payment;

            insert into payment_service.catalog_payments
              (gateway, platform_id, user_id, project_id, data, gateway_general_data) 
              values ('pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now() - '4 days'::interval)::jsonb)
              returning * into _expired_payment;

            insert into payment_service.catalog_payments
                (gateway, platform_id, user_id, project_id, data, gateway_general_data) 
                values ('pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now() - '10 days'::interval)::jsonb)
                returning * into _expired_payment;

            _result := payment_service.refuse_expired_slip_payments();

            return next ok((_result ->> 'total_payments_affected')::integer = 2);
            return next ok(((_result ->> 'affected_payments_ids')::json->>0)::uuid = _expired_payment.id);

            -- reload expired and non expired payments
            select * from payment_service.catalog_payments
                where id = _non_expired_payment.id
                into _non_expired_payment;
            select * from payment_service.catalog_payments
                where id = _expired_payment.id
                into _expired_payment;

            return next is(_non_expired_payment.status, 'pending');
            return next is(_expired_payment.status, 'refused');

        end;
    $$;

    select * from test_refuse_expired_slip();

    create or replace function test_not_inactive_ative_subscription_in_time()
    returns setof text language plpgsql
    as $$
        declare
            _active_subscription payment_service.subscriptions;
            _expired_payment payment_service.catalog_payments;
            _paid_in_time payment_service.catalog_payments;
            _result json;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '15 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _active_subscription;

            -- generate payments
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', (now() - '15 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id)
                returning * into _paid_in_time;

            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id, gateway_general_data) 
                values ('pending', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id, json_build_object('boleto_expiration_date', now() - '9 days'::interval)::jsonb)
                returning * into _expired_payment;

            _result := payment_service.refuse_expired_slip_payments();
            -- reload subscription and payments
            select * from payment_service.subscriptions
                where id = _active_subscription.id
                into _active_subscription;
            select * from payment_service.catalog_payments
                where id = _paid_in_time.id
                into _paid_in_time;
            select * from payment_service.catalog_payments
                where id = _expired_payment.id
                into _expired_payment;

            return next ok((_result ->> 'total_subscriptions_affected')::integer = 0);
            return next ok((_result ->> 'total_payments_affected')::integer = 1);
            return next ok(((_result ->> 'affected_payments_ids')::json->>0)::uuid = _expired_payment.id);

            return next is(_active_subscription.status, 'active');
            return next is(_paid_in_time.status, 'paid');
            return next is(_expired_payment.status, 'refused');
        end;
    $$;

    select * from test_not_inactive_ative_subscription_in_time();


    create or replace function test_inactive_ative_subscription_expired()
    returns setof text language plpgsql
    as $$
        declare
            _active_subscription payment_service.subscriptions;
            _expired_payment payment_service.catalog_payments;
            _paid_not_in_time payment_service.catalog_payments;
            _result json;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '2 months'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _active_subscription;

            -- generate payments
            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', (now() - '1 month'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id)
                returning * into _paid_not_in_time;

            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id, gateway_general_data) 
                values ('pending', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _active_subscription.id, json_build_object('boleto_expiration_date', now() - '9 days'::interval)::jsonb)
                returning * into _expired_payment;

            _result := payment_service.refuse_expired_slip_payments();
            -- reload subscription and payments
            select * from payment_service.subscriptions
                where id = _active_subscription.id
                into _active_subscription;
            select * from payment_service.catalog_payments
                where id = _paid_not_in_time.id
                into _paid_not_in_time;
            select * from payment_service.catalog_payments
                where id = _expired_payment.id
                into _expired_payment;

            return next is((_result ->> 'total_subscriptions_affected')::integer, 1);
            return next is(((_result ->> 'affected_subscriptions_ids')::json->>0)::uuid, _active_subscription.id);
            return next is((_result ->> 'total_payments_affected')::integer , 1);
            return next is(((_result ->> 'affected_payments_ids')::json->>0)::uuid, _expired_payment.id);

            return next is(_active_subscription.status, 'inactive');
            return next is(_paid_not_in_time.status, 'paid');
            return next is(_expired_payment.status, 'refused');
        end;
    $$;

    select * from test_inactive_ative_subscription_expired();


    SELECT * FROM finish();
ROLLBACK;
