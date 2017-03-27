import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import rewardVM from './reward-vm';
import userVM from './user-vm';

const currentProject = m.prop(),
      userDetails = m.prop(),
      projectContributions = m.prop([]),
      vm = postgrest.filtersVM({ project_id: 'eq' }),
      idVM = h.idVM;

const setProject = project_user_id => (data) => {
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
        const { project_id, project_user_id } = currentProject(JSON.parse(data));

        m.redraw(true);

        init(project_id, project_user_id);

        return currentProject();
    }
    return false;
};

const routeToProject = (project, ref) => () => {
    currentProject(project);

    resetData();

    m.route(h.buildLink(project.permalink, ref), { project_id: project.project_id, project_user_id: project.project_user_id });

    return false;
};

const setProjectPageTitle = () => {
    if (currentProject()) {
        const projectName = currentProject().project_name || currentProject().name;

        return projectName ? h.setPageTitle(projectName) : Function.prototype;
    }
};

const fetchProject = (project_id, handlePromise = true, customProp = currentProject) => {
    idVM.id(project_id);

    const lproject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(idVM.parameters()));

    return !handlePromise ? lproject.load() : lproject.load().then(_.compose(customProp, _.first));
};

const updateProject = (project_id, projectData) => {
    return m.request({
        method: 'PUT',
        url: `/projects/${project_id}.json`,
        data: { project: projectData },
        config: h.setCsrfToken
    });
}


const projectVM = {
    userDetails,
    getCurrentProject,
    projectContributions,
    currentProject,
    rewardDetails: rewardVM.rewards,
    routeToProject,
    setProjectPageTitle,
    init,
    fetchProject,
    updateProject
};

export default projectVM;
