-- Your SQL goes here
create or replace view notification_service.user_catalog_notifications as
    select
        n.id,
        n.platform_id,
        n.user_id,
        coalesce(nt.label, ngt.label) as label,
        ngt.label as global_template_label,
        nt.label as template_label,
        n.data as data,
        n.created_at
    from notification_service.notifications n
        left join notification_service.notification_global_templates ngt
            on ngt.id = n.notification_global_template_id
        left join notification_service.notification_templates nt
            on nt.id = n.notification_template_id
    ;
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
    $function$
;