-- This file should undo anything in `up.sql`

CREATE OR REPLACE FUNCTION analytics_service_api.project_subscribers_info(id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user, anonymous}');
            
            select json_build_object(
                'amount_paid_for_valid_period', sum(last_payment.amount) / 100,
                'total_subscriptions', count(distinct s.id),
                'total_subscribers', count(distinct s.user_id),
                'new_percent', count(DISTINCT s.user_id) FILTER (WHERE lt.total_contributed_projects = 0)::double precision / count(DISTINCT s.user_id)::double precision * 100::double precision,
                'returning_percent',count(DISTINCT s.user_id) FILTER (WHERE lt.total_contributed_projects > 0)::double precision / count(DISTINCT s.user_id)::double precision * 100::double precision
            )
            from project_service.projects p
            left join payment_service.subscriptions s on s.project_id = p.id
                and s.status = 'active'
            left join lateral (
                select (cp.data ->> 'amount')::decimal as amount
                    from payment_service.catalog_payments cp
                        where payment_service.paid_transition_at(cp) + core.get_setting('subscription_interval')::interval > now()
                            and cp.status = 'paid'
                            and cp.subscription_id = s.id
                            order by cp.created_at desc
                            limit 1
            ) as last_payment on true
            JOIN LATERAL ( SELECT count(DISTINCT cp.project_id) AS total_contributed_projects
              FROM payment_service.catalog_payments cp
              where cp.status = 'paid' AND
              cp.user_id = s.user_id  AND cp.project_id <> p.id) lt ON true
            where p.id = $1
                    and p.platform_id = core.current_platform_id()
            group by s.platform_id, s.project_id
            limit 1

            into _result;
            
            return _result;
        end;
    $function$
;
