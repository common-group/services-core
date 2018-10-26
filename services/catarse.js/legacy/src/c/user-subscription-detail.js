import m from 'mithril';
import _ from 'underscore';
import userSubscriptionBox from './user-subscription-box';

const userSubscriptionDetail = {
    oninit: function(vnode) {
        const subscription = vnode.attrs.subscription;

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
