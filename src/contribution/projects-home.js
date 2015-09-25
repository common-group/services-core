window.c.contribution.ProjectsHome = ((m, c) => {
  return {
    controller: () => {
      let vm = {
        recommendedCollection: m.prop([]),
        recentCollection: m.prop([]),
        nearMeCollection: m.prop([]),
        expiringCollection: m.prop([])
      },
      project = c.models.project,

      expiring = m.postgrest.filtersVM({expires_at: 'lte', state: 'eq'}),
      nearMe = m.postgrest.filtersVM({near_me: 'eq', state: 'eq'}),
      recents = m.postgrest.filtersVM({online_date: 'gte', state: 'eq'}),
      recommended = m.postgrest.filtersVM({recommended: 'eq', state: 'eq'});

      expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
      expiring.state('online');

      nearMe.near_me('true').state('online');

      recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
      recents.state('online');

      recommended.recommended('true').state('online');

      project.getPageWithToken(nearMe.parameters()).then(vm.nearMeCollection);
      project.getPage(recommended.parameters()).then(vm.recommendedCollection);
      project.getPage(recents.parameters()).then(vm.recentCollection);
      project.getPage(expiring.parameters()).then(vm.expiringCollection);

      let collections = [
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

    view: (ctrl) => {
      return _.map(ctrl.collections, (collection) => {
        return m.component(c.ProjectRow, {collection: collection, ref: `home_${collection.hash}`});
      });
    }
  };
}(window.m, window.c));
