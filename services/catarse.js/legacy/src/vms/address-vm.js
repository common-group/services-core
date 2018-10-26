import m from 'mithril';
import prop from 'mithril/stream';

const states = prop([]);
const countries = prop([]);
const addressVM = (args) => {
    const data = args.data;
    const international = prop();
    const defaultCountryID = 36,
        defaultForeignCountryID = 74;
    const fields = {
        id: prop(data.id || ''),
        countryID: prop(data.country_id || defaultCountryID),
        stateID: prop(data.state_id || ''),
        addressStreet: prop(data.address_street || ''),
        addressNumber: prop(data.address_number || ''),
        addressComplement: prop(data.address_complement || ''),
        addressNeighbourhood: prop(data.address_neighbourhood || ''),
        addressCity: prop(data.address_city || ''),
        addressState: prop(data.address_state || ''),
        addressZipCode: prop(data.address_zip_code || ''),
        phoneNumber: prop(data.phone_number || '')
    };

    return {
        international,
        defaultCountryID,
        defaultForeignCountryID,
        fields,
        states,
        countries
    };
};

addressVM.states = states;
addressVM.countries = countries;

export default addressVM;
