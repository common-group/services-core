/**
 * window.c.AdminSubscriptionUser component
 * An itembuilder component that returns additional data
 * to be included in AdminUser.
 *
 * Example:
 * controller: function() {
 *     return {
 *         itemBuilder: [{
 *             component: 'AdminSubscriptionUser',
 *             wrapperClass: '.w-col.w-col-4'
 *         }]
 *     }
 * }
 */
import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import h from '../h';
import adminUser from './admin-user';
import userVM from '../vms/user-vm';

const adminSubscriptionUser = {
    oninit: function(vnode) {
        const user = prop({});
        userVM.fetchUser(vnode.attrs.item.user_external_id, false).then((data) => {
            user(_.first(data));
        });
        return {
            user
        };
    },
    view: function({state, attrs}) {
        const item = args.item,
            customer = item.checkout_data ? item.checkout_data.customer : {},
            user = {
                profile_img_thumbnail: ctrl.user() ? ctrl.user().profile_img_thumbnail : '',
                id: item.user_external_id,
                name: customer.name,
                email: item.user_email
            };

        const additionalData = m('.fontsize-smallest.fontcolor-secondary', `Gateway: ${customer.email}`);
        return ctrl.user() ? m(adminUser, {
            item: user,
            additional_data: additionalData
        }) : h.loader();
    }
};

export default adminSubscriptionUser;
