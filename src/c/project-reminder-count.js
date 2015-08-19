window.c.ProjectReminderCount = (function(m){
  return {
    view: function(ctrl, args) {
      return m('.card.u-radius.u-text-center.medium.u-marginbottom-80', [
          args.collection().map(function(project){
            return m('div', [
              m('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'),
              m('.fontsize-smaller.u-marginbottom-30', 'Eles receberão um lembrete por email 48 horas antes do término de sua campanha'),
              m('.fontsize-jumbo', project.reminder_count)
            ]);
          })
        ]);
    }
  };
}(window.m));
