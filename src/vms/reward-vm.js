import postgrest from 'mithril-postgrest';
import models from '../models';

const rewards = m.prop([]),
    contributionValue = m.prop(0),
    selectedReward = m.prop({}),
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


const rewardVM = {
    rewards: rewards,
    fetchRewards: fetchRewards,
    selectedReward: selectedReward,
    rewardsLoader: rewardsLoader,
    getValue: contributionValue,
    setValue: contributionValue
};

export default rewardVM;
