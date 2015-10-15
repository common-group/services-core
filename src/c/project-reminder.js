window.c.ProjectReminder = ((m, models, h, c) => {
  return {
    controller: (args) => {
      let inReminder = h.toggleProp(false, true),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'}),
          complete = m.prop(false),
          popNotification = m.prop(false),
          submitReminder = () => {
            let loaderOpts = inReminder() ? models.projectReminder.deleteOptions(filterVM.parameters())
                  : models.projectReminder.postOptions({project_id: args.project.id}),
                l = m.postgrest.loaderWithToken(loaderOpts);

            l.load().then(() => {
              inReminder.toggle();

              if (inReminder()) {
                popNotification(true);
                setTimeout(() => {
                  popNotification(false);
                  m.redraw();
                }, 5000);
              } else {
                popNotification(false);
              }
            });
          };

      filterVM.project_id(args.project.id);
      inReminder(args.project.in_reminder);

      return {
        inReminder: inReminder,
        submitReminder: submitReminder,
        complete: complete,
        popNotification: popNotification
      };
    },
    view: (ctrl) => {
      return m('#project-reminder.u-text-center.u-marginbottom-30', [
        m('a[class="link-hidden fontsize-small ' + (ctrl.inReminder() ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"][href="js:void(0);"]', {onclick: ctrl.submitReminder},[
          m('span.fa.fa-clock-o'),
          (ctrl.complete() ? 'aguarde ...' : (ctrl.inReminder() ? ' Lembrete ativo' : ' Lembrar-me'))
        ]),
        (ctrl.popNotification() ? m.component(c.PopNotification, {message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'}) : '')
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window.c));
