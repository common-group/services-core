window.c.root.Publish = ((m, c, h, models, _, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.publish');

    return {
        controller: (args) => {
            let filtersVM = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                publishVM = c.PublishVM,
                projectAccount = m.prop([]),
                projectDetails = m.prop([]),
                acceptTerm = m.prop([true,true,true,true,true,true,true,true,true]),
                flexAcceptTerm = m.prop([true,true,true,true,true,true,true,true,true]),
                showNextTerm = (index, acceptTerms) => {
                    var terms = acceptTerms();
                    if (terms[index]) {
                        terms[index] = false;
                        acceptTerms(terms);
                        var nextTerm = document.getElementsByClassName('w-hidden publish-rules');
                        if (nextTerm[0] !== undefined) {
                            nextTerm[0].classList.remove('w-hidden');
                        }
                    }
                    //show publish button after accepting all rules
                    if (index === terms.length - 1){
                        document.getElementsByClassName('publish-btn-section')[0].classList.remove('w-hidden');
                    }
                },
                loader = m.postgrest.loaderWithToken;

            filtersVM.project_id(args.root.getAttribute('data-id'));

            const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
                accountL = loader(models.projectAccount.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);
            accountL.load().then(projectAccount);

            return {
                l: l,
                accountL: accountL,
                filtersVM: filtersVM,
                acceptTerm: acceptTerm,
                flexAcceptTerm: flexAcceptTerm,
                showNextTerm: showNextTerm,
                projectAccount: projectAccount,
                projectDetails: projectDetails
            };
        },

        view: function(ctrl, args) {
            const project = _.first(ctrl.projectDetails()),
              account = _.first(ctrl.projectAccount()),
              flexTerms = (project) => {
                  return [
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Regras da modalidade FLEX')
                        ]),
                        m('div', 'Você escolheu a campanha flexível. Dessa maneira, você irá receber os recursos arrecadados  junto aos apoiadores ao final do prazo da campanha (descontando a taxa do Catarse) e deverá cumprir com a execução do projeto e com a entrega das recompensas oferecidas independente do quanto arrecadar.')
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Meta de arrecadação')
                        ]),
                        m('div', 'A meta não poderá ser alterada após o publicação do projeto.')
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Taxas')
                        ]),
                        m('div', [
                          'Ao final da campanha, cobraremos 13% sobre o ',
                          m('span.fontweight-semibold', 'valor total arrecadado.')
                        ])
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Prazo da campanha')
                        ]),
                        m('div', 'Sua campanha poderá ficar até 12 meses arrecadando dentro do Catarse. Durante esse período você deverá definir um prazo de encerramento da campanha para poder receber os recursos arrecadados. Uma vez definido, o prazo de encerramento não poderá ser alterado.')
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Prazo para repasse')
                        ]),
                        m('div', 'Após encerrar a sua campanha e confirmar seus dados bancários, o Catarse realizará o repasse diretamente na sua conta corrente em até 10 dias úteis. O valor depositado já estará considerando o desconto de 13% da taxa.')
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                            ' ',
                          m('span.fontweight-semibold', 'O que pode e não pode alterar na página do projeto a partir da publicação?')
                        ]),
                      [m('div', [m('span.fontweight-semibold', 'Você não poderá:'),' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\
                        '                          ,m('br'),m('br'),m('span.fontweight-semibold', 'Você poderá: '),'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Responsabilidade do Catarse')
                        ]),
                      [m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold', 'O Catarse é responsável:'),' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'O Catarse não é responsável:'),' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                            ' ',
                          m('span.fontweight-semibold', 'Suas responsabilidades')
                        ]),
                        m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold'),'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])
                      ]),
                      m('.w-col.w-col-11', [
                        m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                          ' ',
                          m('span', {style: {'font-weight': ' 600'}}, 'Retiradas de projetos no ar')
                        ]),
                        m('div', [m('span.fontweight-semibold'),'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'),' e ',m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'),'.'])
                      ])

              ];
              },

              terms = (project) => {
                  return [m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                            ' ',
                            m('span.fontweight-semibold', 'Regras da modalidade Tudo-ou-nada')
                          ]),
                          m('div', ['Você escolheu a campanha tudo-ou-nada. Dessa maneira, você só irá receber os recursos arrecadados ',m('span.fontweight-semibold', 'caso atinja ou supere a meta de arrecadação'),'. Caso contrário, todos seus apoiadores serão reembolsados. Você será responsável pela entrega das recompensas oferecidas se seu projeto alcançar a meta de arrecadação.'])
                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Meta de arrecadação')
                          ]),
                          m('div', 'A meta não poderá ser alterada após o publicação do projeto.'),

                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Taxas')
                          ]),
                          m('div', [
                            'Cobramos 13% sobre o ',
                            m('span.fontweight-semibold', 'valor total arrecadado'),
                            ' pelo seu projeto caso ele atinja ou supere a meta dentro do prazo da campanha. Se o projeto não atingir a meta, nenhuma taxa será cobrada.',
                            m('span.fontweight-semibold')
                          ])
                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Prazo da campanha')
                          ]),
                          m('div', `Seu projeto estará em arrecadação no Catarse até o dia ${h.momentify(project.zone_expires_at)} às 23h59min59s. Este prazo não poderá ser alterado após a publicação do projeto.`)
                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Regras do repasse e reembolso')
                          ]),
                          m('div', ['Após encerrar o seu projeto e confirmar seus dados bancários, o Catarse depositará o valor arrecadado, já com o desconto da taxa, na sua conta corrente em até 10 dias úteis. Caso o projeto não atinja 100% da meta dentro do prazo, o Catarse irá reembolsar os apoiadores. ',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Saiba mais sobre o processo de reembolso'),'.'])
                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'O que pode e não pode alterar na página do projeto a partir da publicação?')
                          ]),
                        [m('div', [m('span.fontweight-semibold', 'Você não poderá:'),' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'Você poderá: '),'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Responsabilidade do Catarse')
                          ]),
                        [m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold', 'O Catarse é responsável:'),' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'O Catarse não é responsável:'),' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Suas responsabilidades')
                          ]),
                          m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold'),'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])
                        ]),

                        m('.w-col.w-col-11', [
                          m('div', [
                            m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                            ' ',
                            m('span', {style: {'font-weight': ' 600'}}, 'Retiradas de projetos no ar')
                          ]),
                          m('div', [m('span.fontweight-semibold'),'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'),' e ',m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'),'.'])
                        ])

                  ];
              };

            return [!ctrl.l() && !ctrl.accountL() ? [
            (project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                project: m.prop(project),
                hidePublish: true
            }) : ''),
            m(`.w-section.section-product.${project.mode}`),
            m('.w-section.section', [
              m('.w-container', [
                m('.w-row', [
                  m('.w-col.w-col-3'),
                  m('.w-col.w-col-6', [
                    m('.u-text-center', [
                      m('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'),
                      m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'),
                      m('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')
                    ])
                  ]),
                  m('.w-col.w-col-3')
                ])
              ])
            ]),
            m('.divider'),
            m('.w-section.section-one-column.bg-gray.section.before-footer', [
              m('.w-container', [
                m('.card.medium.u-marginbottom-60.card-terciary', [
                  m('.w-row', [
                    m('.w-col.w-col-6.w-clearfix', [
                      m('img.card-project-thumb.u-right[src=' + project.large_image + ']')
                    ]),
                    m('.w-col.w-col-6', [
                      m('.u-marginbottom-30.fontsize-base', [
                        m('div', [m('span.fontweight-semibold', 'Título: '), project.name]),
                        m('div', [m('span.fontweight-semibold', 'Link: '),`www.catarse.me/${project.permalink}`]),
                        m('div', [m('span.fontweight-semibold', 'Modalidade de financiamento: '), I18n.t(project.mode, I18nScope())]),
                        m('div', [m('span.fontweight-semibold', 'Meta de arrecadação: '),`R$ ${h.formatNumber(project.goal, 2, 3)}`]),
                        (project.mode !== 'flex') ? m('div', [m('span.fontweight-semibold', `Prazo: ${project.online_days} dias`)]) : '',
                        m('div', [m('span.fontweight-semibold', 'Responsável: '), account.owner_name]),
                        m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])
                      ])
                    ])
                  ]),
                  m('.u-text-center', [
                    m('.w-row', [
                      m('.w-col.w-col-1'),
                      m('.w-col.w-col-10', [
                        m('.divider.u-marginbottom-10'),
                        m('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')
                      ]),
                      m('.w-col.w-col-1')
                    ])
                  ])
                ]),
                m('.card.medium.u-radius.u-marginbottom-60', [
                  m('.u-text-center.u-marginbottom-60', [
                    m('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'),
                    m('.w-row', [
                      m('.w-col.w-col-2'),
                      m('.w-col.w-col-8', [
                        m('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ',m('a.alt-link[href=\'https://equipecatarse.zendesk.com/account/dropboxes/20298537\'][target=\'_blank\']', 'entre em contato'),'!'])
                      ]),
                      m('.w-col.w-col-2')
                    ])
                  ]),

                  _.map(project.mode == 'flex' ? flexTerms(project) : terms(project), (term, index) => {
                      return m(`.u-marginbottom-30.fontsize-base${index == 0 ? '' : '.w-hidden.publish-rules'}`, [
                        m(`.w-row[id='rule-${index}']`, [
                          m('.w-col.w-col-1.u-text-center', [
                            m('div', [
                              m((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? `a.w-inline-block.checkbox-big[href='#rule-${index + 1}']` : `a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href='#rule-${index + 1}']`, {onclick: () => ctrl.showNextTerm(index, (project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm))})
                            ])
                          ]),
                          term
                        ])
                    ]);
                  })

                ]),
                m('.w-row.publish-btn-section.w-hidden', [
                  m('.w-col.w-col-4'),
                  m('.w-col.w-col-4', [
                    m(`a.btn.btn-large.u-marginbottom-20[href=/${project.mode == 'flex' ? 'flexible_projects' : 'projects'}/${project.mode == 'flex' ? project.flex_id : project.id}/push_to_online]`, 'Publicar agora!'),
                    m('.u-text-center.fontsize-smaller', [
                      'Ao publicar o seu projeto, você está aceitando os ',
                      m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'),
                      ', ',
                      project.mode == 'flex' ?
                        m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/206574833-Regras-para-a-fase-de-testes-do-Catarse-Flex\'][target=\'_blank\']', 'Regras do Flex') : '',
                      ' e ',
                      m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')
                    ])
                  ]),
                  m('.w-col.w-col-4')
                ])
              ])
            ]),
            '\
        '
          ] : h.loader()];
        }
    };
}(window.m, window.c, window.c.h, window.c.models, window._, window.I18n));
