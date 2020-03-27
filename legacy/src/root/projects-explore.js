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
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import search from '../c/search';
import projectCard from '../c/project-card';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';
import userVM from '../vms/user-vm';
import { loadProjectsWithConfiguredParameters, searchCitiesGroupedByState, CityState, countProjects } from '../vms/projects-explore-vm';
import { ExploreSearchFilterSelect } from '../c/explore-search-filter-select';
import { ExploreFilterSelect } from '../c/explore-filter-select';
import { ExploreProjectsFoundCounter } from '../c/explore-projects-found-counter';
import { ExploreProjectsList } from '../c/explore-projects-list';

const I18nScope = _.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
const projectsExplore = {

    oninit: function(vnode) {
        
        const filters = catarse.filtersVM;
        const projectFiltersVM = projectFilters();
        const filtersMap = projectFiltersVM.filters;
        const currentUser = h.getUser() || {};

        const resetContextFilter = () => {
            const loggedInContextFilters = ['finished', 'projects_we_love', 'all', 'saved_projects', 'contributed_by_friends', 'expiring', 'recent'];
            const notLoggedInContextFilters = ['finished', 'projects_we_love', 'all', 'expiring', 'recent'];
            const contextFilters = userVM.isLoggedIn ? loggedInContextFilters : notLoggedInContextFilters;
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
                });
        };

        // City and State
        const selectedCityState = h.RedrawStream(null);
        const foundCitiesStateEntries = h.RedrawStream([]);
        const isLoadingSearchCities = h.RedrawStream(false);
        const projectsFoundOnCity = h.RedrawStream(0);
        const onSearchCities = async (inputText) => {
            let hasLoadedBeforeDisplayLoader = false;
            const waitMSTimeBeforeShowingLoader = 150;
            const showLoaderIfDelaysSearchResponse = () => {
                if (hasLoadedBeforeDisplayLoader) {
                    isLoadingSearchCities(true);
                }
            };

            setTimeout(showLoaderIfDelaysSearchResponse, waitMSTimeBeforeShowingLoader);
            
            try {
                hasLoadedBeforeDisplayLoader = true;
                const foundCitiesStateResponse = await searchCitiesGroupedByState(inputText);
                foundCitiesStateEntries(foundCitiesStateResponse);
                hasLoadedBeforeDisplayLoader = false;
                isLoadingSearchCities(false);
            } catch(e) {
                isLoadingSearchCities(false);
            }
            
        };

        /**
         * @param {CityState} cityState 
         */
        const onSelectCityState = (cityState) => {
            selectedCityState(cityState);

            if (cityState) {
                const options = {};
                options.state_acronym = cityState.state.acronym;
                options.state_name = cityState.state.state_name;

                if (cityState.city) {
                    options.city_name = cityState.city.name;
                }

                h.setAndResetMultParams(options, 'city_name', 'state_acronym', 'state_name');
            } else {
                h.removeMultParams('city_name', 'state_acronym', 'state_name');
            }
        };
        const currentCityStateFilter = prop(catarse.filtersVM({}));
        const initSetupCityState = () => {

            const options = {};
            const city_name = h.paramByName('city_name');
            const state_acronym = h.paramByName('state_acronym');
            const state_name = h.paramByName('state_name');

            if (city_name) {
                options.city = {
                    name: city_name,
                };
            }

            if (state_acronym) {
                options.state = {
                    acronym: state_acronym,
                    state_name,
                };
                selectedCityState(options);
            }

        };
        initSetupCityState();

        const configureCityState = () => {
            const cityName = h.paramByName('city_name') || vnode.attrs.city_name;
            const stateAcronym = h.paramByName('state_acronym') || vnode.attrs.state_acronym;            
            
            if (cityName && stateAcronym) {
                const filter = catarse
                    .filtersVM({ cityOrState: 'or' })
                    .cityOrState({
                        state_acronym: {
                            eq: stateAcronym
                        },
                        city_name: {
                            eq: cityName
                        },
                    });
                currentCityStateFilter(filter);

                const countProjectFromCityFilter = catarse.filtersVM({city_name:'eq'}).city_name(cityName);
                const categoryFilter = filterFromRoute() || currentFilter;

                const currentFiltersAndModeParamaters = _.extend(
                    currentFilter().keyName !== 'finished' ? 
                        currentFilter().filter.order({
                            state_order: 'asc',
                            state: 'desc',
                            pledged: 'desc'
                        }).parameters()
                        :
                        currentFilter().filter.order({
                            open_for_contributions: 'desc',
                            state_order: 'asc',
                            state: 'desc',
                            score: 'desc',
                            pledged: 'desc'
                        }).parameters(),
                    currentMode().filter ? filtersMap[currentMode().keyName].filter.parameters() : {},
                    countProjectFromCityFilter.parameters(),
                    categoryFilter().filter.parameters()
                );
                
                countProjects(currentFiltersAndModeParamaters).then(projectsFoundOnCity);
            } else if (stateAcronym) {
                const filter = catarse
                    .filtersVM({ state_acronym: 'eq' })
                    .state_acronym(stateAcronym);
                currentCityStateFilter(filter);
            } else {
                const filter = catarse
                    .filtersVM({});
                currentCityStateFilter(filter);
            }            
        };

        // Filter
        const getDefaultFilter = () => {
            const queryFilter = h.paramByName('filter');
            if (queryFilter) {
                return queryFilter || vnode.attrs.filter || 'projects_we_love';
            } else {
                return 'projects_we_love';
            }
        };
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
            configureCityState();

            const categoryFilter = filterFromRoute() || currentFilter;
            const searchParam = h.paramByName('pg_search') || vnode.attrs.pg_search;
            const hasSearchParamContent = _.isString(searchParam) && searchParam.length > 0;
            const noFilterIsSelected = currentMode().keyName === 'all_modes' && categoryFilter().keyName === 'all';
            isSearch(hasSearchParamContent && noFilterIsSelected);
            projects(loadProjectsWithConfiguredParameters(currentMode, categoryFilter, currentCityStateFilter, currentFilter, isSearch, searchParam));
            h.redraw();
        };

        // Initial loads
        resetContextFilter();
        models.project.pageSize(9);
        loadCategories().then(loadRoute).then(() => m.redraw());
        
        h.scrollTop();

        window.addEventListener('popstate', loadRoute);
        window.addEventListener('pushstate', loadRoute);

        

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
            selectedCityState,
            foundCitiesStateEntries,
            onSearchCities,
            onSelectCityState,
            isLoadingSearchCities,
            projectsFoundOnCity,
        };
    },
    onremove: function() {
        window.removeEventListener('popstate', window.onpopstate);
        window.removeEventListener('pushstate', window.onpushstate);
    },
    view: function({state, attrs}) {
        const category_id = state.selectedCategory().id;
        const projectsCollection = state.projects().collection();
        const filterKeyName = state.currentFilter().keyName;
        const isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends');
        const hasSpecialFooter = state.hasSpecialFooter(category_id);
        const selectedCityState = state.selectedCityState;
        const foundCitiesStateEntries = state.foundCitiesStateEntries;
        const onSearchCities = state.onSearchCities;
        const onSelectCityState = state.onSelectCityState;
        const isLoadingSearchCities = state.isLoadingSearchCities;
        const projectsFoundOnCity = state.projectsFoundOnCity;

        return m('#explore', {
            oncreate: h.setPageTitle(window.I18n.t('header_html', I18nScope()))
        }, [
            m('.hero-search.explore', [
                m('.u-marginbottom-10.w-container',
                    m(search)
                ),
                m('.u-text-center.w-container', [

                    m('div', [
                        m('.explore-text-fixed',
                            'Quero ver'
                        ),
                        m(ExploreFilterSelect, {
                            values: [
                                {
                                    label: 'Todos os projetos',
                                    value: 'all_modes',
                                },
                                {
                                    label: 'Projetos pontuais',
                                    value: 'not_sub',
                                },
                                {
                                    label: 'Assinaturas',
                                    value: 'sub',
                                },
                                {
                                    label: 'Projetos COVID-19',
                                    value: 'covid_19',
                                },                        
                            ],
                            mobileLabel: 'MODALIDADE',
                            itemToString: () => state.currentMode().title,
                            isSelected: (item) => {
                                return item.value === 'all_modes' && 
                                    state.currentMode() === null || 
                                    state.currentMode().keyName === item.value;
                            },
                            onSelect: (item) => state.changeMode(item.value),
                        }),
                        m('.explore-text-fixed',
                            'de'
                        ),

                        m(ExploreFilterSelect, {
                            values: [{
                                label: 'Todas as categorias',
                                value: null,
                            }].concat(state.categories().map(category => ({
                                label: category.name,
                                value: category.id,
                            }))),
                            mobileLabel: 'CATEGORIA',
                            splitNumberColumns: 2,
                            itemToString: () => state.selectedCategory().name,
                            isSelected: (item) => {
                                return state.selectedCategory().id === item.value ? 'selected' : '';
                            },
                            onSelect: (item) => state.changeCategory(item.value),
                        }),
                    ]),
                    m('div', [
                        m('div.explore-text-fixed', 'localizados em'),
                        m(ExploreSearchFilterSelect, {
                            onSearch: onSearchCities,
                            onSelect: onSelectCityState,
                            selectedItem: selectedCityState,
                            foundItems: foundCitiesStateEntries,
                            noneSelected: 'Brasil',
                            mobileLabel: 'LOCAL',
                            isLoading: isLoadingSearchCities,
                            itemToString: (/** @type {CityState} */ cityState) => {
                                const firstPart = `${cityState.city ? cityState.city.name : cityState.state.state_name}`;
                                const secondPart = `${cityState.city ? `, ${cityState.state.acronym}` : ' (Estado)'}`;
                                return `${firstPart}${secondPart}`;
                            },
                        }),
                        (
                            state.showFilter() && 
                            [
                                m('.explore-text-fixed',
                                    'que são'
                                ),
                                m(ExploreFilterSelect, {
                                    values: state.projectFiltersVM.getContextFilters().map(pageFilter => {
                                        return {
                                            label: pageFilter.nicename,
                                            value: pageFilter.keyName,
                                        };
                                    }),
                                    mobileLabel: 'FILTRO',
                                    itemToString: () => state.currentFilter().nicename,
                                    isSelected: (item) => {
                                        return state.currentFilter().keyName === item.value;
                                    },
                                    onSelect: (item) => state.changeFilter(item.value),
                                }),
                            ]
                        )
                    ])
                ])
            ]), 
            (
                !state.projects().isLoading() && _.isFunction(state.projects().total) && !_.isUndefined(state.projects().total()) ?
                    m(ExploreProjectsFoundCounter, {
                        total: state.projects().total(),
                        perFilter: (selectedCityState() && selectedCityState().city) ? 
                            [
                                {
                                    icon: m('span.fas.fa-map-marker-check.text-success'),
                                    label: ` ${projectsFoundOnCity() || 'Nenhum'} em ${selectedCityState().city.name}, ${selectedCityState().state.acronym}  `
                                },
                                {
                                    label: ` ${state.projects().total() - projectsFoundOnCity()} em outras cidades de ${selectedCityState().state.acronym}`
                                }
                            ]
                            :
                            []
                    })
                    : 
                    ''
            ),
            (
                (isContributedByFriendsFilter && _.isEmpty(projectsCollection)) ?
                    (!state.hasFBAuth ? m(UnsignedFriendFacebookConnect) : '') 
                    :
                    ''
            ),
            m(ExploreProjectsList, {
                projects: state.projects(),
                isSearch: state.isSearch(),
                filterKeyName: state.currentFilter().keyName,
            }),
            m('.w-section.u-marginbottom-80', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (state.projects().isLastPage() || state.projects().isLoading() || _.isEmpty(projectsCollection)) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {
                                onclick: () => {
                                    state
                                        .projects()
                                        .nextPage()
                                        .then(() => m.redraw());
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
