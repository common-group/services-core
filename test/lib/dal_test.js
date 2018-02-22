const { test } = require('ava');
const { Pool } = require('pg');
const R = require('ramda');
const helpers = require('../support/helpers');
const {
    pool,
    loadPaymentContext,
    createCardFromPayment,
    updateGatewayDataOnPayment,
    changeSubscriptionCard
} = require('../../lib/dal')

test('test loadPaymentContext', async t => {
    const client = await pool.connect();
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert payment into database
    const payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data) 
        values ('paid', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({}))
    ])).rows[0];

    const ctx = await loadPaymentContext(client, payment.id)

    t.is(ctx.payment.id, payment.id);
    t.is(ctx.user.id, basicData.community_first_user.id);
    t.is(ctx.subscription, null);
    t.is(ctx.project_owner.id, basicData.community_project_owner_user.id);

    t.deepEqual(ctx.payment.data, helpers.paymentBasicData({}));
    t.deepEqual(ctx.project.data, basicData.project.data);

    await client.query('rollback;')
    await client.release();
});

test('test createCardFromPayment', async t => {
    const client = await pool.connect();
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert payment into database
    const payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, gateway_cached_data) 
        values ('paid', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json, $5::json)
        returning *`, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({})),
        JSON.stringify(helpers.paymentBasicGatewayCachedData({}))
    ])).rows[0];
    
    const transaction = payment.gateway_cached_data.transaction;
    const created_card = await createCardFromPayment(client, payment.id);

    t.deepEqual(created_card.gateway_data, transaction.card);
    t.is(created_card.gateway_data.id, transaction.card.id);
    t.is(created_card.platform_id, basicData.platform.id);
    t.is(created_card.user_id, basicData.community_first_user.id);

    await client.query('rollback;');
    await client.release();
});

test('test updateGatewayDataOnPayment', async t => {
    const client = await pool.connect();
    await client.query('begin;');

    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert payment into database
    const payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data)
        values ('paid', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json)
        returning *`, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({}))
    ])).rows[0];

    t.is(R.isNil(payment.gateway_data), true);
    const { payables, transaction } = helpers.paymentBasicGatewayCachedData({});
    const updated_payment = await updateGatewayDataOnPayment(client, payment.id, transaction, payables);
    const expected_general_data = {
        boleto_barcode: null,
        boleto_expiration_date: null,
        boleto_url: null,
        card_brand: 'visa',
        card_country: 'UNITED STATES',
        card_fingerprint: 'cj5bw4cio00000j23jx5l60cq',
        card_first_digits: '411111',
        card_holder_name: 'LOREM  NAME',
        card_id: 'card_id_foo_bar',
        card_last_digits: '1111',
        customer_document_number: '11111111111',
        customer_document_type: 'cpf',
        customer_email: 'lorem@email.com',
        customer_name: 'Lorem name',
        gateway_acquirer_response_code: '00',
        gateway_cost: 25,
        gateway_id: '2933402',
        gateway_ip: '127.0.0.1',
        gateway_payment_method: 'credit_card',
        gateway_refuse_reason: null,
        gateway_status: 'paid',
        gateway_status_reason: 'acquirer',
        installments: '1',
        payable_first_compensation_date: null,
        payable_last_compensation_date: null,
        payable_total_fee: null,
        payables: null,
    };

    t.is(payment.id, updated_payment.id);
    t.is(R.isNil(updated_payment.gateway_cached_data), false);
    t.is(R.isNil(updated_payment.gateway_general_data), false);
    t.deepEqual(updated_payment.gateway_cached_data.transaction, transaction);
    t.deepEqual(updated_payment.gateway_cached_data.payables, payables);

    t.deepEqual(updated_payment.gateway_general_data, expected_general_data);

    //t.deepEqual(created_card.gateway_data, transaction.card);
    //t.is(created_card.gateway_data.id, transaction.card.id);
    //t.is(created_card.platform_id, basicData.platform.id);
    //t.is(created_card.user_id, basicData.community_first_user.id);

    await client.query('rollback;');
    await client.release();
});

test('test changeSubscriptionCard', async t => {
    const client = await pool.connect();
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert subscription in database
    const subscription = (await client.query(`
        insert into payment_service.subscriptions
        (status, created_at, platform_id, user_id, project_id, checkout_data)
        values ('active', now(), $1::uuid, $2::uuid, $3::uuid, $4::jsonb)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id,
        basicData.project.id,
        JSON.stringify(helpers.paymentBasicData({}))
    ])).rows[0];

    // insert payment into database
    const payment = (await client.query(`
        insert into payment_service.catalog_payments
        (status, created_at, gateway, platform_id, user_id, project_id, data, gateway_cached_data, subscription_id) 
        values ('paid', '01-31-2018 13:00', 'pagarme', $1::uuid, $2::uuid, $3::uuid, $4::json, $5::json, $6::uuid)
        returning *`, [
            basicData.platform.id,
            basicData.community_first_user.id,
            basicData.project.id,
            JSON.stringify(helpers.paymentBasicData({})),
            JSON.stringify(helpers.paymentBasicGatewayCachedData({})),
            subscription.id
    ])).rows[0];

    const created_card = await createCardFromPayment(client, payment.id);
    const subscription_changed = await changeSubscriptionCard(client, subscription.id, created_card.id);

    t.is(R.isNil(subscription.credit_card_id), true);
    t.is(subscription_changed.id, subscription.id);
    t.is(subscription_changed.credit_card_id, created_card.id);

    await client.query('rollback;');
    await client.release();
});

