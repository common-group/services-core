window.c.AdminItem = (function(m, h, c){
  return {
    controller: function(args){
      var contribution = args.contribution;

      var payment = {
        state: contribution.state,
        payment_method: contribution.payment_method
      };

      var project = {
        project_img: contribution.project_img,
        permalink: contribution.permalink,
        project_name: contribution.project_name,
        project_state: contribution.project_state,
        project_online_date: contribution.project_online_date,
        project_expires_at: contribution.project_expires_at
      };

      var user = {
        user_profile_img: contribution.user_profile_img,
        user_id: contribution.user_id,
        user_name: contribution.user_name,
        email: contribution.email,
        payer_email: contribution.payer_email
      };

      var displayDetailBox = c.ToggleDiv.toggler();

      return {
        displayDetailBox: displayDetailBox,
        payment: payment,
        project: project,
        user: user
      };
    },

    view: function(ctrl, args) {
      var contribution = args.contribution;

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions',[
        m('.w-row',[
          m('.w-col.w-col-4',[
            m.component(c.AdminUser, {user: ctrl.user})
          ]),
          m('.w-col.w-col-4',[
            m.component(c.AdminProject, {project: ctrl.project})
          ]),
          m('.w-col.w-col-2',[
            m.component(c.AdminContribution, {contribution: contribution})
          ]),
          m('.w-col.w-col-2',[
            m.component(c.PaymentStatus, {payment: ctrl.payment, contribution: contribution, key: contribution.key})
          ])
        ]),
        m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix="show-admin-cont-result"][href="javascript:void(0);"]', {onclick: ctrl.displayDetailBox.toggle}),
        m.component(c.ToggleDiv, {display: ctrl.displayDetailBox, content:
          m.component(c.AdminDetail, {contribution: contribution, key: contribution.key})
        })
      ]);
    }
  };
}(window.m, window.c.h, window.c));
