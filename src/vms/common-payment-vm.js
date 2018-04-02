import m from 'mithril';
import I18n from 'i18n-js';
import projectVM from '../vms/project-vm';
import addressVM from '../vms/address-vm';
import models from '../models';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');
const paymentInfoId = m.prop();
const {commonPayment, commonSubscriptionUpgrade, commonPaymentInfo, commonCreditCard, commonCreditCards} = models;
const sendPaymentRequest = data => commonPayment.postWithToken(
    {data: _.extend({}, data, {payment_id: paymentInfoId()})},
    null,
    (h.isDevEnv() ? {'X-forwarded-For': '127.0.0.1'} : {})
);

const sendSubscriptionUpgrade = data => commonSubscriptionUpgrade.postWithToken(
    {data},
    null,
    (h.isDevEnv() ? {'X-forwarded-For': '127.0.0.1'} : {})
);

const saveCreditCard = creditCardHash => commonCreditCard.postWithToken(
    {data: {card_hash: creditCardHash}}
);

const updateUser = user => m.request({
    method: 'PUT',
    url: `/users/${user.id}.json`,
    data: {
        user
    },
    config: h.setCsrfToken
});

const setNewCreditCard = (creditCardFields) => {
    const creditCard = new window.PagarMe.creditCard();
    creditCard.cardHolderName = creditCardFields.name();
    creditCard.cardExpirationMonth = creditCardFields.expMonth();
    creditCard.cardExpirationYear = creditCardFields.expYear();
    creditCard.cardNumber = creditCardFields.number();
    creditCard.cardCVV = creditCardFields.cvv();
    return creditCard;
};

const userPayload = (customer, address) => ({
    id: h.getUser().id,
    cpf: customer.ownerDocument(),
    name: customer.completeName(),
    address_attributes: {
        country_id: address.country_id,
        state_id: address.state_id,
        address_street: address.address_street,
        address_neighbourhood: address.address_neighbourhood,
        address_number: address.address_number,
        address_zip_code: address.address_zip_code,
        address_city: address.address_city,
        address_complement: address.address_complement,
        phone_number: address.phone_number
    }
});

const displayError = (fields) => (data) => {
    const errorMsg = data.message || I18n.t('submission.encryption_error', I18nScope());
    fields.isLoading(false);
    fields.submissionError(I18n.t('submission.error',I18nScope({ message: errorMsg })));
    m.redraw();
};

const paymentInfo = (paymentId) => {
    return commonPaymentInfo.postWithToken({id: paymentId}, null, 
    (h.isDevEnv() ? {'X-forwarded-For': '127.0.0.1'} : {}));
};

const creditCardInfo = (creditCard) => commonCreditCards.getRowWithToken(h.idVM.id(creditCard.id).parameters());

let retries = 10;
const isReactivation = () => {
    const subscriptionStatus = m.route.param('subscription_status');
    return subscriptionStatus === 'inactive' || subscriptionStatus === 'canceled';
};
const resolvePayment = (gateway_payment_method, payment_confirmed, payment_id, isEdit) => m.route(`/projects/${projectVM.currentProject().project_id}/subscriptions/thank_you?project_id=${projectVM.currentProject().project_id}&payment_method=${gateway_payment_method}&payment_confirmed=${payment_confirmed}${payment_id ? '&payment_id=' + payment_id : ''}${isEdit && !isReactivation() ? '&is_edit=1' : ''}`);
const requestInfo = (promise, paymentId, defaultPaymentMethod, isEdit) => {
    if (retries <= 0) {
        return promise.resolve(resolvePayment(defaultPaymentMethod, false, paymentId, isEdit));
    }

    paymentInfo(paymentId).then((infoR) => {
        if(_.isNull(infoR.gateway_payment_method) || _.isUndefined(infoR.gateway_payment_method)) {
            if(!_.isNull(infoR.gateway_errors)) {
                return promise.reject(_.first(infoR.gateway_errors));
            } 

            return h.sleep(4000).then(() => {
                retries = retries - 1;

                return requestInfo(promise, paymentId, defaultPaymentMethod);
            });
        }

        return promise.resolve(resolvePayment(infoR.gateway_payment_method, true, paymentId, isEdit));
    }).catch(() => promise.reject({}));
};

const getPaymentInfoUntilNoError = (paymentMethod, isEdit) => ({id, catalog_payment_id}) => {
    let p = m.deferred();

    const paymentId = isEdit ? catalog_payment_id : id;

    if (paymentId) {
        paymentInfoId(paymentId);
        requestInfo(p, paymentId, paymentMethod, isEdit);
    } else {
        resolvePayment(paymentMethod, false, null, isEdit);
    }

    return p.promise;
};


let creditCardRetries = 5;
const waitForSavedCreditCard = promise => creditCardId => {
    if(creditCardRetries <= 0) {
        return promise.reject({message: 'Could not save card'});
    }

    creditCardInfo(creditCardId).then(([infoR]) => {
        if(_.isEmpty(infoR.gateway_data)) {
            if(!_.isEmpty(infoR.gateway_errors)) {
                return promise.reject(_.first(infoR.gateway_errors));
            }

            return h.sleep(4000).then(() => {
                creditCardRetries = creditCardRetries - 1;

                return waitForSavedCreditCard(promise)(creditCardId);
            });
        }

        return promise.resolve({creditCardId});
    }).catch((err) => promise.reject({message: err.message}));


    return promise;
};

