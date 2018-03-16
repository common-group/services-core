BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(23);

    select function_returns(
        'payment_service_api', 'upgrade_subscription', ARRAY['json'], 'json'
    );

    prepare upgrade_subscription as select * from payment_service_api.upgrade_subscription($1::json);

    create or replace function test_upgrage_sub_with_platform_user()
    returns setof text language plpgsql as $$
        declare
            _inactive_subscription payment_service.subscriptions;
            _deleted_subscription payment_service.subscriptions;
            _another_user_sub payment_service.subscriptions;
            _subscription payment_service.subscriptions;
            _not_enabled_card payment_service.credit_cards;
            _count_expected integer;
            _generated_payment payment_service.catalog_payments;
            _result json;
        begin
            -- generate not enabled card
            insert into payment_service.credit_cards (platform_id, user_id, gateway, gateway_data)
                values (__seed_platform_id(), __seed_first_user_id(), 'pagarme', '{}'::jsonb)
                returning * into _not_enabled_card;

            -- generate deleted subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _deleted_subscription;

            -- generate inactive subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('inactive', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _inactive_subscription;

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _subscription;

            -- generate another user subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _another_user_sub;

            set local role platform_user;
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            -- cant change deleted subscription
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_deleted_subscription.id||'", "reward_id": "'||__seed_reward_120_id()||'"}'')', 
                'subscription_not_found',
                'cant update a subscription that is deleted');

            -- try change another user subscription
            return next lives_ok(
                'EXECUTE upgrade_subscription(''{"id": "'||_another_user_sub.id||'"}'')', 
                'cant update another user subscription');

            -- change subscription to a greater reward without change amount
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_subscription.id||'", "reward_id": "'||__seed_reward_120_id()||'"}'')', 
                'reward_minimum_amount',
                'cant change reward without change to correct minimum value');

            -- change subscription card to not ready card
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_subscription.id||'", "credit_card_id": "'||_not_enabled_card.id||'"}'')', 
                'card_not_enabled',
                'cant use a card that not have a gateway_data id');

            -- change subscription checkout data
            _result := payment_service_api.upgrade_subscription(json_build_object(
                'id', _subscription.id,
                'payment_method', 'boleto'
            ));

            select count(1) from notification_service.notifications n
                join notification_service.notification_global_templates ngt on ngt.id = n.notification_global_template_id
                where n.user_id = _subscription.user_id
                    and ngt.label = 'updated_subscription'
                into _count_expected;
            return next is(_count_expected, 1, 'should generate a notification to user about updaded subscription');

            -- reload subscription 
            select * from payment_service.subscriptions where id = _subscription.id
                into _subscription;

            return next is(_subscription.checkout_data ->> 'payment_method', 'boleto', 'should change payment method');
            return next is((_result->>'id')::uuid, _subscription.id);
            return next ok((_result->>'old_subscription_version_id')::uuid is not null, 'should generate a version for subscription');

            -- test on inactive subscription
            _result := payment_service_api.upgrade_subscription(json_build_object(
                'id', _inactive_subscription.id,
                'payment_method', 'boleto'
            ));

            select count(1) from payment_service.catalog_payments
                where subscription_id = _inactive_subscription.id
                into _count_expected;
            return next is(_count_expected, 1, 'should generate new payment on subscription');


            select * from payment_service.catalog_payments
                where subscription_id = _inactive_subscription.id
                into _generated_payment;

            return next is(_generated_payment.status, 'pending', 'generated payment should be pending');

        end;
    $$;
    select * from test_upgrage_sub_with_platform_user();


    create or replace function test_upgrage_sub_with_scoped()
    returns setof text language plpgsql as $$
        declare
            _another_user_sub payment_service.subscriptions;
            _inactive_subscription payment_service.subscriptions;
            _deleted_subscription payment_service.subscriptions;
            _subscription payment_service.subscriptions;
            _not_enabled_card payment_service.credit_cards;
            _count_expected integer;
            _generated_payment payment_service.catalog_payments;
            _result json;
        begin
            -- generate not enabled card
            insert into payment_service.credit_cards (platform_id, user_id, gateway, gateway_data)
                values (__seed_platform_id(), __seed_first_user_id(), 'pagarme', '{}'::jsonb)
                returning * into _not_enabled_card;

            -- generate deleted subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _deleted_subscription;


            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _subscription;

            -- generate inactive subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('inactive', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _inactive_subscription;

            -- generate another user subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _another_user_sub;

            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            -- cant change deleted subscription
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_deleted_subscription.id||'", "reward_id": "'||__seed_reward_120_id()||'"}'')', 
                'subscription_not_found',
                'cant update a subscription that is deleted');


            -- try change another user subscription
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_another_user_sub.id||'"}'')', 
                'subscription_not_found',
                'cant update another user subscription');

            -- change subscription to a greater reward without change amount
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_subscription.id||'", "reward_id": "'||__seed_reward_120_id()||'"}'')', 
                'reward_minimum_amount',
                'cant change reward without change to correct minimum value');

            -- change subscription card to not ready card
            return next throws_matching(
                'EXECUTE upgrade_subscription(''{"id": "'||_subscription.id||'", "credit_card_id": "'||_not_enabled_card.id||'"}'')', 
                'card_not_enabled',
                'cant use a card that not have a gateway_data id');

            -- change subscription checkout data
            _result := payment_service_api.upgrade_subscription(json_build_object(
                'id', _subscription.id,
                'payment_method', 'boleto'
            ));

            select count(1) from notification_service.notifications n
                join notification_service.notification_global_templates ngt on ngt.id = n.notification_global_template_id
                where n.user_id = _subscription.user_id
                    and (n.data -> 'relations' ->> 'subscription_id')::uuid = _subscription.id
                    and ngt.label = 'updated_subscription'
                into _count_expected;
            return next is(_count_expected, 1, 'should generate a notification to user about updaded subscription');

            -- reload subscription 
            select * from payment_service.subscriptions where id = _subscription.id
                into _subscription;

            return next is(_subscription.checkout_data ->> 'payment_method', 'boleto', 'should change payment method');
            return next is((_result->>'id')::uuid, _subscription.id);
            return next ok((_result->>'old_subscription_version_id')::uuid is not null, 'should generate a version for subscription');

            -- test on inactive subscription
            _result := payment_service_api.upgrade_subscription(json_build_object(
                'id', _inactive_subscription.id,
                'payment_method', 'boleto'
            ));

            select count(1) from notification_service.notifications n
                join notification_service.notification_global_templates ngt on ngt.id = n.notification_global_template_id
                where n.user_id = _inactive_subscription.user_id
                    and (n.data -> 'relations' ->> 'subscription_id')::uuid = _inactive_subscription.id
                    and ngt.label = 'updated_subscription'
                into _count_expected;
            return next is(_count_expected, 0, 'should not generate a notification when subscription is inactive');


            select count(1) from payment_service.catalog_payments
                where subscription_id = _inactive_subscription.id
                into _count_expected;
            return next is(_count_expected, 1, 'should generate new payment on subscription');

            select * from payment_service.catalog_payments
                where subscription_id = _inactive_subscription.id
                into _generated_payment;

            return next is(_generated_payment.status, 'pending', 'generated payment should be pending');

        end;
    $$;
    select * from test_upgrage_sub_with_scoped();


    create or replace function test_upgrade_sub_with_anon()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _subscription;

                set local role anonymous;
                EXECUTE 'set local "request.header.platform-code" to '''||__seed_platform_token()||'''';

                return next throws_like(
                    'EXECUTE upgrade_subscription(''{"id": "'||_subscription.id||'"}'')',
                    '%insufficient_privilege',
                    'anonymous cannot perform upgrade_subscription operation');
        end;
    $$;
    select * from test_upgrade_sub_with_anon();

    SELECT * FROM finish();
ROLLBACK;
