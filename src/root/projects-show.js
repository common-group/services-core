import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import projectHeader from '../c/project-header';
import projectTabs from '../c/project-tabs';
import projectMain from '../c/project-main';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsShow = {
    controller(args) {
        h.analytics.windowScroll({cat: 'project_view',act: 'project_page_scroll'});

        return projectVM(args.project_id, args.project_user_id);
    },
    view(ctrl) {
        const project = ctrl.projectDetails || m.prop();

        console.log('I am rendering with ', project() ? 'project' : 'h.getProject');

        return m('.project-show', [
                m.component(projectHeader, {
                    project: project() ? project : h.getProject(),
                    userDetails: ctrl.userDetails
                }),
                m.component(projectTabs, {
                    project: project() ? project : h.getProject(),
                    rewardDetails: ctrl.rewardDetails
                }),
                m.component(projectMain, {
                    project: project() ? project : h.getProject(),
                    rewardDetails: ctrl.rewardDetails
                }),
                (project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
                    project: project() ? project : h.getProject()
                }) : '')
            ]);
    }
};

export default projectsShow;
