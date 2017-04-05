import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const shippingFeeInput = {
    controller(args) {
        const states = args.states;
        const fee = args.fee,
            fees = args.fees,
            feeIndex = args.feeIndex,
            deleted = h.toggleProp(false, true),
            feeValue = m.prop(fee.value || 0),
            feeDestination = m.prop(fee.destination),
            index = args.index,
            stateInUse = state => state.acronym !== feeDestination() && _.contains(_.pluck(fees(), 'destination'), state.acronym),
            updateFees = () => {
                const feeToUpdateIndex = _.indexOf(fees(), fee);
                fee.destination = feeDestination();
                fees()[feeToUpdateIndex] = fee;
            };

        return {
            fee,
            fees,
            deleted,
            feeValue,
            stateInUse,
            feeDestination,
            updateFees,
            feeIndex,
            index,
            states
        };
    },
    view(ctrl) {
        const feeIndex = ctrl.feeIndex,
            index = ctrl.index,
            deleted = ctrl.deleted,
            othersCount = _.filter(ctrl.fees(), fee => fee.destination !== 'others' && fee.destination !== 'international').length,
            states = ctrl.states;

        return m(`div${deleted() ? '.w-hidden' : ''}`, [
            m('.u-marginbottom-10.w-row', [
                m('.w-col.w-col-6',

                    (
                        ctrl.feeDestination() === 'others' ? [

                            m('input[type=\'hidden\']', {
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                                value: 'others'
                            }),
                            m('label.field-label.fontsize-smallest',
                                (othersCount > 0 ? 'Resto do Brasil' : 'Todos os estados do Brasil')
                            )
                        ] :

                        ctrl.feeDestination() === 'international' ?

                        [
                            m('input[type=\'hidden\']', {
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                                value: 'international'
                            }),
                            m('label.field-label.fontsize-smallest',
                                'Internacional'
                            )
                        ] :

                        m(`select.fontsize-smallest.text-field-light.w-select[id='project_rewards_shipping_fees_attributes_${index}_destination']`, {
                            name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                            value: ctrl.feeDestination(),
                            onchange: (e) => {
                                ctrl.feeDestination(e.target.value);
                                ctrl.updateFees();
                            }
                        }, [
                            (_.map(states(), state =>
                                m(`option[value='${state.acronym}']`, {
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
                            m("input.positive.postfix.text-field.w-input[type='text']", {
                                value: ctrl.feeValue(),
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][value]`,
                                oninput: m.withAttr('value', ctrl.feeValue)
                            })
                        )
                    ])
                ),
                m('.w-col.w-col-1', [
                    m(`input[id='project_rewards_shipping_fees_attributes_${index}__destroy'][type='hidden']`, {
                        value: ctrl.deleted(),
                        name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][_destroy]`
                    }),

                    (ctrl.feeDestination() === 'others' || ctrl.feeDestination() === 'international' ? '' :
                        m('a.btn.btn-no-border.btn-small.btn-terciary.fa.fa-1.fa-trash', {
                            onclick: () => ctrl.deleted.toggle()
                        }))
                ]),

                m(`input[type='hidden'][id='project_rewards_shipping_fees_attributes_${feeIndex}_id']`, {
                    name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][id]`,
                    value: ctrl.fee.id || null
                })

            ]), m('.divider.u-marginbottom-10')
        ]);
    }
};

export default shippingFeeInput;
