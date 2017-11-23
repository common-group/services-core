-- This file should undo anything in `up.sql`
drop index notification_service.uniq_label_per_global_template;
drop index notification_service.uniq_label_per_platform_on_n_template;

alter table notification_service.notification_global_templates
    drop column subject;

alter table notification_service.notification_templates
    drop column subject;

alter table notification_service.notification_templates
    drop column subject;