describe('ProjectPosts', () => {
    let $output, projectPostDetail,
        ProjectPosts = window.c.ProjectPosts;

    describe('view', () => {
        beforeAll(() => {
            spyOn(m, 'component').and.callThrough();
            projectPostDetail = ProjectPostDetailsMockery()[0];
            const project = m.prop({id: 1231});
            const component = m.component(ProjectPosts, {
                    project: project
                }),
                view = component.view(component.controller({
                    project: project
                }));

            $output = mq(view);
        });

        it('should render project post list', () => {
            expect($output.find('.post').length).toEqual(1);
            expect($output.contains(projectPostDetail.title)).toEqual(true);
        });
    });
});