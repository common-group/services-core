-- Your SQL goes here

CREATE OR REPLACE VIEW "notification_service_api"."user_notifications" AS 
 SELECT n.id,
    n.user_id,
    n.created_at,
    COALESCE(label, global_template_label) as label
   FROM notification_service.user_catalog_notifications n
  WHERE n.platform_id = core.current_platform_id() AND core.is_owner_or_admin(n.user_id) ;

grant select on "notification_service_api"."user_notifications" to admin, platform_user, scoped_user;
