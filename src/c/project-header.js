window.c.ProjectHeader = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-header.page-header.u-text-center', [
        m('.w-container', [
          m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name),
          m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
            'por ',
            project.user.name
          ])
        ])
      ]);
    }
  };
}(window.m));
