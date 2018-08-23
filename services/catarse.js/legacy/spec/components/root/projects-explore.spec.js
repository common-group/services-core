import projectsExplore from '../../../src/root/projects-explore';

describe('ProjectsExplore', () => {
    let $output, project, component;

    beforeAll(() => {
        window.location.hash = '#by_category_id/1';

        component = m.component(projectsExplore, { root: { getAttribute: (x) => { return null; }} });
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

});
