-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION core.current_platform_token()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE
AS $function$
        BEGIN
          RETURN COALESCE(
            current_setting('request.jwt.claim.platform_token', true)::uuid, 
            current_setting('request.header.platform-code')::uuid);
        EXCEPTION
            WHEN others THEN
            RETURN NULL::integer;
        END
    $function$
;