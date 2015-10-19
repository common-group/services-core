describe('ProjectShareBox', () => {
    let $output, projectDetail,
        ProjectShareBox = window.c.ProjectShareBox;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = ProjectDetailsMockery()[0];
            let args = {
                    project: projectDetail,
                    displayShareBox: {
                        toggle: jasmine.any(Function)
                    }
                },
                component = m.component(ProjectShareBox, args),
                view = component.view(component.controller(), args);
            $output = mq(ProjectShareBox, args);
        });

        it('should render project project share pop', () => {
            $output.should.have('.pop-share');
            $output.should.have('.w-widget-facebook');
            $output.should.have('.w-widget-twitter');
            $output.should.have('.widget-embed');
        });

        it('should open embed box when click on embed', () => {
            $output.click('a.widget-embed');
            $output.should.have('.embed-expanded');
        });
    });
});