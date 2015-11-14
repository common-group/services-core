describe('ProjectSidebar', () => {
    let generateContextByNewState,
        ProjectSidebar = window.c.ProjectSidebar;

    describe('view', () => {
        beforeAll(() => {
            generateContextByNewState = (newState = {}) => {
                spyOn(m, 'component').and.callThrough();
                let projectDetail = _.extend({}, ProjectDetailsMockery()[0], newState),
                    component = m.component(ProjectSidebar, {
                        project: projectDetail,
                        userDetails: m.prop([])
                    }),
                    ctrl = component.controller({
                        project: projectDetail,
                        userDetails: m.prop([])
                    }),
                    view = component.view(component.controller(), {
                        project: projectDetail,
                        userDetails: m.prop([])
                    });

                spyOn(ctrl, 'displayCardClass').and.callThrough();
                spyOn(ctrl, 'displayStatusText').and.callThrough();

                return {
                    output: mq(view),
                    ctrl: ctrl,
                    projectDetail: projectDetail
                };
            };
        });

        it('should render project stats', () => {
            let {
                output, projectDetail
            } = generateContextByNewState({
                state: 'successful'
            });

            expect(output.find('#project-sidebar.aside').length).toEqual(1);
            expect(output.find('.card-success').length).toEqual(1);
        });

        it('should render a all or nothing badge when is aon', () => {
            let {
                output, projectDetail
            } = generateContextByNewState({
                mode: 'aon'
            });

            expect(output.find('#aon').length).toEqual(1);
        });

        it('should render a flex badge when project mode is flexible', () => {
            let {
                output, projectDetail
            } = generateContextByNewState({
                mode: 'flex'
            });

            expect(output.find('#flex').length).toEqual(1);
        });

        describe('reminder', () => {
            it('should render reminder when project is open_for_contributions and user signed in and is in_reminder', () => {
                let {
                    output, projectDetail
                } = generateContextByNewState({
                    open_for_contributions: true,
                    user_signed_in: true,
                    in_reminder: true
                });

                expect(output.contains('Lembrete ativo')).toEqual(true);
                expect(output.find('#project-reminder').length).toEqual(1);
            });

            it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder', () => {
                let {
                    output, projectDetail
                } = generateContextByNewState({
                    open_for_contributions: true,
                    user_signed_in: true,
                    in_reminder: false
                });

                expect(output.contains('Lembrar-me')).toEqual(true);
                expect(output.find('#project-reminder').length).toEqual(1);
            });

            it('should render reminder when project is open_for_contributions and user not signed in', () => {
                let {
                    output, projectDetail
                } = generateContextByNewState({
                    open_for_contributions: true,
                    user_signed_in: false
                });

                expect(output.find('#project-reminder').length).toEqual(1);
            });

            it('should not render reminder when project is not open_for_contributions and user signed in', () => {
                let {
                    output, projectDetail
                } = generateContextByNewState({
                    open_for_contributions: false,
                    user_signed_in: true
                });

                expect(output.find('#project-reminder').length).toEqual(0);
            });
        });
    });
});