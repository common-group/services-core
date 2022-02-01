class RemoveProjectTotalsToProjectsMetricStorage < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL
CREATE OR REPLACE FUNCTION public.refresh_project_metric_storage(projects)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    v_data jsonb;
    begin
        if $1.mode = 'sub' then
            -- build jsonb object for subscription project
            select
                json_build_object(
                    'pledged', coalesce(subs_agg.sum_active_payments, 0),
                    'paid_pledged', coalesce(subs_agg.sum_paid_active_payments, 0),
                    'total_payment_service_fee', coalesce(subs_agg.payment_method_fee, 0),
                    'paid_total_payment_service_fee', coalesce(subs_agg.paid_total_payment_method_fee, 0),
                    'total_contributions', coalesce(subs_agg.count_active, 0),
                    'total_contributors', coalesce(subs_agg.count_per_user, 0),
                    'progress', coalesce((
                        (coalesce(subs_agg.sum_active, 0) / coalesce(goals_agg.min_value, goals_agg.max_value)) * 100::numeric
                    ), 0)
                )::jsonb
            from public.projects p
                -- subscriptions aggregations
                left join lateral (
                    select
                        sum(sub_data.amount) as sum_active,
                        sum((sub_lp.data->>'amount')::numeric / 100) as sum_active_payments,
                        sum((sub_lp.data->>'amount')::numeric / 100) filter (where sub_lp.status in ('paid')) as sum_paid_active_payments,
                        count(1) as count_active,
                        count(distinct(sub.user_id)) as count_per_user,
                        sum(fees.gateway_fee::numeric) AS payment_method_fee,
                        sum(fees.gateway_fee::numeric) filter (where fees.status in ('paid')) AS paid_total_payment_method_fee
                    from common_schema.subscriptions sub
                        left join lateral (
                            select
                                (sub.checkout_data->>'amount'::text)::numeric as amount_in_cents,
                                ((sub.checkout_data->>'amount'::text)::numeric / (100)::numeric) as amount
                        ) as sub_data on true
                        left join lateral (
                            select * from common_schema.catalog_payments cp where cp.subscription_id = sub.id
                                and cp.status in ('paid', 'pending')
                                order by cp.created_at desc limit 1
                        ) as sub_lp on true
                        LEFT JOIN LATERAL (
                            select round(
		                    CASE
		                        WHEN (cp.gateway_general_data ->> 'gateway_payment_method'::text) = 'credit_card'::text THEN COALESCE((cp.gateway_general_data ->> 'gateway_cost'::text)::numeric, 0::numeric) + COALESCE((cp.gateway_general_data ->> 'payable_total_fee'::text)::numeric, 0::numeric)
		                        ELSE COALESCE(cp.gateway_general_data ->> 'payable_total_fee'::text, cp.gateway_general_data ->> 'gateway_cost'::text, '0'::text)::numeric
		                    END / 100::numeric, 2) AS gateway_fee,
		                    cp.status as status
		                    from common_schema.catalog_payments cp where cp.subscription_id = sub.id
                        ) fees ON true
                        where sub.project_id = p.common_id and sub.status = 'active'
                ) as subs_agg on true
                -- goals aggregations
                left join lateral (
                    select
                        min(g.value) filter(where g.value > subs_agg.sum_active) as min_value,
                        max(g.value) as max_value
                    from public.goals g
                        where g.project_id = p.id
                ) as goals_agg on true
            where p.id = $1.id into v_data;
        else
            select json_build_object(
                'pledged', sum(COALESCE(pa.value, 0)),
                'paid_pledged', sum(COALESCE(pa.value, 0)) FILTER (WHERE pa.state = 'paid'::text),
                'progress', sum(COALESCE(pa.value, 0)) / p.goal * 100::numeric,
                'total_payment_service_fee', sum(COALESCE(pa.gateway_fee, 0)),
                'paid_total_payment_service_fee', (SELECT sum(COALESCE(pa.gateway_fee, 0)) FILTER (WHERE pa.state = 'paid'::text)
                UNION (SELECT 0::numeric) LIMIT 1),
                'total_contributions', count(DISTINCT c.id),
                'total_contributors', count(DISTINCT c.user_id)
            )::jsonb
            from public.projects p
            left JOIN contributions c ON c.project_id = p.id
            left JOIN payments pa ON pa.contribution_id = c.id
            where p.id = $1.id
	        GROUP BY c.project_id, p.id
            into v_data;
        end if;

        begin
            insert into public.project_metric_storages (project_id, data, refreshed_at, created_at, updated_at)
                values ($1.id, v_data, now(), now(), now());
        exception when unique_violation then
            update public.project_metric_storages
                set data = v_data,
                    refreshed_at = now(),
                    updated_at = now()
                where project_id = $1.id;
        end;

        return;
    end;
