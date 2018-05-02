-- Your SQL goes here
create or replace function payment_service.inactive_invalid_subscriptions()
returns json language plpgsql as $$
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
                where s.status in ('started', 'active')
                    and lp.status in ('refused', 'error')        
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
$$;