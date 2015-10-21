window.c.ProjectReminder = ((m, models, h, c) => {
    return {
        controller: (args) => {
            let project = args.project,
                inReminder = h.toggleProp(false, true),
                filterVM = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                storeReminderName = 'remind_' + project.id,
                l = m.prop(false),
                popNotification = m.prop(false),
                submitReminder = () => {
                    if (!h.getUser()) {
                        h.storeAction(storeReminderName, submitReminder);
                        return h.navigateToDevise();
                    }
                    let loaderOpts = inReminder() ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                        project_id: project.id
                    });
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

            h.callStoredAction(storeReminderName, submitReminder);
            filterVM.project_id(project.id);
            inReminder(project.in_reminder);

            return {
                inReminder: inReminder,
                submitReminder: submitReminder,
                l: l,
                popNotification: popNotification
            };
        },
        view: (ctrl) => {
            return m('#project-reminder.u-text-center.u-marginbottom-30', [
                m('button[class="btn-link link-hidden fontsize-small ' + (ctrl.inReminder() ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
                    onclick: ctrl.submitReminder
                }, [
                    (ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', ctrl.inReminder() ? ' Lembrete ativo' : ' Lembrar-me'))
                ]), (ctrl.popNotification() ? m.component(c.PopNotification, {
                    message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
                }) : '')
            ]);
        }
    };
}(window.m, window.c.models, window.c.h, window.c));
