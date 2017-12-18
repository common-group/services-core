-- This file should undo anything in `up.sql`

DROP FUNCTION payment_service_api."cancel_subscription"(id uuid);
