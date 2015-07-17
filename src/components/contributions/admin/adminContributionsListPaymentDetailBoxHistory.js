adminApp.AdminContributionsListPaymentDetailBoxHistory = {
  controller: function(args) {
    var contribution = args.contribution;
    var mapEvents = _.reduce([
      { date: contribution.paid_at, name: 'Apoio confirmado' },
      { date: contribution.pending_refund_at, name: 'Reembolso solicitado' },
      { date: contribution.refunded_at, name: 'Estorno realizado' },
      { date: contribution.created_at, name: 'Apoio criado' },
      { date: contribution.refused_at, name: 'Apoio cancelado' },
    ], function(memo, item){
      if(item.date != null && item.date != undefined) {
        item.originalDate = item.date
        item.date = momentify(item.date, "DD/MM/YYYY, HH:mm");
        return memo.concat(item);
      }

      return memo;
    }, []);

    this.orderedEvents = _.sortBy(mapEvents, 'originalDate');
  },

  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m(".w-col.w-col-4",[
      m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"),
      ctrl.orderedEvents.map(function(cEvent) {
        return m(".w-row.fontsize-smallest.lineheight-looser.date-event",[
          m(".w-col.w-col-6",[
            m(".fontcolor-secondary", cEvent.date)
          ]),
          m(".w-col.w-col-6",[
            m("div", cEvent.name)
          ])
        ]);
      })
    ])
  }
}


