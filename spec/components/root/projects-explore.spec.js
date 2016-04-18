describe('ProjectsExplore', () => {
    let $output, project, component,
        ProjectsExplore = window.c.root.ProjectsExplore;

    beforeAll(() => {
        window.location.hash = '#by_category_id/1';

        component = m.component(ProjectsExplore);
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

});
