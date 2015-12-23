window.c.FilterDropdown = (function(m, c, _) {
    return {
        view: function(ctrl, args) {
            return m('.w-col.w-col-3.w-col-small-6', [
                m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
                m.component(c.Dropdown, {
                    id: args.index,
                    classes: '.w-select.text-field.positive',
                    valueProp: args.vm,
                    options: args.options
                })
            ]);
        }
    };
}(window.m, window.c, window._));
