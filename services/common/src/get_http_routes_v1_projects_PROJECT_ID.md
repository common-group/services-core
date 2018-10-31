# GET - /v1/projects/:PROJECT_ID

- Anonymous/Scoped/Platform:

    Get project details

### example request - Anonymous

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json'
```

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
{
  "id": "a59406df-0b99-45db-80ad-9100ccee2cad",
  "external_id": "55608",
  "user_id": "2d0763eb-c6dc-4b35-89ce-c16c1859c39c",
  "permalink": "subtest",
  "mode": "sub",
  "name": "Teste sub"
}
```
