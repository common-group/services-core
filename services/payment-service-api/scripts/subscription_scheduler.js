#!/usr/local/bin/node
'use strict';

const { Pool } = require('pg');
const pagarme = require('pagarme');
const { handleError } = require('../lib/error_handling');
const { importMissingPayables } = require('./import_missing_payables')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000)
});

async function subscriptions_charge() {
    try {
        const res = await pool
            .query(`select payment_service.subscriptions_charge()`);
        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function subscriptions_gateway_error_rescue_charge() {
    try {
        const res = await pool
            .query(`select payment_service.subscriptions_server_error_rescue_charge()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function refuse_expired_slip_payments() {
    try {
        const res = await pool.query(`select payment_service.refuse_expired_slip_payments()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function notify_expiring_slips() {
    try {
        const res = await pool
            .query(`select payment_service.notify_expiring_slips()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function cancel_canceling_expired_subscriptions() {
    try {
        const res = await pool
            .query(`select payment_service.cancel_subscriptions()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function inactive_invalid_subscriptions() {
    try {
        const res = await pool
            .query(`select payment_service.inactive_invalid_subscriptions()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

async function automatic_recharge_or_inactive_card_subscriptions() {
    try {
        const res = await pool
            .query(`select payment_service.automatic_recharge_or_inactive_card_subscriptions()`);

        console.log(res.rows[0]);
    } catch (e) {
        handleError(e);
        console.log(e);
    };
};

const recursive_calls = () => {

    const rec_charge = () => {
        setTimeout(() => {
            console.log('checking for subscriptions to charge');

            subscriptions_charge().then(() => {
                rec_charge();
            })
        }, (process.env.SET_INTERVAL || 60000));
    };

    const rec_errors_charge = () => {
        setTimeout(() => {
            console.log('checking for subscriptions gateway errors to charge');
            subscriptions_gateway_error_rescue_charge().then(() => {
                rec_errors_charge();
            });
        }, (process.env.SET_INTERVAL || 60000));
    };

    const refuse_expired = () => {
        setTimeout(() => {
            console.log('checking for expired slip payments');
            refuse_expired_slip_payments().then(() => {
                refuse_expired();
            });
        }, (process.env.SET_INTERVAL || 60000));
    }

    const cancel_expired_subscriptions = () => {
        setTimeout(() => {
            console.log('checking for expired canceling subscriptions');
            cancel_canceling_expired_subscriptions().then(() => {
                cancel_expired_subscriptions();
            });
        }, (process.env.SET_INTERVAL || 60000));
    }

    const notify_expiring = () => {
        setTimeout(() => {
            console.log('checking for expiring slips');
            notify_expiring_slips().then(() => {
                notify_expiring();
            });
        }, (process.env.SET_INTERVAL || 60000));
    }

    const inactive_invalid_subs = () => {
        setTimeout(() => {
            console.log('checking for subscriptions to inactive');

            inactive_invalid_subscriptions().then(() => {
                inactive_invalid_subs();
            })
        }, (process.env.SET_INTERVAL || 60000));
    };

    const recharge_or_inactive_card_subscriptions = () => {
        setTimeout(() => {
            console.log('checking for subscriptions to automatic recharge or inactive');

            automatic_recharge_or_inactive_card_subscriptions().then(() => {
                recharge_or_inactive_card_subscriptions();
            })
        }, (process.env.SET_INTERVAL || 60000));
    };

    const missingPayables = () => {
        setTimeout(async () => {
            console.log('Importing missing payables')
            const client = await pool.connect();
            await importMissingPayables(client)
            missingPayables()
        }, 300000) // 5 minutes
    }

    rec_charge();
    rec_errors_charge();
    refuse_expired();
    cancel_expired_subscriptions();
    inactive_invalid_subs();
    notify_expiring();
    recharge_or_inactive_card_subscriptions();
    missingPayables();
};

recursive_calls();
