-- This file should undo anything in `up.sql`
delete from notification_service.notification_global_templates
    where label = 'updated_subscription';