const express = require('express');
const process = require('process');
const bodyParser = require('body-parser');
const pagarme = require('pagarme');
const R = require('ramda');
const {Pool} = require('pg');
const Raven = require('raven');

if(process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
};

function raven_report(e, context_opts) {
    if(process.env.SENTRY_DSN) {
        Raven.context(function () {
            if(context_opts) {
                Raven.setContext(context_opts);
            };

            Raven.captureException(e, (sendErr, event) => {
                if(sendErr) {
                    console.log('error on log to sentry')
                } else {
                    console.log('raven logged event', event);
                }
            });
        });
    };
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000)
});

const server = express();

server.use(bodyParser.json({
    verify: function(req, res, buf, encoding) {
        req.rawBody = buf.toString(encoding);
    }
}));       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
    verify: function(req, res, buf, encoding) {
        req.rawBody = buf.toString(encoding);
    }
})); 


server.get('/', (req, res) => {
    res.send("hooks :D");
});

server.post('/postbacks/:gateway_name', async (req, resp) => {
    if(req.params.gateway_name === 'pagarme') {
        try {
            let gateway_client = await pagarme.client.connect({
                api_key: process.env.GATEWAY_API_KEY
            });

            // check if postback is from gateway
            if(gateway_client.security.verify(req.rawBody, req.headers['x-hub-signature'].split('=')[1])) {
                console.log('received valid postback ', req.body);

                // fetch payment and user data to build context
                const res = await pool.query(
                    `select
            row_to_json(cp.*) as payment_data,
            row_to_json(u.*) as user_data,
            row_to_json(p.*) as project_data,
            row_to_json(o.*) as project_owner_data,
            row_to_json(s.*) as subscription_data,
            row_to_json(last_payment.*) as last_payment_data
        from payment_service.catalog_payments cp
            join community_service.users u on u.id = cp.user_id
            join project_service.projects p on p.id = cp.project_id
            join community_service.users o on o.id = p.user_id
            left join payment_service.subscriptions s on s.id = cp.subscription_id
            left join lateral (
                select cp2.*
                    from payment_service.catalog_payments cp2
                    where cp2.subscription_id = s.id
                        and s.id is not null
                        order by cp2.created_at desc
                        limit 1
            ) as last_payment on true
            where cp.id = $1::uuid`
                    , [req.body.transaction.metadata.payment_id]);
                if(R.isEmpty(res.rows) || res.rows == null) {
                    exit(1, 'payment not found');
                }

                const payment = res.rows[0].payment_data;
                const user = res.rows[0].user_data;
                const project = res.rows[0].project_data;
                const project_owner = res.rows[0].project_owner_data;
                const subscription = res.rows[0].subscription_data;
                const last_payment = res.rows[0].last_payment_data;

                const current_status = req.body.current_status;
                const transaction = req.body.transaction;

                // transaction payment to status
                if (!['processing', 'waiting_payment', 'pending_review','pending_refund'].includes(current_status)) {

                const payables = await gateway_client.
                    payables.find({ transactionId: transaction.id});

                const result_transaction_data = {
                    transaction: transaction,
                    payables: payables
                };

                // update payment with gateway payable and transaction data
                await pool.query(
                    `update payment_service.catalog_payments
                    set gateway_cached_data = $2::json,
                        gateway_general_data = payment_service.__extractor_for_pagarme($2::json) where id = $1::uuid`
                    , [
                        payment.id, 
                        JSON.stringify(result_transaction_data)
                    ]);
                    // transition payment to current_status
                    await pool.query(
                        `select
                            payment_service.transition_to(p, ($2)::payment_service.payment_status, $3::json)
                        from payment_service.catalog_payments p
                        where p.id = ($1)::uuid
                    `, [
                        payment.id,
                        current_status,
                        JSON.stringify(req.body)
                    ]);

                    // check if has subscription and last_payment is the same of payment to perform subscription transition
                    if(!R.isEmpty(subscription) && subscription != null && last_payment.id === payment.id) {
                        const subscription_transition_sql = `
                        select
                            payment_service.transition_to(s, ($2)::payment_service.subscription_status, $3::json)
                        from payment_service.subscriptions s
                        where s.id = ($1)::uuid
                        `;

                        if(current_status === 'paid' && subscription.status != 'active') {
                            // active subscription when current_status is paid
                            await pool.query(subscription_transition_sql
                                , [subscription.id, 'active', JSON.stringify(req.body)]);
                        } else if (current_status === 'refused') {
                            // NOTE: now we have a retries before inactive on first refused
                            // inactive subscription when payment is refused
                            // await pool.query(subscription_transition_sql
                            //    , [subscription.id, 'inactive', JSON.stringify(req.body)]);
                        } else if (current_status === 'chargedback') {
                            // inactive subscription when payment is chargedback
                            await pool.query(subscription_transition_sql
                                , [subscription.id, 'inactive', JSON.stringify(req.body)]);
                        }

                    }
                }
                resp.send("ok");
            } else {
                resp.status(400).send("invalid signature");
            }
        } catch (err) {
            raven_report(err, {});
            console.log('Error on get pagarme client ', err);
        }
    };
});

server.listen(process.env.PORT || '4444', () => {
    console.log('start server');
});
