describe('AdminFilter', function() {
  var ctrl,
      submit,
      fakeForm,
      c = window.c,
      vm = c.admin.contributionFilterVM,
      AdminFilter = c.AdminFilter;

  describe('controller', function(){
    beforeAll(function(){
      ctrl = AdminFilter.controller();
    });

    it('should instantiate a toggler', function(){
      expect(ctrl.toggler).toBeDefined();
    });
  });

  describe('view', function(){
    beforeAll(function(){
      spyOn(m, 'component').and.callThrough();
      submit = jasmine.createSpy('submit');
      fakeForm = FormDescriberMock(['main', 'dropdown', 'numberRange', 'dateRange']);
      $output = mq(AdminFilter.view(AdminFilter.controller(), {form: fakeForm, submit: submit}));
    });

    it('should render the main filter on render', function(){
      expect(m.component).toHaveBeenCalledWith(c.FilterMain, fakeForm[0].data);
    });

    it('should build a form from a FormDescriber', function(){
      $output.click('button');
      expect(m.component).toHaveBeenCalledWith(c.FilterDropdown, fakeForm[1].data);
      expect(m.component).toHaveBeenCalledWith(c.FilterNumberRange, fakeForm[2].data);
      expect(m.component).toHaveBeenCalledWith(c.FilterDateRange, fakeForm[3].data);
    });

    it('should trigger a submit function when submitting the form', function(){
      $output.trigger('form', 'submit');
      expect(submit).toHaveBeenCalled();
    });
  });
});
