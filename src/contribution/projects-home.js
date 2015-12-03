window.c.contribution.ProjectsHome = (((m, c, moment, h, _) => {
    return {
        controller: () => {
            let sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                project = c.models.project,
                filters = c.contribution.projectFilters();

            const collections = _.map(['near_me', 'recommended', 'expiring', 'recent'], (name) => {
                const f = filters[name],
                      cLoader = loaderWithToken(project.getPageOptions(f.filter.parameters())),
                      collection = m.prop([]);

                cLoader.load().then(_.compose(collection, sample3));

                return {
                    title: f.title,
                    hash: name,
                    collection: collection,
                    loader: cLoader
                };
            });

            return {
                collections: collections
            };
        },

        view: (ctrl) => {
            return _.map(ctrl.collections, (collection) => {
                return collection.loader() ? h.loader() :
                    m.component(c.ProjectRow, {
                        collection: collection,
                        ref: `home_${collection.hash}`
                    });
            });
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._));
