import m from 'mithril';
import projectHeader from '../../src/c/project-header';

describe('ProjectHeader', () => {
    let $output, projectDetail, rewardDetails, goalDetails;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = m.prop(ProjectDetailsMockery()[0]);
            rewardDetails = m.prop(RewardDetailsMockery());
            goalDetails = m.prop(GoalsMockery());
            $output = mq(m.component(projectHeader, {
                hasSubscription: m.prop(false),
                userProjectSubscriptions: m.prop([]),
                project: projectDetail,
                userDetails: m.prop([]),
                projectContributions: m.prop([]),
                rewardDetails: rewardDetails,
                goalDetails
            }));
        });

        it('should a project header', () => {
            expect($output.find('#project-header').length).toEqual(1);
            expect($output.contains(projectDetail().name)).toEqual(true);
        });

        it('should render project-highlight / project-sidebar component area', () => {
            expect($output.find('.project-highlight').length).toEqual(1);
            expect($output.find('#project-sidebar').length).toEqual(1);
        });
    });
});
