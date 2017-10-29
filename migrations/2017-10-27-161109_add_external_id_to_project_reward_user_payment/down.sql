-- This file should undo anything in `up.sql`
alter table community_service.users
    drop constraint uniq_users_ext_id,
    drop column external_id;

alter table project_service.projects
    drop constraint uniq_projects_ext_id,
    drop column external_id;

alter table payment_service.catalog_payments
    drop constraint uniq_payments_ext_id,
    drop column external_id;

alter table project_service.rewards
    drop constraint uniq_rewards_ext_id,
    drop column external_id,
    drop column platform_id;