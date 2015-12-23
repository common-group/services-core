window.c.Dropdown = (function(m, h, _) {
    return {
        view: function(ctrl, args) {
            return m(
                `select${args.classes}[id="${args.id}"]`,
                {
                    onchange: m.withAttr('value', args.valueProp),
                    value: args.valueProp()
                },
                _.map(args.options, function(data) {
                    return m('option[value="' + data.value + '"]', data.option);
                })
            );
        }
    };
}(window.m, window.c.h, window._));
