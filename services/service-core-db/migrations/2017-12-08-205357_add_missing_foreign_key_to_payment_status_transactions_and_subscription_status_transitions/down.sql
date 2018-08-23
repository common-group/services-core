-- This file should undo anything in `up.sql`
alter table payment_service.payment_status_transitions 
    drop constraint fk_catalog_payment_id;

alter table payment_service.subscription_status_transitions
    drop constraint fk_subscription_id;