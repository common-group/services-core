import { Subject, Observable } from 'rxjs'
import m from 'mithril'
import { catarse } from '../api'
import models from '../models'
import { ProjectDetails } from "../@types/project-details"
import h from '../h'
import { RailsErrors } from '../@types/rails-errors'
import _ from 'underscore'

const I18nScope = _.partial(h.i18nScope, 'activerecord.errors.models');

export class ProjectPublishByStepsVM {

    private _project : ProjectDetails | null
    private _projectSubject : Subject<ProjectDetails>
    private _isLoadingProject : boolean
    private _isSavingProject : boolean
    private _errors : { [key:string] : string[] }

    constructor(private project_id : number) {
        this._project = null
        this._isLoadingProject = true
        this._errors = {}
        this._projectSubject = new Subject<ProjectDetails>()
        this.init()
    }

    get projectObservable() : Observable<ProjectDetails> {
        return this._projectSubject
    }

    get project() : ProjectDetails {
        const self = this
        return {
            ...this._project,
            set headline(value) {
                self._project.headline = value
                self._projectSubject.next(self._project)
            },
            get headline() {
                return self._project.headline
            },
            set large_image(value) {
                self._project.large_image = value
                self._projectSubject.next(self._project)
            },
            get large_image() {
                return self._project.large_image
            },
            get video_url() {
                return self._project.video_url
            },
            set video_url(value) {
                self._project.video_url = value
            }
        }
    }
    
    get isLoadingProject() : boolean {
        return this._isLoadingProject
    }

    get isSaving() : boolean {
        return this._isSavingProject
    }

    getErrors(field : string) : string[] {
        return this._errors[field] || []
    }
    
    async save(fields : string[], requiredFields : string[], cardImageFile : File | undefined) {
        try {
            this.clearErrors()
            this._isSavingProject = true

            h.redraw()
            let someInvalidation = false
            if (requiredFields.includes('uploaded_image')) {
                someInvalidation = await this.uploadCardImage(cardImageFile)
            }
            const requiredFieldsWithoutUploadedImage = requiredFields.filter(rf => rf !== 'uploaded_image')
            return someInvalidation && (await this.saveFields(fields, requiredFieldsWithoutUploadedImage))
        } catch(e) {
            return false
        } finally {
            this._isSavingProject = false
            h.redraw()
        }
    }

    private async saveFields(fields : string[], requiredFields : string[]) {
        
        this._isSavingProject = true
        
        h.redraw()

        const projectDataToSave = {}
        for (const field of fields) {
            projectDataToSave[field] = this._project[field]
        }

        let manualErrorsSet = false

        for (const field of requiredFields) {
            if (!projectDataToSave[field]) {
                this.setErrorOnField('headline', this.conditionalI18n('headline.blank'))
                manualErrorsSet = true
            }
        }

        if (manualErrorsSet) {
            h.redraw()
            return
        }

        const requestOptions = {
            method: 'PUT',
            url: `/projects/${this.project_id}.json`,
            data: { project: projectDataToSave },
            config: h.setCsrfToken,
        }

        try {
            await m.request(requestOptions)
            return true
        } catch(error) {
            const railsError = error as RailsErrors
            console.log('railsError.errors_json', railsError.errors_json)
            const railsErrorJson = JSON.parse(railsError.errors_json)
            for (const field of railsErrorJson) {
                if (typeof railsErrorJson[field] === 'string') {
                    this.setErrorOnField(field, railsErrorJson[field])
                } else {
                    for (const message of railsErrorJson[field]) {
                        this.setErrorOnField(field, message)
                    }
                }
            }
            return false
        } finally {
            this._isSavingProject = false
            h.redraw()
        }        
    }

    private async uploadCardImage(coverImageFile : File | null) : Promise<boolean> {
        if (!coverImageFile) {
            this.setErrorOnField('uploaded_image', this.conditionalI18n('uploaded_image.blank'))
            return false
        } else {
            const data = new FormData()
            data.append('uploaded_image', coverImageFile)
            const requestOptions = {
                method: 'POST',
                url: `/projects/${this.project_id}/upload_image.json`,
                data,
                config: h.setCsrfToken,
            }
            await m.request(requestOptions)
            return true
        }
    }

    private setErrorOnField(field : string, message : string) {
        this._errors[field] = (this._errors[field] || []).concat(message)
    }
    
    private clearErrors() {
        this._errors = {}
    }

    private async init() {
        this._project = await this.fetchProject()
        this._projectSubject.next(this._project)
    }

    private async fetchProject() {
        try {
            this._isLoadingProject = true
            const filter = catarse.filtersVM({ project_id: 'eq' }).project_id(this.project_id)
            const getRowParamenters = models.projectDetail.getRowOptions(filter.parameters())
            return (await catarse.loaderWithToken(getRowParamenters).load())[0]
        } catch(e) {
            throw e
        } finally {
            this._isLoadingProject = false
            h.redraw()
        }
    }

    private conditionalI18n(path : string, params = {}) {
        if (this._project.mode === 'flex') {
            return I18n.t(`flexible_project.attributes.${path}`, I18nScope(params))
        } else {
            return I18n.t(`project.attributes.${path}`, I18nScope(params))
        }
    }
}