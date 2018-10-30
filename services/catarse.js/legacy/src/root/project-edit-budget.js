import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectBudgetEdit from '../c/project-budget-edit';

const projectEditBudget = {
    oninit: function(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id),
            project: projectVM.fetchProject(vnode.attrs.project_id)
        };
    },

    view: function({state, attrs}) {
        return (ctrl.user() && ctrl.project() ? m(projectBudgetEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader()));
    }
};

export default projectEditBudget;
