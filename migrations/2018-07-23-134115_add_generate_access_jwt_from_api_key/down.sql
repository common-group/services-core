-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION platform_service_api.generate_api_key(platform_id uuid)
 RETURNS platform_service_api.api_keys
 LANGUAGE plpgsql
AS $function$
        declare
            _platform_token uuid;
            _jwt_token text;
            _result platform_service.platform_api_keys;
        begin
            if not platform_service.user_in_platform(core.current_user_id(), $1) then
                raise exception 'insufficient permissions to do this action';
            end if;

            select token from platform_service.platforms p where p.id = $1
                into _platform_token;

            select token from core.gen_jwt_token(json_build_object(
                'role', 'platform_user',
                'platform_token', _platform_token,
                'gen_at', extract(epoch from now())::integer
            )) into _jwt_token;
            
            insert into platform_service.platform_api_keys(platform_id, token)
                values ($1, _jwt_token)
            returning * into _result;

            return _result;
        end;
    $function$
;
drop function core.generate_access_jwt_from_api_key(text);