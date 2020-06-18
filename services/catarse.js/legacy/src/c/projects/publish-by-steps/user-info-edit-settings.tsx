import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { StreamType } from '../../../@types/reward-details-stream';
import { UserDetails } from '../../../@types/user-details';
import { State } from '../../../@types/state';
import h from '../../../h';
import addressVM from '../../../vms/address-vm';
import { InlineErrors } from '../../inline-errors';
import UserSettingsAddress from '../../user-settings-address';
import UserSettingsResponsible from '../../user-settings-responsible';
import { UserAddress } from '../../../@types/user-address';


function defineGetSetOnObject<FieldType>(obj = {}, fieldName : string, getFunc: () => FieldType, setFunc: (newData : FieldType) => void) {
    return {
        ...obj,
        ...{
            get [fieldName]() : FieldType {
                return getFunc()
            },
            set [fieldName](value : FieldType) {
                setFunc(value)
            }
        }
    }
}

function propFromField<T>(obj = {}, field : string) {
    return (newData? : T) => {
        if (typeof newData !== 'undefined') {
            obj[field] = newData
        }

        return obj[field] as T
    }
}

function objectOfStreamsFromPOJO(obj = {}, fields : string[]) {
    const objStreams = {}

    for (const field of fields) {
        // objStreams[field] = propFromField(obj, field)
        objStreams[field] = (newData? : any) => {
            if (typeof newData !== 'undefined') {
                objStreams[field]._value = newData
                console.log('setting value on ', field, newData)
            }
    
            return objStreams[field]._value
        }

        objStreams[field]._value = obj[field]
    }

    return objStreams
}

type MaskFunction = (newData : string) => string

export type UserInfoEditSettingsAttrs = {
    hasErrorOn(field : string): boolean
    getErrorsOn(field : string): string[]
    user: UserDetails
}

export type UserInfoEditSettingsState = {
    parsedErrors: {
        hasError(field : string) : void
        inlineError(field : string): JSX.Element
    },
    fields: StreamType<{
        account_type: StreamType<string>
        name: StreamType<string>
        owner_document: StreamType<string>
        birth_date: StreamType<string>
        state_inscription: StreamType<string>
    }>
    disableFields: boolean
    applyDocumentMask(newData : string): string
    applyBirthDateMask(newData : string): string
    addVM: StreamType<any>
}

export class UserInfoEditSettings implements m.Component {

