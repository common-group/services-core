describe('AdminProjectDetailsExplanation', function() {
  var AdminProjectDetailsExplanation = window.c.AdminProjectDetailsExplanation,
      outputForState = function(currentState) {
        projectDetail = ProjectDetailsMockery({state: currentState})[0]
        component = m.component(AdminProjectDetailsExplanation, {resource: projectDetail});
        view = component.view(component.controller, {resource: projectDetail});
        return mq(view);
      };

  describe('view', function() {
    it('should render state text for online', function(){
      $output = outputForState('online');
      expect($output.find('.online-project-text').length).toEqual(1);
    });

    it('should render state text for oa approved', function(){
      $output = outputForState('approved');
      expect($output.find('.approved-project-text').length).toEqual(1);
    });

    it('should render state text for draft', function(){
      $output = outputForState('draft');
      expect($output.find('.draft-project-text').length).toEqual(1);
    });

    it('should render state text for waiting_funds', function(){
      $output = outputForState('waiting_funds');
      expect($output.find('.waiting_funds-project-text').length).toEqual(1);
    });

    it('should render state text for successful', function(){
      $output = outputForState('successful');
      expect($output.find('.successful-project-text').length).toEqual(1);
    });

    it('should render state text for failed', function(){
      $output = outputForState('failed');
      expect($output.find('.failed-project-text').length).toEqual(1);
    });

    it('should render state text for rejected', function(){
      $output = outputForState('rejected');
      expect($output.find('.rejected-project-text').length).toEqual(1);
    });
  });
});
