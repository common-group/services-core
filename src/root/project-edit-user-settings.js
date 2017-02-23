import m from 'mithril';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';
import userSettings from '../c/user-settings';

const projectEditUserSettings = {
    controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },

    view(ctrl, args) {
        return m(userSettings, {
            user: ctrl.user(),
            userId: args.user_id,
            hideCreditCards: true,
            useFloatBtn: true
        });
    }
};

export default projectEditUserSettings;
