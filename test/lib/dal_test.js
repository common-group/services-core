const { test } = require('ava');
const { Pool } = require('pg');
const R = require('ramda');
const helpers = require('../support/helpers');
const {
    pool,
    generateDalContext
} = require('../../lib/dal')

test('test findCard', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

    await client.query('begin;');

    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert credit card into database
    const card = (await client.query(`
        insert into payment_service.credit_cards
        (platform_id, user_id, gateway, data)
        values ($1::uuid, $2::uuid, 'pagarme', '{"card_hash": "foo_bar"}'::jsonb)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id
    ])).rows[0];

    const found = await dalCtx.findCard(card.id);

    t.is(found.id, card.id);
    t.is(found.data.card_hash, 'foo_bar');

    await client.query('rollback;')
    await client.release();
});

test('test findPayment', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

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

    const found = await dalCtx.findPayment(payment.id);

    t.is(found.id, payment.id);

    t.deepEqual(found.data, helpers.paymentBasicData({}));

    await client.query('rollback;')
    await client.release();
});

test('test findSubscription', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

    await client.query('begin;');

    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

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

    const found = await dalCtx.findSubscription(subscription.id);

    t.is(found.id, subscription.id);

    t.deepEqual(found.checkout_data, helpers.paymentBasicData({}));

    await client.query('rollback;')
    await client.release();
});

test('test loadPaymentContext', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
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

    const ctx = await dalCtx.loadPaymentContext(payment.id)

    t.is(ctx.payment.id, payment.id);
    t.is(ctx.user.id, basicData.community_first_user.id);
    t.is(ctx.subscription, null);
    t.is(ctx.project_owner.id, basicData.community_project_owner_user.id);

    t.deepEqual(ctx.payment.data, helpers.paymentBasicData({}));
    t.deepEqual(ctx.project.data, basicData.project.data);

    await client.query('rollback;')
    await client.release();
});

test('test updateCardFromGateway', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert credit card into database
    const card = (await client.query(`
        insert into payment_service.credit_cards
        (platform_id, user_id, gateway, data)
        values ($1::uuid, $2::uuid, 'pagarme', '{"card_hash": "foo_bar"}'::jsonb)
        returning *
    `, [
        basicData.platform.id,
        basicData.community_first_user.id
    ])).rows[0];

    const transaction = helpers.paymentBasicGatewayCachedData({}).transaction;
    const updated_card = await dalCtx.updateCardFromGateway(card.id, transaction.card);

    t.is(updated_card.id, card.id)
    t.is(updated_card.gateway_data.id, transaction.card.id);

    t.deepEqual(updated_card.gateway_data, transaction.card);

    await client.query('rollback;');
    await client.release();
});

test('test createCardFromPayment', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
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
    const created_card = await dalCtx.createCardFromPayment(payment.id);

    t.deepEqual(created_card.gateway_data, transaction.card);
    t.is(created_card.gateway_data.id, transaction.card.id);
    t.is(created_card.platform_id, basicData.platform.id);
    t.is(created_card.user_id, basicData.community_first_user.id);

    await client.query('rollback;');
    await client.release();
});

test('test updateGatewayDataOnPayment', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

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
    const updated_payment = await dalCtx.updateGatewayDataOnPayment(payment.id, {transaction, payables});
    t.is(payment.id, updated_payment.id);
    t.is(R.isNil(updated_payment.gateway_cached_data), false);
    t.deepEqual(updated_payment.gateway_cached_data.transaction, transaction);
    t.deepEqual(updated_payment.gateway_cached_data.payables, payables);

    await client.query('rollback;');
    await client.release();
});

test('test buildGatewayGeneralDataOnPayment', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

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
    const updated_payment = await dalCtx.buildGatewayGeneralDataOnPayment(payment.id, transaction, payables);
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
    t.is(R.isNil(updated_payment.gateway_general_data), false);

    t.deepEqual(updated_payment.gateway_general_data, expected_general_data);

    await client.query('rollback;');
    await client.release();
});

test('test changeSubscriptionCard', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
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

    const created_card = await dalCtx.createCardFromPayment(payment.id);
    const subscription_changed = await dalCtx.changeSubscriptionCard(subscription.id, created_card.id);

    t.is(R.isNil(subscription.credit_card_id), true);
    t.is(subscription_changed.id, subscription.id);
    t.is(subscription_changed.credit_card_id, created_card.id);

    await client.query('rollback;');
    await client.release();
});

test('test notificationServiceNotify', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    await client.query('begin;');

    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);

    // insert notification global template to database
    const template = (await client.query(`
        insert into notification_service.notification_global_templates
        (label, subject, template)
        values ('test_label', 'test subject', 'test template')
        returning *
    `)).rows[0];

    const notification = await dalCtx.notificationServiceNotify('test_label', {
        relations: { user_id: basicData.community_first_user.id }
    });

    t.is(R.isNil(notification.id), false);
    t.is(notification.notification_global_template_id, template.id);
    t.is(notification.user_id, basicData.community_first_user.id);

    await client.query('rollback;');
    await client.release();
});

test('test paymentTransitionTo', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
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
    const payables = payment.gateway_cached_data.payables;
    const transition_reason = {transaction: transaction, payables: payables}

    const payment_transition = await dalCtx.paymentTransitionTo(payment.id, 'refunded', transition_reason);

    t.is(payment_transition.id, payment.id);
    t.is(payment_transition.status, 'refunded');
    t.deepEqual(payment_transition.data, payment.data);

    await client.query('rollback;');
    await client.release();
});

test('test subscriptionTransitionTo', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    const basicData = await helpers.insertBasicData(client);


    // insert subscription into db
    const subscription = (await client.query(`
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

    const transaction = payment.gateway_cached_data.transaction;
    const payables = payment.gateway_cached_data.payables;
    const transition_reason = {transaction: transaction, payables: payables}

    const subscription_transition = await dalCtx.subscriptionTransitionTo(subscription.id, 'active', transition_reason);

    t.is(subscription_transition.id, subscription.id);
    t.is(subscription_transition.status, 'active');
    t.deepEqual(subscription_transition.checkout_data, subscription.checkout_data);

    await client.query('rollback;');
    await client.release();
});
