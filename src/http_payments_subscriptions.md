# List subscriptions

| GET `/subscriptions` | **required roles:** `scoped_user` or `platform_user` |
| :--- | :--- |


### example request

```curl
curl -X GET https://sandbox.api.payment.comum.io/subscriptions \
  -H 'authorization: Bearer API_KEY' \
  -H 'cache-control: no-cache'
```

### example result

```json
[
  {
    "id": "48656cb6-3b4b-4197-a9d9-7376c2a8d036",
    "project_id": "8cb8eb1f-4ec7-4fb3-a210-cee825f3f288",
    "credit_card_id": "59544bb2-1cd8-482c-9722-0bcb36d0d466",
    "paid_count": 23,
    "total_paid": 175260,
    "status": "active",
    "paid_at": "2017-11-07T17:08:44.93105",
    "next_charge_at": "2017-12-07T17:08:44.93105",
    "amount": 7620,
    "checkout_data": {
      "amount": "7620",
      "customer": {
        "name": "Lorem Roberto",
        "email": "somemail@email.com",
        "phone": {
          "ddd": "21",
          "ddi": "55",
          "number": "933448877"
        },
        "address": {
          "city": "lorem",
          "state": "MG",
          "street": "Rua lorem ipsum",
          "country": "Brasil",
          "zipcode": "33600000",
          "neighborhood": "bairro",
          "complementary": "comple",
          "street_number": "200"
        },
        "document_number": "00000000000"
      },
      "payment_method": "credit_card",
      "is_international": false
    },
    "created_at": "2017-11-07T15:16:47.551915",
    "project_external_id": "34265",
    "reward_external_id": "77669"
  }
]
```

### function source

```sql
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
    payment_service.paid_transition_at(ROW(last_paid_payment.id, last_paid_payment.platform_id, last_paid_payment.project_id, last_paid_payment.user_id, last_paid_payment.subscription_id, last_paid_payment.reward_id, last_paid_payment.data, last_paid_payment.gateway, last_paid_payment.gateway_cached_data, last_paid_payment.created_at, last_paid_payment.updated_at, last_paid_payment.common_contract_data, last_paid_payment.gateway_general_data, last_paid_payment.status, last_paid_payment.external_id, last_paid_payment.error_retry_at)) AS paid_at,
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
    s.search_index
   FROM ((((((payment_service.subscriptions s
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
  WHERE ((s.status <> 'deleted'::payment_service.subscription_status) AND (s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)));
```
