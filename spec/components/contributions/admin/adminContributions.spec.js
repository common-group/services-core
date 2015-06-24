describe('AdminContributions component', function() {
  var AdminContributions = m.component(adminApp.AdminContributions),
      ctrl = AdminContributions.controller();

  describe('controller', function() {
    it('should instantiate filterContributions', function() {
      expect(ctrl.filterContributions).toBeFunction();
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
    it('should render '+n_contributions+' more contribution cards when clicking on load_more.', function() {
      var actual = ctrl.vm.contributions().length;
      $output.click('#load-more');
      expect($output.find('.results-admin-contributions').length).toEqual(actual+n_contributions);
    });
  });
});