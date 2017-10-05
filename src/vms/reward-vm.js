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
        id: null,
        description: 'Obrigado. Eu só quero ajudar o projeto.',
        shipping_options: null,
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

const rewardLoader = (rewardId) => {
    const rewardvm = postgrest.filtersVM({
        id: 'eq'
    });
    rewardvm.id(rewardId);

    return postgrest.loaderWithToken(models.rewardDetail.getPageOptions(rewardvm.parameters()));
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

        if (reward.id) {
            getFees(reward).then(fees);
        }
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
        let fee;
        const feeInternational = _.findWhere(fees(), {
            destination: 'international'
        });
        if (feeInternational) { fee = feeInternational.value; }
        options(_.union([{
            value: 'international',
            name: 'Outside Brazil',
            fee
        }], mapStates));
    }

    options(
        _.union(
            [{ value: '', name: 'Selecione Opção', fee: 0 }],
            options()
        )
    );

    return options();
};

const shippingFeeById = feeId => _.findWhere(fees(), {
    id: feeId
});

const getOtherNationalStates = () => _.reject(
    states(),
    state => !_.isUndefined(_.findWhere(fees(), { destination: state.acronym }))
);

const feeDestination = (reward, feeId) => {
    const fee = shippingFeeById(feeId) || {};
    const feeState = _.findWhere(states(), { acronym: fee.destination });

    if (feeState) {
        return feeState.acronym;
    } else if (reward.shipping_options === 'national' && fee.destination === 'others') {
        return _.pluck(getOtherNationalStates(fees), 'acronym').join(', ');
    }

    return fee.destination;
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

const createReward = (projectId, rewardData) => m.request({
    method: 'POST',
    url: `/projects/${projectId}/rewards.json`,
    data: { reward: rewardData },
    config: h.setCsrfToken
});

const updateReward = (projectId, rewardId, rewardData) => m.request({
    method: 'PATCH',
    url: `/projects/${projectId}/rewards/${rewardId}.json`,
    data: { reward: rewardData },
    config: h.setCsrfToken
});

const canEdit = (reward, projectState, user) => (user || {}).is_admin || (projectState === 'draft' || (projectState === 'online' && reward.paid_count() <= 0 && reward.waiting_payment_count() <= 0));

const canAdd = (projectState, user) => (user || {}).is_admin || projectState === 'draft' || projectState === 'online';

const hasShippingOptions = reward => !(_.isNull(reward.shipping_options) || reward.shipping_options === 'free' || reward.shipping_options === 'presential');

const rewardVM = {
    canEdit,
    canAdd,
    error,
    getStates,
    getFees,
    rewardLoader,
    fees,
    rewards,
    applyMask,
    noReward,
    fetchRewards,
    selectReward,
    getSelectedReward,
    selectedReward,
    contributionValue,
    updateReward,
    createReward,
    rewardsLoader,
    locationOptions,
    shippingFeeForCurrentReward,
    shippingFeeById,
    statesLoader,
    feeDestination,
    getValue: contributionValue,
    setValue: contributionValue,
    hasShippingOptions
};

export default rewardVM;
