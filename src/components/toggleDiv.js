// ToggleDiv
adminApp.ToggleDiv = {

  toggleProp: function(defaultState, alternateState) {
    var p = m.prop(defaultState);
    p.toggle = function(){
      p(((p() === alternateState) ? defaultState : alternateState));
    };

    return p;
  },

  controller: function(args) {
    this.vm = { display: args.display };
  },

  view: function(ctrl, args) {
    return m(".toggleDiv", { style: {"transition": "all .1s ease-out", "overflow": "hidden", "display": ctrl.vm.display() }}, [
      args.content ]);
  }
}
