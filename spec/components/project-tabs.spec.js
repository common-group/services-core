describe('ProjectTabs', () => {
  let $output, projectDetail,
      ProjectTabs = window.c.ProjectTabs;

  describe('view', () => {
    beforeAll(() => {
      projectDetail = ProjectDetailsMockery()[0];
      let component = m.component(ProjectTabs, {project: projectDetail});
      $output = mq(component.view, {project: projectDetail});
    });

    it('should render project-tabs', () => {
      expect($output.find('a.dashboard-nav-link.mf').length).toEqual(5);
      expect($output.find('a#about-link').length).toEqual(1);
    });

    it('should call hashMatch when click on some link', () => {
      const oldHash = window.location.hash;
      window.location.hash = 'posts';
      $output.redraw();
      $output.should.have('a#posts-link.selected');
      window.location.hash = oldHash;
    });
  });
});
