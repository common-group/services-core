-- This file should undo anything in `up.sql`
delete from notification_service.notification_global_templates;

CREATE OR REPLACE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
            _project project_service.projects;
            _contributors_count integer;
            _contributor community_service.users;
            _project_owner community_service.users;
            _transition payment_service.payment_status_transitions;
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;
            
            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb)
            returning * into _transition;

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2,
                    updated_at = now()
                where id = $1.id;
                
            -- deliver notifications after status changes to paid
            if not exists (
                select true from notification_service.user_catalog_notifications n
                    where n.user_id = $1.user_id
                        and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                        and n.label = 'paid_subscription_payment'
            ) and $2 = 'paid' and $1.subscription_id is not null then 
                -- get project from payment
                select * from project_service.projects
                    where platform_id = $1.platform_id
                        and id = $1.project_id
                into _project;
                -- get contributor from payment
                select * from community_service.users
                    where platform_id = $1.platform_id
                        and id = $1.user_id
                into _contributor;
                -- get project_owner from project
                select * from community_service.users
                    where platform_id = $1.platform_id
                        and id = _project.user_id
                into _project_owner;                
                
                -- get count of contributors
                select count(1) from payment_service.catalog_payments
                    where platform_id = $1.platform_id
                        and project_id = $1.project_id
                        and id <> $1.id
                    into _contributors_count;
                
                
                perform notification_service.notify('paid_subscription_payment', json_build_object(
                    'relations', json_build_object(
                        'catalog_payment_id', $1.id,
                        'subscription_id', $1.subscription_id,
                        'project_id', $1.project_id,
                        'reward_id', $1.reward_id,
                        'user_id', $1.user_id
                    ),
                    'template_vars', json_build_object(
                        'project_name', (_project.data->>'name')::text,
                        'project_permalink', _project.permalink,
                        'contributors_count', _contributors_count,
                        'user_name', (_contributor.data->>'name')::text,
                        'user_document', (_contributor.data->>'document_number')::text,
                        'payment_confirmed_at', _transition.created_at,
                        'payment_amount', (($1.data->>'amount')::decimal/100)::decimal,
                        'payment_id', $1.id,
                        'project_owner_name', (_project_owner.data->>'name')::text,
                        'project_owner_document', (_project_owner.data->>'document_number')::text,
                        'project_owner_email', _project_owner.email
                    )
                ));
            end if;
            

            return true;
        end;
    $function$;

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

            insert into notification_service.notifications
                (platform_id, user_id, notification_template_id, notification_global_template_id, deliver_at, data)
            values (_user.platform_id, _user.id, _notification_template.id, _notification_global_template.id, coalesce(($2->>'deliver_at')::timestamp, now()), _data)
            returning * into _notification;

            if _notification.deliver_at <= now() and ($2->>'supress_notify') is null then
                perform pg_notify('dispatch_notifications_channel', 
                    json_build_object(
                        'id', _notification.id,
                        'subject_template', coalesce(_notification_template.subject, _notification_global_template.subject),
                        'mail_config', json_build_object(
                            'to', _user.email,
                            'from', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'from_name', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'reply_to', coalesce((($2)->'mail_config'->>'reply_to')::text, core.get_setting('system_email'))
                        ),
                        'content_template', coalesce(_notification_template.template, _notification_global_template.template),
                        'template_vars', ($2->>'template_vars')::json
                    )::text);
            end if;

            return _notification;
        end;
    $function$;
drop function notification_service._generate_template_vars_from_relations(json);
DROP FUNCTION payment_service.chargedback_transition_at(payment payment_service.catalog_payments);
DROP FUNCTION payment_service.refunded_transition_at(payment payment_service.catalog_payments);
DROP FUNCTION payment_service.refused_transition_at(payment payment_service.catalog_payments);
