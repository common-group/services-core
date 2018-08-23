-- Your SQL goes here
alter table payment_service.payment_status_transitions
    add constraint fk_catalog_payment_id foreign key (catalog_payment_id) references payment_service.catalog_payments(id);

alter table payment_service.subscription_status_transitions
    add constraint fk_subscription_id foreign key (subscription_id) references payment_service.subscriptions(id);