-- Your SQL goes here
create or replace view notification_service_api.notification_templates as
    select
        ngt.label,
        nt.subject,
        nt.template,
        nt.created_at,
        ngt.subject as default_subject,
        ngt.template as default_template
        from notification_service.notification_global_templates ngt
            left join notification_service.notification_templates nt 
                on nt.label = ngt.label 
                    and nt.platform_id = core.current_platform_id()
                    and nt.deleted_at is null
            where core.has_any_of_roles('{platform_user, scoped_user}'::text[])
                and (case when current_user = 'scoped_user' then ((coalesce(core.current_user_scopes(), '{}'::jsonb)) ? 'admin') 
                    else true end);

grant usage on schema notification_service to scoped_user, platform_user;
grant usage on schema notification_service_api to scoped_user, platform_user;
grant select on notification_service_api.notification_templates to scoped_user, platform_user;


