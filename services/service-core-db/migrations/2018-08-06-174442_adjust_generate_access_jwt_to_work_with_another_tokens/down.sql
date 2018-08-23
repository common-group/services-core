-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION core.generate_access_jwt_from_api_key(api_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;