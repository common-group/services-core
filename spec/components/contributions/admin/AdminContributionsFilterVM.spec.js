describe('AdminContributionsFilterVM view-model', function() {
  var AdminContributionsFilterVM = adminApp.AdminContributionsFilter.VM;

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      AdminContributionsFilterVM.permalink('teste');
      expect(AdminContributionsFilterVM.permalink()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(AdminContributionsFilterVM.filter).toBeFunction();
    });
  });
});