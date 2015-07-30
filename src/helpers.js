//Date Helpers
var momentify = function(date, format) {
  format = format || "DD/MM/YYYY";
  return (date) ? moment(date).format(format) : "no date";
};

var momentFromString = function(date, format){
  var european = moment(date, format || 'DD/MM/YYYY');
  return european.isValid() ? european : moment(date);
};

//Number formatting helpers
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

//Object manipulation helpers
var toggleProp = function(defaultState, alternateState) {
  var p = m.prop(defaultState);
  p.toggle = function(){
    p(((p() === alternateState) ? defaultState : alternateState));
  };

  return p;
};

//Templates
var loader = function(){
  return m("img[alt='Loader'][src='https://s3.amazonaws.com/catarse.files/loader.gif']");
}
