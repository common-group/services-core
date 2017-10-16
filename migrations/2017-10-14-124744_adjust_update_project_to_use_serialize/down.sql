-- This file should undo anything in `up.sql`
drop function project_service_api.update_project(data json);
drop function project_service._serialize_project_basic_data(json, with_default json);

CREATE OR REPLACE FUNCTION project_service_api.update_project(project json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
$function$;
comment on function project_service_api.update_project(project json) is 'update a project with given data';
grant execute on function project_service_api.update_project(project json) to platform_user;
