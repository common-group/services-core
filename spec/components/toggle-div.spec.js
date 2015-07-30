describe('toggleDiv component', function() {
  var toggleProp = null, toggleComponent = null, $output = null;

  beforeAll(function(){
    toggleProp = adminApp.ToggleDiv.toggler();
    $output = mq(adminApp.ToggleDiv, {display: toggleProp});
  });

  describe('toggler', function() {
    it("should return a property with default state", function(){
      expect(toggleProp()).toEqual('none')
    })

    it("should change a property to alternative state", function(){
      toggleProp.toggle()
      expect(toggleProp()).toEqual('block')
    })
  });

  describe('view', function() {
    it('should render .toggleDiv', function() {
      toggleProp('none');
      $output.redraw();
      expect($output.find('.toggleDiv')[0].attrs.style.display).toEqual('none');
    });

    it('should toggle div', function() {
      toggleProp('block');
      $output.redraw();
      expect($output.find('.toggleDiv')[0].attrs.style.display).toEqual('block');
    })
  });

});

