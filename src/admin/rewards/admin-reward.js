adminApp.AdminReward = {
  view: function(ctrl, args) {
    var reward = args.contribution.reward || {};

    return m('.w-col.w-col-4',[
      m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'),
      m('.fontsize-smallest.lineheight-looser', (_.isEmpty(reward)) ? 'Apoio sem recompensa.' : [
          'ID: ' + reward.id,
          m('br'),
          'Valor mínimo: R$' + formatNumber(reward.minimum_value, 2, 3),
          m('br'),
          m.trust('Disponíveis: ' + reward.paid_count + reward.waiting_payment_count + ' / ' + ((reward.maximum_contributions) ? reward.maximum_contributions : '&infin;')),
          m('br'),
          'Aguardando confirmação: ' + reward.waiting_payment_count,
          m('br'),
          'Descrição: ' + reward.description
        ]
      )
    ]);
  }
};
