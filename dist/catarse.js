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
      statistic = m.postgrest.model('statistics');
  teamMember.pageSize(40);
  project.pageSize(3);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    project: project,
    projectContributionsPerDay: projectContributionsPerDay,
    projectContributionsPerLocation: projectContributionsPerLocation,
    statistic: statistic
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
      return m('.w-section.section', [m('.w-container', error() ? m('.card.card-error.u-radius.fontweight-bold', error()) : [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-9', [m('.fontsize-base', list.isLoading() ? 'Buscando apoios...' : [m('span.fontweight-semibold', list.total()), ' apoios encontrados'])])]), m('#admin-contributions-list.w-container', [list.collection().map(function (item) {
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
          remainingTextObj = h.generateRemaingTime(project)(),
          link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : '');

      return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + link + '"]', { style: { 'background-image': 'url(' + project.project_img + ')', 'display': 'block' } }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter', [m('.meter', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + project.pledged), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', 'Restantes')])])])])]);
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
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'R$ arrecadados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
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
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Apoios confirmados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
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
      var collection = args.collection,
          ref = args.ref;
      return collection.collection().length > 0 ? m('.w-section.section.u-marginbottom-40', [m('.w-container', [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]), m('.w-row', _.map(collection.collection(), function (project) {
        return m.component(c.ProjectCard, { project: project, ref: ref });
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

window.c.contribution.ProjectsHome = (function (m, c) {
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
        return m.component(c.ProjectRow, { collection: collection, ref: 'home_' + collection.hash });
      });
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

window.c.pages.LiveStatistics = (function (m, models, h, _, JSON) {
  return {
    controller: function controller() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var pageStatistics = m.prop([]),
          notificationData = m.prop({});

      models.statistic.getRow().then(pageStatistics);
      // args.socket is a socket provided by socket.io
      // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
      if (args.socket && _.isFunction(args.socket.on)) {
        args.socket.on('new_paid_contributions', function (msg) {
          notificationData(JSON.parse(msg.payload));
          models.statistic.getRow().then(pageStatistics);
          m.redraw();
        });
      }

      return {
        pageStatistics: pageStatistics,
        notificationData: notificationData
      };
    },
    view: function view(ctrl) {
      var data = ctrl.notificationData();

      return m('.w-section.bg-stats.section.min-height-100', [m('.w-container.u-text-center', _.map(ctrl.pageStatistics(), function (stat) {
        return [m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m('.fontcolor-negative.u-marginbottom-40', [m('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)), m('.fontsize-large', 'Doados para projetos publicados por aqui')]), m('.fontcolor-negative.u-marginbottom-60', [m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
      })), !_.isEmpty(data) ? m('.w-container', [m('div', [m('.card.u-radius.u-marginbottom-60.medium', [m('.w-row', [m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb.u-round[src="' + data.user_image + '"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.user_name)])])]), m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m('div', 'acabou de apoiar o')]), m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
    }
  };
})(window.m, window.c.models, window.c.h, window._, window.JSON);
'use strict';

window.c.pages.Team = (function (m, c) {
  return {
    view: function view() {
      return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
    }
  };
})(window.m, window.c);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24tdGFibGUuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yb3cuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0cy1ob21lLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsInBhZ2VzL2xpdmUtc3RhdGlzdGljcy5qcyIsInBhZ2VzL3RlYW0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25z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RyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELFdBQU8sTUFBTSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUN0RCxDQUFDOztBQUVGLElBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxHQUFHLFlBQVU7QUFDdEMsUUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFdBQU8sTUFBTSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQztHQUN6RCxDQUFDOztBQUVGLFNBQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEFBQUMsQ0FBQzs7O0FDbENuRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUN2RCxTQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzdFLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQyIsImZpbGUiOiJjYXRhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LmMgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBtb2RlbHM6IHt9LFxuICAgIHBhZ2VzOiB7fSxcbiAgICBjb250cmlidXRpb246IHt9LFxuICAgIGFkbWluOiB7fSxcbiAgICBwcm9qZWN0OiB7fSxcbiAgICBoOiB7fVxuICB9O1xufSgpKTtcbiIsIndpbmRvdy5jLmggPSAoZnVuY3Rpb24obSwgbW9tZW50KXtcbiAgLy9EYXRlIEhlbHBlcnNcbiAgdmFyIG1vbWVudGlmeSA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCl7XG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5mb3JtYXQoZm9ybWF0KSA6ICdubyBkYXRlJztcbiAgfSxcblxuICBtb21lbnRGcm9tU3RyaW5nID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICB2YXIgZXVyb3BlYW4gPSBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XG4gICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICB9LFxuXG4gIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IGZ1bmN0aW9uKHMsIGMpe1xuICAgIHJldHVybiBmdW5jdGlvbihudW1iZXIsIG4sIHgpIHtcbiAgICAgIGlmIChudW1iZXIgPT09IG51bGwgfHwgbnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZSA9ICdcXFxcZCg/PShcXFxcZHsnICsgKHggfHwgMykgKyAnfSkrJyArIChuID4gMCA/ICdcXFxcRCcgOiAnJCcpICsgJyknLFxuICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgfTtcbiAgfSxcbiAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gIC8vT2JqZWN0IG1hbmlwdWxhdGlvbiBoZWxwZXJzXG4gIGdlbmVyYXRlUmVtYWluZ1RpbWUgPSBmdW5jdGlvbihwcm9qZWN0KSB7XG4gICAgdmFyIHJlbWFpbmluZ1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICB0cmFuc2xhdGVkVGltZSA9IHtcbiAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgIGhvdXJzOiAnaG9yYXMnLFxuICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgfTtcblxuICAgIHJlbWFpbmluZ1RleHRPYmooe1xuICAgICAgdW5pdDogdHJhbnNsYXRlZFRpbWVbcHJvamVjdC5yZW1haW5pbmdfdGltZS51bml0IHx8ICdzZWNvbmRzJ10sXG4gICAgICB0b3RhbDogcHJvamVjdC5yZW1haW5pbmdfdGltZS50b3RhbFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbWFpbmluZ1RleHRPYmo7XG4gIH0sXG5cbiAgdG9nZ2xlUHJvcCA9IGZ1bmN0aW9uKGRlZmF1bHRTdGF0ZSwgYWx0ZXJuYXRlU3RhdGUpe1xuICAgIHZhciBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgcC50b2dnbGUgPSBmdW5jdGlvbigpe1xuICAgICAgcCgoKHAoKSA9PT0gYWx0ZXJuYXRlU3RhdGUpID8gZGVmYXVsdFN0YXRlIDogYWx0ZXJuYXRlU3RhdGUpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHA7XG4gIH0sXG5cbiAgaWRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7aWQ6ICdlcSd9KSxcblxuICAvL1RlbXBsYXRlc1xuICBsb2FkZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMFtzdHlsZT1cIm1hcmdpbi1ib3R0b206LTExMHB4O1wiXScsIFtcbiAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgXSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICBtb21lbnRGcm9tU3RyaW5nOiBtb21lbnRGcm9tU3RyaW5nLFxuICAgIGZvcm1hdE51bWJlcjogZm9ybWF0TnVtYmVyLFxuICAgIGlkVk06IGlkVk0sXG4gICAgdG9nZ2xlUHJvcDogdG9nZ2xlUHJvcCxcbiAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lLFxuICAgIGxvYWRlcjogbG9hZGVyXG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSl7XG4gIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcblxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfZGF5JyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICBwcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RzJyksXG4gIHRlYW1NZW1iZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndGVhbV9tZW1iZXJzJyksXG4gIHN0YXRpc3RpYyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdzdGF0aXN0aWNzJyk7XG4gIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICBwcm9qZWN0LnBhZ2VTaXplKDMpO1xuXG4gIHJldHVybiB7XG4gICAgY29udHJpYnV0aW9uRGV0YWlsOiBjb250cmlidXRpb25EZXRhaWwsXG4gICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICBjb250cmlidXRpb25zOiBjb250cmlidXRpb25zLFxuICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgcHJvamVjdDogcHJvamVjdCxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICBzdGF0aXN0aWM6IHN0YXRpc3RpY1xuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBhY3Rpb25zID0gYXJncy5hY3Rpb25zLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgIF8ubWFwKGFjdGlvbnMsIGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoY1thY3Rpb24uY29tcG9uZW50XSwge2RhdGE6IGFjdGlvbi5kYXRhLCBpdGVtOiBhcmdzLml0ZW19KTtcbiAgICAgICAgICB9KVxuICAgICAgICApLFxuICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJyxbXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uLCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge2NvbnRyaWJ1dGlvbjogaXRlbX0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtjb250cmlidXRpb246IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkZpbHRlciA9IChmdW5jdGlvbihjLCBtLCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pO1xuXG4gICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtZmlsdGVyLnctc2VjdGlvbi5wYWdlLWhlYWRlcicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsICdBcG9pb3MnKSxcbiAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgbSgnZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KSkgPyBtLmNvbXBvbmVudChjW21haW4uY29tcG9uZW50XSwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWNvbC53LWNvbC0xMi5mb250c2l6ZS1zbWFsbGVzdC5saW5rLWhpZGRlbi1saWdodFtzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDtcIl1bdHlwZT1cImJ1dHRvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCAnJyk7XG5cbiAgICAgIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSk7XG5cbiAgICAgIHZhciBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIubW9kZWwucGF0Y2hPcHRpb25zKGguaWRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihyZXMpe1xuICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGRhdGFba2V5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCl7XG4gICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgbmV3VmFsdWUoYnVpbGRlci5mb3JjZVZhbHVlIHx8ICcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBsOiBsLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJyxbXG4gICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksXG4gICAgICAgIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge2NvbmZpZzogY3RybC51bmxvYWR9LFtcbiAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICghZGF0YS5mb3JjZVZhbHVlKSA/XG4gICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7b25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdWYWx1ZSksIHZhbHVlOiBjdHJsLm5ld1ZhbHVlKCl9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdBcG9pbyB0cmFuc2ZlcmlkbyBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcblxuICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5RGV0YWlsQm94OiBkaXNwbGF5RGV0YWlsQm94XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4LmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMjAucmVzdWx0cy1hZG1pbi1pdGVtcycsW1xuICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICBfLm1hcChhcmdzLmJ1aWxkZXIsIGZ1bmN0aW9uKGRlc2Mpe1xuICAgICAgICAgICAgcmV0dXJuIG0oZGVzYy53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1tkZXNjLmNvbXBvbmVudF0sIHtpdGVtOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdidXR0b24udy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnknLCB7b25jbGljazogY3RybC5kaXNwbGF5RGV0YWlsQm94LnRvZ2dsZX0pLFxuICAgICAgICBjdHJsLmRpc3BsYXlEZXRhaWxCb3goKSA/IG0uY29tcG9uZW50KGMuQWRtaW5EZXRhaWwsIHtpdGVtOiBpdGVtLCBhY3Rpb25zOiBhcmdzLmFjdGlvbnMsIGtleTogaXRlbS5rZXl9KSA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluTGlzdCA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcbiAgICAgIGlmICghbGlzdC5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3QuZmlyc3RQYWdlKSB7XG4gICAgICAgIGxpc3QuZmlyc3RQYWdlKCkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgIGFyZ3Mudm0uZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3I7XG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgIGVycm9yKCkgP1xuICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6XG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgJ0J1c2NhbmRvIGFwb2lvcy4uLicgOlxuICAgICAgICAgICAgICAgICAgICAgIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCAnIGFwb2lvcyBlbmNvbnRyYWRvcyddXG4gICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge2J1aWxkZXI6IGFyZ3MuaXRlbUJ1aWxkZXIsIGFjdGlvbnM6IGFyZ3MuaXRlbUFjdGlvbnMsIGl0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLFtcbiAgICAgICAgICAgICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7b25jbGljazogbGlzdC5uZXh0UGFnZX0sICdDYXJyZWdhciBtYWlzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdXG4gICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoZnVuY3Rpb24obSwgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICBvbmxpbmU6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdOTyBBUid9LFxuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0ZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIGZhaWxlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nfSxcbiAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtjc3NDbGFzczogJ3RleHQtd2FpdGluZycsIHRleHQ6ICdBR1VBUkRBTkRPJ30sXG4gICAgICAgICAgICAgICAgICByZWplY3RlZDoge2Nzc0NsYXNzOiAndGV4dC1lcnJvcicsIHRleHQ6ICdSRUNVU0FETyd9LFxuICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtjc3NDbGFzczogJycsIHRleHQ6ICdSQVNDVU5ITyd9LFxuICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtjc3NDbGFzczogJycsIHRleHQ6ICdFTSBBTsOBTElTRSd9LFxuICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsIHRleHQ6ICdBUFJPVkFETyd9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgdmFyIHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmooKTtcblxuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksJ8KgJyxtKCdzcGFuJywge2NsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzfSwgc3RhdHVzVGV4dE9iai50ZXh0KSwnwqAnXG4gICAgICAgICAgXSksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtzdHlsZToge3dpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSd9fSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2ZpbmFuY2lhZG8nKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnbGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsIHJlbWFpbmluZ1RleHRPYmoudW5pdCArICcgcmVzdGFudGVzJylcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCkpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG5cbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICBdLFxuICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgZmFpbGVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBuw6NvIGRlc2FuaW1lIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBuw6NvIGJhdGV1IGEgbWV0YSBlIHNhYmVtb3MgcXVlIGlzc28gbsOjbyDDqSBhIG1lbGhvciBkYXMgc2Vuc2HDp8O1ZXMuIE1hcyBuw6NvIGRlc2FuaW1lLiAnLFxuICAgICAgICAgICAgJ0VuY2FyZSBvIHByb2Nlc3NvIGNvbW8gdW0gYXByZW5kaXphZG8gZSBuw6NvIGRlaXhlIGRlIGNvZ2l0YXIgdW1hIHNlZ3VuZGEgdGVudGF0aXZhLiBOw6NvIHNlIHByZW9jdXBlLCB0b2RvcyBvcyBzZXVzIGFwb2lhZG9yZXMgcmVjZWJlcsOjbyBvIGRpbmhlaXJvIGRlIHZvbHRhLsKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzY1NTA3LVJlZ3Jhcy1lLWZ1bmNpb25hbWVudG8tZG9zLXJlZW1ib2xzb3MtZXN0b3Jub3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBmYXplbW9zIGVzdG9ybm9zIGUgcmVlbWJvbHNvcy4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCcuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFwcHJvdmVkOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBzZXUgcHJvamV0byBmb2kgYXByb3ZhZG8hJyksXG4gICAgICAgICAgICAnwqBQYXJhIGNvbG9jYXIgbyBzZXUgcHJvamV0byBubyBhciDDqSBwcmVjaXNvIGFwZW5hcyBxdWUgdm9jw6ogcHJlZW5jaGEgb3MgZGFkb3MgbmVjZXNzw6FyaW9zIG5hIGFiYcKgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIiN1c2VyX3NldHRpbmdzXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAnLiDDiSBpbXBvcnRhbnRlIHNhYmVyIHF1ZSBjb2JyYW1vcyBhIHRheGEgZGUgMTMlIGRvIHZhbG9yIHRvdGFsIGFycmVjYWRhZG8gYXBlbmFzIHBvciBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLiBFbnRlbmRhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIGZhemVtb3MgbyByZXBhc3NlIGRvIGRpbmhlaXJvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLFtcbiAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gbS5wcm9wKGFyZ3MuaXRlbS5yZXdhcmQuZGVzY3JpcHRpb24gfHwgJycpLFxuICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICBnZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICBzZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICBnZXRBdHRyID0gYnVpbGRlci5yYWRpb3MsXG4gICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXk7XG5cbiAgICAgIHNldEZpbHRlclt1cGRhdGVLZXldID0gJ2VxJztcbiAgICAgIHZhciBzZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgc2V0Vk1bdXBkYXRlS2V5XShpdGVtW3VwZGF0ZUtleV0pO1xuXG4gICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgIGdldFZNW2dldEtleV0oaXRlbVtnZXRLZXldKTtcblxuICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFJvd09wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIGRhdGFbMF0pO1xuICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBmZXRjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGdldExvYWRlci5sb2FkKCkudGhlbihmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICByYWRpb3MoaXRlbVswXVtnZXRBdHRyXSk7XG4gICAgICAgIH0sIGVycm9yKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAobmV3VmFsdWUoKSkge1xuICAgICAgICAgIGRhdGFbYnVpbGRlci5wcm9wZXJ0eV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKCcnKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpe1xuICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgIH07XG5cbiAgICAgIGZldGNoKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICB1bmxvYWQ6IHVubG9hZCxcbiAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KXtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubmV3VmFsdWUocmFkaW8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IGFyZ3MuaXRlbS5yZXdhcmQuaWQpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjci0nICsgaW5kZXggKyAnLnctcmFkaW8taW5wdXRbdHlwZT1yYWRpb11bbmFtZT1cImFkbWluLXJhZGlvXCJdW3ZhbHVlPVwiJyArIHJhZGlvLmlkICsgJ1wiXScgKyAoKHNlbGVjdGVkKSA/ICdbY2hlY2tlZF0nIDogJycpLHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLnctZm9ybS1sYWJlbFtmb3I9XCJyLScgKyBpbmRleCArICdcIl0nLCAnUiQnICsgcmFkaW8ubWluaW11bV92YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiBPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGgsIF8pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciByZXdhcmQgPSBhcmdzLmNvbnRyaWJ1dGlvbi5yZXdhcmQgfHwge30sXG4gICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIChfLmlzRW1wdHkocmV3YXJkKSkgPyAnQXBvaW8gc2VtIHJlY29tcGVuc2EuJyA6IFtcbiAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFtcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LCBuYW1lOiAnQXBvaW8gY29uZmlybWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LCBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCwgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCwgbmFtZTogJ0Fwb2lvIGNyaWFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LCBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCwgbmFtZTogJ0NoYXJnZWJhY2snfSxcbiAgICAgIF0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pe1xuICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgIH0sIFtdKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JyxbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsW1xuICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJyxbXG4gICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSksXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICB2YXIgdXNlclByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdXNlci51c2VyX3Byb2ZpbGVfaW1nIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgIH07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLFtcbiAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsW1xuICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgdXNlclByb2ZpbGUoKSArICdcIl0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci51c2VyX2lkICsgJy9lZGl0XCJdJywgdXNlci51c2VyX25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci51c2VyX2lkKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdDYXRhcnNlOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIHVzZXIucGF5ZXJfZW1haWwpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICB9LFtcbiAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSwgdmFsdWU6IGFyZ3Mudm0oKX0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sIGNhcmQgPSBudWxsLFxuICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgIGNhcmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpe1xuICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiAgcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpe1xuICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgIGlmIChjYXJkRGF0YSl7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKXtcbiAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsW1xuICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2FyZCA9ICgobSwgaCwgbW9kZWxzKSA9PiB7XG4gIHJldHVybiB7XG5cbiAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC5nZW5lcmF0ZVJlbWFpbmdUaW1lKHByb2plY3QpKCksXG4gICAgICAgICAgbGluayA9ICcvJyArIHByb2plY3QucGVybWFsaW5rICsgKGFyZ3MucmVmID8gJz9yZWY9JyArIGFyZ3MucmVmIDogJycpO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICBtKGBhLmNhcmQtcHJvamVjdC10aHVtYltocmVmPVwiJHtsaW5rfVwiXWAsIHtzdHlsZTogeydiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3Byb2plY3QucHJvamVjdF9pbWd9KWAsICdkaXNwbGF5JzogJ2Jsb2NrJ319KSxcbiAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICApLFxuICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIGBwb3IgJHtwcm9qZWN0Lm93bmVyX25hbWV9YCksXG4gICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250Y29sb3Itc2Vjb25kYXJ5LmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LmhlYWRsaW5lKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZX0sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltfWBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtbWV0ZXInLCBbXG4gICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge3N0eWxlOiB7d2lkdGg6IGAkeyhwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKX0lYH19KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7TWF0aC5jZWlsKHByb2plY3QucHJvZ3Jlc3MpfSVgKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUiQgJHtwcm9qZWN0LnBsZWRnZWR9YCksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke3JlbWFpbmluZ1RleHRPYmoudG90YWx9ICR7cmVtYWluaW5nVGV4dE9iai51bml0fWApLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ1Jlc3RhbnRlcycpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsX2Ftb3VudDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsO30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXJcdHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCksXG4gICAgICAgICAgICAgICAgICByZXNvdXJjZSA9IGNvbGxlY3Rpb25bMF0sXG4gICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9ICdERVNDJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzb3VyY2Uuc291cmNlID0gb3JkZXJlZFNvdXJjZTtcbiAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpKCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBjb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0xvY2FsaXphw6fDo28gZ2VvZ3LDoWZpY2EgZG9zIGFwb2lvcycpLFxuICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbil7XG4gICAgICAgICAgcmV0dXJuIG0oJy50YWJsZS1vdXRlci51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsICdFc3RhZG8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnQXBvaW9zwqDCoCcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpfSwgW1xuICAgICAgICAgICAgICAgICAgJ1IkIGFwb2lhZG9zICcsXG4gICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCcoJSBkbyB0b3RhbCnCoCcpLFxuICAgICAgICAgICAgICAgICAgJyAnLG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICBfLm1hcChjb250cmlidXRpb25Mb2NhdGlvbi5zb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2Uuc3RhdGVfYWNyb255bSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoc291cmNlLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnwqDCoCgnICsgc291cmNlLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZTtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1yZW1pbmRlci1jb3VudC5jYXJkLnUtcmFkaXVzLnUtdGV4dC1jZW50ZXIubWVkaXVtLnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvJywgcHJvamVjdC5yZW1pbmRlcl9jb3VudClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0pID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgIHJlZiA9IGFyZ3MucmVmO1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCA+IDAgPyBtKCcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiByZWZ9KTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgXSlcbiAgICAgIF0pIDogbSgnJyk7XG4gICAgfX07XG59KHdpbmRvdy5tKSk7XG5cbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX0sXG5cbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpe1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX07XG5cbiAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKV0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGl0ZW1BY3Rpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbklucHV0QWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblJhZGlvQWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5wcm9qZWN0RGV0YWlsLFxuICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5JbnB1dEFjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0hvbWUgPSAoKG0sIGMpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICBsZXQgdm0gPSB7XG4gICAgICAgIHJlY29tbWVuZGVkQ29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgcmVjZW50Q29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgbmVhck1lQ29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgZXhwaXJpbmdDb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICB9LFxuICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG5cbiAgICAgIGV4cGlyaW5nID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtleHBpcmVzX2F0OiAnbHRlJywgc3RhdGU6ICdlcSd9KSxcbiAgICAgIG5lYXJNZSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7bmVhcl9tZTogJ2VxJywgc3RhdGU6ICdlcSd9KSxcbiAgICAgIHJlY2VudHMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe29ubGluZV9kYXRlOiAnZ3RlJywgc3RhdGU6ICdlcSd9KSxcbiAgICAgIHJlY29tbWVuZGVkID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtyZWNvbW1lbmRlZDogJ2VxJywgc3RhdGU6ICdlcSd9KTtcblxuICAgICAgZXhwaXJpbmcuZXhwaXJlc19hdChtb21lbnQoKS5hZGQoMTQsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgZXhwaXJpbmcuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICBuZWFyTWUubmVhcl9tZSgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgcmVjZW50cy5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg1LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgIHJlY2VudHMuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICByZWNvbW1lbmRlZC5yZWNvbW1lbmRlZCgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgcHJvamVjdC5nZXRQYWdlKG5lYXJNZS5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ubmVhck1lQ29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UocmVjb21tZW5kZWQucGFyYW1ldGVycygpKS50aGVuKHZtLnJlY29tbWVuZGVkQ29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UocmVjZW50cy5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ucmVjZW50Q29sbGVjdGlvbik7XG4gICAgICBwcm9qZWN0LmdldFBhZ2UoZXhwaXJpbmcucGFyYW1ldGVycygpKS50aGVuKHZtLmV4cGlyaW5nQ29sbGVjdGlvbik7XG5cbiAgICAgIGxldCBjb2xsZWN0aW9ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgdm9jw6onLFxuICAgICAgICAgIGhhc2g6ICduZWFyX29mJyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5uZWFyTWVDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JlY29tZW5kYWRvcycsXG4gICAgICAgICAgaGFzaDogJ3JlY29tbWVuZGVkJyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5yZWNvbW1lbmRlZENvbGxlY3Rpb25cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnTmEgcmV0YSBmaW5hbCcsXG4gICAgICAgICAgaGFzaDogJ2V4cGlyaW5nJyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5leHBpcmluZ0NvbGxlY3Rpb25cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnUmVjZW50ZXMnLFxuICAgICAgICAgIGhhc2g6ICdyZWNlbnQnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLnJlY2VudENvbGxlY3Rpb25cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwuY29sbGVjdGlvbnMsIChjb2xsZWN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RSb3csIHtjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLCByZWY6IGBob21lXyR7Y29sbGVjdGlvbi5oYXNofWB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5wcm9qZWN0Lkluc2lnaHRzID0gKGZ1bmN0aW9uKG0sIGMsIG1vZGVscywgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnByb3AoW10pO1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oY29udHJpYnV0aW9uc1BlckRheSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bSxcbiAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICBjb250cmlidXRpb25zUGVyRGF5OiBjb250cmlidXRpb25zUGVyRGF5XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgIHJldHVybiBtKCcucHJvamVjdC1pbnNpZ2h0cycsW1xuICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LWxvb3Nlci51LW1hcmdpbmJvdHRvbS0xMCcsICdNaW5oYSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQsIHtyZXNvdXJjZTogcHJvamVjdH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7cmVzb3VyY2U6IHByb2plY3R9KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAoZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLmJnLWdyYXkuYmVmb3JlLWZvb3RlcicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge3N0eWxlOiB7J21pbi1oZWlnaHQnOiAnMzAwcHgnfX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXksIHtjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge3N0eWxlOiB7J21pbi1oZWlnaHQnOiAnMzAwcHgnfX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5LCB7Y29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLCB7cmVzb3VyY2VJZDogY3RybC52bS5wcm9qZWN0X2lkKCl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge3Jlc291cmNlOiBwcm9qZWN0fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KHByb2plY3QpKVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5MaXZlU3RhdGlzdGljcyA9ICgobSwgbW9kZWxzLCBoLCBfLCBKU09OKSA9PiB7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogKGFyZ3MgPSB7fSkgPT4ge1xuICAgICAgbGV0IHBhZ2VTdGF0aXN0aWNzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBub3RpZmljYXRpb25EYXRhID0gbS5wcm9wKHt9KTtcblxuICAgICAgbW9kZWxzLnN0YXRpc3RpYy5nZXRSb3coKS50aGVuKHBhZ2VTdGF0aXN0aWNzKTtcbiAgICAgIC8vIGFyZ3Muc29ja2V0IGlzIGEgc29ja2V0IHByb3ZpZGVkIGJ5IHNvY2tldC5pb1xuICAgICAgLy8gY2FuIHNlZSB0aGVyZSBodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZS9jYXRhcnNlLWxpdmUvYmxvYi9tYXN0ZXIvcHVibGljL2luZGV4LmpzI0w4XG4gICAgICBpZiAoYXJncy5zb2NrZXQgJiYgXy5pc0Z1bmN0aW9uKGFyZ3Muc29ja2V0Lm9uKSkge1xuICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICBub3RpZmljYXRpb25EYXRhKEpTT04ucGFyc2UobXNnLnBheWxvYWQpKTtcbiAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwYWdlU3RhdGlzdGljczogcGFnZVN0YXRpc3RpY3MsXG4gICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgbGV0IGRhdGEgPSBjdHJsLm5vdGlmaWNhdGlvbkRhdGEoKTtcblxuICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uYmctc3RhdHMuc2VjdGlvbi5taW4taGVpZ2h0LTEwMCcsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBfLm1hcChjdHJsLnBhZ2VTdGF0aXN0aWNzKCksIChzdGF0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFttKCdpbWcudS1tYXJnaW5ib3R0b20tNjBbc3JjPVwiaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NWFkYTVkZDExYjM2YTUyNjE2ZDk3ZGZfc3ltYm9sLWNhdGFyc2UucG5nXCJdJyksXG4gICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBzdGF0LnRvdGFsX2NvbnRyaWJ1dG9ycyksXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgXSldO1xuICAgICAgICB9KSksXG4gICAgICAgICghXy5pc0VtcHR5KGRhdGEpID8gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBkYXRhLnVzZXJfaW1hZ2UgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlLnUtbWFyZ2ludG9wLTIwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ2FjYWJvdSBkZSBhcG9pYXIgbycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pIDogJycpLFxuICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi5mb250Y29sb3ItbmVnYXRpdmVbaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZ2l0aHViJywgJy4nKSwnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwid2luZG93LmMucGFnZXMuVGVhbSA9IChmdW5jdGlvbihtLCBjKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJyxbXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcyl7XG4gIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgIHN0YXRlOiAnZXEnLFxuICAgIGdhdGV3YXk6ICdlcScsXG4gICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgfSksXG5cbiAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApe1xuICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gIH07XG5cbiAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gIHZtLnN0YXRlKCcnKTtcbiAgdm0uZ2F0ZXdheSgnJyk7XG4gIHZtLm9yZGVyKHtpZDogJ2Rlc2MnfSk7XG5cbiAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gIH07XG5cbiAgdm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZm9ybWF0KCk7XG4gIH07XG5cbiAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgfTtcblxuICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=