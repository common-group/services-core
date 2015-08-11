describe('AdminItem', function(){
  var c = window.c,
      ctrl, item;

  describe('controller', function(){
    describe('on contribution context', function(){
      beforeAll(function(){
        item = m.prop(ContributionDetailMockery(1));
        ctrl = m.component(c.adminItem, {describer: ItemDescriberMock(), item: item}).controller();
      });

      it('should return a valid payment object', function(){
        pending('describe valid object and match with the one created by the controller.');
      });
      it('should return a valid project object', function(){
        pending('describe valid object and match with the one created by the controller.');
      });
      it('should return a valid user object', function(){
        pending('describe valid object and match with the one created by the controller.');
      });
      it('should return a valid contribution object', function(){
        pending('describe valid object and match with the one created by the controller.');
      });
    });
  });
});
