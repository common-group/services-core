-- This file should undo anything in `up.sql`
delete from notification_service.notification_global_templates
    where label = 'refused_subscription_card_payment';