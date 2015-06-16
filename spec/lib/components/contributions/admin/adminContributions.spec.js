describe('adminContributions component', function() {
  beforeAll(function() {
    this.adminContributions = m.component(adminApp.adminContributions);
    spyOn(adminApp.models.ContributionDetail, 'get');
  });

  describe('controller', function() {
    beforeAll(function() {
      this.ctrl = this.adminContributions.controller();
    });

    it('should instantiate filterContributions', function() {
      expect(typeof this.ctrl.filterContributions).toBe('function');
    });
    it('should populate contributions on initialization', function() {
      expect(adminApp.models.ContributionDetail.get).toHaveBeenCalled();
    });
    it('should initialize with a list of contributions', function() {
      pending('Waiting for automatically created contributions.');
    });
  });

});