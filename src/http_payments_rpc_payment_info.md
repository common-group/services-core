# Get payment info

| **POST** `/rpc/payment_info` | **required roles:**`platform_user/scoped_user` |
| :--- | :--- |


### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| id | uuid | **required** | payment uuid |

###

### example request

```curl
curl -X POST https://sandbox.api.payment.comum.io/rpc/payment_info \
-H 'cache-control: no-cache' \
-H 'content-type: application/json' \
-H 'authorization: Bearer API_TOKEN' \
-d '{ "id": "PAYMENT_UUID" }'
```

### example result

```json
{
  "id": "a5d918d3-6dda-4e95-a910-38362b1ed08d",
  "subscription_id": null,
  "user_id": "e5d19d74-5ad4-476f-aa2a-d71a78a9bac0",
  "status": "paid",
  "gateway_errors": null,
  "created_at": "2017-11-03T19:44:26.457327",
  "boleto_url": null,
  "boleto_barcode": null,
  "boleto_expiration_date": null,
  "gateway_refuse_reason": null,
  "gateway_status_reason": "acquirer",
  "card_brand": "visa",
  "card_country": "UNITED STATES",
  "card_first_digits": "411111",
  "card_last_digits": "1111",
  "gateway_payment_method": "credit_card"
}
```

### function source

```sql
CREATE OR REPLACE FUNCTION payment_service_api.payment_info(id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');
            
            -- build json based on payment found with given id
            select 
                json_build_object(
                    'id', cp.id,
                    'subscription_id', cp.subscription_id,
                    'user_id', cp.user_id,
                    'status', cp.status,
                    'gateway_errors', (case cp.status when 'error' then cp.gateway_cached_data else null::jsonb end),
                    'created_at', cp.created_at,
                    'boleto_url', cp.gateway_general_data ->> 'boleto_url',
                    'boleto_barcode', cp.gateway_general_data ->> 'boleto_barcode',
                    'boleto_expiration_date', cp.gateway_general_data ->> 'boleto_expiration_date',
                    'gateway_refuse_reason', cp.gateway_general_data ->> 'gateway_refuse_reason', 
                    'gateway_status_reason', cp.gateway_general_data ->> 'gateway_status_reason',
                    'card_brand', cp.gateway_general_data ->> 'card_brand',
                    'card_country', cp.gateway_general_data ->> 'card_country',
                    'card_first_digits', cp.gateway_general_data ->> 'card_first_digits',
                    'card_last_digits', cp.gateway_general_data ->> 'card_last_digits',
                    'gateway_payment_method', cp.gateway_general_data ->> 'gateway_payment_method'
                )
                from payment_service.catalog_payments cp
                    where cp.id = $1
                        and cp.platform_id = core.current_platform_id()
                        and core.is_owner_or_admin(cp.user_id)
                into _result;
            
            if _result is null then
                raise undefined_function;
            end if;

            return _result;
        end;
    $function$
```
