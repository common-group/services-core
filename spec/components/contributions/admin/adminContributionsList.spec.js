describe('AdminContributionsList component', function() {
  var n_contributions = 5;

  beforeAll(function() {
    contributions = ContributionDetailMockery(n_contributions);
    AdminContributionsList = m.component(adminApp.AdminContributionsList, {contributions:contributions});
  });

  describe('controller', function() {
    beforeAll(function() {
      ctrl = AdminContributionsList.controller();
    });
    it('should expose initialized contributions', function() {
      expect(ctrl.contributions().length).toEqual(n_contributions);
    });
  });
  describe('view', function() {
    beforeAll(function() {
      view = AdminContributionsList.view(ctrl);
      $output = mq(view);
    });

    it('should render fetched contributions cards', function() {
      expect($output.find('.results-admin-contributions').length).toEqual(n_contributions);
    });
  });
});