describe('AdminFilter component', function() {
  var AdminFilter = m.component(adminApp.AdminFilter,{onFilter: function(){}}),
      ctrl = AdminFilter.controller();

  beforeAll(function() {
    spyOn(ctrl, 'filter')
  });

  describe('controller', function() {
    it('should instantiate a function called filter', function() {
      expect(ctrl.filter).toBeFunction();
    });
    it('should instantiate its View-Model on initialization', function() {
      expect(ctrl.vm).toBeDefined();
    });
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminFilter.view(ctrl);
      $output = mq(view);
    });

    it('should call its filter when clicking on a filter', function() {
      $output.trigger('form', 'submit');
      expect(ctrl.filter).toHaveBeenCalled();
    });
  });
});
