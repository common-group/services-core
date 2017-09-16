-- Your SQL goes here
create schema project_service;
grant usage on schema project_service to postgrest, admin, scoped_user, platform_user;

create schema project_service_api;
grant usage on schema project_service_api to postgrest, admin, scoped_user, platform_user;

CREATE OR REPLACE FUNCTION core.current_platform_id()
 RETURNS integer
 LANGUAGE sql
 STABLE
AS $function$
        select id from platform_service.platforms where token = core.current_platform_token();
    $function$
;

create type project_service.project_mode as enum ('aon', 'flex', 'sub');
create table project_service.projects (
    platform_id integer not null REFERENCES platform_service.platforms(id),
    id bigserial primary key,
    user_id bigint not null REFERENCES community_service.users(id),
    name text not null,
    mode project_service.project_mode not null,
    key uuid unique not null default uuid_generate_v4()
);
comment on table project_service.projects is 'store project data for platforms';

create type project_service.new_project_record as (
    id bigint,
    name text,
    mode project_service.project_mode,
    key uuid
);


create or replace function project_service_api.create_project (
    project json
) returns project_service.new_project_record
language plpgsql
volatile
as $$
    declare
        _platform platform_service.platforms;
        _user community_service.users;
        _result project_service.new_project_record;
    begin
        select * from community_service.users cu
            where cu.id = (project ->> 'user_id')::bigint
                and cu.platform_id = core.current_platform_id()
            into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;

            insert into project_service.projects (
                platform_id, user_id, name, mode
            ) values (core.current_platform_id(), _user.id, project ->> 'name', (project ->> 'mode')::project_service.project_mode)
            returning id, name, mode, key into _result;

            return _result;
    end;
$$;

comment on function project_service_api.create_project(json) is 'Create a new project for user and platform, can be used only by platform api key';
grant usage on sequence project_service.projects_id_seq to admin, platform_user;
grant insert on project_service.projects to admin, platform_user;
grant select on project_service.projects to admin, platform_user, scoped_user, anonymous;
grant execute on function project_service_api.create_project(json) to admin, platform_user;


