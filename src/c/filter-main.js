window.c.FilterMain = (function(m) {
    return {
        view: function(ctrl, args) {
            return m('.w-row', [
                m('.w-col.w-col-10', [
                    m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', {
                        onchange: m.withAttr('value', args.vm),
                        value: args.vm()
                    })
                ]),
                m('.w-col.w-col-2', [
                    m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]')
                ])
            ]);
        }
    };
}(window.m));
