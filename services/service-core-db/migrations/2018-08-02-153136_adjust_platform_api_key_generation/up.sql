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

            select 'platform_api_key_'||encode(digest(concat(cast(current_timestamp as text), random()::text, _platform.id, _platform.token, _platform.created_at::text, uuid_generate_v4(), uuid_generate_v1()), 'sha512'), 'hex') into _token;
            
            insert into platform_service.platform_api_keys(platform_id, token)
                values ($1, _token)
            returning * into _result;

            return _result;
        end;
    $function$
;
