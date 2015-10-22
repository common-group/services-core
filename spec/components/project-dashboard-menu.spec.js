describe('ProjectDashboardMenu', () => {
    let generateContextByNewState,
        ProjectDashboardMenu = window.c.ProjectDashboardMenu;

    describe('view', () => {
        beforeAll(() => {
            generateContextByNewState = (newState = {}) => {
                let body = jasmine.createSpyObj('body', ['className']),
                    projectDetail = ProjectDetailsMockery(newState)[0],
                    component = m.component(ProjectDashboardMenu, {
                        project: projectDetail
                    }),
                    ctrl = component.controller({
                        project: projectDetail
                    });

                spyOn(m, 'component').and.callThrough();
                spyOn(ctrl, 'body').and.returnValue(body);

                return {
                    output: mq(component.view(ctrl, {
                        project: projectDetail
                    })),
                    projectDetail: projectDetail
                };
            };
        });

        it('when project is online', () => {
            let {
                output, projectDetail
            } = generateContextByNewState({
                state: 'online'
            });

            output.should.contain(projectDetail.name);
            output.should.have('#info-links');
        });
    });
});