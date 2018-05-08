-- Your SQL goes here
CREATE OR REPLACE VIEW "payment_service_api"."subscriptions_per_month" AS 
 SELECT 
    s.project_id,
    count(distinct s.id) as total_subscriptions,
    COALESCE(sum((cp.data->>'amount')::numeric), 0) AS total_amount,
    count(distinct s.id) FILTER(  WHERE NOT EXISTS ( SELECT true
           FROM payment_service.catalog_payments past_payments
          WHERE ((past_payments.subscription_id = s.id) AND (past_payments.status = 'paid'::payment_service.payment_status) 
          and cp.data->>'payment_method' = past_payments.data->>'payment_method'
          AND (past_payments.id <> cp.id) AND (past_payments.created_at < cp.created_at)))) as new_subscriptions,
    COALESCE(sum((cp.data->>'amount')::numeric) FILTER(  WHERE NOT EXISTS ( SELECT true
           FROM payment_service.catalog_payments past_payments
          WHERE ((past_payments.subscription_id = s.id) AND (past_payments.status = 'paid'::payment_service.payment_status) 
          and cp.data->>'payment_method' = past_payments.data->>'payment_method'
          AND (past_payments.id <> cp.id) AND (past_payments.created_at < cp.created_at)))), 0)  AS new_amount,
    p.external_id AS project_external_id,
    (cp.data ->> 'payment_method'::text) AS payment_method,
    to_char(payment_service.paid_transition_at(ROW(cp.id, cp.platform_id, cp.project_id, cp.user_id, cp.subscription_id, cp.reward_id, cp.data, cp.gateway, cp.gateway_cached_data, cp.created_at, cp.updated_at, cp.common_contract_data, cp.gateway_general_data, cp.status, cp.external_id, cp.error_retry_at)), 'MM/YYYY') as month
   FROM  payment_service.catalog_payments cp
     join payment_service.subscriptions s on cp.subscription_id = s.id
     JOIN project_service.projects p ON p.id = s.project_id
     WHERE cp.status = 'paid'
     and ((s.status <> 'deleted'::payment_service.subscription_status) AND (s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)))
     group by month, s.project_id, p.external_id, payment_method;
GRANT SELECT ON VIEW payment_service_api.subscriptions_per_month TO platform_user;
GRANT SELECT ON VIEW payment_service_api.subscriptions_per_month TO scoped_user;


