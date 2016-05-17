import m from 'mithril';
import projectShareBox from '../../src/c/project-share-box';

describe('ProjectShareBox', () => {
    let $output, projectDetail;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = m.prop(ProjectDetailsMockery()[0]);
            let args = {
                    project: projectDetail,
                    displayShareBox: {
                        toggle: jasmine.any(Function)
                    }
                },
                component = m.component(projectShareBox, args),
                view = component.view(component.controller(), args);
            $output = mq(projectShareBox, args);
        });

        it('should render project project share pop', () => {
            $output.should.have('.pop-share');
            $output.should.have('.w-widget-facebook');
            $output.should.have('.w-widget-twitter');
            $output.should.have('.widget-embed');
        });

        it('should open embed box when click on embed', () => {
            $output.click('a.widget-embed');
            $output.should.have('.embed-expanded');
        });
    });
});
