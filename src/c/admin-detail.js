window.c.AdminDetail = (function(m, _, c){
  return {
    controller: function(){
    },
    view: function(ctrl, args){
      var actions = args.actions,
          item = args.item,
          details = args.details;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30',
          _.map(actions, function(action){
            return m.component(c[action.component], {data: action.data, item: args.item});
          })
        ),
        details.length > 0 ?
          m('.w-row.card.card-terciary.u-radius',
            _.map(details, function(detail){
              return m.component(c[detail.component], {item: item, key: item.key});
            })
          ) : ''
      ]);
    }
  };
}(window.m, window._, window.c));
