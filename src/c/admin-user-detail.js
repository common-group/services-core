window.c.AdminUserDetail = (function(m, _, c){
  return {
    controller: function(){
    },
    view: function(ctrl, args){
      var actions = args.actions,
          item = args.item,
          details = args.details;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30', []), /* actions go here */
      ]);
    }
  };
}(window.m, window._, window.c));
