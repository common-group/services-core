adminApp.AdminItem = {
  controller: function(args){
    var contribution = args.contribution,
        userProfile, stateClass, paymentMethodClass, displayDetailBox;

    userProfile = function(){
      return contribution.user_profile_img || '/assets/catarse_bootstrap/user.jpg';
    };

    stateClass = function(){
      switch (contribution.state){
        case 'paid':
          return '.text-success';
        case 'refunded':
          return '.text-refunded';
        case 'pending':
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

    displayDetailBox = adminApp.ToggleDiv.toggler();

    return {
      userProfile: userProfile,
      stateClass: stateClass,
      paymentMethodClass: paymentMethodClass,
      displayDetailBox: displayDetailBox
    };
  },

  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions',[
      m('.w-row',[
        m('.w-col.w-col-4',[
          m('.w-row',[
            m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
              m('img.user-avatar[src="' + ctrl.userProfile() + '"]')
            ]),
            m('.w-col.w-col-9.w-col-small-9',[
              m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
                m('a.alt-link[target="_blank"][href="/users/' + contribution.user_id + '"]', contribution.user_name)
              ]),
              m('.fontsize-smallest', 'Usuário: ' + contribution.user_id),
              m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + contribution.email),
              m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + contribution.payer_email)
            ])
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
          m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.paid_at, 'DD/MM/YYYY hh:mm[h]')),
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
          m.component(adminApp.PaymentBadge, {contribution: contribution, key: contribution.key})
        ])
      ]),
      m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix="show-admin-cont-result"][href="javascript:void(0);"]', {onclick: ctrl.displayDetailBox.toggle}),
      m.component(adminApp.ToggleDiv, {display: ctrl.displayDetailBox, content:
        m.component(adminApp.AdminDetail, {contribution: contribution, key: contribution.key})
      })
    ]);
  }
};
