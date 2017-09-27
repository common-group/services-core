const {Client} = require('pg');
const pagarme = require('pagarme');

const exit = (code, message) => {
    console.log(message);
    process.exit(code);
};

const init = (stdin_data) => {
    if (stdin_data == null) { exit(1, 'invalid stdin'); }
    const pg_client = new Client(process.env.PROCESS_PAYMENT_DATABASE_URL);
    pg_client.connect();

    // fetch payment and user data to build context
    pg_client.query(
        `select
            row_to_json(cp.*) as payment_data,
            row_to_json(u.*) as user_data
        from payment_service.catalog_payments cp
            join community_service.users u on u.id = cp.user_id
            where cp.id = $1::bigint`
        , [stdin_data.id]
        , (err, res) => {
            if (err) {
                exit(1, err);
            } else {
                const payment = res.rows[0].payment_data;
                const user = res.rows[0].user_data;
                //pg_client.end();

                try {
                    pagarme.client.connect({
                        api_key: process.env.GATEWAY_API_KEY
                    }).then((pagarme_client) => {
                        let transaction_data = {
                        };
                        pagarme_client.transactions.create(transaction_data)
                            .then((transaction) => {
                                console.log(transaction);
                                process.exit(0);
                            }).catch((err) => {
                                pg_client.query(
                                    `update payment_service.catalog_payments
                                        set gateway_cached_data = $2::json
                                    where id = $1::bigint`
                                    , [payment.id, JSON.stringify(err.response.errors)]
                                    , (errq, res) => {
                                        if(errq) { exit(1, errq); }
                                        pg_client.end();
                                        exit(1, err.response.errors);
                                    });
                            });
                    });
                } catch(e) {
                    exit(1, e);
                }
            }
        }
    );

};

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    const data = process.stdin.read();
    if(data!==null) { init(JSON.parse(data)); }
});

