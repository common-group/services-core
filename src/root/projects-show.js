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
        const {project_id, project_user_id} = args;

        h.analytics.windowScroll({cat: 'project_view',act: 'project_page_scroll'});

        if (project_id) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }

        return projectVM;
    },
    view(ctrl, args) {
        const project = ctrl.currentProject;

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
                    post_id: args.post_id,
                    rewardDetails: ctrl.rewardDetails
                }),
                (project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
                    project: project
                }) : '')
            ]);
    }
};

export default projectsShow;
