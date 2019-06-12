import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import moment, { defaultFormat } from 'moment';
import h from '../h';
import usersVM from './user-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international.errors');

const paymentVM = () => {
    const pagarme = prop({}),
        defaultCountryID = 36,
        submissionError = prop(false),
        isLoading = prop(false);

    const setCsrfToken = (xhr) => {
        if (h.authenticityToken()) {
            xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
        }
    };

    const fields = {
        completeName: prop(''),
        anonymous: h.toggleProp(false, true),
        address: prop({ country_id: defaultCountryID }),
        ownerDocument: prop(''),
        errors: prop([])
    };

    const creditCardFields = {
        name: prop(''),
        number: prop(''),
        expMonth: prop(''),
        expYear: prop(''),
        save: prop(false),
        cvv: prop(''),
        errors: prop([]),
        cardOwnerDocument: prop('')
    };

    const populateForm = (fetchedData) => {
        const data = _.first(fetchedData) || { address: {} };

        if (!_.isEmpty(data.address)) {
            fields.address(_.omit(data.address, 'id'));
        }

        fields.completeName(data.name);
        fields.ownerDocument(data.owner_document);

        creditCardFields.cardOwnerDocument(data.owner_document);
        m.redraw();
    };

    const expMonthOptions = () => [
        [null, 'Mês'],
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

    const expYearOptions = () => {
        const currentYear = moment().year();
        const yearsOptions = ['Ano'];
        for (let i = currentYear; i <= currentYear + 25; i++) {
            yearsOptions.push(i);
        }
        return yearsOptions;
    };

    const isInternational = () => parseInt(fields.address().country_id) !== defaultCountryID;

    const scope = data => isInternational() ? I18nIntScope(data) : I18nScope(data);

    const getLocale = () => isInternational()
        ? { locale: 'en' }
        : { locale: 'pt' };

    const faq = (mode = 'aon') => window.I18n.translations[window.I18n.currentLocale()].projects.faq[mode],
        currentUser = h.getUser() || {};

    const checkEmptyFields = checkedFields => _.map(checkedFields, (field) => {
        const val = fields[field]();

        if (!h.existy(val) || _.isEmpty(String(val).trim())) {
            fields.errors().push({ field, message: window.I18n.t('validation.empty_field', scope()) });
        }
    });

    const checkEmail = () => {
        const isValid = h.validateEmail(fields.email());

        if (!isValid) {
            fields.errors().push({ field: 'email', message: window.I18n.t('validation.email', scope()) });
        }
    };

    const checkDocument = () => {
        const document = fields.ownerDocument() || '',
            striped = String(document).replace(/[\.|\-|\/]*/g, '');
        let isValid = false,
            errorMessage = '';

        if (document.length > 14) {
            isValid = h.validateCnpj(document);
            errorMessage = 'CNPJ inválido.';
        } else {
            isValid = h.validateCpf(striped);
            errorMessage = 'CPF inválido.';
        }

        if (!isValid) {
            fields.errors().push({ field: 'ownerDocument', message: errorMessage });
        }
    };

    const validate = () => {
        fields.errors([]);
        if (!fields.validate()) {
            return false;
        }

        checkEmptyFields(['completeName']);

        if (!isInternational()) {
            checkEmptyFields(['ownerDocument']);
            checkDocument();
        }

        return _.isEmpty(fields.errors());
    };

    const getSlipPaymentDate = (contribution_id) => {
        const paymentDate = prop();

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
        }).then((data) => {
            if (data.payment_status == 'failed') {
                error(window.I18n.t('submission.slip_submission', scope()));
            } else if (data.boleto_url) {
                completed(true);
                window.location.href = `/projects/${project_id}/contributions/${contribution_id}`;
            }
            loading(false);
            m.redraw();
        }).catch((err) => {
            error(window.I18n.t('submission.slip_submission', scope()));
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
                    error(window.I18n.t('submission.slip_validation', scope()));
                    m.redraw();
                });
        } else {
            loading(false);
            error(window.I18n.t('submission.slip_validation', scope()));
            m.redraw();
        }
    };

    const savedCreditCards = prop([]);

    const getSavedCreditCards = (user_id) => {
        const otherSample = {
            id: -1
        };

        return m.request({
            method: 'GET',
            config: setCsrfToken,
            url: `/users/${user_id}/credit_cards`
        }).then((creditCards) => {
            if (_.isArray(creditCards)) {
                creditCards.push(otherSample);
            } else {
                creditCards = [];
            }

            return savedCreditCards(creditCards);
        });
    };

    const similityExecute = (contribution_id) => {
        if (window.SimilityScript && h.getSimilityCustomer()) {
            const user = h.getUser() || {};
            const similityContext = {
                customer_id: h.getSimilityCustomer(),
                session_id: contribution_id,
                user_id: user.user_id
            };
            const ss = new window.SimilityScript(similityContext);
            ss.execute();
        }
    };

    const kondutoExecute = function () {
        const customerID = h.getUserID();

        if (customerID) {
            var period = 300;
            var limit = 20 * 1e3;
            var nTry = 0;
            var intervalID = setInterval(function () {     
                var clear = limit / period <= ++nTry;
                if ((typeof (Konduto) !== "undefined") && (typeof (Konduto.setCustomerID) !== "undefined")) {
                    window.Konduto.setCustomerID(customerID);
                    clear = true;
                }
                if (clear) {
                    clearInterval(intervalID);
                }
            }, period);
        }
    };

    const requestPayment = (data, contribution_id) => {
        kondutoExecute();
        return m.request({
            method: 'POST',
            url: `/payment/pagarme/${contribution_id}/pay_credit_card`,
            data,
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
        const creditCard = new window.PagarMe.creditCard();
        creditCard.cardHolderName = creditCardFields.name();
        creditCard.cardExpirationMonth = creditCardFields.expMonth();
        creditCard.cardExpirationYear = creditCardFields.expYear();
        creditCard.cardNumber = creditCardFields.number();
        creditCard.cardCVV = creditCardFields.cvv();
        return creditCard;
    };

    const payWithNewCard = (contribution_id, installment) => {
        const p = new Promise((resolve, reject) => {
            m.request({
                method: 'GET',
                url: `/payment/pagarme/${contribution_id}/get_encryption_key`,
                config: setCsrfToken
            }).then((data) => {
                window.PagarMe.encryption_key = data.key;
                const card = setNewCreditCard();
                const errors = card.fieldErrors();
                if (_.keys(errors).length > 0) {
                    reject({ message: window.I18n.t('submission.card_invalid', scope()) });
                } else {
                    card.generateHash((cardHash) => {
                        const data = {
                            card_hash: cardHash,
                            save_card: creditCardFields.save().toString(),
                            payment_card_installments: installment
                        };

                        requestPayment(data, contribution_id)
                            .then(resolve)
                            .catch(reject);
                    });
                }
            }).catch((error) => {
                if (!_.isEmpty(error.message)) {
                    reject(error);
                } else {
                    reject({ message: window.I18n.t('submission.encryption_error', scope()) });
                }
            });
        });

        return p;
    };

    const updateContributionData = (contribution_id, project_id) => {
        const contributionData = {
            anonymous: fields.anonymous(),
            payer_document: fields.ownerDocument(),
            payer_name: fields.completeName(),
            address_attributes: fields.address(),
            card_owner_document: creditCardFields.cardOwnerDocument()
        };

        return m.request({
            method: 'PUT',
            url: `/projects/${project_id}/contributions/${contribution_id}.json`,
            data: { contribution: contributionData },
            config: setCsrfToken
        });
    };

    const creditCardPaymentSuccess = (deferred, project_id, contribution_id) => (data) => {
        if (data.payment_status === 'failed') {
            const errorMsg = data.message || window.I18n.t('submission.payment_failed', scope());

            isLoading(false);
            submissionError(window.I18n.t('submission.error', scope({ message: errorMsg })));
            m.redraw();
            deferred.reject();
        } else {
            window.location.href = `/projects/${project_id}/contributions/${contribution_id}`;
        }
    };

    const creditCardPaymentFail = deferred => (data) => {
        const errorMsg = data.message || window.I18n.t('submission.payment_failed', scope());
        isLoading(false);
        submissionError(window.I18n.t('submission.error', scope({ message: errorMsg })));
        m.redraw();
        deferred.reject();
    };

    const checkAndPayCreditCard = (deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment) => () => {
        if (selectedCreditCard().id && selectedCreditCard().id !== -1) {
            return payWithSavedCard(selectedCreditCard(), selectedInstallment(), contribution_id)
                .then(creditCardPaymentSuccess(deferred, project_id, contribution_id))
                .catch(creditCardPaymentFail(deferred));
        }
        return payWithNewCard(contribution_id, selectedInstallment)
            .then(creditCardPaymentSuccess(deferred, project_id, contribution_id))
            .catch(creditCardPaymentFail(deferred));
    };

    const sendPayment = (selectedCreditCard, selectedInstallment, contribution_id, project_id) => {
        const p = new Promise((resolve, reject) => {
            if (validate()) {
                isLoading(true);
                submissionError(false);
                m.redraw();
                updateContributionData(contribution_id, project_id)
                    .then(checkAndPayCreditCard({resolve, reject}, selectedCreditCard, contribution_id, project_id, selectedInstallment))
                    .catch(() => {
                        isLoading(false);
                        reject();
                    });
            } else {
                isLoading(false);
                reject();
            }
        });

        return p;
    };

    const resetFieldError = fieldName => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(fields.errors(), { field: fieldName }),
            newErrors = _.compose(fields.errors, _.without);

        return newErrors(fields.errors(), errorField);
    };

    const resetCreditCardFieldError = fieldName => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(creditCardFields.errors(), { field: fieldName }),
            newErrors = _.compose(creditCardFields.errors, _.without);

        return newErrors(creditCardFields.errors(), errorField);
    };

    const installments = prop([{ value: 10, number: 1 }]);

    const getInstallments = contribution_id => m.request({
        method: 'GET',
        url: `/payment/pagarme/${contribution_id}/get_installment`,
        config: h.setCsrfToken
    }).then(installments);

    const creditCardMask = _.partial(h.mask, '9999 9999 9999 9999');

    const applyCreditCardMask = _.compose(creditCardFields.number, creditCardMask);

    const fetchUser = () => usersVM.fetchUser(currentUser.user_id, false).then(userDetails => {
        populateForm(userDetails);
        m.redraw();
        return userDetails;
    });

    return {
        fetchUser,
        fields,
        validate,
        isInternational,
        resetFieldError,
        getSlipPaymentDate,
        paySlip,
        installments,
        getInstallments,
        savedCreditCards,
        getSavedCreditCards,
        applyCreditCardMask,
        creditCardFields,
        resetCreditCardFieldError,
        expMonthOptions,
        expYearOptions,
        sendPayment,
        submissionError,
        isLoading,
        pagarme,
        locale: getLocale,
        faq,
        similityExecute,
        kondutoExecute
    };
};

export default paymentVM;
