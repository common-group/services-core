-- This file should undo anything in `up.sql`

DROP FUNCTION payment_service.confirmed_states();
DROP FUNCTION payment_service.was_confirmed(payment_service.contributions);
DROP FUNCTION payment_service.is_confirmed(payment_service.contributions);
