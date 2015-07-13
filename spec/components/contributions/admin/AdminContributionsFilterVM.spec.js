describe('AdminContributionsFilterVM view-model', function() {
  var AdminContributionsFilterVM = adminApp.AdminContributionsFilter.VM;

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      AdminContributionsFilterVM.full_text_index('teste');
      expect(AdminContributionsFilterVM.full_text_index()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(AdminContributionsFilterVM.parameters).toBeFunction();
    });
  });
});
