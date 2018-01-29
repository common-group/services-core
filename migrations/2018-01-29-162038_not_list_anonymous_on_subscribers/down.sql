-- This file should undo anything in `up.sql`
CREATE OR REPLACE VIEW "project_service_api"."subscribers" AS 
 SELECT u.id,
    u.external_id AS user_id,
    u.external_id AS user_external_id,
    p.id AS project_id,
    p.external_id AS project_external_id,
    json_build_object('public_name', (u.data ->> 'public_name'::text), 'name', (u.data ->> 'name'::text), 'city', ((u.data -> 'address'::text) ->> 'city'::text), 'state', ((u.data -> 'address'::text) ->> 'state'::text), 'total_contributed_projects', ( SELECT count(DISTINCT cp.project_id) AS count
           FROM payment_service.catalog_payments cp
          WHERE ((cp.user_id = u.id) AND (cp.status = 'paid'::payment_service.payment_status) AND (cp.platform_id = core.current_platform_id()))), 'total_published_projects', ( SELECT count(DISTINCT p_1.id) AS count
           FROM project_service.projects p_1
          WHERE ((p_1.user_id = u.id) AND (p_1.platform_id = core.current_platform_id())))) AS data,
    s.status
   FROM ((payment_service.subscriptions s
     JOIN community_service.users u ON ((s.user_id = u.id)))
     JOIN project_service.projects p ON ((p.id = s.project_id)))
  WHERE (u.platform_id = core.current_platform_id())
  GROUP BY u.id, p.id, s.status;