import I18n from 'i18n-js';
import h from '../h';
import usersVM from './user-vm';

const paymentVM = (mode) => {
    const error = m.prop([]),
        completeName  = m.prop(''),
        email = m.prop(''),
        anonymous = m.prop(''),
        countries = m.prop(),
        userCountry = m.prop(),
        zipCode = m.prop(''),
        street = m.prop(''),
        number = m.prop(''),
        addressComplement = m.prop(''),
        neighbourhood = m.prop(''),
        city = m.prop(''),
        states = m.prop([]),
        userState = m.prop(),
        ownerDocument = m.prop(''),
        phone = m.prop(''),
        faq = I18n.translations[I18n.currentLocale()].projects.faq[mode],
        currentUser = h.getUser();

    const populateForm = (fetchedData) => {
        const data = _.first(fetchedData);

        completeName(data.name);
        email(data.email);
        city(data.address_city);
        zipCode(data.address_zipcode);
        street(data.address_street);
        number(data.address_number);
        addressComplement(data.address_complement);
        userState(data.address_state);
        userCountry(data.address_country);
        ownerDocument(data.owner_document);
        phone(data.phone);
    };

    usersVM.fetchUser(currentUser.user_id, false).then(populateForm);


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
