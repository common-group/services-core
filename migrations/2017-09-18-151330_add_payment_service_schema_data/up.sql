-- Your SQL goes here
create schema payment_service;
create schema payment_service_api;
grant usage on schema payment_service to postgrest, admin, platform_user, scoped_user;
grant usage on schema payment_service_api to postgrest, admin, platform_user, scoped_user;


create table payment_service.credit_cards (
    id bigserial primary key,
    platform_id integer not null references platform_service.platforms(id),
    user_id bigint not null references community_service.users(id),
    gateway text not null,
    gateway_data jsonb not null default '{}',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
select diesel_manage_updated_at('payment_service.credit_cards');
comment on table payment_service.credit_cards is 'Store gateway credit_cards references';

create table payment_service.subscriptions (
    id bigserial primary key,
    platform_id integer not null references platform_service.platforms(id),
    project_id bigint not null references project_service.projects(id),
    user_id bigint not null references community_service.users(id),
    credit_card_id bigint references payment_service.credit_cards(id),
    status text not null default 'pending',
    current_period_start timestamp,
    current_period_end timestamp,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
select diesel_manage_updated_at('payment_service.subscriptions');
comment on table payment_service.subscriptions is 'Store payment subscriptions';

create table payment_service.subscription_transitions (
    id bigserial primary key,
    subscription_id bigserial not null references payment_service.subscriptions(id),
    to_status text not null,
    most_recent boolean not null default true,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

select diesel_manage_updated_at('payment_service.subscription_transitions');
comment on table payment_service.subscriptions is 'Store subscription transitions between charges';

create table payment_service.catalog_payments (
    id bigserial primary key,
    platform_id integer not null references platform_service.platforms(id),
    project_id bigint not null references project_service.projects(id),
    user_id bigint not null references community_service.users(id),
    subscription_id bigint references payment_service.subscriptions(id),
    data jsonb not null,
    gateway text not null,
    gateway_cached_data jsonb,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

select diesel_manage_updated_at('payment_service.catalog_payments');
comment on table payment_service.catalog_payments is 'Store initial payments data to sent to queue';

create or replace function payment_service_api.create_payment(data json)
    returns json
    language plpgsql
    volatile
    as $$
        declare
            _result json;
            _payment payment_service.catalog_payments;
            _user_id bigint;
            _project project_service.projects;
            _subscription payment_service.subscriptions;
        begin
            if current_role = 'platform_user' or current_role = 'admin' then
                _user_id := ($1 ->> 'user_id')::bigint;
            else
                _user_id := core.current_user_id();
            end if;

            if _user_id is null then
                raise exception 'missing user';
            end if;

            if ($1->>'project_id') is null OR not exists(select * from project_service.projects psp
                where psp.id = ($1->>'project_id')::bigint
                    and psp.platform_id = core.current_platform_id()) then
                raise exception 'project not found on platform';
            end if;

            insert into payment_service.catalog_payments (
                platform_id, project_id, user_id, data, gateway
            ) values (
                core.current_platform_id(),
                ($1->>'project_id')::bigint,
                _user_id,
                $1,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;

            if ($1->>'subscription')::boolean then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id
            ) into _result;

            PERFORM pg_notify('process_payments_channel', _result::text);

            return _result;
        end;
    $$;
comment on function payment_service_api.create_payment(json) is 'Catalog new payment for processing and return id';
grant insert, select, update on payment_service.catalog_payments to platform_user, scoped_user, admin;
grant insert, select, update on payment_service.subscriptions to platform_user, scoped_user, admin;
grant usage on sequence payment_service.catalog_payments_id_seq to platform_user, admin, scoped_user;
grant usage on sequence payment_service.subscriptions_id_seq to platform_user, admin, scoped_user;
grant execute on function payment_service_api.create_payment(json) to platform_user, scoped_user, admin;
