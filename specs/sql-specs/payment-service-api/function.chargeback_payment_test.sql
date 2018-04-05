BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    \i /specs/sql-support/clean_sets_helpers.sql

    select plan(7);

    select function_returns('payment_service_api', 'chargeback_payment', ARRAY['uuid'], 'json');

    prepare chargeback_payment as select * from payment_service_api.chargeback_payment($1::uuid);

    create or replace function test_chargeback_payment()
    returns setof text language plpgsql as $$
        declare
            _payment payment_service.catalog_payments;
            _subscription payment_service.subscriptions;
            _result json;
        begin
            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) values 
                ('active', (now() - '1 month + 4 days'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{}'::json)::jsonb)
                returning * into _subscription;

            insert into payment_service.catalog_payments
            (created_at, status, gateway, platform_id, user_id, project_id, subscription_id, data)  values
            ((now() - '40 days'::interval), 'paid', 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), _subscription.id, _subscription.checkout_data)
            returning * into _payment;

            -- test with anonymous
            set local role anonymous;
            EXECUTE 'set local "request.header.platform-code" to '''||__seed_platform_token()||'''';

            return next throws_like(
                'EXECUTE chargeback_payment('''||_payment.id||''')',
                'insufficient_privilege',
                'anonymous cannot perform chargeback payment'
            );
            perform clean_sets();

            -- test with scoped user
            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            return next throws_like(
                'EXECUTE chargeback_payment('''||_payment.id||''')',
                'insufficient_privilege',
                'anonymous cannot perform chargeback payment'
            );
            perform clean_sets();

            set local role platform_user;
            set local "request.header.x-forwarded-for" to '127.0.0.1';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            _result := payment_service_api.chargeback_payment(_payment.id);

            return next is(_result->>'id', _payment.id::text, 'return payment id');
            return next is(_result->>'subscription_id', _subscription.id::text, 'return subscription id');
            -- reload payment and subscription
            select * from payment_service.catalog_payments cp
                where cp.id = _payment.id
                into _payment;
            select * from payment_service.subscriptions s
                where s.id = _subscription.id
                into _subscription;

            return next is(_payment.status, 'chargedback', 'payment should turn to chargedback');
            return next is(_subscription.status, 'inactive', 'subscription should be inactived');

        end;
    $$;
    select * from test_chargeback_payment();

ROLLBACk;
