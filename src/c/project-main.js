window.c.ProjectMain = (function(m, c, _, h){
  return {
    controller: function(args) {
      var project = args.project,
          generateRoutes = function() {
            var hash = window.location.hash,
                c_opts = {project: project},
                routes = {
                  '#rewards': m('.w-col.w-col-12', m.component(c.ProjectRewardList, c_opts)),
                  '#contributions': m.component(c.ProjectContributions, c_opts),
                  '#about': m.component(c.ProjectAbout, c_opts),
                  '#comments': m.component(c.ProjectComments, c_opts),
                  '#posts': m.component(c.ProjectPosts, c_opts)
                };

            h.fbParse();

            if (_.isEmpty(hash)) {
              return routes['#about'];
            }

            return routes[hash];
          };

      window.addEventListener('hashchange', m.redraw, false);

      return {
        project: project,
        generateRoutes: generateRoutes
      };
    },

    view: function(ctrl) {
      return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
        m('.w-container', [
          m('.w-row', ctrl.generateRoutes())
        ])
      ]);
    }
  };
}(window.m, window.c, window._, window.c.h));
