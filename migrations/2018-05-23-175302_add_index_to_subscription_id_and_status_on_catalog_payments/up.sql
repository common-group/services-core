-- Your SQL goes here
create index idx_payment_subscription_id_and_status on payment_service.catalog_payments(subscription_id, status);