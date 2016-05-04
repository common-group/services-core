import adminContributions from '../../../src/root/admin-contributions';

fdescribe('adminContributions', () => {
  var ctrl, $output;

  beforeAll(() => {
    AdminContributions = m.component(adminContributions);
    ctrl = AdminContributions.controller();
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
      $output = mq(Contributions);
    });

    it('should render AdminFilter nested component', () => {
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', () => {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
