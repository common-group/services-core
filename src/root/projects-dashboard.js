/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
window.c.root.ProjectsDashboard = ((m, c, h, _, vms) => {
    return {

        controller: (args) => {
            return vms.project(args.project_id, args.project_user_id);
        },

        view: (ctrl) => {
            const project = ctrl.projectDetails;
            return project().is_owner_or_admin ?
                m.component(c.ProjectDashboardMenu, {project: project}) : '';
        }
    };
}(window.m, window.c, window.c.h, window._, window.c.vms));
