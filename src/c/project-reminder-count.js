window.c.ProjectReminderCount = (function(m) {
    return {
        view: function(ctrl, args) {
            var project = args.resource;
            return m('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [
                m('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'),
                m('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'),
                m('.fontsize-jumbo', project.reminder_count)
            ]);
        }
    };
}(window.m));
