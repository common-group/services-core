describe('AdminContributions component', function() {
  var AdminContributions = m.component(adminApp.AdminContributions);

  describe('controller', function() {
    beforeAll(function() {
      ctrl = AdminContributions.controller();
    });

    it('should instantiate filterContributions', function() {
      expect(ctrl.filterContributions).toBeFunction();
    });
    it('should instantiate nextPage', function() {
      expect(ctrl.nextPage).toBeFunction();
    });
    it('should instantiate its view-model', function() {
      expect(ctrl.vm).toBeDefined();
    });
    
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributions.view(ctrl);
      $output = mq(view);
      spyOn(ctrl.vm, "filter");
    });

    it('should render adminContributionsFilter nested component', function() {
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render adminContributionsList nested component', function() {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
    it('should call Contribution Details when filtering', function() {
      $output.click('#filter-btn');
      expect(ctrl.vm.filter).toHaveBeenCalled();
    });
  });
});