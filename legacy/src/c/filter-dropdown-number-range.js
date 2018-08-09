import m from 'mithril';
import h from '../h';

const innerFieldInput = {
    view: function(ctrl, args)
    {

        return args.shouldRenderInnerFieldLabel ? 
            m(`input.text-field.positive.w-input[placeholder='${args.placeholder}'][required][type='number']`, {
                onchange: m.withAttr('value', args.inputValue),
                value: args.inputValue()
            })
                :
            m('.w-row', [
                m('.text-field.positive.prefix.no-hover.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                    m('.fontsize-smallest.fontcolor-secondary.u-text-center', args.label)
                ),
                m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                    m(`input.text-field.postfix.positive.w-input[type='number'][placeholder='${args.placeholder}']`, {
                        onchange: m.withAttr('value', args.inputValue),
                        value: args.inputValue()
                    })
                )
            ]);
    }
}

const filterDropdownNumberRange = {
    controller: function (args) {
        const
            firstValue = m.prop(0),
            secondValue = m.prop(0),
            clearFieldValues = () => { firstValue(0), secondValue(0) },
            getLowerValue = () => firstValue() < secondValue() ? firstValue() : secondValue(),
            getHigherValue = () => firstValue() > secondValue() ? firstValue() : secondValue(),
            renderPlaceholder = () => {
                const 
                    lowerValue = getLowerValue(),
                    higherValue = getHigherValue();

                let placeholder = args.value_change_placeholder;
                if (lowerValue !== 0)
                {
                    placeholder = placeholder.replace('#V1', lowerValue);
                }
                else
                {
                    placeholder = placeholder.replace('#V1', args.init_lower_value);
                }
        
                if (higherValue !== 0)
                {
                    placeholder = placeholder.replace('#V2', higherValue);
                }
                else
                {
                    placeholder = placeholder.replace('#V2', args.init_higher_value);
                }
                return placeholder;
            },
            showDropdown = h.toggleProp(false, true);
        return {firstValue, secondValue, clearFieldValues, getLowerValue, getHigherValue, renderPlaceholder, showDropdown};
    },
    view: function (ctrl, args) {
        
        const shouldRenderInnerFieldLabel = !!!args.inner_field_label;

        return m(args.wrapper_class, [
            m('.fontsize-smaller.u-text-center', args.label),
            m('.w-dropdown', [
                m('select.w-select.text-field.positive.text-nowrap', {
                    style: {
                        'margin-bottom' : '0px'
                    },
                    onmousedown: function(e) {
                        e.preventDefault();
                        if (args.selectable() !== args.index && ctrl.showDropdown()) ctrl.showDropdown.toggle();
                        args.selectable(args.index);
                        ctrl.showDropdown.toggle();
                    }
                },
                [
                    m('option', {
                        value: ''
                    }, ctrl.renderPlaceholder())
                ]),
                ((ctrl.showDropdown() && args.selectable() == args.index) ? 
                    m('nav.dropdown-list.dropdown-list-medium.card', [
                        m('.u-marginbottom-20.w-row', [
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5',
                                m(innerFieldInput, {
                                    shouldRenderInnerFieldLabel,
                                    inputValue: ctrl.firstValue,
                                    placeholder: args.inner_field_placeholder,
                                    label: args.inner_field_label
                                })
                            ),
                            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                                m('.fontsize-smaller.u-text-center.u-margintop-10',
                                    'a'
                                )
                            ),
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5',
                                m(innerFieldInput, {
                                    shouldRenderInnerFieldLabel,
                                    inputValue: ctrl.secondValue,
                                    placeholder: args.inner_field_placeholder,
                                    label: args.inner_field_label
                                })
                            )
                        ]),
                        m('a.fontsize-smaller.fontweight-semibold.alt-link.u-right[href=\'#\']',
                            {
                                onclick: () => {
                                    const 
                                        higherValue = ctrl.getHigherValue() * args.value_multiplier,
                                        lowerValue = ctrl.getLowerValue() * args.value_multiplier;

                                        args.vm.gte(lowerValue);
                                        args.vm.lte(higherValue);
                                    args.onapply();
                                }
                            },
                            'Aplicar'
                        ),
                        m('a.fontsize-smaller.link-hidden[href=\'#\']', {
                            onclick: ctrl.clearFieldValues
                        }, 'Limpar')
                    ])

                : '')
            ])
        ]);
    }
}

export default filterDropdownNumberRange;