import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectInviteCard from '../c/project-invite-card';
import projectGoalsBoxDashboard from './project-goals-box-dashboard';
import projectGoalsVM from '../vms/project-goals-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.insights');

const projectInsightsSub = {
    controller(args) {
        const filtersVM = args.filtersVM;

        projectGoalsVM.fetchGoals(filtersVM.project_id());

        return {
            projectGoalsVM
        };
    },
    view(ctrl, args) {
        const project = args.project;

        return m('.project-insights', !args.l() ? [
            m(`.w-section.section-product.${project.mode}`),
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            m('.dashboard-header.section-one-column', [
                m('.u-marginbottom-30.u-text-center', [
                    m('.fontsize-larger.fontweight-semibold',
                        `Olá, ${project.user.public_name || project.user.name}!`
                    ),
                    m('.fontsize-smaller',
                        `Este é o retrato de sua campanha hoje, ${moment().format('DD [de] MMMM [de] YYYY')}`
                    )
                ]),
                m('.w-container',
                    m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                        m.component(projectGoalsBoxDashboard, { goalDetails: ctrl.projectGoalsVM.goals }),
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Assinantes'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                '112'
                            )
                        ]),
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Receita Mensal'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                'R$10.560'
                            )
                        ]),
                        m('.card.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10', [
                                'Saldo',
                                m.trust('&nbsp;'),
                                ' ',
                                m("a.btn-inline.btn-terciary.fontsize-smallest.u-radius[href='http://catarse.webflow.io/banco/saldo-assinatura']",
                                    'Sacar'
                                )
                            ]),
                            m('.fontsize-largest.fontweight-semibold.text-success.u-marginbottom-10',
                                'R$2.500'
                            )
                        ])
                    ])
                ),
                (project.state === 'online' && !project.has_cancelation_request ? m.component(projectInviteCard, {
                    project
                }) : ''),
            ])
        ] : h.loader());
    }
};

export default projectInsightsSub;
