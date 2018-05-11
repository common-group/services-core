-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION payment_service.refuse_expired_slip_payments()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _payment payment_service.catalog_payments;
            _last_subscription_payment payment_service.catalog_payments;
            _last_paid_subscription_payment payment_service.catalog_payments;
            _subscription payment_service.subscriptions;
            _result json;
            _affected_subscriptions_ids uuid[];
            _total_affected_subscriptions integer default 0;
            _affected_payments_ids uuid[];
            _total_affected_payments integer default 0;        
        begin
            -- get all boleto that already expired +3 days from expiration date
            for _payment in (select cp.*
                from payment_service.catalog_payments cp
                where data ->> 'payment_method' = 'boleto' and cp.status = 'pending'
                    and (cp.gateway_general_data ->> 'boleto_expiration_date')::timestamp is not null
                    and core.weekdays_from(3, (cp.gateway_general_data ->> 'boleto_expiration_date')::timestamp) < now()
            )
            loop 
                -- if payment is from subscription
                if _payment.subscription_id is not null then
                    -- get last payment from subscription
                    select * from payment_service.catalog_payments
                        where subscription_id = _payment.subscription_id
                            order by created_at desc limit 1
                            into _last_subscription_payment;
                    -- get last paid payment from subscription
                    select * from payment_service.catalog_payments
                        where subscription_id = _payment.subscription_id
                            and status = 'paid'
                            order by created_at desc limit 1
                            into _last_paid_subscription_payment;                    
        
                    -- get subscription
                    select * from payment_service.subscriptions
                        where id = _payment.subscription_id
                        into _subscription;
                end if;
                
                -- transition payment to refused 
                if payment_service.transition_to(_payment, 'refused', row_to_json(_payment.*)) then
                    _total_affected_payments := _total_affected_payments + 1;
                    _affected_payments_ids := array_append(_affected_payments_ids, _payment.id);
                    
                    -- if payment is the same of last_payment
                    if _payment.id = _last_subscription_payment.id 
                        and _last_paid_subscription_payment.id is null OR (
                            _last_paid_subscription_payment.created_at + (core.get_setting('subscription_interval'))::interval
                        ) <= now()
                    then
                        -- then transition subscription to inactive too
                        if payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription.*)) then
                            _total_affected_subscriptions := _total_affected_subscriptions + 1;
                            _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);                
                        end if;
                    end if;
                end if;
            end loop;
            
            _result := json_build_object(
                'total_subscriptions_affected', _total_affected_subscriptions,
                'affected_subscriptions_ids', _affected_subscriptions_ids,
                'total_payments_affected', _total_affected_payments,
                'affected_payments_ids', _affected_payments_ids                
            );

            return _result;    
        end;
    $function$
