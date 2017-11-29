import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectInviteCard from '../c/project-invite-card';
import projectGoalsBoxDashboard from './project-goals-box-dashboard';
import projectGoalsVM from '../vms/project-goals-vm';
import userVM from '../vms/user-vm.js';

const I18nScope = _.partial(h.i18nScope, 'projects.insights');

const projectInsightsSub = {
    controller(args) {
        const filtersVM = args.filtersVM;

        projectGoalsVM.fetchGoals(filtersVM.project_id());
        const balanceLoader = userVM.getUserBalance(args.project.user_id);

        return {
            projectGoalsVM,
            balanceLoader
        };
    },
    view(ctrl, args) {
        const project = args.project,
            subscribersDetails = args.subscribersDetails,
            balanceData = (ctrl.balanceLoader() && !_.isNull(_.first(ctrl.balanceLoader())) ? _.first(ctrl.balanceLoader()) : null);

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
                        subscribersDetails && !_.isEmpty(ctrl.projectGoalsVM.goals()) ?
                        m.component(projectGoalsBoxDashboard, { goalDetails: ctrl.projectGoalsVM.goals, amount: subscribersDetails.amount_paid_for_valid_period }) : '',
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Assinantes ativos'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                subscribersDetails.total_subscriptions
                            )
                        ]),
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Receita Mensal'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                `R$${h.formatNumber(subscribersDetails.amount_paid_for_valid_period, 2, 3)}`
                            )
                        ]),
                        m('.card.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10', [
                                'Saldo',
                                m.trust('&nbsp;'),
                                ' ',
                                m(`a.btn-inline.btn-terciary.fontsize-smallest.u-radius[href='/users/${project.user_id}/edit#balance']`,
                                    'Sacar'
                                )
                            ]),
                            m('.fontsize-largest.fontweight-semibold.text-success.u-marginbottom-10',
                                (balanceData && balanceData.amount ? `R$${h.formatNumber(balanceData.amount, 2, 3)}` : '')
                            )
                        ])
                    ])
                ),
                (project.state === 'online' && !project.has_cancelation_request ? m('.w-container', m.component(projectInviteCard, {
                    project
                })) : ''),
            ])
        ] : h.loader());
    }
};

export default projectInsightsSub;
