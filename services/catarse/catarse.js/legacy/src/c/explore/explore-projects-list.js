import m from 'mithril';
import _ from 'underscore';
import h from '../../h';
import projectCard from '../project-card';
import { catarse } from '../../api'
import models from '../../models';
import prop from 'mithril/stream';

export const ExploreProjectsList = {
    oninit: function(vnode) {
        const projectsDetails = prop([{}]);
        const loading = prop(true);
        const filterWithProjectsDetails = ['active_saved_projects', 'coming_soon_landing_page'];

        const reloadProjectsDetails = () => {
            if (filterWithProjectsDetails.includes(vnode.attrs.filterKeyName)) {
                let projects_ids = [], group_projects_ids = [], dataProjectsDetails = []
                const projects = vnode.attrs.projects.collection().filter(function (project) {
                    return !!project.integrations && project.integrations.includes("COMING_SOON_LANDING_PAGE")
                })
                projects.map(function (project) { projects_ids.push(`${project.project_id}`) })
                for (var i = 0; i < projects_ids.length; i = i + 9) {
                    group_projects_ids.push(projects_ids.slice(i, i + 9));
                }

                for (var i = 0; i < group_projects_ids.length; i++) {
                    const filtersVM = catarse.filtersVM({ project_id: 'in' }).project_id(group_projects_ids[i])

                    const lProjectsDetails = catarse.loaderWithToken(
                        models.projectDetail.getPageOptions(filtersVM.parameters())
                    );

                    lProjectsDetails.load().then((data) => {
                        data.map(function(detail) { dataProjectsDetails.push(detail) });
                    });
                }
                projectsDetails(dataProjectsDetails)
                loading(false);
                h.redraw();
            } else {
                loading(false);
            }
        };

        reloadProjectsDetails();

        vnode.state = {
            loading,
            projectsDetails,
            reloadProjectsDetails
        };

    },
    view: function({state, attrs}) {
        const projects = attrs.projects;
        const isSearch = attrs.isSearch;
        const filterKeyName = attrs.filterKeyName;
        const isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends');
        const isActiveSavedProjectsFilter = (filterKeyName === 'active_saved_projects');
        const isComingSoonLandingPageFilter = (filterKeyName === 'coming_soon_landing_page');
        const projectsDetails = state.projectsDetails();
        const loading = state.loading();
        const projectsLenght = projects.collection().filter(function (project) {
            return !!project.integrations && project.integrations.includes("COMING_SOON_LANDING_PAGE")
        }).length

        if (!loading && projectsDetails.length > 0 && projectsLenght > 0
          && projectsLenght != projectsDetails.length) {
            state.reloadProjectsDetails();
        }

        if (!loading && (isActiveSavedProjectsFilter || isComingSoonLandingPageFilter)
            && projectsDetails.length == 0 && projectsLenght > 0) {
            h.redraw();
        }

        return !loading && m('.w-section.section', [
            m('.w-container', [
                (!isActiveSavedProjectsFilter || projectsLenght == projectsDetails.length) ?
                m('.w-row', [
                    m('.w-row', _.map(projects.collection(), project => {
                        let cardType = 'small';
                        let ref = 'ctrse_explore';
                        let projectDetails;
                        projectDetails = projectsDetails.find(
                            project_details => project_details.project_id === project.project_id
                        );
                        if (projectDetails == undefined) projectDetails = {}

                        if (isSearch) {
                            ref = 'ctrse_explore_pgsearch';
                        } else if (isContributedByFriendsFilter) {
                            ref = 'ctrse_explore_friends';
                        } else if (filterKeyName === 'all') {
                            if (project.score >= 1) {
                                ref = 'ctrse_explore_featured';
                            }
                        } else if (filterKeyName === 'active_saved_projects') {
                            ref = 'ctrse_explore_saved_project';
                        } else if (filterKeyName === 'projects_we_love') {
                            ref = 'ctrse_explore_projects_we_love';
                        }

                        return !loading && m(projectCard, {
                            project,
                            projectDetails,
                            ref,
                            type: cardType,
                            showFriends: isContributedByFriendsFilter,
                        });
                    })),
                    projects.isLoading() ? h.loader() : ''
                ]) : h.loader()
            ])
        ])
    }
};
