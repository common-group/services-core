-- Your SQL goes here
create or replace function payment_service.paid_transition_at(payment payment_service.catalog_payments) returns timestamp
    language sql
    stable
    as $$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'paid'::payment_service.payment_status
            order by id desc limit 1;
    $$;

CREATE OR REPLACE FUNCTION payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;

            -- generate a new subscription status transition
            insert into payment_service.subscription_status_transitions (subscription_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the subscription status
            update payment_service.subscriptions
                set status = $2
                where id = $1.id;

            return true;
        end;
    $function$
;


CREATE OR REPLACE FUNCTION payment_service.subscriptions_charge(time_interval interval DEFAULT '1 mon'::interval)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _subscription payment_service.subscriptions;
            _last_paid_payment payment_service.catalog_payments;
            _new_payment payment_service.catalog_payments;
            _refined jsonb;
            _affected_subscriptions_ids bigint[];
            _total_affected integer;
        begin
            _total_affected := 0;
            -- get all subscriptions that not have any pending payment and last paid payment is over interval
            for _subscription IN (select s.*
                from payment_service.subscriptions s
                left join lateral (
                    select
                        cp.*
                    from payment_service.catalog_payments cp
                    where (payment_service.paid_transition_at(cp) + $1::interval) <= now()
                        and cp.subscription_id = s.id
                        and cp.status = 'paid'
                    order by id desc limit 1
                ) as last_paid_payment on true
                left join lateral (
                    select 
                        cp.*
                    from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                    order by id desc  limit 1
                ) as last_payment on true
                where last_paid_payment.id is not null
                    and last_payment.status <> 'pending'
                    and s.status in ('active', 'inactive'))
            loop
                select * from payment_service.catalog_payments
                    where subscription_id = _subscription.id
                        and status = 'paid'
                    order by id desc limit 1
                    into _last_paid_payment;
                
                -- check if last paid payment is boleto or credit card
                _total_affected := _total_affected + 1;
                _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
                
                _refined := _last_paid_payment.data;
    
                -- check if last payment method is credit card
                if (_refined ->> 'payment_method')::text = 'credit_card' then
                    -- replace card_id with last gateway general data card_id
                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb((_last_paid_payment.gateway_general_data->>'card_id')::text));
                    _refined := _refined - 'card_hash';
                end if;
                
                insert into payment_service.catalog_payments(gateway, platform_id, project_id, user_id, subscription_id, data)
                    values (_last_paid_payment.gateway, _subscription.platform_id, _subscription.project_id, _subscription.user_id, _subscription.id, _refined)
                    returning * into _new_payment;
                    
                perform pg_notify('process_payments_channel', 
                    json_build_object('id', _new_payment.id, 'subscription_id', _subscription.id)::text);
            end loop;
            
            _result := json_build_object(
                'total_affected', _total_affected,
                'affected_ids', _affected_subscriptions_ids
            );
            
            return _result;
        end;
    $function$
;