-- This file should undo anything in `up.sql`
alter table payment_service.catalog_payments
    drop column common_contract_data,
    drop column gateway_general_data;

drop function payment_service._extract_from_gateway_to_data(text, json);
drop function payment_service.__extractor_for_pagarme(json);