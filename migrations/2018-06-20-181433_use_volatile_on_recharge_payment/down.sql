-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION payment_service_api.recharge_subscription(subscription_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
    declare
        _subscription payment_service.subscriptions;
        _recharged_payment payment_service.catalog_payments;
    begin
        -- ensure that roles com from any permitted
        perform core.force_any_of_roles('{platform_user, scoped_user}');

        -- get subscription by id
        select * from payment_service.subscriptions 
            where id = $1 and platform_id = core.current_platform_id()
            into _subscription;

        -- raise error when subscription not found or not from the same user when scoped_user
        if _subscription.id is null OR (
            current_role = 'scoped_user' and not core.is_owner_or_admin(_subscription.user_id)) then
            raise 'subscription_not_found';
        end if;
        
        -- try recharge payment
        _recharged_payment := payment_service.recharge_subscription(_subscription);
        
        return json_build_object(
            'catalog_payment_id', _recharged_payment.id,
            'subscription_id', _subscription.id
        );
    end;
$function$;