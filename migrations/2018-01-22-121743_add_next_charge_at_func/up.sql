-- Your SQL goes here
create or replace function payment_service.next_charge_at(s payment_service.subscriptions)
    returns timestamp
    language sql
    stable
    as $$
        select coalesce(
            (select cp.created_at + core.get_setting('subscription_interval')::interval
                from payment_service.catalog_payments cp
                    where cp.subscription_id = $1.id
                        and cp.status = 'paid'
                        order by cp.created_at
                        limit 1)
            , now())::timestamp
    $$;