import projectsExplore from '../../../src/root/projects-explore'

export default describe('ProjectsExplore', () => {
    let $output, project, component;

    beforeAll(() => {
        window.location.hash = '#by_category_id/1';

        component = m.component(projectsExplore);
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

});
