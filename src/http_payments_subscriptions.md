# List subscriptions

List all subscriptions from current platform.
When platform user can see all subscriptions.
When scoped user can see only the subscriptions that he made and another users made on projects that he own.

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
        "id":"4cae87ef-b283-473b-b52e-66fb4573044f",
        "project_id":"a59406df-0b99-45db-80ad-9100ccee2cad",
        "credit_card_id":"7ba03c96-8d7e-4b78-a820-d9a11b1e38af",
        "paid_count":0,
        "total_paid":null,
        "status":"started",
        "paid_at":null,
        "next_charge_at":null,
        "checkout_data":{
            "amount": "2000", 
            "customer": {
                "name": "Lorem ipsum", 
                "email": "lorem@ipsum.com", 
                "phone": {
                    "ddd": "31",
                    "ddi": "55",
                    "number": "987656655"
                }, 
                "address": {
                    "city": "Lorem city", 
                    "state": "MG", 
                    "street": "Rua lorem ipsum", 
                    "country": "Brasil", 
                    "zipcode": "33601-080", 
                    "neighborhood": "Manoeri", 
                    "complementary": "", 
                    "street_number": "28"
                }, 
                "document_number": "02683410645"
            }, 
            "anonymous": false, 
            "payment_method": "credit_card", 
            "is_international": false, 
            "credit_card_owner_document": "02683410645"
        },
        "created_at":"2018-06-20T16:55:41.043751",
        "user_id":"064a9ef8-af18-4b73-ac17-d13de2f0b2bf",
        "reward_id":"059943bd-56bd-4599-9f76-ba687969ddcc",
        "amount":2000,
        "project_external_id":"55608",
        "reward_external_id":"105634",
        "user_external_id":"745100",
        "payment_method":"credit_card",
        "last_payment_id":"f003cecc-57a6-48fa-97b1-cce0c9b33f5e",
        "last_paid_payment_id":null,
        "last_paid_payment_created_at":null,
        "user_email":"lorem@ipsum.com",
        "search_index":"null",
        "current_paid_subscription":null,
        "current_reward_data":null,
        "current_reward_id":null,
        "last_payment_data": {
            "id": "f003cecc-57a6-48fa-97b1-cce0c9b33f5e",
            "created_at":"2018-06-20T16:55:41.043751",
            "status": "refused",
            "refused_at":"2018-06-20T16:55:41.043751",
            "retry_at":"2018-06-24T16:55:41.043751",
            "payment_method": "credit_card"
        },
        "last_paid_payment_data": {
            "id": "null",
            "created_at":"null",
            "status": "null",
            "payment_method": "null"
        }
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
```
