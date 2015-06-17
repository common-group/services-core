describe('AdminContributionsFilter component', function() {
  beforeAll(function() {
    AdminContributionsFilter = m.component(adminApp.AdminContributionsFilter);
    args = {
      onFilter: function(filter) {
        return filter;
      }
    }
    ctrl = AdminContributionsFilter.controller();
    spyOn(ctrl, 'filter')
  });

  describe('controller', function() {
    it('should instantiate a function called filter', function() {
      expect(typeof ctrl.filter).toBe('function');
    });
    it('should instantiate its View-Model on initialization', function() {
      expect(ctrl.vm).toBeDefined();
    });
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributionsFilter.view(ctrl);
      $output = mq(view);
    });

    it('should call its filter when clicking on a filter', function() {
      $output.click('#filter-btn');
      expect(ctrl.filter).toHaveBeenCalled();
    });
  });
});