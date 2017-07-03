import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userContributedBox from './user-contributed-box';

const userContributionDetail = {
    controller(args) {
        const contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _.findWhere(rewardDetails(), {
                id: contribution.reward_id
            });

        return {
            contribution,
            chosenReward
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution;

        return m(userContributedBox, { contribution });
    }
};

export default userContributionDetail;
