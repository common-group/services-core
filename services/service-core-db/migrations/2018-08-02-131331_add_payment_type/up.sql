-- Your SQL goes here

INSERT INTO pg_enum (enumtypid, enumlabel, enumsortorder)
    SELECT 'payment_service.payment_status'::regtype::oid, 'pending_refund', ( SELECT MAX(enumsortorder) + 1 FROM pg_enum WHERE enumtypid = 'payment_service.payment_status'::regtype )
