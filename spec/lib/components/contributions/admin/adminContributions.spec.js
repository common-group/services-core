describe('adminContributions component', function() {
  beforeAll(function() {
    this.adminContributions = m.component(adminApp.adminContributions);
    adminApp.models.ContributionDetail.get = function(filter){
      return ContributionDetailMockery(10);
    };
    spyOn(adminApp.models.ContributionDetail, 'get').and.callThrough();
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
      expect(this.ctrl.contributions.length).toEqual(10);
    });
  });

});