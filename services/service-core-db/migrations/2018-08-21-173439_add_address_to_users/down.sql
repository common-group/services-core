-- This file should undo anything in `up.sql`

alter table community_service.users
      drop column address_id;
