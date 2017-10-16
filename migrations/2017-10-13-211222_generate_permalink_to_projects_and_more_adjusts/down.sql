-- This file should undo anything in `up.sql`
alter table project_service.projects 
    drop constraint unq_permalink_on_platform;

alter table project_service.projects
    drop column permalink;

drop function if exists project_service_api.create_project(data json);
CREATE OR REPLACE FUNCTION project_service_api.create_project(project json)
 RETURNS project_service.new_project_record
 LANGUAGE plpgsql
AS $function$
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
$function$
;
grant execute on function project_service_api.create_project(project json) to platform_user;

drop function project_service._serialize_project_basic_data(json);