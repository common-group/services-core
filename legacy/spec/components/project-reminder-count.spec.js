import m from 'mithril';
import projectReminderCount from '../../src/c/project-reminder-count';

describe('ProjectReminderCount', () => {
    let $output, projectDetail;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = m.prop(ProjectDetailsMockery()[0]);
            let component = m.component(projectReminderCount, {
                    resource: projectDetail
                }),
                view = component.view(null, {
                    resource: projectDetail
                });
            $output = mq(view);
        });

        it('should render reminder total count', () => {
            expect($output.find('#project-reminder-count').length).toEqual(1);
        });
    });
});
