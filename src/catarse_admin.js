var adminApp = window.adminApp = {};

adminApp.models = {};

adminApp.submodule = function(module, args) {
  return module.view.bind(this, new module.controller(args))
};

var momentify = function(date, format) {
  format = format || "DD/MM/YYYY";
  return (date) ? moment(new Date(date)).format(format) : "no date";
};

var generateFormatNumber = function(s, c) {
  return function(number, n, x) {
    if(number == null || number == undefined) {
      return null
    }

    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')';
    var num = number.toFixed(Math.max(0, ~~n));
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  }
};

var formatNumber = generateFormatNumber('.', ',');
