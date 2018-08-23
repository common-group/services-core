BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql
    select plan(16);

    select function_returns('core', 'generate_access_jwt_from_api_key', ARRAY['text'], 'text');

    insert into core.core_settings(name, value)
        values ('jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C');

    insert into community_service.user_roles(user_id, platform_id, role_name) values (__seed_first_user_id(), __seed_platform_id(), 'admin');

    create or replace function test_with_platform_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into platform_service.platform_api_keys(platform_id, token) values (__seed_platform_id(), 'platform_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            _result := core.generate_access_jwt_from_api_key('platform_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            select payload 
            from core.verify(_result::text, core.get_setting('jwt_secret')::text, 'HS256')
            into _decoded_payload;

            return next is ((_decoded_payload->>'platform_token')::uuid, _platform.token);
            return next is ((_decoded_payload->>'role')::text, 'platform_user');
            return next is ((_result is not null), true);
        end;
    $$;
    select test_with_platform_api_key();


    create or replace function test_with_temp_login_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into community_service.temp_login_api_keys(expires_at, user_id, platform_id, token) values ((now() + '2 days'::interval), __seed_first_user_id(), __seed_platform_id(), 'temp_login_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            _result := core.generate_access_jwt_from_api_key('temp_login_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            select payload 
            from core.verify(_result::text, core.get_setting('jwt_secret')::text, 'HS256')
            into _decoded_payload;

            return next is ((_decoded_payload->>'platform_token')::uuid, _platform.token);
            return next is ((_decoded_payload->>'role')::text, 'scoped_user');
            return next is ((_decoded_payload->>'user_id')::uuid, __seed_first_user_id());
            return next is ((_decoded_payload->>'scopes')::jsonb, to_jsonb('{admin}'::text[]));
            return next is ((_result is not null), true);
        end;
    $$;
    select test_with_temp_login_api_key();


    create or replace function test_with_expired_temp_login_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into community_service.temp_login_api_keys(expires_at, user_id, platform_id, token) values ((now() - '2 days'::interval), __seed_first_user_id(), _platform.id, 'temp_login_api_key_exp3386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            _result := core.generate_access_jwt_from_api_key('temp_login_api_key_exp3386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');

            return next is ((_result is null), true);
        end;
    $$;
    select test_with_expired_temp_login_api_key();

    create or replace function test_with_user_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into community_service.user_api_keys(user_id, platform_id, token) values (__seed_first_user_id(), _platform.id, 'user_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            _result := core.generate_access_jwt_from_api_key('user_api_key_f473386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            select payload 
            from core.verify(_result::text, core.get_setting('jwt_secret')::text, 'HS256')
            into _decoded_payload;

            return next is ((_decoded_payload->>'platform_token')::uuid, _platform.token);
            return next is ((_decoded_payload->>'role')::text, 'scoped_user');
            return next is ((_decoded_payload->>'user_id')::uuid, __seed_first_user_id());
            return next is ((_decoded_payload->>'scopes')::jsonb, to_jsonb('{admin}'::text[]));
            return next is ((_result is not null), true);
        end;
    $$;
    select test_with_user_api_key();

    create or replace function test_with_user_disabled_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into community_service.user_api_keys(disabled_at, user_id, platform_id, token) values (now(), __seed_first_user_id(), _platform.id, 'user_api_key_dst3386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');
            _result := core.generate_access_jwt_from_api_key('user_api_key_dst3386b7962189c512a82e419c824d64fa89c4034a22904fd608913fbccc913d224a859149700ff0850af56a343fdb24b90');

            return next is ((_result is null), true);
        end;
    $$;
    select test_with_user_disabled_api_key();

    select * from finish();
ROLLBACK;
