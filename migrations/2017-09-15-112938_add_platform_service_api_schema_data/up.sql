-- Your SQL goes here
CREATE SCHEMA platform_service_api;
grant usage on schema platform_service_api to anonymous, platform_user, admin;

CREATE OR REPLACE FUNCTION core.current_user_id()
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN nullif(current_setting('request.jwt.claim.user_id'), '')::integer;
EXCEPTION
WHEN others THEN
  RETURN NULL::integer;
END
    $function$
;
COMMENT ON FUNCTION core.current_user_id() IS 'Returns the user_id decoded on jwt';

create or replace function core.is_owner_or_admin(integer)
    returns boolean
    language sql
    stable
    as $$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'admin';
    $$;
COMMENT ON FUNCTION core.is_owner_or_admin(integer) IS 'Check if current_role is admin or passed id match with current_user_id';


create or replace function platform_service_api.create_platform(name text) returns platform_service.platforms
    language plpgsql
    VOLATILE
    as $$
        declare
            platform platform_service.platforms;
        begin
            insert into platform_service.platforms(name)
                values($1)
            returning * into platform;

            insert into platform_service.platform_users (user_id, platform_id)
                values (core.current_user_id(), platform.id);

            return platform;
        end;
    $$;
COMMENT ON FUNCTION platform_service_api.create_platform(name text) IS 'Create a new platform on current logged platform user';

grant select, insert on platform_service.platforms to platform_user, admin;
grant select, insert on platform_service.platform_users to platform_user, admin;

grant usage, select, update on sequence platform_service.platforms_id_seq to platform_user, admin;
grant usage, select, update on sequence platform_service.platform_users_id_seq to platform_user, admin;

grant execute on function platform_service_api.create_platform(name text) to platform_user;


create or replace view platform_service_api.api_keys as
    select
        pak.*
    from platform_service.platform_api_keys pak
        join platform_service.platform_users pu on pu.platform_id = pak.platform_id
    where core.is_owner_or_admin(pu.user_id)
        and pak.disabled_at is null;
COMMENT ON VIEW platform_service_api.api_keys IS 'List all api keys from platform that user have access';

create or replace function platform_service.user_in_platform(user_id integer, platform_id integer) returns boolean
    language sql
    stable
    as $$
        select exists(select true from platform_service.platform_users pu where pu.user_id = $1 and pu.platform_id = $2);
    $$;
COMMENT ON FUNCTION platform_service.user_in_platform(integer, integer) IS 'Check if inputed user has access on inputed platform';

create or replace function core.gen_jwt_token(json)
    returns core.jwt_token
    language sql
    stable
    as $$
        select core.sign($1, core.get_setting('jwt_secret'));
    $$;
COMMENT ON FUNCTION core.gen_jwt_token(json) IS 'Generate a signed jwt';

create or replace function platform_service_api.generate_api_key(platform_id integer)
    returns platform_service_api.api_keys
    language plpgsql
    VOLATILE
    as $$
        declare
            _platform_token uuid;
            _result platform_service.platform_api_keys;
        begin
            if not platform_service.user_in_platform(current_user_id(), $1) then
                raise exception 'insufficient permissions to do this action';
            end if;

            select token from platform_service.platforms p where p.id = $1
                into _platform_token;

            insert into platform_service.platform_api_keys(platform_id, token)
                values ($1, core.gen_jwt_token(json_build_object(
                    'role', 'platform_user',
                    'platform_token', _platform_token,
                    'gen_at', extract(epoch from now())::integer
                )))
            returning * into _result;

            return _result;
        end;
    $$;
COMMENT ON FUNCTION platform_service_api.generate_api_key(integer) IS 'Generate a new API_KEY for given platform';

grant insert, select on platform_service.platform_api_keys to platform_user, admin;
grant select, update on sequence platform_service.platform_api_keys_id_seq to platform_user, admin;
grant select on platform_service_api.api_keys to platform_user, admin;
grant execute on function platform_service_api.generate_api_key(platform_id integer) to platform_user, admin;


create or replace function platform_service_api.sign_up(name text, email text, password text) returns core.jwt_token
language plpgsql VOLATILE
as $$
    declare
        _user platform_service.users;
        result core.jwt_token;
    begin
        insert into platform_service.users(name, email, password)
            values (name, email, crypt(password, gen_salt('bf')))
            returning * into _user;

        select core.gen_jwt_token(
            row_to_json(r)
        ) as token
        from (
            select
                'platform_user' as role,
                _user.id as user_id,
                extract(epoch from now())::integer + (60*60)*2 as exp
        ) r
        into result;

        return result;
    end;
$$;
COMMENT ON FUNCTION platform_service_api.sign_up(name text, email text, password text) IS 'Handles with creation of new platform users';


create or replace function platform_service_api.login(email text, password text)
returns core.jwt_token
language plpgsql VOLATILE
as $$
declare
    _user platform_service.users;
    result core.jwt_token;
begin
    select
        u.*
    from platform_service.users u
        where lower(u.email) = lower($1)
            and u.password = crypt($2, u.password)
        into _user;

    if _user is null then
        raise invalid_password using message = 'invalid user or password';
    end if;

    select core.gen_jwt_token(
        row_to_json(r)
    ) as token
    from (
        select
            'platform_user' as role,
            _user.id as user_id,
            extract(epoch from now())::integer + (60*60)*2 as exp
    ) r
    into result;

    return result;
end;
$$;
COMMENT ON FUNCTION platform_service_api.login(text, text) IS 'Handles with platform users authentication';

grant execute on function platform_service_api.sign_up(name text, email text, password text) to anonymous;
grant execute on function platform_service_api.login(email text, password text) to anonymous;
grant select, insert on platform_service.users to anonymous, platform_user, admin;
grant usage, select, update on sequence platform_service.users_id_seq to anonymous, platform_user, admin;