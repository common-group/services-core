window.c.AdminDetail = (function(m, _, c){
  return {
    controller: function(){
    },
    view: function(ctrl, args){
      var actions = args.actions,
          contribution = args.item;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30',
          _.map(actions, function(action){
            return m.component(c[action.component], {data: action.data});
          })
        ),
        m('.w-row.card.card-terciary.u-radius',[
          m.component(c.AdminTransaction, {contribution: contribution}),
          m.component(c.AdminTransactionHistory, {contribution: contribution}),
          m.component(c.AdminReward, {contribution: contribution, key: contribution.key})
        ])
      ]);
    }
  };
}(window.m, window._, window.c));
