import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import inlineError from '../c/inline-error';

const shippingFeeInput = {
    controller(args) {
        const states = args.states;
        const fee = args.fee,
            fees = args.fees,
            deleted = h.toggleProp(false, true),
            stateInUse = (state) => {
                const destinations = _.map(fees(), fee => fee.destination());
                return state.acronym !== fee.destination() && _.contains(destinations, state.acronym);
            },
            applyMask = _.compose(fee.value, h.applyMonetaryMask);

        _.extend(fee, { deleted });
        fee.value(fee.value() ? `${h.formatNumber(fee.value(), 2, 3)}` : '0,00');
        return {
            fee,
            applyMask,
            fees,
            deleted,
            feeValue: fee.value,
            stateInUse,
            states
        };
    },
    view(ctrl) {
        const deleted = ctrl.deleted,
            othersCount = _.filter(ctrl.fees(), fee => fee.destination !== 'others' && fee.destination !== 'international').length,
            states = ctrl.states;

        return m(`div${deleted() ? '.w-hidden' : ''}`, [
            m('.u-marginbottom-10.w-row', [
                m('.w-col.w-col-6',

                    (
                        ctrl.fee.destination() === 'others' ? [

                            m('input[type=\'hidden\']', {
                                value: 'others'
                            }),
                            m('label.field-label.fontsize-smallest',
                                (othersCount > 0 ? 'Resto do Brasil' : 'Todos os estados do Brasil')
                            )
                        ] :

                        ctrl.fee.destination() === 'international' ?

                        [
                            m('input[type=\'hidden\']', {
                                value: 'international'
                            }),
                            m('label.field-label.fontsize-smallest',
                                'Internacional'
                            )
                        ] :

                        m('select.fontsize-smallest.text-field.text-field-light.w-select', {
                            class: ctrl.fee.error ? 'error' : false,
                            value: ctrl.fee.destination(),
                            onchange: m.withAttr('value', ctrl.fee.destination)
                        }, [
                            (_.map(states(), state =>
                                m('option', {
                                    value: state.acronym,
                                    disabled: ctrl.stateInUse(state)
                                },
                                    state.name
                                )))
                        ]))
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
                            m('input.positive.postfix.text-field.w-input', {
                                value: ctrl.feeValue(),
                                autocomplete: 'off',
                                type: 'text',
                                onkeyup: m.withAttr('value', ctrl.applyMask),
                                oninput: m.withAttr('value', ctrl.feeValue)
                            })
                        )
                    ])
                ),
                m('.w-col.w-col-1', [
                    m('input[type=\'hidden\']', {
                        value: ctrl.deleted()
                    }),

                    (ctrl.fee.destination() === 'others' || ctrl.fee.destination() === 'international' ? '' :
                        m('a.btn.btn-no-border.btn-small.btn-terciary.fa.fa-1.fa-trash', {
                            onclick: () => ctrl.deleted.toggle()
                        }))
                ])


            ],
            ctrl.fee.error ? m(inlineError, { message: 'Estado não pode ficar em branco.' }) : ''
            ), m('.divider.u-marginbottom-10')
        ]);
    }
};

export default shippingFeeInput;
