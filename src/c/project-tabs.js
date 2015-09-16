window.c.ProjectTabs = (function(m, h){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.w-section.project-nav.mf',[
        m('.w-container', [
          m('.w-row', [
            m('.w-col.w-col-9', [
              //FIXME: need to adjust rewards on mobile
              m('a[class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', 'Recompensas'),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', 'Sobre'),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', [
                'Novidades',
                m('span.badge', project.posts_count)
              ]),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', [
                'Apoios',
                m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)
              ]),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', [
                'Comentarios',
                m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))
              ]),
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c.h));

