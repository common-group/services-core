describe('ProjectAbout', () => {
    let $output, projectDetail, rewardDetail,
        ProjectAbout = window.c.ProjectAbout;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = ProjectDetailsMockery()[0];
            rewardDetail = RewardDetailsMockery()[0];
            let component = m.component(ProjectAbout, {
                    project: projectDetail,
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