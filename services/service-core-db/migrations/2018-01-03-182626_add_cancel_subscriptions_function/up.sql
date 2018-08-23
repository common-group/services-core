-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.cancel_subscriptions()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _subscription payment_service.subscriptions;
            _result json;
            _affected_subscriptions_ids uuid[];
            _total_affected_subscriptions integer default 0;
        begin
            -- get all subscriptions that canceling and already passed the time to charge
            for _subscription in (select s.* from payment_service.subscriptions s
                left join lateral (
                    select cp.* from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and cp.status in ('refused', 'paid')
                        order by cp.created_at desc limit 1
                ) as last_payment on true
                where s.status = 'canceling'
                    and last_payment.created_at + (core.get_setting('subscription_interval'))::interval < now())
            loop 
                -- transition subscription to canceled 
                if payment_service.transition_to(_subscription, 'canceled', row_to_json(_subscription.*)) then
                    _total_affected_subscriptions := _total_affected_subscriptions + 1;
                    _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
                end if;
            end loop;
            
            _result := json_build_object(
                'total_subscriptions_affected', _total_affected_subscriptions,
                'affected_subscriptions_ids', _affected_subscriptions_ids
            );
        
            return _result;    
        end;
    $function$;