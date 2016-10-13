import m from 'mithril';
import h from '../h';
import userCard from '../c/user-card';
import userVM from '../vms/user-vm';

const userAbout = {
    controller(args) {
        const userDetails = m.prop({}),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails);

        return {
            userDetails: userDetails
        };
    },
    view(ctrl, args) {
        const user = ctrl.userDetails();
        return m('.content[id=\'about-tab\']',
            m('.w-container[id=\'about-content\']',
                m('.w-row',
                    [
                        m('.w-col.w-col-8',
                            m('.fontsize-base', m.trust(user.about_html))
                        ),
                        m('.w-col.w-col-4',
                            (user.id ? m.component(userCard, {userId: user.id}) : h.loader)
                        )
                    ]
                )
            )
        );

    }
};

export default userAbout;
