adminApp.adminContributionsFilter.VM = (function(){
  var permalink = m.prop("");

  function filter(){
    var filter = {
      permalink: permalink()
    };
    return filter;
  }

  return {
    permalink: permalink,
    filter: filter
  }
})();