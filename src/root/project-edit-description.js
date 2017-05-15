import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectDescriptionEdit from '../c/project-description-edit';

const projectEditDescription = {
    controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },

    view(ctrl, args) {
        return (ctrl.user() && ctrl.project() ? m(projectDescriptionEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader()));
    }
};

export default projectEditDescription;
