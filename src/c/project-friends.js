import m from 'mithril';
import I18n from 'i18n-js';
import _ from 'underscore';
import models from '../models';
import postgrest from 'mithril-postgrest';

const projectFriends = {
    controller(args) {
        const project = args.project,
            friendsSample = m.prop([]),
            listVM = postgrest.paginationVM(models.contributor, 'user_id.desc', {
                Prefer: 'count=exact'
            }),
            filterVM = postgrest.filtersVM({
                project_id: 'eq',
                is_follow: 'eq'
            }).project_id(project.project_id).is_follow(true);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters()).then(() => {
                friendsSample(_.sample(listVM.collection(), 2));
            });
        }
        return {
            project,
            listVM,
            friendsSample
        };
    },
    view(ctrl, args) {
        const project = ctrl.project,
            friendsCount = ctrl.listVM.collection().length,
            wrapper = args.wrapper || '.friend-backed-card';

        return m(wrapper, [
            m('.friend-facepile', [
                _.map(ctrl.friendsSample(), (user) => {
                    const profile_img = _.isEmpty(user.data.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : user.data.profile_img_thumbnail;
                    return m(`img.user-avatar[src='${profile_img}']`);
                })
            ]),
            m('p.fontsize-smallest.friend-namepile.lineheight-tighter', [
                m('span.fontweight-semibold',
                    _.map(ctrl.friendsSample(), user => user.data.name.split(' ')[0]).join(friendsCount > 2 ? ', ' : ' e ')
                ),
                (friendsCount > 2 ? [
                    ' e ',
                    m('span.fontweight-semibold',
                        `mais ${friendsCount - ctrl.friendsSample().length}`
                    )
                ] : ''),
                (friendsCount > 1 ?
                    ' apoiaram' : ' apoiou')
            ])
        ]);
    }
};

export default projectFriends;
