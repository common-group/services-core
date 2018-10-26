import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import projectRewardList from './project-reward-list';
import projectGoalsBox from './project-goals-box';

const projectRewards = {
    view: function(ctrl, args) {
        return m('.w-col.w-col-12', [projectVM.isSubscription(args.project) ? args.subscriptionData() ? m(
            projectGoalsBox,
            { goalDetails: args.goalDetails, subscriptionData: args.subscriptionData }
        ) : h.loader() : '', m(projectRewardList, _.extend({}, {
            rewardDetails: args.rewardDetails,
            hasSubscription: args.hasSubscription
        }, args.c_opts))]);
    }
};

export default projectRewards;
