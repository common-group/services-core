describe('AdminFilter', function(){
  var ctrl,
      submit,
      fakeForm,
      formDesc,
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
      filterDescriber = FilterDescriberMock();
      $output = mq(AdminFilter, {filterBuilder: filterDescriber, submit: submit});
    });

    it('should render the main filter on render', function(){
      expect(m.component).toHaveBeenCalledWith(c.FilterMain, filterDescriber[0].data);
    });

    it('should build a form from a FormDescriber when clicking the advanced filter', function(){
      $output.click('button');
      //mithril.query calls component one time to build it, so calls.count = length + 1.
      expect(m.component.calls.count()).toEqual(filterDescriber.length + 1);
    });

    it('should trigger a submit function when submitting the form', function(){
      $output.trigger('form', 'submit');
      expect(submit).toHaveBeenCalled();
    });
  });
});
