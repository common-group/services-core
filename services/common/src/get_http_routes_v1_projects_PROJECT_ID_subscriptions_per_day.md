# GET - /v1/projects/:PROJECT_ID/subscriptions_per_day

- Scoped/Platform:
    Project subscription per day values

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/subscriptions_per_day\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
	{
		"project_id": "8cc09670-a313-4ab3-b24d-c3aff9c20cb3",
		"source":[
			{
				"paid_at": "2018-07-12",
				"created_at": "2018-07-12",
				"total": 1,
				"total_amount": 10
			},
			{
				"paid_at": "2018-07-13",
				"created_at": "2018-07-13",
				"total": 1,
				"total_amount": 14
			},
		]
	}
]
```
