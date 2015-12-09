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
                  follow = c.models.categoryFollower,
                  filtersMap = c.contribution.projectFilters(),
                  categoryCollection = m.prop([]),
                  // Fake projects object to be able to render page while loadding (in case of search)
                  projects = m.prop({collection: m.prop([]), isLoading: () => { return true; }}),
                  title = m.prop(),
                  categoryId = m.prop(),
                  findCategory = (id) => {
                      return _.find(categoryCollection(), function(c){ return c.id === parseInt(id); });
                  },
                  category = _.compose(findCategory, categoryId),

                  loadCategories = () => {
                      return c.models.category.getPageWithToken(filters({}).order({name: 'asc'}).parameters()).then(categoryCollection);
                  },

                  followCategory = (id) => {
                      return () => {
                          follow.postWithToken({category_id: id}).then(loadCategories);
                          return false;
                      };
                  },
                  unFollowCategory = (id) => {
                      return () => {
                          follow.deleteWithToken(filters({category_id: 'eq'}).category_id(id).parameters()).then(loadCategories);
                          return false;
                      };
                  },

                  loadRoute = () => {
                      const route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),

                            cat = route &&
                                route[2] &&
                                findCategory(route[2]),

                            filterFromRoute =  () =>{
                                const byCategory = filters({state_order: 'gte', category_id: 'eq'}).state_order('published');

                                return route &&
                                    route[1] &&
                                    filtersMap[route[1]] ||
                                    cat &&
                                    {title: cat.name, filter: byCategory.category_id(cat.id)};
                            },

                            filter = filterFromRoute() || filtersMap.recommended,
                            search = h.paramByName('pg_search'),

                            searchProjects = () => {
                                const l = m.postgrest.loaderWithToken(c.models.projectSearch.postOptions({query: search})),
                                      page = { // We build an object with the same interface as paginationVM
                                          collection: m.prop([]),
                                          isLoading: l,
                                          nextPage: () => { return false; }
                                      };
                                l.load().then(page.collection);
                                return page;
                            },

                            loadProjects = () => {
                                const pages = m.postgrest.paginationVM(c.models.project);
                                pages.firstPage(filter.filter.order({
                                    open_for_contributions: 'desc',
                                    state_order: 'asc',
                                    project_id: 'desc'
                                }).parameters());
                                return pages;
                            };

                      if (_.isString(search) && search.length > 0 && route === null) {
                          title('Busca ' + search);
                          projects(searchProjects());
                      } else {
                          title(filter.title);
                          projects(loadProjects());
                      }
                      categoryId(cat && cat.id);
                      toggleCategories.toggle();
                  },

                  toggleCategories = h.toggleProp(false, true);

            window.addEventListener('hashchange', () => {
                loadRoute();
                m.redraw();
            }, false);

            // Initial loads
            c.models.project.pageSize(9);
            loadCategories().then(loadRoute);

            return {
                categories: categoryCollection,
                followCategory: followCategory,
                unFollowCategory: unFollowCategory,
                projects: projects,
                category: category,
                title: title,
                filtersMap: filtersMap,
                toggleCategories: toggleCategories
            };
        },

        view: (ctrl) => {
            return [
                m('.w-section.hero-search', [
                    m('.w-container.u-marginbottom-10', [
                        m('.u-text-center.u-marginbottom-40', [
                            m('a.link-hidden-white.fontweight-light.fontsize-larger[href=\'#\']',{onclick: () => { ctrl.toggleCategories.toggle(); return false;}}, ['Explore projetos incríveis ',m('span.fa.fa-angle-down', '')])
                        ]),

                        m('#categories.category-slider', ctrl.toggleCategories() ? [
                            m('.w-row', [
                                _.map(ctrl.categories(), (category) => {
                                    return m.component(c.CategoryButton, {category: category});
                                })
                            ]),

                            m('.w-row.u-marginbottom-30', [
                                _.map(ctrl.filtersMap, (filter, href) => {
                                    return m.component(c.FilterButton, {title: filter.title, href: href});
                                })

                            ])
                        ] : ''),
                    ])
                ]),

                m('.w-section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-small-7.w-col-tiny-7', [
                                m('.fontsize-larger', ctrl.title())
                            ]),

                            _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-small-5.w-col-tiny-5', [
                                m('.w-row', [
                                    m('.w-col.w-col-8.w-hidden-small.w-hidden-tiny.w-clearfix', [
                                        m('.following.fontsize-small.fontcolor-secondary.u-right', `${ctrl.category().followers} seguidores`)
                                    ]),
                                    m('.w-col.w-col-4.w-col-small-12.w-col-tiny-12', [
                                        ctrl.category().following ?
                                            m('a.btn.btn-medium.btn-terciary.unfollow-btn[href=\'#\']', {onclick: ctrl.unFollowCategory(ctrl.category().id)}, 'Deixar de seguir') :
                                            m('a.btn.btn-medium.follow-btn[href=\'#\']', {onclick: ctrl.followCategory(ctrl.category().id)}, 'Seguir')
                                    ])
                                ])
                            ]) : ''

                        ])
                    ])
                ]),

                m('.w-section.section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-row', _.map(ctrl.projects().collection(), (project) => {
                                return m.component(c.ProjectCard, {project: project});
                            })),
                            ctrl.projects().isLoading() ? h.loader() : ''
                        ])
                    ])
                ]),

                m('.w-section.section.loadmore', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-5'),
                            m('.w-col.w-col-2', [
                                m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {onclick: () => { ctrl.projects().nextPage(); return false; }}, 'Carregar mais')
                            ]),
                            m('.w-col.w-col-5')
                        ])
                    ])
                ])];
        }
    };
}(window.m, window.c, window.c.h, window._));
