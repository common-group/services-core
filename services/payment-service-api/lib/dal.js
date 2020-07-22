'use strict';

const {Pool} = require('pg');
const R = require('ramda');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

/*
 * generateDalContext(client)
 * generate the database layer context with client scoped
 * @param { Object } client - postgres client object
 *
 * @return { Oject } - object with all dal functions
 */
const generateDalContext = (client) => {
    /*
     * findCard(id)
     * find credit card by id on database
     * @param { uuid } id - payment_service.credit_cards.id(uuid v4)
     *
     * @return { Object } - card object
     */
    const findCard = async (id) => {
        return (await client.query(`
            select * from payment_service.credit_cards where id = $1::uuid
        `, [ id ])).rows[0];
    };

    /*
     * findPayment(paymentId)
     * find payment by id on database
     * @param { uuid } paymentId - catalog_payments.id(uuid v4)
     *
     * @return { Object } - payment object from database
     */
    const findPayment = async (paymentId) => {
        const payment = (await client.query(`
            select * from payment_service.catalog_payments where id = $1::uuid
        `, [ paymentId ])).rows[0];

        return payment;
    };

    /*
     * findSubscription(subscriptionId)
     * find subscription by id on database
     * @param { uuid } subscriptionId - subscriptions.id(uuid v4)
     *
     * @return { Object } - subscription object from database
     */
    const findSubscription = async (subscriptionId) => {
        const subscription = (await client.query(`
            select * from payment_service.subscriptions where id = $1::uuid
        `, [ subscriptionId ])).rows[0];

        return subscription;
    };

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
    const loadPaymentContext = async (paymentId) => {
        // fetch payment and user data to build context
        const res = await client.query(`select
                row_to_json(cp.*) as payment_data,
                row_to_json(u.*) as user_data,
                row_to_json(p.*) as project_data,
                row_to_json(o.*) as project_owner_data,
                row_to_json(s.*) as subscription_data,
                row_to_json(pcc.*) as payment_card

            from payment_service.catalog_payments cp
                join community_service.users u on u.id = cp.user_id
                join project_service.projects p on p.id = cp.project_id
                join community_service.users o on o.id = p.user_id
                left join payment_service.subscriptions s on s.id = cp.subscription_id
                left join payment_service.credit_cards pcc on cp.data->>'card_id' is not null and pcc.id = (cp.data->>'card_id')::uuid
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
            subscription: res.rows[0].subscription_data,
            payment_card: res.rows[0].payment_card
        });

        return ctx;
    };

    const isCardAlreadyAnalyzedOnAntifraud = async (cardId) => {
        const res = await client.query(`
            SELECT payment.gateway_general_data->>'card_id'
            FROM payment_service.catalog_payments payment
            WHERE payment.gateway_general_data->>'card_id' = $1
                AND payment.status = 'paid'
                AND payment.data ->> 'payment_method' = 'credit_card'
        `, [cardId])

        if(res.rows.length === 0) {
            return false
        } else {
            return true
        }
    }

    /*
     * updateCardFromGateway(card_id, gateway_card_data)
     * update credit card with gateway card attributes
     * @param { uuid } card_id - credit card id
     * @param { Object } gateway_card_data - gateway credit card object
     *
     * @return { Object } credit_cards attributes from database
     */
    const updateCardFromGateway = async (card_id, gateway_card_data) => {
        const card = (await client.query(
            `update payment_service.credit_cards
                set gateway_data = $1::jsonb
                where id = $2::uuid
            returning *
            `, [
                JSON.stringify(gateway_card_data),
                card_id
            ])).rows[0];

        return card;
    };

    /*
     * createCardFromPayment(paymentId)
     * insert into credit cards based on payment transaction gateway data
     * @param { uuid } paymentId - catalog payment id
     *
     * @return { Object } credit_cards attibutes from database
     */
    const createCardFromPayment = async (paymentId) => {
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
     * updateGatewayDataOnPayment(paymentId, data_reason)
     * update catalog_payment(gateway_cached_data)
     * @param { uuid } paymentId - catalog_payment id
     * @param { Object } data_reason- object with tansaction, payables or error
     * @param { Array[Object] } payables - array of payables from gateway
     *
     * @return { Object } payment - catalog_payment upated
     */
    const updateGatewayDataOnPayment = async (paymentId, data_reason) => {
        const payment = (await client.query(
            `update payment_service.catalog_payments
                set gateway_cached_data = $2::json
                where id = $1::uuid
            returning *`
            , [paymentId, JSON.stringify(data_reason)]
        )).rows[0];

        return payment;
    };

    /*
     * buildGatewayGeneralDataOnPayment(paymentId, transaction, payables)
     * update catalog_payment(gateway_general_data)
     * @param { uuid } paymentId - catalog_payment id
     * @param { Object } transaction - object generated when create or fetch a transaction
     * @param { Array[Object] } payables - array of payables from gateway
     *
     * @return { Object } payment - catalog_payment upated
     */
    const buildGatewayGeneralDataOnPayment= async (paymentId, transaction, payables) => {
        const dataToDb = {
            payables: payables,
            transaction: transaction
        };

        const payment = (await client.query(
            `update payment_service.catalog_payments
                    set gateway_general_data = payment_service.__extractor_for_pagarme($2::json)
                where id = $1::uuid
            returning *`
            , [paymentId, JSON.stringify(dataToDb)]
        )).rows[0];

        return payment;
    };

    /*
     * changeSubscriptionCard(subscriptionId, cardId)
     * Change subscription card to passed card id if is from same user
     * @param { uuid } subscriptionId - subscriptions.id
     * @param { uuid } cardId - credit_cards.id
     *
     * @return { Object } subsciption - subscriptions object from database
     */
    const changeSubscriptionCard = async (subscriptionId, cardId) => {
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

    /*
     * notificationServiceNotify(label, body_with_relations)
     * @param { Object } client - pool connection client
     * @param { string } label - subscriptions.id
     * @param { Object } body_with_relations - Object with relation attributes and another custom attributes
     *
     * @return { Object } notification - notification created object
     */
    const notificationServiceNotify = async (label, body_with_relations) =>  {
        const notification = (await client.query(`
            select * from notification_service.notify($1::text, $2::json)
        `, [ label, JSON.stringify(body_with_relations) ])).rows[0];

        return notification;
    };

    /*
     * paymentTransitionTo(paymentId, status, transitionReason)
     * Transition payment status changes (maybe trigger some notifications when changing payment status)
     * @param { uuid } paymentId - catalog_payments.id
     * @param { string } status - current status to transition
     * @param { Object } transitionReason - reason to transaction the payment ({payables, transaction})
     *
     * @return { Object } payment - payment object updated
     */
    const paymentTransitionTo = async (paymentId, status, transitionReason) => {
        await client.query(`
            select payment_service.transition_to(
                p,
                ($2)::payment_service.payment_status,
                payment_service.__extractor_for_pagarme(($3)::json)
            ) from payment_service.catalog_payments p
            where p.id = $1::uuid
        `, [ paymentId, status, JSON.stringify(transitionReason) ]);

        return await findPayment(paymentId);
    };

    /*
     * subscriptionTransitionTo(subscriptionId, status, transitionReason)
     * Transition subscription status changes (maybe trigger some notifications when changing status)
     * @param { uuid } subscriptionId - subscriptions.id
     * @param { string } status - current status to transition
     * @param { Object } transitionReason - reason to transaction the payment ({payables, transaction})
     *
     * @return { Object } subscription - subscription object updated
     */
    const subscriptionTransitionTo = async (subscriptionId, status, transitionReason) => {
        await client.query(`
            select payment_service.transition_to(
                s,
                ($2)::payment_service.subscription_status,
                payment_service.__extractor_for_pagarme(($3)::json)
            ) from payment_service.subscriptions s
            where s.id = $1::uuid
        `, [subscriptionId, status, JSON.stringify(transitionReason) ]);

        return await findSubscription(subscriptionId);
    };

    const insertAntifraudAnalysis = async (paymentId, data) => {
        const query = `
            insert into
                payment_service.antifraud_analyses(catalog_payment_id, data, cost)
            VALUES(
                $1,
                $2,
                (SELECT value::numeric FROM core.core_settings WHERE name = 'antifraud_cost')
            )
        `
        return await client.query(query, [paymentId, data])
    };

    const getPaymentsWithMissingPayables = async () => {
        const query = `
            SELECT
                id,
                gateway_cached_data -> 'transaction' ->> 'id' AS gateway_id
            FROM
                payment_service.catalog_payments cp
            WHERE
                status IN ('paid')
                AND created_at::date >= '2020-01-01'::date
                AND jsonb_array_length(COALESCE(gateway_general_data ->> 'payables', '[]')::jsonb) = 0
            ORDER BY
                created_at DESC
            LIMIT
                100
        `

        return await client.query(query)
    }

    return {
        findCard,
        findPayment,
        findSubscription,
        loadPaymentContext,
        isCardAlreadyAnalyzedOnAntifraud,
        updateCardFromGateway,
        updateGatewayDataOnPayment,
        buildGatewayGeneralDataOnPayment,
        createCardFromPayment,
        changeSubscriptionCard,
        notificationServiceNotify,
        paymentTransitionTo,
        subscriptionTransitionTo,
        insertAntifraudAnalysis,
        getPaymentsWithMissingPayables
    }
};

module.exports = {
    pool,
    generateDalContext
};
