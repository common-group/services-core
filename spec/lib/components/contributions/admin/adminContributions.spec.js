describe('adminContributions component', function() {
  beforeAll(function() {
    this.adminContributions = m.component(adminApp.adminContributions);

  });
  describe('controller', function() {
    it('should instantiate filterContributions function', function() {
      var ctrl = this.adminContributions.controller();
      expect(typeof ctrl.filterContributions).toBe('function');
    });
  });

});