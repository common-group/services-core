adminApp.AdminContributionsListPaymentDetail = {
  view: function(ctrl, args){
    var ctrb = args.ctrb;
    return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [
      (function() {
        switch (ctrb.payment_method){
          case "BoletoBancario":
            return m("span.badge", "2a via");
          case "CartaoDeCredito":
            return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [
              ctrb.cartao_inicio+"******"+ctrb.cartao_final,
              m('br'),
              ctrb.cartao_bandeira+" "+ctrb.cartao_parcelas+"x"
            ]);
        }
      })()
    ]);
  }
};
