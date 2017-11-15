import {commonPayment} from '../api';

const sendPayment = (creditCard, fields) => {
    const payload = {
         
    };
    
    console.log('credit card', creditCard());
    console.log('fields', fields);
};

const commonPaymentVM = {
    sendPayment
};

export default commonPaymentVM;
