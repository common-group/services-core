import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import generateErrorInstance from '../error';

const e = generateErrorInstance();

const fields = {
    owner_document: m.prop(''),
    country_id: m.prop(''),
    street: m.prop(''),
    number: m.prop(''),
    city: m.prop(''),
    zipcode: m.prop(''),
    complement: m.prop(''),
    neighbourhood: m.prop(''),
    state: m.prop(''),
    phonenumber: m.prop(''),
    name: m.prop(''),
    agency: m.prop(''),
    bank_id: m.prop(''),
    agency_digit: m.prop(''),
    account: m.prop(''),
    account_digit: m.prop(''),
    bank_account_id: m.prop(''),
    state_inscription: m.prop(''),
    birth_date: m.prop(''),
    account_type: m.prop(''),
    bank_account_type: m.prop('')
};

const mapRailsErrors = (rails_errors) => {
    let parsedErrors;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch(e) {
        parsedErrors = {};
    }
    const extractAndSetErrorMsg = (label, fieldArray) => {
        const value = _.first(_.compact(_.map(fieldArray, (field) => {
            return _.first(parsedErrors[field]);
        })));

        if(value) {
            e(label, value);
            e.inlineError(label, true);
        }
    };

    extractAndSetErrorMsg("owner_document", ["user.cpf", "cpf"]);
    extractAndSetErrorMsg("country_id", ["user.country_id", "country_id"]);
    extractAndSetErrorMsg("street", ["user.address_street", "address_street"]);
    extractAndSetErrorMsg("number", ["user.address_number", "address_number"]);
    extractAndSetErrorMsg("city", ["user.address_city", "address_city"]);
    extractAndSetErrorMsg("zipcode", ["user.address_zip_code", "address_zip_code"]);
    extractAndSetErrorMsg("complement", ["user.address_complement", "address_complement"]);
    extractAndSetErrorMsg("neighbourhood", ["user.address_neighbourhood", "address_neighbourhood"]);
    extractAndSetErrorMsg("state", ["user.address_state", "address_state"]);
    extractAndSetErrorMsg("phonenumber", ["user.phone_number", "phone_number"]);
    extractAndSetErrorMsg("name", ["user.name", "name"]);
    extractAndSetErrorMsg("agency", ["user.bank_account.agency", "bank_account.agency"]);
    extractAndSetErrorMsg("agency_digit", ["user.bank_account.agency_digit", "bank_account.agency_digit"]);
    extractAndSetErrorMsg("account", ["user.bank_account.account", "bank_account.account"]);
    extractAndSetErrorMsg("account_digit", ["user.bank_account.account_digit", "bank_account.account_digit"]);
    extractAndSetErrorMsg("bank_account_type", ["user.bank_account.account_type", "bank_account.account_type"]);
    extractAndSetErrorMsg("bank_id", ["user.bank_account.bank", "bank_account.bank"]);
    extractAndSetErrorMsg("birth_date", ["user.birth_date", "birth_date"]);
    extractAndSetErrorMsg("account_type", ["user.account_type", "account_type"]);

    return e;
};

const userSettingsVM = {
    fields,
    mapRailsErrors
};

export default userSettingsVM;
