// ToggleDiv

adminApp.ToggleDiv = {

  toggler: function() {
    return toggleProp('none', 'block');
  },

  controller: function(args) {
    this.vm = { display: args.display };
  },

  view: function(ctrl, args) {
    return m(".toggleDiv", { style: {"transition": "all .1s ease-out", "overflow": "hidden", "display": ctrl.vm.display() }}, [
      args.content ]);
  }
};
