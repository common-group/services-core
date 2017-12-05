BEGIN;
    select plan(19);

    create or replace function _json_data_payment(json) returns json
    language plpgsql as $$
    declare
    data json;
    begin
        data := json_build_object(
            'current_ip', '127.0.0.1',
            'anonymous', false,
            'subscription', false,
            'user_id', 'd44378a2-3637-447c-9f57-dc20fff574db',
            'project_id', '52273d0a-1610-4f48-9239-e96e5861c3d3',
            'amount', 2400,
            'payment_method', 'boleto',
            'customer', json_build_object(
                'name', (case 
                when $1::jsonb ?| '{customer_name}' then
                    $1->>'customer_name'::text
                else 'Teste da silva' end) ,
                'email', (case 
                when $1::jsonb ?| '{customer_email}' then
                    $1->>'customer_email'::text
                else 'test@tesemail.com' end) ,
                'document_number', (case 
                when $1::jsonb ?| '{customer_document_number}' then
                    $1->>'customer_document_number'::text
                else '889.851.228-78' end) ,
                'address', json_build_object(
                    'street', (case 
                    when $1::jsonb ?| '{customer_address_street}' then
                        $1->>'customer_address_street'::text
                    else 'Rua lorem ipsum' end) ,
                    'street_number', (case 
                    when $1::jsonb ?| '{customer_address_street_number}' then
                        $1->>'customer_address_street_number'::text
                    else '200' end) ,
                    'neighborhood', (case 
                    when $1::jsonb ?| '{customer_address_neighborhood}' then
                        $1->>'customer_address_neighborhood'::text
                    else 'bairro' end) ,
                    'zipcode', (case 
                    when $1::jsonb ?| '{customer_address_zipcode}' then
                        $1->>'customer_address_zipcode'::text
                    else '33600000' end) ,
                    'city', (case 
                    when $1::jsonb ?| '{customer_address_city}' then
                        $1->>'customer_address_city'::text
                    else 'loem city' end) ,
                    'state', (case 
                    when $1::jsonb ?| '{customer_address_state}' then
                        $1->>'customer_address_state'::text
                    else 'Minas gerais' end) ,
                    'country', (case 
                    when $1::jsonb ?| '{customer_address_country}' then
                        $1->>'customer_address_country'::text
                    else 'Brasil' end) ,
                    'complementary', (case 
                    when $1::jsonb ?| '{customer_address_complementary}' then
                        $1->>'customer_address_complementary'::text
                    else 'casa' end)
                ),
                'phone', json_build_object(
                    'ddi', (case 
                    when $1::jsonb ?| '{customer_phone_ddi}' then
                        $1->>'customer_phone_ddi'::text
                    else '55' end) ,
                    'ddd', (case 
                    when $1::jsonb ?| '{customer_phone_ddd}' then
                        $1->>'customer_phone_ddd'::text
                    else '21' end) ,
                    'number', (case 
                    when $1::jsonb ?| '{customer_phone_number}' then
                        $1->>'customer_phone_number'::text
                    else '982402833' end)
                )
            )
        );

        data := (data::jsonb || $1::jsonb)::json;

        return data;
    end;
    $$;

    -- check function signature
    SELECT function_returns(
        'payment_service', '_serialize_payment_basic_data', ARRAY['json'], 'json' 
    );

    prepare generate_data as select * from payment_service._serialize_payment_basic_data(_json_data_payment($1::json));

    create or replace function test_serialize_with_valid_data()
    returns setof text language plpgsql as $$
    declare
    begin
        -- test with valid params
        return next lives_ok('EXECUTE generate_data(''{}'')');
    end;
    $$;
    select test_serialize_with_valid_data();

    create or replace function test_serialize_with_invalid_data()
    returns setof text language plpgsql as $$
    declare
    begin
        -- test with invalid params
        -- should raise for missing any parameters that should be required
        return next throws_matching(
            'EXECUTE generate_data(''{"current_ip": null}'')',
            '.+ip_address',
            'raise whem missing ip_address'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"anonymous": null}'')',
            '.+anonymous',
            'raise whem missing anonymous'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"amount": null}'')',
            '.+amount',
            'raise whem missing amount'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"payment_method": null}'')',
            '.+payment_method',
            'raise whem missing payment_method'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_email": null}'')',
            '.+email',
            'raise whem missing email'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_name": null}'')',
            '.+name',
            'raise whem missing name'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_document_number": null}'')',
            '.+document_number',
            'raise whem missing document_number'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_street": null}'')',
            '.+street',
            'raise whem missing street'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_street_number": null}'')',
            '.+street_number',
            'raise whem missing street_number'
        );


        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_neighborhood": null}'')',
            '.+neighborhood',
            'raise whem missing neighborhood'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_city": null}'')',
            '.+city',
            'raise whem missing city'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_state": null}'')',
            '.+state',
            'raise whem missing state'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_country": null}'')',
            '.+country',
            'raise whem missing country'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_address_zipcode": null}'')',
            '.+zipcode',
            'raise whem missing zipcode'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_phone_ddi": null}'')',
            '.+ddi',
            'raise whem missing phone ddi'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_phone_ddd": null}'')',
            '.+ddd',
            'raise whem missing phone ddd'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_phone_number": null}'')',
            '.+number',
            'raise whem missing phone number'
        );

    end;
    $$;
    select test_serialize_with_invalid_data();

    -- test with invalid params
    select * from finish();
ROLLBACK;
