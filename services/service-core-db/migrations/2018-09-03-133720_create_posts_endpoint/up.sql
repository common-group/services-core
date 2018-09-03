-- Your SQL goes here
CREATE OR REPLACE VIEW "project_service_api"."posts" AS 
 SELECT p.id,
    p.external_id,
    p.project_id,
    p.reward_id,
    p.title,
    p.comment_html,
    p.recipients,
    p.data,
    ((p.data ->> 'metadata'::text))::jsonb AS metadata,
    p.created_at,
    p.updated_at
   FROM project_service.posts p
  WHERE core.has_any_of_roles('{platform_user,scoped_user,anonymous}'::text[])
  ORDER BY p.id DESC;
