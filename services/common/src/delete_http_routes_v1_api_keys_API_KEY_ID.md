# DELETE - /v1/api_keys/:API_KEY_ID

- Platform|Scoped:
    Disable a user api key

### example request

```curl
curl -X DELETE https://api.comum.io/v1/api_keys/:API_KEY_ID\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
{
	"message": "api key disabled"
}
```
