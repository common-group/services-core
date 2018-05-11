BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    select plan(5);

    select function_returns('payment_service', 'recharge_subscription', '{payment_service.subscriptions}'::text[], 'payment_service.catalog_payments');

    create or replace function test_recharge_boleto_subscription_in_time()
    returns setof text language plpgsql
    as $$
    declare
    _payment payment_service.catalog_payments;
    _recharge_payment payment_service.catalog_payments;
    _subscription payment_service.subscriptions;
    begin
        -- generate subscription
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data) 
        values ('active', (now() - '15 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
        returning * into _subscription;

        -- generate payment
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id, gateway_general_data) 
        values ('pending', (now() - '1 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id, json_build_object('boleto_expiration_date', now() + '3 days'::interval)::jsonb)
        returning * into _payment;

        _recharge_payment := payment_service.recharge_subscription(_subscription);

        return next is(_payment.id, _recharge_payment.id, 'should not generate another payment and return the same');
    end;
    $$;
    select * from test_recharge_boleto_subscription_in_time();

    create or replace function test_recharge_boleto_subscription_with_pending_payment_expired()
    returns setof text language plpgsql
    as $$
    declare
    _payment payment_service.catalog_payments;
    _recharge_payment payment_service.catalog_payments;
    _subscription payment_service.subscriptions;
    begin
        -- generate subscription
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data) 
        values ('active', (now() - '15 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto')::jsonb)
        returning * into _subscription;

        -- generate payment
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id, gateway_general_data) 
        values ('pending', (now() - '1 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id, json_build_object('boleto_expiration_date', now() - '1 days'::interval)::jsonb)
        returning * into _payment;

        _recharge_payment := payment_service.recharge_subscription(_subscription);
        
        -- reload payment
        select * from payment_service.catalog_payments
            where id = _payment.id into _payment;

        return next ok(_payment.id <> _recharge_payment.id, 'should generate a new payment for subscription');
        return next is(_payment.status, 'refused', 'should turn previus payment to refused');
        return next is(_recharge_payment.status, 'pending', 'should generate a new payment with pending');
    end;
    $$;
    select * from test_recharge_boleto_subscription_with_pending_payment_expired();

    ROLLBACK;
