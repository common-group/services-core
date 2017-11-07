-- Your SQL goes here
create or replace function analytics_service_api.project_subscribers_info(id uuid)
    returns json
    language plpgsql
    stable
    as $$
        declare
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user, anonymous}');
            
            select
                json_build_object(
                    'amount_paid_for_valid_period', sum(last_payment.amount) / 100,
                    'total_subscriptions', count(distinct s.id),
                    'total_subscribers', count(distinct s.user_id)
                )
            from payment_service.subscriptions s
                join lateral (
                    select (cp.data ->> 'amount')::decimal as amount
                        from payment_service.catalog_payments cp
                            where cp.created_at + core.get_setting('subscription_interval')::interval > now()
                                and cp.status = 'paid'
                                order by cp.created_at desc
                                limit 1
                ) as last_payment on true
                    where s.status = 'active'
                        and s.project_id = $1
                        and s.platform_id = core.current_platform_id()
                group by s.platform_id, s.project_id
                limit 1
            into _result;
            
            return _result;
        end;
    $$;

grant select on platform_service.platforms  to anonymous, scoped_user, platform_user;
grant select on payment_service.subscriptions  to anonymous, scoped_user, platform_user;
grant select on payment_service.catalog_payments  to anonymous, scoped_user, platform_user;
grant usage on schema payment_service  to anonymous, scoped_user, platform_user;
grant usage on schema analytics_service_api  to anonymous, scoped_user, platform_user;
grant execute on function analytics_service_api.project_subscribers_info(uuid) to anonymous, scoped_user, platform_user;