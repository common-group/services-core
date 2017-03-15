import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const error = m.prop(''),
    rewards = m.prop([]),
    noReward = {
        id: -1,
        description: 'Obrigado. Eu só quero ajudar o projeto.',
        minimum_value: 10
    },
    contributionValue = m.prop(`${noReward.minimum_value},00`),
    selectedReward = m.prop(noReward),
    vm = postgrest.filtersVM({
        project_id: 'eq'
    });

const rewardsLoader = (project_id) => {
    vm.project_id(project_id);

    return postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters()));
};

const fetchRewards = project_id => rewardsLoader(project_id).load().then(rewards);

const getSelectedReward = () => {
    const root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        const contribution = JSON.parse(data);
        const reward = selectedReward(contribution.reward);

        m.redraw(true);

        return selectedReward;
    }
    return false;
};

const selectReward = reward => () => {
    if (rewardVM.selectedReward() !== reward) {
        rewardVM.selectedReward(reward);

        contributionValue(h.applyMonetaryMask(`${reward.minimum_value},00`));
    }
};

const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

const getFees = (reward) => {
    const feesFilter = postgrest.filtersVM({
        reward_id: 'eq'
    });

    feesFilter.reward_id(reward.id || 0);
    const feesLoader = postgrest.loader(models.shippingFee.getPageOptions(feesFilter.parameters()));
    return feesLoader;
};

const getStates = () => postgrest.loader(models.state.getPageOptions());

const rewardVM = {
    error,
    getStates,
    getFees,
    rewards,
    applyMask,
    noReward,
    fetchRewards,
    selectReward,
    getSelectedReward,
    selectedReward,
    contributionValue,
    rewardsLoader,
    getValue: contributionValue,
    setValue: contributionValue
};

export default rewardVM;
