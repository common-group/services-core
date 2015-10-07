describe('AdminRadioAction', function(){
  var c = window.c, m = window.m, models = window.c.models,
      AdminRadioAction = c.AdminRadioAction,
      testModel = m.postgrest.model('reward_details'),
      error = false, item,
      testStr = 'updated',
      fakeData = {},
      ctrl, $output;

  var args = {
    getKey: 'project_id',
    updateKey: 'contribution_id',
    selectKey: 'reward_id',
    radios: 'rewards',
    callToAction: 'Alterar Recompensa',
    outerLabel: 'Recompensa',
    getModel: testModel,
    updateModel: testModel,
  };

  describe('view', function(){
    beforeAll(function(){
      item = _.first(RewardDetailsMockery());
      args.selectedItem = m.prop(item);
      ctrl = AdminRadioAction.controller({data: args, item: item});
      $output = mq(AdminRadioAction, {data: args, item: item});

    });

    it('shoud only render the outerLabel on first render', function(){
      expect($output.contains(args.outerLabel)).toBeTrue();
      expect($output.contains(args.callToAction)).toBeFalse();
    });

    describe('on action button click', function(){
      beforeAll(function(){
        $output.click('button');
      });

      it('should render a row of radio inputs', function(){
        const lastRequest = jasmine.Ajax.requests.mostRecent();
        expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);
      });

      it('should render the description of the default selected radio', function(){
        $output.should.contain(item.description);
      });

      it('should send an patch request on form submit', function(){
        $output.click('#r-0');
        $output.trigger('form', 'submit');
        const lastRequest = jasmine.Ajax.requests.mostRecent();
        // Should make a patch request to update item
        expect(lastRequest.method).toEqual('PATCH');
      });
    });
  });
});
