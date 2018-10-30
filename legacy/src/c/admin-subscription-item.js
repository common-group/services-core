import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import adminSubProject from './admin-sub-project';
import adminSubscription from './admin-subscription';
import adminSubscriptionUser from './admin-subscription-user';
import subPaymentStatus from './sub-payment-status';

const adminSubscriptionItem = {
    oninit: function() {
        return {
            itemBuilder: [{
                component: adminSubscriptionUser,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminSubProject,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminSubscription,
                wrapperClass: '.w-col.w-col-2'
            }, {
                component: subPaymentStatus,
                wrapperClass: '.w-col.w-col-2'
            }]
        };
    },
    view: function({state, attrs}) {
        // console.log(args.item);
        return m(
            '.w-row',
            _.map(ctrl.itemBuilder, panel => m(panel.wrapperClass, [
                m(panel.component, {
                    item: args.item,
                    key: args.key
                })
            ]))
        );
    }
};

export default adminSubscriptionItem;
