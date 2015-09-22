"use strict";

window.c = (function () {
  return {
    models: {},
    pages: {},
    contribution: {},
    admin: {},
    project: {},
    h: {}
  };
})();
'use strict';

window.c.h = (function (m, moment) {
  //Date Helpers
  var momentify = function momentify(date, format) {
    format = format || 'DD/MM/YYYY';
    return date ? moment(date).format(format) : 'no date';
  },
      momentFromString = function momentFromString(date, format) {
    var european = moment(date, format || 'DD/MM/YYYY');
    return european.isValid() ? european : moment(date);
  },

  //Number formatting helpers
  generateFormatNumber = function generateFormatNumber(s, c) {
    return function (number, n, x) {
      if (number === null || number === undefined) {
        return null;
      }

      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
          num = number.toFixed(Math.max(0, ~ ~n));
      return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
  },
      formatNumber = generateFormatNumber('.', ','),

  //Object manipulation helpers
  generateRemaingTime = function generateRemaingTime(project) {
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
      toggleProp = function toggleProp(defaultState, alternateState) {
    var p = m.prop(defaultState);
    p.toggle = function () {
      p(p() === alternateState ? defaultState : alternateState);
    };

    return p;
  },
      idVM = m.postgrest.filtersVM({ id: 'eq' }),

  //Templates
  loader = function loader() {
    return m('.u-text-center.u-margintop-30[style="margin-bottom:-110px;"]', [m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
  };

  return {
    momentify: momentify,
    momentFromString: momentFromString,
    formatNumber: formatNumber,
    idVM: idVM,
    toggleProp: toggleProp,
    generateRemaingTime: generateRemaingTime,
    loader: loader
  };
})(window.m, window.moment);
'use strict';

window.c.models = (function (m) {
  var contributionDetail = m.postgrest.model('contribution_details'),
      projectDetail = m.postgrest.model('project_details'),
      contributions = m.postgrest.model('contributions'),
      teamTotal = m.postgrest.model('team_totals'),
      projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
      projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
      project = m.postgrest.model('projects'),
      teamMember = m.postgrest.model('team_members'),
      userDetail = m.postgrest.model('user_details');
  teamMember.pageSize(40);
  project.pageSize(3);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    userDetail: userDetail,
    project: project,
    projectContributionsPerDay: projectContributionsPerDay,
    projectContributionsPerLocation: projectContributionsPerLocation
  };
})(window.m);
'use strict';

window.c.AdminContribution = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var contribution = args.item;
      return m('.w-row.admin-contribution', [m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m('.fontsize-smallest', ['ID do Gateway: ', m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminDetail = (function (m, _, c) {
  return {
    controller: function controller() {},
    view: function view(ctrl, args) {
      var actions = args.actions,
          item = args.item;
      return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', _.map(actions, function (action) {
        return m.component(c[action.component], { data: action.data, item: args.item });
      })), m('.w-row.card.card-terciary.u-radius', [m.component(c.AdminTransaction, { contribution: item }), m.component(c.AdminTransactionHistory, { contribution: item }), m.component(c.AdminReward, { contribution: item, key: item.key })])]);
    }
  };
})(window.m, window._, window.c);
'use strict';

window.c.AdminFilter = (function (c, m, _, h) {
  return {
    controller: function controller() {
      return {
        toggler: h.toggleProp(false, true)
      };
    },
    view: function view(ctrl, args) {
      var filterBuilder = args.filterBuilder,
          main = _.findWhere(filterBuilder, { component: 'FilterMain' });

      return m('#admin-contributions-filter.w-section.page-header', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-30', 'Apoios'), m('.w-form', [m('form', {
        onsubmit: args.submit
      }, [_.findWhere(filterBuilder, { component: 'FilterMain' }) ? m.component(c[main.component], main.data) : '', m('.u-marginbottom-20.w-row', m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
        onclick: ctrl.toggler.toggle
      }, 'Filtros avançados  >')), ctrl.toggler() ? m('#advanced-search.w-row.admin-filters', [_.map(filterBuilder, function (f) {
        return f.component !== 'FilterMain' ? m.component(c[f.component], f.data) : '';
      })]) : ''])])])]);
    }
  };
})(window.c, window.m, window._, window.c.h);
'use strict';

