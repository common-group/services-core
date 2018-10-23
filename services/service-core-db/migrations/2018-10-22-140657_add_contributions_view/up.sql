CREATE OR REPLACE VIEW "payment_service_api"."contributions" AS 
 SELECT c.id,
    c.external_id,
    c.project_id,
    c.user_id,
    c.reward_id,
    c.value,
    c.created_at,
    c.updated_at
   FROM payment_service.contributions c
  WHERE core.has_any_of_roles('{platform_user,scoped_user}'::text[])
  ORDER BY c.id DESC;

GRANT SELECT ON payment_service_api.contributions TO platform_user;
GRANT SELECT ON payment_service_api.contributions TO scoped_user;
