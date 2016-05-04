/**
 * window.c.AdminContributionUser component
 * An itembuilder component that returns additional data
 * to be included in AdminUser.
 *
 * Example:
 * controller: function() {
 *     return {
 *         itemBuilder: [{
 *             component: 'AdminContributionUser',
 *             wrapperClass: '.w-col.w-col-4'
 *         }]
 *     }
 * }
 */
import m from 'mithril';
import adminUser from './admin-user';

const adminContributionUser = {
    view (ctrl, args) {
        const item = args.item,
              user = {
                  profile_img_thumbnail: item.user_profile_img,
                  id: item.user_id,
                  name: item.user_name,
                  email: item.email,
              };

        const additionalData = m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
        return m.component(adminUser, {item: user, additional_data: additionalData});
    }
};

export default adminContributionUser;
