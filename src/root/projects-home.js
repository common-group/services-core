window.c.root.ProjectsHome = (((m, models, c, moment, h, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: (args) => {
            let sample6 = _.partial(_.sample, _, 6),
                loader = m.postgrest.loader,
                project = c.models.project,
                filters = c.vms.projectFilters().filters,
                userFriendVM = m.postgrest.filtersVM({
                    user_id: 'eq'
                }),
                friendListVM = m.postgrest.paginationVM(models.userFriend, 'user_id.desc', {
                    'Prefer':  'count=exact'
                }),
                vm = c.vms.home(),
                currentUserId = args.root.getAttribute('data-currentuserid'),
                hasFBAuth = args.root.getAttribute('data-hasfb') === 'true';

            userFriendVM.user_id(currentUserId);

            if (hasFBAuth && !friendListVM.collection().length) {
                friendListVM.firstPage(userFriendVM.parameters());
            }

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


            project.pageSize(20);

            return {
                collections: collections,
                slidesContent: vm.banners,
                hasFBAuth: hasFBAuth,
                friendListVM: friendListVM
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
                        title: I18n.t('row_title', I18nScope()),
                        ref: `home_${collection.hash}`
                    });
                }),
                (ctrl.hasFBAuth ?
                 m.component(c.SignedFriendFacebookConnect, {friendListVM: ctrl.friendListVM}) : m.component(c.UnsignedFriendFacebookConnect) )
            ];
        }
    };
})(window.m, window.c.models, window.c, window.moment, window.c.h, window._, window.I18n));
