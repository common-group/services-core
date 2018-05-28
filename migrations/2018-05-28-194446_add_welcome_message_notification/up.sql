-- Your SQL goes here
insert into notification_service.notification_global_templates
    (label, subject, template) values
    ('reward_welcome_message', '{{reward.welcome_message_subject}}', '{{reward.welcome_message_body}}');
