-- Your SQL goes here

CREATE OR REPLACE FUNCTION payment_service.confirmed_states()
 RETURNS payment_service.payment_status[]
 LANGUAGE sql
AS $function$
      SELECT '{"paid", "pending_refund", "refunded"}'::payment_service.payment_status[];
    $function$;

COMMENT ON FUNCTION payment_service.confirmed_states() is 'payment states that are considered confirmed';

CREATE OR REPLACE FUNCTION payment_service.was_confirmed(payment_service.contributions)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
            SELECT EXISTS (
              SELECT true
              FROM
                payment_service.catalog_payments p
              WHERE p.contribution_id = $1.id AND p.status = ANY(payment_service.confirmed_states())
            );
          $function$;

COMMENT ON FUNCTION payment_service.was_confirmed(payment_service.contributions) is 'returns true if contribution was paid once';

CREATE OR REPLACE FUNCTION payment_service.is_confirmed(payment_service.contributions)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
      SELECT EXISTS (
        SELECT true
        FROM
          payment_service.catalog_payments p
        WHERE p.contribution_id = $1.id AND p.status = 'paid'::payment_service.payment_status
      );
    $function$;
COMMENT ON FUNCTION payment_service.is_confirmed(payment_service.contributions) is 'returns true if contribution is paid';
