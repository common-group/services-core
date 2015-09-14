window.c = (function(){
  return {
    models: {},
    pages: {},
    admin: {},
    project: {},
    h: {}
  };
}());

window.c.h = (function(m, moment){
  //Date Helpers
  var momentify = function(date, format){
    format = format || 'DD/MM/YYYY';
    return date ? moment(date).format(format) : 'no date';
  },

  momentFromString = function(date, format){
    var european = moment(date, format || 'DD/MM/YYYY');
    return european.isValid() ? european : moment(date);
  },

  //Object manipulation helpers
  generateRemaingTime = function(project) {
    var remainingTextObj = m.prop({}),
        translatedTime = {
          days: 'dias',
          minutes: 'minutos',
          hours: 'horas',
          seconds: 'segundos'
        };

    remainingTextObj({
      unit: translatedTime[project.remaining_time.unit || 'seconds'],
      total: project.remaining_time.total
    });

    return remainingTextObj;
  },

  //Number formatting helpers
  generateFormatNumber = function(s, c){
    return function(number, n, x) {
      if (number === null || number === undefined) {
        return null;
      }

      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
          num = number.toFixed(Math.max(0, ~~n));
      return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
  },
  formatNumber = generateFormatNumber('.', ','),

  //Object manipulation helpers
  toggleProp = function(defaultState, alternateState){
    var p = m.prop(defaultState);
    p.toggle = function(){
      p(((p() === alternateState) ? defaultState : alternateState));
    };

    return p;
  },

  idVM = m.postgrest.filtersVM({id: 'eq'}),

  //Templates
  loader = function(){
    return m('.u-text-center.u-margintop-30[style="margin-bottom:-110px;"]', [
      m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')
    ]);
  },

  fbParse = function() {
    var tryParse = function() {
      try {
        window.FB.XFBML.parse();
      } catch (e) {
        console.log(e);
      }
    };

    return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
  },

  pluralize = function(count, s, p) {
    return (count > 1 ? count + p : count + s);
  },

  simpleFormat = function(str) {
    str = str.replace(/\r\n?/, "\n");
    if (str.length > 0) {
      str = str.replace(/\n\n+/g, '</p><p>');
      str = str.replace(/\n/g, '<br />');
      str = '<p>' + str + '</p>';
    }
    return str;
  };

  return {
    momentify: momentify,
    momentFromString: momentFromString,
    formatNumber: formatNumber,
    idVM: idVM,
    toggleProp: toggleProp,
    loader: loader,
    fbParse: fbParse,
    pluralize: pluralize,
    simpleFormat: simpleFormat,
    generateRemaingTime: generateRemaingTime
  };
}(window.m, window.moment));

window.c.models = (function(m){
  var contributionDetail = m.postgrest.model('contribution_details'),

  projectDetail = m.postgrest.model('project_details'),
  userDetail = m.postgrest.model('user_details'),
  rewardDetail = m.postgrest.model('reward_details'),
  contributions = m.postgrest.model('contributions'),
  teamTotal = m.postgrest.model('team_totals'),
  projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
  projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
  teamMember = m.postgrest.model('team_members');

  teamMember.pageSize(40);
  rewardDetail.pageSize(200);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    userDetail: userDetail,
    rewardDetail: rewardDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    projectContributionsPerDay: projectContributionsPerDay,
    projectContributionsPerLocation: projectContributionsPerLocation
  };
}(window.m));

window.c.AdminContribution = (function(m, h){
  return {
    view: function(ctrl, args) {
      var contribution = args.item;
      return m('.w-row.admin-contribution', [
        m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value),
          m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')),
          m('.fontsize-smallest', [
            'ID do Gateway: ',
            m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)
          ])
      ]);
    }
  };
}(window.m, window.c.h));

window.c.AdminDetail = (function(m, _, c){
  return {
    controller: function(){
    },
    view: function(ctrl, args){
      var actions = args.actions,
          item = args.item;
      return m('#admin-contribution-detail-box', [
        m('.divider.u-margintop-20.u-marginbottom-20'),
        m('.w-row.u-marginbottom-30',
          _.map(actions, function(action){
            return m.component(c[action.component], {data: action.data, item: args.item});
          })
        ),
        m('.w-row.card.card-terciary.u-radius',[
          m.component(c.AdminTransaction, {contribution: item}),
          m.component(c.AdminTransactionHistory, {contribution: item}),
          m.component(c.AdminReward, {contribution: item, key: item.key})
        ])
      ]);
    }
  };
}(window.m, window._, window.c));

window.c.AdminFilter = (function(c, m, _, h){
  return {
    controller: function(){
      return {
        toggler: h.toggleProp(false, true)
      };
    },
    view: function(ctrl, args){
      var filterBuilder = args.filterBuilder,
          main = _.findWhere(filterBuilder, {component: 'FilterMain'});

      return m('#admin-contributions-filter.w-section.page-header', [
        m('.w-container', [
          m('.fontsize-larger.u-text-center.u-marginbottom-30', 'Apoios'),
          m('.w-form', [
            m('form', {
              onsubmit: args.submit
            }, [
              (_.findWhere(filterBuilder, {component: 'FilterMain'})) ? m.component(c[main.component], main.data) : '',
              m('.u-marginbottom-20.w-row',
                m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
                  onclick: ctrl.toggler.toggle
                }, 'Filtros avançados  >')), (ctrl.toggler() ?
                m('#advanced-search.w-row.admin-filters', [
                  _.map(filterBuilder, function(f){
                    return (f.component !== 'FilterMain') ? m.component(c[f.component], f.data) : '';
                  })
                ]) : ''
              )
            ])
          ])
        ])
      ]);
    }
  };
}(window.c, window.m, window._, window.c.h));

window.c.AdminInputAction = (function(m, h, c){
  return {
    controller: function(args){
      var builder = args.data,
          complete = m.prop(false),
          error = m.prop(false),
          fail = m.prop(false),
          data = {},
          item = args.item,
          key = builder.getKey,
          newValue = m.prop(''),
          updateVM = m.postgrest.filtersVM({contribution_id: 'eq'});

      h.idVM.id(item[builder.updateKey]);
      updateVM.contribution_id(item.contribution_id);

      var l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

      var updateItem = function(res){
        _.extend(item, res[0]);
        complete(true);
        error(false);
      };

      var submit = function(){
        data[key] = newValue();
        l.load().then(updateItem, error);
        return false;
      };

      var unload = function(el, isinit, context){
        context.onunload = function(){
          complete(false);
          error(false);
          newValue('');
        };
      };

      return {
        complete: complete,
        error: error,
        l: l,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload
      };
    },
    view: function(ctrl, args){
      var data = args.data,
          btnValue = (ctrl.l()) ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2',[
        m('button.btn.btn-small.btn-terciary', {
          onclick: ctrl.toggler.toggle
        }, data.outerLabel),
        (ctrl.toggler()) ?
          m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {config: ctrl.unload},[
            m('form.w-form', {
              onsubmit: ctrl.submit
            }, (!ctrl.complete()) ? [
                  m('label', data.innerLabel),
                  m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {onchange: m.withAttr('value', ctrl.newValue), value: ctrl.newValue()}),
                  m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                ] : (!ctrl.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                      m('p', 'Apoio transferido com sucesso!')
                    ])
                  ] : [
                    m('.w-form-error[style="display:block;"]', [
                      m('p', 'Houve um problema na requisição. O apoio não foi transferido!')
                    ])
                  ]
            )
          ])
        : ''
      ]);
    }
  };
}(window.m, window.c.h, window.c));

window.c.AdminItem = (function(m, _, h, c){
  return {
    controller: function(args){

      var displayDetailBox = h.toggleProp(false, true);

      return {
        displayDetailBox: displayDetailBox
      };
    },

    view: function(ctrl, args) {
      var item = args.item;

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items',[
        m('.w-row',[
          _.map(args.builder, function(desc){
            return m(desc.wrapperClass, [
              m.component(c[desc.component], {item: item, key: item.key})
            ]);
          })
        ]),
        m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {onclick: ctrl.displayDetailBox.toggle}),
        ctrl.displayDetailBox() ? m.component(c.AdminDetail, {item: item, actions: args.actions, key: item.key}) : ''
      ]);
    }
  };
}(window.m, window._, window.c.h, window.c));

