window.c.AdminContributionDetail = (function(m, _, c, h){
  return {
    controller: function(args){
      const loadReward = () => {
        const model = c.models.rewardDetail,
              reward_id = args.item.reward_id,
              opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
              l = m.postgrest.loaderWithToken(opts),
              reward = m.prop({});

        if (reward_id) {
          l.load().then(_.compose(reward, _.first));
        }
        return reward;
      };
      const reward = loadReward();
      return {
        reward: reward,
        actions: {
          transfer: {
            property: 'user_id',
            updateKey: 'id',
            callToAction: 'Transferir',
            innerLabel: 'Id do novo apoiador:',
            outerLabel: 'Transferir Apoio',
            placeholder: 'ex: 129908',
            model: c.models.contributionDetail
          },
          reward: {
            getKey: 'project_id',
            updateKey: 'contribution_id',
            selectKey: 'reward_id',
            radios: 'rewards',
            callToAction: 'Alterar Recompensa',
            outerLabel: 'Recompensa',
            getModel: c.models.rewardDetail,
            updateModel: c.models.contributionDetail,
            selectedItem: reward,
            validate: (newRewardValue) => {
              return (args.item.value > newRewardValue) ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
            }
          },
          remove: {
            property: 'state',
            updateKey: 'id',
            callToAction: 'Apagar',
            innerLabel: 'Tem certeza que deseja apagar esse apoio?',
            outerLabel: 'Apagar Apoio',
            forceValue: 'deleted',
            model: c.models.contributionDetail
          }
        },
      };
    },

    view: function(ctrl, args){
      var actions = ctrl.actions,
          item = args.item,
          reward = ctrl.reward;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30',
          [
            m.component(c.AdminInputAction, {data: actions.transfer, item: item}),
            m.component(c.AdminRadioAction, {data: actions.reward, item: reward(), updateKeyValue: item.contribution_id}),
            m.component(c.AdminInputAction, {data: actions.remove, item: item})
          ]
        ),
        m('.w-row.card.card-terciary.u-radius',[
          m.component(c.AdminTransaction, {contribution: item}),
          m.component(c.AdminTransactionHistory, {contribution: item}),
          m.component(c.AdminReward, {reward: reward, key: item.key})
        ])
      ]);
    }
  };
}(window.m, window._, window.c, window.c.h));
