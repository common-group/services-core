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

        if (filterWithProjectsDetails.includes(vnode.attrs.filterKeyName)) {

            const projects_collection = vnode.attrs.projects.collection();
            let projects_ids = []
            projects_collection.map(function (project) {
                projects_ids.push(`${project.project_id}`)
            })

            const filtersVM = catarse.filtersVM({
                project_id: 'in'
            }).project_id(projects_ids)

            const lProjectsDetails = catarse.loaderWithToken(models.projectDetail.getPageOptions(
                filtersVM.parameters())
            );

            lProjectsDetails.load().then((data) => {
                projectsDetails(data);
                loading(false);
            });
        } else {
            loading(false);
        }

        vnode.state = {
            projectsDetails,
            loading
        };
    },
    view: function({state, attrs}) {
        const projects = attrs.projects;
        const isSearch = attrs.isSearch;
        const filterKeyName = attrs.filterKeyName;
        const isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends');
        const projectsDetails = state.projectsDetails();
        const loading = state.loading();

        return m('.w-section.section', [
            m('.w-container', [
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
                ])
            ])
        ]);
    }
};