window.c.AdminList = (function(m, h, c){
  var admin = c.admin;
  return {
    controller: function(args) {
      var list = args.vm.list;
      if (!list.collection().length && list.firstPage) {
        list.firstPage().then(null, function(serverError) {
          args.vm.error(serverError.message);
        });
      }
    },

    view: function(ctrl, args) {
      var list = args.vm.list,
          error = args.vm.error;
      return m('.w-section.section', [
        m('.w-container',
          error() ?
            m('.card.card-error.u-radius.fontweight-bold', error()) :
            [
              m('.w-row.u-marginbottom-20', [
                m('.w-col.w-col-9', [
                  m('.fontsize-base',
                    list.isLoading() ?
                      'Buscando apoios...' :
                      [m('span.fontweight-semibold', list.total()), ' apoios encontrados']
                   )
                ])
              ]),
              m('#admin-contributions-list.w-container',[
                list.collection().map(function(item) {
                  return m.component(c.AdminItem, {builder: args.itemBuilder, actions: args.itemActions, item: item, key: item.key});
                }),
                m('.w-section.section',[
                  m('.w-container',[
                    m('.w-row',[
                      m('.w-col.w-col-2.w-col-push-5',[
                        !list.isLoading() ?
                          m('button#load-more.btn.btn-medium.btn-terciary', {onclick: list.nextPage}, 'Carregar mais') :
                          h.loader(),
                      ])
                    ])
                  ])
                ])
              ])
            ]
         )
      ]);
    }
  };
}(window.m, window.c.h, window.c));

window.c.AdminProjectDetailsCard = (function(m, h){
  return {
    controller: function(args) {
      var project = args.resource,
          generateStatusText = function() {
            var statusTextObj = m.prop({}),
                statusText = {
                  online: {cssClass: 'text-success', text: 'NO AR'},
                  successful: {cssClass: 'text-success', text: 'FINANCIADO'},
                  failed: {cssClass: 'text-error', text: 'NÃO FINANCIADO'},
                  waiting_funds: {cssClass: 'text-waiting', text: 'AGUARDANDO'},
                  rejected: {cssClass: 'text-error', text: 'RECUSADO'},
                  draft: {cssClass: '', text: 'RASCUNHO'},
                  in_analysis: {cssClass: '', text: 'EM ANÁLISE'},
                  approved: {cssClass: 'text-success', text: 'APROVADO'}
                };

            statusTextObj(statusText[project.state]);

            return statusTextObj;
          },
          generateRemaingTime = function() {
            var remainingTextObj = m.prop({}),
                translatedTime = {
                  days: 'dias',
                  minutes: 'minutos',
                  hours: 'horas',
                  seconds: 'segundos'
                };

            remainingTextObj({
              unit: translatedTime[project.remaining_time.unit || 'seconds'],
              total: project.remaining_time.total
            });

            return remainingTextObj;
          };

      return {
        project: project,
        statusTextObj: generateStatusText(),
        remainingTextObj: generateRemaingTime()
      };
    },

    view: function(ctrl) {
      var project = ctrl.project,
          progress = project.progress.toFixed(2),
          statusTextObj = ctrl.statusTextObj(),
          remainingTextObj = ctrl.remainingTextObj();

      return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [
        m('div', [
          m('.fontsize-small.fontweight-semibold', [
            m('span.fontcolor-secondary', 'Status:'),' ',m('span', {class: statusTextObj.cssClass}, statusTextObj.text),' '
          ]),
          (function(){
            if (project.is_published) {
              return [
                m('.meter.u-margintop-20.u-marginbottom-10', [
                  m('.meter-fill', {style: {width: (progress > 100 ? 100 : progress) + '%'}})
                ]),
                m('.w-row', [
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', [
                      'R$ ' + h.formatNumber(project.pledged, 2),
                    ]),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' restantes')
                  ])
                ])
              ];
            }
          }())
        ])
      ]);
    }
  };
}(window.m, window.c.h));


window.c.AdminProjectDetailsExplanation = (function(m, h){
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
            ' e de informar-se sobre ',m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')
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
            m('a.alt-link[href="/guides"]', 'guia dos realizadores'),'.'
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

window.c.AdminProject = (function(m, h){
  return {
    view: function(ctrl, args) {
      var project = args.item;
      return m('.w-row.admin-project',[
        m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
          m('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')
        ]),
        m('.w-col.w-col-9.w-col-small-9',[
          m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
            m('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)
          ]),
          m('.fontsize-smallest.fontweight-semibold', project.project_state),
          m('.fontsize-smallest.fontcolor-secondary', h.momentify(project.project_online_date) + ' a ' + h.momentify(project.project_expires_at))
        ])
      ]);
    }
  };
}(window.m, window.c.h));

window.c.AdminReward = (function(m, h, _){
  return {
    view: function(ctrl, args) {
      var reward = args.contribution.reward || {},
          available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

      return m('.w-col.w-col-4',[
        m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'),
        m('.fontsize-smallest.lineheight-looser', (_.isEmpty(reward)) ? 'Apoio sem recompensa.' : [
            'ID: ' + reward.id,
            m('br'),
            'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3),
            m('br'),
            m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')),
            m('br'),
            'Aguardando confirmação: ' + reward.waiting_payment_count,
            m('br'),
            'Descrição: ' + reward.description
          ]
        )
      ]);
    }
  };
}(window.m, window.c.h, window._));

window.c.AdminTransactionHistory = (function(m, h, _){
  return {
    controller: function(args) {
      var contribution = args.contribution,
          mapEvents = _.reduce([
        {date: contribution.paid_at, name: 'Apoio confirmado'},
        {date: contribution.pending_refund_at, name: 'Reembolso solicitado'},
        {date: contribution.refunded_at, name: 'Estorno realizado'},
        {date: contribution.created_at, name: 'Apoio criado'},
        {date: contribution.refused_at, name: 'Apoio cancelado'},
        {date: contribution.deleted_at, name: 'Apoio excluído'},
        {date: contribution.chargeback_at, name: 'Chargeback'},
      ], function(memo, item){
        if (item.date !== null && item.date !== undefined) {
          item.originalDate = item.date;
          item.date = h.momentify(item.date, 'DD/MM/YYYY, HH:mm');
          return memo.concat(item);
        }

        return memo;
      }, []);

      return {
        orderedEvents: _.sortBy(mapEvents, 'originalDate')
      };
    },

    view: function(ctrl) {
      return m('.w-col.w-col-4',[
        m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'),
        ctrl.orderedEvents.map(function(cEvent) {
          return m('.w-row.fontsize-smallest.lineheight-looser.date-event',[
            m('.w-col.w-col-6',[
              m('.fontcolor-secondary', cEvent.date)
            ]),
            m('.w-col.w-col-6',[
              m('div', cEvent.name)
            ])
          ]);
        })
      ]);
    }
  };
}(window.m, window.c.h, window._));

window.c.AdminTransaction = (function(m, h){
  return {
    view: function(ctrl, args) {
      var contribution = args.contribution;
      return m('.w-col.w-col-4',[
        m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'),
        m('.fontsize-smallest.lineheight-looser',[
          'Valor: R$' + h.formatNumber(contribution.value, 2, 3),
          m('br'),
          'Taxa: R$' + h.formatNumber(contribution.gateway_fee, 2, 3),
          m('br'),
          'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'),
          m('br'),
          'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'),
          m('br'),
          'Id pagamento: ' + contribution.gateway_id,
          m('br'),
          'Apoio: ' + contribution.contribution_id,
          m('br'),
          'Chave: \n',
          m('br'),
          contribution.key,
          m('br'),
          'Meio: ' + contribution.gateway,
          m('br'),
          'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name),
          m('br'),
          (function(){
            if (contribution.is_second_slip) {
              return [m('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m('span.badge', '2a via')];
            }
          }()),
        ])
      ]);
    }
  };
}(window.m, window.c.h));

window.c.AdminUser = (function(m){
  return {
    view: function(ctrl, args) {
      var user = args.item;
      var userProfile = function(){
        return user.user_profile_img || '/assets/catarse_bootstrap/user.jpg';
      };
      return m('.w-row.admin-user',[
        m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[
          m('img.user-avatar[src="' + userProfile() + '"]')
        ]),
        m('.w-col.w-col-9.w-col-small-9',[
          m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [
            m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name)
          ]),
          m('.fontsize-smallest', 'Usuário: ' + user.user_id),
          m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + user.email),
          m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + user.payer_email)
        ])
      ]);
    }
  };
}(window.m));

window.c.FilterDateRange = (function(m){
  return {
    view: function(ctrl, args){
      return m('.w-col.w-col-3.w-col-small-6', [
        m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
        m('.w-row', [
          m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
            m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
              onchange: m.withAttr('value', args.first),
              value: args.first()
            })
          ]),
          m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
            m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')
          ]),
          m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
            m('input.w-input.text-field.positive[type="text"]', {
              onchange: m.withAttr('value', args.last),
              value: args.last()
            })
          ])
        ])
      ]);
    }
  };
}(window.m));

window.c.FilterDropdown = (function(m, _){
  return {
    view: function(ctrl, args){
      return m('.w-col.w-col-3.w-col-small-6', [
        m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
        m('select.w-select.text-field.positive[id="' + args.index + '"]', {
          onchange: m.withAttr('value', args.vm),
          value: args.vm()
        },[
          _.map(args.options, function(data){
            return m('option[value="' + data.value + '"]', data.option);
          })
        ])
      ]);
    }
  };
}(window.m, window._));

window.c.FilterMain = (function(m){
  return {
    view: function(ctrl, args){
      return m('.w-row', [
        m('.w-col.w-col-10', [
          m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', {onchange: m.withAttr('value', args.vm), value: args.vm()})
        ]),
        m('.w-col.w-col-2', [
          m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]')
        ])
      ]);
    }
  };
}(window.m));

