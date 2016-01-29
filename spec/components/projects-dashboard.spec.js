describe('ProjectsDashboard', () => {
    let $output, projectDetail,
        ProjectsDashboard = window.c.root.ProjectsDashboard;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = ProjectDetailsMockery()[0];
            let component = m.component(ProjectsDashboard, {
                project_id: projectDetail.project_id,
                project_user_id: projectDetail.user.id,
            });
            $output = mq(component);
        });

        it('should render project about and reward list', () => {
            expect($output.has('.project-nav-wrapper')).toBeTrue();
        });
    });
});
