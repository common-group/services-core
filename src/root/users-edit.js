import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import userHeader from '../c/user-header';
import userCreated from '../c/user-created';
import userAboutEdit from '../c/user-about-edit';
import userPrivateContributed from '../c/user-private-contributed';
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
          $('#private-contributed-tab').appendTo('#dashboard_contributions');
          $('#settings-tab').appendTo('#dashboard_settings');
          $('#about-tab').appendTo('#dashboard_about_me');
        };

        userVM.fetchUser(user_id, true, userDetails);
        return {
          userDetails: userDetails,
          moveTabContent: moveTabContent
        };
    },

    view(ctrl, args) {
        const user = ctrl.userDetails(),
             userId = user.id;

        return m('div', {config: (el, isInit) => ctrl.moveTabContent()}, [
          m(menu, {menuTransparency: true}),
          m(userHeader, {user, hideDetails: true}),
          (!_.isEmpty(user) ?
          [   m(userAboutEdit, {userId, user}),
              m(userSettings, {userId, user}),
              m(userNotifications, {userId, user}),
              m(userPrivateContributed, {userId, user}),
              m(userCreated, {userId})
          ]
           : '')
      ]);

    }
};

export default usersEdit;
