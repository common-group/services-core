window.c.AdminReward = (function(m, c, h, _){
  return {
    controller: (args) => {
      const model = c.models.rewardDetail,
            reward_id = args.contribution.reward_id,
            opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
            l = m.postgrest.loaderWithToken(opts),
            reward = m.prop();

      if (reward_id){
        l.load().then(_.compose(reward, _.first));
      }

      return {
        loader: l,
        reward: reward
      };
    },
    view: (ctrl, args) => {
      const reward_id = args.contribution.reward_id,
            reward = ctrl.reward() || {},
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

      return m('.w-col.w-col-4',[
        m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'),
        ctrl.loader() ? h.loader() :
          (m('.fontsize-smallest.lineheight-looser', reward_id ? [
            'ID: ' + reward.id,
            m('br'),
            'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3),
            m('br'),
            m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')),
            m('br'),
            'Aguardando confirmação: ' + reward.waiting_payment_count,
            m('br'),
            'Descrição: ' + reward.description
          ] : 'Apoio sem recompensa'
        ))
      ]);
    }
  };
}(window.m, window.c, window.c.h, window._));
