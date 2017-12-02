-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION notification_service.notify(label text, data json)
 RETURNS notification_service.notifications
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _notification_template notification_service.notification_templates;
            _notification_global_template notification_service.notification_global_templates;
            _notification notification_service.notifications;
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

            insert into notification_service.notifications
                (platform_id, user_id, notification_template_id, notification_global_template_id, deliver_at, data)
            values (_user.platform_id, _user.id, _notification_template.id, _notification_global_template.id, coalesce(($2->>'deliver_at')::timestamp, now()), ($2)::jsonb)
            returning * into _notification;

            if _notification.deliver_at <= now() and not (($2->>'supress_notify')::boolean) then
                perform pg_notify('dispatch_notifications_channel', json_build_object('id', _notification.id)::text);
            end if;

            return _notification;
        end;
    $function$;