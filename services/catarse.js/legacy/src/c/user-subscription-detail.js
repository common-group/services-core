import m from 'mithril';
import _ from 'underscore';
import userSubscriptionBox from './user-subscription-box';

const userSubscriptionDetail = {
    controller: function(args) {
        const subscription = args.subscription;

        return {
            subscription
        };
    },
    view: function(ctrl, args) {
        const subscription = args.subscription;

        return m(userSubscriptionBox, { subscription });
    }
};

export default userSubscriptionDetail;
