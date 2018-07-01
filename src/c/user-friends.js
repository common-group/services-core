/**
 * window.c.userFriends component
 * Shows all friends cards and a follow-all button
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFriends, {user: user})
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

const userFriends = {
    controller(args) {
        models.userFriend.pageSize(9);

        const userFriendVM = catarse.filtersVM({ user_id: 'eq' }),
            user = args.user,
            friendListVM = catarse.paginationVM(models.userFriend, 'following.asc,total_contributed_projects.desc', {
                Prefer: 'count=exact'
            }),
            allLoading = m.prop(false),
            followAll = () => {
                allLoading(true);
                const l = catarse.loaderWithToken(models.followAllFriends.postOptions({}));

                l.load().then(() => {
                    friendListVM.firstPage(userFriendVM.parameters());
                    allLoading(false);
                });
            };

        userFriendVM.user_id(user.user_id);

        if (!friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        return {
            friendListVM,
            followAll,
            allLoading
        };
    },
    view(ctrl, args) {
        const listVM = ctrl.friendListVM;
        return m('.w-section.bg-gray.before-footer.section', [
            m('.w-container', [
                m('.w-row.u-marginbottom-40.card.u-radius.card-terciary', [
                    m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6', [
                        m('.fontsize-small', 'Comece agora! Siga todos os seus amigos ou somente alguns deles para descobrir projetos juntos!')
                    ]),
                    m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [
                            (ctrl.allLoading() ? h.loader()
                             : m('a.w-button.btn.btn-medium', {
                                 onclick: ctrl.followAll
                             }, `Siga todos os seus ${listVM.total() ? listVM.total() : ''} amigos`))
                    ])
                ]),
                m('.w-row', [
                    _.map(listVM.collection(), friend => m.component(UserFollowCard, { friend })),
                ]),
                m('.w-section.section.bg-gray', [
                    m('.w-container', [
                        m('.w-row.u-marginbottom-60', [
                            m('.w-col.w-col-5', [
                                m('.u-marginright-20')
                            ]),
                            m.component(loadMoreBtn, { collection: listVM }),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])

            ])
        ])
      ;
    }
};

export default userFriends;
