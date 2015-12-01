/**
 * window.c.contribution.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
window.c.contribution.ProjectsExplore = ((m, c, h, _) => {
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
                  lCategories = m.postgrest.loader(
                      c.models.category.getPageOptions(
                          filters({}).order({name: 'asc'}).parameters()
                      )
                      , m.postgrest.request
                      , true
                  );

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

                loadProjects: (title, filter, category) => {
                    vm.title(title);
                    vm.category(category);
                    projects.firstPage(filter.parameters());
                    vm.toggleCategories.toggle();
                },

                loadRoute: () => {
                    const route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                          categoryFromRoute = () =>{
                              return route &&
                                        route[2] &&
                                        _.find(vm.categoryCollection(), function(c){ return c.id === parseInt(route[2]); });
                          },

                          filterFromRoute =  () =>{
                              const cat = categoryFromRoute();
                              return route &&
                                  route[1] &&
                                  filtersMap[route[1]] ||
                                  cat &&
                                  {title: cat.name, filter: byCategory.category_id(cat.id)};
                          },

                          filter = filterFromRoute() || filtersMap.recommended;
                    return vm.loadProjects(filter.title, filter.filter, categoryFromRoute());
                },

                toggleCategories: h.toggleProp(false, true)
            };

            window.addEventListener('hashchange', () => {
                vm.loadRoute();
                m.redraw();
            }, false);

            // Initial loads
            lCategories.load().then(vm.categoryCollection);
            vm.loadRoute();
            window.cat = vm.categoryCollection;

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
                            m('a.link-hidden-white.fontweight-light.fontsize-larger[href=\'#\']',{onclick: () => { ctrl.vm.toggleCategories.toggle(); return false;}}, ['Explore projetos incríveis ',m('span.fa.fa-angle-down', '')])
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

                            _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-tiny-6', [
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
}(window.m, window.c, window.c.h, window._));
