import { useEffect, useState, withHooks } from 'mithril-hooks'
import { ProjectDetails, UserDetails } from '../../entities'
import { Loader } from '../../shared/components/loader'
import PopNotification from '../../c/pop-notification'
import userVM from '../../vms/user-vm'
import './coming-soon-landing-page-bookmark-card.scss'
import h from '../../h'
import { getCurrentUserCached } from '../../shared/services/user/get-current-user-cached'
import { isLoggedIn } from '../../shared/services/user/is-logged-in'

export type ComingSoonLandingPageBookmarkCardRemindButtonProps = {
    project: ProjectDetails
    isFollowing: boolean
    remind(project: ProjectDetails)
    removeRemind(project: ProjectDetails)
}

export const ComingSoonLandingPageBookmarkCardRemindButton = withHooks<ComingSoonLandingPageBookmarkCardRemindButtonProps>(_ComingSoonLandingPageBookmarkCardRemindButton)

function _ComingSoonLandingPageBookmarkCardRemindButton(props: ComingSoonLandingPageBookmarkCardRemindButtonProps) {

    const {
        project,
        isFollowing,
        remind,
        removeRemind,
    } = props

    const [isLoading, setIsLoading] = useState(false)
    const [currentUserBookmarked, setCurrentUserBookmarked] = useState(isFollowing)

    // Pop notification properties
    const timeDisplayingPopup = 5000
    const [displayPopNotification, setDisplayPopNotification] = useState(false)
    const [popNotificationMessage, setPopNotificationMessage] = useState('')
    const [isPopNotificationError, setIsPopNotificationError] = useState(false)

    function redirectToLogin() {
        if (!isLoggedIn(getCurrentUserCached())) {
            h.storeAction('reminder', project.project_id)
            h.navigateToDevise(`?redirect_to=${location.pathname}`)
            return true
        }

        return false
    }

    const displayPopNotificationMessage = ({message, isError = false} : {message: string, isError?: boolean}) => {
        setPopNotificationMessage(message)
        setDisplayPopNotification(true)
        setIsPopNotificationError(isError)
        setTimeout(() => setDisplayPopNotification(false), timeDisplayingPopup)
    }

    const remindMe = async (event: Event) => {
        event.preventDefault()
        if (redirectToLogin()) return

        try {
            setIsLoading(true)
            await remind(project)
            setCurrentUserBookmarked(true)
            displayPopNotificationMessage({
                message: 'Você irá receber um email quando este projeto for publicado!'
            })
        } catch (error) {
            displayPopNotificationMessage({
                message: 'Error ao salvar lembrete.',
                isError: true
            })
        } finally {
            setIsLoading(false)
        }
    }

    const removeRemindMe = async (event: Event) => {
        event.preventDefault()
        try {
            setIsLoading(true)
            await removeRemind(project)
            setCurrentUserBookmarked(false)
            displayPopNotificationMessage({
                message: 'Ok, Removemos o lembrete por e-mail de quando a campanha for ao ar!'
            })
        } catch (error) {
            displayPopNotificationMessage({
                message: 'Error ao remover lembrete.',
                isError: true
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setCurrentUserBookmarked(project.in_reminder)
    }, [project.in_reminder])

    return (
        <div class="back-project-btn-div">
            {
                displayPopNotification &&
                <PopNotification
                    message={popNotificationMessage}
                    error={isPopNotificationError} />
            }
            <div class="back-project--btn-row">
                {
                    isLoading ?
                        <Loader />
                        :
                        currentUserBookmarked ?
                            <button onclick={removeRemindMe} class="btn btn-large btn-secondary">
                                <span class="fa fa-bookmark text-success"></span>&nbsp;
                                Projeto Salvo
                            </button>
                            :
                            <button onclick={remindMe} class="btn btn-large">
                                <span class="fa fa-bookmark-o"></span>&nbsp;
                                Avise-me do lançamento!
                            </button>
                }
                {
                    (project.reminder_count > 10 || project.is_owner_or_admin) &&
                    <div class="fontsize-smaller fontcolor-secondary fontweight-semibold u-text-center u-margintop-10">
                        {project.reminder_count} seguidores
                    </div>
                }
            </div>
        </div>
    )
}
