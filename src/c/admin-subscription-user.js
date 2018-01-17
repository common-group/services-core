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
import h from '../h';
import adminUser from './admin-user';
import userVM from '../vms/user-vm';

const adminSubscriptionUser = {
    controller(args) {
        const user = m.prop({});
        console.log(args.item.user_external_id);
        userVM.fetchUser(args.item.user_external_id, false).then((data) => {
            user(_.first(data));
        });
        return {
            user
        };
    },
    view(ctrl, args) {
        const item = args.item,
              user = {
                  profile_img_thumbnail: ctrl.user() ? ctrl.user().profile_img_thumbnail : '',
                  id: item.id,
                  name: item.checkout_data.customer.name,
                  email: item.user_email
              };

        const additionalData = m('.fontsize-smallest.fontcolor-secondary', `Gateway: ${item.checkout_data.customer.email}`);
        return ctrl.user() ? m.component(adminUser, {
            item: user,
            additional_data: additionalData
        }) : h.loader();
    }
};

export default adminSubscriptionUser;
