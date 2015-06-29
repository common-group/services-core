describe('AdminContributionsVM view-model', function() {
  var AdminContributionsVM = adminApp.AdminContributions.VM;
  it('should return a list of contributions when filtering', function(done) {
    AdminContributionsVM.filter().then(function(){
      expect(AdminContributionsVM.contributions().length).toEqual(nContributions);
      done();
    })
  });
  it('should return '+nContributions+' more contributions when clicking load more', function(done) {
    AdminContributionsVM.nextPage().then(function(){
      expect(AdminContributionsVM.contributions().length).toEqual(nContributions*2);
      done();
    });
  });
});
