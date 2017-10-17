#!/usr/local/bin/node
'use strict';

const {Client} = require('pg');
const pagarme = require('pagarme');
const _ = require('lodash');

setInterval(() => {
    console.log('checking for subscriptions');
    init()
        .then(void(0))
        .catch(void(0));
}, 5000);

async function init() {
    try {
        const pg_client = new Client({
            connectionString: process.env.DATABASE_URL,
            statement_timeout: 5000
        });
        await pg_client.connect();

        // fetch payment and user data to build context
        const res = await pg_client.query(
            `select payment_service.subscriptions_charge($1::interval)`
            , [process.env.SUBSCRIPTION_INTERVAL]);

        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};
