import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import projectHeader from '../c/project-header';
import projectTabs from '../c/project-tabs';
import projectMain from '../c/project-main';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsShow = {
    controller(args) {
        const {project_id, project_user_id} = args;

        h.analytics.event({cat:'project_view',act:'project_page_view',project:{id:project_id,user_id:project_user_id}});
        h.analytics.windowScroll({cat:'project_view',act:'project_page_scroll',project:{id:project_id,user_id:project_user_id}});

        if (project_id && !_.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }

        return projectVM;
    },
    view(ctrl, args) {
        const project = ctrl.currentProject;

        return m('.project-show',{
                config: ctrl.setProjectPageTitle()
            },[
                m.component(projectHeader, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails,
                    userDetails: ctrl.userDetails,
                    projectContributions: ctrl.projectContributions
                }),
                m.component(projectTabs, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }),
                m.component(projectMain, {
                    project: project,
                    post_id: args.post_id,
                    rewardDetails: ctrl.rewardDetails,
                    userDetails: ctrl.userDetails,
                    projectContributions: ctrl.projectContributions
                }),
                (project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
                    project: project
                }) : '')
            ]);
    }
};

export default projectsShow;
