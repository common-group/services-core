-- Your SQL goes here
CREATE OR REPLACE VIEW "project_service_api"."goals" AS 
 SELECT g.id,
    g.external_id,
    g.project_id,
    g.data,
    ((g.data ->> 'metadata'::text))::jsonb AS metadata,
    g.created_at,
    g.updated_at
   FROM project_service.goals g
  WHERE core.has_any_of_roles('{platform_user,scoped_user,anonymous}'::text[])
  ORDER BY g.id DESC;


GRANT SELECT ON TABLE project_service_api.goals TO platform_user;
GRANT SELECT ON TABLE project_service_api.goals TO scoped_user;
GRANT SELECT ON TABLE project_service_api.goals TO anonymous;
