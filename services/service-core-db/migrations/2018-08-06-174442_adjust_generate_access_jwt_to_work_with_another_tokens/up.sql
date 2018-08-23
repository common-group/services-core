-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.generate_access_jwt_from_api_key(api_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    declare
        _platform_api platform_service.platform_api_keys;
        _temp_login_api_key community_service.temp_login_api_keys;
        _user_api_key community_service.user_api_keys;

        _platform platform_service.platforms;
        _token text;
        _scopes jsonb;
    begin
        case
        when $1 ~ '^platform_api_key_(\w+)$' then
            -- when platform api key token should look on platform_api_keys
            select * from platform_service.platform_api_keys
                where token = $1
                into _platform_api;

            select * from platform_service.platforms
                where id = _platform_api.platform_id
                into _platform;

            if _platform.id is not null
                and _platform_api.id is not null then
                select token from core.gen_jwt_token(json_build_object(
                    'role', 'platform_user',
                    'platform_token', _platform.token,
                    'exp', extract(epoch from (now() + '60 seconds'))::integer
                )) into _token;
            end if;
        when $1 ~ '^temp_login_api_key_(\w+)$' then
            -- when temp login api key token should look on platform_api_keys
            select * from community_service.temp_login_api_keys
                where token = $1 and expires_at > now()
                into _temp_login_api_key;
            select * from platform_service.platforms
                where id = _temp_login_api_key.platform_id
                into _platform;

            if _platform.id is not null
                and _temp_login_api_key.id is not null then
                select to_jsonb(array_agg(role_name)) from community_service.user_roles
                    where user_id = _temp_login_api_key.user_id
                    and platform_id = _platform.id
                    into _scopes;
                select token from core.gen_jwt_token(json_build_object(
                    'role', 'scoped_user',
                    'user_id', _temp_login_api_key.user_id,
                    'platform_token', _platform.token,
                    'exp', extract(epoch from (now() + '60 seconds'))::integer,
                    'scopes', _scopes
                )) into _token;
            end if;
        when $1 ~ '^user_api_key_(\w+)$' then
            -- when temp login api key token should look on platform_api_keys
            select * from community_service.user_api_keys
                where token = $1 and disabled_at is null
                into _user_api_key;
            select * from platform_service.platforms
                where id = _user_api_key.platform_id
                into _platform;

            if _platform.id is not null
                and _user_api_key.id is not null then
                select to_jsonb(array_agg(role_name)) from community_service.user_roles
                    where user_id = _user_api_key.user_id
                    and platform_id = _platform.id
                    into _scopes;
                select token from core.gen_jwt_token(json_build_object(
                    'role', 'scoped_user',
                    'user_id', _user_api_key.user_id,
                    'platform_token', _platform.token,
                    'exp', extract(epoch from (now() + '60 seconds'))::integer,
                    'scopes', _scopes
                )) into _token;
            end if;
        else
        end case;
        return _token;
    end;
$function$;