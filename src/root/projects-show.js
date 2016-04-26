import m from 'mithril';
import _ from 'underscore';
import h from 'h';
import projectVM from 'project-vm';
import projectHeader from 'project-header';
import projectTabs from 'project-tabs';
import projectMain from 'project-main';
import projectDashboardMenu from 'project-dashboard-menu';

const projectsShow = {
    controller (args) {
        return projectVM(args.project_id, args.project_user_id);
    },
    view (ctrl) {
        const project = ctrl.projectDetails;

        return m('.project-show', [
                m.component(projectHeader, {
                    project: project,
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
