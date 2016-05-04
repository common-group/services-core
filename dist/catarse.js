var c = (function (m,postgrest$1,moment$1,I18n$1,_$1,Chart,replaceDiacritics) {
  'use strict';

  m = 'default' in m ? m['default'] : m;
  postgrest$1 = 'default' in postgrest$1 ? postgrest$1['default'] : postgrest$1;
  moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;
  I18n$1 = 'default' in I18n$1 ? I18n$1['default'] : I18n$1;
  _$1 = 'default' in _$1 ? _$1['default'] : _$1;
  Chart = 'default' in Chart ? Chart['default'] : Chart;
  replaceDiacritics = 'default' in replaceDiacritics ? replaceDiacritics['default'] : replaceDiacritics;

  var hashMatch = function hashMatch(str) {
      return window.location.hash === str;
  };
  var paramByName = function paramByName(name) {
      var normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
          regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
          results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
  var selfOrEmpty = function selfOrEmpty(obj) {
      var emptyState = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      return obj ? obj : emptyState;
  };
  var setMomentifyLocale = function setMomentifyLocale() {
      moment$1.locale('pt', {
          monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
      });
  };
  var existy = function existy(x) {
      return x != null;
  };
  var momentify = function momentify(date, format) {
      format = format || 'DD/MM/YYYY';
      return date ? moment$1(date).locale('pt').format(format) : 'no date';
  };
  var storeAction = function storeAction(action) {
      if (!sessionStorage.getItem(action)) {
          return sessionStorage.setItem(action, action);
      }
  };
  var callStoredAction = function callStoredAction(action, func) {
      if (sessionStorage.getItem(action)) {
          func.call();
          return sessionStorage.removeItem(action);
      }
  };
  var discuss = function discuss(page, identifier) {
      var d = document,
          s = d.createElement('script');
      window.disqus_config = function () {
          this.page.url = page;
          this.page.identifier = identifier;
      };
      s.src = '//catarseflex.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
      return m('');
  };
  var momentFromString = function momentFromString(date, format) {
      var european = moment$1(date, format || 'DD/MM/YYYY');
      return european.isValid() ? european : moment$1(date);
  };
  var translatedTimeUnits = {
      days: 'dias',
      minutes: 'minutos',
      hours: 'horas',
      seconds: 'segundos'
  };
  var translatedTime = function translatedTime(time) {
      var translatedTime = translatedTimeUnits,
          unit = function unit() {
          var projUnit = translatedTime[time.unit || 'seconds'];

          return time.total <= 1 ? projUnit.slice(0, -1) : projUnit;
      };

      return {
          unit: unit(),
          total: time.total
      };
  };
  var generateFormatNumber = function generateFormatNumber(s, c) {
      return function (number, n, x) {
          if (!_.isNumber(number)) {
              return null;
          }

          var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
              num = number.toFixed(Math.max(0, ~ ~n));
          return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
      };
  };
  var formatNumber = generateFormatNumber('.', ',');
  var toggleProp = function toggleProp(defaultState, alternateState) {
      var p = m.prop(defaultState);
      p.toggle = function () {
          return p(p() === alternateState ? defaultState : alternateState);
      };

      return p;
  };
  var idVM = postgrest.filtersVM({
      id: 'eq'
  });
  var getCurrentProject = function getCurrentProject() {
      var root = document.getElementById('project-show-root'),
          data = root.getAttribute('data-parameters');
      if (data) {
          return JSON.parse(data);
      } else {
          return false;
      }
  };
  var getRdToken = function getRdToken() {
      var meta = _.first(document.querySelectorAll('[name=rd-token]'));

      return meta ? meta.content : undefined;
  };
  var getUser = function getUser() {
      var body = document.getElementsByTagName('body'),
          data = _.first(body).getAttribute('data-user');
      if (data) {
          return JSON.parse(data);
      } else {
          return false;
      }
  };
  var locationActionMatch = function locationActionMatch(action) {
      var act = window.location.pathname.split('/').slice(-1)[0];
      return action === act;
  };
  var useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
      return avatarPath || '/assets/catarse_bootstrap/user.jpg';
  };
  var loader = function loader() {
      return m('.u-text-center.u-margintop-30 u-marginbottom-30', [m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
  };
  var newFeatureBadge = function newFeatureBadge() {
      return m('span.badge.badge-success.margin-side-5', I18n$1.t('projects.new_feature_badge'));
  };
  var fbParse = function fbParse() {
      var tryParse = function tryParse() {
          try {
              window.FB.XFBML.parse();
          } catch (e) {
              console.log(e);
          }
      };

      return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
  };
  var pluralize = function pluralize(count, s, p) {
      return count > 1 ? count + p : count + s;
  };
  var simpleFormat = function simpleFormat() {
      var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      str = str.replace(/\r\n?/, '\n');
      if (str.length > 0) {
          str = str.replace(/\n\n+/g, '</p><p>');
          str = str.replace(/\n/g, '<br />');
          str = '<p>' + str + '</p>';
      }
      return str;
  };
  var rewardSouldOut = function rewardSouldOut(reward) {
      return reward.maximum_contributions > 0 ? reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions : false;
  };
  var rewardRemaning = function rewardRemaning(reward) {
      return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
  };
  var parseUrl = function parseUrl(href) {
      var l = document.createElement('a');
      l.href = href;
      return l;
  };
  var UIHelper = function UIHelper() {
      return function (el, isInitialized) {
          if (!isInitialized && $) {
              window.UIHelper.setupResponsiveIframes($(el));
          }
      };
  };
  var toAnchor = function toAnchor() {
      return function (el, isInitialized) {
          if (!isInitialized) {
              var hash = window.location.hash.substr(1);
              if (hash === el.id) {
                  window.location.hash = '';
                  setTimeout(function () {
                      window.location.hash = el.id;
                  });
              }
          }
      };
  };
  var validateEmail = function validateEmail(email) {
      var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(email);
  };
  var navigateToDevise = function navigateToDevise() {
      window.location.href = '/pt/login';
      return false;
  };
  var cumulativeOffset = function cumulativeOffset(element) {
      var top = 0,
          left = 0;
      do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
      } while (element);

      return {
          top: top,
          left: left
      };
  };
  var closeModal = function closeModal() {
      var el = document.getElementsByClassName('modal-close')[0];
      if (_.isElement(el)) {
          el.onclick = function (event) {
              event.preventDefault();

              document.getElementsByClassName('modal-backdrop')[0].style.display = 'none';
          };
      };
  };
  var closeFlash = function closeFlash() {
      var el = document.getElementsByClassName('icon-close')[0];
      if (_.isElement(el)) {
          el.onclick = function (event) {
              event.preventDefault();

              el.parentElement.remove();
          };
      };
  };
  var i18nScope = function i18nScope(scope, obj) {
      obj = obj || {};
      return _.extend({}, obj, { scope: scope });
  };
  var redrawHashChange = function redrawHashChange(before) {
      var callback = _.isFunction(before) ? function () {
          before();
          m.redraw();
      } : m.redraw;

      window.addEventListener('hashchange', callback, false);
  };
  var authenticityToken = function authenticityToken() {
      var meta = _.first(document.querySelectorAll('[name=csrf-token]'));
      return meta ? meta.content : undefined;
  };
  var animateScrollTo = function animateScrollTo(el) {
      var scrolled = window.scrollY;

      var offset = cumulativeOffset(el).top,
          duration = 300,
          dFrame = (offset - scrolled) / duration,

      //EaseInOutCubic easing function. We'll abstract all animation funs later.
      eased = function eased(t) {
          return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
          animation = setInterval(function () {
          var pos = eased(scrolled / offset) * scrolled;

          window.scrollTo(0, pos);

          if (scrolled >= offset) {
              clearInterval(animation);
          }

          scrolled = scrolled + dFrame;
      }, 1);
  };
  var scrollTo = function scrollTo() {
      var setTrigger = function setTrigger(el, anchorId) {
          el.onclick = function () {
              var anchorEl = document.getElementById(anchorId);

              if (_.isElement(anchorEl)) {
                  animateScrollTo(anchorEl);
              }

              return false;
          };
      };

      return function (el, isInitialized) {
          if (!isInitialized) {
              setTrigger(el, el.hash.slice(1));
          }
      };
  };
  var RDTracker = function RDTracker(eventId) {
      return function (el, isInitialized) {
          if (!isInitialized) {
              var integrationScript = document.createElement('script');
              integrationScript.type = 'text/javascript';
              integrationScript.id = 'RDIntegration';

              if (!document.getElementById(integrationScript.id)) {
                  document.body.appendChild(integrationScript);
                  integrationScript.onload = function () {
                      return RdIntegration.integrate(getRdToken(), eventId);
                  };
                  integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
              }

              return false;
          }
      };
  };
  setMomentifyLocale();
  closeFlash();
  closeModal();

  var h = {
      authenticityToken: authenticityToken,
      cumulativeOffset: cumulativeOffset,
      discuss: discuss,
      existy: existy,
      validateEmail: validateEmail,
      momentify: momentify,
      momentFromString: momentFromString,
      formatNumber: formatNumber,
      idVM: idVM,
      getUser: getUser,
      getCurrentProject: getCurrentProject,
      toggleProp: toggleProp,
      loader: loader,
      newFeatureBadge: newFeatureBadge,
      fbParse: fbParse,
      pluralize: pluralize,
      simpleFormat: simpleFormat,
      translatedTime: translatedTime,
      rewardSouldOut: rewardSouldOut,
      rewardRemaning: rewardRemaning,
      parseUrl: parseUrl,
      hashMatch: hashMatch,
      redrawHashChange: redrawHashChange,
      useAvatarOrDefault: useAvatarOrDefault,
      locationActionMatch: locationActionMatch,
      navigateToDevise: navigateToDevise,
      storeAction: storeAction,
      callStoredAction: callStoredAction,
      UIHelper: UIHelper,
      toAnchor: toAnchor,
      paramByName: paramByName,
      i18nScope: i18nScope,
      RDTracker: RDTracker,
      selfOrEmpty: selfOrEmpty,
      scrollTo: scrollTo
  };

  var models = {
      contributionDetail: postgrest.model('contribution_details'),
      contributionActivity: postgrest.model('contribution_activities'),
      projectDetail: postgrest.model('project_details'),
      userDetail: postgrest.model('user_details'),
      balance: postgrest.model('balances'),
      balanceTransaction: postgrest.model('balance_transactions'),
      balanceTransfer: postgrest.model('balance_transfers'),
      user: postgrest.model('users'),
      bankAccount: postgrest.model('bank_accounts'),
      rewardDetail: postgrest.model('reward_details'),
      projectReminder: postgrest.model('project_reminders'),
      contributions: postgrest.model('contributions'),
      directMessage: postgrest.model('direct_messages'),
      teamTotal: postgrest.model('team_totals'),
      projectAccount: postgrest.model('project_accounts'),
      projectContribution: postgrest.model('project_contributions'),
      projectPostDetail: postgrest.model('project_posts_details'),
      projectContributionsPerDay: postgrest.model('project_contributions_per_day'),
      projectContributionsPerLocation: postgrest.model('project_contributions_per_location'),
      projectContributionsPerRef: postgrest.model('project_contributions_per_ref'),
      project: postgrest.model('projects'),
      projectSearch: postgrest.model('rpc/project_search'),
      category: postgrest.model('categories'),
      categoryTotals: postgrest.model('category_totals'),
      categoryFollower: postgrest.model('category_followers'),
      teamMember: postgrest.model('team_members'),
      notification: postgrest.model('notifications'),
      statistic: postgrest.model('statistics'),
      successfulProject: postgrest.model('successful_projects')
  };

  models.teamMember.pageSize(40);
  models.rewardDetail.pageSize(false);
  models.project.pageSize(30);
  models.category.pageSize(50);
  models.contributionActivity.pageSize(40);
  models.successfulProject.pageSize(9);

  var landingSignup = {
      controller: function controller(args) {
          var builder = args.builder,
              email = m.prop(''),
              error = m.prop(false),
              submit = function submit() {
              if (h.validateEmail(email())) {
                  return true;
              } else {
                  error(true);
                  return false;
              }
          };
          return {
              email: email,
              submit: submit,
              error: error
          };
      },
      view: function view(ctrl, args) {
          var errorClasses = !ctrl.error ? '.positive.error' : '';
          return m('form.w-form[id="email-form"][method="post"][action="' + args.builder.customAction + '"]', {
              onsubmit: ctrl.submit
          }, [m('.w-col.w-col-5', [m('input' + errorClasses + '.w-input.text-field.medium[name="EMAIL"][placeholder="Digite seu email"][type="text"]', {
              config: h.RDTracker('landing-flex'),
              onchange: m.withAttr('value', ctrl.email),
              value: ctrl.email()
          }), ctrl.error() ? m('span.fontsize-smaller.text-error', 'E-mail inválido') : '']), m('.w-col.w-col-3', [m('input.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')])]);
      }
  };

  var I18nScope = _$1.partial(h.i18nScope, 'projects.card');
  var projectCard = {
      view: function view(ctrl, args) {
          var project = args.project,
              progress = project.progress.toFixed(2),
              remainingTextObj = h.translatedTime(project.remaining_time),
              link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : ''),
              type = args.type || 'small',
              css = function css(cardType) {
              var cssClasses = {
                  'small': {
                      wrapper: '.w-col.w-col-4',
                      innerWrapper: '.card-project.card.u-radius',
                      thumb: '.card-project-thumb',
                      descriptionWrapper: '',
                      description: '.card-project-description.alt',
                      title: '.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base',
                      author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                      headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                      city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                  },
                  'medium': {
                      wrapper: '.w-col.w-col-6',
                      innerWrapper: '.card-project.card.u-radius',
                      thumb: '.card-project-thumb.medium',
                      descriptionWrapper: '',
                      description: '.card-project-description.alt',
                      title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                      author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                      headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                      city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                  },
                  'big': {
                      wrapper: '.card.u-radius.card-project',
                      innerWrapper: '.w-row',
                      thumb: '.w-col.w-col-8.w-col-medium-6.card-project-thumb.big',
                      descriptionWrapper: '.w-col.w-col-4.w-col-medium-6',
                      description: '.card-project-description.big',
                      title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                      author: '.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                      headline: '.fontcolor-secondary.fontsize-smaller',
                      city: '.w-hidden'
                  }
              };

              return cssClasses[cardType];
          };

          return m(css(type).wrapper, [m(css(type).innerWrapper, [m('a' + css(type).thumb + '[href="' + link + '"]', {
              style: {
                  'background-image': 'url(' + project.project_img + ')',
                  'display': 'block'
              }
          }), m(css(type).descriptionWrapper, [m(css(type).description, [m(css(type).title, [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m(css(type).author, I18n$1.t('by', I18nScope()) + ' ' + project.owner_name), m(css(type).headline, [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m(css(type).city, [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m('.card-project-meter.' + project.state, [_$1.contains(['successful', 'failed', 'waiting_funds'], project.state) ? m('div', I18n$1.t('display_status.' + project.state, I18nScope())) : m('.meter', [m('.meter-fill', {
              style: {
                  width: (progress > 100 ? 100 : progress) + '%'
              }
          })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [m('.fontsize-smallest.lineheight-tight', ['Prazo em', m('br'), 'aberto'])])])])])])]);
      }
  };

  var projectRow = {
      view: function view(ctrl, args) {
          var collection = args.collection,
              title = args.title || collection.title,
              ref = args.ref,
              wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

          if (collection.loader() || collection.collection().length > 0) {
              return m(wrapper, [m('.w-container', [!_$1.isUndefined(collection.title) || !_$1.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.loader() ? h.loader() : m('.w-row', _$1.map(collection.collection(), function (project) {
                  return m.component(projectCard, {
                      project: project,
                      ref: ref
                  });
              }))])]);
          } else {
              return m('div');
          }
      }
  };

  var landingQA = {
      controller: function controller(args) {
          return {
              showAnswer: h.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [m('.fontsize-base', {
              onclick: ctrl.showAnswer.toggle
          }, args.question), ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', m.trust(args.answer)) : '']);
      }
  };

  var Flex = {
      controller: function controller() {
          var stats = m.prop([]),
              projects = m.prop([]),
              l = m.prop(),
              sample3 = _.partial(_.sample, _, 3),
              builder = {
              customAction: 'http://fazum.catarse.me/obrigado-landing-catarse-flex'
          },
              addDisqus = function addDisqus(el, isInitialized) {
              if (!isInitialized) {
                  h.discuss('https://catarse.me/flex', 'flex_page');
              }
          },
              flexVM = postgrest$1.filtersVM({
              mode: 'eq',
              state: 'eq',
              recommended: 'eq'
          }),
              statsLoader = postgrest$1.loaderWithToken(models.statistic.getRowOptions());

          flexVM.mode('flex').state('online').recommended(true);

          var projectsLoader = postgrest$1.loader(models.project.getPageOptions(flexVM.parameters()));

          statsLoader.load().then(stats);

          projectsLoader.load().then(_.compose(projects, sample3));

          return {
              addDisqus: addDisqus,
              builder: builder,
              statsLoader: statsLoader,
              stats: stats,
              projectsLoader: projectsLoader,
              projects: {
                  loader: projectsLoader,
                  collection: projects
              }
          };
      },
      view: function view(ctrl, args) {
          var stats = _.first(ctrl.stats());

          return [m('.w-section.hero-full.hero-zelo', [m('.w-container.u-text-center', [m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m('.w-row', [m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding! Cadastre seu email e saiba como inscrever o seu projeto no flex!')]), m('.w-row', [m('.w-col.w-col-2'), m.component(landingSignup, {
              builder: ctrl.builder
          }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistenciais, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m('.w-section.section', [m('.w-container', [m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? h.loader() : m.component(projectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m('.w-section.divider'), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(landingQA, {
              question: 'Quais são as taxas da modalidade flexível? ',
              answer: 'Como no Catarse, enviar um projeto não custa nada! A taxa cobrada no serviço Catarse flex é de 13% sobre o valor arrecadado.'
          }), m.component(landingQA, {
              question: 'De onde vem o dinheiro do meu projeto?',
              answer: 'Família, amigos, fãs e membros de comunidades que você faz parte são seus maiores colaboradores. São eles que irão divulgar sua campanha para as pessoas que eles conhecem, e assim o círculo de apoiadores vai aumentando e a sua campanha ganha força.'
          }), m.component(landingQA, {
              question: 'Qual a diferença entre o flexível e o "tudo ou nada"?',
              answer: 'Atualmente o Catarse utiliza apenas o modelo "tudo ou nada", onde você só fica com o dinheiro se bater a meta de arrecadação dentro do prazo da campanha. O modelo flexível é diferente pois permite que o realizador fique com o que arrecadar, independente de atingir ou não a meta do projeto no prazo da campanha. Não haverá limite de tempo para as campanhas. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado.'
          })]), m('.w-col.w-col-6', [m.component(landingQA, {
              question: 'Posso inscrever projetos para a modalidade flexível já?',
              answer: 'Sim. Cadastre seu email e saiba como inscrever o seu projeto no flex!'
          }), m.component(landingQA, {
              question: 'Por quê vocês querem fazer o Catarse flex?',
              answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O Catarse flex é mais um passo nessa direção.'
          }), m.component(landingQA, {
              question: 'Quando vocês irão lançar o Catarse flex?',
              answer: 'Ainda não sabemos quando abriremos o flex para o público em geral, mas você pode cadastrar seu email nessa página e receber um material especial de como inscrever seu projeto.'
          })])])])]), m('.w-section.section-large.u-text-center.bg-purple', [m('.w-container.fontcolor-negative', [m('.fontsize-largest', 'Inscreva seu projeto!'), m('.fontsize-base.u-marginbottom-60', 'Cadastre seu email e saiba como inscrever o seu projeto no flex!'), m('.w-row', [m('.w-col.w-col-2'), m.component(landingSignup, {
              builder: ctrl.builder
          }), m('.w-col.w-col-2')])])]), m('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m('.w-container.u-text-center', [m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), m('.w-row.u-text-center', ctrl.statsLoader() ? h.loader() : [m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), m('.w-section.section.bg-blue-one.fontcolor-negative', [m('.w-container', [m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), m('.w-col.w-col-2')])])]), m('.w-section.section-large.bg-greenlime', [m('.w-container', [m('#participe-do-debate.u-text-center', { config: h.toAnchor() }, [m('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), m('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
              config: ctrl.addDisqus
          })])])]];
      }
  };

  var tooltip = {
      controller: function controller(args) {
          var parentHeight = m.prop(0),
              width = m.prop(args.width || 280),
              top = m.prop(0),
              left = m.prop(0),
              opacity = m.prop(0),
              parentOffset = m.prop({ top: 0, left: 0 }),
              tooltip = h.toggleProp(0, 1),
              toggle = function toggle() {
              tooltip.toggle();
              m.redraw();
          };

          var setParentPosition = function setParentPosition(el, isInitialized) {
              if (!isInitialized) {
                  parentOffset(h.cumulativeOffset(el));
              }
          },
              setPosition = function setPosition(el, isInitialized) {
              if (!isInitialized) {
                  var elTop = el.offsetHeight + el.offsetParent.offsetHeight;
                  var style = window.getComputedStyle(el);

                  if (window.innerWidth < el.offsetWidth + 2 * parseFloat(style.paddingLeft) + 30) {
                      //30 here is a safe margin
                      el.style.width = window.innerWidth - 30; //Adding the safe margin
                      left(-parentOffset().left + 15); //positioning center of window, considering margin
                  } else if (parentOffset().left + el.offsetWidth / 2 <= window.innerWidth && parentOffset().left - el.offsetWidth / 2 >= 0) {
                          left(-el.offsetWidth / 2); //Positioning to the center
                      } else if (parentOffset().left + el.offsetWidth / 2 > window.innerWidth) {
                              left(-el.offsetWidth + el.offsetParent.offsetWidth); //Positioning to the left
                          } else if (parentOffset().left - el.offsetWidth / 2 < 0) {
                                  left(-el.offsetParent.offsetWidth); //Positioning to the right
                              }
                  top(-elTop); //Setting top position
              }
          };

          return {
              width: width,
              top: top,
              left: left,
              opacity: opacity,
              tooltip: tooltip,
              toggle: toggle,
              setPosition: setPosition,
              setParentPosition: setParentPosition
          };
      },
      view: function view(ctrl, args) {
          var width = ctrl.width();
          return m(args.el, {
              onclick: ctrl.toggle,
              config: ctrl.setParentPosition,
              style: { cursor: 'pointer' }
          }, ctrl.tooltip() ? [m('.tooltip.dark[style="width: ' + width + 'px; top: ' + ctrl.top() + 'px; left: ' + ctrl.left() + 'px;"]', {
              config: ctrl.setPosition
          }, [m('.fontsize-smallest', args.text)])] : '');
      }
  };

  var I18nScope$2 = _$1.partial(h.i18nScope, 'projects.dashboard_nav');

  var projectDashboardMenu = {
      controller: function controller(args) {
          var body = document.getElementsByTagName('body')[0],
              editLinksToggle = h.toggleProp(true, false),
              showPublish = h.toggleProp(true, false),
              bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed');

          if (args.project().is_published) {
              editLinksToggle.toggle(false);
          }

          if (args.hidePublish) {
              showPublish.toggle(false);
          }

          return {
              body: body,
              editLinksToggle: editLinksToggle,
              showPublish: showPublish,
              bodyToggleForNav: bodyToggleForNav
          };
      },
      view: function view(ctrl, args) {
          var project = args.project(),
              projectRoute = '/projects/' + project.id,
              editRoute = projectRoute + '/edit',
              editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');
          var optionalOpt = project.mode === 'flex' ? m('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

          ctrl.body.className = ctrl.bodyToggleForNav();

          return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (_$1.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), I18n$1.t('start_tab', I18nScope$2())]), project.is_published ? [m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), I18n$1.t('reports_tab', I18nScope$2())]), m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), I18n$1.t('posts_tab', I18nScope$2()), m('span.badge', project.posts_count)])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
              onclick: ctrl.editLinksToggle.toggle
          }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), I18n$1.t('edit_project', I18nScope$2())]), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Financiamento')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', 'Orçamento'), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.mode === 'flex' || project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published && ctrl.showPublish() ? [m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', I18n$1.t('send', I18nScope$2())) : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$2()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('a.btn.btn-medium[href="/flexible_projects/' + project.flex_id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$2()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' && project.is_published ? [m('.btn-send-draft-fixed', _$1.isNull(project.expires_at) ? m('a.w-button.btn.btn-medium.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', I18n$1.t('announce_expiration', I18nScope$2())) : '')] : '']])])]), m('a.btn-dashboard href="js:void(0);"', {
              onclick: ctrl.bodyToggleForNav.toggle
          }, [m('span.fa.fa-bars.fa-lg')])]);
      }
  };

  var modalBox = {
      view: function view(ctrl, args) {
          return m('.modal-backdrop', [m('.modal-dialog-outer', [m('.modal-dialog-inner.modal-dialog-small', [m('a.w-inline-block.modal-close.fa.fa-close.fa-lg[href="javascript:void(0);"]', {
              onclick: args.displayModal.toggle
          }), m.component(args.content[0], args.content[1])])])]);
      }
  };

  var adminProjectDetailsCard = {
      controller: function controller(args) {
          var project = args.resource,
              generateStatusText = function generateStatusText() {
              var statusTextObj = m.prop({}),
                  statusText = {
                  online: {
                      cssClass: 'text-success',
                      text: 'NO AR'
                  },
                  successful: {
                      cssClass: 'text-success',
                      text: 'FINANCIADO'
                  },
                  failed: {
                      cssClass: 'text-error',
                      text: 'NÃO FINANCIADO'
                  },
                  waiting_funds: {
                      cssClass: 'text-waiting',
                      text: 'AGUARDANDO'
                  },
                  rejected: {
                      cssClass: 'text-error',
                      text: 'RECUSADO'
                  },
                  draft: {
                      cssClass: '',
                      text: 'RASCUNHO'
                  },
                  in_analysis: {
                      cssClass: '',
                      text: 'EM ANÁLISE'
                  },
                  approved: {
                      cssClass: 'text-success',
                      text: 'APROVADO'
                  }
              };

              statusTextObj(statusText[project.state]);

              return statusTextObj;
          },
              isFinalLap = function isFinalLap() {
              // @TODO: use 8 days because timezone on js
              return !_.isNull(project.expires_at) && moment$1().add(8, 'days') >= moment$1(project.zone_expires_at);
          };
          return {
              project: project,
              statusTextObj: generateStatusText(),
              remainingTextObj: h.translatedTime(project.remaining_time),
              elapsedTextObj: h.translatedTime(project.elapsed_time),
              isFinalLap: isFinalLap
          };
      },
      view: function view(ctrl) {
          var project = ctrl.project,
              progress = project.progress.toFixed(2),
              statusTextObj = ctrl.statusTextObj(),
              remainingTextObj = ctrl.remainingTextObj,
              elapsedTextObj = ctrl.elapsedTextObj;

          return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m('div', [m('.fontsize-small.fontweight-semibold', [m('span.fontcolor-secondary', 'Status:'), ' ', m('span', {
              class: statusTextObj.cssClass
          }, ctrl.isFinalLap() && project.open_for_contributions ? 'RETA FINAL' : statusTextObj.text), ' ']), project.is_published ? [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', {
              style: {
                  width: (progress > 100 ? 100 : progress) + '%'
              }
          })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'financiado'), m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'levantados'), m('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)])]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios'), m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há'), m('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'restam'), m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])] : ''])]);
      }
  };

  var projectDataChart = {
      controller: function controller(args) {
          var resource = _$1.first(args.collection()),
              source = !_$1.isUndefined(resource) ? resource.source : [],
              mountDataset = function mountDataset() {
              return [{
                  fillColor: 'rgba(126,194,69,0.2)',
                  strokeColor: 'rgba(126,194,69,1)',
                  pointColor: 'rgba(126,194,69,1)',
                  pointStrokeColor: '#fff',
                  pointHighlightFill: '#fff',
                  pointHighlightStroke: 'rgba(220,220,220,1)',
                  data: _$1.map(source, function (item) {
                      return item[args.dataKey];
                  })
              }];
          },
              renderChart = function renderChart(element, isInitialized) {
              if (!isInitialized) {
                  var ctx = element.getContext('2d');

                  new Chart(ctx).Line({
                      labels: _$1.map(source, function (item) {
                          return args.xAxis(item);
                      }),
                      datasets: mountDataset()
                  });
              }
          };

          return {
              renderChart: renderChart
          };
      },
      view: function view(ctrl, args) {
          return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', {
              config: ctrl.renderChart
          })])])]);
      }
  };

  var projectDataTable = {
      controller: function controller(args) {
          var table = m.prop(args.table),
              sortIndex = m.prop(-1);

          var comparator = function comparator(a, b) {
              var idx = sortIndex(),

              //Check if a custom comparator is used => Read component description
              x = _$1.isArray(a[idx]) && a[idx].length > 1 ? a[idx][0] : a[idx],
                  y = _$1.isArray(b[idx]) && b[idx].length > 1 ? b[idx][0] : b[idx];

              if (x < y) {
                  return -1;
              }
              if (y < x) {
                  return 1;
              }
              return 0;
          };

          var sortTable = function sortTable(idx) {
              var header = _$1.first(table()),
                  body = void 0;
              if (sortIndex() === idx) {
                  body = _$1.rest(table()).reverse();
              } else {
                  sortIndex(idx);
                  body = _$1.rest(table()).sort(comparator);
              }

              table(_$1.union([header], body));
          };

          sortTable(Math.abs(args.defaultSortIndex) || 0);

          if (args.defaultSortIndex < 0) {
              sortTable(Math.abs(args.defaultSortIndex) || 0);
          }

          return {
              table: table,
              sortTable: sortTable
          };
      },
      view: function view(ctrl, args) {
          var header = _$1.first(ctrl.table()),
              body = _$1.rest(ctrl.table());
          return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _$1.map(header, function (heading, idx) {
              var sort = function sort() {
                  return ctrl.sortTable(idx);
              };
              return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('a.link-hidden[href="javascript:void(0);"]', {
                  onclick: sort
              }, [heading + ' ', m('span.fa.fa-sort')])]);
          })), m('.table-inner.fontsize-small', _$1.map(body, function (rowData) {
              return m('.w-row.table-row', _$1.map(rowData, function (row) {
                  //Check if a custom comparator is used => Read component description
                  row = _$1.isArray(row) && row.length > 1 ? row[1] : row;
                  return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', row)]);
              }));
          }))]);
      }
  };

  var projectReminderCount = {
      view: function view(ctrl, args) {
          var project = args.resource;
          return m('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), m('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), m('.fontsize-jumbo', project.reminder_count)]);
      }
  };

  var I18nScope$1 = _$1.partial(h.i18nScope, 'projects.insights');

  var insights = {
      controller: function controller(args) {
          var filtersVM = postgrest$1.filtersVM({
              project_id: 'eq'
          }),
              displayModal = h.toggleProp(false, true),
              projectDetails = m.prop([]),
              contributionsPerDay = m.prop([]),
              contributionsPerLocation = m.prop([]),
              loader = postgrest$1.loaderWithToken;

          if (h.paramByName('online_success') === 'true') {
              displayModal.toggle();
          }

          filtersVM.project_id(args.root.getAttribute('data-id'));

          var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
          l.load().then(projectDetails);

          var lContributionsPerDay = loader(models.projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
          lContributionsPerDay.load().then(contributionsPerDay);

          var contributionsPerLocationTable = [['Estado', 'Apoios', 'R$ apoiados (% do total)']];
          var buildPerLocationTable = function buildPerLocationTable(contributions) {
              return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                  var column = [];

                  column.push(contribution.state_acronym || 'Outro/other');
                  column.push(contribution.total_contributions);
                  column.push([contribution.total_contributed, [//Adding row with custom comparator => read project-data-table description
                  m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                  return contributionsPerLocationTable.push(column);
              }) : [];
          };

          var lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
          lContributionsPerLocation.load().then(buildPerLocationTable);

          var contributionsPerRefTable = [[I18n$1.t('ref_table.header.origin', I18nScope$1()), I18n$1.t('ref_table.header.contributions', I18nScope$1()), I18n$1.t('ref_table.header.amount', I18nScope$1())]];
          var buildPerRefTable = function buildPerRefTable(contributions) {
              return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                  //Test if the string matches a word starting with ctrse_ and followed by any non-digit group of characters
                  //This allows to remove any versioned referral (i.e.: ctrse_newsletter_123) while still getting ctrse_test_ref
                  var re = /(ctrse_[\D]*)/,
                      test = re.exec(contribution.referral_link);

                  var column = [];

                  if (test) {
                      //Removes last underscore if it exists
                      contribution.referral_link = test[0].substr(-1) === '_' ? test[0].substr(0, test[0].length - 1) : test[0];
                  }

                  column.push(contribution.referral_link ? I18n$1.t('referral.' + contribution.referral_link, I18nScope$1({ defaultValue: contribution.referral_link })) : I18n$1.t('referral.others', I18nScope$1()));
                  column.push(contribution.total);
                  column.push([contribution.total_amount, [m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_amount, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                  return contributionsPerRefTable.push(column);
              }) : [];
          };

          var lContributionsPerRef = loader(models.projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
          lContributionsPerRef.load().then(buildPerRefTable);

          return {
              l: l,
              lContributionsPerRef: lContributionsPerRef,
              lContributionsPerLocation: lContributionsPerLocation,
              lContributionsPerDay: lContributionsPerDay,
              displayModal: displayModal,
              filtersVM: filtersVM,
              projectDetails: projectDetails,
              contributionsPerDay: contributionsPerDay,
              contributionsPerLocationTable: contributionsPerLocationTable,
              contributionsPerRefTable: contributionsPerRefTable
          };
      },
      view: function view(ctrl) {
          var project = _$1.first(ctrl.projectDetails()) || {
              user: {
                  name: 'Realizador'
              }
          },
              successModalC = ['OnlineSucessModalContent'],
              buildTooltip = function buildTooltip(el) {
              return m.component(tooltip, {
                  el: el,
                  text: ['Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ', m('a[href="' + I18n$1.t('ref_table.help_url', I18nScope$1()) + '"][target=\'_blank\']', 'aqui.')],
                  width: 380
              });
          };

          project.user.name = project.user.name || 'Realizador';

          return m('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? m.component(projectDashboardMenu, {
              project: m.prop(project)
          }) : '', ctrl.displayModal() ? m.component(modalBox, {
              displayModal: ctrl.displayModal,
              content: successModalC
          }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n$1.t('campaign_title', I18nScope$1())), m.component(adminProjectDetailsCard, {
              resource: project
          }), m('p.' + project.state + '-project-text.fontsize-small.lineheight-loose', [project.mode === 'flex' && _$1.isNull(project.expires_at) && project.state !== 'draft' ? m('span', [I18n$1.t('finish_explanation', I18nScope$1()), m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', I18n$1.t('know_more', I18nScope$1()))]) : m.trust(I18n$1.t('campaign.' + project.mode + '.' + project.state, I18nScope$1({ username: project.user.name, expires_at: h.momentify(project.zone_expires_at), sent_to_analysis_at: h.momentify(project.sent_to_analysis_at) })))])]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
              style: {
                  'min-height': '300px'
              }
          }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
              collection: ctrl.contributionsPerDay,
              label: I18n$1.t('amount_per_day_label', I18nScope$1()),
              dataKey: 'total_amount',
              xAxis: function xAxis(item) {
                  return h.momentify(item.paid_at);
              }
          }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
              style: {
                  'min-height': '300px'
              }
          }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
              collection: ctrl.contributionsPerDay,
              label: I18n$1.t('contributions_per_day_label', I18nScope$1()),
              dataKey: 'total',
              xAxis: function xAxis(item) {
                  return h.momentify(item.paid_at);
              }
          }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n$1.t('ref_origin_title', I18nScope$1()), h.newFeatureBadge(), buildTooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? m.component(projectDataTable, {
              table: ctrl.contributionsPerRefTable,
              defaultSortIndex: -2
          }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n$1.t('location_origin_title', I18nScope$1())), !ctrl.lContributionsPerLocation() ? m.component(projectDataTable, {
              table: ctrl.contributionsPerLocationTable,
              defaultSortIndex: -2
          }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(projectReminderCount, {
              resource: project
          })])])])])] : ''] : h.loader());
      }
  };

  var I18nScope$3 = _.partial(h.i18nScope, 'pages.jobs');

  var jobs = {
      view: function view(ctrl, args) {
          return [m('.w-section.hero-jobs.hero-medium', [m('.w-containe.u-text-center', [m('img.icon-hero[src="/assets/logo-white.png"]'), m('.u-text-center.u-marginbottom-20.fontsize-largest', I18n$1.t('title', I18nScope$3()))])]), m('.w-section.section', [m('.w-container.u-margintop-40', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2.u-text-center', [m('.fontsize-large.u-marginbottom-30', I18n$1.t('info', I18nScope$3())), m('a[href="/projects/new"].w-button.btn.btn-large.btn-inline', I18n$1.t('cta', I18nScope$3()))])])])])];
      }
  };

  var liveStatistics = {
      controller: function controller() {
          var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

          var pageStatistics = m.prop([]),
              notificationData = m.prop({});

          models.statistic.getRow().then(pageStatistics);
          // args.socket is a socket provided by socket.io
          // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
          if (args.socket && _$1.isFunction(args.socket.on)) {
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

          return m('.w-section.bg-stats.section.min-height-100', [m('.w-container.u-text-center', _$1.map(ctrl.pageStatistics(), function (stat) {
              return [m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m('.fontcolor-negative.u-marginbottom-40', [m('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)), m('.fontsize-large', 'Doados para projetos publicados por aqui')]), m('.fontcolor-negative.u-marginbottom-60', [m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
          })), !_$1.isEmpty(data) ? m('.w-container', [m('div', [m('.card.u-radius.u-marginbottom-60.medium', [m('.w-row', [m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.user_name)])])]), m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m('div', 'acabou de apoiar o')]), m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
      }
  };

  var projectContributionReportHeader = {
      view: function view(ctrl, args) {
          var filterBuilder = args.filterBuilder,
              paymentStateFilter = _$1.findWhere(filterBuilder, { label: 'payment_state' }),
              rewardFilter = _$1.findWhere(filterBuilder, { label: 'reward_filter' }),
              mainFilter = _$1.findWhere(filterBuilder, { component: 'FilterMain' }),
              project_id = args.filterVM.project_id();

          rewardFilter.data.options = args.mapRewardsToOptions();

          return m('.w-section.dashboard-header', [m('.w-container', [m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]), m('.w-col.w-col-3')]), m('.w-form', [m('form', { onsubmit: args.submit }, [m('.w-row', [m('.w-col.w-col-5', [m('.w-row', [m.component(c[paymentStateFilter.component], paymentStateFilter.data), m.component(c[rewardFilter.component], rewardFilter.data)])]), m('.w-col.w-col-7.u-margintop-20', [m('.w-row', [m('.w-col.w-col-8._w-sub-col', [m.component(c[mainFilter.component], mainFilter.data)]), m('.w-col.w-col-4.w-clearfix.w-hidden-small.w-hidden-tiny', [m('a.alt-link.u-right.fontsize-small.lineheight-looser[target="__blank" href="/projects/' + project_id + '/edit#reports"]', [m('span.fa.fa-download', '.'), ' Baixar relatórios'])])])])])])])])]);
      }
  };

  var projectContributionReportContentCard = {
      controller: function controller(args) {
          var stateClass = function stateClass(state) {
              var classes = {
                  'paid': 'text-success',
                  'refunded': 'text-refunded',
                  'pending_refund': 'text-refunded',
                  'pending': 'text-waiting',
                  'refused': 'text-error'
              };

              return classes[state];
          };

          return {
              stateClass: stateClass
          };
      },
      view: function view(ctrl, args) {
          var contribution = args.contribution(),
              profile_img = _$1.isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail,
              reward = contribution.reward || { minimum_value: 0, description: 'Nenhuma recompensa selecionada' };
          return m('.w-clearfix.card.card-clickable', [m('.w-row', [m('.w-col.w-col-1.w-col-tiny-1', [m('img.user-avatar.u-marginbottom-10[src=\'' + profile_img + '\']')]), m('.w-col.w-col-11.w-col-tiny-11', [m('.w-row', [m('.w-col.w-col-3', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name), m('.fontsize-smallest.lineheight-looser', [contribution.has_another ? [m('a.link-hidden-light.badge.badge-light', '+1 apoio'), m.trust('&nbsp;')] : '', contribution.anonymous ? m('span.fa.fa-eye-slash.fontcolor-secondary') : ''])]), m(".w-col.w-col-3", [m(".lineheight-tighter", [m('span.fa.fa-circle.fontsize-smallest.' + ctrl.stateClass(contribution.state), "."), "   ", m("span.fontsize-large", 'R$ ' + h.formatNumber(contribution.value, 2, 3))])]), m(".w-col.w-col-3.w-hidden-small.w-hidden-tiny", [m(".fontsize-smallest.fontweight-semibold", 'Recompensa: R$ ' + h.formatNumber(reward.minimum_value, 2, 3)), m(".fontsize-smallest", reward.description.substring(0, 80) + '...')]) /*,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     m(".w-col.w-col-2.w-hidden-small.w-hidden-tiny.u-text-center", [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      m(".fontsize-smallest.fontcolor-secondary", "Enviei!"),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      m(".fontsize-smallest.u-marginbottom-20.lineheight-loose", [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          m("a.checkbox-big[href='#']", ".")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ])
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ]),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     m(".w-col.w-col-2", [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      m(".fontsize-smallest", [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          m("a.link-hidden[href='#']", "Questionário")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ," "
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ,m("span.fontweight-semibold.text-waiting", "enviado")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ]),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      m(".fontsize-smallest.fontcolor-terciary", "em 29/10/2015")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ])*/
          ])])])]);
      }
  };

  var projectContributionReportContent = {
      view: function view(ctrl, args) {
          var list = args.list;
          return m('.w-section.bg-gray.before-footer.section', [m('.w-container', [m(".w-row.u-marginbottom-20", [m(".w-col.w-col-9.w-col-small-6.w-col-tiny-6", [m(".fontsize-base", [m("span.fontweight-semibold", list.isLoading() ? '' : list.total()), " apoios"])])]),
          //m(".fontsize-large.fontweight-semibold", "R$ 12.000,00")

          /*
           TODO: ordering filter template
          m(".w-col.w-col-3.w-col-small-6.w-col-tiny-6", [
              m(".w-form", [
                  m("form[data-name='Email Form 5'][id='email-form-5'][name='email-form-5']", [
                      m(".fontsize-smallest.fontcolor-secondary", "Ordenar por:"),
                      m("select.w-select.text-field.positive.fontsize-smallest[id='field-9'][name='field-9']", [
                          m("option[value='']", "Data (recentes para antigos)"),
                          m("option[value='']", "Data (antigos para recentes)"),
                          m("option[value='']", "Valor (maior para menor)"),
                          m("option[value='First']", "Valor (menor para maior)")
                      ])
                  ])
              ])
          ])*/
          _$1.map(list.collection(), function (item) {
              var contribution = m.prop(item);
              return m.component(projectContributionReportContentCard, { contribution: contribution });
          })]), m('.w-section.section.bg-gray', [m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h.loader()])])])])]);
      }
  };

  var vm = postgrest.filtersVM({
      full_text_index: '@@',
      state: 'eq',
      reward_id: 'eq',
      project_id: 'eq'
  });
  var paramToString = function paramToString(p) {
      return (p || '').toString().trim();
  };
  vm.state('');
  vm.order({
      id: 'desc'
  });

  vm.full_text_index.toFilter = function () {
      var filter = paramToString(vm.full_text_index());
      return filter && replaceDiacritics(filter) || undefined;
  };

  var projectContributionReport = {
      controller: function controller(args) {
          var listVM = postgrest$1.paginationVM(models.projectContribution, 'id.desc', { 'Prefer': 'count=exact' }),
              filterVM = vm,
              project = m.prop({}),
              rewards = m.prop([]),
              filterBuilder = [{
              component: 'FilterMain',
              data: {
                  inputWrapperClass: '.w-input.text-field',
                  btnClass: '.btn.btn-medium',
                  vm: filterVM.full_text_index,
                  placeholder: 'Busque por nome ou email do apoiador'
              }
          }, {
              label: 'reward_filter',
              component: 'FilterDropdown',
              data: {
                  label: 'Recompensa',
                  name: 'reward_id',
                  vm: filterVM.reward_id,
                  wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                  options: []
              }
          }, {
              label: 'payment_state',
              component: 'FilterDropdown',
              data: {
                  label: 'Status do apoio',
                  name: 'state',
                  vm: filterVM.state,
                  wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                  options: [{
                      value: '',
                      option: 'Todos'
                  }, {
                      value: 'paid',
                      option: 'Pago'
                  }, {
                      value: 'refused',
                      option: 'Cancelado'
                  }, {
                      value: 'pending',
                      option: 'Pendente'
                  }, {
                      value: 'pending_refund',
                      option: 'Reembolso pendente'
                  }, {
                      value: 'refunded',
                      option: 'Reembolsado'
                  }, {
                      value: 'chargeback',
                      option: 'Contestado'
                  }]
              }
          }],
              submit = function submit() {
              listVM.firstPage(filterVM.parameters()).then(null);
              return false;
          };

          filterVM.project_id(args.root.getAttribute('data-id'));

          var lReward = postgrest$1.loaderWithToken(models.rewardDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));
          var lProject = postgrest$1.loaderWithToken(models.projectDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));

          lReward.load().then(rewards);
          lProject.load().then(project);

          var mapRewardsToOptions = function mapRewardsToOptions() {
              var options = [];
              if (!lReward()) {
                  options = _$1.map(rewards(), function (r) {
                      return {
                          value: r.id,
                          option: 'R$ ' + h.formatNumber(r.minimum_value, 2, 3) + ' - ' + r.description.substring(0, 20)
                      };
                  });
              }

              options.unshift({
                  value: '',
                  option: 'Todas'
              });

              return options;
          };

          if (!listVM.collection().length) {
              listVM.firstPage(filterVM.parameters());
          }

          return {
              listVM: listVM,
              filterVM: filterVM,
              filterBuilder: filterBuilder,
              submit: submit,
              lReward: lReward,
              rewards: rewards,
              project: project,
              mapRewardsToOptions: mapRewardsToOptions
          };
      },
      view: function view(ctrl, args) {
          var list = ctrl.listVM;

          return [m.component(projectDashboardMenu, { project: m.prop(_$1.first(ctrl.project())) }), m.component(projectContributionReportHeader, {
              submit: ctrl.submit,
              filterBuilder: ctrl.filterBuilder,
              form: ctrl.filterVM.formDescriber,
              mapRewardsToOptions: ctrl.mapRewardsToOptions,
              filterVM: ctrl.filterVM
          }), m('.divider.u-margintop-30'), m.component(projectContributionReportContent, {
              list: list
          })];
      }
  };

  var projectVM = function projectVM(project_id, project_user_id) {
      var vm = postgrest.filtersVM({
          project_id: 'eq'
      }),
          idVM = h.idVM,
          projectDetails = m.prop([]),
          userDetails = m.prop([]),
          rewardDetails = m.prop([]);

      vm.project_id(project_id);
      idVM.id(project_user_id);

      var lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
          lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
          lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters())),
          isLoading = function isLoading() {
          return lProject() || lUser() || lReward();
      };

      lProject.load().then(function (data) {
          lUser.load().then(userDetails);
          lReward.load().then(rewardDetails);

          projectDetails(data);
      });

      return {
          projectDetails: _$1.compose(_$1.first, projectDetails),
          userDetails: userDetails,
          rewardDetails: rewardDetails,
          isLoading: isLoading
      };
  };

  var projectsDashboard = {
      controller: function controller(args) {
          return projectVM(args.project_id, args.project_user_id);
      },
      view: function view(ctrl) {
          var project = ctrl.projectDetails;
          return project().is_owner_or_admin ? m.component(projectDashboardMenu, { project: project }) : '';
      }
  };

  var projectFiltersVM = function projectFiltersVM() {
      var filtersVM = postgrest$1.filtersVM,
          all = filtersVM({
          state: 'eq'
      }).state('online'),
          nearMe = filtersVM({
          near_me: 'eq',
          open_for_contributions: 'eq'
      }).open_for_contributions('true').near_me(true),
          expiring = filtersVM({
          expires_at: 'lte',
          open_for_contributions: 'eq'
      }).open_for_contributions('true').expires_at(moment$1().add(14, 'days').format('YYYY-MM-DD')),
          recent = filtersVM({
          online_date: 'gte',
          open_for_contributions: 'eq'
      }).open_for_contributions('true').online_date(moment$1().subtract(5, 'days').format('YYYY-MM-DD')),
          score = filtersVM({
          score: 'gte',
          open_for_contributions: 'eq'
      }).score('1').open_for_contributions('true'),
          online = filtersVM({
          open_for_contributions: 'eq'
      }).open_for_contributions('true'),
          successful = filtersVM({
          state: 'eq'
      }).state('successful'),
          finished = filtersVM({}),
          filters = {
          all: {
              title: 'Todas as Categorias',
              filter: all,
              nicename: 'No ar',
              isContextual: false,
              keyName: 'all'
          },
          score: {
              title: 'Todas as Categorias',
              filter: score,
              nicename: 'Populares',
              isContextual: false,
              keyName: 'score'
          },
          online: {
              title: 'No ar',
              filter: online,
              isContextual: false,
              keyName: 'online'
          },
          expiring: {
              title: 'Reta final',
              filter: expiring,
              isContextual: false,
              keyName: 'expiring'
          },
          successful: {
              title: 'Todas as Categorias',
              filter: successful,
              nicename: 'Financiados',
              isContextual: false,
              keyName: 'successful'
          },
          finished: {
              title: 'Todas as Categorias',
              filter: finished,
              nicename: 'Finalizados',
              isContextual: false,
              keyName: 'finished'
          },
          recent: {
              title: 'Recentes',
              filter: recent,
              isContextual: false,
              keyName: 'recent'
          },
          near_me: {
              title: 'Próximos a mim',
              filter: nearMe,
              isContextual: false,
              keyName: 'near_me'
          }
      };

      var setContextFilters = function setContextFilters(contextFilters) {
          _.map(contextFilters, function (filterKey) {
              return filters[filterKey].isContextual = true;
          });

          return filters;
      },
          getContextFilters = function getContextFilters() {
          return _.filter(filters, function (filter) {
              return filter.isContextual;
          });
      },
          removeContextFilter = function removeContextFilter(filter) {
          filters[filter.keyName].isContextual = false;

          return filters;
      };

      return {
          filters: filters,
          setContextFilters: setContextFilters,
          getContextFilters: getContextFilters,
          removeContextFilter: removeContextFilter
      };
  };

  var search = {
      view: function view(ctrl) {
          var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          var action = args.action || '/pt/explore',
              method = args.method || 'GET';

          return m('#search.w-container.w-hidden-main.w-hidden-medium', [m('.w-row', [m('.w-col.w-col-10.u-marginbottom-20', [m('.w-form', [m('form#email-form', { action: action, method: method }, [m('.w-row', [m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [m('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
      }
  };

  var categoryButton = {
      view: function view(ctrl, args) {
          var category = args.category;

          return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.w-inline-block.btn-category' + (category.name.length > 13 ? '.double-line' : '') + '[href=\'#by_category_id/' + category.id + '\']', [m('div', [category.name, m('span.badge.explore', category.online_projects)])])]);
      }
  };

  var projectsExplore = {
      controller: function controller() {
          var filters = postgrest$1.filtersVM,
              projectFilters = projectFilters(),
              filtersMap = projectFilters.filters,
              defaultFilter = h.paramByName('filter') || 'score',
              fallbackFilter = 'all',
              currentFilter = m.prop(filtersMap[defaultFilter]),
              changeFilter = function changeFilter(newFilter) {
              currentFilter(filtersMap[newFilter]);
              loadRoute();
          },
              resetContextFilter = function resetContextFilter() {
              currentFilter(filtersMap[defaultFilter]);
              projectFilters.setContextFilters(['score', 'finished', 'all']);
          },
              isSearch = m.prop(false),
              categoryCollection = m.prop([]),
              categoryId = m.prop(),
              findCategory = function findCategory(id) {
              return _$1.find(categoryCollection(), function (c) {
                  return id === parseInt(id);
              });
          },
              category = _$1.compose(findCategory, categoryId),
              loadCategories = function loadCategories() {
              return models.category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection);
          },

          // Fake projects object to be able to render page while loadding (in case of search)
          projects = m.prop({ collection: m.prop([]), isLoading: function isLoading() {
                  return true;
              }, isLastPage: function isLastPage() {
                  return true;
              } }),
              loadRoute = function loadRoute() {
              var route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                  cat = route && route[2] && findCategory(route[2]),
                  filterFromRoute = function filterFromRoute() {
                  var byCategory = filters({
                      category_id: 'eq'
                  });

                  return route && route[1] && filtersMap[route[1]] || cat && { title: cat.name, filter: byCategory.category_id(cat.id) };
              },
                  filter = filterFromRoute() || currentFilter(),
                  search = h.paramByName('pg_search'),
                  searchProjects = function searchProjects() {
                  var l = postgrest$1.loaderWithToken(models.projectSearch.postOptions({ query: search })),
                      page = { // We build an object with the same interface as paginationVM
                      collection: m.prop([]),
                      isLoading: l,
                      isLastPage: function isLastPage() {
                          return true;
                      },
                      nextPage: function nextPage() {
                          return false;
                      }
                  };
                  l.load().then(page.collection);
                  return page;
              },
                  loadProjects = function loadProjects() {
                  var pages = postgrest$1.paginationVM(models.project);
                  var parameters = _$1.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                      open_for_contributions: 'desc',
                      state_order: 'asc',
                      state: 'desc',
                      score: 'desc',
                      pledged: 'desc'
                  }).parameters());
                  pages.firstPage(parameters);
                  return pages;
              },
                  loadFinishedProjects = function loadFinishedProjects() {
                  var pages = postgrest$1.paginationVM(models.finishedProject),
                      parameters = _$1.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                      state_order: 'asc',
                      state: 'desc',
                      pledged: 'desc'
                  }).parameters());
                  pages.firstPage(parameters);

                  return pages;
              };

              if (_$1.isString(search) && search.length > 0 && route === null) {
                  isSearch(true);
                  title('Busca ' + search);
                  projects(searchProjects());
              } else if (currentFilter().keyName === 'finished') {
                  isSearch(false);
                  projects(loadFinishedProjects());
              } else {
                  isSearch(false);
                  title(filter.title);
                  if (!_$1.isNull(route) && route[1] == 'finished') {
                      projects(loadFinishedProjects());
                  } else {
                      projects(loadProjects());
                  }
              }
              categoryId(cat && cat.id);
              route || _$1.isString(search) && search.length > 0 ? toggleCategories(false) : toggleCategories(true);
          },
              title = m.prop(),
              toggleCategories = h.toggleProp(false, true);

          window.addEventListener('hashchange', function () {
              resetContextFilter();
              loadRoute();
              m.redraw();
          }, false);

          // Initial loads
          resetContextFilter();
          models.project.pageSize(9);
          loadCategories().then(loadRoute);

          if (!currentFilter()) {
              currentFilter(filtersMap[defaultFilter]);
          }

          return {
              categories: categoryCollection,
              changeFilter: changeFilter,
              fallbackFilter: fallbackFilter,
              projects: projects,
              category: category,
              title: title,
              filtersMap: filtersMap,
              currentFilter: currentFilter,
              projectFilters: projectFilters,
              toggleCategories: toggleCategories,
              isSearch: isSearch
          };
      },
      view: function view(ctrl, args) {
          if (!ctrl.projects().isLoading() && _$1.isEmpty(ctrl.projects().collection()) && !ctrl.isSearch()) {
              ctrl.projectFilters.removeContextFilter(ctrl.currentFilter());
              ctrl.changeFilter(ctrl.fallbackFilter);
          }

          return [m('.w-section.hero-search', [m.component(search), m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                  return ctrl.toggleCategories.toggle();
              } }, ['Explore projetos incríveis ', m('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m('.w-row.u-marginbottom-30', [_$1.map(ctrl.categories(), function (category) {
              return m.component(categoryButton, { category: category });
          })])])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [m('.fontsize-larger', ctrl.title())]), m('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? m('select.w-select.text-field.positive', { onchange: m.withAttr('value', ctrl.changeFilter) }, _$1.map(ctrl.projectFilters.getContextFilters(), function (pageFilter, idx) {
              var projects = ctrl.projects(),
                  isSelected = ctrl.currentFilter() == pageFilter;

              return m('option[value="' + pageFilter.keyName + '"]', { selected: isSelected }, pageFilter.nicename);
          })) : '')])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _$1.map(ctrl.projects().collection(), function (project, idx) {
              var cardType = 'small',
                  ref = 'ctrse_explore';

              if (ctrl.currentFilter().keyName === 'score' && !ctrl.isSearch()) {
                  if (idx === 0) {
                      cardType = 'big';
                      ref = 'ctrse_explore_featured_big';
                  } else if (idx === 1 || idx === 2) {
                      cardType = 'medium';
                      ref = 'ctrse_explore_featured_medium';
                  } else {
                      ref = 'ctrse_explore_featured';
                  }
              }

              return m.component(projectCard, { project: project, ref: ref, type: cardType });
          })), ctrl.projects().isLoading() ? h.loader() : _$1.isEmpty(ctrl.projects().collection()) ? m('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : ''])])]), m('.w-section.u-marginbottom-80', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _$1.isEmpty(ctrl.projects().collection()) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                  ctrl.projects().nextPage();return false;
              } }, 'Carregar mais')])])])]), m('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [m('.w-container.u-text-center', [m('img.u-marginbottom-20.icon-hero', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png' }), m('h2.fontsize-larger.u-marginbottom-60', 'Lance sua campanha no Catarse!'), m('.w-row', [m('.w-col.w-col-4.w-col-push-4', [m('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Aprenda como')])])])])];
      }
  };

  var homeVM = function homeVM() {
      var i18nStart = I18n$1.translations[I18n$1.currentLocale()].projects.home,
          banners = i18nStart.banners;

      return {
          banners: banners
      };
  };

  var slider = {
      controller: function controller(args) {
          var interval = void 0;
          var selectedSlideIdx = m.prop(0),
              translationSize = m.prop(1600),
              sliderTime = args.sliderTime || 6500,
              decrementSlide = function decrementSlide() {
              if (selectedSlideIdx() > 0) {
                  selectedSlideIdx(selectedSlideIdx() - 1);
              } else {
                  selectedSlideIdx(args.slides.length - 1);
              }
          },
              incrementSlide = function incrementSlide() {
              if (selectedSlideIdx() < args.slides.length - 1) {
                  selectedSlideIdx(selectedSlideIdx() + 1);
              } else {
                  selectedSlideIdx(0);
              }
          },
              startSliderTimer = function startSliderTimer() {
              interval = setInterval(function () {
                  incrementSlide();
                  m.redraw();
              }, sliderTime);
          },
              resetSliderTimer = function resetSliderTimer() {
              clearInterval(interval);
              startSliderTimer();
          },
              config = function config(el, isInitialized, context) {
              if (!isInitialized) {
                  translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                  m.redraw();
              };

              context.onunload = function () {
                  return clearInterval(interval);
              };
          };

          startSliderTimer();

          return {
              config: config,
              selectedSlideIdx: selectedSlideIdx,
              translationSize: translationSize,
              decrementSlide: decrementSlide,
              incrementSlide: incrementSlide,
              resetSliderTimer: resetSliderTimer
          };
      },
      view: function view(ctrl, args) {
          var slideClass = args.slideClass || '',
              wrapperClass = args.wrapperClass || '',
              effect = args.effect || 'slide',
              sliderClick = function sliderClick(fn, param) {
              fn(param);
              ctrl.resetSliderTimer();
          },
              effectStyle = function effectStyle(idx, translateStr) {
              var slideFx = 'transform: ' + translateStr + '; -webkit-transform: ' + translateStr + '; -ms-transform:' + translateStr,
                  fadeFx = idx === ctrl.selectedSlideIdx() ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden;';

              return effect === 'fade' ? fadeFx : slideFx;
          };

          return m('.w-slider.' + wrapperClass, {
              config: ctrl.config
          }, [m('.fontsize-larger', args.title), m('.w-slider-mask', [_$1.map(args.slides, function (slide, idx) {
              var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                  translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

              return m('.slide.w-slide.' + slideClass, {
                  style: effectStyle(idx, translateStr) + ' ' + slide.customStyle
              }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2', slide.content)])])]);
          }), m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
              onclick: function onclick() {
                  return sliderClick(ctrl.decrementSlide);
              }
          }, [m('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
              onclick: function onclick() {
                  return sliderClick(ctrl.incrementSlide);
              }
          }, [m('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _$1(args.slides.length).times(function (idx) {
              return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                  onclick: function onclick() {
                      return sliderClick(ctrl.selectedSlideIdx, idx);
                  }
              });
          }))])]);
      }
  };

  var contributionActivities = {
      controller: function controller(args) {
          var interval = void 0;
          var collection = m.prop([]),
              resource = m.prop(),
              collectionIndex = m.prop(0),
              collectionSize = m.prop(),
              collectionL = postgrest.loader(models.contributionActivity.getPageOptions()),
              nextResource = function nextResource() {
              if (collectionIndex() + 1 > collectionSize()) {
                  collectionIndex(0);
              }

              collectionIndex(collectionIndex() + 1);
              resource(collection()[collectionIndex()]);
              m.redraw();
          },
              startConfig = function startConfig(el, isinitialized, context) {
              context.onunload = function () {
                  return clearInterval(interval);
              };
          },
              startTimer = function startTimer() {
              interval = setInterval(nextResource, 15000);
          };

          collectionL.load().then(function (data) {
              collection(data);
              collectionSize(data.length);
              resource(_$1.first(data));
          });

          startTimer();

          return {
              collection: collection,
              collectionL: collectionL,
              resource: resource,
              collectionSize: collectionSize
          };
      },
      view: function view(ctrl, args) {
          if (!ctrl.collectionL() && !_$1.isUndefined(ctrl.resource()) && (ctrl.collectionSize() || 0) > 0) {
              var resource = ctrl.resource(),
                  elapsed = h.translatedTime(resource.elapsed_time),
                  project_link = 'https://catarse.me/' + resource.permalink + '?ref=ctrse_home_activities';

              return m('.w-section.section.bg-backs-carrosel', { config: ctrl.startConfig }, [m('.w-container.u-text-center.fontcolor-negative', [m('.fontsize-large.u-marginbottom-30', 'há ' + parseInt(elapsed.total) + ' ' + elapsed.unit + '...'), m('.w-clearfix.w-inline-block.u-marginbottom-10', [m('a', { href: project_link }, [m('img.thumb-author.u-round', { src: resource.thumbnail, width: 80 })]), m('img.thumb-author.u-round', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png' }), m('a', { href: project_link }, [m('img.thumb-author.u-round', { src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;' })])]), m('.fontsize-large', resource.name + ' apoiou'), m('.fontsize-larger', [m('a.link-hidden-white', { href: project_link }, resource.project_name)])])]);
          } else {
              return m('div');
          }
      }
  };

  var I18nScope$4 = _$1.partial(h.i18nScope, 'projects.home');

  var projectsHome = {
      controller: function controller() {
          var sample6 = _$1.partial(_$1.sample, _$1, 6),
              loader = postgrest.loader,
              project = models.project,
              filters = projectFiltersVM().filters,
              vm = homeVM();

          var collections = _$1.map(['score'], function (name) {
              var f = filters[name],
                  cLoader = loader(project.getPageOptions(f.filter.parameters())),
                  collection = m.prop([]);

              cLoader.load().then(_$1.compose(collection, sample6));

              return {
                  title: f.title,
                  hash: name,
                  collection: collection,
                  loader: cLoader
              };
          });

          return {
              collections: collections,
              slidesContent: vm.banners
          };
      },
      view: function view(ctrl) {
          var slides = function slides() {
              return _$1.map(ctrl.slidesContent, function (slide) {
                  var customStyle = 'background-image: url(' + slide.image + ');';
                  var content = m('.w-container.u-text-center', [m('.w-row.u-marginbottom-40', [m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title), m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))]), m('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)]);

                  return {
                      content: content,
                      customStyle: customStyle
                  };
              });
          };

          return [m.component(slider, {
              slides: slides(),
              effect: 'fade',
              slideClass: 'hero-slide start',
              wrapperClass: 'hero-full hero-full-slide',
              sliderTime: 10000
          }), _$1.map(ctrl.collections, function (collection) {
              return m.component(projectRow, {
                  collection: collection,
                  title: I18n$1.t('row_title', I18nScope$4()),
                  ref: 'home_' + collection.hash
              });
          }), m.component(contributionActivities)];
      }
  };

  var projectShareBox = {
      controller: function controller() {
          return {
              displayEmbed: h.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          return m('.pop-share', {
              style: 'display: block;'
          }, [m('.w-hidden-main.w-hidden-medium.w-clearfix', [m('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
              onclick: args.displayShareBox.toggle
          }, 'Fechar'), m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project().name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dtwitter&via=catarse"]')]), m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
              onclick: ctrl.displayEmbed.toggle
          }, '< embed >'), ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m('.w-form', [m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project().id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m('.card-embed', [m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().id + '/embed"][width="300px"][scrolling="no"]')])]) : '', m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project().permalink + '?ref=facebook&title=' + args.project().name + '"][target="_blank"]', [m('span.fa.fa-facebook'), ' Compartilhe']), m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project().name + ' htts://www.catarse.me/' + args.project().permalink + '?ref=twitterr"][target="_blank"]', [m('span.fa.fa-twitter'), ' Tweet'])]);
      }
  };

  var projectHighlight = {
      controller: function controller() {
          return {
              displayShareBox: h.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var project = args.project,
              address = project().address || { state_acronym: '', city: '' };

          return m('#project-highlight', [project().video_embed_url ? m('.w-embed.w-video.project-video', {
              style: 'min-height: 240px;'
          }, [m('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m('.project-image', {
              style: 'background-image:url(' + project().original_image + ');'
          }), m('.project-blurb', project().headline), m('.u-text-center-small-only.u-marginbottom-30', [!_$1.isNull(address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project().category_id + '"]', [m('span.fa.fa-tag'), ' ', project().category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
              onclick: ctrl.displayShareBox.toggle
          }, 'Compartilhar'), ctrl.displayShareBox() ? m.component(projectShareBox, {
              project: project,
              displayShareBox: ctrl.displayShareBox
          }) : ''])]);
      }
  };

  var projectMode = {
      view: function view(ctrl, args) {
          var project = args.project(),
              mode = project.mode,
              modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
              modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
              goal = _$1.isNull(project.goal) ? 'não definida' : h.formatNumber(project.goal),
              buildTooltip = function buildTooltip(el) {
              return m.component(tooltip, {
                  el: el,
                  text: mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.',
                  width: 280
              });
          };

          return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_$1.isEmpty(project) ? m('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-base.fontweight-semibold', 'Meta R$ ' + h.selfOrEmpty(goal, '--')), m('.w-inline-block.fontsize-smallest._w-inline-block', [!_$1.isEmpty(project) ? modeTitle : '', buildTooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
      }
  };

  var popNotification = {
      controller: function controller() {
          return {
              displayNotification: h.toggleProp(true, false)
          };
      },
      view: function view(ctrl, args) {
          return ctrl.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', [m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
              onclick: ctrl.displayNotification.toggle
          }), m('.fontsize-small', args.message)]) : m('span');
      }
  };

  var projectReminder = {
      controller: function controller(args) {
          var l = m.prop(false);
          var project = args.project,
              filterVM = postgrest.filtersVM({
              project_id: 'eq'
          }),
              storeReminderName = 'remind_' + project().id,
              popNotification = m.prop(false),
              submitReminder = function submitReminder() {
              if (!h.getUser()) {
                  h.storeAction(storeReminderName, submitReminder);
                  return h.navigateToDevise();
              }
              var loaderOpts = project().in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                  project_id: project().id
              });
              l = postgrest.loaderWithToken(loaderOpts);

              l.load().then(function () {
                  project().in_reminder = !project().in_reminder;

                  if (project().in_reminder) {
                      popNotification(true);
                      setTimeout(function () {
                          popNotification(false);
                          m.redraw();
                      }, 5000);
                  } else {
                      popNotification(false);
                  }
              });
          };

          h.callStoredAction(storeReminderName, submitReminder);
          filterVM.project_id(project().id);

          return {
              l: l,
              submitReminder: submitReminder,
              popNotification: popNotification
          };
      },
      view: function view(ctrl, args) {
          var mainClass = args.type === 'button' ? '' : '.u-text-center.u-marginbottom-30',
              buttonClass = args.type === 'button' ? 'w-button btn btn-terciary btn-no-border' : 'btn-link link-hidden fontsize-small',
              hideTextOnMobile = args.hideTextOnMobile || false,
              project = args.project;

          return m('#project-reminder' + mainClass, [m('button[class="' + buttonClass + ' ' + (project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
              onclick: ctrl.submitReminder
          }, [ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', [m('span' + (hideTextOnMobile ? '.w-hidden-medium' : ''), project().in_reminder ? ' Lembrete ativo' : ' Lembrar-me')])]), ctrl.popNotification() ? m.component(popNotification, {
              message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
          }) : '']);
      }
  };

  var ownerMessageContent = {
      controller: function controller(args) {
          var l = m.prop(false),
              sendSuccess = m.prop(false),
              sendMessage = function sendMessage() {
              var loaderOpts = models.directMessage.postOptions({
                  from_name: document.getElementById('from_name').value,
                  from_email: document.getElementById('from_email').value,
                  user_id: h.getUser()['user_id'],
                  content: document.getElementById('message_content').value,
                  project_id: h.getCurrentProject()['project_id'],
                  to_user_id: h.getCurrentProject()['project_user_id']
              });
              l = postgrest.loaderWithToken(loaderOpts);

              l.load().then(sendSuccess(true));
              return false;
          };

          return {
              sendMessage: sendMessage,
              sendSuccess: sendSuccess,
              userDetails: args
          };
      },
      view: function view(ctrl, args) {
          var user = h.getUser(),
              successMessage = m('.modal-dialog-content.u-text-center', [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m('p.fontsize-large', 'Sua mensagem foi enviada com sucesso para ' + _$1.first(ctrl.userDetails()).name + '. Você vai receber uma cópia no seu email e pode seguir a conversa por lá!')]),
              contactForm = [m('.modal-dialog-content', [m('.w-form', [m('form', { onsubmit: ctrl.sendMessage }, [m('.w-row', [m('.w-col.w-col-6.w-sub-col', [m('label.fontsize-smaller', 'Seu nome'), m('input.w-input.text-field[value=\'' + (user ? user['name'] : '') + '\'][id=\'from_name\'][type=\'text\'][required]')]), m('.w-col.w-col-6', [m('label.fontsize-smaller', 'Seu email'), m('input.w-input.text-field[value=\'' + (user ? user['email'] : '') + '\'][id=\'from_email\'][type=\'text\'][required]')])]), m('label', 'Mensagem'), m('textarea.w-input.text-field.height-small[id=\'message_content\'][required]'), m('.fontsize-smallest.fontcolor-terciary', 'Você receberá uma cópia desta mensagem em seu email.'), m('.modal-dialog-nav-bottom', m('.w-row', m('.w-col.w-col-6.w-col-push-3', m('input.w-button.btn.btn-large[type="submit"][value="Enviar mensagem"]'))))])])])];

          return m('div', [m('.modal-dialog-header', m('.fontsize-large.u-text-center', 'Enviar mensagem')), ctrl.sendSuccess() ? successMessage : contactForm]);
      }
  };

  var projectUserCard = {
      controller: function controller(args) {
          return { displayModal: h.toggleProp(false, true) };
      },
      view: function view(ctrl, args) {
          var contactModalC = [ownerMessageContent, args.userDetails];

          return m('#user-card', _$1.map(args.userDetails(), function (userDetail) {
              return m('.u-marginbottom-30.u-text-center-small-only', [ctrl.displayModal() ? m.component(modalBox, {
                  displayModal: ctrl.displayModal,
                  content: contactModalC
              }) : '', m('.w-row', [m('.w-col.w-col-4', [m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m('.w-col.w-col-8', [m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m('.fontsize-smallest', [h.pluralize(userDetail.total_published_projects, ' criado', ' criados'), m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_$1.isEmpty(userDetail.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_$1.isEmpty(userDetail.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _$1.map(userDetail.links, function (link) {
                  var parsedLink = h.parseUrl(link);

                  return !_$1.isEmpty(parsedLink.hostname) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)]) : '';
              })]), !_$1.isEmpty(userDetail.email) ? [m('a.w-button.btn.btn-terciary.btn-small.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.displayModal.toggle }, 'Enviar mensagem')] : ''])])]);
          }));
      }
  };

  var I18nScope$5 = _$1.partial(h.i18nScope, 'projects.project_sidebar');

  var projectSidebar = {
      controller: function controller(args) {
          var project = args.project,
              animateProgress = function animateProgress(el, isInitialized) {
              if (!isInitialized) {
                  (function () {
                      var animation = void 0,
                          progress = 0,
                          pledged = 0,
                          contributors = 0,
                          pledgedIncrement = project().pledged / project().progress,
                          contributorsIncrement = project().total_contributors / project().progress;

                      var progressBar = document.getElementById('progressBar'),
                          pledgedEl = document.getElementById('pledged'),
                          contributorsEl = document.getElementById('contributors'),
                          animate = function animate() {
                          animation = setInterval(incrementProgress, 28);
                      },
                          incrementProgress = function incrementProgress() {
                          if (progress <= parseInt(project().progress)) {
                              progressBar.style.width = progress + '%';
                              pledgedEl.innerText = 'R$ ' + h.formatNumber(pledged);
                              contributorsEl.innerText = parseInt(contributors) + ' pessoas';
                              el.innerText = progress + '%';
                              pledged = pledged + pledgedIncrement;
                              contributors = contributors + contributorsIncrement;
                              progress = progress + 1;
                          } else {
                              clearInterval(animation);
                          }
                      };

                      setTimeout(function () {
                          animate();
                      }, 1800);
                  })();
              }
          };

          return {
              animateProgress: animateProgress
          };
      },
      view: function view(ctrl, args) {
          var project = args.project,
              elapsed = project().elapsed_time,
              remaining = project().remaining_time,
              displayCardClass = function displayCardClass() {
              var states = {
                  'waiting_funds': 'card-waiting',
                  'successful': 'card-success',
                  'failed': 'card-error',
                  'draft': 'card-dark',
                  'in_analysis': 'card-dark',
                  'approved': 'card-dark'
              };

              return states[project().state] ? 'card u-radius zindex-10 ' + states[project().state] : '';
          },
              displayStatusText = function displayStatusText() {
              var states = {
                  'approved': I18n$1.t('display_status.approved', I18nScope$5()),
                  'online': h.existy(project().zone_expires_at) ? I18n$1.t('display_status.online', I18nScope$5({ date: h.momentify(project().zone_expires_at) })) : '',
                  'failed': I18n$1.t('display_status.failed', I18nScope$5({ date: h.momentify(project().zone_expires_at), goal: project().goal })),
                  'rejected': I18n$1.t('display_status.rejected', I18nScope$5()),
                  'in_analysis': I18n$1.t('display_status.in_analysis', I18nScope$5()),
                  'successful': I18n$1.t('display_status.successful', I18nScope$5({ date: h.momentify(project().zone_expires_at) })),
                  'waiting_funds': I18n$1.t('display_status.waiting_funds', I18nScope$5()),
                  'draft': I18n$1.t('display_status.draft', I18nScope$5())
              };

              return states[project().state];
          };

          return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? h.formatNumber(project().pledged) : '0')), m('.fontsize-small.u-text-center-small-only', [I18n$1.t('contributors_call', I18nScope$5()), m('span#contributors.fontweight-semibold', I18n$1.t('contributors_count', I18nScope$5({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + I18n$1.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope$5()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
              style: {
                  width: project().progress + '%'
              }
          })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n$1.t('remaining_time.' + remaining.unit, I18nScope$5({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(projectMode, {
              project: project
          })])]), project().open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project().id + '/contributions/new"]', I18n$1.t('submit', I18nScope$5())) : '', project().open_for_contributions ? m.component(projectReminder, {
              project: project,
              type: 'link'
          }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), m('.user-c', m.component(projectUserCard, {
              userDetails: args.userDetails
          }))]);
      }
  };

  var projectHeader = {
      view: function view(ctrl, args) {
          var project = args.project;

          if (_$1.isUndefined(project())) {
              project = m.prop({});
          }

          return m('#project-header', [m('.w-section.section-product.' + project().mode), m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name)), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', project().user ? ['por ', project().user.name] : '')])]), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(projectHighlight, {
              project: project
          })), m('.w-col.w-col-4', m.component(projectSidebar, {
              project: project,
              userDetails: args.userDetails
          }))])])])]);
      }
  };

  var projectTabs = {
      controller: function controller(args) {
          var isFixed = m.prop(false),
              originalPosition = m.prop(-1);

          var fixOnScroll = function fixOnScroll(el) {
              return function () {
                  var viewportOffset = el.getBoundingClientRect();

                  if (window.scrollY <= originalPosition()) {
                      originalPosition(-1);
                      isFixed(false);
                      m.redraw();
                  }

                  if (viewportOffset.top < 0 || window.scrollY > originalPosition() && originalPosition() > 0) {
                      if (!isFixed()) {
                          originalPosition(window.scrollY);
                          isFixed(true);
                          m.redraw();
                      }
                  }
              };
          };

          var navDisplay = function navDisplay(el, isInitialized) {
              if (!isInitialized) {
                  var fixNavBar = fixOnScroll(el);
                  window.addEventListener('scroll', fixNavBar);
              }
          };

          return {
              navDisplay: navDisplay,
              isFixed: isFixed
          };
      },
      view: function view(ctrl, args) {
          var project = args.project,
              rewards = args.rewardDetails;

          var mainClass = !ctrl.isFixed() || project().is_owner_or_admin ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

          return m('nav-wrapper', project() ? [m(mainClass, {
              config: ctrl.navDisplay
          }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
              style: 'float: left;'
          }, 'Recompensas') : m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
              style: 'float: left;'
          }, 'Valores Sugeridos'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
              style: 'float: left;'
          }, 'Sobre'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
              style: 'float: left;'
          }, ['Novidades ', m('span.badge', project() ? project().posts_count : '')]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
              style: 'float: left;'
          }, ['Apoios ', m('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributions : '-')]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
              style: 'float: left;'
          }, ['Comentários ', project() ? m('fb:comments-count[href="http://www.catarse.me/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;')) : '-'])]), project() ? m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project().id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6.w-col-medium-4', [m.component(projectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? m('.w-section.project-nav') : ''] : '');
      }
  };

  var projectRewardList = {
      view: function view(ctrl, args) {
          //FIXME: MISSING ADJUSTS
          // - add draft admin modifications
          var project = args.project;
          return m('#rewards.u-marginbottom-30', _$1.map(args.rewardDetails(), function (reward) {
              var contributionUrlWithReward = '/projects/' + project().id + '/contributions/new?reward_id=' + reward.id;

              return m('a[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project().open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project().open_for_contributions && !h.rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [m('.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'), m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h.rewardSouldOut(reward) ? m('.u-margintop-10', [m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m('.u-margintop-10', [m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', 'Limitada'), ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(reward.description))), !_$1.isEmpty(reward.deliver_at) ? m('.fontsize-smaller', [m('b', 'Estimativa de Entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project().open_for_contributions && !h.rewardSouldOut(reward) ? m('.project-reward-box-hover', [m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
          }));
      }
  };

  var projectSuggestedContributions = {
      view: function view(ctrl, args) {
          var project = args.project();
          var suggestionUrl = function suggestionUrl(amount) {
              return '/projects/' + project.project_id + '/contributions/new?amount=' + amount;
          },
              suggestedValues = [10, 25, 50, 100];

          return m('#suggestions', _$1.map(suggestedValues, function (amount) {
              return m('a[href="' + suggestionUrl(amount) + '"].card-reward.card-big.card-secondary.u-marginbottom-20', [m('.fontsize-larger', 'R$ ' + amount)]);
          }));
      }
  };

  var projectContributions = {
      controller: function controller(args) {
          var listVM = postgrest.paginationVM(models.projectContribution),
              filterVM = postgrest.filtersVM({
              project_id: 'eq',
              waiting_payment: 'eq'
          }),
              toggleWaiting = function toggleWaiting() {
              var waiting = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

              return function () {
                  filterVM.waiting_payment(waiting);
                  listVM.firstPage(filterVM.parameters());
              };
          };

          filterVM.project_id(args.project().id).waiting_payment(false);

          if (!listVM.collection().length) {
              listVM.firstPage(filterVM.parameters());
          }

          return {
              listVM: listVM,
              filterVM: filterVM,
              toggleWaiting: toggleWaiting
          };
      },
      view: function view(ctrl, args) {
          var list = ctrl.listVM;
          return m('#project_contributions.content.w-col.w-col-12', [args.project().is_owner_or_admin ? m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
              onclick: ctrl.toggleWaiting()
          })]), m('.w-col.w-col-5', [m('label[for="contribution_state_available_to_count"]', 'Confirmados')]), m('.w-col.w-col-1', [m('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
              onclick: ctrl.toggleWaiting(true)
          })]), m('.w-col.w-col-5', [m('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')])]) : '', m('.project-contributions', _$1.map(list.collection(), function (contribution) {
              return m('.w-clearfix', [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('a[href="/users/' + contribution.user_id + '"]', [m('.thumb.u-left.u-round[style="background-image: url(' + (!_$1.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')])]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', [m('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), contribution.is_owner_or_admin ? m('.fontsize-smaller', ['R$ ' + h.formatNumber(contribution.value, 2, 3), contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '']) : '', m('.fontsize-smaller', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'), m('.fontsize-smaller', contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora')])])]), m('.divider.u-marginbottom-20')]);
          })), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h.loader()])])]);
      }
  };

  var projectAbout = {
      view: function view(ctrl, args) {
          var project = args.project() || {},
              onlineDays = function onlineDays() {
              var diff = moment(project.zone_online_date).diff(moment(project.zone_expires_at)),
                  duration = moment.duration(diff);

              return -Math.ceil(duration.asDays());
          };
          var fundingPeriod = function fundingPeriod() {
              return project.is_published && h.existy(project.zone_expires_at) ? m('.funding-period', [m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'), m('.fontsize-small.u-text-center-small-only', h.momentify(project.zone_online_date) + ' - ' + h.momentify(project.zone_expires_at) + ' (' + onlineDays() + ' dias)')]) : '';
          };

          return m('#project-about', [m('.project-about.w-col.w-col-8', {
              config: h.UIHelper()
          }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(h.selfOrEmpty(project.about_html, '...'))), project.budget ? [m('p.fontsize-base.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))] : '']), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(projectRewardList, {
              project: args.project,
              rewardDetails: args.rewardDetails
          }), fundingPeriod()] : [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), m.component(projectSuggestedContributions, { project: args.project }), fundingPeriod()])]);
      }
  };

  var projectComments = {
      controller: function controller() {
          var loadComments = function loadComments(el, isInitialized) {
              return function (el, isInitialized) {
                  if (isInitialized) {
                      return;
                  }
                  h.fbParse();
              };
          };

          return { loadComments: loadComments };
      },
      view: function view(ctrl, args) {
          var project = args.project();
          return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() });
      }
  };

  var projectPosts = {
      ctrl: function ctrl(args) {
          var listVM = postgrest$1.paginationVM(models.projectPostDetail),
              filterVM = postgrest$1.filtersVM({
              project_id: 'eq'
          });

          filterVM.project_id(args.project().id);

          if (!listVM.collection().length) {
              listVM.firstPage(filterVM.parameters());
          }

          return {
              listVM: listVM,
              filterVM: filterVM
          };
      },
      view: function view(ctrl, args) {
          var list = ctrl.listVM,
              project = args.project() || {};

          return m('.project-posts.w-section', [m('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _$1.isEmpty(list.collection()) ? m('.w-hidden-small.w-hidden-tiny', [m('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '' : '', m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.id + '/edit#posts\']', 'Escrever novidade')]), m('.w-col.w-col-4')])] : '', _$1.map(list.collection(), function (post) {
              return m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [m('.post', [m('.u-marginbottom-60 .w-clearfix', [m('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)), m('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title), !_$1.isEmpty(post.comment_html) ? m('.fontsize-base', m.trust(post.comment_html)) : m('.fontsize-base', 'Post exclusivo para apoiadores.')]), m('.divider.u-marginbottom-60')])]), m('.w-col.w-col-1')]);
          }), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? 'Nenhuma novidade.' : m('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h.loader()])])])]);
      }
  };

  var projectMain = {
      controller: function controller(args) {
          var project = args.project,
              displayTabContent = function displayTabContent() {
              var hash = window.location.hash,
                  c_opts = {
                  project: project
              },
                  tabs = {
                  '#rewards': m('.w-col.w-col-12', m.component(projectRewardList, _$1.extend({}, {
                      rewardDetails: args.rewardDetails
                  }, c_opts))),
                  '#contribution_suggestions': m.component(projectSuggestedContributions, c_opts),
                  '#contributions': m.component(projectContributions, c_opts),
                  '#about': m.component(projectAbout, _$1.extend({}, {
                      rewardDetails: args.rewardDetails
                  }, c_opts)),
                  '#comments': m.component(projectComments, c_opts),
                  '#posts': m.component(projectPosts, c_opts)
              };

              if (_$1.isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                  return tabs['#about'];
              }

              return tabs[hash];
          };

          h.redrawHashChange();

          return {
              displayTabContent: displayTabContent
          };
      },
      view: function view(ctrl, args) {
          return m('section.section[itemtype="http://schema.org/CreativeWork"]', [m('.w-container', [m('.w-row', args.project() ? ctrl.displayTabContent() : '')])]);
      }
  };

  var projectsShow = {
      controller: function controller(args) {
          return projectVM(args.project_id, args.project_user_id);
      },
      view: function view(ctrl) {
          var project = ctrl.projectDetails;

          return m('.project-show', [m.component(projectHeader, {
              project: project,
              userDetails: ctrl.userDetails
          }), m.component(projectTabs, {
              project: project,
              rewardDetails: ctrl.rewardDetails
          }), m.component(projectMain, {
              project: project,
              rewardDetails: ctrl.rewardDetails
          }), project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
              project: project
          }) : '']);
      }
  };

  var I18nScope$6 = _$1.partial(h.i18nScope, 'projects.publish');

  var publish = {
    controller: function controller(args) {
      var filtersVM = postgrest.filtersVM({
        project_id: 'eq'
      }),
          projectAccount = m.prop([]),
          projectDetails = m.prop([]),
          acceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
          flexAcceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
          showNextTerm = function showNextTerm(index, acceptTerms) {
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
        if (index === terms.length - 1) {
          document.getElementsByClassName('publish-btn-section')[0].classList.remove('w-hidden');
        }
      },
          loader = postgrest.loaderWithToken;

      filtersVM.project_id(args.root.getAttribute('data-id'));

      var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
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
    view: function view(ctrl, args) {
      var project = _$1.first(ctrl.projectDetails()),
          account = _$1.first(ctrl.projectAccount()),
          flexTerms = function flexTerms(project) {
        return [m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m('span.fontweight-semibold', 'Regras da modalidade FLEX')]), m('div', 'Você escolheu a campanha flexível. Dessa maneira, você irá receber os recursos arrecadados  junto aos apoiadores ao final do prazo da campanha (descontando a taxa do Catarse) e deverá cumprir com a execução do projeto e com a entrega das recompensas oferecidas independente do quanto arrecadar.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m('span.fontweight-semibold', 'Meta de arrecadação')]), m('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m('span.fontweight-semibold', 'Taxas')]), m('div', ['Ao final da campanha, cobraremos 13% sobre o ', m('span.fontweight-semibold', 'valor total arrecadado.')])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m('span.fontweight-semibold', 'Prazo da campanha')]), m('div', 'Sua campanha poderá ficar até 12 meses arrecadando dentro do Catarse. Durante esse período você deverá definir um prazo de encerramento da campanha para poder receber os recursos arrecadados. Uma vez definido, o prazo de encerramento não poderá ser alterado.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m('span.fontweight-semibold', 'Prazo para repasse')]), m('div', 'Após encerrar a sua campanha e confirmar seus dados bancários, o Catarse realizará o repasse diretamente na sua conta corrente em até 10 dias úteis. O valor depositado já estará considerando o desconto de 13% da taxa.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m('span.fontweight-semibold', 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m('div', [m('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\
                    ', m('br'), m('br'), m('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m('span.fontweight-semibold', 'Responsabilidade do Catarse')]), [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m('span.fontweight-semibold', 'Suas responsabilidades')]), m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m('div', [m('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
      },
          terms = function terms(project) {
        return [m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m('span.fontweight-semibold', 'Regras da modalidade Tudo-ou-nada')]), m('div', ['Você escolheu a campanha tudo-ou-nada. Dessa maneira, você só irá receber os recursos arrecadados ', m('span.fontweight-semibold', 'caso atinja ou supere a meta de arrecadação'), '. Caso contrário, todos seus apoiadores serão reembolsados. Você será responsável pela entrega das recompensas oferecidas se seu projeto alcançar a meta de arrecadação.'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Meta de arrecadação')]), m('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Taxas')]), m('div', ['Cobramos 13% sobre o ', m('span.fontweight-semibold', 'valor total arrecadado'), ' pelo seu projeto caso ele atinja ou supere a meta dentro do prazo da campanha. Se o projeto não atingir a meta, nenhuma taxa será cobrada.', m('span.fontweight-semibold')])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Prazo da campanha')]), m('div', 'Seu projeto estará em arrecadação no Catarse até o dia ' + h.momentify(project.zone_expires_at) + ' às 23h59min59s. Este prazo não poderá ser alterado após a publicação do projeto.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Regras do repasse e reembolso')]), m('div', ['Após encerrar o seu projeto e confirmar seus dados bancários, o Catarse depositará o valor arrecadado, já com o desconto da taxa, na sua conta corrente em até 10 dias úteis. Caso o projeto não atinja 100% da meta dentro do prazo, o Catarse irá reembolsar os apoiadores. ', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Saiba mais sobre o processo de reembolso'), '.'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m('div', [m('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Responsabilidade do Catarse')]), [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Suas responsabilidades')]), m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m('div', [m('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
      };

      return [!ctrl.l() && !ctrl.accountL() ? [project.is_owner_or_admin ? m.component(projectDashboardMenu, {
        project: m.prop(project),
        hidePublish: true
      }) : '', m('.w-section.section-product.' + project.mode), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'), m('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')])]), m('.w-col.w-col-3')])])]), m('.divider'), m('.w-section.section-one-column.bg-gray.section.before-footer', [m('.w-container', [m('.card.medium.u-marginbottom-60.card-terciary', [m('.w-row', [m('.w-col.w-col-6.w-clearfix', [m('img.card-project-thumb.u-right[src=' + project.large_image + ']')]), m('.w-col.w-col-6', [m('.u-marginbottom-30.fontsize-base', [m('div', [m('span.fontweight-semibold', 'Título: '), project.name]), m('div', [m('span.fontweight-semibold', 'Link: '), 'www.catarse.me/' + project.permalink]), m('div', [m('span.fontweight-semibold', 'Modalidade de financiamento: '), I18n$1.t(project.mode, I18nScope$6())]), m('div', [m('span.fontweight-semibold', 'Meta de arrecadação: '), 'R$ ' + h.formatNumber(project.goal, 2, 3)]), project.mode !== 'flex' ? m('div', [m('span.fontweight-semibold', 'Prazo: ' + project.online_days + ' dias')]) : '', m('div', [m('span.fontweight-semibold', 'Responsável: '), account.owner_name]), m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])])])]), m('.u-text-center', [m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [m('.divider.u-marginbottom-10'), m('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')]), m('.w-col.w-col-1')])])]), m('.card.medium.u-radius.u-marginbottom-60', [m('.u-text-center.u-marginbottom-60', [m('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ', m('a.alt-link[href=\'https://equipecatarse.zendesk.com/account/dropboxes/20298537\'][target=\'_blank\']', 'entre em contato'), '!'])]), m('.w-col.w-col-2')])]), _$1.map(project.mode == 'flex' ? flexTerms(project) : terms(project), function (term, index) {
        return m('.u-marginbottom-30.fontsize-base' + (index == 0 ? '' : '.w-hidden.publish-rules'), [m('.w-row[id=\'rule-' + index + '\']', [m('.w-col.w-col-1.u-text-center', [m('div', [m((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? 'a.w-inline-block.checkbox-big[href=\'#rule-' + (index + 1) + '\']' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href=\'#rule-' + (index + 1) + '\']', { onclick: function onclick() {
            return ctrl.showNextTerm(index, project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm);
          } })])]), term])]);
      })]), m('.w-row.publish-btn-section.w-hidden', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.btn.btn-large.u-marginbottom-20[href=/' + (project.mode == 'flex' ? 'flexible_projects' : 'projects') + '/' + (project.mode == 'flex' ? project.flex_id : project.id) + '/push_to_online]', 'Publicar agora!'), m('.u-text-center.fontsize-smaller', ['Ao publicar o seu projeto, você está aceitando os ', m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), ', ', project.mode == 'flex' ? m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/206574833-Regras-para-a-fase-de-testes-do-Catarse-Flex\'][target=\'_blank\']', 'Regras do Flex') : '', ' e ', m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')])]), m('.w-col.w-col-4')])])]), '\
    '] : h.loader()];
    }
  };

  var startVM = function startVM(I18n) {
      var i18nStart = I18n.translations[I18n.currentLocale()].pages.start,
          testimonials = i18nStart.testimonials,
          categoryProjects = i18nStart.categoryProjects,
          panes = i18nStart.panes,
          qa = i18nStart.qa;

      return {
          testimonials: _$1.map(testimonials, function (testimonial) {
              return {
                  thumbUrl: testimonial.thumb,
                  content: testimonial.content,
                  name: testimonial.name,
                  totals: testimonial.totals
              };
          }),
          panes: _$1.map(panes, function (pane) {
              return {
                  label: pane.label,
                  src: pane.src
              };
          }),
          questions: {
              col_1: _$1.map(qa.col_1, function (question) {
                  return {
                      question: question.question,
                      answer: question.answer
                  };
              }),
              col_2: _$1.map(qa.col_2, function (question) {
                  return {
                      question: question.question,
                      answer: question.answer
                  };
              })
          },
          categoryProjects: _$1.map(categoryProjects, function (category) {
              return {
                  categoryId: category.category_id,
                  sampleProjects: [category.sample_project_ids.primary, category.sample_project_ids.secondary]
              };
          })
      };
  };

  var youtubeLightbox = {
      controller: function controller(args) {
          var player = void 0;
          var showLightbox = h.toggleProp(false, true),
              setYoutube = function setYoutube(el, isInitialized) {
              if (!isInitialized) {
                  var tag = document.createElement('script'),
                      firstScriptTag = document.getElementsByTagName('script')[0];
                  tag.src = 'https://www.youtube.com/iframe_api';
                  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                  window.onYouTubeIframeAPIReady = createPlayer;
              }
          },
              closeVideo = function closeVideo() {
              if (!_.isUndefined(player)) {
                  player.pauseVideo();
              }

              showLightbox.toggle();

              return false;
          },
              createPlayer = function createPlayer() {
              player = new YT.Player('ytvideo', {
                  height: '528',
                  width: '940',
                  videoId: args.src,
                  playerVars: {
                      showInfo: 0,
                      modestBranding: 0
                  },
                  events: {
                      'onStateChange': function onStateChange(state) {
                          return state.data === 0 ? closeVideo() : false;
                      }
                  }
              });
          };

          return {
              showLightbox: showLightbox,
              setYoutube: setYoutube,
              closeVideo: closeVideo
          };
      },
      view: function view(ctrl, args) {
          return m('#youtube-lightbox', [m('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', {
              onclick: ctrl.showLightbox.toggle
          }), m('#lightbox.w-lightbox-backdrop[style="display:' + (ctrl.showLightbox() ? 'block' : 'none') + '"]', [m('.w-lightbox-container', [m('.w-lightbox-content', [m('.w-lightbox-view', [m('.w-lightbox-frame', [m('figure.w-lightbox-figure', [m('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m('#ytvideo.embedly-embed.w-lightbox-embed', { config: ctrl.setYoutube })])])]), m('.w-lightbox-spinner.w-lightbox-hide'), m('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.closeVideo })]), m('.w-lightbox-strip')])])]);
      }
  };

  var I18nScope$7 = _$1.partial(h.i18nScope, 'pages.start');

  var start = {
      controller: function controller() {
          var stats = m.prop([]),
              categories = m.prop([]),
              selectedPane = m.prop(0),
              selectedCategory = m.prop([]),
              featuredProjects = m.prop([]),
              selectedCategoryIdx = m.prop(-1),
              startvm = startVM(I18n$1),
              filters = postgrest$1.filtersVM,
              paneImages = startvm.panes,
              categoryvm = filters({
              category_id: 'eq'
          }),
              projectvm = filters({
              project_id: 'eq'
          }),
              uservm = filters({
              id: 'eq'
          }),
              loader = postgrest$1.loader,
              statsLoader = loader(models.statistic.getRowOptions()),
              loadCategories = function loadCategories() {
              return models.category.getPage(filters({}).order({
                  name: 'asc'
              }).parameters()).then(categories);
          },
              selectPane = function selectPane(idx) {
              return function () {
                  selectedPane(idx);
              };
          },
              lCategory = function lCategory() {
              return loader(models.categoryTotals.getRowOptions(categoryvm.parameters()));
          },
              lProject = function lProject() {
              return loader(models.projectDetail.getRowOptions(projectvm.parameters()));
          },
              lUser = function lUser() {
              return loader(models.userDetail.getRowOptions(uservm.parameters()));
          },
              selectCategory = function selectCategory(category) {
              return function () {
                  selectedCategoryIdx(category.id);
                  categoryvm.category_id(category.id);
                  selectedCategory([category]);
                  m.redraw();
                  lCategory().load().then(loadCategoryProjects);
              };
          },
              setUser = function setUser(user, idx) {
              featuredProjects()[idx] = _$1.extend({}, featuredProjects()[idx], {
                  userThumb: _$1.first(user).profile_img_thumbnail
              });
          },
              setProject = function setProject(project, idx) {
              featuredProjects()[idx] = _$1.first(project);
              uservm.id(_$1.first(project).user.id);
              lUser().load().then(function (user) {
                  return setUser(user, idx);
              });
          },
              loadCategoryProjects = function loadCategoryProjects(category) {
              selectedCategory(category);
              var categoryProjects = _$1.findWhere(startvm.categoryProjects, {
                  categoryId: _$1.first(category).category_id
              });
              featuredProjects([]);
              if (!_$1.isUndefined(categoryProjects)) {
                  _$1.map(categoryProjects.sampleProjects, function (project_id, idx) {
                      if (!_$1.isUndefined(project_id)) {
                          projectvm.project_id(project_id);
                          lProject().load().then(function (project) {
                              return setProject(project, idx);
                          });
                      }
                  });
              }
          };

          statsLoader.load().then(stats);
          loadCategories();

          return {
              stats: stats,
              categories: categories,
              paneImages: paneImages,
              selectCategory: selectCategory,
              selectedCategory: selectedCategory,
              selectedCategoryIdx: selectedCategoryIdx,
              selectPane: selectPane,
              selectedPane: selectedPane,
              featuredProjects: featuredProjects,
              testimonials: startvm.testimonials,
              questions: startvm.questions
          };
      },
      view: function view(ctrl, args) {
          var stats = _$1.first(ctrl.stats());
          var testimonials = function testimonials() {
              return _$1.map(ctrl.testimonials, function (testimonial) {
                  var content = m('.card.u-radius.card-big.card-terciary', [m('.u-text-center.u-marginbottom-20', [m('img.thumb-testimonial.u-round.u-marginbottom-20[src="' + testimonial.thumbUrl + '"]')]), m('p.fontsize-large.u-marginbottom-30', '"' + testimonial.content + '"'), m('.u-text-center', [m('.fontsize-large.fontweight-semibold', testimonial.name), m('.fontsize-base', testimonial.totals)])]);

                  return {
                      content: content
                  };
              });
          };

          return [m('.w-section.hero-full.hero-start', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n$1.t('slogan', I18nScope$7())), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-large.u-marginbottom-10[href="#start-form"]', {
              config: h.scrollTo()
          }, I18n$1.t('submit', I18nScope$7()))])]), m('.w-row', _$1.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n$1.t('header.people', I18nScope$7()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.fontsize-small.start-stats', I18n$1.t('header.money', I18nScope$7()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n$1.t('header.success', I18nScope$7()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n$1.t('page-title', I18nScope$7())), m('.fontsize-small', I18n$1.t('page-subtitle', I18nScope$7()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.2', I18nScope$7()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.4', I18nScope$7()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.5', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.6', I18nScope$7())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n$1.t('banner.7', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.8', I18nScope$7()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.2', I18nScope$7()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$7())), m('.fontsize-base', I18n$1.t('banner.4', I18nScope$7()))])])])])]), m('.w-section.divider'), m('.w-section.section-large', [m('.w-container.u-text-center.u-marginbottom-60', [m('div', [m('span.fontsize-largest.fontweight-semibold', I18n$1.t('features.title', I18nScope$7()))]), m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n$1.t('features.subtitle', I18nScope$7())), m('.w-hidden-main.w-hidden-medium.u-margintop-30', [m('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_1', I18nScope$7())), m('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_2', I18nScope$7())), m('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_3', I18nScope$7())), m('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_4', I18nScope$7())), m('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_5', I18nScope$7()))])]), m('.w-container', [m('.w-tabs.w-hidden-small.w-hidden-tiny', [m('.w-tab-menu.w-col.w-col-4', _$1.map(ctrl.paneImages, function (pane, idx) {
              return m('btn.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                  onclick: ctrl.selectPane(idx)
              }, pane.label);
          })), m('.w-tab-content.w-col.w-col-8', _$1.map(ctrl.paneImages, function (pane, idx) {
              return m('.w-tab-pane', [m('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
          }))])])]), m('.w-section.section-large.bg-blue-one', [m('.w-container.u-text-center', [m('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n$1.t('video.title', I18nScope$7()), m('br'), I18n$1.t('video.subtitle', I18nScope$7())]), m.component(youtubeLightbox, {
              src: I18n$1.t('video.src', I18nScope$7())
          })])]), m('.w-hidden-small.w-hidden-tiny.section-categories', [m('.w-container', [m('.u-text-center', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n$1.t('categories.title', I18nScope$7()))])])]), m('.w-tabs', [m('.w-tab-menu.u-text-center', _$1.map(ctrl.categories(), function (category) {
              return m('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                  onclick: ctrl.selectCategory(category)
              }, [m('div', category.name)]);
          })), m('.w-tab-content.u-margintop-40', [m('.w-tab-pane.w--tab-active', [m('.w-row', ctrl.selectedCategoryIdx() !== -1 ? _$1.map(ctrl.selectedCategory(), function (category) {
              return [m('.w-col.w-col-5', [m('.fontsize-jumbo.u-marginbottom-20', category.name), m('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="#start-form"]', {
                  config: h.scrollTo()
              }, I18n$1.t('submit', I18nScope$7()))]), m('.w-col.w-col-7', [m('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + (category.total_successful_value ? h.formatNumber(category.total_successful_value, 2, 3) : '...')), m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m('.fontsize-megajumbo.fontcolor-negative', category.successful_projects ? category.successful_projects : '...'), m('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_$1.isEmpty(ctrl.featuredProjects()) ? _$1.map(ctrl.featuredProjects(), function (project) {
                  return !_$1.isUndefined(project) ? m('.w-row.u-marginbottom-10', [m('.w-col.w-col-1', [m('img.user-avatar[src="' + h.useAvatarOrDefault(project.userThumb) + '"]')]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', project.user.name), m('.fontsize-smallest', [I18n$1.t('categories.pledged', I18nScope$7({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })), m('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m('.fontsize-base', I18n$1.t('categories.loading_featured', I18nScope$7()));
              }) : ''])];
          }) : '')])])])])]), m.component(slider, {
              slides: testimonials(),
              title: I18n$1.t('testimonials_title', I18nScope$7()),
              slideClass: 'slide-testimonials-content',
              wrapperClass: 'slide-testimonials'
          }), m('.w-section.divider.u-margintop-30'), m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', I18n$1.t('qa_title', I18nScope$7())), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', _$1.map(ctrl.questions.col_1, function (question) {
              return m.component(landingQA, {
                  question: question.question,
                  answer: question.answer
              });
          })), m('.w-col.w-col-6', _$1.map(ctrl.questions.col_2, function (question) {
              return m.component(landingQA, {
                  question: question.question,
                  answer: question.answer
              });
          }))])]), m('#start-form.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m('form[action="/projects/fallback_create"][method="GET"].w-row.w-form', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n$1.t('form.title', I18nScope$7())), m('input[name="utf8"][type="hidden"][value="✓"]'), m('input[name="authenticity_token"][type="hidden"][value="' + h.authenticityToken() + '"]'), m('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', { name: 'project[name]' }), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m('select.w-select.text-field.medium.u-marginbottom-40', { name: 'project[category_id]' }, [m('option[value=""]', I18n$1.t('form.select_default', I18nScope$7())), _$1.map(ctrl.categories(), function (category) {
              return m('option[value="' + category.id + '"]', category.name);
          })])]), m('.w-col.w-col-2'), m('.w-row.u-marginbottom-80', [m('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m('input[type="submit"][value="' + I18n$1.t('form.submit', I18nScope$7()) + '"].w-button.btn.btn-large')])])])])])];
      }
  };

  var teamTotal = {
      controller: function controller() {
          var vm = {
              collection: m.prop([])
          };

          models.teamTotal.getRow().then(function (data) {
              vm.collection(data);
          });

          return {
              vm: vm
          };
      },
      view: function view(ctrl, args) {
          return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
              return m('.w-container', [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m('.w-col.w-col-2')])]);
          })]);
      }
  };

  var teamMembers = {
      controller: function controller() {
          var vm = {
              collection: m.prop([])
          },
              groupCollection = function groupCollection(collection, groupTotal) {
              return _$1.map(_$1.range(Math.ceil(collection.length / groupTotal)), function (i) {
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
          return m('#team-members-static.w-section.section', [m('.w-container', [_$1.map(ctrl.vm.collection(), function (group) {
              return m('.w-row.u-text-center', [_$1.map(group, function (member) {
                  return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [m('a.alt-link[href="/users/' + member.id + '"]', [m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m('.fontweight-semibold.fontsize-base', member.name)]), m('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')]);
              })]);
          })])]);
      }
  };

  var team = {
      view: function view() {
          return m('#static-team-app', [m.component(teamTotal), m.component(teamMembers)]);
      }
  };

  var I18nScope$8 = _$1.partial(h.i18nScope, 'users.balance');

  var userBalance = {
      controller: function controller(args) {
          args.balanceManager.load();

          return {
              userBalances: args.balanceManager.collection,
              displayModal: h.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var balance = _$1.first(ctrl.userBalances()),
              balanceRequestModalC = ['UserBalanceRequestModalContent', _$1.extend({}, { balance: balance }, args)];

          return m('.w-section.section.user-balance-section', [ctrl.displayModal() ? m.component(modalBox, {
              displayModal: ctrl.displayModal,
              content: balanceRequestModalC
          }) : '', m('.w-container', [m('.w-row', [m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [m('.fontsize-larger', [I18n.t('totals', I18nScope$8()), m('span.text-success', 'R$ ' + h.formatNumber(balance.amount, 2, 3))])]), m('.w-col.w-col-4', [m('a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ' + (balance.amount <= 0 ? 'btn-inactive' : '') + '"][href="js:void(0);"]', { onclick: balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);' }, I18n.t('withdraw_cta', I18nScope$8()))])])])]);
      }
  };

  var userBalanceTransactions = {
      controller: function controller(args) {
          args.balanceTransactionManager.load();

          return {
              list: args.balanceTransactionManager.list
          };
      },
      view: function view(ctrl, args) {
          var list = ctrl.list;

          return m('.w-section.section.card-terciary.before-footer.balance-transactions-area', [m('.w-container', _$1.map(list.collection(), function (item, index) {
              return m.component(c.UserBalanceTransactionRow, { item: item, index: index });
          })), m('.container', [m('.w-row.u-margintop-40', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h.loader()])])])]);
      }
  };

  var userBalanceMain = {
      controller: function controller(args) {
          var userIdVM = postgrest$1.filtersVM({ user_id: 'eq' });

          userIdVM.user_id(args.user_id);

          // Handles with user balance request data
          var balanceManager = function () {
              var collection = m.prop([{ amount: 0, user_id: args.user_id }]),
                  load = function load() {
                  models.balance.getRowWithToken(userIdVM.parameters()).then(collection);
              };

              return {
                  collection: collection,
                  load: load
              };
          }(),


          // Handles with user balance transactions list data
          balanceTransactionManager = function () {
              var listVM = postgrest$1.paginationVM(models.balanceTransaction, 'created_at.desc'),
                  load = function load() {
                  listVM.firstPage(userIdVM.parameters());
              };

              return {
                  load: load,
                  list: listVM
              };
          }(),


          // Handles with bank account to check
          bankAccountManager = function () {
              var collection = m.prop([]),
                  loader = function () {
                  return postgrest$1.loaderWithToken(models.bankAccount.getRowOptions(userIdVM.parameters()));
              }(),
                  load = function load() {
                  loader.load().then(collection);
              };

              return {
                  collection: collection,
                  load: load,
                  loader: loader
              };
          }();

          return {
              bankAccountManager: bankAccountManager,
              balanceManager: balanceManager,
              balanceTransactionManager: balanceTransactionManager
          };
      },
      view: function view(ctrl, args) {
          var opts = _$1.extend({}, args, ctrl);
          return m('#balance-area', [m.component(userBalance, opts), m('.divider'), m.component(userBalanceTransactions, opts), m('.u-marginbottom-40'), m('.w-section.section.card-terciary.before-footer')]);
      }
  };

  var c$1 = {
      root: {
          Flex: Flex,
          Insights: insights,
          Jobs: jobs,
          LiveStatistics: liveStatistics,
          ProjectsContributionReport: projectContributionReport,
          ProjectsDashboard: projectsDashboard,
          ProjectsExplore: projectsExplore,
          ProjectsHome: projectsHome,
          ProjectsShow: projectsShow,
          Publish: publish,
          Start: start,
          Team: team,
          UsersBalance: userBalanceMain
      }
  };

  return c$1;

}(m,postgrest,moment,I18n,_,Chart,replaceDiacritics));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmbGV4IGZyb20gJy4vcm9vdC9mbGV4JztcbmltcG9ydCBpbnNpZ2h0cyBmcm9tICcuL3Jvb3QvaW5zaWdodHMnO1xuaW1wb3J0IGpvYnMgZnJvbSAnLi9yb290L2pvYnMnO1xuaW1wb3J0IGxpdmVTdGF0aXN0aWNzIGZyb20gJy4vcm9vdC9saXZlLXN0YXRpc3RpY3MnO1xuaW1wb3J0IHByb2plY3RzQ29udHJpYnV0aW9uUmVwb3J0IGZyb20gJy4vcm9vdC9wcm9qZWN0cy1jb250cmlidXRpb24tcmVwb3J0JztcbmltcG9ydCBwcm9qZWN0c0Rhc2hib2FyZCBmcm9tICcuL3Jvb3QvcHJvamVjdHMtZGFzaGJvYXJkJztcbmltcG9ydCBwcm9qZWN0c0V4cGxvcmUgZnJvbSAnLi9yb290L3Byb2plY3RzLWV4cGxvcmUnO1xuaW1wb3J0IHByb2plY3RzSG9tZSBmcm9tICcuL3Jvb3QvcHJvamVjdHMtaG9tZSc7XG5pbXBvcnQgcHJvamVjdHNTaG93IGZyb20gJy4vcm9vdC9wcm9qZWN0cy1zaG93JztcbmltcG9ydCBwdWJsaXNoIGZyb20gJy4vcm9vdC9wdWJsaXNoJztcbmltcG9ydCBzdGFydCBmcm9tICcuL3Jvb3Qvc3RhcnQnO1xuaW1wb3J0IHRlYW0gZnJvbSAnLi9yb290L3RlYW0nO1xuaW1wb3J0IHVzZXJzQmFsYW5jZU1haW4gZnJvbSAnLi9yb290L3VzZXJzLWJhbGFuY2UtbWFpbic7XG5cbmNvbnN0IGMgPSB7XG4gICAgcm9vdDoge1xuICAgICAgICBGbGV4OiBmbGV4LFxuICAgICAgICBJbnNpZ2h0czogaW5zaWdodHMsXG4gICAgICAgIEpvYnM6IGpvYnMsXG4gICAgICAgIExpdmVTdGF0aXN0aWNzOiBsaXZlU3RhdGlzdGljcyxcbiAgICAgICAgUHJvamVjdHNDb250cmlidXRpb25SZXBvcnQ6IHByb2plY3RzQ29udHJpYnV0aW9uUmVwb3J0LFxuICAgICAgICBQcm9qZWN0c0Rhc2hib2FyZDogcHJvamVjdHNEYXNoYm9hcmQsXG4gICAgICAgIFByb2plY3RzRXhwbG9yZTogcHJvamVjdHNFeHBsb3JlLFxuICAgICAgICBQcm9qZWN0c0hvbWU6IHByb2plY3RzSG9tZSxcbiAgICAgICAgUHJvamVjdHNTaG93OiBwcm9qZWN0c1Nob3csXG4gICAgICAgIFB1Ymxpc2g6IHB1Ymxpc2gsXG4gICAgICAgIFN0YXJ0OiBzdGFydCxcbiAgICAgICAgVGVhbTogdGVhbSxcbiAgICAgICAgVXNlcnNCYWxhbmNlOiB1c2Vyc0JhbGFuY2VNYWluXG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYztcbiJdLCJmaWxlIjoiYy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
