import postgrest from 'mithril-postgrest';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';
import usersVM from './user-vm';
import models from '../models';

const paymentVM = (mode = 'aon') => {
    const fields = {
        completeName  : m.prop(''),
        email : m.prop(''),
        anonymous : m.prop(''),
        countries : m.prop(),
        userCountryId : m.prop(),
        zipCode : m.prop(''),
        street : m.prop(''),
        number : m.prop(''),
        addressComplement : m.prop(''),
        neighbourhood : m.prop(''),
        city : m.prop(''),
        states : m.prop([]),
        userState : m.prop(),
        ownerDocument : m.prop(''),
        phone : m.prop(''),
        errors: m.prop([])
    };

    const creditCardFields = {
        name: m.prop(''),
        number: m.prop(''),
        expMonth: m.prop(''),
        expYear: m.prop(''),
        cvv: m.prop('')
    };

    const faq = I18n.translations[I18n.currentLocale()].projects.faq[mode],
        currentUser = h.getUser(),
        countriesLoader = postgrest.loader(models.country.getPageOptions()),
        statesLoader = postgrest.loader(models.state.getPageOptions());


    const populateForm = (fetchedData) => {
        const data = _.first(fetchedData);

        fields.completeName(data.name);
        fields.email(data.email);
        fields.city(data.address.city);
        fields.zipCode(data.address.zipcode);
        fields.street(data.address.street);
        fields.number(data.address.number);
        fields.addressComplement(data.address.complement);
        fields.userState(data.address.state);
        fields.userCountryId(data.address.country_id);
        fields.ownerDocument(data.owner_document);
        fields.phone(data.address.phonenumber);
        fields.neighbourhood(data.address.neighbourhood);
    };

    const expMonthOptions = () => {
        return [
            [1, '01 - Janeiro'],
            [2, '02 - Fevereiro'],
            [3, '03 - Março'],
            [4, '04 - Abril'],
            [5, '05 - Maio'],
            [6, '06 - Junho'],
            [7, '07 - Julho'],
            [8, '08 - Agosto'],
            [9, '09 - Setembro'],
            [10, '10 - Outubro'],
            [11, '11 - Novembro'],
            [12, '12 - Dezembro']
        ];
    };

    const expYearOptions = () => {
        const currentYear = moment().year();
        let yearsOptions = [];
        for (let i = currentYear; i <= currentYear + 25; i++) {
            yearsOptions.push(i);
        }
        return yearsOptions;
    };

    const isInternational = () => {
        return !_.isEmpty(fields.countries()) ? fields.userCountryId() != _.findWhere(fields.countries(), {name: 'Brasil'}).id : false;
    };

    const checkEmptyFields = (checkedFields) => {
        return _.map(checkedFields, (field) => {
            if(_.isEmpty(String(fields[field]()).trim())) {
                fields.errors().push({field: field, message: 'O campo não pode ser vazio.'});
            }
        });
    };

    const checkEmail = () => {
        const isValid = h.validateEmail(fields.email());

        if(!isValid){
            fields.errors().push({field: 'email', message: 'E-mail inválido.'});
        }
    };

    const checkDocument = () => {
        //TODO: also validate Cnpj
        const isValid = h.validateCpf(fields.ownerDocument().replace(/[\.|\-]*/g,''));

        if(!isValid){
            fields.errors().push({field: 'ownerDocument', message: 'CPF inválido.'});
        }
    }

    const validate = () => {
        fields.errors([]);

        checkEmptyFields(['completeName', 'street', 'number', 'neighbourhood', 'city']);

        checkEmail();

        if(!isInternational()){
            checkEmptyFields(['phone']);
            checkDocument();
        }

        return _.isEmpty(fields.errors());
    };

    const getSlipPaymentDate = (contribution_id) => {
        const paymentDate = m.prop();

        m.request({
            method: 'GET',
            url: `/payment/pagarme/${contribution_id}/slip_data`
        }).then(paymentDate);

        return paymentDate;
    };

    const savedCreditCards = m.prop([]);

    const getSavedCreditCards = (user_id) => {
        const otherSample = {
            id: -1
        };

        return m.request({
            method: 'GET',
            url: `/users/${user_id}/credit_cards`
        }).then((creditCards) => {
            if (_.isArray(creditCards)){
                creditCards.push(otherSample);
            } else {
                creditCards = [];
            }

            return savedCreditCards(creditCards);
        });
    };

    const resetFieldError = (fieldName) => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(fields.errors(), {field: fieldName}),
            newErrors = _.compose(fields.errors, _.without);

        return newErrors(fields.errors(), errorField);
    };

    const installments = m.prop([{value: 10, number: 1}]);

    const getInstallments = (contribution_id) => {
        return m.request({
            method: 'GET',
            url: `/payment/pagarme/${contribution_id}/get_installment`
        }).then(installments);
    };

    const creditCardMask = _.partial(h.mask, '9999 9999 9999 9999');

    const applyCreditCardMask = _.compose(creditCardFields.number, creditCardMask);

    countriesLoader.load().then(fields.countries);
    statesLoader.load().then(fields.states);
    usersVM.fetchUser(currentUser.user_id, false).then(populateForm);

    return {
        fields: fields,
        validate: validate,
        isInternational: isInternational,
        resetFieldError: resetFieldError,
        getSlipPaymentDate: getSlipPaymentDate,
        installments: installments,
        getInstallments: getInstallments,
        savedCreditCards: savedCreditCards,
        getSavedCreditCards: getSavedCreditCards,
        applyCreditCardMask: applyCreditCardMask,
        creditCardFields: creditCardFields,
        faq: faq,
        expMonthOptions: expMonthOptions,
        expYearOptions: expYearOptions
    };
};

export default paymentVM;
