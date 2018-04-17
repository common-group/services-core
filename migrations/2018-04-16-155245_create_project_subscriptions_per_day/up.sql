-- Your SQL goes here
CREATE VIEW analytics_service_api.project_subscriptions_per_day AS 
 SELECT i.project_id,
    json_agg(json_build_object('paid_at', i.created_at, 'created_at', i.created_at, 'total', i.total, 'total_amount', i.total_amount)) AS source
   FROM 
   (
   SELECT s.project_id,
   (s.created_at)::date as created_at,
   count(s.*) as total,
   sum((cp.data->>'amount')::numeric)/100 as total_amount
   FROM payment_service.subscriptions s
   JOIN project_service.projects p on p.id = s.project_id
   JOIN payment_service.catalog_payments cp on cp.subscription_id = s.id
   WHERE s.created_at >= now() - '30 days'::interval
   AND cp.status = 'paid'
   AND  ((s.status = 'active'::payment_service.subscription_status) AND (s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)))
   group by s.project_id, s.created_at::date
   ) i
  GROUP BY i.project_id;

GRANT SELECT ON TABLE analytics_service_api.project_subscriptions_per_day TO platform_user;
GRANT SELECT ON TABLE analytics_service_api.project_subscriptions_per_day TO scoped_user;
