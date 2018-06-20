# Recharge subscription (Oneclick charge)

Make a new charge using current checkout_data when subscription next charge is in past and last payment is refused.
If payment method is boleto, the payment can be pending or refused and needed to boleto expiration date is expired.


| **POST** `/rpc/recharge_subscription` | **required roles:** `scoped_user` or `platform_user` |
| :--- | :--- |


### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| subscription_id | uuid | **required** | ID of subscription |

###

### example request

```curl
curl -X POST https://sandbox.api.payment.comum.io/rpc/recharge_subscription \
  -H 'authorization: Bearer API_TOKEN' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "subscription_id": "c34198c5-f17a-4b0f-a6dd-1eae2a58fdcc"
  }'
```

### example result

```json
{
  "subscription_id": "c34198c5-f17a-4b0f-a6dd-1eae2a58fdcc",
  "catalog_payment_id": "9846fe57-604e-4a04-93b8-8c224f05cb33"
}
```

### function source

```sql
CREATE OR REPLACE FUNCTION payment_service_api.recharge_subscription(subscription_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 VOLATILE
AS $function$
    declare
        _subscription payment_service.subscriptions;
        _recharged_payment payment_service.catalog_payments;
    begin
        -- ensure that roles com from any permitted
        perform core.force_any_of_roles('{platform_user, scoped_user}');

        -- get subscription by id
        select * from payment_service.subscriptions 
            where id = $1 and platform_id = core.current_platform_id()
            into _subscription;

        -- raise error when subscription not found or not from the same user when scoped_user
        if _subscription.id is null OR (
            current_role = 'scoped_user' and not core.is_owner_or_admin(_subscription.user_id)) then
            raise 'subscription_not_found';
        end if;
        
        -- try recharge payment
        _recharged_payment := payment_service.recharge_subscription(_subscription);
        
        return json_build_object(
            'catalog_payment_id', _recharged_payment.id,
            'subscription_id', _subscription.id
        );
    end;
$function$;
```
