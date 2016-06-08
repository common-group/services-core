import I18n from 'i18n-js';

const paymentVM = (mode) => {
    const error = m.prop([]),
        completeName  = m.prop(''),
        email = m.prop(''),
        anonymous = m.prop(''),
        countries = m.prop(''),
        zipCode = m.prop(''),
        street = m.prop(''),
        number = m.prop(''),
        addressComplement = m.prop(''),
        neighbourhood = m.prop(''),
        city = m.prop(''),
        states = m.prop(''),
        ownerDocument = m.prop(''),
        phone = m.prop(''),
        faq = I18n.translations[I18n.currentLocale()].projects.faq[mode];

    return {
        error: error,
        completeName: completeName,
        email: email,
        anonymous: anonymous,
        countries: countries,
        zipCode: zipCode,
        street: street,
        number: number,
        addressComplement: addressComplement,
        neighbourhood: neighbourhood,
        city: city,
        states: states,
        ownerDocument: ownerDocument,
        phone: phone,
        faq: faq
    };
};

export default paymentVM;
