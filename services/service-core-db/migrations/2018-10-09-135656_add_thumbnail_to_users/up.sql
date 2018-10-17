CREATE OR REPLACE FUNCTION community_service._serialize_user_basic_data(json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', ($1->>'name')::text,
                'public_name', ($1->>'public_name')::text,
                'about_html', ($1->>'about_html')::text,
                'permalink', ($1->>'permalink')::text,
                'facebook_link', ($1->>'facebook_link')::text,
                'other_link', ($1->>'other_link')::text,
                'thumbnail_url', ($1->>'thumbnail_url')::text,
                'email', ($1->>'email')::email,
                'document_number', replace(replace(replace(($1->>'document_number')::text, '.', ''), '/', ''), '-', ''),
                'born_at', ($1->>'born_at')::date,
                'deactivated_at', ($1->>'deactivated_at')::date,
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
    $function$
;
---

CREATE OR REPLACE FUNCTION community_service._serialize_user_basic_data(json, with_default json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', coalesce(($1->>'name')::text, ($2->>'name')::text),
                'public_name', coalesce(($1->>'public_name')::text, ($2->>'public_name')::text),
                'about_html', coalesce(($1->>'about_html')::text, ($2->>'about_html')::text),
                'permalink', coalesce(($1->>'permalink')::text, ($2->>'permalink')::text),
                'facebook_link', coalesce(($1->>'facebook_link')::text, ($2->>'facebook_link')::text),
                'other_link', coalesce(($1->>'other_link')::text, ($2->>'other_link')::text),
                'thumbnail_url', coalesce(($1->>'thumbnail_url')::text, ($2->>'thumbnail_url')::text),
                'email', coalesce(($1->>'email')::email, ($2->>'email')::email),
                'document_number', replace(replace(replace(coalesce(($1->>'document_number')::text, ($2->>'document_number')::text), '.', ''), '/', ''), '-', ''),
                'born_at', coalesce(($1->>'born_at')::date, ($2->>'born_at')::date),
                'deactivated_at', coalesce(($1->>'deactivated_at')::date, ($2->>'deactivated_at')::date),
                'document_type', coalesce(($1->>'document_type')::text, ($2->>'document_type')::text),
                'legal_account_type', coalesce(($1->>'legal_account_type')::text, ($2->>'legal_account_type')::text),
                'address', json_build_object(
                    'street', coalesce(($1->'address'->>'street')::text, ($2->'address'->>'street')::text),
                    'street_number', coalesce(($1->'address'->>'street_number')::text, ($2->'address'->>'street_number')::text),
                    'neighborhood', coalesce(($1->'address'->>'neighborhood')::text, ($2->'address'->>'neighborhood')::text),
                    'zipcode', coalesce(($1->'address'->>'zipcode')::text, ($2->'address'->>'zipcode')::text),
                    'country', coalesce(($1->'address'->>'country')::text, ($2->'address'->>'country')::text),
                    'state', coalesce(($1->'address'->>'state')::text, ($2->'address'->>'state')::text),
                    'city', coalesce(($1->'address'->>'city')::text, ($2->'address'->>'city')::text),
                    'complementary', coalesce(($1->'address'->>'complementary')::text, ($2->'address'->>'complementary')::text)
                ),
                'phone', json_build_object(
                    'ddi', coalesce(($1->'phone'->>'ddi')::text, ($2->'phone'->>'ddi')::text),
                    'ddd', coalesce(($1->'phone'->>'ddd')::text, ($2->'phone'->>'ddd')::text),
                    'number', coalesce(($1->'phone'->>'number')::text, ($2->'phone'->>'number')::text)
                ),
                'bank_account', json_build_object(
                    'bank_code', coalesce(($1->'bank_account'->>'bank_code')::text, ($2->'bank_account'->>'bank_code')::text),
                    'account', coalesce(($1->'bank_account'->>'account')::text, ($2->'bank_account'->>'account')::text),
                    'account_digit', coalesce(($1->'bank_account'->>'account_digit')::text, ($2->'bank_account'->>'account_digit')::text),
                    'agency', coalesce(($1->'bank_account'->>'agency')::text, ($2->'bank_account'->>'agency')::text),
                    'agency_digit', coalesce(($1->'bank_account'->>'agency_digit')::text, ($2->'bank_account'->>'agency_digit')::text)
                ),
                'metadata', coalesce(($1->>'metadata')::json, ($2->>'metadata')::json)
            ) into _result;

            return _result;
        end;
    $function$
    ;


CREATE OR REPLACE VIEW "community_service_api"."users" AS 
 SELECT u.external_id,
    u.id,
    CASE
        WHEN (((u.data->>'deactivated_at') IS NOT NULL) AND (NOT core.is_owner_or_admin(u.id))) THEN (''::character varying(255))::text
        ELSE (u.data->>'name'::text)
    END AS name,
    (u.data->>'public_name'::text) AS public_name,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN (u.data ->> 'document_number'::text)
        ELSE NULL::text
    END AS document_number,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN (u.data ->> 'document_type'::text)
        ELSE NULL::text
    END AS document_type,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN (u.data ->> 'legal_account_type'::text)
        ELSE NULL::text
    END AS legal_account_type,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN u.email
        ELSE NULL::email
    END AS email,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN ((u.data ->> 'address'::text))::jsonb
        ELSE NULL::jsonb
    END AS address,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN ((u.data ->> 'metadata'::text))::jsonb
        ELSE NULL::jsonb
    END AS metadata,
    CASE
        WHEN core.is_owner_or_admin(u.id) THEN ((u.data ->> 'bank_account'::text))::jsonb
        ELSE NULL::jsonb
    END AS bank_account,
    u.created_at,
    u.updated_at,
    (u.data ->> 'thumbnail_url'::text) AS thumbnail_url
   FROM community_service.users u
  WHERE (u.platform_id = core.current_platform_id());


GRANT SELECT ON TABLE community_service_api.users TO platform_user;
GRANT SELECT ON TABLE community_service_api.users TO anonymous;
GRANT SELECT ON TABLE community_service_api.users TO scoped_user;
