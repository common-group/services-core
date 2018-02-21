/**
 * PaymentProcess module
 * @module lib/payment_process
 */

'use strict';
const pagarme = require('pagarme');
const _ = require('lodash');
const { DateTime } = require('luxon');
const { genAFMetadata } = require('./antifraud_context_gen');

/*
 * gatewayClient
 * Gateway client instance
 * @return {Object} pagarme_client
 */
const gatewayClient = async () => {
    return await pagarme.client.connect({
        api_key: process.env.GATEWAY_API_KEY
    });
};

/*
 * isForeign(ctx)
 * Check if payment is_international value return boolean
 * @param { Object } ctx - generated context for execution (generated on dal module)
 * @return { boolean }
 */
const isForeign = (ctx) => {
    return  (ctx.payment.data.is_international || false);
};

/*
 * genTransactionData(ctx)
 * Generate a object with transaction attributes
 * @param { Object } ctx - generated context from dal execution
 * @return { Object } - object with transaction attributes
 */
const genTransactionData = (ctx) => {
    const payment = ctx.payment,
        customer = payment.data.customer,
        is_international = isForeign(ctx);

    let data = {
        amount: payment.data.amount,
        payment_method: payment.data.payment_method,
        postback_url: process.env.POSTBACK_URL,
        async: false,
        customer: {
            name: customer.name,
            email: customer.email,
            document_number: (is_international ? '00000000000' : customer.document_number),
            address: {
                street: customer.address.street,
                street_number: (is_international ? '100' : customer.address.street_number),
                neighborhood: customer.address.neighborhood,
                zipcode: (is_international ? '00000000' : customer.address.zipcode)
            },
            phone: {
                ddi: (is_international ? '55' : customer.phone.ddi),
                ddd: (is_international ? '33' : customer.phone.ddd),
                number: (is_international ? '33335555' : customer.phone.number)
            }
        },
        metadata: {
            payment_id: payment.id,
            project_id: payment.project_id,
            platform_id: payment.platform_id,
            subscription_id: payment.subscription_id,
            user_id: payment.user_id,
            cataloged_at: payment.created_at
        },
        antifraud_metadata: genAFMetadata(ctx)
    };

    if(data.payment_method === 'credit_card' ) {
        payment.data.card_hash ? (data.card_hash = payment.data.card_hash ) : (data.card_id = payment.data.card_id)
    } else {
        data.boleto_expiration_date = expirationDate(DateTime.local(), 2);
    }

    return data;
};

/*
 * expirationDate(accTime, plusDays)
 * calculate expiration date for boleto
 * @param { DateTime } accTime - DateTime.local() when not defined
 * @param { integer } plusDays - Total of days from time
 * @return { string } - DateTime.toISO()
 */
const expirationDate = (accTime, plusDays) => {
    let time = (accTime||DateTime.local()).setZone(
        'America/Sao_Paulo'
    ).plus({days: plusDays});

    if(_.includes(['6', '7'], time.toFormat('E'))) {
        return expirationDate(time, 2);
    } else {
        return time.toISO();
    }
};

/*
 * createGatewayTransaction(transactionData)
 * transactionData = object generated on genTransactionData(ctx)
 * Create a transaction on gateway and return the transaction object
 */
const createGatewayTransaction = async (transactionData) => {
    let client = await gatewayClient();
    let transaction = await client.transactions.create(transactionData);
    return transaction;
};

/*
module.exports = {
    isForeign,
    genTransactionData,
    expirationDate,
    createGatewayTransaction,
};
