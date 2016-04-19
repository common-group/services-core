/**
 * window.c.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
window.c.root.ProjectsExplore = ((m, c, h, _, moment) => {

    return {
        controller: () => {
            const filters = m.postgrest.filtersVM,
                  projectFilters = c.vms.projectFilters(),
                  filtersMap = projectFilters.filters,
                  defaultFilter = 'score',
                  fallbackFilter = 'all',
                  currentFilter = m.prop(filtersMap[defaultFilter]),
                  changeFilter = (newFilter) => {
                      currentFilter(filtersMap[newFilter]);
                      loadRoute();
                  },
                  resetContextFilter = () => {
                      currentFilter(filtersMap[defaultFilter]);
                      projectFilters.setContextFilters(['score', 'successful', 'all']);
                  },
                  categoryCollection = m.prop([]),
                  categoryId = m.prop(),
                  findCategory = (id) => {
                      return _.find(categoryCollection(), function(c){ return c.id === parseInt(id); });
                  },
                  category = _.compose(findCategory, categoryId),
                  loadCategories = () => {
                      return c.models.category.getPageWithToken(filters({}).order({name: 'asc'}).parameters()).then(categoryCollection);
                  },
                  // Fake projects object to be able to render page while loadding (in case of search)
                  projects = m.prop({collection: m.prop([]), isLoading: () => { return true; }, isLastPage: () => { return true; }}),
                  loadRoute = () => {
                      const route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                            cat = route &&
                                route[2] &&
                                findCategory(route[2]),

                            filterFromRoute =  () => {
                                const byCategory = filters({
                                    category_id: 'eq'
                                });

                                return route &&
                                    route[1] &&
                                    filtersMap[route[1]] ||
                                    cat &&
                                    {title: cat.name, filter: byCategory.category_id(cat.id)};
                            },

                            filter = filterFromRoute() || currentFilter(),
                            search = h.paramByName('pg_search'),

                            searchProjects = () => {
                                const l = m.postgrest.loaderWithToken(c.models.projectSearch.postOptions({query: search})),
                                      page = { // We build an object with the same interface as paginationVM
                                          collection: m.prop([]),
                                          isLoading: l,
                                          isLastPage: () => { return true; },
                                          nextPage: () => { return false; }
                                      };
                                l.load().then(page.collection);
                                return page;
                            },

                            loadProjects = () => {
                                const pages = m.postgrest.paginationVM(c.models.project);
                                const parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                                    open_for_contributions: 'desc',
                                    state_order: 'asc',
                                    state: 'desc',
                                    score: 'desc',
                                    pledged: 'desc'
                                }).parameters());
                                pages.firstPage(parameters);
                                return pages;
                            },

                            loadSuccessfulProjects = () => {
                                const pages = m.postgrest.paginationVM(c.models.successfulProject),
                                    parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({pledged: 'desc'}).parameters());
                                pages.firstPage(parameters);

                                return pages;
                            };

                      if (_.isString(search) && search.length > 0 && route === null) {
                          title('Busca ' + search);
                          projects(searchProjects());
                      } else if (currentFilter().keyName === 'successful') {
                          projects(loadSuccessfulProjects());
                      } else {
                          title(filter.title);
                          if (!_.isNull(route) && route[1] == 'successful') {
                              projects(loadSuccessfulProjects());
                          } else {
                              projects(loadProjects());
                          }
                      }
                      categoryId(cat && cat.id);
                      route || (_.isString(search) && search.length > 0) ? toggleCategories(false) : toggleCategories(true);
                  },
                  title = m.prop(),
                  toggleCategories = h.toggleProp(false, true);

            window.addEventListener('hashchange', () => {
                resetContextFilter();
                loadRoute();
                m.redraw();
            }, false);

            // Initial loads
            resetContextFilter();
            c.models.project.pageSize(9);
            loadCategories().then(loadRoute);

            return {
                categories: categoryCollection,
                changeFilter: changeFilter,
                fallbackFilter: fallbackFilter,
                projects: projects,
                category: category,
                title: title,
                filtersMap: filtersMap,
                currentFilter: currentFilter,
                projectFilters: projectFilters,
                toggleCategories: toggleCategories
            };
        },

        view: (ctrl) => {

            if (!ctrl.projects().isLoading() && _.isEmpty(ctrl.projects().collection())){
                ctrl.projectFilters.removeContextFilter(ctrl.currentFilter());
                ctrl.changeFilter(ctrl.fallbackFilter);
            }

            return [
                m('.w-section.hero-search', [
                    m.component(c.Search),
                    m('.w-container.u-marginbottom-10', [
                        m('.u-text-center.u-marginbottom-40', [
                            m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]',
                                {onclick: () => ctrl.toggleCategories.toggle()},
                                ['Explore projetos incríveis ', m(`span#explore-btn.fa.fa-angle-down${ctrl.toggleCategories() ? '.opened' : ''}`, '')])
                        ]),
                        m(`#categories.category-slider${ctrl.toggleCategories() ? '.opened' : ''}`, [
                            m('.w-row', [
                                _.map(ctrl.categories(), (category) => {
                                    return m.component(c.CategoryButton, {category: category});
                                })
                            ])
                        ]),
                    ])
                ]),

                m('.w-section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', [
                                m('.fontsize-larger', ctrl.title())
                            ]),
                            m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                m('select.w-select.text-field.positive',
                                    {onchange: m.withAttr('value', ctrl.changeFilter)},
                                    _.map(ctrl.projectFilters.getContextFilters(), (pageFilter, idx) => {
                                        const projects = ctrl.projects(),
                                            isSelected = ctrl.currentFilter() == pageFilter;

                                        return m(`option[value="${pageFilter.keyName}"][${isSelected ? 'selected' : ''}]`, pageFilter.nicename);
                                    })
                                )
                            )
                        ])
                    ])
                ]),

                m('.w-section.section', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-row', _.map(ctrl.projects().collection(), (project, idx) => {
                                let cardType = 'small';

                                if (ctrl.currentFilter().keyName === 'score') {
                                    cardType = idx === 0 ? 'big' : (idx === 1 || idx === 2) ? 'medium' : 'small';
                                }

                                return m.component(c.ProjectCard, {project: project, ref: 'ctrse_explore', type: cardType});
                            })),
                            ctrl.projects().isLoading() ? h.loader() : ''
                        ])
                    ])
                ]),

                m('.w-section.u-marginbottom-80', [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-2.w-col-push-5', [
                              (ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _.isEmpty(ctrl.projects().collection())) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {onclick: () => { ctrl.projects().nextPage(); return false; }}, 'Carregar mais')
                            ]),
                        ])
                    ])
                ]),

                m('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [
                    m('.w-container.u-text-center', [
                        m('img.u-marginbottom-20.icon-hero', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'}),
                        m('h2.fontsize-larger.u-marginbottom-60', 'Lance sua campanha no Catarse!'),
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4', [
                                m('a.w-button.btn.btn-large', {href: '/start?ref=ctrse_explore'}, 'Aprenda como')
                            ])
                        ])
                    ])
                ])
            ];
        }
    };
}(window.m, window.c, window.c.h, window._, window.moment));
