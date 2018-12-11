# GET - /v1/projects/:PROJECT_ID/rewards

- Anonymous/Scoped/Platform:

    List rewards of project

### example request - Anonymous

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/rewards\
  -H 'Platform-Code: PLATFORM_CODE' \
  -H 'content-type: application/json'
```

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/rewards\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
	{
		"id": "959d300c-f1e3-4878-87d9-1d483bc916c9",
			"external_id": null,
			"project_id": "52963555-e8f3-4971-a201-90a976d679fd",
			"data": {
				"title": "lorem amenori",
				"row_order": 0,
				"created_at": "2017-12-19T18:17:16",
				"current_ip": "127.0.0.1",
				"deliver_at": "2017-12-01T18:17:08",
				"project_id": "52963555-e8f3-4971-a201-90a976d679fd",
				"description": "fooo 200",
				"external_id": 105633,
				"minimum_value": "20000.0",
				"shipping_options": "free",
				"welcome_message_body": null,
				"maximum_contributions": 0,
				"welcome_message_subject": null
			},
			"metadata": null,
			"created_at": "2018-10-24T14:46:09.711701",
			"updated_at": "2018-10-24T14:46:09.711701",
			"subscribed_count": 0
	}
]
```
