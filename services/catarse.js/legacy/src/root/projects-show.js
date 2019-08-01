import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import projectHeader from '../c/project-header';
import projectTabs from '../c/project-tabs';
import projectMain from '../c/project-main';
import projectDashboardMenu from '../c/project-dashboard-menu';
import subscriptionVM from '../vms/subscription-vm';

const projectsShow = {
    oninit: function(vnode) {
        const {
            project_id,
            project_user_id,
            post_id
        } = vnode.attrs;
        const currentUser = h.getUser(),
            loading = prop(true),
            userProjectSubscriptions = prop([]);
        
        if (project_id && !_.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }

        if (post_id) {
            window.location.hash = '#posts';
        }

        try {
            h.analytics.windowScroll({
                cat: 'project_view',
                act: 'project_page_scroll',
                project: project_id ? {
                    id: project_id,
                    user_id: project_user_id
                } : null
            });
            setTimeout(function(){
                h.analytics.event({
                    cat: 'project_view',
                    act: 'project_page_view',
                    project: project_id ? {
                        id: project_id,
                        user_id: project_user_id
                    } : null
                }).call();
            },1000);
        } catch (e) {
            console.error(e);
        }

        const loadUserSubscriptions = () => {
            if (h.isProjectPage() && currentUser && loading()) {
                loading(false);
                if (projectVM.isSubscription(projectVM.currentProject())) {
                    const statuses = ['started', 'active', 'canceling', 'canceled', 'inactive'];
                    subscriptionVM
                        .getUserProjectSubscriptions(currentUser.common_id, projectVM.currentProject().common_id, statuses)
                        .then(userProjectSubscriptions)
                        .then(() => h.redraw());
                }
            }
        };

        const hasSubscription = () => !_.isEmpty(userProjectSubscriptions()) && _.find(userProjectSubscriptions(), sub => sub.project_id === projectVM.currentProject().common_id);

        vnode.state = {
            loadUserSubscriptions,
            projectVM,
            hasSubscription,
            userProjectSubscriptions
        };
    },
    view: function({state, attrs}) {
        const project = state.projectVM.currentProject,
            projectVM = state.projectVM;
        
        return m('.project-show', {
            oncreate: projectVM.setProjectPageTitle()
        }, project() ? [
            state.loadUserSubscriptions(),
            m(projectHeader, {
                project,
                hasSubscription: state.hasSubscription,
                userProjectSubscriptions: state.userProjectSubscriptions,
                subscriptionData: projectVM.subscriptionData,
                rewardDetails: projectVM.rewardDetails,
                userDetails: projectVM.userDetails,
                projectContributions: projectVM.projectContributions,
                goalDetails: projectVM.goalDetails
            }),
            m(projectTabs, {
                project,
                hasSubscription: state.hasSubscription,
                subscriptionData: projectVM.subscriptionData,
                rewardDetails: projectVM.rewardDetails
            }),
            m(projectMain, {
                project,
                post_id: attrs.post_id,
                hasSubscription: state.hasSubscription,
                rewardDetails: projectVM.rewardDetails,
                subscriptionData: projectVM.subscriptionData,
                goalDetails: projectVM.goalDetails,
                userDetails: projectVM.userDetails,
                projectContributions: projectVM.projectContributions
            }),
            (project() && project().is_owner_or_admin ? m(projectDashboardMenu, {
                project
            }) : '')
        ] : h.loader());
    }
};

export default projectsShow;
