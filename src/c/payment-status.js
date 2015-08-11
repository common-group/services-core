window.c.PaymentStatus = (function(m){
  return {
    controller: function(args){
      var contribution = args.contribution, card = null,
          displayPaymentMethod, paymentMethodClass, stateClass;

      card = function(){
        if (contribution.gateway_data){
          switch (contribution.gateway.toLowerCase()){
            case 'moip':
              return {
                first_digits:  contribution.gateway_data.cartao_bin,
                last_digits: contribution.gateway_data.cartao_final,
                brand: contribution.gateway_data.cartao_bandeira
              };
            case 'pagarme':
              return {
                first_digits: contribution.gateway_data.card_first_digits,
                last_digits: contribution.gateway_data.card_last_digits,
                brand: contribution.gateway_data.card_brand
              };
          }
        }
      };

      displayPaymentMethod = function(){
        switch (contribution.payment_method.toLowerCase()){
          case 'boletobancario':
            return m('span#boleto-detail', '');
          case 'cartaodecredito':
            var cardData = card();
            if (cardData){
              return m('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [
                cardData.first_digits + '******' + cardData.last_digits,
                m('br'),
                cardData.brand + ' ' + contribution.installments + 'x'
              ]);
            }
            return '';
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

      return {
        displayPaymentMethod: displayPaymentMethod,
        paymentMethodClass: paymentMethodClass,
        stateClass: stateClass
      };
    },

    view: function(ctrl, args){
      var payment = args.payment;
      return m('.w-row', [
        m('.fontsize-smallest.lineheight-looser.fontweight-semibold',[
          m('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state
        ]),
        m('.fontsize-smallest.fontweight-semibold',[
          m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', payment.payment_method)
        ]),
        m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [
          ctrl.displayPaymentMethod()
        ])
      ]);
    }
  };
}(window.m));
