BEGIN;
    \i /specs/sql-support/insert_platform_user_project.sql
    select plan(4);

    select function_returns('core', 'generate_access_jwt_from_api_key', ARRAY['text'], 'text');

    insert into core.core_settings(name, value)
        values ('jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C');

    create or replace function test_with_platform_api_key()
    returns setof text language plpgsql as $$
        declare
            _platform platform_service.platforms;
            _result text;
            _decoded_payload json;
        begin
            select * from platform_service.platforms where id = __seed_platform_id() into _platform;

            insert into platform_service.platform_api_keys(platform_id, token) values (_platform.id, 'abcdapi');
            _result := core.generate_access_jwt_from_api_key('abcdapi');
            select payload 
            from core.verify(_result::text, core.get_setting('jwt_secret')::text, 'HS512')
            into _decoded_payload;

            return next is ((_decoded_payload->>'platform_token')::uuid, _platform.token);
            return next is ((_decoded_payload->>'role')::text, 'platform_user');
            return next is ((_result is not null), true);
        end;
    $$;
    select test_with_platform_api_key();

    select * from finish();
ROLLBACK;
