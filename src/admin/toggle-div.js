// ToggleDiv
window.c.adminApp.ToggleDiv = (function(m, h){
  return {
    toggler: function() {
      return h.toggleProp('none', 'block');
    },

    controller: function(args) {
      return {
        vm: {
          display: args.display
        }
      };
    },

    view: function(ctrl, args) {
      return m('.toggleDiv', {style: {'transition': 'all .1s ease-out', 'overflow': 'hidden', 'display': ctrl.vm.display()}}, [
        args.content]);
    }
  };
}(window.m, window.c.h));
