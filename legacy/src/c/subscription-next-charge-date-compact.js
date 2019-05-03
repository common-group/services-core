import m from 'mithril';
import moment from 'moment';

const subscriptionNextChargeDateCompact = {

    view: function({
        state,
        attrs
    }) {

        const {
            subscription
        } = attrs;

        if (subscription.status === 'active' || subscription.status === 'started') {
            return m('div.fontsize-smallest.fontweight-semibold.fontcolor-secondary.u-marginbottom-10', [
                'Próx. cobrança:',
                m.trust('&nbsp;'),
                moment(subscription).format('DD/MM/YYYY')
            ]);
        } else {
            return m('span[style="display:none"]');
        }
    }
};

export default subscriptionNextChargeDateCompact;
