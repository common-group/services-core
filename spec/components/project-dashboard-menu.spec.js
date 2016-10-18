import m from 'mithril';
import projectDashboardMenu from '../../src/c/project-dashboard-menu';

describe('ProjectDashboardMenu', () => {
    let generateContextByNewState;

    describe('view', () => {
        beforeAll(() => {
            generateContextByNewState = (newState = {}) => {
                let body = jasmine.createSpyObj('body', ['className']),
                    projectDetail = m.prop(ProjectDetailsMockery(newState)[0]),
                    component = m.component(projectDashboardMenu, {
                        project: projectDetail
                    }),
                    ctrl = component.controller({
                        project: projectDetail
                    });

                spyOn(m, 'component').and.callThrough();
                spyOn(ctrl, 'body').and.returnValue(body);

                return {
                    output: mq(component, {
                        project: projectDetail
                    }),
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

            output.should.contain(projectDetail().name);
            output.should.have('#info-links');
        });
    });
});
