-- Your SQL goes here
CREATE OR REPLACE FUNCTION analytics_service_api.new_subscribers_from_period (
    project_id uuid, 
    start_date timestamp without time zone, 
    end_date timestamp without time zone
)
    RETURNS json
    LANGUAGE plpgsql
AS $function$
    
    DECLARE
        _insights_new_subscribers json;
        _insights_mean_amount integer;
        _project_selected project_service.projects;
        _test_json json;
    BEGIN
       
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');
        
        -- get project data
        SELECT
            *
        FROM
            project_service.projects AS p
        WHERE
            p.id = project_id
        INTO
            _project_selected;

        
        -- select new subscribers count and amount on period
        SELECT 
            json_build_object(
                'subscriptions_count', count(s.id),
                'total_amount', sum(CAST(last_cp.data->>'amount'::TEXT as integer))
            )
        FROM 
            payment_service.subscriptions AS s
        LEFT JOIN LATERAL
        (
            SELECT
                *    
            FROM
                payment_service.catalog_payments AS cp
            WHERE
                cp.subscription_id = s.id
            ORDER BY
                cp.created_at DESC
            LIMIT 1
            
        ) last_cp ON (true)
            
        WHERE 
        (
            s.id = last_cp.subscription_id
            AND
            s.project_id = _project_selected.id
            AND 
            s.status <> 'deleted'::payment_service.subscription_status 
            AND 
            s.platform_id = core.current_platform_id() 
            AND 
            (
                core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(_project_selected.user_id)
            )
            AND
            (
                payment_service.paid_transition_at(last_cp.*) >= start_date
                AND 
                payment_service.paid_transition_at(last_cp.*) <= end_date
            )
        )

        LIMIT 1
            
        INTO _insights_new_subscribers;


        -- get mean amount for subscriptions
        SELECT 
            sum(CAST(last_cp.data->>'amount'::TEXT as integer)) / count(s.id) as mean_amount
        FROM 
            payment_service.subscriptions AS s
        LEFT JOIN LATERAL
        (
            SELECT
                *    
            FROM
                payment_service.catalog_payments AS cp
            WHERE
                cp.subscription_id = s.id
            ORDER BY
                cp.created_at DESC
            LIMIT 1
            
        ) last_cp ON (true)
            
        WHERE 
        (
            s.id = last_cp.subscription_id
            AND
            s.project_id = _project_selected.id
            AND 
            s.status <> 'deleted'::payment_service.subscription_status 
            AND 
            s.platform_id = core.current_platform_id() 
            AND 
            (
                core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(_project_selected.user_id)
            )
        )
        LIMIT 1
            
        INTO _insights_mean_amount;
                
        return json_build_object(
            'mean_amount', _insights_mean_amount,
            'subscriptions_count', cast(_insights_new_subscribers->>'subscriptions_count'::text as integer),
            'total_amount', cast(_insights_new_subscribers->>'total_amount'::text as integer)
        );
    END;
$function$
;
---
