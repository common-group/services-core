describe('AdminContributionsFilterVM view-model', function() {
  var AdminContributionsFilterVM = adminApp.AdminContributionsFilter.VM;

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      AdminContributionsFilterVM.search_text('teste');
      expect(AdminContributionsFilterVM.search_text()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(AdminContributionsFilterVM.parameters).toBeFunction();
    });
  });
});
