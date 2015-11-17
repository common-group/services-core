describe('admin.Users', function(){
  var AdminUsers = null,
      Users = window.c.admin.Users,
      ctrl = null,
      $output;

  beforeAll(function(){
    AdminUsers = m.component(Users);
    ctrl = AdminUsers.controller();
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
      $output = mq(Users);
    });

    it('should render AdminFilter nested component', function(){
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', function(){
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
