describe('adminContributions component', function() {
  var adminContributions, n_contributions, ctrl, view;

  beforeAll(function() {
    n_contributions = 10;
    adminContributions = m.component(adminApp.adminContributions);
    adminApp.models.ContributionDetail.get = function(filter){
      return ContributionDetailMockery(n_contributions);
    };
    spyOn(adminApp.models.ContributionDetail, 'get').and.callThrough();
  });

  describe('controller', function() {
    beforeAll(function() {
      ctrl = adminContributions.controller();
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
      view = adminContributions.view();
    });
  });
});