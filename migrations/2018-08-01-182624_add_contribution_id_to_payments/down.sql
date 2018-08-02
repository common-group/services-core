-- This file should undo anything in `up.sql`

ALTER TABLE payment_service.catalog_payments
  DROP COLUMN contribution_id;
