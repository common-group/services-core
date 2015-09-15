window.c.contribution.projectsHome = (function(m, c){
  return {

    controller: function() {
      var vm = {recommendedCollection: m.prop([]),
                recentCollection: m.prop([]),
                nearMeCollection: m.prop([]),
                expiringCollection: m.prop([])
          },

          expiring = m.postgrest.filtersVM({expires_at: 'lte', state: 'eq'});
          expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
          expiring.state('online');

          nearMe = m.postgrest.filtersVM({near_me: 'eq', state: 'eq'});
          nearMe.near_me('true');
          nearMe.state('online');

          recents = m.postgrest.filtersVM({online_date: 'gte', state: 'eq'});
          recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
          recents.state('online');

          recommended = m.postgrest.filtersVM({recommended: 'eq', state: 'eq'});
          recommended.recommended('true');
          recommended.state('online');

      c.models.project.getPage(nearMe.parameters()).then(function(data){
        vm.nearMeCollection(data);
      });

      c.models.project.getPage(recommended.parameters()).then(function(data){
        vm.recommendedCollection(data);
      });

      c.models.project.getPage(recents.parameters()).then(function(data){
        vm.recentCollection(data);
      });

      c.models.project.getPage(expiring.parameters()).then(function(data){
        vm.expiringCollection(data);
      });

      var collections = [
        {
          title: 'Próximos a você',
          hash: 'near_of',
          collection: vm.nearMeCollection
        },
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
