-- Your SQL goes here
CREATE OR REPLACE VIEW "payment_service_api"."subscriptions" AS 
 SELECT s.id,
    s.project_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN s.credit_card_id
            ELSE NULL::uuid
        END AS credit_card_id,
        CASE
            WHEN (core.is_owner_or_admin(p.user_id) OR core.is_owner_or_admin(s.user_id)) THEN stats.paid_count
            ELSE NULL::bigint
        END AS paid_count,
        CASE
            WHEN (core.is_owner_or_admin(p.user_id) OR core.is_owner_or_admin(s.user_id)) THEN stats.total_paid
            ELSE (NULL::bigint)::numeric
        END AS total_paid,
    s.status,
    payment_service.paid_transition_at(last_paid_payment) AS paid_at,
    (last_paid_payment.created_at + (core.get_setting('subscription_interval'::character varying))::interval) AS next_charge_at,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN ((((s.checkout_data - 'card_id'::text) - 'card_hash'::text) - 'current_ip'::text) || jsonb_build_object('customer', (((s.checkout_data ->> 'customer'::text))::jsonb || jsonb_build_object('name', (u.data ->> 'name'::text), 'email', (u.data ->> 'email'::text), 'document_number', (u.data ->> 'document_number'::text)))))
            ELSE NULL::jsonb
        END AS checkout_data,
    s.created_at,
    s.user_id,
    s.reward_id,
    ((last_payment.data ->> 'amount'::text))::numeric AS amount,
    p.external_id AS project_external_id,
    r.external_id AS reward_external_id,
    u.external_id AS user_external_id,
    COALESCE((s.checkout_data ->> 'payment_method'::text), (last_payment.data ->> 'payment_method'::text)) AS payment_method,
    last_payment.id AS last_payment_id,
    last_paid_payment.id AS last_paid_payment_id,
    last_paid_payment.created_at AS last_paid_payment_created_at,
    (u.data ->> 'email'::text) AS user_email,
    s.search_index,
    current_paid_subscription.data AS current_paid_subscription,
    current_paid_subscription.current_reward_data,
    current_paid_subscription.current_reward_id,
    json_build_object(
        'id', last_payment.id, 
        'status', last_payment.status, 
        'created_at', last_payment.created_at,
        'payment_method', (last_payment.data ->> 'payment_method'::text),
        'refused_at', (case when last_payment.status = 'refused' then payment_service.refused_transition_at(last_payment) else null end),
        'next_retry_at', (
            case 
            when (last_payment.data->>'payment_method') = 'credit_card' and last_payment.status = 'refused' then 
                (payment_service.refused_transition_at(last_payment) + '4 days'::interval)
            when (last_payment.data->>'payment_method') = 'boleto' and last_Payment.status = 'refused' then
                (payment_service.refused_transition_at(last_payment) + '3 days'::interval)
            else null end
        )
    ) AS last_payment_data,
    json_build_object(
        'id', last_paid_payment.id,
        'status', last_paid_payment.status,
        'created_at', last_paid_payment.created_at,
        'payment_method', (last_payment.data ->> 'payment_method'::text)
    ) AS last_paid_payment_data
   FROM (((((((payment_service.subscriptions s
     JOIN project_service.projects p ON ((p.id = s.project_id)))
     JOIN community_service.users u ON ((u.id = s.user_id)))
     LEFT JOIN project_service.rewards r ON ((r.id = s.reward_id)))
     LEFT JOIN LATERAL ( SELECT sum(((cp.data ->> 'amount'::text))::numeric) FILTER (WHERE (cp.status = 'paid'::payment_service.payment_status)) AS total_paid,
            count(1) FILTER (WHERE (cp.status = 'paid'::payment_service.payment_status)) AS paid_count,
            count(1) FILTER (WHERE (cp.status = 'refused'::payment_service.payment_status)) AS refused_count
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)) stats ON (true))
     LEFT JOIN LATERAL ( SELECT cp.*
           FROM payment_service.catalog_payments cp
          WHERE ((cp.subscription_id = s.id) AND (cp.status = 'paid'::payment_service.payment_status))
          ORDER BY cp.created_at DESC
         LIMIT 1) last_paid_payment ON (true))
     LEFT JOIN LATERAL ( SELECT cp.*
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)
          ORDER BY cp.created_at DESC
         LIMIT 1) last_payment ON (true))
     LEFT JOIN LATERAL ( SELECT cp_version_check.subscription_id,
            cp_version_check.data,
            cp_version_check.created_at,
            cp_version_check.updated_at,
            current_reward_data.data AS current_reward_data,
            current_reward_data.id AS current_reward_id
           FROM (payment_service.catalog_payments cp_version_check
             LEFT JOIN project_service.rewards current_reward_data ON ((current_reward_data.id = cp_version_check.reward_id)))
          WHERE ((cp_version_check.platform_id = s.platform_id) AND (cp_version_check.project_id = s.project_id) AND (cp_version_check.subscription_id = s.id) AND (cp_version_check.user_id = s.user_id) AND (cp_version_check.status = 'paid'::payment_service.payment_status))
          ORDER BY cp_version_check.created_at DESC
         LIMIT 1) current_paid_subscription ON (true))
  WHERE ((s.status <> 'deleted'::payment_service.subscription_status) AND (s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)));
