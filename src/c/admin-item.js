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

      displayDetailBox = c.ToggleDiv.toggler();

      return {
        stateClass: stateClass,
        paymentMethodClass: paymentMethodClass,
        displayDetailBox: displayDetailBox
      };
    },

    view: function(ctrl, args) {
      var contribution = args.contribution;
      var user = {
        user_profile_img: contribution.user_profile_img,
        user_id: contribution.user_id,
        user_name: contribution.user_name,
        email: contribution.email,
        payer_email: contribution.payer_email
      };

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions',[
        m('.w-row',[
          m('.w-col.w-col-4',[
            m('.w-row',[
              m.component(c.UserAdminProfile, {user: user})
            ])
          ]),
          m('.w-col.w-col-4',[
            m('.w-row',[
              m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
                m('img.thumb-project.u-radius[src=' + contribution.project_img + '][width=50]')
              ]),
              m('.w-col.w-col-9.w-col-small-9',[
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
                  m('a.alt-link[target="_blank"][href="/' + contribution.permalink + '"]', contribution.project_name)
                ]),
                m('.fontsize-smallest.fontweight-semibold', contribution.project_state),
                m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.project_online_date) + ' a ' + h.momentify(contribution.project_expires_at))
              ])
            ])
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
