/**
 * window.c.userFollowers component
 * Shows all user followers cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFollowers, {user: user})
 *   ...
 * }
 */
import m from 'mithril';
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import UserFollowCard from '../c/user-follow-card';
import loadMoreBtn from '../c/load-more-btn';

const userFollowers = {
    oninit: function(vnode) {
        models.userFollower.pageSize(9);
        const followersListVM = catarse.paginationVM(models.userFollower,
                                                       'following.asc,created_at.desc', {
                                                           Prefer: 'count=exact'
                                                       }),
            user = vnode.attrs.user,
            userIdVM = catarse.filtersVM({ follow_id: 'eq' });

        userIdVM.follow_id(user.user_id);

        if (!followersListVM.collection().length) {
            followersListVM.firstPage(userIdVM.parameters());
        }
        return {
            followersListVM
        };
    },
    view: function({state, attrs}) {
        const followersVM = ctrl.followersListVM;
        return m('.w-section.bg-gray.before-footer.section', [
            m('.w-container', [
                m('.w-row', [
                    _.map(followersVM.collection(), friend => m(
                        UserFollowCard,
                        { friend: _.extend({}, { friend_id: friend.user_id }, friend.source) }
                    )),
                ]),
                m('.w-section.section.bg-gray', [
                    m('.w-container', [
                        m('.w-row.u-marginbottom-60', [
                            m('.w-col.w-col-5', [
                                m('.u-marginright-20')
                            ]), m(loadMoreBtn, { collection: followersVM }),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])

            ])
        ]);
    }
};

export default userFollowers;
