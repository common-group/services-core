-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION core.gen_jwt_token(json)
 RETURNS core.jwt_token
 LANGUAGE sql
 STABLE
AS $function$
        select core.sign($1::json, core.get_setting('jwt_secret'));
    $function$
;