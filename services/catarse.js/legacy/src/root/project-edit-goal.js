import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectGoalEdit from '../c/project-goal-edit';

const projectEditGoal = {
    oninit: function(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id),
            project: projectVM.fetchProject(vnode.attrs.project_id)
        };
    },

    view: function(ctrl, args) {
        return (ctrl.user() && ctrl.project() ? (ctrl.project().mode === 'sub' ? '' : m(projectGoalEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        })) : m('div', h.loader()));
    }
};

export default projectEditGoal;
