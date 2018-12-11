-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.subscriptions_charge()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _subscription payment_service.subscriptions;
            _last_paid_payment payment_service.catalog_payments;
            _new_payment payment_service.catalog_payments;
            _affected_subscriptions_ids uuid[];
            _total_affected integer;
        begin
            _total_affected := 0;
            -- get all subscriptions that not have any pending payment and last paid payment is over interval
            for _subscription IN (select s.*
                from payment_service.subscriptions s
                join project_service.projects p
                    on p.id = s.project_id
                        and p.platform_id = s.platform_id
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
                            and cp.status <> 'deleted'
                            and cp.created_at > last_paid_payment.created_at
                    order by cp.created_at desc limit 1
                ) as last_payment on true
                where last_paid_payment.id is not null
                    and payment_service.next_charge_at(s) <= now()
                    and (last_payment.id is null or last_payment.status in ('paid'))
                    -- check only for subscriptions that in paid
                    and p.status = 'online'
                    and s.status in ('active'))
            loop
                _new_payment := payment_service.generate_new_catalog_payment(_subscription);
                if _new_payment.id is not null then
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
            _should_transit_subscription_to_inactive boolean default true;
            _recharged_payment payment_service.catalog_payments;
            _recharged_payment_ids uuid[];
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
                            and _payment.status <> 'deleted'
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

                    if _subscription.id is not null and _subscription.status not in ('canceling', 'canceled', 'deleted') then
                        if _last_paid_subscription_payment.id is not null then
                            _should_transit_subscription_to_inactive := (
                                select count(1) >= 3
                                from payment_service.catalog_payments 
                                where status in ('refused')
                                    and subscription_id = _last_paid_subscription_payment.subscription_id
                                    and created_at > _last_paid_subscription_payment.created_at
                                    and id <> _last_paid_subscription_payment.id
                            );
                        else
                            _should_transit_subscription_to_inactive := (
                                select count(1) >= 3
                                from payment_service.catalog_payments 
                                where status in ('refused')
                                    and subscription_id = _last_subscription_payment.subscription_id
                                    -- and created_at > _last_subscription_payment.created_at
                                    and id <> _last_subscription_payment.id
                            );
                        end if;

                        -- if payment is the same of last_payment
                        if _payment.id = _last_subscription_payment.id 
                            and _last_paid_subscription_payment.id is null OR (
                                _last_paid_subscription_payment.created_at + (core.get_setting('subscription_interval'))::interval
                            ) <= now()
                        then
                            -- should generate new payment while _should_transit_subscription_to_inactive is false
                            if _should_transit_subscription_to_inactive then
                                if payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription.*)) then
                                    _total_affected_subscriptions := _total_affected_subscriptions + 1;
                                    _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);                
                                end if;
                            else
                                _recharged_payment := payment_service.recharge_subscription(_subscription);
                                _recharged_payment_ids := array_append(_recharged_payment_ids, _recharged_payment.id);
                            end if;
                        end if;
                    end if;
                end if;
            end loop;

            _result := json_build_object(
                'total_subscriptions_affected', _total_affected_subscriptions,
                'affected_subscriptions_ids', _affected_subscriptions_ids,
                'total_payments_affected', _total_affected_payments,
                'affected_payments_ids', _affected_payments_ids,
                'recharged_payment_ids', _recharged_payment_ids
            );

            return _result;
        end;
    $function$;

