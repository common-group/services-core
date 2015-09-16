describe('AdminRadioAction', function(){
  var c = window.c, m = window.m, models = window.c.models,
      AdminRadioAction = c.AdminRadioAction,
      testModel = m.postgrest.model('test'),
      item = {
        getKey: 1,
        updateKey: 1,
        testKey: 'foo',
        reward: {
          id: 1,
          description: 'description'
        }
      },
      error = false,
      testStr = 'updated',
      fakeData = {},
      ctrl, $output;
  var response = [
    function(callback, err){
      callback([fakeData]);
    }
  ];

  var args = {
        getKey: 'testKey',
        updateKey: 'updateKey',
        property: 'test',
        radios: 'rewards',
        callToAction: 'cta',
        outerLabel: 'outer',
        getModel: testModel,
        updateModel: testModel
      };

  describe('controller', function(){
    beforeAll(function(){
      spyOn(testModel, 'patchOptions');
      spyOn(testModel, 'getRowOptions');
      spyOn(m, 'redraw');
      ctrl = AdminRadioAction.controller({data: args, item: item});
      spyOn(ctrl.setLoader, 'load').and.returnValue({
        then: function(callback, err){
          item.updateKey = testStr;
          callback(item);
        }
      });
    });

    it('should return a function called complete', function(){
      expect(ctrl.complete).toBeFunction();
    });
    it('should return a function called description', function(){
      expect(ctrl.description).toBeFunction();
    });
    it('should return a function called setDescription', function(){
      expect(ctrl.setDescription).toBeFunction();
    });
    it('should return a function called error', function(){
      expect(ctrl.error).toBeFunction();
    });
    it('should return a function called setLoader', function(){
      expect(ctrl.setLoader).toBeFunction();
    });
    it('should return a function called getLoader', function(){
      expect(ctrl.getLoader).toBeFunction();
    });
    it('should return a function called newValue', function(){
      expect(ctrl.newValue).toBeFunction();
    });
    it('should return a function called submit', function(){
      expect(ctrl.submit).toBeFunction();
    });
    it('should return a function called submit', function(){
      expect(ctrl.submit).toBeFunction();
    });
    it('should return a function called toggler', function(){
      expect(ctrl.toggler).toBeFunction();
    });
    it('should return a function called unload', function(){
      expect(ctrl.unload).toBeFunction();
    });
    it('should return a function called unload', function(){
      expect(ctrl.radios).toBeFunction();
    });
    it('should instantiate a get loader with filter set', function(){
      var filterSample = {};
      filterSample[args.getKey] = 'eq.' + item.testKey;
      expect(testModel.getRowOptions).toHaveBeenCalledWith(filterSample);
    });
    it('should instantiate a set loader with filter set', function(){
      var filterSample = {};
      filterSample[args.updateKey] = 'eq.' + item.updateKey;
      expect(testModel.patchOptions).toHaveBeenCalledWith(filterSample, {});
    });
    it('should set complete to true and updateItem on submit', function(){
      ctrl.newValue(testStr);
      ctrl.submit();
      expect(ctrl.setLoader.load).toHaveBeenCalled();
      expect(ctrl.complete()).toBeTrue();
      expect(item.updateKey).toEqual(testStr);
    });
    it('should set a new description and call redraw on setDescription', function(){
      var desc = testStr;
      ctrl.setDescription(desc);
      expect(ctrl.description()).toEqual(testStr);
      expect(m.redraw).toHaveBeenCalled();
    });
  });
  describe('view', function(){
    beforeAll(function(){
      ctrl = AdminRadioAction.controller({data: args, item: item});
      fakeData[args.radios] = [
        {
          id: 1,
          description: 'description_1',
          minimum_value: 10
        },
        {
          id: 2,
          description: 'description_2',
          minimum_value: 20
        }
      ];
      spyOn(m, 'request').and.returnValue({
        then: response[0]
      });
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
        expect($output.find('input[type="radio"]').length).toEqual(fakeData[args.radios].length);
      });
      it('should render the description of the default selected radio', function(){
        expect($output.contains(item.reward.description)).toBeTrue();
      });
      it('should send an patch request on form submit', function(){
        $output.click('#r-1');
        $output.trigger('form', 'submit');
        //One request to get another one to set
        expect(m.request.calls.count()).toEqual(2);
      });
    });
  });
});