window.c.AdminInputAction = (function (m, h, c) {
  return {
    controller: function controller(args) {
      var builder = args.data,
          complete = m.prop(false),
          error = m.prop(false),
          fail = m.prop(false),
          data = {},
          item = args.item,
          key = builder.property,
          newValue = m.prop(builder.forceValue || '');

      h.idVM.id(item[builder.updateKey]);

      var l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

      var updateItem = function updateItem(res) {
        _.extend(item, res[0]);
        complete(true);
        error(false);
      };

      var submit = function submit() {
        data[key] = newValue();
        l.load().then(updateItem, error);
        return false;
      };

      var unload = function unload(el, isinit, context) {
        context.onunload = function () {
          complete(false);
          error(false);
          newValue(builder.forceValue || '');
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
    view: function view(ctrl, args) {
      var data = args.data,
          btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
        onclick: ctrl.toggler.toggle
      }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', { config: ctrl.unload }, [m('form.w-form', {
        onsubmit: ctrl.submit
      }, !ctrl.complete() ? [m('label', data.innerLabel), !data.forceValue ? m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', { onchange: m.withAttr('value', ctrl.newValue), value: ctrl.newValue() }) : '', m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Apoio transferido com sucesso!')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição. O apoio não foi transferido!')])])]) : '']);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminItem = (function (m, _, h, c) {
  return {
    controller: function controller(args) {

      var displayDetailBox = h.toggleProp(false, true);

      return {
        displayDetailBox: displayDetailBox
      };
    },

    view: function view(ctrl, args) {
      var item = args.item;

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [m('.w-row', [_.map(args.builder, function (desc) {
        return m(desc.wrapperClass, [m.component(c[desc.component], { item: item, key: item.key })]);
      })]), m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', { onclick: ctrl.displayDetailBox.toggle }), ctrl.displayDetailBox() ? m.component(c.AdminDetail, { item: item, actions: args.actions, key: item.key }) : '']);
    }
  };
})(window.m, window._, window.c.h, window.c);
'use strict';

window.c.AdminList = (function (m, h, c) {
  var admin = c.admin;
  return {
    controller: function controller(args) {
      var list = args.vm.list;
      if (!list.collection().length && list.firstPage) {
        list.firstPage().then(null, function (serverError) {
          args.vm.error(serverError.message);
        });
      }
    },

    view: function view(ctrl, args) {
      var list = args.vm.list,
          error = args.vm.error;
      return m('.w-section.section', [m('.w-container', error() ? m('.card.card-error.u-radius.fontweight-bold', error()) : [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-9', [m('.fontsize-base', list.isLoading() ? 'Carregando ...' : [m('span.fontweight-semibold', list.total()), ' dados encontrados'])])]), m('#admin-contributions-list.w-container', [list.collection().map(function (item) {
        return m.component(c.AdminItem, { builder: args.itemBuilder, actions: args.itemActions, item: item, key: item.key });
      }), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? m('button#load-more.btn.btn-medium.btn-terciary', { onclick: list.nextPage }, 'Carregar mais') : h.loader()])])])])])])]);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminProjectDetailsCard = (function (m, h) {
  return {
    controller: function controller(args) {
      var project = args.resource,
          generateStatusText = function generateStatusText() {
        var statusTextObj = m.prop({}),
            statusText = {
          online: { cssClass: 'text-success', text: 'NO AR' },
          successful: { cssClass: 'text-success', text: 'FINANCIADO' },
          failed: { cssClass: 'text-error', text: 'NÃO FINANCIADO' },
          waiting_funds: { cssClass: 'text-waiting', text: 'AGUARDANDO' },
          rejected: { cssClass: 'text-error', text: 'RECUSADO' },
          draft: { cssClass: '', text: 'RASCUNHO' },
          in_analysis: { cssClass: '', text: 'EM ANÁLISE' },
          approved: { cssClass: 'text-success', text: 'APROVADO' }
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

    view: function view(ctrl) {
      var project = ctrl.project,
          progress = project.progress.toFixed(2),
          statusTextObj = ctrl.statusTextObj(),
          remainingTextObj = ctrl.remainingTextObj();

      return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m('div', [m('.fontsize-small.fontweight-semibold', [m('span.fontcolor-secondary', 'Status:'), ' ', m('span', { 'class': statusTextObj.cssClass }, statusTextObj.text), ' ']), (function () {
        if (project.is_published) {
          return [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)]), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' restantes')])])];
        }
      })()])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminProjectDetailsExplanation = (function (m, h) {
  return {
    controller: function controller(args) {
      var explanation = function explanation(resource) {
        var stateText = {
          online: [m('span', 'Você pode receber apoios até 23hs59min59s do dia ' + h.momentify(resource.zone_expires_at) + '. Lembre-se, é tudo-ou-nada e você só levará os recursos captados se bater a meta dentro desse prazo.')],
          successful: [m('span.fontweight-semibold', resource.user.name + ', comemore que você merece!'), ' Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ', 'Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ', m('a.alt-link[href="/guides"]', 'Guia dos Realizadores'), ' e de informar-se sobre ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')],
          waiting_funds: [m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'), ' Seu projeto foi finalizado em ' + h.momentify(resource.zone_expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ', 'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.')],
          failed: [m('span.fontweight-semibold', resource.user.name + ', não desanime!'), ' Seu projeto não bateu a meta e sabemos que isso não é a melhor das sensações. Mas não desanime. ', 'Encare o processo como um aprendizado e não deixe de cogitar uma segunda tentativa. Não se preocupe, todos os seus apoiadores receberão o dinheiro de volta. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202365507-Regras-e-funcionamento-dos-reembolsos-estornos"][target="_blank"]', 'Entenda como fazemos estornos e reembolsos.')],
          rejected: [m('span.fontweight-semibold', resource.user.name + ', infelizmente não foi desta vez.'), ' Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ', 'Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ', 'Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', 'critérios da plataforma'), ' e no ', m('a.alt-link[href="/guides"]', 'guia dos realizadores'), '.'],
          draft: [m('span.fontweight-semibold', resource.user.name + ', construa o seu projeto!'), ' Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ', 'Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ', 'Quando tudo estiver pronto, clique no botão ENVIAR e entraremos em contato para avaliar o seu projeto.'],
          in_analysis: [m('span.fontweight-semibold', resource.user.name + ', você enviou seu projeto para análise em ' + h.momentify(resource.sent_to_analysis_at) + ' e receberá nossa avaliação em até 4 dias úteis após o envio!'), ' Enquanto espera a sua resposta, você pode continuar editando o seu projeto. ', 'Recomendamos também que você vá coletando feedback com as pessoas próximas e planejando como será a sua campanha.'],
          approved: [m('span.fontweight-semibold', resource.user.name + ', seu projeto foi aprovado!'), ' Para colocar o seu projeto no ar é preciso apenas que você preencha os dados necessários na aba ', m('a.alt-link[href="#user_settings"]', 'Conta'), '. É importante saber que cobramos a taxa de 13% do valor total arrecadado apenas por projetos bem sucedidos. Entenda ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como fazemos o repasse do dinheiro.')]
        };

        return stateText[resource.state];
      };

      return {
        explanation: explanation(args.resource)
      };
    },
    view: function view(ctrl, args) {
      return m('p.' + args.resource.state + '-project-text.fontsize-small.lineheight-loose', ctrl.explanation);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminProject = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var project = args.item;
      return m('.w-row.admin-project', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m('.fontsize-smallest.fontweight-semibold', project.project_state), m('.fontsize-smallest.fontcolor-secondary', h.momentify(project.project_online_date) + ' a ' + h.momentify(project.project_expires_at))])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminRadioAction = (function (m, h, c) {
  return {
    controller: function controller(args) {
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

      var updateItem = function updateItem(data) {
        _.extend(item, data[0]);
        complete(true);
      };

      var fetch = function fetch() {
        getLoader.load().then(function (item) {
          radios(item[0][getAttr]);
        }, error);
      };

      var submit = function submit() {
        if (newValue()) {
          data[builder.property] = newValue();
          setLoader.load().then(updateItem, error);
        }
        return false;
      };

      var unload = function unload(el, isinit, context) {
        context.onunload = function () {
          complete(false);
          error(false);
          newValue('');
        };
      };

      var setDescription = function setDescription(text) {
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
    view: function view(ctrl, args) {
      var data = args.data,
          btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
        onclick: ctrl.toggler.toggle
      }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', { config: ctrl.unload }, [m('form.w-form', {
        onsubmit: ctrl.submit
      }, !ctrl.complete() ? [ctrl.radios() ? _.map(ctrl.radios(), function (radio, index) {
        var set = function set() {
          ctrl.newValue(radio.id);
          ctrl.setDescription(radio.description);
        };
        var selected = radio.id === args.item.reward.id ? true : false;

        return m('.w-radio', [m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
          onclick: set
        }), m('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
      }) : h.loader(), m('strong', 'Descrição'), m('p', ctrl.description()), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Recompensa alterada com sucesso!')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição. O apoio não foi transferido!')])])]) : '']);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminReward = (function (m, h, _) {
  return {
    view: function view(ctrl, args) {
      var reward = args.contribution.reward || {},
          available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m('.fontsize-smallest.lineheight-looser', _.isEmpty(reward) ? 'Apoio sem recompensa.' : ['ID: ' + reward.id, m('br'), 'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3), m('br'), m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m('br'), 'Descrição: ' + reward.description])]);
    }
  };
})(window.m, window.c.h, window._);
'use strict';

window.c.AdminTransactionHistory = (function (m, h, _) {
  return {
    controller: function controller(args) {
      var contribution = args.contribution,
          mapEvents = _.reduce([{ date: contribution.paid_at, name: 'Apoio confirmado' }, { date: contribution.pending_refund_at, name: 'Reembolso solicitado' }, { date: contribution.refunded_at, name: 'Estorno realizado' }, { date: contribution.created_at, name: 'Apoio criado' }, { date: contribution.refused_at, name: 'Apoio cancelado' }, { date: contribution.deleted_at, name: 'Apoio excluído' }, { date: contribution.chargeback_at, name: 'Chargeback' }], function (memo, item) {
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

    view: function view(ctrl) {
      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'), ctrl.orderedEvents.map(function (cEvent) {
        return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-6', [m('.fontcolor-secondary', cEvent.date)]), m('.w-col.w-col-6', [m('div', cEvent.name)])]);
      })]);
    }
  };
})(window.m, window.c.h, window._);
'use strict';

window.c.AdminTransaction = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var contribution = args.contribution;
      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m('.fontsize-smallest.lineheight-looser', ['Valor: R$' + h.formatNumber(contribution.value, 2, 3), m('br'), 'Taxa: R$' + h.formatNumber(contribution.gateway_fee, 2, 3), m('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), m('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), m('br'), 'Id pagamento: ' + contribution.gateway_id, m('br'), 'Apoio: ' + contribution.contribution_id, m('br'), 'Chave: \n', m('br'), contribution.key, m('br'), 'Meio: ' + contribution.gateway, m('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m('br'), (function () {
        if (contribution.is_second_slip) {
          return [m('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m('span.badge', '2a via')];
        }
      })()])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminUser = (function (m) {
  return {
    view: function view(ctrl, args) {
      var user = args.item;
      var userProfile = function userProfile() {
        return user.user_profile_img || '/assets/catarse_bootstrap/user.jpg';
      };
      return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + userProfile() + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name)]), m('.fontsize-smallest', 'Usuário: ' + user.user_id), m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + user.email), m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + user.payer_email)])]);
    }
  };
})(window.m);
'use strict';

