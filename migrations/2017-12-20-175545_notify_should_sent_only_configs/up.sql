-- Your SQL goes here
CREATE OR REPLACE FUNCTION notification_service.notify(label text, data json)
 RETURNS notification_service.notifications
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _notification_template notification_service.notification_templates;
            _notification_global_template notification_service.notification_global_templates;
            _notification notification_service.notifications;
            _mail_config jsonb;
            _data jsonb;
        begin
            select * from community_service.users
                where id = ($2 -> 'relations' ->>'user_id')::uuid 
                into _user;
            if _user.id is null then
                raise 'user_id not found';
            end if;
            
            select nt.* from notification_service.notification_templates nt  
                where nt.platform_id = _user.platform_id
                    and nt.label = $1
                    into _notification_template;

            if _notification_template is null then
                select ngt.* from notification_service.notification_global_templates ngt
                    where ngt.label = $1
                    into _notification_global_template;

                if _notification_global_template is null then
                    return null;
                end if;
            end if;

            _mail_config := json_build_object(
                'to', _user.email,
                'from', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                'from_name', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                'reply_to', coalesce((($2)->'mail_config'->>'reply_to')::text, core.get_setting('system_email'))
            )::jsonb;
            
            _data := jsonb_set(($2)::jsonb, '{mail_config}'::text[], _mail_config);
            _data := jsonb_set(_data, '{template_vars}'::text[], notification_service._generate_template_vars_from_relations((_data ->> 'relations')::json)::jsonb);

            insert into notification_service.notifications
                (platform_id, user_id, notification_template_id, notification_global_template_id, deliver_at, data)
            values (_user.platform_id, _user.id, _notification_template.id, _notification_global_template.id, coalesce(($2->>'deliver_at')::timestamp, now()), _data)
            returning * into _notification;

            if _notification.deliver_at <= now() and ($2->>'supress_notify') is null then
                perform pg_notify('dispatch_notifications_channel', 
                    json_build_object(
                        'id', _notification.id,
                        'mail_config', json_build_object(
                            'to', _user.email,
                            'from', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'from_name', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'reply_to', coalesce((($2)->'mail_config'->>'reply_to')::text, core.get_setting('system_email'))
                        )
                    )::text);
            end if;

            return _notification;
        end;
    $function$;
