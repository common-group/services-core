import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import {
    catarse,
    catarseMoments,
    commonAnalytics
} from '../api';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectDataChart from '../c/project-data-chart';
import projectInviteCard from '../c/project-invite-card';
import subscriptionsPerMonthTable from '../c/subscriptions-per-month-table';
import projectGoalsBoxDashboard from './project-goals-box-dashboard';
import insightsInfoBox from './insights-info-box';
import projectGoalsVM from '../vms/project-goals-vm';
import subscriptionVM from '../vms/subscription-vm';
import userVM from '../vms/user-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.insights');

const projectInsightsSub = {
    controller: function(args) {
        const filtersVM = args.filtersVM,
            visitorsTotal = m.prop(0),
            visitorLoader = catarseMoments.loaderWithToken,
            loader = commonAnalytics.loaderWithToken,
            visitorsPerDay = m.prop([]);
        const weekSubscriptions = m.prop([]);
        const subscriptionsPerDay = m.prop([]);
        const lastWeekSubscriptions = m.prop([]);
        const weekTransitions = m.prop([]);
        const lastWeekTransitions = m.prop([]);
        const subscriptionsPerMonth = m.prop([]);
        const isSubscriptionsPerMonthLoaded = m.prop(false);
        const subVM = commonAnalytics.filtersVM({
            project_id: 'eq'
        });
        const processVisitors = (data) => {
            if (!_.isEmpty(data)) {
                visitorsPerDay(data);
                visitorsTotal(_.first(data).total);
            }
        };

        subVM.project_id(args.project.common_id);
        const lVisitorsPerDay = visitorLoader(models.projectVisitorsPerDay.getRowOptions(filtersVM.parameters()));
        lVisitorsPerDay.load().then(processVisitors);

        const lSubscriptionsPerDay = loader(models.projectSubscriptionsPerDay.getRowOptions(subVM.parameters()));
        lSubscriptionsPerDay.load().then(subscriptionsPerDay);

        subscriptionVM.getNewSubscriptions(args.project.common_id, moment().utc().subtract(1, 'weeks').format(), moment().utc().format())
            .then(weekSubscriptions);
        subscriptionVM.getNewSubscriptions(args.project.common_id, moment().utc().subtract(2, 'weeks').format(), moment().utc().subtract(1, 'weeks').format())
            .then(lastWeekSubscriptions);

        subscriptionVM.getSubscriptionTransitions(args.project.common_id, ['inactive', 'canceled'], 'active', moment().utc().subtract(1, 'weeks').format(), moment().utc().format())
            .then(weekTransitions);
        subscriptionVM.getSubscriptionTransitions(args.project.common_id, ['inactive', 'canceled'], 'active', moment().utc().subtract(2, 'weeks').format(), moment().utc().subtract(1, 'weeks').format())
            .then(lastWeekTransitions);
        subscriptionVM.getSubscriptionsPerMonth(args.project.common_id)
            .then((subscriptions) => {
                subscriptionsPerMonth(subscriptions);
                isSubscriptionsPerMonthLoaded(true);
            });

        projectGoalsVM.fetchGoals(filtersVM.project_id());
        const balanceLoader = userVM.getUserBalance(args.project.user_id);

        return {
            weekSubscriptions,
            subscriptionsPerMonth,
            lastWeekSubscriptions,
            weekTransitions,
            lastWeekTransitions,
            projectGoalsVM,
            lVisitorsPerDay,
            lSubscriptionsPerDay,
            subscriptionsPerDay,
            visitorsTotal,
            visitorsPerDay,
            balanceLoader,
            isSubscriptionsPerMonthLoaded
        };
    },
    view: function(ctrl, args) {
        const sumAmount = list => _.reduce(list, (memo, sub) => memo + (sub.amount / 100), 0);
        const weekSum = sumAmount(ctrl.weekSubscriptions());
        const lastWeekSum = sumAmount(ctrl.lastWeekSubscriptions());
        const canceledWeekSum = sumAmount(ctrl.weekTransitions());
        const canceledLastWeekSum = sumAmount(ctrl.lastWeekTransitions());
        const project = args.project,
            subscribersDetails = args.subscribersDetails,
            balanceData = (ctrl.balanceLoader() && !_.isNull(_.first(ctrl.balanceLoader())) ? _.first(ctrl.balanceLoader()) : null);
        const averageRevenue = subscribersDetails.total_subscriptions > 0 ? (subscribersDetails.amount_paid_for_valid_period / subscribersDetails.total_subscriptions) : null;

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
                m('.w-container', [
                    m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                        subscribersDetails && !_.isEmpty(ctrl.projectGoalsVM.goals()) ?
                        m.component(projectGoalsBoxDashboard, {
                            goalDetails: ctrl.projectGoalsVM.goals,
                            amount: subscribersDetails.amount_paid_for_valid_period
                        }) : '',
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
                            ),
                            m('.fontsize-mini.fontcolor-secondary.lineheight-tighter',
                                'O saldo demora até 20 mins após o pagamento para ser atualizado.'
                            )
                        ])
                    ]),
                    (project.state === 'online' && !project.has_cancelation_request ? m('.w-container.u-marginbottom-60', m.component(projectInviteCard, {
                        project
                    })) : ''),

                    m('.u-marginbottom-30', [
                        m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                            m('.flex-column.card.u-radius.u-marginbottom-10', [
                                m('div',
                                    'Receita média por assinante'
                                ),
                                m('.fontsize-smallest.fontcolor-secondary.lineheight-tighter',
                                    `em ${moment().format('DD/MM/YYYY')}`
                                ),
                                m('.fontsize-largest.fontweight-semibold',
                                    `R$${averageRevenue ? `${h.formatNumber(averageRevenue, 2, 3)}` : '--'}`
                                )

                            ]),
                            m(insightsInfoBox, {
                                label: 'Novos Assinantes',
                                info: ctrl.weekSubscriptions().length,
                                newCount: ctrl.weekSubscriptions().length,
                                oldCount: ctrl.lastWeekSubscriptions().length
                            }),
                            m(insightsInfoBox, {
                                label: 'Nova receita',
                                info: `R$${weekSum}`,
                                newCount: weekSum,
                                oldCount: lastWeekSum
                            })
                        ]),
                        m(".fontsize-large.fontweight-semibold.u-marginbottom-10.u-text-center[id='origem']", [
                            window.I18n.t('visitors_per_day_label', I18nScope())
                        ]),
                        m('.u-text-center.fontsize-smaller.fontcolor-secondary.lineheight-tighter.u-marginbottom-20', [
                            window.I18n.t('last_30_days_indication', I18nScope())
                        ])
                    ]), !ctrl.lVisitorsPerDay() ? m.component(projectDataChart, {
                        collection: ctrl.visitorsPerDay,
                        dataKey: 'visitors',
                        limitDataset: 30,
                        xAxis: item => h.momentify(item.day),
                        emptyState: window.I18n.t('visitors_per_day_empty', I18nScope())
                    }) : h.loader(),

                    m('.u-text-center', {
                        style: {
                            'min-height': '300px'
                        }
                    }, [!ctrl.lSubscriptionsPerDay() ? m.component(projectDataChart, {
                        collection: ctrl.subscriptionsPerDay,
                        label: window.I18n.t('amount_per_day_label_sub', I18nScope()),
                        subLabel: window.I18n.t('last_30_days_indication', I18nScope()),
                        dataKey: 'total_amount',
                        xAxis: item => h.momentify(item.paid_at),
                        emptyState: m.trust(window.I18n.t('amount_per_day_empty_sub', I18nScope()))
                    }) : h.loader()]),
                    m('.u-text-center', {
                        style: {
                            'min-height': '300px'
                        }
                    }, [!ctrl.lSubscriptionsPerDay() ? m.component(projectDataChart, {
                        collection: ctrl.subscriptionsPerDay,
                        label: window.I18n.t('contributions_per_day_label_sub', I18nScope()),
                        subLabel: window.I18n.t('last_30_days_indication', I18nScope()),
                        dataKey: 'total',
                        xAxis: item => h.momentify(item.paid_at),
                        emptyState: m.trust(window.I18n.t('contributions_per_day_empty_sub', I18nScope()))
                    }) : h.loader()]),
                    (ctrl.isSubscriptionsPerMonthLoaded() ?
                        m(subscriptionsPerMonthTable, { data: ctrl.subscriptionsPerMonth() }) : h.loader())

                ])
            ])
        ] : h.loader());
    }
};

export default projectInsightsSub;
