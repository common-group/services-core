import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';

const projectEditUserAbout = {
    oninit: function(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id)
        };
    },

    view: function(ctrl, args) {
        return (ctrl.user() ? m(userAboutEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            useFloatBtn: true,
            hideDisableAcc: true,
            hideCoverImg: true,
            hidePasswordChange: true,
            publishingUserAbout: true
        }) : m('div', h.loader()));
    }
};

export default projectEditUserAbout;
