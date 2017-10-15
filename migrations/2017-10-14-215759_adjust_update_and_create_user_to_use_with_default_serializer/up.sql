-- Your SQL goes here
CREATE EXTENSION if not exists citext;

CREATE DOMAIN email AS citext
  CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );

CREATE OR REPLACE FUNCTION core.force_ip_address()
 RETURNS text
 LANGUAGE sql
AS $function$
        select current_setting('request.header.x-forwarded-for');
    $function$;
comment on function core.force_ip_address() is 'Get ip address form request header or raise error';

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
                'email', ($1->>'email')::email,
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
                'email', coalesce(($1->>'email')::email, ($2->>'email')::email),
                'document_number', replace(replace(replace(coalesce(($1->>'document_number')::text, ($2->>'document_number')::text), '.', ''), '/', ''), '-', ''),
                'born_at', coalesce(($1->>'born_at')::date, ($2->>'born_at')::date),
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
    $function$;

CREATE OR REPLACE FUNCTION community_service_api.create_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined jsonb;
            _result json;
            _passwd text;
            _version community_service.user_versions;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');
            
            -- insert current_ip into refined
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(coalesce(($1->>'current_ip')::text, core.force_ip_address())));

            -- generate user basic data structure with received json
            _refined := community_service._serialize_user_basic_data($1);

            -- check if password already encrypted
            _passwd := (case when ($1->>'password_encrypted'::text) = 'true' then 
                            ($1->>'password')::text  
                        else 
                            crypt(($1->>'password')::text, gen_salt('bf')) 
                        end);

            -- insert user in current platform
            insert into community_service.users (platform_id, email, password, data, created_at, updated_at)
                values (core.current_platform_id(),
                        ($1)->>'email',
                        _passwd,
                        _refined::jsonb,
                        coalesce(($1->>'created_at')::timestamp, now()),
                        coalesce(($1->>'updated_at')::timestamp, now())
                    )
                    returning * into _user;

            -- insert user version
            insert into community_service.user_versions(user_id, data)
                values (_user.id, _refined)
            returning * into _version;

            -- build result with user id
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;

            return _result;
        end;
    $function$;

drop view "community_service_api"."users";
alter table community_service.users
    alter column email type email;
CREATE OR REPLACE VIEW "community_service_api"."users" AS 
 SELECT u.id,
    (u.data ->> 'name'::text) AS name,
    (u.data ->> 'public_name'::text) AS public_name,
    (u.data ->> 'document_number'::text) AS document_number,
    (u.data ->> 'document_type'::text) AS document_type,
    (u.data ->> 'legal_account_type'::text) AS legal_account_type,
    u.email::email as email,
    ((u.data ->> 'address'::text))::jsonb AS address,
    ((u.data ->> 'metadata'::text))::jsonb AS metadata,
    ((u.data ->> 'bank_account'::text))::jsonb AS bank_account,
    u.created_at,
    u.updated_at
   FROM community_service.users u
  WHERE (u.platform_id = core.current_platform_id());
grant select on community_service_api.users to platform_user;

alter table community_service.users
    drop CONSTRAINT users_email_check;

CREATE OR REPLACE FUNCTION community_service_api.update_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user_id bigint;
            _user community_service.users;
            _platform platform_service.platforms;
            _version community_service.user_versions;
            _refined json;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');

            -- platform user can update any project inside the platform
            if current_role = 'platform_user' then
                _user_id := ($1->>'id')::bigint;
            else -- scoped_user can only update they records
                _user_id := core.current_user_id();
            end if;

            select * from community_service.users 
                where id = _user_id
                    and platform_id = core.current_platform_id()
            into _user;

            -- check if user exists on platform
            if _user.id is null then
                raise 'user not found';
            end if;

            -- put current ip inside jsonb
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()));

            -- generate user basic data structure with received json
            _refined := community_service._serialize_user_basic_data($1, _user.data::json);

            -- insert old user data to version
            insert into community_service.user_versions(user_id, data)
                values (_user.id, _user.data)
                returning * into _version;

            update community_service.users
                set data = _refined,
                    email = _refined->>'email'
            where id = _user.id;

            -- build result with user id
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;

            return _result;
        end;
    $function$;