-- Your SQL goes here

-- add missing grant for execute create_payment has scoped_user
grant usage on schema platform_service to scoped_user;
grant select on platform_service.platforms to scoped_user;

create type payment_service.subscription_status as enum (
    'started',
    'active',
    'inactive',
    'canceled',
    'deleted',
    'error'
);

update payment_service.subscriptions
    set status = 'started'
    where status = 'pending';
alter table payment_service.subscriptions
    alter column status set default 'started'::payment_service.subscription_status;

alter table payment_service.subscriptions
    alter column status type payment_service.subscription_status using (status::payment_service.subscription_status);

create table payment_service.subscription_status_transitions (
    id bigserial primary key,
    subscription_id bigint not null references payment_service.subscriptions(id),
    from_status payment_service.subscription_status not null,
    to_status payment_service.subscription_status not null,
    data jsonb not null default '{}',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()    
);

create or replace function payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json)
    returns boolean
    language plpgsql
    volatile
    as $$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;

            -- generate a new subscription status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the subscription status
            update payment_service.subscriptions
                set status = $2
                where id = $1.id;

            return true;
        end;
    $$;
comment on function payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json)
    is 'subscription state machine';

DROP FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json);

CREATE OR REPLACE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;
            
            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2
                where id = $1.id;

            return true;
        end;
    $function$;
comment on function payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json) is 'payment state machine';