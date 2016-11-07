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

        h.analytics.windowScroll({cat: 'project_view',act: 'project_page_scroll'});

        if (project_id && !_.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }

        return projectVM;
    },
    view(ctrl, args) {
        const project = ctrl.currentProject;

        if(project && project.project_id && _.contains([29706], project.project_id)) {
            try {
                (window.$zopim && window.$zopim.livechat)||(function(d,s){var z=window.$zopim=function(c){z._.push(c)},$=z.s=d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set._.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute('charset','utf-8');$.src='//v2.zopim.com/?2qPtIfZX0Exh5Szx5JUoUxWKqrTQI5Tm';z.t=+new Date;$.type='text/javascript';e.parentNode.insertBefore($,e)})(document,'script');
                setTimeout(function t(){
                    const c = window.$zopim && window.$zopim.livechat;
                    if(c) {
                        const u = h.getUser();
                        if(u) {
                            c.setEmail(u.email);
                            c.setName(u.name);
                        }
                        window.zE && window.zE.hide();
                    } else {
                        setTimeout(t, 1000);
                    }
                }, 1000);
            } catch(e) {
                console.error(e);
            }
        }

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