$function$;

    SQL
  end

  def down
    execute <<-SQL
CREATE OR REPLACE FUNCTION public.refresh_project_metric_storage(projects)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    v_data jsonb;
    begin
        if $1.mode = 'sub' then
            -- build jsonb object for subscription project
            select
                json_build_object(
                    'pledged', coalesce(subs_agg.sum_active_payments, 0),
                    'total_contributions', coalesce(subs_agg.count_active, 0),
                    'total_contributors', coalesce(subs_agg.count_per_user, 0),
                    'progress', coalesce((
                        (coalesce(subs_agg.sum_active, 0) / coalesce(goals_agg.min_value, goals_agg.max_value)) * 100::numeric
                    ), 0)
                )::jsonb
            from public.projects p
                -- subscriptions aggregations
                left join lateral (
                    select
                        sum(sub_data.amount) as sum_active,
                        sum((sub_lp.data->>'amount')::numeric / 100) as sum_active_payments,
                        count(1) as count_active,
                        count(distinct(sub.user_id)) as count_per_user
                    from common_schema.subscriptions sub
                        left join lateral (
                            select
                                (sub.checkout_data->>'amount'::text)::numeric as amount_in_cents,
                                ((sub.checkout_data->>'amount'::text)::numeric / (100)::numeric) as amount
                        ) as sub_data on true
                        left join lateral (
                            select * from common_schema.catalog_payments cp where cp.subscription_id = sub.id
                                and cp.status in ('paid', 'pending')
                                order by cp.created_at desc limit 1
                        ) as sub_lp on true
                        where sub.project_id = p.common_id and sub.status = 'active'
                ) as subs_agg on true
                -- goals aggregations
                left join lateral (
                    select
                        min(g.value) filter(where g.value > subs_agg.sum_active) as min_value,
                        max(g.value) as max_value
                    from public.goals g
                        where g.project_id = p.id
                ) as goals_agg on true
            where p.id = $1.id into v_data;
        else
            select json_build_object(
                'pledged', coalesce(pt_data.pledged, 0)::numeric,
                'pledged', p.value,
                'total_contributions', coalesce(pt.total_contributions, 0),
                'total_contributors', coalesce(pt.total_contributors, 0),
                'progress', coalesce(pt.progress, 0)::numeric
            )::jsonb
            from public.projects p
            left join "1".project_totals pt on pt.project_id = p.id
            left join lateral (
                select
                    (case
                    when p.state = 'failed' then pt.pledged
                    else pt.paid_pledged
                    end) as pledged
            ) as pt_data on true
            where p.id = $1.id
            into v_data;
        end if;

        begin
            insert into public.project_metric_storages (project_id, data, refreshed_at, created_at, updated_at)
                values ($1.id, v_data, now(), now(), now());
        exception when unique_violation then
            update public.project_metric_storages
                set data = v_data,
                    refreshed_at = now(),
                    updated_at = now()
                where project_id = $1.id;
        end;

        return;
    end;
$function$;

    SQL
  end
end
