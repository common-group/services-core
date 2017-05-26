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

const fetchParallelData = (projectId, projectUserId) => {
    if (projectUserId) {
        userVM.fetchUser(projectUserId, true, userDetails);
    }

    rewardVM.fetchRewards(projectId);
};

// FIXME: should work with data-parameters that don't have project struct
// just ids: {project_id project_user_id user_id }
const getCurrentProject = () => {
    const root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');

    if (data) {
        const jsonData = JSON.parse(data);

        const { projectId, projectUserId } = jsonData; // legacy
        const { project_id, project_user_id}  = jsonData;

        // fill currentProject when jsonData has id and mode (legacy code)
        if(jsonData.id && jsonData.mode) {
            currentProject(jsonData);
        }

        m.redraw(true);

        init((project_id || projectId), (project_user_id || projectUserId));

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

const fetchProject = (projectId, handlePromise = true, customProp = currentProject) => {
    idVM.id(projectId);

    const lproject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(idVM.parameters()));

    return !handlePromise ? lproject.load() : lproject.load().then(_.compose(customProp, _.first));
};

const updateProject = (projectId, projectData) => m.request({
    method: 'PUT',
    url: `/projects/${projectId}.json`,
    data: { project: projectData },
    config: h.setCsrfToken
});


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
