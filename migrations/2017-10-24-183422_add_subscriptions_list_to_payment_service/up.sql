-- Your SQL goes here
create or replace view payment_service_api.subscriptions as
    select
        s.id as id,
        s.project_id as project_id,
        (case when core.is_owner_or_admin(s.user_id) then s.credit_card_id else null::bigint end) as credit_card_id,
        (case when core.is_owner_or_admin(s.user_id) then stats.paid_count else null::bigint end) as paid_count,
        (case when core.is_owner_or_admin(s.user_id) then stats.total_paid else null::bigint end) as total_paid,
        s.status as status,
        payment_service.paid_transition_at(last_paid_payment.*) as paid_at,
        (payment_service.paid_transition_at(last_paid_payment.*) + '1 mon'::interval) as next_charge_at,
        (s.checkout_data - 'card_id' - 'card_hash' - 'current_ip') || 
            (jsonb_build_object('customer', (s.checkout_data->>'customer')::jsonb || jsonb_build_object(
            'name', u.data->>'name',
            'email', u.data->>'email',
            'document_number', u.data->>'document_number'
        ))) as checkout_data,
        s.created_at
    from payment_service.subscriptions s
        join project_service.projects p on p.id = s.project_id
        join community_service.users u on u.id = s.user_id
        left join lateral (
            select
                sum((cp.data->>'amount')::decimal) as total_paid,
                count(1) filter(where cp.status = 'paid') as paid_count,
                count(1) filter(where cp.status = 'refused') as refused_count
            from payment_service.catalog_payments cp
                where cp.subscription_id = s.id
        ) as stats on true
        left join lateral (
            select
                *
            from payment_service.catalog_payments cp
                where cp.subscription_id = s.id
                    and cp.status = 'paid'::payment_service.payment_status
                order by id desc
                limit 1
        ) as last_paid_payment on true
        left join lateral (
            select
                *
            from payment_service.catalog_payments cp
                where cp.subscription_id = s.id
                order by id desc
                limit 1
        ) as last_payment on true
        where (core.is_owner_or_admin(s.user_id) or core.is_owner_or_admin(p.user_id));

grant select on payment_service.subscriptions to scoped_user, platform_user;
grant select on payment_service_api.subscriptions to scoped_user, platform_user;
grant select on payment_service.payment_status_transitions to scoped_user, platform_user;