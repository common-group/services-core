import m from 'mithril';
import _ from 'underscore';

const shippingFeeInput = {
    controller(args) {
        const fee = args.fee,
            feeIndex = args.feeIndex,
            feeValue = m.prop(fee.value),
            feeDestination = m.prop(fee.destination),
            index = args.index,
            states = args.states;
        return {
            fee,
            feeValue,
            feeDestination,
            feeIndex,
            index,
            states
        };
    },
    view(ctrl) {
        const feeIndex = ctrl.feeIndex,
            index = ctrl.index,
            states = ctrl.states;

        return m('div', [
            m('.u-marginbottom-10.w-row', [
                m('.w-col.w-col-6',
                    m(`select.fontsize-smallest.text-field-light.w-select[id='project_rewards_shipping_fees_attributes_${index}_destination']`, {
                        name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                        value: ctrl.feeDestination(),
                        onchange: m.withAttr('value', ctrl.feeDestination)
                    }, [
                        (_.map(states(), state =>
                            m(`option[value='${state.acronym}']`,
                                state.name
                            )))
                    ])
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
                                onchange: m.withAttr('value', ctrl.feeValue)
                            })
                        )
                    ])
                ),
                m('.w-col.w-col-1', [
                    m(`input[id='project_rewards_shipping_fees_attributes_${index}__destroy'][type='hidden'][value='false']`, {
                        name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][_destroy]`
                    }),
                    m("a.remove_fields.existing.btn.btn-no-border.btn-small.btn-terciary.fa.fa-1.fa-trash[data-confirm='Tem certeza?'][href='#']")
                ])

            ]), m('.divider.u-marginbottom-10')
        ]);
    }
};

export default shippingFeeInput;
