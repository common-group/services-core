describe('AdminContributionsList component', function() {
  var n_contributions = 5;

  beforeAll(function() {
    contributions = m.prop(ContributionDetailMockery(n_contributions));
    AdminContributionsList = m.component(adminApp.AdminContributionsList, {contributions:contributions});
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributionsList.view(AdminContributionsList.ctrl, {contributions: contributions});
      $output = mq(view);
    });

    it('should render fetched contributions cards', function() {
      expect($output.find('.results-admin-contributions').length).toEqual(n_contributions);
    });
  });
});