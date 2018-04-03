import m from 'mithril';
import _ from 'underscore';
import userSubscriptionBox from './user-subscription-box';

const userSubscriptionDetail = {
    controller(args) {
        const subscription = args.subscription;

        return {
            subscription
        };
    },
    view(ctrl, args) {
        const subscription = args.subscription;

        return m(userSubscriptionBox, { subscription });
    }
};

export default userSubscriptionDetail;
