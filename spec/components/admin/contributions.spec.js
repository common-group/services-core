describe('admin.Contributions', function(){
  var AdminContributions = null,
      Contributions = window.c.admin.Contributions,
      ctrl = null,
      $output;

  beforeAll(function(){
    AdminContributions = m.component(Contributions);
    ctrl = AdminContributions.controller();
  });

  describe('controller', function(){
    it('should instantiate a list view-model', function(){
      expect(ctrl.listVM).toBeDefined();
    });

    it('should instantiate a filter view-model', function(){
      expect(ctrl.filterVM).toBeDefined();
    });

  });

  describe('view', function(){
    beforeAll(function(){
      $output = mq(Contributions);
    });

    it('should render AdminFilter nested component', function(){
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', function(){
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
