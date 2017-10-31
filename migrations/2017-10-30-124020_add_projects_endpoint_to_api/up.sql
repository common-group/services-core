-- Your SQL goes here
create or replace view project_service_api.projects as
    select
        p.id as id,
        p.external_id as external_id,
        p.user_id as user_id,
        p.permalink as permalink,
        p.mode as mode,
        p.name as name
    from project_service.projects p
        where p.platform_id = core.current_platform_id()
            and core.has_any_of_roles('{platform_user}');

grant select on project_service_api.projects to platform_user;