window.c = (function(){
  return {
    models: {},
    pages: {},
    contribution: {},
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
  project = m.postgrest.model('projects'),
  teamMember = m.postgrest.model('team_members');

  teamMember.pageSize(40);
  rewardDetail.pageSize(200);
  project.pageSize(3);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    userDetail: userDetail,
    rewardDetail: rewardDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    project: project,
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
          newValue = m.prop('');

      h.idVM.id(item[builder.updateKey]);

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
          };

      return {
        project: project,
        statusTextObj: generateStatusText(),
        remainingTextObj: h.generateRemaingTime(project)
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

window.c.AdminRadioAction = (function(m, h, c){
  return {
    controller: function(args){
      var builder = args.data,
          complete = m.prop(false),
          data = {},
          //TODO: Implement a descriptor to abstract the initial description
          description = m.prop(args.item.reward.description || ''),
          error = m.prop(false),
          fail = m.prop(false),
          item = args.item,
          key = builder.getKey,
          newValue = m.prop(''),
          getFilter = {},
          setFilter = {},
          radios = m.prop(),
          getKey = builder.getKey,
          getAttr = builder.radios,
          updateKey = builder.updateKey;

      setFilter[updateKey] = 'eq';
      var setVM = m.postgrest.filtersVM(setFilter);
      setVM[updateKey](item[updateKey]);

      getFilter[getKey] = 'eq';
      var getVM = m.postgrest.filtersVM(getFilter);
      getVM[getKey](item[getKey]);

      var getLoader = m.postgrest.loaderWithToken(builder.getModel.getRowOptions(getVM.parameters()));

      var setLoader = m.postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

      var updateItem = function(data){
        _.extend(item, data[0]);
        complete(true);
      };

      var fetch = function(){
        getLoader.load().then(function(item){
          radios(item[0][getAttr]);
        }, error);
      };

      var submit = function(){
        if (newValue()) {
          data[builder.property] = newValue();
          setLoader.load().then(updateItem, error);
        }
        return false;
      };

      var unload = function(el, isinit, context){
        context.onunload = function(){
          complete(false);
          error(false);
          newValue('');
        };
      };

      var setDescription = function(text){
        description(text);
        m.redraw();
      };

      fetch();

      return {
        complete: complete,
        description: description,
        setDescription: setDescription,
        error: error,
        setLoader: setLoader,
        getLoader: getLoader,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload,
        radios: radios
      };
    },
    view: function(ctrl, args){
      var data = args.data,
          btnValue = (ctrl.setLoader() || ctrl.getLoader()) ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2',[
        m('button.btn.btn-small.btn-terciary', {
          onclick: ctrl.toggler.toggle
        }, data.outerLabel),
        (ctrl.toggler()) ?
          m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {config: ctrl.unload},[
            m('form.w-form', {
              onsubmit: ctrl.submit
            }, (!ctrl.complete()) ? [
                  (ctrl.radios()) ?
                    _.map(ctrl.radios(), function(radio, index){
                      var set = function(){
                        ctrl.newValue(radio.id);
                        ctrl.setDescription(radio.description);
                      };
                      var selected = (radio.id === args.item.reward.id) ? true : false;

                      return m('.w-radio', [
                        m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + ((selected) ? '[checked]' : ''),{
                          onclick: set
                        }),
                        m('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)
                      ]);
                    }) : h.loader(),
                  m('strong', 'Descrição'),
                  m('p', ctrl.description()),
                  m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')
                ] : (!ctrl.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                      m('p', 'Recompensa alterada com sucesso!')
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

window.c.ProjectCard = (function(m, h, _){
  return {

    view: function(ctrl, args) {
      var project = args.project,
          progress = (!_.isNull(project.progress) ? project.progress : 0).toFixed(2),
          remainingTextObj = h.generateRemaingTime(project)();

      return m(".w-col.w-col-4", [
        m(".card-project.card.u-radius", [
          m("a.card-project-thumb[href='" +  project.permalink + "'][target='_blank']", {style: {"background-image": "url(" + project.project_img + ")", "display": "block"}}),
          m(".card-project-description.alt", [
            m(".fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base", [
              m('a.link-hidden[target="_blank"][href="/' + project.permalink + '"]', project.project_name)
            ]
          ),
            m(".w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20", "por " + project.owner_name),
            m(".w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller", [
              m('a.link-hidden[target="_blank"][href="/' + project.permalink + '"]', project.headline)
            ])
          ]),
          m(".w-hidden-small.w-hidden-tiny.card-project-author.altt", [
            m(".fontsize-smallest.fontcolor-secondary", [m("span.fa.fa-map-marker.fa-1", " "), " " +  project.city_name + ", " + project.state_acronym])
          ]),
          m(".card-project-meter", [
            m(".meter", [
              m('.meter-fill', {style: {width: (progress > 100 ? 100 : progress) + '%'}})
            ])
          ]),
          m(".card-project-stats", [
            m(".w-row", [
              m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4", [
                m(".fontsize-base.fontweight-semibold", Math.ceil(project.progress) +  "%")
              ]),
              m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only", [
                m(".fontsize-smaller.fontweight-semibold", "R$ " + project.pledged),
                m(".fontsize-smallest.lineheight-tightest", "Levantados")
              ]),
              m(".w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right", [
                m(".fontsize-smaller.fontweight-semibold", remainingTextObj.total + ' ' + remainingTextObj.unit),
                m(".fontsize-smallest.lineheight-tightest", "Restantes")
              ])
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c.h, window._));


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

window.c.ProjectHighlight = (function(m, _, h, c){
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
        ]) : m('img.w-embed.w-video.project-video.mf[src="' + (project.video_cover_image || project.original_image) + '"]')),
        m('.project-blurb', project.headline),
        m('.u-text-center-small-only.u-marginbottom-30', [
          (!_.isNull(project.address) ?
            m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="js:void(0);"]', [
              m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym
            ]) : ''
          ),
          m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/explore/by_category_id/#"' + project.category_id + ']', [
            m('span.fa.fa-tag'), ' ',
            project.category_name
          ]),
          m('a.btn.btn-small.btn-terciary.btn-inline[href="js:void(0);"]', {onclick: ctrl.displayShareBox.toggle}, 'Compartilhar'),
          (ctrl.displayShareBox() ? m.component(c.ProjectShareBox, {project: project}) : '')
        ])
      ]);
    }
  };
}(window.m, window._, window.c.h, window.c));

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

window.c.ProjectNav = (function(m, _, h){
  return {
    controller: function(args) {
      var body = document.getElementsByTagName('body')[0],
          editLinksToggle = h.toggleProp(false, true),
          bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed');

      if(!args.project.is_published) {
        editLinksToggle.toggle();
      }

      return {
        body: body,
        editLinksToggle: editLinksToggle,
        bodyToggleForNav: bodyToggleForNav
      };
    },
    view: function(ctrl, args) {
      var project = args.project,
          editRoute = '/projects/' + project.id + '/edit',
          editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');

      ctrl.body.className = ctrl.bodyToggleForNav();

      return m('#project-nav', [
        m('.project-nav-wrapper', [
          m('nav.w-section.dashboard-nav.side', [
            m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [
              m('img.thumb-project-dashboard[src="' + (_.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'),
              m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name)
            ]),
            m('#info-links', [
              m('a#dashboard_home_link.dashboard-nav-link-left[href="' + editRoute + '#home' + '"]', [
                m('span.fa.fa-bar-chart.fa-lg.fa-fw'), ' Minha Campanha'
              ]),
              (project.is_published ? [
                m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [
                  m('span.fa.fa.fa-table.fa-lg.fa-fw'), ' Relatórios de apoios'
                ]),
                m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [
                  m('span.fa.fa-bullhorn.fa-fw.fa-lg'), ' Novidades ', m('span.badge', project.posts_count)
                ])
              ] : '' )
            ]),
            m('.edit-project-div', [
              (!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {onclick: ctrl.editLinksToggle.toggle}, [
                m('span.fa.fa-pencil.fa-fw.fa-lg'), ' Editar projeto'
              ])),
              (ctrl.editLinksToggle() ? m('#edit-menu-items', [
                m('#dashboard-links', [
                  ((!project.is_published || project.is_admin_role) ? [
                    m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'),
                    m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Meta e prazo'),
                  ] : ''),
                  m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'),
                  m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', 'Vídeo'),
                  m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', 'Orçamento'),
                  m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'),
                  m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', 'Recompensas'),
                  m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'),
                  ((project.is_published || project.state === 'approved') || project.is_admin_role ? [
                    m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta'),
                  ] : ''),
                  (!project.is_published ? [
                    m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [
                      m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'
                    ]),
                  ] : '')
                ])
              ]) : ''),
              (!project.is_published ? [
                m('.btn-send-draft-fixed', [
                  (project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', 'Enviar') : ''),
                  (project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', [
                    'Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')
                  ]) : '')
                ])
              ] : '')
            ]),
          ]),
        ]),
        m('a.btn-dashboard href="js:void(0);"', {onclick: ctrl.bodyToggleForNav.toggle}, [
          m('span.fa.fa-bars.fa-lg')
        ])
      ]);
    }
  };
}(window.m, window._, window.c.h));

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

