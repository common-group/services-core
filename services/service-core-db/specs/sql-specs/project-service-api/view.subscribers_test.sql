BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    -- generate subscription
    insert into payment_service.subscriptions
    (status, created_at, platform_id, user_id, project_id, checkout_data) 
    values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb),
    ('deleted', (now() - '1 month'::interval), __seed_platform_id(), __seed_second_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb);

    select plan(11);

	select has_view('project_service_api', 'subscribers',  'view should be defined');

    create or replace function test_access_with_anon()
    returns setof text language plpgsql as $$
    declare
        _subscription payment_service.subscriptions;
        _result_row project_service_api.subscribers;
    begin

        select * from payment_service.subscriptions limit 1 into _subscription;

        set local role anonymous;
        set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';

        select * from project_service_api.subscribers
            where project_id = __seed_project_id()
            limit 1
            into _result_row;

        return next is(_result_row.id, null, 'anon should not view anon contributions');

        return next is(
            (select count(1) from project_service_api.subscribers
                where project_id = __seed_project_id()),
            0::bigint,
            'should not list subscriber that subscription is deleted as anon'
        );
    end;
    $$;

    select * from test_access_with_anon();
    create or replace function test_access_with_platform()
    returns setof text language plpgsql as $$
    declare
        _subscription payment_service.subscriptions;
        _result_row project_service_api.subscribers;
    begin
        select * from payment_service.subscriptions limit 1 into _subscription;

        set local role platform_user;
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

        select * from project_service_api.subscribers
            where project_id = __seed_project_id()
            limit 1
            into _result_row;

        return next is(_result_row.id is not null, true, 'can see anonymous contributions when platform_user');

        return next is(
            (select count(1) from project_service_api.subscribers
                where project_id = __seed_project_id()),
            1::bigint,
            'should not list subscriber that subscription is deleted as platform user'
        );
    end;
    $$;
    select * from test_access_with_platform();

    create or replace function test_access_with_scoped()
    returns setof text language plpgsql as $$
    declare
        _subscription payment_service.subscriptions;
        _result_row project_service_api.subscribers;
    begin
        select * from payment_service.subscriptions limit 1 into _subscription;

        set local role scoped_user;
        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

        select * from project_service_api.subscribers
            where project_id = __seed_project_id()
            limit 1
            into _result_row;

        return next is(_result_row.id is not null, true, 'can see anonymous contributions when scoped_user is the subscriber');

        return next is(
            (select count(1) from project_service_api.subscribers
                where project_id = __seed_project_id()),
            1::bigint,
            'should not list subscriber that subscription is deleted as first user'
        );

        -- test using another scoped user that is not project owner
        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_third_user_id()||'''';

        select * from project_service_api.subscribers
            where project_id = __seed_project_id()
            limit 1
            into _result_row;

        return next is(_result_row.id, null, 'scoped cant see anonymous subscribers');

        return next is(
            (select count(1) from project_service_api.subscribers
                where project_id = __seed_project_id()),
            0::bigint,
            'should not list subscriber that subscription is deleted has third user'
        );

        -- test using scoped user project owner
        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_second_user_id()||'''';

        select * from project_service_api.subscribers
            where project_id = __seed_project_id()
            limit 1
            into _result_row;

        return next is(_result_row.id is not null, true, 'can see anonymous contributions when scoped_user is the project owner');

        return next is(
            (select count(1) from project_service_api.subscribers
                where project_id = __seed_project_id()),
            1::bigint,
            'should not list subscriber that subscription is deleted'
        );
    end;
    $$;
    select * from test_access_with_scoped();


    select * from finish();
ROLLBACK;
