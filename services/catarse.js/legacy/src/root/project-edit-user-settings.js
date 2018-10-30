import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';
import userSettings from '../c/user-settings';

const projectEditUserSettings = {
    oninit: function(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id)
        };
    },

    view: function({state, attrs}) {
        return (ctrl.user() ? m(userSettings, {
            user: ctrl.user(),
            userId: args.user_id,
            hideCreditCards: true,
            useFloatBtn: true,
            publishingUserSettings: true,
            isProjectUserEdit: true
        }) : m('div', h.loader()));
    }
};

export default projectEditUserSettings;
