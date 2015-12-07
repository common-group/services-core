window.c.AdminContributionDetail = (function(m, _, c, h) {
    return {
        controller: function(args) {
            let l;
            const loadReward = () => {
                const model = c.models.rewardDetail,
                    reward_id = args.item.reward_id,
                    opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
                    reward = m.prop({});
                l = m.postgrest.loaderWithToken(opts);
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
                        successMessage: 'Apoio transferido com sucesso!',
                        errorMessage: 'O apoio não foi transferido!',
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
                        validate: (rewards, newRewardID) => {
                            let reward = _.findWhere(rewards, {id: newRewardID});
                            return (args.item.value >= reward.minimum_value) ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
                        }
                    },
                    refund: {
                        updateKey: 'id',
                        callToAction: 'Reembolso direto',
                        innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                        outerLabel: 'Reembolsar Apoio',
                        model: c.models.contributionDetail
                    },
                    remove: {
                        property: 'state',
                        updateKey: 'id',
                        callToAction: 'Apagar',
                        innerLabel: 'Tem certeza que deseja apagar esse apoio?',
                        outerLabel: 'Apagar Apoio',
                        forceValue: 'deleted',
                        successMessage: 'Apoio removido com sucesso!',
                        errorMessage: 'O apoio não foi removido!',
                        model: c.models.contributionDetail
                    }
                },
                l: l
            };
        },

        view: function(ctrl, args) {
            var actions = ctrl.actions,
                item = args.item,
                reward = ctrl.reward;

            const addOptions = (builder, id) => {
                return _.extend({}, builder, {
                    requestOptions: {
                        url: (`/admin/contributions/${id}/gateway_refund`),
                        method: 'PUT'
                    }
                });
            };

            return m('#admin-contribution-detail-box', [
                m('.divider.u-margintop-20.u-marginbottom-20'),
                m('.w-row.u-marginbottom-30', [
                    m.component(c.AdminInputAction, {
                        data: actions.transfer,
                        item: item
                    }),
                    (ctrl.l()) ? h.loader :
                    m.component(c.AdminRadioAction, {
                        data: actions.reward,
                        item: reward,
                        getKeyValue: item.project_id,
                        updateKeyValue: item.contribution_id
                    }),
                    m.component(c.AdminExternalAction, {
                        data: addOptions(actions.refund, item.id),
                        item: item
                    }),
                    m.component(c.AdminInputAction, {
                        data: actions.remove,
                        item: item
                    })
                ]),
                m('.w-row.card.card-terciary.u-radius', [
                    m.component(c.AdminTransaction, {
                        contribution: item
                    }),
                    m.component(c.AdminTransactionHistory, {
                        contribution: item
                    }),
                    (ctrl.l()) ? h.loader :
                    m.component(c.AdminReward, {
                        reward: reward,
                        key: item.key
                    })
                ])
            ]);
        }
    };
}(window.m, window._, window.c, window.c.h));
