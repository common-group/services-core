window.c.AdminItem = (function(m, h, c){
  return {
    controller: function(args){
      var contribution = args.contribution,
          stateClass, paymentMethodClass, displayDetailBox;

      stateClass = function(){
        switch (contribution.state){
          case 'paid':
            return '.text-success';
          case 'refunded':
            return '.text-refunded';
          case 'pending':
          case 'pending_refund':
            return '.text-waiting';
          default:
            return '.text-error';
        }
      };

      paymentMethodClass = function(){
        switch (contribution.payment_method){
          case 'BoletoBancario':
            return '.fa-barcode';
          case 'CartaoDeCredito':
            return '.fa-credit-card';
          default:
            return '.fa-question';
        }
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

      displayDetailBox = c.ToggleDiv.toggler();

      return {
        displayDetailBox: displayDetailBox,
        paymentMethodClass: paymentMethodClass,
        project: project,
        stateClass: stateClass,
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
            m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value),
            m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')),
            m('.fontsize-smallest', ['ID do Gateway: ',
              m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)
            ])
          ]),
          m('.w-col.w-col-2',[
            m('.fontsize-smallest.lineheight-looser.fontweight-semibold',[
              m('span.fa.fa-circle' + ctrl.stateClass()), ' ' + contribution.state
            ]),
            m('.fontsize-smallest.fontweight-semibold',[
              m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', contribution.payment_method)
            ]),
            m.component(c.PaymentBadge, {contribution: contribution, key: contribution.key})
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
