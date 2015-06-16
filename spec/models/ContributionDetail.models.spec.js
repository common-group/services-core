describe('ContributionDetail model', function() {
  beforeAll(function(){
    this.contribution_mock = ContributionDetailMockery(1)[0];
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
    it('should return 10 contributions and pagination info when filtering', function() {
      pending("Implement this with postgrest already set");
    });
  });

});