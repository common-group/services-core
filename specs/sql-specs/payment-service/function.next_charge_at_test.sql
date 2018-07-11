BEGIN;

    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    SELECT plan(3);

    select function_returns(
        'payment_service', 'next_charge_at', ARRAY['payment_service.subscriptions'], 'timestamp without time zone'
    );

    create or replace function test_next_charge_at_with_paid_payment()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _subscription;

            insert into payment_service.catalog_payments
                (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
                values ('paid', '12-31-2017 13:00', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id),
                ('paid', '01-31-2018 13:00', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'boleto'), _subscription.id);

            return next is(
                payment_service.next_charge_at(_subscription),
                '02-28-2018 00:00',
                'should calculate next transaction date'
            );

        end;
    $$;
    select * from test_next_charge_at_with_paid_payment();


    create or replace function test_next_charge_at_without_payments()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
        begin

            -- generate subscription
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card"}'::json)::jsonb)
                returning * into _subscription;

            return next is(
                payment_service.next_charge_at(_subscription)::text,
                (now()::date::timestamp)::text,
                'should be current time when not have paid transactions'
            );

        end;
    $$;
    select * from test_next_charge_at_without_payments();

    select * from finish();
ROLLBACK;
