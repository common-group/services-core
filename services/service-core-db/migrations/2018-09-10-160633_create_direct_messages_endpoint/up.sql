-- Your SQL goes here
CREATE OR REPLACE VIEW "community_service_api"."direct_messages" AS 
 SELECT p.id,
    p.platform_id,
    p.project_id,
    p.user_id,
    p.to_user_id,
    p.data,
    p.content,
    p.from_email,
    p.from_name,
    p.created_at,
    p.updated_at
   FROM community_service.direct_messages p
  WHERE core.has_any_of_roles('{platform_user,scoped_user,anonymous}'::text[])
  ORDER BY p.id DESC;

GRANT SELECT ON TABLE community_service_api.direct_messages TO platform_user;
