import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse, commonAnalytics } from '../api';
import h from '../h';
import models from '../models';
import rewardVM from './reward-vm';
import projectGoalsVM from './project-goals-vm';
import userVM from './user-vm';

const currentProject = prop(),
    userDetails = prop(),
    subscriptionData = prop(),
    projectContributions = prop([]),
    vm = catarse.filtersVM({ project_id: 'eq' }),
    idVM = h.idVM;

const isSubscription = (project = currentProject) => {
    if (_.isFunction(project)) {
        return project() ? project().mode === 'sub' : false;
    }

    return project ? project.mode === 'sub' : false;
};

const fetchSubData = (projectUuid) => {
    const lproject = commonAnalytics.loaderWithToken(models.projectSubscribersInfo.postOptions({ id: projectUuid }));

    lproject.load().then((data) => {
        subscriptionData(data || {
            amount_paid_for_valid_period: 0,
            total_subscriptions: 0,
            total_subscribers: 0,
            new_percent: 0,
            returning_percent: 0
        });
    });
};

const setProject = project_user_id => (data) => {
    currentProject(_.first(data));
    if (isSubscription(currentProject())) {
        fetchSubData(currentProject().common_id);
    }

    if (!project_user_id) {
        userVM.fetchUser(currentProject().user_id, true, userDetails);
    }

    return currentProject;
};

const init = (project_id, project_user_id) => {
    vm.project_id(project_id);

    const lProject = catarse.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters()));

    fetchParallelData(project_id, project_user_id);

    return lProject
        .load()
        .then(setProject(project_user_id))
        .then(_ => m.redraw());
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
    projectGoalsVM.fetchGoals(projectId);
};

// FIXME: should work with data-parameters that don't have project struct
// just ids: {project_id project_user_id user_id }
const getCurrentProject = () => {
    const root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');

    if (data) {
        const jsonData = JSON.parse(data);

        const { projectId, projectUserId } = jsonData; // legacy
        const { project_id, project_user_id } = jsonData;

        // fill currentProject when jsonData has id and mode (legacy code)
        if (jsonData.id && jsonData.mode) {
            currentProject(jsonData);
        }

        init((project_id || projectId), (project_user_id || projectUserId));

        m.redraw();

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

    const lproject = catarse.loaderWithToken(models.projectDetail.getRowOptions(idVM.parameters()));

    if (!handlePromise) {
        return lproject.load();
    } else {
        lproject
            .load()
            .then(_.compose(customProp, _.first))
            .then(_ => m.redraw());
        return customProp;
    }
};


const updateProject = (projectId, projectData) => m.request({
    method: 'PUT',
    url: `/projects/${projectId}.json`,
    data: { project: projectData },
    config: h.setCsrfToken
});

const subscribeActionKey = 'subscribeProject';
const storeSubscribeAction = (route) => {
    h.storeAction(subscribeActionKey, route);
};

const checkSubscribeAction = () => {
    const actionRoute = h.callStoredAction(subscribeActionKey);
    if (actionRoute) {
        m.route.set(actionRoute);
    }
};


const projectVM = {
    userDetails,
    getCurrentProject,
    projectContributions,
    currentProject,
    rewardDetails: rewardVM.rewards,
    goalDetails: projectGoalsVM.goals,
    routeToProject,
    setProjectPageTitle,
    init,
    fetchProject,
    fetchSubData,
    subscriptionData,
    updateProject,
    isSubscription,
    storeSubscribeAction,
    checkSubscribeAction
};

export default projectVM;
