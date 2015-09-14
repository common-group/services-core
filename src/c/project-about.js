window.c.ProjectAbout = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.project-about', [
        (project.video_embed_url ? m('.w-embed.w-video.project-video', [
          m('iframe.embedly-embed[itemprop="video"][src=" ' + project.video_embed_url + '"][width="100%"][height="379"][frameborder="0"][allowFullScreen]')
        ]) : m('span.no-video')),
        m('.fontsize-large.u-marginbottom-30[itemprop="name"]', project.headline),
        m('.no-mobile', [
          m('.fontsize-base[itemprop="about"]', m.trust(project.about_html))
        ]),
        m('p.fontsize-large.fontweight-semibold', 'Orçamento'),
        m('p.fontsize-base', m.trust(project.budget))
      ]);
    }
  };
}(window.m));
