-- This file should undo anything in `up.sql`
drop function if exists project_service_api.update_project(json);
drop function if exists core.project_exists_on_platform(bigint, integer);
alter table project_service.projects
    drop column if exists data;
drop table project_service.project_versions;
