import m from 'mithril';
import _ from 'underscore';
import h from 'h';
import models from 'models';
import adminInputAction from 'admin-input-action';
import adminRadioAction from 'admin-radio-action';
import adminExternalAction from 'admin-external-action';
import adminInputAction from 'admin-input-action';
import adminTransaction from 'admin-transaction';
import adminTransactionHistory from 'admin-transaction-history';
import adminReward from 'admin-reward';

const adminContributionDetail = {
    controller (args) {
        let l;
        const loadReward = () => {
            const model = models.rewardDetail,
                reward_id = args.item.reward_id,
                opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
                reward = m.prop({});

            l = postgrest.loaderWithToken(opts);

            if (reward_id) {
                l.load().then(_.compose(reward, _.first));
            }

            return reward;
        };

        return {
            reward: loadReward(),
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
                    model: models.contributionDetail
                },
                reward: {
                    getKey: 'project_id',
                    updateKey: 'contribution_id',
                    selectKey: 'reward_id',
                    radios: 'rewards',
                    callToAction: 'Alterar Recompensa',
                    outerLabel: 'Recompensa',
                    getModel: models.rewardDetail,
                    updateModel: models.contributionDetail,
                    selectedItem: loadReward(),
                    validate (rewards, newRewardID) {
                        let reward = _.findWhere(rewards, {id: newRewardID});
                        return (args.item.value >= reward.minimum_value) ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
                    }
                },
                refund: {
                    updateKey: 'id',
                    callToAction: 'Reembolso direto',
                    innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                    outerLabel: 'Reembolsar Apoio',
                    model: models.contributionDetail
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
                    model: models.contributionDetail
                }
            },
            l: l
        };
    },
    view (ctrl, args) {
        let actions = ctrl.actions,
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
                m.component(adminInputAction, {
                    data: actions.transfer,
                    item: item
                }),
                (ctrl.l()) ? h.loader :
                m.component(adminRadioAction, {
                    data: actions.reward,
                    item: reward,
                    getKeyValue: item.project_id,
                    updateKeyValue: item.contribution_id
                }),
                m.component(adminExternalAction, {
                    data: addOptions(actions.refund, item.id),
                    item: item
                }),
                m.component(adminInputAction, {
                    data: actions.remove,
                    item: item
                })
            ]),
            m('.w-row.card.card-terciary.u-radius', [
                m.component(adminTransaction, {
                    contribution: item
                }),
                m.component(adminTransactionHistory, {
                    contribution: item
                }),
                (ctrl.l()) ? h.loader :
                m.component(adminReward, {
                    reward: reward,
                    key: item.key
                })
            ])
        ]);
    }
};

export default adminContributionDetail;
