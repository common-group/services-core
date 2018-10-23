# POST - /v1/api_keys

- Platform|Scoped:
    Creates a new user api key

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| user_id| string | **required** for platform_user | user id |


### example request - Scoped

```curl
curl -X POST https://api.comum.io/v1/api_keys\
  -H 'Authorization: Bearer USER_API_KEY' \
  -H 'content-type: application/json'
```

### example request - Platform

```curl
curl -X POST https://api.comum.io/v1/api_keys\
  -H 'Authorization: Bearer PLATFORM_API_KEY' \
  -H 'content-type: application/json' \
  -d '{
    "user_id": "platform-community-user-uuid",
  }'
```

### example result

```json
{
	"id": "3ab3c88b-b2a1-4647-b189-23d85fe29164",
	"api_key": "user_api_key_edd6b8eab0"
}
```
