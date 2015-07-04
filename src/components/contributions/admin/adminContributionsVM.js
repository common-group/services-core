adminApp.AdminContributions.VM = (function(){
  var contributions = m.prop([]),
      defaultOrder = "id.desc",
      filters = m.prop({order: defaultOrder}),
      isLoading = m.prop(false),
      page = m.prop(1);

  var fetch = function(){
    var d = m.deferred();
    isLoading(true);
    m.redraw();
    m.startComputation();
    adminApp.models.ContributionDetail.getPageWithToken(page(), filters()).then(function(data){
      contributions(_.union(contributions(), data));
      isLoading(false);
      d.resolve(contributions());
      m.endComputation();
    });
    return d.promise;
  };

  var filter = function(parameters){
    if(parameters){
      parameters.order = parameters.order || defaultOrder;
      filters(parameters);
    }
    contributions([]);
    page(1);
    return fetch();
  };

  var nextPage = function(){
    page(page()+1);
    return fetch();
  };

  return {
    contributions: contributions,
    fetch: fetch,
    filter: filter,
    isLoading: isLoading,
    nextPage: nextPage
  };
})();
