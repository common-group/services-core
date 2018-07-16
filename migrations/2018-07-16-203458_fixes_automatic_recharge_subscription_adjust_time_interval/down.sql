-- This file should undo anything in `up.sql`
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
            order by cp.created_at desc
            limit 1
    ) as last_payment on true
    where s.status in ('active', 'started')
        and (s.checkout_data ->> 'payment_method')::text = 'credit_card'
        and last_payment.status = 'refused'
        and (payment_service.next_charge_at(s)) <= now()
)
loop
    -- get last paid payment from subscription
    select * from payment_service.catalog_payments
        where subscription_id = _subscription.id
            and status = 'paid'
            order by created_at desc
            limit 1 into _last_paid_payment;

    -- get last payment generated on subscription
    select * from payment_service.catalog_payments
        where subscription_id = _subscription.id
            order by created_at desc
            limit 1 into _last_payment;
            
    if _last_paid_payment.id is not null then
        _should_transit_subscription_to_inactive := (
            select count(1) >= 3
            from payment_service.catalog_payments
                where subscription_id = _subscription.id
                    and status = 'refused'
                    and created_at > _last_paid_payment.created_at
        );
    else
        _should_transit_subscription_to_inactive := (
            select count(1) >= 3
            from payment_service.catalog_payments
                where subscription_id = _subscription.id
                    and status = 'refused'
        );    
    end if;
    
    if _should_transit_subscription_to_inactive then
        perform payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription));
        
        _total_affected_subscriptions := _total_affected_subscriptions + 1;
        _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
    elsif (_last_payment.status = 'refused') and (_last_payment.created_at + '4 days'::interval) < now() then
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