'use strict';

const test = require('ava');
const R = require('ramda');
const nock = require('nock');
const helpers = require('../support/helpers');
const {
    createGatewayCard,
    processCardCreation
} = require('../../lib/credit_card_process');
const { pool, generateDalContext } = require('../../lib/dal');

// generate card reply
const cardReply = () => {
    return helpers.paymentBasicGatewayCachedData({}).transaction.card;
};

test('test createGatewayCard', async t => {
    let apitransactionmock = nock(/pagar\.me/)
        .post(/cards/)
        .reply(200, cardReply());

    const card = await createGatewayCard('foo_card_hash');

    t.is(card.id, cardReply().id);
    t.deepEqual(card, cardReply());
});

test('test processCardCreation', async t => {
    const client = await pool.connect();
    const dalCtx = generateDalContext(client);

    await client.query('begin;');
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

    process.env.GATEWAY_API_KEY = 'api_key_test';

    let apitransactionmock = nock(/pagar\.me/)
        .post(/cards/)
        .reply(200, cardReply());

    const process_card = await processCardCreation(client, card.id);

    t.is(process_card.id, card.id);
    t.deepEqual(process_card.gateway_data, cardReply());

    await client.query('rollback;');
    await client.release();
});
