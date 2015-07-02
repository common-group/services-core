describe('AdminContributionsVM view-model', function(){
  var AdminContributionsVM = adminApp.AdminContributions.VM;
  it('should return a list of contributions when filtering', function(done){
    AdminContributionsVM.filter().then(function(){
      expect(AdminContributionsVM.contributions().length).toEqual(nContributions);
      done();
    })
  });
  it('should return '+nContributions+' more contributions when clicking load more', function(done){
    AdminContributionsVM.nextPage().then(function(){
      expect(AdminContributionsVM.contributions().length).toEqual(nContributions*2);
      done();
    });
  });
  it('should set default order on fetch when no order is given', function(done){
    AdminContributionsVM.fetch().then(function(){
      expect(jasmine.Ajax.requests.mostRecent().url).toContain("order");
      done();
    });
  });
  it('should use the order set when order is explicit', function(done){
    AdminContributionsVM.filter({order: 'foo.desc'}).then(function(){
      expect(jasmine.Ajax.requests.mostRecent().url).toContain("order=foo.desc");
      done();
    });
  });
});
