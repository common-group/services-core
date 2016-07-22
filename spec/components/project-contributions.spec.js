import m from 'mithril';
import projectContributions from '../../src/c/project-contributions';

describe('projectContributions', () => {
    let $output, projectContribution;

    describe('view', () => {
        beforeAll(() => {
            jasmine.Ajax.stubRequest(new RegExp("("+apiPrefix + '\/contributors)'+'(.*)')).andReturn({
                'responseText' : JSON.stringify(ContributorMockery())
            });

            spyOn(m, 'component').and.callThrough();
            projectContribution = ContributorMockery()[0];
            const project = m.prop({
                        id: 1231
            });
            const component = m.component(projectContributions, {
                    project: project
                }),
                view = component.view(component.controller({
                    project: project
                }));

            $output = mq(view);
        });

        it('should render project contributions list', () => {
            expect($output.contains(projectContribution.data.name)).toEqual(true);
        });
    });
});
