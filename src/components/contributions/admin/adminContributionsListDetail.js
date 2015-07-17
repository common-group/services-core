adminApp.AdminContributionsListDetail = {
  controller: function(args){
    this.contribution = args.contribution;
    this.contribution.user_profile_img = this.contribution.user_profile_img || '/assets/catarse_bootstrap/user.jpg';
    this.CSSsuccess = '.text-success';
    this.CSSwaiting = '.text-waiting';
    this.CSSerror   = '.text-error';
    this.paymentDetails = function(){
      this.contribution.gateway = this.contribution.gateway.toLowerCase();
      switch(this.contribution.gateway){
        case 'moip':
          this.contribution.card_first_digits = this.contribution.gateway_data.cartao_bin;
          this.contribution.card_last_digits = this.contribution.gateway_data.cartao_final;
          this.contribution.card_brand = this.contribution.gateway_data.cartao_bandeira;
          this.contribution.installments = this.contribution.gateway_data.parcelas;
        return true;
        case 'pagarme':
          this.contribution.card_first_digits = this.contribution.gateway_data.card_first_digits;
          this.contribution.card_last_digits = this.contribution.gateway_data.card_last_digits;
          this.contribution.card_brand = this.contribution.gateway_data.card_brand;
          this.contribution.installments = this.contribution.gateway_data.installments;
        return true;
        default:
          return false;
      }
    };
    this.stateClass = function(){
      switch(this.contribution.state){
        case 'paid':
          return this.CSSsuccess;
        case 'refunded':
          return this.CSSsuccess;
        case 'pending':
          return this.CSSwaiting;
        default:
          return this.CSSerror;
      }
    };
    this.paymentMethodClass = function(){
      switch(this.contribution.payment_method){
        case 'BoletoBancario':
          return ".fa-barcode";
        case 'CartaoDeCredito':
          return ".fa-credit-card";
        default:
          return ".fa-question";
      }
    };

    this.displayDetailBox = adminApp.ToggleDiv.toggler();
  },

  view: function(ctrl, args) {
    var contribution = ctrl.contribution;
    return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions",[
      m(".w-row",[
        m(".w-col.w-col-4",[
          m(".w-row",[
            m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10",[
              m("img.user-avatar[src='"+contribution.user_profile_img+"']")
            ]),
            m(".w-col.w-col-9.w-col-small-9",[
              m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [
                m("a.alt-link[target='_blank'][href='/users/" + contribution.user_id + "']", contribution.user_name)
              ]),
              m(".fontsize-smallest", "Usuário: "+contribution.user_id),
              m(".fontsize-smallest.fontcolor-secondary", "Catarse: " + contribution.email),
              m(".fontsize-smallest.fontcolor-secondary", "Gateway: " + contribution.payer_email)
            ])
          ])
        ]),
        m(".w-col.w-col-4",[
          m(".w-row",[
            m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10",[
              m("img.thumb-project.u-radius[src="+contribution.project_img+"][width=50]")
            ]),
            m(".w-col.w-col-9.w-col-small-9",[
              m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [
                m("a.alt-link[target='_blank'][href='/" + contribution.permalink + "']", contribution.project_name)
              ]),
              m(".fontsize-smallest.fontweight-semibold", contribution.project_state),
              m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.project_online_date) + " a " +momentify(contribution.project_expires_at))
            ])
          ])
        ]),
        m(".w-col.w-col-2",[
          m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$"+contribution.value),
          m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.paid_at, "DD/MM/YYYY hh:mm[h]")),
          m(".fontsize-smallest", ["ID do Gateway: ", 
            m("a.alt-link[target='_blank'][href='https://dashboard.pagar.me/#/transactions/" + contribution.gateway_id + "']", contribution.gateway_id)
          ])
        ]),
        m(".w-col.w-col-2",[
          m(".fontsize-smallest.lineheight-looser.fontweight-semibold",[
            m("span.fa.fa-circle"+ctrl.stateClass())," "+contribution.state
          ]),
          m(".fontsize-smallest.fontweight-semibold",[
            m("span.fa"+ctrl.paymentMethodClass())," ",m("a.link-hidden[href='#']", contribution.payment_method)
          ]),( ctrl.paymentDetails() ? m.component(adminApp.AdminContributionsListPaymentDetail, {contribution: contribution}) : "")
        ])
      ]),
      m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-admin-cont-result'][href='javascript:void(0);']", { onclick: ctrl.displayDetailBox.toggle }),
      m.component(adminApp.ToggleDiv, { display: ctrl.displayDetailBox, content:
        m.component(adminApp.AdminContributionsListPaymentDetailBox, { contribution: contribution })
      })
    ]);
  }
}
