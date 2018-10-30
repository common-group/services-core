import m from 'mithril';
import prop from 'mithril/stream';
import moment from 'moment';
import _ from 'underscore';
import h from '../h';
import shippingFeeInput from '../c/shipping-fee-input';
import rewardVM from '../vms/reward-vm';
import projectVM from '../vms/project-vm';

const editRewardCard = {
    oninit: function(vnode) {
        const project = projectVM.getCurrentProject(),
            reward = vnode.attrs.reward(),
            minimumValue = projectVM.isSubscription(project) ? 5 : 10,
            destroyed = prop(false),
            acceptNumeric = (e) => {
                reward.minimum_value(e.target.value.replace(/[^0-9]/g, ''));
                return true;
            },
            confirmDelete = () => {
                const r = confirm('Você tem certeza?');
                if (r) {
                    if (reward.newReward) {
                        destroyed(true);
                        return false;
                    }
                    return m.request({
                        method: 'DELETE',
                        url: `/projects/${vnode.attrs.project_id}/rewards/${reward.id()}`,
                        config: h.setCsrfToken
                    }).then(() => {
                        destroyed(true);
                        m.redraw();
                    });
                }
                return false;
            },
            descriptionError = prop(false),
            minimumValueError = prop(false),
            deliverAtError = prop(false),
            states = prop([]),
            fees = prop([]),
            statesLoader = rewardVM.statesLoader,
            validate = () => {
                vnode.attrs.error(false);
                vnode.attrs.errors('Erro ao salvar informações. Confira os dados informados.');
                descriptionError(false);
                minimumValueError(false);
                deliverAtError(false);
                if (reward.newReward && moment(reward.deliver_at()).isBefore(moment().date(-1))) {
                    vnode.attrs.error(true);
                    deliverAtError(true);
                }
                if (_.isEmpty(reward.description())) {
                    vnode.attrs.error(true);
                    descriptionError(true);
                }
                if (!reward.minimum_value() || parseInt(reward.minimum_value()) < minimumValue) {
                    vnode.attrs.error(true);
                    minimumValueError(true);
                }
                _.map(fees(), (fee) => {
                    _.extend(fee, {
                        error: false
                    });
                    if (fee.destination() === null) {
                        vnode.attrs.error(true);
                        _.extend(fee, {
                            error: true
                        });
                    }
                });
            },
            saveReward = () => {
                validate();
                if (vnode.attrs.error()) {
                    return false;
                }
                const data = {
                    title: reward.title(),
                    project_id: vnode.attrs.project_id,
                    shipping_options: reward.shipping_options(),
                    minimum_value: reward.minimum_value(),
                    description: reward.description(),
                    deliver_at: reward.deliver_at()
                };
                if (reward.shipping_options() === 'national' || reward.shipping_options() === 'international') {
                    const shippingFees = _.map(fees(), fee => ({
                        _destroy: fee.deleted(),
                        id: fee.id(),
                        value: fee.value(),
                        destination: fee.destination()
                    }));
                    _.extend(data, {
                        shipping_fees_attributes: shippingFees
                    });
                }
                if (reward.newReward) {
                    rewardVM.createReward(vnode.attrs.project_id, data).then((r) => {
                        vnode.attrs.showSuccess(true);
                        reward.newReward = false;
                        // save id so we can update without reloading the page
                        reward.id(r.reward_id);
                        reward.edit.toggle();
                    });
                } else {
                    rewardVM.updateReward(vnode.attrs.project_id, reward.id(), data).then(() => {
                        vnode.attrs.showSuccess(true);
                        reward.edit.toggle();
                    });
                }
                return false;
            },
            updateOptions = () => {
                const destinations = _.map(fees(), fee => fee.destination());
                if (((reward.shipping_options() === 'national' || reward.shipping_options() === 'international') && !_.contains(destinations, 'others'))) {
                    fees().push({
                        id: prop(null),
                        value: prop(0),
                        destination: prop('others')
                    });
                }
                if (reward.shipping_options() === 'national') {
                    fees(_.reject(fees(), fee => fee.destination() === 'international'));
                } else if (reward.shipping_options() === 'international' && !_.contains(destinations, 'international')) {
                    fees().push({
                        id: prop(null),
                        value: prop(0),
                        destination: prop('international')
                    });
                }
            };

        statesLoader.load().then((data) => {
            states(data);
            states().unshift({
                acronym: null,
                name: 'Estado'
            });

            if (!reward.newReward) {
                rewardVM.getFees({
                    id: reward.id()
                }).then((feeData) => {
                    _.map(feeData, (fee) => {
                        const feeProp = {
                            id: prop(fee.id),
                            value: prop(fee.value),
                            destination: prop(fee.destination)
                        };
                        fees().unshift(feeProp);
                    });
                    updateOptions();
                });
            }
        });

        return {
            minimumValueError,
            minimumValue,
            deliverAtError,
            descriptionError,
            confirmDelete,
            acceptNumeric,
            updateOptions,
            saveReward,
            destroyed,
            states,
            project,
            reward,
            fees
        };
    },
    view: function({state, attrs}) {
        const newFee = {
                id: prop(null),
                value: prop(null),
                destination: prop(null)
            },
            fees = ctrl.fees(),
            reward = args.reward(),
            inlineError = message => m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle',
                m('span',
                    message
                )
            );

        return ctrl.destroyed() ? m('div', '') : m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
            m('.card',
                m('.w-form', [
                    m('.w-row', [
                        m('.w-col.w-col-5',
                            m('label.fontsize-smaller',
                                'Título:'
                            )
                        ),
                        m('.w-col.w-col-7',
                            m('input.w-input.text-field.positive[aria-required=\'true\'][autocomplete=\'off\'][type=\'tel\']', {
                                value: ctrl.reward.title(),
                                oninput: m.withAttr('value', ctrl.reward.title)
                            })
                        )
                    ]),
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
                                    m('input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required=\'true\'][autocomplete=\'off\'][required=\'required\'][type=\'tel\']', {

                                        class: ctrl.minimumValueError() ? 'error' : false,
                                        value: ctrl.reward.minimum_value(),
                                        oninput: e => ctrl.acceptNumeric(e)
                                    })
                                )
                            ]),
                            ctrl.minimumValueError() ? inlineError(`Valor deve ser igual ou superior a R$${ctrl.minimumValue}.`) : '',

                            m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']",
                                'Informe um valor mínimo maior ou igual a 10'
                            )
                        ])
                    ]),
                    ctrl.project.mode === 'sub' ? null : m('.w-row', [
                        m('.w-col.w-col-5',
                            m('label.fontsize-smaller',
                                'Previsão de entrega:'
                            )
                        ),
                        m('.w-col.w-col-7',
                            m('.w-row',
                                m('.w-col.w-col-12',
                                    m('.w-row', [
                                        m('input[type=\'hidden\'][value=\'1\']'),
                                        m('select.date.required.w-input.text-field.w-col-6.positive[aria-required=\'true\'][discard_day=\'true\'][required=\'required\'][use_short_month=\'true\']', {
                                            class: ctrl.deliverAtError() ? 'error' : false,
                                            onchange: (e) => {
                                                ctrl.reward.deliver_at(moment(ctrl.reward.deliver_at()).month(parseInt(e.target.value) - 1).format());
                                            }
                                        }, [
                                            _.map(moment.monthsShort(), (month, monthIndex) => m('option', {
                                                value: monthIndex + 1,
                                                selected: moment(ctrl.reward.deliver_at()).format('M') == monthIndex + 1
                                            },
                                                h.capitalize(month)
                                            ))
                                        ]),
                                        m('select.date.required.w-input.text-field.w-col-6.positive[aria-required=\'true\'][discard_day=\'true\'][required=\'required\'][use_short_month=\'true\']', {
                                            class: ctrl.deliverAtError() ? 'error' : false,
                                            onchange: (e) => {
                                                ctrl.reward.deliver_at(moment(reward.deliver_at()).year(parseInt(e.target.value)).format());
                                            }
                                        }, [
                                            _.map(_.range(moment().year(), moment().year() + 6), year =>
                                                m('option', {
                                                    value: year,
                                                    selected: moment(ctrl.reward.deliver_at()).format('YYYY') === String(year)
                                                },
                                                    year
                                                )
                                            )
                                        ])
                                    ])
                                )
                            ),
                            ctrl.deliverAtError() ? inlineError('Data de entrega não pode ser no passado.') : '',
                        )
                    ]),
                    m('.w-row',
                        m('label.fontsize-smaller',
                            'Descrição:'
                        )
                    ),
                    m('.w-row', [
                        m('textarea.text.required.w-input.text-field.positive.height-medium[aria-required=\'true\'][placeholder=\'Descreva sua recompensa\'][required=\'required\']', {
                            value: ctrl.reward.description(),
                            class: ctrl.descriptionError() ? 'error' : false,
                            oninput: m.withAttr('value', ctrl.reward.description)
                        }),
                        m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']",
                            'Descrição não pode ficar em branco'
                        )
                    ]),
                    ctrl.descriptionError() ? inlineError('Descrição não pode ficar em branco.') : '',
                    ctrl.project.mode === 'sub' ? null : m('.u-marginbottom-30.w-row', [
                        m('.w-col.w-col-3',
                            m("label.fontsize-smaller[for='field-2']",
                                'Tipo de entrega'
                            )
                        ),
                        m('.w-col.w-col-9', [
                            m('select.positive.text-field.w-select', {
                                value: ctrl.reward.shipping_options() || 'free',
                                onchange: (e) => {
                                    ctrl.reward.shipping_options(e.target.value);
                                    ctrl.updateOptions();
                                }
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

                            ((ctrl.reward.shipping_options() === 'national' || ctrl.reward.shipping_options() === 'international') ?
                                m('.card.card-terciary', [

                                    // state fees
                                    (_.map(fees, (fee, feeIndex) => [m(shippingFeeInput, {
                                        fee,
                                        fees: ctrl.fees,
                                        feeIndex,
                                        states: ctrl.states
                                    }),

                                    ])),
                                    m('.u-margintop-20',
                                        m("a.alt-link[href='#']", {
                                            onclick: () => {
                                                ctrl.fees().push(newFee);
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
                        m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                            m('a.w-button.btn.btn-small', {
                                onclick: () => {
                                    ctrl.saveReward();
                                }
                            }, 'Salvar')
                        ),
                        (reward.newReward ? '' :
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                m('a.w-button.btn-terciary.btn.btn-small.reward-close-button', {
                                    onclick: () => {
                                        reward.edit.toggle();
                                    }
                                }, 'Cancelar')
                            )),
                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', [
                            m('input[type=\'hidden\'][value=\'false\']'),
                            m('a.remove_fields.existing', {
                                onclick: ctrl.confirmDelete
                            },
                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border')
                            )
                        ])
                    ])
                ])
            )
        ]);
    }
};

export default editRewardCard;
