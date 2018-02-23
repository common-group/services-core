/**
 * PaymentProcess module
 * @module lib/payment_process
 */

'use strict';
const pagarme = require('pagarme');
const _ = require('lodash');
const { DateTime } = require('luxon');
const { genAFMetadata } = require('./antifraud_context_gen');
const { pool, generateDalContext } = require('./dal');

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
 * fetchTransactionPayables(transactionId)
 * get payables from a transaction
 * @param { integer } transactionId
 * @return { Object } transaction payables object
 */
const fetchTransactionPayables = async (transactionId) => {
    let client = await gatewayClient();
    let payables = await client.payables.find({ transactionId: transactionId });
    return payables;
};

/*
 * processGeneratedCard(paymentId)
 * start processing a new payment on gateway
 * @param { uuid_v4 } paymentId - catalog_payment id
 *
 * @return { Object } transaction - the gateway generated transaction
 */
const processPayment = (paymentId) => {
    const client = pool.connect(),
        dalCtx = generateDalContext(client),
        ctx = dalCtx.loadPaymentContext(paymentId);

    try {
        await client.query('BEGIN;');

        const transaction = createGatewayTransaction(genTransactionData(ctx));
        const payables = fetchTransactionPayables(transaction.id);
        const transaction_reason = { transaction, payables };

        await dalCtx.updateGatewayDataOnPayment(paymentId, transaction, payables);
        await dalCtx.buildGatewayGeneralDataOnPayment(paymentId, transaction, payables);

        // create credit card when save_card is true
        // or when subscription has no credit_card_id
        if(!R.isNil(transaction.card) && (ctx.payment.data.save_card || (R.isNil(ctx.subscription.credit_card_id) && ctx.payment.subscription_id))) {
            const card = await dalCtx.createCardFromPayment(paymentId);
            if(!R.isNil(ctx.payment.subscription_id)) {
                await dalCtx.changeSubscriptionCard(ctx.payment.subscription_id, card.id);
            };
        };

        // should notify when slip on waitin_payment or processing
        if(!R.isNil(ctx.payment.subscription_id) && transaction.payment_method === 'boleto' && transaction.status === 'waiting_payment') {
            await dalCtx.notificationServiceNotify('slip_subscription_payment', {
                relations: {
                    catalog_payment_id: paymentId,
                    subscription_id: ctx.payment.subscription_id,
                    project_id: ctx.payment.project_id,
                    reward_id: ctx.payment.reward_id,
                    user_id: ctx.payment.user_id
                }
            });
        };

        // transition payment when status is not initial state
        if(transaction.status !== 'processing' || transaction.status !== 'waiting_payment') {
            await dalCtx.paymentTransitionTo(paymentId, transaction.status, transaction_reason);

            // transition subscription when have one and status is paid or refused
            if(!R.isNil(ctx.payment.subscription_id) && (transaction.status === 'paid' || transaction.status === 'refused') ) {
                const toStatus = transaction.status === 'paid' ? 'active' : 'inactive';
                await dalCtx.subscriptionTransitionTo(ctx.payment.subscription_id, toStatus, transaction_reason);
            };
        };


        await client.query('COMMIT;');
    } catch(err) {
        await client.query('ROLLBACK');
    }


    await client.release();
};

module.exports = {
    isForeign,
    genTransactionData,
    expirationDate,
    createGatewayTransaction,
    fetchTransactionPayables,
    processPayment
};
