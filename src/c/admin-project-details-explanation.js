window.c.AdminProjectDetailsExplanation = (function(m, h){
  return {
    controller: function(args) {
      var explanation = function(resource) {
        switch (resource.state) {
          case 'online':
            return m('span', 'Você pode receber apoios até 23hs59min59s do dia ' + h.momentify(resource.expires_at) + '. Lembre-se, é tudo-ou-nada e você só levará os recursos captados se bater a meta dentro desse prazo.');
          case 'successful':
            return m('span', 'projeto successful');
          case 'waiting_funds':
            return m('span', [
              m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'),
              ' Seu projeto foi finalizado em ' + h.momentify(resource.expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ',
              'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ',
              m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.'),
            ]);
          case 'rejected':
            return m('span', 'projeto rejected');
          case 'draft':
            return m('span', 'projeto draft');
          case 'in_analysis':
            return m('span', 'projeto in_analysis');
        }
      };

      return {
        explanation: explanation(args.resource)
      };
    },
    view: function(ctrl) {
      return m('p.fontsize-smaller.lineheight-loose', ctrl.explanation);
    }
  };
}(window.m, window.c.h));
