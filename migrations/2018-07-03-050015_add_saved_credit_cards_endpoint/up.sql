-- Your SQL goes here
CREATE OR REPLACE VIEW "payment_service_api"."saved_credit_cards" AS 
 SELECT card.id,
    card.user_id,
    card.gateway,
    ((card.gateway_data ->> 'id'::text) IS NOT NULL) AS in_gateway,
        CASE "current_user"()
            WHEN 'platform_user'::name THEN card.gateway_data
            ELSE (((((card.gateway_data - 'id'::text) - 'object'::text) - 'date_created'::text) - 'date_updated'::text) - 'fingerprint'::text)
        END AS gateway_data,
        CASE "current_user"()
            WHEN 'platform_user'::name THEN card.data
            ELSE NULL::jsonb
        END AS data,
    card.created_at
   FROM payment_service.credit_cards card
  WHERE (card.saved_in_process 
        AND (card.platform_id = core.current_platform_id()) AND
        CASE "current_user"()
            WHEN 'platform_user'::name THEN true
            ELSE (card.user_id = core.current_user_id())
        END)
    order by card.created_at desc;
comment on view payment_service_api.saved_credit_cards is 'list all saved cards from current_user (scoped_user) or from all users on platform(platform_user)';
grant select on payment_service_api.saved_credit_cards to platform_user, scoped_user;