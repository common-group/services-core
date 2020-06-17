import m from 'mithril';
import h from '../../../h';
import { CardEdit } from './card-edit';
import { ProjectPublishByStepsVM } from '../../../vms/project-publish-by-steps-vm';
import { ProjectDetails } from '../../../@types/project-details';
import { DescriptionEdit } from './description-edit';
import { AskAboutReward } from './ask-about-reward';
import { RewardsEdit } from './rewards-edit';

// '/projects/:id/publish-by-steps/card': wrap({})
// '/projects/:id/publish/description': 
// '/projects/:id/publish/ask-about-reward': 
// '/projects/:id/publish/rewards': 
// '/projects/:id/publish/user': 
// '/projects/:id/publish/to-do': 
// '/projects/:id/publish/share': 
// '/projects/:id/publish/share-reminder': 

type ProjectsPublishByStepsAttrs = {
    project_id: number
}

type ProjectsPublishByStepsState = {
    projectPublishByStepsVM: ProjectPublishByStepsVM
}

type ProjectsPublishByStepsVnode = m.Vnode<ProjectsPublishByStepsAttrs, ProjectsPublishByStepsState>;

class ProjectsPublishBySteps implements m.Component<ProjectsPublishByStepsAttrs, ProjectsPublishByStepsState> {
    
    oninit({attrs, state} : ProjectsPublishByStepsVnode) {
        state.projectPublishByStepsVM = new ProjectPublishByStepsVM(attrs.project_id)
    }

    view({ state } : ProjectsPublishByStepsVnode) {

        const projectPublishByStepsVM = state.projectPublishByStepsVM

        if (projectPublishByStepsVM.isLoadingProject) {
            return h.loader()
        } else {
            
            const hash = window.location.hash

            switch(hash) {
                case '#card': {
                    return (
                        <CardEdit
                            project={projectPublishByStepsVM.project}
                            isSaving={projectPublishByStepsVM.isSaving}
                            save={async coverImageFile => {
                                const canProceed = await projectPublishByStepsVM.save(['uploaded_image', 'headline', 'video_url'], ['uploaded_image', 'headline'], coverImageFile)
                                if (canProceed) {
                                    window.location.hash = '#description'
                                }
                            }}
                            hasErrorOn={(field : string) => projectPublishByStepsVM.hasErrorOn(field)}
                            getFieldErrors={(field : string) => projectPublishByStepsVM.getErrors(field)} />
                    )
                }

                case '#description': {
                    return (
                        <DescriptionEdit 
                            project={projectPublishByStepsVM.project}
                            isSaving={projectPublishByStepsVM.isSaving}
                            save={async (goNext : boolean) => {
                                const fieldsToSave = ['goal', 'about_html', 'permalink', 'city_id']
                                const canProceed = await projectPublishByStepsVM.save(fieldsToSave, fieldsToSave)
                                if (canProceed && goNext) {
                                    window.location.hash = '#ask-about-reward'
                                }
                            }}
                            hasErrorOn={(field : string) => projectPublishByStepsVM.hasErrorOn(field)}
                            getFieldErrors={(field : string) => projectPublishByStepsVM.getErrors(field)} />
                    )
                }

                case '#ask-about-reward': {
                    return (
                        <AskAboutReward project={projectPublishByStepsVM.project} />
                    )
                }

                case '#rewards': {
                    return (
                        <RewardsEdit project={projectPublishByStepsVM.project} />
                    )
                }
    
                default: {
                    return (
                        <CardEdit
                            project={projectPublishByStepsVM.project}
                            isSaving={projectPublishByStepsVM.isSaving}
                            save={async coverImageFile => {
                                const canProceed = await projectPublishByStepsVM.save(['uploaded_image', 'headline', 'video_url'], ['uploaded_image', 'headline'], coverImageFile)
                                if (canProceed) {
                                    window.location.hash = '#description'
                                }
                            }}
                            hasErrorOn={(field : string) => projectPublishByStepsVM.hasErrorOn(field)}
                            getFieldErrors={(field : string) => projectPublishByStepsVM.getErrors(field)} />
                    )
                }
            }
        }
    }
}

export default ProjectsPublishBySteps