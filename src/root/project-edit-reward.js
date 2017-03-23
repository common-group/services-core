import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import editRewardCard from '../c/edit-reward-card';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const projectEditReward = {
    controller(args) {
        const rewards = m.prop([]),
            newRewards = m.prop([]),
            availableCount = reward => reward.maximum_contributions - reward.paid_count,
            newReward = {
                minimum_value: null,
                deliver_at: null,
                description: null,
                limited: h.toggleProp(false, true),
                maximum_contributions: null,
                newReward: true
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
        });
        return {
            rewards,
            availableCount,
            newRewards,
            newReward
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

                                    m(".ui-sortable[id='rewards']", [
                                        _.map(ctrl.rewards(), (reward, index) => m('div', [m('.nested-fields.ui-sortable-handle',
                                                m('.reward-card', [
                                                    (!reward.edit() ?
                                                        m(`.w-row.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable[data-update_url='/pt/projects/${args.project_id}/rewards/${reward.id}/sort']`, [
                                                            m('.w-sub-col.w-col.w-col-5', [
                                                                m('span.fontcolor-secondary.fontsize-smallest',
                                                                    'Link para apoio direto'
                                                                ),
                                                                m('.u-marginbottom-20.w-row',
                                                                    m('.w-col.w-col-12',
                                                                        m('.mithril-copy-link',
                                                                            m('.clipboard.w-row', [
                                                                                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                                                                                    m('textarea.copy-textarea.text-field.w-input', {
                                                                                        style: {
                                                                                            'margin-bottom': '0'
                                                                                        }
                                                                                    },
                                                                                        `https://www.catarse.me/pt/projects/${args.project_id}/contributions/new?reward_id=${reward.id}`
                                                                                    )
                                                                                ),
                                                                                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                                                                                    m('button.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-clipboard.w-button')
                                                                                )
                                                                            ])
                                                                        )
                                                                    )
                                                                ),
                                                                m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                                                                    'O link acima leva para a página de contribuição com essa recompensa já selecionada.'
                                                                )
                                                            ]),
                                                            m('.w-col.w-col-7',
                                                                m('.card', [
                                                                    m('.w-row', [
                                                                        m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                                                                            m('.fontsize-base.fontweight-semibold',
                                                                                `Para R$ ${reward.minimum_value} ou mais`
                                                                            )
                                                                        ),
                                                                        (rewardVM.canEdit(reward, args.project_state) ?
                                                                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                                                                            m("a.show_reward_form[href='javascript:void(0);']", {
                                                                                onclick: () => {
                                                                                    reward.edit.toggle();
                                                                                }
                                                                            },
                                                                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-edit.btn-no-border')
                                                                            )
                                                                        ) : '')
                                                                    ]),
                                                                    m('.fontsize-smaller.u-marginbottom-20.fontweight-semibold',
                                                                        `${reward.paid_count} apoiadores`
                                                                    ),
                                                                    reward.description,
                                                                    m('p'),


                                                                    (reward.limited() ? (ctrl.availableCount(reward) <= 0) ?
                                                                        m('.u-margintop-10',
                                                                            m('span.badge.badge-gone.fontsize-smaller',
                                                                                'Esgotada'
                                                                            )
                                                                        ) :
                                                                        m('.u-margintop-10',
                                                                            m('span.badge.badge-attention.fontsize-smaller', [
                                                                                m('span.fontweight-bold',
                                                                                    'Limitada '
                                                                                ),
                                                                                ` (${ctrl.availableCount(reward)} de ${reward.maximum_contributions} disponíveis)`
                                                                            ])
                                                                        ) : ''),


                                                                    (reward.deliver_at ? m('.fontsize-smallest', [m('b', 'Estimativa de entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : ''),
                                                                    m('.fontsize-smallest', m('b', 'Forma de envio: '), I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope()))

                                                                ])
                                                            )
                                                        ]) : ''),
                                                    (reward.edit() ?
                                                        m(editRewardCard, {
                                                            reward,
                                                            index
                                                        }) : '')
                                                ])
                                            ),
                                            m(`input.ui-sortable-handle[id='project_rewards_attributes_${index}_id'][type='hidden']`, {
                                                name: `project[rewards_attributes][${index}][id]`,
                                                value: reward.id
                                            })
                                        ]))
                                    ]),
                                    (_.map(ctrl.newRewards(), reward => reward)),
                                    m("a.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields[href='#']", {
                                        onclick: () => ctrl.newRewards().push(
                                                m(editRewardCard, {
                                                    reward: ctrl.newReward,
                                                    index: h.getRandomInt(999999999, 9999999999)
                                                })
                                            )
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
