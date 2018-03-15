import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');

const paymentMethodIcon = {
    controller(args) {
        const subscription = args.subscription;

        const paymentClass = {
            boleto: 'fa-barcode',
            credit_card: 'fa-credit-card'
        };
        return {
            subscription,
            paymentClass
        };
    },
    view(ctrl, args) {
        const subscription = ctrl.subscription,
            paymentClass = ctrl.paymentClass;

        return m('span', [
            m(`span.fa.${paymentClass[subscription.payment_method]}`,
                ''
            ),
            I18n.t(subscription.payment_method, I18nScope())
        ]);
    }
};

export default paymentMethodIcon;
