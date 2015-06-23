describe('AdminContributions component', function() {
  var n_contributions = 10,
      AdminContributions = m.component(adminApp.AdminContributions);

  beforeAll(function() {
    spyOn(adminApp.models.ContributionDetail, 'get').and.callFake(function(filter){
      return ContributionDetailMockery(n_contributions);
    });
  });

  describe('controller', function() {
    beforeAll(function() {
      ctrl = AdminContributions.controller();
    });

    it('should instantiate filterContributions', function() {
      expect(ctrl.filterContributions).toBeFunction();
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
      $output = mq(view);
    });

    it('should render adminContributionsFilter nested component', function() {
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render adminContributionsList nested component', function() {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
    it('should call Contribution Details when filtering', function() {
      $output.click('#filter-btn');
      expect(adminApp.models.ContributionDetail.get).toHaveBeenCalled();
    });
  });
});