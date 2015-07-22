describe('AdminList component', function() {
  var nContributions = 5;

  beforeAll(function() {
    contributions = m.prop(ContributionDetailMockery(nContributions));
    AdminList = m.component(adminApp.AdminList, {contributions:contributions});
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminList.view(AdminList.ctrl, {contributions: contributions});
      $output = mq(view);
    });

    it('should render fetched contributions cards', function() {
      expect($output.find('.results-admin-contributions').length).toEqual(nContributions);
    });
  });
});
