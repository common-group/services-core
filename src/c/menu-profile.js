import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import userVM from '../vms/user-vm';
import models from '../models';
import h from '../h';
import quickProjectList from '../c/quick-project-list';

const menuProfile = {
    controller(args) {
        const contributedProjects = m.prop(),
            latestProjects = m.prop(),
            userDetails = m.prop({}),
            user_id = args.user.user_id;

        userVM.fetchUser(user_id, true, userDetails);

        // userVM.getUserCreatedProjects(user_id).then(latestProjects);

        return {
            contributedProjects: contributedProjects,
            latestProjects: latestProjects,
            userDetails: userDetails,
            toggleMenu: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const user = ctrl.userDetails();

        return m(`.w-dropdown.user-profile`,
            [
                m(`a.w-dropdown-toggle.dropdown-toggle[href='javascript:void()'][id='user-menu']`,
                    {
                        onclick: ctrl.toggleMenu.toggle
                    },
                    m(`img.user-avatar[alt='Thumb avatar 942644 4735930283597 888573557 n'][height='40'][src='${user.profile_img_thumbnail}'][width='40']`)
                ),
                ctrl.toggleMenu() ? m(`nav.w-dropdown-list.dropdown-list.user-menu.w--open[id='user-menu-dropdown']`,
                    [
                        m(`.w-row`,
                            [
                                m(`.w-col.w-col-4`,
                                    [
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            `Meu histórico`
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`,
                                            [
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#contributions']`,
                                                        `Histórico de apoio`
                                                    )
                                                ),
                                                m(`li.w-hidden-main.w-hidden-medium.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#projects']`,
                                                        `Projetos criados`
                                                    )
                                                )
                                            ]
                                        ),
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            `Configurações`
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`,
                                            [
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#about_me']`,
                                                        `Sobre você`
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#notifications']`,
                                                        `Notificações`
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#settings']`,
                                                        `Dados e endereço`
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/pt/users/${user.id}/edit#billing']`,
                                                        `Banco e cartões`
                                                    )
                                                )
                                            ]
                                        )
                                    ]
                                ),
                                m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                    [
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            `Projetos apoiados`
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.contributedProjects() ?
                                            _.isEmpty(ctrl.contributedProjects) ? 'Nenhum projeto.' :
                                            m.component(quickProjectList, {
                                                projects: ctrl.contributedProjects,
                                                loadMore: '/pt/users/${user.id}/edit#contributions'
                                            }) : 'carregando...'
                                        )
                                    ]
                                ),
                                m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                    [
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            `Projetos criados`
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.latestProjects() ?
                                            _.isEmpty(ctrl.latestProjects) ? 'Nenhum projeto.' :
                                            m.component(quickProjectList, {
                                                projects: ctrl.latestProjects,
                                                loadMore: '/pt/users/${user.id}/edit#contributions'
                                            }) : 'carregando...'
                                        )
                                    ]
                                )
                            ]
                        ),
                        m(`.divider.u-marginbottom-20`),
                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                            `Admin`
                        ),
                        m(`ul.w-list-unstyled.u-marginbottom-20`,
                            [
                                m(`li.lineheight-looser`,
                                    m(`a.alt-link.fontsize-smaller[href='/pt/new-admin#/users']`,
                                        `Usuários`
                                    )
                                ),
                                m(`li.lineheight-looser`,
                                    m(`a.alt-link.fontsize-smaller[href='/pt/new-admin']`,
                                        `Apoios`
                                    )
                                ),
                                m(`li.lineheight-looser`,
                                    m(`a.alt-link.fontsize-smaller[href='/pt/admin/financials']`,
                                        `Rel. Financeiros`
                                    )
                                ),
                                m(`li.lineheight-looser`,
                                    m(`a.alt-link.fontsize-smaller[href='/pt/admin/projects']`,
                                        `Admin projetos`
                                    )
                                ),
                                m(`li.lineheight-looser`,
                                    m(`a.alt-link.fontsize-smaller[href='/pt/dbhero']`,
                                        `Dataclips`
                                    )
                                )
                            ]
                        ),
                        m(`.divider.u-marginbottom-20`),
                        m(`.fontsize-smallest`,
                            [
                                `Você está logado como`,
                                m(`span`,
                                    [
                                        m.trust(`&nbsp;`),
                                        m(`span.fontweight-semibold`,
                                            `Vinícius Chaves de Andrade`
                                        ),
                                        m.trust(`&nbsp;`),
                                        m(`a.alt-link[href='/pt/logout']`,
                                            `Sair`
                                        )
                                    ]
                                )
                            ]
                        )
                    ]
                ) : ''
            ]
        );
    }
};

export default menuProfile;
