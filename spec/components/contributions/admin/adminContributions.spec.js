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
      $output = mq(view);
    });

    it('should render adminContributionsFilter nested component', function() {
      expect($output.has('#admin-contributions-filter')).toBe(true);
    });
    it('should render adminContributionsList nested component', function() {
      expect($output.has('#admin-contributions-list')).toBe(true);
    });
    it('should render fetched contributions cards', function() {
      expect($output.find('.results-admin-contributions').length).toEqual(n_contributions);
    });
  });
});