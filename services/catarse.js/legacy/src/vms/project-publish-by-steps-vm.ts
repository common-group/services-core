import { Subject, Observable } from 'rxjs'
import { catarse } from '../api'
import models from '../models'
import { ProjectDetails } from "../@types/project-details"
import h from '../h'

export class ProjectPublishByStepsVM {

    private _project : ProjectDetails | null
    private _projectSubject : Subject<ProjectDetails>
    private _isLoadingProject : boolean

    constructor(private project_id : number) {
        this._project = null
        this._isLoadingProject = true
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
            }
        }
    }
    
    get isLoadingProject() : boolean {
        return this._isLoadingProject
    }
    
    save(fields : string[]) {
        
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
}