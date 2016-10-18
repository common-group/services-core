/**
 * window.c.userCreators component
 * Shows all user creators suggestions cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userCreators, {user: user})
 *   ...
 * }
 */
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import UserFollowCard from  '../c/user-follow-card';
import loadMoreBtn from  '../c/load-more-btn';

const userCreators = {
    controller(args) {
        models.creatorSuggestion.pageSize(9);

        const creatorsListVM = postgrest.paginationVM(
            models.creatorSuggestion,
            'following.asc, total_published_projects.desc, total_contributed_projects.desc', {
                'Prefer':  'count=exact'
            });

        if (!creatorsListVM.collection().length) {
            creatorsListVM.firstPage();
        }

        return {
            creatorsListVM: creatorsListVM
        };
    },
    view(ctrl, args) {
        const creatorsVM = ctrl.creatorsListVM;

        return m('.w-section.bg-gray.before-footer.section', [
            m('.w-container', [
                m('.w-row', [
                    _.map(creatorsVM.collection(), (friend) => {
                        return m.component(
                            UserFollowCard,
                            {
                                friend: _.extend({},{
                                    friend_id: friend.user_id
                                }, friend)
                            });
                    }),
                ]),
                m('.w-section.section.bg-gray', [
                    m('.w-container', [
                        m('.w-row.u-marginbottom-60', [
                            m('.w-col.w-col-5', [
                                m('.u-marginright-20')
                            ]), m.component(loadMoreBtn, {collection: creatorsVM}),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])

            ])
        ])
        ;
    }
};

export default userCreators;
