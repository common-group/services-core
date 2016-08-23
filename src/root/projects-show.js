// TODO: Make work when directly loaded
// TODO: Make it choose the right reward when sending to contributions/new
// TODO: Make sure inter routing works
// TODO: Add Thank You Page
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
        const project_id = args.project_id || h.getCurrentProject().project_id,
            project_user_id = args.project_user_id || h.getCurrentProject().project_user_id;

        h.analytics.windowScroll({cat: 'project_view',act: 'project_page_scroll'});

        projectVM.init(project_id, project_user_id);

        return projectVM;
    },
    view(ctrl) {
        const project = ctrl.currentProject() ? ctrl.currentProject : m.prop({});

        console.log('Project in show component is: ', project());
        return m('.project-show', [
                m.component(projectHeader, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails,
                    userDetails: ctrl.userDetails
                }),
                m.component(projectTabs, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }),
                m.component(projectMain, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }),
                (project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
                    project: project
                }) : '')
            ]);
    }
};

export default projectsShow;
