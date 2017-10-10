-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.user_exists_on_platform(user_id bigint, platform_id integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $$
    select exists(
        select true
        from community_service.users u
            where u.id = $1
                and u.platform_id = $2
    )
$$
;
comment on function core.user_exists_on_platform(user_id bigint, platform_id integer) is 'Check if user_id exists on platform';

create schema core_validator;
grant usage on schema core_validator to postgrest, scoped_user, admin, platform_user;
create or replace function core_validator.raise_when_empty(_value text, _label text) returns text
    language plpgsql
    immutable
    as $$
        declare
        begin
            if nullif(btrim(_value, ' '), '') is null then
                raise 'missing field %', _label;
            end if;
            
            return btrim(_value, ' ');
        end;
    $$;
comment on function core_validator.raise_when_empty(_value text, _label text) is 'Raise when value::text is missing';

create or replace function core_validator.is_empty(_value text) returns boolean
    language sql
    immutable
    as $$
        select nullif(btrim(_value, ' '), '') is null;
    $$;
comment on function core_validator.is_empty(_value text) is 'check if a text is empty';

create or replace function payment_service.check_and_generate_payment_data(data json)
    returns json
    language plpgsql
    stable
    as $$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', core_validator.raise_when_empty(($1->>'current_ip')::text, 'ip_address'),
                'amount', core_validator.raise_when_empty((($1->>'amount')::integer)::text, 'amount'),
                'payment_method', core_validator.raise_when_empty(lower(($1->>'payment_method')::text), 'payment_method'),
                'customer', json_build_object(
                    'name', core_validator.raise_when_empty(($1->'customer'->>'name')::text, 'name'),
                    'email', core_validator.raise_when_empty(($1->'customer'->>'email')::text, 'email'),
                    'document_number', core_validator.raise_when_empty(($1->'customer'->>'document_number')::text, 'document_number'),
                    'address', json_build_object(
                        'street', core_validator.raise_when_empty(($1->'customer'->'address'->>'street')::text, 'street'),
                        'street_number', core_validator.raise_when_empty(($1->'customer'->'address'->>'street_number')::text, 'street_number'),
                        'neighborhood', core_validator.raise_when_empty(($1->'customer'->'address'->>'neighborhood')::text, 'neighborhood'),
                        'zipcode', core_validator.raise_when_empty(($1->'customer'->'address'->>'zipcode')::text, 'zipcode'),
                        'country', core_validator.raise_when_empty(($1->'customer'->'address'->>'country')::text, 'country'),
                        'state', core_validator.raise_when_empty(($1->'customer'->'address'->>'state')::text, 'state'),
                        'city', core_validator.raise_when_empty(($1->'customer'->'address'->>'city')::text, 'city'),
                        'complementary', ($1->'customer'->'address'->>'complementary')::text
                    ),
                    'phone', json_build_object(
                        'ddi', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddi')::text, 'phone_ddi'),
                        'ddd', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddd')::text, 'phone_ddd'),
                        'number', core_validator.raise_when_empty(($1->'customer'->'phone'->>'number')::text, 'phone_number')
                    )
                )
            ) into _result;

            return _result;
        end;
    $$;
comment on function payment_service.check_and_generate_payment_data(json) is 'check and generate a json structure with correct payment data';

CREATE OR REPLACE FUNCTION payment_service_api.create_payment(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _payment payment_service.catalog_payments;
            _user_id bigint;
            _user community_service.users;
            _project project_service.projects;
            _subscription payment_service.subscriptions;
            _refined jsonb;
        begin
            -- check roles to define how user_id is set
            if current_role = 'platform_user' or current_role = 'admin' then
                _user_id := ($1 ->> 'user_id')::bigint;
            else
                _user_id := core.current_user_id();
            end if;
            
            -- check if project exists on platform
            if ($1->>'project_id') is null 
                OR not core.project_exists_on_platform(($1->>'project_id')::bigint, core.current_platform_id()) then
                raise exception 'project not found on platform';
            end if;

            -- check if user exists on current platform
            if _user_id is null or not core.user_exists_on_platform(_user_id, core.current_platform_id()) then
                raise exception 'missing user';
            end if;
            
            -- set user into variable
            select * 
            from community_service.users 
            where id = _user_id
            into _user;
            
            -- fill ip address to received params
            select jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(current_setting('request.header.x-forwarded-for', true)::text))
                into _refined;
            
            -- if user already has filled document_number/name/email should use then
            if not core_validator.is_empty((_user.data->>'name')::text) then
                select jsonb_set(_refined, '{customer,name}', to_jsonb(_user.data->>'name'::text))
                    into _refined;
            end if;
            
            if not core_validator.is_empty((_user.data->>'email')::text) then
                select jsonb_set(_refined, '{customer,email}', to_jsonb(_user.data->>'email'::text))
                    into _refined;
            end if;
            
            if not core_validator.is_empty((_user.data->>'email')::text) then
                select jsonb_set(_refined, '{customer,document_number}', to_jsonb(_user.data->>'document_number'::text))
                    into _refined;                
            end if;
            
            -- generate a base structure to payment json
            select (payment_service.check_and_generate_payment_data((_refined)::json))::jsonb
                into _refined;
                
            -- insert payment in table
            insert into payment_service.catalog_payments (
                platform_id, project_id, user_id, data, gateway
            ) values (
                core.current_platform_id(),
                ($1->>'project_id')::bigint,
                _user_id,
                _refined,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;

            -- check if payment is a subscription to create one
            if ($1->>'subscription')::boolean then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            -- build result json with payment_id and subscription_id
            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id
            ) into _result;

            -- notify to backend processor via listen
            PERFORM pg_notify('process_payments_channel', _result::text);

            return _result;
        end;
    $function$;
