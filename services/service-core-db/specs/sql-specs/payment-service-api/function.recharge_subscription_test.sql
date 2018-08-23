BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(9);

    select function_returns(
        'payment_service_api', 'recharge_subscription', ARRAY['uuid'], 'json'
    );

    prepare recharge_subscription as select * from payment_service_api.recharge_subscription($1::uuid);

    create or replace function test_with_scoped_user()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _another_user_sub payment_service.subscriptions;
            _recharged_payment payment_service.catalog_payments;
            _expired_payment payment_service.catalog_payments;
            _refused_payment payment_service.catalog_payments;
            _result json;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "boleto"}'::json)::jsonb)
                returning * into _subscription;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "boleto"}'::json)::jsonb)
                returning * into _another_user_sub;

            insert into payment_service.catalog_payments
                (subscription_id, status, gateway, platform_id, user_id, project_id, data, gateway_general_data) 
                values (_subscription.id, 'pending', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now())::jsonb)
                returning * into _expired_payment;

            insert into payment_service.catalog_payments
                (subscription_id, status, gateway, platform_id, user_id, project_id, data, gateway_general_data) 
                values (_another_user_sub.id, 'refused', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb, json_build_object('boleto_expiration_date', now())::jsonb)
                returning * into _refused_payment;

            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            return next throws_matching(
                'EXECUTE recharge_subscription('''||_another_user_sub.id||''')',
                'subscription_not_found',
                'cannot edit another user subscription'
            );

            _result := payment_service_api.recharge_subscription(_subscription.id);

            -- load the new generated payment
            select * from payment_service.catalog_payments 
                where id = (_result->>'catalog_payment_id')::uuid
                into _recharged_payment;

            -- reload expired payment data
            select * from payment_service.catalog_payments 
                where id = _expired_payment.id
                into _expired_payment;

            return next ok(_recharged_payment.id <> _expired_payment.id, 'should generate a new payment');
            return next is(_expired_payment.status, 'refused', 'should refuse expired payment');
            return next is(_recharged_payment.subscription_id, _subscription.id, 'should generate a new payment on same subscription');
            return next is(_recharged_payment.data->>'payment_method', 'boleto', 'new payment should have the same payment method');

            -- when scoped user is a admin role
            set local request.jwt.claim.scopes to '["admin"]';

            _result := payment_service_api.recharge_subscription(_another_user_sub.id);

            -- load the new generated payment
            select * from payment_service.catalog_payments 
                where id = (_result->>'catalog_payment_id')::uuid
                into _recharged_payment;

            return next ok(_recharged_payment.id <> _refused_payment.id, 'should generate a new payment');
            return next is(_recharged_payment.subscription_id, _another_user_sub.id, 'should generate a new payment on same subscription');

            perform clean_sets();
        end;
    $$;
    select * from test_with_scoped_user();

    create or replace function test_with_anon()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "boleto"}'::json)::jsonb)
                returning * into _subscription;

            set local role anonymous;
            EXECUTE 'set local "request.header.platform-code" to '''||__seed_platform_token()||'''';

            return next throws_matching(
                'EXECUTE recharge_subscription('''||_subscription.id||''')',
                'insufficient_privilege',
                'anonymous user cannot recharge subscription'
            );
            perform clean_sets();
        end;
    $$;
    select * from test_with_anon();


ROLLBACK;

