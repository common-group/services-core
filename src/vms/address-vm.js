import m from 'mithril';

const addressVM = (args) => {
    const data = args.data;
    const international = m.prop();
    const defaultCountryID = 36,
        defaultForeignCountryID = 74;
    const fields = {
        id: m.prop(data.id || ''),
        countryID: m.prop(data.country_id || defaultCountryID),
        stateID: m.prop(data.state_id || ''),
        addressStreet: m.prop(data.address_street || ''),
        addressNumber: m.prop(data.address_number || ''),
        addressComplement: m.prop(data.address_complement || ''),
        addressNeighbourhood: m.prop(data.address_neighbourhood || ''),
        addressCity: m.prop(data.address_city || ''),
        addressState: m.prop(data.address_state || ''),
        addressZipCode: m.prop(data.address_zip_code || ''),
        phoneNumber: m.prop(data.phone_number || '')
    };

    return {
        international,
        defaultCountryID,
        defaultForeignCountryID,
        fields
    };
};

export default addressVM;
