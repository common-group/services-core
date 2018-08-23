-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service_api.cancel_subscription(id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _subscription payment_service.subscriptions;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            select * from payment_service.subscriptions s
                where core.is_owner_or_admin(s.user_id)
                    and s.id = $1 
                    and s.platform_id = core.current_platform_id()
                into _subscription;
                
            if _subscription.id is null then
                raise 'subscription not found';
            end if;

            -- change subscription status to canceled
            perform payment_service.transition_to(_subscription, 'canceling', row_to_json(_subscription.*));

            select json_build_object(
            'id', _subscription.id,
            'status', _subscription.status
            ) into _result;
            return _result;
        end;
    $function$;