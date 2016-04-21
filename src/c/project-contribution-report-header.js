window.c.ProjectContributionReportHeader = ((m, c, _, h) => {
    return {
        view: (cltr, args) => {
            const filterBuilder = args.filterBuilder,
                  paymentStateFilter =  _.findWhere(filterBuilder, {label: 'payment_state'}),
                  rewardFilter = _.findWhere(filterBuilder, {label: 'reward_filter'}),
                  mainFilter = _.findWhere(filterBuilder, {component: 'FilterMain'});
            return m('.w-section.dashboard-header', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6', [
                            m('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]),
                        m('.w-col.w-col-3')
                    ]),
                    m('.w-form', [
                        m('form', {onsubmit: args.submit}, [
                            m('.w-row', [
                                m('.w-col.w-col-6', [
                                    m('.w-row', [
                                        m.component(c[paymentStateFilter.component], paymentStateFilter.data),
                                            m.component(c[rewardFilter.component], rewardFilter.data)
                                    ])
                                ]),
                                m('.w-col.w-col-6.u-margintop-20', [
                                    m('.w-row', [
                                        m('.w-col.w-col-7._w-sub-col', [
                                            m.component(c[mainFilter.component], mainFilter.data)
                                        ]),
                                        m('.w-col.w-col-5.w-clearfix.w-hidden-small.w-hidden-tiny', [
                                            m('a.alt-link.u-right.fontsize-small.lineheight-looser[href="#"]', [
                                                m('span.fa.fa-download', '.'),
                                                ' Baixar relatórios'
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c, window._, window.c.h));
