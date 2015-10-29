window.c.pages.Flex = (function(m, c, h, models) {
    return {
        controller: function() {
            const stats = m.prop([]),
                l = m.prop(),
                builder = {
                    customAction: '//catarse.us5.list-manage.com/subscribe/post?u=ebfcd0d16dbb0001a0bea3639&amp;id=8a4c1a33ce'
                },
                addDisqus = (el, isInitialized) => {
                    if (!isInitialized) {
                        h.discuss('https://catarse.me/flex', 'flex_page');
                    }
                };

            const loader = m.postgrest.loaderWithToken(models.statistic.getRowOptions());
            loader.load().then(stats);

            return {
                addDisqus: addDisqus,
                builder: builder,
                loader: loader,
                stats: stats
            };
        },
        view: function(ctrl, args) {
            let stats = _.first(ctrl.stats());
            return [
                m('.w-section.hero-full.hero-zelo', [
                    m('.w-container.u-text-center', [
                        m('img.logo-flex-home[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5626e670595f80b338f5bf5c_logo-flex.png\'][width=\'359\']'),
                        m('.w-row', [
                            m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!')
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m.component(c.landingSignup, {
                                builder: ctrl.builder
                            }),
                            m('.w-col.w-col-2')
                        ])
                    ])
                ]), [
                    m('.section', [
                        m('.w-container', [
                            m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [
                                m('.w-row.u-marginbottom-60', [
                                    m('.w-col.w-col-6', [
                                        m('.u-text-center.u-marginbottom-20', [
                                            m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')
                                        ]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos de assistencialismo, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')
                                    ]), m('.w-col.w-col-6', [
                                        m('.u-text-center.u-marginbottom-20', [
                                            m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')
                                        ]), m('p.fontsize-base', 'Pessoas se juntam para compartilhar custos faz tempo. Por isso o flex estará aberto a campanhas de pessoas que querem arrecadar dinheiro junto a quem se importa. De custos de estudos a realizar um casamento. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. Vaquinhas ágeis e pessoais com o Flex.')
                                    ])
                                ])
                            ])
                        ])
                    ]), m('.w-section.section.bg-greenlime.fontcolor-negative', [
                        m('.w-container', [
                            m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [
                                m('.w-col.w-col-6', [
                                    m('.u-text-center', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')
                                    ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O Flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que arrecadar.')
                                ]), m('.w-col.w-col-6', [
                                    m('.u-text-center', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')
                                    ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'Você não precisa oferecer recompensas aos seus apoiadores. Está na sua mão a escolha.')
                                ])
                            ]), m('.w-row.u-marginbottom-40', [
                                m('.w-col.w-col-6', [
                                    m('.u-text-center', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')
                                    ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no Flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')
                                ]), m('.w-col.w-col-6', [
                                    m('.u-text-center', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')
                                    ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo para sua campanha. Para receber o dinheiro arrecadado por você, basta encerrá-la.')
                                ])
                            ])
                        ])
                    ]), m('.w-section.section', [
                        m('.w-container', [
                            m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [
                                m('.w-col.w-col-6', [
                                    m.component(c.landingQA, {
                                        question: 'Quais as taxas do Catarse Flex?',
                                        answer: 'Como no Catarse, enviar um projeto não custa nada! Estamos estudando opções para entender qual será a taxa cobrada no serviço Catarse Flex.'
                                    }),
                                    m.component(c.landingQA, {
                                        question: 'De onde vem o dinheiro do meu projeto?',
                                        answer: 'Família, amigos, fãs e membros de comunidades que você faz parte são seus maiores colaboradores. São eles que irão divulgar sua campanha para as pessoas que eles conhecem, e assim o círculo de apoiadores vai aumentando e a sua campanha ganha força.'
                                    }),
                                    m.component(c.landingQA, {
                                        question: 'Qual a diferença entre CatarseFlex e Catarse?',
                                        answer: 'O Catarse utiliza o sistema Tudo ou Nada e o CatarseFlex vai testar a utilização do sistema de arrecadação flexível que estamos estudando. Diferentemente do Catarse, quando projetos só ficam com o dinheiro se baterem a meta, o Flex consiste em você ficar com o que arrecadar, independente de atingir a meta. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado. Esse teste serve também para entender o papel da modalidade Flex para a atual comunidade do Catarse.'
                                    }),
                                ]), m('.w-col.w-col-6', [
                                    m.component(c.landingQA, {
                                        question: 'Dá trabalho ter uma campanha no Catarse Flex?',
                                        answer: 'Cada campanha no Catarse tem sua própria particularidade e a quantidade de trabalho varia. Inscrever o projeto no CatarseFlex é muito fácil, mas uma campanha, que é como você faz as pessoas conhecerem o seu projeto, tem seus desafios. Inscreva seu email nessa página para saber mais sobre como captar recursos para campanhas Flex.'
                                    }),
                                    m.component(c.landingQA, {
                                        question: 'Por quê vocês querem fazer o CatarseFlex?',
                                        answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O CatarseFlex é mais um passo nessa direção.'
                                    }),
                                    m.component(c.landingQA, {
                                        question: 'Quando vocês irão lançar o CatarseFlex?',
                                        answer: 'Ainda não sabemos quando abriremos o Flex para o público. Iremos primeiramente passar por um período de testes e depois estabelecer uma data de lançamento. Se você deseja acompanhar e receber notícias sobre essa caminhada, inscreva seu email nessa página.'
                                    })
                                ])
                            ])
                        ])
                    ]),
                    m('.w-section.section-large.u-text-center.bg-purple', [
                        m('.w-container.fontcolor-negative', [
                            m('.fontsize-largest', 'Fique por dentro!'), m('.fontsize-base.u-marginbottom-60', 'Receba notícias e acompanhe a evolução do CatarseFlex'), m('.w-row', [
                                m('.w-col.w-col-2'),
                                m.component(c.landingSignup, {
                                    builder: ctrl.builder
                                }),
                                m('.w-col.w-col-2')
                            ])
                        ])
                    ]), m('.w-section.section-one-column.bg-catarse-zelo.section-large', [
                        m('.w-container.u-text-center', [
                            m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O Flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.   '),
                            m('.w-row.u-text-center', (ctrl.loader()) ? h.loader() : [
                                m('.w-col.w-col-4', [
                                    m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')
                                ]),
                                m('.w-col.w-col-4', [
                                    m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')
                                ]),
                                m('.w-col.w-col-4', [
                                    m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')
                                ])
                            ])
                        ])
                    ]),
                    m('.w-section.section.bg-blue-one', [
                        m('.w-container', [
                            m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o CatarseFlex para seus amigos'),
                            m('.w-row', [
                                m('.w-col.w-col-2'),
                                m('.w-col.w-col-8', [
                                    m('.w-row', [
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                            m('div', [
                                                m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'),
                                                m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')
                                            ])
                                        ]),
                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                            m('div', [
                                                m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'),
                                                m('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')
                                            ])
                                        ])
                                    ])
                                ]),
                                m('.w-col.w-col-2')
                            ])
                        ])
                    ]), m('.w-section.section-large.bg-greenlime', [
                        m('.w-container', [
                            m('.u-text-center', [
                                m('.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')
                            ]),
                            m('#disqus_thread.card.u-radius', {
                                config: ctrl.addDisqus
                            })
                        ])
                    ])
                ]
            ];
        }
    };
}(window.m, window.c, window.c.h, window.c.models));
