describe('AdminInputAction', function(){
  var c = window.c, m = window.m,
      AdminInputAction = c.AdminInputAction,
      ctrl, testModel, $output;

  var args = {
        property: 'test_id',
        callToAction: 'cta',
        innerLabel: 'inner',
        outerLabel: 'outer',
        placeholder: 'place',
        model: m.postgrest.model('test')
      };

  describe('controller', function(){
    beforeAll(function(){
      ctrl = AdminInputAction.controller();
    });
    it('should instantiate a submit function', function(){
      expect(ctrl.submit).toBeFunction();
    });
  });

  describe('view', function(){
    beforeEach(function(){
      $output = mq(AdminInputAction, {data: args});
    });

    it('shoud render the outerLabel on first render', function(){
      expect($output.contains(args.outerLabel)).toBeTrue();
      expect($output.contains(args.innerLabel)).toBeFalse();
      expect($output.contains(args.placeholder)).toBeFalse();
      expect($output.contains(args.callToAction)).toBeFalse();
    });

    describe('on button click', function(){
      beforeEach(function(){
        $output.click('button');
      });

      it('should render an inner label', function(){
        expect($output.contains(args.innerLabel)).toBeTrue();
      });
      it('should render a placeholder', function(){
        expect($output.has('input[placeholder="' + args.placeholder + '"]')).toBeTrue();
      });
      it('should render a call to action', function(){
        expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
      });
    });

    describe('on form submit', function(){
      beforeAll(function(){
        ctrl = {
          submit: function(){},
          toggler: m.prop(true)
        };
        spyOn(ctrl, 'submit');
        $output = mq(AdminInputAction.view(ctrl, {data: args}));
      });

      it('should call a submit function on form submit', function(){
        console.log(JSON.stringify($output));
        $output.trigger('form', 'submit');
        expect(ctrl.submit).toHaveBeenCalled();
      });
    });
  });
});
