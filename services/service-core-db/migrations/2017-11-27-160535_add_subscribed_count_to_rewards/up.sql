-- Your SQL goes here

drop view project_service_api.rewards;
create or replace view project_service_api.rewards AS
SELECT r.id,
    r.external_id,
    r.project_id,
    r.data,
    (r.data ->> 'metadata'::text)::jsonb AS metadata,
    r.created_at,
    r.updated_at,
    (SELECT count(*) from payment_service.subscriptions s where s.reward_id = r.id and s.status = 'active') as subscribed_count
   FROM project_service.rewards r
  WHERE r.platform_id = core.current_platform_id() AND core.has_any_of_roles('{platform_user, scoped_user, anonymous}'::text[])
  ORDER BY r.id DESC;

GRANT SELECT ON TABLE project_service_api.rewards TO platform_user;
GRANT SELECT ON TABLE project_service_api.rewards TO scoped_user;
GRANT SELECT ON TABLE project_service_api.rewards TO anonymous;
