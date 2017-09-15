-- Your SQL goes here
CREATE SCHEMA community_service;
GRANT USAGE ON SCHEMA community_service TO postgrest, anonymous, admin, platform_user, scoped_user;

create or replace function core.current_platform_token() returns uuid
    language plpgsql
    stable
    as $$
        BEGIN
          RETURN nullif(current_setting('request.jwt.claim.platform_token'), '')::uuid;
        EXCEPTION
            WHEN others THEN
            RETURN NULL::integer;
        END
    $$;
comment on function core.current_platform_token() is 'Get platform uuid token from jwt';

create table community_service.users (
    platform_id integer not null REFERENCES platform_service.platforms(id),
    id bigserial primary key,
    email text not null check ( email ~* '^.+@.+\..+$' ),
    password text not null check(length(password) < 512),
    name text not null check(length(name) < 255),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    data jsonb not null default '{}',
    key uuid unique not null default uuid_generate_v4(),
    CONSTRAINT uidx_platform_email UNIQUE(platform_id, email)
);
comment on table community_service.users is 'Stores community users';
grant select on community_service.users to admin, platform_user, anonymous, scoped_user, postgrest;

CREATE SCHEMA community_service_api;

create or replace function community_service_api.generate_scoped_user_key (user_key uuid)
    returns core.jwt_token
    language plpgsql
    stable
    as $$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _result core.jwt_token;
        begin
            select * from platform_service.platforms p 
                where p.token = core.current_platform_token()
                into _platform;

            if _platform is null then
                raise exception 'invalid platform';
            end if;

            select * from community_service.users cu
                where cu.platform_id = _platform.id
                    and cu.key = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;


            select core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2
            )) into _result;

            return _result;
        end;
    $$;

grant usage on schema community_service_api to anonymous, platform_user, postgrest, admin, scoped_user;
grant execute on function community_service_api.generate_scoped_user_key(user_id uuid) to platform_user, admin;