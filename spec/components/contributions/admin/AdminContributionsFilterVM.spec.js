describe('adminContributionsFilterVM view-model', function() {
  var adminContributionsFilterVM = adminApp.AdminFilter.VM;

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      adminContributionsFilterVM.full_text_index('teste');
      expect(adminContributionsFilterVM.full_text_index()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(adminContributionsFilterVM.parameters).toBeFunction();
    });
  });

  describe("created_at.gte.toFilter", function() {
    it("should convert to ISO format", function() {
      var m = moment("12/11/2015", 'DD/MM/YYYY');
      adminContributionsFilterVM.created_at.gte(m.format('DD/MM/YYYY'));
      expect(adminContributionsFilterVM.created_at.gte.toFilter()).toEqual(m.format());
    });
  });

  describe("created_at.lte.toFilter", function() {
    it("should convert to ISO format at end of day", function() {
      var m = moment("12/11/2015", 'DD/MM/YYYY');
      adminContributionsFilterVM.created_at.lte(m.format('DD/MM/YYYY'));
      expect(adminContributionsFilterVM.created_at.lte.toFilter()).toEqual(m.endOf('day').format());
    });
  });
});
