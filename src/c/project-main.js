import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectRewardList from './project-reward-list';
import projectSuggestedContributions from './project-suggested-contributions';
import projectContributions from './project-contributions';
import projectAbout from './project-about';
import projectComments from './project-comments';
import projectPosts from './project-posts';

const projectMain = {
    controller(args) {
        const project = args.project,
              displayTabContent = () => {
                  const hash = window.location.hash,
                        c_opts = {
                            project: project
                        },
                        tabs = {
                            '#rewards': m('.w-col.w-col-12', m.component(projectRewardList, _.extend({}, {
                                rewardDetails: args.rewardDetails
                            }, c_opts))),
                            '#contribution_suggestions': m.component(projectSuggestedContributions, c_opts),
                            '#contributions': m.component(projectContributions, c_opts),
                            '#about': m.component(projectAbout, _.extend({}, {
                                rewardDetails: args.rewardDetails
                            }, c_opts)),
                            '#comments': m.component(projectComments, c_opts),
                            '#posts': m.component(projectPosts, c_opts)
                        };

                  if (_.isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                      return tabs['#about'];
                  }

                  return tabs[hash];
              };

        h.redrawHashChange();

        return {
            displayTabContent: displayTabContent
        };
    },
    view(ctrl, args) {
        return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
            m('.w-container', [
                m('.w-row', args.project() ? ctrl.displayTabContent() : '')
            ])
        ]);
    }
};

export default projectMain;
