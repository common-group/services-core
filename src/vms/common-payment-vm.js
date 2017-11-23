import projectVM from '../vms/project-vm';
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

    card.generateHash(cardHash => {
        const payload = {
            subscription: true,
            fields: fields.isInternational(),
            save_card: false,
            user_id: '1e1be82f-4481-4cdd-bc1f-34fd145b528b',
            project_id: '0143689b-f75c-4a8b-93ca-1d461e2ff89c',
            // reward_id: 'fields.reward_uuid()',
            amount: 100,
            payment_method: 'credit_card',
            card_hash: cardHash,
            customer: {
                name: fields.fields.completeName(),
                document_number: fields.fields.ownerDocument(),
                address: fields.fields.address(),
            }
        };

        sendPaymentRequest(payload);
    });

};

const commonPaymentVM = {
    sendPayment
};

export default commonPaymentVM;
