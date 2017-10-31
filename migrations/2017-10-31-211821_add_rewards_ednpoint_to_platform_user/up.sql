-- Your SQL goes here
create or replace view project_service_api.rewards as 
    select 
        r.id as id,
        r.external_id as external_id,
        r.project_id as project_id,
        r.data as data,
        (r.data->>'metadata')::jsonb as metadata,
        r.created_at,
        r.updated_at
        from project_service.rewards r
            where r.platform_id = core.current_platform_id()
                and core.has_any_of_roles('{platform_user}')
        order by r.id desc;

grant select on project_service_api.rewards to platform_user;
