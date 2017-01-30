import m from 'mithril';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';

const projectEditUserAbout = {
    controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },

    view(ctrl, args) {
        return m(userAboutEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            useFloatBtn: true});
    }
};

export default projectEditUserAbout;
