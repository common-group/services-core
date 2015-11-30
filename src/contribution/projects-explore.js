window.c.contribution.ProjectsExplore = ((m, c, h) => {
    return {

        controller: () => {
            const filters = m.postgrest.filtersVM,
                  nearMe = filters({near_me: 'eq', state: 'eq'}).near_me(true),
                  expiring = filters({expires_at: 'lte', state: 'eq'}).state('online').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),
                  recents = filters({online_date: 'gte', state: 'eq'}).state('online').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),
                  recommended = filters({recommended: 'eq', state: 'eq'}).recommended('true').state('online'),
                  online = filters({state: 'eq'}).state('online'),
                  byCategory = filters({category_id: 'eq'}),
                  projects = m.postgrest.paginationVM(c.models.project, 'project_id.desc'),
                  successful = filters({state: 'eq'}).state('successful'),
                  category = c.models.category,
                  categories = filters({}),
                  lCategories = m.postgrest.loader(category.getPageOptions(categories.order({name: 'asc'}).parameters()), m.postgrest.request, true);

            const filtersMap = {
                recommended: {
                    title: 'Recomendados',
                    filter: recommended
                },
                online: {
                    title: 'No ar',
                    filter: online
                },
                expiring: {
                    title: 'Reta final',
                    filter: expiring
                },
                successful: {
                    title: 'Bem-sucedidos',
                    filter: successful
                },
                recents: {
                    title: 'Recentes',
                    filter: recents
                },
                near_me: {
                    title: 'Próximos a mim',
                    filter: nearMe
                }
            };

            const vm = {
                categoryCollection: m.prop([]),
                title: m.prop(),
                category: m.prop(),

                loadProjects: () => {
                    let filter = filtersMap.recommended;
                    vm.title(filter.title);
                    vm.category(undefined);
                    projects.firstPage(filter.filter.parameters());
                    vm.toggleCategories.toggle();
                },

                toggleCategories: h.toggleProp(false, true)
            };

            window.addEventListener('hashchange', () => {
                vm.loadProjects();
                m.redraw();
            }, false);

            // Initial loads
            lCategories.load().then(vm.categoryCollection);
            vm.loadProjects();

            return {
                categories: vm.categoryCollection,
                projects: projects,
                category: vm.category,
                title: vm.title,
                filtersMap: filtersMap,
                lCategories: lCategories,
                vm: vm
            };
        },

        view: (ctrl) => {
            return [
                m('.w-section.hero-search', [
                    m('.w-container.u-marginbottom-10', [
                        m('.u-text-center.u-marginbottom-40', [
                            m('a.link-hidden-white.fontweight-light.fontsize-larger[href=\'#\']',{onclick: ctrl.vm.toggleCategories.toggle}, ['Explore projetos incríveis ',m('span.fa.fa-angle-down', '')])
                        ]),

                        m('#categories.category-slider', ctrl.vm.toggleCategories() ? [
                            m('.w-row', [
                                ctrl.lCategories() ? '...' :
                                _.map(ctrl.categories(), (category) => {
                                    return m.component(c.CategoryButton, {category: category});
                                })
                            ]),

                            m('.w-row.u-marginbottom-30', [
                                _.map(ctrl.filtersMap, (filter, href) => {
                                    return m.component(c.FilterButton, {filter: filter, href: href});
                                })

                            ])
                        ] : ''),
                    ])
                ]),

                m('.w-section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-tiny-6', [
                                m('.fontsize-larger', ctrl.title())
                            ]),

                            (ctrl.category() !== undefined) ? m('.w-col.w-col-6.w-col-tiny-6', [
                                m('.w-row', [
                                    m('.w-col.w-col-9.w-col-tiny-6.w-clearfix', [
                                        m('.following.fontsize-small.fontcolor-secondary.u-right', `${ctrl.category().followers} seguidores`)
                                    ]),
                                    m('.w-col.w-col-3.w-col-tiny-6', [
                                        m('a.btn.btn-small[href=\'#\']', 'Seguindo ')
                                    ])
                                ])
                            ]) : ''

                        ])
                    ])
                ]),

                m('.w-section.section', [
                    m('.w-container', [
                        m('.w-row', [
                            ctrl.projects.isLoading() ? h.loader() :
                            m('.w-row', _.map(ctrl.projects.collection(), (project) => {
                                return m.component(c.ProjectCard, {project: project});
                            }))
                        ])
                    ])
                ]),

                m('.w-section.section.loadmore', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-5'),
                            m('.w-col.w-col-2', [
                                m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {onclick: ctrl.projects.nextPage}, 'Carregar mais')
                            ]),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])];
        }
    };
}(window.m, window.c, window.c.h));
