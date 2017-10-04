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
        const hash = m.prop(window.location.hash),
            displayTabContent = (project) => {
                const c_opts = {
                        project,
                        post_id: args.post_id
                    },
                    tabs = {
                        '#rewards': m('.w-col.w-col-12', m.component(projectRewardList, _.extend({}, {
                            rewardDetails: args.rewardDetails,
                            showReport: true
                        }, c_opts))),
                        '#contribution_suggestions': m.component(projectSuggestedContributions, c_opts),
                        '#contributions': m.component(projectContributions, c_opts),
                        '#about': m.component(projectAbout, _.extend({}, {
                            rewardDetails: args.rewardDetails
                        }, c_opts)),
                        '#comments': m.component(projectComments, c_opts),
                        '#posts': m.component(projectPosts, _.extend({}, {
                            projectContributions: args.projectContributions,
                            userDetails: args.userDetails,
                        }, c_opts))
                    };

                if (_.isNumber(args.post_id) && !window.location.hash) {
                    window.location.hash = 'posts';
                }

                hash(window.location.hash);

                if (_.isEmpty(hash()) || hash() === '#_=_' || hash() === '#preview') {
                    return tabs[h.mobileScreen()?'#rewards':'#about'];
                }

                return tabs[hash()];
            };

        h.redrawHashChange();

        return {
            displayTabContent,
            hash
        };
    },
    view(ctrl, args) {
        return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
            m(`${ctrl.hash() !== '#contributions' ? '.w-container' : '.about-tab-content'}`, [
                m('.w-row', args.project() ? ctrl.displayTabContent(args.project) : h.loader())
            ])
        ]);
    }
};

export default projectMain;
