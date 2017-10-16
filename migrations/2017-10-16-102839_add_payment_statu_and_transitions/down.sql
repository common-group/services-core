-- This file should undo anything in `up.sql`
drop function payment_service.transition_to(payment_service.catalog_payments, payment_service.payment_status, json);
drop table payment_service.payment_status_transitions;
alter table payment_service.catalog_payments
    drop column status;

drop type payment_service.payment_status;