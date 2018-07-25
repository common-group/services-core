import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectGoalsEdit from '../c/project-goals-edit';

const projectEditGoals = {
    controller: function(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },

    view: function(ctrl, args) {
        return (ctrl.user() && ctrl.project() ? (ctrl.project().mode !== 'sub' ? '' : m(projectGoalsEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        })) : m('div', h.loader()));
    }
};

export default projectEditGoals;
