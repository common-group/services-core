import m from 'mithril';

const nationalityRadio = {
    controller(args) {
        const defaultCountryID = args.defaultCountryID,
            defaultForeignCountryID = args.defaultForeignCountryID,
            international = args.international;

        return {
            defaultCountryID,
            defaultForeignCountryID,
            international
        };
    },
    view(ctrl, args) {
        const international = ctrl.international,
            fields = args.fields;

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
                                fields.countryID(ctrl.defaultCountryID);
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
                                if (fields.countryID() === ctrl.defaultCountryID) {
                                    fields.countryID(ctrl.defaultForeignCountryID); // USA
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
