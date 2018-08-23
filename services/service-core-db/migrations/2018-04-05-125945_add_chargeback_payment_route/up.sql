-- Your SQL goes here
create or replace function payment_service_api.chargeback_payment(id uuid)
returns json language plpgsql
as $$
    declare
        _payment payment_service.catalog_payments;
        _subscription payment_service.subscriptions;
    begin
        -- ensure that only platform_user can execute this
        perform core.force_any_of_roles('{platform_user}');

        -- find payment
        select * from payment_service.catalog_payments cp
            where cp.id = $1
                and cp.platform_id = core.current_platform_id()
            into _payment;

        if _payment.id is null then
            raise 'payment_not_found';
        end if;

        if _payment.status = 'chargedback' then
            raise 'payment_already_chargedback';
        end if;

        -- transition payment to chargeback
        perform payment_service.transition_to(_payment, 'chargedback', row_to_json(_payment));
        
        -- find subcscription when payment have a subscription
        if _payment.subscription_id is not null then
            -- if have subscription transition to inactive
            select * from payment_service.subscriptions s
                where s.id = _payment.subscription_id
                    and s.platform_id = _payment.platform_id
                into _subscription;

            if _subscription.id is not null then
                perform payment_service.transition_to(_subscription, 'inactive', row_to_json(_subscription));
            end if;
        end if;

        return json_build_object(
            'id', _payment.id,
            'subscription_id', _subscription.id
        );
    end;
$$;
grant execute on function payment_service_api.chargeback_payment(uuid) to platform_user;