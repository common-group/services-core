import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import h from '../h';
import shippingFeeInput from '../c/shipping-fee-input';
import rewardVM from '../vms/reward-vm';

const editRewardCard = {
    controller(args) {
        const shipping_options = m.prop(args.reward.shipping_options),
            showHelp = h.toggleProp(false, true),
            reward = args.reward,
            otherFeeValue = m.prop(),
            internationalFeeValue = m.prop(),
            minimumValue = m.prop(args.reward.minimum_value || 0),
            description = m.prop(args.reward.description || ''),
            maximumContributions = m.prop(args.reward.maximum_contributions),
            index = args.index,
            states = m.prop([]),
            fees = m.prop(),
            newFees = m.prop([]),
            feesLoader = rewardVM.getFees(args.reward),
            statesLoader = rewardVM.getStates(),
            newFee = {
                value: null,
                destination: null
            };

        let otherFee,
            internationalFee;

        statesLoader.load().then((data) => {
            states(data);
            states().unshift({
                acronym: null,
                name: 'Estado'
            });
        });

        feesLoader.load().then((data) => {
            fees(data);
            otherFee = _.findWhere(fees(), {
                destination: 'others'
            });
            internationalFee = _.findWhere(fees(), {
                destination: 'international'
            });
            otherFeeValue(otherFee ? otherFee.value : null);
            internationalFeeValue(internationalFee ? internationalFee.value : null);
        });

        return {
            showHelp,
            otherFeeValue,
            internationalFeeValue,
            minimumValue,
            description,
            maximumContributions,
            newFee,
            newFees,
            shipping_options,
            states,
            reward,
            index,
            fees
        };
    },
    view(ctrl) {
        const reward = ctrl.reward,
            index = ctrl.index,
            fees = _.filter(ctrl.fees(), fee => fee.destination !== 'others' && fee.destination !== 'international');

        return m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
            m('.w-col.w-col-5.w-sub-col', [
                m('.fontweight-semibold.fontsize-smallest.u-marginbottom-10', [
                    'Editar recompensa',
                    m.trust('&nbsp;'),
                    m("a.link-edit.fa.fa-question-circle[href='javascript:void(0);']", { onclick: () => ctrl.showHelp.toggle() })
                ]),
                (ctrl.showHelp() ?
                m('.fontsize-smallest.fontcolor-secondary.reward-explanation.u-marginbottom-20',
                    'Descreva o valor da recompensa e coloque uma previsão de data de entrega real para os apoiadores. Você também pode limitar uma recompensa e quando o limite é atingido ela aparece como ESGOTADA. Se quiser mudar a ordem que as recompensas aparecem em seu projeto, basta fazer isso arrastando-as para cima ou para baixo.'
                ) : '')
            ]),
            m('.w-col.w-col-7',
                m('.card',
                    m('.w-form', [
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Valor mínimo:'
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
                                            value: ctrl.minimumValue(),
                                            onchange: m.withAttr('value', ctrl.minimumValue)
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
                                                _.map(moment.monthsShort(), (month, monthIndex) => {
                                                    const selectedMonth = reward.deliver_at ? moment(reward.deliver_at).format('MMM') : moment.monthsShort()[moment().month()];
                                                    return m(`option[value='${monthIndex + 1}']${selectedMonth === month ? "[selected='selected']" : ''}`,
                                                        h.capitalize(month)
                                                    );
                                                }
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
                                name: `project[rewards_attributes][${index}][description]`,
                                onchange: m.withAttr('value', ctrl.description)
                            },
                                ctrl.description()

                            ),
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
                                        value: ctrl.maximumContributions(),
                                        onchange: m.withAttr('value', ctrl.maximumContributions)
                                    })
                                ) :
                                '')
                        ]),

                        m('.u-marginbottom-60.w-row', [
                            m('.w-col.w-col-3',
                                m("label.fontsize-smaller[for='field-2']",
                                    'Tipo de entrega'
                                )
                            ),
                            m('.w-col.w-col-9', [
                                m(`select.positive.text-field.w-select[id='project_rewards_attributes_${index}_shipping_options']`, {
                                    name: `project[rewards_attributes][${index}][shipping_options]`,
                                    value: ctrl.shipping_options() || 'free',
                                    onchange: m.withAttr('value', ctrl.shipping_options)
                                }, [
                                    m('option[value=\'international\']',
                                        'Frete Nacional e Internacional'
                                    ),
                                    m('option[value=\'national\']',
                                        'Frete Nacional'
                                    ),
                                    m('option[value=\'free\']',
                                        'Sem frete envolvido'
                                    ),
                                    m('option[value=\'presential\']',
                                        'Retirada presencial'
                                    )
                                ]),

                                ((ctrl.shipping_options() === 'national' || ctrl.shipping_options() === 'international') ?
                                    m('.card.card-terciary', [
                                        (ctrl.shipping_options() === 'international' ? [
                                                // international fee
                                            m('.u-marginbottom-10.w-row', [
                                                m('input[type=\'hidden\']', {
                                                    name: `project[rewards_attributes][${index}][shipping_fees_attributes][0][destination]`,
                                                    value: 'international'
                                                }),
                                                m('.w-col.w-col-6',
                                                        m('label.field-label.fontsize-smallest',
                                                            'Internacional'
                                                        )
                                                    ),
                                                m('.w-col.w-col-1'),
                                                m('.w-col.w-col-4',
                                                        m('.w-row', [
                                                            m('.no-hover.positive.prefix.text-field.w-col.w-col-3',
                                                                m('.fontcolor-secondary.fontsize-mini.u-text-center',
                                                                    'R$'
                                                                )
                                                            ),
                                                            m('.w-col.w-col-9',
                                                                m("input.positive.postfix.text-field.w-input[type='text']", {
                                                                    value: ctrl.internationalFeeValue(),
                                                                    name: `project[rewards_attributes][${index}][shipping_fees_attributes][0][value]`,
                                                                    onchange: m.withAttr('value', ctrl.internationalFeeValue)
                                                                })
                                                            )

                                                        ])
                                                    ),
                                                m('.w-col.w-col-1')
                                            ]), ,
                                            m('.divider.u-marginbottom-10')
                                        ] :
                                            ''),
                                        // other states fee
                                        m('.u-marginbottom-10.w-row', [
                                            m('input[type=\'hidden\']', {
                                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][1][destination]`,
                                                value: 'others'
                                            }),
                                            m('.w-col.w-col-6',
                                                m('label.field-label.fontsize-smallest',
                                                    ((fees.length + ctrl.newFees().length) > 0 ? 'Resto do Brasil' : 'Todos os estados do Brasil')
                                                )
                                            ),
                                            m('.w-col.w-col-1'),
                                            m('.w-col.w-col-4',
                                                m('.w-row', [
                                                    m('.no-hover.positive.prefix.text-field.w-col.w-col-3',
                                                        m('.fontcolor-secondary.fontsize-mini.u-text-center',
                                                            'R$'
                                                        )
                                                    ),
                                                    m('.w-col.w-col-9',
                                                        m("input.positive.postfix.text-field.w-input[type='text']", {
                                                            value: ctrl.otherFeeValue(),
                                                            name: `project[rewards_attributes][${index}][shipping_fees_attributes][1][value]`,
                                                            onchange: m.withAttr('value', ctrl.otherFeeValue)
                                                        })
                                                    )

                                                ])
                                            ),
                                            m('.w-col.w-col-1')
                                        ]),
                                        m('.divider.u-marginbottom-10'),

                                        // state fees
                                        (_.map(fees, (fee, feeIndex) => [m(shippingFeeInput, {
                                            fee,
                                            index,
                                            feeIndex: (feeIndex + 2),
                                            states: ctrl.states
                                        }),

                                            m(`input[type='hidden'][id='project_rewards_shipping_fees_attributes_${feeIndex + 2}_id']`, {
                                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex + 2}][id]`,
                                                value: fee.id
                                            })
                                        ])),
                                        (_.map(ctrl.newFees(), fee => fee)),
                                        m('.u-margintop-20',
                                            m("a.alt-link[href='#']", {
                                                onclick: () => {
                                                    ctrl.newFees().push(
                                                            m(shippingFeeInput, {
                                                                fee: ctrl.newFee,
                                                                index,
                                                                feeIndex: h.getRandomInt(999999999, 9999999999),
                                                                states: ctrl.states
                                                            })
                                                        );
                                                    return false;
                                                }
                                            },
                                                'Adicionar destino'
                                            )
                                        )
                                    ]) : '')
                            ])
                        ]),
                        m('.w-row.u-margintop-30', [
                            (reward.newReward ? '' :
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Fechar']", {
                                    onclick: () => {
                                        reward.edit.toggle();
                                    }
                                })
                            )),
                            m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', [
                                m(`input[id='project_rewards_attributes_${index}__destroy'][type='hidden'][value='false']`, {
                                    name: `project[rewards_attributes][${index}][_destroy]`
                                }),
                                m("a.remove_fields.existing[data-confirm='Tem certeza?'][href='#']",
                                    m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border')
                                )
                            ])
                        ])
                    ])
                )
            )
        ]);
    }
};

export default editRewardCard;
