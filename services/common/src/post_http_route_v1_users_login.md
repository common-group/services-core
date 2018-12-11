# POST - /v1/users/login

- Anonymous:
    Creates a temp login user api key with valid email / password user
- Platform:
    Creates a temp login user api key with a valid user.id

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| user.id| string | **required** for platform_user | user id |
| user.email | string | **required** for anonymous | user email |
| user.password | string | **required** for anonymous | user password |


### example request - Anonymous

```curl
curl -X POST https://api.comum.io/v1/users/login\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json' \
  -d '{
    "user": {
      "email": "email@email.com",
      "password": "password",
    }
  }'
```

### example request - Platform

```curl
curl -X POST https://api.comum.io/v1/users/login\
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
    "api_key": "temp_login_api_key_fd89poals871h148ya84124nmasd124lasdnb"
}
```