window.c.FilterNumberRange = (function(m){
  return {
    view: function(ctrl, args){
      return m('.w-col.w-col-3.w-col-small-6', [
        m('label.fontsize-smaller[for="' + args.index + '"]', args.label),
        m('.w-row', [
          m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
            m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
              onchange: m.withAttr('value', args.first),
              value: args.first()
            })
          ]),
          m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
            m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')
          ]),
          m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
            m('input.w-input.text-field.positive[type="text"]', {
              onchange: m.withAttr('value', args.last),
              value: args.last()
            })
          ])
        ])
      ]);
    }
  };
}(window.m));

window.c.PaymentStatus = (function(m){
  return {
    controller: function(args){
      var payment = args.item, card = null,
          displayPaymentMethod, paymentMethodClass, stateClass;

      card = function(){
        if (payment.gateway_data){
          switch (payment.gateway.toLowerCase()){
            case 'moip':
              return {
                first_digits:  payment.gateway_data.cartao_bin,
                last_digits: payment.gateway_data.cartao_final,
                brand: payment.gateway_data.cartao_bandeira
              };
            case 'pagarme':
              return {
                first_digits: payment.gateway_data.card_first_digits,
                last_digits: payment.gateway_data.card_last_digits,
                brand: payment.gateway_data.card_brand
              };
          }
        }
      };

      displayPaymentMethod = function(){
        switch (payment.payment_method.toLowerCase()){
          case 'boletobancario':
            return m('span#boleto-detail', '');
          case 'cartaodecredito':
            var cardData = card();
            if (cardData){
              return m('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [
                cardData.first_digits + '******' + cardData.last_digits,
                m('br'),
                cardData.brand + ' ' + payment.installments + 'x'
              ]);
            }
            return '';
        }
      };

      paymentMethodClass = function(){
        switch (payment.payment_method.toLowerCase()){
          case 'boletobancario':
            return '.fa-barcode';
          case 'cartaodecredito':
            return '.fa-credit-card';
          default:
            return '.fa-question';
        }
      };

      stateClass = function(){
        switch (payment.state){
          case 'paid':
            return '.text-success';
          case 'refunded':
            return '.text-refunded';
          case 'pending':
          case 'pending_refund':
            return '.text-waiting';
          default:
            return '.text-error';
        }
      };

      return {
        displayPaymentMethod: displayPaymentMethod,
        paymentMethodClass: paymentMethodClass,
        stateClass: stateClass
      };
    },

    view: function(ctrl, args){
      var payment = args.item;
      return m('.w-row.payment-status', [
        m('.fontsize-smallest.lineheight-looser.fontweight-semibold',[
          m('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state
        ]),
        m('.fontsize-smallest.fontweight-semibold',[
          m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', payment.payment_method)
        ]),
        m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [
          ctrl.displayPaymentMethod()
        ])
      ]);
    }
  };
}(window.m));

window.c.ProjectAbout = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.project-about', [
        (project.video_embed_url ? m('.w-embed.w-video.project-video', [
          m('iframe.embedly-embed[itemprop="video"][src=" ' + project.video_embed_url + '"][width="100%"][height="379"][frameborder="0"][allowFullScreen]')
        ]) : m('span.no-video')),
        m('.fontsize-large.u-marginbottom-30[itemprop="name"]', project.headline),
        m('.no-mobile', [
          m('.fontsize-base[itemprop="about"]', m.trust(project.about_html))
        ]),
        m('p.fontsize-large.fontweight-semibold', 'Orçamento'),
        m('p.fontsize-base', m.trust(project.budget))
      ]);
    }
  };
}(window.m));

window.c.ProjectChartContributionAmountPerDay = (function(m, Chart, _, h){
  return {
    controller: function(args) {
      var resource = args.collection()[0],
          mountDataset = function() {
            return [{
              label: 'R$ arrecadados por dia',
              fillColor: 'rgba(126,194,69,0.2)',
              strokeColor: 'rgba(126,194,69,1)',
              pointColor: 'rgba(126,194,69,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(220,220,220,1)',
              data: _.map(resource.source, function(item) {return item.total_amount;})
            }];
          },
          renderChart = function(element, isInitialized){
            if (isInitialized){return;}

            Object.defineProperty(element, 'offsetHeight', {
              get: function() { return element.height; },
            });
            Object.defineProperty(element, 'offsetWidth', {
              get: function() { return element.width; },
            });
            var ctx = element.getContext('2d');

            new Chart(ctx).Line({
              labels: _.map(resource.source, function(item) {return h.momentify(item.paid_at);}),
              datasets: mountDataset()
            });
          };

      return {
        renderChart: renderChart
      };
    },
    view: function(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [
        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'R$ arrecadados por dia'),
        m('.w-row',[
          m('.w-col.w-col-12', [
            m('canvas[id="chart"][width="860"][height="300"]', {config: ctrl.renderChart})
          ]),
        ])
      ]);
    }
  };
}(window.m, window.Chart, window._, window.c.h));


window.c.ProjectChartContributionTotalPerDay = (function(m, Chart, _, h){
  return {
    controller: function(args) {
      var resource = args.collection()[0],
          mountDataset = function() {
            return [{
              label: 'Apoios confirmados por dia',
              fillColor: 'rgba(126,194,69,0.2)',
              strokeColor: 'rgba(126,194,69,1)',
              pointColor: 'rgba(126,194,69,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(220,220,220,1)',
              data: _.map(resource.source, function(item) {return item.total;})
            }];
          },
          renderChart = function(element, isInitialized){
            if (isInitialized){return;}

            Object.defineProperty(element, 'offsetHeight', {
              get: function() { return element.height; },
            });
            Object.defineProperty(element, 'offsetWidth', {
              get: function() { return element.width; },
            });
            var ctx = element.getContext('2d');

            new Chart(ctx).Line({
              labels: _.map(resource.source, function(item) {return h.momentify(item.paid_at);}),
              datasets: mountDataset()
            });
          };

      return {
        renderChart: renderChart
      };
    },
    view: function(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [
        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Apoios confirmados por dia'),
        m('.w-row',[
          m('.w-col.w-col-12', [
            m('canvas[id="chart"][width="860"][height="300"]', {config: ctrl.renderChart})
          ]),
        ])
      ]);
    }
  };
}(window.m, window.Chart, window._, window.c.h));

window.c.ProjectComments = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]');
    }
  };
}(window.m));

window.c.ProjectContributionsPerLocationTable = (function(m, models, h, _) {
  return {
    controller: function(args) {
      var	vm = m.postgrest.filtersVM({project_id: 'eq'}),
          contributionsPerLocation = m.prop([]),
          generateSort = function(field) {
            return function(){
              var collection = contributionsPerLocation(),
                  resource = collection[0],
                  orderedSource = _.sortBy(resource.source, field);

              if (resource.orderFilter === undefined) {
                resource.orderFilter = 'DESC';
              }

              if (resource.orderFilter === 'DESC') {
                orderedSource = orderedSource.reverse();
              }

              resource.source = orderedSource;
              resource.orderFilter = (resource.orderFilter === 'DESC' ? 'ASC' : 'DESC');
              contributionsPerLocation(collection);
            };
          };

      vm.project_id(args.resourceId);

      models.projectContributionsPerLocation.getRow(vm.parameters()).then(function(data){
        contributionsPerLocation(data);
        generateSort('total_contributed')();
      });

      return {
        contributionsPerLocation: contributionsPerLocation,
        generateSort: generateSort
      };
    },
    view: function(ctrl) {
      return m('.project-contributions-per-location', [
        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Localização geográfica dos apoios'),
        ctrl.contributionsPerLocation().map(function(contributionLocation){
          return m('.table-outer.u-marginbottom-60', [
            m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', [
              m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                m('div', 'Estado')
              ]),
              m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [
                m('a.link-hidden[href="javascript:void(0);"]', {onclick: ctrl.generateSort('total_contributions')}, [
                  'Apoios  ',m('span.fa.fa-sort')
                ])
              ]),
              m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [
                m('a.link-hidden[href="javascript:void(0);"]', {onclick: ctrl.generateSort('total_contributed')}, [
                  'R$ apoiados ',
                  m('span.w-hidden-small.w-hidden-tiny','(% do total) '),
                  ' ',m('span.fa.fa-sort')
                ])
              ])
            ]),
            m('.table-inner.fontsize-small', [
              _.map(contributionLocation.source, function(source) {
                return m('.w-row.table-row', [
                  m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                    m('div', source.state_acronym)
                  ]),
                  m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                    m('div', source.total_contributions)
                  ]),
                  m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [
                    m('div', [
                      'R$ ',
                      h.formatNumber(source.total_contributed, 2, 3),
                      m('span.w-hidden-small.w-hidden-tiny', '  (' + source.total_on_percentage.toFixed(2) + '%)')
                    ])
                  ])
                ]);
              })
            ])
          ]);
        })
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window._));

