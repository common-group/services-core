import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import rewardVM from '../vms/reward-vm';

const rewardSelectCard = {
    controller(args) {
        const setInput = (el, isInitialized) => !isInitialized ? el.focus() : null;
        const isSelected = currentReward => currentReward.id === rewardVM.selectedReward().id;
        const hasShippingOptions = reward => !_.isNull(reward.shipping_options) && !reward.shipping_options === 'free';
        const queryRewardId = h.getParams('reward_id');

        let reward = args.reward;

        if (_.isEmpty(reward)) {
            reward = {
                id: '',
                description: 'Obrigado. Eu só quero ajudar o projeto.',
                minimum_value: 10
            };
        }

        if (reward.id === Number(queryRewardId)) {
            rewardVM.selectReward(reward).call();
        }

        return {
            reward,
            isSelected,
            setInput,
            hasShippingOptions,
            selectReward: rewardVM.selectReward,
            erro: rewardVM.error,
            applyMask: rewardVM.applyMask,
            contributionValue: rewardVM.contributionValue
        };
    },
    view(ctrl) {
        const reward = ctrl.reward;

        return m('span.radio.w-radio.w-clearfix.back-reward-radio-reward', {
            class: ctrl.isSelected(reward) ? 'selected' : '',
            onclick: ctrl.selectReward(reward)
        },
            m(`label[for="contribution_reward_id_${reward.id}"]`, [
                m(`input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id="contribution_reward_id_${reward.id}"][type="radio"][value="${reward.id}"]`,
                    { checked: ctrl.isSelected(reward), name: 'contribution[reward_id]' }
                ),
                m(`label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for="contribution_reward_${reward.id}"]`,
                    `R$ ${h.formatNumber(reward.minimum_value)} ou mais`
                ),
                !ctrl.isSelected(reward) ? '' : m('.w-row.back-reward-money', [
                    ctrl.hasShippingOptions(reward) ?
                        m('.w-sub-col.w-col.w-col-4',
                            [
                                m('.fontcolor-secondary.u-marginbottom-10',
                                    'Local de entrega'
                                ),
                                m('select.positive.text-field.w-select',
                                    [
                                        m('option[value="national"]',
                                            'Somente Brasil'
                                        ),
                                        m('option[value="international"]',
                                            'Qualquer Lugar do Mundo'
                                        )
                                    ]
                                )
                            ]
                        ) : '',
                    m('.w-col.w-sub-col-middle.w-clearfix', {
                        class: ctrl.hasShippingOptions(reward)
                                ? 'w-col-8 w-col-small-8 w-col-tiny-8'
                                : 'w-col-4 w-col-small-4 w-col-tiny-4'
                    }, [
                        m('.w-row', [
                            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                m('.back-reward-input-reward.placeholder',
                                    'R$'
                                )
                            ),
                            m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                m('input.user-reward-value.back-reward-input-reward',
                                    {
                                        autocomplete: 'off',
                                        min: reward.minimum_value,
                                        placeholder: reward.minimum_value,
                                        type: 'tel',
                                        config: ctrl.setInput,
                                        onkeyup: m.withAttr('value', ctrl.applyMask),
                                        value: ctrl.contributionValue()
                                    }
                                )
                            )
                        ]),
                        m('.fontsize-smaller.text-error.u-marginbottom-20.w-hidden', [
                            m('span.fa.fa-exclamation-triangle'),
                            ' O valor do apoio está incorreto'
                        ])
                    ]),
                    m('.submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4',
                        m('button.btn.btn-large', { onclick: ctrl.submitContribution }, [
                            'Continuar  ',
                            m('span.fa.fa-chevron-right')
                        ])
                    )
                ]),
                m('.back-reward-reward-description', [
                    m('.fontsize-smaller.u-marginbottom-10', reward.description),
                    !reward.deliver_at ? '' : m('.fontsize-smallest.fontcolor-secondary',
                        `Estimativa de entrega: ${h.momentify(reward.deliver_at, 'MMM/YYYY')}`
                    )
                ])
            ])
        );
    }
};

export default rewardSelectCard;
