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
            row_to_json(u.*) as user_data,
            row_to_json(p.*) as project_data,
            row_to_json(o.*) as project_owner_data
        from payment_service.catalog_payments cp
            join community_service.users u on u.id = cp.user_id
            join project_service.projects p on p.id = cp.project_id
            join community_service.users o on o.id = p.user_id
            where cp.id = $1::bigint`
            , [stdin_data.id]);
        if(_.isEmpty(res.rows)) {
            exit(1, 'payment not found');
        }

        const payment = res.rows[0].payment_data;
        const user = res.rows[0].user_data;
        const project = res.rows[0].project_data;
        const project_owner = res.rows[0].project_owner_data;

        const pagarme_client = await pagarme.client.connect({
            api_key: process.env.GATEWAY_API_KEY
        });

        let af_address_data = {
            country: payment.data.address.country,
            state: payment.data.address.state,
            city: payment.data.address.city,
            zipcode: payment.data.address.zipcode
            neighborhood: payment.data.address.neighbourhood,
            street: payment.data.address.street_number,
            street_number: payment.data.address.number,
            complementary: payment.data.adress.complement,
            latitude: '',
            longitude: ''
        };

        let transaction_data = {
            amount: payment.data.amount,
            payment_method: payment.data.payment_method,
            postback_url: process.env.POSTBACK_URL,
            customer: {
                name: user.data.name,
                email: user.data.email,
                document_number: user.data.document_number,
                address: {
                    street: payment.data.address.street,
                    street_number: payment.data.address.street_number,
                    neighborhood: payment.data.address.neighborhood,
                    zipcode: payment.data.address.zipcode
                },
                phone: {
                    ddi: payment.data.phone.ddi,
                    ddd: payment.data.phone.ddd,
                    number: payment.data.phone.number
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
                    id: user.id,
                    email: user.data.email,
                    registered_at: user.created_at,
                    login_source: "registered",
                    company_group: "",
                    classification_code: ""
                },
                billing: {
                    customer: {
                        name: user.data.name,
                        document_number: payment.data.credit_card_owner_document,
                        born_at: "",
                        gender: ""
                    },
                    address: af_address_data,
                    phone_numbers: [
                        {
                            ddi: payment.data.phone.ddi,
                            ddd: payment.data.phone.ddd,
                            number: payment.data.phone.number
                        }
                    ]
                },
                buyer: {
                    customer: {
                        name: user.data.name,
                        document_number: user.data.document_number,
                        born_at: "",
                        gender: ""
                    },
                    adress: af_address_data,
                    phone_numbers: [{
                        ddi: payment.data.phone.ddi,
                        ddd: payment.data.phone.ddd,
                        number: payment.data.phone.number
                    }]
                },
                shipping: {
                    customer: {
                        name: user.data.name,
                        document_number: user.data.document_number,
                        bornt_at: "",
                        gender: ""
                    },
                    adress: af_address_data,
                    phone_numbers: [{
                        ddi: payment.data.phone.ddi,
                        ddd: payment.data.phone.ddd,
                        number: payment.data.phone.number
                    }],
                    shipping_method: "",
                    fee: 0,
                    favorite: false
                },
                shopping_cart: [{
                    name: `${payment.data.amount/100.0} - ${project.data.name}`,
                    type: "contribution",
                    quantity: "1",
                    unit_price: payment.data.amount
                    totalAdditions: 0,
                    totalDiscounts: 0,
                    event_id: poject.id,
                    ticket_type_id: "0",
                    ticket_owner_name: user.data.name
                    ticket_owner_document_number: user.data.document_number
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
                    type: project.mode == 'flex' ? 'flex' : 'full',
                    date: project.data.expires_at,
                    venue_name: project_owner.data.name,
                    address: {
                        country: "Brasil",
                        state: project_owner.data.address.state
                        city: project_owner.data.addess.city,
                        zipcode: project_owner.data.address.zipcode,
                        neighborhood: project_owner.data.address.neighborhood,
                        street: project_owner.data.address.street,
                        street_number: project_owner.data.address.street_number,
                        complementary: project_owner.data.address.complement,
                        latitude: 0.0,
                        longitude: 0.0
                    },
                    ticket_types: [
                        {
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
            };

        if(payment.data.payment_method == 'credit_card') {
            let payment_charge = (payment.data.card_hash ? {
                card_hash: payment.data.card_hash
            } : {
                card_id: payment.data.card_id
            });

            _.extend(transaction_data, payment_charge);
        }

        const update_payment_sql = `update payment_service.catalog_payments
                    set gateway_cached_data = $2::json
                    where id = $1::bigint`;

        try {
            const transaction = await pagarme_client.transactions.create(transaction_data)
            console.log(transaction);
            let transaction_data = {
                transaction: transaction,
                payables: transaction.payables
            };

            let insert_transaction = await pg_client.query(
                update_payment_sql
                , [payment.id, JSON.stringify(transaction_data)]);

            console.log(insert_transaction);
        } catch(err) {
            let insert_errors = await pg_client.query(
                update_payment_sql
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
