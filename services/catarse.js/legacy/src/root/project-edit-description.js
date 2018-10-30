import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectDescriptionEdit from '../c/project-description-edit';
import projectDescriptionVideoEdit from '../c/project-description-video-edit';

const projectEditDescription = {
    oninit: function(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id),
            project: projectVM.fetchProject(vnode.attrs.project_id)
        };
    },

    view: function({state, attrs}) {
        const editComponent = projectVM.isSubscription(ctrl.project)
            ? projectDescriptionVideoEdit
            : projectDescriptionEdit;
        return (ctrl.user() && ctrl.project() ? m(editComponent, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader()));
    }
};

export default projectEditDescription;
