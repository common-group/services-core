# Get project subscribers stats

**POST** `/rpc/project_subscribers_info` | **required roles:** `scoped_user/platform_user/anonymous` 


### data payload json

+ id (uuid) **required** - Project uuid


### example request

```curl
curl -X POST \
https://sandbox.api.analytics.comum.io/rpc/project_subscribers_info \
-H 'cache-control: no-cache' \
-H 'content-type: application/json' \
-H 'authorization: Bearer API_TOKEN' \
-d '{ "id": PROJECT UUID }'
```

### example result

```json
{
"amount_paid_for_valid_period": 160.6600000000000000,
"total_subscriptions": 6,
"total_subscribers": 3,
"new_percent": 100,
"returning_percent": 0
}
```




