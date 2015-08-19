window.c.AdminProjectDetailsCard = (function(m, h){
  return {
    view: function(ctrl, args) {
      var project = args.resource,
          remainingTime = h.splitRemaningTime(project.expires_at);

      return m('.card.u-radius.card-terciary.u-marginbottom-20', [
        m('div', [
          m('.fontsize-small.fontweight-semibold.u-marginbottom-20', [
            m('span.fontcolor-secondary', 'Status:'),' ',m('span.text-success', project.state.toUpperCase()),' '
          ]),
          m('.meter.u-marginbottom-10', [
            m('.meter-fill')
          ]),
          m('.w-row', [
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', project.progress.toFixed(2) + '%'),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', [
                'R$ ' + h.formatNumber(project.pledged, 2),
              ]),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTime[1]),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTime[2] + ' restantes')
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c.h));

