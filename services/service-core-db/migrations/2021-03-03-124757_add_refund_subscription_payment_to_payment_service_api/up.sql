-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service_api.refund_subscription_payment(id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _catalog_payment payment_service.catalog_payments;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');

            select * from payment_service.catalog_payments cp
                where cp.id = $1 and cp.platform_id = core.current_platform_id()
                into _catalog_payment;

            if _catalog_payment.id is null then
                raise 'catalog payment not found';
            end if;

            -- change subscription status to refunded
            perform payment_service.transition_to(_catalog_payment, 'refunded', row_to_json(_catalog_payment.*));

            select json_build_object(
            'id', _catalog_payment.id,
            'status', _catalog_payment.status
            ) into _result;
            return _result;
        end;
    $function$;
