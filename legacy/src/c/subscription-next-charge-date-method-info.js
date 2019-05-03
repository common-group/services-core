import m from 'mithril';
import moment from 'moment';

const subscriptionNextChargeDateMethodInfo = {
    view: function({attrs}) {
        const {
            payment_method,
            payment_method_details,
            next_charge_at,
        } = attrs;


        if (payment_method === 'boleto') {
            return `${moment(next_charge_at).format('DD/MM/YYYY')} - Boleto`;
        } else {
            const {
                last_digits,
                brand
            } = payment_method_details;

            return `${moment(next_charge_at).format('DD/MM/YYYY')} - Cartão ${brand} final ${last_digits}`;
        }
    }
};

export default subscriptionNextChargeDateMethodInfo;
