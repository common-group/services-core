window.c.pages.LiveStatistics = ((m, models, h, _) => {
  return {
    controller: () => {
      let pageStatistics = m.prop([]);

      models.statistic.getRowWithToken().then(pageStatistics);

      return {
        pageStatistics: pageStatistics
      };
    },
    view: (ctrl) => {
      return m('.w-section.bg-stats.section.min-height-100', [
        m('.w-container.u-text-center', _.map(ctrl.pageStatistics(), (stat) => {
          return [ m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'),
          m('.fontcolor-negative.u-marginbottom-40', [
            m('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)),
            m('.fontsize-large', "Doados para projetos publicados por aqui")
          ]),
          m('.fontcolor-negative.u-marginbottom-60', [
            m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors),
            m('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')
          ])];
        })),
        m('.w-container', [
          m('div', [
            m('.card.u-radius.u-marginbottom-60.medium', [
              m('.w-row', [
                m('.w-col.w-col-4', [
                  m('.w-row', [
                    m('.w-col.w-col-4.w-col-small-4', [
                      m('img.thumb.u-round[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5409e86a50c3bd3f1b90aec7_user-avatar.jpeg"]')
                    ]),
                    m('.w-col.w-col-8.w-col-small-8', [
                      m('.fontsize-large.lineheight-tight', 'Ricardo Matos dos Santos')
                    ])
                  ])
                ]),
                m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [
                  m('div', 'acabou de apoiar o')
                ]),
                m('.w-col.w-col-4', [
                  m('.w-row', [
                    m('.w-col.w-col-4.w-col-small-4', [
                      m('img.thumb-project.u-radius[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5485dfa838fa8324238733f7_project_thumb_10304019_328175090684874_7563008857993874086_n.png"][width="75"]')
                    ]),
                    m('.w-col.w-col-8.w-col-small-8', [
                      m('.fontsize-large.lineheight-tight', 'Ping point no Lardo do Batata')
                    ])
                  ])
                ])
              ])
            ])
          ])
        ]),
        m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [
          m('span.fa.fa-github', '.'),' Open Source com orgulho! '
        ]),
        m('.u-text-center.fontsize-small', [
          ' ',
          m('span.fa.fa-refresh', '.'),
          ' 11.233 Commits     ',
          m('span.fa.fa-users', '.'),
          ' 43 Contribuidores     ',
          m('span.fa.fa-star', '.'),
          ' 847 Stars'
        ])
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window._));
