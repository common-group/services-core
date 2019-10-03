-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.get_last_paid_payment(subscription_id uuid)
 RETURNS SETOF payment_service.catalog_payments
 LANGUAGE sql
 STABLE
AS $function$

        SELECT 
            *
        FROM payment_service.catalog_payments cp
        WHERE cp.subscription_id = $1 AND cp.status = 'paid'::payment_service.payment_status
        ORDER BY cp.created_at DESC
        LIMIT 1;
    $function$;
