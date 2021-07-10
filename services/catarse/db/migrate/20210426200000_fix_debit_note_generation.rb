class FixDebitNoteGeneration < ActiveRecord::Migration[6.1]
    def up
        execute <<-SQL
        CREATE OR REPLACE VIEW balance_transfer_requests_projects_view AS
        select rt.transaction_id, btp.project_id, rt.user_id, rt.requested_at, rt.amount requested_amount, rt.balance_transfer_id, rt.transferred_at,
            rt.last_transaction_id,rt.last_requested_at, rt.last_amount,rt.last_balance_transfer_id,rt.last_transferred_at,

            --btp.project_contribution_confirmed_after_finished não entra no project_pledged_amount pq ja esta somado em payments
            (btp.payments+btp.contribution_refunded_after_successful_pledged+btp.chargeback_after_finished) as project_pledged_amount,
            (btp.service_fee+btp.catarse_contribution_fee) total_service_fee,

            btp.payments, btp.service_fee, btp.irrf_tax,
            btp.project_contribution_confirmed_after_finished,
            btp.catarse_contribution_fee,
            btp.contribution_refunded_after_successful_pledged,
            btp.chargeback_after_finished,
            bte.id balance_expired_id,
            coalesce(bte.amount,0) as balance_expired_amount,
            bto.other_events,
            pa.payments_sum,
            pa.payments_gatewayfee,
            btp.subscription_payment_uuids,
            pa.payment_ids
        from balance_transfer_requests_transferred_view rt
        left join lateral (
            select id,created_at, abs(amount) amount
            from public.balance_transactions bte
            where bte.user_id=rt.user_id
            and bte.created_at < rt.requested_at
            and (rt.last_requested_at is null or bte.created_at > rt.last_requested_at)
            and bte.event_name='balance_expired'
            order by bte.id desc
            limit 1
        ) bte on bte.id is not null
        join lateral (
            with tr as ( -- transações no intervalo
                select b.id, coalesce(b.project_id, c.project_id) project_id,
                    b.event_name, b.amount,
                    subscription_payment_uuid
                from public.balance_transactions b
                left join contributions c on c.id=b.contribution_id
                where b.user_id=rt.user_id
                and ((
                    CASE WHEN b.event_name in ('irrf_tax_project','project_antecipation_fee')
                        THEN b.id < rt.transaction_id+2
                        WHEN b.event_name in ('subscription_payment','subscription_fee')
                        THEN b.id <= rt.transaction_id
                        ELSE b.created_at <= rt.requested_at+'30 min'::interval
                    END
                    and (bte.id is null or b.created_at > bte.created_at)
                    and (rt.last_requested_at is null or
                        CASE WHEN b.event_name in ('irrf_tax_project','project_antecipation_fee')
                            THEN b.id > rt.last_transaction_id+2
                            ELSE (b.created_at > rt.last_requested_at and b.id > rt.last_transaction_id)
                        END
                    ) and b.event_name in (
                        'successful_project_pledged','subscription_payment',
                        'subscription_fee','catarse_project_service_fee','project_antecipation_fee',
                        'irrf_tax_project',
                        'project_contribution_confirmed_after_finished',
                        'catarse_contribution_fee',
                        'contribution_refunded_after_successful_pledged',
                        'contribution_chargedback','revert_chargeback'
                    )
                ) or (
                    rt.transaction_id=13002 and b.id in (12992,12993,12994)--caso especifico pq o request acontece antes dos demais eventos
                ) or (
                    rt.transaction_id=18617 and b.id in (17772,17773,17803,17804)--caso especifico pq tem um request intermediario com balance_transfer_id=10223
                ))
            )

            --contribution_refund não entra em nenhum lugar pq é o recebimento do apoiador no refund
            select project_id,
                coalesce(sum(amount)FILTER(where event_name in ('successful_project_pledged','subscription_payment','project_contribution_confirmed_after_finished')),0) payments,
                coalesce(sum(amount)FILTER(where event_name in ('catarse_project_service_fee','subscription_fee','project_antecipation_fee')),0) service_fee,
                coalesce(sum(amount)FILTER(where event_name='irrf_tax_project'),0) irrf_tax,
                coalesce(sum(amount)FILTER(where event_name='project_contribution_confirmed_after_finished'),0) project_contribution_confirmed_after_finished,
                coalesce(sum(amount)FILTER(where event_name='catarse_contribution_fee'),0) catarse_contribution_fee,
                coalesce(sum(amount)FILTER(where event_name='contribution_refunded_after_successful_pledged'),0) contribution_refunded_after_successful_pledged,
                coalesce(sum(amount)FILTER(where event_name in ('contribution_chargedback','revert_chargeback')),0) chargeback_after_finished,
                array_agg(distinct subscription_payment_uuid)FILTER(where tr.subscription_payment_uuid is not null) as subscription_payment_uuids
            from tr
            where tr.project_id is not null
            group by project_id
        ) btp on true

        left join lateral (--Pagamentos AON/FLEX que estavam pagos no momento da transferência
            select array_agg(distinct pa.id) as payment_ids,
                sum(pa.value) as payments_sum,
                sum(pa.gateway_fee) as payments_gatewayfee
            from payments pa
            join contributions c on c.id=pa.contribution_id and c.project_id=btp.project_id
            where rt.requested_at>pa.paid_at
            and (btp.payments>0 -- teve 'successful_project_pledged' no intervalo ('subscription_payment' nao entra pq sabemos q é AON/FLEX!)
                or (rt.last_requested_at is null or pa.paid_at>rt.last_requested_at)
            )
            and (pa.state='paid' -- está paid agora OU saiu de 'paid' depois da requisição
                or rt.requested_at < LEAST(pa.refused_at,pa.pending_refund_at,pa.refunded_at,pa.deleted_at,pa.chargeback_at)
            )
        ) pa on pa.payment_ids is not null

        left join lateral (
            select json_agg(t) other_events from (
                select event_name, sum(amount) total_amount, array_agg(id) ids
                from public.balance_transactions b
                where b.user_id=rt.user_id
                and b.id <> rt.transaction_id
                and b.created_at <= rt.requested_at
                and (rt.last_requested_at is null or b.created_at > rt.last_requested_at)
                and b.event_name not in ('balance_expired',
                    'successful_project_pledged','subscription_payment',
                    'subscription_fee','catarse_project_service_fee','project_antecipation_fee'
                    'irrf_tax_project',
                    'project_contribution_confirmed_after_finished',
                    'catarse_contribution_fee',
                    'contribution_refunded_after_successful_pledged',
                    'contribution_chargedback','revert_chargeback'
                    )
                group by event_name
            ) t
        ) bto on true
        order by rt.requested_at;

        CREATE OR REPLACE FUNCTION public.project_fiscal_data_tbl_refresh()
        RETURNS integer
        LANGUAGE plpgsql
        AS $function$
        DECLARE
            b_count integer;
        BEGIN
            insert into project_fiscal_data_tbl (
                project_id, user_id, mode, fiscal_date, fiscal_year,
                project_pledged_amount, service_fee, irrf, balance, total_gateway_fee,
                pj_pledged_by_month, pf_pledged_by_month,
                project_info, user_info, user_address,
                balance_transfer_id, subscription_payment_uuids, payment_ids, total_antifraud_cost
            )
            select project_id, user_id, mode, fiscal_date, fiscal_year,
                project_pledged_amount, service_fee, irrf, balance, total_gateway_fee,
                pj_pledged_by_month, pf_pledged_by_month,
                project_info, user_info, user_address,
                balance_transfer_id, subscription_payment_uuids, payment_ids, total_antifraud_cost
            from public.project_fiscal_data_tbl_refresh_supportview r
            where not exists (
                select 1
                from public.project_fiscal_data_tbl t
                where t.project_id=r.project_id and t.fiscal_date=r.fiscal_date
            )
            and r.project_id<>90320
            and (r.total_payments>0)
            and (r.transferred_at > (select max(fiscal_date)::date-'15 days'::interval from project_fiscal_data_tbl) );

            GET DIAGNOSTICS b_count = ROW_COUNT;
            RAISE NOTICE 'project_fiscal_data_tbl_refresh inserted % new rows', b_count;
            RETURN b_count;
        END;
        $function$;

        SQL
    end

    def down
        execute <<-SQL
        CREATE OR REPLACE VIEW balance_transfer_requests_projects_view AS
        select rt.transaction_id, btp.project_id, rt.user_id, rt.requested_at, rt.amount requested_amount, rt.balance_transfer_id, rt.transferred_at,
            rt.last_transaction_id,rt.last_requested_at, rt.last_amount,rt.last_balance_transfer_id,rt.last_transferred_at,

            --btp.project_contribution_confirmed_after_finished não entra no project_pledged_amount pq ja esta somado em payments
            (btp.payments+btp.contribution_refunded_after_successful_pledged+btp.chargeback_after_finished) as project_pledged_amount,
            (btp.service_fee+btp.catarse_contribution_fee) total_service_fee,

            btp.payments, btp.service_fee, btp.irrf_tax,
            btp.project_contribution_confirmed_after_finished,
            btp.catarse_contribution_fee,
            btp.contribution_refunded_after_successful_pledged,
            btp.chargeback_after_finished,
            bte.id balance_expired_id,
            coalesce(bte.amount,0) as balance_expired_amount,
            bto.other_events,
            pa.payments_sum,
            pa.payments_gatewayfee,
            btp.subscription_payment_uuids,
            pa.payment_ids
        from balance_transfer_requests_transferred_view rt
        left join lateral (
            select id,created_at, abs(amount) amount
            from public.balance_transactions bte
            where bte.user_id=rt.user_id
            and bte.created_at < rt.requested_at
            and (rt.last_requested_at is null or bte.created_at > rt.last_requested_at)
            and bte.event_name='balance_expired'
            order by bte.id desc
            limit 1
        ) bte on bte.id is not null
        join lateral (
            with tr as ( -- transações no intervalo
                select b.id, coalesce(b.project_id, c.project_id) project_id,
                    b.event_name, b.amount,
                    subscription_payment_uuid
                from public.balance_transactions b
                left join contributions c on c.id=b.contribution_id
                where b.user_id=rt.user_id
                and ((
                    CASE WHEN b.event_name='irrf_tax_project'
                        THEN b.id < rt.transaction_id+2
                        WHEN b.event_name in ('subscription_payment','subscription_fee')
                        THEN b.id <= rt.transaction_id
                        ELSE b.created_at <= rt.requested_at+'30 min'::interval
                    END
                    and (bte.id is null or b.created_at > bte.created_at)
                    and (rt.last_requested_at is null or
                        CASE WHEN b.event_name='irrf_tax_project'
                            THEN b.id > rt.last_transaction_id+2
                            ELSE (b.created_at > rt.last_requested_at and b.id > rt.last_transaction_id)
                        END
                    ) and  b.event_name in (
                        'successful_project_pledged','subscription_payment',
                        'subscription_fee','catarse_project_service_fee',
                        'irrf_tax_project',
                        'project_contribution_confirmed_after_finished',
                        'catarse_contribution_fee',
                        'contribution_refunded_after_successful_pledged',
                        'contribution_chargedback','revert_chargeback'
                    )
                ) or (
                    rt.transaction_id=13002 and b.id in (12992,12993,12994)--caso especifico pq o request acontece antes dos demais eventos
                ) or (
                    rt.transaction_id=18617 and b.id in (17772,17773,17803,17804)--caso especifico pq tem um request intermediario com balance_transfer_id=10223
                ))
            )

            --contribution_refund não entra em nenhum lugar pq é o recebimento do apoiador no refund
            select project_id,
                coalesce(sum(amount)FILTER(where event_name in ('successful_project_pledged','subscription_payment','project_contribution_confirmed_after_finished')),0) payments,
                coalesce(sum(amount)FILTER(where event_name in ('catarse_project_service_fee','subscription_fee')),0) service_fee,
                coalesce(sum(amount)FILTER(where event_name='irrf_tax_project'),0) irrf_tax,
                coalesce(sum(amount)FILTER(where event_name='project_contribution_confirmed_after_finished'),0) project_contribution_confirmed_after_finished,
                coalesce(sum(amount)FILTER(where event_name='catarse_contribution_fee'),0) catarse_contribution_fee,
                coalesce(sum(amount)FILTER(where event_name='contribution_refunded_after_successful_pledged'),0) contribution_refunded_after_successful_pledged,
                coalesce(sum(amount)FILTER(where event_name in ('contribution_chargedback','revert_chargeback')),0) chargeback_after_finished,
                array_agg(distinct subscription_payment_uuid)FILTER(where tr.subscription_payment_uuid is not null) as subscription_payment_uuids
            from tr
            where tr.project_id is not null
            group by project_id
        ) btp on true

        left join lateral (--Pagamentos AON/FLEX que estavam pagos no momento da transferência
            select array_agg(distinct pa.id) as payment_ids,
                sum(pa.value) as payments_sum,
                sum(pa.gateway_fee) as payments_gatewayfee
            from payments pa
            join contributions c on c.id=pa.contribution_id and c.project_id=btp.project_id
            where rt.requested_at>pa.paid_at
            and (btp.payments>0 -- teve 'successful_project_pledged' no intervalo ('subscription_payment' nao entra pq sabemos q é AON/FLEX!)
                or (rt.last_requested_at is null or pa.paid_at>rt.last_requested_at)
            )
            and (pa.state='paid' -- está paid agora OU saiu de 'paid' depois da requisição
                or rt.requested_at < LEAST(pa.refused_at,pa.pending_refund_at,pa.refunded_at,pa.deleted_at,pa.chargeback_at)
            )
        ) pa on pa.payment_ids is not null

        left join lateral (
            select json_agg(t) other_events from (
                select event_name, sum(amount) total_amount, array_agg(id) ids
                from public.balance_transactions b
                where b.user_id=rt.user_id
                and b.id <> rt.transaction_id
                and b.created_at <= rt.requested_at
                and (rt.last_requested_at is null or b.created_at > rt.last_requested_at)
                and b.event_name not in ('balance_expired',
                    'successful_project_pledged','subscription_payment',
                    'subscription_fee','catarse_project_service_fee',
                    'irrf_tax_project',
                    'project_contribution_confirmed_after_finished',
                    'catarse_contribution_fee',
                    'contribution_refunded_after_successful_pledged',
                    'contribution_chargedback','revert_chargeback'
                    )
                group by event_name
            ) t
        ) bto on true
        order by rt.requested_at;


        SQL
    end
  end
