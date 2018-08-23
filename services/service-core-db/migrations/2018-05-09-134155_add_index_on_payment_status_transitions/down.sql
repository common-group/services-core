-- This file should undo anything in `up.sql`

drop index payment_service.transition_catalog_payment_id_uidx;
drop index payment_service.transition_to_status_uidx;
drop index payment_service.transition_from_status_uidx;
drop index payment_service.transition_catalog_payment_id_to_status_uidx;
drop index payment_service.transition_catalog_payment_id_to_status_from_status_uidx;