CREATE OR REPLACE VIEW "payment_service_api"."payments" AS 
 SELECT cp.id,
    cp.subscription_id,
    ((cp.data ->> 'amount'::text))::numeric AS amount,
    cp.project_id,
    cp.status,
    payment_service.paid_transition_at(cp.*) AS paid_at,
    cp.created_at,
    p.status AS project_status,
    p.mode AS project_mode,
    (cp.data ->> 'payment_method'::text) AS payment_method,
        CASE
            WHEN core.is_owner_or_admin(cp.user_id) THEN ((cp.data ->> 'customer'::text))::json
            ELSE NULL::json
        END AS billing_data,
        CASE
            WHEN ((core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)) AND ((cp.data ->> 'payment_method'::text) = 'credit_card'::text)) THEN json_build_object('first_digits', (cp.gateway_general_data ->> 'card_first_digits'::text), 'last_digits', (cp.gateway_general_data ->> 'card_last_digits'::text), 'brand', (cp.gateway_general_data ->> 'card_brand'::text), 'country', (cp.gateway_general_data ->> 'card_country'::text))
            WHEN ((core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)) AND ((cp.data ->> 'payment_method'::text) = 'boleto'::text)) THEN json_build_object('barcode', (cp.gateway_general_data ->> 'boleto_barcode'::text), 'url', (cp.gateway_general_data ->> 'boleto_url'::text), 'expiration_date', ((cp.gateway_general_data ->> 'boleto_expiration_date'::text))::timestamp without time zone)
            ELSE NULL::json
        END AS payment_method_details,
    (cp.gateway_general_data ->> 'gateway_id'::text) AS gateway_id
   FROM (((payment_service.catalog_payments cp
     JOIN project_service.projects p ON ((p.id = cp.project_id)))
     JOIN community_service.users u ON ((u.id = cp.user_id)))
     LEFT JOIN payment_service.subscriptions s ON ((s.id = cp.subscription_id)))
  WHERE ((cp.status <> 'deleted') AND (s.status <> 'deleted'::payment_service.subscription_status) AND (cp.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)))
  ORDER BY cp.created_at DESC;

CREATE OR REPLACE FUNCTION payment_service.automatic_recharge_or_inactive_card_subscriptions()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    _subscription payment_service.subscriptions;
    _last_paid_payment payment_service.catalog_payments;
    _last_payment payment_service.catalog_payments;
    _recharged_payment payment_service.catalog_payments;
    _should_transit_subscription_to_inactive boolean default false;

    _result json;
    _affected_subscriptions_ids uuid[];
    _total_affected_subscriptions integer default 0;
    _recharged_payment_ids uuid[];
begin

for _subscription in (
select
    s.*
from payment_service.subscriptions s
    left join lateral (
        select * from payment_service.catalog_payments cp
            where cp.subscription_id = s.id
            and cp.status <> 'deleted'
            and cp.subscription_id is not null
            order by cp.created_at desc
            limit 1
    ) as lp on true
    where s.status in ('active', 'started')
        and (s.checkout_data ->> 'payment_method')::text = 'credit_card'
        and lp.status = 'refused'
        and ((lp.created_at::date + '4 days'::interval) <= now())
        and (payment_service.next_charge_at(s)) <= now()
)
loop
    _last_paid_payment := null;
    _last_payment := null;
    _should_transit_subscription_to_inactive := false;

    -- get last paid payment from subscription
    select * from payment_service.catalog_payments cp
        where cp.subscription_id = _subscription.id
            and cp.subscription_id is not null
            and cp.status = 'paid'
            order by cp.created_at desc
            limit 1 into _last_paid_payment;

    -- get last payment generated on subscription
    select * from payment_service.catalog_payments cp
        where cp.subscription_id = _subscription.id
            and cp.status <> 'deleted'
            and cp.subscription_id is not null
            order by cp.created_at desc
            limit 1 into _last_payment;

    if _last_paid_payment.id is not null then
        _should_transit_subscription_to_inactive := (
            select count(1) >= 3
            from payment_service.catalog_payments cp
                where cp.subscription_id = _subscription.id
                    and cp.subscription_id is not null
                    and cp.status = 'refused'
                    and cp.created_at > _last_paid_payment.created_at
        );
    else
        _should_transit_subscription_to_inactive := (
            select count(1) >= 3
            from payment_service.catalog_payments cp
                where cp.subscription_id = _subscription.id
                    and cp.subscription_id is not null
                    and cp.status = 'refused'
        );
    end if;

    if _should_transit_subscription_to_inactive then
        perform payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription));

        _total_affected_subscriptions := _total_affected_subscriptions + 1;
        _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
    elsif ((_last_payment.status = 'refused') and ((_last_payment.created_at + '4 days'::interval) < now())) then
        _total_affected_subscriptions := _total_affected_subscriptions + 1;
        _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);

        _recharged_payment := payment_service.recharge_subscription(_subscription);
        _recharged_payment_ids := array_append(_recharged_payment_ids, _recharged_payment.id);
    end if;

