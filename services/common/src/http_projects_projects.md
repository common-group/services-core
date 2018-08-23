# List projects

| GET `/projects` | **required roles:** `platform_user` |
| :--- | :--- |


### example request

```curl
curl -X GET 'https://sandbox.api.project.comum.io/projects?limit=1' \
-H 'authorization: Bearer API_KEY' \
-H 'cache-control: no-cache'
```

### example result

```json
[
  {
    "id": "d73ee292-73e7-45c2-bf5d-33cd7b0e2d4f",
    "external_id": "",
    "user_id": "61c5e1d4-45ba-44cc-97d6-6f3691ee5850",
    "permalink": "lorem_amenori_ipsum_3144",
    "mode": "sub",
    "name": "lorem amenori ipsum"
  }
]
```

### function source

```sql
CREATE OR REPLACE VIEW "project_service_api"."projects" AS 
 SELECT p.id,
    p.external_id,
    p.user_id,
    p.permalink,
    p.mode,
    p.name
   FROM project_service.projects p
  WHERE ((p.platform_id = core.current_platform_id()) AND core.has_any_of_roles('{platform_user}'::text[]));
```
