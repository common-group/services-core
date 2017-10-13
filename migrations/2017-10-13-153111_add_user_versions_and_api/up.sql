-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.is_owner_or_admin(bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'platform_user';
   $function$
;
create or replace view community_service_api.users as
    select
        u.id as id,
        u.data ->> 'name'::text as name,
        u.data ->> 'public_name'::text as public_name,
        u.data ->> 'document_number'::text as document_number,
        u.data ->> 'document_type'::text as document_type,
        u.data ->> 'legal_account_type'::text as legal_account_type,
        u.email as email,
        (u.data ->> 'address')::jsonb as address,
        (u.data ->> 'metadata')::jsonb as metadata,
        (u.data ->> 'bank_account')::jsonb as bank_account,
        u.created_at as created_at,
        u.updated_at as updated_at
    from community_service.users u
        where u.platform_id = core.current_platform_id();
grant select on community_service_api.users to platform_user;

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

create table community_service.user_versions (
    id bigserial primary key,
    user_id bigint not null references community_service.users(id),
    data jsonb not null default '{}',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create or replace function core.has_any_of_roles(roles text[])  returns boolean
    language sql
    stable
    as $$
        select current_role = ANY(roles);
    $$;
comment on function core.has_any_of_roles(roles text[]) is 'check if current role in any of requested roles';

create or replace function core.force_any_of_roles(roles text[]) returns void
    language plpgsql
    stable
    as $$
        declare
        begin
            if not core.has_any_of_roles($1) then
                raise exception insufficient_privilege;
            end if;
        end;
    $$;
comment on function core.force_any_of_roles(roles text[]) is 'raise insufficient_privilege when current role not in any of requested roles';

CREATE OR REPLACE FUNCTION community_service_api.update_user(data json)
 RETURNS json
 LANGUAGE plpgsql
 volatile
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
            if _user.id is null OR not core.user_exists_on_platform(_user.id, core.current_platform_id()) then
                raise 'user not found';
            end if;
            
            -- generate user basic data structure with received json
            select community_service._serialize_user_basic_data($1)
                into _refined;
                
            -- insert old user data to version
            insert into community_service.user_versions(user_id, data)
                values (_user.id, _user.data)
                returning * into _version;
            
            update community_service.users
                set data = _refined
            where id = _user.id;

            -- build result with user id
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;

            return _result;
        end;
    $function$
;

grant execute on function community_service_api.update_user(data json) to platform_user;
grant insert, select on community_service.user_versions to platform_user, scoped_user;
grant update on community_service.users to platform_user;
grant usage on sequence community_service.user_versions_id_seq to platform_user;