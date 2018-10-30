import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';

const I18nScopePayment = _.partial(h.i18nScope, 'projects.payment');
const I18nScopePaymentMethod = _.partial(h.i18nScope, 'projects.payment_method');

const dashboardSubscriptionCardDetailPaymentHistoryEntry = {
    oninit: function(vnode) {
        const statusClass = {
            paid: '.text-success',
            pending: '.text-waiting',
            refused: '.text-error',
            refunded: '.text-error',
            chargedback: '.text-error',
            deleted: '.text-error',
            error: '.text-error'
        };

        vnode.state = {
            statusClass
        };
    },
    view: function({state, attrs}) {
        const 
            captalize = (str) => str.charAt(0).toUpperCase() + str.slice(1),
            paymentStatus = attrs.payment.status,
            paymentAmount = attrs.payment.amount,
            paymentMethod = attrs.payment.payment_method,
            paymentDate = attrs.payment.created_at,
            paymentDetails = attrs.payment.payment_method_details,
            paymentMethodText = I18n.t(`${paymentMethod}`, I18nScopePaymentMethod()),
            paymentStatusText = I18n.t(`last_status.${paymentMethod}.${paymentStatus}`, I18nScopePayment()),
            paymentMethodEndText = paymentMethod === 'boleto' ? 
                ` com venc. ${moment(paymentDetails.expiration_date).format('DD/MM')}` : 
                ` ${captalize(paymentDetails.brand)} final ${paymentDetails.last_digits}`;

        return m('.fontsize-smallest.w-row',
            [
                m('.w-col.w-col-3', m('.fontcolor-secondary', moment(paymentDate).format('DD/MM/YYYY'))),
                m('.w-col.w-col-9', 
                    m('div',
                        [
                            m(`span.fa.fa-circle${state.statusClass[paymentStatus]}`, m.trust('&nbsp;')),
                            `R$${paymentAmount / 100} ${paymentStatusText} - ${captalize(paymentMethodText)} ${paymentMethodEndText}`
                        ]
                    )
                )
            ]
        );
    }
};

export default dashboardSubscriptionCardDetailPaymentHistoryEntry;
