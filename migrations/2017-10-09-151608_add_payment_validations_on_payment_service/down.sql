-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION payment_service_api.create_payment(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
    $function$;

drop function core.user_exists_on_platform(bigint, integer);
drop function payment_service.check_and_generate_payment_data(json);
drop function core_validator.raise_when_empty(text, text);
drop function core_validator.is_empty(text);
drop schema core_validator;