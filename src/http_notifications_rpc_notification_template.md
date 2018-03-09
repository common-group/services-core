# Edit notification template

**POST** `/rpc/notification_template` | **required roles:** `scoped_user (admin)/platform_user` 

### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| label | string | **required** | the label of notification that should be changed |
| subject | string | **required** | subject of notification |
| template | string | **required** | body content of notification |


### example request

```bash
curl -X POST https://sandbox.api.notification.comum.io/rpc/notification_template \
    -H 'authorization: Bearer API_KEY' \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -d '{
        "data": {
            "label": "paid_subscription_payment",
            "subject": "changed subject {{project_name}}",
            "template": "<p>changed template {{project_name}}</p>"
        }
    }'
```

### example result

```json
{
    "label": "paid_subscription_payment",
    "subject": "changed subject {{project_name}}",
    "template": "<p>changed template {{project_name}}</p>",
    "created_at": "2017-12-01T00:46:02.790218",
    "updated_at": "2017-12-01T00:46:02.790218"
}
```






## function source


```sql
CREATE OR REPLACE FUNCTION notification_service_api.notification_template(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _notification_template notification_service.notification_templates;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            -- only scoped users with admin scope can execute this function
            if current_user = 'scoped_user' and not (COALESCE(core.current_user_scopes(), '{}'::jsonb) ? 'admin'::text) then
                raise insufficient_privilege;
            end if;
            
            -- check if label exists on global templates
            if not exists (
                select true from notification_service.notification_global_templates
                    where label = lower(($1->>'label')::text)
            ) then
                raise 'template not found';
            end if;
            
            -- get notification template with same label
            select
                *
            from notification_service.notification_templates
                where label = lower(($1->>'label')::text)
                    and platform_id = core.current_platform_id()
                into _notification_template;
                
            -- if has notification template update then 
            if _notification_template.id is not null then
                update notification_service.notification_templates
                    set subject = coalesce(($1->>'subject')::text, _notification_template.subject),
                        template = coalesce(($1->>'template')::text, _notification_template.template),
                        updated_at = now()
                    where
                        id = _notification_template.id
                returning * into _notification_template;
            else 
                -- insert new notification template
                insert into notification_service.notification_templates
                    (platform_id, label, subject, template) values
                    (core.current_platform_id(), ($1->>'label')::text, ($1->>'subject')::text, ($1->>'template')::text)
                returning * into _notification_template;
            end if;
            
            return json_build_object(
                'label', _notification_template.label,
                'subject', _notification_template.subject,
                'template', _notification_template.template,
                'created_at', _notification_template.created_at,
                'updated_at', _notification_template.updated_at
            );
        end;
    $function$

```
