describe('ProjectMode', () => {
    let ProjectCard = window.c.ProjectMode,
        project, component, view, $output;

    describe('view', () => {
        beforeAll(() => {
            project = ProjectMockery()[0];
        });

        it('should render the project mode', () => {
            component = m.component(ProjectCard, {
                project: project
            });
            $output = mq(component);
            expect($output.find('.w-row').length).toEqual(1);
        });

        it('should render the project mode when goal is null', () => {
            component = m.component(ProjectCard, {
                project: _.extend({}, project, {goal: null})
            });
            $output = mq(component);
            expect($output.find('.w-row').length).toEqual(1);
        });
    });
});
