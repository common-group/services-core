-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION payment_service.subscriptions_charge()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _subscription payment_service.subscriptions;
            _last_paid_payment payment_service.catalog_payments;
            _new_payment payment_service.catalog_payments;
            _refined jsonb;
            _affected_subscriptions_ids uuid[];
            _card_id text;
            _user community_service.users;
            _total_affected integer;
        begin
            _total_affected := 0;
            -- get all subscriptions that not have any pending payment and last paid payment is over interval
            for _subscription IN (select s.*
                from payment_service.subscriptions s
                left join lateral (
                    -- get last paid payment after interval
                    select
                        cp.*
                    from payment_service.catalog_payments cp
                    where cp.subscription_id = s.id
                        and cp.status = 'paid'
                    order by cp.created_at desc limit 1
                ) as last_paid_payment on true
                left join lateral (
                    -- get last paymnent (sometimes we can have a pending, refused... after a paid)
                    -- and ensure that payment is greater or same that is paid
                    select 
                        cp.*
                    from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and id > last_paid_payment.id
                    order by created_at desc  limit 1
                ) as last_payment on true
                where last_paid_payment.id is not null
                    and (payment_service.paid_transition_at(last_paid_payment.*) + (core.get_setting('subscription_interval'))::interval) <= now()
                    and (last_payment.id is null or last_payment.status in ('refused', 'paid'))
                    -- check only for subscriptions that in paid
                    and s.status in ('active'))
            loop
                select * from payment_service.catalog_payments
                    where subscription_id = _subscription.id
                        and status = 'paid'
                    order by created_at desc limit 1
                    into _last_paid_payment;
                select * from community_service.users
                    where id = _subscription.user_id
                    into _user;
                
                _refined := _subscription.checkout_data;
                
                -- set customer name/email/document number from user
                if (_user.data ->> 'name') is not null then
                    _refined := jsonb_set(_refined, '{customer,name}', to_jsonb((_user.data->>'name')::text));
                end if;

                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb((_user.email)::text));

                if _user.data ->> 'document_number' is not null then
                    _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb((_user.data->>'document_number')::text));
                end if;

                
                -- check if last payment method is credit card
                if (_refined ->> 'payment_method')::text = 'credit_card' then
                    -- replace card_id with last gateway general data card_id
                    select gateway_data->>'id'::text from payment_service.credit_cards
                        where id = _subscription.credit_card_id
                        into _card_id;
                    
                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_card_id));
                    _refined := _refined - 'card_hash';                    
                end if;
            
                if _refined is not null then
                    insert into payment_service.catalog_payments(gateway, platform_id, project_id, user_id, subscription_id, data)
                        values (_last_paid_payment.gateway, _subscription.platform_id, _subscription.project_id, _subscription.user_id, _subscription.id, _refined)
                        returning * into _new_payment;
                        
                    perform pg_notify('process_payments_channel', 
                        json_build_object('id', _new_payment.id, 'subscription_id', _subscription.id)::text);
                        
                    _total_affected := _total_affected + 1;
                    _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);                    
                end if;
            end loop;
            
            _result := json_build_object(
                'total_affected', _total_affected,
                'affected_ids', _affected_subscriptions_ids
            );
            
            return _result;
        end;
    $function$;