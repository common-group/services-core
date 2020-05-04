import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectCard from './project-card';

export const ExploreProjectsList = {
    view({attrs}) {

        const projects = attrs.projects;
        const isSearch = attrs.isSearch;
        const filterKeyName = attrs.filterKeyName;
        const checkForMinScoredProjects = collection => _.size(_.filter(collection, p => p.score >= 1)) >= 3;
        const isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends');
        const projectsCount = attrs.projects.collection().length;

        return m('.w-section.section', [
            m('.w-container', [
                m('.w-row', [
                    m('.w-row', _.map(projects.collection(), (project, idx) => {
                        let cardType = 'small';
                        let ref = 'ctrse_explore';

                        let widowProjects = [];

                        if (isSearch) {
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
                                    if (checkForMinScoredProjects(projectsCollection)) {
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
                        } else if (filterKeyName === 'projects_we_love') {
                            ref = 'ctrse_explore_projects_we_love'
                        }

                        return (_.indexOf(widowProjects, idx) > -1 && !projects.isLastPage()) ? '' : m(projectCard, {
                            project,
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
}