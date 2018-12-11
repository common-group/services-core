# POST - /v1/users/logout

- Scoped user:
    Expires a temp login user api key for current user
- Platform:
    Expires a temp login user api key for user.id

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| user.id| string | **required** for platform_user | user id |


### example request - Scoped

```curl
curl -X POST https://api.comum.io/v1/users/logout\
  -H 'Authorization: Bearer USER_API_KEY' \
  -H 'content-type: application/json'
```

### example request - Platform

```curl
curl -X POST https://api.comum.io/v1/users/logout\
  -H 'Authorization: Bearer PLATFORM_API_KEY' \
  -H 'content-type: application/json' \
  -d '{
    "user": {
      "id": "platform-community-user-uuid",
    }
  }'
```

### example result

```json
{
	"message": "1 temp_login_api_keys expired"
}
```
