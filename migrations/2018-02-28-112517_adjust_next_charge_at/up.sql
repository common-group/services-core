-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.next_charge_at(s payment_service.subscriptions)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
        select coalesce(
            (select cp.created_at + core.get_setting('subscription_interval')::interval
                from payment_service.catalog_payments cp
                    where cp.subscription_id = $1.id
                        and cp.status = 'paid'
                        order by cp.created_at desc
                        limit 1)
            , now())::timestamp
    $function$
;