describe('ProjectReminderCount', function() {
  var ProjectReminderCount = window.c.ProjectReminderCount;

  describe('view', function() {
    beforeAll(function() {
      projectDetail = ProjectDetailsMockery()[0];
      component = m.component(ProjectReminderCount, {resource: projectDetail});
      view = component.view(null, {resource: projectDetail});
      $output = mq(view);
    });

    it('should render reminder total count', function() {
      expect($output.find('#project-reminder-count').length).toEqual(1);
      expect($output.contains(projectDetail.reminder_count)).toEqual(true);
    });
  });
});


