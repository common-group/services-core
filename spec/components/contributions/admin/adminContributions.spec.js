describe('AdminContributions component', function() {
  beforeAll(function() {
    n_contributions = 10;
    AdminContributions = m.component(adminApp.AdminContributions);
    spyOn(adminApp.models.ContributionDetail, 'get').and.callFake(function(filter){
      return ContributionDetailMockery(n_contributions);
    });
  });

  describe('controller', function() {
    beforeAll(function() {
      ctrl = AdminContributions.controller();
    });

    it('should instantiate filterContributions', function() {
      expect(typeof ctrl.filterContributions).toBe('function');
    });
    it('should populate contributions on initialization', function() {
      expect(adminApp.models.ContributionDetail.get).toHaveBeenCalled();
    });
    it('should initialize with a list of contributions', function() {
      expect(ctrl.contributions.length).toEqual(n_contributions);
    });
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributions.view(ctrl);
    });

    it('should return valid HTML markup', function() {
      pending("Decide what to test on view");
    });

  });
});