    oninit({attrs, state} : m.Vnode<UserInfoEditSettingsAttrs, UserInfoEditSettingsState>) {
        const hasErrorOn = attrs.hasErrorOn
        const getErrorsOn = attrs.getErrorsOn
        const user = attrs.user

        const parsedErrors = {
            hasError: (field : string) => hasErrorOn(field),
            inlineError: (field : string) => <InlineErrors messages={getErrorsOn(field)} />
        }

        const userFieldsNames = [
            'account_type',
            'name',
            'owner_document',
            'birth_date',
            'state_inscription',
        ]

        const fields = prop(objectOfStreamsFromPOJO(user, userFieldsNames)) as any

        const hasContributedOrPublished = user.total_contributed_projects >= 1 || user.total_published_projects >= 1
        const disableFields = user.is_admin_role ? false : (hasContributedOrPublished && !_.isEmpty(user.name) && !_.isEmpty(user.owner_document))
        
        const birthDayMask = _.partial(h.mask, '99/99/9999') as (newData : string) => string
        const documentMask = _.partial(h.mask, '999.999.999-99') as (newData : string) => string
        const documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99') as (newData : string) => string
        
        fields().birth_date(h.momentify(fields().birth_date()))

        const applyBirthDateMask = _.compose(fields().birth_date, birthDayMask) as (newData : string) => string
        const applyDocumentMask = (value : string) => {
            if (fields().account_type() != 'pf') {
                fields().owner_document(documentCompanyMask(value));
            } else {
                fields().owner_document(documentMask(value));
            }
            
            h.redraw()

            return fields().owner_document()
        }

        

        // const userAddress = attrs.user.address || {}
        // const addVMRaw = addressVM({ 
        //     data: userAddress, 
        //     onStatesLoaded() {
        //         addVMRaw.setFields(attrs.user.address || {})
        //     },
        //     onUpdate() {
        //         attrs.user.address = addVMRaw.getFields() as UserAddress
        //         console.log(addVMRaw.getFields())
        //     }
        // })
        // const addVM = prop(addVMRaw)
        
        state.parsedErrors = parsedErrors
        state.fields = fields
        state.disableFields = disableFields
        state.applyBirthDateMask = applyBirthDateMask
        state.applyDocumentMask = applyDocumentMask
        state.addVM = addViewModel()

        function addViewModel() {

            const statesProp = prop<State[]>([])

            const errors = {
                addressStreet: prop(false),
                addressNeighbourhood: prop(false),
                addressCity: prop(false),
                stateID: prop(false),
                addressZipCode: prop(false),
                phoneNumber: prop(false),
            }

            const fieldsMap = {
                addressZipCode: 'address_zip_code',
                phoneNumber: 'phone_number',
                addressState: 'address_state',
                addressStreet: 'address_street',
                addressNeighbourhood: 'address_neighbourhood',
                addressCity: 'address_city',
                stateID: 'state_id',
                countryID: 'country_id',
                addressNumber: 'address_number',
                addressComplement: 'address_complement',
            }

            const newMappedFields = Object.keys(fieldsMap).reduce((mappedFields, fieldNameToMap) => {
                mappedFields[fieldNameToMap] = mapFieldToProp(fieldsMap[fieldNameToMap])
                return mappedFields;
            }, {})

            function mapFieldToProp(field : string) {
                return (data? : string) => {
                    if (typeof data !== 'undefined') {
                        user.address[field] = data
                        WhenChangeNationality(user, statesProp)
                    }
                    return user.address[field]
                }
            }

            newMappedFields['states'] = statesProp
            newMappedFields['errors'] = errors

            return (data? : any) => {
                return {
                    fields: newMappedFields,
                }
            }
        }
    }

    view({attrs, state} : m.Vnode<UserInfoEditSettingsAttrs, UserInfoEditSettingsState>) {

        const user = attrs.user
        const parsedErrors = state.parsedErrors
        const fields = state.fields
        const disableFields = state.disableFields
        const applyBirthDateMask = state.applyBirthDateMask
        const applyDocumentMask = state.applyDocumentMask
        const addVM = state.addVM

        return (
            <>
                <UserSettingsResponsible 
                    parsedErrors={parsedErrors}
                    fields={fields}
                    user={user}
                    disableFields={disableFields}
                    applyDocumentMask={applyDocumentMask}
                    applyBirthDateMask={applyBirthDateMask}
                    />
                <UserSettingsAddress 
                    addVM={addVM}
                    parsedErrors={parsedErrors}
                    />
            </>
        )
    }
}


function WhenChangeNationality(user : UserDetails, states: prop<State[]>) : UserAddress {
    const defaultCountryID = 36 // Brasil
    const isInternational = Number(user.address.country_id) !== defaultCountryID

    if (!_.isEmpty(states()) && !isInternational) {
        const countryState = _.first(_.filter(states(), countryState => {
            return user.address.state_id === countryState.id
        }))
        
        if (countryState) {
            user.address.address_state = countryState.acronym
        }
    }

    if (isInternational) {
        user.address = {
            country_id: user.address.country_id,
            address_street: user.address.address_street,
            address_city: user.address.address_city,
            address_state: user.address.address_state,            
            address_zip_code: user.address.address_zip_code,
        } as UserAddress
    } else {
        user.address = {
            country_id: user.address.country_id,
            address_street: user.address.address_street,
            address_city: user.address.address_city,
            address_state: user.address.address_state,            
            address_zip_code: user.address.address_zip_code,
            state_id: user.address.state_id,
            address_number: user.address.address_number,
            address_complement: user.address.address_complement,
            address_neighbourhood: user.address.address_neighbourhood,
            phone_number: user.address.phone_number,
        } as UserAddress
    }
}