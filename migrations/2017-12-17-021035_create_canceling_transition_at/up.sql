-- Your SQL goes here

CREATE OR REPLACE FUNCTION payment_service.canceling_transition_at(subscription payment_service.subscriptions) RETURNS timestamp without time zone
LANGUAGE sql STABLE
AS $_$
select created_at from payment_service.subscription_status_transitions
where subscription_id = $1.id
and to_status = 'canceling'::payment_service.subscription_status
order by created_at desc limit 1;
$_$;
