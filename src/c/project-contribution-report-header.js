import m from 'mithril';
import I18n from 'i18n-js';
import _ from 'underscore';
import h from '../h';
import FilterMain from '../c/filter-main';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_contribution_reports');

const projectContributionReportHeader = {
    view(ctrl, args) {
        const filterBuilder = args.filterBuilder,
            paymentStateFilter = _.findWhere(filterBuilder, {
                label: 'payment_state'
            }),
            rewardFilter = _.findWhere(filterBuilder, {
                label: 'reward_filter'
            }),
            deliveryFilter = _.findWhere(filterBuilder, {
                label: 'delivery_filter'
            }),
            surveyFilter = _.findWhere(filterBuilder, {
                label: 'survey_filter'
            }),
            mainFilter = _.findWhere(filterBuilder, {
                component: FilterMain
            }),
            project_id = args.filterVM.project_id();

        rewardFilter.data.options = args.mapRewardsToOptions();

        return m('div', [
            m('.dashboard-header',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6', [
                                m('.fontsize-larger.fontweight-semibold.lineheight-looser.u-text-center',
                                    I18n.t('title', I18nScope())
                                ),
                                m('.fontsize-base.u-marginbottom-20.u-text-center',
                                    I18n.t('subtitle_html', I18nScope())
                                ),
                                m('.u-marginbottom-60.u-text-center',
                                    m('.w-inline-block.card.fontsize-small.u-radius', [
                                        m('span.fa.fa-lightbulb-o',
                                            ''
                                        ),
                                        m.trust('&nbsp;'),
                                        m.trust(I18n.t('help_link', I18nScope()))
                                    ])
                                )
                            ]),
                            m('.w-col.w-col-3')
                        ])
                    )
                ),
            m('.card',
                    m('.w-container',
                        m('.w-form', [
                            m('form', {
                                onsubmit: args.submit
                            },
                                m('.u-margintop-20.w-row', [
                                    m('.w-col.w-col-8',
                                        m('.w-row', [
                                            m.component(paymentStateFilter.component, paymentStateFilter.data),
                                            m.component(rewardFilter.component, rewardFilter.data),
                                            m.component(deliveryFilter.component, deliveryFilter.data),
                                            m.component(surveyFilter.component, surveyFilter.data)
                                        ])
                                    ),
                                    m('.w-col.w-col-4',
                                        m('.u-margintop-20.w-row', [
                                            m.component(mainFilter.component, mainFilter.data)

                                        ])
                                    )
                                ])
                            )
                        ])
                    )
                )
        ]
        );
    }
};

export default projectContributionReportHeader;