window.c.FilterDateRange = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
        onchange: m.withAttr('value', args.first),
        value: args.first()
      })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
        onchange: m.withAttr('value', args.last),
        value: args.last()
      })])])]);
    }
  };
})(window.m);
'use strict';

window.c.FilterDropdown = (function (m, _) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('select.w-select.text-field.positive[id="' + args.index + '"]', {
        onchange: m.withAttr('value', args.vm),
        value: args.vm()
      }, [_.map(args.options, function (data) {
        return m('option[value="' + data.value + '"]', data.option);
      })])]);
    }
  };
})(window.m, window._);
'use strict';

window.c.FilterMain = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-row', [m('.w-col.w-col-10', [m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', { onchange: m.withAttr('value', args.vm), value: args.vm() })]), m('.w-col.w-col-2', [m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]')])]);
    }
  };
})(window.m);
'use strict';

window.c.FilterNumberRange = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
        onchange: m.withAttr('value', args.first),
        value: args.first()
      })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
        onchange: m.withAttr('value', args.last),
        value: args.last()
      })])])]);
    }
  };
})(window.m);
'use strict';

window.c.PaymentStatus = (function (m) {
  return {
    controller: function controller(args) {
      var payment = args.item,
          card = null,
          displayPaymentMethod,
          paymentMethodClass,
          stateClass;

      card = function () {
        if (payment.gateway_data) {
          switch (payment.gateway.toLowerCase()) {
            case 'moip':
              return {
                first_digits: payment.gateway_data.cartao_bin,
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

      displayPaymentMethod = function () {
        switch (payment.payment_method.toLowerCase()) {
          case 'boletobancario':
            return m('span#boleto-detail', '');
          case 'cartaodecredito':
            var cardData = card();
            if (cardData) {
              return m('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [cardData.first_digits + '******' + cardData.last_digits, m('br'), cardData.brand + ' ' + payment.installments + 'x']);
            }
            return '';
        }
      };

      paymentMethodClass = function () {
        switch (payment.payment_method.toLowerCase()) {
          case 'boletobancario':
            return '.fa-barcode';
          case 'cartaodecredito':
            return '.fa-credit-card';
          default:
            return '.fa-question';
        }
      };

      stateClass = function () {
        switch (payment.state) {
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

    view: function view(ctrl, args) {
      var payment = args.item;
      return m('.w-row.payment-status', [m('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state]), m('.fontsize-smallest.fontweight-semibold', [m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', payment.payment_method)]), m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
    }
  };
})(window.m);
'use strict';

window.c.ProjectCard = (function (m, h, models) {
  return {

    view: function view(ctrl, args) {
      var project = args.project,
          progress = project.progress.toFixed(2),
          remainingTextObj = h.generateRemaingTime(project)();

      return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + project.permalink + '"]', { style: { 'background-image': 'url(' + project.project_img + ')', 'display': 'block' } }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="/' + project.permalink + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="/' + project.permalink + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter', [m('.meter', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + project.pledged), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', 'Restantes')])])])])]);
    }
  };
})(window.m, window.c.h, window.c.models);
'use strict';

window.c.ProjectChartContributionAmountPerDay = (function (m, Chart, _, h) {
  return {
    controller: function controller(args) {
      var resource = args.collection()[0],
          mountDataset = function mountDataset() {
        return [{
          label: 'R$ arrecadados por dia',
          fillColor: 'rgba(126,194,69,0.2)',
          strokeColor: 'rgba(126,194,69,1)',
          pointColor: 'rgba(126,194,69,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: _.map(resource.source, function (item) {
            return item.total_amount;
          })
        }];
      },
          renderChart = function renderChart(element, isInitialized) {
        if (isInitialized) {
          return;
        }

        Object.defineProperty(element, 'offsetHeight', {
          get: function get() {
            return element.height;
          }
        });
        Object.defineProperty(element, 'offsetWidth', {
          get: function get() {
            return element.width;
          }
        });
        var ctx = element.getContext('2d');

        new Chart(ctx).Line({
          labels: _.map(resource.source, function (item) {
            return h.momentify(item.paid_at);
          }),
          datasets: mountDataset()
        });
      };

      return {
        renderChart: renderChart
      };
    },
    view: function view(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'R$ arrecadados por dia'), m('.w-row', [m('.w-col.w-col-12', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
    }
  };
})(window.m, window.Chart, window._, window.c.h);
'use strict';

window.c.ProjectChartContributionTotalPerDay = (function (m, Chart, _, h) {
  return {
    controller: function controller(args) {
      var resource = args.collection()[0],
          mountDataset = function mountDataset() {
        return [{
          label: 'Apoios confirmados por dia',
          fillColor: 'rgba(126,194,69,0.2)',
          strokeColor: 'rgba(126,194,69,1)',
          pointColor: 'rgba(126,194,69,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: _.map(resource.source, function (item) {
            return item.total;
          })
        }];
      },
          renderChart = function renderChart(element, isInitialized) {
        if (isInitialized) {
          return;
        }

        Object.defineProperty(element, 'offsetHeight', {
          get: function get() {
            return element.height;
          }
        });
        Object.defineProperty(element, 'offsetWidth', {
          get: function get() {
            return element.width;
          }
        });
        var ctx = element.getContext('2d');

        new Chart(ctx).Line({
          labels: _.map(resource.source, function (item) {
            return h.momentify(item.paid_at);
          }),
          datasets: mountDataset()
        });
      };

      return {
        renderChart: renderChart
      };
    },
    view: function view(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Apoios confirmados por dia'), m('.w-row', [m('.w-col.w-col-12', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
    }
  };
})(window.m, window.Chart, window._, window.c.h);
'use strict';

window.c.ProjectContributionsPerLocationTable = (function (m, models, h, _) {
  return {
    controller: function controller(args) {
      var vm = m.postgrest.filtersVM({ project_id: 'eq' }),
          contributionsPerLocation = m.prop([]),
          generateSort = function generateSort(field) {
        return function () {
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
          resource.orderFilter = resource.orderFilter === 'DESC' ? 'ASC' : 'DESC';
          contributionsPerLocation(collection);
        };
      };

      vm.project_id(args.resourceId);

      models.projectContributionsPerLocation.getRow(vm.parameters()).then(function (data) {
        contributionsPerLocation(data);
        generateSort('total_contributed')();
      });

      return {
        contributionsPerLocation: contributionsPerLocation,
        generateSort: generateSort
      };
    },
    view: function view(ctrl) {
      return m('.project-contributions-per-location', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Localização geográfica dos apoios'), ctrl.contributionsPerLocation().map(function (contributionLocation) {
        return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', 'Estado')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', { onclick: ctrl.generateSort('total_contributions') }, ['Apoios  ', m('span.fa.fa-sort')])]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', { onclick: ctrl.generateSort('total_contributed') }, ['R$ apoiados ', m('span.w-hidden-small.w-hidden-tiny', '(% do total) '), ' ', m('span.fa.fa-sort')])])]), m('.table-inner.fontsize-small', [_.map(contributionLocation.source, function (source) {
          return m('.w-row.table-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.state_acronym)]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.total_contributions)]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', ['R$ ', h.formatNumber(source.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', '  (' + source.total_on_percentage.toFixed(2) + '%)')])])]);
        })])]);
      })]);
    }
  };
})(window.m, window.c.models, window.c.h, window._);
'use strict';

