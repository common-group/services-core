# GET - /v1/projects/:PROJECT_ID/subscriptions_per_month

- Scoped/Platform:
    Project subscription per month values

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/subscriptions_per_month\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
  {
    "project_id": "965dc0fd-0844-4dee-a6f9-6d13f085fe0d",
    "total_subscriptions": 5,
    "total_amount": 2467242,
    "new_subscriptions": 5,
    "new_amount": 16352,
    "project_external_id": "",
    "payment_method": "credit_card",
    "month": "2017-11-01"
  },
  {
    "project_id": "965dc0fd-0844-4dee-a6f9-6d13f085fe0d",
    "total_subscriptions": 1,
    "total_amount": 5000,
    "new_subscriptions": 1,
    "new_amount": 2000,
    "project_external_id": "",
    "payment_method": "boleto",
    "month": "2017-12-01"
  }
]
```
