/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
window.c.root.ProjectsDashboard = ((m, c, h, _) => {
    return {

        controller: () => {
            alert('dashboard');
        },

        view: (ctrl) => {}
    };
}(window.m, window.c, window.c.h, window._));
