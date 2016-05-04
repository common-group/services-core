import adminUsers from '../../../src/root/admin-users'

describe('adminUsers', () => {
  var ctrl, $output;

  beforeAll(() => {
    AdminUsers = m.component(adminUsers);
    ctrl = AdminUsers.controller();
  });

  describe('controller', () => {
    it('should instantiate a list view-model', () => {
      expect(ctrl.listVM).toBeDefined();
    });

    it('should instantiate a filter view-model', () => {
      expect(ctrl.filterVM).toBeDefined();
    });

  });

  describe('view', () => {
    beforeAll(() => {
      $output = mq(Users);
    });

    it('should render AdminFilter nested component', () => {
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', () => {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
