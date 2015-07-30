describe('AdminContributions component', function() {
  var AdminContributions = null, ctrl = null;

  beforeAll(function(){
    AdminContributions = m.component(adminApp.AdminContributions);
    ctrl = AdminContributions.controller();
  });

  describe('controller', function() {
    it('should instantiate a list view-model', function() {
      expect(ctrl.listVM).toBeDefined();
    });

    it('should instantiate a filter view-model', function() {
      expect(ctrl.filterVM).toBeDefined();
    });
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributions.view(ctrl);
      $output = mq(view);
    });

    it('should render AdminFilter nested component', function() {
      //TO DO: figure out a way to test for the real component implementation, not relying on HTML attr.
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', function() {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
