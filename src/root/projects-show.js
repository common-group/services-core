import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import projectHeader from '../c/project-header';
import projectTabs from '../c/project-tabs';
import projectMain from '../c/project-main';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsShow = {
    controller(args) {
        const { project_id, project_user_id } = args;

        if (project_id && !_.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }
        try{
            h.analytics.windowScroll({ cat: 'project_view', act: 'project_page_scroll', project: project_id?{ id: project_id, user_id: project_user_id }:null });
            h.analytics.event({ cat: 'project_view', act: 'project_page_view', project: project_id?{ id: project_id, user_id: project_user_id }:null }).call();
        }catch(e){console.error(e);}
    
        return projectVM;
    },
    view(ctrl, args) {
        const project = ctrl.currentProject;

        return m('.project-show', {
            config: ctrl.setProjectPageTitle()
        }, project() ? [
            m.component(projectHeader, {
                project,
                rewardDetails: ctrl.rewardDetails,
                userDetails: ctrl.userDetails,
                projectContributions: ctrl.projectContributions
            }),
            m.component(projectTabs, {
                project,
                rewardDetails: ctrl.rewardDetails
            }),
            m.component(projectMain, {
                project,
                post_id: args.post_id,
                rewardDetails: ctrl.rewardDetails,
                userDetails: ctrl.userDetails,
                projectContributions: ctrl.projectContributions
            }),
                (project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
                    project
                }) : '')
        ] : h.loader());
    }
};

export default projectsShow;
