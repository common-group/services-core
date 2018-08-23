-- This file should undo anything in `up.sql`

drop view project_service_api.rewards;
create or replace view project_service_api.rewards AS
SELECT r.id,
    r.external_id,
    r.project_id,
    r.data,
    (r.data ->> 'metadata'::text)::jsonb AS metadata,
    r.created_at,
    r.updated_at
   FROM project_service.rewards r
  WHERE r.platform_id = core.current_platform_id() AND core.has_any_of_roles('{platform_user}'::text[])
  ORDER BY r.id DESC;

revoke SELECT on project_service_api.rewards from scoped_user ;
revoke SELECT on project_service_api.rewards from anonymous ;
