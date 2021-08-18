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
                        and cp.status in ('paid', 'refunded')
                        order by cp.created_at desc
                        limit 1)::date
            , now()::date)::timestamp
    $function$;

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
                    and (last_payment.id is null or last_payment.status in ('paid', 'refunded'))
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
