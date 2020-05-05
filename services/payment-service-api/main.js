#!/usr/local/bin/node
'use strict';

const getStdin = require('get-stdin');
const R = require('ramda');
const { processPayment } = require('./lib/payment_process');
const { processCardCreation } = require('./lib/credit_card_process');
const { pool } = require('./lib/dal');
const { handleError } = require('./lib/error_handling');

/*
 * receive notification via stdin and process in some module
 * notification example:
 *
 * - action process_payment:
 *   process a new payment on gateway
 *   {
 *      action: 'process_payment',
 *      id: uuid_v4 for payment,
 *      subscription_id: uuid_v4 for subscription,
 *      created_at: datetime of payment creation,
 *   }
 *
 *  - action generate_card:
 *  process and generate a new card based on valid card_hash
 *  {
 *      action: 'generate_card',
 *      id: uuid_v4 for credit_card
 *  }
 */
const main = async (notification) => {
    console.log('received -> ', notification);
    const jsonNotification = JSON.parse(notification),
        resource_id = jsonNotification.id,
        dbclient = await pool.connect();


    switch (jsonNotification.action) {
        case 'process_payment':
            console.log('processing payment ', resource_id);
            const { transaction } = await processPayment(dbclient, resource_id);
            console.log('generate transaction with id ', transaction.id);
            break;
        case 'generate_card':
            console.log('processing card ', resource_id);
            const card = await processCardCreation(dbclient, resource_id);
            console.log('generate card with id ', card.gateway_data.id);
            break;
        default:
            throw new Error('invalid action');
    };

    dbclient.release();
};
const finishProcessOk = (result) => {
    console.log('finished ok ', result);
    process.exitCode = 0;
    process.exit(0);
};
const finishProcessErr = (result) => {
    console.log('finished with error ', result);
    handleError(result);
    process.exitCode = 1;
    process.exit(1);
};

getStdin().then((notification) => {
    if(!R.isNil(notification)) {
        main(notification)
            .then(finishProcessOk)
            .catch(finishProcessErr);
    } else {
        console.log('invalid stdin');
        process.exit(1);
    }
});
