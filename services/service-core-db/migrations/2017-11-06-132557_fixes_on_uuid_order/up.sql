-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.paid_transition_at(payment payment_service.catalog_payments) RETURNS timestamp without time zone
    LANGUAGE sql STABLE
    AS $_$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'paid'::payment_service.payment_status
            order by created_at desc limit 1;
    $_$;

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
        END AS payment_method_details
   FROM ((payment_service.catalog_payments cp
     JOIN project_service.projects p ON ((p.id = cp.project_id)))
     JOIN community_service.users u ON ((u.id = cp.user_id)))
  WHERE ((cp.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)))
  ORDER BY cp.created_at DESC;

CREATE OR REPLACE VIEW "payment_service_api"."subscriptions" AS 
 SELECT s.id,
    s.project_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN s.credit_card_id
            ELSE NULL::uuid
        END AS credit_card_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.paid_count
            ELSE NULL::bigint
        END AS paid_count,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.total_paid
            ELSE (NULL::bigint)::numeric
        END AS total_paid,
    s.status,
    payment_service.paid_transition_at(ROW(last_paid_payment.id, last_paid_payment.platform_id, last_paid_payment.project_id, last_paid_payment.user_id, last_paid_payment.subscription_id, last_paid_payment.reward_id, last_paid_payment.data, last_paid_payment.gateway, last_paid_payment.gateway_cached_data, last_paid_payment.created_at, last_paid_payment.updated_at, last_paid_payment.common_contract_data, last_paid_payment.gateway_general_data, last_paid_payment.status, last_paid_payment.external_id)) AS paid_at,
    (payment_service.paid_transition_at(ROW(last_paid_payment.id, last_paid_payment.platform_id, last_paid_payment.project_id, last_paid_payment.user_id, last_paid_payment.subscription_id, last_paid_payment.reward_id, last_paid_payment.data, last_paid_payment.gateway, last_paid_payment.gateway_cached_data, last_paid_payment.created_at, last_paid_payment.updated_at, last_paid_payment.common_contract_data, last_paid_payment.gateway_general_data, last_paid_payment.status, last_paid_payment.external_id)) + '1 mon'::interval) AS next_charge_at,
    ((((s.checkout_data - 'card_id'::text) - 'card_hash'::text) - 'current_ip'::text) || jsonb_build_object('customer', (((s.checkout_data ->> 'customer'::text))::jsonb || jsonb_build_object('name', (u.data ->> 'name'::text), 'email', (u.data ->> 'email'::text), 'document_number', (u.data ->> 'document_number'::text))))) AS checkout_data,
    s.created_at
   FROM (((((payment_service.subscriptions s
     JOIN project_service.projects p ON ((p.id = s.project_id)))
     JOIN community_service.users u ON ((u.id = s.user_id)))
     LEFT JOIN LATERAL ( SELECT sum(((cp.data ->> 'amount'::text))::numeric) AS total_paid,
            count(1) FILTER (WHERE (cp.status = 'paid'::payment_service.payment_status)) AS paid_count,
            count(1) FILTER (WHERE (cp.status = 'refused'::payment_service.payment_status)) AS refused_count
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)) stats ON (true))
     LEFT JOIN LATERAL ( SELECT cp.id,
            cp.platform_id,
            cp.project_id,
            cp.user_id,
            cp.subscription_id,
            cp.reward_id,
            cp.data,
            cp.gateway,
            cp.gateway_cached_data,
            cp.created_at,
            cp.updated_at,
            cp.common_contract_data,
            cp.gateway_general_data,
            cp.status,
            cp.external_id
           FROM payment_service.catalog_payments cp
          WHERE ((cp.subscription_id = s.id) AND (cp.status = 'paid'::payment_service.payment_status))
          ORDER BY cp.created_at DESC
         LIMIT 1) last_paid_payment ON (true))
     LEFT JOIN LATERAL ( SELECT cp.id,
            cp.platform_id,
            cp.project_id,
            cp.user_id,
            cp.subscription_id,
            cp.reward_id,
            cp.data,
            cp.gateway,
            cp.gateway_cached_data,
            cp.created_at,
            cp.updated_at,
            cp.common_contract_data,
            cp.gateway_general_data,
            cp.status,
            cp.external_id
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)
          ORDER BY cp.created_at DESC
         LIMIT 1) last_payment ON (true))
  WHERE ((s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)));