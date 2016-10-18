import m from 'mithril';
import projectAbout from '../../src/c/project-about';

describe('ProjectAbout', () => {
    let $output, projectDetail, rewardDetail;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = ProjectDetailsMockery()[0];
            rewardDetail = RewardDetailsMockery()[0];
            let component = m.component(projectAbout, {
                    project: m.prop(projectDetail),
                    rewardDetails: m.prop(RewardDetailsMockery())
                }),
                view = component.view();
            $output = mq(view);
        });

        it('should render project about and reward list', () => {
            expect($output.contains(projectDetail.about_html)).toEqual(true);
            expect($output.contains(rewardDetail.description)).toEqual(true);
        });
    });
});
