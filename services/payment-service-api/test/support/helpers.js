const R = require('ramda');

'use strict';

const userBasicData = (opts) => {
    const json_string = '{"name": "AMenori", "email": "loremlorem@gmail.com", "phone": {"ddd": "01", "ddi": "55", "number": "99433834"}, "address": {"city": "Pedro Leopoldo", "state": null, "street": "RUa r", "country": "Brasil", "zipcode": "05224-030", "neighborhood": "Centro", "complementary": "", "street_number": "234"}, "born_at": null, "metadata": null, "current_ip": null, "bank_account": {"agency": null, "account": null, "bank_code": null, "agency_digit": null, "account_digit": null}, "document_type": "CPF", "document_number": "11111111111", "legal_account_type": null}';

    const json = JSON.parse(json_string);

    return R.merge(json, opts);
}
// generate basic catalog_payment.gateway_cached_data
const paymentBasicGatewayCachedData = (opts) =>{
    const json_string = '{"payables": [], "transaction": {"id": 2933402, "ip": "127.0.0.1", "nsu": null, "tid": "2933402", "card": {"id": "card_id_foo_bar", "brand": "visa", "valid": true, "object": "card", "country": "UNITED STATES", "fingerprint": "cj5bw4cio00000j23jx5l60cq", "holder_name": "LOREM  NAME", "last_digits": "1111", "date_created": "2018-02-19T12:10:58.712Z", "date_updated": "2018-02-19T12:10:59.450Z", "first_digits": "411111", "expiration_date": "0119"}, "cost": 25, "items": [], "phone": {"id": 96166, "ddd": "31", "ddi": "55", "number": "984212343", "object": "phone"}, "amount": 1000, "device": null, "object": "transaction", "status": "paid", "address": {"id": 98743, "city": "Pedro Leopoldo", "state": "MG", "object": "address", "street": "Rua lorem", "country": "Brasil", "zipcode": "33600000", "neighborhood": "Centro", "complementary": null, "street_number": "268"}, "billing": null, "referer": "api_key", "customer": {"id": 63392, "name": "Lorem name", "type": null, "email": "lorem@email.com", "gender": null, "object": "customer", "born_at": null, "country": null, "birthday": null, "documents": [], "external_id": null, "date_created": "2016-05-10T20:52:38.354Z", "document_type": "cpf", "phone_numbers": null, "document_number": "11111111111"}, "metadata": {"user_id": "03f2c07f-5285-404b-a5d8-05e5a9239d42", "payment_id": "45584ceb-c441-4a59-b5e3-3ab6bffca417", "project_id": "aae41d21-e9f8-4681-a39b-8a96bda71996", "platform_id": "8187a11e-6fa5-4561-a5e5-83329236fbd6", "cataloged_at": "2018-02-19T12:12:03.040349", "subscription_id": "c0df3008-234c-4667-bffa-12974c647b82"}, "order_id": null, "shipping": null, "boleto_url": null, "card_brand": "visa", "local_time": null, "acquirer_id": "54f4db93db8d0c6a65000b88", "paid_amount": 1000, "split_rules": null, "date_created": "2018-02-19T12:10:58.723Z", "date_updated": "2018-02-19T12:10:59.402Z", "installments": 1, "postback_url": "https://d063c552.ngrok.io/postbacks/pagarme", "acquirer_name": "development", "card_pin_mode": null, "fraud_covered": false, "reference_key": null, "refuse_reason": null, "status_reason": "acquirer", "boleto_barcode": null, "capture_method": "ecommerce", "payment_method": "credit_card", "antifraud_score": -56, "refunded_amount": 0, "soft_descriptor": null, "subscription_id": null, "card_holder_name": "LOREM A NAME", "card_last_digits": "1111", "authorized_amount": 1000, "card_first_digits": "411111", "antifraud_metadata": {"ip": "127.0.0.1", "buyer": {"address": {"city": "Pedro Leopoldo", "state": "MG", "country": "Brasil", "zipcode": "33600-000", "latitude": "", "longitude": "", "complementary": "", "street_number": "268"}, "customer": {"name": "Lorem name", "gender": "", "born_at": "", "document_number": "11111111111"}, "phone_numbers": [{"ddd": "31", "ddi": "55", "number": "984212143"}]}, "events": [{"id": "aae41d21-e9f8-4681-a39b-8a96bda71996", "name": "meu sub test", "type": "sub", "address": {"city": "Pedro Leopoldo", "state": "", "street": "Rua lorem", "country": "Brasil", "zipcode": "304", "latitude": 0, "longitude": 0, "neighborhood": "Centro", "complementary": "", "street_number": "268"}, "venue_name": "Antônio Roberto", "ticket_types": [{"id": "45584ceb-c441-4a59-b5e3-3ab6bffca417", "name": "", "type": "", "batch": "", "price": 1000, "total_number": 0, "assigned_seats": "", "available_number": 0, "identity_verified": ""}]}], "billing": {"address": {"city": "Pedro Leopoldo", "state": "MG", "country": "Brasil", "zipcode": "33600-000", "latitude": "", "longitude": "", "complementary": "", "street_number": "268"}, "customer": {"name": "Antônio Roberto", "gender": "", "born_at": "", "document_number": "11111111111"}, "phone_numbers": [{"ddd": "31", "ddi": "55", "number": "984202144"}]}, "platform": "web", "register": {"id": "03f2c07f-5285-404b-a5d8-05e5a9239d42", "email": "lorem@lorem.com", "login_source": "registered", "company_group": "", "registered_at": "2018-02-19T08:09:24.965", "classification_code": ""}, "shipping": {"fee": 0, "address": {"city": "Lorem ipsum", "state": "MG", "country": "Brasil", "zipcode": "33600-000", "latitude": "", "longitude": "", "complementary": "", "street_number": "200"}, "customer": {"name": "Lorem name", "gender": "", "bornt_at": "", "document_number": "11111111111"}, "favorite": false, "phone_numbers": [{"ddd": "31", "ddi": "55", "number": "911212244"}], "shipping_method": ""}, "discounts": [{"code": "", "type": "other", "amount": 0}], "other_fees": [{"type": "", "amount": 0}], "session_id": "45584ceb-c441-4a59-b5e3-3ab6bffca417", "shopping_cart": [{"name": "10 - meu sub test", "type": "contribution", "event_id": "aae41d21-e9f8-4681-a39b-8a96bda71996", "quantity": "1", "unit_price": 1000, "ticket_type_id": "0", "totalAdditions": 0, "totalDiscounts": 0, "ticket_owner_name": "Lorem name", "ticket_owner_document_number": "11111111111"}]}, "authorization_code": "862801", "local_transaction_id": null, "acquirer_response_code": "00", "boleto_expiration_date": null}}';

    const json = JSON.parse(json_string);

    return R.merge(json, opts);
};

