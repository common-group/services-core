# Listing notification templates

**GET** `/notification_templates` | **required roles:** `scoped_user (admin)/platform_user`


### example request

```bash
curl -X GET 'https://sandbox.api.notification.comum.io/notification_templates' \
    -H 'authorization: Bearer API_KEY' \
    -H 'cache-control: no-cache'
```

### example result

```json
[
    {
        "label": "paid_subscription_payment",
        "subject": null,
        "template": null,
        "created_at": null,
        "default_subject": "subject {{project_name}}",
        "default_template": "template {{var}}"
    }
]
```

## function source

```sql
CREATE OR REPLACE VIEW "notification_service_api"."notification_templates" AS 
 SELECT ngt.label,
    nt.subject,
    nt.template,
    nt.created_at,
    ngt.subject AS default_subject,
    ngt.template AS default_template
   FROM (notification_service.notification_global_templates ngt
     LEFT JOIN notification_service.notification_templates nt ON (((nt.label = ngt.label) AND (nt.platform_id = core.current_platform_id()) AND (nt.deleted_at IS NULL))))
  WHERE (core.has_any_of_roles('{platform_user,scoped_user}'::text[]) AND
        CASE
            WHEN ("current_user"() = 'scoped_user'::name) THEN (COALESCE(core.current_user_scopes(), '{}'::jsonb) ? 'admin'::text)
            ELSE true
        END);
```




