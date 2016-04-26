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
import h from 'h';
import projectVM from 'project-vm';
import projectDashboardMenu from 'project-dashboard-menu';

const projectsDashboard = {
    controller (args) {
        return projectVM(args.project_id, args.project_user_id);
    },
    view (ctrl) {
        const project = ctrl.projectDetails;
        return project().is_owner_or_admin ?
            m.component(projectDashboardMenu, {project: project}) : '';
    }
}

export default projectsDashboard;
