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
      vm = postgrest.filtersVM({project_id: 'eq'});

const init = (project_id, project_user_id) => {
    vm.project_id(project_id);
    
    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters()));
    
    fetchParallelData(project_id, project_user_id);

    return lProject.load().then((data) => currentProject(_.first(data)));
};

const fetchParallelData = (project_id, project_user_id) => {
    userVM.fetchUser(project_user_id, true, userDetails);

    rewardVM.fetchRewards(project_id);
};

const getCurrentProject = () => {
    const root = document.getElementById('application'),
          data = root && root.getAttribute('data-parameters');
    
    if (data) {
        const {project_id, project_user_id} = currentProject(JSON.parse(data));

        m.redraw(true);

        fetchParallelData(project_id, project_user_id);
        
        return currentProject();
    } else {
        return false;
    }
};

const routeToProject = (project, ref) => () => {
    currentProject(project);

    return m.route(h.buildLink(project.permalink, ref), {project_id: project.project_id, project_user_id: project.project_user_id});
};

const setProjectPageTitle = () => {
    const projectName = currentProject().name || currentProject().project_name;

    return projectName ? h.setPageTitle(projectName) : Function.prototype;
};

const projectVM = {
    userDetails: userDetails,
    getCurrentProject: getCurrentProject,
    currentProject: currentProject,
    rewardDetails: rewardVM.rewards,
    routeToProject: routeToProject,
    setProjectPageTitle: setProjectPageTitle,
    init: init
};


export default projectVM;
