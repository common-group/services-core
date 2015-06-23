describe('AdminContributionsVM view-model', function() {
  var AdminContributionsVM = adminApp.AdminContributions.VM;

  describe('initialization', function() {
    it('should initialize with a list of contributions', function(done) {
      AdminContributionsVM.filter().then(function(){
        expect(AdminContributionsVM.contributions().length).toEqual(n_contributions);
        done();
      })
    });
  });
});