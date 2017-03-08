import m from 'mithril';
import _ from 'underscore';
import userVM from '../vms/user-vm';
import h from '../h';

const menuProfile = {
    controller(args) {
        const contributedProjects = m.prop(),
            latestProjects = m.prop([]),
            userDetails = m.prop({}),
            user_id = args.user.user_id;

        const userName = () => {
            const name = userDetails().public_name || userDetails().name;
            if (name && !_.isEmpty(name)) {
                return _.first(name.split(' '));
            }

            return '';
        };

        userVM.fetchUser(user_id, true, userDetails);

        return {
            contributedProjects,
            latestProjects,
            userDetails,
            userName,
            toggleMenu: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const user = ctrl.userDetails();

        return m('.w-dropdown.user-profile',
            [
                m('a.w-dropdown-toggle.dropdown-toggle[href=\'javascript:void()\'][id=\'user-menu\']',
                    {
                        onclick: ctrl.toggleMenu.toggle
                    },
                    [
                        m('.user-name-menu', ctrl.userName()),
                        m(`img.user-avatar[alt='Thumbnail - ${user.name}'][height='40'][src='${h.useAvatarOrDefault(user.profile_img_thumbnail)}'][width='40']`)
                    ]
                ),
                ctrl.toggleMenu() ? m('nav.w-dropdown-list.dropdown-list.user-menu.w--open[id=\'user-menu-dropdown\']', { style: 'display:block;' },
                    [
                        m('.w-row',
                            [
                                m('.w-col.w-col-12',
                                    [
                                        m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            'Meu histórico'
                                        ),
                                        m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#contributions']`,
                                                        'Histórico de apoio'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#projects']`,
                                                    'Projetos criados'
                                                   )
                                                 ),
                                                m('li.w-hidden-main.w-hidden-medium.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#projects']`,
                                                        'Projetos criados'
                                                    )
                                                )
                                            ]
                                        ),
                                        m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            'Configurações'
                                        ),
                                        m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                  m('a.alt-link.fontsize-smaller[href=\'/connect-facebook/\']',
                                                    'Encontre amigos'
                                                   ),
                                                  m.trust('&nbsp;'),
                                                  m('span.badge.badge-success', 'Novidade')
                                                 ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#about_me']`,
                                                        'Perfil público'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#notifications']`,
                                                        'Notificações'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#settings']`,
                                                        `Dados cadastrais`
                                                    )
                                                )
                                            ]
                                        ),
                                        m('.divider.u-marginbottom-20'),
                                        args.user.is_admin_role ? m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            'Admin'
                                        ) : '',
                                        args.user.is_admin_role ? m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                    m('a.alt-link.fontsize-smaller[href=\'/pt/new-admin#/users\']',
                                                        'Usuários'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m('a.alt-link.fontsize-smaller[href=\'/pt/new-admin\']',
                                                        'Apoios'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m('a.alt-link.fontsize-smaller[href=\'/pt/admin/financials\']',
                                                        'Rel. Financeiros'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m('a.alt-link.fontsize-smaller[href=\'/pt/admin/projects\']',
                                                        'Admin projetos'
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m('a.alt-link.fontsize-smaller[href=\'/pt/dbhero\']',
                                                        'Dataclips'
                                                    )
                                                )
                                            ]
                                        ) : '',
                                        m('.fontsize-mini', 'Seu e-mail de cadastro é: '),
                                        m('.fontsize-smallest.u-marginbottom-20', [
                                            m('span.fontweight-semibold', `${user.email} `),
                                            m(`a.alt-link[href='/pt/users/${user.id}/edit#about_me']`, 'alterar e-mail')
                                        ]),
                                        m('.divider.u-marginbottom-20'),
                                        m('a.alt-link[href=\'/pt/logout\']',
                                            'Sair'
                                        )
                                    ]
                                ),
                                //m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                //    [
                                //        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                //            `Projetos apoiados`
                                //        ),
                                //        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.contributedProjects() ?
                                //            _.isEmpty(ctrl.contributedProjects) ? 'Nenhum projeto.' :
                                //            m.component(quickProjectList, {
                                //                projects: m.prop(_.map(ctrl.contributedProjects(), (contribution) => {
                                //                    return {
                                //                        project_id: contribution.project_id,
                                //                        project_user_id: contribution.project_user_id,
                                //                        thumb_image: contribution.project_img,
                                //                        video_cover_image: contribution.project_img,
                                //                        permalink: contribution.permalink,
                                //                        name: contribution.project_name
                                //                    };
                                //                })),
                                //                loadMoreHref: '/pt/users/${user.id}/edit#contributions',
                                //                ref: 'user_menu_my_contributions'
                                //            }) : 'carregando...'
                                //        )
                                //    ]
                                //),
                                //m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                //    [
                                //        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                //            `Projetos criados`
                                //        ),
                                //        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.latestProjects() ?
                                //            _.isEmpty(ctrl.latestProjects) ? 'Nenhum projeto.' :
                                //            m.component(quickProjectList, {
                                //                projects: ctrl.latestProjects,
                                //                loadMoreHref: '/pt/users/${user.id}/edit#contributions',
                                //                ref: 'user_menu_my_projects'
                                //            }) : 'carregando...'
                                //        )
                                //    ]
                                //)
                            ]
                        )
                    ]
                ) : ''
            ]
        );
    }
};

export default menuProfile;
