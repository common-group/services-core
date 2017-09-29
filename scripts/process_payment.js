'use strict';

const {Client} = require('pg');
const pagarme = require('pagarme');
const getStdin = require('get-stdin');
const _ = require('lodash');

getStdin().then(str => {
    if(str !== null && str !== "") {
        init(JSON.parse(str))
            .then( x => void(0) )
            .catch( x => void(0) )
    }
});

async function init(stdin_data) {
    const exit = (code, message) => {
        console.log(message);
        process.exit(code);
    };

    try {
        const pg_client = new Client({
            connectionString: process.env.PROCESS_PAYMENT_DATABASE_URL,
            statement_timeout: 5000
        });
        await pg_client.connect();

        // fetch payment and user data to build context
        const res = await pg_client.query(
            `select
            row_to_json(cp.*) as payment_data,
            row_to_json(u.*) as user_data
        from payment_service.catalog_payments cp
            join community_service.users u on u.id = cp.user_id
            where cp.id = $1::bigint`
            , [stdin_data.id]);
        if(_.isEmpty(res.rows)) {
            exit(1, 'payment not found');
        }

        const payment = res.rows[0].payment_data;
        const user = res.rows[0].user_data;

        const pagarme_client = await pagarme.client.connect({
            api_key: process.env.GATEWAY_API_KEY
        });

        let transaction_data = {};

        try {
            const transaction = await pagarme_client.transactions.create(transaction_data)
            console.log(transaction);
        } catch(err) {
            let insert_errors = await pg_client.query(
                `update payment_service.catalog_payments
                    set gateway_cached_data = $2::json
                    where id = $1::bigint`
                , [payment.id, JSON.stringify(err.response.errors)]);

            console.log(err.response.errors);
        }

        await pg_client.end();
        console.log('done');
    } catch (e) {
        console.log(e);
        exit(1, e);
    };
};