// generate basic catalog_payment.data field
const paymentBasicData = (opts) => {
    const json_string = '{"amount": 1000, "customer": {"name": "Lorem ipsum", "email": "lorem@email.com", "phone": {"ddd": "31", "ddi": "55", "number": "984302945"}, "address": {"city": "Pedro Leopoldo", "state": "MG", "street": "Rua Lorem", "country": "Brasil", "zipcode": "33600-000", "neighborhood": "Centro", "complementary": "", "street_number": "200"}, "document_number": "11111111111"}, "anonymous": false, "card_hash": "card_hash", "save_card": false, "current_ip": "127.0.0.1", "payment_method": "credit_card", "credit_card_owner_document": "11111111111"}';
    const json = JSON.parse(json_string);

    return R.merge(json, opts)
};

// insert basic data to client database
const insertBasicData = async (client) => {
    const platform = (await client.query(`
        insert into platform_service.platforms
            (name) values ('test_platform')
        returning *
    `)).rows[0];

    const community_first_user = (await client.query(`
        insert into community_service.users
        (platform_id, email, password, data) values 
        ($1::uuid, 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), $2::jsonb)
        returning *
    `, [ platform.id, JSON.stringify(userBasicData({})) ]
    )).rows[0];


    const community_second_user = (await client.query(`
        insert into community_service.users
        (platform_id, email, password, data) values 
        ($1::uuid, 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), $2::jsonb)
        returning *
    `, [ platform.id, JSON.stringify(userBasicData({})) ]
    )).rows[0];

    const community_project_owner_user = (await client.query(`
        insert into community_service.users
        (platform_id, email, password, data) values 
($1::uuid, 'test_community_user_03@test.com', crypt('123456', gen_salt('bf')), $2::jsonb)
        returning *
    `, [ platform.id, JSON.stringify(userBasicData({})) ]
    )).rows[0];

    const project = (await client.query(`
        insert into project_service.projects
        (platform_id, user_id, name, mode, permalink, data) 
        values ($1::uuid, $2::uuid, 'test project 01', 'sub', 'test_project', json_build_object('name', 'test project 01'))
        returning *
    `, [ platform.id, community_project_owner_user.id ]
    )).rows[0];

    const basicData = new Object({
        platform,
        community_first_user,
        community_second_user,
        community_project_owner_user,
        project,
    });

    return basicData;
};

module.exports = {
    insertBasicData,
    paymentBasicData,
    userBasicData,
    paymentBasicGatewayCachedData
};
