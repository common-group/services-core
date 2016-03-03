window.c.root.ProjectsHome = (((m, c, moment, h, _) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: () => {
            let sample6 = _.partial(_.sample, _, 6),
                loader = m.postgrest.loader,
                project = c.models.project,
                filters = c.vms.projectFilters();

            const collections = _.map(['recommended'], (name) => {
                const f = filters[name],
                      cLoader = loader(project.getPageOptions(f.filter.parameters())),
                      collection = m.prop([]);

                cLoader.load().then(_.compose(collection, sample6));

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
                }),
                m.component(c.ContributionActivities)
            ];
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._));