window.c.ProjectHeader = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-header.page-header.u-text-center', [
        m('.w-container', [
          m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name),
          m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
            'por ',
            project.user.name
          ])
        ])
      ]);
    }
  };
}(window.m));

window.c.ProjectMain = (function(m, c, _, h){
  return {
    controller: function(args) {
      var project = args.project,
          generateRoutes = function() {
            var hash = window.location.hash,
                c_opts = {project: project},
                routes = {
                  '#about': m.component(c.ProjectAbout, c_opts),
                  '#comments': m.component(c.ProjectComments, c_opts)
                };

            h.fbParse();

            if (_.isEmpty(hash)) {
              return routes['#about'];
            }

            return routes[hash];
          };

      window.addEventListener('hashchange', m.redraw, false);

      return {
        project: project,
        generateRoutes: generateRoutes
      };
    },

    view: function(ctrl) {
      return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
        m('.w-container', [
          m('.w-row', [
            m('article.w-hidden-small.w-hidden-tiny.w-col.w-col-8', ctrl.generateRoutes()),
            m.component(c.ProjectSidebar, {project: ctrl.project})
          ])
        ])
      ]);
    }
  };
}(window.m, window.c, window._, window.c.h));

window.c.ProjectReminderCount = (function(m){
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

window.c.ProjectRewardList = (function(m, h, models, _){
  return {
    controller: function(args) {
      var listVM = m.postgrest.paginationVM(models.rewardDetail.getPage),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'}),
          rewardDetails = m.prop([]);

      filterVM.project_id(args.project.id);

      //FIXME: row_order rank
      listVM.firstPage(filterVM.parameters()).then(rewardDetails);

      return {
        rewardDetails: rewardDetails
      };
    },

    view: function(ctrl, args) {
      //FIXME: MISSING ADJUSTS
      // - hover effect
      // - card-gone when reward.sold_out?
      // - max contributions limit overview
      // - add draft admin modifications
      var project = args.project;
      return m('#rewards.u-marginbottom-30', _.map(ctrl.rewardDetails(), function(reward) {
        var contributionUrlWithReward = '/projects/' + project.id + '/contributions/new?reward_id=' + reward.id;

        return m('a.card-reward.card.card-secondary.u-marginbottom-10[href="' + (project.open_for_contributions ? contributionUrlWithReward : 'js:void(0);') + '"]', [
          m('.u-marginbottom-20', [
            m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'),
            m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoiador', ' apoiadores')),
            m('.fontsize-smaller', m.trust(h.simpleFormat(reward.description)))
          ])
        ]);
      }));
    }
  };
}(window.m, window.c.h, window.c.models, window._));

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

window.c.ProjectTabs = (function(m){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('nav.project-nav.w-hidden-small.w-hidden-tiny',[
        m('.w-container', [
          m('.w-row', [
            m('.w-col.w-col-9.w-hidden-small.w-hidden-tiny', [
              m('a#about_link.nav-tab[href="#about"]', 'Sobre'),
              m('a#post_link.nav-tab[href="#posts"]', [
                'Novidades',
                m('span.badge', project.posts_count)
              ]),
              m('a#contributions_link.nav-tab[href="#contributions"]', [
                'Apoios',
                m('span.badge', project.total_contributions)
              ]),
              m('a#comments_link.nav-tab[href="#comments"]', [
                'Comentarios',
                m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment"][style="display: inline"]', m.trust('&nbsp;'))
              ]),
            ]),
            m('.w-col.w-col-3.w-hidden-small.w-hidden-tiny.w-clearfix.project-nav-category', [
              m('a.link-hidden-light.u-right[href="/explore/by_category_id/#"' + project.category_id + ']', project.category_name),
              m('img.project-nav-category-icon[width=22][src="/assets/catarse_bootstrap/tag-icon.png"]')
            ])
          ])
        ])
      ]);
    }
  };
}(window.m));


window.c.TeamMembers = (function(_, m, models){
  return {
    controller: function() {
      var vm = {collection: m.prop([])},

        groupCollection = function(collection, groupTotal) {
        return _.map(_.range(Math.ceil(collection.length / groupTotal)), function(i){
          return collection.slice(i * groupTotal, (i + 1) * groupTotal);
        });
      };

      models.teamMember.getPage().then(function(data){
        vm.collection(groupCollection(data, 4));
      });

      return {
        vm: vm
      };
    },

    view: function(ctrl) {
      return m('#team-members-static.w-section.section', [
        m('.w-container',[
          _.map(ctrl.vm.collection(), function(group) {
            return m('.w-row.u-text-center',[
              _.map(group, function(member) {
                return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [
                  m('a.alt-link[href="/users/' + member.id + '"]', [
                    m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'),
                    m('.fontweight-semibold.fontsize-base', member.name)
                  ]),
                  m('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')
                ]);
              })
            ]);
          })
        ])
      ]);
    }
  };
}(window._, window.m, window.c.models));

window.c.TeamTotal = (function(m, h, models){
  return {
    controller: function() {
      var vm = {collection: m.prop([])};

      models.teamTotal.getRow().then(function(data){
        vm.collection(data);
      });

      return {
        vm: vm
      };
    },

    view: function(ctrl) {
      return m('#team-total-static.w-section.section-one-column.u-margintop-40.u-text-center.u-marginbottom-20', [
        ctrl.vm.collection().map(function(teamTotal){
          return m('.w-container', [
            m('.w-row', [
              m('.w-col.w-col-2'),
              m('.w-col.w-col-8', [
                m('.fontsize-base.u-marginbottom-30',
                  'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length +
                    ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'),
                  m('.fontsize-larger.lineheight-tight.text-success',
                    'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]),
                    m('.w-col.w-col-2')
            ])
          ]);
        })
      ]);
    }
  };
}(window.m, window.c.h, window.c.models));

window.c.UserCard = (function(m, _, models, h){
  return {
    controller: function(args) {
      var vm = h.idVM,
          userDetails = m.prop([]);

      vm.id(args.userId);

      //FIXME: can call anon requests when token fails (requestMaybeWithToken)
      models.userDetail.getRowWithToken(vm.parameters()).then(userDetails);

      return {
        userDetails: userDetails
      };
    },
    view: function(ctrl) {
      return m('#user-card', _.map(ctrl.userDetails(), function(userDetail){
        return m('.card.card-user.u-radius.u-marginbottom-30[itemprop="author"]', [
          m('.w-row', [
            m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', [
              m('img.thumb.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')
            ]),
            m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [
              m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop="name"]',[
                m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)
              ]),
              m('.fontsize-smallest.lineheight-looser[itemprop="address"]', userDetail.address_city),
              m('.fontsize-smallest', userDetail.total_published_projects + ' projetos criados'),
              m('.fontsize-smallest', 'apoiou ' + userDetail.total_contributed_projects + ' projetos')
            ]),
          ]),
          m('.project-author-contacts', [
            m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [
              (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')
              ]) : ''),
              (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')
              ]) : ''),
              _.map(userDetail.links, function(link){
                return m('li', [
                  m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)
                ]);
              })
            ]),
          ]),
          (!_.isEmpty(userDetail.email) ? m('a.btn.btn-medium.btn-message[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '')
        ]);
      }));
    }
  };
}(window.m, window._, window.c.models, window.c.h));

window.c.project.Insights = (function(m, c, models, _){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          projectDetails = m.prop([]),
          contributionsPerDay = m.prop([]);

      vm.project_id(args.root.getAttribute('data-id'));

      models.projectDetail.getRow(vm.parameters()).then(projectDetails);
      models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay);

      return {
        vm: vm,
        projectDetails: projectDetails,
        contributionsPerDay: contributionsPerDay
      };
    },
    view: function(ctrl) {
      return _.map(ctrl.projectDetails(), function(project){
        return m('.project-insights',[
          m('.w-container', [
            m('.w-row.u-marginbottom-40', [
              m('.w-col.w-col-2'),
              m('.w-col.w-col-8.dashboard-header.u-text-center', [
                m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'),
                m.component(c.AdminProjectDetailsCard, {resource: project}),
                m.component(c.AdminProjectDetailsExplanation, {resource: project})
              ]),
              m('.w-col.w-col-2')
            ])
          ]),
          (function(project){
            if (project.is_published) {
              return [
                m('.divider'),
                m('.w-section.section-one-column.bg-gray.before-footer', [
                  m('.w-container', [
                    m('.w-row', [
                      m('.w-col.w-col-12.u-text-center', {style: {'min-height': '300px'}}, [
                        m.component(c.ProjectChartContributionTotalPerDay, {collection: ctrl.contributionsPerDay})
                      ]),
                    ]),
                    m('.w-row', [
                      m('.w-col.w-col-12.u-text-center', {style: {'min-height': '300px'}}, [
                        m.component(c.ProjectChartContributionAmountPerDay, {collection: ctrl.contributionsPerDay})
                      ]),
                    ]),
                    m('.w-row', [
                      m('.w-col.w-col-12.u-text-center', [
                        m.component(c.ProjectContributionsPerLocationTable, {resourceId: ctrl.vm.project_id()})
                      ]),
                    ]),
                    m('.w-row', [
                      m('.w-col.w-col-12.u-text-center', [
                        m.component(c.ProjectReminderCount, {resource: project})
                      ]),
                    ])
                  ])
                ])
              ];
            }
          }(project))
        ]);
      });
    }
  };
}(window.m, window.c, window.c.models, window._));

