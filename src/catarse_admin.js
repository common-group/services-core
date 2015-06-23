var adminApp = window.adminApp = {};

adminApp.models = {};

adminApp.submodule = function(module, args) {
  return module.view.bind(this, new module.controller(args))
};
