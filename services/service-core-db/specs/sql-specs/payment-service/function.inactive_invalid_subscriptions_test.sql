BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql

    SELECT plan(4);

    SELECT function_returns('payment_service', 'inactive_invalid_subscriptions', '{}'::text[], 'json');

    create or replace function test_inactive_invalid_subscriptions()
    returns setof text language plpgsql
    as $$
        declare
            _invalid_subscription payment_service.subscriptions;
            _invalid_subscription_2 payment_service.subscriptions;
            _invalid_subscription_3 payment_service.subscriptions;
            _valid_subsciption payment_service.subscriptions;
            _result json;
        begin

            -- generate subscriptions
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _invalid_subscription;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('started', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _invalid_subscription_2;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _invalid_subscription_3;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', now(), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _valid_subsciption;

            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _valid_subsciption.id),
                ('error', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription.id),
                ('refused', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription_2.id),
                ('refused', (now() - '2 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription_2.id),
                ('refused', (now() - '2 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription_2.id),
                ('refused', (now() - '2 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription_2.id),
                ('refused', (now() - '10 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _invalid_subscription_3.id);

            _result := payment_service.inactive_invalid_subscriptions();
            -- reload subscriptions
            select * from payment_service.subscriptions where id = _invalid_subscription.id into _invalid_subscription;
            select * from payment_service.subscriptions where id = _invalid_subscription_2.id into _invalid_subscription_2;
            select * from payment_service.subscriptions where id = _invalid_subscription_3.id into _invalid_subscription_3;
            select * from payment_service.subscriptions where id = _valid_subsciption.id into _valid_subsciption;

            return next is(_invalid_subscription.status, 'inactive', 'should inative paid subscription with error payment');
            return next is(_invalid_subscription_2.status, 'inactive', 'should inative started subscription with error/refused payment retries');
            return next is(_invalid_subscription_3.status, 'active', 'should not inactive until reach retries limit');
        end;
    $$;
    select * from test_inactive_invalid_subscriptions();

ROLLBACK;
