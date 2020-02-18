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
import userVM from '../vms/user-vm';
import { loadProjectsWithConfiguredParameters } from '../vms/projects-explore-vm';

const I18nScope = _.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
const projectsExplore = {

    oninit: function(vnode) {
        
        const filters = catarse.filtersVM;
        const projectFiltersVM = projectFilters();
        const filtersMap = projectFiltersVM.filters;
        const currentUser = h.getUser() || {};

        const resetContextFilter = () => {
            const contextFilters = userVM.isLoggedIn ? 
                ['finished', 'projects_we_love', 'all', 'saved_projects', 'contributed_by_friends', 'expiring', 'recent']
            :   
                ['finished', 'projects_we_love', 'all', 'expiring', 'recent'];

            projectFiltersVM.setContextFilters(contextFilters);
        };
        
        // Mode (sub, not_sub)
        const getDefaultMode = () => h.paramByName('mode') || vnode.attrs.mode || 'all_modes';
        const modeKey = getDefaultMode();
        const currentMode = h.RedrawStream(filtersMap[modeKey]);
        const modeToggle = h.RedrawStream(false);
        const changeMode = (newMode) => {
            if (newMode === 'all_modes') {
                h.removeParamByName('mode');
            } else {
                h.setParamByName('mode', newMode);
            }
        };
        const configureMode = () => {
            const newMode = getDefaultMode();
            modeToggle(false);
            currentMode(filtersMap[newMode]);
            resetContextFilter();
            if (newMode === 'sub') {
                // temporarily remove filters from sub projects
                showFilter(false);
                projectFiltersVM.removeContextFilter(projectFiltersVM.filters.finished);
                projectFiltersVM.removeContextFilter(projectFiltersVM.filters.expiring);
                currentFilter(filtersMap['all']);
            } else {
                showFilter(true);
                const scoreFilterForAonFlex = _.first(projectFiltersVM.getContextFilters());
                currentFilter(scoreFilterForAonFlex);
            }
        };

        // Category (loaded)
        const allCategories = { name: 'Todas as categorias', id: null };
        const categoriesCollection = prop(vnode.attrs.categories || []);
        const findCategory = id => _.find(categoriesCollection(), c => c.id === parseInt(id));
        const getCurrentCategory = () => findCategory(h.paramByName('category_id')) || allCategories;
        const selectedCategory = h.RedrawStream(getCurrentCategory());
        const categoryToggle = h.RedrawStream(false);
        const configureCategory = () => selectedCategory(getCurrentCategory());
        const changeCategory = (category_id) => {
            if (category_id) {
                h.setParamByName('category_id', category_id);
            } else {
                h.removeParamByName('category_id');
            }
        };
        const loadCategories = () => {
            return models.category
                .getPageWithToken(
                    filters({}).order({ name: 'asc' }).parameters()
                )
                .then(c => {
                    categoriesCollection(c);
                    configureCategory();
                })
        };

        // Filter
        const getDefaultFilter = () => h.paramByName('filter') || vnode.attrs.filter || 'projects_we_love';
        const defaultFilter = getDefaultFilter();
        const currentFilter = h.RedrawStream(filtersMap[defaultFilter]);
        const filterToggle = h.RedrawStream(false);
        // 1. Don't show filter when is subscription
        const showFilter = h.RedrawStream(true);
        const changeFilter = (newFilter) => {
            if (newFilter === 'projects_we_love') {
                h.removeParamByName('filter');
            } else {
                h.setParamByName('filter', newFilter);
            }
        };
        const configureFilter = () => {
            const modeKey = h.paramByName('mode');
            const newFilter = modeKey === 'sub' ? 'all' : getDefaultFilter();
            currentFilter(filtersMap[newFilter]);
        };
          
        const hasFBAuth = currentUser.has_fb_auth;
        const isSearch = prop(false);
        
        const externalLinkCategories = window.I18n.translations[window.I18n.currentLocale()].projects.index.explore_categories;
        const hasSpecialFooter = categoryId => !_.isUndefined(externalLinkCategories[categoryId]);
        // just small fix when have two scored projects only
        const checkForMinScoredProjects = collection => _.size(_.filter(collection, x => x.score >= 1)) >= 3;
        // Fake projects object to be able to render page while loadding (in case of search)
        const projects = h.RedrawStream({ collection: prop([]), isLoading: () => true, isLastPage: () => true });
            
        const filterFromRoute = () => {
            const byCategory = filters({ category_id: 'eq' });
            const category = getCurrentCategory();

            return category.id && prop({
                title: category.name,
                filter: byCategory.category_id(category.id)
            });
        };

        const loadRoute = () => {
            configureMode();
            configureCategory();
            configureFilter();

            const categoryFilter = filterFromRoute() || currentFilter;
            const searchParam = h.paramByName('pg_search') || vnode.attrs.pg_search;
            const hasSearchParamContent = _.isString(searchParam) && searchParam.length > 0;
            const noFilterIsSelected = currentMode().keyName === 'all_modes' && !categoryFilter().title;
            isSearch(hasSearchParamContent && noFilterIsSelected);
            projects(loadProjectsWithConfiguredParameters(currentMode, categoryFilter, currentFilter, isSearch, searchParam));
            h.redraw();
        };

        // Initial loads
        resetContextFilter();
        models.project.pageSize(9);
        loadCategories().then(loadRoute).then(() => m.redraw());
        
        h.scrollTop();

        window.addEventListener('popstate', (event) => loadRoute());
        window.addEventListener('pushstate', (event) => loadRoute());

        vnode.state = {
            categories: categoriesCollection,
            changeFilter,
            resetContextFilter,
            projects,
            loadRoute,
            modeToggle,
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
            hasSpecialFooter,
            externalLinkCategories,
            changeCategory,
            allCategories,
        };
    },
    onremove: function() {
        window.removeEventListener('popstate');
        window.removeEventListener('pushstate');
    },
    view: function({state, attrs}) {
        const allCategories = state.allCategories;
        const category_id = state.selectedCategory().id;
        const projectsCollection = state.projects().collection();
        const projectsCount = projectsCollection.length;
        const filterKeyName = state.currentFilter().keyName;
        const isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends');
        const hasSpecialFooter = state.hasSpecialFooter(category_id);

        const categoryColumn = (categories, start, finish) => _.map(categories.slice(start, finish), category =>
            m(`a.explore-filter-link[href=\'javascript:void(0);\']`, {
                    onclick: () => {
                        state.categoryToggle(false);
                        state.changeCategory(category.id);
                    },
                    class: state.selectedCategory().id === category.id ? 'selected' : ''
                },
                category.name
            )
        );

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
                            onclick: () => state.modeToggle(!state.modeToggle())
                        }, [
                            m('.explore-mobile-label',
                                'MODALIDADE'
                            ),
                            m('.inline-block',
                                state.currentMode().title
                            ),
                            m('.inline-block.fa.fa-angle-down')
                        ]),
                        (
                            state.modeToggle() && 
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
                                        onclick: () => state.modeToggle(false)
                                    })
                                ])
                        )
                    ]),
                    m('.explore-text-fixed',
                        'de'
                    ),
                    m('.explore-filter-wrapper', [
                        m('.explore-span-filter', {
                            onclick: () => state.categoryToggle(!state.categoryToggle())
                        }, [
                            m('.explore-mobile-label',
                                'CATEGORIA'
                            ),
                            m('.inline-block',
                                state.selectedCategory().name
                            ),
                            m('.inline-block.fa.fa-angle-down')
                        ]),
                        (
                            state.categoryToggle() &&
                            m('.explore-filter-select.big',
                                m('.explore-filer-select-row', [
                                    m('.explore-filter-select-col', [
                                        m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                                onclick: () => {
                                                    state.categoryToggle(false);
                                                    state.changeCategory(allCategories.id);
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
                                        onclick: () => state.categoryToggle(false)
                                    })
                                ])
                            )
                        )
                    ]),
                    (
                        state.showFilter() && 
                        [
                            m('.explore-text-fixed',
                                'que são'
                            ),
                            m('.explore-filter-wrapper', [
                                m('.explore-span-filter', {
                                    onclick: () => state.filterToggle(!state.filterToggle())
                                }, [
                                    m('.explore-mobile-label',
                                        'FILTRO'
                                    ),
                                    m('.inline-block',
                                        state.currentFilter().nicename
                                    ),
                                    m('.inline-block.fa.fa-angle-down')
                                ]),
                                (
                                    state.filterToggle() &&
                                    m('.explore-filter-select', [
                                        _.map(state.projectFiltersVM.getContextFilters(), (pageFilter, idx) => m("a.explore-filter-link[href=\'javascript:void(0);\']", {
                                                onclick: (/** @type {Event} */ event) => {
                                                    event.preventDefault();
                                                    state.changeFilter(pageFilter.keyName);
                                                    state.filterToggle(false);
                                                },
                                                class: state.currentFilter() === pageFilter ? 'selected' : ''
                                            },
                                            pageFilter.nicename
                                        )),
                                        m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block', {
                                            onclick: () => state.filterToggle(false)
                                        })
                                    ])
                                )
                            ])
                        ]
                    )
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
                            let cardType = 'small';
                            let ref = 'ctrse_explore';

                            let widowProjects = [];

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
                            } else if (filterKeyName === 'saved_projects') {
                                ref = 'ctrse_explore_saved_project'
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
                            state.externalLinkCategories[category_id].icon : 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'
                    }),
                    m('h2.fontsize-larger.u-marginbottom-60',
                        hasSpecialFooter ? state.externalLinkCategories[category_id].title : 'Lance sua campanha no Catarse!'),
                    m('.w-row', [
                        m('.w-col.w-col-4.w-col-push-4', [
                            hasSpecialFooter ?
                            m('a.w-button.btn.btn-large', {
                                href: `${state.externalLinkCategories[category_id].link}?ref=ctrse_explore`
                            }, state.externalLinkCategories[category_id].cta) :
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
