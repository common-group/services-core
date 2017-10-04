import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const goals = m.prop([]),
    vm = postgrest.filtersVM({
        project_id: 'eq'
    });

const goalsLoader = (projectId) => {
    vm.project_id(projectId);

    return postgrest.loaderWithToken(models.goalDetail.getPageOptions(vm.parameters()));
};

const fetchGoals = projectId => goalsLoader(projectId).load().then((data) => {
    _.map(data, (goal) => {
        const goalProp = m.prop({
            id: m.prop(goal.id),
            project_id: m.prop(projectId),
            value: m.prop(goal.value),
            title: m.prop(goal.title),
            description: m.prop(goal.description)
        });
        goals().push(goalProp);
    });
}

);

const createGoal = (projectId, goalData) => m.request({
    method: 'POST',
    url: `/projects/${projectId}/goals.json`,
    data: { goal: goalData },
    config: h.setCsrfToken
});

const updateGoal = (projectId, goalId, goalData) => m.request({
    method: 'PATCH',
    url: `/projects/${projectId}/goals/${goalId}.json`,
    data: { goal: goalData },
    config: h.setCsrfToken
});

const projectGoalsVM = {
    goals,
    fetchGoals,
    updateGoal,
    createGoal,
    goalsLoader
};

export default projectGoalsVM;
