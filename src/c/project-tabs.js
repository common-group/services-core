window.c.ProjectTabs = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('nav.project-nav.w-hidden-small.w-hidden-tiny',[
        m('.w-container', [
          m('.w-row', [
            m('.w-col.w-col-9.w-hidden-small.w-hidden-tiny', [
              m('a#about_link.nav-tab[href="#about"]', 'Sobre'),
              m('a#post_link.nav-tab[href="#posts"]', [
                'Novidades',
                m('span.badge', project.posts_count)
              ]),
              m('a#contributions_link.nav-tab[href="#contributions"]', [
                'Apoios',
                m('span.badge', project.total_contributions)
              ]),
              m('a#comments_link.nav-tab[href="#comments"]', [
                'Comentarios',
                m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment"][style="display: inline"]', m.trust('&nbsp;'))
              ]),
            ]),
            m('.w-col.w-col-3.w-hidden-small.w-hidden-tiny.w-clearfix.project-nav-category', [
              m('a.link-hidden-light.u-right[href="/explore/by_category_id/#"' + project.category_id + ']', project.category_name),
              m('img.project-nav-category-icon[width=22][src="/assets/catarse_bootstrap/tag-icon.png"]')
            ])
          ])
        ])
      ]);
    }
  };
}(window.m));

