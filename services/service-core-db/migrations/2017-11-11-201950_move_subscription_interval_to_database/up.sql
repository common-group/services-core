-- Your SQL goes here
DROP FUNCTION payment_service.subscriptions_charge(interval);
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
                
                -- check if last paid payment is boleto or credit card
                _total_affected := _total_affected + 1;
                _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
                
                _refined := _subscription.checkout_data;
                
                -- set customer name/email/document number from user
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb((_user.data->>'name')::text));
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb((_user.data->>'email')::text));
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb((_user.data->>'document_number')::text));
    
                -- check if last payment method is credit card
                if (_refined ->> 'payment_method')::text = 'credit_card' then
                    -- replace card_id with last gateway general data card_id
                    select gateway_data->>'id'::text from payment_service.credit_cards
                        where id = _subscription.credit_card_id
                        into _card_id;
                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_card_id));
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
    $function$;

CREATE OR REPLACE VIEW "payment_service_api"."subscriptions" AS 
 SELECT s.id,
    s.project_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN s.credit_card_id
            ELSE NULL::uuid
        END AS credit_card_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.paid_count
            ELSE NULL::bigint
        END AS paid_count,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.total_paid
            ELSE (NULL::bigint)::numeric
        END AS total_paid,
    s.status,
    payment_service.paid_transition_at(ROW(last_paid_payment.id, last_paid_payment.platform_id, last_paid_payment.project_id, last_paid_payment.user_id, last_paid_payment.subscription_id, last_paid_payment.reward_id, last_paid_payment.data, last_paid_payment.gateway, last_paid_payment.gateway_cached_data, last_paid_payment.created_at, last_paid_payment.updated_at, last_paid_payment.common_contract_data, last_paid_payment.gateway_general_data, last_paid_payment.status, last_paid_payment.external_id)) AS paid_at,
    (payment_service.paid_transition_at(ROW(last_paid_payment.id, last_paid_payment.platform_id, last_paid_payment.project_id, last_paid_payment.user_id, last_paid_payment.subscription_id, last_paid_payment.reward_id, last_paid_payment.data, last_paid_payment.gateway, last_paid_payment.gateway_cached_data, last_paid_payment.created_at, last_paid_payment.updated_at, last_paid_payment.common_contract_data, last_paid_payment.gateway_general_data, last_paid_payment.status, last_paid_payment.external_id)) + (core.get_setting('subscription_interval'))::interval) AS next_charge_at,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN ((((s.checkout_data - 'card_id'::text) - 'card_hash'::text) - 'current_ip'::text) || jsonb_build_object('customer', (((s.checkout_data ->> 'customer'::text))::jsonb || jsonb_build_object('name', (u.data ->> 'name'::text), 'email', (u.data ->> 'email'::text), 'document_number', (u.data ->> 'document_number'::text)))))
            ELSE NULL::jsonb
        END AS checkout_data,
    s.created_at,
    s.user_id,
    s.reward_id
   FROM (((((payment_service.subscriptions s
     JOIN project_service.projects p ON ((p.id = s.project_id)))
     JOIN community_service.users u ON ((u.id = s.user_id)))
     LEFT JOIN LATERAL ( SELECT sum(((cp.data ->> 'amount'::text))::numeric) AS total_paid,
            count(1) FILTER (WHERE (cp.status = 'paid'::payment_service.payment_status)) AS paid_count,
            count(1) FILTER (WHERE (cp.status = 'refused'::payment_service.payment_status)) AS refused_count
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)) stats ON (true))
     LEFT JOIN LATERAL ( SELECT cp.id,
            cp.platform_id,
            cp.project_id,
            cp.user_id,
            cp.subscription_id,
            cp.reward_id,
            cp.data,
            cp.gateway,
            cp.gateway_cached_data,
            cp.created_at,
            cp.updated_at,
            cp.common_contract_data,
            cp.gateway_general_data,
            cp.status,
            cp.external_id
           FROM payment_service.catalog_payments cp
          WHERE ((cp.subscription_id = s.id) AND (cp.status = 'paid'::payment_service.payment_status))
          ORDER BY cp.created_at DESC
         LIMIT 1) last_paid_payment ON (true))
     LEFT JOIN LATERAL ( SELECT cp.id,
            cp.platform_id,
            cp.project_id,
            cp.user_id,
            cp.subscription_id,
            cp.reward_id,
            cp.data,
            cp.gateway,
            cp.gateway_cached_data,
            cp.created_at,
            cp.updated_at,
            cp.common_contract_data,
            cp.gateway_general_data,
            cp.status,
            cp.external_id
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)
          ORDER BY cp.created_at DESC
         LIMIT 1) last_payment ON (true))
  WHERE ((s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)));
