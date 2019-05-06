/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
import m from 'mithril';
import prop from 'mithril/stream';
import {
    catarse,
    commonRecommender
} from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import categoryButton from '../c/category-button';
import search from '../c/search';
import projectCard from '../c/project-card';
import tooltip from '../c/tooltip';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';

const I18nScope = _.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
const projectsExplore = {
    oninit: function(vnode) {
        const filters = catarse.filtersVM,
            projectFiltersVM = projectFilters(),
            filtersMap = projectFiltersVM.filters,
            currentUser = h.getUser() || {},
            chosenRecommender = prop(null),
            currentMode = prop(filtersMap.all_modes),
            selectedCategory = prop({
                name: 'Todas as categorias',
                id: null
            }),
            defaultFilter = h.paramByName('filter') || 'all',
            currentFilter = prop(filtersMap[defaultFilter]),
            modeToggle = h.toggleProp(true, false),
            //availableRecommenders = ['recommended_1', 'recommended_2'],
            availableRecommenders = [],
            categoryToggle = h.toggleProp(true, false),
            filterToggle = h.toggleProp(true, false),
            showFilter = h.toggleProp(true, false),
            changeFilter = (newFilter) => {
                currentFilter(filtersMap[newFilter]);
                // reset category
                if (_.contains(availableRecommenders, newFilter)) {
                    history.replaceState(null, null, ' ');
                    selectedCategory({
                        name: 'Todas as categorias',
                        id: null
                    });
                }
                loadRoute();
            },
            resetContextFilter = () => {
                currentFilter(filtersMap[defaultFilter]);
                const contextFilters = ['finished', 'all', 'contributed_by_friends', 'expiring', 'recent'];
                // only show recommended projects to logged in users with contributions
                //
                //if (currentUser.contributions && currentUser.contributions > 0 && currentMode().keyName !== 'sub') {
                //    const lastDigit = parseInt(currentUser.id.toString().slice(-1));
                //    // group into 2 even sets for A/B testing
                //    const testedRecommenderIndex = lastDigit % 2;
                //    chosenRecommender(availableRecommenders[testedRecommenderIndex]);
                //    contextFilters.push(chosenRecommender());
                //}
                projectFiltersVM.setContextFilters(contextFilters);
            },
            changeMode = (newMode) => {
                modeToggle.toggle();
                currentMode(filtersMap[newMode]);
                if (newMode === 'sub') {
                    // temporarily remove filters from sub projects
                    showFilter.toggle();
                    resetContextFilter();
                    projectFiltersVM.removeContextFilter(projectFiltersVM.filters.finished);
                    projectFiltersVM.removeContextFilter(projectFiltersVM.filters.expiring);
                    changeFilter('all');
                } else {
                    if (!showFilter()) {
                        showFilter.toggle();
                    }
                    resetContextFilter();
                    const scoreFilterForAonFlex = _.first(projectFiltersVM.getContextFilters());
                    currentFilter(scoreFilterForAonFlex);
                }
                loadRoute();
            },
            hasFBAuth = currentUser.has_fb_auth,
            isSearch = prop(false),
            categoryCollection = prop([]),
            categoryId = prop(),
            findCategory = id => _.find(categoryCollection(), c => c.id === parseInt(id)),
            category = _.compose(findCategory, categoryId),
            loadCategories = () => models.category.getPageWithToken(filters({}).order({
                name: 'asc'
            }).parameters()).then(c => {
                categoryCollection(c);
                m.redraw();
            }),
            externalLinkCategories = window.I18n.translations[window.I18n.currentLocale()].projects.index.explore_categories,
            hasSpecialFooter = categoryId => !_.isUndefined(externalLinkCategories[categoryId]),
            // just small fix when have two scored projects only
            checkForMinScoredProjects = collection => _.size(_.filter(collection, x => x.score >= 1)) >= 3,
            // Fake projects object to be able to render page while loadding (in case of search)
            projects = prop({
                collection: prop([]),
                isLoading: () => true,
                isLastPage: () => true
            }),
            loadRoute = () => {
                const route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                    cat = route &&
                    route[2] &&
                    findCategory(route[2]),

                    filterFromRoute = () => {
                        const byCategory = filters({
                            category_id: 'eq'
                        });

                        if (cat) {
                            selectedCategory(cat);
                        }
                        return route &&
                            route[1] &&
                            filtersMap[route[1]] ||
                            cat && {
                                title: cat.name,
                                filter: byCategory.category_id(cat.id)
                            };
                    },
                    filter = filterFromRoute() || currentFilter();

                const search = h.paramByName('pg_search'),
                    recommendedProjects = (alg) => {
                        let model;
                        switch (alg) {
                            case '1':
                                model = models.recommendedProjects1;
                                break;
                            default:
                                model = models.recommendedProjects2;
                        }
                        const pages = commonRecommender.paginationVM(model, '', {}, false);
                        const rFilter = commonRecommender.filtersVM({
                            user_id: 'eq'
                        }).user_id(currentUser.id);

                        const parameters = _.extend({}, currentFilter().filter.parameters(),
                            filter.filter.parameters(),
                            rFilter.parameters(),
                            currentMode().filter ? filtersMap[currentMode().keyName].filter.parameters() : {});
                        pages
                            .firstPage(parameters)
                            .then(_ => m.redraw());
                        return pages;
                    },

                    searchProjects = () => {
                        const l = catarse.loaderWithToken(models.projectSearch.postOptions({
                                query: search
                            })),
                            page = { // We build an object with the same interface as paginationVM
                                collection: prop([]),
                                isLoading: l,
                                isLastPage: () => true,
                                nextPage: () => false
                            };
                        l
                            .load()
                            .then(p => {
                                page.collection(p);
                                m.redraw();
                                return p;
                            });
                        return page;
                    },

                    // @TODO fix infinite requests when collection is empty
                    loadProjects = () => {
                        const pages = catarse.paginationVM(models.project, null, {
                            Prefer: 'count=exact'
                        });
                        const parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                            open_for_contributions: 'desc',
                            state_order: 'asc',
                            state: 'desc',
                            score: 'desc',
                            pledged: 'desc'
                        }).parameters(), currentMode().filter ? filtersMap[currentMode().keyName].filter.parameters() : {});
                        pages
                            .firstPage(parameters)
                            .then(_ => m.redraw());
                        return pages;
                    },

                    loadFinishedProjects = () => {
                        const pages = catarse.paginationVM(models.finishedProject, null, {
                                Prefer: 'count=exact'
                            }),
                            parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                                state_order: 'asc',
                                state: 'desc',
                                pledged: 'desc'
                            }).parameters(), currentMode().filter ? filtersMap[currentMode().keyName].filter.parameters() : {});
                        pages
                            .firstPage(parameters)
                            .then(_ => m.redraw());

                        return pages;
                    };

                if (_.isString(search) && search.length > 0 && route === null) {
                    isSearch(true);
                    title(`Busca ${search}`);
                    projects(searchProjects());
                } else if (currentFilter().keyName === 'finished') {
                    isSearch(false);
                    projects(loadFinishedProjects());
                } else if (currentFilter().keyName === 'recommended_1') {
                    isSearch(false);
                    projects(recommendedProjects('1'));
                } else if (currentFilter().keyName === 'recommended_2') {
                    isSearch(false);
                    projects(recommendedProjects('2'));
                } else {
                    isSearch(false);
                    title(filter.title);
                    if (!_.isNull(route) && route[1] == 'finished') {
                        projects(loadFinishedProjects());
                    } else {
                        projects(loadProjects());
                    }
                }
                categoryId(cat && cat.id);
            },
            title = prop();

        window.addEventListener('hashchange', () => {
            resetContextFilter();
            loadRoute();
            m.redraw();
        }, false);

        // Initial loads
        resetContextFilter();
        if (chosenRecommender()) {
            // clear category from hash
            history.replaceState(null, null, ' ');
            changeFilter(chosenRecommender());
        }
        models.project.pageSize(9);
        loadCategories().then(loadRoute);

        if (vnode.attrs.filter) {
            currentFilter(filtersMap[vnode.attrs.filter]);
        }

        if (!currentFilter()) {
            currentFilter(filtersMap[defaultFilter]);
        }

        let notWasTried = true;

        const tryLoadFromQueryPath = () => {
            const innerDefaultFilter = h.paramByName('filter') || vnode.attrs.filter || 'all'
            const projectModes = ['sub', 'not_sub'];
            const isSubscriptionOrAonFlex = projectModes.indexOf(innerDefaultFilter) >= 0;
            const filterIsForContributedByFriends = innerDefaultFilter === 'contributed_by_friends';

            if (notWasTried && isSubscriptionOrAonFlex) {
                changeMode(innerDefaultFilter);
                modeToggle(true);
                notWasTried = false;
            }
            else if (filterIsForContributedByFriends) {
                currentFilter(filtersMap[innerDefaultFilter]);
            }
        }

        vnode.state = {
            categories: categoryCollection,
            changeFilter,
            resetContextFilter,
            projects,
            category,
            title,
            loadRoute,
            modeToggle,
            availableRecommenders,
            categoryToggle,
            filterToggle,
            selectedCategory,
            currentMode,
            filtersMap,
            currentFilter,
            showFilter,
            changeMode,
            projectFiltersVM,
            isSearch,
            hasFBAuth,
            checkForMinScoredProjects,
            categoryId,
            hasSpecialFooter,
            externalLinkCategories,
            tryLoadFromQueryPath
        };
    },
    view: function({state, attrs}) {
        const categoryId = state.categoryId,
            projectsCollection = state.projects().collection(),
            projectsCount = projectsCollection.length,
            filterKeyName = state.currentFilter().keyName,
            isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends'),
            hasSpecialFooter = state.hasSpecialFooter(categoryId());
        const categoryColumn = (categories, start, finish) => _.map(categories.slice(start, finish), category =>
            m(`a.explore-filter-link[href='#by_category_id/${category.id}']`, {
                    onclick: () => {
                        state.categoryToggle.toggle();
                        state.selectedCategory(category);
                    },
                    class: state.selectedCategory() === category ? 'selected' : ''
                },
                category.name
            )
        );
        let widowProjects = [];

        state.tryLoadFromQueryPath();

        return m('#explore', {
            oncreate: h.setPageTitle(window.I18n.t('header_html', I18nScope()))
        }, [
            m('.hero-search.explore', [
                m(".u-marginbottom-10.w-container",
                  m(search)
                ),
                m('.u-text-center.w-container', [
                    m('.explore-text-fixed',
                        'Quero ver'
                    ),
                    m('.explore-filter-wrapper', [
                        m('.explore-span-filter', {
                            onclick: state.modeToggle.toggle
                        }, [
                            m('.explore-mobile-label',
                                'MODALIDADE'
                            ),
                            m('.inline-block',
                                state.currentMode().title
                            ),
                            m('.inline-block.fa.fa-angle-down')
                        ]),
                        state.modeToggle() ? '' :
                        m('.explore-filter-select', [
                            m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                    onclick: () => {
                                        state.changeMode('all_modes');
                                    },
                                    class: state.currentMode() === null ? 'selected' : ''
                                },
                                'Todos os projetos'
                            ),
                            m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                    onclick: () => {
                                        state.changeMode('not_sub');
                                    },
                                    class: state.currentMode() === 'not_sub' ? 'selected' : ''
                                },
                                'Projetos pontuais'
                            ),
                            m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                    onclick: () => {
                                        state.changeMode('sub');
                                    },
                                    class: state.currentMode() === 'sub' ? 'selected' : ''
                                },
                                'Assinaturas'
                            ),
                            m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                onclick: state.modeToggle.toggle
                            })
                        ])
                    ]),
                    m('.explore-text-fixed',
                        'de'
                    ),
                    m('.explore-filter-wrapper', [
                        m('.explore-span-filter', {
                            onclick: state.categoryToggle.toggle
                        }, [
                            m('.explore-mobile-label',
                                'CATEGORIA'
                            ),
                            m('.inline-block',
                                state.selectedCategory().name
                            ),
                            m('.inline-block.fa.fa-angle-down')
                        ]),
                        state.categoryToggle() ? '' :
                        m('.explore-filter-select.big',
                            m('.explore-filer-select-row', [
                                m('.explore-filter-select-col', [
                                    m("a.explore-filter-link[href='#']", {
                                            onclick: () => {
                                                state.categoryToggle.toggle();
                                                state.selectedCategory({
                                                    name: 'Todas as categorias',
                                                    id: null
                                                });
                                            },
                                            class: state.selectedCategory().id === null ? 'selected' : ''
                                        },
                                        'Todas as categorias'
                                    ),
                                    categoryColumn(state.categories(), 0, Math.floor(_.size(state.categories()) / 2))
                                ]),
                                m('.explore-filter-select-col', [
                                    categoryColumn(state.categories(), Math.floor(_.size(state.categories()) / 2), _.size(state.categories()))
                                ]),
                                m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                    onclick: state.categoryToggle.toggle
                                })
                            ])
                        )
                    ]),
                    state.showFilter() ? [
                        m('.explore-text-fixed',
                            'que são'
                        ),
                        m('.explore-filter-wrapper', [
                            m('.explore-span-filter', {
                                onclick: state.filterToggle.toggle
                            }, [
                                m('.explore-mobile-label',
                                    'FILTRO'
                                ),
                                m('.inline-block',
                                    state.currentFilter().nicename
                                ),
                                m('.inline-block.fa.fa-angle-down')
                            ]),
                            state.filterToggle() ? '' :
                            m('.explore-filter-select', [
                                _.map(state.projectFiltersVM.getContextFilters(), (pageFilter, idx) => m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                        onclick: () => {
                                            state.changeFilter(pageFilter.keyName);
                                            state.filterToggle.toggle();
                                        },
                                        class: state.currentFilter() === pageFilter ? 'selected' : ''
                                    },
                                    pageFilter.nicename
                                )),
                                m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                    onclick: state.filterToggle.toggle
                                })
                            ])
                        ])
                    ] : ''
                ])
            ]), !state.projects().isLoading() && _.isFunction(state.projects().total) && !_.isUndefined(state.projects().total()) ?
            m('div',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-9.w-col-tiny-9.w-col-small-9',
                            m('.fontsize-large',
                                `${state.projects().total()} projetos encontrados`
                            )
                        ),
                        m('.w-col.w-col-3.w-col-tiny-3.w-col-small-3')
                    ])
                )
            ) : '',
            ((isContributedByFriendsFilter && _.isEmpty(projectsCollection)) ?
                (!state.hasFBAuth ? m(UnsignedFriendFacebookConnect) : '') :
                ''),
            m('.w-section.section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-row', _.map(projectsCollection, (project, idx) => {
                            let cardType = 'small',
                                ref = 'ctrse_explore';

                            if (state.isSearch()) {
                                ref = 'ctrse_explore_pgsearch';
                            } else if (isContributedByFriendsFilter) {
                                ref = 'ctrse_explore_friends';
                            } else if (_.indexOf(state.availableRecommenders, state.currentFilter().keyName) !== -1) {
                                ref = `ctrse_${state.currentFilter().keyName}`;
                            } else if (filterKeyName === 'all') {
                                if (project.score >= 1) {
                                    if (idx === 0) {
                                        cardType = 'big';
                                        ref = 'ctrse_explore_featured_big';
                                        widowProjects = [projectsCount - 1, projectsCount - 2];
                                    } else if (idx === 1 || idx === 2) {
                                        if (state.checkForMinScoredProjects(projectsCollection)) {
                                            cardType = 'medium';
                                            ref = 'ctrse_explore_featured_medium';
                                            widowProjects = [];
                                        } else {
                                            cardType = 'big';
                                            ref = 'ctrse_explore_featured_big';
                                            widowProjects = [projectsCount - 1];
                                        }
                                    } else {
                                        ref = 'ctrse_explore_featured';
                                    }
                                }
                            }

                            return (_.indexOf(widowProjects, idx) > -1 && !state.projects().isLastPage()) ? '' : m(projectCard, {
                                project,
                                ref,
                                type: cardType,
                                showFriends: isContributedByFriendsFilter
                            });
                        })),
                        state.projects().isLoading() ? h.loader() : ''
                    ])
                ])
            ]),

            m('.w-section.u-marginbottom-80', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (state.projects().isLastPage() || state.projects().isLoading() || _.isEmpty(projectsCollection)) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {
                                onclick: () => {
                                    state
                                        .projects()
                                        .nextPage()
                                        .then(_ => m.redraw());
                                    return false;
                                }
                            }, 'Carregar mais')
                        ]),
                    ])
                ])
            ]),

            m('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [
                m('.w-container.u-text-center', [
                    m('img.u-marginbottom-20.icon-hero', {
                        src: hasSpecialFooter ?
                            state.externalLinkCategories[categoryId()].icon : 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'
                    }),
                    m('h2.fontsize-larger.u-marginbottom-60',
                        hasSpecialFooter ? state.externalLinkCategories[categoryId()].title : 'Lance sua campanha no Catarse!'),
                    m('.w-row', [
                        m('.w-col.w-col-4.w-col-push-4', [
                            hasSpecialFooter ?
                            m('a.w-button.btn.btn-large', {
                                href: `${state.externalLinkCategories[categoryId()].link}?ref=ctrse_explore`
                            }, state.externalLinkCategories[categoryId()].cta) :
                            m('a.w-button.btn.btn-large', {
                                href: '/start?ref=ctrse_explore'
                            }, 'Aprenda como')
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default projectsExplore;
