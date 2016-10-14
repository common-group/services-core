import m from 'mithril';
import h from '../h';
import userCard from '../c/user-card';
import userVM from '../vms/user-vm';

const userAbout = {
    controller(args) {
        const userDetails = m.prop({}),
              loader = m.prop(true),
              user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails).then(()=>{
          loader(false);
        });

        return {
            userDetails: userDetails,
            loader: loader
        };
    },
    view(ctrl, args) {
        const user = ctrl.userDetails();
        return ( ctrl.loader() ? h.loader() :  m('.content[id=\'about-tab\']',
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
        ));

    }
};

export default userAbout;
