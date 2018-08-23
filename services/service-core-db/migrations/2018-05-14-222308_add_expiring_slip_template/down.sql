-- This file should undo anything in `up.sql`
-- Your SQL goes here
delete from notification_service.notification_global_templates
where label = 'expiring_slip';
