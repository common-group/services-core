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
                'born_at', ($1->>'born_at')::date,
                'document_type', ($1->>'document_type')::text,
                'legal_account_type', ($1->>'legal_account_type')::text,
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
                    'ddi', ($1->'phone'->>'ddi')::text,
                    'ddd', ($1->'phone'->>'ddd')::text,
                    'number', ($1->'phone'->>'number')::text
                ),
                'bank_account', json_build_object(
                    'bank_code', ($1->'bank_account'->>'bank_code')::text,
                    'account', ($1->'bank_account'->>'account')::text,
                    'account_digit', ($1->'bank_account'->>'account_digit')::text,
                    'agency', ($1->'bank_account'->>'agency')::text,
                    'agency_digit', ($1->'bank_account'->>'agency_digit')::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $function$;

drop function  community_service._serialize_user_basic_data(json, with_default json);

drop view if exists "community_service_api"."users";
alter table community_service.users
    alter column email type text;
CREATE OR REPLACE VIEW "community_service_api"."users" AS 
 SELECT u.id,
    (u.data ->> 'name'::text) AS name,
    (u.data ->> 'public_name'::text) AS public_name,
    (u.data ->> 'document_number'::text) AS document_number,
    (u.data ->> 'document_type'::text) AS document_type,
    (u.data ->> 'legal_account_type'::text) AS legal_account_type,
    u.email::text as email,
    ((u.data ->> 'address'::text))::jsonb AS address,
    ((u.data ->> 'metadata'::text))::jsonb AS metadata,
    ((u.data ->> 'bank_account'::text))::jsonb AS bank_account,
    u.created_at,
    u.updated_at
   FROM community_service.users u
  WHERE (u.platform_id = core.current_platform_id());
grant select on community_service_api.users to platform_user;
DROP DOMAIN email;
alter table community_service.users
    add CONSTRAINT users_email_check CHECK ((email)::text ~* '^.+@.+\..+$'::text);