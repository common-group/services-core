import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const editRewardCard = {
    view(ctrl, args) {
        const reward = args.reward,
            index = args.index;
        return m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
            m('.w-col.w-col-5.w-sub-col', [
                m('.fontweight-semibold.fontsize-smallest.u-marginbottom-10', [
                    'Editar recompensa',
                    m.trust('&nbsp;'),
                    m("a.link-edit.fa.fa-question-circle[href='javascript:void(0);']")
                ]),
                m('.fontsize-smallest.fontcolor-secondary.reward-explanation.w-hidden.u-marginbottom-20',
                    'Descreva o valor da recompensa e coloque uma previsão de data de entrega real para os apoiadores. Você também pode limitar uma recompensa e quando o limite é atingido ela aparece como ESGOTADA. Se quiser mudar a ordem que as recompensas aparecem em seu projeto, basta fazer isso arrastando-as para cima ou para baixo.'
                )
            ]),
            m('.w-col.w-col-7',
                m('.card',
                    m('.w-form', [
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Valor:'
                                )
                            ),
                            m('.w-col.w-col-7', [
                                m('.w-row', [
                                    m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3.text-field.positive.prefix.no-hover',
                                        m('.fontsize-smallest.fontcolor-secondary.u-text-center',
                                            'R$'
                                        )
                                    ),
                                    m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                        m(`input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required='true'][autocomplete='off'][required='required'][type='tel'][id='project_rewards_attributes_${index}_minimum_value']`, {
                                            name: `project[rewards_attributes][${index}][minimum_value]`,
                                            value: reward.minimum_value
                                        })
                                    )
                                ]),
                                m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']",
                                    'Informe um valor mínimo maior ou igual a 10'
                                )
                            ])
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Previsão de entrega:'
                                )
                            ),
                            m('.w-col.w-col-7',
                                m('.w-row',
                                    m('.w-col.w-col-12',
                                        m('.w-row', [
                                            m(`input[id='project_rewards_attributes_${index}_deliver_at_3i'][type='hidden'][value='1']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(3i)]`
                                            }),
                                            m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_2i']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(2i)]`
                                            }, [
                                                _.map(moment.monthsShort(), (month, month_index) =>
                                                    m(`option[value='${month_index + 1}']${moment(reward.deliver_at).format('MMM') === month ? "[selected='selected']" : ''}`,
                                                        h.capitalize(month)
                                                    )
                                                )
                                            ]),
                                            m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_1i']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(1i)]`
                                            }, [
                                                _.map(_.range(moment().year(), moment().year() + 6), year =>
                                                    m(`option[value='${year}']${moment(reward.deliver_at).format('YYYY') === String(year) ? "[selected='selected']" : ''}`,
                                                        year
                                                    )
                                                )
                                            ])
                                        ])
                                    )
                                )
                            )
                        ]),
                        m('.w-row',
                            m('label.fontsize-smaller',
                                'Descrição:'
                            )
                        ),
                        m('.w-row', [
                            m(`textarea.text.required.w-input.text-field.positive.height-medium[aria-required='true'][placeholder='Descreva sua recompensa'][required='required'][id='project_rewards_attributes_${index}_description']`, {
                                name: `project[rewards_attributes][${index}][description]`
                            },
                                reward.description),
                            m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']",
                                'Informe uma descrição para a recompensa'
                            )
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-5',
                                m('.w-checkbox', [
                                    m('.w-checkbox-input',
                                        m('input.limit_reward[type=\'checkbox\'][id=\'limit_reward\']', {
                                            checked: reward.limited(),
                                            onclick: () => {
                                                reward.limited.toggle();
                                            }
                                        })
                                    ),
                                    m('label.w-form-label',
                                        'Limitar recompensa'
                                    )
                                ])
                            ),
                            (reward.limited() ?
                                m('.w-col.w-col-7.reward_maximum_contributions',
                                    m(`input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder='Quantidade disponível'][type='tel'][id='project_rewards_attributes_${index}_maximum_contributions']`, {
                                        name: `project[rewards_attributes][${index}][maximum_contributions]`,
                                        value: reward.maximum_contributions
                                    })
                                ) :
                                '')
                        ]),
                        m('.w-row.u-margintop-30',
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Fechar']", {
                                    onclick: () => {
                                        reward.edit.toggle();
                                    }
                                })
                            )
                        )
                    ])
                )
            )
        ]);
    }
};

export default editRewardCard;
