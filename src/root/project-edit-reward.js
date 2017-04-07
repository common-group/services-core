import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import userVM from '../vms/user-vm';
import editRewardCard from '../c/edit-reward-card';
import dashboardRewardCard from '../c/dashboard-reward-card';

const projectEditReward = {
    controller(args) {
        const rewards = m.prop([]),
            availableCount = reward => reward.maximum_contributions - reward.paid_count,
            newReward = {
                id: null,
                minimum_value: null,
                deliver_at: null,
                description: null,
                paid_count: 0,
                edit: m.prop(true),
                limited: h.toggleProp(false, true),
                maximum_contributions: null,
                newReward: true,
                row_order: 999999999 + (rewards().length * 20)// we need large and spaced apart numbers
            };

        const updateRewardSortPosition = (rewardId, position) => m.request({
            method: 'POST',
            url: `/pt/projects/${args.project_id}/rewards/${rewardId}/sort?reward[row_order_position]=${position}`,
            config: (xhr) => {
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
            },
        });

        const setSorting = (el, isInit) => {
            if (!isInit && window.$) {
                window.$(el).sortable({
                    update: (event, ui) => {
                        const rewardId = ui.item[0].id;
                        updateRewardSortPosition(rewardId, ui.item.index());
                    }
                });
            }
        };

        rewardVM.fetchRewards(args.project_id).then(() => {
            _.map(rewardVM.rewards(), (reward) => {
                const limited = reward.maximum_contributions !== null;
                _.extend(reward, {
                    edit: h.toggleProp(false, true),
                    limited: h.toggleProp(limited, !limited)
                });
                rewards().push(reward);
            });

            if (rewardVM.rewards().length === 0) {
                rewards().push(newReward);
            }
        });
        return {
            rewards,
            user: userVM.fetchUser(args.user_id),
            availableCount,
            newReward,
            setSorting
        };
    },

    view(ctrl, args) {
        return m("[id='dashboard-rewards-tab']",
            m('.w-section.section',
                m('.w-container',
                    m('.w-row',
                        m('.w-col.w-col-10.w-col-push-1',
                            m(`form.simple_form.project-form.w-form[action='/pt/projects/${args.project_id}'][method='post'][novalidate='novalidate'][id='edit_project_${args.project_id}']`, [
                                m("input[name='utf8'][type='hidden'][value='✓']"),
                                m("input[name='_method'][type='hidden'][value='patch']"),
                                m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                                m(`input[id='project_id'][name='project_id'][type='hidden'][value='${args.project_id}']`),
                                m("input[id='anchor'][name='anchor'][type='hidden'][value='reward']"),
                                m("[id='dashboard-rewards']", [

                                    ctrl.rewards().length === 0 ? '' : m(".ui-sortable[id='rewards']", {
                                        config: ctrl.setSorting
                                    }, [
                                        _.map(_.sortBy(ctrl.rewards(), reward => Number(reward.row_order)), (reward, index) => m(`div[id=${reward.id}]`, [m('.nested-fields',
                                                m('.reward-card', [
                                                    (!reward.edit() ?
                                                        m(dashboardRewardCard, {
                                                            reward,
                                                            user: ctrl.user(),
                                                            project_id: args.project_id,
                                                            project_state: args.project_state,
                                                        }) :
                                                        m(editRewardCard, {
                                                            reward,
                                                            index
                                                        }))
                                                ])
                                            ),
                                            m(`input.ui-sortable-handle[id='project_rewards_attributes_${index}_id'][type='hidden']`, {
                                                name: `project[rewards_attributes][${index}][id]`,
                                                value: reward.id
                                            })
                                        ]))
                                    ]),

                                    (rewardVM.canAdd(args.project_state) ? [
                                        m("a.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields[href='#']", {
                                            onclick: () => ctrl.rewards().push(ctrl.newReward)
                                        },
                                            '+ Adicionar recompensa'
                                        ),
                                        m('.w-section.save-draft-btn-section',
                                            m('.w-container',
                                                m('.w-row',
                                                    m('.w-col.w-col-4.w-col-push-4',
                                                        m("input.btn.btn.btn-medium[name='commit'][type='submit'][value='Salvar']")
                                                    )
                                                )
                                            )
                                        )
                                    ] : '')
                                ])
                            ])
                        )
                    )
                )
            )
        );
    }
};

export default projectEditReward;
