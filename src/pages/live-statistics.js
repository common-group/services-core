window.c.pages.LiveStatistics = ((m, models, h, _, JSON) => {
    return {
        controller: (args = {}) => {
            let pageStatistics = m.prop([]),
                notificationData = m.prop({});

            models.statistic.getRow().then(pageStatistics);
            // args.socket is a socket provided by socket.io
            // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
            if (args.socket && _.isFunction(args.socket.on)) {
                args.socket.on('new_paid_contributions', (msg) => {
                    notificationData(JSON.parse(msg.payload));
                    models.statistic.getRow().then(pageStatistics);
                    m.redraw();
                });
            }

            return {
                pageStatistics: pageStatistics,
                notificationData: notificationData
            };
        },
        view: (ctrl) => {
            let data = ctrl.notificationData();

            return m('.w-section.bg-stats.section.min-height-100', [
                m('.w-container.u-text-center', _.map(ctrl.pageStatistics(), (stat) => {
                    return [m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'),
                        m('.fontcolor-negative.u-marginbottom-40', [
                            m('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)),
                            m('.fontsize-large', 'Doados para projetos publicados por aqui')
                        ]),
                        m('.fontcolor-negative.u-marginbottom-60', [
                            m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors),
                            m('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')
                        ])
                    ];
                })), (!_.isEmpty(data) ? m('.w-container', [
                    m('div', [
                        m('.card.u-radius.u-marginbottom-60.medium', [
                            m('.w-row', [
                                m('.w-col.w-col-4', [
                                    m('.w-row', [
                                        m('.w-col.w-col-4.w-col-small-4', [
                                            m('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')
                                        ]),
                                        m('.w-col.w-col-8.w-col-small-8', [
                                            m('.fontsize-large.lineheight-tight', data.user_name)
                                        ])
                                    ])
                                ]),
                                m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [
                                    m('div', 'acabou de apoiar o')
                                ]),
                                m('.w-col.w-col-4', [
                                    m('.w-row', [
                                        m('.w-col.w-col-4.w-col-small-4', [
                                            m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')
                                        ]),
                                        m('.w-col.w-col-8.w-col-small-8', [
                                            m('.fontsize-large.lineheight-tight', data.project_name)
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]) : ''),
                m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [
                    m('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [
                        m('span.fa.fa-github', '.'), ' Open Source com orgulho! '
                    ])
                ]),
            ]);
        }
    };
}(window.m, window.c.models, window.c.h, window._, window.JSON));
