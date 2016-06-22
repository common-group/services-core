import projectVM from './project-vm';
import postgrest from 'mithril-postgrest';
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

const fetchRewards = (project_id) => {
    return rewardsLoader(project_id).load().then(rewards);
};

const submitContribution = () => {
    const valueFloat = h.monetaryToFloat(contributionValue);

    if (valueFloat < selectedReward().minimum_value) {
        error(`O valor de apoio para essa recompensa deve ser de no mínimo R$${selectedReward().minimum_value}`);

        return false;
    } else {
        if (!h.getUser()) {
            h.storeObject(storeKey, {value: valueFloat, reward: selectedReward()});

            return h.navigateToDevise('/' + projectVM.currentProject().permalink);
        } else {
            contributionValue(valueFloat);

            m.route(`/projects/${projectVM.currentProject().id}/payment`, {
                project_user_id: projectVM.currentProject().user_id
            });

            return false;
        }
    }


};

const selectReward = (reward) => () => {
    if (rewardVM.selectedReward() !== reward){
        rewardVM.selectedReward(reward);

        contributionValue(h.applyMonetaryMask(reward.minimum_value + ',00'));
    }
}

const applyMask = _.compose(contributionValue, h.applyMonetaryMask);

const rewardVM = {
    error: error,
    rewards: rewards,
    applyMask: applyMask,
    noReward: noReward,
    fetchRewards: fetchRewards,
    selectReward: selectReward,
    selectedReward: selectedReward,
    submitContribution: submitContribution,
    contributionValue: contributionValue,
    rewardsLoader: rewardsLoader,
    getValue: contributionValue,
    setValue: contributionValue
};

export default rewardVM;
