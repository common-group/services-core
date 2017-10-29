-- Your SQL goes here
alter table community_service.users
    add column external_id text,
    add constraint uniq_users_ext_id unique (platform_id, external_id);

alter table project_service.projects
    add column external_id text,
    add constraint uniq_projects_ext_id unique (platform_id, external_id);

alter table payment_service.catalog_payments
    add column external_id text,
    add constraint uniq_payments_ext_id unique (platform_id, external_id);

alter table project_service.rewards
    add column platform_id integer not null references platform_service.platforms(id),
    add column external_id text,
    add constraint uniq_rewards_ext_id unique (platform_id, external_id);
