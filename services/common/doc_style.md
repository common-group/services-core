# Style guide to write a doc

### HTTP Endpoint:

file name: http_route_name

### Doc template:

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
