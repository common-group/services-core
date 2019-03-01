import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse } from '../api';
import h from '../h';
import models from '../models';
import nationalityRadio from '../c/nationality-radio';
import addressVM from '../vms/address-vm';
import addressFormInternational from './address-form-international';
import addressFormNational from './address-form-national';

const addressForm = {
    oninit: function(vnode) {
        
        const parsedErrors = vnode.attrs.parsedErrors;
        const statesLoader = catarse.loader(models.state.getPageOptions()),
            data = vnode.attrs.fields().address(),
            vm = addressVM({
                data
            }),
            defaultCountryID = vm.defaultCountryID,
            defaultForeignCountryID = vm.defaultForeignCountryID,
            states = prop(),
            zipCodeErrorMessage = prop(''),
            fields = vnode.attrs.addressFields || vm.fields,
            errors = {
                countryID: prop(parsedErrors ? parsedErrors.hasError('country_id') : false),
                stateID: prop(parsedErrors ? parsedErrors.hasError('state') : false),
                addressStreet: prop(parsedErrors ? parsedErrors.hasError('street') : false),
                addressNumber: prop(parsedErrors ? parsedErrors.hasError('number') : false),
                addressComplement: prop(false),
                addressNeighbourhood: prop(parsedErrors ? parsedErrors.hasError('neighbourhood') : false),
                addressCity: prop(parsedErrors ? parsedErrors.hasError('city') : false),
                addressState: prop(parsedErrors ? parsedErrors.hasError('state') : false),
                addressZipCode: prop(parsedErrors ? parsedErrors.hasError('zipcode') : false),
                phoneNumber: prop(parsedErrors ? parsedErrors.hasError('phonenumber') : false)
            },
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            zipcodeMask = _.partial(h.mask, '99999-999'),
            applyZipcodeMask = _.compose(fields.addressZipCode, zipcodeMask),
            applyPhoneMask = _.compose(fields.phoneNumber, phoneMask),
            international = vnode.attrs.disableInternational ? prop(false) : vnode.attrs.international || vm.international;

        const checkPhone = () => {
            let hasError = false;
            const phone = fields.phoneNumber(),
                strippedPhone = String(phone).replace(/[\(|\)|\-|\s]*/g, '');

            if (strippedPhone.length < 10) {
                errors.phoneNumber(true);
                hasError = true;
            } else {
                const controlDigit = Number(strippedPhone.charAt(2));
                if (!(controlDigit >= 2 && controlDigit <= 9)) {
                    errors.phoneNumber(true);
                    hasError = true;
                }
            }
            return hasError;
        };

        _.extend(vnode.attrs.fields(), {
            validate: () => {
                let hasError = false;
                const fieldsToIgnore = international() ? ['id', 'stateID', 'addressComplement', 'addressNumber', 'addressNeighbourhood', 'phoneNumber'] : ['id', 'addressComplement', 'addressState', 'phoneNumber'];
                // clear all errors
                _.mapObject(errors, (val, key) => {
                    val(false);
                });
                // check for empty fields
                _.mapObject(_.omit(fields, fieldsToIgnore), (val, key) => {
                    if (!val()) {                        
                        errors[key](true);
                        hasError = true;
                    }
                });
                if (!international()) {
                    const hasPhoneError = checkPhone();
                    hasError = hasError || hasPhoneError;
                }
                return !hasError;
            }
        });

        const lookupZipCode = (zipCode) => {
            fields.addressZipCode(zipCode);
            if (zipCode.length === 9) {
                m.request({
                    method: 'GET',
                    url: `https://api.pagar.me/1/zipcodes/${zipCode}`
                }).then((response) => {
                    fields.addressStreet(response.street);
                    fields.addressNeighbourhood(response.neighborhood);
                    fields.addressCity(response.city);
                    fields.stateID(_.find(states(), state => state.acronym === response.state).id);
                    errors.addressStreet(false);
                    errors.addressNeighbourhood(false);
                    errors.addressCity(false);
                    errors.stateID(false);
                    errors.addressZipCode(false);
                }).catch((err) => {
                    zipCodeErrorMessage(err.errors[0].message);
                    errors.addressZipCode(true);
                });
            }
        };

        statesLoader.load().then((data) => {
            states(data);
            addressVM.states(states());
        });
        vnode.state = {
            lookupZipCode,
            zipCodeErrorMessage,
            errors,
            applyPhoneMask,
            applyZipcodeMask,
            defaultCountryID,
            defaultForeignCountryID,
            fields,
            international,
            states
        };
    },
    onbeforeupdate: function(vnode) { },
    view: function({state, attrs}) {
        const fields = state.fields,
            international = state.international,
            defaultCountryID = state.defaultCountryID,
            defaultForeignCountryID = state.defaultForeignCountryID,
            countryName = attrs.countryName,
            errors = state.errors,
            // hash to send to rails
            address = {
                id: fields.id(),
                country_id: fields.countryID(),
                state_id: fields.stateID(),
                address_street: fields.addressStreet(),
                address_number: fields.addressNumber(),
                address_complement: fields.addressComplement(),
                address_neighbourhood: fields.addressNeighbourhood(),
                address_city: fields.addressCity(),
                address_state: fields.addressState(),
                address_zip_code: fields.addressZipCode(),
                phone_number: fields.phoneNumber()
            },
            applyZipcodeMask = state.applyZipcodeMask,
            lookupZipCode = state.lookupZipCode,
            zipCodeErrorMessage = state.zipCodeErrorMessage,
            countryStates = state.states,
            disableInternational = attrs.disableInternational,
            hideNationality = attrs.hideNationality;

        attrs.fields().address(address);
        if (attrs.stateName) {
            attrs.stateName(state.states() && fields.stateID() ? _.find(state.states(), state => state.id === parseInt(fields.stateID())).name : '');
        }

        return m('#address-form.u-marginbottom-30.w-form', [
            (
                !hideNationality ?
                    m('.u-marginbottom-30',
                        m(nationalityRadio, {
                            fields,
                            defaultCountryID,
                            defaultForeignCountryID,
                            international
                        })
                    ) 
                : 
                    ''
            ),
            (
                international() ?
                (
                    m(addressFormInternational, {
                        fields,
                        disableInternational,
                        addVM: attrs.addVM,
                        international,
                        defaultCountryID,
                        defaultForeignCountryID,
                        errors
                    })
                )
                    :
                (
                    m(addressFormNational, {
                        disableInternational,
                        countryName,
                        fields,
                        international,
                        defaultCountryID,
                        defaultForeignCountryID,
                        errors,
                        applyZipcodeMask,
                        lookupZipCode,
                        zipCodeErrorMessage,
                        countryStates
                    })
                )
            )
        ]);
    }
};

export default addressForm;
