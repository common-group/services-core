import m from 'mithril';
import rewardVM from '../vms/reward-vm';

const projectRewardCard = {
    controller() {

    },
    view(ctrl, args) {
        return m(`div[class="${h.rewardSouldOut(reward) ? 'card-gone' : `card-reward ${project.open_for_contributions ? 'clickable' : ''}`} card card-secondary u-marginbottom-10"]`, {
            onclick: h.analytics.event({
                cat: 'contribution_create',
                act: 'contribution_reward_click',
                lbl: reward.minimum_value,
                project,
                extraData: {
                    reward_id: reward.id,
                    reward_value: reward.minimum_value
                }
            }, ctrl.selectReward(reward))
        }, [
            reward.minimum_value >= 100 ? m('.tag-circle-installment', [
                m('.fontsize-smallest.fontweight-semibold.lineheight-tightest', '3x'),
                m('.fontsize-mini.lineheight-tightest', 's/ juros')
            ]) : '',
            m('.u-marginbottom-20', [
                m('.fontsize-base.fontweight-semibold', `Para R$ ${h.formatNumber(reward.minimum_value)} ou mais`),
            ]),

            m('.fontsize-smaller.u-margintop-20.reward-description', {
                class: ctrl.isRewardOpened(reward) ? `opened ${ctrl.isRewardDescriptionExtended(reward) ? 'extended' : ''}` : ''
            }, m.trust(h.simpleFormat(h.strip(reward.description)))),
            ctrl.isRewardOpened(reward) ? m('a[href="javascript:void(0);"].alt-link.fontsize-smallest.gray.link-more.u-marginbottom-20', {
                onclick: () => ctrl.descriptionExtended(reward.id)
            }, [
                'mais',
                m('span.fa.fa-angle-down')
            ]) : '',
            m('.u-marginbottom-20.w-row', [
                m('.w-col.w-col-6', !_.isEmpty(reward.deliver_at) ? [
                    m('.fontcolor-secondary.fontsize-smallest',
                        m('span',
                            'Entrega prevista:'
                        )
                    ),
                    m('.fontsize-smallest',
                        h.momentify(reward.deliver_at, 'MMM/YYYY')
                    )
                ] : ''),
                m('.w-col.w-col-6', rewardVM.hasShippingOptions(reward) ? [
                    m('.fontcolor-secondary.fontsize-smallest',
                        m('span',
                            'Envio:'
                        )
                    ),
                    m('.fontsize-smallest',
                        I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
                    )
                ] : '')
            ]),
            reward.maximum_contributions > 0 ? [
                (h.rewardSouldOut(reward) ? m('.u-margintop-10', [
                    m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')
                ]) : m('.u-margintop-10', [
                    m('span.badge.badge-attention.fontsize-smaller', [
                        m('span.fontweight-bold', 'Limitada'),
                        project.open_for_contributions ? ` (${h.rewardRemaning(reward)} de ${reward.maximum_contributions} disponíveis)` : ''
                    ])
                ]))
            ] : '',
            m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')),
            reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [
                m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))
            ]) : '',
            project.open_for_contributions && !h.rewardSouldOut(reward) ? [
                ctrl.isRewardOpened(reward) ? m('.w-form', [
                    m('form.u-margintop-30', {
                        onsubmit: ctrl.submitContribution
                    }, [
                        m('.divider.u-marginbottom-20'),
                        (rewardVM.hasShippingOptions(reward) ? m('div', [
                            m('.fontcolor-secondary.u-marginbottom-10',
                              'Local de entrega'
                             ),
                            m('select.positive.text-field.w-select', {
                                onchange: m.withAttr('value', ctrl.selectedDestination)
                            },
                              _.map(ctrl.locationOptions(reward), option => m(`option[value="${option.value}"]`, option.name))
                             )
                        ]) : ''),
                        m('.fontcolor-secondary.u-marginbottom-10',
                            'Valor do apoio'
                        ),
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                m('.back-reward-input-reward.placeholder',
                                    'R$'
                                )
                            ),
                            m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                m('input.w-input.back-reward-input-reward[type="tel"]', {
                                    config: ctrl.setInput,
                                    onkeyup: m.withAttr('value', ctrl.applyMask),
                                    value: ctrl.contributionValue()
                                })
                            )
                        ]),
                        m('input.w-button.btn.btn-medium[type="submit"][value="Continuar >"]'),
                        ctrl.error().length > 0 ? m('.text-error', [
                            m('br'),
                            m('span.fa.fa-exclamation-triangle'),
                            ` ${ctrl.error()}`
                        ]) : ''
                    ])
                ]) : '',
            ] : ''
        ]);
    }
};
