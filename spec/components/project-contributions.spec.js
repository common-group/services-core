describe('ProjectContributions', () => {
    let $output, projectContribution,
        ProjectContributions = window.c.ProjectContributions;

    describe('view', () => {
        beforeAll(() => {
            jasmine.Ajax.stubRequest(new RegExp('(' + apiPrefix + '\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({
                'responseText': JSON.stringify(ProjectContributionsMockery())
            });

            spyOn(m, 'component').and.callThrough();
            projectContribution = ProjectContributionsMockery()[0];
            const project = m.prop({
                        id: 1231
            });
            const component = m.component(ProjectContributions, {
                    project: project
                }),
                view = component.view(component.controller({
                    project: project
                }));

            $output = mq(view);
        });

        it('should render project contributions list', () => {
            expect($output.contains(projectContribution.user_name)).toEqual(true);
        });
    });
});
