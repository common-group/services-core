-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service._serialize_payment_basic_data(json)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _result json;
            _is_international boolean default false;
        begin
            -- check if is foreign payment
            _is_international := coalesce(nullif(($1->>'is_international'), '')::boolean, false);

            -- validate required fields on payment
            -- when international should not check for (documents data, and some address fields)
            select json_build_object(
                'current_ip', core_validator.raise_when_empty(($1->>'current_ip')::text, 'ip_address')::text,
                'is_international', _is_international,
                'anonymous', core_validator.raise_when_empty(($1->>'anonymous')::text, 'anonymous')::boolean,
                'amount', core_validator.raise_when_empty((($1->>'amount')::decimal)::text, 'amount')::decimal,
                'payment_method', core_validator.raise_when_empty(lower(($1->>'payment_method')::text), 'payment_method'),
                'customer', json_build_object(
                    'name', core_validator.raise_when_empty(($1->'customer'->>'name')::text, 'name'),
                    'email', core_validator.raise_when_empty(($1->'customer'->>'email')::text, 'email'),
                    'document_number', (case _is_international
                        when false then 
                            core_validator.raise_when_empty(
                                replace(replace(replace(($1-> 'customer' ->>'document_number')::text, '.', ''), '/', ''), '-', '')
                        , 'document_number')
                        else
                            replace(replace(replace(($1-> 'customer' ->>'document_number')::text, '.', ''), '/', ''), '-', '')
                        end),
                    'address', json_build_object(
                        'street', core_validator.raise_when_empty(($1->'customer'->'address'->>'street')::text, 'street'),
                        'street_number', (case _is_international
                        when false then
                            core_validator.raise_when_empty(($1->'customer'->'address'->>'street_number')::text, 'street_number')
                        else
                            ($1->'customer'->'address'->>'street_number')::text
                        end),
                        'neighborhood', ( case _is_international
                        when false then
                            core_validator.raise_when_empty(($1->'customer'->'address'->>'neighborhood')::text, 'neighborhood')
                        else
                            ($1->'customer'->'address'->>'neighborhood')::text
                        end),
                        'zipcode', (case _is_international
                        when false then
                            core_validator.raise_when_empty(($1->'customer'->'address'->>'zipcode')::text, 'zipcode')
                        else 
                            ($1->'customer'->'address'->>'zipcode')::text
                        end),
                        'country', core_validator.raise_when_empty(($1->'customer'->'address'->>'country')::text, 'country'),
                        'state', core_validator.raise_when_empty(($1->'customer'->'address'->>'state')::text, 'state'),
                        'city', core_validator.raise_when_empty(($1->'customer'->'address'->>'city')::text, 'city'),
                        'complementary', ($1->'customer'->'address'->>'complementary')::text
                    ),
                    'phone', json_build_object(
                        'ddi', (case _is_international
                        when false then
                            core_validator.raise_when_empty(regexp_replace(($1->'customer'->'phone'->>'ddi')::text, '[^\d]+', ''), 'phone_ddi')
                        else
                            regexp_replace(($1->'customer'->'phone'->>'ddi')::text, '[^\d]+', '')
                        end),
                        'ddd', (case _is_international
                        when false then
                            core_validator.raise_when_empty(regexp_replace(($1->'customer'->'phone'->>'ddd')::text, '[^\d]+', ''), 'phone_ddd')
                        else
                            regexp_replace(($1->'customer'->'phone'->>'ddd')::text, '[^\d]+', '')
                        end),
                        'number', (case _is_international
                        when false then
                            core_validator.raise_when_empty(regexp_replace(($1->'customer'->'phone'->>'number')::text, '[^\d]+', ''), 'phone_number')
                        else
                            regexp_replace(($1->'customer'->'phone'->>'number')::text, '[^\d]+', '')
                        end)
                    )
                )
            ) into _result;

            return _result;
        end;
    $function$;