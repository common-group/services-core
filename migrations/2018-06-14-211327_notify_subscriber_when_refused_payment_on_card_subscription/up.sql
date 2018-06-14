-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
            _project project_service.projects;
            _contributors_count integer;
            _contributor community_service.users;
            _project_owner community_service.users;
            _notification_relations json;
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;

            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2,
                    updated_at = now()
                where id = $1.id;

            -- build notification relations object
            _notification_relations := json_build_object(
                'relations', json_build_object(
                    'catalog_payment_id', $1.id,
                    'subscription_id', $1.subscription_id,
                    'project_id', $1.project_id,
                    'reward_id', $1.reward_id,
                    'user_id', $1.user_id
                )
            );

            case $2
            when 'paid' then
                -- deliver paid subscription payment
                if $1.subscription_id is not null
                    and not exists (
                        select true from notification_service.user_catalog_notifications n
                            where n.user_id = $1.user_id
                            and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                            and n.label = 'paid_subscription_payment'
                    )
                then
                    perform notification_service.notify('paid_subscription_payment', _notification_relations);
                end if;
            when 'refused' then
                -- deliver refused notification card subscription
                if ($1.data->>'payment_method')::text = 'credit_card'
                    and $1.subscription_id is not null
                    and not exists (
                        select true from notification_service.user_catalog_notifications n
                            where n.user_id = $1.user_id
                            and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                            and n.label = 'refused_subscription_card_payment'
                    )
                then
                    perform notification_service.notify('refused_subscription_card_payment', _notification_relations);
                end if;
            else
            end case;

            return true;
        end;
    $function$
;
grant select on notification_service.user_catalog_notifications to scoped_user, platform_user;