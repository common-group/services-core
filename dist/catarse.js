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


window.c.ProjectShareBox = (function(m){
  return {
    view: function(ctrl, args) {
      return m('.pop-share', [
        m('.w-hidden-main.w-hidden-medium.w-clearfix', [
          m('a.btn.btn-small.btn-terciary.btn-inline.u-right', 'Fechar'),
          m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')
        ]),
        m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [
          //m('.fb-share-button[data-href="https://www.catarse.me/pt/' + args.project.permalink + '?ref=facebook"][data-layout="button_count"]')
          m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')
        ]),
        m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [
          m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project.name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dtwitter&via=catarse"]')
        ]),
        //m('a.w-hidden-small.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href=\'#\']', '< embed >'),
        m('.u-margintop-30', [
          m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'),
          m('.w-form', [
            m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project.id + '/embed" width="300px" scrolling="no"></iframe>"]')
          ]),
          m('.card-embed', [
            m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project.id + '/embed"][width="300px"][scrolling="no"]')
          ])
        ]),
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
}(window.m));

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtYWJvdXQuanMiLCJwcm9qZWN0LWNhcmQuanMiLCJwcm9qZWN0LWNoYXJ0LWNvbnRyaWJ1dGlvbi1hbW91bnQtcGVyLWRheS5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLXRvdGFsLXBlci1kYXkuanMiLCJwcm9qZWN0LWNvbW1lbnRzLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLXBlci1sb2NhdGlvbi10YWJsZS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXJvdy5qcyIsInByb2plY3Qtc2hhcmUtYm94LmpzIiwicHJvamVjdC1zaWRlYmFyLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidXNlci1jYXJkLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0c0hvbWUuanMiLCJwcm9qZWN0L2luc2lnaHRzLmpzIiwicHJvamVjdC9zaG93LmpzIiwicGFnZXMvdGVhbS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgbW9kZWxzOiB7fSxcbiAgICBwYWdlczoge30sXG4gICAgY29udHJpYnV0aW9uOiB7fSxcbiAgICBhZG1pbjoge30sXG4gICAgcHJvamVjdDoge30sXG4gICAgaDoge31cbiAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKGZ1bmN0aW9uKG0sIG1vbWVudCl7XG4gIC8vRGF0ZSBIZWxwZXJzXG4gIHZhciBtb21lbnRpZnkgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnREQvTU0vWVlZWSc7XG4gICAgcmV0dXJuIGRhdGUgPyBtb21lbnQoZGF0ZSkuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gIH0sXG5cbiAgbW9tZW50RnJvbVN0cmluZyA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCl7XG4gICAgdmFyIGV1cm9wZWFuID0gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpO1xuICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgfSxcblxuICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICBnZW5lcmF0ZVJlbWFpbmdUaW1lID0gZnVuY3Rpb24ocHJvamVjdCkge1xuICAgIHZhciByZW1haW5pbmdUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSB7XG4gICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dG9zJyxcbiAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgIH07XG5cbiAgICByZW1haW5pbmdUZXh0T2JqKHtcbiAgICAgIHVuaXQ6IHRyYW5zbGF0ZWRUaW1lW3Byb2plY3QucmVtYWluaW5nX3RpbWUudW5pdCB8fCAnc2Vjb25kcyddLFxuICAgICAgdG90YWw6IHByb2plY3QucmVtYWluaW5nX3RpbWUudG90YWxcbiAgICB9KTtcblxuICAgIHJldHVybiByZW1haW5pbmdUZXh0T2JqO1xuICB9LFxuXG4gIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IGZ1bmN0aW9uKHMsIGMpe1xuICAgIHJldHVybiBmdW5jdGlvbihudW1iZXIsIG4sIHgpIHtcbiAgICAgIGlmIChudW1iZXIgPT09IG51bGwgfHwgbnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZSA9ICdcXFxcZCg/PShcXFxcZHsnICsgKHggfHwgMykgKyAnfSkrJyArIChuID4gMCA/ICdcXFxcRCcgOiAnJCcpICsgJyknLFxuICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgfTtcbiAgfSxcbiAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gIHRvZ2dsZVByb3AgPSBmdW5jdGlvbihkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKXtcbiAgICB2YXIgcCA9IG0ucHJvcChkZWZhdWx0U3RhdGUpO1xuICAgIHAudG9nZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgIHAoKChwKCkgPT09IGFsdGVybmF0ZVN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IGFsdGVybmF0ZVN0YXRlKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xuICB9LFxuXG4gIGlkVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe2lkOiAnZXEnfSksXG5cbiAgaGFzaE1hdGNoID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSBzdHI7XG4gIH0sXG5cbiAgLy9UZW1wbGF0ZXNcbiAgbG9hZGVyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW50b3AtMzBbc3R5bGU9XCJtYXJnaW4tYm90dG9tOi0xMTBweDtcIl0nLCBbXG4gICAgICBtKCdpbWdbYWx0PVwiTG9hZGVyXCJdW3NyYz1cImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9jYXRhcnNlLmZpbGVzL2xvYWRlci5naWZcIl0nKVxuICAgIF0pO1xuICB9LFxuXG4gIGZiUGFyc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJ5UGFyc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHdpbmRvdy5GQi5YRkJNTC5wYXJzZSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgfSxcblxuICBwbHVyYWxpemUgPSBmdW5jdGlvbihjb3VudCwgcywgcCkge1xuICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgfSxcblxuICBzaW1wbGVGb3JtYXQgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxyXFxuPy8sICdcXG4nKTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9LFxuXG4gIHJld2FyZFNvdWxkT3V0ID0gZnVuY3Rpb24ocmV3YXJkKSB7XG4gICAgcmV0dXJuIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/XG4gICAgICAgIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPj0gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucykgOiBmYWxzZSk7XG4gIH0sXG5cbiAgcmV3YXJkUmVtYW5pbmcgPSBmdW5jdGlvbihyZXdhcmQpIHtcbiAgICByZXR1cm4gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyAtIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuICB9LFxuXG4gIHBhcnNlVXJsID0gZnVuY3Rpb24oaHJlZikge1xuICAgIHZhciBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGwuaHJlZiA9IGhyZWY7XG4gICAgcmV0dXJuIGw7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICBtb21lbnRGcm9tU3RyaW5nOiBtb21lbnRGcm9tU3RyaW5nLFxuICAgIGZvcm1hdE51bWJlcjogZm9ybWF0TnVtYmVyLFxuICAgIGlkVk06IGlkVk0sXG4gICAgdG9nZ2xlUHJvcDogdG9nZ2xlUHJvcCxcbiAgICBsb2FkZXI6IGxvYWRlcixcbiAgICBmYlBhcnNlOiBmYlBhcnNlLFxuICAgIHBsdXJhbGl6ZTogcGx1cmFsaXplLFxuICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgIGdlbmVyYXRlUmVtYWluZ1RpbWU6IGdlbmVyYXRlUmVtYWluZ1RpbWUsXG4gICAgcmV3YXJkU291bGRPdXQ6IHJld2FyZFNvdWxkT3V0LFxuICAgIHJld2FyZFJlbWFuaW5nOiByZXdhcmRSZW1hbmluZyxcbiAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgaGFzaE1hdGNoOiBoYXNoTWF0Y2hcbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKXtcbiAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuXG4gIHByb2plY3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9kZXRhaWxzJyksXG4gIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gIHByb2plY3RDb250cmlidXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zJyksXG4gIHByb2plY3RQb3N0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcG9zdHNfZGV0YWlscycpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfbG9jYXRpb24nKSxcbiAgcHJvamVjdCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0cycpLFxuICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpO1xuXG4gIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICByZXdhcmREZXRhaWwucGFnZVNpemUoMjAwKTtcbiAgcHJvamVjdC5wYWdlU2l6ZSgzKTtcblxuICByZXR1cm4ge1xuICAgIGNvbnRyaWJ1dGlvbkRldGFpbDogY29udHJpYnV0aW9uRGV0YWlsLFxuICAgIHByb2plY3REZXRhaWw6IHByb2plY3REZXRhaWwsXG4gICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICByZXdhcmREZXRhaWw6IHJld2FyZERldGFpbCxcbiAgICBjb250cmlidXRpb25zOiBjb250cmlidXRpb25zLFxuICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgcHJvamVjdDogcHJvamVjdCxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uLFxuICAgIHByb2plY3RQb3N0RGV0YWlsOiBwcm9qZWN0UG9zdERldGFpbFxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBhY3Rpb25zID0gYXJncy5hY3Rpb25zLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgIF8ubWFwKGFjdGlvbnMsIGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoY1thY3Rpb24uY29tcG9uZW50XSwge2RhdGE6IGFjdGlvbi5kYXRhLCBpdGVtOiBhcmdzLml0ZW19KTtcbiAgICAgICAgICB9KVxuICAgICAgICApLFxuICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJyxbXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uLCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge2NvbnRyaWJ1dGlvbjogaXRlbX0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtjb250cmlidXRpb246IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkZpbHRlciA9IChmdW5jdGlvbihjLCBtLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pO1xuXG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtZmlsdGVyLnctc2VjdGlvbi5wYWdlLWhlYWRlcicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsICdBcG9pb3MnKSxcbiAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgbSgnZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KSkgPyBtLmNvbXBvbmVudChjW21haW4uY29tcG9uZW50XSwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWNvbC53LWNvbC0xMi5mb250c2l6ZS1zbWFsbGVzdC5saW5rLWhpZGRlbi1saWdodFtzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDtcIl1bdHlwZT1cImJ1dHRvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICBuZXdWYWx1ZSA9IG0ucHJvcCgnJyk7XG5cbiAgICAgIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSk7XG5cbiAgICAgIHZhciBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIubW9kZWwucGF0Y2hPcHRpb25zKGguaWRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihyZXMpe1xuICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGRhdGFba2V5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCl7XG4gICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgbmV3VmFsdWUoJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgIGw6IGwsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3VmFsdWUpLCB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpfSksXG4gICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5JdGVtID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuXG4gICAgICB2YXIgZGlzcGxheURldGFpbEJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0yMC5yZXN1bHRzLWFkbWluLWl0ZW1zJyxbXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIF8ubWFwKGFyZ3MuYnVpbGRlciwgZnVuY3Rpb24oZGVzYyl7XG4gICAgICAgICAgICByZXR1cm4gbShkZXNjLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW2Rlc2MuY29tcG9uZW50XSwge2l0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeScsIHtvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlfSksXG4gICAgICAgIGN0cmwuZGlzcGxheURldGFpbEJveCgpID8gbS5jb21wb25lbnQoYy5BZG1pbkRldGFpbCwge2l0ZW06IGl0ZW0sIGFjdGlvbnM6IGFyZ3MuYWN0aW9ucywga2V5OiBpdGVtLmtleX0pIDogJydcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0LFxuICAgICAgICAgIGVycm9yID0gYXJncy52bS5lcnJvcjtcbiAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICBtKCcuY2FyZC5jYXJkLWVycm9yLnUtcmFkaXVzLmZvbnR3ZWlnaHQtYm9sZCcsIGVycm9yKCkpIDpcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAnQnVzY2FuZG8gYXBvaW9zLi4uJyA6XG4gICAgICAgICAgICAgICAgICAgICAgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIGxpc3QudG90YWwoKSksICcgYXBvaW9zIGVuY29udHJhZG9zJ11cbiAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWxpc3Qudy1jb250YWluZXInLFtcbiAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5JdGVtLCB7YnVpbGRlcjogYXJncy5pdGVtQnVpbGRlciwgYWN0aW9uczogYXJncy5pdGVtQWN0aW9ucywgaXRlbTogaXRlbSwga2V5OiBpdGVtLmtleX0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsW1xuICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdHVzVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZToge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ05PIEFSJ30sXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7Y3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLCB0ZXh0OiAnRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ07Dg08gRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczoge2Nzc0NsYXNzOiAndGV4dC13YWl0aW5nJywgdGV4dDogJ0FHVUFSREFORE8nfSxcbiAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ1JFQ1VTQURPJ30sXG4gICAgICAgICAgICAgICAgICBkcmFmdDoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ1JBU0NVTkhPJ30sXG4gICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ0VNIEFOw4FMSVNFJ30sXG4gICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0FQUk9WQURPJ31cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdHVzVGV4dE9iajtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC5nZW5lcmF0ZVJlbWFpbmdUaW1lKHByb2plY3QpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaigpO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwnwqAnLG0oJ3NwYW4nLCB7Y2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3N9LCBzdGF0dXNUZXh0T2JqLnRleHQpLCfCoCdcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge3N0eWxlOiB7d2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ319KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnZmluYW5jaWFkbycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdsZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgcmVtYWluaW5nVGV4dE9iai51bml0ICsgJyByZXN0YW50ZXMnKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBleHBsYW5hdGlvbiA9IGZ1bmN0aW9uKHJlc291cmNlKSB7XG4gICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgb25saW5lOiBbXG4gICAgICAgICAgICBtKCdzcGFuJywgJ1ZvY8OqIHBvZGUgcmVjZWJlciBhcG9pb3MgYXTDqSAyM2hzNTltaW41OXMgZG8gZGlhICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJy4gTGVtYnJlLXNlLCDDqSB0dWRvLW91LW5hZGEgZSB2b2PDqiBzw7MgbGV2YXLDoSBvcyByZWN1cnNvcyBjYXB0YWRvcyBzZSBiYXRlciBhIG1ldGEgZGVudHJvIGRlc3NlIHByYXpvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIG8gcmVwYXNzZSBkbyBkaW5oZWlybyBzZXLDoSBmZWl0by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBmYWlsZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIG7Do28gZGVzYW5pbWUhJyksXG4gICAgICAgICAgICAnIFNldSBwcm9qZXRvIG7Do28gYmF0ZXUgYSBtZXRhIGUgc2FiZW1vcyBxdWUgaXNzbyBuw6NvIMOpIGEgbWVsaG9yIGRhcyBzZW5zYcOnw7Vlcy4gTWFzIG7Do28gZGVzYW5pbWUuICcsXG4gICAgICAgICAgICAnRW5jYXJlIG8gcHJvY2Vzc28gY29tbyB1bSBhcHJlbmRpemFkbyBlIG7Do28gZGVpeGUgZGUgY29naXRhciB1bWEgc2VndW5kYSB0ZW50YXRpdmEuIE7Do28gc2UgcHJlb2N1cGUsIHRvZG9zIG9zIHNldXMgYXBvaWFkb3JlcyByZWNlYmVyw6NvIG8gZGluaGVpcm8gZGUgdm9sdGEuwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDctUmVncmFzLWUtZnVuY2lvbmFtZW50by1kb3MtcmVlbWJvbHNvcy1lc3Rvcm5vc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIGZhemVtb3MgZXN0b3Jub3MgZSByZWVtYm9sc29zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksJy4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIEVOVklBUiBlIGVudHJhcmVtb3MgZW0gY29udGF0byBwYXJhIGF2YWxpYXIgbyBzZXUgcHJvamV0by4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgYXBwcm92ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHNldSBwcm9qZXRvIGZvaSBhcHJvdmFkbyEnKSxcbiAgICAgICAgICAgICfCoFBhcmEgY29sb2NhciBvIHNldSBwcm9qZXRvIG5vIGFyIMOpIHByZWNpc28gYXBlbmFzIHF1ZSB2b2PDqiBwcmVlbmNoYSBvcyBkYWRvcyBuZWNlc3PDoXJpb3MgbmEgYWJhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiI3VzZXJfc2V0dGluZ3NcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICcuIMOJIGltcG9ydGFudGUgc2FiZXIgcXVlIGNvYnJhbW9zIGEgdGF4YSBkZSAxMyUgZG8gdmFsb3IgdG90YWwgYXJyZWNhZGFkbyBhcGVuYXMgcG9yIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuIEVudGVuZGHCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gZmF6ZW1vcyBvIHJlcGFzc2UgZG8gZGluaGVpcm8uJylcbiAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGF0ZVRleHRbcmVzb3VyY2Uuc3RhdGVdO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JyxbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLFtcbiAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5SYWRpb0FjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoYXJncy5pdGVtLnJld2FyZC5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleTtcblxuICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICBzZXRWTVt1cGRhdGVLZXldKGl0ZW1bdXBkYXRlS2V5XSk7XG5cbiAgICAgIGdldEZpbHRlcltnZXRLZXldID0gJ2VxJztcbiAgICAgIHZhciBnZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgZ2V0Vk1bZ2V0S2V5XShpdGVtW2dldEtleV0pO1xuXG4gICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0Um93T3B0aW9ucyhnZXRWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgdmFyIHNldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgZGF0YVswXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGZldGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgIHJhZGlvcyhpdGVtWzBdW2dldEF0dHJdKTtcbiAgICAgICAgfSwgZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChuZXdWYWx1ZSgpKSB7XG4gICAgICAgICAgZGF0YVtidWlsZGVyLnByb3BlcnR5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCl7XG4gICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgbmV3VmFsdWUoJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgdmFyIHNldERlc2NyaXB0aW9uID0gZnVuY3Rpb24odGV4dCl7XG4gICAgICAgIGRlc2NyaXB0aW9uKHRleHQpO1xuICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgfTtcblxuICAgICAgZmV0Y2goKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBzZXRMb2FkZXI6IHNldExvYWRlcixcbiAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICByYWRpb3M6IHJhZGlvc1xuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsW1xuICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLFxuICAgICAgICAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtjb25maWc6IGN0cmwudW5sb2FkfSxbXG4gICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCBmdW5jdGlvbihyYWRpbywgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdWYWx1ZShyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldERlc2NyaXB0aW9uKHJhZGlvLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChyYWRpby5pZCA9PT0gYXJncy5pdGVtLnJld2FyZC5pZCkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJykse1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHJld2FyZCA9IGFyZ3MuY29udHJpYnV0aW9uLnJld2FyZCB8fCB7fSxcbiAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgKF8uaXNFbXB0eShyZXdhcmQpKSA/ICdBcG9pbyBzZW0gcmVjb21wZW5zYS4nIDogW1xuICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW1xuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LCBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCBuYW1lOiAnQXBvaW8gY3JpYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCwgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LCBuYW1lOiAnQ2hhcmdlYmFjayd9LFxuICAgICAgXSwgZnVuY3Rpb24obWVtbywgaXRlbSl7XG4gICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgfSwgW10pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLFtcbiAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSgpKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlciA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgIHZhciB1c2VyUHJvZmlsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB1c2VyLnVzZXJfcHJvZmlsZV9pbWcgfHwgJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnVzZXItYXZhdGFyW3NyYz1cIicgKyB1c2VyUHJvZmlsZSgpICsgJ1wiXScpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JyxbXG4gICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLnVzZXJfaWQgKyAnL2VkaXRcIl0nLCB1c2VyLnVzZXJfbmFtZSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLnVzZXJfaWQpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0NhdGFyc2U6ICcgKyB1c2VyLmVtYWlsKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgdXNlci5wYXllcl9lbWFpbClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlckRhdGVSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgIH0sW1xuICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLCB2YWx1ZTogYXJncy52bSgpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlck51bWJlclJhbmdlID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBheW1lbnRTdGF0dXMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbSwgY2FyZCA9IG51bGwsXG4gICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgY2FyZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSl7XG4gICAgICAgICAgc3dpdGNoIChwYXltZW50LmdhdGV3YXkudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6ICBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmluLFxuICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iYW5kZWlyYVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9icmFuZFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZCgpO1xuICAgICAgICAgICAgaWYgKGNhcmREYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIG0oJyNjcmVkaXRjYXJkLWRldGFpbC5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgY2FyZERhdGEuZmlyc3RfZGlnaXRzICsgJyoqKioqKicgKyBjYXJkRGF0YS5sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgIGNhcmREYXRhLmJyYW5kICsgJyAnICsgcGF5bWVudC5pbnN0YWxsbWVudHMgKyAneCdcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHBheW1lbnRNZXRob2RDbGFzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1iYXJjb2RlJztcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtY3JlZGl0LWNhcmQnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQuc3RhdGUpe1xuICAgICAgICAgIGNhc2UgJ3BhaWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1zdWNjZXNzJztcbiAgICAgICAgICBjYXNlICdyZWZ1bmRlZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXJlZnVuZGVkJztcbiAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICBjYXNlICdwZW5kaW5nX3JlZnVuZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXdhaXRpbmcnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LWVycm9yJztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3M6IHBheW1lbnRNZXRob2RDbGFzcyxcbiAgICAgICAgc3RhdGVDbGFzczogc3RhdGVDbGFzc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cucGF5bWVudC1zdGF0dXMnLCBbXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jaXJjbGUnICsgY3RybC5zdGF0ZUNsYXNzKCkpLCAnwqAnICsgcGF5bWVudC5zdGF0ZVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLFtcbiAgICAgICAgICBtKCdzcGFuLmZhJyArIGN0cmwucGF5bWVudE1ldGhvZENsYXNzKCkpLCAnICcsIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCBwYXltZW50LnBheW1lbnRfbWV0aG9kKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICBjdHJsLmRpc3BsYXlQYXltZW50TWV0aG9kKClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RBYm91dCA9IChmdW5jdGlvbihtLCBjLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgbSgnLnByb2plY3QtYWJvdXQudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICBtKCdzdHJvbmcnLCAnTyBwcm9qZXRvJyksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHByb2plY3QuYnVkZ2V0KSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICAocHJvamVjdC5pc19wdWJsaXNoZWQgP1xuICAgICAgICAgICAgbSgnLmZ1bmRpbmctcGVyaW9kJywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCAnUGVyw61vZG8gZGUgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICBoLm1vbWVudGlmeShwcm9qZWN0Lm9ubGluZV9kYXRlKSwgJyAtICcsIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSwgJyAoJyArIHByb2plY3Qub25saW5lX2RheXMgKyAnIGRpYXMpICdcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgIDogJycpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENhcmQgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBwcm9ncmVzcyA9ICghXy5pc051bGwocHJvamVjdC5wcm9ncmVzcykgPyBwcm9qZWN0LnByb2dyZXNzIDogMCkudG9GaXhlZCgyKSxcbiAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC5nZW5lcmF0ZVJlbWFpbmdUaW1lKHByb2plY3QpKCk7XG5cbiAgICAgIHJldHVybiBtKFwiLnctY29sLnctY29sLTRcIiwgW1xuICAgICAgICBtKFwiLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzXCIsIFtcbiAgICAgICAgICBtKFwiYS5jYXJkLXByb2plY3QtdGh1bWJbaHJlZj0nXCIgKyAgcHJvamVjdC5wZXJtYWxpbmsgKyBcIiddW3RhcmdldD0nX2JsYW5rJ11cIiwge3N0eWxlOiB7XCJiYWNrZ3JvdW5kLWltYWdlXCI6IFwidXJsKFwiICsgcHJvamVjdC5wcm9qZWN0X2ltZyArIFwiKVwiLCBcImRpc3BsYXlcIjogXCJibG9ja1wifX0pLFxuICAgICAgICAgIG0oXCIuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdFwiLCBbXG4gICAgICAgICAgICBtKFwiLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZVwiLCBbXG4gICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5bdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgXVxuICAgICAgICAgICksXG4gICAgICAgICAgICBtKFwiLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMFwiLCBcInBvciBcIiArIHByb2plY3Qub3duZXJfbmFtZSksXG4gICAgICAgICAgICBtKFwiLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyXCIsIFtcbiAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlblt0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbShcIi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dFwiLCBbXG4gICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnlcIiwgW20oXCJzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMVwiLCBcIiBcIiksIFwiIFwiICsgIHByb2plY3QuY2l0eV9uYW1lICsgXCIsIFwiICsgcHJvamVjdC5zdGF0ZV9hY3JvbnltXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKFwiLmNhcmQtcHJvamVjdC1tZXRlclwiLCBbXG4gICAgICAgICAgICBtKFwiLm1ldGVyXCIsIFtcbiAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7c3R5bGU6IHt3aWR0aDogKHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpICsgJyUnfX0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oXCIuY2FyZC1wcm9qZWN0LXN0YXRzXCIsIFtcbiAgICAgICAgICAgIG0oXCIudy1yb3dcIiwgW1xuICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTRcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkXCIsIE1hdGguY2VpbChwcm9qZWN0LnByb2dyZXNzKSArICBcIiVcIilcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHlcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkXCIsIFwiUiQgXCIgKyBwcm9qZWN0LnBsZWRnZWQpLFxuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdFwiLCBcIkxldmFudGFkb3NcIilcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHRcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkXCIsIHJlbWFpbmluZ1RleHRPYmoudG90YWwgKyAnICcgKyByZW1haW5pbmdUZXh0T2JqLnVuaXQpLFxuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdFwiLCBcIlJlc3RhbnRlc1wiKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsX2Ftb3VudDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge2NvbmZpZzogY3RybC5yZW5kZXJDaGFydH0pXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDAuMiknLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICBkYXRhOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaXRlbS50b3RhbDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyksXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtjb25maWc6IGN0cmwucmVuZGVyQ2hhcnR9KVxuICAgICAgICAgIF0pLFxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbW1lbnRzID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJy5mYi1jb21tZW50c1tkYXRhLWhyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtkYXRhLW51bS1wb3N0cz01MF1bZGF0YS13aWR0aD1cIjYxMFwiXScpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXJcdHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCksXG4gICAgICAgICAgICAgICAgICByZXNvdXJjZSA9IGNvbGxlY3Rpb25bMF0sXG4gICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9ICdERVNDJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzb3VyY2Uuc291cmNlID0gb3JkZXJlZFNvdXJjZTtcbiAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpKCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBjb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0xvY2FsaXphw6fDo28gZ2VvZ3LDoWZpY2EgZG9zIGFwb2lvcycpLFxuICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbil7XG4gICAgICAgICAgcmV0dXJuIG0oJy50YWJsZS1vdXRlci51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsICdFc3RhZG8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnQXBvaW9zwqDCoCcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpfSwgW1xuICAgICAgICAgICAgICAgICAgJ1IkIGFwb2lhZG9zICcsXG4gICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCcoJSBkbyB0b3RhbCnCoCcpLFxuICAgICAgICAgICAgICAgICAgJyAnLG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICBfLm1hcChjb250cmlidXRpb25Mb2NhdGlvbi5zb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2Uuc3RhdGVfYWNyb255bSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoc291cmNlLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnwqDCoCgnICsgc291cmNlLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIG1vZGVscywgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbi5nZXRQYWdlV2l0aFRva2VuKSxcbiAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJywgd2FpdGluZ19wYXltZW50OiAnZXEnfSksXG4gICAgICAgICAgZ2VuZXJhdGVTb3J0ID0gZnVuY3Rpb24od2FpdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy9GSVhNRTogbmVlZCB0byBmaW5kIGEgd2F5IHRvIHBhc3MgZmFsc2UgZmlsdGVyXG4gICAgICAgICAgICAgIGZpbHRlclZNLndhaXRpbmdfcGF5bWVudCh3YWl0aW5nKTtcbiAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG5cbiAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkpIHtcbiAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICB9XG5cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGlzdFZNOiBsaXN0Vk0sXG4gICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgZ2VuZXJhdGVTb3J0OiBnZW5lcmF0ZVNvcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgKGFyZ3MucHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC0xXCIsIFtcbiAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KGZhbHNlKX0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdJywgJ0NvbmZpcm1hZG9zJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgIG0oJ2lucHV0W2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdW3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3ZhbHVlPVwid2FpdGluZ19jb25maXJtYXRpb25cIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQodHJ1ZSl9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTVcIiwgW1xuICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl0nLCAnUGVuZGVudGVzJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgIDogJycpLFxuICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zJywgXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGNvbnRyaWJ1dGlvbikge1xuICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudGh1bWIudS1sZWZ0LnUtcm91bmRbc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwpID8gY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCA6ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJykgKyAnKTsgYmFja2dyb3VuZC1zaXplOiBjb250YWluO1wiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi1kYXJrW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi51c2VyX25hbWUpLFxuICAgICAgICAgICAgICAgICAgKGNvbnRyaWJ1dGlvbi5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAoY29udHJpYnV0aW9uLmFub255bW91cyA/IFttLnRydXN0KCcmbmJzcDstJm5ic3A7JyksIG0oJ3N0cm9uZycsICdBcG9pYWRvciBhbsO0bmltbycpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVksIGg6bW0nKSArICdoJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyA+IDEgPyAnQXBvaW91IGVzdGUgZSBtYWlzIG91dHJvcyAnICsgY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycgOiAnQXBvaW91IHNvbWVudGUgZXN0ZSBwcm9qZXRvIGF0w6kgYWdvcmEnKSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS0yMCcpXG4gICAgICAgICAgXSk7XG4gICAgICB9KSksXG4gICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JyxbXG4gICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7b25jbGljazogbGlzdC5uZXh0UGFnZX0sICdDYXJyZWdhciBtYWlzJykgOlxuICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RIZWFkZXIgPSAoZnVuY3Rpb24obSwgYyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGVhZGVyJywgW1xuICAgICAgICBtKCcudy1zZWN0aW9uLnBhZ2UtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQucHJvamVjdC1uYW1lW2l0ZW1wcm9wPVwibmFtZVwiXScsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICBtKCdoMi5mb250c2l6ZS1iYXNlLmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAncG9yICcsXG4gICAgICAgICAgICAgIHByb2plY3QudXNlci5uYW1lXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1zZWN0aW9uLnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5wcm9qZWN0LWhpZ2hsaWdodCcsIG0uY29tcG9uZW50KGMuUHJvamVjdEhpZ2hsaWdodCwge3Byb2plY3Q6IHByb2plY3R9KSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0U2lkZWJhciwge3Byb2plY3Q6IHByb2plY3R9KSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGlnaGxpZ2h0ID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRpc3BsYXlTaGFyZUJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICB9O1xuICAgIH0sXG4gICAgLy9GSVhNRTogQWRkIGltZyB3aGVuIHZpZGVvIGlzIG5vdCBwcmVzZW50XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGlnaGxpZ2h0JywgW1xuICAgICAgICAocHJvamVjdC52aWRlb19lbWJlZF91cmwgPyBtKCcudy1lbWJlZC53LXZpZGVvLnByb2plY3QtdmlkZW8ubWYnLCBbXG4gICAgICAgICAgbSgnaWZyYW1lLmVtYmVkbHktZW1iZWRbaXRlbXByb3A9XCJ2aWRlb1wiXVtzcmM9XCIgJyArIHByb2plY3QudmlkZW9fZW1iZWRfdXJsICsgJ1wiXVtmcmFtZWJvcmRlcj1cIjBcIl1bYWxsb3dGdWxsU2NyZWVuXScpXG4gICAgICAgIF0pIDogbSgnaW1nLnctZW1iZWQudy12aWRlby5wcm9qZWN0LXZpZGVvLm1mW3NyYz1cIicgKyAocHJvamVjdC52aWRlb19jb3Zlcl9pbWFnZSB8fCBwcm9qZWN0Lm9yaWdpbmFsX2ltYWdlKSArICdcIl0nKSksXG4gICAgICAgIG0oJy5wcm9qZWN0LWJsdXJiJywgcHJvamVjdC5oZWFkbGluZSksXG4gICAgICAgIG0oJy51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgKCFfLmlzTnVsbChwcm9qZWN0LmFkZHJlc3MpID9cbiAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodC51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwianM6dm9pZCgwKTtcIl0nLCBbXG4gICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlcicpLCAnICcgKyBwcm9qZWN0LmFkZHJlc3MuY2l0eSArICcsICcgKyBwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bVxuICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICksXG4gICAgICAgICAgbSgnYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0W2hyZWY9XCIvZXhwbG9yZS9ieV9jYXRlZ29yeV9pZC8jXCInICsgcHJvamVjdC5jYXRlZ29yeV9pZCArICddJywgW1xuICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS10YWcnKSwgJyAnLFxuICAgICAgICAgICAgcHJvamVjdC5jYXRlZ29yeV9uYW1lXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lW2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtvbmNsaWNrOiBjdHJsLmRpc3BsYXlTaGFyZUJveC50b2dnbGV9LCAnQ29tcGFydGlsaGFyJyksXG4gICAgICAgICAgKGN0cmwuZGlzcGxheVNoYXJlQm94KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3RTaGFyZUJveCwge3Byb2plY3Q6IHByb2plY3R9KSA6ICcnKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9IChmdW5jdGlvbihtLCBjLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBnZW5lcmF0ZVJvdXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCxcbiAgICAgICAgICAgICAgICBjX29wdHMgPSB7cHJvamVjdDogcHJvamVjdH0sXG4gICAgICAgICAgICAgICAgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgY19vcHRzKSksXG4gICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNjb21tZW50cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbW1lbnRzLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1snI2Fib3V0J107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaGFzaF07XG4gICAgICAgICAgfTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBtLnJlZHJhdywgZmFsc2UpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBnZW5lcmF0ZVJvdXRlczogZ2VuZXJhdGVSb3V0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmdlbmVyYXRlUm91dGVzKCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RQb3N0RGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pLFxuICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSk7XG5cbiAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkpIHtcbiAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgbGlzdCA9IGN0cmwubGlzdFZNO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgKF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCBmdW5jdGlvbihwb3N0KSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBvc3QnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSkpLFxuICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JyxbXG4gICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG4gICAgICBmaWx0ZXJWTS5vcmRlcih1bmRlZmluZWQpO1xuXG4gICAgICBtb2RlbHMucmV3YXJkRGV0YWlsLmdldFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAvL0ZJWE1FOiBNSVNTSU5HIEFESlVTVFNcbiAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgcmV0dXJuIG0oJyNyZXdhcmRzLnUtbWFyZ2luYm90dG9tLTMwJywgXy5tYXAoY3RybC5yZXdhcmREZXRhaWxzKCksIGZ1bmN0aW9uKHJld2FyZCkge1xuICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBcImNhcmQtZ29uZVwiIDogXCJjYXJkLXJld2FyZCBcIiArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSApICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pYWRvcicsICcgYXBvaWFkb3JlcycpKSxcbiAgICAgICAgICAgIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAnICggJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgOiAnJyksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/XG4gICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKSA6ICcnIClcbiAgICAgICAgXSk7XG4gICAgICB9KSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJvdyA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uO1xuICAgICAgcmV0dXJuIG0oXCIudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDBcIiwgW1xuICAgICAgICAgIG0oXCIudy1jb250YWluZXJcIiwgW1xuICAgICAgICAgICAgbShcIi53LXJvdy51LW1hcmdpbmJvdHRvbS0zMFwiLCBbXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTZcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC1sb29zZXJcIiwgY29sbGVjdGlvbi50aXRsZSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgICAgbShcImEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj0nL3B0L2V4cGxvcmU/cmVmPWhvbWVfXCIrY29sbGVjdGlvbi5oYXNoK1wiI1wiK2NvbGxlY3Rpb24uaGFzaCtcIiddXCIsIFwiVmVyIHRvZG9zXCIpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oXCIudy1yb3dcIiwgXy5tYXAoY29sbGVjdGlvbi5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICApKV1cbiAgICAgICAgICApXG4gICAgICAgIF0pXG5cbiAgICAgIDtcblxuICB9fTtcbn0od2luZG93Lm0pKTtcblxuIiwid2luZG93LmMuUHJvamVjdFNoYXJlQm94ID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywgW1xuICAgICAgICBtKCcudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0udy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsICdGZWNoYXInKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdDb21wYXJ0aWxoZSBlc3RlIHByb2pldG8nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgLy9tKCcuZmItc2hhcmUtYnV0dG9uW2RhdGEtaHJlZj1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnP3JlZj1mYWNlYm9va1wiXVtkYXRhLWxheW91dD1cImJ1dHRvbl9jb3VudFwiXScpXG4gICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjE1MHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS92Mi4wL3BsdWdpbnMvc2hhcmVfYnV0dG9uLnBocD9hcHBfaWQ9MTczNzQ3MDQyNjYxNDkxJmNoYW5uZWw9aHR0cHMlM0ElMkYlMkZzLXN0YXRpYy5hay5mYWNlYm9vay5jb20lMkZjb25uZWN0JTJGeGRfYXJiaXRlciUyRjQ0T3dLNzR1MEllLmpzJTNGdmVyc2lvbiUzRDQxJTIzY2IlM0RmN2Q5YjkwMGMlMjZkb21haW4lM0R3d3cuY2F0YXJzZS5tZSUyNm9yaWdpbiUzRGh0dHBzJTI1M0ElMjUyRiUyNTJGd3d3LmNhdGFyc2UubWUlMjUyRmY0YjNhZDBjOCUyNnJlbGF0aW9uJTNEcGFyZW50LnBhcmVudCZjb250YWluZXJfd2lkdGg9MCZocmVmPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyUzRnJlZiUzRGZhY2Vib29rJmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPXB0X0JSJnNkaz1qb2V5XCJdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LXdpZGdldC53LXdpZGdldC10d2l0dGVyLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgIF0pLFxuICAgICAgICAvL20oJ2Eudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XFwnI1xcJ10nLCAnPCBlbWJlZCA+JyksXG4gICAgICAgIG0oJy51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXRbdHlwZT1cInRleHRcIl1bdmFsdWU9XCI8aWZyYW1lIGZyYW1lYm9yZGVyPVwiMFwiIGhlaWdodD1cIjMxNHB4XCIgc3JjPVwiaHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9wdC9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0LmlkICsgJy9lbWJlZFwiIHdpZHRoPVwiMzAwcHhcIiBzY3JvbGxpbmc9XCJub1wiPjwvaWZyYW1lPlwiXScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmNhcmQtZW1iZWQnLCBbXG4gICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0LmlkICsgJy9lbWJlZFwiXVt3aWR0aD1cIjMwMHB4XCJdW3Njcm9sbGluZz1cIm5vXCJdJylcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cXCcjXFwnXScsIFtcbiAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZhY2Vib29rJyksJyBDb21wYXJ0aWxoZSdcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLXR3ZWV0LnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XFwnI1xcJ10nLCBbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS10d2l0dGVyJyksJyBUd2VldCdcbiAgICAgICAgXSksXG4gICAgICAgIC8vbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bVtocmVmPVxcJyNcXCddJywgW1xuICAgICAgICAvLyAgbSgnc3Bhbi5mYS5mYS13aGF0c2FwcCcsICcuJyksJyBXaGF0c2FwcCdcbiAgICAgICAgLy9dKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgZGlzcGxheUNhcmRDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnY2FyZC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIChzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gPyAnY2FyZCB1LXJhZGl1cyB6aW5kZXgtMTAgJyArIHN0YXRlc1twcm9qZWN0LnN0YXRlXSA6ICcnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnRXNzZSBwcm9qZXRvIGrDoSBmb2kgYXByb3ZhZG8gcGVsbyBDYXRhcnNlLiBFbSBicmV2ZSBlbGUgZW50cmFyw6Egbm8gYXIgZSBlc3RhcsOhIHByb250byBwYXJhIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICdvbmxpbmUnOiAnVm9jw6ogcG9kZSBhcG9pYXIgZXN0ZSBwcm9qZXRvIGF0w6kgbyBkaWEgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgw6BzIDIzaDU5bTU5cycsXG4gICAgICAgICAgICAgICdmYWlsZWQnOiAnRXN0ZSBwcm9qZXRvIG7Do28gYXRpbmdpdSBvIG3DrW5pbW8gZGUgUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkgKyAnIGF0w6kgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgZSBuw6NvIGZvaSBmaW5hbmNpYWRvJyxcbiAgICAgICAgICAgICAgJ3JlamVjdGVkJzogJ0VzdGUgcHJvamV0byBuw6NvIGZvaSBhY2VpdG8uIE7Do28gw6kgcG9zc8OtdmVsIHJlYWxpemFyIHVtIGFwb2lvLicsXG4gICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdFc3RlIHByb2pldG8gZXN0w6EgZW0gYW7DoWxpc2UgZSBhaW5kYSBuw6NvIGVzdMOhIGFiZXJ0byBwYXJhIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ0VzdGUgcHJvamV0byBmb2kgYmVtLXN1Y2VkaWRvIGUgZm9pIGZpbmFuY2lhZG8gZW0gJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSxcbiAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnTyBwcmF6byBkZSBjYXB0YcOnw6NvIGRlc3NlIHByb2pldG8gZXN0w6EgZW5jZXJyYWRvLiBFc3RhbW9zIGFndWFyZGFuZG8gYSBjb25maXJtYcOnw6NvIGRvcyDDumx0aW1vcyBwYWdhbWVudG9zLicsXG4gICAgICAgICAgICAgICdkcmFmdCc6ICdFc3RlIHByb2pldG8gw6kgYXBlbmFzIHVtIHJhc2N1bmhvIGUgYWluZGEgbsOjbyBwb2RlIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlDYXJkQ2xhc3M6IGRpc3BsYXlDYXJkQ2xhc3MsXG4gICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0OiBkaXNwbGF5U3RhdHVzVGV4dFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgdGltZU9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpO1xuXG4gICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMubWYnLCBbXG4gICAgICAgICAgbSgnLnctY2xlYXJmaXgudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS02LnctY29sLXNtYWxsLTQuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCkpLFxuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ2F0aW5naWRvcyBkZSBSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5nb2FsKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLXRpbnktMy53LWNvbC1zbWFsbC00LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsICdhcG9pb3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS0zLnctY29sLXNtYWxsLTQudS1tYXJnaW5ib3R0b20tMTAuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyB0aW1lT2JqLnRvdGFsIDogKHByb2plY3Qub25saW5lX2RheXMgfHwgMCkpKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsIFtcbiAgICAgICAgICAgICAgICBtKCdzcGFuW3N0eWxlPVwidGV4dC10cmFuc2Zvcm06Y2FwaXRhbGl6ZTtcIl0nLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyB0aW1lT2JqLnVuaXQgOiAnZGlhcycpKSxcbiAgICAgICAgICAgICAgICAnIHJlc3RhbnRlcydcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsICdBcG9pYXIgZXN0ZSBwcm9qZXRvJykgOiAnJyksXG4gICAgICAgICAgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LmZvbnR3ZWlnaHQtc2VtaWJvbGRbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywgW1xuICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNsb2NrLW8nKSxcbiAgICAgICAgICAgICAgJ8KgwqBMZW1icmFyLW1lJ1xuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICBtKCdkaXZbY2xhc3M9XCJmb250c2l6ZS1zbWFsbGVyIHUtbWFyZ2luYm90dG9tLTMwICcgKyAoY3RybC5kaXNwbGF5Q2FyZENsYXNzKCkpICsgJ1wiXScsIGN0cmwuZGlzcGxheVN0YXR1c1RleHQoKSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy51c2VyLWMnLCBtLmNvbXBvbmVudChjLlByb2plY3RVc2VyQ2FyZCwge3VzZXJJZDogcHJvamVjdC51c2VyX2lkfSkpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFRhYnMgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5wcm9qZWN0LW5hdi5tZicsW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgIC8vRklYTUU6IG5lZWQgdG8gYWRqdXN0IHJld2FyZHMgb24gbW9iaWxlXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICBtKCdhW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywgJ1NvYnJlJyksXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywgW1xuICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMnLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnYVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29udHJpYnV0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25zXCJdJywgW1xuICAgICAgICAgICAgICAgICdBcG9pb3MnLFxuICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2Uudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ2FbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywgW1xuICAgICAgICAgICAgICAgICdDb21lbnRhcmlvcycsXG4gICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RVc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgbW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbih1c2VyRGV0YWlscyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlsc1xuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCBmdW5jdGlvbih1c2VyRGV0YWlsKXtcbiAgICAgICAgcmV0dXJuIG0oJy51LW1hcmdpbmJvdHRvbS0zMC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LW1hcmdpbmJvdHRvbS0zMC51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cIm5hbWVcIl0nLFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzLCAnIGFwb2lhZG8nLCAnIGFwb2lhZG9zJylcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspe1xuICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHBhcnNlZExpbmsuaG9zdG5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuYWx0LWxpbmsuZm9udHdlaWdodC1zZW1pYm9sZFtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfSxcblxuICAgICAgICBncm91cENvbGxlY3Rpb24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBncm91cFRvdGFsKSB7XG4gICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgZnVuY3Rpb24oaSl7XG4gICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFtcbiAgICAgICAgICBfLm1hcChjdHJsLnZtLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsW1xuICAgICAgICAgICAgICBfLm1hcChncm91cCwgZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIuYmlnLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMTBbc3JjPVwiJyArIG1lbWJlci5pbWcgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtjb2xsZWN0aW9uOiBtLnByb3AoW10pfTtcblxuICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpe1xuICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICdIb2plIHNvbW9zICcgKyB0ZWFtVG90YWwubWVtYmVyX2NvdW50ICsgJyBwZXNzb2FzIGVzcGFsaGFkYXMgcG9yICcgKyB0ZWFtVG90YWwudG90YWxfY2l0aWVzICsgJyBjaWRhZGVzIGVtICcgKyB0ZWFtVG90YWwuY291bnRyaWVzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICcgcGHDrXNlcyAoJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMudG9TdHJpbmcoKSArICcpISBPIENhdGFyc2Ugw6kgaW5kZXBlbmRlbnRlLCBzZW0gaW52ZXN0aWRvcmVzLCBkZSBjw7NkaWdvIGFiZXJ0byBlIGNvbnN0cnXDrWRvIGNvbSBhbW9yLiBOb3NzYSBwYWl4w6NvIMOpIGNvbnN0cnVpciB1bSBhbWJpZW50ZSBvbmRlIGNhZGEgdmV6IG1haXMgcHJvamV0b3MgcG9zc2FtIGdhbmhhciB2aWRhLicpLFxuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCl7XG4gICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspe1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgIF0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLkNvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgYywgaCl7XG4gIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi5jb250cmlidXRpb25MaXN0Vk0sXG4gICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Qcm9qZWN0JyxcbiAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvbicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnUGF5bWVudFN0YXR1cycsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgaXRlbUFjdGlvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluSW5wdXRBY3Rpb24nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZ2V0S2V5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnY29udHJpYnV0aW9uX2lkJyxcbiAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdUcmFuc2ZlcmlyJyxcbiAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnSWQgZG8gbm92byBhcG9pYWRvcjonLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdUcmFuc2ZlcmlyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2V4OiAxMjk5MDgnLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5SYWRpb0FjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBnZXRLZXk6ICdwcm9qZWN0X2lkJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdjb250cmlidXRpb25faWQnLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncmV3YXJkX2lkJyxcbiAgICAgICAgICAgICAgICByYWRpb3M6ICdyZXdhcmRzJyxcbiAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBbHRlcmFyIFJlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICBnZXRNb2RlbDogYy5tb2RlbHMucHJvamVjdERldGFpbCxcbiAgICAgICAgICAgICAgICB1cGRhdGVNb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmNvbnRyaWJ1dGlvbi5wcm9qZWN0c0hvbWUgPSAoZnVuY3Rpb24obSwgYyl7XG4gIHJldHVybiB7XG5cbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2bSA9IHtyZWNvbW1lbmRlZENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgcmVjZW50Q29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBuZWFyTWVDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGV4cGlyaW5nQ29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG5cbiAgICAgICAgICBleHBpcmluZyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7ZXhwaXJlc19hdDogJ2x0ZScsIHN0YXRlOiAnZXEnfSk7XG4gICAgICAgICAgZXhwaXJpbmcuZXhwaXJlc19hdChtb21lbnQoKS5hZGQoMTQsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgICAgIGV4cGlyaW5nLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgIG5lYXJNZSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7bmVhcl9tZTogJ2VxJywgc3RhdGU6ICdlcSd9KTtcbiAgICAgICAgICBuZWFyTWUubmVhcl9tZSgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgIHJlY2VudHMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe29ubGluZV9kYXRlOiAnZ3RlJywgc3RhdGU6ICdlcSd9KTtcbiAgICAgICAgICByZWNlbnRzLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgICAgIHJlY2VudHMuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgcmVjb21tZW5kZWQgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3JlY29tbWVuZGVkOiAnZXEnLCBzdGF0ZTogJ2VxJ30pO1xuICAgICAgICAgIHJlY29tbWVuZGVkLnJlY29tbWVuZGVkKCd0cnVlJykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICBwcm9qZWN0LmdldFBhZ2UobmVhck1lLnBhcmFtZXRlcnMoKSkudGhlbih2bS5uZWFyTWVDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShyZWNvbW1lbmRlZC5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShyZWNlbnRzLnBhcmFtZXRlcnMoKSkudGhlbih2bS5yZWNlbnRDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShleHBpcmluZy5wYXJhbWV0ZXJzKCkpLnRoZW4odm0uZXhwaXJpbmdDb2xsZWN0aW9uKTtcblxuXG4gICAgICB2YXIgY29sbGVjdGlvbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIHZvY8OqJyxcbiAgICAgICAgICBoYXNoOiAnbmVhcl9vZicsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ubmVhck1lQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgIGhhc2g6ICdyZWNvbW1lbmRlZCcsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ05hIHJldGEgZmluYWwnLFxuICAgICAgICAgIGhhc2g6ICdleHBpcmluZycsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0uZXhwaXJpbmdDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICBoYXNoOiAncmVjZW50JyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5yZWNlbnRDb2xsZWN0aW9uXG4gICAgICAgIH1cbiAgICAgIF07XG5cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBfLm1hcChjdHJsLmNvbGxlY3Rpb25zLCBmdW5jdGlvbihjb2xsZWN0aW9uKXtcbiAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7Y29sbGVjdGlvbjogY29sbGVjdGlvbn0pO1xuICAgICAgICB9KV07XG5cbiAgfX07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMucHJvamVjdC5JbnNpZ2h0cyA9IChmdW5jdGlvbihtLCBjLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKHByb2plY3REZXRhaWxzKTtcbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheS5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKGNvbnRyaWJ1dGlvbnNQZXJEYXkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7cmVzb3VyY2U6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge3Jlc291cmNlOiBwcm9qZWN0fSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5LCB7Y29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvbkFtb3VudFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSwge3Jlc291cmNlSWQ6IGN0cmwudm0ucHJvamVjdF9pZCgpfSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfShwcm9qZWN0KSlcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMucHJvamVjdC5TaG93ID0gKGZ1bmN0aW9uKG0sIGMsIF8sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlsc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgIHJldHVybiBtKCcucHJvamVjdC1zaG93JywgW1xuICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdEhlYWRlciwge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RUYWJzLCB7cHJvamVjdDogcHJvamVjdH0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtwcm9qZWN0OiBwcm9qZWN0fSlcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMucGFnZXMuVGVhbSA9IChmdW5jdGlvbihtLCBjKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJyxbXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcyl7XG4gIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgIHN0YXRlOiAnZXEnLFxuICAgIGdhdGV3YXk6ICdlcScsXG4gICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgfSksXG5cbiAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApe1xuICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gIH07XG5cbiAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gIHZtLnN0YXRlKCcnKTtcbiAgdm0uZ2F0ZXdheSgnJyk7XG4gIHZtLm9yZGVyKHtpZDogJ2Rlc2MnfSk7XG5cbiAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gIH07XG5cbiAgdm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZm9ybWF0KCk7XG4gIH07XG5cbiAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgfTtcblxuICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=