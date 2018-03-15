import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');

const subscriptionStatusIcon = {
    controller() {
        const statusClass = {
            active: 'fa-circle.text-success',
            started: 'fa-circle.text-waiting',
            inactive: 'fa-circle.text-error',
            canceled: 'fa-times-circle.text-error',
            canceling: 'fa-times-circle-o.text-error',
            deleted: 'fa-circle.text-error',
            error: 'fa-circle.text-error'
        };
        return {
            statusClass
        };
    },
    view(ctrl, args) {
        const subscription = args.subscription,
            statusClass = ctrl.statusClass;

        return m('span', [
            m('span.fontsize-smaller', [
                m(`span.fa.${statusClass[subscription.status] || 'Erro'}`,
                    ' '
                ),
                I18n.t(`status.${subscription.status}`, I18nScope())
            ]),
            subscription.status === 'started' ? m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                `em ${moment(subscription.created_at).format('DD/MM/YYYY')}`
            ) : ''
        ]);
    }
};

export default subscriptionStatusIcon;
