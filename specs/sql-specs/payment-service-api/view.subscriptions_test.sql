BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(20);

    select has_view('payment_service_api', 'subscriptions', 'check view');

    -- generate a subscription for first_user_id
    insert into payment_service.subscriptions
    (status, created_at, platform_id, user_id, project_id, checkout_data, credit_card_id) 
    values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb, __seed_first_user_credit_card_id()),
    ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb, __seed_first_user_credit_card_id());

    create or replace function test_access_with_anon()
    returns setof text language plpgsql as $$
        declare
            _result_row payment_service_api.subscriptions;
        begin
            set local role anonymous;
            set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';

            return next throws_like(
                'select * from project_service_api.subscriptions',
                'relation "project_service_api.subscriptions" does not exist',
                'anon cant select on subscriptions view'
            );

            perform clean_sets();
        end;
    $$;
    select * from test_access_with_anon();

    create or replace function test_access_with_scoped()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _paid_payment payment_service.catalog_payments;
            _refused_payment payment_service.catalog_payments;
            _result_row payment_service_api.subscriptions;
        begin
            select * from payment_service.subscriptions limit 1 into _subscription;
            -- add paid payment to subscription
            insert into payment_service.catalog_payments
            (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
            values ('paid', (now() - '2 month'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), _subscription.id)
            returning * into _paid_payment;

            -- add refused payment
            insert into payment_service.catalog_payments
            (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id) 
            values ('refused', (now() - '1 month'::interval), 'pagarme', __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), json_build_object('payment_method', 'credit_card'), _subscription.id)
            returning * into _refused_payment;


            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            -- when scoped is owner of subscription
            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.id, _subscription.id, 'subscription owner can see they subscription');
            return next is(_result_row.credit_card_id, __seed_first_user_credit_card_id(), 'subscription owner can see the credit_card_id on subscription');
            return next is((_result_row.last_payment_data->>'id')::uuid, _refused_payment.id, 'last payment id should be then same of refused payment');
            return next is((_result_row.last_payment_data->>'status')::text, _refused_payment.status::text, 'last payment status should be  the same of refused payment');
            return next is((_result_row.last_payment_data->>'created_at')::timestamp without time zone, _refused_payment.created_at, 'last payment created_at should be  the same of refused payment');
            return next is((_result_row.last_payment_data->>'payment_method'), _refused_payment.data->>'payment_method', 'last payment payment method should be  the same of refused payment');

            return next is((_result_row.last_paid_payment_data->>'id')::uuid, _paid_payment.id, 'last paid payment id should be then same of paid payment');
            return next is((_result_row.last_paid_payment_data->>'status')::text, _paid_payment.status::text, 'last paid payment status should be  the same of paid payment');
            return next is((_result_row.last_paid_payment_data->>'created_at')::timestamp without time zone, _paid_payment.created_at, 'last paid payment created_at should be the same of paid payment');
            return next is((_result_row.last_paid_payment_data->>'payment_method'), _paid_payment.data->>'payment_method', 'last paid payment payment method should be  the same of paid payment');

            select * from payment_service_api.subscriptions where status = 'deleted'
            into _result_row;

            return next is(_result_row.id is null, true, 'should not show deleted subscriptions');

            -- when scoped user is project owner
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_second_user_id()||'''';

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.id, _subscription.id, 'project owner can see all related subscriptions to they project');
            return next is(_result_row.credit_card_id, null, 'projet owner cant see credit_card id from subscriptions from another users');

            -- when scoped is another user that is not subscriber and not project owner
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_third_user_id()||'''';

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.id, null, 'cant see nothing when not is owner of subscription');

            perform clean_sets();
        end;
    $$;
    select * from test_access_with_scoped();

    create or replace function test_access_with_platform()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _result_row payment_service_api.subscriptions;
        begin
            select * from payment_service.subscriptions limit 1 into _subscription;

            set local role platform_user;
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.id, _subscription.id, 'platform admin can see everything');
            return next is(_result_row.credit_card_id, __seed_first_user_credit_card_id(), 'platform admin can see credit_card id');

            perform clean_sets();
        end;
    $$;
    select * from test_access_with_platform();

    create or replace function test_search_index()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _user community_service.users;
            _result_row payment_service_api.subscriptions;
        begin
            select * from payment_service.subscriptions limit 1 into _subscription;
            select * from community_service.users where id = __seed_first_user_id() into _user;

            set local role platform_user;
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            -- searching by user email
            select * from payment_service_api.subscriptions
            where search_index @@ plainto_tsquery('portuguese', _user.email) into _result_row;

            return next is(_result_row.id, _subscription.id, 'should find subscription by searching on search_index');
        end;
    $$;
    select * from test_search_index();

    create or replace function test_access_with_scoped_with_subscription_version()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _result_row payment_service_api.subscriptions;
        begin
            -- when scoped is owner of subscription
            select * from payment_service.subscriptions limit 1 into _subscription;
            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            -- generate a subscription version for this subscription
            insert into payment_service.catalog_payments
            (gateway, platform_id, project_id, user_id, subscription_id, data, created_at, updated_at, status)
            values ('pagarme', __seed_platform_id(), __seed_project_id(), __seed_first_user_id(), _subscription.id, '{"amount": 1000, "customer": {"name": "Gasdasd", "email": "aslidasd@asdasd", "phone": {"ddd": "52", "ddi": "25", "number": "123123123"}, "address": {"city": "Casdas", "state": "WE", "street": "ASdasd asdasd", "country": "Brasil", "zipcode": "99999-999", "neighborhood": "ASasdasd", "complementary": "123", "street_number": "123"}, "document_number": "123456789"}, "anonymous": false, "current_ip": "127.0.0.1", "payment_method": "boleto", "is_international": false}'::json, now(), now(), 'paid');

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.current_paid_subscription->>'amount'::text, '1000', 'subscription version data loaded from subscriptions view');

            perform clean_sets();
        end;
    $$;
    select * from test_access_with_scoped_with_subscription_version();

    select * from finish();
ROLLBACk;
