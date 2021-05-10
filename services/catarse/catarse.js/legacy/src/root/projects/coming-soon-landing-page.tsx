import { ProjectHighlight } from './project-highlight'
import { ProjectDetails, UserDetails } from '../../entities'
import projectVM from '../../vms/project-vm'
import { withHooks } from 'mithril-hooks'
import './coming-soon-landing-page.css'
import { ComingSoonLandingPageBookmarkCard } from './coming-soon-landing-page-bookmark-card'

export type ComingSoonLandingPageProps = {
    style?: string
    project: ProjectDetails
    user: UserDetails
    isFollowing: boolean
    remind(project: ProjectDetails)
    removeRemind(project: ProjectDetails)
}

export const ComingSoonLandingPage = withHooks<ComingSoonLandingPageProps>(_ComingSoonLandingPage)

function _ComingSoonLandingPage({ style, project, user, isFollowing, remind, removeRemind }: ComingSoonLandingPageProps) {

    const isSubscriptionMode = projectVM.isSubscription(project)
    const hasBackground = Boolean(project.cover_image)
    const linearGradientWithProjectImage = `background-image: linear-gradient(180deg, rgba(0, 4, 8, .82), rgba(0, 4, 8, .82)), url('${project.cover_image}')`

    return (
        <div id='project-header' style={style} >
            <div class={`w-section section-product ${project.mode}`} />
            <div class={`project-main-container ${isSubscriptionMode ? 'dark' : ''} ${hasBackground ? 'project-with-background' : ''}`}
                style={hasBackground ? linearGradientWithProjectImage : ''}
            >
                <div class={`w-section project-main coming-soon ${isSubscriptionMode ? 'transparent-background' : ''}`}>
                    <div class='w-container'>
                        <div class='w-col w-col-8 project-highlight'>
                            <ProjectHighlight
                                hideEmbed={true}
                                project={project}
                                projectImageChild={
                                    <div class="flag">
                                        <div class="flag-container">
                                            <div>
                                                Em breve no Catarse
                                            </div>
                                        </div>
                                        <div class="flag-curve"></div>
                                    </div>
                                } />
                        </div>
                        <div class='w-col w-col-4'>
                            <ComingSoonLandingPageBookmarkCard
                                project={project}
                                user={user}
                                isFollowing={isFollowing}
                                remind={remind}
                                removeRemind={removeRemind} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
