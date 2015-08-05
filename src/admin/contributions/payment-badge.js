window.c.adminApp.PaymentBadge = (function(m){
  return {
    controller: function(args){
      var contribution = args.contribution, card = null;
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
      return {
        displayPaymentMethod: function(){
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
        }
      };
    },

    view: function(ctrl){
      return m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [
        ctrl.displayPaymentMethod()
      ]);
    }
  };
}(window.m));
