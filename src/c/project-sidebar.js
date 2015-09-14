window.c.ProjectSidebar = (function(m, h, c){
  return {
    controller: function(args) {
      var project = args.project,
          displayCardClass = function() {
            var states = {
              'waiting_funds': 'card-waiting',
              'successful': 'card-success',
              'failed': 'card-error',
              'draft': 'card-dark',
              'in_analysis': 'card-dark',
              'approved': 'card-dark'
            };

            return (states[project.state] ? 'card u-radius zindex-10 ' + states[project.state] : '');
          },
          displayStatusText = function() {
            var states = {
              'approved': 'Esse projeto já foi aprovado pelo Catarse. Em breve ele entrará no ar e estará pronto para receber apoios.',
              'online': 'Você pode apoiar este projeto até o dia ' + h.momentify(project.zone_expires_at) + ' às 23h59m59s',
              'failed': 'Este projeto não atingiu o mínimo de R$ ' + h.formatNumber(project.goal) + ' até ' + h.momentify(project.zone_expires_at) + ' e não foi financiado',
              'rejected': 'Este projeto não foi aceito. Não é possível realizar um apoio.',
              'in_analysis': 'Este projeto está em análise e ainda não está aberto para receber apoios.',
              'successful': 'Este projeto foi bem-sucedido e foi financiado em ' + h.momentify(project.zone_expires_at),
              'waiting_funds': 'O prazo de captação desse projeto está encerrado. Estamos aguardando a confirmação dos últimos pagamentos.',
              'draft': 'Este projeto é apenas um rascunho e ainda não pode receber apoios.',
            };

            return states[project.state];
          };


      return {
        displayCardClass: displayCardClass,
        displayStatusText: displayStatusText
      };
    },

    view: function(ctrl, args) {
      var project = args.project,
          timeObj = h.generateRemaingTime(project)();

      return m('#project-sidebar.aside.w-col.w-col-4', [
        m('.project-stats', [
          m('.project-stats-numbers.u-marginbottom-20.w-hidden-small.w-hidden-tiny', [
            m('.w-hidden-small.w-hidden-tiny.u-marginbottom-10', [
              m('.fontsize-largest', 'R$ ' + h.formatNumber(project.pledged)),
              m('.fontsize-small', 'atingidos de R$ ' + h.formatNumber(project.goal))
            ]),
            m('.w-hidden-small.w-hidden-tiny.u-marginbottom-10', [
              m('.fontsize-largest', project.total_contributions),
              m('.fontsize-small', 'apoios')
            ]),
            m('.w-hidden-small.w-hidden-tiny.u-marginbottom-10', [
              m('.fontsize-largest', (project.is_published ? timeObj.total : (project.online_days || 0))),
              m('.fontsize-small', [
                m('span[style="text-transform:capitalize;"]', (project.is_published ? timeObj.unit : 'dias')),
                ' restantes'
              ])
            ])
          ]),
          (project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar este projeto') : ''),
          m('div[class="fontsize-smaller u-marginbottom-30 ' + (ctrl.displayCardClass()) + '"]', ctrl.displayStatusText()),
          m.component(c.UserCard, {userId: project.user_id}),
          m.component(c.ProjectRewardList, {project: project})
        ])
      ]);
    }
  };
}(window.m, window.c.h, window.c));
