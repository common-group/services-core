window.c.ProjectMain = ((m, c, _, h) => {
    return {
        controller: (args) => {
            const project = args.project,
                displayTabContent = () => {
                    const hash = window.location.hash,
                        c_opts = {
                            project: project
                        },
                        tabs = {
                            '#rewards': m('.w-col.w-col-12', m.component(c.ProjectRewardList, _.extend({}, {
                                rewardDetails: args.rewardDetails
                            }, c_opts))),
                            '#contribution_suggestions': m.component(c.ProjectSuggestedContributions, c_opts),
                            '#contributions': m.component(c.ProjectContributions, c_opts),
                            '#about': m.component(c.ProjectAbout, _.extend({}, {
                                rewardDetails: args.rewardDetails
                            }, c_opts)),
                            '#comments': m.component(c.ProjectComments, c_opts),
                            '#posts': m.component(c.ProjectPosts, c_opts)
                        };

                    h.fbParse();

                    if (_.isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                        return tabs['#about'];
                    }

                    return tabs[hash];
                };

            window.addEventListener('hashchange', m.redraw, false);

            return {
                displayTabContent: displayTabContent
            };
        },

        view: (ctrl) => {
            return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
                m('.w-container', [
                    m('.w-row', ctrl.displayTabContent())
                ])
            ]);
        }
    };
}(window.m, window.c, window._, window.c.h));
