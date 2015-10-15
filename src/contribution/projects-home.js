window.c.contribution.ProjectsHome = (((m, c, moment, h, _) => {
  return {
    controller: () => {
      let sample3 = _.partial(_.sample, _, 3),
        loader = m.postgrest.loaderWithToken,
        vm = {
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

      let nearMeLoader = loader(project.getPageOptions(nearMe.parameters()));
      nearMeLoader.load().then(_.compose(vm.nearMeCollection, sample3));
      let recommendedLoader = loader(project.getPageOptions(recommended.parameters()));
      recommendedLoader.load().then(_.compose(vm.recommendedCollection, sample3));
      let recentLoader = loader(project.getPageOptions(recents.parameters()));
      recentLoader.load().then(_.compose(vm.recentCollection, sample3));
      let expiringLoader = loader(project.getPageOptions(expiring.parameters()));
      expiringLoader.load().then(_.compose(vm.expiringCollection, sample3));

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
        collections: collections,
        nearMeLoader: nearMeLoader,
        recommendedLoader: recommendedLoader,
        expiringLoader: expiringLoader,
        recentLoader: recentLoader
      };
    },

    view: (ctrl) => {
      let isLoading = m.prop(ctrl.nearMeLoader() || ctrl.recommendedLoader() || ctrl.expiringLoader() || ctrl.recentLoader());
      return (!isLoading()) ? _.map(ctrl.collections, (collection) => {
        return m.component(c.ProjectRow, {collection: collection, ref: `home_${collection.hash}`});
      }) : h.loader();
    }
  };
})(window.m, window.c, window.moment, window.c.h, window._));
