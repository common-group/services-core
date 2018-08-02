-- Your SQL goes here

ALTER TABLE payment_service.catalog_payments
  ADD COLUMN contribution_id uuid;

ALTER TABLE payment_service.catalog_payments ADD FOREIGN KEY (contribution_id) REFERENCES payment_service.contributions(id);
