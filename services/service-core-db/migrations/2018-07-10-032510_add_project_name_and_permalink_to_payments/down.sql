-- This file should undo anything in `up.sql`
drop view payment_service_api.payments;
CREATE OR REPLACE VIEW "payment_service_api"."payments" AS 
 SELECT cp.id,
    cp.subscription_id,
    ((cp.data ->> 'amount'::text))::numeric AS amount,
    cp.project_id,
    cp.status,
    payment_service.paid_transition_at(cp.*) AS paid_at,
    cp.created_at,
    p.status AS project_status,
    p.mode AS project_mode,
    (cp.data ->> 'payment_method'::text) AS payment_method,
        CASE
            WHEN core.is_owner_or_admin(cp.user_id) THEN ((cp.data ->> 'customer'::text))::json
            ELSE NULL::json
        END AS billing_data,
        CASE
            WHEN (core.is_owner_or_admin(cp.user_id) AND ((cp.data ->> 'payment_method'::text) = 'credit_card'::text)) THEN json_build_object('first_digits', (cp.gateway_general_data ->> 'card_first_digits'::text), 'last_digits', (cp.gateway_general_data ->> 'card_last_digits'::text), 'brand', (cp.gateway_general_data ->> 'card_brand'::text), 'country', (cp.gateway_general_data ->> 'card_country'::text))
            WHEN (core.is_owner_or_admin(cp.user_id) AND ((cp.data ->> 'payment_method'::text) = 'boleto'::text)) THEN json_build_object('barcode', (cp.gateway_general_data ->> 'boleto_barcode'::text), 'url', (cp.gateway_general_data ->> 'boleto_url'::text), 'expiration_date', ((cp.gateway_general_data ->> 'boleto_expiration_date'::text))::timestamp without time zone)
            ELSE NULL::json
        END AS payment_method_details,
    (cp.gateway_general_data ->> 'gateway_id'::text) AS gateway_id
   FROM (((payment_service.catalog_payments cp
     JOIN project_service.projects p ON ((p.id = cp.project_id)))
     JOIN community_service.users u ON ((u.id = cp.user_id)))
     LEFT JOIN payment_service.subscriptions s ON ((s.id = cp.subscription_id)))
  WHERE ((s.status <> 'deleted'::payment_service.subscription_status) AND (cp.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)))
  ORDER BY cp.created_at DESC;
grant select on payment_service_api.payments to platform_user, scoped_user;