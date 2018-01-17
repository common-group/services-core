import m from 'mithril';
import I18n from 'i18n-js';
import projectVM from '../vms/project-vm';
import addressVM from '../vms/address-vm';
import models from '../models';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');
const {commonPayment, commonPaymentInfo} = models;
const sendPaymentRequest = data => commonPayment.postWithToken({data}, null, {
    'X-forwarded-For': '127.0.0.1'
});

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
    return commonPaymentInfo.postWithToken({id: paymentId}, null, {
        'X-forwarded-For': '127.0.0.1'
    });
};


let retries = 10;
const resolvePayment = (gateway_payment_method, payment_confirmed, payment_id) => m.route(`/projects/subscriptions/thank_you?project_id=${projectVM.currentProject().project_id}&payment_method=${gateway_payment_method}&payment_confirmed=${payment_confirmed}&payment_id=${payment_id}`)
const requestInfo = (promise, paymentInfoId, defaultPaymentMethod) => {
    if (retries <= 0) {
        return promise.resolve(resolvePayment(defaultPaymentMethod, false, paymentInfoId));
    }

    paymentInfo(paymentInfoId).then((infoR) => {
        if(_.isNull(infoR.gateway_payment_method) || _.isUndefined(infoR.gateway_payment_method)) {
            if(!_.isNull(infoR.gateway_errors)) {
                return promise.reject({message: infoR.gateway_errors})
            } 

            return h.sleep(4000).then(() => {
                retries = retries - 1;

                return requestInfo(promise, paymentInfoId, defaultPaymentMethod)
            });
        }

        return promise.resolve(resolvePayment(infoR.gateway_payment_method, true, paymentInfoId));
    }).catch(() => promise.reject({}));
};

const getPaymentInfoUntilNoError = (paymentMethod) => ({id}) => {
    let p = m.deferred();

    requestInfo(p, id, paymentMethod);

    return p.promise;
};

const sendCreditCardPayment = (selectedCreditCard, fields, commonData) => {
    fields.isLoading(true);
    m.redraw();

    const meta = _.first(document.querySelectorAll('[name=pagarme-encryption-key]'));
    const encryptionKey = meta.getAttribute('content');

    window.PagarMe.encryption_key = encryptionKey;
    const card = setNewCreditCard(fields.creditCardFields);

    const customer = fields.fields;
    const address = customer.address();
    const phoneDdd = address.phone_number.match(/\(([^)]*)\)/)[1];
    const phoneNumber = address.phone_number.substr(5, address.phone_number.length);
    const addressState = _.findWhere(addressVM.states(), {id: address.state_id});
    const addressCountry = _.findWhere(addressVM.countries(), {id: address.country_id});

    card.generateHash(cardHash => {
        const payload = {
            subscription: true,
            user_id: commonData.userCommonId,
            project_id: commonData.projectCommonId,
            amount: commonData.amount,
            payment_method: 'credit_card',
            card_hash: cardHash,
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
                    complementary: address.address_complement,
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
  
        const sendPayment = () => sendPaymentRequest(payload);
        updateUser(userPayload(customer, address))
            .then(sendPayment)
            .then(getPaymentInfoUntilNoError(payload.payment_method))
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
                complementary: address.address_complement,
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

    const sendPayment = () => sendPaymentRequest(payload);
    updateUser(userPayload(customer, address))
        .then(sendPayment)
        .then(getPaymentInfoUntilNoError(payload.payment_method))
        .catch(displayError(fields));
};

const commonPaymentVM = {
    sendCreditCardPayment,
    sendSlipPayment,
    paymentInfo
};

export default commonPaymentVM;
