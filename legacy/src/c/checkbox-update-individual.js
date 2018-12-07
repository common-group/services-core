import m from 'mithril';

const checkboxUpdateIndividual = {
    view: function (ctrl, args) {
        return m('.w-checkbox.fontsize-smallest.fontcolor-secondary.u-margintop-10', [
            m(`input.w-checkbox-input[type='checkbox']`, {
                checked: args.current_state,
                onclick: args.onToggle
            }),
            m('label.w-form-label', args.text)
        ])
    }
}

export default checkboxUpdateIndividual;