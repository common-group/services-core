-- Your SQL goes here
alter table community_service.users
      add column address_id uuid,
      add constraint address_id_fk
      foreign key (address_id)
      references community_service.addresses (id);
