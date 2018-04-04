# List payments

| GET `/payments` | **required roles:** `scoped_user` or `platform_user` |
| :--- | :--- |


### example request

```curl
curl -X GET 'https://sandbox.api.payment.comum.io/payments?limit=1' \
  -H 'authorization: Bearer API_KEY' \
  -H 'cache-control: no-cache'
```

### example result

```json
[
  {
    "id": "4b76882d-67e1-4da7-ac45-3ddaaaf4f59a",
    "subscription_id": "da484d9e-1df2-491f-868b-8aa7ee52680a",
    "amount": 1500,
    "project_id": "8cb8eb1f-4ec7-4fb3-a210-cee825f3f288",
    "status": "paid",
    "paid_at": "2017-11-07T17:10:10.334637",
    "created_at": "2017-11-07T17:10:07.123768",
    "project_status": "draft",
    "project_mode": "aon",
    "payment_method": "credit_card",
    "billing_data": {
      "name": "Lorem Roberto",
      "email": "somemeail@email.com",
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
      "document_number": "000000000000"
    },
    "payment_method_details": {
      "first_digits": "411111",
      "last_digits": "1111",
      "brand": "visa",
      "country": "UNITED STATES"
    }
  }
]
```

### function source

```sql
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
```
