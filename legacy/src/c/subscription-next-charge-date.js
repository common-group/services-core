import m from 'mithril';
import subscriptionNextChargeDateMethodInfo from './subscription-next-charge-date-method-info';

const subscriptionNextChargeDate = {
    view: function({
        attrs
    }) {
        const {
            subscription,
            last_payment
        } = attrs;

        const {
            status,
            next_charge_at
        } = subscription;

        const {
            payment_method,
            payment_method_details
        } = last_payment;

        if ((status === 'active' || status === 'started') && !!next_charge_at) {
            return m('div.card-secondary.fontsize-smaller.u-marginbottom-20', [
                m('span.fontweight-semibold', 'Próxima cobrança:'),
                m.trust('&nbsp;'),
                m(subscriptionNextChargeDateMethodInfo, {
                    next_charge_at,
                    payment_method,
                    payment_method_details
                })
            ]);
        } else {
            return m('span[style="display:none"]');
        }
    }
};

export default subscriptionNextChargeDate;
