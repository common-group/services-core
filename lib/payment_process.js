/**
 * PaymentProcess module
 * @module lib/payment_process
 */

'use strict';
const pagarme = require('pagarme');
const R = require('ramda');
const { DateTime } = require('luxon');
const { genAFMetadata } = require('./antifraud_context_gen');
const { generateDalContext } = require('./dal');

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
        soft_descriptor = (ctx.project.permalink||"").substring(0, 13),
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
                neighborhood: (is_international ? 'international' : customer.address.neighborhood),
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
        !R.isNil(payment.data.card_hash) ? (data.card_hash = payment.data.card_hash ) : (data.card_id = ctx.payment_card.gateway_data.id)
        data.soft_descriptor = soft_descriptor;
    } else {
        data.boleto_expiration_date = expirationDate(DateTime.local(), 2);
    }

    console.log('generated transaction data -> ', data)
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
 * @param { Object } dbclient - postgres connection client
 * @param { uuid_v4 } paymentId - catalog_payment id
 *
 * @return { Object } transaction, payables, payment, subscription - the gateway generated transaction
 */
const processPayment = async (dbclient, paymentId) => {
    const dalCtx = generateDalContext(dbclient),
        ctx = await dalCtx.loadPaymentContext(paymentId),
        hasSubcription = !R.isNil(ctx.subscription),
        subscriptionHasCard = hasSubcription && !R.isNil(ctx.subscription.credit_card_id),
        shouldSaveCard = (ctx.payment.data.save_card && !hasSubcription) || (hasSubcription && subscriptionHasCard),
        anyTransactionInInitialStatus = (s => s === 'waiting_payment' || s === 'processing'),
        anyTransactionInpaidOrRefused = (s => s === 'paid' || s === 'refused');

    try {
        await dbclient.query('BEGIN;');
        const transaction = await createGatewayTransaction(genTransactionData(ctx)),
            payables = await fetchTransactionPayables(transaction.id),
            transaction_reason = { transaction, payables },
            isPendingPayment = anyTransactionInInitialStatus(transaction.status),
            isPaidOrRefused = anyTransactionInpaidOrRefused(transaction.status);

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
            if ( hasSubcription && isPaidOrRefused ) {
                const toStatus = transaction.status === 'paid' ? 'active' : 'inactive';
                await dalCtx.subscriptionTransitionTo(ctx.payment.subscription_id, toStatus, transaction_reason);
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
        if(err.response && err.response.errors) {
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
    genTransactionData,
    expirationDate,
    createGatewayTransaction,
    fetchTransactionPayables,
    processPayment
};
