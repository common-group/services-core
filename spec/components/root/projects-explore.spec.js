import projectsExplore from '../../../src/root/projects-explore'

describe('ProjectsExplore', () => {
    let $output, project, component,
        ProjectsExplore = window.c.root.ProjectsExplore;

    beforeAll(() => {
        window.location.hash = '#by_category_id/1';

        component = m.component(projectsExplore);
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

});
