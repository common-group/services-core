BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    SELECT plan(15);

    SELECT function_returns('payment_service', 'automatic_recharge_or_inactive_card_subscriptions', '{}'::text[], 'json');

    create or replace function test_with_active_subscription_with_paid_payment()
    returns setof text language plpgsql
    as $$
    declare
        _subscription payment_service.subscriptions;
        _paid_payment payment_service.catalog_payments;
        _first_refused_attempt payment_service.catalog_payments;
        _second_refused_attempt payment_service.catalog_payments;
        _third_refused_attempt payment_service.catalog_payments;
        _recharged_payment payment_service.catalog_payments;
        _result json;
    begin
        -- create active subscription into _susbcription
        insert into payment_service.subscriptions
        (status, credit_card_id, created_at, platform_id, user_id, project_id, checkout_data)
        values ('active', __seed_first_user_credit_card_id(), (now() - '2 months'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{"payment_method": "credit_card"}'::jsonb)
        returning * into _subscription;

        -- create payment for subscription into _paid_payment
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('paid', (now() - '2 month'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), _subscription.id)
        returning * into _paid_payment;

        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 0, 'should do nothing when subscription last payment attempt is not refused');


        -- create refused payment attempt for subscription into _paid_payment
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('refused', (now() - '3 days'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), _subscription.id)
        returning * into _first_refused_attempt;

        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 0, 'should do nothing when subscription last payment attempt is refused but is not passed 4 days after creation');

        -- update first attempt refused to pass 4 days
        update payment_service.catalog_payments
            set created_at = (now() - '1 month'::interval)
            where id = _first_refused_attempt.id;

        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 1, 'should generate new recharged payment for subscription');

        select * from payment_service.catalog_payments
            where id = (_result->'recharged_payment_ids'->>0)::uuid
            into _recharged_payment;

        return next is(_recharged_payment.status, 'pending', 'should generate new payment on subscription');
        return next is(_recharged_payment.data->>'payment_method', 'credit_card', 'should generate new payment on subscription using the same payment_method');

        -- try run again with pending payment
        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 0, 'should do nothing when subscription last payment is pending');

        -- update recharge payment to be refused
        update payment_service.catalog_payments
            set status = 'refused',
                created_at = now() - '20 days'::interval
            where id = _recharged_payment.id
        returning * into _second_refused_attempt;

        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 1, 'should generate new recharged payment for subscription');

        select * from payment_service.catalog_payments
            where id = (_result->'recharged_payment_ids'->>0)::uuid
            into _recharged_payment;

        return next ok(_recharged_payment.id <> _second_refused_attempt.id, 'should generate new payment');
        return next is(_recharged_payment.status, 'pending', 'should generate new payment on subscription');
        return next is(_recharged_payment.data->>'payment_method', 'credit_card', 'should generate new payment on subscription using the same payment_method');

        -- try run again with pending payment
        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 0, 'should do nothing when subscription last payment is pending');

        -- update recharge payment to be refused
        update payment_service.catalog_payments
            set status = 'refused',
                created_at = now() - '20 days'::interval
            where id = _recharged_payment.id
        returning * into _third_refused_attempt;

        _result := payment_service.automatic_recharge_or_inactive_card_subscriptions();
        return next is((_result->>'total_subscriptions_affected')::integer, 1, 'should affect subscription transition to inactive');
        return next is((_result->>'recharged_payment_ids'), null, 'should not generate a new recharged payment');

        -- reload subscription
        select * from payment_service.subscriptions
            where id = _subscription.id
            into _subscription;

        return next is(_subscription.status, 'inactive', 'should inactive subscription');
    end;
    $$;
    select * from test_with_active_subscription_with_paid_payment();

    select * from finish();
ROLLBACK;
