describe('ProjectsExplore', () => {
    let $output, project, component,
        ProjectsExplore = window.c.contribution.ProjectsExplore;

    beforeAll(() => {
        window.location.hash = '#by_category_id/1';

        component = m.component(ProjectsExplore);
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

    it('should render category if we have category_id in location hash', () => {
        $output.should.have('.btn-category');
        $output.should.have('.unfollow-btn');
    });

    it('should call unfollow api endpoint on unfollow click', () => {
        $output.click('.unfollow-btn');
        const lastRequest = jasmine.Ajax.requests.mostRecent();
        expect(lastRequest.url).toEqual(apiPrefix + '/category_followers?category_id=eq.1');
        expect(lastRequest.method).toEqual('DELETE');
    });
});
