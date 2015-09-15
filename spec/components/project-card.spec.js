describe('ProjectCard', function() {
  var ProjectCard = window.c.ProjectCard;

  describe('view', function() {
    beforeAll(function() {
      project = ProjectMockery()[0];
      component = m.component(ProjectCard, {project: project});
      view = component.view({project: project});
      $output = mq(view);
    });

    it('should render the project card', function() {
      var remainingTimeObj = window.c.h.generateRemaingTime(project)();

      expect($output.find('.card-project').length).toEqual(1);
      expect($output.contains(project.owner_name)).toEqual(true);
      expect($output.contains(remainingTimeObj.unit)).toEqual(true);
    });
  });
});




