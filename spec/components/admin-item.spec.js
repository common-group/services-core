describe('AdminItem', function(){
  var c = window.c,
      setController = function(contribution){
        ctrl = m.component(c.AdminItem, {contribution: contribution()[0]}).controller();
      };

  describe('controller', function(){
    beforeAll(function(){
      contribution = m.prop(ContributionDetailMockery(1));
      setController(contribution);
    });
  });
});
