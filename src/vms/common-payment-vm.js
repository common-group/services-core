import {commonPayment} from '../api';

const setNewCreditCard = () => {
    const creditCard = new window.PagarMe.creditCard();
    creditCard.cardHolderName = creditCardFields.name();
    creditCard.cardExpirationMonth = creditCardFields.expMonth();
    creditCard.cardExpirationYear = creditCardFields.expYear();
    creditCard.cardNumber = creditCardFields.number();
    creditCard.cardCVV = creditCardFields.cvv();
    return creditCard;
};



const sendPayment = (creditCard, fields) => {
    const meta = _.first(document.querySelectorAll('[name=pagarme-encryption-key]'));
    const encryptionKey = meta.getAttribute('content');

    window.PagarMe.encryption_key = encryptionKey;
    const card = setNewCreditCard();

    card.generateHash(cardHash => {
        const payload = {
            subscription: true,
            fields: fields.isInternational(),
            save_card: false,
            user_id: fields.user_id(),
            project_id: fields.project_id(),
            reward_id: fields.reward_id(),
            amount: fields.amount(),
            payment_method: 'credit_card',
            card_hash: cardHash,
            customer: fields.customer() 
        };

        commonPayment.sendPay(data);
    });

};

const commonPaymentVM = {
    sendPayment
};

export default commonPaymentVM;
