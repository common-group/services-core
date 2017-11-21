-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.__extractor_for_pagarme(gateway_data json)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _transaction json;
            _payables json;
            _payable_data record;
        begin
            _transaction := ($1->>'transaction')::json;
            _payables := ($1->>'payables')::json;

            -- build basic payable data to reuse on default strcuture
            select sum((p->>'fee')::decimal) as total_fee, 
                max(nullif((p->>'payment_date')::text, '')::timestamp) as last_payable_date,
                min(nullif((p->>'payment_date')::text, '')::timestamp) as first_payable_date,
                array_to_json(array_agg(json_build_object(
                    'id', (p->>'id')::text,
                    'type', (p->>'type')::text,
                    'status', (p->>'status')::text,
                    'installment', (p->>'installment')::integer,
                    'payment_date', nullif((p->>'payment_date')::text, '')::timestamp,
                    'transaction_id', (p->>'transaction_id')::text,
                    'anticipation_fee', (p->>'anticipation_fee')::text
                ))) as payables
                from json_array_elements(_payables) as p
                into _payable_data;

            -- build payment basic stucture from gateway
            return json_build_object(
                'gateway_ip', _transaction ->> 'ip'::text,
                'gateway_id', _transaction ->> 'id'::text,
                'gateway_cost', (_transaction ->> 'cost')::decimal,
                'gateway_payment_method', (_transaction ->> 'payment_method')::text,
                'gateway_status', (_transaction ->> 'status')::text,
                'gateway_status_reason', (_transaction ->> 'status_reason')::text,
                'gateway_refuse_reason', (_transaction ->> 'refuse_reason')::text,
                'gateway_acquirer_response_code', (_transaction ->> 'acquirer_response_code')::text,
                'boleto_url', (_transaction ->> 'boleto_url')::text,
                'boleto_barcode', (_transaction ->> 'boleto_barcode')::text,
                'boleto_expiration_date', nullif((_transaction ->> 'boleto_expiration_date')::text, '')::timestamp,
                'installments', (_transaction ->> 'installments')::text,
                'customer_name', (_transaction -> 'customer' ->> 'name')::text,
                'customer_email', (_transaction -> 'customer' ->> 'email')::text,
                'customer_document_number', (_transaction -> 'customer' ->> 'document_number')::text,
                'customer_document_type', (_transaction -> 'customer' ->> 'document_type')::text,
                'card_id', (_transaction -> 'card' ->> 'id')::text,
                'card_holder_name', (_transaction -> 'card' ->> 'holder_name')::text,
                'card_first_digits', (_transaction -> 'card' ->> 'first_digits')::text,
                'card_last_digits', (_transaction -> 'card' ->> 'last_digits')::text,
                'card_fingerprint', (_transaction -> 'card' ->> 'fingerprint')::text,
                'card_country', (_transaction -> 'card' ->> 'country')::text,
                'card_brand', (_transaction -> 'card' ->> 'brand')::text,
                'payable_total_fee', _payable_data.total_fee::decimal,
                'payable_first_compensation_date', _payable_data.first_payable_date,
                'payable_last_compensation_date', _payable_data.last_payable_date,
                'payables', _payable_data.payables::json
            );
        end;
    $function$;

