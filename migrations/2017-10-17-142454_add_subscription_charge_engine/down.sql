-- This file should undo anything in `up.sql`
drop function payment_service.subscriptions_charge(interval);
drop function payment_service.paid_transition_at(payment_service.catalog_payments);