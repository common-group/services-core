
CREATE OR REPLACE VIEW "analytics_service_api"."project_subscriptions_per_day" AS 
    SELECT 
        i.project_id,
        json_agg(json_build_object('paid_at', i.paid_at, 'created_at', i.created_at, 'total', i.total, 'total_amount', i.total_amount)) AS source
    FROM 
    ( 
        SELECT 
            s.project_id,
            date_trunc('day', s.created_at) AS created_at,
            count(s.*) AS total,
            date_trunc('day', payment_service.paid_transition_at(cp.*)) AS paid_at,
            (sum(((cp.data ->> 'amount'::text))::numeric) / (100)::numeric) AS total_amount
           FROM ((payment_service.subscriptions s
             JOIN project_service.projects p ON ((p.id = s.project_id)))
             JOIN payment_service.catalog_payments cp ON ((cp.subscription_id = s.id)))
          WHERE ((s.created_at >= (now() - '30 days'::interval)) AND (cp.status = 'paid'::payment_service.payment_status) AND ((s.status = 'active'::payment_service.subscription_status) AND (s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id))))
          GROUP BY s.project_id, date_trunc('day', s.created_at) , date_trunc('day', payment_service.paid_transition_at(cp.*))  ) i
  GROUP BY i.project_id;