window.c.ProjectReminderCount = (function (m) {
  return {
    view: function view(ctrl, args) {
      var project = args.resource;
      return m('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), m('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), m('.fontsize-jumbo', project.reminder_count)]);
    }
  };
})(window.m);
'use strict';

window.c.ProjectRow = (function (m) {
  return {

    view: function view(ctrl, args) {
      var collection = args.collection;
      return collection.collection().length > 0 ? m('.w-section.section.u-marginbottom-40', [m('.w-container', [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=home_' + collection.hash + '#' + collection.hash + '"]', 'Ver todos')])]), m('.w-row', _.map(collection.collection(), function (project) {
        return m.component(c.ProjectCard, { project: project });
      }))])]) : m('');
    } };
})(window.m);
'use strict';

window.c.TeamMembers = (function (_, m, models) {
  return {
    controller: function controller() {
      var vm = { collection: m.prop([]) },
          groupCollection = function groupCollection(collection, groupTotal) {
        return _.map(_.range(Math.ceil(collection.length / groupTotal)), function (i) {
          return collection.slice(i * groupTotal, (i + 1) * groupTotal);
        });
      };

      models.teamMember.getPage().then(function (data) {
        vm.collection(groupCollection(data, 4));
      });

      return {
        vm: vm
      };
    },

    view: function view(ctrl) {
      return m('#team-members-static.w-section.section', [m('.w-container', [_.map(ctrl.vm.collection(), function (group) {
        return m('.w-row.u-text-center', [_.map(group, function (member) {
          return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [m('a.alt-link[href="/users/' + member.id + '"]', [m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m('.fontweight-semibold.fontsize-base', member.name)]), m('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')]);
        })]);
      })])]);
    }
  };
})(window._, window.m, window.c.models);
'use strict';

window.c.TeamTotal = (function (m, h, models) {
  return {
    controller: function controller() {
      var vm = { collection: m.prop([]) };

      models.teamTotal.getRow().then(function (data) {
        vm.collection(data);
      });

      return {
        vm: vm
      };
    },

    view: function view(ctrl) {
      return m('#team-total-static.w-section.section-one-column.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
        return m('.w-container', [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m('.w-col.w-col-2')])]);
      })]);
    }
  };
})(window.m, window.c.h, window.c.models);
'use strict';

window.c.admin.Contributions = (function (m, c, h) {
  var admin = c.admin;
  return {
    controller: function controller() {
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          error = m.prop(''),
          itemBuilder = [{
        component: 'AdminUser',
        wrapperClass: '.w-col.w-col-4'
      }, {
        component: 'AdminProject',
        wrapperClass: '.w-col.w-col-4'
      }, {
        component: 'AdminContribution',
        wrapperClass: '.w-col.w-col-2'
      }, {
        component: 'PaymentStatus',
        wrapperClass: '.w-col.w-col-2'
      }],
          itemActions = [{
        component: 'AdminInputAction',
        data: {
          property: 'user_id',
          updateKey: 'id',
          callToAction: 'Transferir',
          innerLabel: 'Id do novo apoiador:',
          outerLabel: 'Transferir Apoio',
          placeholder: 'ex: 129908',
          model: c.models.contributionDetail
        }
      }, {
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
      }, {
        component: 'AdminInputAction',
        data: {
          property: 'state',
          updateKey: 'id',
          callToAction: 'Apagar',
          innerLabel: 'Tem certeza que deseja apagar esse apoio?',
          outerLabel: 'Apagar Apoio',
          forceValue: 'deleted',
          model: c.models.contributionDetail
        }
      }],
          filterBuilder = [{ //full_text_index
        component: 'FilterMain',
        data: {
          vm: filterVM.full_text_index,
          placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
        }
      }, { //state
        component: 'FilterDropdown',
        data: {
          label: 'Com o estado',
          name: 'state',
          vm: filterVM.state,
          options: [{ value: '', option: 'Qualquer um' }, { value: 'paid', option: 'paid' }, { value: 'refused', option: 'refused' }, { value: 'pending', option: 'pending' }, { value: 'pending_refund', option: 'pending_refund' }, { value: 'refunded', option: 'refunded' }, { value: 'chargeback', option: 'chargeback' }, { value: 'deleted', option: 'deleted' }]
        }
      }, { //gateway
        component: 'FilterDropdown',
        data: {
          label: 'gateway',
          name: 'gateway',
          vm: filterVM.gateway,
          options: [{ value: '', option: 'Qualquer um' }, { value: 'Pagarme', option: 'Pagarme' }, { value: 'MoIP', option: 'MoIP' }, { value: 'PayPal', option: 'PayPal' }, { value: 'Credits', option: 'Créditos' }]
        }
      }, { //value
        component: 'FilterNumberRange',
        data: {
          label: 'Valores entre',
          first: filterVM.value.gte,
          last: filterVM.value.lte
        }
      }, { //created_at
        component: 'FilterDateRange',
        data: {
          label: 'Período do apoio',
          first: filterVM.created_at.gte,
          last: filterVM.created_at.lte
        }
      }],
          submit = function submit() {
        listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
          error(serverError.message);
        });
        return false;
      };

      return {
        filterVM: filterVM,
        filterBuilder: filterBuilder,
        itemActions: itemActions,
        itemBuilder: itemBuilder,
        listVM: { list: listVM, error: error },
        submit: submit
      };
    },

    view: function view(ctrl) {
      return [m.component(c.AdminFilter, { form: ctrl.filterVM.formDescriber, filterBuilder: ctrl.filterBuilder, submit: ctrl.submit }), m.component(c.AdminList, { vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions })];
    }
  };
})(window.m, window.c, window.c.h);
'use strict';

window.c.admin.Users = (function (m, c, h) {
  var admin = c.admin;
  return {
    controller: function controller() {
      var listVM = admin.userListVM,
          error = m.prop(''),
          itemBuilder = [{
        component: 'AdminUser',
        wrapperClass: '.w-col.w-col-4'
      }],
          submit = function submit() {
        listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
          error(serverError.message);
        });
        return false;
      };

      return {
        itemActions: [],
        itemBuilder: itemBuilder,
        listVM: { list: listVM, error: error },
        submit: submit
      };
    },

    view: function view(ctrl) {
      return [m.component(c.AdminList, { vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions })];
    }
  };
})(window.m, window.c, window.c.h);
'use strict';

