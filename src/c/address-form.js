import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';

const I18nScope = _.partial(h.i18nScope, 'activerecord.attributes.address');

const addressForm = {
    controller(args) {
        const countriesLoader = postgrest.loader(models.country.getPageOptions()),
            statesLoader = postgrest.loader(models.state.getPageOptions()),
            countries = m.prop(),
            states = m.prop(),
            data = args.fields().addresses_attributes,
            fields = {
                id: m.prop(data.id || ''),
                countryID: m.prop(data.country_id || ''),
                stateID: m.prop(data.state_id || ''),
                addressStreet: m.prop(data.address_street || ''),
                addressNumber: m.prop(data.address_number || ''),
                addressComplement: m.prop(data.address_complement || ''),
                addressNeighbourhood: m.prop(data.address_neighbourhood || ''),
                addressCity: m.prop(data.address_city || ''),
                addressZipCode: m.prop(data.address_zip_code || ''),
                phoneNumber: m.prop(data.phone_number || '')
            };

        countriesLoader.load().then(countryData => countries(_.sortBy(countryData, 'name_en')));
        statesLoader.load().then(states);
        return {
            fields,
            states,
            countries
        };
    },
    view(ctrl, args) {
        const fields = ctrl.fields,
            address = {
                addresses_attributes: {
                    id: fields.id(),
                    country_id: fields.countryID(),
                    state_id: fields.stateID(),
                    address_street: fields.addressStreet(),
                    address_number: fields.addressNumber(),
                    address_complement: fields.addressComplement(),
                    address_neighbourhood: fields.addressNeighbourhood(),
                    address_city: fields.addressCity(),
                    address_zip_code: fields.addressZipCode(),
                    phone_number: fields.phoneNumber()
                }
            };

        args.fields(address);
        args.countryName(ctrl.countries() ? (fields.countryID() ? _.find(ctrl.countries(), country => country.id === parseInt(fields.countryID())).name_en : '') : '');
        args.stateName(ctrl.states() ? (fields.stateID() ? _.find(ctrl.states(), state => state.id === parseInt(fields.stateID())).name : '') : '');

        return m('.u-marginbottom-30.w-form', [
            m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                I18n.t('delivery_address', I18nScope())
            ),
            m('div', [
                m('.w-row', [
                    m('.w-sub-col.w-col.w-col-6', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('country', I18nScope())
                        ),
                        m('select.positive.text-field.w-select', {
                            onchange: m.withAttr('value', ctrl.fields.countryID)
                        }, [
                            m('option[value=\'\']'),
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
                    m('.w-col.w-col-6',
                        m('.w-row', [
                            m('.w-sub-col-middle.w-col.w-col-6.w-col-small-6.w-col-tiny-6'),
                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6')
                        ])
                    )
                ]),
                m('div', [
                    m('label.field-label.fontweight-semibold',
                        I18n.t('address_street', I18nScope())
                    ),
                    m("input.positive.text-field.w-input[maxlength='256'][required='required']", {
                        value: ctrl.fields.addressStreet(),
                        onchange: m.withAttr('value', ctrl.fields.addressStreet)
                    })
                ]),
                m('.w-row', [
                    m('.w-sub-col.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_number', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.addressNumber(),
                            onchange: m.withAttr('value', ctrl.fields.addressNumber)
                        })
                    ]),
                    m('.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_complement', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.addressComplement(),
                            onchange: m.withAttr('value', ctrl.fields.addressComplement)
                        })
                    ]),
                    m('.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_neighbourhood', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.addressNeighbourhood(),
                            onchange: m.withAttr('value', ctrl.fields.addressNeighbourhood)
                        })
                    ])
                ]),
                m('.w-row', [
                    m('.w-sub-col.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_zip_code', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.addressZipCode(),
                            onchange: m.withAttr('value', ctrl.fields.addressZipCode)
                        })
                    ]),
                    m('.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_city', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.addressCity(),
                            onchange: m.withAttr('value', ctrl.fields.addressCity)
                        })
                    ]),
                    m('.w-col.w-col-4', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('address_state', I18nScope())
                        ),
                        m('select.positive.text-field.w-select', {
                            onchange: m.withAttr('value', ctrl.fields.stateID)
                        }, [
                            m('option[value=\'\']'),
                            (!_.isEmpty(ctrl.states()) ?
                                _.map(ctrl.states(), state => m('option', {
                                    value: state.id,
                                    selected: state.id === ctrl.fields.stateID()
                                },
                                    state.name
                                )) : ''),
                        ])
                    ])
                ]),
                m('.w-row', [
                    m('.w-sub-col.w-col.w-col-6', [
                        m('label.field-label.fontweight-semibold',
                            I18n.t('phone_number', I18nScope())
                        ),
                        m("input.positive.text-field.w-input[required='required']", {
                            value: ctrl.fields.phoneNumber(),
                            onchange: m.withAttr('value', ctrl.fields.phoneNumber)
                        })
                    ]),
                    m('.w-col.w-col-6')
                ])
            ])
        ]);
    }
};

export default addressForm;
