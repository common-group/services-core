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
import adminUser from './admin-user';

const adminSubscriptionUser = {
    view(ctrl, args) {
        const item = args.item,
            user = {
                profile_img_thumbnail: '', //@TODO
                id: item.id,
                name: item.checkout_data.customer.name,
                email: item.user_email
            };

        const additionalData = m('.fontsize-smallest.fontcolor-secondary', `Gateway: ${item.checkout_data.customer.email}`);
        return m.component(adminUser, { item: user, additional_data: additionalData });
    }
};

export default adminSubscriptionUser;
