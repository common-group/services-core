import mq from 'mithril-query';
import m from 'mithril';
import prop from 'mithril/stream';
import projectReminderCount from '../../src/c/project-reminder-count';

describe('ProjectReminderCount', () => {
    let $output, projectDetail;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = prop(ProjectDetailsMockery()[0]);
            let component = m(projectReminderCount, {
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
