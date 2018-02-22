'use strict';

const {Pool} = require('pg');
const R = require('ramda');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

/*
 * findPayment(client, paymentId)
 * find a payment on database
 * @param { Object } client - pool.connect() client
 * @param { uuid } paymentId - catalog_payments.id(uuid v4)
 *
 * @return { Object } - payment object from database
 */
const findPayment = async (client, paymentId) => {
    const payment = (await client.query(`
        select * from payment_service.catalog_payments where id = $1::uuid
    `, [ paymentId ])).rows[0];

    return payment;
};

/*
 * loadPaymentContext(client, paymentId)
 * @param { Object } client - pool.connect() client
 * @param { uuid } paymentId - catalog_payments.id(uuid v4)
 *
 * Fetch all data related to a given payment id
 * returns a Object:
 * @return { Object } - {
 *  payment: Object(catalog_payment),
 *  user: Object(users),
 *  project: Object(projects),
 *  project_owner: Object(users),
 *  subscription: Object(subscriptions)
 * }
 */
const loadPaymentContext = async (client, paymentId) => {
    // fetch payment and user data to build context
    const res = await client.query(
        `select
            row_to_json(cp.*) as payment_data,
            row_to_json(u.*) as user_data,
            row_to_json(p.*) as project_data,
            row_to_json(o.*) as project_owner_data,
            row_to_json(s.*) as subscription_data
        from payment_service.catalog_payments cp
            join community_service.users u on u.id = cp.user_id
            join project_service.projects p on p.id = cp.project_id
            join community_service.users o on o.id = p.user_id
            left join payment_service.subscriptions s on s.id = cp.subscription_id
            where cp.id = $1::uuid`
        , [paymentId]);

    if(R.isEmpty(res.rows)) {
        throw new Error("Payment not found");
    };

    const ctx = new Object({
        payment: res.rows[0].payment_data,
        user: res.rows[0].user_data,
        project: res.rows[0].project_data,
        project_owner: res.rows[0].project_owner_data,
        subscription: res.rows[0].subscription_data
    });

    return ctx;
};

/*
 * createCardFromPayment(client, paymentId)
 * insert into credit cards based on payment transaction gateway data
 * @param { Object } client - pool connection client
 * @param { uuid } paymentId - catalog payment id
 *
 * @return { Object } credit_cards attibutes from database
 */
const createCardFromPayment = async (client, paymentId) => {
    const card = (await client.query(
        `
        insert into payment_service.credit_cards
            (platform_id, user_id, gateway, gateway_data)
            (
                select
                    cp.platform_id,
                    cp.user_id,
                    'pagarme' as gateway,
                    (cp.gateway_cached_data -> 'transaction' ->> 'card')::jsonb as gateway_data
                from payment_service.catalog_payments cp
                where cp.id = $1::uuid
            )
            returning *
        `, [
            paymentId,
        ]
    )).rows[0];

    return card;
};

/*
 * updateGatewayDataOnPayment(client, paymentId, transaction, payables)
 * update catalog_payment(gateway_cached_data, gateway_general_data)
 * @param { Object } client - pool connection client
 * @param { uuid } paymentId - catalog_payment id
 * @param { Object } transaction - object generated when create or fetch a transaction
 * @param { Array[Object] } payables - array of payables from gateway
 *
 * @return { Object } payment - catalog_payment upated
 */
const updateGatewayDataOnPayment = async (client, paymentId, transaction, payables) => {
    const dataToDb = {
        payables: payables,
        transaction: transaction
    };

    const payment = (await client.query(
        `update payment_service.catalog_payments
            set gateway_cached_data = $2::json,
                gateway_general_data = payment_service.__extractor_for_pagarme($2::json)
            where id = $1::uuid
        returning *`
        , [paymentId, JSON.stringify(dataToDb)]
    )).rows[0];

    return payment;
};

/*
 * changeSubscriptionCard(client, subscriptionId, cardId)
 * Change subscription card to passed card id if is from same user
 * @param { Object } client - pool connection client
 * @param { uuid } subscriptionId - subscriptions.id
 * @param { uuid } cardId - credit_cards.id
 *
 * @return { Object } subsciption - subscriptions object from database
 */
const changeSubscriptionCard = async (client, subscriptionId, cardId) => {
    const subscription = (await client.query(`
        update payment_service.subscriptions as s
            set credit_card_id = cc.id
        from payment_service.credit_cards cc
            where cc.user_id = s.user_id
                and cc.platform_id = s.platform_id
                and cc.id = $2::uuid
                and s.id = $1::uuid
        returning s.*
    `, [subscriptionId, cardId])).rows[0];

    return subscription;
};

module.exports = {
    pool,
    findPayment,
    loadPaymentContext,
    updateGatewayDataOnPayment,
    createCardFromPayment,
    changeSubscriptionCard
};
