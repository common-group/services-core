adminApp.AdminContributionsListPaymentDetail = {
  view: function(ctrl, args){
    var contribution = args.contribution;
    return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [
      (function() {
        switch (contribution.payment_method.toLowerCase()){
          case "boletobancario":
            return m("span#boleto-detail", "");
          case "cartaodecredito":
            return m("#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight", [
              contribution.card_first_digits+"******"+contribution.card_last_digits,
              m('br'),
              contribution.card_brand+" "+contribution.installments+"x"
            ]);
        }
      })()
    ]);
  }
};
