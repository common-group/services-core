CREATE OR REPLACE FUNCTION payment_service_api.set_subscription_anonymity(subscription_id uuid, set_anonymity_state boolean)
    RETURNS jsonb
    LANGUAGE plpgsql
    
AS $function$
    declare
        _subscription payment_service.subscriptions;
        _anonymity_state boolean;
    begin
    
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');
        
        -- state to update
        _anonymity_state := set_anonymity_state;
        
        -- get subscriptions
        select * from payment_service.subscriptions s
            where core.is_owner_or_admin(s.user_id)
                and s.id = subscription_id
                and s.platform_id = core.current_platform_id()
                and s.status <> 'deleted'
            into _subscription;
            
        -- check if subscription is present
        if _subscription.id is null then
            raise 'subscription_not_found';
        end if;
        
        if _subscription.checkout_data->>'anonymous' <> _anonymity_state::text then
            update payment_service.subscriptions 
                set checkout_data = jsonb_set(checkout_data, '{anonymous}', TO_JSONB(_anonymity_state), false) where id = _subscription.id;
        end if;
        
        return json_build_object('anonymous', _anonymity_state);
        
    end;
$function$
;

grant execute on function payment_service_api.set_subscription_anonymity(uuid, boolean) to anonymous, scoped_user, platform_user;