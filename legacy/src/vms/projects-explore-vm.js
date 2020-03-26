import _ from 'underscore';
import m from 'mithril';
import prop from 'mithril/stream';
import { catarse, commonRecommender } from '../api';
import models from '../models';
import h from '../h';
import projectFilters from '../vms/project-filters-vm';

const { replaceDiacritics } = window;

const projectFiltersVM = projectFilters();

export const loadProjectsWithConfiguredParameters = (currentMode, categoryFilter, currentCityStateFilter, currentFilter, isSearch, searchParam) => {
    
    const filtersMap = projectFiltersVM.filters;

    const currentFiltersAndModeParamaters = _.extend(
        {},
        currentFilter().filter.parameters(),
        currentMode().filter ? filtersMap[currentMode().keyName].filter.parameters() : {}
    );    
    
    if (isSearch()) {
        return searchProjects(searchParam);
    } else if (currentFilter().keyName === 'finished') {
        
        const finishedProjectsParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.order({
                state_order: 'asc',
                state: 'desc',
                pledged: 'desc'
            }).parameters(),
            currentCityStateFilter().parameters()
        );

        return loadFinishedProjects(finishedProjectsParameters);
    } else if (currentFilter().keyName === 'recommended_1') {
        const currentUser = h.getUser() || {};
        const loadProjectsByRecommenderParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.parameters(),
            commonRecommender.filtersVM({ user_id: 'eq' }).user_id(currentUser.id).parameters(),
            currentCityStateFilter().parameters()
        );
        return recommendedProjectsAlgorithm1(loadProjectsByRecommenderParameters);
    } else if (currentFilter().keyName === 'recommended_2') {
        const currentUser = h.getUser() || {};
        const loadProjectsByRecommenderParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.parameters(),
            commonRecommender.filtersVM({ user_id: 'eq' }).user_id(currentUser.id).parameters(),
            currentCityStateFilter().parameters()
        );
        return recommendedProjectsAlgorithm2(loadProjectsByRecommenderParameters);
    } else {
        const loadProjectsParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.order({
                open_for_contributions: 'desc',
                state_order: 'asc',
                state: 'desc',
                score: 'desc',
                pledged: 'desc'
            }).parameters(),
            currentCityStateFilter().parameters()
        );
        return loadProjects(loadProjectsParameters);
    }
}

export const searchProjects = (search) => {
    const searchVM = catarse
        .loaderWithToken(models.projectSearch.postOptions({ query: search }));
    // We build an object with the same interface as paginationVM
    const page = {
        collection: prop([]),
        isLoading: searchVM,
        isLastPage: () => true,
        nextPage: () => false,
        total: h.RedrawStream(0),
    };
    
    searchVM
        .load()
        .then(p => {
            try {
                page.collection(p);
                page.total(p.length);
            } catch(e) { }
            m.redraw();
            return p;
        });
    return page;
};

// @TODO fix infinite requests when collection is empty
export const loadProjects = (parameters) => {
    models.project.pageSize(9);
    const pages = catarse.paginationVM(models.project, null, { Prefer: 'count=exact' });

    pages
        .firstPage(parameters)
        .then(_ => m.redraw());

    return pages;
};

export const loadFinishedProjects = (parameters) => {
    const pages = catarse.paginationVM(models.finishedProject, null, { Prefer: 'count=exact' });

    pages
        .firstPage(parameters)
        .then(_ => m.redraw());

    return pages;
};

export const recommendedProjectsAlgorithm1 = (parameters) => {
    const pages = commonRecommender.paginationVM(models.recommendedProjects1, '', {}, false);
    
    pages
        .firstPage(parameters)
        .then(_ => m.redraw());

    return pages;
};

export const recommendedProjectsAlgorithm2 = (parameters) => {
    const pages = commonRecommender.paginationVM(models.recommendedProjects2, '', {}, false);
      
    pages
        .firstPage(parameters)
        .then(_ => m.redraw());

    return pages;
};

/**
 * @typedef City
 * @property {string} acronym
 * @property {string} id
 * @property {string} name
 * @property {string} search_index
 * @property {string} state_id
 * @property {string} state_name
 */

/**
 * @typedef State
 * @property {string} acronym
 * @property {string} state_name
 */

/**
 * @typedef CityState
 * @property {City} city
 * @property {State} state
 */

/**
 * 
 * @param {string} inputText 
 * @returns {Promise<City[]>}
 */
export const searchCities = (inputText) => {
    
    const filters = catarse.filtersVM({
        search_index: 'ilike'
    }).order({ name: 'asc' });

    filters.search_index(replaceDiacritics(inputText));

    return models.city.getPage(filters.parameters());
}

/**
 * @param {string} inputText 
 * @returns {CityState[]}
 */
export const searchCitiesGroupedByState = (inputText) => {

    return searchCities(inputText).then(cities => {
        return cityGroupToList(cities.reduce((cityGroup, city) => {
            cityGroup[city.state_name] = [city].concat(cityGroup[city.state_name] || []);
            return cityGroup;
        }, {}));
    });
}

/**
 * @param {{[key:string] : City[]}} cityGroup 
 * @returns {CityState[]}
 */
function cityGroupToList(cityGroup) {
    /** @type {CityState[]} */
    const cityList = [];
    Object.keys(cityGroup).forEach(stateName => {
        const firstCity = cityGroup[stateName][0];
        cityList.push({state: {acronym: firstCity.acronym, state_name: stateName}});

        cityGroup[stateName].forEach((/** @type {City} */city) => {
            /** @type {CityState} */
            const cityState = {
                state: {
                    acronym: firstCity.acronym, 
                    state_name: stateName
                },
                city,
            };
            cityList.push(cityState);
        });

    });

    return cityList;
}

export async function countProjects(filter) {
    models.project.pageSize(1);
    const selectMinimalFieldsFilterVM = catarse.filtersVM({ selectFields: 'select'});
    selectMinimalFieldsFilterVM.selectFields('project_id');
    filter.order({score: 'desc'});
    const pages = catarse.paginationVM(models.project, null, { Prefer: 'count=exact' });
    const response = await pages.firstPage(_.extend(filter.parameters(), selectMinimalFieldsFilterVM.parameters()));
    return pages.total();
}