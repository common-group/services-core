-- Your SQL goes here

CREATE OR REPLACE FUNCTION payment_service_api."cancel_subscription"(id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _subscription payment_service.subscriptions;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            -- check if subscription belongs to current user
            if current_role = 'scoped_user' then
                select * from payment_service.subscriptions
                    where user_id = core.current_user_id()
                    and payment_service.subscriptions.id = $1
                        and platform_id = core.current_platform_id()
                    into _subscription;
                    
                if _subscription.id is null then
                    raise 'subscription not found';
                end if;
            elsif current_role = 'platform_user' then
              select * from payment_service.subscriptions
              where payment_service.subscriptions.id = $1
              and platform_id = core.current_platform_id()
              into _subscription;

              if _subscription.id is null then
                raise 'subscription not found';
              end if;
            end if;

            -- change subscription status to canceled
            if _subscription.id is not null then
              perform payment_service.transition_to(_subscription, 'canceling', row_to_json(_subscription.*));
            end if;

            select json_build_object(
            'id', _subscription.id,
            'status', _subscription.status
            ) into _result;
            return _result;
        end;
    $_$;


GRANT ALL ON FUNCTION payment_service_api."cancel_subscription"(id uuid) TO scoped_user;
GRANT ALL ON FUNCTION payment_service_api."cancel_subscription"(id uuid) TO platform_user;

grant all on payment_service.subscription_status_transitions to scoped_user, platform_user, admin;