const processCreditCard = (cardHash, fields) => {
    const p = m.deferred();

    saveCreditCard(cardHash)
        .then(waitForSavedCreditCard(p))
        .catch(p.reject);

    return p.promise;
};

const sendCreditCardPayment = (selectedCreditCard, fields, commonData, addVM) => {
    if (!fields) {
        return false;
    }
    fields.isLoading(true);
    m.redraw();

    const meta = _.first(document.querySelectorAll('[name=pagarme-encryption-key]'));
    const encryptionKey = meta.getAttribute('content');

    window.PagarMe.encryption_key = encryptionKey;
    const card = setNewCreditCard(fields.creditCardFields);

    const customer = fields.fields;
    const address = customer.address();
    const phoneDdd = address.phone_number ? address.phone_number.match(/\(([^)]*)\)/)[1] : null;
    const phoneNumber = address.phone_number ? address.phone_number.substr(5, address.phone_number.length) : null;
    const addressState = _.findWhere(addVM.states(), {id: address.state_id}) || {};
    const addressCountry = _.findWhere(addVM.countries(), {id: address.country_id}) || {};

    card.generateHash(cardHash => {
        const payload = {
            subscription: true,
            anonymous: customer.anonymous(),
            user_id: commonData.userCommonId,
            project_id: commonData.projectCommonId,
            amount: commonData.amount,
            payment_method: 'credit_card',
            credit_card_owner_document: fields.creditCardFields.cardOwnerDocument(),
            is_international: address.country_id !== addVM.defaultCountryID,
            customer: {
                name: customer.completeName(),
                document_number: customer.ownerDocument(),
                address: {
                    neighborhood: address.address_neighbourhood,
                    street: address.address_street,
                    street_number: address.address_number,
                    zipcode: address.address_zip_code,
                    country: addressCountry.name,
                    state: addressState.acronym,
                    city: address.address_city,
                    complementary: address.address_complement
                },
                phone: {
                    ddi: '55',
                    ddd: phoneDdd,
                    number: phoneNumber
                }
            }
        };

        if (commonData.rewardCommonId) {
            _.extend(payload, {reward_id: commonData.rewardCommonId});
        }

        if (commonData.subscription_id) {
            _.extend(payload, {id: commonData.subscription_id});
        }

        const pay = ({creditCardId}) => {
            const p = m.deferred();

            if (creditCardId) {
                _.extend(payload, {
                    card_id: creditCardId.id,
                    credit_card_id: creditCardId.id
                });
            }

            if (commonData.subscription_id){
                sendSubscriptionUpgrade(payload).then(p.resolve).catch(p.reject);
            } else {
                sendPaymentRequest(payload).then(p.resolve).catch(p.reject);
            }

            return p.promise;
        };

        updateUser(userPayload(customer, address))
            .then(() => processCreditCard(cardHash, fields))
            .then(pay)
            .then(getPaymentInfoUntilNoError(payload.payment_method, Boolean(commonData.subscription_id)))
            .catch(displayError(fields));
    });
};

const sendSlipPayment = (fields, commonData) => {
    fields.isLoading(true);
    m.redraw();

    const customer = fields.fields;
    const address = customer.address();
    const phoneDdd = address.phone_number.match(/\(([^)]*)\)/)[1];
    const phoneNumber = address.phone_number.substr(5, address.phone_number.length);
    const addressState = _.findWhere(addressVM.states(), {id: address.state_id});
    const addressCountry = _.findWhere(addressVM.countries(), {id: address.country_id});
    const payload = {
        subscription: true,
        anonymous: customer.anonymous(),
        user_id: commonData.userCommonId,
        project_id: commonData.projectCommonId,
        amount: commonData.amount,
        payment_method: 'boleto',
        customer: {
            name: customer.completeName(),
            document_number: customer.ownerDocument(),
            address: {
                neighborhood: address.address_neighbourhood,
                street: address.address_street,
                street_number: address.address_number,
                zipcode: address.address_zip_code,
                //TOdO: remove hard-coded country when international support is added on the back-end
                country: 'Brasil',
                state: addressState.acronym,
                city: address.address_city,
                complementary: address.address_complement
            },
            phone: {
                ddi: '55',
                ddd: phoneDdd,
                number: phoneNumber
            }
        }
    };

    if (commonData.rewardCommonId) {
        _.extend(payload, {reward_id: commonData.rewardCommonId});
    }

    if (commonData.subscription_id) {
        _.extend(payload, {id: commonData.subscription_id});
    }

    const sendPayment = () => {
        const p = m.deferred();

        if (commonData.subscription_id) {
            sendSubscriptionUpgrade(payload).then(p.resolve).catch(p.reject);
        } else {
            sendPaymentRequest(payload).then(p.resolve).catch(p.reject);
        }

        return p.promise;
    };

    updateUser(userPayload(customer, address))
        .then(sendPayment)
        .then(getPaymentInfoUntilNoError(payload.payment_method, Boolean(commonData.subscription_id)))
        .catch(displayError(fields));
};

const commonPaymentVM = {
    sendCreditCardPayment,
    sendSlipPayment,
    paymentInfo
};

export default commonPaymentVM;
