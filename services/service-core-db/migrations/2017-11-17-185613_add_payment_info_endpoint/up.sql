-- Your SQL goes here
create or replace function payment_service_api.payment_info(id uuid)
    returns json
    language plpgsql
    stable
    as $$
        declare
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');
            
            -- build json based on payment found with given id
            select 
                json_build_object(
                    'id', cp.id,
                    'subscription_id', cp.subscription_id,
                    'user_id', cp.user_id,
                    'status', cp.status,
                    'gateway_errors', (case cp.status when 'error' then cp.gateway_cached_data else null::jsonb end),
                    'created_at', cp.created_at,
                    'boleto_url', cp.gateway_general_data ->> 'boleto_url',
                    'boleto_barcode', cp.gateway_general_data ->> 'boleto_barcode',
                    'boleto_expiration_date', cp.gateway_general_data ->> 'boleto_expiration_date',
                    'gateway_refuse_reason', cp.gateway_general_data ->> 'gateway_refuse_reason', 
                    'gateway_status_reason', cp.gateway_general_data ->> 'gateway_status_reason',
                    'card_brand', cp.gateway_general_data ->> 'card_brand',
                    'card_country', cp.gateway_general_data ->> 'card_country',
                    'card_first_digits', cp.gateway_general_data ->> 'card_first_digits',
                    'card_last_digits', cp.gateway_general_data ->> 'card_last_digits',
                    'gateway_payment_method', cp.gateway_general_data ->> 'gateway_payment_method'
                )
                from payment_service.catalog_payments cp
                    where cp.id = $1
                        and cp.platform_id = core.current_platform_id()
                        and core.is_owner_or_admin(cp.user_id)
                into _result;
            
            return _result;
        end;
    $$;