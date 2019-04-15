import m from 'mithril';

const nationalityRadio = {
    oninit: function(vnode) {
        const defaultCountryID = vnode.attrs.defaultCountryID,
            defaultForeignCountryID = vnode.attrs.defaultForeignCountryID,
            international = vnode.attrs.international;

        vnode.state = {
            defaultCountryID,
            defaultForeignCountryID,
            international
        };
    },
    view: function({state, attrs}) {
        const international = state.international,
            fields = attrs.fields;

        return m('div',
            m('.w-row', [
                m('.w-col.w-col-4',
                    m('.fontsize-small.fontweight-semibold',
                        'Nacionalidade:'
                    )
                ),
                m('.w-col.w-col-4',
                    m('.fontsize-small.w-radio', [
                        m("input.w-radio-input[name='nationality'][type='radio']", {
                            checked: !international(),
                            onclick: () => {
                                fields.countryID(state.defaultCountryID);
                                international(false);
                            }
                        }),
                        m('label.w-form-label',
                            'Brasileiro (a)'
                        )
                    ])
                ),
                m('.w-col.w-col-4',
                    m('.fontsize-small.w-radio', [
                        m("input.w-radio-input[name='nationality'][type='radio']", {
                            checked: international(),
                            onclick: () => {
                                if (fields.countryID() === state.defaultCountryID) {
                                    fields.countryID(state.defaultForeignCountryID); // USA
                                }
                                international(true);
                            }
                        }),
                        m('label.w-form-label',
                            'International'
                        )
                    ])
                )
            ])
        );
    }
};

export default nationalityRadio;
