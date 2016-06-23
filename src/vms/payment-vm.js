import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import h from '../h';
import usersVM from './user-vm';
import models from '../models';

const paymentVM = (mode) => {
    const fields = {
            completeName  : m.prop(''),
            email : m.prop(''),
            anonymous : m.prop(''),
            countries : m.prop(),
            userCountryId : m.prop(),
            zipCode : m.prop(''),
            street : m.prop(''),
            number : m.prop(''),
            addressComplement : m.prop(''),
            neighbourhood : m.prop(''),
            city : m.prop(''),
            states : m.prop([]),
            userState : m.prop(),
            ownerDocument : m.prop(''),
            phone : m.prop(''),
            errors: m.prop([])
        },
        faq = I18n.translations[I18n.currentLocale()].projects.faq[mode],
        currentUser = h.getUser(),
        countriesLoader = postgrest.loader(models.country.getPageOptions()),
        statesLoader = postgrest.loader(models.state.getPageOptions());


    const populateForm = (fetchedData) => {
        const data = _.first(fetchedData);

        fields.completeName(data.name);
        fields.email(data.email);
        fields.city(data.address.city);
        fields.zipCode(data.address.zipcode);
        fields.street(data.address.street);
        fields.number(data.address.number);
        fields.addressComplement(data.address.complement);
        fields.userState(data.address.state);
        fields.userCountryId(data.address.country_id);
        fields.ownerDocument(data.owner_document);
        fields.phone(data.address.phonenumber);
        fields.neighbourhood(data.address.neighbourhood);
    };

    const isInternational = () => {
        return !_.isEmpty(fields.countries()) ? fields.userCountryId() != _.findWhere(fields.countries(), {name: 'Brasil'}).id : false;
    };

    const checkEmptyFields = (checkedFields) => {
        return _.map(checkedFields, (field) => {
            if(_.isEmpty(String(fields[field]()).trim())) {
                fields.errors().push({field: field, message: 'O campo não pode ser vazio.'});
            }
        });
    };

    const checkEmail = () => {
        const isValid = h.validateEmail(fields.email());

        if(!isValid){
            fields.errors().push({field: 'email', message: 'E-mail inválido.'});
        }
    };

    const checkDocument = () => {
        const isValid = h.validateCpf(fields.ownerDocument());

        if(!isValid){
            fields.errors().push({field: 'ownerDocument', message: 'CPF inválido.'});
        }
    }

    const validate = () => {
        fields.errors([]);

        checkEmptyFields(['completeName', 'street', 'number', 'neighbourhood', 'city']);

        checkEmail();

        if(!isInternational()){
            checkEmptyFields(['phone']);
            checkDocument();
        }

        return _.isEmpty(fields.errors());
    };

    const resetFieldError = (fieldName) => () => {
        const errors = fields.errors(),
            errorField = _.findWhere(fields.errors(), {field: fieldName}),
            newErrors = _.compose(fields.errors, _.without);

        return newErrors(fields.errors(), errorField);
    };

    countriesLoader.load().then(fields.countries);
    statesLoader.load().then(fields.states);
    usersVM.fetchUser(currentUser.user_id, false).then(populateForm);

    return {
        fields: fields,
        validate: validate,
        isInternational: isInternational,
        resetFieldError: resetFieldError,
        faq: faq
    };
};

export default paymentVM;
