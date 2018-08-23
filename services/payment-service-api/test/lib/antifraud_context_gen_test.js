const {test} = require('ava');
const {
    genAFAddress,
    genAFRegister,
    genAFPhone,
    genAFBilling,
    genAFBuyer,
    genAFShipping,
    genAFShoppingCart,
    genAFEvents,
    genAFMetadata
} = require('../../lib/antifraud_context_gen');

test('test genAFAddress', t => {
    const ctx = {
        payment: {
            data: {
                is_international: false,
                customer: {
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
                        street_number: '200',
                        complementary: 'AP'
                    }
                }
            }
        }
    },
        expected = {
            country: 'Brasil',
            state: 'SP',
            street: 'Rua Lorem',
            city: 'São Paulo',
            zipcode: '33465765',
            neighborhood: 'Centro',
            street_number: '200',
            complementary: 'AP',
            latitude: '',
            longitude: ''
        };

    t.deepEqual(genAFAddress(ctx), expected);
});

test('test genAFRegister', t => {
    const ctx = {
        user: {
            created_at: '2016-02-01 12:30:21',
        },
        payment: {
            user_id: '1234',
            data: {
                customer: {
                    email: 'lorem@lorem.com',
                }
            }
        }
    },
        expected = {
            id: "1234",
            email: "lorem@lorem.com",
            registered_at: '2016-02-01 12:30:21',
            login_source: 'registered',
            company_group: "",
            classification_code: ""
        };

    t.deepEqual(genAFRegister(ctx), expected);
});

test('test genAFPhone', t => {
    const ctx = {
        payment: {
            data: {
                customer: {
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
            ddi: 55,
            ddd: 21,
            number: 88888888
        };

    t.deepEqual(genAFPhone(ctx), expected);
});

test('test genAFBilling', t => {
    const ctx = {
        payment: {
            data: {
                credit_card_owner_document: '11111111111',
                customer: {
                    name:'Lorem name',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            customer: {
                name: "Lorem name",
                document_number: '11111111111',
                born_at: "",
                gender: ""
            },
            address: genAFAddress(ctx),
            phone_numbers: [genAFPhone(ctx)]
        };

    t.deepEqual(genAFBilling(ctx), expected);
});

test('test genAFBuyer', t => {
    const ctx = {
        payment: {
            data: {
                customer: {
                    name:'Lorem name',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            customer: {
                name: "Lorem name",
                document_number: '11111111111',
                born_at: "",
                gender: ""
            },
            address: genAFAddress(ctx),
            phone_numbers: [genAFPhone(ctx)]
        };

    t.deepEqual(genAFBuyer(ctx), expected);
});

test('test genAFShipping', t => {
    const ctx = {
        payment: {
            data: {
                customer: {
                    name:'Lorem name',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            customer: {
                name: "Lorem name",
                document_number: '11111111111',
                born_at: "",
                gender: ""
            },
            address: genAFAddress(ctx),
            phone_numbers: [genAFPhone(ctx)],
            shipping_method: "",
            fee: 0,
            favorite: false
        };

    t.deepEqual(genAFShipping(ctx), expected);
});

test('test genAFShoppingCart', t => {
    const ctx = {
        project: {
            id: '12345',
            data: {
                name: 'foo project'
            }
        },
        payment: {
            data: {
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            name: `10 - foo project`,
            type: "contribution",
            quantity: "1",
            unit_price: 1000,
            totalAdditions: 0,
            totalDiscounts: 0,
            event_id: '12345',
            ticket_type_id: "0",
            ticket_owner_name: 'Lorem name',
            ticket_owner_document_number: '11111111111'
        };

    t.deepEqual(genAFShoppingCart(ctx), expected);
})

test('test genAFEvents', t => {
    const ctx = {
        project_owner: {
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
            data: {
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            id: '12345',
            name: 'foo project',
            type: 'full',
            date: '2016-09-09 12:30:11',
            venue_name: 'project owner name',
            address: {
                country: "Brasil",
                state: 'SP',
                city: 'São Paulo',
                zipcode: '33465765',
                neighborhood: 'Centro',
                street: 'Rua Lorem',
                street_number: '200',
                complementary: 'AP',
                latitude: 0.0,
                longitude: 0.0
            },
            ticket_types: [{
                id: '123',
                name: "",
                type: "",
                batch: "",
                price: 1000,
                available_number: 0,
                total_number: 0,
                identity_verified: "",
                assigned_seats:  ""
            }]
        };

    t.deepEqual(genAFEvents(ctx), expected);
})

test('test genAFMetadata', t => {
    const ctx = {
        user: {
            created_at: '2016-02-01 12:30:21',
        },
        project_owner: {
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
            data: {
                current_ip: '127.0.0.1',
                amount: 1000,
                customer: {
                    name:'Lorem name',
                    document_number: '11111111111',
                    address: {
                        country: 'Brasil',
                        state: 'SP',
                        street: 'Rua Lorem',
                        city: 'São Paulo',
                        zipcode: '33465765',
                        neighbourhood: 'Centro',
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
            session_id: '123',
            ip: '127.0.0.1',
            platform: 'web',
            register: genAFRegister(ctx),
            billing: genAFBilling(ctx),
            buyer: genAFBuyer(ctx),
            shipping: genAFShipping(ctx),
            shopping_cart: [genAFShoppingCart(ctx)],
            discounts: [{
                type: "other",
                code: "",
                amount: 0
            }],
            other_fees: [{
                type: "",
                amount: 0
            }],
            events: [genAFEvents(ctx)]
        };

    t.deepEqual(genAFMetadata(ctx), expected);
})
