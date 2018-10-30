import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';
import userSettings from '../c/user-settings';

const projectEditUserSettings = {
    oninit: function(vnode) {
        vnode.state = {
            user: userVM.fetchUser(vnode.attrs.user_id)
        };
    },

    view: function({state, attrs}) {
        return (state.user() ? m(userSettings, {
            user: state.user(),
            userId: attrs.user_id,
            hideCreditCards: true,
            useFloatBtn: true,
            publishingUserSettings: true,
            isProjectUserEdit: true
        }) : m('div', h.loader()));
    }
};

export default projectEditUserSettings;
