import adminContributions from '../../../src/root/admin-contributions';

describe('adminContributions', () => {
  let ctrl, $output;

  beforeAll(() => {
    ctrl = m.component(adminContributions).controller();
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
      $output = mq(adminContributions);
    });

    it('should render AdminFilter nested component', () => {
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', () => {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
  });
});
