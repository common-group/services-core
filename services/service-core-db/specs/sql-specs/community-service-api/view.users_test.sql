BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    select plan(20);

	  select has_view('community_service_api', 'users',  'view should be defined');

    create or replace function test_access_with_anon()
    returns setof text language plpgsql as $$
    declare
        _result_row community_service_api.users;
    begin
        set local role anonymous;
        set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';

        select * from community_service_api.users
            where id = __seed_first_user_id()
            limit 1
            into _result_row;

        return next is(_result_row.name is not null, true, 'anon should view user name');

        return next is(_result_row.email, null, 'anon should not view user email');
        return next is(_result_row.document_type, null, 'anon should not view user document type');
        return next is(_result_row.legal_account_type, null, 'anon should not view user account type');
        return next is(_result_row.address, null, 'anon should not view user address');
        return next is(_result_row.metadata, null, 'anon should not view user metadata');
        return next is(_result_row.bank_account, null, 'anon should not view user bank_account');
    end;
    $$;

    select * from test_access_with_anon();

    create or replace function test_access_with_platform()
    returns setof text language plpgsql as $$
    declare
        _result_row community_service_api.users;
    begin
        set local role platform_user;
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

        select * from community_service_api.users
            where id = __seed_first_user_id()
            limit 1
            into _result_row;

        return next is(_result_row.email is not null, true, 'platform should view user email');
        return next is(_result_row.document_type is not null, true, 'platform should view user document type');
        return next is(_result_row.legal_account_type is not null, true, 'platform should view user legal type');
        return next is(_result_row.address is not null, true, 'platform should view user address');
        return next is(_result_row.metadata is not null, true, 'platform should view user metadata');
        return next is(_result_row.bank_account is not null, true, 'platform should view user bank account');
    end;
    $$;
    select * from test_access_with_platform();

    create or replace function test_access_with_scoped()
    returns setof text language plpgsql as $$
    declare
        _result_row community_service_api.users;
    begin
        set local role scoped_user;
        EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
        EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';


        select * from community_service_api.users
            where id = __seed_first_user_id()
            limit 1
            into _result_row;

        return next is(_result_row.email is not null, true, 'scoped should view user email');
        return next is(_result_row.document_type is not null, true, 'scoped should view user document type');
        return next is(_result_row.legal_account_type is not null, true, 'scoped should view user legal type');
        return next is(_result_row.address is not null, true, 'scoped should view user address');
        return next is(_result_row.metadata is not null, true, 'scoped should view user metadata');
        return next is(_result_row.bank_account is not null, true, 'scoped should view user bank account');
    end;
    $$;
    select * from test_access_with_scoped();

    select * from finish();
ROLLBACK;
