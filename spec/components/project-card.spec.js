describe('ProjectCard', function() {
  var ProjectCard = window.c.ProjectCard;

  describe('view', function() {
    beforeAll(function() {
      project = ProjectMockery()[0];
      component = m.component(ProjectCard, {project: project});
      ctrl = component.controller({project: project});
      view = component.view(ctrl, {project: project});
      $output = mq(view);
    });

    it('should render the project card', function() {
      var remaningTimeObj = ctrl.remainingTextObj();

      expect($output.find('.card-project').length).toEqual(1);
      expect($output.contains(project.owner_name)).toEqual(true);
      expect($output.contains(remaningTimeObj.unit)).toEqual(true);
    });
  });
});




