window.c.ProjectReminder = (function(m) {
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.u-text-center.u-marginbottom-30', [
        m('a[class="link-hidden fontsize-small ' + (project.in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"][href="js:void(0);"]', [
          m('span.fa.fa-clock-o'),
          (project.in_reminder ? ' Lembrete ativo' : '  Lembrar-me')
        ])
      ]);
    }
  };
}(window.m));
