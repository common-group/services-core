var adminApp = window.adminApp = {};

m.postgrest.init("http://api.catarse.me/", {method: "GET", url: "/api_token"});

adminApp.models = {};

adminApp.submodule = function(module, args) {
  return module.view.bind(this, new module.controller(args))
};
