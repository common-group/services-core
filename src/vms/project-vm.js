import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import rewardVM from './reward-vm';
import userVM from './user-vm';

const idVM = h.idVM,
      currentProject = m.prop(),
      userDetails = m.prop(),
      projectContributions = m.prop([]),
      vm = postgrest.filtersVM({project_id: 'eq'});

const setProject = (project_user_id) => (data) => {
    currentProject(_.first(data));

    if (!project_user_id) {
        userVM.fetchUser(currentProject().user_id, true, userDetails);
    }

    return currentProject;
};

const init = (project_id, project_user_id) => {
    vm.project_id(project_id);

    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters()));

    fetchParallelData(project_id, project_user_id);

    /*try {
        if(project_id && _.contains([29706], project_id)) {
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
        }
    } catch(e) {
        console.error(e);
    }*/

    return lProject.load().then(setProject(project_user_id));
};

const resetData = () => {
    userDetails({});
    rewardVM.rewards([]);
};

const fetchParallelData = (project_id, project_user_id) => {
    if (project_user_id) {
        userVM.fetchUser(project_user_id, true, userDetails);
    }

    rewardVM.fetchRewards(project_id);
};

const getCurrentProject = () => {
    const root = document.getElementById('application'),
          data = root && root.getAttribute('data-parameters');

    if (data) {
        const {project_id, project_user_id} = currentProject(JSON.parse(data));

        m.redraw(true);

        init(project_id, project_user_id);

        return currentProject();
    } else {
        return false;
    }
};

const routeToProject = (project, ref) => () => {
    currentProject(project);

    resetData();

    m.route(h.buildLink(project.permalink, ref), {project_id: project.project_id, project_user_id: project.project_user_id});

    return false;
};

const setProjectPageTitle = () => {
    if (currentProject()) {
        const projectName = currentProject().project_name || currentProject().name;

        return projectName ? h.setPageTitle(projectName) : Function.prototype;
    }
};

const projectVM = {
    userDetails: userDetails,
    getCurrentProject: getCurrentProject,
    projectContributions: projectContributions,
    currentProject: currentProject,
    rewardDetails: rewardVM.rewards,
    routeToProject: routeToProject,
    setProjectPageTitle: setProjectPageTitle,
    init: init
};

export default projectVM;
