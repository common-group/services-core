describe('AdminContributionsList component', function() {
  var nContributions = 5;

  beforeAll(function() {
    contributions = m.prop(ContributionDetailMockery(nContributions));
    AdminContributionsList = m.component(adminApp.AdminContributionsList, {contributions:contributions});
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributionsList.view(AdminContributionsList.ctrl, {contributions: contributions});
      $output = mq(view);
    });

    it('should render fetched contributions cards', function() {
      expect($output.find('.results-admin-contributions').length).toEqual(nContributions);
    });
  });
});
