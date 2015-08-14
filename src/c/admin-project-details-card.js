window.c.AdminProjectDetailsCard = (function(m){
  return {
    view: function() {
      return m('.card.u-radius.card-terciary.u-marginbottom-20', [
          m('.fontsize-small.fontweight-semibold.u-marginbottom-20', [
            m('span.fontcolor-secondary', 'Status:'),' ',m('span.text-success', 'NO AR'),' '
          ]),
          m('.meter.u-marginbottom-10', [
            m('.meter-fill')
          ]),
          m('.w-row', [
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', '54%'),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', [
                'R$514.000',
                m('span.fontsize-smaller', ',00')
              ]),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', '1222'),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')
            ]),
            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
              m('.fontweight-semibold.fontsize-large.lineheight-tight', '25'),
              m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'dias restantes')
            ])
          ])
        ]);
    }
  };
}(window.m));

