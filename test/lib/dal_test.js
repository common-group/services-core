const { test } = require('ava');
const {Pool} = require('pg');
const { _ } = require('lodash');
const helpers = require('../support/helpers');
const {
    pool,
    loadPaymentContext
} = require('../../lib/dal')

let basicData;
let client;

// generate basic database data
test.before( async t => {
    client = await pool.connect();
});

test('test loadPaymentContext', async t => {
    await client.query('begin;');
    // insert fixtures (platform, project, users)
    basicData = await helpers.insertBasicData(client);

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
});

// remove generated data
test.after.always( async t => {
    if(client) {
        await client.release();
    }
});
