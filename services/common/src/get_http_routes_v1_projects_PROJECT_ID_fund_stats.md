# GET - /v1/projects/:PROJECT_ID/fund_stats

- Anonymous/Scoped/Platform:
    Project fund stats (for subscription projects only)

### example request - Anonymous

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/fund_stats\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json'
```

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/fund_stats\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
{
	"amount_paid_for_valid_period": 96141.31,
	"total_subscriptions": 7,
	"total_subscribers": 7,
	"new_percent": 14.2857142857143,
	"returning_percent": 85.7142857142857
}
```
