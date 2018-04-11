#!/usr/local/bin/node
'use strict';

const {Pool} = require('pg');
const pagarme = require('pagarme');
const getStdin = require('get-stdin');
const _ = require('lodash');
const Raven = require('raven');
const { DateTime } = require('luxon');

const pool = new Pool({
    connectionString: process.env.PROCESS_PAYMENT_DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000),
    max: 3
});

if(process.env.SENTRY_DSN) {
    Raven.config(process.env.SENTRY_DSN).install();
};


getStdin().then(str => {
    if(str !== null && str !== "") {
        try {
            const json_message = JSON.parse(str);
            init(json_message)
                .then((ok) => {
                    console.log(ok);
                    process.exitCode = 0;
                    return true;
                })
                .catch((e) => {
                    console.log(e);
                    process.exitCode = 1;
                    return false;
                });
        } catch (e) {
            process.exitCode = 1;
            console.log(e);
            return false;
        }
    } else {
        console.log('invalid stdin');
        process.exit(1);
    }
});

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


async function init(stdin_data) {
    const client = await pool.connect()
    let basic_raven_context = {};

    try {

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
            , [stdin_data.id]);

        if(_.isEmpty(res.rows)) {
            throw "Payment not found";
            return false;
        };

        const payment = res.rows[0].payment_data;
        const user = res.rows[0].user_data;
        const project = res.rows[0].project_data;
        const project_owner = res.rows[0].project_owner_data;
        const subscription = res.rows[0].subscription_data;
        const is_international = payment.data.is_international || false;

        let basic_raven_context = {
            user: {
                id: user.id,
                payment_id: payment.id,
                subscription_id: payment.subscription_id
            }
        };

        await client.query('BEGIN');

        const pagarme_client = await pagarme.client.connect({
            api_key: process.env.GATEWAY_API_KEY
        });

        let customer = payment.data.customer;

        let af_address_data = {
            country: customer.address.country,
            state: customer.address.state,
            city: customer.address.city,
            zipcode: (is_international ? '00000000' : customer.address.zipcode),
            neighborhood: customer.address.neighbourhood,
            street_number: (is_international ? '100' : customer.address.street_number),
            complementary: customer.address.complementary,
            latitude: '',
            longitude: ''
        };

        let transaction_data = {
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
            antifraud_metadata: {
                session_id: payment.id,
                ip: payment.data.current_ip,
                platform: "web",
                register: {
                    id: payment.user_id,
                    email: customer.email,
                    registered_at: user.created_at,
                    login_source: "registered",
                    company_group: "",
                    classification_code: ""
                },
                billing: {
                    customer: {
                        name: customer.name,
                        document_number: payment.data.credit_card_owner_document,
                        born_at: "",
                        gender: ""
                    },
                    address: af_address_data,
                    phone_numbers: [
                        {
                            ddi: customer.phone.ddi,
                            ddd: customer.phone.ddd,
                            number: customer.phone.number
                        }
                    ]
                },
                buyer: {
                    customer: {
                        name: customer.name,
                        document_number: customer.document_number,
                        born_at: "",
                        gender: ""
                    },
                    address: af_address_data,
                    phone_numbers: [{
                        ddi: customer.phone.ddi,
                        ddd: customer.phone.ddd,
                        number: customer.phone.number
                    }]
                },
                shipping: {
                    customer: {
                        name: customer.name,
                        document_number: customer.document_number,
                        bornt_at: "",
                        gender: ""
                    },
                    address: af_address_data,
                    phone_numbers: [{
                        ddi: customer.phone.ddi,
                        ddd: customer.phone.ddd,
                        number: customer.phone.number
                    }],
                    shipping_method: "",
                    fee: 0,
                    favorite: false
                },
                shopping_cart: [{
                    name: `${payment.data.amount/100.0} - ${project.data.name}`,
                    type: "contribution",
                    quantity: "1",
                    unit_price: payment.data.amount,
                    totalAdditions: 0,
                    totalDiscounts: 0,
                    event_id: project.id,
                    ticket_type_id: "0",
                    ticket_owner_name: customer.name,
                    ticket_owner_document_number: customer.document_number,
                }],
                discounts: [{
                    type: "other",
                    code: "",
                    amount: 0
                }],
                other_fees: [{
                    type: "",
                    amount: 0
                }],
                events: [{
                    id: project.id,
                    name: project.data.name,
                    type: project.mode === 'aon' ? 'full' : project.mode,
                    date: project.data.expires_at,
                    venue_name: project_owner.data.name,
                    address: {
                        country: "Brasil",
                        state: project_owner.data.address.state,
                        city: project_owner.data.address.city,
                        zipcode: project_owner.data.address.zipcode,
                        neighborhood: project_owner.data.address.neighborhood,
                        street: project_owner.data.address.street,
                        street_number: project_owner.data.address.street_number,
                        complementary: project_owner.data.address.complementary,
                        latitude: 0.0,
                        longitude: 0.0
                    },
                    ticket_types: [{
                        id: payment.id,
                        name: "",
                        type: "",
                        batch: "",
                        price: payment.data.amount,
                        available_number: 0,
                        total_number: 0,
                        identity_verified: "",
                        assigned_seats:  ""
                    }]
                }]
            }
        };

        if(payment.data.payment_method === 'credit_card') {
            let payment_charge = (payment.data.card_hash ? {
                card_hash: payment.data.card_hash
            } : {
                card_id: payment.data.card_id
            });

            _.extend(transaction_data, payment_charge);
        } else {
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

            transaction_data['boleto_expiration_date'] = expirationDate(
                DateTime.local(), 4);
        }

        try {
            const transaction = await pagarme_client.
                transactions.create(transaction_data);
            console.log('created transaction with id ',
                transaction.id);

            if (transaction.id) {
                const payables = await pagarme_client.
                    payables.find({ transactionId: transaction.id});

                const result_transaction_data = {
                    transaction: transaction,
                    payables: payables
                };

                // update payment with gateway payable and transaction data
                await client.query(
                    `update payment_service.catalog_payments
                    set gateway_cached_data = $2::json,
                        gateway_general_data = payment_service.__extractor_for_pagarme($2::json) where id = $1::uuid`
                    , [
                        payment.id, 
                        JSON.stringify(result_transaction_data)
                    ]);

                // create credit card refence on db if save_card or subscriptions
                if(transaction.card && (payment.data.save_card || (_.isNull(subscription.credit_card_id) && payment.subscription_id))) {
                    const saved_card_result = await client.query(
                    `insert into payment_service.credit_cards(platform_id, user_id, gateway, gateway_data) values ($1::uuid, $2::uuid, 'pagarme', $3::jsonb) returning *`, [
                        payment.platform_id,
                        payment.user_id,
                        JSON.stringify(transaction.card)
                    ]);
                    const card = saved_card_result.rows[0];

                    //update subscription with credit card id
                    if(payment.subscription_id) {
                        await client.query(
                            `update payment_service.subscriptions
                                set credit_card_id = $2::uuid
                                where id = $1::uuid
                            `, [payment.subscription_id, card.id]
                        );
                    }
                }
                if(payment.subscription_id && transaction.payment_method === 'boleto' && _.includes(['processing', 'waiting_payment'], transaction.status)) {
                    try {
                        await client.query(
                            `select notification_service.notify('slip_subscription_payment', json_build_object('relations', json_build_object(
                        'catalog_payment_id', $1::uuid,
                        'subscription_id', $2::uuid,
                        'project_id', $3::uuid,
                        'reward_id', $4::uuid,
                        'user_id', $5::uuid
                    )))`, [payment.id, payment.subscription_id, payment.project_id, payment.reward_id, payment.user_id]);
                    } catch (e) {
                        console.log('failed notify', e);
                    }
                }
                // if transaction is not on initial state should transition payment to new state
                if (!_.includes(['processing', 'waiting_payment'], transaction.status)) {
                    await client.query(
                        `select
                            payment_service.transition_to(p, ($2)::payment_service.payment_status, payment_service.__extractor_for_pagarme(($3)::json))
                        from payment_service.catalog_payments p
                        where p.id = ($1)::uuid
                    `, [
                        payment.id,
                        transaction.status,
                        JSON.stringify(result_transaction_data)
                    ]);

                    // if payment is paid or refused and have a subscription related should transition subscription to new status
                    if (payment.subscription_id) {
                        const transition_subscription_sql = `select payment_service.transition_to(s, ($2)::payment_service.subscription_status, payment_service.__extractor_for_pagarme(($3)::json))
                        from payment_service.subscriptions s where s.id = ($1)::uuid`;
                        // should active subscription when payment is paid
                        if(transaction.status === 'paid') {
                            await client.query(
                                transition_subscription_sql,
                                [
                                    payment.subscription_id,
                                    'active',
                                    JSON.stringify(result_transaction_data)
                                ]
                            );
                        // should inactive subscription when refused
                        } else if(transaction.status === 'refused') {
                            // && subscription.status !== 'started'
                            const sub_transition = await client.query(
                                transition_subscription_sql,
                                [
                                    payment.subscription_id,
                                    'inactive',
                                    JSON.stringify(result_transaction_data)
                                ]
                            );
                        }
                    }
                }

                await client.query("COMMIT;");
            } else {
                console.log('not charged on gateway');
                console.log(transaction);
                await client.query("ROLLBACK;");
            }

            return true;
        } catch(err) {
            await client.query("ROLLBACK;");
            if(err.response && err.response.errors) {
                await client.query("BEGIN");
                await client.query(
                    `update payment_service.catalog_payments
                    set gateway_cached_data = $2::json
                    where id = $1::uuid`
                    , [payment.id, JSON.stringify(err.response.errors)]);
                await client.query(`
                        select
                            payment_service.transition_to(p, ($2)::payment_service.payment_status, ($3)::json)
                        from payment_service.catalog_payments p
                        where p.id = ($1)::uuid
                `, [payment.id, 'error', JSON.stringify(err.response.errors)]);
                await client.query("COMMIT;");
            }

            raven_report(err, basic_raven_context);
            throw err;
        }
    } catch (e) {
        raven_report(e, basic_raven_context);
        throw e;
    } finally {
        client.release();
    };
};
