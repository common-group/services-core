import _ from 'underscore';
import m from 'mithril';
import prop from 'mithril/stream';
import { catarse, commonRecommender } from '../api';
import models from '../models';
import h from '../h';
import projectFilters from '../vms/project-filters-vm';

const projectFiltersVM = projectFilters();

export const loadProjectsWithConfiguredParameters = (currentMode, categoryFilter, currentFilter, isSearch, searchParam) => {
   
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
            }).parameters()
        );

        return loadFinishedProjects(finishedProjectsParameters);
    } else if (currentFilter().keyName === 'recommended_1') {
        const currentUser = h.getUser() || {};
        const loadProjectsByRecommenderParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.parameters(),
            commonRecommender.filtersVM({ user_id: 'eq' }).user_id(currentUser.id).parameters()
        );
        return recommendedProjectsAlgorithm1(loadProjectsByRecommenderParameters);
    } else if (currentFilter().keyName === 'recommended_2') {
        const currentUser = h.getUser() || {};
        const loadProjectsByRecommenderParameters = _.extend(
            currentFiltersAndModeParamaters,
            categoryFilter().filter.parameters(),
            commonRecommender.filtersVM({ user_id: 'eq' }).user_id(currentUser.id).parameters()
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
            }).parameters()
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
        nextPage: () => false
    };
    
    searchVM
        .load()
        .then(p => {
            page.collection(p);
            m.redraw();
            return p;
        });
    return page;
};

// @TODO fix infinite requests when collection is empty
export const loadProjects = (parameters) => {
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


