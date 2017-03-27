import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const error = m.prop(''),
    rewards = m.prop([]),
    states = m.prop([]),
    fees = m.prop([]),
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

const getFees = (reward) => {
    const feesFilter = postgrest.filtersVM({
        reward_id: 'eq'
    });

    feesFilter.reward_id(reward.id);
    const feesLoader = postgrest.loader(models.shippingFee.getPageOptions(feesFilter.parameters()));
    return feesLoader.load();
};

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
        error('');
        selectedReward(reward);
        contributionValue(h.applyMonetaryMask(`${reward.minimum_value},00`));
        getFees(reward).then(fees);
    }
};

const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

const statesLoader = postgrest.loader(models.state.getPageOptions());
const getStates = () => {
    statesLoader.load().then(states);
    return states;
};

const locationOptions = (reward, destination) => {
    const options = m.prop([]),
        mapStates = _.map(states(), (state) => {
            let fee;
            const feeState = _.findWhere(fees(), {
                destination: state.acronym
            });
            const feeOthers = _.findWhere(fees(), {
                destination: 'others'
            });
            if (feeState) {
                fee = feeState.value;
            } else if (feeOthers) {
                fee = feeOthers.value;
            }

            return {
                name: state.name,
                value: state.acronym,
                fee
            };
        });
    if (reward.shipping_options === 'national') {
        options(mapStates);
    } else if (reward.shipping_options === 'international') {
        const fee = _.where(fees(), {
            destination: 'international'
        });
        options(_.union([{
            value: 'international',
            name: 'Outside Brazil',
            fee
        }], mapStates));
    }

    if (!destination()) {
        const firstOption = _.first(options());
        if (firstOption) {
            destination(firstOption.value);
        }
    }

    return options();
};

const shippingFeeForCurrentReward = (selectedDestination) => {
    let currentFee = _.findWhere(fees(), {
        destination: selectedDestination()
    });

    if (!currentFee && _.findWhere(states(), { acronym: selectedDestination() })) {
        currentFee = _.findWhere(fees(), {
            destination: 'others'
        });
    }

    return currentFee;
};

const rewardVM = {
    error,
    getStates,
    getFees,
    fees,
    rewards,
    applyMask,
    noReward,
    fetchRewards,
    selectReward,
    getSelectedReward,
    selectedReward,
    contributionValue,
    rewardsLoader,
    locationOptions,
    shippingFeeForCurrentReward,
    statesLoader,
    getValue: contributionValue,
    setValue: contributionValue
};

export default rewardVM;