end loop;

_result := json_build_object(
    'total_subscriptions_affected', _total_affected_subscriptions,
    'affected_subscriptions_ids', _affected_subscriptions_ids,
    'recharged_payment_ids', _recharged_payment_ids
);

return _result;
end
$function$;

CREATE OR REPLACE FUNCTION payment_service.inactive_invalid_subscriptions()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _subscription payment_service.subscriptions;
        _affected_subscriptions uuid[];
    begin
        for _subscription in (
            select s.* from payment_service.subscriptions s
                left join lateral (
                    select * from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and cp.status <> 'deleted'
                        order by cp.created_at desc
                        limit 1
                ) as lp on true
                left join lateral (
                    select * from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and cp.status = 'paid'
                        order by cp.created_at desc
                        limit 1
                ) as lp_paid on true
                left join lateral (
                    select count(1)
                    from payment_service.catalog_payments cp
                    where cp.subscription_id = s.id
                        and cp.id <> coalesce(lp_paid.id, lp.id)
                        and cp.status in ('refused', 'pending')
                        and (case when lp_paid.id is not null then cp.created_at > lp_paid.created_at else true end)
                ) as retries on true
                where s.status in ('started', 'active')
                    and lp.status in ('refused', 'error')
                    and (lp_paid.id is null OR (lp_paid.created_at + core.get_setting('subscription_interval')::interval < now()))
                    and (
                        case 
                        when lp.status = 'error' then 
                            true
                        else retries.count >= 3 
                        end)
        )
        loop
            _affected_subscriptions := array_append(_affected_subscriptions, _subscription.id);
            perform payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription));
        end loop;

        return json_build_object(
            'affected_subscriptions', _affected_subscriptions,
            'total_affected_subscriptions', array_length(_affected_subscriptions, 1)
        );
    end;
$function$;

CREATE OR REPLACE FUNCTION payment_service.recharge_subscription(payment_service.subscriptions)
 RETURNS payment_service.catalog_payments
 LANGUAGE plpgsql
AS $function$
    declare
        _last_payment payment_service.catalog_payments;
        _generated_payment payment_service.catalog_payments;
    begin
        -- get last payment from subscription
        select * from payment_service.catalog_payments
            where subscription_id = $1.id and status <> 'deleted' order by created_at desc
            limit 1 into _last_payment;

        -- if last payment is pending and is a boleto
        if _last_payment.status = 'pending' and $1.checkout_data->> 'payment_method'::text  = 'boleto' then
            -- if boleto expiration date already in past turn payment to refused and generate a new payment for subscription
            if (_last_payment.gateway_general_data->>'boleto_expiration_date')::date <= now()::date then
                -- turn current payment to refused
                if payment_service.transition_to(_last_payment, 'refused', row_to_json(_last_payment)) then
                    -- generate a new payment
                    _generated_payment := payment_service.generate_new_catalog_payment($1);
                end if;
            else
                -- return last payment when still not expired
                _generated_payment := _last_payment;
            end if;
        -- if last payment is refused should generate new payment
        elsif _last_payment.status = 'refused' then
            -- generate a new payment
            _generated_payment := payment_service.generate_new_catalog_payment($1);
        -- when not match with any conditions should return the last payment
        else
            _generated_payment := _last_payment;
        end if;

        return _generated_payment;
    end;
