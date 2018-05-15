-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.notify_expiring_slips()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _payment payment_service.catalog_payments;
            _last_subscription_payment payment_service.catalog_payments;
            _subscription payment_service.subscriptions;
            _result json;
            _relations_json json;
            _affected_payments_ids uuid[];
            _total_affected_payments integer default 0;        
        begin
            -- get all slips expiring in the next 24h
            for _payment in (select cp.*
                from payment_service.catalog_payments cp
                where cp.data->>'payment_method' = 'boleto' and cp.status = 'pending'
                    and (cp.gateway_general_data->>'boleto_expiration_date')::timestamp is not null
                    and (cp.gateway_general_data->>'boleto_expiration_date')::timestamp BETWEEN now() and (now() + '24 hours'::interval)
            )
            loop 
                -- if payment is from subscription
                if _payment.subscription_id is not null then
                    -- get last payment from subscription
                    select * from payment_service.catalog_payments
                        where subscription_id = _payment.subscription_id
                            order by created_at desc limit 1
                            into _last_subscription_payment;
        
                    -- get subscription
                    select * from payment_service.subscriptions
                        where id = _payment.subscription_id
                        into _subscription;
                end if;
                
                -- if payment is the same of last_payment
                if _payment.id = _last_subscription_payment.id then
                    if not exists (
                        select true from notification_service.user_catalog_notifications n
                        where n.user_id = _subscription.user_id
                            and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = _payment.id
                            and n.label = 'expiring_slip'
                    ) then 
                        _relations_json := json_build_object(
                        'relations', json_build_object(
                            'catalog_payment_id', _last_subscription_payment.id,
                            'subscription_id', _subscription.id,
                            'project_id', _subscription.project_id,
                            'user_id', _subscription.user_id
                        ));
                        perform notification_service.notify('expiring_slip', _relations_json);
                        _total_affected_payments := _total_affected_payments + 1;
                        _affected_payments_ids := array_append(_affected_payments_ids, _payment.id);
                    end if;
            
                end if;
            end loop;
            
            _result := json_build_object(
                'total_payments_affected', _total_affected_payments,
                'affected_payments_ids', _affected_payments_ids                
            );
        
            return _result;    
        end;
    $function$
