adminApp.AdminContributions.VM = (function(){
  var contributions = m.prop(""),
      filters = m.prop(""),
      page = m.prop(1);

  var filter = function(input){
    var input = input || {},
        d = m.deferred();
    filters(input); 
    adminApp.models.ContributionDetail.get(filters(), page()).then(function(data){
      contributions(data);
      d.resolve(contributions());
    });  
    return d.promise;
  };

  var nextPage = function(){
    page(page()+1);
    adminApp.models.ContributionDetail.get(filters(),page()).then(function(data){
      contributions(_.union(contributions(), data));
    });
  }

  filter();

  return {
    contributions: contributions,
    filter: filter,
    filters: filters,
    page: page
  }
})();