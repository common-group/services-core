BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(19);

    select function_returns('payment_service', 'generate_new_catalog_payment', ARRAY['payment_service.subscriptions'], 'payment_service.catalog_payments');
    prepare generate_new_catalog_payment as select * from payment_service.generate_new_catalog_payment($1::payment_service.subscriptions);

    create or replace function test_generate_with_canceled_status()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('canceled', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            select * from payment_service.generate_new_catalog_payment(_subscription);
        exception 
            when others then
                return next is(SQLERRM, 'subscription_canceled', 'should raise subsription_canceled');
        end;
    $$;
    select * from test_generate_with_canceled_status();

    create or replace function test_generate_with_canceling_status()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('canceling', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            select * from payment_service.generate_new_catalog_payment(_subscription);
        exception 
            when others then
                return next is(SQLERRM, 'subscription_canceled', 'should raise subsription_canceled');
        end;
    $$;
    select * from test_generate_with_canceling_status();

    create or replace function test_generate_with_paid_not_in_time_payment()
    returns setof text language plpgsql as $$
        declare
            _subscriber community_service.users;
            _subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            -- generate paid payment on subscriptions
            insert into payment_service.catalog_payments
                (created_at, status, gateway, platform_id, user_id, project_id, subscription_id, data)  values
                ((now() - '40 days'::interval), 'paid', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), _subscription.id, _subscription.checkout_data);

            _generated_payment := payment_service.generate_new_catalog_payment(_subscription);

            select * from community_service.users
                where id = _subscription.user_id
                into _subscriber;

            return next ok(_generated_payment.id is not null,  'should generate a payment for subscription');

            return next is(_generated_payment.data ->> 'payment_method', _subscription.checkout_data ->> 'payment_method');
            return next is(_generated_payment.data ->> 'amount', _subscription.checkout_data ->> 'amount');
            return next is(_generated_payment.data -> 'customer' ->> 'name', _subscriber.data ->> 'name');
            return next is((_generated_payment.data -> 'customer' ->> 'email')::text, _subscriber.email::text);
            return next is(_generated_payment.data -> 'customer' ->> 'document_number', coalesce(_subscriber.data ->> 'document_number', _subscription.checkout_data -> 'customer' ->> 'document_number'));
            return next is(_generated_payment.data -> 'customer' -> 'address', _subscription.checkout_data -> 'customer' -> 'address');

        end;
    $$;
    select * from test_generate_with_paid_not_in_time_payment();

    create or replace function test_generate_with_paid_in_time_payment()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('started', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            -- generate paid payment on subscriptions
            insert into payment_service.catalog_payments
                (created_at, status, gateway, platform_id, user_id, project_id, subscription_id, data)  values
                ((now() - '15 days'::interval), 'paid', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), _subscription.id, _subscription.checkout_data);

            select * from payment_service.generate_new_catalog_payment(_subscription);
        exception 
            when others then
                return next is(SQLERRM, 'not_in_time_to_charge', 'Should raise error when have paid payment in time on subscription');

        end;
    $$;
    select * from test_generate_with_paid_in_time_payment();

    create or replace function test_generate_with_pending_payment()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('started', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            -- generate pending payment on subscriptions
            insert into payment_service.catalog_payments
                (status, gateway, platform_id, user_id, project_id, subscription_id, data)  values
                ('pending', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), _subscription.id, _subscription.checkout_data);

            select * from payment_service.generate_new_catalog_payment(_subscription);
        exception 
            when others then
                return next is(SQLERRM, 'pending_payment_to_process', 'Should raise error when have pending payment on subscription');

        end;
    $$;
    select * from test_generate_with_pending_payment();

    create or replace function test_generate_with_valid_subscription()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _subscriber community_service.users;
            _generated_payment payment_service.catalog_payments;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('started', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            _generated_payment := payment_service.generate_new_catalog_payment(_subscription);

            select * from community_service.users
                where id = _subscription.user_id
                into _subscriber;

            return next ok(_generated_payment.id is not null,  'should generate a payment for subscription');

            return next is(_generated_payment.data ->> 'payment_method', _subscription.checkout_data ->> 'payment_method');
            return next is(_generated_payment.data ->> 'amount', _subscription.checkout_data ->> 'amount');
            return next is(_generated_payment.data -> 'customer' ->> 'name', _subscriber.data ->> 'name');
            return next is((_generated_payment.data -> 'customer' ->> 'email')::text, _subscriber.email::text);
            return next is(_generated_payment.data -> 'customer' ->> 'document_number', coalesce(_subscriber.data ->> 'document_number', _subscription.checkout_data -> 'customer' ->> 'document_number'));
            return next is(_generated_payment.data -> 'customer' -> 'address', _subscription.checkout_data -> 'customer' -> 'address');
        end;
    $$;
    select * from test_generate_with_valid_subscription();


    select * from finish();
ROLLBACK;
