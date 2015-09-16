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

  hashMatch = function(str) {
    return window.location.hash === str;
  },

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
    str = str.replace(/\r\n?/, '\n');
    if (str.length > 0) {
      str = str.replace(/\n\n+/g, '</p><p>');
      str = str.replace(/\n/g, '<br />');
      str = '<p>' + str + '</p>';
    }
    return str;
  },

  rewardSouldOut = function(reward) {
    return (reward.maximum_contributions > 0 ?
        (reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions) : false);
  },

  rewardRemaning = function(reward) {
    return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
  },

  parseUrl = function(href) {
    var l = document.createElement('a');
    l.href = href;
    return l;
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
    generateRemaingTime: generateRemaingTime,
    rewardSouldOut: rewardSouldOut,
    rewardRemaning: rewardRemaning,
    parseUrl: parseUrl,
    hashMatch: hashMatch
  };
}(window.m, window.moment));

window.c.models = (function(m){
  var contributionDetail = m.postgrest.model('contribution_details'),

  projectDetail = m.postgrest.model('project_details'),
  userDetail = m.postgrest.model('user_details'),
  rewardDetail = m.postgrest.model('reward_details'),
  contributions = m.postgrest.model('contributions'),
  teamTotal = m.postgrest.model('team_totals'),
  projectContribution = m.postgrest.model('project_contributions'),
  projectPostDetail = m.postgrest.model('project_posts_details'),
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
    projectContributionsPerLocation: projectContributionsPerLocation,
    projectContribution: projectContribution,
    projectPostDetail: projectPostDetail
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

window.c.ProjectAbout = (function(m, c, h){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-about', [
        m('.project-about.w-col.w-col-8', [
          m('p.fontsize-base', [
            m('strong', 'O projeto'),
          ]),
          m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)),
          m('p.fontsize-large.fontweight-semibold', 'Orçamento'),
          m('p.fontsize-base', m.trust(project.budget))
        ]),
        m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', [
          m('.w-hidden-small.w-hidden-tiny.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'),
          m.component(c.ProjectRewardList, {project: project}),
          (project.is_published ?
            m('.funding-period', [
              m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'),
              m('.fontsize-small.u-text-center-small-only', [
                h.momentify(project.online_date), ' - ', h.momentify(project.zone_expires_at), ' (' + project.online_days + ' dias) '
              ])
            ])
           : '')
        ])
      ]);
    }
  };
}(window.m, window.c, window.c.h));

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

window.c.ProjectContributions = (function(m, models, h, _){
  return {
    controller: function(args) {
      var listVM = m.postgrest.paginationVM(models.projectContribution.getPageWithToken),
          filterVM = m.postgrest.filtersVM({project_id: 'eq', waiting_payment: 'eq'}),
          generateSort = function(waiting) {
            return function () {
              //FIXME: need to find a way to pass false filter
              filterVM.waiting_payment(waiting);
              listVM.firstPage(filterVM.parameters()).then(null);
            };
          };

      filterVM.project_id(args.project.id);

      if (!listVM.collection().length && listVM.firstPage(filterVM.parameters())) {
        listVM.firstPage(filterVM.parameters()).then(null);
      }


      return {
        listVM: listVM,
        filterVM: filterVM,
        generateSort: generateSort
      };
    },
    view: function(ctrl, args) {
      var list = ctrl.listVM;
      return m('#project_contributions.content.w-col.w-col-12', [
        (args.project.is_owner_or_admin ?
          m('.w-row.u-marginbottom-20', [
            m(".w-col.w-col-1", [
              m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {onclick: ctrl.generateSort(false)})
            ]),
            m('.w-col.w-col-5', [
              m('label[for="contribution_state_available_to_count"]', 'Confirmados')
            ]),
            m('.w-col.w-col-1', [
              m('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {onclick: ctrl.generateSort(true)})
            ]),
            m(".w-col.w-col-5", [
              m('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')
            ])
          ])
         : ''),
        m('.project-contributions', _.map(list.collection(), function(contribution) {
          return m('.w-clearfix', [
            m('.w-row.u-marginbottom-20', [
              m('.w-col.w-col-1', [
                m('a[href="/users/' + contribution.user_id + '"]', [
                  m('.thumb.u-left.u-round[style="background-image: url(' + (!_.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')
                ])
              ]),
              m('.w-col.w-col-11', [
                m('.fontsize-base.fontweight-semibold', [
                  m('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name),
                  (contribution.is_owner_or_admin ?
                    m('.fontsize-smaller', [
                      'R$ ' + h.formatNumber(contribution.value, 2, 3),
                      (contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '')
                    ]) : ''),
                    m('.fontsize-smaller', h.momentify(contribution.created_at, 'DD/MM/YYYY, h:mm') + 'h'),
                    m('.fontsize-smaller', (contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora'))
                  ])
                ])
              ]),
            m('.divider.u-marginbottom-20')
          ]);
      })),
      m('.w-row',[
        m('.w-col.w-col-2.w-col-push-5',[
          !list.isLoading() ?
            m('button#load-more.btn.btn-medium.btn-terciary', {onclick: list.nextPage}, 'Carregar mais') :
            h.loader(),
        ])
      ])
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window._));


window.c.ProjectHeader = (function(m, c){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-header', [
        m('.w-section.page-header.u-text-center', [
          m('.w-container', [
            m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name),
            m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
              'por ',
              project.user.name
            ])
          ])
        ]),
        m('.w-section.project-main', [
          m('.w-container', [
            m('.w-row.project-main', [
              m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {project: project})),
              m('.w-col.w-col-4', m.component(c.ProjectSidebar, {project: project}))
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c));

window.c.ProjectHighlight = (function(m, _, h){
  return {
    controller: function() {
      var displayShareBox = h.toggleProp(false, true);

      return {
        displayShareBox: displayShareBox
      };
    },
    //FIXME: Add img when video is not present
    view: function(ctrl, args) {
      var project = args.project;
      return m('#project-highlight', [
        (project.video_embed_url ? m('.w-embed.w-video.project-video.mf', [
          m('iframe.embedly-embed[itemprop="video"][src=" ' + project.video_embed_url + '"][frameborder="0"][allowFullScreen]')
        ]) : m('span.no-video')),
        m('.project-blurb', project.headline),
        m('.u-text-center-small-only.u-marginbottom-30', [
          (!_.isEmpty(project.address) ?
            m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="js:void(0);"]', [
              m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym
            ]) : ''
          ),
          m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/explore/by_category_id/#"' + project.category_id + ']', [
            m('span.fa.fa-tag'), ' ',
            project.category_name
          ]),
          m('a.btn.btn-small.btn-terciary.btn-inline[href="js:void(0);"]', {onclick: ctrl.displayShareBox.toggle}, 'Compartilhar'),
          (ctrl.displayShareBox() ?
            m(".pop-share", [
              m(".w-hidden-main.w-hidden-medium.w-clearfix", [
                m("a.btn.btn-small.btn-terciary.btn-inline.u-right[href='js:void(0);']", "Fechar"),
                m(".fontsize-small.fontweight-semibold.u-marginbottom-30", "Compartilhe este projeto")
              ]),
              m(".w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block", [
                m("iframe[allowtransparency='true'][frameborder='0'][scrolling='no'][src='//www.facebook.com/plugins/like.php?href=https%3A%2F%2Ffacebook.com%2Fwebflow&layout=button_count&locale=en_US&action=like&show_faces=false&share=false']", {style: {"border": " none", " overflow": " hidden", " width": " 90px", " height": " 20px"}})
              ]),
              m(".w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block", [
                m("iframe[allowtransparency='true'][frameborder='0'][scrolling='no'][src='//platform.twitter.com/widgets/tweet_button.html#url=http%3A%2F%2Fwebflow.com&counturl=webflow.com&text=Check%20out%20this%20site&count=horizontal&size=m&dnt=true']", {style: {"border": " none", " overflow": " hidden", " width": " 110px", " height": " 20px"}})
              ]),
              m("a.w-hidden-small.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href='#']", "< embed >"),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href='#']", [
                m("span.fa.fa-facebook", "."),
                " Compartilhe"
              ]),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href='#']", [
                m("span.fa.fa-twitter", "."),
                " Tweet"
              ]),
              m("a.w-hidden-main.w-hidden-medium.btn.btn-medium[href='#']", [
                m("span.fa.fa-whatsapp", "."),
                " Whatsapp"
              ])
            ]) : ''
          )
        ])
      ]);
    }
  };
}(window.m, window._, window.c.h));

window.c.ProjectMain = (function(m, c, _, h){
  return {
    controller: function(args) {
      var project = args.project,
          generateRoutes = function() {
            var hash = window.location.hash,
                c_opts = {project: project},
                routes = {
                  '#rewards': m('.w-col.w-col-12', m.component(c.ProjectRewardList, c_opts)),
                  '#contributions': m.component(c.ProjectContributions, c_opts),
                  '#about': m.component(c.ProjectAbout, c_opts),
                  '#comments': m.component(c.ProjectComments, c_opts),
                  '#posts': m.component(c.ProjectPosts, c_opts)
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
          m('.w-row', ctrl.generateRoutes())
        ])
      ]);
    }
  };
}(window.m, window.c, window._, window.c.h));

