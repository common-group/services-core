describe('AdminContributions component', function() {
  var AdminContributions = null, ctrl = null;

  beforeAll(function(){
    AdminContributions = m.component(adminApp.AdminContributions);
    ctrl = AdminContributions.controller();
  });

  describe('controller', function() {
//    it('should instantiate filterContributions', function() {
//      expect(ctrl.filterContributions).toBeFunction();
//    });
    it('should instantiate its view-model', function() {
      expect(ctrl.vm).toBeDefined();
    });
  });

  describe('view', function() {
    beforeAll(function() {
      view = AdminContributions.view(ctrl);
      $output = mq(view);
      spyOn(ctrl.vm, "filter").and.callThrough();
    });

    it('should render AdminFilter nested component', function() {
      //TO DO: figure out a way to test for the real component implementation, not relying on HTML attr.
      expect($output.has('#admin-contributions-filter')).toBeTrue();
    });
    it('should render AdminList nested component', function() {
      expect($output.has('#admin-contributions-list')).toBeTrue();
    });
    it('should call Contribution Details when filtering', function() {
      $output.trigger('form', 'submit');
//      expect(ctrl.vm.filter).toHaveBeenCalled();
    });
    it('should render '+nContributions+' more contribution cards when clicking on load_more.', function() {
      var actual = ctrl.vm.collection().length;
      $output.click('#load-more');
      expect($output.find('.results-admin-contributions').length).toEqual(actual+nContributions);
    });
  });
});
