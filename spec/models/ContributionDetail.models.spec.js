describe('ContributionDetail model', function() {
  beforeAll(function(){
    this.contribution_mock = ContributionDetailMockery(1)[0];
    spyOn(m.postgrest, "requestWithToken");
  });

  describe('when instantiated', function() {
    beforeAll(function() {
      this.contribution = new adminApp.models.ContributionDetail(this.contribution_mock);
    });

    it('should exhibit attributes', function() {
      expect(this.contribution).toMatchPropertiesOf(this.contribution_mock);
    });
  });

  describe('helper functions', function() {
    it('should instantiate a get function', function() {
      expect(typeof adminApp.models.ContributionDetail.get).toBe('function');
    });
    it('should call requestWithToken when getting contributions', function() {
      adminApp.models.ContributionDetail.get();
      expect(m.postgrest.requestWithToken).toHaveBeenCalled();
    });
  });

});