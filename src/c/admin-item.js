window.c.AdminItem = (function(m, _, h, c){
  return {
    controller: function(args){
      var payment = function(item){
        return {
          gateway: item.gateway,
          gateway_data: item.gateway_data,
          installments: item.installments,
          state: item.state,
          payment_method: item.payment_method
        };
      };

      var project = function(item){
        return {
          project_img: item.project_img,
          permalink: item.permalink,
          project_name: item.project_name,
          project_state: item.project_state,
          project_online_date: item.project_online_date,
          project_expires_at: item.project_expires_at
        };
      };

      var user = function(item){
        return {
          user_profile_img: item.user_profile_img,
          user_id: item.user_id,
          user_name: item.user_name,
          email: item.email,
          payer_email: item.payer_email
        };
      };

      var displayDetailBox = h.toggleProp(false, true);

      return {
        displayDetailBox: displayDetailBox,
        payment: payment,
        project: project,
        user: user
      };
    },

    view: function(ctrl, args) {
      var item = args.item;
      var itemBuilder = function(data){
        var itemDescriber =  {
          'user': m.component(c.AdminUser, {user: ctrl.user(item)}),
          'project': m.component(c.AdminProject, {project: ctrl.project(item)}),
          'contribution': m.component(c.AdminContribution, {contribution: item}),
          'payment': m.component(c.PaymentStatus, {payment: ctrl.payment(item), key: item.key})
        };
        return m(data.wrapperClass, [itemDescriber[data.type]]);
      };

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items',[
        m('.w-row',[
          _.map(args.describer, function(component){
            return itemBuilder(component);
          })
        ]),
        m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {onclick: ctrl.displayDetailBox.toggle}),
        ctrl.displayDetailBox() ? m.component(c.AdminDetail, {item: item, key: item.key}) : ''
      ]);
    }
  };
}(window.m, window._, window.c.h, window.c));