window.c.project.Show = (function(m, c, _, models){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          projectDetails = m.prop([]);

      vm.project_id(args.root.getAttribute('data-id'));

      models.projectDetail.getRow(vm.parameters()).then(projectDetails);

      return {
        vm: vm,
        projectDetails: projectDetails
      };
    },

    view: function(ctrl) {
      return _.map(ctrl.projectDetails(), function(project){
        return m('.project-show', [
          m.component(c.ProjectHeader, {project: project}),
          m.component(c.ProjectTabs, {project: project}),
          m.component(c.ProjectMain, {project: project})
        ]);
      });
    }
  };
}(window.m, window.c, window._, window.c.models));

window.c.pages.Team = (function(m, c){
  return {
    view: function() {
      return m('#static-team-app',[
        m.component(c.TeamTotal),
        m.component(c.TeamMembers)
      ]);
    }
  };
}(window.m, window.c));

window.c.admin.Contributions = (function(m, c, h){
  var admin = c.admin;
  return {
    controller: function(){
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          error = m.prop(''),
          itemBuilder = [
            {
              component: 'AdminUser',
              wrapperClass: '.w-col.w-col-4'
            },
            {
              component: 'AdminProject',
              wrapperClass: '.w-col.w-col-4'
            },
            {
              component: 'AdminContribution',
              wrapperClass: '.w-col.w-col-2'
            },
            {
              component: 'PaymentStatus',
              wrapperClass: '.w-col.w-col-2'
            }
          ],
          itemActions = [
            {
              component: 'AdminInputAction',
              data: {
                getKey: 'user_id',
                updateKey: 'id',
                callToAction: 'Transferir',
                innerLabel: 'Id do novo apoiador:',
                outerLabel: 'Transferir Apoio',
                placeholder: 'ex: 129908',
                model: c.models.contributionDetail
              }
            }
          ],
          filterBuilder = [
            { //full_text_index
              component: 'FilterMain',
              data: {
                vm: filterVM.full_text_index,
                placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
              }
            },
            { //state
              component: 'FilterDropdown',
              data: {
                label: 'Com o estado',
                name: 'state',
                vm: filterVM.state,
                options: [
                  {value: '', option: 'Qualquer um'},
                  {value: 'paid', option: 'paid'},
                  {value: 'refused', option: 'refused'},
                  {value: 'pending', option: 'pending'},
                  {value: 'pending_refund', option: 'pending_refund'},
                  {value: 'refunded', option: 'refunded'},
                  {value: 'chargeback', option: 'chargeback'},
                  {value: 'deleted', option: 'deleted'}
                ]
              }
            },
            { //gateway
              component: 'FilterDropdown',
              data: {
                label: 'gateway',
                name: 'gateway',
                vm: filterVM.gateway,
                options: [
                  {value: '', option: 'Qualquer um'},
                  {value: 'Pagarme', option: 'Pagarme'},
                  {value: 'MoIP', option: 'MoIP'},
                  {value: 'PayPal', option: 'PayPal'},
                  {value: 'Credits', option: 'Créditos'}
                ]
              }
            },
            { //value
              component: 'FilterNumberRange',
              data: {
                label: 'Valores entre',
                first: filterVM.value.gte,
                last: filterVM.value.lte
              }
            },
            { //created_at
              component: 'FilterDateRange',
              data: {
                label: 'Período do apoio',
                first: filterVM.created_at.gte,
                last: filterVM.created_at.lte
              }
            }
          ],
          submit = function(){
            listVM.firstPage(filterVM.parameters()).then(null, function(serverError){
              error(serverError.message);
            });
            return false;
          };

      return {
        filterVM: filterVM,
        filterBuilder: filterBuilder,
        itemActions: itemActions,
        itemBuilder: itemBuilder,
        listVM: {list: listVM, error: error},
        submit: submit
      };
    },

    view: function(ctrl){
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, filterBuilder: ctrl.filterBuilder, submit: ctrl.submit}),
        m.component(c.AdminList, {vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions})
      ];
    }
  };
}(window.m, window.c, window.c.h));

window.c.admin.contributionFilterVM = (function(m, h, replaceDiacritics){
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
  }),

  paramToString = function(p){
    return (p || '').toString().trim();
  };

  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({id: 'desc'});

  vm.created_at.lte.toFilter = function(){
    var filter = paramToString(vm.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function(){
    var filter = paramToString(vm.created_at.gte());
    return filter && h.momentFromString(filter).format();
  };

  vm.full_text_index.toFilter = function(){
    var filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
  };

  return vm;
}(window.m, window.c.h, window.replaceDiacritics));

