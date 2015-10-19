window.c.FilterDateRange = (function(m) {
    return {
        view: function(ctrl, args) {
            return m('.w-col.w-col-3.w-col-small-6', [
                m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
                m('.w-row', [
                    m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                        m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
                            onchange: m.withAttr('value', args.first),
                            value: args.first()
                        })
                    ]),
                    m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                        m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')
                    ]),
                    m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                        m('input.w-input.text-field.positive[type="text"]', {
                            onchange: m.withAttr('value', args.last),
                            value: args.last()
                        })
                    ])
                ])
            ]);
        }
    };
}(window.m));
