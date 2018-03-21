'use strict';

/*
 * genAFAddress(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with adress attributes based on context payment data
 */
const genAFAddress = (ctx) => {
    const customer = ctx.payment.data.customer;

    return {
        country: customer.address.country,
        state: customer.address.state,
        city: customer.address.city,
        street: customer.address.street,
        zipcode: customer.address.zipcode,
        neighborhood: customer.address.neighbourhood,
        street_number: customer.address.street_number,
        complementary: customer.address.complementary,
        latitude: '',
        longitude: ''
    };
};

/*
 * genAFRegister(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with register attributes
 */
const genAFRegister = (ctx) => {
    return {
        id: ctx.payment.user_id,
        email: ctx.payment.data.customer.email,
        registered_at: ctx.user.created_at,
        login_source: "registered",
        company_group: "",
        classification_code: ""
    };
};

/*
 * genAFPhone(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with phone_numbers attributes
 */
const genAFPhone = (ctx) => {
    const customer = ctx.payment.data.customer;

    return {
        ddi: customer.phone.ddi,
        ddd: customer.phone.ddd,
        number: customer.phone.number
    };
};

/*
 * genAFBilling(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with billing attributes
 */
const genAFBilling = (ctx) => {
    const payment_data = ctx.payment.data;
    const customer = ctx.payment.data.customer;

    return {
        customer: {
            name: customer.name,
            document_number: (payment_data.credit_card_owner_document || customer.document_number),
            born_at: "",
            gender: ""
        },
        address: genAFAddress(ctx),
        phone_numbers: [genAFPhone(ctx)]
    };
};

/*
 * genAFBuyer(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with buyer attributes
 */
const genAFBuyer = (ctx) => {
    const payment_data = ctx.payment.data;
    const customer = ctx.payment.data.customer;

    return {
        customer: {
            name: customer.name,
            document_number: customer.document_number,
            born_at: "",
            gender: ""
        },
        address: genAFAddress(ctx),
        phone_numbers: [genAFPhone(ctx)]
    };
};

/*
 * genAFShipping(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with shipping attributes
 */
const genAFShipping = (ctx) => {
    const payment_data = ctx.payment.data;
    const customer = ctx.payment.data.customer;

    return {
        customer: {
            name: customer.name,
            document_number: customer.document_number,
            born_at: "",
            gender: ""
        },
        address: genAFAddress(ctx),
        phone_numbers: [genAFPhone(ctx)],
        shipping_method: "",
        fee: 0,
        favorite: false
    };
};

/*
 * genAFShoppingCart(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with shopping cart attributes
 */
const genAFShoppingCart = (ctx) => {
    const payment = ctx.payment,
        project = ctx.project,
        customer = payment.data.customer;

    return {
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
    };
}

/*
 * genAFEvents(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with events attributes
 */
const genAFEvents = (ctx) => {
    const project = ctx.project,
        project_owner = ctx.project_owner,
        payment = ctx.payment;

    return {
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
    };

};


/*
 * genAFMetadata(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * returns a object with all antifraud metadata
 */
const genAFMetadata = (ctx) => {
    const payment = ctx.payment;
    return {
        session_id: payment.id,
        ip: payment.data.current_ip,
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
};


module.exports = {
    genAFAddress,
    genAFRegister,
    genAFPhone,
    genAFBilling,
    genAFBuyer,
    genAFShipping,
    genAFShoppingCart,
    genAFEvents,

    genAFMetadata
};
