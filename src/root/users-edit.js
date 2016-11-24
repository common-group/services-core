import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import userHeader from '../c/user-header';
import userCreated from '../c/user-created';
import userSettings from '../c/user-settings';
import userNotifications from '../c/user-notifications';
import menu from '../root/menu';

const usersEdit = {
    controller(args) {
        const userDetails = m.prop({}),
            user_id = args.user_id;

        //@TODO remove this after migrating all tabs to API
        const moveTabContent = () => {
          $('#created-tab').appendTo('#dashboard_projects');
          $('#notifications-tab').appendTo('#dashboard_notifications');
          $('#settings-tab').appendTo('#dashboard_settings');
        };

        userVM.fetchUser(user_id, true, userDetails);
        return {
          userDetails: userDetails,
          moveTabContent: moveTabContent
        };
    },

    view(ctrl, args) {
        const user = ctrl.userDetails();

        return m('div', {config: ctrl.moveTabContent()}, [
          m.component(menu, {menuTransparency: true}),
          m.component(userHeader, {user: user, hideDetails: true}),
          (!_.isEmpty(user) ? 
          [
              m.component(userNotifications, {userId: user.id, user: user}),
              m.component(userCreated, {userId: user.id}),
              m.component(userSettings, {userId: user.id, user: user})
          ]
           : '')
      ]);

    }
};

export default usersEdit;
