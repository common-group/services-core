import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import inlineError from '../c/inline-error';

const I18nScope = _.partial(h.i18nScope, 'activerecord.attributes.address');

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
            international(parseInt(countryID) !== defaultCountryID);
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
