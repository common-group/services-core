adminApp.AdminContributions.VM = (function(){
  var contributions = m.prop(""),
      filters = m.prop(""),
      isLoading = m.prop(false),
      page = m.prop(1);

  var getContributions = function(){
    return adminApp.models.ContributionDetail.get(filters(), page());
  };

  var filter = function(input){
    isLoading(true);
    var input = input || {},
        d = m.deferred();
    filters(input); 
    getContributions().then(function(data){
      contributions(data);
      d.resolve(contributions());
      isLoading(false);
    });  
    return d.promise;
  };

  var nextPage = function(){
    var d = m.deferred();
    isLoading(true);
    page(page()+1);
    getContributions().then(function(data){
      d.resolve(contributions(_.union(contributions(), data)));
      isLoading(false);
    });
    return d.promise;
  };

  filter();

  return {
    contributions: contributions,
    filter: filter,
    filters: filters,
    nextPage: nextPage,
    page: page
  };
})();