-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.is_owner_or_admin(bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'admin';
   $function$;
COMMENT ON FUNCTION core.is_owner_or_admin(bigint) IS 'Check if current_role is admin or passed id match with current_user_id';

create or replace function core.project_exists_on_platform(project_id bigint, platform_id integer)
returns boolean
language sql
stable
as $$
    select exists(
        select true
        from project_service.projects p
            where p.id = $1
                and p.platform_id = $2
    )
$$;
comment on function core.project_exists_on_platform(bigint, integer) is 'check if project id exists on platform';

alter table project_service.projects
    add column data jsonb not null default '{}';

create table project_service.project_versions (
    id bigserial primary key,
    project_id bigint not null references project_service.projects(id),
    data jsonb not null default '{}',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
select diesel_manage_updated_at('project_service.project_versions');
comment on table project_service.project_versions is 'Store project data versions';
grant select, insert on table project_service.project_versions to scoped_user, admin, platform_user;
grant usage on sequence project_service.project_versions_id_seq to scoped_user, admin, platform_user;

create or replace function project_service_api.update_project(project json)
returns json
language plpgsql
volatile
as $$
    declare
        _project project_service.projects;
        _result json;
    begin
        if (($1->>'id')::bigint is null)
            OR (not core.project_exists_on_platform(
                    ($1->>'id')::bigint
                    , core.current_platform_id()
            ))
        then
            raise exception undefined_table;
        end if;

        select * from project_service.projects
            where id = ($1->>'id')::bigint
            into _project;

        if not core.is_owner_or_admin(_project.user_id) then
            raise exception insufficient_privilege;
        end if;

        insert into project_service.project_versions(project_id, data)
            values (_project.id, _project.data);

        update project_service.projects
            set data = $1
            where id = _project.id;

        select json_build_object(
            'id', _project.id
        ) into _result;

        return _result;
    end;
$$;
comment on function project_service_api.update_project(json) is 'update project data';
grant update on table project_service.projects to platform_user, scoped_user, admin;
grant execute on function project_service_api.update_project(json) to platform_user, admin, scoped_user;