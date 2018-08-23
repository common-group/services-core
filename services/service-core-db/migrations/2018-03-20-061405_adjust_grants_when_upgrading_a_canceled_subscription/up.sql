-- Your SQL goes here
grant select, insert on notification_service.notifications to scoped_user, platform_user;
grant select on notification_service.notification_templates to scoped_user, platform_user;