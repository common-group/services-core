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
      useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
    return avatarPath || '/assets/catarse_bootstrap/user.jpg';
  },

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
    loader: loader,
    useAvatarOrDefault: useAvatarOrDefault
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
  statistic = m.postgrest.model('statistics');

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

window.c.AdminUser = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var user = args.item;
      return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.user_profile_img) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name)]), m('.fontsize-smallest', 'Usuário: ' + user.user_id), m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + user.email), m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + user.payer_email)])]);
    }
  };
})(window.m, window.c.h);
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

      return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + link + '"]', { style: { 'background-image': 'url(' + project.project_img + ')', 'display': 'block' } }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter', [m('.meter', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', 'Restantes')])])])])]);
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
      })), !_.isEmpty(data) ? m('.w-container', [m('div', [m('.card.u-radius.u-marginbottom-60.medium', [m('.w-row', [m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.user_name)])])]), m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m('div', 'acabou de apoiar o')]), m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
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
"use strict";

window.c.admin.userListVM = (function (m, models) {
  return m.postgrest.paginationVM(models.userDetail.getPageWithToken);
})(window.m, window.c.models);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24tdGFibGUuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yb3cuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImFkbWluL3VzZXJzLmpzIiwiY29udHJpYnV0aW9uL3Byb2plY3RzLWhvbWUuanMiLCJwYWdlcy9saXZlLXN0YXRpc3RpY3MuanMiLCJwYWdlcy90ZWFtLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsImFkbWluL3VzZXJzL3VzZXItbGlzdC12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLENBQUMsQ0FBQyxHQUFJLENBQUEsWUFBVTtBQUNwQixTQUFPO0FBQ0wsVUFBTSxFQUFFLEVBQUU7QUFDVixTQUFLLEVBQUUsRUFBRTtBQUNULGdCQUFZLEVBQUUsRUFBRTtBQUNoQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxFQUFFO0FBQ1gsS0FBQyxFQUFFLEVBQUU7R0FDTixDQUFDO0NBQ0gsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDVEwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUM7O0FBRS9CLE1BQUksU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFZLElBQUksRUFBRSxNQUFNLEVBQUM7QUFDcEMsVUFBTSxHQUFHLE1BQU0sSUFBSSxZQUFZLENBQUM7QUFDaEMsV0FBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7R0FDdkQ7TUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBWSxJQUFJLEVBQUUsTUFBTSxFQUFDO0FBQ3ZDLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFdBQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckQ7OztBQUdELHNCQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFZLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDbkMsV0FBTyxVQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzVCLFVBQUksTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFF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OztBQUVGLFNBQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEFBQUMsQ0FBQzs7O0FDbENuRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUN2RCxTQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzdFLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQyIsImZpbGUiOiJjYXRhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LmMgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBtb2RlbHM6IHt9LFxuICAgIHBhZ2VzOiB7fSxcbiAgICBjb250cmlidXRpb246IHt9LFxuICAgIGFkbWluOiB7fSxcbiAgICBwcm9qZWN0OiB7fSxcbiAgICBoOiB7fVxuICB9O1xufSgpKTtcbiIsIndpbmRvdy5jLmggPSAoZnVuY3Rpb24obSwgbW9tZW50KXtcbiAgLy9EYXRlIEhlbHBlcnNcbiAgdmFyIG1vbWVudGlmeSA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCl7XG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5mb3JtYXQoZm9ybWF0KSA6ICdubyBkYXRlJztcbiAgfSxcblxuICBtb21lbnRGcm9tU3RyaW5nID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KXtcbiAgICB2YXIgZXVyb3BlYW4gPSBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XG4gICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICB9LFxuXG4gIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IGZ1bmN0aW9uKHMsIGMpe1xuICAgIHJldHVybiBmdW5jdGlvbihudW1iZXIsIG4sIHgpIHtcbiAgICAgIGlmIChudW1iZXIgPT09IG51bGwgfHwgbnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZSA9ICdcXFxcZCg/PShcXFxcZHsnICsgKHggfHwgMykgKyAnfSkrJyArIChuID4gMCA/ICdcXFxcRCcgOiAnJCcpICsgJyknLFxuICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgfTtcbiAgfSxcbiAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gIC8vT2JqZWN0IG1hbmlwdWxhdGlvbiBoZWxwZXJzXG4gIGdlbmVyYXRlUmVtYWluZ1RpbWUgPSBmdW5jdGlvbihwcm9qZWN0KSB7XG4gICAgdmFyIHJlbWFpbmluZ1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICB0cmFuc2xhdGVkVGltZSA9IHtcbiAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgIGhvdXJzOiAnaG9yYXMnLFxuICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgfTtcblxuICAgIHJlbWFpbmluZ1RleHRPYmooe1xuICAgICAgdW5pdDogdHJhbnNsYXRlZFRpbWVbcHJvamVjdC5yZW1haW5pbmdfdGltZS51bml0IHx8ICdzZWNvbmRzJ10sXG4gICAgICB0b3RhbDogcHJvamVjdC5yZW1haW5pbmdfdGltZS50b3RhbFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbWFpbmluZ1RleHRPYmo7XG4gIH0sXG5cbiAgdG9nZ2xlUHJvcCA9IGZ1bmN0aW9uKGRlZmF1bHRTdGF0ZSwgYWx0ZXJuYXRlU3RhdGUpe1xuICAgIHZhciBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgcC50b2dnbGUgPSBmdW5jdGlvbigpe1xuICAgICAgcCgoKHAoKSA9PT0gYWx0ZXJuYXRlU3RhdGUpID8gZGVmYXVsdFN0YXRlIDogYWx0ZXJuYXRlU3RhdGUpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHA7XG4gIH0sXG5cbiAgaWRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7aWQ6ICdlcSd9KSxcblxuICB1c2VBdmF0YXJPckRlZmF1bHQgPSBmdW5jdGlvbihhdmF0YXJQYXRoKSB7XG4gICAgcmV0dXJuIGF2YXRhclBhdGggfHwgJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnO1xuICB9LFxuXG4gIC8vVGVtcGxhdGVzXG4gIGxvYWRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwW3N0eWxlPVwibWFyZ2luLWJvdHRvbTotMTEwcHg7XCJdJywgW1xuICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICBdKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG1vbWVudGlmeTogbW9tZW50aWZ5LFxuICAgIG1vbWVudEZyb21TdHJpbmc6IG1vbWVudEZyb21TdHJpbmcsXG4gICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgaWRWTTogaWRWTSxcbiAgICB0b2dnbGVQcm9wOiB0b2dnbGVQcm9wLFxuICAgIGdlbmVyYXRlUmVtYWluZ1RpbWU6IGdlbmVyYXRlUmVtYWluZ1RpbWUsXG4gICAgbG9hZGVyOiBsb2FkZXIsXG4gICAgdXNlQXZhdGFyT3JEZWZhdWx0OiB1c2VBdmF0YXJPckRlZmF1bHRcbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKXtcbiAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfZGF5JyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICBwcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RzJyksXG4gIHRlYW1NZW1iZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndGVhbV9tZW1iZXJzJyksXG4gIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyk7XG4gIHN0YXRpc3RpYyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdzdGF0aXN0aWNzJyk7XG5cbiAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gIHByb2plY3QucGFnZVNpemUoMyk7XG5cbiAgcmV0dXJuIHtcbiAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICBwcm9qZWN0RGV0YWlsOiBwcm9qZWN0RGV0YWlsLFxuICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgdGVhbVRvdGFsOiB0ZWFtVG90YWwsXG4gICAgdGVhbU1lbWJlcjogdGVhbU1lbWJlcixcbiAgICB1c2VyRGV0YWlsOiB1c2VyRGV0YWlsLFxuICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXk6IHByb2plY3RDb250cmlidXRpb25zUGVyRGF5LFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgc3RhdGlzdGljOiBzdGF0aXN0aWNcbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLXNtYWxsJywgJ1IkJyArIGNvbnRyaWJ1dGlvbi52YWx1ZSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVkgSEg6bW1baF0nKSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgJ0lEIGRvIEdhdGV3YXk6ICcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgYWN0aW9ucyA9IGFyZ3MuYWN0aW9ucyxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICBfLm1hcChhY3Rpb25zLCBmdW5jdGlvbihhY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGNbYWN0aW9uLmNvbXBvbmVudF0sIHtkYXRhOiBhY3Rpb24uZGF0YSwgaXRlbTogYXJncy5pdGVtfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsW1xuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbiwge2NvbnRyaWJ1dGlvbjogaXRlbX0pLFxuICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnksIHtjb250cmlidXRpb246IGl0ZW19KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7Y29udHJpYnV0aW9uOiBpdGVtLCBrZXk6IGl0ZW0ua2V5fSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBmaWx0ZXJCdWlsZGVyID0gYXJncy5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgIG1haW4gPSBfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KTtcblxuICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnQXBvaW9zJyksXG4gICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgIG0oJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAoXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge2NvbXBvbmVudDogJ0ZpbHRlck1haW4nfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwLnctcm93JyxcbiAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJ0ZpbHRyb3MgYXZhbsOnYWRvcyDCoD4nKSksIChjdHJsLnRvZ2dsZXIoKSA/XG4gICAgICAgICAgICAgICAgbSgnI2FkdmFuY2VkLXNlYXJjaC53LXJvdy5hZG1pbi1maWx0ZXJzJywgW1xuICAgICAgICAgICAgICAgICAgXy5tYXAoZmlsdGVyQnVpbGRlciwgZnVuY3Rpb24oZil7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZi5jb21wb25lbnQgIT09ICdGaWx0ZXJNYWluJykgPyBtLmNvbXBvbmVudChjW2YuY29tcG9uZW50XSwgZi5kYXRhKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93LmMsIHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5JbnB1dEFjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAga2V5ID0gYnVpbGRlci5wcm9wZXJ0eSxcbiAgICAgICAgICBuZXdWYWx1ZSA9IG0ucHJvcChidWlsZGVyLmZvcmNlVmFsdWUgfHwgJycpO1xuXG4gICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBkYXRhW2tleV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpe1xuICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgIG5ld1ZhbHVlKGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCAnJyk7XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgbDogbCxcbiAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsW1xuICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLFxuICAgICAgICAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtjb25maWc6IGN0cmwudW5sb2FkfSxbXG4gICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAoIWRhdGEuZm9yY2VWYWx1ZSkgP1xuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3VmFsdWUpLCB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpfSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnQXBvaW8gdHJhbnNmZXJpZG8gY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4gTyBhcG9pbyBuw6NvIGZvaSB0cmFuc2ZlcmlkbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKVxuICAgICAgICAgIF0pXG4gICAgICAgIDogJydcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkl0ZW0gPSAoZnVuY3Rpb24obSwgXywgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG5cbiAgICAgIHZhciBkaXNwbGF5RGV0YWlsQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheURldGFpbEJveDogZGlzcGxheURldGFpbEJveFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLFtcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgXy5tYXAoYXJncy5idWlsZGVyLCBmdW5jdGlvbihkZXNjKXtcbiAgICAgICAgICAgIHJldHVybiBtKGRlc2Mud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbZGVzYy5jb21wb25lbnRdLCB7aXRlbTogaXRlbSwga2V5OiBpdGVtLmtleX0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge29uY2xpY2s6IGN0cmwuZGlzcGxheURldGFpbEJveC50b2dnbGV9KSxcbiAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChjLkFkbWluRGV0YWlsLCB7aXRlbTogaXRlbSwgYWN0aW9uczogYXJncy5hY3Rpb25zLCBrZXk6IGl0ZW0ua2V5fSkgOiAnJ1xuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkxpc3QgPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3Q7XG4gICAgICBpZiAoIWxpc3QuY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0LmZpcnN0UGFnZSkge1xuICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICBhcmdzLnZtLmVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3QsXG4gICAgICAgICAgZXJyb3IgPSBhcmdzLnZtLmVycm9yO1xuICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxcbiAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgIG0oJy5jYXJkLmNhcmQtZXJyb3IudS1yYWRpdXMuZm9udHdlaWdodC1ib2xkJywgZXJyb3IoKSkgOlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsXG4gICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICdDYXJyZWdhbmRvIC4uLicgOlxuICAgICAgICAgICAgICAgICAgICAgIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCAnIGRhZG9zIGVuY29udHJhZG9zJ11cbiAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWxpc3Qudy1jb250YWluZXInLFtcbiAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5JdGVtLCB7YnVpbGRlcjogYXJncy5pdGVtQnVpbGRlciwgYWN0aW9uczogYXJncy5pdGVtQWN0aW9ucywgaXRlbTogaXRlbSwga2V5OiBpdGVtLmtleX0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsW1xuICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdHVzVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZToge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ05PIEFSJ30sXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7Y3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLCB0ZXh0OiAnRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ07Dg08gRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczoge2Nzc0NsYXNzOiAndGV4dC13YWl0aW5nJywgdGV4dDogJ0FHVUFSREFORE8nfSxcbiAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ1JFQ1VTQURPJ30sXG4gICAgICAgICAgICAgICAgICBkcmFmdDoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ1JBU0NVTkhPJ30sXG4gICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ0VNIEFOw4FMSVNFJ30sXG4gICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0FQUk9WQURPJ31cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdHVzVGV4dE9iajtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC5nZW5lcmF0ZVJlbWFpbmdUaW1lKHByb2plY3QpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaigpO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwnwqAnLG0oJ3NwYW4nLCB7Y2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3N9LCBzdGF0dXNUZXh0T2JqLnRleHQpLCfCoCdcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge3N0eWxlOiB7d2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ319KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnZmluYW5jaWFkbycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdsZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgcmVtYWluaW5nVGV4dE9iai51bml0ICsgJyByZXN0YW50ZXMnKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBleHBsYW5hdGlvbiA9IGZ1bmN0aW9uKHJlc291cmNlKSB7XG4gICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgb25saW5lOiBbXG4gICAgICAgICAgICBtKCdzcGFuJywgJ1ZvY8OqIHBvZGUgcmVjZWJlciBhcG9pb3MgYXTDqSAyM2hzNTltaW41OXMgZG8gZGlhICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJy4gTGVtYnJlLXNlLCDDqSB0dWRvLW91LW5hZGEgZSB2b2PDqiBzw7MgbGV2YXLDoSBvcyByZWN1cnNvcyBjYXB0YWRvcyBzZSBiYXRlciBhIG1ldGEgZGVudHJvIGRlc3NlIHByYXpvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIG8gcmVwYXNzZSBkbyBkaW5oZWlybyBzZXLDoSBmZWl0by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBmYWlsZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIG7Do28gZGVzYW5pbWUhJyksXG4gICAgICAgICAgICAnIFNldSBwcm9qZXRvIG7Do28gYmF0ZXUgYSBtZXRhIGUgc2FiZW1vcyBxdWUgaXNzbyBuw6NvIMOpIGEgbWVsaG9yIGRhcyBzZW5zYcOnw7Vlcy4gTWFzIG7Do28gZGVzYW5pbWUuICcsXG4gICAgICAgICAgICAnRW5jYXJlIG8gcHJvY2Vzc28gY29tbyB1bSBhcHJlbmRpemFkbyBlIG7Do28gZGVpeGUgZGUgY29naXRhciB1bWEgc2VndW5kYSB0ZW50YXRpdmEuIE7Do28gc2UgcHJlb2N1cGUsIHRvZG9zIG9zIHNldXMgYXBvaWFkb3JlcyByZWNlYmVyw6NvIG8gZGluaGVpcm8gZGUgdm9sdGEuwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDctUmVncmFzLWUtZnVuY2lvbmFtZW50by1kb3MtcmVlbWJvbHNvcy1lc3Rvcm5vc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIGZhemVtb3MgZXN0b3Jub3MgZSByZWVtYm9sc29zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksJy4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIEVOVklBUiBlIGVudHJhcmVtb3MgZW0gY29udGF0byBwYXJhIGF2YWxpYXIgbyBzZXUgcHJvamV0by4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgYXBwcm92ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHNldSBwcm9qZXRvIGZvaSBhcHJvdmFkbyEnKSxcbiAgICAgICAgICAgICfCoFBhcmEgY29sb2NhciBvIHNldSBwcm9qZXRvIG5vIGFyIMOpIHByZWNpc28gYXBlbmFzIHF1ZSB2b2PDqiBwcmVlbmNoYSBvcyBkYWRvcyBuZWNlc3PDoXJpb3MgbmEgYWJhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiI3VzZXJfc2V0dGluZ3NcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICcuIMOJIGltcG9ydGFudGUgc2FiZXIgcXVlIGNvYnJhbW9zIGEgdGF4YSBkZSAxMyUgZG8gdmFsb3IgdG90YWwgYXJyZWNhZGFkbyBhcGVuYXMgcG9yIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuIEVudGVuZGHCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gZmF6ZW1vcyBvIHJlcGFzc2UgZG8gZGluaGVpcm8uJylcbiAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGF0ZVRleHRbcmVzb3VyY2Uuc3RhdGVdO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JyxbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLFtcbiAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5SYWRpb0FjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoYXJncy5pdGVtLnJld2FyZC5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleTtcblxuICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICBzZXRWTVt1cGRhdGVLZXldKGl0ZW1bdXBkYXRlS2V5XSk7XG5cbiAgICAgIGdldEZpbHRlcltnZXRLZXldID0gJ2VxJztcbiAgICAgIHZhciBnZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgZ2V0Vk1bZ2V0S2V5XShpdGVtW2dldEtleV0pO1xuXG4gICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0Um93T3B0aW9ucyhnZXRWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgdmFyIHNldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgZGF0YVswXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGZldGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgIHJhZGlvcyhpdGVtWzBdW2dldEF0dHJdKTtcbiAgICAgICAgfSwgZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChuZXdWYWx1ZSgpKSB7XG4gICAgICAgICAgZGF0YVtidWlsZGVyLnByb3BlcnR5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCl7XG4gICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgbmV3VmFsdWUoJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgdmFyIHNldERlc2NyaXB0aW9uID0gZnVuY3Rpb24odGV4dCl7XG4gICAgICAgIGRlc2NyaXB0aW9uKHRleHQpO1xuICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgfTtcblxuICAgICAgZmV0Y2goKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBzZXRMb2FkZXI6IHNldExvYWRlcixcbiAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICByYWRpb3M6IHJhZGlvc1xuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsW1xuICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLFxuICAgICAgICAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtjb25maWc6IGN0cmwudW5sb2FkfSxbXG4gICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCBmdW5jdGlvbihyYWRpbywgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdWYWx1ZShyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldERlc2NyaXB0aW9uKHJhZGlvLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChyYWRpby5pZCA9PT0gYXJncy5pdGVtLnJld2FyZC5pZCkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJykse1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHJld2FyZCA9IGFyZ3MuY29udHJpYnV0aW9uLnJld2FyZCB8fCB7fSxcbiAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgKF8uaXNFbXB0eShyZXdhcmQpKSA/ICdBcG9pbyBzZW0gcmVjb21wZW5zYS4nIDogW1xuICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW1xuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LCBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCBuYW1lOiAnQXBvaW8gY3JpYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCwgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LCBuYW1lOiAnQ2hhcmdlYmFjayd9LFxuICAgICAgXSwgZnVuY3Rpb24obWVtbywgaXRlbSl7XG4gICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgfSwgW10pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLFtcbiAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSgpKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlciA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnVzZXItYXZhdGFyW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdCh1c2VyLnVzZXJfcHJvZmlsZV9pbWcpICsgJ1wiXScpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JyxbXG4gICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLnVzZXJfaWQgKyAnL2VkaXRcIl0nLCB1c2VyLnVzZXJfbmFtZSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLnVzZXJfaWQpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0NhdGFyc2U6ICcgKyB1c2VyLmVtYWlsKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgdXNlci5wYXllcl9lbWFpbClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkZpbHRlckRhdGVSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgIH0sW1xuICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLCB2YWx1ZTogYXJncy52bSgpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlck51bWJlclJhbmdlID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBheW1lbnRTdGF0dXMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbSwgY2FyZCA9IG51bGwsXG4gICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgY2FyZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSl7XG4gICAgICAgICAgc3dpdGNoIChwYXltZW50LmdhdGV3YXkudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6ICBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmluLFxuICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iYW5kZWlyYVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9icmFuZFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZCgpO1xuICAgICAgICAgICAgaWYgKGNhcmREYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIG0oJyNjcmVkaXRjYXJkLWRldGFpbC5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgY2FyZERhdGEuZmlyc3RfZGlnaXRzICsgJyoqKioqKicgKyBjYXJkRGF0YS5sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgIGNhcmREYXRhLmJyYW5kICsgJyAnICsgcGF5bWVudC5pbnN0YWxsbWVudHMgKyAneCdcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHBheW1lbnRNZXRob2RDbGFzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1iYXJjb2RlJztcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtY3JlZGl0LWNhcmQnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQuc3RhdGUpe1xuICAgICAgICAgIGNhc2UgJ3BhaWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1zdWNjZXNzJztcbiAgICAgICAgICBjYXNlICdyZWZ1bmRlZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXJlZnVuZGVkJztcbiAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICBjYXNlICdwZW5kaW5nX3JlZnVuZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXdhaXRpbmcnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LWVycm9yJztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3M6IHBheW1lbnRNZXRob2RDbGFzcyxcbiAgICAgICAgc3RhdGVDbGFzczogc3RhdGVDbGFzc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cucGF5bWVudC1zdGF0dXMnLCBbXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jaXJjbGUnICsgY3RybC5zdGF0ZUNsYXNzKCkpLCAnwqAnICsgcGF5bWVudC5zdGF0ZVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLFtcbiAgICAgICAgICBtKCdzcGFuLmZhJyArIGN0cmwucGF5bWVudE1ldGhvZENsYXNzKCkpLCAnICcsIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCBwYXltZW50LnBheW1lbnRfbWV0aG9kKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICBjdHJsLmRpc3BsYXlQYXltZW50TWV0aG9kKClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDYXJkID0gKChtLCBoLCBtb2RlbHMpID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdCkoKSxcbiAgICAgICAgICBsaW5rID0gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAoYXJncy5yZWYgPyAnP3JlZj0nICsgYXJncy5yZWYgOiAnJyk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgbSgnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgIG0oYGEuY2FyZC1wcm9qZWN0LXRodW1iW2hyZWY9XCIke2xpbmt9XCJdYCwge3N0eWxlOiB7J2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7cHJvamVjdC5wcm9qZWN0X2ltZ30pYCwgJ2Rpc3BsYXknOiAnYmxvY2snfX0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JywgW1xuICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgXVxuICAgICAgICAgICksXG4gICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYHBvciAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QuaGVhZGxpbmUpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgW20oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlci5mYS0xJywgJyAnKSwgYCAke3Byb2plY3QuY2l0eV9uYW1lfSwgJHtwcm9qZWN0LnN0YXRlX2Fjcm9ueW19YF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1tZXRlcicsIFtcbiAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7c3R5bGU6IHt3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgfX0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCl9YCksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke3JlbWFpbmluZ1RleHRPYmoudG90YWx9ICR7cmVtYWluaW5nVGV4dE9iai51bml0fWApLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ1Jlc3RhbnRlcycpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsX2Ftb3VudDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsO30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXJcdHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCksXG4gICAgICAgICAgICAgICAgICByZXNvdXJjZSA9IGNvbGxlY3Rpb25bMF0sXG4gICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9ICdERVNDJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzb3VyY2Uuc291cmNlID0gb3JkZXJlZFNvdXJjZTtcbiAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpKCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBjb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0xvY2FsaXphw6fDo28gZ2VvZ3LDoWZpY2EgZG9zIGFwb2lvcycpLFxuICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbil7XG4gICAgICAgICAgcmV0dXJuIG0oJy50YWJsZS1vdXRlci51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsICdFc3RhZG8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnQXBvaW9zwqDCoCcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpfSwgW1xuICAgICAgICAgICAgICAgICAgJ1IkIGFwb2lhZG9zICcsXG4gICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCcoJSBkbyB0b3RhbCnCoCcpLFxuICAgICAgICAgICAgICAgICAgJyAnLG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICBfLm1hcChjb250cmlidXRpb25Mb2NhdGlvbi5zb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2Uuc3RhdGVfYWNyb255bSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoc291cmNlLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnwqDCoCgnICsgc291cmNlLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZTtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1yZW1pbmRlci1jb3VudC5jYXJkLnUtcmFkaXVzLnUtdGV4dC1jZW50ZXIubWVkaXVtLnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvJywgcHJvamVjdC5yZW1pbmRlcl9jb3VudClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0pID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgIHJlZiA9IGFyZ3MucmVmO1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCA+IDAgPyBtKCcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiByZWZ9KTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgXSlcbiAgICAgIF0pIDogbSgnJyk7XG4gICAgfX07XG59KHdpbmRvdy5tKSk7XG5cbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX0sXG5cbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpe1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX07XG5cbiAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKV0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGl0ZW1BY3Rpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbklucHV0QWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblJhZGlvQWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5wcm9qZWN0RGV0YWlsLFxuICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5JbnB1dEFjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLlVzZXJzID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4udXNlckxpc3RWTSxcbiAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbUFjdGlvbnM6IFtdLFxuICAgICAgICBpdGVtQnVpbGRlcjogaXRlbUJ1aWxkZXIsXG4gICAgICAgIGxpc3RWTToge2xpc3Q6IGxpc3RWTSwgZXJyb3I6IGVycm9yfSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHt2bTogY3RybC5saXN0Vk0sIGl0ZW1CdWlsZGVyOiBjdHJsLml0ZW1CdWlsZGVyLCBpdGVtQWN0aW9uczogY3RybC5pdGVtQWN0aW9uc30pXG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5jb250cmlidXRpb24uUHJvamVjdHNIb21lID0gKChtLCBjKSA9PiB7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgbGV0IHZtID0ge1xuICAgICAgICByZWNvbW1lbmRlZENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIHJlY2VudENvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIG5lYXJNZUNvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgIGV4cGlyaW5nQ29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgfSxcbiAgICAgIHByb2plY3QgPSBjLm1vZGVscy5wcm9qZWN0LFxuXG4gICAgICBleHBpcmluZyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7ZXhwaXJlc19hdDogJ2x0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICBuZWFyTWUgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe25lYXJfbWU6ICdlcScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNlbnRzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtvbmxpbmVfZGF0ZTogJ2d0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNvbW1lbmRlZCA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cmVjb21tZW5kZWQ6ICdlcScsIHN0YXRlOiAnZXEnfSk7XG5cbiAgICAgIGV4cGlyaW5nLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgIGV4cGlyaW5nLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgbmVhck1lLm5lYXJfbWUoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHJlY2VudHMub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNSwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICAgICByZWNlbnRzLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgcmVjb21tZW5kZWQucmVjb21tZW5kZWQoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHByb2plY3QuZ2V0UGFnZShuZWFyTWUucGFyYW1ldGVycygpKS50aGVuKHZtLm5lYXJNZUNvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKHJlY29tbWVuZGVkLnBhcmFtZXRlcnMoKSkudGhlbih2bS5yZWNvbW1lbmRlZENvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKHJlY2VudHMucGFyYW1ldGVycygpKS50aGVuKHZtLnJlY2VudENvbGxlY3Rpb24pO1xuICAgICAgcHJvamVjdC5nZXRQYWdlKGV4cGlyaW5nLnBhcmFtZXRlcnMoKSkudGhlbih2bS5leHBpcmluZ0NvbGxlY3Rpb24pO1xuXG4gICAgICBsZXQgY29sbGVjdGlvbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIHZvY8OqJyxcbiAgICAgICAgICBoYXNoOiAnbmVhcl9vZicsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ubmVhck1lQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgIGhhc2g6ICdyZWNvbW1lbmRlZCcsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ05hIHJldGEgZmluYWwnLFxuICAgICAgICAgIGhhc2g6ICdleHBpcmluZycsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0uZXhwaXJpbmdDb2xsZWN0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICBoYXNoOiAncmVjZW50JyxcbiAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5yZWNlbnRDb2xsZWN0aW9uXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgIHJldHVybiBfLm1hcChjdHJsLmNvbGxlY3Rpb25zLCAoY29sbGVjdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7Y29sbGVjdGlvbjogY29sbGVjdGlvbiwgcmVmOiBgaG9tZV8ke2NvbGxlY3Rpb24uaGFzaH1gfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMucGFnZXMuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgYXJncy5zb2NrZXQub24oJ25ld19wYWlkX2NvbnRyaWJ1dGlvbnMnLCAobXNnKSA9PiB7XG4gICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgbW9kZWxzLnN0YXRpc3RpYy5nZXRSb3coKS50aGVuKHBhZ2VTdGF0aXN0aWNzKTtcbiAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICBub3RpZmljYXRpb25EYXRhOiBub3RpZmljYXRpb25EYXRhXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgIGxldCBkYXRhID0gY3RybC5ub3RpZmljYXRpb25EYXRhKCk7XG5cbiAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLmJnLXN0YXRzLnNlY3Rpb24ubWluLWhlaWdodC0xMDAnLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgIHJldHVybiBbbSgnaW1nLnUtbWFyZ2luYm90dG9tLTYwW3NyYz1cImh0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTVhZGE1ZGQxMWIzNmE1MjYxNmQ5N2RmX3N5bWJvbC1jYXRhcnNlLnBuZ1wiXScpLFxuICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHN0YXQudG90YWxfY29udHJpYnV0ZWQsIDIsIDMpKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcyBwdWJsaWNhZG9zIHBvciBhcXVpJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgc3RhdC50b3RhbF9jb250cmlidXRvcnMpLFxuICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ1Blc3NvYXMgasOhIGFwb2lhcmFtIHBlbG8gbWVub3MgMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgIF0pXTtcbiAgICAgICAgfSkpLFxuICAgICAgICAoIV8uaXNFbXB0eShkYXRhKSA/IG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICBtKCcuY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS02MC5tZWRpdW0nLCBbXG4gICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIGRhdGEudXNlcl9uYW1lKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnYWNhYm91IGRlIGFwb2lhciBvJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9XCInICsgZGF0YS5wcm9qZWN0X2ltYWdlICsgJ1wiXVt3aWR0aD1cIjc1XCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSkgOiAnJyksXG4gICAgICAgIG0oJy51LXRleHQtY2VudGVyLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLmZvbnRjb2xvci1uZWdhdGl2ZVtocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2VcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1naXRodWInLCAnLicpLCcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG0oJyNzdGF0aWMtdGVhbS1hcHAnLFtcbiAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtVG90YWwpLFxuICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnByb2plY3QuSW5zaWdodHMgPSAoZnVuY3Rpb24obSwgYywgbW9kZWxzLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3Byb2plY3RfaWQ6ICdlcSd9KSxcbiAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSk7XG5cbiAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgbW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihwcm9qZWN0RGV0YWlscyk7XG4gICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdm06IHZtLFxuICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gXy5tYXAoY3RybC5wcm9qZWN0RGV0YWlscygpLCBmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWluc2lnaHRzJyxbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5kYXNoYm9hcmQtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgJ01pbmhhIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge3Jlc291cmNlOiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sIHtyZXNvdXJjZTogcHJvamVjdH0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIChmdW5jdGlvbihwcm9qZWN0KXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25Ub3RhbFBlckRheSwge2NvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7c3R5bGU6IHsnbWluLWhlaWdodCc6ICczMDBweCd9fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXksIHtjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsIHtyZXNvdXJjZUlkOiBjdHJsLnZtLnByb2plY3RfaWQoKX0pXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlckNvdW50LCB7cmVzb3VyY2U6IHByb2plY3R9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0ocHJvamVjdCkpXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLmFkbWluLnVzZXJMaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnVzZXJEZXRhaWwuZ2V0UGFnZVdpdGhUb2tlbik7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIGgsIHJlcGxhY2VEaWFjcml0aWNzKXtcbiAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgc3RhdGU6ICdlcScsXG4gICAgZ2F0ZXdheTogJ2VxJyxcbiAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICB9KSxcblxuICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCl7XG4gICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfTtcblxuICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgdm0uc3RhdGUoJycpO1xuICB2bS5nYXRld2F5KCcnKTtcbiAgdm0ub3JkZXIoe2lkOiAnZGVzYyd9KTtcblxuICB2bS5jcmVhdGVkX2F0Lmx0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5lbmRPZignZGF5JykuZm9ybWF0KCcnKTtcbiAgfTtcblxuICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5ndGUoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgfTtcblxuICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICB9O1xuXG4gIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwuZ2V0UGFnZVdpdGhUb2tlbik7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==