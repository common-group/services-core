window.c.root.ProjectsHome = (((m, c, moment, h, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: () => {
            let sample6 = _.partial(_.sample, _, 6),
                loader = m.postgrest.loader,
                project = c.models.project,
                filters = c.vms.projectFilters(),
                vm = c.vms.home();

            const collections = _.map(['score'], (name) => {
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
                collections: collections,
                slidesContent: vm.banners
            };
        },

        view: (ctrl) => {
            const slides = () => {
                return _.map(ctrl.slidesContent, (slide) => {
                    const customStyle = `background-image: url(${slide.image});`;
                    const content = m('.w-container.u-text-center',[
                        m('.w-row.u-marginbottom-40', [
                            m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title),
                            m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))
                        ]),
                        m('a.btn.btn-large.u-marginbottom-10.btn-inline',{href: slide.link}, slide.cta)
                    ]);

                    return {
                        content: content,
                        customStyle: customStyle
                    };
                });
            };

            return [
                m.component(c.Slider, {
                    slides: slides(),
                    effect: 'fade',
                    slideClass: 'hero-slide start',
                    wrapperClass: 'hero-full hero-full-slide',
                    sliderTime: 10000
                }),
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
})(window.m, window.c, window.moment, window.c.h, window._, window.I18n));