window.c.contribution.projectsHome = (function (m, c) {
  return {
    controller: function controller() {
      var vm = {
        recommendedCollection: m.prop([]),
        recentCollection: m.prop([]),
        nearMeCollection: m.prop([]),
        expiringCollection: m.prop([])
      },
          project = c.models.project,
          expiring = m.postgrest.filtersVM({ expires_at: 'lte', state: 'eq' }),
          nearMe = m.postgrest.filtersVM({ near_me: 'eq', state: 'eq' }),
          recents = m.postgrest.filtersVM({ online_date: 'gte', state: 'eq' }),
          recommended = m.postgrest.filtersVM({ recommended: 'eq', state: 'eq' });

      expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
      expiring.state('online');

      nearMe.near_me('true').state('online');

      recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
      recents.state('online');

      recommended.recommended('true').state('online');

      project.getPage(nearMe.parameters()).then(vm.nearMeCollection);
      project.getPage(recommended.parameters()).then(vm.recommendedCollection);
      project.getPage(recents.parameters()).then(vm.recentCollection);
      project.getPage(expiring.parameters()).then(vm.expiringCollection);

      var collections = [{
        title: 'Próximos a você',
        hash: 'near_of',
        collection: vm.nearMeCollection
      }, {
        title: 'Recomendados',
        hash: 'recommended',
        collection: vm.recommendedCollection
      }, {
        title: 'Na reta final',
        hash: 'expiring',
        collection: vm.expiringCollection
      }, {
        title: 'Recentes',
        hash: 'recent',
        collection: vm.recentCollection
      }];

      return {
        collections: collections
      };
    },

    view: function view(ctrl) {
      return _.map(ctrl.collections, function (collection) {
        return m.component(c.ProjectRow, { collection: collection });
      });
    }
  };
})(window.m, window.c);
'use strict';

window.c.pages.Team = (function (m, c) {
  return {
    view: function view() {
      return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
    }
  };
})(window.m, window.c);
'use strict';

