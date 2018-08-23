-- Your SQL goes here
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
                        else retries.count >= 2 
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