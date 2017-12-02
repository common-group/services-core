-- Your SQL goes here
create unique index uniq_label_per_platform_on_n_template on notification_service.notification_templates(platform_id, lower(label));
create unique index uniq_label_per_global_template on notification_service.notification_global_templates(lower(label));

alter table notification_service.notification_global_templates
    add column subject text not null;

alter table notification_service.notification_templates
    add column subject text not null;

alter table notification_service.notifications
    add column x_msg_id text;