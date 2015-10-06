window.c.AdminContributionDetail = (function(m, _, c){
  return {
    controller: function(){
      return {
        actions: [
            {
              component: 'AdminInputAction',
              data: {
                property: 'user_id',
                updateKey: 'id',
                callToAction: 'Transferir',
                innerLabel: 'Id do novo apoiador:',
                outerLabel: 'Transferir Apoio',
                placeholder: 'ex: 129908',
                model: c.models.contributionDetail
              }
            },
            {
              component: 'AdminRadioAction',
              data: {
                getKey: 'project_id',
                updateKey: 'contribution_id',
                property: 'reward_id',
                radios: 'rewards',
                callToAction: 'Alterar Recompensa',
                outerLabel: 'Recompensa',
                getModel: c.models.rewardDetail,
                updateModel: c.models.contributionDetail
              }
            },
            {
              component: 'AdminInputAction',
              data: {
                property: 'state',
                updateKey: 'id',
                callToAction: 'Apagar',
                innerLabel: 'Tem certeza que deseja apagar esse apoio?',
                outerLabel: 'Apagar Apoio',
                forceValue: 'deleted',
                model: c.models.contributionDetail
              }
            }
        ]
      };
    },
    view: function(ctrl, args){
      var actions = args.actions,
          item = args.item;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30',
          _.map(ctrl.actions, function(action){
            return m.component(c[action.component], {data: action.data, item: args.item});
          })
        ),
        m('.w-row.card.card-terciary.u-radius',[
          m.component(c.AdminTransaction, {contribution: item}),
          m.component(c.AdminTransactionHistory, {contribution: item}),
          m.component(c.AdminReward, {contribution: item, key: item.key})
        ])
      ]);
    }
  };
}(window.m, window._, window.c));
