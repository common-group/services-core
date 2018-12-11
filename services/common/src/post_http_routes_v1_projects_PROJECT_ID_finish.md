# POST - /v1/projects/:PROJECT_ID/finish

- Platform:
    Finish a subscription project and cancel all subscriptions


### example request - Platform

```curl
curl -X POST https://api.comum.io/v1/projects/PROJECT_UUID/finish\
  -H 'Authorization: Bearer PLATFORM_API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
{
  	"id":"c51eaff6-f681-41e0-ac01-75e424a4f12a",
	"total_canceled_subscriptions": 2
}
```
