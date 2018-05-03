BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(12);

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
            _result_row payment_service_api.subscriptions;
        begin
            -- when scoped is owner of subscription
            select * from payment_service.subscriptions limit 1 into _subscription;
            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.id, _subscription.id, 'subscription owner can see they subscription');
            return next is(_result_row.credit_card_id, __seed_first_user_credit_card_id(), 'subscription owner can see the credit_card_id on subscription');

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
            insert into payment_service.subscription_versions
            (subscription_id, data, created_at, updated_at)
            values (_subscription.id, '{"id": "fa800670-4fe9-4da2-b934-dfe58001c107", "status": "active", "user_id": "bdb1a3d1-7d02-4767-baad-18abdf3be236", "reward_id": "252f4e28-7869-49cf-88e7-f123706b7291", "created_at": "2018-04-27T17:42:51.16365", "project_id": "a69f95bb-e7b9-441d-aac7-c14dd86cce99", "updated_at": "2018-04-27T17:42:51.16365", "platform_id": "8187a11e-6fa5-4561-a5e5-83329236fbd6", "checkout_data": {"amount": "1000", "customer": {"name": "Astrogildo", "phone": {"ddd": "23", "ddi": "52", "number": "123456789"}, "address": {"city": "Fda", "state": "RR", "street": "Blah street", "country": "Brasil", "zipcode": "99999-999", "neighborhood": "Blah", "complementary": "none", "street_number": "999"}, "document_number": "12345678912"}, "anonymous": false, "current_ip": "127.0.0.1", "payment_method": "boleto", "is_international": false, "credit_card_owner_document": null}, "credit_card_id": null}'::json, now(), now());

            select * from payment_service_api.subscriptions
            into _result_row;

            return next is(_result_row.last_subscription_version->>'status'::text, 'active'::text, 'subscription version data loaded from subscriptions view');

            perform clean_sets();
        end;
    $$;
    select * from test_access_with_scoped_with_subscription_version();

    select * from finish();
ROLLBACk;