window.c.ProjectPosts = (function(m, models, h, _){
  return {
    controller: function(args) {
      var listVM = m.postgrest.paginationVM(models.projectPostDetail.getPageWithToken),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'});

      filterVM.project_id(args.project.id);

      if (!listVM.collection().length && listVM.firstPage(filterVM.parameters())) {
        listVM.firstPage(filterVM.parameters()).then(null);
      }

      return {
        listVM: listVM,
        filterVM: filterVM
      };
    },
    view: function(ctrl) {
      var list = ctrl.listVM;

      return m('.project-posts.w-section', [
        m('.w-container.u-margintop-20', [
          (_.map(list.collection(), function(post) {
            return m('.w-row', [
              m('.w-col.w-col-1'),
              m('.w-col.w-col-10', [
                m('.post', [
                  m('.u-marginbottom-60', [
                    m('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)),
                    m('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title),
                    (!_.isEmpty(post.comment_html) ? m('.fontsize-base', m.trust(post.comment_html)) : m('.fontsize-base', 'Post exclusivo para apoiadores.'))
                  ]),
                  m('.divider.u-marginbottom-60')
                ])
              ]),
              m('.w-col.w-col-1')
            ]);
          })),
          m('.w-row',[
            m('.w-col.w-col-2.w-col-push-5',[
              !list.isLoading() ?
                m('button#load-more.btn.btn-medium.btn-terciary', {onclick: list.nextPage}, 'Carregar mais') :
                h.loader(),
            ])
          ])
        ]),
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window._));

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
      var filterVM = m.postgrest.filtersVM({project_id: 'eq'}),
          rewardDetails = m.prop([]);

      filterVM.project_id(args.project.id);
      filterVM.order(undefined);

      models.rewardDetail.getPage(filterVM.parameters()).then(rewardDetails);

      return {
        rewardDetails: rewardDetails
      };
    },

    view: function(ctrl, args) {
      //FIXME: MISSING ADJUSTS
      // - add draft admin modifications
      var project = args.project;
      return m('#rewards.u-marginbottom-30', _.map(ctrl.rewardDetails(), function(reward) {
        var contributionUrlWithReward = '/projects/' + project.id + '/contributions/new?reward_id=' + reward.id;

        return m('a[class="' + (h.rewardSouldOut(reward) ? "card-gone" : "card-reward " + (project.open_for_contributions ? 'clickable' : '') ) + ' card card-secondary u-marginbottom-10"][href="' + (project.open_for_contributions ? contributionUrlWithReward : 'js:void(0);') + '"]', [
          m('.u-marginbottom-20', [
            m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'),
            m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoiador', ' apoiadores')),
            (reward.maximum_contributions > 0 ? [
              (reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [
                m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))
              ]) : ''),
              (h.rewardSouldOut(reward) ? m('.u-margintop-10', [
                m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')
              ]) : m('.u-margintop-10', [
                m('span.badge.badge-attention.fontsize-smaller', [
                  m('span.fontweight-bold', 'Limitada'),
                  ' ( ' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'
                ])
              ]))
            ] : ''),
          ]),
          m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(reward.description))),
          (!_.isEmpty(reward.deliver_at) ?
            m('.fontsize-smaller', [
              m('b', 'Estimativa de Entrega: '),
              h.momentify(reward.deliver_at, 'MMM/YYYY')
            ])
           : ''),
          (project.open_for_contributions ?
            m('.project-reward-box-hover', [
              m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')
            ]) : '' )
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

      return m('#project-sidebar.aside', [
        m('.project-stats.mf', [
          m('.w-clearfix.u-marginbottom-20', [
            m('.w-col.w-col-tiny-6.w-col-small-4.fontweight-semibold.u-marginbottom-20', [
              m('.fontsize-largest', 'R$ ' + h.formatNumber(project.pledged)),
              m('.fontsize-smaller.lineheight-tightest', 'atingidos de R$ ' + h.formatNumber(project.goal))
            ]),
            m('.w-col.w-col-tiny-3.w-col-small-4.fontweight-semibold.u-marginbottom-20', [
              m('.fontsize-largest', project.total_contributions),
              m('.fontsize-smaller.lineheight-tightest', 'apoios')
            ]),
            m('.w-col.w-col-tiny-3.w-col-small-4.u-marginbottom-10.fontweight-semibold', [
              m('.fontsize-largest', (project.is_published ? timeObj.total : (project.online_days || 0))),
              m('.fontsize-smaller.lineheight-tightest', [
                m('span[style="text-transform:capitalize;"]', (project.is_published ? timeObj.unit : 'dias')),
                ' restantes'
              ])
            ])
          ]),
          (project.open_for_contributions ? m('a.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar este projeto') : ''),
          (project.open_for_contributions ? m('.u-text-center.u-marginbottom-30', [
            m('a.link-hidden.fontsize-small.fontcolor-secondary.fontweight-semibold[href="js:void(0);"]', [
              m('span.fa.fa-clock-o'),
              '  Lembrar-me'
            ])
          ]) : ''),
          m('div[class="fontsize-smaller u-marginbottom-30 ' + (ctrl.displayCardClass()) + '"]', ctrl.displayStatusText())
        ]),
        m('.user-c', m.component(c.ProjectUserCard, {userId: project.user_id}))
      ]);
    }
  };
}(window.m, window.c.h, window.c));

window.c.ProjectTabs = (function(m, h){
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.w-section.project-nav.mf',[
        m('.w-container', [
          m('.w-row', [
            m('.w-col.w-col-9', [
              //FIXME: need to adjust rewards on mobile
              m('a[class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', 'Recompensas'),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', 'Sobre'),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', [
                'Novidades',
                m('span.badge', project.posts_count)
              ]),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', [
                'Apoios',
                m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)
              ]),
              m('a[class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', [
                'Comentarios',
                m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))
              ]),
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c.h));


window.c.ProjectUserCard = (function(m, _, models, h){
  return {
    controller: function(args) {
      var vm = h.idVM,
          userDetails = m.prop([]);

      vm.id(args.userId);

      models.userDetail.getRowWithToken(vm.parameters()).then(userDetails);

      return {
        userDetails: userDetails
      };
    },
    view: function(ctrl) {
      return m('#user-card', _.map(ctrl.userDetails(), function(userDetail){
        return m('.u-marginbottom-30.u-text-center-small-only', [
          m('.w-row', [
            m('.w-col.w-col-4', [
              m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')
            ]),
            m('.w-col.w-col-8', [
              m('.fontsize-small.link-hidden.fontweight-semibold.lineheight-looser[itemprop="name"]',[
                m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)
              ]),
              m('.fontsize-smallest', [
                h.pluralize(userDetail.total_published_projects, ' criado', ' criados'),
                m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'),
                h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')
              ]),
              m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [
                (!_.isEmpty(userDetail.facebook_link) ? m('li', [
                  m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')
                ]) : ''),
                (!_.isEmpty(userDetail.twitter_username) ? m('li', [
                  m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')
                ]) : ''),
                _.map(userDetail.links, function(link){
                  var parsedLink = h.parseUrl(link);

                  return (!_.isEmpty(parsedLink.hostname) ? m('li', [
                    m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)
                  ]) : '');
                })
              ]),
              (!_.isEmpty(userDetail.email) ? m('a.w-hidden-small.w-hidden-tiny.fontsize-smallest.alt-link.fontweight-semibold[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '')
            ]),
          ]),
        ]);
      }));
    }
  };
}(window.m, window._, window.c.models, window.c.h));


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

      models.projectDetail.getRowWithToken(vm.parameters()).then(projectDetails);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtYWJvdXQuanMiLCJwcm9qZWN0LWNoYXJ0LWNvbnRyaWJ1dGlvbi1hbW91bnQtcGVyLWRheS5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLXRvdGFsLXBlci1kYXkuanMiLCJwcm9qZWN0LWNvbW1lbnRzLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLXBlci1sb2NhdGlvbi10YWJsZS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXRhYnMuanMiLCJwcm9qZWN0LXVzZXItY2FyZC5qcyIsInRlYW0tbWVtYmVycy5qcyIsInRlYW0tdG90YWwuanMiLCJ1c2VyLWNhcmQuanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwicGFnZXMvdGVhbS5qcyIsInByb2plY3QvaW5zaWdodHMuanMiLCJwcm9qZWN0L3Nob3cuanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1saXN0LXZtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgbW9kZWxzOiB7fSxcbiAgICBwYWdlczoge30sXG4gICAgYWRtaW46IHt9LFxuICAgIHByb2plY3Q6IHt9LFxuICAgIGg6IHt9XG4gIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9IChmdW5jdGlvbihtLCBtb21lbnQpe1xuICAvL0RhdGUgSGVscGVyc1xuICB2YXIgbW9tZW50aWZ5ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICB9LFxuXG4gIG1vbWVudEZyb21TdHJpbmcgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIHZhciBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gIH0sXG5cbiAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICB2YXIgcmVtYWluaW5nVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgIGRheXM6ICdkaWFzJyxcbiAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgc2Vjb25kczogJ3NlZ3VuZG9zJ1xuICAgICAgICB9O1xuXG4gICAgcmVtYWluaW5nVGV4dE9iaih7XG4gICAgICB1bml0OiB0cmFuc2xhdGVkVGltZVtwcm9qZWN0LnJlbWFpbmluZ190aW1lLnVuaXQgfHwgJ3NlY29uZHMnXSxcbiAgICAgIHRvdGFsOiBwcm9qZWN0LnJlbWFpbmluZ190aW1lLnRvdGFsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVtYWluaW5nVGV4dE9iajtcbiAgfSxcblxuICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgZ2VuZXJhdGVGb3JtYXROdW1iZXIgPSBmdW5jdGlvbihzLCBjKXtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtYmVyLCBuLCB4KSB7XG4gICAgICBpZiAobnVtYmVyID09PSBudWxsIHx8IG51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgIH07XG4gIH0sXG4gIGZvcm1hdE51bWJlciA9IGdlbmVyYXRlRm9ybWF0TnVtYmVyKCcuJywgJywnKSxcblxuICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICB0b2dnbGVQcm9wID0gZnVuY3Rpb24oZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSl7XG4gICAgdmFyIHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICBwLnRvZ2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcDtcbiAgfSxcblxuICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtpZDogJ2VxJ30pLFxuXG4gIGhhc2hNYXRjaCA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gc3RyO1xuICB9LFxuXG4gIC8vVGVtcGxhdGVzXG4gIGxvYWRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwW3N0eWxlPVwibWFyZ2luLWJvdHRvbTotMTEwcHg7XCJdJywgW1xuICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICBdKTtcbiAgfSxcblxuICBmYlBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyeVBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB3aW5kb3cuRkIuWEZCTUwucGFyc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dCh0cnlQYXJzZSwgNTAwKTsgLy91c2UgdGltZW91dCB0byB3YWl0IGFzeW5jIG9mIGZhY2Vib29rXG4gIH0sXG5cbiAgcGx1cmFsaXplID0gZnVuY3Rpb24oY291bnQsIHMsIHApIHtcbiAgICByZXR1cm4gKGNvdW50ID4gMSA/IGNvdW50ICsgcCA6IGNvdW50ICsgcyk7XG4gIH0sXG5cbiAgc2ltcGxlRm9ybWF0ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcbi9nLCAnPGJyIC8+Jyk7XG4gICAgICBzdHIgPSAnPHA+JyArIHN0ciArICc8L3A+JztcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfSxcblxuICByZXdhcmRTb3VsZE91dCA9IGZ1bmN0aW9uKHJld2FyZCkge1xuICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICB9LFxuXG4gIHJld2FyZFJlbWFuaW5nID0gZnVuY3Rpb24ocmV3YXJkKSB7XG4gICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgfSxcblxuICBwYXJzZVVybCA9IGZ1bmN0aW9uKGhyZWYpIHtcbiAgICB2YXIgbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBsLmhyZWYgPSBocmVmO1xuICAgIHJldHVybiBsO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbW9tZW50aWZ5OiBtb21lbnRpZnksXG4gICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICBmb3JtYXROdW1iZXI6IGZvcm1hdE51bWJlcixcbiAgICBpZFZNOiBpZFZNLFxuICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgbG9hZGVyOiBsb2FkZXIsXG4gICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICBzaW1wbGVGb3JtYXQ6IHNpbXBsZUZvcm1hdCxcbiAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lLFxuICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICByZXdhcmRSZW1hbmluZzogcmV3YXJkUmVtYW5pbmcsXG4gICAgcGFyc2VVcmw6IHBhcnNlVXJsLFxuICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoXG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSl7XG4gIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcblxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICByZXdhcmREZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncmV3YXJkX2RldGFpbHMnKSxcbiAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gIHRlYW1NZW1iZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndGVhbV9tZW1iZXJzJyk7XG5cbiAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gIHJld2FyZERldGFpbC5wYWdlU2l6ZSgyMDApO1xuXG4gIHJldHVybiB7XG4gICAgY29udHJpYnV0aW9uRGV0YWlsOiBjb250cmlidXRpb25EZXRhaWwsXG4gICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICB1c2VyRGV0YWlsOiB1c2VyRGV0YWlsLFxuICAgIHJld2FyZERldGFpbDogcmV3YXJkRGV0YWlsLFxuICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgdGVhbVRvdGFsOiB0ZWFtVG90YWwsXG4gICAgdGVhbU1lbWJlcjogdGVhbU1lbWJlcixcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uLFxuICAgIHByb2plY3RQb3N0RGV0YWlsOiBwcm9qZWN0UG9zdERldGFpbFxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBhY3Rpb25zID0gYXJncy5hY3Rpb25zLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgIF8ubWFwKGFjdGlvbnMsIGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoY1thY3Rpb24uY29tcG9uZW50XSwge2RhdGE6IGFjdGlvbi5kYXRhLCBpdGVtOiBhcmdzLml0ZW19KTtcbiAgICAgICAgICB9KVxuICAgICAgICApLFxuICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJyxbXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uLCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge2NvbnRyaWJ1dGlvbjogaXRlbX0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtjb250cmlidXRpb246IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkZpbHRlciA9IChmdW5jdGlvbihjLCBtLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pO1xuXG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtZmlsdGVyLnctc2VjdGlvbi5wYWdlLWhlYWRlcicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsICdBcG9pb3MnKSxcbiAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgbSgnZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KSkgPyBtLmNvbXBvbmVudChjW21haW4uY29tcG9uZW50XSwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWNvbC53LWNvbC0xMi5mb250c2l6ZS1zbWFsbGVzdC5saW5rLWhpZGRlbi1saWdodFtzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDtcIl1bdHlwZT1cImJ1dHRvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICBuZXdWYWx1ZSA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgdXBkYXRlVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe2NvbnRyaWJ1dGlvbl9pZDogJ2VxJ30pO1xuXG4gICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuICAgICAgdXBkYXRlVk0uY29udHJpYnV0aW9uX2lkKGl0ZW0uY29udHJpYnV0aW9uX2lkKTtcblxuICAgICAgdmFyIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5tb2RlbC5wYXRjaE9wdGlvbnMoaC5pZFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KXtcbiAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICBuZXdWYWx1ZSgnJyk7XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgbDogbCxcbiAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsW1xuICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLFxuICAgICAgICAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtjb25maWc6IGN0cmwudW5sb2FkfSxbXG4gICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7b25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdWYWx1ZSksIHZhbHVlOiBjdHJsLm5ld1ZhbHVlKCl9KSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnQXBvaW8gdHJhbnNmZXJpZG8gY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4gTyBhcG9pbyBuw6NvIGZvaSB0cmFuc2ZlcmlkbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgIF0pXG4gICAgICAgIDogJydcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkl0ZW0gPSAoZnVuY3Rpb24obSwgXywgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG5cbiAgICAgIHZhciBkaXNwbGF5RGV0YWlsQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheURldGFpbEJveDogZGlzcGxheURldGFpbEJveFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLFtcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgXy5tYXAoYXJncy5idWlsZGVyLCBmdW5jdGlvbihkZXNjKXtcbiAgICAgICAgICAgIHJldHVybiBtKGRlc2Mud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbZGVzYy5jb21wb25lbnRdLCB7aXRlbTogaXRlbSwga2V5OiBpdGVtLmtleX0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge29uY2xpY2s6IGN0cmwuZGlzcGxheURldGFpbEJveC50b2dnbGV9KSxcbiAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChjLkFkbWluRGV0YWlsLCB7aXRlbTogaXRlbSwgYWN0aW9uczogYXJncy5hY3Rpb25zLCBrZXk6IGl0ZW0ua2V5fSkgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkxpc3QgPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3Q7XG4gICAgICBpZiAoIWxpc3QuY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0LmZpcnN0UGFnZSkge1xuICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICBhcmdzLnZtLmVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3QsXG4gICAgICAgICAgZXJyb3IgPSBhcmdzLnZtLmVycm9yO1xuICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxcbiAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgIG0oJy5jYXJkLmNhcmQtZXJyb3IudS1yYWRpdXMuZm9udHdlaWdodC1ib2xkJywgZXJyb3IoKSkgOlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsXG4gICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICdCdXNjYW5kbyBhcG9pb3MuLi4nIDpcbiAgICAgICAgICAgICAgICAgICAgICBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgbGlzdC50b3RhbCgpKSwgJyBhcG9pb3MgZW5jb250cmFkb3MnXVxuICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsW1xuICAgICAgICAgICAgICAgIGxpc3QuY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtidWlsZGVyOiBhcmdzLml0ZW1CdWlsZGVyLCBhY3Rpb25zOiBhcmdzLml0ZW1BY3Rpb25zLCBpdGVtOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJyxbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JyxbXG4gICAgICAgICAgICAgICAgICAgICAgICAhbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge29uY2xpY2s6IGxpc3QubmV4dFBhZ2V9LCAnQ2FycmVnYXIgbWFpcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXVxuICAgICAgICAgKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZSxcbiAgICAgICAgICBnZW5lcmF0ZVN0YXR1c1RleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGF0dXNUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgb25saW5lOiB7Y3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLCB0ZXh0OiAnTk8gQVInfSxcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdGSU5BTkNJQURPJ30sXG4gICAgICAgICAgICAgICAgICBmYWlsZWQ6IHtjc3NDbGFzczogJ3RleHQtZXJyb3InLCB0ZXh0OiAnTsODTyBGSU5BTkNJQURPJ30sXG4gICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiB7Y3NzQ2xhc3M6ICd0ZXh0LXdhaXRpbmcnLCB0ZXh0OiAnQUdVQVJEQU5ETyd9LFxuICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IHtjc3NDbGFzczogJ3RleHQtZXJyb3InLCB0ZXh0OiAnUkVDVVNBRE8nfSxcbiAgICAgICAgICAgICAgICAgIGRyYWZ0OiB7Y3NzQ2xhc3M6ICcnLCB0ZXh0OiAnUkFTQ1VOSE8nfSxcbiAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiB7Y3NzQ2xhc3M6ICcnLCB0ZXh0OiAnRU0gQU7DgUxJU0UnfSxcbiAgICAgICAgICAgICAgICAgIGFwcHJvdmVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLCB0ZXh0OiAnQVBST1ZBRE8nfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXR1c1RleHRPYmooc3RhdHVzVGV4dFtwcm9qZWN0LnN0YXRlXSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0dXNUZXh0T2JqO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJlbWFpbmluZ1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaih7XG4gICAgICAgICAgICAgIHVuaXQ6IHRyYW5zbGF0ZWRUaW1lW3Byb2plY3QucmVtYWluaW5nX3RpbWUudW5pdCB8fCAnc2Vjb25kcyddLFxuICAgICAgICAgICAgICB0b3RhbDogcHJvamVjdC5yZW1haW5pbmdfdGltZS50b3RhbFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW1haW5pbmdUZXh0T2JqO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgIHN0YXR1c1RleHRPYmo6IGdlbmVyYXRlU3RhdHVzVGV4dCgpLFxuICAgICAgICByZW1haW5pbmdUZXh0T2JqOiBnZW5lcmF0ZVJlbWFpbmdUaW1lKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gY3RybC5wcm9qZWN0LFxuICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgIHN0YXR1c1RleHRPYmogPSBjdHJsLnN0YXR1c1RleHRPYmooKSxcbiAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gY3RybC5yZW1haW5pbmdUZXh0T2JqKCk7XG5cbiAgICAgIHJldHVybiBtKCcucHJvamVjdC1kZXRhaWxzLWNhcmQuY2FyZC51LXJhZGl1cy5jYXJkLXRlcmNpYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnU3RhdHVzOicpLCfCoCcsbSgnc3BhbicsIHtjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc30sIHN0YXR1c1RleHRPYmoudGV4dCksJ8KgJ1xuICAgICAgICAgIF0pLFxuICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLm1ldGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7c3R5bGU6IHt3aWR0aDogKHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpICsgJyUnfX0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9ncmVzcyArICclJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdmaW5hbmNpYWRvJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQsIDIpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2xldmFudGFkb3MnKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHJlbWFpbmluZ1RleHRPYmoudG90YWwpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCByZW1haW5pbmdUZXh0T2JqLnVuaXQgKyAnIHJlc3RhbnRlcycpXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSgpKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuXG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24gPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGV4cGxhbmF0aW9uID0gZnVuY3Rpb24ocmVzb3VyY2UpIHtcbiAgICAgICAgdmFyIHN0YXRlVGV4dCA9IHtcbiAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAnVm9jw6ogcG9kZSByZWNlYmVyIGFwb2lvcyBhdMOpIDIzaHM1OW1pbjU5cyBkbyBkaWEgJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnLiBMZW1icmUtc2UsIMOpIHR1ZG8tb3UtbmFkYSBlIHZvY8OqIHPDsyBsZXZhcsOhIG9zIHJlY3Vyc29zIGNhcHRhZG9zIHNlIGJhdGVyIGEgbWV0YSBkZW50cm8gZGVzc2UgcHJhem8uJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbWVtb3JlIHF1ZSB2b2PDqiBtZXJlY2UhJyksXG4gICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBiZW0gc3VjZWRpZG8gZSBhZ29yYSDDqSBhIGhvcmEgZGUgaW5pY2lhciBvIHRyYWJhbGhvIGRlIHJlbGFjaW9uYW1lbnRvIGNvbSBzZXVzIGFwb2lhZG9yZXMhICcsXG4gICAgICAgICAgICAnQXRlbsOnw6NvIGVzcGVjaWFsIMOgIGVudHJlZ2EgZGUgcmVjb21wZW5zYXMuIFByb21ldGV1PyBFbnRyZWd1ZSEgTsOjbyBkZWl4ZSBkZSBvbGhhciBhIHNlw6fDo28gZGUgcMOzcy1wcm9qZXRvIGRvICcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ0d1aWEgZG9zIFJlYWxpemFkb3JlcycpLFxuICAgICAgICAgICAgJ8KgZSBkZSBpbmZvcm1hci1zZSBzb2JyZcKgJyxtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBlc3RhbW9zIHByb2Nlc3NhbmRvIG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MhJyksXG4gICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBmaW5hbGl6YWRvIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJyBlIGVzdMOhIGFndWFyZGFuZG8gY29uZmlybWHDp8OjbyBkZSBib2xldG9zIGUgcGFnYW1lbnRvcy4gJyxcbiAgICAgICAgICAgICdEZXZpZG8gw6AgZGF0YSBkZSB2ZW5jaW1lbnRvIGRlIGJvbGV0b3MsIHByb2pldG9zIHF1ZSB0aXZlcmFtIGFwb2lvcyBkZSDDumx0aW1hIGhvcmEgZmljYW0gcG9yIGF0w6kgNCBkaWFzIMO6dGVpcyBuZXNzZSBzdGF0dXMsIGNvbnRhZG9zIGEgcGFydGlyIGRhIGRhdGEgZGUgZmluYWxpemHDp8OjbyBkbyBwcm9qZXRvLsKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIG8gcmVwYXNzZSBkZSBkaW5oZWlybyDDqSBmZWl0byBwYXJhIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIGZhaWxlZDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgbsOjbyBkZXNhbmltZSEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gbsOjbyBiYXRldSBhIG1ldGEgZSBzYWJlbW9zIHF1ZSBpc3NvIG7Do28gw6kgYSBtZWxob3IgZGFzIHNlbnNhw6fDtWVzLiBNYXMgbsOjbyBkZXNhbmltZS4gJyxcbiAgICAgICAgICAgICdFbmNhcmUgbyBwcm9jZXNzbyBjb21vIHVtIGFwcmVuZGl6YWRvIGUgbsOjbyBkZWl4ZSBkZSBjb2dpdGFyIHVtYSBzZWd1bmRhIHRlbnRhdGl2YS4gTsOjbyBzZSBwcmVvY3VwZSwgdG9kb3Mgb3Mgc2V1cyBhcG9pYWRvcmVzIHJlY2ViZXLDo28gbyBkaW5oZWlybyBkZSB2b2x0YS7CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM2NTUwNy1SZWdyYXMtZS1mdW5jaW9uYW1lbnRvLWRvcy1yZWVtYm9sc29zLWVzdG9ybm9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gZmF6ZW1vcyBlc3Rvcm5vcyBlIHJlZW1ib2xzb3MuJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHJlamVjdGVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBpbmZlbGl6bWVudGUgbsOjbyBmb2kgZGVzdGEgdmV6LicpLFxuICAgICAgICAgICAgJyBWb2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBkbyBDYXRhcnNlIGUgZW50ZW5kZW1vcyBxdWUgZWxlIG7Do28gZXN0w6EgZGUgYWNvcmRvIGNvbSBvIHBlcmZpbCBkbyBzaXRlLiAnLFxuICAgICAgICAgICAgJ1RlciB1bSBwcm9qZXRvIHJlY3VzYWRvIG7Do28gaW1wZWRlIHF1ZSB2b2PDqiBlbnZpZSBub3ZvcyBwcm9qZXRvcyBwYXJhIGF2YWxpYcOnw6NvIG91IHJlZm9ybXVsZSBzZXUgcHJvamV0byBhdHVhbC4gJyxcbiAgICAgICAgICAgICdDb252ZXJzZSBjb20gbm9zc28gYXRlbmRpbWVudG8hIFJlY29tZW5kYW1vcyBxdWUgdm9jw6ogZMOqIHVtYSBib2Egb2xoYWRhIG5vc8KgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzg3NjM4LURpcmV0cml6ZXMtcGFyYS1jcmlhJUMzJUE3JUMzJUEzby1kZS1wcm9qZXRvc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY3JpdMOpcmlvcyBkYSBwbGF0YWZvcm1hJyksXG4gICAgICAgICAgICAnwqBlIG5vwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdndWlhIGRvcyByZWFsaXphZG9yZXMnKSwnLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGRyYWZ0OiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb25zdHJ1YSBvIHNldSBwcm9qZXRvIScpLFxuICAgICAgICAgICAgJ8KgUXVhbnRvIG1haXMgY3VpZGFkb3NvIGUgYmVtIGZvcm1hdGFkbyBmb3IgdW0gcHJvamV0bywgbWFpb3JlcyBhcyBjaGFuY2VzIGRlIGVsZSBzZXIgYmVtIHN1Y2VkaWRvIG5hIHN1YSBjYW1wYW5oYSBkZSBjYXB0YcOnw6NvLiAnLFxuICAgICAgICAgICAgJ0FudGVzIGRlIGVudmlhciBzZXUgcHJvamV0byBwYXJhIGEgbm9zc2EgYW7DoWxpc2UsIHByZWVuY2hhIHRvZGFzIGFzIGFiYXMgYW8gbGFkbyBjb20gY2FyaW5oby4gVm9jw6ogcG9kZSBzYWx2YXIgYXMgYWx0ZXJhw6fDtWVzIGUgdm9sdGFyIGFvIHJhc2N1bmhvIGRlIHByb2pldG8gcXVhbnRhcyB2ZXplcyBxdWlzZXIuICcsXG4gICAgICAgICAgICAnUXVhbmRvIHR1ZG8gZXN0aXZlciBwcm9udG8sIGNsaXF1ZSBubyBib3TDo28gRU5WSUFSIGUgZW50cmFyZW1vcyBlbSBjb250YXRvIHBhcmEgYXZhbGlhciBvIHNldSBwcm9qZXRvLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGluX2FuYWx5c2lzOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCB2b2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuc2VudF90b19hbmFseXNpc19hdCkgKyAnIGUgcmVjZWJlcsOhIG5vc3NhIGF2YWxpYcOnw6NvIGVtIGF0w6kgNCBkaWFzIMO6dGVpcyBhcMOzcyBvIGVudmlvIScpLFxuICAgICAgICAgICAgJ8KgRW5xdWFudG8gZXNwZXJhIGEgc3VhIHJlc3Bvc3RhLCB2b2PDqiBwb2RlIGNvbnRpbnVhciBlZGl0YW5kbyBvIHNldSBwcm9qZXRvLiAnLFxuICAgICAgICAgICAgJ1JlY29tZW5kYW1vcyB0YW1iw6ltIHF1ZSB2b2PDqiB2w6EgY29sZXRhbmRvIGZlZWRiYWNrIGNvbSBhcyBwZXNzb2FzIHByw7N4aW1hcyBlIHBsYW5lamFuZG8gY29tbyBzZXLDoSBhIHN1YSBjYW1wYW5oYS4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgc2V1IHByb2pldG8gZm9pIGFwcm92YWRvIScpLFxuICAgICAgICAgICAgJ8KgUGFyYSBjb2xvY2FyIG8gc2V1IHByb2pldG8gbm8gYXIgw6kgcHJlY2lzbyBhcGVuYXMgcXVlIHZvY8OqIHByZWVuY2hhIG9zIGRhZG9zIG5lY2Vzc8OhcmlvcyBuYSBhYmHCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIjdXNlcl9zZXR0aW5nc1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgJy4gw4kgaW1wb3J0YW50ZSBzYWJlciBxdWUgY29icmFtb3MgYSB0YXhhIGRlIDEzJSBkbyB2YWxvciB0b3RhbCBhcnJlY2FkYWRvIGFwZW5hcyBwb3IgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4gRW50ZW5kYcKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBmYXplbW9zIG8gcmVwYXNzZSBkbyBkaW5oZWlyby4nKVxuICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBleHBsYW5hdGlvbjogZXhwbGFuYXRpb24oYXJncy5yZXNvdXJjZSlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3QgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXByb2plY3QnLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsW1xuICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz0nICsgcHJvamVjdC5wcm9qZWN0X2ltZyArICddW3dpZHRoPTUwXScpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JyxbXG4gICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QucHJvamVjdF9zdGF0ZSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3Rfb25saW5lX2RhdGUpICsgJyBhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3RfZXhwaXJlc19hdCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJld2FyZCA9IChmdW5jdGlvbihtLCBoLCBfKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcmV3YXJkID0gYXJncy5jb250cmlidXRpb24ucmV3YXJkIHx8IHt9LFxuICAgICAgICAgIGF2YWlsYWJsZSA9IHBhcnNlSW50KHJld2FyZC5wYWlkX2NvdW50KSArIHBhcnNlSW50KHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21wZW5zYScpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCAoXy5pc0VtcHR5KHJld2FyZCkpID8gJ0Fwb2lvIHNlbSByZWNvbXBlbnNhLicgOiBbXG4gICAgICAgICAgICAnSUQ6ICcgKyByZXdhcmQuaWQsXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ1ZhbG9yIG3DrW5pbW86IFIkJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICBtLnRydXN0KCdEaXNwb27DrXZlaXM6ICcgKyBhdmFpbGFibGUgKyAnIC8gJyArIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIHx8ICcmaW5maW47JykpLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICdBZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo286ICcgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICdEZXNjcmnDp8OjbzogJyArIHJld2FyZC5kZXNjcmlwdGlvblxuICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5ID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbixcbiAgICAgICAgICBtYXBFdmVudHMgPSBfLnJlZHVjZShbXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucGFpZF9hdCwgbmFtZTogJ0Fwb2lvIGNvbmZpcm1hZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5wZW5kaW5nX3JlZnVuZF9hdCwgbmFtZTogJ1JlZW1ib2xzbyBzb2xpY2l0YWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucmVmdW5kZWRfYXQsIG5hbWU6ICdFc3Rvcm5vIHJlYWxpemFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsIG5hbWU6ICdBcG9pbyBjcmlhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1c2VkX2F0LCBuYW1lOiAnQXBvaW8gY2FuY2VsYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uZGVsZXRlZF9hdCwgbmFtZTogJ0Fwb2lvIGV4Y2x1w61kbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLmNoYXJnZWJhY2tfYXQsIG5hbWU6ICdDaGFyZ2ViYWNrJ30sXG4gICAgICBdLCBmdW5jdGlvbihtZW1vLCBpdGVtKXtcbiAgICAgICAgaWYgKGl0ZW0uZGF0ZSAhPT0gbnVsbCAmJiBpdGVtLmRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGl0ZW0ub3JpZ2luYWxEYXRlID0gaXRlbS5kYXRlO1xuICAgICAgICAgIGl0ZW0uZGF0ZSA9IGgubW9tZW50aWZ5KGl0ZW0uZGF0ZSwgJ0REL01NL1lZWVksIEhIOm1tJyk7XG4gICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICB9LCBbXSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9yZGVyZWRFdmVudHM6IF8uc29ydEJ5KG1hcEV2ZW50cywgJ29yaWdpbmFsRGF0ZScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkYSB0cmFuc2HDp8OjbycpLFxuICAgICAgICBjdHJsLm9yZGVyZWRFdmVudHMubWFwKGZ1bmN0aW9uKGNFdmVudCkge1xuICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBjRXZlbnQuZGF0ZSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLFtcbiAgICAgICAgICAgICAgbSgnZGl2JywgY0V2ZW50Lm5hbWUpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb24gPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uO1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0RldGFsaGVzIGRvIGFwb2lvJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsW1xuICAgICAgICAgICdWYWxvcjogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdUYXhhOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24uZ2F0ZXdheV9mZWUsIDIsIDMpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0FndWFyZGFuZG8gQ29uZmlybWHDp8OjbzogJyArIChjb250cmlidXRpb24ud2FpdGluZ19wYXltZW50ID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0Fuw7RuaW1vOiAnICsgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnSWQgcGFnYW1lbnRvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQXBvaW86ICcgKyBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2lkLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0NoYXZlOsKgXFxuJyxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgIGNvbnRyaWJ1dGlvbi5rZXksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnTWVpbzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5LFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ09wZXJhZG9yYTogJyArIChjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhICYmIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEuYWNxdWlyZXJfbmFtZSksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjb250cmlidXRpb24uaXNfc2Vjb25kX3NsaXApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFttKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgJ0JvbGV0byBiYW5jw6FyaW8nKSwgJyAnLCBtKCdzcGFuLmJhZGdlJywgJzJhIHZpYScpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCkpLFxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VyID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciB1c2VyID0gYXJncy5pdGVtO1xuICAgICAgdmFyIHVzZXJQcm9maWxlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHVzZXIudXNlcl9wcm9maWxlX2ltZyB8fCAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZyc7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi11c2VyJyxbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLFtcbiAgICAgICAgICBtKCdpbWcudXNlci1hdmF0YXJbc3JjPVwiJyArIHVzZXJQcm9maWxlKCkgKyAnXCJdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLFtcbiAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvdXNlcnMvJyArIHVzZXIudXNlcl9pZCArICcvZWRpdFwiXScsIHVzZXIudXNlcl9uYW1lKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdVc3XDoXJpbzogJyArIHVzZXIudXNlcl9pZCksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQ2F0YXJzZTogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0dhdGV3YXk6ICcgKyB1c2VyLnBheWVyX2VtYWlsKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRGF0ZVJhbmdlID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlckRyb3Bkb3duID0gKGZ1bmN0aW9uKG0sIF8pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywge1xuICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLFxuICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgfSxbXG4gICAgICAgICAgXy5tYXAoYXJncy5vcHRpb25zLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHJldHVybiBtKCdvcHRpb25bdmFsdWU9XCInICsgZGF0YS52YWx1ZSArICdcIl0nLCBkYXRhLm9wdGlvbik7XG4gICAgICAgICAgfSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJNYWluID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZS5tZWRpdW1bcGxhY2Vob2xkZXI9XCInICsgYXJncy5wbGFjZWhvbGRlciArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7b25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksIHZhbHVlOiBhcmdzLnZtKCl9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgbSgnaW5wdXQjZmlsdGVyLWJ0bi5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCJCdXNjYXJcIl0nKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyTnVtYmVyUmFuZ2UgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtLCBjYXJkID0gbnVsbCxcbiAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCwgcGF5bWVudE1ldGhvZENsYXNzLCBzdGF0ZUNsYXNzO1xuXG4gICAgICBjYXJkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHBheW1lbnQuZ2F0ZXdheV9kYXRhKXtcbiAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICAgIGNhc2UgJ21vaXAnOlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogIHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19maW5hbCxcbiAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JhbmRlaXJhXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdwYWdhcm1lJzpcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfZmlyc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2xhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICByZXR1cm4gbSgnc3BhbiNib2xldG8tZGV0YWlsJywgJycpO1xuICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBjYXJkKCk7XG4gICAgICAgICAgICBpZiAoY2FyZERhdGEpe1xuICAgICAgICAgICAgICByZXR1cm4gbSgnI2NyZWRpdGNhcmQtZGV0YWlsLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgY2FyZERhdGEuYnJhbmQgKyAnICcgKyBwYXltZW50Lmluc3RhbGxtZW50cyArICd4J1xuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLWJhcmNvZGUnO1xuICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLXF1ZXN0aW9uJztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSl7XG4gICAgICAgICAgY2FzZSAncGFpZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXN1Y2Nlc3MnO1xuICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgIGNhc2UgJ3BlbmRpbmdfcmVmdW5kJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtd2FpdGluZyc7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZDogZGlzcGxheVBheW1lbnRNZXRob2QsXG4gICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICBzdGF0ZUNsYXNzOiBzdGF0ZUNsYXNzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5wYXltZW50LXN0YXR1cycsIFtcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLFtcbiAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsW1xuICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgIGN0cmwuZGlzcGxheVBheW1lbnRNZXRob2QoKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWFib3V0JywgW1xuICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgIG0oJ3N0cm9uZycsICdPIHByb2pldG8nKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZVtpdGVtcHJvcD1cImFib3V0XCJdJywgbS50cnVzdChwcm9qZWN0LmFib3V0X2h0bWwpKSxcbiAgICAgICAgICBtKCdwLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnT3LDp2FtZW50bycpLFxuICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocHJvamVjdC5idWRnZXQpKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIFtcbiAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnUmVjb21wZW5zYXMnKSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7cHJvamVjdDogcHJvamVjdH0pLFxuICAgICAgICAgIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/XG4gICAgICAgICAgICBtKCcuZnVuZGluZy1wZXJpb2QnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHByb2plY3Qub25saW5lX2RhdGUpLCAnIC0gJywgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCAnICgnICsgcHJvamVjdC5vbmxpbmVfZGF5cyArICcgZGlhcykgJ1xuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgOiAnJylcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgZGF0YTogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7cmV0dXJuIGl0ZW0udG90YWxfYW1vdW50O30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScpLFxuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTInLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsO30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge2NvbmZpZzogY3RybC5yZW5kZXJDaGFydH0pXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29tbWVudHMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnLmZiLWNvbW1lbnRzW2RhdGEtaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2RhdGEtbnVtLXBvc3RzPTUwXVtkYXRhLXdpZHRoPVwiNjEwXCJdJyk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gKGZ1bmN0aW9uKG0sIG1vZGVscywgaCwgXykge1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhclx0dm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgIGdlbmVyYXRlU29ydCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBjb250cmlidXRpb25zUGVyTG9jYXRpb24oKSxcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29sbGVjdGlvblswXSxcbiAgICAgICAgICAgICAgICAgIG9yZGVyZWRTb3VyY2UgPSBfLnNvcnRCeShyZXNvdXJjZS5zb3VyY2UsIGZpZWxkKTtcblxuICAgICAgICAgICAgICBpZiAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLm9yZGVyRmlsdGVyID0gJ0RFU0MnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSAnREVTQycpIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gb3JkZXJlZFNvdXJjZS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXNvdXJjZS5zb3VyY2UgPSBvcmRlcmVkU291cmNlO1xuICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9IChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnID8gJ0FTQycgOiAnREVTQycpO1xuICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24oY29sbGVjdGlvbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yZXNvdXJjZUlkKTtcblxuICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24uZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGRhdGEpO1xuICAgICAgICBnZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJykoKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb246IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgZ2VuZXJhdGVTb3J0OiBnZW5lcmF0ZVNvcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnTG9jYWxpemHDp8OjbyBnZW9ncsOhZmljYSBkb3MgYXBvaW9zJyksXG4gICAgICAgIGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkubWFwKGZ1bmN0aW9uKGNvbnRyaWJ1dGlvbkxvY2F0aW9uKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgJ0VzdGFkbycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGlvbnMnKX0sIFtcbiAgICAgICAgICAgICAgICAgICdBcG9pb3PCoMKgJyxtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnUiQgYXBvaWFkb3MgJyxcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsJyglIGRvIHRvdGFsKcKgJyksXG4gICAgICAgICAgICAgICAgICAnICcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudGFibGUtaW5uZXIuZm9udHNpemUtc21hbGwnLCBbXG4gICAgICAgICAgICAgIF8ubWFwKGNvbnRyaWJ1dGlvbkxvY2F0aW9uLnNvdXJjZSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy50YWJsZS1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS5zdGF0ZV9hY3JvbnltKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyxcbiAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihzb3VyY2UudG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICfCoMKgKCcgKyBzb3VyY2UudG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgbW9kZWxzLCBoLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uLmdldFBhZ2VXaXRoVG9rZW4pLFxuICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnLCB3YWl0aW5nX3BheW1lbnQ6ICdlcSd9KSxcbiAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbih3YWl0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAvL0ZJWE1FOiBuZWVkIHRvIGZpbmQgYSB3YXkgdG8gcGFzcyBmYWxzZSBmaWx0ZXJcbiAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcblxuICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpO1xuXG4gICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKSkge1xuICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsKTtcbiAgICAgIH1cblxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBnZW5lcmF0ZVNvcnQ6IGdlbmVyYXRlU29ydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gY3RybC5saXN0Vk07XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3RfY29udHJpYnV0aW9ucy5jb250ZW50LnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAoYXJncy5wcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTFcIiwgW1xuICAgICAgICAgICAgICBtKCdpbnB1dFtjaGVja2VkPVwiY2hlY2tlZFwiXVtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt0eXBlPVwicmFkaW9cIl1bdmFsdWU9XCJhdmFpbGFibGVfdG9fY291bnRcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoZmFsc2UpfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl0nLCAnQ29uZmlybWFkb3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgbSgnaW5wdXRbaWQ9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl1bdHlwZT1cInJhZGlvXCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdmFsdWU9XCJ3YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsIHtvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydCh0cnVlKX0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtNVwiLCBbXG4gICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsICdQZW5kZW50ZXMnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICAgOiAnJyksXG4gICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMnLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy50aHVtYi51LWxlZnQudS1yb3VuZFtzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgKCFfLmlzRW1wdHkoY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCkgPyBjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsIDogJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnKSArICcpOyBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47XCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLWRhcmtbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLnVzZXJfbmFtZSksXG4gICAgICAgICAgICAgICAgICAoY29udHJpYnV0aW9uLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgIChjb250cmlidXRpb24uYW5vbnltb3VzID8gW20udHJ1c3QoJyZuYnNwOy0mbmJzcDsnKSwgbSgnc3Ryb25nJywgJ0Fwb2lhZG9yIGFuw7RuaW1vJyldIDogJycpXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSwgaDptbScpICsgJ2gnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICBdKTtcbiAgICAgIH0pKSxcbiAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLFtcbiAgICAgICAgICAhbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcblxuIiwid2luZG93LmMuUHJvamVjdEhlYWRlciA9IChmdW5jdGlvbihtLCBjKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXInLCBbXG4gICAgICAgIG0oJy53LXNlY3Rpb24ucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXIuZm9udHdlaWdodC1zZW1pYm9sZC5wcm9qZWN0LW5hbWVbaXRlbXByb3A9XCJuYW1lXCJdJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICdwb3IgJyxcbiAgICAgICAgICAgICAgcHJvamVjdC51c2VyLm5hbWVcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LXNlY3Rpb24ucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnByb2plY3QtaGlnaGxpZ2h0JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGlnaGxpZ2h0LCB7cHJvamVjdDogcHJvamVjdH0pKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7cHJvamVjdDogcHJvamVjdH0pKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RIaWdobGlnaHQgPSAoZnVuY3Rpb24obSwgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGlzcGxheVNoYXJlQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVNoYXJlQm94OiBkaXNwbGF5U2hhcmVCb3hcbiAgICAgIH07XG4gICAgfSxcbiAgICAvL0ZJWE1FOiBBZGQgaW1nIHdoZW4gdmlkZW8gaXMgbm90IHByZXNlbnRcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oaWdobGlnaHQnLCBbXG4gICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlby5tZicsIFtcbiAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIiAnICsgcHJvamVjdC52aWRlb19lbWJlZF91cmwgKyAnXCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVthbGxvd0Z1bGxTY3JlZW5dJylcbiAgICAgICAgXSkgOiBtKCdzcGFuLm5vLXZpZGVvJykpLFxuICAgICAgICBtKCcucHJvamVjdC1ibHVyYicsIHByb2plY3QuaGVhZGxpbmUpLFxuICAgICAgICBtKCcudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICghXy5pc0VtcHR5KHByb2plY3QuYWRkcmVzcykgP1xuICAgICAgICAgICAgbSgnYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCJqczp2b2lkKDApO1wiXScsIFtcbiAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1tYXAtbWFya2VyJyksICcgJyArIHByb2plY3QuYWRkcmVzcy5jaXR5ICsgJywgJyArIHByb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltXG4gICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgKSxcbiAgICAgICAgICBtKCdhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHRbaHJlZj1cIi9leHBsb3JlL2J5X2NhdGVnb3J5X2lkLyNcIicgKyBwcm9qZWN0LmNhdGVnb3J5X2lkICsgJ10nLCBbXG4gICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXRhZycpLCAnICcsXG4gICAgICAgICAgICBwcm9qZWN0LmNhdGVnb3J5X25hbWVcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmVbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZGlzcGxheVNoYXJlQm94LnRvZ2dsZX0sICdDb21wYXJ0aWxoYXInKSxcbiAgICAgICAgICAoY3RybC5kaXNwbGF5U2hhcmVCb3goKSA/XG4gICAgICAgICAgICBtKFwiLnBvcC1zaGFyZVwiLCBbXG4gICAgICAgICAgICAgIG0oXCIudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0udy1jbGVhcmZpeFwiLCBbXG4gICAgICAgICAgICAgICAgbShcImEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZS51LXJpZ2h0W2hyZWY9J2pzOnZvaWQoMCk7J11cIiwgXCJGZWNoYXJcIiksXG4gICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwXCIsIFwiQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvXCIpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKFwiLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2tcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCJpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9J3RydWUnXVtmcmFtZWJvcmRlcj0nMCddW3Njcm9sbGluZz0nbm8nXVtzcmM9Jy8vd3d3LmZhY2Vib29rLmNvbS9wbHVnaW5zL2xpa2UucGhwP2hyZWY9aHR0cHMlM0ElMkYlMkZmYWNlYm9vay5jb20lMkZ3ZWJmbG93JmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPWVuX1VTJmFjdGlvbj1saWtlJnNob3dfZmFjZXM9ZmFsc2Umc2hhcmU9ZmFsc2UnXVwiLCB7c3R5bGU6IHtcImJvcmRlclwiOiBcIiBub25lXCIsIFwiIG92ZXJmbG93XCI6IFwiIGhpZGRlblwiLCBcIiB3aWR0aFwiOiBcIiA5MHB4XCIsIFwiIGhlaWdodFwiOiBcIiAyMHB4XCJ9fSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oXCIudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrXCIsIFtcbiAgICAgICAgICAgICAgICBtKFwiaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PSd0cnVlJ11bZnJhbWVib3JkZXI9JzAnXVtzY3JvbGxpbmc9J25vJ11bc3JjPScvL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMvdHdlZXRfYnV0dG9uLmh0bWwjdXJsPWh0dHAlM0ElMkYlMkZ3ZWJmbG93LmNvbSZjb3VudHVybD13ZWJmbG93LmNvbSZ0ZXh0PUNoZWNrJTIwb3V0JTIwdGhpcyUyMHNpdGUmY291bnQ9aG9yaXpvbnRhbCZzaXplPW0mZG50PXRydWUnXVwiLCB7c3R5bGU6IHtcImJvcmRlclwiOiBcIiBub25lXCIsIFwiIG92ZXJmbG93XCI6IFwiIGhpZGRlblwiLCBcIiB3aWR0aFwiOiBcIiAxMTBweFwiLCBcIiBoZWlnaHRcIjogXCIgMjBweFwifX0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKFwiYS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj0nIyddXCIsIFwiPCBlbWJlZCA+XCIpLFxuICAgICAgICAgICAgICBtKFwiYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj0nIyddXCIsIFtcbiAgICAgICAgICAgICAgICBtKFwic3Bhbi5mYS5mYS1mYWNlYm9va1wiLCBcIi5cIiksXG4gICAgICAgICAgICAgICAgXCIgQ29tcGFydGlsaGVcIlxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbShcImEudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLXR3ZWV0LnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9JyMnXVwiLCBbXG4gICAgICAgICAgICAgICAgbShcInNwYW4uZmEuZmEtdHdpdHRlclwiLCBcIi5cIiksXG4gICAgICAgICAgICAgICAgXCIgVHdlZXRcIlxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbShcImEudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW1baHJlZj0nIyddXCIsIFtcbiAgICAgICAgICAgICAgICBtKFwic3Bhbi5mYS5mYS13aGF0c2FwcFwiLCBcIi5cIiksXG4gICAgICAgICAgICAgICAgXCIgV2hhdHNhcHBcIlxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9IChmdW5jdGlvbihtLCBjLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBnZW5lcmF0ZVJvdXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCxcbiAgICAgICAgICAgICAgICBjX29wdHMgPSB7cHJvamVjdDogcHJvamVjdH0sXG4gICAgICAgICAgICAgICAgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgY19vcHRzKSksXG4gICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNjb21tZW50cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbW1lbnRzLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1snI2Fib3V0J107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaGFzaF07XG4gICAgICAgICAgfTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBtLnJlZHJhdywgZmFsc2UpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBnZW5lcmF0ZVJvdXRlczogZ2VuZXJhdGVSb3V0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmdlbmVyYXRlUm91dGVzKCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RQb3N0RGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pLFxuICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSk7XG5cbiAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkpIHtcbiAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgbGlzdCA9IGN0cmwubGlzdFZNO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgKF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCBmdW5jdGlvbihwb3N0KSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBvc3QnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSkpLFxuICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JyxbXG4gICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG4gICAgICBmaWx0ZXJWTS5vcmRlcih1bmRlZmluZWQpO1xuXG4gICAgICBtb2RlbHMucmV3YXJkRGV0YWlsLmdldFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAvL0ZJWE1FOiBNSVNTSU5HIEFESlVTVFNcbiAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNyZXdhcmRzLnUtbWFyZ2luYm90dG9tLTMwJywgXy5tYXAoY3RybC5yZXdhcmREZXRhaWxzKCksIGZ1bmN0aW9uKHJld2FyZCkge1xuICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBcImNhcmQtZ29uZVwiIDogXCJjYXJkLXJld2FyZCBcIiArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSApICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pYWRvcicsICcgYXBvaWFkb3JlcycpKSxcbiAgICAgICAgICAgIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAnICggJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgOiAnJyksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/XG4gICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKSA6ICcnIClcbiAgICAgICAgXSk7XG4gICAgICB9KSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgZGlzcGxheUNhcmRDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnY2FyZC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIChzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gPyAnY2FyZCB1LXJhZGl1cyB6aW5kZXgtMTAgJyArIHN0YXRlc1twcm9qZWN0LnN0YXRlXSA6ICcnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnRXNzZSBwcm9qZXRvIGrDoSBmb2kgYXByb3ZhZG8gcGVsbyBDYXRhcnNlLiBFbSBicmV2ZSBlbGUgZW50cmFyw6Egbm8gYXIgZSBlc3RhcsOhIHByb250byBwYXJhIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICdvbmxpbmUnOiAnVm9jw6ogcG9kZSBhcG9pYXIgZXN0ZSBwcm9qZXRvIGF0w6kgbyBkaWEgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgw6BzIDIzaDU5bTU5cycsXG4gICAgICAgICAgICAgICdmYWlsZWQnOiAnRXN0ZSBwcm9qZXRvIG7Do28gYXRpbmdpdSBvIG3DrW5pbW8gZGUgUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkgKyAnIGF0w6kgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgZSBuw6NvIGZvaSBmaW5hbmNpYWRvJyxcbiAgICAgICAgICAgICAgJ3JlamVjdGVkJzogJ0VzdGUgcHJvamV0byBuw6NvIGZvaSBhY2VpdG8uIE7Do28gw6kgcG9zc8OtdmVsIHJlYWxpemFyIHVtIGFwb2lvLicsXG4gICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdFc3RlIHByb2pldG8gZXN0w6EgZW0gYW7DoWxpc2UgZSBhaW5kYSBuw6NvIGVzdMOhIGFiZXJ0byBwYXJhIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ0VzdGUgcHJvamV0byBmb2kgYmVtLXN1Y2VkaWRvIGUgZm9pIGZpbmFuY2lhZG8gZW0gJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSxcbiAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnTyBwcmF6byBkZSBjYXB0YcOnw6NvIGRlc3NlIHByb2pldG8gZXN0w6EgZW5jZXJyYWRvLiBFc3RhbW9zIGFndWFyZGFuZG8gYSBjb25maXJtYcOnw6NvIGRvcyDDumx0aW1vcyBwYWdhbWVudG9zLicsXG4gICAgICAgICAgICAgICdkcmFmdCc6ICdFc3RlIHByb2pldG8gw6kgYXBlbmFzIHVtIHJhc2N1bmhvIGUgYWluZGEgbsOjbyBwb2RlIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlDYXJkQ2xhc3M6IGRpc3BsYXlDYXJkQ2xhc3MsXG4gICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0OiBkaXNwbGF5U3RhdHVzVGV4dFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgdGltZU9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpO1xuXG4gICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMubWYnLCBbXG4gICAgICAgICAgbSgnLnctY2xlYXJmaXgudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS02LnctY29sLXNtYWxsLTQuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCkpLFxuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ2F0aW5naWRvcyBkZSBSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5nb2FsKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLXRpbnktMy53LWNvbC1zbWFsbC00LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsICdhcG9pb3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS0zLnctY29sLXNtYWxsLTQudS1tYXJnaW5ib3R0b20tMTAuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyB0aW1lT2JqLnRvdGFsIDogKHByb2plY3Qub25saW5lX2RheXMgfHwgMCkpKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsIFtcbiAgICAgICAgICAgICAgICBtKCdzcGFuW3N0eWxlPVwidGV4dC10cmFuc2Zvcm06Y2FwaXRhbGl6ZTtcIl0nLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyB0aW1lT2JqLnVuaXQgOiAnZGlhcycpKSxcbiAgICAgICAgICAgICAgICAnIHJlc3RhbnRlcydcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsICdBcG9pYXIgZXN0ZSBwcm9qZXRvJykgOiAnJyksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LmZvbnR3ZWlnaHQtc2VtaWJvbGRbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywgW1xuICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNsb2NrLW8nKSxcbiAgICAgICAgICAgICAgJ8KgwqBMZW1icmFyLW1lJ1xuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICBtKCdkaXZbY2xhc3M9XCJmb250c2l6ZS1zbWFsbGVyIHUtbWFyZ2luYm90dG9tLTMwICcgKyAoY3RybC5kaXNwbGF5Q2FyZENsYXNzKCkpICsgJ1wiXScsIGN0cmwuZGlzcGxheVN0YXR1c1RleHQoKSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy51c2VyLWMnLCBtLmNvbXBvbmVudChjLlByb2plY3RVc2VyQ2FyZCwge3VzZXJJZDogcHJvamVjdC51c2VyX2lkfSkpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFRhYnMgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5wcm9qZWN0LW5hdi5tZicsW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgIC8vRklYTUU6IG5lZWQgdG8gYWRqdXN0IHJld2FyZHMgb24gbW9iaWxlXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICBtKCdhW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywgJ1NvYnJlJyksXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywgW1xuICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMnLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnYVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29udHJpYnV0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25zXCJdJywgW1xuICAgICAgICAgICAgICAgICdBcG9pb3MnLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2Uudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywgW1xuICAgICAgICAgICAgICAgICdDb21lbnRhcmlvcycsXG4gICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RVc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgbW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbih1c2VyRGV0YWlscyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlsc1xuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCBmdW5jdGlvbih1c2VyRGV0YWlsKXtcbiAgICAgICAgcmV0dXJuIG0oJy51LW1hcmdpbmJvdHRvbS0zMC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LW1hcmdpbmJvdHRvbS0zMC51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cIm5hbWVcIl0nLFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzLCAnIGFwb2lhZG8nLCAnIGFwb2lhZG9zJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspe1xuICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHBhcnNlZExpbmsuaG9zdG5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuYWx0LWxpbmsuZm9udHdlaWdodC1zZW1pYm9sZFtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfSxcblxuICAgICAgICBncm91cENvbGxlY3Rpb24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBncm91cFRvdGFsKSB7XG4gICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgZnVuY3Rpb24oaSl7XG4gICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFtcbiAgICAgICAgICBfLm1hcChjdHJsLnZtLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsW1xuICAgICAgICAgICAgICBfLm1hcChncm91cCwgZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIuYmlnLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMTBbc3JjPVwiJyArIG1lbWJlci5pbWcgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfTtcblxuICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpe1xuICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICdIb2plIHNvbW9zICcgKyB0ZWFtVG90YWwubWVtYmVyX2NvdW50ICsgJyBwZXNzb2FzIGVzcGFsaGFkYXMgcG9yICcgKyB0ZWFtVG90YWwudG90YWxfY2l0aWVzICsgJyBjaWRhZGVzIGVtICcgKyB0ZWFtVG90YWwuY291bnRyaWVzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICcgcGHDrXNlcyAoJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMudG9TdHJpbmcoKSArICcpISBPIENhdGFyc2Ugw6kgaW5kZXBlbmRlbnRlLCBzZW0gaW52ZXN0aWRvcmVzLCBkZSBjw7NkaWdvIGFiZXJ0byBlIGNvbnN0cnXDrWRvIGNvbSBhbW9yLiBOb3NzYSBwYWl4w6NvIMOpIGNvbnN0cnVpciB1bSBhbWJpZW50ZSBvbmRlIGNhZGEgdmV6IG1haXMgcHJvamV0b3MgcG9zc2FtIGdhbmhhciB2aWRhLicpLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCl7XG4gICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspe1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgIF0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLkNvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgYywgaCl7XG4gIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi5jb250cmlidXRpb25MaXN0Vk0sXG4gICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Qcm9qZWN0JyxcbiAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvbicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnUGF5bWVudFN0YXR1cycsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgaXRlbUFjdGlvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluSW5wdXRBY3Rpb24nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZ2V0S2V5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW1xuICAgICAgICAgICAgeyAvL2Z1bGxfdGV4dF9pbmRleFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIHByb2pldG8sIGVtYWlsLCBJZHMgZG8gdXN1w6FyaW8gZSBkbyBhcG9pby4uLidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy9zdGF0ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnJywgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3BhaWQnLCBvcHRpb246ICdwYWlkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdyZWZ1c2VkJywgb3B0aW9uOiAncmVmdXNlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZycsIG9wdGlvbjogJ3BlbmRpbmcnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3BlbmRpbmdfcmVmdW5kJywgb3B0aW9uOiAncGVuZGluZ19yZWZ1bmQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVuZGVkJywgb3B0aW9uOiAncmVmdW5kZWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2NoYXJnZWJhY2snLCBvcHRpb246ICdjaGFyZ2ViYWNrJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdkZWxldGVkJywgb3B0aW9uOiAnZGVsZXRlZCd9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL2dhdGV3YXlcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnJywgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ1BhZ2FybWUnLCBvcHRpb246ICdQYWdhcm1lJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdNb0lQJywgb3B0aW9uOiAnTW9JUCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGF5UGFsJywgb3B0aW9uOiAnUGF5UGFsJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdDcmVkaXRzJywgb3B0aW9uOiAnQ3LDqWRpdG9zJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vdmFsdWVcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTnVtYmVyUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdWYWxvcmVzIGVudHJlJyxcbiAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0udmFsdWUuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLnZhbHVlLmx0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL2NyZWF0ZWRfYXRcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRGF0ZVJhbmdlJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVyw61vZG8gZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmd0ZSxcbiAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmx0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3Ipe1xuICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgaXRlbUFjdGlvbnM6IGl0ZW1BY3Rpb25zLFxuICAgICAgICBpdGVtQnVpbGRlcjogaXRlbUJ1aWxkZXIsXG4gICAgICAgIGxpc3RWTToge2xpc3Q6IGxpc3RWTSwgZXJyb3I6IGVycm9yfSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlcix7Zm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLCBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsIHN1Ym1pdDogY3RybC5zdWJtaXR9KSxcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHt2bTogY3RybC5saXN0Vk0sIGl0ZW1CdWlsZGVyOiBjdHJsLml0ZW1CdWlsZGVyLCBpdGVtQWN0aW9uczogY3RybC5pdGVtQWN0aW9uc30pXG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG0oJyNzdGF0aWMtdGVhbS1hcHAnLFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtVG90YWwpLFxuICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnByb2plY3QuSW5zaWdodHMgPSAoZnVuY3Rpb24obSwgYywgbW9kZWxzLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgbW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihwcm9qZWN0RGV0YWlscyk7XG4gICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdm06IHZtLFxuICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gXy5tYXAoY3RybC5wcm9qZWN0RGV0YWlscygpLCBmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWluc2lnaHRzJyxbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5kYXNoYm9hcmQtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgJ01pbmhhIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge3Jlc291cmNlOiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIChmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25Ub3RhbFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXksIHtjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsIHtyZXNvdXJjZUlkOiBjdHJsLnZtLnByb2plY3RfaWQoKX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlckNvdW50LCB7cmVzb3VyY2U6IHByb2plY3R9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0ocHJvamVjdCkpXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnByb2plY3QuU2hvdyA9IChmdW5jdGlvbihtLCBjLCBfLCBtb2RlbHMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdm06IHZtLFxuICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIFtcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RIZWFkZXIsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0VGFicywge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNYWluLCB7cHJvamVjdDogcHJvamVjdH0pXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIGgsIHJlcGxhY2VEaWFjcml0aWNzKXtcbiAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgc3RhdGU6ICdlcScsXG4gICAgZ2F0ZXdheTogJ2VxJyxcbiAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICB9KSxcblxuICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCl7XG4gICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfTtcblxuICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgdm0uc3RhdGUoJycpO1xuICB2bS5nYXRld2F5KCcnKTtcbiAgdm0ub3JkZXIoe2lkOiAnZGVzYyd9KTtcblxuICB2bS5jcmVhdGVkX2F0Lmx0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5lbmRPZignZGF5JykuZm9ybWF0KCcnKTtcbiAgfTtcblxuICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5ndGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgfTtcblxuICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICB9O1xuXG4gIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwuZ2V0UGFnZVdpdGhUb2tlbik7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==