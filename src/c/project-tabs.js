window.c.ProjectTabs = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.w-section.project-nav.mf',[
        m('.w-container', [
          m('.w-row', [
            m('.w-col.w-col-9', [
              //FIXME: need to adjust rewards on mobile
              m('a.w-hidden-main.w-hidden-medium.dashboard-nav-link.mf.u-important-display-inline[href="#rewards"]', 'Recompensas'),
              m('a.dashboard-nav-link.mf[href="#about"]', 'Sobre'),
              m('a.dashboard-nav-link.mf[href="#posts"]', [
                'Novidades',
                m('span.badge', project.posts_count)
              ]),
              m('a.dashboard-nav-link.mf[href="#contributions"]', [
                'Apoios',
                m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)
              ]),
              m('a.dashboard-nav-link.mf[href="#comments"]', [
                'Comentarios',
                m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))
              ]),
            ])
          ])
        ])
      ]);
    }
  };
}(window.m));

