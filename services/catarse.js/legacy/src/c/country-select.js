import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';

const countrySelect = {
    oninit: function(vnode) {
        const countriesLoader = catarse.loader(models.country.getPageOptions()),
            countries = prop(),
            defaultCountryID = vnode.attrs.defaultCountryID,
            defaultForeignCountryID = vnode.attrs.defaultForeignCountryID,
            fields = vnode.attrs.fields,
            international = vnode.attrs.international(fields.countryID() !== '' && fields.countryID() !== defaultCountryID);

        const changeCountry = (countryID) => {
            fields.countryID(parseInt(countryID));
            vnode.attrs.international(parseInt(countryID) !== defaultCountryID);
        };

        countriesLoader.load().then((countryData) => {
            countries(_.sortBy(countryData, 'name_en'));
            if (vnode.attrs.addVM) {
                vnode.attrs.addVM.countries(countries());
            }
        });

        return {
            changeCountry,
            defaultCountryID,
            defaultForeignCountryID,
            fields,
            international,
            countries
        };
    },
    view: function({state, attrs}) {
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
