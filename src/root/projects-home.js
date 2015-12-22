window.c.root.ProjectsHome = (((m, c, moment, h, _) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: () => {
            let sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                project = c.models.project,
                filters = c.root.projectFilters();

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
            return [
                m('.w-section.hero-full.hero-2016', [
                    m('.w-container.u-text-center', [
                        m('.fontsize-megajumbo.u-marginbottom-60.fontweight-semibold.fontcolor-negative', I18n.t('title', I18nScope())),
                        m('a[href="http://2015.catarse.me/"].btn.btn-large.u-marginbottom-10.btn-inline', I18n.t('cta', I18nScope()))
                    ])
                ]),
                _.map(ctrl.collections, (collection) => {
                    return m.component(c.ProjectRow, {
                        collection: collection,
                        ref: `home_${collection.hash}`
                    });
                })
            ];
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._));
