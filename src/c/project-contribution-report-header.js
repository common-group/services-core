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
            mainFilter = _.findWhere(filterBuilder, {
                component: FilterMain
            }),
            project_id = args.filterVM.project_id();

        rewardFilter.data.options = args.mapRewardsToOptions();

        return m('.w-section.dashboard-header',
            m('.w-container', [
                m('.w-container',
                    m('.w-row',
                        m('.w-col.w-col-8.w-col-push-2.u-marginbottom-30.u-text-center', [
                            m('.fontweight-semibold.fontsize-larger.lineheight-looser',
                                I18n.t('title', I18nScope())
                            ),
                            m('.fontsize-base',
                                I18n.t('subtitle_html', I18nScope())
                            )
                        ])
                    )
                ),
                m('.w-form', [
                    m('form', {
                        onsubmit: args.submit
                    },
                        m('.w-row', [
                            m('.w-col.w-col-8',
                                m('.w-row', [
                                    m.component(paymentStateFilter.component, paymentStateFilter.data),
                                    m.component(rewardFilter.component, rewardFilter.data),
                                    m.component(deliveryFilter.component, deliveryFilter.data)
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
            ])
        );
    }
};

export default projectContributionReportHeader;
