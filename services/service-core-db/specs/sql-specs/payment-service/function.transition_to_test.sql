BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    -- \i /specs/sql-support/insert_global_notifications.sql

    select plan(15);

    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.catalog_payments', 'payment_service.payment_status', 'json'], 'boolean');
    SELECT function_returns('payment_service', 'transition_to', ARRAY['payment_service.subscriptions', 'payment_service.subscription_status', 'json'], 'boolean');

    create or replace function test_payment_transition_to_refused()
    returns setof text language plpgsql
    as $$
    declare
        _subscription payment_service.subscriptions;
        _payment payment_service.catalog_payments;
    begin

        -- generate subscription
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, reward_id, checkout_data) 
        values ('started', now(), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __seed_reward_id(), '{}'::jsonb)
        returning * into _subscription;

        -- create payment for subscription into _payment
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('pending', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), _subscription.id)
        returning * into _payment;

        -- transit payment to refused and reload
        perform payment_service.transition_to(_payment, 'refused', row_to_json(_payment));
        select * from payment_service.catalog_payments
            where id = _payment.id
            into _payment;

        return next is(_payment.status, 'refused', 'should turn payment to refused');
        return next is(exists(
            select true from notification_service.user_catalog_notifications
                where user_id = _payment.user_id
                    and label = 'refused_subscription_card_payment'
                    and (data->'relations'->>'catalog_payment_id')::uuid = _payment.id
        ), true, 'should create notification refused_subscription_card_payment when payment is a subscription payment');


        -- insert boleto payment to subscription
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('pending', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id)
        returning * into _payment;

        -- transit payment to refused and reload
        perform payment_service.transition_to(_payment, 'refused', row_to_json(_payment));
        select * from payment_service.catalog_payments
            where id = _payment.id
            into _payment;

        return next is(_payment.status, 'refused', 'should turn payment to refused');
        return next is(exists(
            select true from notification_service.user_catalog_notifications
                where user_id = _payment.user_id
                    and label = 'refused_subscription_card_payment'
                    and (data->'relations'->>'catalog_payment_id')::uuid = _payment.id
        ), false, 'should not notify with refused_subscription_card_payment when payment method is boleto');


        -- insert new payment without subscription
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
        values ('pending', now(), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), null)
        returning * into _payment;


        -- transit payment to refused and reload
        perform payment_service.transition_to(_payment, 'refused', row_to_json(_payment));
        select * from payment_service.catalog_payments
            where id = _payment.id
            into _payment;

        return next is(_payment.status, 'refused', 'should turn payment to refused');
        return next is(exists(
            select true from notification_service.user_catalog_notifications
                where user_id = _payment.user_id
                    and label = 'refused_subscription_card_payment'
                    and (data->'relations'->>'catalog_payment_id')::uuid = _payment.id
        ), false, 'should not create refused_subscription_card_payment notification when payment is not belong to a subscription');


    end;
    $$;
    select test_payment_transition_to_refused();

    CREATE OR REPLACE FUNCTION test_subscription_transition_when_active()
    returns setof text language plpgsql
    as $$
    declare
    _subscription payment_service.subscriptions;
    _reward_notification notification_service.notifications;
    begin

    -- generate subscription
    insert into payment_service.subscriptions
    (status, created_at, platform_id, user_id, project_id, reward_id, checkout_data) 
    values ('started', now(), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __seed_reward_id(), '{}'::jsonb)
    returning * into _subscription;

    return next is(payment_service.transition_to(_subscription, 'active', '{}'), true, 'should change subscription status');

    select n.* from notification_service.notifications n
    join notification_service.notification_global_templates ngt 
    on ngt.id = n.notification_global_template_id
    where n.user_id = _subscription.user_id
    and ngt.label = 'reward_welcome_message'
    and (n.data -> 'relations' ->> 'subscription_id')::uuid = _subscription.id
    into _reward_notification;

    return next ok(_reward_notification.id is not null, 'should have a reward_welcome notification');

    end;
    $$;
    select * from test_subscription_transition_when_active();

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

	create or replace function test_susbcription_transition_from_canceled_to_inactive()
	returns setof text language plpgsql as $$
		declare
            _canceled_subscription payment_service.subscriptions;
			_inactive_subscription_notification notification_service.notifications;
		begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('canceled', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _canceled_subscription;

			perform payment_service.transition_to(_canceled_subscription, 'inactive', row_to_json(_canceled_subscription));

            -- check for inactive subscription notifications
            select n.* from notification_service.notifications n
                join notification_service.notification_global_templates ngt 
                    on ngt.id = n.notification_global_template_id
                where n.user_id = _canceled_subscription.user_id
                    and ngt.label = 'inactive_subscription'
                    and (n.data -> 'relations' ->> 'subscription_id')::uuid = _canceled_subscription.id
                into _inactive_subscription_notification;

            return next ok(_inactive_subscription_notification.id is null, 'should not sent inactive_subscription');

			select * from payment_service.subscriptions where id = _canceled_subscription.id
			into _canceled_subscription;

			return next is(_canceled_subscription.status, 'inactive', 'subscription should be inactived');
		end;
	$$;
	select * from test_susbcription_transition_from_canceled_to_inactive();

    SELECT * FROM finish();
ROLLBACK;
