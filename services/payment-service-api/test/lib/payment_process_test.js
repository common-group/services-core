'use strict';

const test = require('ava');
const { DateTime } = require('luxon');
const R = require('ramda');
const nock = require('nock');
const helpers = require('../support/helpers');
let {
    buildTransactionData,
    isForeign,
    expirationDate,
    createGatewayTransaction,
    fetchTransactionPayables,
    processPayment,
    shouldSendTransactionToAntifraud,
    sendToTransactionAntifraud,
    authorizeAnalyzeAndCapturePayment,
    gatewayClient
} = require('../../lib/payment_process');
const { genAFMetadata } = require('../../lib/antifraud_context_gen');
const { pool, generateDalContext } = require('../../lib/dal');

/*
 * generate payables valid reply
 */
const payablesReply = () => {
    let reply = JSON.parse('[{"id": 3744350, "fee": 380, "type": "credit", "amount": 500, "object": "payable", "status": "paid", "installment": null, "accrual_date": null, "date_created": "2018-02-08T22:14:58.305Z", "payment_date": "2018-02-08T02:00:00.245Z", "recipient_id": "re_ci76hy9k000gsdw16ab7yyrgr", "split_rule_id": null, "payment_method": "boleto", "transaction_id": 2882562, "anticipation_fee": 0, "bulk_anticipation_id": null, "original_payment_date": null}]');
    return reply;
};

/*
 * generate transaction error reply
 */
const transactionErrorReply = () => {
    let reply = JSON.parse('{"errors": [{"type": "invalid_parameter", "message": "CEP não encontrado", "parameter_name": "customer[address][zipcode]"}]}');

    return reply;
};


/*
 * generate transaction valid reply
 */
const transactionReply = () => {
    let reply = JSON.parse(
        `{"id": 2375034, "ip": "54.159.247.176", "nsu": null, "tid": "2375034", "card": {"id": "card_cj9kdi7zb00v33m6d4hw0uekk", "brand": "visa", "valid": true, "object": "card", "country": "UNITED STATES", "fingerprint": "cj5bw4cio00000j23jx5l60cq", "holder_name": "AMENORI", "last_digits": "1111", "date_created": "2017-11-03T20:49:27.527Z", "date_updated": "2017-11-03T20:49:34.579Z", "first_digits": "411111", "expiration_date": "1225"}, "cost": 25, "items": [], "phone": {"id": 208043, "ddd": "21", "ddi": "55", "number": "933448877", "object": "phone"}, "amount": 4500, "device": null, "object": "transaction", "status": "paid", "address": {"id": 197792, "city": null, "state": null, "object": "address", "street": "Rua lorem ipsum", "country": null, "zipcode": "33600000", "neighborhood": "bairro", "complementary": null, "street_number": "200"}, "billing": null, "referer": "api_key", "customer": {"id": 63392, "name": "Lorem amenori", "type": null, "email": "lorem@gmail.com", "gender": null, "object": "customer", "born_at": null, "country": null, "birthday": null, "documents": [], "external_id": null, "date_created": "2016-05-10T20:52:38.354Z", "document_type": "cpf", "phone_numbers": null, "document_number": "111111111111"}, "metadata": {"user_id": "7d864ca3-b9f0-4c11-a60b-41db4d6bd1ba", "payment_id": "5a9330b7-a5e1-47d8-963a-f4f919de6122", "project_id": "058741d4-8790-4c4f-926a-f6bc027b37cd", "platform_id": "bf4e7e7c-85ee-489e-9744-13331b4c61ed", "cataloged_at": "2017-11-07T10:21:25.184242", "subscription_id": "798fe62e-8a63-4645-a19f-c171e35a0fc1"}, "shipping": null, "boleto_url": null, "card_brand": "visa", "local_time": null, "acquirer_id": "54f4db93db8d0c6a65000b88", "paid_amount": 4500, "split_rules": null, "date_created": "2017-11-07T10:21:26.443Z", "date_updated": "2017-11-07T10:21:27.181Z", "installments": 1, "postback_url": null, "acquirer_name": "development", "card_pin_mode": null, "reference_key": null, "refuse_reason": null, "status_reason": "acquirer", "boleto_barcode": null, "capture_method": "ecommerce", "payment_method": "credit_card", "antifraud_score": -64, "refunded_amount": 0, "soft_descriptor": null, "subscription_id": null, "card_holder_name": "AMENORI", "card_last_digits": "1111", "authorized_amount": 4500, "card_first_digits": "411111", "antifraud_metadata": {"ip": "201.80.0.73", "buyer": {"address": {"city": "lorem", "state": "MG", "street": "200", "country": "Brasil", "zipcode": "33600000", "latitude": "", "longitude": "", "complementary": "comple"}, "customer": {"name": "Lorem ipsum", "gender": "", "born_at": "", "document_number": "11111111111"}, "phone_numbers": [{"ddd": "21", "ddi": "55", "number": "933448877"}]}, "events": [{"id": "058741d4-8790-4c4f-926a-f6bc027b37cd", "name": "primeiro teste com subscription comum", "type": "sub", "address": {"city": "Leopoldo", "state": "MG", "street": "Rua Lorem ispum", "country": "Brasil", "zipcode": "33600-000", "latitude": 0, "longitude": 0, "neighborhood": "Centro", "complementary": "Casa", "street_number": "118"}, "venue_name": "Lorem name", "ticket_types": [{"id": "5a9330b7-a5e1-47d8-963a-f4f919de6122", "name": "", "type": "", "batch": "", "price": 4500, "total_number": 0, "assigned_seats": "", "available_number": 0, "identity_verified": ""}]}], "billing": {"address": {"city": "lorem", "state": "MG", "street": "200", "country": "Brasil", "zipcode": "33600000", "latitude": "", "longitude": "", "complementary": "comple"}, "customer": {"name": "Antônio Roberto silva", "gender": "", "born_at": "", "document_number": ""}, "phone_numbers": [{"ddd": "21", "ddi": "55", "number": "933448877"}]}, "platform": "web", "register": {"id": "7d864ca3-b9f0-4c11-a60b-41db4d6bd1ba", "email": "forevertonny@gmail.com", "login_source": "registered", "company_group": "", "registered_at": "2011-09-11T12:11:20.23", "classification_code": ""}, "shipping": {"fee": 0, "address": {"city": "lorem", "state": "MG", "street": "200", "country": "Brasil", "zipcode": "33600000", "latitude": "", "longitude": "", "complementary": "comple"}, "customer": {"name": "Antônio Roberto silva", "gender": "", "bornt_at": "", "document_number": "08680410683"}, "favorite": false, "phone_numbers": [{"ddd": "21", "ddi": "55", "number": "933448877"}], "shipping_method": ""}, "discounts": [{"code": "", "type": "other", "amount": 0}], "other_fees": [{"type": "", "amount": 0}], "session_id": "5a9330b7-a5e1-47d8-963a-f4f919de6122", "shopping_cart": [{"name": "45 - primeiro teste com subscription comum", "type": "contribution", "event_id": "058741d4-8790-4c4f-926a-f6bc027b37cd", "quantity": "1", "unit_price": 4500, "ticket_type_id": "0", "totalAdditions": 0, "totalDiscounts": 0, "ticket_owner_name": "Lorem ipsum", "ticket_owner_document_number": "11111111111"}]}, "authorization_code": "880298", "local_transaction_id": null, "acquirer_response_code": "00", "boleto_expiration_date": null}`
        );

    return reply;
};

