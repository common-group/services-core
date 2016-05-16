import m from 'mithril';
import h from '../h';
import adminProject from './admin-project';
import adminContribution from './admin-contribution';
import adminContributionUser from './admin-contribution-user';
import paymentStatus from './payment-status';

const adminContributionItem = {
    controller() {
        return {
            itemBuilder: [{
                component: adminContributionUser,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminProject,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminContribution,
                wrapperClass: '.w-col.w-col-2'
            }, {
                component: paymentStatus,
                wrapperClass: '.w-col.w-col-2'
            }]
        };
    },
    view(ctrl, args) {
        return m(
            '.w-row',
            _.map(ctrl.itemBuilder, function(panel) {
                return m(panel.wrapperClass, [
                    m.component(panel.component, {
                        item: args.item,
                        key: args.key
                    })
                ]);
            })
        );
    }
};

export default adminContributionItem;
