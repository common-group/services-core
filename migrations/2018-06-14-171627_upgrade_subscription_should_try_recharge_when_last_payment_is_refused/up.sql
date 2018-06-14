-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service_api.upgrade_subscription(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _subscription payment_service.subscriptions;
        _last_payment payment_service.catalog_payments;
        _new_payment payment_service.catalog_payments;
        _reward project_service.rewards;
        _card payment_service.credit_cards;
        _version payment_service.subscription_versions;
        _refined jsonb;
        _notification_relations json;
    begin

        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');

        -- get subscriptions
        select * from payment_service.subscriptions s
            where core.is_owner_or_admin(s.user_id)
                and s.id = ($1->>'id')::uuid
                and s.platform_id = core.current_platform_id()
                and s.status <> 'deleted'
            into _subscription;

        -- check if subscription is present
        if _subscription.id is null then
            raise 'subscription_not_found';
        end if;

        select * from payment_service.catalog_payments
            where subscription_id = _subscription.id
                order by created_at desc limit 1
                into _last_payment;

        -- check if new value and new reward is compatible
        if ($1->>'reward_id')::uuid is not null then
            select * from project_service.rewards r 
                where r.id = ($1->>'reward_id')::uuid
                    and r.project_id = _subscription.project_id
                    into _reward;

            if (_reward.data ->> 'minimum_value')::decimal > coalesce(
                ($1->>'amount'), 
                (_subscription.checkout_data ->> 'amount')
                )::decimal
            then
                raise 'reward_minimum_amount';
            end if;
        end if;

        -- check if new credit card id is given and is from user
        if ($1->>'credit_card_id')::uuid is not null 
            and coalesce(
                ($1->>'payment_method')::text,
                (_subscription.checkout_data ->> 'payment_method')::text
            ) = 'credit_card' then

            select * from payment_service.credit_cards c
                where c.id = ($1->>'credit_card_id')::uuid
                    and c.user_id = _subscription.user_id
                    and (c.gateway_data->>'id')::text is not null
                into _card;

            if _card.id is null then
                raise 'card_not_enabled';
            end if;
        end if;

        -- generate new refined data with provided data
        _refined := payment_service._serialize_subscription_basic_data($1, _subscription.checkout_data::json);
        
        -- get ip on _refined
        _refined := jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.force_ip_address()));

        -- generate subscription version
        insert into payment_service.subscription_versions (
            subscription_id, data
        ) values ( _subscription.id, row_to_json(_subscription))
        returning * into _version;

        -- should update subscriptions
        update payment_service.subscriptions
            set checkout_data = _refined,
                updated_at = now(),
                reward_id = _reward.id,
                credit_card_id = coalesce(_card.id, credit_card_id)
            where id = _subscription.id
            returning * into _subscription;

        -- move subscription to inactive when trying to reactive a canceled or canceling subscription
        if _subscription.status in ('canceled', 'canceling') then
            perform payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription));
            select * from payment_service.subscriptions where id = _subscription.id into _subscription;
        end if;

        if _subscription.status in('inactive', 'canceled', 'canceling') 
            OR _last_payment.status = 'refused' then
            _new_payment := payment_service.generate_new_catalog_payment(_subscription);
        else
            -- build relations json
            _notification_relations := json_build_object(
                'relations', json_build_object(
                    'catalog_payment_id', _new_payment.id,
                    'subscription_id', _subscription.id,
                    'subscription_old_version_id', _version.id,
                    'project_id', _subscription.project_id,
                    'reward_id', _reward.id,
                    'user_id', _subscription.user_id
                )
            );
            -- sent updated subscription notifications
            perform notification_service.notify('updated_subscription', _notification_relations);
        end if;


        return json_build_object(
            'id', _subscription.id,
            'catalog_payment_id', _new_payment.id,
            'old_subscription_version_id', _version.id
        )::json;
    end;
$function$;