describe('ProjectPosts', () => {
    let $output, projectPostDetail,
        ProjectPosts = window.c.ProjectPosts;

    describe('view', () => {
        beforeAll(() => {
            spyOn(m, 'component').and.callThrough();
            projectPostDetail = ProjectPostDetailsMockery()[0];
            let component = m.component(ProjectPosts, {
                    project: {
                        id: 1231
                    }
                }),
                view = component.view(component.controller({
                    project: {
                        id: 1231
                    }
                }));

            $output = mq(view);
        });

        it('should render project post list', () => {
            expect($output.find('.post').length).toEqual(1);
            expect($output.contains(projectPostDetail.title)).toEqual(true);
        });
    });
});