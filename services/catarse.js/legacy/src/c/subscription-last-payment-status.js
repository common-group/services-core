import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.payment');

const subscriptionLastPaymentStatus = {
    oninit: function(vnode)
    {
        const statusClass = {
            paid: '.text-success',
            pending: '.text-waiting',
            refused: '.text-error',
            refunded: '.text-error',
            chargedback: '.text-error',
            deleted: '.text-error',
            error: '.text-error'
        };

        return {
            statusClass,
            lastPaymentDate: vnode.attrs.subscription.last_payment_data_created_at,
            lastPaymentStatus: vnode.attrs.subscription.last_payment_data.status,
            lastPaymentMethod: vnode.attrs.subscription.last_payment_data.payment_method
        };
    },
    view: function(ctrl, args)
    {
        return m('span', [
            m(".fontsize-smaller",
                ctrl.lastPaymentDate ? moment(ctrl.lastPaymentDate).format('DD/MM/YYYY') : ''
            ),
            m(`.fontsize-mini.lineheight-tightest.fontweight-semibold${ctrl.statusClass[ctrl.lastPaymentStatus]}`,
                I18n.t(`last_status.${ctrl.lastPaymentMethod}.${ctrl.lastPaymentStatus}`, I18nScope())
            )
        ]);
    }
};

export default subscriptionLastPaymentStatus;