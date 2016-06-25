/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsDashboard = {
    controller(args) {
        projectVM.init(args.project_id, args.project_user_id);

        return projectVM;
    },
    view(ctrl) {
        const project = ctrl.currentProject;

        return project().is_owner_or_admin ?
            m.component(projectDashboardMenu, {project: project}) : '';
    }
};

export default projectsDashboard;
