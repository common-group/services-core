window.c.project.Index = (function(m, c){
  return {

    controller: function() {
      var vm = {recommendedCollection: m.prop([]),
                recentCollection: m.prop([]),
                expiringCollection: m.prop([])
          },
          expiring = m.postgrest.filtersVM({origin: 'eq'});
          expiring.origin('expiring');
          recommended = m.postgrest.filtersVM({origin: 'eq'});
          recommended.origin('recommended');
          recents = m.postgrest.filtersVM({origin: 'eq'});
          recents.origin('recents');

      c.models.projectsForHome.getPage(1, recommended.parameters()).then(function(data){
        vm.recommendedCollection(data);
      });

      c.models.projectsForHome.getPage(1, recents.parameters()).then(function(data){
        vm.recentCollection(data);
      });

      c.models.projectsForHome.getPage(1, expiring.parameters()).then(function(data){
        vm.expiringCollection(data);
      });

      var collections = [
        {
          title: 'Recomendados',
          hash: 'recommended',
          collection: vm.recommendedCollection
        },
        {
          title: 'Recentes',
          hash: 'recents',
          collection: vm.recentCollection
        },
        {
          title: 'Na reta final',
          hash: 'expiring',
          collection: vm.expiringCollection
        }];


      return {
        collections: collections
      };
    },

    view: function(ctrl) {
      return [
        _.map(ctrl.collections, function(collection){
          return m.component(c.ProjectRow, {collection: collection});
        })];

  }};
}(window.m, window.c));
