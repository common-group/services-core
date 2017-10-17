-- This file should undo anything in `up.sql`

drop function payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json);

drop table payment_service.subscription_status_transitions;

alter table payment_service.subscriptions
    alter column status type text using status::text,
    alter column status set default 'started'::text;

update payment_service.subscriptions
    set status = 'started'
    where status = 'pending';

drop type payment_service.subscription_status;

DROP FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json);

CREATE OR REPLACE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                raise 'payment already is this state';
            end if;
            
            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2
                where id = $1.id;
        end;
    $function$
;