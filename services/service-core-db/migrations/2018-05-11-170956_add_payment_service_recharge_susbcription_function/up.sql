create or replace function payment_service.recharge_subscription(payment_service.subscriptions)
returns payment_service.catalog_payments 
language plpgsql 
as $$
    declare
        _last_payment payment_service.catalog_payments;
        _generated_payment payment_service.catalog_payments;
    begin
        -- get last payment from subscription
        select * from payment_service.catalog_payments
            where subscription_id = $1.id order by created_at desc
            limit 1 into _last_payment;

        -- if last payment is pending and is a boleto
        if _last_payment.status = 'pending' and $1.checkout_data->> 'payment_method'::text  = 'boleto' then
            -- if boleto expiration date already in past turn payment to refused and generate a new payment for subscription
            if (_last_payment.gateway_general_data->>'boleto_expiration_date')::date <= now()::date then
                -- turn current payment to refused
                if payment_service.transition_to(_last_payment, 'refused', row_to_json(_last_payment)) then
                    -- generate a new payment
                    _generated_payment := payment_service.generate_new_catalog_payment($1);
                end if;
            else
                -- return last payment when still not expired
                _generated_payment := _last_payment;
            end if;
        -- if last payment is refused should generate new payment
        elsif _last_payment.status = 'refused' then
            -- generate a new payment
            _generated_payment := payment_service.generate_new_catalog_payment($1);
        -- when not match with any conditions should return the last payment
        else
            _generated_payment := _last_payment;
        end if;

        return _generated_payment;
    end;
$$;