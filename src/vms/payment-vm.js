import postgrest from 'mithril-postgrest';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';
import usersVM from './user-vm';
import models from '../models';
const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentVM = (mode = 'aon') => {
    const pagarme = m.prop({}),
        submissionError = m.prop(false),
        isLoading = m.prop(false);

    const setCsrfToken = (xhr) => {
        if (h.authenticityToken()) {
            xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
        }
        return;
    };

    const fields = {
        completeName: m.prop(''),
        email: m.prop(''),
        anonymous: m.prop(),
        countries: m.prop(),
        userCountryId: m.prop(),
        zipCode: m.prop(''),
        street: m.prop(''),
        number: m.prop(''),
        addressComplement: m.prop(''),
        neighbourhood: m.prop(''),
        city: m.prop(''),
        states: m.prop([]),
        userState: m.prop(),
        ownerDocument: m.prop(''),
        phone: m.prop(''),
        errors: m.prop([])
    };

    const creditCardFields = {
        name: m.prop(''),
        number: m.prop(''),
        expMonth: m.prop(''),
        expYear: m.prop(''),
        save: m.prop(false),
        cvv: m.prop(''),
        errors: m.prop([])
    };

    const faq = I18n.translations[I18n.currentLocale()].projects.faq[mode],
        currentUser = h.getUser(),
        countriesLoader = postgrest.loader(models.country.getPageOptions()),
        statesLoader = postgrest.loader(models.state.getPageOptions());

    const populateForm = (fetchedData) => {
        const data = _.first(fetchedData),
            countryId = data.address.country_id || _.findWhere(fields.countries(), {name: 'Brasil'}).id;

        fields.completeName(data.name);
        fields.email(data.email);
        fields.city(data.address.city);
        fields.zipCode(data.address.zipcode);
        fields.street(data.address.street);
        fields.number(data.address.number);
        fields.addressComplement(data.address.complement);
        fields.userState(data.address.state);
        fields.userCountryId(countryId);
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
            const val = fields[field]();

            if (!h.existy(val) || _.isEmpty(String(val).trim())) {
                fields.errors().push({field: field, message: 'O campo não pode ser vazio.'});
            }
        });
    };

    const checkEmail = () => {
        const isValid = h.validateEmail(fields.email());

        if (!isValid){
            fields.errors().push({field: 'email', message: 'E-mail inválido.'});
        }
    };

    const checkDocument = () => {
        //TODO: also validate Cnpj
        const isValid = h.validateCpf(fields.ownerDocument().replace(/[\.|\-]*/g,''));

        if (!isValid){
            fields.errors().push({field: 'ownerDocument', message: 'CPF inválido.'});
        }
    };

    const validate = () => {
        fields.errors([]);

        checkEmptyFields(['completeName', 'street', 'number', 'city', 'userCountryId']);

        checkEmail();

        if (!isInternational()){
            checkEmptyFields(['phone', 'neighbourhood', 'zipCode', 'ownerDocument', 'userState']);
            checkDocument();
        }

        return _.isEmpty(fields.errors());
    };

    const getSlipPaymentDate = (contribution_id) => {
        const paymentDate = m.prop();

        m.request({
            method: 'GET',
            config: setCsrfToken,
            url: `/payment/pagarme/${contribution_id}/slip_data`
        }).then(paymentDate);

        return paymentDate;
    };

    const sendSlipPayment = (contribution_id, project_id, error, loading, completed) => {
        m.request({
            method: 'post',
            url: `/payment/pagarme/${contribution_id}/pay_slip.json`,
            dataType: 'json'
        }).then(data => {
            if (data.payment_status == 'failed'){
                error(I18n.t('submission.slip_submission', I18nScope()));
            } else if (data.boleto_url) {
                completed(true);
                window.location.href = `/projects/${project_id}/contributions/${contribution_id}`;
            }
            loading(false);
            m.redraw();
        }).catch(err => {
            error(I18n.t('submission.slip_submission', I18nScope()));
            loading(false);
            completed(false);
            m.redraw();
        });
    };

    const paySlip = (contribution_id, project_id, error, loading, completed) => {
        error(false);
        m.redraw();
        if (validate()) {
            updateContributionData(contribution_id, project_id)
                .then(() => {
                    sendSlipPayment(contribution_id, project_id, error, loading, completed);
                })
                .catch(() => {
                    loading(false);
                    error(I18n.t('submission.slip_validation', I18nScope()));
                    m.redraw();
                })

        } else {
            loading(false);
            error(I18n.t('submission.slip_validation', I18nScope()));
            m.redraw();
        }
    };

    const savedCreditCards = m.prop([]);

    const getSavedCreditCards = (user_id) => {
        const otherSample = {
            id: -1
        };

        return m.request({
            method: 'GET',
            config: setCsrfToken,
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

    const requestPayment = (data, contribution_id) => {
        return m.request({
            method: 'POST',
            url: `/payment/pagarme/${contribution_id}/pay_credit_card`,
            data: data,
            config: setCsrfToken
        });
    };

    const payWithSavedCard = (creditCard, installment, contribution_id) => {
        const data = {
            card_id: creditCard.card_key,
            payment_card_installments: installment
        };
        return requestPayment(data, contribution_id);
    };

    const setNewCreditCard = () => {
        let creditCard = new window.PagarMe.creditCard();
        creditCard.cardHolderName = creditCardFields.name();
        creditCard.cardExpirationMonth = creditCardFields.expMonth();
        creditCard.cardExpirationYear = creditCardFields.expYear();
        creditCard.cardNumber = creditCardFields.number();
        creditCard.cardCVV = creditCardFields.cvv();
        return creditCard;
    };

    const payWithNewCard = (contribution_id, installment) => {
        const deferred = m.deferred();
        m.request({
            method: 'GET',
            url: `/payment/pagarme/${contribution_id}/get_encryption_key`,
            config: setCsrfToken
        }).then((data) => {
            window.PagarMe.encryption_key = data.key;
            const card = setNewCreditCard();
            const errors = card.fieldErrors();
            if (_.keys(errors).length > 0) {
                deferred.reject({message: I18n.t('submission.card_invalid', I18nScope())});
            } else {
                card.generateHash((cardHash) => {
                    const data = {
                        card_hash: cardHash,
                        save_card: creditCardFields.save().toString(),
                        payment_card_installments: installment
                    };
                    requestPayment(data, contribution_id).then(deferred.resolve).catch(deferred.reject);
                });

            }
        }).catch((error) => {
            if(!_.isEmpty(error.message)){
                deferred.reject(error);
            } else {
                deferred.reject({message: I18n.t('submission.encryption_error', I18nScope())});
            }
        });

        return deferred.promise;
    };

    const updateContributionData = (contribution_id, project_id) => {
        const contributionData = {
            anonymous: fields.anonymous(),
            country_id: fields.userCountryId(),
            payer_name: fields.completeName(),
            payer_email: fields.email(),
            payer_document: fields.ownerDocument(),
            address_street: fields.street(),
            address_number: fields.number(),
            address_complement: fields.addressComplement(),
            address_neighbourhood: fields.neighbourhood(),
            address_zip_code: fields.zipCode(),
            address_city: fields.city(),
            address_state: fields.userState(),
            address_phone_number: fields.phone()
        };

        return m.request({
            method: 'PUT',
            url: `/projects/${project_id}/contributions/${contribution_id}.json`,
            data: {contribution: contributionData},
            config: setCsrfToken
        });
    };

    const creditCardPaymentSuccess = (deferred, project_id, contribution_id) => (data) => {
        if (data.payment_status === 'failed') {
            const errorMsg = data.message || I18n.t('submission.payment_failed', I18nScope());

            isLoading(false);
            submissionError(I18n.t('submission.error', I18nScope({message: errorMsg})));
            m.redraw();
            deferred.reject();
        } else {
            window.location.href = `/projects/${project_id}/contributions/${contribution_id}`;
        }
    };

    const creditCardPaymentFail = (deferred) => (data) => {
        const errorMsg = data.message || I18n.t('submission.payment_failed', I18nScope());

        isLoading(false);
        submissionError(I18n.t('submission.error', I18nScope({message: errorMsg})));
        m.redraw();
        deferred.reject();
    };

    const checkAndPayCreditCard = (deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment) => () => {
        if (selectedCreditCard().id && selectedCreditCard().id !== -1) {
            return payWithSavedCard(selectedCreditCard(), selectedInstallment(), contribution_id)
                .then(creditCardPaymentSuccess(deferred, project_id, contribution_id))
                .catch(creditCardPaymentFail(deferred));
        } else {
            return payWithNewCard(contribution_id, selectedInstallment)
                .then(creditCardPaymentSuccess(deferred, project_id, contribution_id))
                .catch(creditCardPaymentFail(deferred));
        }
    };

    const sendPayment = (selectedCreditCard, selectedInstallment, contribution_id, project_id) => {
        const deferred = m.deferred();
        if (validate()) {
            isLoading(true);
            submissionError(false);
            m.redraw();
            updateContributionData(contribution_id, project_id)
                .then(checkAndPayCreditCard(deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment))
                .catch(() => {
                    isLoading(false);
                    deferred.reject();
                });

        } else {
            isLoading(false);
            deferred.reject();
        }
        return deferred.promise;
    };

    const resetFieldError = (fieldName) => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(fields.errors(), {field: fieldName}),
            newErrors = _.compose(fields.errors, _.without);

        return newErrors(fields.errors(), errorField);
    };

    const resetCreditCardFieldError = (fieldName) => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(creditCardFields.errors(), {field: fieldName}),
            newErrors = _.compose(creditCardFields.errors, _.without);

        return newErrors(creditCardFields.errors(), errorField);
    };

    const installments = m.prop([{value: 10, number: 1}]);

    const getInstallments = (contribution_id) => {
        return m.request({
            method: 'GET',
            url: `/payment/pagarme/${contribution_id}/get_installment`,
            config: h.setCsrfToken
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
        paySlip: paySlip,
        installments: installments,
        getInstallments: getInstallments,
        savedCreditCards: savedCreditCards,
        getSavedCreditCards: getSavedCreditCards,
        applyCreditCardMask: applyCreditCardMask,
        creditCardFields: creditCardFields,
        resetCreditCardFieldError: resetCreditCardFieldError,
        expMonthOptions: expMonthOptions,
        expYearOptions: expYearOptions,
        sendPayment: sendPayment,
        submissionError: submissionError,
        isLoading: isLoading,
        pagarme: pagarme,
        faq: faq
    };
};

export default paymentVM;
