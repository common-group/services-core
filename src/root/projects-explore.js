/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
import m from 'mithril';
import {
    catarse,
    commonRecommender
} from '../api'
import I18n from 'i18n-js';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import search from '../c/search';
import categoryButton from '../c/category-button';
import projectCard from '../c/project-card';
import tooltip from '../c/tooltip';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';

const I18nScope = _.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
const projectsExplore = {
    controller(args) {
        const setCsrfToken = (xhr) => {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };
        const filters = catarse.filtersVM,
            projectFiltersVM = projectFilters(),
            filtersMap = projectFiltersVM.filters,
              currentUser = h.getUser() || {},
            defaultFilter = h.paramByName('filter') || 'all',
            fallbackFilter = 'all',
            currentFilter = m.prop(filtersMap[defaultFilter]),
            changeFilter = (newFilter) => {
                currentFilter(filtersMap[newFilter]);
                loadRoute();
            },
            resetContextFilter = () => {
                currentFilter(filtersMap[defaultFilter]);
                projectFiltersVM.setContextFilters(['finished', 'all', 'contributed_by_friends', 'recommended']);
            },
            hasFBAuth = currentUser.has_fb_auth,
            buildTooltip = tooltipText => m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            }),
            hint = () => {
                // TODO Add copies to i18n.
                let hintText = '',
                    tooltipText = '',
                    hasHint = false;
                if (currentFilter().keyName === 'all') {
                    hasHint = true;
                    hintText = 'Ordenados por popularidade ';
                    tooltipText = 'O nosso fator popularidade é uma mistura da seleção do time do Catarse com um valor que é calculado pela velocidade de arrecadação do projeto';
                } else if (currentFilter().keyName === 'finished') {
                    hasHint = true;
                    hintText = 'Ordenados por R$ alcançado ';
                    tooltipText = 'Os projetos com maior meta de arrecadação alcançada ficam no topo';
                } else if (currentFilter().keyName === 'contributed_by_friends') {
                    hasHint = true;
                    hintText = 'Projetos apoiados por amigos ';
                    tooltipText = 'Projetos apoiados por amigos';
                } else if (currentFilter().keyName === 'recommended') {
                    hasHint = true;
                    hintText = 'Projetos recomendados ';
                    tooltipText = 'Projetos recomendados';
                }

                return hasHint ? m('.fontsize-smaller.fontcolor-secondary', [hintText, buildTooltip(tooltipText)]) : '';
            },
            isSearch = m.prop(false),
            categoryCollection = m.prop([]),
            categoryId = m.prop(),
            findCategory = id => _.find(categoryCollection(), c => c.id === parseInt(id)),
            category = _.compose(findCategory, categoryId),
            loadCategories = () => models.category.getPageWithToken(filters({}).order({
                name: 'asc'
            }).parameters()).then(categoryCollection),
            externalLinkCategories = I18n.translations[I18n.currentLocale()].projects.index.explore_categories,
            hasSpecialFooter = categoryId => !_.isUndefined(externalLinkCategories[categoryId]),
            // just small fix when have two scored projects only
            checkForMinScoredProjects = collection => _.size(_.filter(collection, x => x.score >= 1)) >= 3,
            // Fake projects object to be able to render page while loadding (in case of search)
            projects = m.prop({
                collection: m.prop([]),
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

                        return route &&
                            route[1] &&
                            filtersMap[route[1]] ||
                            cat && {
                                title: cat.name,
                                filter: byCategory.category_id(cat.id)
                            };
                    },

                    filter = filterFromRoute() || currentFilter(),
                    search = h.paramByName('pg_search'),

                    recommendedProjects = () => {
                        const pages = commonRecommender.paginationVM(models.recommendedProjectsHybrid, '', {}, false);
                        const rFilter = commonRecommender.filtersVM({
                            user_id: 'eq'
                        }).user_id(currentUser.id);

                        pages.firstPage(rFilter.parameters());
                        return pages;
                    },

                    searchProjects = () => {
                        const l = catarse.loaderWithToken(models.projectSearch.postOptions({
                                query: search
                            })),
                            page = { // We build an object with the same interface as paginationVM
                                collection: m.prop([]),
                                isLoading: l,
                                isLastPage: () => true,
                                nextPage: () => false
                            };
                        l.load().then(page.collection);
                        return page;
                    },

                    loadProjects = () => {
                        const pages = catarse.paginationVM(models.project);
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

                    loadFinishedProjects = () => {
                        const pages = catarse.paginationVM(models.finishedProject),
                            parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                                state_order: 'asc',
                                state: 'desc',
                                pledged: 'desc'
                            }).parameters());
                        pages.firstPage(parameters);

                        return pages;
                    };

                if (_.isString(search) && search.length > 0 && route === null) {
                    isSearch(true);
                    title(`Busca ${search}`);
                    projects(searchProjects());
                } else if (currentFilter().keyName === 'finished') {
                    isSearch(false);
                    projects(loadFinishedProjects());
                } else if (currentFilter().keyName === 'recommended') {
                    isSearch(false);
                    projects(recommendedProjects());
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
        models.project.pageSize(9);
        loadCategories().then(loadRoute);

        if (args.filter) {
            currentFilter(filtersMap[args.filter]);
        }

        if (!currentFilter()) {
            currentFilter(filtersMap[defaultFilter]);
        }

        return {
            categories: categoryCollection,
            changeFilter,
            fallbackFilter,
            projects,
            category,
            title,
            hint,
            filtersMap,
            currentFilter,
            projectFiltersVM,
            toggleCategories,
            isSearch,
            hasFBAuth,
            checkForMinScoredProjects,
            categoryId,
            hasSpecialFooter,
            externalLinkCategories
        };
    },
    view(ctrl, args) {
        const categoryId = ctrl.categoryId,
            projectsCollection = ctrl.projects().collection(),
            // projectsCollection = ctrl.recommended(),
            projectsCount = projectsCollection.length,
            filterKeyName = ctrl.currentFilter().keyName,
            isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends'),
            hasSpecialFooter = ctrl.hasSpecialFooter(categoryId());
        let widowProjects = [];

        if (!ctrl.projects().isLoading() && _.isEmpty(projectsCollection) && !ctrl.isSearch()) {
            if (!(isContributedByFriendsFilter && !ctrl.hasFBAuth)) {
                ctrl.projectFiltersVM.removeContextFilter(ctrl.currentFilter());
                ctrl.changeFilter(ctrl.fallbackFilter);
            }
        }

        return m('#explore', {
            config: h.setPageTitle(I18n.t('header_html', I18nScope()))
        }, [
            m('.w-section.hero-search', [
                m.component(search),
                m('.w-container.u-marginbottom-10', [
                    m('.u-text-center.u-marginbottom-40', [
                        m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', {
                            onclick: () => ctrl.toggleCategories.toggle()
                        }, ['Explore projetos incríveis ', m(`span#explore-btn.fa.fa-angle-down${ctrl.toggleCategories() ? '.opened' : ''}`, '')])
                    ]),
                    m(`#categories.category-slider${ctrl.toggleCategories() ? '.opened' : ''}`, [
                        m('.w-row.u-marginbottom-30', [
                            _.map(ctrl.categories(), category => m.component(categoryButton, {
                                category
                            }))
                        ])
                    ]),
                ])
            ]),

            m('.w-section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [
                            m('.fontsize-larger', ctrl.title()),
                            ctrl.hint()
                        ]),
                        m('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? m('select.w-select.text-field.positive', {
                                onchange: m.withAttr('value', ctrl.changeFilter)
                            },
                            _.map(ctrl.projectFiltersVM.getContextFilters(), (pageFilter, idx) => {
                                const isSelected = ctrl.currentFilter() === pageFilter;

                                return m('option', {
                                    value: pageFilter.keyName,
                                    selected: isSelected
                                }, pageFilter.nicename);
                            })
                        ) : '')
                    ])
                ])
            ]),

            ((isContributedByFriendsFilter && _.isEmpty(projectsCollection)) ?
                (!ctrl.hasFBAuth ? m.component(UnsignedFriendFacebookConnect) : '') :
                ''),
            m('.w-section.section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-row', _.map(projectsCollection, (project, idx) => {
                            let cardType = 'small',
                                ref = 'ctrse_explore';

                            if (ctrl.isSearch()) {
                                ref = 'ctrse_explore_pgsearch';
                            } else if (isContributedByFriendsFilter) {
                                ref = 'ctrse_explore_friends';
                            } else if (filterKeyName === 'all') {
                                if (project.score >= 1) {
                                    if (idx === 0) {
                                        cardType = 'big';
                                        ref = 'ctrse_explore_featured_big';
                                        widowProjects = [projectsCount - 1, projectsCount - 2];
                                    } else if (idx === 1 || idx === 2) {
                                        if (ctrl.checkForMinScoredProjects(projectsCollection)) {
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

                            return (_.indexOf(widowProjects, idx) > -1 && !ctrl.projects().isLastPage()) ? '' : m.component(projectCard, {
                                project,
                                ref,
                                type: cardType,
                                showFriends: isContributedByFriendsFilter
                            });
                        })),
                        ctrl.projects().isLoading() ? h.loader() : (_.isEmpty(projectsCollection) && ctrl.hasFBAuth ? m('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : '')
                    ])
                ])
            ]),

            m('.w-section.u-marginbottom-80', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _.isEmpty(projectsCollection)) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', {
                                onclick: () => {
                                    ctrl.projects().nextPage();
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
                            ctrl.externalLinkCategories[categoryId()].icon : 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'
                    }),
                    m('h2.fontsize-larger.u-marginbottom-60',
                        hasSpecialFooter ? ctrl.externalLinkCategories[categoryId()].title : 'Lance sua campanha no Catarse!'),
                    m('.w-row', [
                        m('.w-col.w-col-4.w-col-push-4', [
                            hasSpecialFooter ?
                            m('a.w-button.btn.btn-large', {
                                href: `${ctrl.externalLinkCategories[categoryId()].link}?ref=ctrse_explore`
                            }, ctrl.externalLinkCategories[categoryId()].cta) :
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
