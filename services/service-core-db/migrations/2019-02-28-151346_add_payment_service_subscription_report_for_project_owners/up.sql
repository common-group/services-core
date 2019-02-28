-- Your SQL goes here
create or replace view payment_service.subscription_report_for_project_owners as
  select s.project_id,
       u.data->>'name' as name,
       u.data->>'public_name' as public_name,
       u.email,
       (((s.checkout_data ->> 'amount'::text))::numeric / (100)::numeric)                     AS amount,
       r.data->>'title' as title,
       r.data->>'description' as description,
       (sum(((p.data ->> 'amount'::text))::numeric) FILTER (WHERE (p.status = 'paid'::payment_service.payment_status)) /
        (100)::numeric)                                                                       AS total_backed,
       s.status,
       (s.checkout_data ->> 'payment_method'::text)                                           AS payment_method,
       to_char(last_paid_payment.created_at, 'DD/MM/YYYY'::text)                              AS last_paid_at,
       to_char(s.created_at, 'DD/MM/YYYY'::text)                                              AS started_at,
       count(p.*) FILTER (WHERE (p.status = 'paid'::payment_service.payment_status))          AS payments_count,
       u.id                                                                                   AS user_id,
       CASE
         WHEN (((last_paid_payment.data ->> 'anonymous'::text))::boolean = true) THEN 'sim'::text
         ELSE 'não'::text
         END                                                                                  AS anonymous,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'street'::text)        AS street,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'complementary'::text) AS complement,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'street_number'::text) AS number,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'neighborhood'::text)  AS neighborhood,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'city'::text)          AS city,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'state'::text)         AS state,
       (((s.checkout_data -> 'customer'::text) -> 'address'::text) ->> 'zipcode'::text)       AS zipcode,
       u.data->>'document_number' as cpf
FROM ((((payment_service.subscriptions s
  JOIN community_service.users u ON ((u.id = s.user_id)))
  JOIN payment_service.catalog_payments p ON ((p.subscription_id = s.id)))
  LEFT JOIN project_service.rewards r ON ((r.id = s.reward_id)))
  LEFT JOIN LATERAL (
    SELECT cp.id,
          cp.data,
          cp.created_at
   FROM payment_service.catalog_payments cp
   WHERE ((cp.subscription_id = s.id) AND (cp.status = 'paid'::payment_service.payment_status))
   ORDER BY cp.created_at DESC
   LIMIT 1) last_paid_payment ON (true))
WHERE (s.status <> 'deleted'::payment_service.subscription_status)
GROUP BY s.project_id, u.data->>'name', u.data->>'public_name', u.email, s.checkout_data, r.data->>'title', r.data->>'description', s.status,
         last_paid_payment.created_at, s.created_at, u.id, last_paid_payment.data;