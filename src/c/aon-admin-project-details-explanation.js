/**
 * window.c.AonAdminProjectDetailsExplanation component
 * render an explanation about project all or nothing project mde.
 *
 * Example:
 * m.component(c.AonAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
window.c.AonAdminProjectDetailsExplanation = (function(m, h) {
    return {
        controller: function(args) {
            var explanation = function(resource) {
                var stateText = {
                    online: [
                        m('span', 'Você pode receber apoios até 23hs59min59s do dia ' + h.momentify(resource.zone_expires_at) + '. Lembre-se, é tudo-ou-nada e você só levará os recursos captados se bater a meta dentro desse prazo.')
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
                    failed: [
                        m('span.fontweight-semibold', resource.user.name + ', não desanime!'),
                        ' Seu projeto não bateu a meta e sabemos que isso não é a melhor das sensações. Mas não desanime. ',
                        'Encare o processo como um aprendizado e não deixe de cogitar uma segunda tentativa. Não se preocupe, todos os seus apoiadores receberão o dinheiro de volta. ',
                        m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202365507-Regras-e-funcionamento-dos-reembolsos-estornos"][target="_blank"]', 'Entenda como fazemos estornos e reembolsos.')
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
                        'Quando tudo estiver pronto, clique no botão ENVIAR e entraremos em contato para avaliar o seu projeto.'
                    ],
                    in_analysis: [
                        m('span.fontweight-semibold', resource.user.name + ', você enviou seu projeto para análise em ' + h.momentify(resource.sent_to_analysis_at) + ' e receberá nossa avaliação em até 4 dias úteis após o envio!'),
                        ' Enquanto espera a sua resposta, você pode continuar editando o seu projeto. ',
                        'Recomendamos também que você vá coletando feedback com as pessoas próximas e planejando como será a sua campanha.'
                    ],
                    approved: [
                        m('span.fontweight-semibold', resource.user.name + ', seu projeto foi aprovado!'),
                        ' Para colocar o seu projeto no ar é preciso apenas que você preencha os dados necessários na aba ',
                        m('a.alt-link[href="#user_settings"]', 'Conta'),
                        '. É importante saber que cobramos a taxa de 13% do valor total arrecadado apenas por projetos bem sucedidos. Entenda ',
                        m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como fazemos o repasse do dinheiro.')
                    ],
                };

                return stateText[resource.state];
            };

            return {
                explanation: explanation(args.resource)
            };
        },
        view: function(ctrl, args) {
            return m('p.' + args.resource.state + '-project-text.fontsize-small.lineheight-loose', ctrl.explanation);
        }
    };
}(window.m, window.c.h));
