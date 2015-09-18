window.c.ProjectReminder = (function(m, models, h) {
  return {
    controller: function(args) {
      var inReminder = h.toggleProp(false, true),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'}),
          complete = m.prop(false),
          submitReminder = function() {
            var l;

            if (inReminder()) {
              l = m.postgrest.loaderWithToken(models.projectReminder.deleteOptions(filterVM.parameters()));
            } else {
              l = m.postgrest.loaderWithToken(models.projectReminder.postOptions({project_id: args.project.id}));
            }

            l.load().then(function(){
              inReminder.toggle();
            });
          };

      filterVM.project_id(args.project.id);
      inReminder(args.project.in_reminder);

      return {
        inReminder: inReminder,
        submitReminder: submitReminder,
        complete: complete
      };
    },
    view: function(ctrl) {
      return m('.u-text-center.u-marginbottom-30', [
        m('a[class="link-hidden fontsize-small ' + (ctrl.inReminder() ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"][href="js:void(0);"]', {onclick: ctrl.submitReminder},[
          m('span.fa.fa-clock-o'),
          (ctrl.complete() ? 'aguarde ...' : (ctrl.inReminder() ? ' Lembrete ativo' : '  Lembrar-me'))
        ])
      ]);
    }
  };
}(window.m, window.c.models, window.c.h));