window.c.admin.contributionListVM = (function(m, models) {
  return m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);
}(window.m, window.c.models));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtYWJvdXQuanMiLCJwcm9qZWN0LWNoYXJ0LWNvbnRyaWJ1dGlvbi1hbW91bnQtcGVyLWRheS5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLXRvdGFsLXBlci1kYXkuanMiLCJwcm9qZWN0LWNvbW1lbnRzLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLXBlci1sb2NhdGlvbi10YWJsZS5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXRhYnMuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidXNlci1jYXJkLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsInByb2plY3Qvc2hvdy5qcyIsInBhZ2VzL3RlYW0uanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tZmlsdGVyLXZtLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tbGlzdC12bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgbW9kZWxzOiB7fSxcbiAgICBwYWdlczoge30sXG4gICAgYWRtaW46IHt9LFxuICAgIHByb2plY3Q6IHt9LFxuICAgIGg6IHt9XG4gIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9IChmdW5jdGlvbihtLCBtb21lbnQpe1xuICAvL0RhdGUgSGVscGVyc1xuICB2YXIgbW9tZW50aWZ5ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICB9LFxuXG4gIG1vbWVudEZyb21TdHJpbmcgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIHZhciBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gIH0sXG5cbiAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICB2YXIgcmVtYWluaW5nVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgIGRheXM6ICdkaWFzJyxcbiAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgc2Vjb25kczogJ3NlZ3VuZG9zJ1xuICAgICAgICB9O1xuXG4gICAgcmVtYWluaW5nVGV4dE9iaih7XG4gICAgICB1bml0OiB0cmFuc2xhdGVkVGltZVtwcm9qZWN0LnJlbWFpbmluZ190aW1lLnVuaXQgfHwgJ3NlY29uZHMnXSxcbiAgICAgIHRvdGFsOiBwcm9qZWN0LnJlbWFpbmluZ190aW1lLnRvdGFsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVtYWluaW5nVGV4dE9iajtcbiAgfSxcblxuICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgZ2VuZXJhdGVGb3JtYXROdW1iZXIgPSBmdW5jdGlvbihzLCBjKXtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtYmVyLCBuLCB4KSB7XG4gICAgICBpZiAobnVtYmVyID09PSBudWxsIHx8IG51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgIH07XG4gIH0sXG4gIGZvcm1hdE51bWJlciA9IGdlbmVyYXRlRm9ybWF0TnVtYmVyKCcuJywgJywnKSxcblxuICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICB0b2dnbGVQcm9wID0gZnVuY3Rpb24oZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSl7XG4gICAgdmFyIHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICBwLnRvZ2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcDtcbiAgfSxcblxuICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtpZDogJ2VxJ30pLFxuXG4gIC8vVGVtcGxhdGVzXG4gIGxvYWRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwW3N0eWxlPVwibWFyZ2luLWJvdHRvbTotMTEwcHg7XCJdJywgW1xuICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICBdKTtcbiAgfSxcblxuICBmYlBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyeVBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB3aW5kb3cuRkIuWEZCTUwucGFyc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dCh0cnlQYXJzZSwgNTAwKTsgLy91c2UgdGltZW91dCB0byB3YWl0IGFzeW5jIG9mIGZhY2Vib29rXG4gIH0sXG5cbiAgcGx1cmFsaXplID0gZnVuY3Rpb24oY291bnQsIHMsIHApIHtcbiAgICByZXR1cm4gKGNvdW50ID4gMSA/IGNvdW50ICsgcCA6IGNvdW50ICsgcyk7XG4gIH0sXG5cbiAgc2ltcGxlRm9ybWF0ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCBcIlxcblwiKTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbW9tZW50aWZ5OiBtb21lbnRpZnksXG4gICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICBmb3JtYXROdW1iZXI6IGZvcm1hdE51bWJlcixcbiAgICBpZFZNOiBpZFZNLFxuICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgbG9hZGVyOiBsb2FkZXIsXG4gICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICBzaW1wbGVGb3JtYXQ6IHNpbXBsZUZvcm1hdCxcbiAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lXG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSl7XG4gIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcblxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICByZXdhcmREZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncmV3YXJkX2RldGFpbHMnKSxcbiAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfbG9jYXRpb24nKSxcbiAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKTtcblxuICB0ZWFtTWVtYmVyLnBhZ2VTaXplKDQwKTtcbiAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKDIwMCk7XG5cbiAgcmV0dXJuIHtcbiAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICBwcm9qZWN0RGV0YWlsOiBwcm9qZWN0RGV0YWlsLFxuICAgIHVzZXJEZXRhaWw6IHVzZXJEZXRhaWwsXG4gICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICB0ZWFtVG90YWw6IHRlYW1Ub3RhbCxcbiAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uXG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1jb250cmlidXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cImh0dHBzOi8vZGFzaGJvYXJkLnBhZ2FyLm1lLyMvdHJhbnNhY3Rpb25zLycgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCArICdcIl0nLCBjb250cmlidXRpb24uZ2F0ZXdheV9pZClcbiAgICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGFjdGlvbnMgPSBhcmdzLmFjdGlvbnMsXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgXy5tYXAoYWN0aW9ucywgZnVuY3Rpb24oYWN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjW2FjdGlvbi5jb21wb25lbnRdLCB7ZGF0YTogYWN0aW9uLmRhdGEsIGl0ZW06IGFyZ3MuaXRlbX0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLFtcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtjb250cmlidXRpb246IGl0ZW19KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJld2FyZCwge2NvbnRyaWJ1dGlvbjogaXRlbSwga2V5OiBpdGVtLmtleX0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluRmlsdGVyID0gKGZ1bmN0aW9uKGMsIG0sIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICBtYWluID0gXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge2NvbXBvbmVudDogJ0ZpbHRlck1haW4nfSk7XG5cbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ0Fwb2lvcycpLFxuICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogYXJncy5zdWJtaXRcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgKF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pKSA/IG0uY29tcG9uZW50KGNbbWFpbi5jb21wb25lbnRdLCBtYWluLmRhdGEpIDogJycsXG4gICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMC53LXJvdycsXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctY29sLnctY29sLTEyLmZvbnRzaXplLXNtYWxsZXN0LmxpbmstaGlkZGVuLWxpZ2h0W3N0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBvdXRsaW5lOiBub25lOyB0ZXh0LWFsaWduOiBsZWZ0O1wiXVt0eXBlPVwiYnV0dG9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgIG0oJyNhZHZhbmNlZC1zZWFyY2gudy1yb3cuYWRtaW4tZmlsdGVycycsIFtcbiAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuY29tcG9uZW50ICE9PSAnRmlsdGVyTWFpbicpID8gbS5jb21wb25lbnQoY1tmLmNvbXBvbmVudF0sIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5jLCB3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluSW5wdXRBY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICB1cGRhdGVWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7Y29udHJpYnV0aW9uX2lkOiAnZXEnfSk7XG5cbiAgICAgIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSk7XG4gICAgICB1cGRhdGVWTS5jb250cmlidXRpb25faWQoaXRlbS5jb250cmlidXRpb25faWQpO1xuXG4gICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBkYXRhW2tleV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKCcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBsOiBsLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJyxbXG4gICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksXG4gICAgICAgIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge2NvbmZpZzogY3RybC51bmxvYWR9LFtcbiAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSwgdmFsdWU6IGN0cmwubmV3VmFsdWUoKX0pLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdBcG9pbyB0cmFuc2ZlcmlkbyBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcblxuICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5RGV0YWlsQm94OiBkaXNwbGF5RGV0YWlsQm94XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4LmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMjAucmVzdWx0cy1hZG1pbi1pdGVtcycsW1xuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBfLm1hcChhcmdzLmJ1aWxkZXIsIGZ1bmN0aW9uKGRlc2Mpe1xuICAgICAgICAgICAgcmV0dXJuIG0oZGVzYy53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1tkZXNjLmNvbXBvbmVudF0sIHtpdGVtOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdidXR0b24udy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnknLCB7b25jbGljazogY3RybC5kaXNwbGF5RGV0YWlsQm94LnRvZ2dsZX0pLFxuICAgICAgICBjdHJsLmRpc3BsYXlEZXRhaWxCb3goKSA/IG0uY29tcG9uZW50KGMuQWRtaW5EZXRhaWwsIHtpdGVtOiBpdGVtLCBhY3Rpb25zOiBhcmdzLmFjdGlvbnMsIGtleTogaXRlbS5rZXl9KSA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluTGlzdCA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcbiAgICAgIGlmICghbGlzdC5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3QuZmlyc3RQYWdlKSB7XG4gICAgICAgIGxpc3QuZmlyc3RQYWdlKCkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgIGFyZ3Mudm0uZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3I7XG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgIGVycm9yKCkgP1xuICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6XG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgJ0J1c2NhbmRvIGFwb2lvcy4uLicgOlxuICAgICAgICAgICAgICAgICAgICAgIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCAnIGFwb2lvcyBlbmNvbnRyYWRvcyddXG4gICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge2J1aWxkZXI6IGFyZ3MuaXRlbUJ1aWxkZXIsIGFjdGlvbnM6IGFyZ3MuaXRlbUFjdGlvbnMsIGl0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLFtcbiAgICAgICAgICAgICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7b25jbGljazogbGlzdC5uZXh0UGFnZX0sICdDYXJyZWdhciBtYWlzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdXG4gICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICBvbmxpbmU6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdOTyBBUid9LFxuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0ZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIGZhaWxlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtjc3NDbGFzczogJ3RleHQtd2FpdGluZycsIHRleHQ6ICdBR1VBUkRBTkRPJ30sXG4gICAgICAgICAgICAgICAgICByZWplY3RlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdSRUNVU0FETyd9LFxuICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtjc3NDbGFzczogJycsIHRleHQ6ICdSQVNDVU5ITyd9LFxuICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtjc3NDbGFzczogJycsIHRleHQ6ICdFTSBBTsOBTElTRSd9LFxuICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdBUFJPVkFETyd9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSB7XG4gICAgICAgICAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqKHtcbiAgICAgICAgICAgICAgdW5pdDogdHJhbnNsYXRlZFRpbWVbcHJvamVjdC5yZW1haW5pbmdfdGltZS51bml0IHx8ICdzZWNvbmRzJ10sXG4gICAgICAgICAgICAgIHRvdGFsOiBwcm9qZWN0LnJlbWFpbmluZ190aW1lLnRvdGFsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlbWFpbmluZ1RleHRPYmo7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGdlbmVyYXRlUmVtYWluZ1RpbWUoKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgdmFyIHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmooKTtcblxuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksJ8KgJyxtKCdzcGFuJywge2NsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzfSwgc3RhdHVzVGV4dE9iai50ZXh0KSwnwqAnXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtzdHlsZToge3dpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSd9fSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2ZpbmFuY2lhZG8nKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnbGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsIHJlbWFpbmluZ1RleHRPYmoudW5pdCArICcgcmVzdGFudGVzJylcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgZmFpbGVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBuw6NvIGRlc2FuaW1lIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBuw6NvIGJhdGV1IGEgbWV0YSBlIHNhYmVtb3MgcXVlIGlzc28gbsOjbyDDqSBhIG1lbGhvciBkYXMgc2Vuc2HDp8O1ZXMuIE1hcyBuw6NvIGRlc2FuaW1lLiAnLFxuICAgICAgICAgICAgJ0VuY2FyZSBvIHByb2Nlc3NvIGNvbW8gdW0gYXByZW5kaXphZG8gZSBuw6NvIGRlaXhlIGRlIGNvZ2l0YXIgdW1hIHNlZ3VuZGEgdGVudGF0aXZhLiBOw6NvIHNlIHByZW9jdXBlLCB0b2RvcyBvcyBzZXVzIGFwb2lhZG9yZXMgcmVjZWJlcsOjbyBvIGRpbmhlaXJvIGRlIHZvbHRhLsKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzY1NTA3LVJlZ3Jhcy1lLWZ1bmNpb25hbWVudG8tZG9zLXJlZW1ib2xzb3MtZXN0b3Jub3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBmYXplbW9zIGVzdG9ybm9zIGUgcmVlbWJvbHNvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCcuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFwcHJvdmVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBzZXUgcHJvamV0byBmb2kgYXByb3ZhZG8hJyksXG4gICAgICAgICAgICAnwqBQYXJhIGNvbG9jYXIgbyBzZXUgcHJvamV0byBubyBhciDDqSBwcmVjaXNvIGFwZW5hcyBxdWUgdm9jw6ogcHJlZW5jaGEgb3MgZGFkb3MgbmVjZXNzw6FyaW9zIG5hIGFiYcKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIiN1c2VyX3NldHRpbmdzXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAnLiDDiSBpbXBvcnRhbnRlIHNhYmVyIHF1ZSBjb2JyYW1vcyBhIHRheGEgZGUgMTMlIGRvIHZhbG9yIHRvdGFsIGFycmVjYWRhZG8gYXBlbmFzIHBvciBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLiBFbnRlbmRhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIGZhemVtb3MgbyByZXBhc3NlIGRvIGRpbmhlaXJvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLFtcbiAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciByZXdhcmQgPSBhcmdzLmNvbnRyaWJ1dGlvbi5yZXdhcmQgfHwge30sXG4gICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIChfLmlzRW1wdHkocmV3YXJkKSkgPyAnQXBvaW8gc2VtIHJlY29tcGVuc2EuJyA6IFtcbiAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFtcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LCBuYW1lOiAnQXBvaW8gY29uZmlybWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LCBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCwgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCwgbmFtZTogJ0Fwb2lvIGNyaWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LCBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCwgbmFtZTogJ0NoYXJnZWJhY2snfSxcbiAgICAgIF0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pe1xuICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgIH0sIFtdKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JyxbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJyxbXG4gICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICB2YXIgdXNlclByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdXNlci51c2VyX3Byb2ZpbGVfaW1nIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgIH07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsW1xuICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgdXNlclByb2ZpbGUoKSArICdcIl0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci51c2VyX2lkICsgJy9lZGl0XCJdJywgdXNlci51c2VyX25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci51c2VyX2lkKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdDYXRhcnNlOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIHVzZXIucGF5ZXJfZW1haWwpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICB9LFtcbiAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSwgdmFsdWU6IGFyZ3Mudm0oKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sIGNhcmQgPSBudWxsLFxuICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgIGNhcmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpe1xuICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiAgcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgIGlmIChjYXJkRGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKXtcbiAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsW1xuICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0QWJvdXQgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtYWJvdXQnLCBbXG4gICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlbycsIFtcbiAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIiAnICsgcHJvamVjdC52aWRlb19lbWJlZF91cmwgKyAnXCJdW3dpZHRoPVwiMTAwJVwiXVtoZWlnaHQ9XCIzNzlcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICBdKSA6IG0oJ3NwYW4ubm8tdmlkZW8nKSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMFtpdGVtcHJvcD1cIm5hbWVcIl0nLCBwcm9qZWN0LmhlYWRsaW5lKSxcbiAgICAgICAgbSgnLm5vLW1vYmlsZScsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZVtpdGVtcHJvcD1cImFib3V0XCJdJywgbS50cnVzdChwcm9qZWN0LmFib3V0X2h0bWwpKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgZGF0YTogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7cmV0dXJuIGl0ZW0udG90YWxfYW1vdW50O30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScpLFxuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTInLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsO30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge2NvbmZpZzogY3RybC5yZW5kZXJDaGFydH0pXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29tbWVudHMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnLmZiLWNvbW1lbnRzW2RhdGEtaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2RhdGEtbnVtLXBvc3RzPTUwXVtkYXRhLXdpZHRoPVwiNjEwXCJdJyk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gKGZ1bmN0aW9uKG0sIG1vZGVscywgaCwgXykge1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhclx0dm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgIGdlbmVyYXRlU29ydCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBjb250cmlidXRpb25zUGVyTG9jYXRpb24oKSxcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29sbGVjdGlvblswXSxcbiAgICAgICAgICAgICAgICAgIG9yZGVyZWRTb3VyY2UgPSBfLnNvcnRCeShyZXNvdXJjZS5zb3VyY2UsIGZpZWxkKTtcblxuICAgICAgICAgICAgICBpZiAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLm9yZGVyRmlsdGVyID0gJ0RFU0MnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSAnREVTQycpIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gb3JkZXJlZFNvdXJjZS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXNvdXJjZS5zb3VyY2UgPSBvcmRlcmVkU291cmNlO1xuICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9IChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnID8gJ0FTQycgOiAnREVTQycpO1xuICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24oY29sbGVjdGlvbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yZXNvdXJjZUlkKTtcblxuICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24uZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGRhdGEpO1xuICAgICAgICBnZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJykoKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb246IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgZ2VuZXJhdGVTb3J0OiBnZW5lcmF0ZVNvcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnTG9jYWxpemHDp8OjbyBnZW9ncsOhZmljYSBkb3MgYXBvaW9zJyksXG4gICAgICAgIGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkubWFwKGZ1bmN0aW9uKGNvbnRyaWJ1dGlvbkxvY2F0aW9uKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgJ0VzdGFkbycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGlvbnMnKX0sIFtcbiAgICAgICAgICAgICAgICAgICdBcG9pb3PCoMKgJyxtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnUiQgYXBvaWFkb3MgJyxcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsJyglIGRvIHRvdGFsKcKgJyksXG4gICAgICAgICAgICAgICAgICAnICcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudGFibGUtaW5uZXIuZm9udHNpemUtc21hbGwnLCBbXG4gICAgICAgICAgICAgIF8ubWFwKGNvbnRyaWJ1dGlvbkxvY2F0aW9uLnNvdXJjZSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy50YWJsZS1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS5zdGF0ZV9hY3JvbnltKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyxcbiAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihzb3VyY2UudG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICfCoMKgKCcgKyBzb3VyY2UudG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdEhlYWRlciA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXIucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlci5mb250d2VpZ2h0LXNlbWlib2xkLnByb2plY3QtbmFtZVtpdGVtcHJvcD1cIm5hbWVcIl0nLCBwcm9qZWN0Lm5hbWUpLFxuICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAncG9yICcsXG4gICAgICAgICAgICBwcm9qZWN0LnVzZXIubmFtZVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9IChmdW5jdGlvbihtLCBjLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBnZW5lcmF0ZVJvdXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCxcbiAgICAgICAgICAgICAgICBjX29wdHMgPSB7cHJvamVjdDogcHJvamVjdH0sXG4gICAgICAgICAgICAgICAgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNjb21tZW50cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbW1lbnRzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1snI2Fib3V0J107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaGFzaF07XG4gICAgICAgICAgfTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBtLnJlZHJhdywgZmFsc2UpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBnZW5lcmF0ZVJvdXRlczogZ2VuZXJhdGVSb3V0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICBtKCdhcnRpY2xlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkudy1jb2wudy1jb2wtOCcsIGN0cmwuZ2VuZXJhdGVSb3V0ZXMoKSksXG4gICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7cHJvamVjdDogY3RybC5wcm9qZWN0fSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlKSxcbiAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG5cbiAgICAgIC8vRklYTUU6IHJvd19vcmRlciByYW5rXG4gICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihyZXdhcmREZXRhaWxzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmV3YXJkRGV0YWlsczogcmV3YXJkRGV0YWlsc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAvLyAtIGhvdmVyIGVmZmVjdFxuICAgICAgLy8gLSBjYXJkLWdvbmUgd2hlbiByZXdhcmQuc29sZF9vdXQ/XG4gICAgICAvLyAtIG1heCBjb250cmlidXRpb25zIGxpbWl0IG92ZXJ2aWV3XG4gICAgICAvLyAtIGFkZCBkcmFmdCBhZG1pbiBtb2RpZmljYXRpb25zXG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGN0cmwucmV3YXJkRGV0YWlscygpLCBmdW5jdGlvbihyZXdhcmQpIHtcbiAgICAgICAgdmFyIGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ldz9yZXdhcmRfaWQ9JyArIHJld2FyZC5pZDtcblxuICAgICAgICByZXR1cm4gbSgnYS5jYXJkLXJld2FyZC5jYXJkLmNhcmQtc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pYWRvcicsICcgYXBvaWFkb3JlcycpKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2lkZWJhciA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBkaXNwbGF5Q2FyZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6ICdjYXJkLXdhaXRpbmcnLFxuICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAnZmFpbGVkJzogJ2NhcmQtZXJyb3InLFxuICAgICAgICAgICAgICAnZHJhZnQnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdjYXJkLWRhcmsnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gKHN0YXRlc1twcm9qZWN0LnN0YXRlXSA/ICdjYXJkIHUtcmFkaXVzIHppbmRleC0xMCAnICsgc3RhdGVzW3Byb2plY3Quc3RhdGVdIDogJycpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdFc3NlIHByb2pldG8gasOhIGZvaSBhcHJvdmFkbyBwZWxvIENhdGFyc2UuIEVtIGJyZXZlIGVsZSBlbnRyYXLDoSBubyBhciBlIGVzdGFyw6EgcHJvbnRvIHBhcmEgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgICAgJ29ubGluZSc6ICdWb2PDqiBwb2RlIGFwb2lhciBlc3RlIHByb2pldG8gYXTDqSBvIGRpYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpICsgJyDDoHMgMjNoNTltNTlzJyxcbiAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdFc3RlIHByb2pldG8gbsOjbyBhdGluZ2l1IG8gbcOtbmltbyBkZSBSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5nb2FsKSArICcgYXTDqSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpICsgJyBlIG7Do28gZm9pIGZpbmFuY2lhZG8nLFxuICAgICAgICAgICAgICAncmVqZWN0ZWQnOiAnRXN0ZSBwcm9qZXRvIG7Do28gZm9pIGFjZWl0by4gTsOjbyDDqSBwb3Nzw612ZWwgcmVhbGl6YXIgdW0gYXBvaW8uJyxcbiAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ0VzdGUgcHJvamV0byBlc3TDoSBlbSBhbsOhbGlzZSBlIGFpbmRhIG7Do28gZXN0w6EgYWJlcnRvIHBhcmEgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnRXN0ZSBwcm9qZXRvIGZvaSBiZW0tc3VjZWRpZG8gZSBmb2kgZmluYW5jaWFkbyBlbSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLFxuICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6ICdPIHByYXpvIGRlIGNhcHRhw6fDo28gZGVzc2UgcHJvamV0byBlc3TDoSBlbmNlcnJhZG8uIEVzdGFtb3MgYWd1YXJkYW5kbyBhIGNvbmZpcm1hw6fDo28gZG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MuJyxcbiAgICAgICAgICAgICAgJ2RyYWZ0JzogJ0VzdGUgcHJvamV0byDDqSBhcGVuYXMgdW0gcmFzY3VuaG8gZSBhaW5kYSBuw6NvIHBvZGUgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZXNbcHJvamVjdC5zdGF0ZV07XG4gICAgICAgICAgfTtcblxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5Q2FyZENsYXNzOiBkaXNwbGF5Q2FyZENsYXNzLFxuICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIHRpbWVPYmogPSBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdCkoKTtcblxuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXNpZGViYXIuYXNpZGUudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMtbnVtYmVycy51LW1hcmdpbmJvdHRvbS0yMC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsJywgJ2F0aW5naWRvcyBkZSBSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5nb2FsKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IHRpbWVPYmoudG90YWwgOiAocHJvamVjdC5vbmxpbmVfZGF5cyB8fCAwKSkpLFxuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBbXG4gICAgICAgICAgICAgICAgbSgnc3BhbltzdHlsZT1cInRleHQtdHJhbnNmb3JtOmNhcGl0YWxpemU7XCJdJywgKHByb2plY3QuaXNfcHVibGlzaGVkID8gdGltZU9iai51bml0IDogJ2RpYXMnKSksXG4gICAgICAgICAgICAgICAgJyByZXN0YW50ZXMnXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBtKCdhI2NvbnRyaWJ1dGVfcHJvamVjdF9mb3JtLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFyIGVzdGUgcHJvamV0bycpIDogJycpLFxuICAgICAgICAgIG0oJ2RpdltjbGFzcz1cImZvbnRzaXplLXNtYWxsZXIgdS1tYXJnaW5ib3R0b20tMzAgJyArIChjdHJsLmRpc3BsYXlDYXJkQ2xhc3MoKSkgKyAnXCJdJywgY3RybC5kaXNwbGF5U3RhdHVzVGV4dCgpKSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlVzZXJDYXJkLCB7dXNlcklkOiBwcm9qZWN0LnVzZXJfaWR9KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7cHJvamVjdDogcHJvamVjdH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFRhYnMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnbmF2LnByb2plY3QtbmF2LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgIG0oJ2EjYWJvdXRfbGluay5uYXYtdGFiW2hyZWY9XCIjYWJvdXRcIl0nLCAnU29icmUnKSxcbiAgICAgICAgICAgICAgbSgnYSNwb3N0X2xpbmsubmF2LXRhYltocmVmPVwiI3Bvc3RzXCJdJywgW1xuICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMnLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnYSNjb250cmlidXRpb25zX2xpbmsubmF2LXRhYltocmVmPVwiI2NvbnRyaWJ1dGlvbnNcIl0nLCBbXG4gICAgICAgICAgICAgICAgJ0Fwb2lvcycsXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ2EjY29tbWVudHNfbGluay5uYXYtdGFiW2hyZWY9XCIjY29tbWVudHNcIl0nLCBbXG4gICAgICAgICAgICAgICAgJ0NvbWVudGFyaW9zJyxcbiAgICAgICAgICAgICAgICBtKCdmYjpjb21tZW50cy1jb3VudFtocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bY2xhc3M9XCJiYWRnZSBwcm9qZWN0LWZiLWNvbW1lbnRcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkudy1jbGVhcmZpeC5wcm9qZWN0LW5hdi1jYXRlZ29yeScsIFtcbiAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi1saWdodC51LXJpZ2h0W2hyZWY9XCIvZXhwbG9yZS9ieV9jYXRlZ29yeV9pZC8jXCInICsgcHJvamVjdC5jYXRlZ29yeV9pZCArICddJywgcHJvamVjdC5jYXRlZ29yeV9uYW1lKSxcbiAgICAgICAgICAgICAgbSgnaW1nLnByb2plY3QtbmF2LWNhdGVnb3J5LWljb25bd2lkdGg9MjJdW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdGFnLWljb24ucG5nXCJdJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcblxuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfSxcblxuICAgICAgICBncm91cENvbGxlY3Rpb24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBncm91cFRvdGFsKSB7XG4gICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgZnVuY3Rpb24oaSl7XG4gICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFtcbiAgICAgICAgICBfLm1hcChjdHJsLnZtLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsW1xuICAgICAgICAgICAgICBfLm1hcChncm91cCwgZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIuYmlnLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMTBbc3JjPVwiJyArIG1lbWJlci5pbWcgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfTtcblxuICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpe1xuICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICdIb2plIHNvbW9zICcgKyB0ZWFtVG90YWwubWVtYmVyX2NvdW50ICsgJyBwZXNzb2FzIGVzcGFsaGFkYXMgcG9yICcgKyB0ZWFtVG90YWwudG90YWxfY2l0aWVzICsgJyBjaWRhZGVzIGVtICcgKyB0ZWFtVG90YWwuY291bnRyaWVzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICcgcGHDrXNlcyAoJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMudG9TdHJpbmcoKSArICcpISBPIENhdGFyc2Ugw6kgaW5kZXBlbmRlbnRlLCBzZW0gaW52ZXN0aWRvcmVzLCBkZSBjw7NkaWdvIGFiZXJ0byBlIGNvbnN0cnXDrWRvIGNvbSBhbW9yLiBOb3NzYSBwYWl4w6NvIMOpIGNvbnN0cnVpciB1bSBhbWJpZW50ZSBvbmRlIGNhZGEgdmV6IG1haXMgcHJvamV0b3MgcG9zc2FtIGdhbmhhciB2aWRhLicpLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCl7XG4gICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspe1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgIF0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnByb2plY3QuSW5zaWdodHMgPSAoZnVuY3Rpb24obSwgYywgbW9kZWxzLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgbW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihwcm9qZWN0RGV0YWlscyk7XG4gICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdm06IHZtLFxuICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gXy5tYXAoY3RybC5wcm9qZWN0RGV0YWlscygpLCBmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWluc2lnaHRzJyxbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5kYXNoYm9hcmQtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgJ01pbmhhIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge3Jlc291cmNlOiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIChmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25Ub3RhbFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXksIHtjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsIHtyZXNvdXJjZUlkOiBjdHJsLnZtLnByb2plY3RfaWQoKX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlckNvdW50LCB7cmVzb3VyY2U6IHByb2plY3R9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0ocHJvamVjdCkpXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnByb2plY3QuU2hvdyA9IChmdW5jdGlvbihtLCBjLCBfLCBtb2RlbHMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdm06IHZtLFxuICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIFtcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RIZWFkZXIsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0VGFicywge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNYWluLCB7cHJvamVjdDogcHJvamVjdH0pXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLlRlYW0gPSAoZnVuY3Rpb24obSwgYyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsW1xuICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbU1lbWJlcnMpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuYWRtaW4uQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBoKXtcbiAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSxcbiAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICBpdGVtQnVpbGRlciA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Vc2VyJyxcbiAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblByb2plY3QnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdQYXltZW50U3RhdHVzJyxcbiAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBpdGVtQWN0aW9ucyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5JbnB1dEFjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBnZXRLZXk6ICd1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnVHJhbnNmZXJpcicsXG4gICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnVHJhbnNmZXJpciBBcG9pbycsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTI5OTA4JyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIGgsIHJlcGxhY2VEaWFjcml0aWNzKXtcbiAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgc3RhdGU6ICdlcScsXG4gICAgZ2F0ZXdheTogJ2VxJyxcbiAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICB9KSxcblxuICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCl7XG4gICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfTtcblxuICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgdm0uc3RhdGUoJycpO1xuICB2bS5nYXRld2F5KCcnKTtcbiAgdm0ub3JkZXIoe2lkOiAnZGVzYyd9KTtcblxuICB2bS5jcmVhdGVkX2F0Lmx0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5lbmRPZignZGF5JykuZm9ybWF0KCcnKTtcbiAgfTtcblxuICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5ndGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgfTtcblxuICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICB9O1xuXG4gIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwuZ2V0UGFnZVdpdGhUb2tlbik7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==