window.c.ProjectReminder = (function(m) {
  return {
    view: function(ctrl, args) {
      var project = args.project;
      return m('.u-text-center.u-marginbottom-30', [
        m('a[class="link-hidden fontsize-small ' + (project.in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"][href="js:void(0);"]', [
          m('span.fa.fa-clock-o'),
          (project.in_reminder ? ' Lembrete ativo' : '  Lembrar-me')
        ])
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

window.c.ProjectRow = (function(m){
  return {

    view: function(ctrl, args) {
      var collection = args.collection;
      return m(".w-section.section.u-marginbottom-40", [
          m(".w-container", [
            m(".w-row.u-marginbottom-30", [
              m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                m(".fontsize-large.lineheight-looser", collection.title)
              ]),
              m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                m("a.btn.btn-small.btn-terciary[href='/pt/explore?ref=home_"+collection.hash+"#"+collection.hash+"']", "Ver todos")
              ])
            ]),
            m(".w-row", _.map(collection.collection(), function(project){
             return m.component(c.ProjectCard, {project: project} );
            }

           ))]
          )
        ])

      ;

  }};
}(window.m));


window.c.ProjectShareBox = (function(m, h){
  return {
    controller: function() {
      var displayEmbed = h.toggleProp(false, true);

      return  {
        displayEmbed: displayEmbed
      };
    },
    view: function(ctrl, args) {
      return m('.pop-share', {style: 'display: block;'}, [
        m('.w-hidden-main.w-hidden-medium.w-clearfix', [
          m('a.btn.btn-small.btn-terciary.btn-inline.u-right', 'Fechar'),
          m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')
        ]),
        m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [
          m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')
        ]),
        m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [
          m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project.name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dtwitter&via=catarse"]')
        ]),
        m('a.w-hidden-small.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {onclick: ctrl.displayEmbed.toggle}, '< embed >'),
        (ctrl.displayEmbed() ? m('.u-margintop-30', [
          m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'),
          m('.w-form', [
            m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project.id + '/embed" width="300px" scrolling="no"></iframe>"]')
          ]),
          m('.card-embed', [
            m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project.id + '/embed"][width="300px"][scrolling="no"]')
          ])
        ]) : ''),
        m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href=\'#\']', [
          m('span.fa.fa-facebook'),' Compartilhe'
        ]),
        m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href=\'#\']', [
          m('span.fa.fa-twitter'),' Tweet'
        ]),
        //m('a.w-hidden-main.w-hidden-medium.btn.btn-medium[href=\'#\']', [
        //  m('span.fa.fa-whatsapp', '.'),' Whatsapp'
        //])
      ]);
    }
  };
}(window.m, window.c.h));

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
          ((project.open_for_contributions && project.user_signed_in) ? m.component(c.ProjectReminder, {project: project}) : ''),
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
                property: 'contribution_id',
                callToAction: 'Transferir',
                innerLabel: 'Id do novo apoiador:',
                outerLabel: 'Transferir Apoio',
                placeholder: 'ex: 129908',
                model: c.models.contributionDetail
              }
            },
            {
              component: 'AdminRadioAction',
              data: {
                getKey: 'project_id',
                updateKey: 'contribution_id',
                property: 'reward_id',
                radios: 'rewards',
                callToAction: 'Alterar Recompensa',
                outerLabel: 'Recompensa',
                getModel: c.models.projectDetail,
                updateModel: c.models.contributionDetail
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

window.c.contribution.projectsHome = (function(m, c){
  return {

    controller: function() {
      var vm = {recommendedCollection: m.prop([]),
                recentCollection: m.prop([]),
                nearMeCollection: m.prop([]),
                expiringCollection: m.prop([])
          },
          project = c.models.project,

          expiring = m.postgrest.filtersVM({expires_at: 'lte', state: 'eq'});
          expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
          expiring.state('online');

          nearMe = m.postgrest.filtersVM({near_me: 'eq', state: 'eq'});
          nearMe.near_me('true').state('online');

          recents = m.postgrest.filtersVM({online_date: 'gte', state: 'eq'});
          recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
          recents.state('online');

          recommended = m.postgrest.filtersVM({recommended: 'eq', state: 'eq'});
          recommended.recommended('true').state('online');

      project.getPage(nearMe.parameters()).then(vm.nearMeCollection);
      project.getPage(recommended.parameters()).then(vm.recommendedCollection);
      project.getPage(recents.parameters()).then(vm.recentCollection);
      project.getPage(expiring.parameters()).then(vm.expiringCollection);


      var collections = [
        {
          title: 'Próximos a você',
          hash: 'near_of',
          collection: vm.nearMeCollection
        },
        {
          title: 'Recomendados',
          hash: 'recommended',
          collection: vm.recommendedCollection
        },
        {
          title: 'Na reta final',
          hash: 'expiring',
          collection: vm.expiringCollection
        },
        {
          title: 'Recentes',
          hash: 'recent',
          collection: vm.recentCollection
        }
      ];


      return {
        collections: collections
      };
    },

    view: function(ctrl) {
      return [
        _.map(ctrl.collections, function(collection){
          return m.component(c.ProjectRow, {collection: collection});
        })];

  }};
}(window.m, window.c));

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
          m.component(c.ProjectMain, {project: project}),
          (project.is_owner_or_admin ? m.component(c.ProjectNav, {project: project}) : '')
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtYWJvdXQuanMiLCJwcm9qZWN0LWNhcmQuanMiLCJwcm9qZWN0LWNoYXJ0LWNvbnRyaWJ1dGlvbi1hbW91bnQtcGVyLWRheS5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLXRvdGFsLXBlci1kYXkuanMiLCJwcm9qZWN0LWNvbW1lbnRzLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLXBlci1sb2NhdGlvbi10YWJsZS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LW5hdi5qcyIsInByb2plY3QtcG9zdHMuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yZW1pbmRlci5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXJvdy5qcyIsInByb2plY3Qtc2hhcmUtYm94LmpzIiwicHJvamVjdC1zaWRlYmFyLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidXNlci1jYXJkLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0c0hvbWUuanMiLCJwYWdlcy90ZWFtLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsInByb2plY3Qvc2hvdy5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIG1vZGVsczoge30sXG4gICAgcGFnZXM6IHt9LFxuICAgIGNvbnRyaWJ1dGlvbjoge30sXG4gICAgYWRtaW46IHt9LFxuICAgIHByb2plY3Q6IHt9LFxuICAgIGg6IHt9XG4gIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9IChmdW5jdGlvbihtLCBtb21lbnQpe1xuICAvL0RhdGUgSGVscGVyc1xuICB2YXIgbW9tZW50aWZ5ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICB9LFxuXG4gIG1vbWVudEZyb21TdHJpbmcgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIHZhciBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gIH0sXG5cbiAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICB2YXIgcmVtYWluaW5nVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgIGRheXM6ICdkaWFzJyxcbiAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgc2Vjb25kczogJ3NlZ3VuZG9zJ1xuICAgICAgICB9O1xuXG4gICAgcmVtYWluaW5nVGV4dE9iaih7XG4gICAgICB1bml0OiB0cmFuc2xhdGVkVGltZVtwcm9qZWN0LnJlbWFpbmluZ190aW1lLnVuaXQgfHwgJ3NlY29uZHMnXSxcbiAgICAgIHRvdGFsOiBwcm9qZWN0LnJlbWFpbmluZ190aW1lLnRvdGFsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVtYWluaW5nVGV4dE9iajtcbiAgfSxcblxuICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgZ2VuZXJhdGVGb3JtYXROdW1iZXIgPSBmdW5jdGlvbihzLCBjKXtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtYmVyLCBuLCB4KSB7XG4gICAgICBpZiAobnVtYmVyID09PSBudWxsIHx8IG51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgIH07XG4gIH0sXG4gIGZvcm1hdE51bWJlciA9IGdlbmVyYXRlRm9ybWF0TnVtYmVyKCcuJywgJywnKSxcblxuICB0b2dnbGVQcm9wID0gZnVuY3Rpb24oZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSl7XG4gICAgdmFyIHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICBwLnRvZ2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcDtcbiAgfSxcblxuICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtpZDogJ2VxJ30pLFxuXG4gIGhhc2hNYXRjaCA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gc3RyO1xuICB9LFxuXG4gIC8vVGVtcGxhdGVzXG4gIGxvYWRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwW3N0eWxlPVwibWFyZ2luLWJvdHRvbTotMTEwcHg7XCJdJywgW1xuICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICBdKTtcbiAgfSxcblxuICBmYlBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyeVBhcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB3aW5kb3cuRkIuWEZCTUwucGFyc2UoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dCh0cnlQYXJzZSwgNTAwKTsgLy91c2UgdGltZW91dCB0byB3YWl0IGFzeW5jIG9mIGZhY2Vib29rXG4gIH0sXG5cbiAgcGx1cmFsaXplID0gZnVuY3Rpb24oY291bnQsIHMsIHApIHtcbiAgICByZXR1cm4gKGNvdW50ID4gMSA/IGNvdW50ICsgcCA6IGNvdW50ICsgcyk7XG4gIH0sXG5cbiAgc2ltcGxlRm9ybWF0ID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcbi9nLCAnPGJyIC8+Jyk7XG4gICAgICBzdHIgPSAnPHA+JyArIHN0ciArICc8L3A+JztcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfSxcblxuICByZXdhcmRTb3VsZE91dCA9IGZ1bmN0aW9uKHJld2FyZCkge1xuICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICB9LFxuXG4gIHJld2FyZFJlbWFuaW5nID0gZnVuY3Rpb24ocmV3YXJkKSB7XG4gICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgfSxcblxuICBwYXJzZVVybCA9IGZ1bmN0aW9uKGhyZWYpIHtcbiAgICB2YXIgbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBsLmhyZWYgPSBocmVmO1xuICAgIHJldHVybiBsO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbW9tZW50aWZ5OiBtb21lbnRpZnksXG4gICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICBmb3JtYXROdW1iZXI6IGZvcm1hdE51bWJlcixcbiAgICBpZFZNOiBpZFZNLFxuICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgbG9hZGVyOiBsb2FkZXIsXG4gICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICBzaW1wbGVGb3JtYXQ6IHNpbXBsZUZvcm1hdCxcbiAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lLFxuICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICByZXdhcmRSZW1hbmluZzogcmV3YXJkUmVtYW5pbmcsXG4gICAgcGFyc2VVcmw6IHBhcnNlVXJsLFxuICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoXG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSl7XG4gIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcblxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICByZXdhcmREZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncmV3YXJkX2RldGFpbHMnKSxcbiAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKTtcblxuICB0ZWFtTWVtYmVyLnBhZ2VTaXplKDQwKTtcbiAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKDIwMCk7XG4gIHByb2plY3QucGFnZVNpemUoMyk7XG5cbiAgcmV0dXJuIHtcbiAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICBwcm9qZWN0RGV0YWlsOiBwcm9qZWN0RGV0YWlsLFxuICAgIHVzZXJEZXRhaWw6IHVzZXJEZXRhaWwsXG4gICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICB0ZWFtVG90YWw6IHRlYW1Ub3RhbCxcbiAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXk6IHByb2plY3RDb250cmlidXRpb25zUGVyRGF5LFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbixcbiAgICBwcm9qZWN0UG9zdERldGFpbDogcHJvamVjdFBvc3REZXRhaWxcbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLXNtYWxsJywgJ1IkJyArIGNvbnRyaWJ1dGlvbi52YWx1ZSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVkgSEg6bW1baF0nKSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgJ0lEIGRvIEdhdGV3YXk6ICcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgYWN0aW9ucyA9IGFyZ3MuYWN0aW9ucyxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICBfLm1hcChhY3Rpb25zLCBmdW5jdGlvbihhY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGNbYWN0aW9uLmNvbXBvbmVudF0sIHtkYXRhOiBhY3Rpb24uZGF0YSwgaXRlbTogYXJncy5pdGVtfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsW1xuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbiwge2NvbnRyaWJ1dGlvbjogaXRlbX0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnksIHtjb250cmlidXRpb246IGl0ZW19KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7Y29udHJpYnV0aW9uOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBmaWx0ZXJCdWlsZGVyID0gYXJncy5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgIG1haW4gPSBfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KTtcblxuICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnQXBvaW9zJyksXG4gICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgIG0oJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAoXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge2NvbXBvbmVudDogJ0ZpbHRlck1haW4nfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwLnctcm93JyxcbiAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJ0ZpbHRyb3MgYXZhbsOnYWRvcyDCoD4nKSksIChjdHJsLnRvZ2dsZXIoKSA/XG4gICAgICAgICAgICAgICAgbSgnI2FkdmFuY2VkLXNlYXJjaC53LXJvdy5hZG1pbi1maWx0ZXJzJywgW1xuICAgICAgICAgICAgICAgICAgXy5tYXAoZmlsdGVyQnVpbGRlciwgZnVuY3Rpb24oZil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZi5jb21wb25lbnQgIT09ICdGaWx0ZXJNYWluJykgPyBtLmNvbXBvbmVudChjW2YuY29tcG9uZW50XSwgZi5kYXRhKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93LmMsIHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5JbnB1dEFjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoJycpO1xuXG4gICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBkYXRhW2tleV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKCcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBsOiBsLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJyxbXG4gICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksXG4gICAgICAgIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge2NvbmZpZzogY3RybC51bmxvYWR9LFtcbiAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSwgdmFsdWU6IGN0cmwubmV3VmFsdWUoKX0pLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdBcG9pbyB0cmFuc2ZlcmlkbyBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcblxuICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5RGV0YWlsQm94OiBkaXNwbGF5RGV0YWlsQm94XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4LmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMjAucmVzdWx0cy1hZG1pbi1pdGVtcycsW1xuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBfLm1hcChhcmdzLmJ1aWxkZXIsIGZ1bmN0aW9uKGRlc2Mpe1xuICAgICAgICAgICAgcmV0dXJuIG0oZGVzYy53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1tkZXNjLmNvbXBvbmVudF0sIHtpdGVtOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdidXR0b24udy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnknLCB7b25jbGljazogY3RybC5kaXNwbGF5RGV0YWlsQm94LnRvZ2dsZX0pLFxuICAgICAgICBjdHJsLmRpc3BsYXlEZXRhaWxCb3goKSA/IG0uY29tcG9uZW50KGMuQWRtaW5EZXRhaWwsIHtpdGVtOiBpdGVtLCBhY3Rpb25zOiBhcmdzLmFjdGlvbnMsIGtleTogaXRlbS5rZXl9KSA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluTGlzdCA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcbiAgICAgIGlmICghbGlzdC5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3QuZmlyc3RQYWdlKSB7XG4gICAgICAgIGxpc3QuZmlyc3RQYWdlKCkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgIGFyZ3Mudm0uZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3I7XG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgIGVycm9yKCkgP1xuICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6XG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgJ0J1c2NhbmRvIGFwb2lvcy4uLicgOlxuICAgICAgICAgICAgICAgICAgICAgIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCAnIGFwb2lvcyBlbmNvbnRyYWRvcyddXG4gICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge2J1aWxkZXI6IGFyZ3MuaXRlbUJ1aWxkZXIsIGFjdGlvbnM6IGFyZ3MuaXRlbUFjdGlvbnMsIGl0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLFtcbiAgICAgICAgICAgICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7b25jbGljazogbGlzdC5uZXh0UGFnZX0sICdDYXJyZWdhciBtYWlzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdXG4gICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICBvbmxpbmU6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdOTyBBUid9LFxuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0ZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIGZhaWxlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtjc3NDbGFzczogJ3RleHQtd2FpdGluZycsIHRleHQ6ICdBR1VBUkRBTkRPJ30sXG4gICAgICAgICAgICAgICAgICByZWplY3RlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdSRUNVU0FETyd9LFxuICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtjc3NDbGFzczogJycsIHRleHQ6ICdSQVNDVU5ITyd9LFxuICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtjc3NDbGFzczogJycsIHRleHQ6ICdFTSBBTsOBTElTRSd9LFxuICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdBUFJPVkFETyd9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgdmFyIHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmooKTtcblxuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksJ8KgJyxtKCdzcGFuJywge2NsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzfSwgc3RhdHVzVGV4dE9iai50ZXh0KSwnwqAnXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtzdHlsZToge3dpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSd9fSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2ZpbmFuY2lhZG8nKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnbGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsIHJlbWFpbmluZ1RleHRPYmoudW5pdCArICcgcmVzdGFudGVzJylcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgZmFpbGVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBuw6NvIGRlc2FuaW1lIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBuw6NvIGJhdGV1IGEgbWV0YSBlIHNhYmVtb3MgcXVlIGlzc28gbsOjbyDDqSBhIG1lbGhvciBkYXMgc2Vuc2HDp8O1ZXMuIE1hcyBuw6NvIGRlc2FuaW1lLiAnLFxuICAgICAgICAgICAgJ0VuY2FyZSBvIHByb2Nlc3NvIGNvbW8gdW0gYXByZW5kaXphZG8gZSBuw6NvIGRlaXhlIGRlIGNvZ2l0YXIgdW1hIHNlZ3VuZGEgdGVudGF0aXZhLiBOw6NvIHNlIHByZW9jdXBlLCB0b2RvcyBvcyBzZXVzIGFwb2lhZG9yZXMgcmVjZWJlcsOjbyBvIGRpbmhlaXJvIGRlIHZvbHRhLsKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzY1NTA3LVJlZ3Jhcy1lLWZ1bmNpb25hbWVudG8tZG9zLXJlZW1ib2xzb3MtZXN0b3Jub3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBmYXplbW9zIGVzdG9ybm9zIGUgcmVlbWJvbHNvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCcuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFwcHJvdmVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBzZXUgcHJvamV0byBmb2kgYXByb3ZhZG8hJyksXG4gICAgICAgICAgICAnwqBQYXJhIGNvbG9jYXIgbyBzZXUgcHJvamV0byBubyBhciDDqSBwcmVjaXNvIGFwZW5hcyBxdWUgdm9jw6ogcHJlZW5jaGEgb3MgZGFkb3MgbmVjZXNzw6FyaW9zIG5hIGFiYcKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIiN1c2VyX3NldHRpbmdzXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAnLiDDiSBpbXBvcnRhbnRlIHNhYmVyIHF1ZSBjb2JyYW1vcyBhIHRheGEgZGUgMTMlIGRvIHZhbG9yIHRvdGFsIGFycmVjYWRhZG8gYXBlbmFzIHBvciBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLiBFbnRlbmRhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIGZhemVtb3MgbyByZXBhc3NlIGRvIGRpbmhlaXJvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLFtcbiAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gbS5wcm9wKGFyZ3MuaXRlbS5yZXdhcmQuZGVzY3JpcHRpb24gfHwgJycpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICBnZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICBzZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICBnZXRBdHRyID0gYnVpbGRlci5yYWRpb3MsXG4gICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXk7XG5cbiAgICAgIHNldEZpbHRlclt1cGRhdGVLZXldID0gJ2VxJztcbiAgICAgIHZhciBzZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgc2V0Vk1bdXBkYXRlS2V5XShpdGVtW3VwZGF0ZUtleV0pO1xuXG4gICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgIGdldFZNW2dldEtleV0oaXRlbVtnZXRLZXldKTtcblxuICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFJvd09wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIGRhdGFbMF0pO1xuICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBmZXRjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGdldExvYWRlci5sb2FkKCkudGhlbihmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICByYWRpb3MoaXRlbVswXVtnZXRBdHRyXSk7XG4gICAgICAgIH0sIGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAobmV3VmFsdWUoKSkge1xuICAgICAgICAgIGRhdGFbYnVpbGRlci5wcm9wZXJ0eV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKCcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpe1xuICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgIH07XG5cbiAgICAgIGZldGNoKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZCxcbiAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KXtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubmV3VmFsdWUocmFkaW8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IGFyZ3MuaXRlbS5yZXdhcmQuaWQpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjci0nICsgaW5kZXggKyAnLnctcmFkaW8taW5wdXRbdHlwZT1yYWRpb11bbmFtZT1cImFkbWluLXJhZGlvXCJdW3ZhbHVlPVwiJyArIHJhZGlvLmlkICsgJ1wiXScgKyAoKHNlbGVjdGVkKSA/ICdbY2hlY2tlZF0nIDogJycpLHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLnctZm9ybS1sYWJlbFtmb3I9XCJyLScgKyBpbmRleCArICdcIl0nLCAnUiQnICsgcmFkaW8ubWluaW11bV92YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciByZXdhcmQgPSBhcmdzLmNvbnRyaWJ1dGlvbi5yZXdhcmQgfHwge30sXG4gICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIChfLmlzRW1wdHkocmV3YXJkKSkgPyAnQXBvaW8gc2VtIHJlY29tcGVuc2EuJyA6IFtcbiAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFtcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LCBuYW1lOiAnQXBvaW8gY29uZmlybWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LCBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCwgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCwgbmFtZTogJ0Fwb2lvIGNyaWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LCBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCwgbmFtZTogJ0NoYXJnZWJhY2snfSxcbiAgICAgIF0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pe1xuICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgIH0sIFtdKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JyxbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJyxbXG4gICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICB2YXIgdXNlclByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdXNlci51c2VyX3Byb2ZpbGVfaW1nIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgIH07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsW1xuICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgdXNlclByb2ZpbGUoKSArICdcIl0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci51c2VyX2lkICsgJy9lZGl0XCJdJywgdXNlci51c2VyX25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci51c2VyX2lkKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdDYXRhcnNlOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIHVzZXIucGF5ZXJfZW1haWwpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICB9LFtcbiAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSwgdmFsdWU6IGFyZ3Mudm0oKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sIGNhcmQgPSBudWxsLFxuICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgIGNhcmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpe1xuICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiAgcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgIGlmIChjYXJkRGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKXtcbiAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsW1xuICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0QWJvdXQgPSAoZnVuY3Rpb24obSwgYywgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtYWJvdXQnLCBbXG4gICAgICAgIG0oJy5wcm9qZWN0LWFib3V0LnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlW2l0ZW1wcm9wPVwiYWJvdXRcIl0nLCBtLnRydXN0KHByb2plY3QuYWJvdXRfaHRtbCkpLFxuICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgKHByb2plY3QuaXNfcHVibGlzaGVkID9cbiAgICAgICAgICAgIG0oJy5mdW5kaW5nLXBlcmlvZCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgJ1BlcsOtb2RvIGRlIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgaC5tb21lbnRpZnkocHJvamVjdC5vbmxpbmVfZGF0ZSksICcgLSAnLCBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksICcgKCcgKyBwcm9qZWN0Lm9ubGluZV9kYXlzICsgJyBkaWFzKSAnXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICA6ICcnKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDYXJkID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSAoIV8uaXNOdWxsKHByb2plY3QucHJvZ3Jlc3MpID8gcHJvamVjdC5wcm9ncmVzcyA6IDApLnRvRml4ZWQoMiksXG4gICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpO1xuXG4gICAgICByZXR1cm4gbShcIi53LWNvbC53LWNvbC00XCIsIFtcbiAgICAgICAgbShcIi5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1c1wiLCBbXG4gICAgICAgICAgbShcImEuY2FyZC1wcm9qZWN0LXRodW1iW2hyZWY9J1wiICsgIHByb2plY3QucGVybWFsaW5rICsgXCInXVt0YXJnZXQ9J19ibGFuayddXCIsIHtzdHlsZToge1wiYmFja2dyb3VuZC1pbWFnZVwiOiBcInVybChcIiArIHByb2plY3QucHJvamVjdF9pbWcgKyBcIilcIiwgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIn19KSxcbiAgICAgICAgICBtKFwiLmNhcmQtcHJvamVjdC1kZXNjcmlwdGlvbi5hbHRcIiwgW1xuICAgICAgICAgICAgbShcIi5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2VcIiwgW1xuICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICApLFxuICAgICAgICAgICAgbShcIi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjBcIiwgXCJwb3IgXCIgKyBwcm9qZWN0Lm93bmVyX25hbWUpLFxuICAgICAgICAgICAgbShcIi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlclwiLCBbXG4gICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5bdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QuaGVhZGxpbmUpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oXCIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHRcIiwgW1xuICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5XCIsIFttKFwic3Bhbi5mYS5mYS1tYXAtbWFya2VyLmZhLTFcIiwgXCIgXCIpLCBcIiBcIiArICBwcm9qZWN0LmNpdHlfbmFtZSArIFwiLCBcIiArIHByb2plY3Quc3RhdGVfYWNyb255bV0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbShcIi5jYXJkLXByb2plY3QtbWV0ZXJcIiwgW1xuICAgICAgICAgICAgbShcIi5tZXRlclwiLCBbXG4gICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge3N0eWxlOiB7d2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ319KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKFwiLmNhcmQtcHJvamVjdC1zdGF0c1wiLCBbXG4gICAgICAgICAgICBtKFwiLnctcm93XCIsIFtcbiAgICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00XCIsIFtcbiAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZFwiLCBNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcykgKyAgXCIlXCIpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5XCIsIFtcbiAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZFwiLCBcIlIkIFwiICsgcHJvamVjdC5wbGVkZ2VkKSxcbiAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3RcIiwgXCJMZXZhbnRhZG9zXCIpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0XCIsIFtcbiAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZFwiLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsICsgJyAnICsgcmVtYWluaW5nVGV4dE9iai51bml0KSxcbiAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3RcIiwgXCJSZXN0YW50ZXNcIilcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RDaGFydENvbnRyaWJ1dGlvbkFtb3VudFBlckRheSA9IChmdW5jdGlvbihtLCBDaGFydCwgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgbGFiZWw6ICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDAuMiknLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICBkYXRhOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaXRlbS50b3RhbF9hbW91bnQ7fSlcbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVuZGVyQ2hhcnQgPSBmdW5jdGlvbihlbGVtZW50LCBpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgIGlmIChpc0luaXRpYWxpemVkKXtyZXR1cm47fVxuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ29mZnNldEhlaWdodCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQuaGVpZ2h0OyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ29mZnNldFdpZHRoJywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC53aWR0aDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgbmV3IENoYXJ0KGN0eCkuTGluZSh7XG4gICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7cmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7fSksXG4gICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyQ2hhcnQ6IHJlbmRlckNoYXJ0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyksXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtjb25maWc6IGN0cmwucmVuZGVyQ2hhcnR9KVxuICAgICAgICAgIF0pLFxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuXG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25Ub3RhbFBlckRheSA9IChmdW5jdGlvbihtLCBDaGFydCwgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MgY29uZmlybWFkb3MgcG9yIGRpYScsXG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgZGF0YTogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7cmV0dXJuIGl0ZW0udG90YWw7fSlcbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVuZGVyQ2hhcnQgPSBmdW5jdGlvbihlbGVtZW50LCBpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgIGlmIChpc0luaXRpYWxpemVkKXtyZXR1cm47fVxuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ29mZnNldEhlaWdodCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQuaGVpZ2h0OyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ29mZnNldFdpZHRoJywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC53aWR0aDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgbmV3IENoYXJ0KGN0eCkuTGluZSh7XG4gICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7cmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7fSksXG4gICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyQ2hhcnQ6IHJlbmRlckNoYXJ0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsICdBcG9pb3MgY29uZmlybWFkb3MgcG9yIGRpYScpLFxuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTInLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb21tZW50cyA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcuZmItY29tbWVudHNbZGF0YS1ocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bZGF0YS1udW0tcG9zdHM9NTBdW2RhdGEtd2lkdGg9XCI2MTBcIl0nKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUgPSAoZnVuY3Rpb24obSwgbW9kZWxzLCBoLCBfKSB7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyXHR2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgZ2VuZXJhdGVTb3J0ID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLFxuICAgICAgICAgICAgICAgICAgcmVzb3VyY2UgPSBjb2xsZWN0aW9uWzBdLFxuICAgICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IF8uc29ydEJ5KHJlc291cmNlLnNvdXJjZSwgZmllbGQpO1xuXG4gICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAnREVTQyc7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJykge1xuICAgICAgICAgICAgICAgIG9yZGVyZWRTb3VyY2UgPSBvcmRlcmVkU291cmNlLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlc291cmNlLnNvdXJjZSA9IG9yZGVyZWRTb3VyY2U7XG4gICAgICAgICAgICAgIHJlc291cmNlLm9yZGVyRmlsdGVyID0gKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSAnREVTQycgPyAnQVNDJyA6ICdERVNDJyk7XG4gICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJlc291cmNlSWQpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24oZGF0YSk7XG4gICAgICAgIGdlbmVyYXRlU29ydCgndG90YWxfY29udHJpYnV0ZWQnKSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICBnZW5lcmF0ZVNvcnQ6IGdlbmVyYXRlU29ydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1sb2NhdGlvbicsIFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsICdMb2NhbGl6YcOnw6NvIGdlb2dyw6FmaWNhIGRvcyBhcG9pb3MnKSxcbiAgICAgICAgY3RybC5jb250cmlidXRpb25zUGVyTG9jYXRpb24oKS5tYXAoZnVuY3Rpb24oY29udHJpYnV0aW9uTG9jYXRpb24pe1xuICAgICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudGFibGUtcm93LmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5oZWFkZXInLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCAnRXN0YWRvJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbFtkYXRhLWl4PVwic29ydC1hcnJvd3NcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydCgndG90YWxfY29udHJpYnV0aW9ucycpfSwgW1xuICAgICAgICAgICAgICAgICAgJ0Fwb2lvc8KgwqAnLG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbFtkYXRhLWl4PVwic29ydC1hcnJvd3NcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydCgndG90YWxfY29udHJpYnV0ZWQnKX0sIFtcbiAgICAgICAgICAgICAgICAgICdSJCBhcG9pYWRvcyAnLFxuICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywnKCUgZG8gdG90YWwpwqAnKSxcbiAgICAgICAgICAgICAgICAgICcgJyxtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsIFtcbiAgICAgICAgICAgICAgXy5tYXAoY29udHJpYnV0aW9uTG9jYXRpb24uc291cmNlLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnRhYmxlLXJvdycsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgc291cmNlLnN0YXRlX2Fjcm9ueW0pXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgc291cmNlLnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKHNvdXJjZS50b3RhbF9jb250cmlidXRlZCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJ8KgwqAoJyArIHNvdXJjZS50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RDb250cmlidXRpb24uZ2V0UGFnZVdpdGhUb2tlbiksXG4gICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcScsIHdhaXRpbmdfcGF5bWVudDogJ2VxJ30pLFxuICAgICAgICAgIGdlbmVyYXRlU29ydCA9IGZ1bmN0aW9uKHdhaXRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIC8vRklYTUU6IG5lZWQgdG8gZmluZCBhIHdheSB0byBwYXNzIGZhbHNlIGZpbHRlclxuICAgICAgICAgICAgICBmaWx0ZXJWTS53YWl0aW5nX3BheW1lbnQod2FpdGluZyk7XG4gICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG5cbiAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpKSB7XG4gICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwpO1xuICAgICAgfVxuXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGxpc3QgPSBjdHJsLmxpc3RWTTtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdF9jb250cmlidXRpb25zLmNvbnRlbnQudy1jb2wudy1jb2wtMTInLCBbXG4gICAgICAgIChhcmdzLnByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMVwiLCBbXG4gICAgICAgICAgICAgIG0oJ2lucHV0W2NoZWNrZWQ9XCJjaGVja2VkXCJdW2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3R5cGU9XCJyYWRpb1wiXVt2YWx1ZT1cImF2YWlsYWJsZV90b19jb3VudFwiXScsIHtvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydChmYWxzZSl9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXScsICdDb25maXJtYWRvcycpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICBtKCdpbnB1dFtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXVt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt2YWx1ZT1cIndhaXRpbmdfY29uZmlybWF0aW9uXCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KHRydWUpfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC01XCIsIFtcbiAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdJywgJ1BlbmRlbnRlcycpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgICA6ICcnKSxcbiAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucycsIF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCBmdW5jdGlvbihjb250cmlidXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tZGFya1tocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBjb250cmlidXRpb24udXNlcl9uYW1lKSxcbiAgICAgICAgICAgICAgICAgIChjb250cmlidXRpb24uaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyBbbS50cnVzdCgnJm5ic3A7LSZuYnNwOycpLCBtKCdzdHJvbmcnLCAnQXBvaWFkb3IgYW7DtG5pbW8nKV0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBoOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgPiAxID8gJ0Fwb2lvdSBlc3RlIGUgbWFpcyBvdXRyb3MgJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnIDogJ0Fwb2lvdSBzb21lbnRlIGVzdGUgcHJvamV0byBhdMOpIGFnb3JhJykpXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMjAnKVxuICAgICAgICAgIF0pO1xuICAgICAgfSkpLFxuICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsW1xuICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgIG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge29uY2xpY2s6IGxpc3QubmV4dFBhZ2V9LCAnQ2FycmVnYXIgbWFpcycpIDpcbiAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuXG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKGZ1bmN0aW9uKG0sIGMpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhlYWRlcicsIFtcbiAgICAgICAgbSgnLnctc2VjdGlvbi5wYWdlLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlci5mb250d2VpZ2h0LXNlbWlib2xkLnByb2plY3QtbmFtZVtpdGVtcHJvcD1cIm5hbWVcIl0nLCBwcm9qZWN0Lm5hbWUpLFxuICAgICAgICAgICAgbSgnaDIuZm9udHNpemUtYmFzZS5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgJ3BvciAnLFxuICAgICAgICAgICAgICBwcm9qZWN0LnVzZXIubmFtZVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctc2VjdGlvbi5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgucHJvamVjdC1oaWdobGlnaHQnLCBtLmNvbXBvbmVudChjLlByb2plY3RIaWdobGlnaHQsIHtwcm9qZWN0OiBwcm9qZWN0fSkpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIG0uY29tcG9uZW50KGMuUHJvamVjdFNpZGViYXIsIHtwcm9qZWN0OiBwcm9qZWN0fSkpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9IChmdW5jdGlvbihtLCBfLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5U2hhcmVCb3g6IGRpc3BsYXlTaGFyZUJveFxuICAgICAgfTtcbiAgICB9LFxuICAgIC8vRklYTUU6IEFkZCBpbWcgd2hlbiB2aWRlbyBpcyBub3QgcHJlc2VudFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhpZ2hsaWdodCcsIFtcbiAgICAgICAgKHByb2plY3QudmlkZW9fZW1iZWRfdXJsID8gbSgnLnctZW1iZWQudy12aWRlby5wcm9qZWN0LXZpZGVvLm1mJywgW1xuICAgICAgICAgIG0oJ2lmcmFtZS5lbWJlZGx5LWVtYmVkW2l0ZW1wcm9wPVwidmlkZW9cIl1bc3JjPVwiICcgKyBwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICBdKSA6IG0oJ2ltZy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlby5tZltzcmM9XCInICsgKHByb2plY3QudmlkZW9fY292ZXJfaW1hZ2UgfHwgcHJvamVjdC5vcmlnaW5hbF9pbWFnZSkgKyAnXCJdJykpLFxuICAgICAgICBtKCcucHJvamVjdC1ibHVyYicsIHByb2plY3QuaGVhZGxpbmUpLFxuICAgICAgICBtKCcudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICghXy5pc051bGwocHJvamVjdC5hZGRyZXNzKSA/XG4gICAgICAgICAgICBtKCdhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHQudS1tYXJnaW5ib3R0b20tMTBbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywgW1xuICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXInKSwgJyAnICsgcHJvamVjdC5hZGRyZXNzLmNpdHkgKyAnLCAnICsgcHJvamVjdC5hZGRyZXNzLnN0YXRlX2Fjcm9ueW1cbiAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICApLFxuICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodFtocmVmPVwiL2V4cGxvcmUvYnlfY2F0ZWdvcnlfaWQvI1wiJyArIHByb2plY3QuY2F0ZWdvcnlfaWQgKyAnXScsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdGFnJyksICcgJyxcbiAgICAgICAgICAgIHByb2plY3QuY2F0ZWdvcnlfbmFtZVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZVtocmVmPVwianM6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlfSwgJ0NvbXBhcnRpbGhhcicpLFxuICAgICAgICAgIChjdHJsLmRpc3BsYXlTaGFyZUJveCgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0U2hhcmVCb3gsIHtwcm9qZWN0OiBwcm9qZWN0fSkgOiAnJylcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdE1haW4gPSAoZnVuY3Rpb24obSwgYywgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgZ2VuZXJhdGVSb3V0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gsXG4gICAgICAgICAgICAgICAgY19vcHRzID0ge3Byb2plY3Q6IHByb2plY3R9LFxuICAgICAgICAgICAgICAgIHJvdXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICcjcmV3YXJkcyc6IG0oJy53LWNvbC53LWNvbC0xMicsIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIGNfb3B0cykpLFxuICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICcjYWJvdXQnOiBtLmNvbXBvbmVudChjLlByb2plY3RBYm91dCwgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICcjY29tbWVudHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb21tZW50cywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICcjcG9zdHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RQb3N0cywgY19vcHRzKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0VtcHR5KGhhc2gpKSB7XG4gICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbJyNhYm91dCddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcm91dGVzW2hhc2hdO1xuICAgICAgICAgIH07XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgbS5yZWRyYXcsIGZhbHNlKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgZ2VuZXJhdGVSb3V0ZXM6IGdlbmVyYXRlUm91dGVzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnc2VjdGlvbi5zZWN0aW9uW2l0ZW10eXBlPVwiaHR0cDovL3NjaGVtYS5vcmcvQ3JlYXRpdmVXb3JrXCJdJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgY3RybC5nZW5lcmF0ZVJvdXRlcygpKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TmF2ID0gKGZ1bmN0aW9uKG0sIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcbiAgICAgICAgICBlZGl0TGlua3NUb2dnbGUgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXYgPSBoLnRvZ2dsZVByb3AoJ2JvZHktcHJvamVjdCBvcGVuJywgJ2JvZHktcHJvamVjdCBjbG9zZWQnKTtcblxuICAgICAgaWYoIWFyZ3MucHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBib2R5OiBib2R5LFxuICAgICAgICBlZGl0TGlua3NUb2dnbGU6IGVkaXRMaW5rc1RvZ2dsZSxcbiAgICAgICAgYm9keVRvZ2dsZUZvck5hdjogYm9keVRvZ2dsZUZvck5hdlxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIGVkaXRSb3V0ZSA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQnLFxuICAgICAgICAgIGVkaXRMaW5rQ2xhc3MgPSAnZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICdpbmRlbnQnIDogJycpO1xuXG4gICAgICBjdHJsLmJvZHkuY2xhc3NOYW1lID0gY3RybC5ib2R5VG9nZ2xlRm9yTmF2KCk7XG5cbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1uYXYnLCBbXG4gICAgICAgIG0oJy5wcm9qZWN0LW5hdi13cmFwcGVyJywgW1xuICAgICAgICAgIG0oJ25hdi53LXNlY3Rpb24uZGFzaGJvYXJkLW5hdi5zaWRlJywgW1xuICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rLnctaW5saW5lLWJsb2NrLmRhc2hib2FyZC1wcm9qZWN0LW5hbWVbaHJlZj1cIicgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnLycgKyBwcm9qZWN0LnBlcm1hbGluayA6IGVkaXRSb3V0ZSArICcjcHJldmlldycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QtZGFzaGJvYXJkW3NyYz1cIicgKyAoXy5pc051bGwocHJvamVjdC5sYXJnZV9pbWFnZSkgPyAnL2Fzc2V0cy90aHVtYi1wcm9qZWN0LnBuZycgOiBwcm9qZWN0LmxhcmdlX2ltYWdlKSArICdcIl1bd2lkdGg9XCIxMTRcIl0nKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS5saW5laGVpZ2h0LXRpZ2h0LmZvbnRzaXplLXNtYWxsJywgcHJvamVjdC5uYW1lKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcjaW5mby1saW5rcycsIFtcbiAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfaG9tZV9saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0W2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNob21lJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXItY2hhcnQuZmEtbGcuZmEtZncnKSwgJyBNaW5oYSBDYW1wYW5oYSdcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEuZmEtdGFibGUuZmEtbGcuZmEtZncnKSwgJyBSZWxhdMOzcmlvcyBkZSBhcG9pb3MnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0LnUtbWFyZ2luYm90dG9tLTMwW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwb3N0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1idWxsaG9ybi5mYS1mdy5mYS1sZycpLCAnIE5vdmlkYWRlcyAnLCBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdIDogJycgKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuZWRpdC1wcm9qZWN0LWRpdicsIFtcbiAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7b25jbGljazogY3RybC5lZGl0TGlua3NUb2dnbGUudG9nZ2xlfSwgW1xuICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtcGVuY2lsLmZhLWZ3LmZhLWxnJyksICcgRWRpdGFyIHByb2pldG8nXG4gICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgKGN0cmwuZWRpdExpbmtzVG9nZ2xlKCkgPyBtKCcjZWRpdC1tZW51LWl0ZW1zJywgW1xuICAgICAgICAgICAgICAgIG0oJyNkYXNoYm9hcmQtbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAoKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCdhI2Jhc2ljc19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNiYXNpY3MnICsgJ1wiXScsICdCw6FzaWNvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLCAnTWV0YSBlIHByYXpvJyksXG4gICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgbSgnYSNkZXNjcmlwdGlvbl9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNkZXNjcmlwdGlvbicgKyAnXCJdJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICBtKCdhI3ZpZGVvX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ZpZGVvJyArICdcIl0nLCAnVsOtZGVvJyksXG4gICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX2Fib3V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfYWJvdXQnICsgJ1wiXScsICdTb2JyZSB2b2PDqicpLFxuICAgICAgICAgICAgICAgICAgKChwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnKSB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfc2V0dGluZ3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9zZXR0aW5ncycgKyAnXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwcmV2aWV3JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mdy5mYS1leWUuZmEtbGcnKSwgJyBQcmV2aWV3J1xuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLCBbXG4gICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsICdFbnZpYXInKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9wdWJsaXNoXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAnUHVibGljYXInLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdhLmJ0bi1kYXNoYm9hcmQgaHJlZj1cImpzOnZvaWQoMCk7XCInLCB7b25jbGljazogY3RybC5ib2R5VG9nZ2xlRm9yTmF2LnRvZ2dsZX0sIFtcbiAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhcnMuZmEtbGcnKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RQb3N0RGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pLFxuICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSk7XG5cbiAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkpIHtcbiAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgbGlzdCA9IGN0cmwubGlzdFZNO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgKF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCBmdW5jdGlvbihwb3N0KSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBvc3QnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSkpLFxuICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JyxbXG4gICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgPSAoZnVuY3Rpb24obSkge1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCdhW2NsYXNzPVwibGluay1oaWRkZW4gZm9udHNpemUtc21hbGwgJyArIChwcm9qZWN0LmluX3JlbWluZGVyID8gJ2xpbmstaGlkZGVuLXN1Y2Nlc3MnIDogJ2ZvbnRjb2xvci1zZWNvbmRhcnknKSArICcgZm9udHdlaWdodC1zZW1pYm9sZFwiXVtocmVmPVwianM6dm9pZCgwKTtcIl0nLCBbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jbG9jay1vJyksXG4gICAgICAgICAgKHByb2plY3QuaW5fcmVtaW5kZXIgPyAnIExlbWJyZXRlIGF0aXZvJyA6ICfCoMKgTGVtYnJhci1tZScpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG4gICAgICBmaWx0ZXJWTS5vcmRlcih1bmRlZmluZWQpO1xuXG4gICAgICBtb2RlbHMucmV3YXJkRGV0YWlsLmdldFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAvL0ZJWE1FOiBNSVNTSU5HIEFESlVTVFNcbiAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNyZXdhcmRzLnUtbWFyZ2luYm90dG9tLTMwJywgXy5tYXAoY3RybC5yZXdhcmREZXRhaWxzKCksIGZ1bmN0aW9uKHJld2FyZCkge1xuICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBcImNhcmQtZ29uZVwiIDogXCJjYXJkLXJld2FyZCBcIiArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSApICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pYWRvcicsICcgYXBvaWFkb3JlcycpKSxcbiAgICAgICAgICAgIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAnICggJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgOiAnJyksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/XG4gICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKSA6ICcnIClcbiAgICAgICAgXSk7XG4gICAgICB9KSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJvdyA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uO1xuICAgICAgcmV0dXJuIG0oXCIudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDBcIiwgW1xuICAgICAgICAgIG0oXCIudy1jb250YWluZXJcIiwgW1xuICAgICAgICAgICAgbShcIi53LXJvdy51LW1hcmdpbmJvdHRvbS0zMFwiLCBbXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTZcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC1sb29zZXJcIiwgY29sbGVjdGlvbi50aXRsZSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgICAgbShcImEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj0nL3B0L2V4cGxvcmU/cmVmPWhvbWVfXCIrY29sbGVjdGlvbi5oYXNoK1wiI1wiK2NvbGxlY3Rpb24uaGFzaCtcIiddXCIsIFwiVmVyIHRvZG9zXCIpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oXCIudy1yb3dcIiwgXy5tYXAoY29sbGVjdGlvbi5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICApKV1cbiAgICAgICAgICApXG4gICAgICAgIF0pXG5cbiAgICAgIDtcblxuICB9fTtcbn0od2luZG93Lm0pKTtcblxuIiwid2luZG93LmMuUHJvamVjdFNoYXJlQm94ID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRpc3BsYXlFbWJlZCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiAge1xuICAgICAgICBkaXNwbGF5RW1iZWQ6IGRpc3BsYXlFbWJlZFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge3N0eWxlOiAnZGlzcGxheTogYmxvY2s7J30sIFtcbiAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgbSgnYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lLnUtcmlnaHQnLCAnRmVjaGFyJyksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LXdpZGdldC53LXdpZGdldC1mYWNlYm9vay53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxMjBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCIvL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMvdHdlZXRfYnV0dG9uLjhkMDA3ZGRmYzE4NGU2Nzc2YmU3NmZlOWU1ZTUyZDY5LmVuLmh0bWwjXz0xNDQyNDI1OTg0OTM2JmNvdW50PWhvcml6b250YWwmZG50PWZhbHNlJmlkPXR3aXR0ZXItd2lkZ2V0LTEmbGFuZz1lbiZvcmlnaW5hbF9yZWZlcmVyPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyZzaXplPW0mdGV4dD1Db25maXJhJTIwbyUyMHByb2pldG8lMjAnICsgYXJncy5wcm9qZWN0Lm5hbWUgKyAnJTIwbm8lMjAlNDBjYXRhcnNlJnR5cGU9c2hhcmUmdXJsPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyUzRnJlZiUzRHR3aXR0ZXImdmlhPWNhdGFyc2VcIl0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZGlzcGxheUVtYmVkLnRvZ2dsZX0sICc8IGVtYmVkID4nKSxcbiAgICAgICAgKGN0cmwuZGlzcGxheUVtYmVkKCkgPyBtKCcudS1tYXJnaW50b3AtMzAnLCBbXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0W3R5cGU9XCJ0ZXh0XCJdW3ZhbHVlPVwiPGlmcmFtZSBmcmFtZWJvcmRlcj1cIjBcIiBoZWlnaHQ9XCIzMTRweFwiIHNyYz1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgbSgnaWZyYW1lW2ZyYW1lYm9yZGVyPVwiMFwiXVtoZWlnaHQ9XCIzNTBweFwiXVtzcmM9XCIvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgXSlcbiAgICAgICAgXSkgOiAnJyksXG4gICAgICAgIG0oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLWZiLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XFwnI1xcJ10nLCBbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mYWNlYm9vaycpLCcgQ29tcGFydGlsaGUnXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVxcJyNcXCddJywgW1xuICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCcgVHdlZXQnXG4gICAgICAgIF0pLFxuICAgICAgICAvL20oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW1baHJlZj1cXCcjXFwnXScsIFtcbiAgICAgICAgLy8gIG0oJ3NwYW4uZmEuZmEtd2hhdHNhcHAnLCAnLicpLCcgV2hhdHNhcHAnXG4gICAgICAgIC8vXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ2NhcmQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICdmYWlsZWQnOiAnY2FyZC1lcnJvcicsXG4gICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogJ2NhcmQtZGFyaydcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3Quc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogJ0Vzc2UgcHJvamV0byBqw6EgZm9pIGFwcm92YWRvIHBlbG8gQ2F0YXJzZS4gRW0gYnJldmUgZWxlIGVudHJhcsOhIG5vIGFyIGUgZXN0YXLDoSBwcm9udG8gcGFyYSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgICAnb25saW5lJzogJ1ZvY8OqIHBvZGUgYXBvaWFyIGVzdGUgcHJvamV0byBhdMOpIG8gZGlhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkgKyAnIMOgcyAyM2g1OW01OXMnLFxuICAgICAgICAgICAgICAnZmFpbGVkJzogJ0VzdGUgcHJvamV0byBuw6NvIGF0aW5naXUgbyBtw61uaW1vIGRlIFIkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LmdvYWwpICsgJyBhdMOpICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgbsOjbyBmb2kgZmluYW5jaWFkbycsXG4gICAgICAgICAgICAgICdyZWplY3RlZCc6ICdFc3RlIHByb2pldG8gbsOjbyBmb2kgYWNlaXRvLiBOw6NvIMOpIHBvc3PDrXZlbCByZWFsaXphciB1bSBhcG9pby4nLFxuICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnRXN0ZSBwcm9qZXRvIGVzdMOhIGVtIGFuw6FsaXNlIGUgYWluZGEgbsOjbyBlc3TDoSBhYmVydG8gcGFyYSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdFc3RlIHByb2pldG8gZm9pIGJlbS1zdWNlZGlkbyBlIGZvaSBmaW5hbmNpYWRvIGVtICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksXG4gICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ08gcHJhem8gZGUgY2FwdGHDp8OjbyBkZXNzZSBwcm9qZXRvIGVzdMOhIGVuY2VycmFkby4gRXN0YW1vcyBhZ3VhcmRhbmRvIGEgY29uZmlybWHDp8OjbyBkb3Mgw7psdGltb3MgcGFnYW1lbnRvcy4nLFxuICAgICAgICAgICAgICAnZHJhZnQnOiAnRXN0ZSBwcm9qZXRvIMOpIGFwZW5hcyB1bSByYXNjdW5obyBlIGFpbmRhIG7Do28gcG9kZSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlc1twcm9qZWN0LnN0YXRlXTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5Q2FyZENsYXNzOiBkaXNwbGF5Q2FyZENsYXNzLFxuICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIHRpbWVPYmogPSBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdCkoKTtcblxuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXNpZGViYXIuYXNpZGUnLCBbXG4gICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLm1mJywgW1xuICAgICAgICAgIG0oJy53LWNsZWFyZml4LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLXRpbnktNi53LWNvbC1zbWFsbC00LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsICdhdGluZ2lkb3MgZGUgUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC10aW55LTMudy1jb2wtc21hbGwtNC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucyksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnYXBvaW9zJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLXRpbnktMy53LWNvbC1zbWFsbC00LnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgKHByb2plY3QuaXNfcHVibGlzaGVkID8gdGltZU9iai50b3RhbCA6IChwcm9qZWN0Lm9ubGluZV9kYXlzIHx8IDApKSksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlc3QnLCBbXG4gICAgICAgICAgICAgICAgbSgnc3BhbltzdHlsZT1cInRleHQtdHJhbnNmb3JtOmNhcGl0YWxpemU7XCJdJywgKHByb2plY3QuaXNfcHVibGlzaGVkID8gdGltZU9iai51bml0IDogJ2RpYXMnKSksXG4gICAgICAgICAgICAgICAgJyByZXN0YW50ZXMnXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBtKCdhLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFyIGVzdGUgcHJvamV0bycpIDogJycpLFxuICAgICAgICAgICgocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmIHByb2plY3QudXNlcl9zaWduZWRfaW4pID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0fSkgOiAnJyksXG4gICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudXNlci1jJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0VXNlckNhcmQsIHt1c2VySWQ6IHByb2plY3QudXNlcl9pZH0pKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RUYWJzID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24ucHJvamVjdC1uYXYubWYnLFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAvL0ZJWE1FOiBuZWVkIHRvIGFkanVzdCByZXdhcmRzIG9uIG1vYmlsZVxuICAgICAgICAgICAgICBtKCdhW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNyZXdhcmRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Jld2FyZHNcIl0nLCAnUmVjb21wZW5zYXMnKSxcbiAgICAgICAgICAgICAgbSgnYVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsICdTb2JyZScpLFxuICAgICAgICAgICAgICBtKCdhW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNwb3N0cycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNwb3N0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAnTm92aWRhZGVzJyxcbiAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uc1wiXScsIFtcbiAgICAgICAgICAgICAgICAnQXBvaW9zJyxcbiAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCdhW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb21tZW50cycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb21tZW50c1wiXScsIFtcbiAgICAgICAgICAgICAgICAnQ29tZW50YXJpb3MnLFxuICAgICAgICAgICAgICAgIG0oJ2ZiOmNvbW1lbnRzLWNvdW50W2hyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtjbGFzcz1cImJhZGdlIHByb2plY3QtZmItY29tbWVudCB3LWhpZGRlbi1zbWFsbCB3LWhpZGRlbi10aW55XCJdW3N0eWxlPVwiZGlzcGxheTogaW5saW5lXCJdJywgbS50cnVzdCgnJm5ic3A7JykpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuXG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VXNlckNhcmQgPSAoZnVuY3Rpb24obSwgXywgbW9kZWxzLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgdm0gPSBoLmlkVk0sXG4gICAgICAgICAgdXNlckRldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICB2bS5pZChhcmdzLnVzZXJJZCk7XG5cbiAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCl7XG4gICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJuYW1lXCJdJyxbXG4gICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cywgJyBjcmlhZG8nLCAnIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cywgJyBhcG9pYWRvJywgJyBhcG9pYWRvcycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCd1bC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCBmdW5jdGlvbihsaW5rKXtcbiAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWRMaW5rID0gaC5wYXJzZVVybChsaW5rKTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KHBhcnNlZExpbmsuaG9zdG5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBwYXJzZWRMaW5rLmhvc3RuYW1lKVxuICAgICAgICAgICAgICAgICAgXSkgOiAnJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaHJlZj1cIm1haWx0bzonICsgdXNlckRldGFpbC5lbWFpbCArICdcIl1baXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW52aWFyIG1lbnNhZ2VtJykgOiAnJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgIF0pLFxuICAgICAgICBdKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX0sXG5cbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpe1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX07XG5cbiAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKV0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5Vc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgLy9GSVhNRTogY2FuIGNhbGwgYW5vbiByZXF1ZXN0cyB3aGVuIHRva2VuIGZhaWxzIChyZXF1ZXN0TWF5YmVXaXRoVG9rZW4pXG4gICAgICBtb2RlbHMudXNlckRldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHVzZXJEZXRhaWxzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChjdHJsLnVzZXJEZXRhaWxzKCksIGZ1bmN0aW9uKHVzZXJEZXRhaWwpe1xuICAgICAgICByZXR1cm4gbSgnLmNhcmQuY2FyZC11c2VyLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTMwW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LncuY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgudy1jb2wtdGlueS04JywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXJbaXRlbXByb3A9XCJuYW1lXCJdJyxbXG4gICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImFkZHJlc3NcIl0nLCB1c2VyRGV0YWlsLmFkZHJlc3NfY2l0eSksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdhcG9pb3UgJyArIHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5wcm9qZWN0LWF1dGhvci1jb250YWN0cycsIFtcbiAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCBmdW5jdGlvbihsaW5rKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgbGluaylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tbWVzc2FnZVtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICBdKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGl0ZW1BY3Rpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbklucHV0QWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdldEtleTogJ3VzZXJfaWQnLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnVHJhbnNmZXJpcicsXG4gICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnVHJhbnNmZXJpciBBcG9pbycsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTI5OTA4JyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUmFkaW9BY3Rpb24nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZ2V0S2V5OiAncHJvamVjdF9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnY29udHJpYnV0aW9uX2lkJyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3Jld2FyZF9pZCcsXG4gICAgICAgICAgICAgICAgcmFkaW9zOiAncmV3YXJkcycsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQWx0ZXJhciBSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgZ2V0TW9kZWw6IGMubW9kZWxzLnByb2plY3REZXRhaWwsXG4gICAgICAgICAgICAgICAgdXBkYXRlTW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW1xuICAgICAgICAgICAgeyAvL2Z1bGxfdGV4dF9pbmRleFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIHByb2pldG8sIGVtYWlsLCBJZHMgZG8gdXN1w6FyaW8gZSBkbyBhcG9pby4uLidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy9zdGF0ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnJywgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3BhaWQnLCBvcHRpb246ICdwYWlkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdyZWZ1c2VkJywgb3B0aW9uOiAncmVmdXNlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZycsIG9wdGlvbjogJ3BlbmRpbmcnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3BlbmRpbmdfcmVmdW5kJywgb3B0aW9uOiAncGVuZGluZ19yZWZ1bmQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVuZGVkJywgb3B0aW9uOiAncmVmdW5kZWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2NoYXJnZWJhY2snLCBvcHRpb246ICdjaGFyZ2ViYWNrJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdkZWxldGVkJywgb3B0aW9uOiAnZGVsZXRlZCd9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL2dhdGV3YXlcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnJywgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ1BhZ2FybWUnLCBvcHRpb246ICdQYWdhcm1lJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdNb0lQJywgb3B0aW9uOiAnTW9JUCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGF5UGFsJywgb3B0aW9uOiAnUGF5UGFsJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdDcmVkaXRzJywgb3B0aW9uOiAnQ3LDqWRpdG9zJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vdmFsdWVcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTnVtYmVyUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdWYWxvcmVzIGVudHJlJyxcbiAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0udmFsdWUuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLnZhbHVlLmx0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL2NyZWF0ZWRfYXRcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRGF0ZVJhbmdlJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVyw61vZG8gZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmd0ZSxcbiAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmx0ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3Ipe1xuICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgaXRlbUFjdGlvbnM6IGl0ZW1BY3Rpb25zLFxuICAgICAgICBpdGVtQnVpbGRlcjogaXRlbUJ1aWxkZXIsXG4gICAgICAgIGxpc3RWTToge2xpc3Q6IGxpc3RWTSwgZXJyb3I6IGVycm9yfSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlcix7Zm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLCBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsIHN1Ym1pdDogY3RybC5zdWJtaXR9KSxcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHt2bTogY3RybC5saXN0Vk0sIGl0ZW1CdWlsZGVyOiBjdHJsLml0ZW1CdWlsZGVyLCBpdGVtQWN0aW9uczogY3RybC5pdGVtQWN0aW9uc30pXG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5jb250cmlidXRpb24ucHJvamVjdHNIb21lID0gKGZ1bmN0aW9uKG0sIGMpe1xuICByZXR1cm4ge1xuXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7cmVjb21tZW5kZWRDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHJlY2VudENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbmVhck1lQ29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBleHBpcmluZ0NvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb2plY3QgPSBjLm1vZGVscy5wcm9qZWN0LFxuXG4gICAgICAgICAgZXhwaXJpbmcgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe2V4cGlyZXNfYXQ6ICdsdGUnLCBzdGF0ZTogJ2VxJ30pO1xuICAgICAgICAgIGV4cGlyaW5nLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgICAgICBleHBpcmluZy5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgICAgICBuZWFyTWUgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe25lYXJfbWU6ICdlcScsIHN0YXRlOiAnZXEnfSk7XG4gICAgICAgICAgbmVhck1lLm5lYXJfbWUoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgICAgICByZWNlbnRzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtvbmxpbmVfZGF0ZTogJ2d0ZScsIHN0YXRlOiAnZXEnfSk7XG4gICAgICAgICAgcmVjZW50cy5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg1LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgICAgICByZWNlbnRzLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgIHJlY29tbWVuZGVkID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtyZWNvbW1lbmRlZDogJ2VxJywgc3RhdGU6ICdlcSd9KTtcbiAgICAgICAgICByZWNvbW1lbmRlZC5yZWNvbW1lbmRlZCgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgcHJvamVjdC5nZXRQYWdlKG5lYXJNZS5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ubmVhck1lQ29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UocmVjb21tZW5kZWQucGFyYW1ldGVycygpKS50aGVuKHZtLnJlY29tbWVuZGVkQ29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UocmVjZW50cy5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ucmVjZW50Q29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UoZXhwaXJpbmcucGFyYW1ldGVycygpKS50aGVuKHZtLmV4cGlyaW5nQ29sbGVjdGlvbik7XG5cblxuICAgICAgdmFyIGNvbGxlY3Rpb25zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdQcsOzeGltb3MgYSB2b2PDqicsXG4gICAgICAgICAgaGFzaDogJ25lYXJfb2YnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLm5lYXJNZUNvbGxlY3Rpb25cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnUmVjb21lbmRhZG9zJyxcbiAgICAgICAgICBoYXNoOiAncmVjb21tZW5kZWQnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLnJlY29tbWVuZGVkQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdOYSByZXRhIGZpbmFsJyxcbiAgICAgICAgICBoYXNoOiAnZXhwaXJpbmcnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLmV4cGlyaW5nQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNlbnRlcycsXG4gICAgICAgICAgaGFzaDogJ3JlY2VudCcsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjZW50Q29sbGVjdGlvblxuICAgICAgICB9XG4gICAgICBdO1xuXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgZnVuY3Rpb24oY29sbGVjdGlvbil7XG4gICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge2NvbGxlY3Rpb246IGNvbGxlY3Rpb259KTtcbiAgICAgICAgfSldO1xuXG4gIH19O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLlRlYW0gPSAoZnVuY3Rpb24obSwgYyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsW1xuICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbU1lbWJlcnMpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMucHJvamVjdC5JbnNpZ2h0cyA9IChmdW5jdGlvbihtLCBjLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKHByb2plY3REZXRhaWxzKTtcbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheS5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKGNvbnRyaWJ1dGlvbnNQZXJEYXkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7cmVzb3VyY2U6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge3Jlc291cmNlOiBwcm9qZWN0fSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5LCB7Y29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvbkFtb3VudFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSwge3Jlc291cmNlSWQ6IGN0cmwudm0ucHJvamVjdF9pZCgpfSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfShwcm9qZWN0KSlcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMucHJvamVjdC5TaG93ID0gKGZ1bmN0aW9uKG0sIGMsIF8sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlsc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgIHJldHVybiBtKCcucHJvamVjdC1zaG93JywgW1xuICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdEhlYWRlciwge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RUYWJzLCB7cHJvamVjdDogcHJvamVjdH0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3ROYXYsIHtwcm9qZWN0OiBwcm9qZWN0fSkgOiAnJylcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3Mpe1xuICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICBzdGF0ZTogJ2VxJyxcbiAgICBnYXRld2F5OiAnZXEnLFxuICAgIHZhbHVlOiAnYmV0d2VlbicsXG4gICAgY3JlYXRlZF9hdDogJ2JldHdlZW4nXG4gIH0pLFxuXG4gIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKXtcbiAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICB9O1xuXG4gIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICB2bS5zdGF0ZSgnJyk7XG4gIHZtLmdhdGV3YXkoJycpO1xuICB2bS5vcmRlcih7aWQ6ICdkZXNjJ30pO1xuXG4gIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmx0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICB9O1xuXG4gIHZtLmNyZWF0ZWRfYXQuZ3RlLnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xuICB9O1xuXG4gIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gIH07XG5cbiAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbC5nZXRQYWdlV2l0aFRva2VuKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9