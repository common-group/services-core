BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/clean_sets_helpers.sql

    select plan(3);

    -- test scoped user access
    create or replace function test_access_with_scoped_to_user_details()
    returns setof text language plpgsql as $$
        declare
            _result_row jsonb;
        begin
            -- when scoped is owner of 
            set local role scoped_user;
    
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            select * from community_service_api.user_details(__seed_first_user_id())
            into _result_row;

            return next is(_result_row->>'id'::text, __seed_first_user_id()::text, 'user data from function');

            perform clean_sets();
        end;
    $$;

    select * from test_access_with_scoped_to_user_details();

    -- test platform user access
    create or replace function test_access_with_platform_user_to_user_details()
    returns setof text language plpgsql as $$
        declare
            _result_row jsonb;
        begin
            set local role platform_user;
    
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            select * from community_service_api.user_details(__seed_first_user_id())
            into _result_row;

            return next is(_result_row->>'id'::text, __seed_first_user_id()::text, 'user data from function');

            perform clean_sets();
        end;
    $$;

    select * from test_access_with_platform_user_to_user_details();

    -- test anonymous user access
    create or replace function test_access_with_anonymous_user_to_user_details()
    returns setof text language plpgsql as $$
        declare
            _result_row jsonb;
        begin
            -- when scoped is owner of 
            set local role anonymous;
    
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            select * from community_service_api.user_details(__seed_first_user_id())
            into _result_row;

            return next is(_result_row->>'address', null, 'should not have access to user information');

            perform clean_sets();
        end;
    $$;

    select * from test_access_with_anonymous_user_to_user_details();

    select * from finish();
ROLLBACk;