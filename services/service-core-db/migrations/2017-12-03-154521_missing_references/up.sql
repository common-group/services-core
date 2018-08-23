-- Your SQL goes here
alter table platform_service.platform_users
    add constraint platform_id_fk foreign key (platform_id) references platform_service.platforms(id),
    add constraint user_id_fk foreign key (user_id) references platform_service.users(id);