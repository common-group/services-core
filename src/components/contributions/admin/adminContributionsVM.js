adminApp.AdminContributions.VM = (function(){
  var contributions = m.prop({}),
      defaultOrder = "id.desc";
      filters = m.prop({order: defaultOrder}),
      isLoading = m.prop(false),
      page = m.prop(1);

  var fetch = function(){
    var d = m.deferred();
    m.startComputation();
    adminApp.models.ContributionDetail.getPageWithToken(page(), filters()).then(function(data){
      contributions(_.union(contributions(), data));
      isLoading(false);
      d.resolve(contributions());
      m.endComputation();
    });
    return d.promise;
  };

  var loading = function(){
    isLoading(true);
    m.redraw();
  };

  var filter = function(input){
    loading();
    if(input){
      input.order = input.order || defaultOrder;
      filters(input);
    }
    page(1);
    return fetch();
  };

  var nextPage = function(){
    loading();
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
