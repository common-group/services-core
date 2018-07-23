-- Your SQL goes here
CREATE OR REPLACE FUNCTION platform_service_api.generate_api_key(platform_id uuid)
 RETURNS platform_service_api.api_keys
 LANGUAGE plpgsql
AS $function$
        declare
            _platform platform_service.platforms;
            _token text;
            _result platform_service.platform_api_keys;
        begin
            if not platform_service.user_in_platform(core.current_user_id(), $1) then
                raise exception 'insufficient permissions to do this action';
            end if;

            select token from platform_service.platforms p 
                where p.id = $1 into _platform;

            select encode(digest(concat(cast(current_timestamp as text), random()::text, _platform.id, _platform.token, _platform.created_at::text, uuid_generate_v4(), uuid_generate_v1()), 'sha512'), 'hex') into _token;
            
            insert into platform_service.platform_api_keys(platform_id, token)
                values ($1, _token)
            returning * into _result;

            return _result;
        end;
    $function$
;

create or replace function core.generate_access_jwt_from_api_key(api_key text) returns text
language plpgsql
security definer
as $$
    declare
        _platform_api platform_service.platform_api_keys;
        _platform platform_service.platforms;

        _token text;
    begin
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
                'exp', extract(epoch from (now() + '60 seconds'))::integer,
                'iat', extract(epoch from now())::integer
            )) into _token;
        end if;
        
        return _token;
    end;
$$;
comment on function core.generate_access_jwt_from_api_key(text) is 'Generate a jwt for passed api key';
grant execute on function core.generate_access_jwt_from_api_key(text) to proxy_server;