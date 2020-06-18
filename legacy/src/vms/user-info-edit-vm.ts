import m from 'mithril'
import { UserDetails } from '../@types/user-details'
import h from '../h'
import userVM from './user-vm'
import { RailsErrors } from '../@types/rails-errors'

type PublicProfileImageResponse = {
    cover_image: string | null
    uploaded_image: string | null
}

export class UserInfoEditViewModel {

    private _isLoading : boolean
    private _isSaving : boolean
    private _user : UserDetails
    private _errors : { [field:string] : string[] }

    constructor(private user_id : number) {
        this._isLoading = true
        this._isSaving = false
        this._errors = {}
        this.fetchUser()
    }

    get isLoading() {
        return this._isLoading
    }

    get isSaving() {
        return this._isSaving
    }

    get user() : UserDetails {
        return this._user
    }

    getErrors(field : string) : string[] {
        return this._errors[field] || []
    }

    hasErrorOn(field : string) : boolean {
        const errors = this._errors[field] || []
        return errors.length > 0
    }

    async save(requiredFields : string[], profileImage? : File) : Promise<boolean> {
        
        try {
            this._isSaving = true
            h.redraw()

            if (profileImage) {
                this.uploadImage(profileImage)
            }

            const userSaveAttributes = {
                public_name: this._user.public_name,
                links_attributes: this._user.links,
                cpf: this._user.owner_document,
                name: this._user.name,
                address_attributes: this._user.address,
                account_type: this._user.account_type,
                birth_date: this._user.birth_date,
                state_inscription: this._user.state_inscription,
                publishing_user_settings: true
            }

            console.log('userSaveAttributes', userSaveAttributes)

            // TODO: save updates
            return true

        } catch(e) {
            const railsError = e as RailsErrors
            const railsErrorJson = JSON.parse(railsError.errors_json)
            Object.keys(railsErrorJson).forEach(field => {
                if (typeof railsErrorJson[field] === 'string') {
                    this.setErrorOnField(field, railsErrorJson[field])
                } else {
                    for (const message of railsErrorJson[field]) {
                        this.setErrorOnField(field, message)
                    }
                }
            })
            return false
        } finally {
            this._isSaving = false
            h.redraw()
        }
    }

    private async uploadImage(profileImage : File) {
        const formData = new FormData()
        formData.append('uploaded_image', profileImage)

        try {
            const requestConfig = {
                method: 'POST',
                url: `/users/${this.user.id}/upload_image.json`,
                data: formData,
                config: h.setCsrfToken,
                serialize(data) {
                    return data;
                }
            }

            const response : PublicProfileImageResponse = await m.request(requestConfig)
            this._user.profile_img_thumbnail = response.uploaded_image
        } catch(e) {
            // TODO: add errors response
        }
    }

    private async fetchUser() {
        try {
            this._isLoading = true
            h.redraw()
            const response : UserDetails[] = await userVM.fetchUser(this.user_id, false)
            this._user = response[0]
        } catch(e) {
            //TODO: handle errors
        } finally {
            this._isLoading = false
            h.redraw()
        }
    }

    private setErrorOnField(field : string, message : string) {
        this._errors[field] = (this._errors[field] || []).concat(message)
    }
    
    private clearErrors() {
        this._errors = {}
    }
}