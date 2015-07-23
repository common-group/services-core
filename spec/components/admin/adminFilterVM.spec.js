describe('AdminFilter View-Model', function() {
  var adminFilterVM = adminApp.AdminFilter.VM;

  describe('initialization', function() {
    it('should return a propified permalink object', function() {
      adminFilterVM.full_text_index('teste');
      expect(adminFilterVM.full_text_index()).toEqual('teste');
    });
    it('should return a filter function', function() {
      expect(adminFilterVM.parameters).toBeFunction();
    });
  });

  describe("created_at.gte.toFilter", function() {
    it("should convert to ISO format", function() {
      var m = moment("12/11/2015", 'DD/MM/YYYY');
      adminFilterVM.created_at.gte(m.format('DD/MM/YYYY'));
      expect(adminFilterVM.created_at.gte.toFilter()).toEqual(m.format());
    });
  });

  describe("created_at.lte.toFilter", function() {
    it("should convert to ISO format at end of day", function() {
      var m = moment("12/11/2015", 'DD/MM/YYYY');
      adminFilterVM.created_at.lte(m.format('DD/MM/YYYY'));
      expect(adminFilterVM.created_at.lte.toFilter()).toEqual(m.endOf('day').format());
    });
  });
});
