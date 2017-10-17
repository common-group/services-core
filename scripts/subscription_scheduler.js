#!/usr/local/bin/node
'use strict';

const {Client} = require('pg');
const pagarme = require('pagarme');
const _ = require('lodash');

async function init() {
    try {
        const pg_client = new Client({
            connectionString: process.env.DATABASE_URL,
            statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000)
        });
        await pg_client.connect();

        // fetch payment and user data to build context
        const res = await pg_client.query(
            `select payment_service.subscriptions_charge($1::interval)`
            , [process.env.SUBSCRIPTION_INTERVAL]);

        await pg_client.end();
        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};

const recursive_init = () => {
    setTimeout(() => {
        console.log('checking for subscriptions');
        init()
            .then(void(0))
            .catch(void(0));
        recursive_init();
    }, (process.env.SET_INTERVAL || 60000))
};

recursive_init();
