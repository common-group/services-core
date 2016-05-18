import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import UserFollowBtn from  '../c/user-follow-btn';


const FollowFoundFriends = {
    controller(args) {
        models.userFriend.pageSize(9);

        const userFriendVM = postgrest.filtersVM({
            user_id: 'eq'
        }),
              friendListVM = postgrest.paginationVM(models.userFriend, "total_contributed_projects.desc", {
                  'Prefer':  'count=exact'
              }),
              allLoading = m.prop(false),
              followAll = () => {
                  allLoading(true);
                  const l = postgrest.loaderWithToken(models.followAllFriends.postOptions({}));

                  l.load().then(() => {
                      friendListVM.firstPage(userFriendVM.parameters());
                      allLoading(false);
                  });
              };

        userFriendVM.user_id(args.root.getAttribute('data-currentuserid'));

        if(!friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        return {
            friendListVM: friendListVM,
            followAll: followAll,
            allLoading: allLoading
        };
    },
    view(ctrl, args) {
        const listVM = ctrl.friendListVM;
        return [
            m('.w-section.dashboard-header', [
                m('.w-container', [
                    m('.w-row.u-margintop-20.u-marginbottom-20', [
                        m('.w-col.w-col-1'),
                        m('.w-col.w-col-10.u-text-center', [
                            m('.fontsize-larger.fontweight-semibold.u-marginbottom-10', 'Descubra projetos com seus amigos'),
                            m('.fontsize-small', 'Siga os seus amigos e nós iremos te notificar sempre que eles lançarem ou apoiarem algum projeto')
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ])
            ]),
            m('.divider.u-margintop-30'),
            m('.w-section.bg-gray.before-footer.section', [
                m('.w-container', [
                    m('.w-row.u-marginbottom-40.card.u-radius.card-terciary', [
                        m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6', [
                            m('.fontsize-small', 'Comece agora! Siga todos os seus amigos ou somente alguns deles para descobrir projetos juntos!')
                        ]),
                        m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [
                            (ctrl.allLoading() ? h.loader()
                             : m("a.w-button.btn.btn-medium", {
                                 onclick: ctrl.followAll
                             },`Siga todos os seus ${listVM.total() ? listVM.total() : ''} amigos`))
                        ])
                    ]),

                    _.map(listVM.collection(), (friend) => {
                        const profile_img = _.isEmpty(friend.avatar) ? '/assets/catarse_bootstrap/user.jpg' : friend.avatar;

                        return m('.card.card-clickable', [
                            m('.w-row', [
                                m('.w-col.w-col-9.w-col-small-9', [
                                    m('.w-row', [
                                        m('.w-col.w-col-2.w-col-small-2.w-col-tiny-6', [
                                            m(`img.thumb.u-round.u-marginright-20[src='${profile_img}']`)
                                        ]),
                                        m('.w-col.w-col-10.w-col-small-10.w-col-tiny-6', [
                                            m('.fontsize-base.fontweight-semibold', friend.name),
                                            (_.isNull(friend.city) ? '' :
                                             m('.fontsize-smaller.fontcolor-secondary.u-marginbottom-10', `${friend.city}, ${friend.state}`)),
                                            m('.fontsize-small', [
                                                m('span.fontweight-semibold',friend.total_contributed_projects)," apoiados"
                                            ])
                                        ])
                                    ])
                                ]),
                                m(".w-col.w-col-3.w-col-small-3", m.component(UserFollowBtn, {following: friend.following, follow_id: friend.friend_id}))
                            ])
                        ]);
                    }),

                    m(".w-section.section.bg-gray", [
                        m(".w-container", [
                            m(".w-row.u-marginbottom-60", [
                                m(".w-col.w-col-5", [
                                    m(".u-marginright-20")
                                ]),
                                m(".w-col.w-col-2", [
                                    (!listVM.isLoading() ?
                                     (listVM.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                         onclick: listVM.nextPage
                                     }, 'Carregar mais')) : h.loader())
                                ]),
                                m(".w-col.w-col-5")
                            ])
                        ])
                    ])

                ])
            ])
        ];
    }
};

export default FollowFoundFriends;
