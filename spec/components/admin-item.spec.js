describe('AdminItem', function(){
  var c = window.c,
      AdminItem = c.AdminItem,
      item, $output, itemDescriber;

  describe('view', function(){
    beforeAll(function(){
      spyOn(m, 'component').and.callThrough();
      item = ContributionDetailMockery(1)[0];
      itemDescriber = ItemDescriberMock();
      $output = mq(AdminItem, {builder: itemDescriber, item: item});
    });

    it('should build an item from an item describer', function(){
      expect($output.has('.admin-user')).toBeTrue();
      expect($output.has('.admin-project')).toBeTrue();
      expect($output.has('.admin-contribution')).toBeTrue();
      expect($output.has('.payment-status')).toBeTrue();
    });
  });

});
