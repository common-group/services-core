describe('AdminContributionsFilter component', function() {
  beforeAll(function() {
    AdminContributionsFilter = m.component(adminApp.AdminContributionsFilter);
    args = {
      onFilter: function(filter) {
        return filter;
      }
    }
    spyOn(adminApp.AdminContributionsFilter, 'VM')
  });

  describe('controller', function() {
    beforeAll(function() {
      ctrl = AdminContributionsFilter.controller();
    });

    it('should instantiate a function called filter', function() {
      expect(typeof ctrl.filter).toBe('function');
    });
    it('should instantiate its View-Model on initialization', function() {
      expect(ctrl.vm).toBeDefined();
    });
  });

  describe('view', function() {
    pending('View specs pending');
  });
});