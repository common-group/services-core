-- Your SQL goes here
create type payment_service.payment_status as enum (
    'pending',
    'paid',
    'refused',
    'refunded',
    'chargedback',
    'deleted',
    'error'
);

alter table payment_service.catalog_payments
    add column status payment_service.payment_status not null default 'pending';

create table payment_service.payment_status_transitions (
    id bigserial primary key,
    catalog_payment_id bigint not null references payment_service.catalog_payments(id),
    from_status payment_service.payment_status not null,
    to_status payment_service.payment_status not null,
    data jsonb not null default '{}',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
comment on table payment_service.payment_status_transitions is 'store the payment status changes';

create or replace function payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
    returns void
    language plpgsql
    volatile
    as $$
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
    $$;
comment on function payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
    is 'payment state machine';