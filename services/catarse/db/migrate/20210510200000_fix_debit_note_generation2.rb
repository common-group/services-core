class FixDebitNoteGeneration < ActiveRecord::Migration[6.1]
    def up
        execute <<-SQL
        CREATE OR REPLACE VIEW "balance_transfer_requests_view" AS 
        SELECT btr.id AS transaction_id,
            btr.project_id,
            btr.event_name,
            btr.user_id,
            btr.created_at,
            abs(btr.amount) AS amount,
            btr.balance_transfer_id,
            btt.to_state AS transfer_state,
            btt.created_at AS transfer_state_at
        FROM balance_transactions btr
        LEFT JOIN balance_transfer_transitions btt ON btt.balance_transfer_id = btr.balance_transfer_id AND btt.most_recent
        WHERE btr.event_name in ('balance_transfer_request', 'balance_transfer_project', 'balance_transfer_error')
        ORDER BY btr.id;

        CREATE OR REPLACE VIEW "balance_transfer_requests_transferred_view" AS 
        SELECT r.user_id,
            r.transaction_id,
            r.created_at AS requested_at,
            r.amount,
            r.balance_transfer_id,
            r.transfer_state_at AS transferred_at,
            ltr.transaction_id AS last_transaction_id,
            ltr.created_at AS last_requested_at,
            ltr.amount AS last_amount,
            ltr.balance_transfer_id AS last_balance_transfer_id,
            ltr.transfer_state_at AS last_transferred_at,
            r.project_id
        FROM balance_transfer_requests_view r
        LEFT JOIN LATERAL (
            SELECT ltr_1.transaction_id, ltr_1.project_id, ltr_1.event_name, ltr_1.user_id,
                ltr_1.created_at, ltr_1.amount, ltr_1.balance_transfer_id, ltr_1.transfer_state, ltr_1.transfer_state_at
            FROM balance_transfer_requests_view ltr_1
            WHERE ltr_1.user_id = r.user_id AND ltr_1.transfer_state='transferred' AND ltr_1.created_at < r.created_at
            ORDER BY ltr_1.created_at DESC
            LIMIT 1
        ) ltr ON ltr.transaction_id IS NOT NULL
        WHERE r.transfer_state='transferred';



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
            and bte.event_name='balance_expired'
            and bte.created_at < rt.requested_at
            and (rt.last_requested_at is null or bte.created_at > rt.last_requested_at)
            and not exists (
                select 1
                from balance_transactions bt2
                where bt2.user_id=bte.user_id 
                and bt2.event_name = 'revert_balance_expired'
                and bt2.created_at >= bte.created_at 
                and bt2.created_at <= rt.requested_at
            )
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
                            ELSE (b.created_at > rt.last_requested_at )--and b.id > rt.last_transaction_id)
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

        CREATE OR REPLACE VIEW "project_fiscal_data_tbl_refresh_supportview" AS 
        SELECT r.project_id,
            r.user_id,
            pr.mode,
            to_char(zone_timestamp(r.transferred_at), 'YYYYMMDD') AS fiscal_date,
            (date_part('year', (zone_timestamp(r.transferred_at))::date))::integer AS fiscal_year,
            round(r.project_pledged_amount, 2) AS project_pledged_amount,
            round(r.total_service_fee, 2) AS service_fee,
            round(NULLIF(r.irrf_tax, (0)::numeric), 2) AS irrf,
            round(((((r.payments + (+ r.chargeback_after_finished)) + r.contribution_refunded_after_successful_pledged) + COALESCE(r.service_fee, (0)::numeric)) + COALESCE(r.irrf_tax, (0)::numeric)), 2) AS balance,
            pa.total_gateway_fee,
            pa.pj_pledged_by_month,
            pa.pf_pledged_by_month,
            to_json(pr.*) AS project_info,
            to_json(u.*) AS user_info,
            to_json(ad.*) AS user_address,
            r.balance_transfer_id,
            r.subscription_payment_uuids,
            r.payment_ids,
            r.payments AS total_payments,
            r.requested_at,
            r.transferred_at,
            pa.total_antifraud_cost
        FROM balance_transfer_requests_projects_view r
        JOIN projects pr ON pr.id = r.project_id AND pr.state not in ('deleted', 'rejected', 'failed')
        JOIN users u ON u.id = r.user_id
        LEFT JOIN addresses ad ON ad.id = u.address_id
        JOIN LATERAL (
            SELECT round(sum(q.value), 2) AS payment_amount,
                round(sum(q.gateway_fee), 2) AS total_gateway_fee,
                round(sum(q.antifraud_cost), 2) AS total_antifraud_cost,
                array_agg(json_build_object('year', q.year, 'month', q.month, 'value', q.value)) FILTER (WHERE q.is_pj) AS pj_pledged_by_month,
                array_agg(json_build_object('year', q.year, 'month', q.month, 'value', q.value)) FILTER (WHERE (NOT q.is_pj)) AS pf_pledged_by_month
            FROM (
                SELECT date_part('year', zone_timestamp(pa_1.paid_at)) AS year,
                    date_part('month', zone_timestamp(pa_1.paid_at)) AS month,
                    ((((pa_1.gateway_data -> 'customer') ->> 'document_type') IS NOT NULL) AND (((pa_1.gateway_data -> 'customer') ->> 'document_type') = 'cnpj')) AS is_pj,
                    sum(pa_1.value) AS value,
                    sum(pa_1.gateway_fee) AS gateway_fee,
                    sum(aa_1.cost) AS antifraud_cost
                FROM payments pa_1
                LEFT JOIN antifraud_analyses aa_1 ON aa_1.payment_id = pa_1.id AND aa_1.created_at::date >= '2020-08-01'::date
                WHERE ((pr.mode <> 'sub') AND (pa_1.id = ANY (r.payment_ids)))
                GROUP BY year, month, is_pj
                
                UNION

                SELECT date_part('year', ptp.zpaid_at) AS year,
                    date_part('month', ptp.zpaid_at) AS month,
                    (((pa_1.gateway_general_data ->> 'customer_document_type') IS NOT NULL) AND ((pa_1.gateway_general_data ->> 'customer_document_type') = 'cnpj')) AS is_pj,
                    round(sum((((pa_1.data ->> 'amount'))::numeric / (100)::numeric)), 2) AS value,
                    round(sum((
                        CASE
                            WHEN ((pa_1.gateway_general_data ->> 'gateway_payment_method') = 'credit_card') THEN (COALESCE(((pa_1.gateway_general_data ->> 'gateway_cost'))::numeric, (0)::numeric) + COALESCE(((pa_1.gateway_general_data ->> 'payable_total_fee'))::numeric, (0)::numeric))
                            ELSE (COALESCE((pa_1.gateway_general_data ->> 'gateway_cost'), (pa_1.gateway_general_data ->> 'payable_total_fee')))::numeric
                        END / (100)::numeric)), 2) AS gateway_fee,
                    round(sum(aa_1.cost), 2) AS antifraud_cost
                FROM unnest(r.subscription_payment_uuids) spu(spu)
                JOIN common_schema.catalog_payments pa_1 ON pa_1.id = spu.spu AND pa_1.project_id = pr.common_id
                LEFT JOIN common_schema.antifraud_analyses aa_1 ON aa_1.catalog_payment_id = pa_1.id AND aa_1.created_at::date >= '2020-08-01'::date
                JOIN LATERAL (
                    SELECT zone_timestamp(ptp_1.created_at) AS zpaid_at
                    FROM common_schema.payment_status_transitions ptp_1
                    WHERE ((ptp_1.catalog_payment_id = pa_1.id) AND (ptp_1.to_status = 'paid'::payment_service.payment_status))
                    ORDER BY ptp_1.created_at DESC
                    LIMIT 1
                ) ptp ON true
                WHERE (pr.mode = 'sub')
                GROUP BY year, month, is_pj
            
                ORDER BY 1, 2, 3
            ) q
            WHERE (q.value IS NOT NULL)
        ) pa ON true
        WHERE r.project_id IS NOT NULL AND r.project_id <> 69026
        ORDER BY r.transferred_at DESC;

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

        SQL
    end
  end
