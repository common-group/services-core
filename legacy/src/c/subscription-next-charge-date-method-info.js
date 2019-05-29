import m from 'mithril';
import moment from 'moment';
import h from '../h';

const subscriptionNextChargeDateMethodInfo = {
    view: function({attrs}) {
        const {
            payment_method,
            payment_method_details,
            next_charge_at,
        } = attrs;

        const hasPaymentMethodDetails = payment_method_details && payment_method_details.last_digits && payment_method_details.brand;

        if (payment_method === 'boleto') {
            return `${moment(next_charge_at).format('DD/MM/YYYY')} - Boleto`;
        } else if (hasPaymentMethodDetails) {
            const {
                last_digits,
                brand
            } = payment_method_details;

            return `${moment(next_charge_at).format('DD/MM/YYYY')} - Cartão ${brand} final ${last_digits}`;
        } else {
            return h.loader();
        }
    }
};

export default subscriptionNextChargeDateMethodInfo;
