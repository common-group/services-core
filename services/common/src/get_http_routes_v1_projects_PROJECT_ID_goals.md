# GET - /v1/projects/:PROJECT_ID/goals

- Anonymous/Scoped/Platform:

    List goals of project

### example request - Anonymous

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/goals\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json'
```

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/goals\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
	{
		"id": "b8060a2f-3cc4-433b-b714-f543507e4465",
			"external_id": null,
			"project_id": "52963555-e8f3-4971-a201-90a976d679fd",
			"data": {
				"title": "; foooo",
				"value": "100.0",
				"description": "foo"
			},
			"metadata": null,
			"created_at": "2018-10-24T18:24:10.007175",
			"updated_at": "2018-10-24T18:24:10.007175"
	}
]
```
