-- Your SQL goes here

CREATE OR REPLACE VIEW "payment_service_api"."subscription_status_transitions" AS 
 SELECT s.id,
    subs.project_id,
    s.from_status,
    s.to_status,
    s.data,
    s.created_at,
    (subs.checkout_data->>'amount')::integer as amount,
    s.subscription_id
   FROM ((payment_service.subscription_status_transitions s
     JOIN payment_service.subscriptions subs ON ((subs.id = s.subscription_id)))
     JOIN project_service.projects p ON ((p.id = subs.project_id)))
  WHERE ((subs.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(subs.user_id) OR core.is_owner_or_admin(p.user_id)));;
---

