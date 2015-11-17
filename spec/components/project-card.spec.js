describe('ProjectCard', () => {
    let ProjectCard = window.c.ProjectCard,
        project, component, view, $output;

    describe('view', () => {
        beforeAll(() => {
            project = ProjectMockery()[0];
            component = m.component(ProjectCard, {
                project: project
            });
            view = component.view({
                project: project
            });
            $output = mq(view);
        });

        it('should render the project card', () => {
            let remainingTimeObj = window.c.h.translatedTime(project.remaining_time);

            expect($output.find('.card-project').length).toEqual(1);
            expect($output.contains(project.owner_name)).toEqual(true);
            expect($output.contains(remainingTimeObj.unit)).toEqual(true);
        });
    });
});