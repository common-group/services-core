BEGIN;
    -- import __json_data_payment from helpers
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(52);
    -- check function signature
    SELECT function_returns(
        'payment_service', '_serialize_subscription_basic_data', ARRAY['json'], 'json'
    );

    prepare generate_data as select * from payment_service._serialize_subscription_basic_data(__json_data_payment($1::json));

    create or replace function test_serialize_with_foreign_data()
    returns setof text language plpgsql as $$
        declare
            _result json;
            _expected json;
        begin
            -- test with valid params when foreign
            _expected := __json_data_payment(json_build_object(
                    'is_international', true,
                    'payment_method', 'credit_card',
                    'card_hash', 'some_card_hash',
                    'customer_document_number', '',
                    'credit_card_owner_document', '',
                    'customer_address_street_number', '',
                    'customer_address_neighborhood', '',
                    'customer_address_zipcode', '',
                    'customer_phone_ddi', '',
                    'customer_phone_ddd', '',
                    'customer_phone_number', ''
            ));

        -- check serialized structure
        _result := payment_service._serialize_payment_basic_data(_expected);

        return next is(_result ->> 'amount', _expected ->> 'amount');
        return next is(_result -> 'customer' ->> 'document_number', _expected -> 'customer'->>'document_number');
        end;
    $$;
    select * from test_serialize_with_foreign_data();

    create or replace function test_serialize_with_default_data()
    returns setof text language plpgsql as $$
    declare
        _result json;
        _default_data json;
        _expected json;
    begin
        _expected := __json_data_payment('{}'::json);
        _default_data := payment_service._serialize_subscription_basic_data(_expected);
        _result := payment_service._serialize_subscription_basic_data(__json_data_payment('{"payment_method": "credit_card"}'::json), _default_data);

        -- should change the payment method and mantain another fields with default
        return next is(_result ->> 'payment_method', 'credit_card');
        return next is(_result ->> 'amount', _default_data ->> 'amount');
        return next is((_result ->> 'is_international')::boolean, (_default_data ->> 'is_international')::boolean);
        return next is(_result -> 'customer' ->> 'name', _default_data -> 'customer' ->> 'name');
        return next is(_result -> 'customer' ->> 'document_number', _default_data -> 'customer' ->> 'document_number');
        return next is(_result -> 'customer' -> 'address' ->> 'street', _default_data -> 'customer' -> 'address' ->> 'street');
        return next is(_result -> 'customer' -> 'address' ->> 'street_number', _default_data -> 'customer' -> 'address' ->> 'street_number');
        return next is(_result -> 'customer' -> 'address' ->> 'neighborhood', _default_data -> 'customer' -> 'address' ->> 'neighborhood');
        return next is(_result -> 'customer' -> 'address' ->> 'zipcode', _default_data -> 'customer' -> 'address' ->> 'zipcode');
        return next is(_result -> 'customer' -> 'address' ->> 'country', _default_data -> 'customer' -> 'address' ->> 'country');
        return next is(_result -> 'customer' -> 'address' ->> 'country_en', _default_data -> 'customer' -> 'address' ->> 'country_en');
        return next is(_result -> 'customer' -> 'address' ->> 'state', _default_data -> 'customer' -> 'address' ->> 'state');
        return next is(_result -> 'customer' -> 'address' ->> 'city', _default_data -> 'customer' -> 'address' ->> 'city');
        return next is(_result -> 'customer' -> 'address' ->> 'complementary', _default_data -> 'customer' -> 'address' ->> 'complementary');
        return next is(_result -> 'customer' -> 'phone' ->> 'ddi', _default_data -> 'customer' -> 'phone' ->> 'ddi');
        return next is(_result -> 'customer' -> 'phone' ->> 'ddd', _default_data -> 'customer' -> 'phone' ->> 'ddd');
        return next is(_result -> 'customer' -> 'phone' ->> 'number', _default_data -> 'customer' -> 'phone' ->> 'number');
    end;
    $$;
    select * from test_serialize_with_default_data();

    create or replace function test_serialize_with_valid_data()
    returns setof text language plpgsql as $$
    declare
        _result json;
        _expected json;
    begin
        -- test with valid params
        return next lives_ok('EXECUTE generate_data(''{}'')');
        _expected := __json_data_payment('{}'::json);

        -- check serialized structure
        _result := payment_service._serialize_subscription_basic_data(_expected);

        return next is(_result ->> 'amount', _expected ->> 'amount');
        return next is((_result ->> 'is_international')::boolean, false);
        return next is(_result ->> 'payment_method', _expected ->> 'payment_method');
        return next is(_result -> 'customer' ->> 'name', _expected -> 'customer' ->> 'name');
        return next is(_result -> 'customer' ->> 'document_number', _expected -> 'customer' ->> 'document_number');
        return next is(_result -> 'customer' -> 'address' ->> 'street', _expected -> 'customer' -> 'address' ->> 'street');
        return next is(_result -> 'customer' -> 'address' ->> 'street_number', _expected -> 'customer' -> 'address' ->> 'street_number');
        return next is(_result -> 'customer' -> 'address' ->> 'neighborhood', _expected -> 'customer' -> 'address' ->> 'neighborhood');
        return next is(_result -> 'customer' -> 'address' ->> 'zipcode', _expected -> 'customer' -> 'address' ->> 'zipcode');
        return next is(_result -> 'customer' -> 'address' ->> 'country', _expected -> 'customer' -> 'address' ->> 'country');
        return next is(_result -> 'customer' -> 'address' ->> 'country_en', _expected -> 'customer' -> 'address' ->> 'country_en');
        return next is(_result -> 'customer' -> 'address' ->> 'state', _expected -> 'customer' -> 'address' ->> 'state');
        return next is(_result -> 'customer' -> 'address' ->> 'city', _expected -> 'customer' -> 'address' ->> 'city');
        return next is(_result -> 'customer' -> 'address' ->> 'complementary', _expected -> 'customer' -> 'address' ->> 'complementary');
        return next is(_result -> 'customer' -> 'phone' ->> 'ddi', _expected -> 'customer' -> 'phone' ->> 'ddi');
        return next is(_result -> 'customer' -> 'phone' ->> 'ddd', _expected -> 'customer' -> 'phone' ->> 'ddd');
        return next is(_result -> 'customer' -> 'phone' ->> 'number', _expected -> 'customer' -> 'phone' ->> 'number');

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
            'EXECUTE generate_data(''{"customer_name": null}'')',
            '.+name',
            'raise whem missing name'
        );

        return next throws_matching(
            'EXECUTE generate_data(''{"customer_document_number": null}'')',
            '.+document number',
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
