import m from 'mithril';
import projectHeader from '../../src/c/project-header';

describe('ProjectHeader', () => {
    let $output, projectDetail, rewardDetails;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = m.prop(ProjectDetailsMockery()[0]);
            rewardDetails = m.prop(RewardDetailsMockery());
            $output = mq(m.component(projectHeader, {
                project: projectDetail,
                userDetails: m.prop([]),
                rewardDetails: rewardDetails
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
