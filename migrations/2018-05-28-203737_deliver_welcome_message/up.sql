-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
            _last_payment payment_service.catalog_payments;
            _project project_service.projects;
            _relations_json json;
        begin
            -- check if to state is same from state or deleted, should return false
            if $1.status = $2 or $1.status = 'deleted' then
                return false;
            end if;

            -- get then subscription project
            select * from project_service.projects p 
                where p.id = $1.project_id 
                and p.platform_id = $1.platform_id
                into _project;


            -- generate a new subscription status transition
            insert into payment_service.subscription_status_transitions (subscription_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the subscription status
            update payment_service.subscriptions
                set status = $2
                where id = $1.id;

            -- get last payment
            select * from payment_service.catalog_payments
                where subscription_id = $1.id order by created_at desc limit 1
                into _last_payment;

            if _project.status not in ('rejected', 'failed', 'successful') then
                -- build relations json
                _relations_json := json_build_object(
                    'relations', json_build_object(
                        'catalog_payment_id', _last_payment.id,
                        'subscription_id', $1.id,
                        'project_id', $1.project_id,
                        'reward_id', $1.reward_id,
                        'user_id', $1.user_id
                    )
                );

                -- deliver notifications based on status
                case $2
                when 'active' then
                    if not exists (
                        select true from notification_service.user_catalog_notifications n
                            where n.user_id = $1.user_id
                                and (n.data -> 'relations' ->> 'subscription_id')::uuid = $1.id
                                and n.label = 'reward_welcome_message'
                    ) and $1.id is not null then 
                        perform notification_service.notify('reward_welcome_message', _relations_json);
                    end if;
                when 'inactive' then
                    -- check if is comming from canceled / canceling subscription
                    if  $1.status not in ('canceling', 'canceled') then
                        -- deliver notifications after status changes to inactive
                        perform notification_service.notify('inactive_subscription', _relations_json);
                    end if;
                when 'canceling' then
                -- deliver notifications after status changes to inactive
                    perform notification_service.notify('canceling_subscription', _relations_json);
                when 'canceled' then
                    perform notification_service.notify('canceled_subscription', _relations_json);
                else
                end case;
            end if;

            return true;
        end;
    $function$
