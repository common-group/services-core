import m from 'mithril';
import {catarse} from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectInsights from '../c/project-insights';
import projectInsightsSub from '../c/project-insights-sub';

const insights = {
    controller(args) {
        const filtersVM = catarse.filtersVM({
                project_id: 'eq'
            }),
            projectDetails = m.prop([]),
            loader = catarse.loaderWithToken,
            setProjectId = () => {
                try {
                    const project_id = m.route.param('project_id');

                    filtersVM.project_id(project_id);
                } catch (e) {
                    filtersVM.project_id(args.root.getAttribute('data-id'));
                }
            };

        setProjectId();
        const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);

        return {
            l,
            filtersVM,
            projectDetails
        };
    },
    view(ctrl, args) {
        const project = _.first(ctrl.projectDetails()) || {
            user: {
                name: 'Realizador'
            }
        };

        if (!ctrl.l()) {
            project.user.name = project.user.name || 'Realizador';
        }

        return m('.project-insights', !ctrl.l() ? (
            project.mode === 'sub' ?
            m(projectInsightsSub, {
                args,
                project,
                l: ctrl.l,
                filtersVM: ctrl.filtersVM
            }) :
            m(projectInsights, {
                args,
                project,
                l: ctrl.l,
                filtersVM: ctrl.filtersVM
            })
        ) : h.loader());
    }
};

export default insights;
