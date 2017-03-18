import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const error = m.prop(''),
    rewards = m.prop([]),
    states = m.prop([]),
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

const rewardsLoader = (projectId) => {
    vm.project_id(projectId);

    return postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters()));
};

const fetchRewards = projectId => rewardsLoader(projectId).load().then(rewards);

const getSelectedReward = () => {
    const root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        const contribution = JSON.parse(data);

        selectedReward(contribution.reward);
        m.redraw(true);

        return selectedReward;
    }

    return false;
};

const selectReward = reward => () => {
    if (selectedReward() !== reward) {
        selectedReward(reward);

        contributionValue(h.applyMonetaryMask(`${reward.minimum_value},00`));
    }
};

const selectDestination = m.prop('');

const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

const getFees = (reward) => {
    const feesFilter = postgrest.filtersVM({
        reward_id: 'eq'
    });

    feesFilter.reward_id(reward.id || 0);
    const feesLoader = postgrest.loader(models.shippingFee.getPageOptions(feesFilter.parameters()));
    return feesLoader;
};

const statesLoader = postgrest.loader(models.state.getPageOptions());
const getStates = () => {
    statesLoader.load().then(states);
    return states;
};

const locationOptions = (reward) => {
    const options = m.prop([]),
        mapStates = _.map(states(), state => ({ value: state.acronym, name: state.name }));

    if (reward.shipping_options === 'national') {
        options(mapStates);
    } else if (reward.shipping_options === 'international') {
        options(_.union([{ value: 'international', name: 'Outside Brazil' }], mapStates));
    }

    return options();
};

const canEdit = (reward, project_state) => project_state === 'draft' || reward.paid_count <= 0;

const rewardVM = {
    error,
    canEdit,
    getStates,
    getFees,
    rewards,
    applyMask,
    noReward,
    fetchRewards,
    selectDestination,
    selectReward,
    getSelectedReward,
    selectedReward,
    contributionValue,
    rewardsLoader,
    locationOptions,
    getValue: contributionValue,
    setValue: contributionValue,
    selectedDestination: selectDestination
};

export default rewardVM;
