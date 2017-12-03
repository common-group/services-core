-- This file should undo anything in `up.sql`
alter table platform_service.platform_users
    drop constraint platform_id_fk,
    drop constraint user_id_fk;