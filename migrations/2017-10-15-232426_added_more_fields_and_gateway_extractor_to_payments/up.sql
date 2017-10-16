-- Your SQL goes here
alter table payment_service.catalog_payments
    add column if not exists common_contract_data jsonb not null default '{}',
    add column if not exists gateway_general_data jsonb not null default '{}';

create or replace function payment_service._extract_from_gateway_to_data(gateway text, gateway_data json)
    returns json
    language plpgsql
    stable
    as $$
        declare
        begin
            return (
                case $1
                when 'pagarme' then 
                    payment_service.__extractor_for_pagarme($2)
                else 
                    null::json
                end
            );
        end;
    $$;
comment on function payment_service._extract_from_gateway_to_data(gateway text, gateway_data json) is 'route gateway response data to a extractor to generate default structure over payment';

create or replace function payment_service.__extractor_for_pagarme(gateway_data json)
    returns json
    language plpgsql
    stable
    as $$
        declare
            _transaction json;
            _payables json;
            _payable_data record;
        begin
            _transaction := ($1->>'transaction')::json;
            _payables := ($1->>'payables')::json;

            -- build basic payable data to reuse on default strcuture
            select sum((p->>'fee')::decimal) as total_fee, 
                max((p->>'payment_date')) as last_payable_date,
                min((p->>'payment_date')) as first_payable_date,
                array_to_json(array_agg(json_build_object(
                    'id', (p->>'id')::text,
                    'type', (p->>'type')::text,
                    'status', (p->>'status')::text,
                    'installment', (p->>'installment')::integer,
                    'payment_date', (p->>'payment_date')::timestamp,
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
                'boleto_expiration_date', (_transaction ->> 'boleto_expiration_date')::timestamp,
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
                'payable_total_fee', _payable_data.total_fee::decimal,
                'payable_first_compensation_date', _payable_data.first_payable_date::timestamp,
                'payable_last_compensation_date', _payable_data.last_payable_date::timestamp,
                'payables', _payable_data.payables::json
            );
        end;
    $$;

comment on function payment_service.__extractor_for_pagarme(gateway_data json) is 'generate basic gateway_data structure for gateways';