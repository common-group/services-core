#
list rewards

| GET `/rewards` | **required roles:** `platform_user` |
| :--- | :--- |


### example request

```curl
curl -X GET 'https://sandbox.api.project.comum.io/rewards?limit=10&offset=0' \
  -H 'authorization: Bearer API_KEY' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json'
```

### example result

```json
[
  {
    "id": "fbd66979-1709-4b4a-bee8-081f0ba55a0e",
    "external_id": null,
    "project_id": "d73ee292-73e7-45c2-bf5d-33cd7b0e2d4f",
    "data": {
      "title": "foo bar reward",
      "metadata": null,
      "row_order": null,
      "current_ip": "127.0.0.1",
      "deliver_at": null,
      "description": "amenori lorem ipsum dolor sit",
      "minimum_value": 1000,
      "shipping_options": "free",
      "maximum_contributions": 0
     },
     "metadata": null,
     "created_at": "2017-11-16T16:27:31.729255",
     "updated_at": "2017-11-16T16:27:31.729255"
  },
  {
     "id": "463ab9ee-8258-4f6c-9c7e-18f2d73806fb",
     "external_id": "105633",
     "project_id": "d73ee292-73e7-45c2-bf5d-33cd7b0e2d4f",
     "data": {
      "title": "teste foo 2",
      "metadata": null,
      "row_order": 0,
      "current_ip": "::1",
      "deliver_at": "2017-11-01",
      "description": "lore 20",
      "minimum_value": 2000,
      "shipping_options": "free",
      "maximum_contributions": 0
     },
     "metadata": null,
     "created_at": "2017-11-07T18:21:41",
     "updated_at": "2017-11-07T20:21:41.845114"
  }
]
```

### function source

```sql
CREATE OR REPLACE VIEW "project_service_api"."rewards" AS 
 SELECT r.id,
    r.external_id,
    r.project_id,
    r.data,
    ((r.data ->> 'metadata'::text))::jsonb AS metadata,
    r.created_at,
    r.updated_at,
    ( SELECT count(*) AS count
           FROM payment_service.subscriptions s
          WHERE ((s.reward_id = r.id) AND (s.status = 'active'::payment_service.subscription_status))) AS subscribed_count
   FROM project_service.rewards r
  WHERE ((r.platform_id = core.current_platform_id()) AND core.has_any_of_roles('{platform_user,scoped_user,anonymous}'::text[]))
  ORDER BY r.id DESC;
```
