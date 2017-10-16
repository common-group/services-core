-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION community_service._serialize_user_basic_data(json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'name', ($1->>'name')::text,
                'email', ($1->>'email')::text,
                'document_number', replace(replace(replace(($1->>'document_number')::text, '.', ''), '/', ''), '-', ''),
                'document_number', ($1->>'document_type')::text,
                'address', json_build_object(
                    'street', ($1->'address'->>'street')::text,
                    'street_number', ($1->'address'->>'street_number')::text,
                    'neighborhood', ($1->'address'->>'neighborhood')::text,
                    'zipcode', ($1->'address'->>'zipcode')::text,
                    'country', ($1->'address'->>'country')::text,
                    'state', ($1->'address'->>'state')::text,
                    'city', ($1->'address'->>'city')::text,
                    'complementary', ($1->'address'->>'complementary')::text
                ),
                'phone', json_build_object(
                    'ddi', ($1->'customer'->'phone'->>'ddi')::text,
                    'ddd', ($1->'customer'->'phone'->>'ddd')::text,
                    'number', ($1->'customer'->'phone'->>'number')::text
                )
            ) into _result;

            return _result;
        end;
    $function$
;
drop view community_service_api.users;
drop function community_service_api.update_user(data json);
drop table community_service.user_versions;
drop function core.has_any_of_roles(text[]);
drop function core.force_any_of_roles(text[]);