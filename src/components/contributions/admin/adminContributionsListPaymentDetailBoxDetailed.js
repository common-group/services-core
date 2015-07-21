adminApp.AdminContributionsListPaymentDetailBoxDetailed = {
  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m(".w-col.w-col-4",[
      m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"),
      m(".fontsize-smallest.lineheight-looser",[
        "Valor: R$" + formatNumber(contribution.value, 2, 3),
        m("br"),
        "Taxa: R$" + formatNumber(contribution.gateway_fee, 2, 3),
        m("br"),"Recompensa: " + formatNumber(contribution.reward_minimum_value, 2, 3),
        m("br"),
        "Anônimo: " + (contribution.anonymous ? 'Sim' : 'Não'),
        m("br"),
        "Id pagamento: " + contribution.gateway_id,
        m("br"),
        "Apoio: " + contribution.contribution_id,
        m("br"),
        "Chave: \n",
        m("br"),
        contribution.key,
        m("br"),
        "Meio: " + contribution.gateway,
        m("br"),
        "Operadora: " + (contribution.gateway_data && contribution.gateway_data.acquirer_name),
        m("br"),
        (function(){
          if(contribution.is_second_slip) {
            return [m("a.link-hidden[href='#']", "Boleto bancário"), " ", m("span.badge", "2a via")];
          }
        })(),
      ])
    ])
  }
}



