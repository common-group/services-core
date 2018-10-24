# PUT - /v1/projects/:PROJECT_ID/rewards/:REWARD_ID

- Scoped/Platform:

    Update a reward data

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| reward.external_id | string | **not required** | unique reference id |
| reward.title | string | **not required** | reward.title |
| reward.description| string | **required** | reward description |
| reward.minimum_value | number | **required** | reward amount *100 ex R$ 10 = (1000)|
| reward.maximum_contributions| number | **not required** | maximum contributions, limit a reward|
| reward.shipping_options| string | **required** | reward shipping_option |
| reward.deliver_at | datetime | **required** | reward deliver estimative date |
| reward.row_order | number | **not required** | reward row order for print on sidebar |
| reward.welcome_message_subject | string | **not required** | reward welcome message to sent to contributors|
| reward.welcome_message_body | string | **not required** | reward welcome message body to sent to contributors|


### example request - Platform/Scoped

```curl
curl -X PUT https://api.comum.io/v1/projects/PROJECT_UUID/rewards/REWARD_UUID\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json' \
  -d '{ 
	  "reward": {
		   "external_id":105633,
		   "minimum_value":"20000.0",
		   "maximum_contributions":0,
		   "shipping_options":"free",
		   "deliver_at": "2017-12-01T18:17:08",
		   "row_order":0,
		   "title":"lorem amenori",
		   "welcome_message_subject":null,
		   "welcome_message_body":null,
		   "description":"fooo 200"
	  }
  }'
```

### example result

```json
{
	"reward_id": "REWARD_UUID",
}
```