window.c.project.Insights = (function (m, c, models, _) {
  return {
    controller: function controller(args) {
      var vm = m.postgrest.filtersVM({ project_id: 'eq' }),
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
    view: function view(ctrl) {
      return _.map(ctrl.projectDetails(), function (project) {
        return m('.project-insights', [m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'), m.component(c.AdminProjectDetailsCard, { resource: project }), m.component(c.AdminProjectDetailsExplanation, { resource: project })]), m('.w-col.w-col-2')])]), (function (project) {
          if (project.is_published) {
            return [m('.divider'), m('.w-section.section-one-column.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', { style: { 'min-height': '300px' } }, [m.component(c.ProjectChartContributionTotalPerDay, { collection: ctrl.contributionsPerDay })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', { style: { 'min-height': '300px' } }, [m.component(c.ProjectChartContributionAmountPerDay, { collection: ctrl.contributionsPerDay })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectContributionsPerLocationTable, { resourceId: ctrl.vm.project_id() })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, { resource: project })])])])])];
          }
        })(project)]);
      });
    }
  };
})(window.m, window.c, window.c.models, window._);
'use strict';

window.c.admin.contributionFilterVM = (function (m, h, replaceDiacritics) {
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
  }),
      paramToString = function paramToString(p) {
    return (p || '').toString().trim();
  };

  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({ id: 'desc' });

  vm.created_at.lte.toFilter = function () {
    var filter = paramToString(vm.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function () {
    var filter = paramToString(vm.created_at.gte());
    return filter && h.momentFromString(filter).format();
  };

  vm.full_text_index.toFilter = function () {
    var filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
  };

  return vm;
})(window.m, window.c.h, window.replaceDiacritics);
"use strict";

window.c.admin.contributionListVM = (function (m, models) {
  return m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);
})(window.m, window.c.models);
"use strict";

window.c.admin.userListVM = (function (m, models) {
  return m.postgrest.paginationVM(models.userDetail.getPageWithToken);
})(window.m, window.c.models);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24tdGFibGUuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yb3cuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImFkbWluL3VzZXJzLmpzIiwiY29udHJpYnV0aW9uL3Byb2plY3RzSG9tZS5qcyIsInBhZ2VzL3RlYW0uanMiLCJwcm9qZWN0L2luc2lnaHRzLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tZmlsdGVyLXZtLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRp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Q0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDdkQsU0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztDQUM3RSxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQ0Y5QixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDL0MsU0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Q0FDckUsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIG1vZGVsczoge30sXG4gICAgcGFnZXM6IHt9LFxuICAgIGNvbnRyaWJ1dGlvbjoge30sXG4gICAgYWRtaW46IHt9LFxuICAgIHByb2plY3Q6IHt9LFxuICAgIGg6IHt9XG4gIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9IChmdW5jdGlvbihtLCBtb21lbnQpe1xuICAvL0RhdGUgSGVscGVyc1xuICB2YXIgbW9tZW50aWZ5ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICB9LFxuXG4gIG1vbWVudEZyb21TdHJpbmcgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIHZhciBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gIH0sXG5cbiAgLy9OdW1iZXIgZm9ybWF0dGluZyBoZWxwZXJzXG4gIGdlbmVyYXRlRm9ybWF0TnVtYmVyID0gZnVuY3Rpb24ocywgYyl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG51bWJlciwgbiwgeCkge1xuICAgICAgaWYgKG51bWJlciA9PT0gbnVsbCB8fCBudW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgbnVtID0gbnVtYmVyLnRvRml4ZWQoTWF0aC5tYXgoMCwgfn5uKSk7XG4gICAgICByZXR1cm4gKGMgPyBudW0ucmVwbGFjZSgnLicsIGMpIDogbnVtKS5yZXBsYWNlKG5ldyBSZWdFeHAocmUsICdnJyksICckJicgKyAocyB8fCAnLCcpKTtcbiAgICB9O1xuICB9LFxuICBmb3JtYXROdW1iZXIgPSBnZW5lcmF0ZUZvcm1hdE51bWJlcignLicsICcsJyksXG5cbiAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICB2YXIgcmVtYWluaW5nVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgIGRheXM6ICdkaWFzJyxcbiAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgc2Vjb25kczogJ3NlZ3VuZG9zJ1xuICAgICAgICB9O1xuXG4gICAgcmVtYWluaW5nVGV4dE9iaih7XG4gICAgICB1bml0OiB0cmFuc2xhdGVkVGltZVtwcm9qZWN0LnJlbWFpbmluZ190aW1lLnVuaXQgfHwgJ3NlY29uZHMnXSxcbiAgICAgIHRvdGFsOiBwcm9qZWN0LnJlbWFpbmluZ190aW1lLnRvdGFsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVtYWluaW5nVGV4dE9iajtcbiAgfSxcblxuICB0b2dnbGVQcm9wID0gZnVuY3Rpb24oZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSl7XG4gICAgdmFyIHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICBwLnRvZ2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcDtcbiAgfSxcblxuICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtpZDogJ2VxJ30pLFxuXG4gIC8vVGVtcGxhdGVzXG4gIGxvYWRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwW3N0eWxlPVwibWFyZ2luLWJvdHRvbTotMTEwcHg7XCJdJywgW1xuICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICBdKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG1vbWVudGlmeTogbW9tZW50aWZ5LFxuICAgIG1vbWVudEZyb21TdHJpbmc6IG1vbWVudEZyb21TdHJpbmcsXG4gICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgaWRWTTogaWRWTSxcbiAgICB0b2dnbGVQcm9wOiB0b2dnbGVQcm9wLFxuICAgIGdlbmVyYXRlUmVtYWluZ1RpbWU6IGdlbmVyYXRlUmVtYWluZ1RpbWUsXG4gICAgbG9hZGVyOiBsb2FkZXJcbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKXtcbiAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfZGF5JyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICBwcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RzJyksXG4gIHRlYW1NZW1iZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndGVhbV9tZW1iZXJzJyksXG4gIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyk7XG4gIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICBwcm9qZWN0LnBhZ2VTaXplKDMpO1xuXG4gIHJldHVybiB7XG4gICAgY29udHJpYnV0aW9uRGV0YWlsOiBjb250cmlidXRpb25EZXRhaWwsXG4gICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICBjb250cmlidXRpb25zOiBjb250cmlidXRpb25zLFxuICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uXG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1jb250cmlidXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cImh0dHBzOi8vZGFzaGJvYXJkLnBhZ2FyLm1lLyMvdHJhbnNhY3Rpb25zLycgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCArICdcIl0nLCBjb250cmlidXRpb24uZ2F0ZXdheV9pZClcbiAgICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGFjdGlvbnMgPSBhcmdzLmFjdGlvbnMsXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgXy5tYXAoYWN0aW9ucywgZnVuY3Rpb24oYWN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjW2FjdGlvbi5jb21wb25lbnRdLCB7ZGF0YTogYWN0aW9uLmRhdGEsIGl0ZW06IGFyZ3MuaXRlbX0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLFtcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtjb250cmlidXRpb246IGl0ZW19KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJld2FyZCwge2NvbnRyaWJ1dGlvbjogaXRlbSwga2V5OiBpdGVtLmtleX0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluRmlsdGVyID0gKGZ1bmN0aW9uKGMsIG0sIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICBtYWluID0gXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge2NvbXBvbmVudDogJ0ZpbHRlck1haW4nfSk7XG5cbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ0Fwb2lvcycpLFxuICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogYXJncy5zdWJtaXRcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgKF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pKSA/IG0uY29tcG9uZW50KGNbbWFpbi5jb21wb25lbnRdLCBtYWluLmRhdGEpIDogJycsXG4gICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMC53LXJvdycsXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctY29sLnctY29sLTEyLmZvbnRzaXplLXNtYWxsZXN0LmxpbmstaGlkZGVuLWxpZ2h0W3N0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBvdXRsaW5lOiBub25lOyB0ZXh0LWFsaWduOiBsZWZ0O1wiXVt0eXBlPVwiYnV0dG9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgIG0oJyNhZHZhbmNlZC1zZWFyY2gudy1yb3cuYWRtaW4tZmlsdGVycycsIFtcbiAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuY29tcG9uZW50ICE9PSAnRmlsdGVyTWFpbicpID8gbS5jb21wb25lbnQoY1tmLmNvbXBvbmVudF0sIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5jLCB3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluSW5wdXRBY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoYnVpbGRlci5mb3JjZVZhbHVlIHx8ICcnKTtcblxuICAgICAgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKTtcblxuICAgICAgdmFyIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5tb2RlbC5wYXRjaE9wdGlvbnMoaC5pZFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KXtcbiAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICBuZXdWYWx1ZShidWlsZGVyLmZvcmNlVmFsdWUgfHwgJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgIGw6IGwsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgKCFkYXRhLmZvcmNlVmFsdWUpID9cbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSwgdmFsdWU6IGN0cmwubmV3VmFsdWUoKX0pIDogJycsXG4gICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5JdGVtID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuXG4gICAgICB2YXIgZGlzcGxheURldGFpbEJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0yMC5yZXN1bHRzLWFkbWluLWl0ZW1zJyxbXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIF8ubWFwKGFyZ3MuYnVpbGRlciwgZnVuY3Rpb24oZGVzYyl7XG4gICAgICAgICAgICByZXR1cm4gbShkZXNjLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW2Rlc2MuY29tcG9uZW50XSwge2l0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeScsIHtvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlfSksXG4gICAgICAgIGN0cmwuZGlzcGxheURldGFpbEJveCgpID8gbS5jb21wb25lbnQoYy5BZG1pbkRldGFpbCwge2l0ZW06IGl0ZW0sIGFjdGlvbnM6IGFyZ3MuYWN0aW9ucywga2V5OiBpdGVtLmtleX0pIDogJydcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0LFxuICAgICAgICAgIGVycm9yID0gYXJncy52bS5lcnJvcjtcbiAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICBtKCcuY2FyZC5jYXJkLWVycm9yLnUtcmFkaXVzLmZvbnR3ZWlnaHQtYm9sZCcsIGVycm9yKCkpIDpcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAnQ2FycmVnYW5kbyAuLi4nIDpcbiAgICAgICAgICAgICAgICAgICAgICBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgbGlzdC50b3RhbCgpKSwgJyBkYWRvcyBlbmNvbnRyYWRvcyddXG4gICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge2J1aWxkZXI6IGFyZ3MuaXRlbUJ1aWxkZXIsIGFjdGlvbnM6IGFyZ3MuaXRlbUFjdGlvbnMsIGl0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLFtcbiAgICAgICAgICAgICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7b25jbGljazogbGlzdC5uZXh0UGFnZX0sICdDYXJyZWdhciBtYWlzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdXG4gICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICBvbmxpbmU6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdOTyBBUid9LFxuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0ZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIGZhaWxlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtjc3NDbGFzczogJ3RleHQtd2FpdGluZycsIHRleHQ6ICdBR1VBUkRBTkRPJ30sXG4gICAgICAgICAgICAgICAgICByZWplY3RlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdSRUNVU0FETyd9LFxuICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtjc3NDbGFzczogJycsIHRleHQ6ICdSQVNDVU5ITyd9LFxuICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtjc3NDbGFzczogJycsIHRleHQ6ICdFTSBBTsOBTElTRSd9LFxuICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdBUFJPVkFETyd9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgdmFyIHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmooKTtcblxuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksJ8KgJyxtKCdzcGFuJywge2NsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzfSwgc3RhdHVzVGV4dE9iai50ZXh0KSwnwqAnXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtzdHlsZToge3dpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSd9fSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2ZpbmFuY2lhZG8nKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnbGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsIHJlbWFpbmluZ1RleHRPYmoudW5pdCArICcgcmVzdGFudGVzJylcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgZmFpbGVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBuw6NvIGRlc2FuaW1lIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBuw6NvIGJhdGV1IGEgbWV0YSBlIHNhYmVtb3MgcXVlIGlzc28gbsOjbyDDqSBhIG1lbGhvciBkYXMgc2Vuc2HDp8O1ZXMuIE1hcyBuw6NvIGRlc2FuaW1lLiAnLFxuICAgICAgICAgICAgJ0VuY2FyZSBvIHByb2Nlc3NvIGNvbW8gdW0gYXByZW5kaXphZG8gZSBuw6NvIGRlaXhlIGRlIGNvZ2l0YXIgdW1hIHNlZ3VuZGEgdGVudGF0aXZhLiBOw6NvIHNlIHByZW9jdXBlLCB0b2RvcyBvcyBzZXVzIGFwb2lhZG9yZXMgcmVjZWJlcsOjbyBvIGRpbmhlaXJvIGRlIHZvbHRhLsKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzY1NTA3LVJlZ3Jhcy1lLWZ1bmNpb25hbWVudG8tZG9zLXJlZW1ib2xzb3MtZXN0b3Jub3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBmYXplbW9zIGVzdG9ybm9zIGUgcmVlbWJvbHNvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCcuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFwcHJvdmVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBzZXUgcHJvamV0byBmb2kgYXByb3ZhZG8hJyksXG4gICAgICAgICAgICAnwqBQYXJhIGNvbG9jYXIgbyBzZXUgcHJvamV0byBubyBhciDDqSBwcmVjaXNvIGFwZW5hcyBxdWUgdm9jw6ogcHJlZW5jaGEgb3MgZGFkb3MgbmVjZXNzw6FyaW9zIG5hIGFiYcKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIiN1c2VyX3NldHRpbmdzXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAnLiDDiSBpbXBvcnRhbnRlIHNhYmVyIHF1ZSBjb2JyYW1vcyBhIHRheGEgZGUgMTMlIGRvIHZhbG9yIHRvdGFsIGFycmVjYWRhZG8gYXBlbmFzIHBvciBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLiBFbnRlbmRhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIGZhemVtb3MgbyByZXBhc3NlIGRvIGRpbmhlaXJvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLFtcbiAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gbS5wcm9wKGFyZ3MuaXRlbS5yZXdhcmQuZGVzY3JpcHRpb24gfHwgJycpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICBnZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICBzZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICBnZXRBdHRyID0gYnVpbGRlci5yYWRpb3MsXG4gICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXk7XG5cbiAgICAgIHNldEZpbHRlclt1cGRhdGVLZXldID0gJ2VxJztcbiAgICAgIHZhciBzZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgc2V0Vk1bdXBkYXRlS2V5XShpdGVtW3VwZGF0ZUtleV0pO1xuXG4gICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgIGdldFZNW2dldEtleV0oaXRlbVtnZXRLZXldKTtcblxuICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFJvd09wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIGRhdGFbMF0pO1xuICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBmZXRjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGdldExvYWRlci5sb2FkKCkudGhlbihmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICByYWRpb3MoaXRlbVswXVtnZXRBdHRyXSk7XG4gICAgICAgIH0sIGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAobmV3VmFsdWUoKSkge1xuICAgICAgICAgIGRhdGFbYnVpbGRlci5wcm9wZXJ0eV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKCcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpe1xuICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgIH07XG5cbiAgICAgIGZldGNoKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZCxcbiAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KXtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubmV3VmFsdWUocmFkaW8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IGFyZ3MuaXRlbS5yZXdhcmQuaWQpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjci0nICsgaW5kZXggKyAnLnctcmFkaW8taW5wdXRbdHlwZT1yYWRpb11bbmFtZT1cImFkbWluLXJhZGlvXCJdW3ZhbHVlPVwiJyArIHJhZGlvLmlkICsgJ1wiXScgKyAoKHNlbGVjdGVkKSA/ICdbY2hlY2tlZF0nIDogJycpLHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLnctZm9ybS1sYWJlbFtmb3I9XCJyLScgKyBpbmRleCArICdcIl0nLCAnUiQnICsgcmFkaW8ubWluaW11bV92YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciByZXdhcmQgPSBhcmdzLmNvbnRyaWJ1dGlvbi5yZXdhcmQgfHwge30sXG4gICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIChfLmlzRW1wdHkocmV3YXJkKSkgPyAnQXBvaW8gc2VtIHJlY29tcGVuc2EuJyA6IFtcbiAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFtcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LCBuYW1lOiAnQXBvaW8gY29uZmlybWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LCBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCwgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCwgbmFtZTogJ0Fwb2lvIGNyaWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LCBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCwgbmFtZTogJ0NoYXJnZWJhY2snfSxcbiAgICAgIF0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pe1xuICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgIH0sIFtdKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JyxbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJyxbXG4gICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICB2YXIgdXNlclByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdXNlci51c2VyX3Byb2ZpbGVfaW1nIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgIH07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsW1xuICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgdXNlclByb2ZpbGUoKSArICdcIl0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci51c2VyX2lkICsgJy9lZGl0XCJdJywgdXNlci51c2VyX25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci51c2VyX2lkKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdDYXRhcnNlOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIHVzZXIucGF5ZXJfZW1haWwpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICB9LFtcbiAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSwgdmFsdWU6IGFyZ3Mudm0oKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sIGNhcmQgPSBudWxsLFxuICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgIGNhcmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpe1xuICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiAgcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgIGlmIChjYXJkRGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKXtcbiAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsW1xuICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2FyZCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMpe1xuICByZXR1cm4ge1xuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICBtKCdhLmNhcmQtcHJvamVjdC10aHVtYltocmVmPVwiJyArICBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCB7c3R5bGU6IHsnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnKScsICdkaXNwbGF5JzogJ2Jsb2NrJ319KSxcbiAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICBdXG4gICAgICAgICAgKSxcbiAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjAnLCAncG9yICcgKyBwcm9qZWN0Lm93bmVyX25hbWUpLFxuICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QuaGVhZGxpbmUpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgW20oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlci5mYS0xJywgJyAnKSwgJyAnICsgIHByb2plY3QuY2l0eV9uYW1lICsgJywgJyArIHByb2plY3Quc3RhdGVfYWNyb255bV0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1tZXRlcicsIFtcbiAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7c3R5bGU6IHt3aWR0aDogKHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpICsgJyUnfX0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcykgKyAgJyUnKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUiQgJyArIHByb2plY3QucGxlZGdlZCksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlbWFpbmluZ1RleHRPYmoudG90YWwgKyAnICcgKyByZW1haW5pbmdUZXh0T2JqLnVuaXQpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ1Jlc3RhbnRlcycpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsX2Ftb3VudDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge2NvbmZpZzogY3RybC5yZW5kZXJDaGFydH0pXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDAuMiknLFxuICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICBkYXRhOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaXRlbS50b3RhbDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyksXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtjb25maWc6IGN0cmwucmVuZGVyQ2hhcnR9KVxuICAgICAgICAgIF0pLFxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gKGZ1bmN0aW9uKG0sIG1vZGVscywgaCwgXykge1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhclx0dm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgIGdlbmVyYXRlU29ydCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBjb250cmlidXRpb25zUGVyTG9jYXRpb24oKSxcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29sbGVjdGlvblswXSxcbiAgICAgICAgICAgICAgICAgIG9yZGVyZWRTb3VyY2UgPSBfLnNvcnRCeShyZXNvdXJjZS5zb3VyY2UsIGZpZWxkKTtcblxuICAgICAgICAgICAgICBpZiAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLm9yZGVyRmlsdGVyID0gJ0RFU0MnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSAnREVTQycpIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gb3JkZXJlZFNvdXJjZS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXNvdXJjZS5zb3VyY2UgPSBvcmRlcmVkU291cmNlO1xuICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9IChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnID8gJ0FTQycgOiAnREVTQycpO1xuICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24oY29sbGVjdGlvbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yZXNvdXJjZUlkKTtcblxuICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24uZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGRhdGEpO1xuICAgICAgICBnZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJykoKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb246IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgZ2VuZXJhdGVTb3J0OiBnZW5lcmF0ZVNvcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnTG9jYWxpemHDp8OjbyBnZW9ncsOhZmljYSBkb3MgYXBvaW9zJyksXG4gICAgICAgIGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkubWFwKGZ1bmN0aW9uKGNvbnRyaWJ1dGlvbkxvY2F0aW9uKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgJ0VzdGFkbycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGlvbnMnKX0sIFtcbiAgICAgICAgICAgICAgICAgICdBcG9pb3PCoMKgJyxtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2xbZGF0YS1peD1cInNvcnQtYXJyb3dzXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7b25jbGljazogY3RybC5nZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnUiQgYXBvaWFkb3MgJyxcbiAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsJyglIGRvIHRvdGFsKcKgJyksXG4gICAgICAgICAgICAgICAgICAnICcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudGFibGUtaW5uZXIuZm9udHNpemUtc21hbGwnLCBbXG4gICAgICAgICAgICAgIF8ubWFwKGNvbnRyaWJ1dGlvbkxvY2F0aW9uLnNvdXJjZSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy50YWJsZS1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS5zdGF0ZV9hY3JvbnltKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyxcbiAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihzb3VyY2UudG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICfCoMKgKCcgKyBzb3VyY2UudG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJlbWluZGVyQ291bnQgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlO1xuICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXJlbWluZGVyLWNvdW50LmNhcmQudS1yYWRpdXMudS10ZXh0LWNlbnRlci5tZWRpdW0udS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1RvdGFsIGRlIHBlc3NvYXMgcXVlIGNsaWNhcmFtIG5vIGJvdMOjbyBMZW1icmFyLW1lJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ1VtIGxlbWJyZXRlIHBvciBlbWFpbCDDqSBlbnZpYWRvIDQ4IGhvcmFzIGFudGVzIGRvIHTDqXJtaW5vIGRhIHN1YSBjYW1wYW5oYScpLFxuICAgICAgICBtKCcuZm9udHNpemUtanVtYm8nLCBwcm9qZWN0LnJlbWluZGVyX2NvdW50KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdFJvdyA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uO1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCA+IDAgPyBtKCcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9aG9tZV8nICsgY29sbGVjdGlvbi5oYXNoICsgJyMnICsgY29sbGVjdGlvbi5oYXNoICsgJ1wiXScsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge3Byb2plY3Q6IHByb2plY3R9KTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgXSlcbiAgICAgIF0pIDogbSgnJyk7XG4gICAgfX07XG59KHdpbmRvdy5tKSk7XG5cbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX0sXG5cbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpe1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX07XG5cbiAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKV0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGl0ZW1BY3Rpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbklucHV0QWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblJhZGlvQWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5wcm9qZWN0RGV0YWlsLFxuICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5JbnB1dEFjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLlVzZXJzID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4udXNlckxpc3RWTSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbUFjdGlvbnM6IFtdLFxuICAgICAgICBpdGVtQnVpbGRlcjogaXRlbUJ1aWxkZXIsXG4gICAgICAgIGxpc3RWTToge2xpc3Q6IGxpc3RWTSwgZXJyb3I6IGVycm9yfSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHt2bTogY3RybC5saXN0Vk0sIGl0ZW1CdWlsZGVyOiBjdHJsLml0ZW1CdWlsZGVyLCBpdGVtQWN0aW9uczogY3RybC5pdGVtQWN0aW9uc30pXG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5jb250cmlidXRpb24ucHJvamVjdHNIb21lID0gKGZ1bmN0aW9uKG0sIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZtID0ge1xuICAgICAgICByZWNvbW1lbmRlZENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIHJlY2VudENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIG5lYXJNZUNvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIGV4cGlyaW5nQ29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgfSxcbiAgICAgIHByb2plY3QgPSBjLm1vZGVscy5wcm9qZWN0LFxuXG4gICAgICBleHBpcmluZyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7ZXhwaXJlc19hdDogJ2x0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICBuZWFyTWUgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe25lYXJfbWU6ICdlcScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNlbnRzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtvbmxpbmVfZGF0ZTogJ2d0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNvbW1lbmRlZCA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cmVjb21tZW5kZWQ6ICdlcScsIHN0YXRlOiAnZXEnfSk7XG5cbiAgICAgIGV4cGlyaW5nLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgIGV4cGlyaW5nLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgbmVhck1lLm5lYXJfbWUoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHJlY2VudHMub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNSwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICAgICByZWNlbnRzLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgcmVjb21tZW5kZWQucmVjb21tZW5kZWQoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHByb2plY3QuZ2V0UGFnZShuZWFyTWUucGFyYW1ldGVycygpKS50aGVuKHZtLm5lYXJNZUNvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKHJlY29tbWVuZGVkLnBhcmFtZXRlcnMoKSkudGhlbih2bS5yZWNvbW1lbmRlZENvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKHJlY2VudHMucGFyYW1ldGVycygpKS50aGVuKHZtLnJlY2VudENvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKGV4cGlyaW5nLnBhcmFtZXRlcnMoKSkudGhlbih2bS5leHBpcmluZ0NvbGxlY3Rpb24pO1xuXG4gICAgICB2YXIgY29sbGVjdGlvbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIHZvY8OqJyxcbiAgICAgICAgICBoYXNoOiAnbmVhcl9vZicsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ubmVhck1lQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgIGhhc2g6ICdyZWNvbW1lbmRlZCcsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ05hIHJldGEgZmluYWwnLFxuICAgICAgICAgIGhhc2g6ICdleHBpcmluZycsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0uZXhwaXJpbmdDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICBoYXNoOiAncmVjZW50JyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5yZWNlbnRDb2xsZWN0aW9uXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwuY29sbGVjdGlvbnMsIGZ1bmN0aW9uKGNvbGxlY3Rpb24pe1xuICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7Y29sbGVjdGlvbjogY29sbGVjdGlvbn0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLlRlYW0gPSAoZnVuY3Rpb24obSwgYyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsW1xuICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbU1lbWJlcnMpXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMucHJvamVjdC5JbnNpZ2h0cyA9IChmdW5jdGlvbihtLCBjLCBtb2RlbHMsIF8pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKTtcblxuICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICBtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKHByb2plY3REZXRhaWxzKTtcbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheS5nZXRSb3codm0ucGFyYW1ldGVycygpKS50aGVuKGNvbnRyaWJ1dGlvbnNQZXJEYXkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7cmVzb3VyY2U6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge3Jlc291cmNlOiBwcm9qZWN0fSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKHByb2plY3Qpe1xuICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5LCB7Y29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtzdHlsZTogeydtaW4taGVpZ2h0JzogJzMwMHB4J319LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvbkFtb3VudFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSwge3Jlc291cmNlSWQ6IGN0cmwudm0ucHJvamVjdF9pZCgpfSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfShwcm9qZWN0KSlcbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3Mpe1xuICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICBzdGF0ZTogJ2VxJyxcbiAgICBnYXRld2F5OiAnZXEnLFxuICAgIHZhbHVlOiAnYmV0d2VlbicsXG4gICAgY3JlYXRlZF9hdDogJ2JldHdlZW4nXG4gIH0pLFxuXG4gIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKXtcbiAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICB9O1xuXG4gIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICB2bS5zdGF0ZSgnJyk7XG4gIHZtLmdhdGV3YXkoJycpO1xuICB2bS5vcmRlcih7aWQ6ICdkZXNjJ30pO1xuXG4gIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmx0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICB9O1xuXG4gIHZtLmNyZWF0ZWRfYXQuZ3RlLnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xuICB9O1xuXG4gIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gIH07XG5cbiAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbC5nZXRQYWdlV2l0aFRva2VuKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMudXNlckRldGFpbC5nZXRQYWdlV2l0aFRva2VuKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9