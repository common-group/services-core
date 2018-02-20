const {test} = require('ava');
const { DateTime } = require('luxon');
const { 
    genTransactionData, 
    isForeign,
    expirationDate,
    createGatewayTransaction
} = require('../lib/payment_process');
const { genAFMetadata } = require('../lib/antifraud_context_gen');

test('test isForeign with is_international = true', t => {
    const ctx = {
        payment: {
            data: {
                is_international: true
            }
        }
    };

	t.is(isForeign(ctx), true);
});

test('test isForeign with is_international = false', t => {
    const ctx = {
        payment: {
            data: {
                is_international: false
            }
        }
    };

	t.is(isForeign(ctx), false);
});

test('test isForeign with is_international not setted', t => {
    const ctx = {
        payment: {
            data: {
            }
        }
    };

	t.is(isForeign(ctx), false);
});

test('test genTransactionData with boleto', t => {
    const ctx = {
        user: {
            id: '1234',
            created_at: '2016-02-01 12:30:21',
        },
        project_owner: {
            id: '12345',
            data: {
                name: 'project owner name',
                address: {
                    country: 'Brasil',
                    state: 'SP',
                    street: 'Rua Lorem',
                    city: 'São Paulo',
                    zipcode: '33465765',
                    neighborhood: 'Centro',
                    street_number: '200',
                    complementary: 'AP'
                }
            }
        },
        project: {
            id: '12345',
            mode: 'aon',
            data: {
                name: 'foo project',
                expires_at: '2016-09-09 12:30:11'
            }
        },
        payment: {
            id: '123',
            user_id: '1234',
            project_id: '12345',
            subscription_id: null,
            platform_id: '12345678',
            created_at: '2016-02-01 12:30:20',
            data: {
                payment_method: 'boleto',
                current_ip: '127.0.0.1',
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    email: 'lorem@email.com',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighborhood: 'Centro',
                        street_number: '200',
                        complementary: 'AP'
                    },
                    phone: {
                        ddi: 55,
                        ddd: 21,
                        number: 88888888
                    }
                }
            }
        }
    },
        expected = {
            amount: 1000,
            payment_method: 'boleto',
            postback_url: undefined,
            async: false,
            customer: {
                name: 'Lorem name',
                email: 'lorem@email.com',
                document_number: '11111111111',
                address: {
                    street: 'Rua Lorem',
                    zipcode: '33465765',
                    neighborhood: 'Centro',
                    street_number: '200',
                },
                phone: {
                    ddi: 55,
                    ddd: 21,
                    number: 88888888
                }
            },
            metadata: {
                payment_id: '123',
                project_id: '12345',
                platform_id: '12345678',
                subscription_id: null,
                user_id: '1234',
                cataloged_at: '2016-02-01 12:30:20'
            },
            antifraud_metadata: genAFMetadata(ctx)
        };

    let res = genTransactionData(ctx);
    expected.boleto_expiration_date = res.boleto_expiration_date;
	t.deepEqual(res, expected);
});

test('test genTransactionData with card_hash', t => {
    const ctx = {
        user: {
            id: '1234',
            created_at: '2016-02-01 12:30:21',
        },
        project_owner: {
            id: '12345',
            data: {
                name: 'project owner name',
                address: {
                    country: 'Brasil',
                    state: 'SP',
                    street: 'Rua Lorem',
                    city: 'São Paulo',
                    zipcode: '33465765',
                    neighborhood: 'Centro',
                    street_number: '200',
                    complementary: 'AP'
                }
            }
        },
        project: {
            id: '12345',
            mode: 'aon',
            data: {
                name: 'foo project',
                expires_at: '2016-09-09 12:30:11'
            }
        },
        payment: {
            id: '123',
            user_id: '1234',
            project_id: '12345',
            subscription_id: null,
            platform_id: '12345678',
            created_at: '2016-02-01 12:30:20',
            data: {
                payment_method: 'credit_card',
                card_hash: 'card_hash_123',
                current_ip: '127.0.0.1',
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    email: 'lorem@email.com',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighborhood: 'Centro',
                        street_number: '200',
                        complementary: 'AP'
                    },
                    phone: {
                        ddi: 55,
                        ddd: 21,
                        number: 88888888
                    }
                }
            }
        }
    },
        expected = {
            amount: 1000,
            payment_method: 'credit_card',
            card_hash: 'card_hash_123',
            postback_url: undefined,
            async: false,
            customer: {
                name: 'Lorem name',
                email: 'lorem@email.com',
                document_number: '11111111111',
                address: {
                    street: 'Rua Lorem',
                    zipcode: '33465765',
                    neighborhood: 'Centro',
                    street_number: '200',
                },
                phone: {
                    ddi: 55,
                    ddd: 21,
                    number: 88888888
                }
            },
            metadata: {
                payment_id: '123',
                project_id: '12345',
                platform_id: '12345678',
                subscription_id: null,
                user_id: '1234',
                cataloged_at: '2016-02-01 12:30:20'
            },
            antifraud_metadata: genAFMetadata(ctx)
        };

	t.deepEqual(genTransactionData(ctx), expected);
});

