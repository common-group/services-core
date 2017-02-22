import projectsExplore from '../../../src/root/projects-explore';
import _ from 'underscore';

describe('ProjectsExplore', () => {
    let $output, project, component;

    beforeAll(() => {
        console.log(JSON.stringify(window.I18n));
        window.location.hash = '#by_category_id/1';

        component = m.component(projectsExplore, { root: { getAttribute: (x) => { return null; }} });
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

});
