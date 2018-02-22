const R = require('ramda');

'use strict';

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
        ($1::uuid, 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), json_build_object('name', 'test community user 01')::jsonb)
        returning *
    `, [ platform.id ]
    )).rows[0];

    const community_second_user = (await client.query(`
        insert into community_service.users
        (platform_id, email, password, data) values 
        ($1::uuid, 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), json_build_object('name', 'test community user 02')::jsonb)
        returning *
    `, [ platform.id ]
    )).rows[0];

    const community_project_owner_user = (await client.query(`
        insert into community_service.users
        (platform_id, email, password, data) values 
($1::uuid, 'test_community_user_03@test.com', crypt('123456', gen_salt('bf')), json_build_object('name', 'test community user 03')::jsonb)
        returning *
    `, [ platform.id ]
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
    paymentBasicData
};