$function$;

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
            _should_transit_subscription_to_inactive boolean default true;
            _recharged_payment payment_service.catalog_payments;
            _recharged_payment_ids uuid[];
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
                            and _payment.status <> 'deleted'
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

                    if _subscription.id is not null and _subscription.status not in ('canceling', 'canceled', 'deleted') then
                        if _last_paid_subscription_payment.id is not null then
                            _should_transit_subscription_to_inactive := (
                                select count(1) >= 3
                                from payment_service.catalog_payments 
                                where status in ('refused')
                                    and subscription_id = _last_paid_subscription_payment.subscription_id
                                    and created_at > _last_paid_subscription_payment.created_at
                                    and id <> _last_paid_subscription_payment.id
                            );
                        else
                            _should_transit_subscription_to_inactive := (
                                select count(1) >= 3
                                from payment_service.catalog_payments 
                                where status in ('refused')
                                    and subscription_id = _last_subscription_payment.subscription_id
                                    -- and created_at > _last_subscription_payment.created_at
                                    and id <> _last_subscription_payment.id
                            );
                        end if;

                        -- if payment is the same of last_payment
                        if _payment.id = _last_subscription_payment.id 
                            and _last_paid_subscription_payment.id is null OR (
                                _last_paid_subscription_payment.created_at + (core.get_setting('subscription_interval'))::interval
                            ) <= now()
                        then
                            -- should generate new payment while _should_transit_subscription_to_inactive is false
                            if _should_transit_subscription_to_inactive then
                                if payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription.*)) then
                                    _total_affected_subscriptions := _total_affected_subscriptions + 1;
                                    _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);                
                                end if;
                            else
                                _recharged_payment := payment_service.recharge_subscription(_subscription);
                                _recharged_payment_ids := array_append(_recharged_payment_ids, _recharged_payment.id);
                            end if;
                        end if;
                    end if;
                end if;
            end loop;

            _result := json_build_object(
                'total_subscriptions_affected', _total_affected_subscriptions,
                'affected_subscriptions_ids', _affected_subscriptions_ids,
                'total_payments_affected', _total_affected_payments,
                'affected_payments_ids', _affected_payments_ids,
                'recharged_payment_ids', _recharged_payment_ids
            );

            return _result;
        end;
    $function$;

CREATE OR REPLACE FUNCTION payment_service.subscriptions_server_error_rescue_charge()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _result json;
        _affected_subscriptions_ids uuid[];
        _total_affected integer;
        _subscription_payment payment_service.catalog_payments;
    begin
        _total_affected := 0;
        
        for _subscription_payment IN (select last_payment.*
            from payment_service.subscriptions s
            join lateral (
                select *
                from payment_service.catalog_payments cp
                where cp.subscription_id = s.id
                    and cp.status <> 'deleted'
                order by created_at desc
                limit 1
            ) as last_payment on true
            where s.status = 'active' and last_payment.status in('error') 
            and last_payment.error_retry_at is null
            and (
                case last_payment.status
                when 'error' then
                    last_payment.gateway_cached_data is null 
                    OR (
                        (select true from json_array_elements_text(last_payment.gateway_cached_data::json) as el
                            where el::json ->> 'message' ~* 'error'
                            and el::json ->> 'type' is null) AND json_array_length(last_payment.gateway_cached_data::json) = 1
                    )
                else 
                    last_payment.gateway_cached_data is null
                end
            ) 
        )
        loop
            perform pg_notify('process_payments_channel',
                json_build_object(
                    'id', _subscription_payment.id, 
                    'subscription_id', _subscription_payment.subscription_id,
                    'rescued_at', now()
                )::text);

            update payment_service.catalog_payments
                set error_retry_at = now()
                where id = _subscription_payment.id;

            _total_affected := _total_affected + 1;
            _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription_payment.subscription_id);        
        end loop;

        _result := json_build_object(
            'total_affected', _total_affected,
            'affected_ids', _affected_subscriptions_ids
        );

        return _result;
    end;
$function$;