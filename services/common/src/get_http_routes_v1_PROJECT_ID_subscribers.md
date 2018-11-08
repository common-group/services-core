# GET - /v1/projects/:PROJECT_ID/subscribers

- Anonymous/Scoped/Platform:
    Project subscription per day values

### example request - Anonymous

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/subscribers\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json'
```

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/subscribers\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
   {
      "id":"12d31adc-d573-4fb7-81d4-799769380b4d",
      "user_external_id":"686573",
      "project_id":"8cc09670-a313-4ab3-b24d-c3aff9c20cb3",
      "project_external_id":"47590",
      "data":{
         "public_name":null,
         "name":"Branco e Preto Comunicações Ltda.",
         "city":"São Paulo",
         "state":"SP",
         "total_contributed_projects":2,
         "total_published_projects":1
      },
      "status":"active"
   }
]
```
