import projectVM from '../vms/project-vm';
import addressVM from '../vms/address-vm';
import models from '../models';
import h from '../h';

const {commonPayment} = models;
console.log('models', models);
const sendPaymentRequest = (data) => commonPayment.postWithToken({data}, null, {
    'X-forwarded-For': '127.0.0.1'
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

const sendPayment = (creditCardFields, selectedCreditCard, fields) => {
    const meta = _.first(document.querySelectorAll('[name=pagarme-encryption-key]'));
    const encryptionKey = meta.getAttribute('content');

    window.PagarMe.encryption_key = encryptionKey;
    const card = setNewCreditCard(creditCardFields);

    const customer = fields.fields;
    const address = customer.address();
    const phone_ddd = address.phone_number.match(/\(([^)]*)\)/)[1];
    const phone_number = address.phone_number.substr(5, address.phone_number.length);

    card.generateHash(cardHash => {
        const payload = {
            subscription: true,
            save_card: false,
            user_id: '1e1be82f-4481-4cdd-bc1f-34fd145b528b',
            project_id: '0143689b-f75c-4a8b-93ca-1d461e2ff89c',
            // reward_id: 'fields.reward_uuid()',
            amount: 100,
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
                    // country: address.address_country_name,
                    country: 'Brasil',
                    // state: address.address_state_name,
                    state: address.address_state,
                    city: address.address_city,
                    complementary: address.address_complement,
                },
                phone: {
                    ddi: '55',
                    ddd: phone_ddd,
                    number: phone_number
                }
            }
        };

        sendPaymentRequest(payload);
    });

};

const commonPaymentVM = {
    sendPayment
};

export default commonPaymentVM;
