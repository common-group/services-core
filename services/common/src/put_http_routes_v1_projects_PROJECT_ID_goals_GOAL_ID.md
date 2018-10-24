# PUT - /v1/projects/:PROJECT_ID/goals/:GOAL_ID

- Scoped/Platform:

    Update goals on project

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| goal.external_id | string | **not required** | unique reference id |
| goal.title | string | **not required** | goal title |
| goal.description| string | **not required** | goal description |
| goal.amount | number | **not required** | goal amount |

### example request - Platform/Scoped

```curl
curl -X PUT https://api.comum.io/v1/projects/PROJECT_UUID/goals/GOAL_UUID\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json' \
  -d '{ 
	  "goal": {
		"external_id": "",
		"value":"100.0",
		"title":"; foooo",
		"description":"foo",
	  }
  }'
```

### example result

```json
{
	"goal_id": "GOAL_ID",
}
```
