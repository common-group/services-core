import { catarse } from '../api';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const goals = m.prop([]),
    vm = catarse.filtersVM({
        project_id: 'eq'
    });

const goalsLoader = (projectId) => {
    vm.project_id(projectId);
    vm.order({
        value: 'asc'
    });

    return catarse.loaderWithToken(models.goalDetail.getPageOptions(vm.parameters()));
};

const addGoal = (projectId) => {
    goals().push(m.prop({
        id: m.prop(null),
        project_id: m.prop(projectId),
        editing: h.toggleProp(true, false),
        value: m.prop(''),
        title: m.prop(''),
        description: m.prop('')
    }));
};

const fetchGoals = projectId => goalsLoader(projectId).load().then(goals);

const fetchGoalsEdit = (projectId) => {
    if (_.isEmpty(goals())) {
        goalsLoader(projectId).load().then((data) => {
            _.map(data, (goal) => {
                const goalProp = m.prop({
                    id: m.prop(goal.id),
                    project_id: m.prop(projectId),
                    editing: h.toggleProp(false, true),
                    value: m.prop(goal.value),
                    title: m.prop(goal.title),
                    description: m.prop(goal.description)
                });
                goals().push(goalProp);
            });
            if (_.isEmpty(goals())) {
                addGoal(projectId);
            }
        });
    }
};

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
    fetchGoalsEdit,
    addGoal,
    updateGoal,
    createGoal,
    goalsLoader
};

export default projectGoalsVM;
