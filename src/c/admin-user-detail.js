window.c.AdminUserDetail = (function(m, _, c){
  return {
    controller: function(){
      return {
        actions: {
          reset: {
            property: 'user_password',
            updateKey: 'password',
            callToAction: 'Redefinir',
            innerLabel: 'Nova senha de Usuário:',
            outerLabel: 'Redefinir senha',
            placeholder: 'ex: 123mud@r',
            model: c.models.userDetail
          }
        }
      };
    },

    view: function(ctrl, args){
      var actions = ctrl.actions,
          item = args.item,
          details = args.details;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30', [
            m.component(c.AdminInputAction, {data: actions.reset, item: item}),
        ]),
      ]);
    }
  };
}(window.m, window._, window.c));
