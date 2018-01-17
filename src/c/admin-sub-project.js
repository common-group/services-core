import m from 'mithril';
import h from '../h';
import projectVM from '../vms/project-vm';

const adminSubProject = {
    controller(args) {
        projectVM.fetchProject(args.item.project_external_id);
        return {
            projectVM
        };
    },

    view(ctrl, args) {
        const project = ctrl.projectVM.currentProject();
        return m('.w-row.admin-project', project ? [
            m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [
                m(`img.thumb-project.u-radius[src=${project.large_image}][width=50]`)
            ]),
            m('.w-col.w-col-9.w-col-small-9', [
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
                    m(`a.alt-link[target="_blank"][href="/${project.permalink}"]`, project.name)
                ]),
                // m('.fontsize-smallest.fontweight-semibold', project.state),
                m('.fontsize-smallest.fontcolor-secondary', `${h.momentify(project.zone_online_date)}`)
            ])
        ] : '');
    }
};

export default adminSubProject;
