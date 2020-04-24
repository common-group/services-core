/**
 * PaymentProcess module
 * @module lib/payment_process
 */

'use strict';
const pagarme = require('pagarme');
const R = require('ramda');
const antifraudClient = require('./konduto_client')
const { DateTime } = require('luxon');
const { genAFMetadata } = require('./antifraud_context_gen');
const { generateDalContext } = require('./dal');
const { buildTransactionData } = require('./transaction_data_builder');
const { buildAntifraudData } = require('./konduto_data_builder')
let transactionID

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

    const isWeeked = R.any(x => x === '6' || x === '7');

    if(isWeeked(time.toFormat('E'))) {
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
    let transaction = await client.withVersion('2019-09-01').transactions.create(transactionData);
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
 * authorizeAnalyzeAndCapturePayment(paymentContext, dalContext)
 * Authorize, Analyze and capture payment
 * @param { Object } paymentContext
 * @param { Object } dalContext
 * @return { Object } transaction
 */
const authorizeAnalyzeAndCapturePayment = async (paymentContext, dalContext) => {
    const client = await gatewayClient();
    let transaction = await createTransaction(paymentContext)
    transactionID = transaction.id

    if (transaction.payment_method === 'boleto') {
        return transaction
    }

    if (await shouldSendTransactionToAntifraud(transaction, dalContext)) {
        const shouldAnalyze = transaction.status === 'authorized'
        const antifraudResponse = await sendToTransactionAntifraud(paymentContext, { shouldAnalyze, transaction })

        if (shouldAnalyze) {
            if (antifraudResponse.data.order.recommendation === 'APPROVE') {
                transaction = await client.withVersion('2019-09-01').transactions.capture({ id: transaction.id })
            } else if (antifraudResponse.data.order.recommendation === 'DECLINE') {
                transaction = await client.withVersion('2019-09-01').transactions.refund({ id: transaction.id })
            }
        }
    } else if (transaction.status === 'authorized') {
        transaction = await client.withVersion('2019-09-01').transactions.capture({ id: transaction.id })
    }

    return transaction
}

/*
 * createTransaction(paymentContext)
 * Create transaction on gateway
 * @param { Object } paymentContext
 * @return { Object } transaction
 */
const createTransaction = async (paymentContext) => {
    let transactionData = buildTransactionData(paymentContext)

    return await createGatewayTransaction(transactionData)
}

/*
 * shouldSendTransactionToAntifraud(transaction, dalContext)
 * Check if transaction is authorized and has a new credit card or transaction is refused
 * @param { Object } transaction
 * @param { Object } dalContext
 * @return { Boolean } should send to antifraud
 */
const shouldSendTransactionToAntifraud = async (transaction, dalContext) => {
    const isAuthorized = transaction.payment_method === 'credit_card' && transaction.status === 'authorized'
    const isRefused = transaction.status === 'refused'
    const isCardAlreadyAnalyzedOnAntifraud = await dalContext.isCardAlreadyAnalyzedOnAntifraud(transaction.card.id)

    return (isAuthorized && !isCardAlreadyAnalyzedOnAntifraud) || isRefused
}

/*
 * sendToTransactionAntifraud(paymentContext, dalContext)
 * Send transaction to antifraud
 * @param { Object } paymentContext
 * @param { Object } options
 * @return { Object } antifraud response
 */
const sendToTransactionAntifraud = async (paymentContext, options) => {
    const antifraudData = buildAntifraudData(paymentContext, options)

    return antifraudClient.createOrder(antifraudData)
}

/*
 * processGeneratedCard(paymentId)
 * start processing a new payment on gateway
 * @param { Object } dbclient - postgres connection client
 * @param { uuid_v4 } paymentId - catalog_payment id
 *
 * @return { Object } transaction, payables, payment, subscription - the gateway generated transaction
 */
const processPayment = async (dbclient, paymentId) => {
    const dalCtx = generateDalContext(dbclient)
    const ctx = await dalCtx.loadPaymentContext(paymentId)
    const hasSubcription = !R.isNil(ctx.subscription)
    const subscriptionHasCard = hasSubcription && !R.isNil(ctx.subscription.credit_card_id)
    const shouldSaveCard = (ctx.payment.data.save_card && !hasSubcription) || (hasSubcription && subscriptionHasCard)
    const anyTransactionInInitialStatus = (s => ['waiting_payment', 'processing', 'authorized'].includes(s))

    try {
        await dbclient.query('BEGIN;');
        const transaction = await authorizeAnalyzeAndCapturePayment(ctx, dalCtx)

        const payables = await fetchTransactionPayables(transaction.id)
        const transaction_reason = { transaction, payables }
        const isPendingPayment = anyTransactionInInitialStatus(transaction.status);

        await dalCtx.updateGatewayDataOnPayment(paymentId, transaction_reason);
        await dalCtx.buildGatewayGeneralDataOnPayment(paymentId, transaction, payables);

        // create credit card when save_card is true
        // or when subscription has no credit_card_id
        if(!R.isNil(transaction.card) && shouldSaveCard) {
            const card = await dalCtx.createCardFromPayment(paymentId);
            if(hasSubcription) {
                await dalCtx.changeSubscriptionCard(ctx.payment.subscription_id, card.id);
            };
        };

        // should notify when slip on waitin_payment or processing
        if(hasSubcription && isPendingPayment && transaction.payment_method === 'boleto') {
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
        if ( !isPendingPayment ) {
            await dalCtx.paymentTransitionTo(paymentId, transaction.status, transaction_reason);

            // transition subscription when have one and status is paid or refused
            if ( hasSubcription && transaction.status == 'paid') {
                await dalCtx.subscriptionTransitionTo(ctx.payment.subscription_id, 'active', transaction_reason);
            };
        };


        await dbclient.query('COMMIT;');
        return {
            transaction,
            payables,
            payment: await dalCtx.findPayment(paymentId),
            subscription: (hasSubcription ? await dalCtx.findSubscription(ctx.payment.subscription_id) : undefined)

        };
    } catch(err) {
        await dbclient.query('ROLLBACK');

        if (transactionID) {
            try {
                let client = await gatewayClient();
                await client.withVersion('2019-09-01').transactions.refund({ id: transactionID });
            } catch(err) {
                console.log('error when refunding transaction ', transactionID)
                console.log('error:', err)
            }
        }

        if(err.response && err.response.errors) {
            console.log('error data', err.response.data);
            console.log('error on processing', err.response.errors);
            try {
                await dbclient.query('BEGIN;')
                await dalCtx.paymentTransitionTo(paymentId, 'error', err.response.errors);
                await dalCtx.updateGatewayDataOnPayment(paymentId, err.response.errors);
                await dbclient.query('COMMIT;')
            } catch(db_err) {
                console.log('error when transition payment to error -> ', db_err);
            }
        }
        throw err;
    };
};

module.exports = {
    gatewayClient,
    isForeign,
    buildTransactionData,
    authorizeAnalyzeAndCapturePayment,
    shouldSendTransactionToAntifraud,
    sendToTransactionAntifraud,
    expirationDate,
    createGatewayTransaction,
    fetchTransactionPayables,
    processPayment
};
