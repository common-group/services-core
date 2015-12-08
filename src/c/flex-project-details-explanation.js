/**
 * window.c.FlexAdminProjectDetailsExplanation component
 * render an explanation about project flex project mde.
 *
 * Example:
 * m.component(c.FlexAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
window.c.FlexAdminProjectDetailsExplanation = ((m, h, _) => {
    return {
        controller: (args) => {
            let explanation = (resource) => {
                let stateText = {
                    online: [
                        (_.isNull(resource.expires_at) ?
                         m('span', [
                             m('a.alt-link[href="/projects/' + resource.id + '/edit#announce_expiration"]', 'Quero iniciar'),
                             ' a reta final de 7 dias'
                         ])
                         : m('span', `Você recebe tudo que arrecadar até as ${h.momentify(resource.zone_expires_at, 'HH:mm:ss')} de ${h.momentify(resource.zone_expires_at)}`))
                    ],
                    successful: [
                        m('span.fontweight-semibold', resource.user.name + ', comemore que você merece!'),
                        ' Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ',
                        'Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ',
                        m('a.alt-link[href="/guides"]', 'Guia dos Realizadores'),
                        ' e de informar-se sobre ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')
                    ],
                    waiting_funds: [
                        m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'),
                        ' Seu projeto foi finalizado em ' + h.momentify(resource.zone_expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ',
                        'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ',
                        m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.')
                    ],
                    rejected: [
                        m('span.fontweight-semibold', resource.user.name + ', infelizmente não foi desta vez.'),
                        ' Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ',
                        'Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ',
                        'Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ',
                        m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', 'critérios da plataforma'),
                        ' e no ',
                        m('a.alt-link[href="/guides"]', 'guia dos realizadores'), '.'
                    ],
                    draft: [
                        m('span.fontweight-semibold', resource.user.name + ', construa o seu projeto!'),
                        ' Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ',
                        'Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ',
                        'Quando tudo estiver pronto, clique no botão PUBLICAR.'
                    ],
                };

                return stateText[resource.state];
            };

            return {
                explanation: explanation(args.resource)
            };
        },
        view: (ctrl, args) => {
            return m('p.' + args.resource.state + '-project-text.fontsize-small.lineheight-loose', ctrl.explanation);
        }
    };
}(window.m, window.c.h, window._));
