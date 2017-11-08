import m from 'mithril';
import _ from 'underscore';
import projectRewardCard from './project-reward-card';
import projectReport from './project-report';

const projectRewardList = {
    view(ctrl, args) {
        const project = args.project() || {
            open_for_contributions: false
        };
        return m('#rewards', [
            m('.reward.u-marginbottom-30', _.map(_.sortBy(args.rewardDetails(), reward => Number(reward.row_order)), reward => m(projectRewardCard, { reward, project }))),
            args.showReport ? m.component(projectReport) : null
        ])
    }
};

export default projectRewardList;
