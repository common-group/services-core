# List saved credit cards

List all favorited credit cards used for user.

when platform user can see more details about usage.
when scoped user can only see the credit cards that he owns.

| GET `/saved_credit_cards` | **required roles:** `scoped_user` or `platform_user` |
| :--- | :--- |


### example request

```curl
curl -X GET 'https://sandbox.api.payment.comum.io/saved_credit_cards?limit=1' \
  -H 'authorization: Bearer API_KEY' \
  -H 'cache-control: no-cache'
```

### example result

```json
[{
    "id": "92451a80-1272-49a1-9dda-30b8ce1f6ad1",
    "user_id": "f0943f6f-5918-4109-b997-5af0d5a0cbce",
    "gateway": "pagarme",
    "in_gateway": true,
    "gateway_data": {
        "brand": "mastercard",
        "valid": true,
        "country": "BR",
        "holder_name": "LOREM I AMENORI",
        "last_digits": "1111",
        "first_digits": "411111",
        "expiration_date": "0123"
    },
    "data": null,
    "created_at": "2018-05-04T15:28:19.894164"
}]
```

### function source

```sql
CREATE OR REPLACE VIEW "payment_service_api"."saved_credit_cards" AS 
 SELECT card.id,
    card.user_id,
    card.gateway,
    ((card.gateway_data ->> 'id'::text) IS NOT NULL) AS in_gateway,
        CASE "current_user"()
            WHEN 'platform_user'::name THEN card.gateway_data
            ELSE (((((card.gateway_data-  'id'::text) - 'object'::text) - 'date_created'::text) - 'date_updated'::text) - 'fingerprint'::text)
        END AS gateway_data,
        CASE "current_user"()
            WHEN 'platform_user'::name THEN card.data
            ELSE NULL::jsonb
        END AS data,
    card.created_at
   FROM payment_service.credit_cards card
  WHERE (card.saved_in_process 
        AND (card.platform_id = core.current_platform_id()) AND
        CASE "current_user"()
            WHEN 'platform_user'::name THEN true
            ELSE (card.user_id = core.current_user_id())
        END)
    order by card.created_at desc;
```
