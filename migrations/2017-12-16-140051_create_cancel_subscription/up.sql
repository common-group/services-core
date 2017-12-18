-- Your SQL goes here

-- cannot run this inside a migration
--ALTER TYPE payment_service.subscription_status ADD VALUE 'canceling' BEFORE 'canceled';

--workaround
INSERT INTO pg_enum (enumtypid, enumlabel, enumsortorder)
SELECT 'payment_service.subscription_status'::regtype::oid, 'canceling', ( SELECT MAX(enumsortorder) + 1 FROM pg_enum WHERE enumtypid = 'payment_service.subscription_status'::regtype )
