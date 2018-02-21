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

module.exports = {
    loadPaymentContext,
};
