import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const shippingFeeInput = {
    controller(args) {
        const fee = args.fee,
            feeIndex = args.feeIndex,
            deleted = h.toggleProp(false, true),
            feeValue = m.prop(fee.value || 0),
            feeDestination = m.prop(fee.destination),
            index = args.index,
            states = args.states;
        return {
            fee,
            deleted,
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
            deleted = ctrl.deleted,
            states = ctrl.states;

        return m(`div${deleted() ? '.w-hidden' : ''}`, [
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
                    m(`input[id='project_rewards_shipping_fees_attributes_${index}__destroy'][type='hidden']`, {
                        value: ctrl.deleted(),
                        name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][_destroy]`
                    }),
                    m('a.btn.btn-no-border.btn-small.btn-terciary.fa.fa-1.fa-trash', { onclick: () => ctrl.deleted.toggle() })
                ])

            ]), m('.divider.u-marginbottom-10')
        ]);
    }
};

export default shippingFeeInput;
