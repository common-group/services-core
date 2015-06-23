adminApp.AdminContributions.VM = (function(){
  var contributions = m.prop(""),
      filters = m.prop(""),
      page = m.prop(1);

  var getContributions = function(){
    return adminApp.models.ContributionDetail.get(filters(), page());
  };

  var filter = function(input){
    var input = input || {},
        d = m.deferred();
    filters(input); 
    getContributions().then(function(data){
      contributions(data);
      d.resolve(contributions());
    });  
    return d.promise;
  };

  var nextPage = function(){
    page(page()+1);
    getContributions().then(function(data){
      contributions(_.union(contributions(), data));
    });
  };

  filter();

  return {
    contributions: contributions,
    filter: filter,
    filters: filters,
    nextPage: nextPage,
    page: page
  }
})();