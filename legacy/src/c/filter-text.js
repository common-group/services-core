import m from 'mithril';

const filterText = {
    view: function (ctrl, args) {

        const buttonOptions = {};

        if ('onclick' in args)
            buttonOptions.onclick = args.onclick;

        return m(args.wrapper_class, [
            m('.fontsize-smaller.u-text-center',
                args.label
            ),
            m('.w-row', [
                m('.text-field.positive.prefix.no-hover.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                    m('a.w-inline-block[href=\'#\']', buttonOptions,
                        m('img.header-lupa[src=\'https://uploads-ssl.webflow.com/5991cfb722e8860001b12d51/5991cfb722e8860001b12df0_lupa.png\']')
                    )
                ),
                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                    m(`input.text-field.postfix.positive.w-input[maxlength='256'][placeholder='${args.placeholder}'][type='text']`, {
                        onchange: m.withAttr('value', args.vm),
                        value: args.vm()
                    })
                )
            ])
        ]);       
    }
};

export default filterText;
