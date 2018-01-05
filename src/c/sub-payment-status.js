import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');
const subPaymentStatus = {
    controller(args) {
        const statusClass = {
            active: 'fa-circle.text-success',
            started: 'fa-circle.text-waiting',
            inactive: 'fa-circle.text-error',
            canceled: 'fa-times-circle.text-error',
            canceling: 'fa-times-circle-o.text-error',
            deleted: 'fa-circle.text-error',
            error: 'fa-circle.text-error'
        };
        const paymentClass = {
            boleto: 'fa-barcode',
            credit_card: 'fa-credit-card'
        };
        return {
            statusClass,
            paymentClass
        };
    },
    view(ctrl, args) {
        const subscription = args.item;
        return m('.w-row.admin-contribution', [
            m('.fontsize-smallest.fontweight-semibold', [
                m(`.fa.${ctrl.statusClass[subscription.status]}]`,
                    ' '
                ),
                m.trust('&nbsp;'),
                I18n.t(`status.${subscription.status}`, I18nScope())
            ]),
            m('.fontsize-smallest.fontweight-semibold', [
                m(`span.fa.${ctrl.paymentClass[subscription.payment_method]}`,
                    ' '
                ),
                m.trust('&nbsp;'),
                m('a.link-hidden',
                    I18n.t(subscription.payment_method, I18nScope())
                )
            ])
        ]);
    }
};

export default subPaymentStatus;
