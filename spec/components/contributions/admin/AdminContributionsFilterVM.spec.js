describe('AdminContributionsFilterVM view-model', function() {
  beforeAll(function() {
    AdminContributionsFilterVM = adminApp.AdminContributionsFilter.VM;
  });

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      AdminContributionsFilterVM.permalink('teste');
      expect(AdminContributionsFilterVM.permalink()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(typeof AdminContributionsFilterVM.filter).toEqual('function')
    });
  });
});