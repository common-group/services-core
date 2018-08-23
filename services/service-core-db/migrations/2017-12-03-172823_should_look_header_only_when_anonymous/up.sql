-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.current_platform_token()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE
AS $function$
        BEGIN
            if current_role = 'anonymous' then
                return current_setting('request.header.platform-code')::uuid;
            else
                return current_setting('request.jwt.claim.platform_token')::uuid;
            end if;
        EXCEPTION
            WHEN others THEN
            RETURN NULL::uuid;
        END
    $function$
;