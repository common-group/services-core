-- Your SQL goes here
drop view project_service_api.rewards;
CREATE OR REPLACE VIEW "project_service_api"."rewards" AS 
 SELECT r.id,
    r.external_id,
    r.project_id,
    r.data,
    ((r.data ->> 'metadata'::text))::jsonb AS metadata,
    r.created_at,
    r.updated_at,
    ( SELECT count(*) AS count
           FROM payment_service.subscriptions s
          WHERE ((s.reward_id = r.id) AND (s.status = 'active'::payment_service.subscription_status))) AS subscribed_count
   FROM project_service.rewards r
  WHERE (((select platform_id from project_service.projects p where p.id = r.project_id limit 1) = core.current_platform_id()) AND core.has_any_of_roles('{platform_user,scoped_user,anonymous}'::text[]))
  ORDER BY r.id DESC;

GRANT SELECT ON TABLE project_service_api.rewards TO platform_user;
GRANT SELECT ON TABLE project_service_api.rewards TO scoped_user;
GRANT SELECT ON TABLE project_service_api.rewards TO anonymous;
---

ALTER TABLE project_service.rewards DROP COLUMN IF EXISTS platform_id;

