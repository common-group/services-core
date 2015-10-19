window.c.FilterDropdown = (function(m, _) {
    return {
        view: function(ctrl, args) {
            return m('.w-col.w-col-3.w-col-small-6', [
                m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
                m('select.w-select.text-field.positive[id="' + args.index + '"]', {
                    onchange: m.withAttr('value', args.vm),
                    value: args.vm()
                }, [
                    _.map(args.options, function(data) {
                        return m('option[value="' + data.value + '"]', data.option);
                    })
                ])
            ]);
        }
    };
}(window.m, window._));
