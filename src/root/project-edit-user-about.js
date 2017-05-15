import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';

const projectEditUserAbout = {
    controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },

    view(ctrl, args) {
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
