import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import userHeader from '../c/user-header';
import userCreated from '../c/user-created';
import userAboutEdit from '../c/user-about-edit';
import userPrivateContributed from '../c/user-private-contributed';
import userSettings from '../c/user-settings';
import userNotifications from '../c/user-notifications';
import userBalanceMain from '../c/user-balance-main';

const usersEdit = {
    controller(args) {
        const userDetails = m.prop({}),
            userId = args.user_id.split('-')[0],
            hash = m.prop(window.location.hash),
            displayTabContent = (user) => {
                const tabs = {
                    '#projects': m(userCreated, {
                        userId,
                        showDraft: true
                    }),
                    '#contributions': m(userPrivateContributed, {
                        userId,
                        user
                    }),
                    '#about_me': m(userAboutEdit, {
                        userId,
                        user
                    }),
                    '#settings': m(userSettings, {
                        userId,
                        user
                    }),
                    '#notifications': m(userNotifications, {
                        userId,
                        user
                    }),
                    '#balance': m(userBalanceMain, {
                        user_id: userId,
                        userId,
                        user
                    })
                };

                hash(window.location.hash);

                if (_.isEmpty(hash()) || hash() === '#_=_') {
                    hash('#contributions');
                    return tabs['#contributions'];
                }

                return tabs[hash()];
            };

        h.redrawHashChange();
        userVM.fetchUser(userId, true, userDetails);
        return {
            displayTabContent,
            hash,
            userDetails
        };
    },

    view(ctrl, args) {
        const user = ctrl.userDetails();

        return m('div', [
            m(userHeader, {
                user,
                hideDetails: true
            }),
            (!_.isEmpty(user) ? [m('nav.dashboard-nav.u-text-center', {
                style: {
                    'z-index': '10',
                    position: 'relative'
                }
            },
                        m('.w-container', [
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#contributions' ? '.selected' : '')}[data-target='#dashboard_contributions'][href='#contributions'][id='dashboard_contributions_link']`, 'Apoiados'),
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#projects' ? '.selected' : '')}[data-target='#dashboard_projects'][href='#projects'][id='dashboard_projects_link']`,
                                'Criados'
                            ),
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#about_me' ? '.selected' : '')}[data-target='#dashboard_about_me'][href='#about_me'][id='dashboard_about_me_link']`,
                              'Perfil Público'
                            ),
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#settings' ? '.selected' : '')}[data-target='#dashboard_settings'][href='#settings'][id='dashboard_settings_link']`,
                              'Dados cadastrais'
                            ),
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#notifications' ? '.selected' : '')}[data-target='#dashboard_notifications'][href='#notifications'][id='dashboard_notifications_link']`,
                                'Notificações'
                            ),
                            m(`a.dashboard-nav-link${(ctrl.hash() === '#balance' ? '.selected' : '')}[data-target='#dashboard_balance'][href='#balance'][id='dashboard_balance_link']`,
                              'Saldo'
                             ),
                            m(`a.dashboard-nav-link.u-right-big-only[href='/pt/users/${user.id}']`, {
                                config: m.route,
                                onclick: () => {
                                    m.route(`/users/${user.id}`, {
                                        user_id: user.id
                                    });
                                }
                            },
                                'Ir para o perfil público'
                            )
                        ])
                    ),

                m('section.section',
                  m((ctrl.hash() == '#projects' ? '.w-container' : '.w-section'),
                            m('.w-row', user.id ? ctrl.displayTabContent(user) : h.loader())
                        )
                    )

            ] :
                '')
        ]);
    }
};

export default usersEdit;
