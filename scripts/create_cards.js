#!/usr/local/bin/node
'use strict';

const {Pool} = require('pg');
const pagarme = require('pagarme');
const getStdin = require('get-stdin');
const _ = require('lodash');
const Raven = require('raven');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

if(process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
};

getStdin().then(str => {
    if(str !== null && str !== "") {
        try {
            const json_message = JSON.parse(str);
            init(json_message)
                .then((ok) => {
                    console.log(ok);
                    process.exitCode = 0;
                    return true;
                })
                .catch((e) => {
                    console.log(e);
                    process.exitCode = 1;
                    return false;
                });
        } catch (e) {
            process.exitCode = 1;
            console.log(e);
            return false;
        }
    } else {
        console.log('invalid stdin');
        process.exit(1);
    }
});

function raven_report(e, context_opts) {
    if(process.env.SENTRY_DSN) {
        Raven.context(function () {
            if(context_opts) {
                Raven.setContext(context_opts);
            };

            Raven.captureException(e, (sendErr, event) => {
                if(sendErr) {
                    console.log('error on log to sentry')
                } else {
                    console.log('raven logged event', event);
                }
            });
        });
    };
};

async function init(stdin_data) {
    const client = await pool.connect();
    let basic_raven_context = {};

    try {
        const res = await client.query(
            `
            select * from payment_service.credit_cards c
            where c.id = $1::uuid
            `, [stdin_data.id]
        );

        if(_.isEmpty(res.rows)) {
            throw "Card not found";
            return false;
        };

        let card = res.rows[0];

        let basic_raven_context = {
            card: {
                id: card.id
            }
        };

        const pagarme_client = await pagarme.client.connect({
            api_key: process.env.GATEWAY_API_KEY
        });

        const created_card = await pagarme_client.cards.create({
            card_hash: card.data.card_hash
        });

        console.log('created card: ', created_card.id);

        const saved_card_result = await client.query(
            `update payment_service.credit_cards
                set gateway_data = $1::jsonb
                where id = $2::uuid
            returning *
            `, [
                JSON.stringify(created_card),
                card.id
            ]);
        card = saved_card_result.rows[0];

        console.log('saved card: ', card.id);

    } catch (e) {
        raven_report(e, basic_raven_context);
        throw e;
    } finally {
        client.release();
    }
}
