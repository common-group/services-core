create or replace function __json_data_payment(json) returns json
language plpgsql as $$
declare
data json;
begin
    data := json_build_object(
        'is_international', coalesce(nullif(($1->>'is_international'), '')::boolean, false),
        'current_ip', '127.0.0.1',
        'anonymous', coalesce(nullif(($1->>'anonymous'), '')::boolean, false),
        'subscription', coalesce(nullif(($1->>'subscription'), '')::boolean, false),
        'user_id', 'd44378a2-3637-447c-9f57-dc20fff574db',
        'project_id', '52273d0a-1610-4f48-9239-e96e5861c3d3',
        'amount', 2400,
        'credit_card_owner_document', ($1->>'credit_card_owner_document')::text,
        'payment_method', coalesce(($1->>'payment_method')::text, 'boleto'),
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
             else '88985122878' end) ,
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
                 'country_en', (case
                 when $1::jsonb ?| '{customer_address_country_en}' then
                     $1->>'customer_address_country_en'::text
                 else 'Brazil' end) ,
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