test('test isForeign with is_international = true', t => {
    const ctx = {
        payment: {
            data: {
                is_international: true
            }
        }
    };

	t.is(isForeign(ctx), true);
});

test('test isForeign with is_international = false', t => {
    const ctx = {
        payment: {
            data: {
                is_international: false
            }
        }
    };

	t.is(isForeign(ctx), false);
});

test('test isForeign with is_international not setted', t => {
    const ctx = {
        payment: {
            data: {
            }
        }
    };

	t.is(isForeign(ctx), false);
});

test('test createGatewayTransaction', async t => {
    process.env.GATEWAY_API_KEY = 'api_key_test';

    const ctx = {
        user: {
            id: '1234',
            created_at: '2016-02-01 12:30:21',
        },
        project_owner: {
            id: '12345',
            data: {
                name: 'project owner name',
                address: {
                    country: 'Brasil',
                    state: 'SP',
                    street: 'Rua Lorem',
                    city: 'São Paulo',
                    zipcode: '33465765',
                    neighborhood: 'Centro',
                    street_number: '200',
                    complementary: 'AP'
                }
            }
        },
        project: {
            id: '12345',
            mode: 'aon',
            data: {
                name: 'foo project',
                expires_at: '2016-09-09 12:30:11'
            }
        },
        payment: {
            id: '123',
            user_id: '1234',
            project_id: '12345',
            subscription_id: null,
            platform_id: '12345678',
            created_at: '2016-02-01 12:30:20',
            data: {
                payment_method: 'credit_card',
                card_hash: 'card_hash_123',
                current_ip: '127.0.0.1',
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    email: 'lorem@email.com',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighborhood: 'Centro',
                        street_number: '200',
                        complementary: 'AP'
                    },
                    phone: {
                        ddi: 55,
                        ddd: 21,
                        number: 88888888
                    }
                }
            }
        },
        payment_card: {
            gateway_data: {
                id: '312'
            }
        }
    };

    let gatewayApiMock = nock(/pagar\.me/)
        .post(/transactions/)
        .reply(200, transactionReply())

    let transaction = await createGatewayTransaction(buildTransactionData(ctx));

    t.deepEqual(transaction, transactionReply());

    delete process.env.GATEWAY_API_KEY;
});

