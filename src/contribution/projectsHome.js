window.c.contribution.projectsHome = (function(m, c){
  return {

    controller: function() {
      var vm = {recommendedCollection: m.prop([]),
                recentCollection: m.prop([]),
                expiringCollection: m.prop([])
          },

          expiring = m.postgrest.filtersVM({expires_at: 'lte', state: 'eq'});
          expiring.expires_at(moment().add(7, 'days').format('YYYY-MM-DD'));
          expiring.state('online');

          recents = m.postgrest.filtersVM({created_at: 'gte', state: 'eq'});
          recents.created_at(moment().subtract(7, 'days').format('YYYY-MM-DD'));
          recents.state('online');

          recommended = m.postgrest.filtersVM({recommended: 'eq', state: 'eq'});
          recommended.recommended('true');
          recommended.state('online');

      c.models.project.getPage(1, recommended.parameters()).then(function(data){
        vm.recommendedCollection(data);
      });

      c.models.project.getPage(1, recents.parameters()).then(function(data){
        vm.recentCollection(data);
      });

      c.models.project.getPage(1, expiring.parameters()).then(function(data){
        vm.expiringCollection(data);
      });

      var collections = [
        {
          title: 'Recomendados',
          hash: 'recommended',
          collection: vm.recommendedCollection
        },
        {
          title: 'Na reta final',
          hash: 'expiring',
          collection: vm.expiringCollection
        },
        {
          title: 'Recentes',
          hash: 'recent',
          collection: vm.recentCollection
        }
      ];


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
