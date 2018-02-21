'use strict';

const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

/*
 * loadPaymentContext(paymentId)
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
const loadPaymentContext = (paymentId) => {
    const client = await pool.connect();

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

    if(_.isEmpty(res.rows)) {
        throw "Payment not found";
        return false;
    };

    return {
        payment: res.rows[0].payment_data,
        user: res.rows[0].user_data,
        project: res.rows[0].project_data,
        project_owner: res.rows[0].project_owner_data,
        subscription: res.rows[0].subscription_data
    }
};

/*
 * createCardFromPayment(paymentId, transaction)
 * insert into credit cards based on payment transaction gateway data
 * @param { uuid } paymentId - catalog payment id
 * @param { Object } transaction -  transaction object from gateway
 * @return { Object } transaction card payment
 */
const createCardFromPayment = (paymentId, transaction) => {
    const res = await client.query(
        `
        insert into payment_service.credit_cards
            (platform_id, user_id, gateway, gateway_data)
            (
                select
                    cp.platform_id,
                    cp.user_id,
                    'pagarme' as gateway,
                    coalesce(
                        (cp.gateway_cached_data -> 'transaction' ->> 'card')::jsonb,
                        $2::jsonb
                    ) as gateway_data
                from payment_service.catalog_payments cp
                where cp.id = $1::uuid
            )
            returning gateway_data
        `, [
            paymentId,
            JSON.stringify(transaction.card)
        ]
    );

    return res.rows[0].gateway_data
};

/*
 * updateGatewayDataOnPayment(paymentId, transaction, payables)
 * update catalog_payment(gateway_cached_data, gateway_general_data)
 * @param { uuid } paymentId - catalog_payment id
 * @param { Object } transaction - object generated when create or fetch a transaction
 * @param { Array[Object] } payables - array of payables from gateway
 */
const updateGatewayDataOnPayment = (paymentId, transaction, payables) => {
    const client = await pool.connect(),
        dataToDb = {
            payables: payables,
            transaction: transaction
        };

    await client.query(
        `update payment_service.catalog_payments
            set gateway_cached_data = $2::json,
                gateway_general_data = payment_service.__extractor_for_pagarme($2::json)
            where id = $1::uuid`
        , [paymentId, JSON.stringify(dataToDb)]
    );
};

module.exports = {
    loadPaymentContext,
    updateGatewayDataOnPayment,
    createCardFromPayment
};