test('test fetchTransactionPayables', async t => {
    process.env.GATEWAY_API_KEY = 'api_key_test';

    let gatewayApiMock = nock(/pagar\.me/)
        .get(/transactions\/\d+\/payables/)
        .reply(200, payablesReply())

    let payables = await fetchTransactionPayables(2882562)

    t.deepEqual(payables, payablesReply());

    delete process.env.GATEWAY_API_KEY;
});

test('test processPayment with subscription and valid credit card data', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    await client.query('begin;');

    const basicData = await helpers.insertBasicData(client);
    process.env.GATEWAY_API_KEY = 'api_key_test';

    // insert subscription in database
    const gen_subscription = (await client.query(`
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data)
        values ('started', now(), $1::uuid, $2::uuid, $3::uuid, $4::jsonb)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({}))
    ])).rows[0];

    // insert payment into database
    const gen_payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id)
        values ('pending', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json, $5::uuid)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({})),
        gen_subscription.id
    ])).rows[0];

    let apitransactionmock = nock(/pagar\.me/)
        .post(/transactions/)
        .reply(200, transactionReply());
    let apipayablesmock = nock(/pagar\.me/)
        .get(/transactions\/\d+\/payables/)
        .reply(200, payablesReply());

    const {
        transaction,
        payables,
        payment,
        subscription
    } = await processPayment(client, gen_payment.id);

    t.is(R.isNil(transaction.id), false);
    t.is(payment.status, 'paid');
    t.is(subscription.status, 'active');
    t.is(transaction.id.toString(), payment.gateway_general_data.gateway_id);
    t.deepEqual(payment.gateway_cached_data.transaction, transaction);

    await client.query('rollback;');
    await client.release();
});

test('test processPayment with error on gateway', async t => {

    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

    const basicData = await helpers.insertBasicData(client);
    process.env.GATEWAY_API_KEY = 'api_key_test';

    // insert subscription in database
    const gen_subscription = (await client.query(`
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data)
        values ('started', now(), $1::uuid, $2::uuid, $3::uuid, $4::jsonb)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({}))
    ])).rows[0];

    // insert payment into database
    const gen_payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, subscription_id)
        values ('pending', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json, $5::uuid)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({})),
        gen_subscription.id
    ])).rows[0];

    // persist on database this payment to avoid rollbacks when error
    await client.query('begin;');
    let apitransactionmock = nock(/pagar\.me/)
        .post(/transactions/)
        .reply(400, transactionErrorReply());
    let apipayablesmock = nock(/pagar\.me/)
        .get(/transactions\/\d+\/payables/)
        .reply(200, payablesReply());

    const error = await t.throwsAsync( async ()=> {
        await processPayment(client, gen_payment.id);
    }, Error);

    const reloaded_payment = await dalCtx.findPayment(gen_payment.id);

    t.is(reloaded_payment.status, 'error');
    t.deepEqual(reloaded_payment.gateway_cached_data, transactionErrorReply().errors);

    await client.query('rollback;');
    await client.release();
});

test('test shouldSendTransactionToAntifraud - when transaction status is authorized and credit card is new', async t => {
    let transaction = { payment_method: 'credit_card', status: 'authorized', card: { id: '123' } }

    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    dalCtx.isCardAlreadyAnalyzedOnAntifraud = (cardId) => { return false }

    const response = await shouldSendTransactionToAntifraud(transaction, dalCtx)
    t.is(response, true)
})

test('test shouldSendTransactionToAntifraud - when transaction status is authorized and credit card isn`t new', async t => {
    let transaction = { payment_method: 'credit_card', status: 'authorized', card: { id: '123' } }

    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    dalCtx.isCardAlreadyAnalyzedOnAntifraud = (cardId) => { return true }

    const response = await shouldSendTransactionToAntifraud(transaction, dalCtx)
    t.is(response, false)
})


test('test shouldSendTransactionToAntifraud - when transaction status is refused', async t => {
    let transaction = { payment_method: 'credit_card', status: 'refused', card: { id: '123' } }

    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

    const response = await shouldSendTransactionToAntifraud(transaction, dalCtx)
    t.is(response, true)
})

test('test sendToTransactionAntifraud', async t => {
    process.env.ANTIFRAUD_API_KEY = 'api_key_test';
    const expectedOrder = { mock: 'here' }
    const fakeData = { payment: { created_at: '', data: { customer: { phone: {}, address: { country_code: '' } } } }, user: { created_at: '' }, payment_card: { gateway_data: { expiration_date: '' } }, project: { data: {} }, subscription: { created_at: '' }, project_owner: { data: {}, created_at: '' } }

    nock('https://api.konduto.com').post('/v1/orders').reply(201, expectedOrder)

    let response = await sendToTransactionAntifraud(fakeData, { transaction: { id: 'transaction-id', card: { holder_name: 'holder name' } } })
    t.deepEqual(expectedOrder, response.data)
})
