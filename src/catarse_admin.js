var adminApp = window.adminApp = {};

adminApp.models = {};

adminApp.submodule = function(module, args) {
  return module.view.bind(this, new module.controller(args))
};

var momentify = function(date, format) {
  format = format || "DD/MM/YYYY";
  return (date) ? moment(new Date(date)).format(format) : "no date";
};
