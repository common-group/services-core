(function (factory) {
  // Browser globals
  factory(m, window);
}(function (m, window) { 
  var adminApp = window.adminApp = {};

  adminApp.submodule = function(module, args) {
    return module.view.bind(this, new module.controller(args))
  } 
}));
