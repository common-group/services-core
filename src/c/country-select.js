import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';

const countrySelect = {
    controller(args) {
        const countriesLoader = postgrest.loader(models.country.getPageOptions()),
            countries = m.prop(),
            defaultCountryID = args.defaultCountryID,
            defaultForeignCountryID = args.defaultForeignCountryID,
            fields = args.fields,
            international = args.international(fields.countryID() !== '' && fields.countryID() !== defaultCountryID);

        const changeCountry = (countryID) => {
            fields.countryID(parseInt(countryID));
            args.international(parseInt(countryID) !== defaultCountryID);
        };

        countriesLoader.load().then(countryData => countries(_.sortBy(countryData, 'name_en')));
        return {
            changeCountry,
            defaultCountryID,
            defaultForeignCountryID,
            fields,
            international,
            countries
        };
    },
    view(ctrl, args) {
        const fields = ctrl.fields;
        if (args.countryName) {
            args.countryName(ctrl.countries() && fields.countryID() ? _.find(ctrl.countries(), country => country.id === parseInt(fields.countryID())).name_en : '');
        }

        return m('.u-marginbottom-30.w-row', [
            m('.w-col.w-col-6', [
                m('.field-label.fontweight-semibold', [
                    'País / ',
                    m('em',
                        'Country'
                    ),
                    ' *'
                ]),
                m('select#country.positive.text-field.w-select', {
                    onchange: (e) => {
                        ctrl.changeCountry(e.target.value);
                    }
                }, [
                    (!_.isEmpty(ctrl.countries()) ?
                        _.map(ctrl.countries(), country => m('option', {
                            selected: country.id === ctrl.fields.countryID(),
                            value: country.id
                        },
                            country.name_en
                        )) :
                        '')
                ])
            ]),
            m('.w-col.w-col-6')
        ]);
    }
};

export default countrySelect;
