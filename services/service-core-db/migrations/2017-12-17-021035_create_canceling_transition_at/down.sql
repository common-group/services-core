-- This file should undo anything in `up.sql`
DROP FUNCTION payment_service.canceling_transition_at(subscription payment_service.subscriptions);
