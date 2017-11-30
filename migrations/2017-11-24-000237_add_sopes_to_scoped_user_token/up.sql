-- Your SQL goes here
create type community_service.user_roles_enum as enum (
    'admin',
    'financial'
);
create table community_service.user_roles (
    id uuid not null primary key default public.uuid_generate_v4(),
    platform_id uuid not null references platform_service.platforms(id),
    user_id uuid not null references community_service.users(id),
    role_name community_service.user_roles_enum not null,
    constraint uniq_platform_user_id_role_name unique (platform_id, user_id, role_name)
);

CREATE OR REPLACE FUNCTION community_service_api.create_scoped_user_session(id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _jwt text;
            _result json;
            _scopes text[];
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');

            select * from community_service.users cu
                where cu.platform_id = core.current_platform_id()
                    and cu.id = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;

            select array_agg(role_name) from community_service.user_roles
                where user_id = _user.id
                    and platform_id = core.current_platform_id()
                into _scopes;


            select token from core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2,
                'iat', extract(epoch from now())::integer,
                'scopes', coalesce(_scopes, '{}'::text[])
            )) into _jwt;

            select json_build_object(
                'token', _jwt
            ) into _result;

            return _result;
        end;
    $function$;
grant select on community_service.user_roles to platform_user, scoped_user, anonymous;

CREATE OR REPLACE FUNCTION core.current_user_scopes()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN nullif(current_setting('request.jwt.claim.scopes'), '{}')jsonb;
EXCEPTION
WHEN others THEN
  RETURN '{}'::jsonb;
END
    $function$
;

CREATE OR REPLACE FUNCTION core.is_owner_or_admin(uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'platform_user'
            OR (coalesce(core.current_user_scopes(), '{}'::jsonb)) ? 'admin';
    $function$
;