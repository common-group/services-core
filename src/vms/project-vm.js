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
    idVM.id(project_user_id);

    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
          lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

    userVM.fetchUser(project_user_id, true, userDetails);

    rewardVM.fetchRewards(project_id);

    lProject.load().then(_.compose(currentProject, _.first));
};

const routeToProject = () => (project, ref) => {
    currentProject(project);

    m.route(h.buildLink(project.permalink, ref), {project_id: project.project_id, project_user_id: project.project_user_id});

    return false;
};

const projectVM = {
    currentProject: currentProject,
    userDetails: userDetails,
    rewardDetails: rewardVM.rewards,
    routeToProject: routeToProject,
    init: init
};


export default projectVM;
