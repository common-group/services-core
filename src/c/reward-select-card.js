import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import projectVM from '../vms/project-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const rewardSelectCard = {
    controller(args) {
        const setInput = (el, isInitialized) => !isInitialized ? el.focus() : null;
        const isSelected = currentReward => _.isEmpty(rewardVM.rewards()) || currentReward.id === rewardVM.selectedReward().id;
        const selectedDestination = m.prop('');
        const queryRewardId = h.getParams('reward_id');
        const queryRewardValue = h.getParams('value');
        if (queryRewardValue) {
            rewardVM.setValue(h.formatNumber(Number(queryRewardValue / 100), 2, 3));
        }

        const submitContribution = (event) => {
            const valueFloat = h.monetaryToFloat(rewardVM.contributionValue);
            const shippingFee = rewardVM.hasShippingOptions(rewardVM.selectedReward()) ? rewardVM.shippingFeeForCurrentReward(selectedDestination) : {
                value: 0
            };

            if (!selectedDestination() && rewardVM.hasShippingOptions(rewardVM.selectedReward())) {
                rewardVM.error('Por favor, selecione uma opção de frete válida.');
            } else if (valueFloat < rewardVM.selectedReward().minimum_value + shippingFee.value) {
                rewardVM.error(`O valor de apoio para essa recompensa deve ser de no mínimo R$${rewardVM.selectedReward().minimum_value} + frete R$${h.formatNumber(shippingFee.value, 2, 3)}`);
            } else {
                rewardVM.error('');
                const valueUrl = window.encodeURIComponent(String(valueFloat).replace('.', ','));
                h.navigateTo(`/projects/${projectVM.currentProject().project_id}/contributions/fallback_create?contribution%5Breward_id%5D=${rewardVM.selectedReward().id}&contribution%5Bvalue%5D=${valueUrl}&contribution%5Bshipping_fee_id%5D=${shippingFee.id}`);
            }

            event.stopPropagation();

            return false;
        };

        const selectDestination = (destination) => {
            selectedDestination(destination);
            const shippingFee = rewardVM.shippingFeeForCurrentReward(selectedDestination) ?
                Number(rewardVM.shippingFeeForCurrentReward(selectedDestination).value) :
                0;
            const rewardMinValue = Number(rewardVM.selectedReward().minimum_value);
            rewardVM.applyMask(`${h.formatNumber(shippingFee + rewardMinValue, 2, 3)}`);
        };

        const normalReward = (reward) => {
            if (_.isEmpty(reward)) {
                return {
                    id: null,
                    description: 'Obrigado. Eu só quero ajudar o projeto.',
                    minimum_value: 10,
                    shipping_options: null,
                    row_order: -999999
                };
            }

            return reward;
        };


        if (args.reward.id === Number(queryRewardId)) {
            rewardVM.selectReward(args.reward).call();
        }

        rewardVM.getStates();

        return {
            normalReward,
            isSelected,
            setInput,
            submitContribution,
            selectDestination,
            selectedDestination,
            locationOptions: rewardVM.locationOptions,
            states: rewardVM.getStates(),
            selectReward: rewardVM.selectReward,
            error: rewardVM.error,
            applyMask: rewardVM.applyMask,
            contributionValue: rewardVM.contributionValue
        };
    },
    view(ctrl, args) {
        const reward = ctrl.normalReward(args.reward);

        return (h.rewardSouldOut(reward) ? m('') : m('span.radio.w-radio.w-clearfix.back-reward-radio-reward', {
            class: ctrl.isSelected(reward) ? 'selected' : '',
            onclick: ctrl.selectReward(reward)
        },
            m(`label[for="contribution_reward_id_${reward.id}"]`, [
                m(`input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id="contribution_reward_id_${reward.id}"][type="radio"][value="${reward.id}"]`, {
                    checked: ctrl.isSelected(reward),
                    name: 'contribution[reward_id]'
                }),
                m(`label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for="contribution_reward_${reward.id}"]`,
                    `R$ ${h.formatNumber(reward.minimum_value)} ou mais`
                ), !ctrl.isSelected(reward) ? '' : m('.w-row.back-reward-money', [
                    rewardVM.hasShippingOptions(reward) ?
                    m('.w-sub-col.w-col.w-col-4', [
                        m('.fontcolor-secondary.u-marginbottom-10',
                            'Local de entrega'
                        ),
                        m('select.positive.text-field.w-select', {
                            onchange: m.withAttr('value', ctrl.selectDestination)
                        },
                            _.map(ctrl.locationOptions(reward, ctrl.selectedDestination),
                                option => m('option', { value: option.value }, [
                                    `${option.name} `,
                                    option.value != '' ? `+R$${h.formatNumber(option.fee, 2, 3)}` : null
                                ])
                            )
                        )
                    ]) : '',
                    m('.w-sub-col.w-col.w-clearfix', {
                        class: rewardVM.hasShippingOptions(reward) ?
                            'w-col-4' : 'w-col-8'
                    }, [
                        m('.fontcolor-secondary.u-marginbottom-10', 'Valor do apoio'),
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                m('.back-reward-input-reward.medium.placeholder',
                                    'R$'
                                )
                            ),
                            m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                m('input.back-reward-input-reward.medium.w-input', {
                                    autocomplete: 'off',
                                    min: reward.minimum_value,
                                    placeholder: reward.minimum_value,
                                    type: 'tel',
                                    config: ctrl.setInput,
                                    onkeyup: m.withAttr('value', ctrl.applyMask),
                                    value: ctrl.contributionValue()
                                })
                            )
                        ]),
                        m('.fontsize-smaller.text-error.u-marginbottom-20.w-hidden', [
                            m('span.fa.fa-exclamation-triangle'),
                            ' O valor do apoio está incorreto'
                        ])
                    ]),
                    m('.submit-form.w-col.w-col-4',
                        m('button.btn.btn-medium.u-margintop-30', {
                            onclick: ctrl.submitContribution
                        }, [
                            'Continuar  ',
                            m('span.fa.fa-chevron-right')
                        ])
                    )
                ]),
                ctrl.error().length > 0 && ctrl.isSelected(reward) ? m('.text-error', [
                    m('br'),
                    m('span.fa.fa-exclamation-triangle'),
                    ` ${ctrl.error()}`
                ]) : '',
                m('.fontsize-smaller.fontweight-semibold',
                    reward.title
                ),
                m('.back-reward-reward-description', [
                    m('.fontsize-smaller.u-marginbottom-10.fontcolor-secondary', reward.description),
                    m('.u-marginbottom-20.w-row', [!reward.deliver_at ? '' : m('.w-col.w-col-6', [
                        m('.fontsize-smallest.fontcolor-secondary', 'Entrega Prevista:'),
                        m('.fontsize-smallest', h.momentify(reward.deliver_at, 'MMM/YYYY'))
                    ]),
                        (!rewardVM.hasShippingOptions(reward) && reward.shipping_options !== 'presential') ? '' : m('.w-col.w-col-6', [
                            m('.fontsize-smallest.fontcolor-secondary', 'Envio:'),
                            m('.fontsize-smallest', I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope()))
                        ])
                    ])
                ])
            ])
                                                  ));
    }
};

export default rewardSelectCard;
