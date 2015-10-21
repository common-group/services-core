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
            let component = m.component(ProjectContributions, {
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

        it('should render project contributions list', () => {
            expect($output.contains(projectContribution.user_name)).toEqual(true);
        });
    });
});
