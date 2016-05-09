(function (exports,m$1,_$1,moment$1,I18n$1,postgrest$1,replaceDiacritics,Chart) {
  'use strict';

  m$1 = 'default' in m$1 ? m$1['default'] : m$1;
  _$1 = 'default' in _$1 ? _$1['default'] : _$1;
  moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;
  I18n$1 = 'default' in I18n$1 ? I18n$1['default'] : I18n$1;
  postgrest$1 = 'default' in postgrest$1 ? postgrest$1['default'] : postgrest$1;
  replaceDiacritics = 'default' in replaceDiacritics ? replaceDiacritics['default'] : replaceDiacritics;
  Chart = 'default' in Chart ? Chart['default'] : Chart;

  var babelHelpers = {};

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers;

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
      return m$1('');
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
      var p = m$1.prop(defaultState);
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
      return m$1('.u-text-center.u-margintop-30 u-marginbottom-30', [m$1('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
  };
  var newFeatureBadge = function newFeatureBadge() {
      return m$1('span.badge.badge-success.margin-side-5', I18n$1.t('projects.new_feature_badge'));
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
          m$1.redraw();
      } : m$1.redraw;

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

  var h$1 = {
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

  var adminExternalAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              data = {},
              item = args.item;

          builder.requestOptions.config = function (xhr) {
              if (h$1.authenticityToken()) {
                  xhr.setRequestHeader('X-CSRF-Token', h$1.authenticityToken());
              }
          };

          var reload = _$1.compose(builder.model.getRowWithToken, h$1.idVM.id(item[builder.updateKey]).parameters),
              l = m$1.prop(false);

          var reloadItem = function reloadItem() {
              return reload().then(updateItem);
          };

          var requestError = function requestError(err) {
              l(false);
              complete(true);
              error(true);
          };

          var updateItem = function updateItem(res) {
              _$1.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              l(true);
              m$1.request(builder.requestOptions).then(reloadItem, requestError);
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
              };
          };

          return {
              l: l,
              complete: complete,
              error: error,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Requisição feita com sucesso.')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', 'Houve um problema na requisição.')])])]) : '']);
      }
  };

  describe('adminExternalAction', function () {
      var testModel = postgrest$1.model('reloadAction'),
          item = {
          testKey: 'foo'
      },
          ctrl,
          $output;

      var args = {
          updateKey: 'updateKey',
          callToAction: 'cta',
          innerLabel: 'inner',
          outerLabel: 'outer',
          model: testModel,
          requestOptions: {
              url: 'http://external_api'
          }
      };

      describe('view', function () {
          beforeAll(function () {
              jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({
                  'responseText': JSON.stringify([])
              });
          });

          beforeEach(function () {
              $output = mq(adminExternalAction, {
                  data: args,
                  item: item
              });
          });

          it('shoud render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.innerLabel)).toBeFalse();
              expect($output.contains(args.placeholder)).toBeFalse();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on button click', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should render an inner label', function () {
                  expect($output.contains(args.innerLabel)).toBeTrue();
              });

              it('should render a call to action', function () {
                  expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
              });
          });

          describe('on form submit', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should call a submit function on form submit', function () {
                  $output.trigger('form', 'submit');
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');
              });
          });
      });
  });

  var filterMain = {
      view: function view(ctrl, args) {
          var inputWrapperClass = args.inputWrapperClass || '.w-input.text-field.positive.medium',
              btnClass = args.btnClass || '.btn.btn-large.u-marginbottom-10';

          return m$1('.w-row', [m$1('.w-col.w-col-10', [m$1('input' + inputWrapperClass + '[placeholder="' + args.placeholder + '"][type="text"]', {
              onchange: m$1.withAttr('value', args.vm),
              value: args.vm()
          })]), m$1('.w-col.w-col-2', [m$1('input#filter-btn' + btnClass + '[type="submit"][value="Buscar"]')])]);
      }
  };

  var adminFilter = {
      controller: function controller() {
          return {
              toggler: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var filterBuilder = args.filterBuilder,
              data = args.data,
              label = args.label || '',
              main = _$1.findWhere(filterBuilder, {
              component: filterMain
          });

          return m$1('#admin-contributions-filter.w-section.page-header', [m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-30', label), m$1('.w-form', [m$1('form', {
              onsubmit: args.submit
          }, [main ? m$1.component(main.component, main.data) : '', m$1('.u-marginbottom-20.w-row', m$1('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
              onclick: ctrl.toggler.toggle
          }, 'Filtros avançados  >')), ctrl.toggler() ? m$1('#advanced-search.w-row.admin-filters', [_$1.map(filterBuilder, function (f) {
              return f.component !== filterMain ? m$1.component(f.component, f.data) : '';
          })]) : ''])])])]);
      }
  };

  describe('AdminFilter', function () {
      var ctrl = void 0,
          submit = void 0,
          fakeForm = void 0,
          formDesc = void 0,
          filterDescriber = void 0,
          $output = void 0;

      describe('controller', function () {
          beforeAll(function () {
              ctrl = adminFilter.controller();
          });

          it('should instantiate a toggler', function () {
              expect(ctrl.toggler).toBeDefined();
          });
      });

      describe('view', function () {
          beforeAll(function () {
              spyOn(m$1, 'component').and.callThrough();
              submit = jasmine.createSpy('submit');
              filterDescriber = FilterDescriberMock();
              $output = mq(adminFilter, {
                  filterBuilder: filterDescriber,
                  data: {
                      label: 'foo'
                  },
                  submit: submit
              });
          });

          it('should render the main filter on render', function () {
              expect(m$1.component).toHaveBeenCalledWith(filterMain, filterDescriber[0].data);
          });

          it('should build a form from a FormDescriber when clicking the advanced filter', function () {
              $output.click('button');
              //mithril.query calls component one time to build it, so calls.count = length + 1.
              expect(m$1.component.calls.count()).toEqual(filterDescriber.length + 1);
          });

          it('should trigger a submit function when submitting the form', function () {
              $output.trigger('form', 'submit');
              expect(submit).toHaveBeenCalled();
          });
      });
  });

  var adminInputAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              data = {},
              item = args.item,
              key = builder.property,
              forceValue = builder.forceValue || null,
              newValue = m$1.prop(forceValue);

          h$1.idVM.id(item[builder.updateKey]);

          var l = postgrest.loaderWithToken(builder.model.patchOptions(h$1.idVM.parameters(), data));

          var updateItem = function updateItem(res) {
              _.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              data[key] = newValue();
              l.load().then(updateItem, function () {
                  complete(true);
                  error(true);
              });
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
                  newValue(forceValue);
              };
          };

          return {
              complete: complete,
              error: error,
              l: l,
              newValue: newValue,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), data.forceValue === undefined ? m$1('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
              onchange: m$1.withAttr('value', ctrl.newValue),
              value: ctrl.newValue()
          }) : '', m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', data.successMessage)])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', 'Houve um problema na requisição. ' + data.errorMessage)])])]) : '']);
      }
  };

  describe('adminInputAction', function () {
      var testModel = postgrest$1.model('test'),
          item = {
          testKey: 'foo'
      },
          forced = null,
          ctrl = void 0,
          $output = void 0;

      var args = {
          property: 'testKey',
          updateKey: 'updateKey',
          callToAction: 'cta',
          innerLabel: 'inner',
          outerLabel: 'outer',
          placeholder: 'place',
          model: testModel
      };

      describe('controller', function () {
          beforeAll(function () {
              ctrl = adminInputAction.controller({
                  data: args,
                  item: item
              });
          });

          it('should instantiate a submit function', function () {
              expect(ctrl.submit).toBeFunction();
          });
          it('should return a toggler prop', function () {
              expect(ctrl.toggler).toBeFunction();
          });
          it('should return a value property to bind to', function () {
              expect(ctrl.newValue).toBeFunction();
          });

          describe('when forceValue is set', function () {
              beforeAll(function () {
                  args.forceValue = forced;
                  ctrl = adminInputAction.controller({
                      data: args,
                      item: item
                  });
              });

              it('should initialize newValue with forced value', function () {
                  expect(ctrl.newValue()).toEqual(forced);
              });

              afterAll(function () {
                  delete args.forceValue;
              });
          });
      });

      describe('view', function () {
          beforeEach(function () {
              $output = mq(adminInputAction, {
                  data: args,
                  item: item
              });
          });

          it('shoud render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.innerLabel)).toBeFalse();
              expect($output.contains(args.placeholder)).toBeFalse();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on button click', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should render an inner label', function () {
                  expect($output.contains(args.innerLabel)).toBeTrue();
              });
              it('should render a placeholder', function () {
                  expect($output.has('input[placeholder="' + args.placeholder + '"]')).toBeTrue();
              });
              it('should render a call to action', function () {
                  expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
              });

              describe('when forceValue is set', function () {
                  beforeAll(function () {
                      args.forceValue = forced;
                      ctrl = adminInputAction.controller({
                          data: args,
                          item: item
                      });
                  });

                  it('should initialize newValue with forced value', function () {
                      expect(ctrl.newValue()).toEqual(forced);
                  });

                  afterAll(function () {
                      delete args.forceValue;
                  });
              });
          });

          describe('on form submit', function () {
              beforeAll(function () {
                  spyOn(m$1, 'request').and.returnValue({
                      then: function then(callback) {
                          callback([{
                              test: true
                          }]);
                      }
                  });
              });
              beforeEach(function () {
                  $output.click('button');
              });

              it('should call a submit function on form submit', function () {
                  $output.trigger('form', 'submit');
                  expect(m$1.request).toHaveBeenCalled();
              });
          });
      });
  });

  var adminItem = {
      controller: function controller(args) {
          return {
              displayDetailBox: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var item = args.item;

          return m$1('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [m$1.component(args.listItem, {
              item: item,
              key: args.key
          }), m$1('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
              onclick: ctrl.displayDetailBox.toggle
          }), ctrl.displayDetailBox() ? m$1.component(args.listDetail, {
              item: item,
              key: args.key
          }) : '']);
      }
  };

  describe('AdminItem', function () {
      var item = void 0,
          $output = void 0,
          ListItemMock = void 0,
          ListDetailMock = void 0;

      beforeAll(function () {
          ListItemMock = {
              view: function view(ctrl, args) {
                  return m$1('.list-item-mock');
              }
          };
          ListDetailMock = {
              view: function view(ctrl, args) {
                  return m$1('.list-detail-mock');
              }
          };
      });

      describe('view', function () {
          beforeEach(function () {
              $output = mq(adminItem, {
                  listItem: ListItemMock,
                  listDetail: ListDetailMock,
                  item: item
              });
          });

          it('should render list item', function () {
              $output.should.have('.list-item-mock');
          });

          it('should render list detail when toggle details is true', function () {
              $output.click('button');
              $output.should.have('.list-detail-mock');
          });

          it('should not render list detail when toggle details is false', function () {
              $output.should.not.have('.list-detail-mock');
          });
      });
  });

  var adminList = {
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
              error = args.vm.error,
              label = args.label || '';

          return m$1('.w-section.section', [m$1('.w-container', error() ? m$1('.card.card-error.u-radius.fontweight-bold', error()) : [m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-9', [m$1('.fontsize-base', list.isLoading() ? 'Carregando ' + label.toLowerCase() + '...' : [m$1('span.fontweight-semibold', list.total()), ' ' + label.toLowerCase() + ' encontrados'])])]), m$1('#admin-contributions-list.w-container', [list.collection().map(function (item) {
              return m$1.component(adminItem, {
                  listItem: args.listItem,
                  listDetail: args.listDetail,
                  item: item,
                  key: item.id
              });
          }), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? h$1.loader() : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais')])])])])])])]);
      }
  };

  describe('adminList', function () {
      var $output = void 0,
          model = void 0,
          vm = void 0,
          ListItemMock = void 0,
          ListDetailMock = void 0,
          results = [{
          id: 1
      }],
          listParameters = void 0,
          endpoint = void 0;

      beforeAll(function () {
          endpoint = mockEndpoint('items', results);

          ListItemMock = {
              view: function view(ctrl, args) {
                  return m$1('.list-item-mock');
              }
          };
          ListDetailMock = {
              view: function view(ctrl, args) {
                  return m$1('');
              }
          };
          model = postgrest$1.model('items');
          vm = {
              list: postgrest$1.paginationVM(model),
              error: m$1.prop()
          };
          listParameters = {
              vm: vm,
              listItem: ListItemMock,
              listDetail: ListDetailMock
          };
      });

      describe('view', function () {
          describe('when not loading', function () {
              beforeEach(function () {
                  spyOn(vm.list, "isLoading").and.returnValue(false);
                  $output = mq(adminList, listParameters);
              });

              it('should render fetched items', function () {
                  expect($output.find('.card').length).toEqual(results.length);
              });

              it('should not show a loading icon', function () {
                  $output.should.not.have('img[alt="Loader"]');
              });
          });

          describe('when loading', function () {
              beforeEach(function () {
                  spyOn(vm.list, "isLoading").and.returnValue(true);
                  $output = mq(adminList, listParameters);
              });

              it('should render fetched items', function () {
                  expect($output.find('.card').length).toEqual(results.length);
              });

              it('should show a loading icon', function () {
                  $output.should.have('img[alt="Loader"]');
              });
          });

          describe('when error', function () {
              beforeEach(function () {
                  vm.error('endpoint error');
                  $output = mq(adminList, listParameters);
              });

              it('should show an error info', function () {
                  expect($output.has('.card-error')).toBeTrue();
              });
          });
      });
  });

  var adminNotificationHistory = {
      controller: function controller(args) {
          var notifications = m$1.prop([]),
              getNotifications = function getNotifications(user) {
              var notification = models.notification;
              notification.getPageWithToken(postgrest.filtersVM({
                  user_id: 'eq',
                  sent_at: 'is.null'
              }).user_id(user.id).sent_at(!null).order({
                  sent_at: 'desc'
              }).parameters()).then(notifications);
          };

          getNotifications(args.user);

          return {
              notifications: notifications
          };
      },
      view: function view(ctrl) {
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'), ctrl.notifications().map(function (cEvent) {
              return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event', [m$1('.w-col.w-col-24', [m$1('.fontcolor-secondary', h$1.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', cEvent.template_name, cEvent.origin ? ' - ' + cEvent.origin : '')])]);
          })]);
      }
  };

  describe('AdminNotificationHistory', function () {
      var user = void 0,
          historyBox = void 0,
          ctrl = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          user = m$1.prop(UserDetailMockery(1));
          $output = mq(adminNotificationHistory, { user: user()[0] });
      });

      describe('view', function () {
          it('should render fetched notifications', function () {
              expect($output.find('.date-event').length).toEqual(1);
          });
      });
  });

  var adminProjectDetailsCard = {
      controller: function controller(args) {
          var project = args.resource,
              generateStatusText = function generateStatusText() {
              var statusTextObj = m$1.prop({}),
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
              remainingTextObj: h$1.translatedTime(project.remaining_time),
              elapsedTextObj: h$1.translatedTime(project.elapsed_time),
              isFinalLap: isFinalLap
          };
      },
      view: function view(ctrl) {
          var project = ctrl.project,
              progress = project.progress.toFixed(2),
              statusTextObj = ctrl.statusTextObj(),
              remainingTextObj = ctrl.remainingTextObj,
              elapsedTextObj = ctrl.elapsedTextObj;

          return m$1('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m$1('div', [m$1('.fontsize-small.fontweight-semibold', [m$1('span.fontcolor-secondary', 'Status:'), ' ', m$1('span', {
              class: statusTextObj.cssClass
          }, ctrl.isFinalLap() && project.open_for_contributions ? 'RETA FINAL' : statusTextObj.text), ' ']), project.is_published ? [m$1('.meter.u-margintop-20.u-marginbottom-10', [m$1('.meter-fill', {
              style: {
                  width: (progress > 100 ? 100 : progress) + '%'
              }
          })]), m$1('.w-row', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'financiado'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'levantados'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h$1.formatNumber(project.pledged, 2)])]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'restam'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])] : ''])]);
      }
  };

  describe('AdminProjectDetailsCard', function () {
      var generateController = void 0,
          ctrl = void 0,
          projectDetail = void 0,
          component = void 0,
          view = void 0,
          $output = void 0;

      describe('controller', function () {
          beforeAll(function () {
              generateController = function generateController(attrs) {
                  projectDetail = ProjectDetailsMockery(attrs)[0];
                  component = m$1.component(adminProjectDetailsCard, {
                      resource: projectDetail
                  });
                  return component.controller();
              };
          });

          describe('project status text', function () {
              it('when project is online', function () {
                  ctrl = generateController({
                      state: 'online'
                  });
                  expect(ctrl.statusTextObj().text).toEqual('NO AR');
                  expect(ctrl.statusTextObj().cssClass).toEqual('text-success');
              });

              it('when project is failed', function () {
                  ctrl = generateController({
                      state: 'failed'
                  });
                  expect(ctrl.statusTextObj().text).toEqual('NÃO FINANCIADO');
                  expect(ctrl.statusTextObj().cssClass).toEqual('text-error');
              });
          });

          describe('project remaining time', function () {
              it('when remaining time is in days', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 10,
                          unit: 'days'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(10);
                  expect(ctrl.remainingTextObj.unit).toEqual('dias');
              });

              it('when remaining time is in seconds', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 12,
                          unit: 'seconds'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(12);
                  expect(ctrl.remainingTextObj.unit).toEqual('segundos');
              });

              it('when remaining time is in hours', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 2,
                          unit: 'hours'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(2);
                  expect(ctrl.remainingTextObj.unit).toEqual('horas');
              });
          });
      });

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              component = m$1.component(adminProjectDetailsCard, {
                  resource: projectDetail
              });
              ctrl = component.controller();
              view = component.view(ctrl, {
                  resource: projectDetail
              });
              $output = mq(view);
          });

          it('should render details of the project in card', function () {
              var remaningTimeObj = ctrl.remainingTextObj,
                  statusTextObj = ctrl.statusTextObj();

              expect($output.find('.project-details-card').length).toEqual(1);
              expect($output.contains(projectDetail.total_contributions)).toEqual(true);
              expect($output.contains('R$ ' + window.c.h.formatNumber(projectDetail.pledged, 2))).toEqual(true);
          });
      });
  });

  var adminRadioAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              data = {},
              error = m$1.prop(false),
              fail = m$1.prop(false),
              item = args.item(),
              description = m$1.prop(item.description || ''),
              key = builder.getKey,
              newID = m$1.prop(''),
              getFilter = {},
              setFilter = {},
              radios = m$1.prop(),
              getAttr = builder.radios,
              getKey = builder.getKey,
              getKeyValue = args.getKeyValue,
              updateKey = builder.updateKey,
              updateKeyValue = args.updateKeyValue,
              validate = builder.validate,
              selectedItem = builder.selectedItem || m$1.prop();

          setFilter[updateKey] = 'eq';
          var setVM = postgrest.filtersVM(setFilter);
          setVM[updateKey](updateKeyValue);

          getFilter[getKey] = 'eq';
          var getVM = postgrest.filtersVM(getFilter);
          getVM[getKey](getKeyValue);

          var getLoader = postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

          var setLoader = postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

          var updateItem = function updateItem(data) {
              if (data.length > 0) {
                  var newItem = _$1.findWhere(radios(), {
                      id: data[0][builder.selectKey]
                  });
                  selectedItem(newItem);
              } else {
                  error({
                      message: 'Nenhum item atualizado'
                  });
              }
              complete(true);
          };

          var fetch = function fetch() {
              getLoader.load().then(radios, error);
          };

          var submit = function submit() {
              if (newID()) {
                  var validation = validate(radios(), newID());
                  if (_$1.isUndefined(validation)) {
                      data[builder.selectKey] = newID();
                      setLoader.load().then(updateItem, error);
                  } else {
                      complete(true);
                      error({
                          message: validation
                      });
                  }
              }
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
                  newID('');
              };
          };

          var setDescription = function setDescription(text) {
              description(text);
              m$1.redraw();
          };

          fetch();

          return {
              complete: complete,
              description: description,
              setDescription: setDescription,
              error: error,
              setLoader: setLoader,
              getLoader: getLoader,
              newID: newID,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload,
              radios: radios
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              item = args.item(),
              btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [ctrl.radios() ? _$1.map(ctrl.radios(), function (radio, index) {
              var set = function set() {
                  ctrl.newID(radio.id);
                  ctrl.setDescription(radio.description);
              };
              var selected = radio.id === (item[data.selectKey] || item.id) ? true : false;

              return m$1('.w-radio', [m$1('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
                  onclick: set
              }), m$1('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
          }) : h$1.loader(), m$1('strong', 'Descrição'), m$1('p', ctrl.description()), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Recompensa alterada com sucesso!')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', ctrl.error().message)])])]) : '']);
      }
  };

  describe('AdminRadioAction', function () {
      var testModel = m$1.postgrest.model('reward_details'),
          testStr = 'updated',
          errorStr = 'error!';

      var error = false,
          item = void 0,
          fakeData = {},
          $output = void 0;

      var args = {
          getKey: 'project_id',
          updateKey: 'contribution_id',
          selectKey: 'reward_id',
          radios: 'rewards',
          callToAction: 'Alterar Recompensa',
          outerLabel: 'Recompensa',
          getModel: testModel,
          updateModel: testModel,
          validate: function validate() {
              return undefined;
          }
      };

      var errorArgs = _.extend({}, args, {
          validate: function validate() {
              return errorStr;
          }
      });

      describe('view', function () {
          beforeAll(function () {
              item = _.first(RewardDetailsMockery());
              args.selectedItem = m$1.prop(item);
              $output = mq(AdminRadioAction, {
                  data: args,
                  item: m$1.prop(item)
              });
          });

          it('shoud only render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on action button click', function () {
              beforeAll(function () {
                  $output.click('button');
              });

              it('should render a row of radio inputs', function () {
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);
              });

              it('should render the description of the default selected radio', function () {
                  $output.should.contain(item.description);
              });

              it('should send an patch request on form submit', function () {
                  $output.click('#r-0');
                  $output.trigger('form', 'submit');
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  // Should make a patch request to update item
                  expect(lastRequest.method).toEqual('PATCH');
              });

              describe('when new value is not valid', function () {
                  beforeAll(function () {
                      $output = mq(AdminRadioAction, {
                          data: errorArgs,
                          item: m$1.prop(item)
                      });
                      $output.click('button');
                      $output.click('#r-0');
                  });

                  it('should present an error message when new value is invalid', function () {
                      $output.trigger('form', 'submit');
                      $output.should.contain(errorStr);
                  });
              });
          });
      });
  });

  var adminReward = {
      view: function view(ctrl, args) {
          var reward = args.reward(),
              available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m$1('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, m$1('br'), 'Valor mínimo: R$' + h$1.formatNumber(reward.minimum_value, 2, 3), m$1('br'), m$1.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m$1('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m$1('br'), 'Descrição: ' + reward.description] : 'Apoio sem recompensa')]);
      }
  };

  describe('adminReward', function () {
      var ctrl = void 0,
          $output = void 0;

      describe('view', function () {
          var reward = void 0,
              ctrl = void 0;

          describe("when contribution has no reward", function () {
              beforeAll(function () {
                  $output = mq(adminReward.view(undefined, {
                      reward: m.prop({})
                  }));
              });

              it('should render "no reward" text when reward_id is null', function () {
                  $output.should.contain('Apoio sem recompensa');
              });
          });

          describe("when contribution has reward", function () {
              var reward = void 0;

              beforeAll(function () {
                  reward = m.prop(RewardDetailsMockery()[0]);
                  $output = mq(adminReward.view(undefined, {
                      reward: reward
                  }));
              });

              it("should render reward description when we have a reward_id", function () {
                  $output.should.contain(reward().description);
              });
          });
      });
  });

  var adminTransactionHistory = {
      controller: function controller(args) {
          var contribution = args.contribution,
              mapEvents = _$1.reduce([{
              date: contribution.paid_at,
              name: 'Apoio confirmado'
          }, {
              date: contribution.pending_refund_at,
              name: 'Reembolso solicitado'
          }, {
              date: contribution.refunded_at,
              name: 'Estorno realizado'
          }, {
              date: contribution.created_at,
              name: 'Apoio criado'
          }, {
              date: contribution.refused_at,
              name: 'Apoio cancelado'
          }, {
              date: contribution.deleted_at,
              name: 'Apoio excluído'
          }, {
              date: contribution.chargeback_at,
              name: 'Chargeback'
          }], function (memo, item) {
              if (item.date !== null && item.date !== undefined) {
                  item.originalDate = item.date;
                  item.date = h$1.momentify(item.date, 'DD/MM/YYYY, HH:mm');
                  return memo.concat(item);
              }

              return memo;
          }, []);

          return {
              orderedEvents: _$1.sortBy(mapEvents, 'originalDate')
          };
      },
      view: function view(ctrl) {
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'), ctrl.orderedEvents.map(function (cEvent) {
              return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event', [m$1('.w-col.w-col-6', [m$1('.fontcolor-secondary', cEvent.date)]), m$1('.w-col.w-col-6', [m$1('div', cEvent.name)])]);
          })]);
      }
  };

  describe('adminTransactionHistory', function () {
      var c = window.c,
          contribution = void 0,
          historyBox = void 0,
          ctrl = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          contribution = m$1.prop(ContributionDetailMockery(1));
          historyBox = m$1.component(adminTransactionHistory, {
              contribution: contribution()[0]
          });
          ctrl = historyBox.controller();
          view = historyBox.view(ctrl, {
              contribution: contribution
          });
          $output = mq(view);
      });

      describe('controller', function () {
          it('should have orderedEvents', function () {
              expect(ctrl.orderedEvents.length).toEqual(2);
          });

          it('should have formated the date on orderedEvents', function () {
              expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');
          });
      });

      describe('view', function () {
          it('should render fetched orderedEvents', function () {
              expect($output.find('.date-event').length).toEqual(2);
          });
      });
  });

  var adminTransaction = {
      view: function view(ctrl, args) {
          var contribution = args.contribution;
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m$1('.fontsize-smallest.lineheight-looser', ['Valor: R$' + _$1.formatNumber(contribution.value, 2, 3), m$1('br'), 'Taxa: R$' + _$1.formatNumber(contribution.gateway_fee, 2, 3), m$1('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), m$1('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), m$1('br'), 'Id pagamento: ' + contribution.gateway_id, m$1('br'), 'Apoio: ' + contribution.contribution_id, m$1('br'), 'Chave: \n', m$1('br'), contribution.key, m$1('br'), 'Meio: ' + contribution.gateway, m$1('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m$1('br'), contribution.is_second_slip ? [m$1('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m$1('span.badge', '2a via')] : ''])]);
      }
  };

  describe('AdminTransaction', function () {
      var contribution = void 0,
          detailedBox = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          contribution = m$1.prop(ContributionDetailMockery(1, {
              gateway_data: null
          }));
          detailedBox = m$1.component(adminTransaction, {
              contribution: contribution()[0]
          });
          view = detailedBox.view(null, {
              contribution: contribution
          });
          $output = mq(view);
      });

      describe('view', function () {
          it('should render details about contribution', function () {
              expect($output.contains('Valor: R$50,00')).toBeTrue();
              expect($output.contains('Meio: MoIP')).toBeTrue();
          });
      });
  });

  var adminUser = {
      view: function view(ctrl, args) {
          var user = args.item;

          return m$1('.w-row.admin-user', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m$1('.fontsize-smallest', 'Usuário: ' + user.id), m$1('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
      }
  };

  describe('AdminUser', function () {
      var item = void 0,
          $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              item = ContributionDetailMockery(1)[0];
              $output = mq(adminUser.view(null, {
                  item: item
              }));
          });

          it('should build an item from an item describer', function () {
              expect($output.has('.user-avatar')).toBeTrue();
              expect($output.contains(item.email)).toBeTrue();
          });
      });
  });

  var categoryButton = {
      view: function view(ctrl, args) {
          var category = args.category;

          return m$1('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m$1('a.w-inline-block.btn-category' + (category.name.length > 13 ? '.double-line' : '') + '[href=\'#by_category_id/' + category.id + '\']', [m$1('div', [category.name, m$1('span.badge.explore', category.online_projects)])])]);
      }
  };

  describe('CategoryButton', function () {
      var $output = void 0,
          c = window.c;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(m$1.component(c.CategoryButton, {
                  category: {
                      id: 1,
                      name: 'cat',
                      online_projects: 1
                  }
              }));
          });

          it('should build a link with .btn-category', function () {
              expect($output.has('a.btn-category')).toBeTrue();
          });
      });
  });

  var filterButton = {
      view: function view(ctrl, args) {
          var title = args.title,
              href = args.href;
          return m$1('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m$1('a.w-inline-block.btn-category.filters' + (title.length > 13 ? '.double-line' : '') + '[href=\'#' + href + '\']', [m$1('div', [title])])]);
      }
  };

  describe('FilterButton', function () {
      var $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(m$1.component(filterButton, {
                  title: 'Test',
                  href: 'test'
              }));
          });

          it('should build a link with .filters', function () {
              expect($output.has('a.filters')).toBeTrue();
          });
      });
  });

  var paymentStatus = {
      controller: function controller(args) {
          var payment = args.item,
              card = null,
              displayPaymentMethod = void 0,
              paymentMethodClass = void 0,
              stateClass = void 0;

          card = function card() {
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

          displayPaymentMethod = function displayPaymentMethod() {
              switch (payment.payment_method.toLowerCase()) {
                  case 'boletobancario':
                      return m$1('span#boleto-detail', '');
                  case 'cartaodecredito':
                      var cardData = card();
                      if (cardData) {
                          return m$1('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [cardData.first_digits + '******' + cardData.last_digits, m$1('br'), cardData.brand + ' ' + payment.installments + 'x']);
                      }
                      return '';
              }
          };

          paymentMethodClass = function paymentMethodClass() {
              switch (payment.payment_method.toLowerCase()) {
                  case 'boletobancario':
                      return '.fa-barcode';
                  case 'cartaodecredito':
                      return '.fa-credit-card';
                  default:
                      return '.fa-question';
              }
          };

          stateClass = function stateClass() {
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

          return m$1('.w-row.payment-status', [m$1('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m$1('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state]), m$1('.fontsize-smallest.fontweight-semibold', [m$1('span.fa' + ctrl.paymentMethodClass()), ' ', m$1('a.link-hidden[href="#"]', payment.payment_method)]), m$1('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
      }
  };

  describe('PaymentStatus', function () {
      var c = window.c,
          ctrl = void 0,
          setController = function setController(contribution) {
          var payment = {
              gateway: contribution.gateway,
              gateway_data: contribution.gateway_data,
              installments: contribution.installments,
              state: contribution.state,
              payment_method: contribution.payment_method
          };
          ctrl = m$1.component(paymentStatus, {
              item: payment
          }).controller();
      };

      describe('stateClass function', function () {
          it('should return a success CSS class when contribution state is paid', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'paid'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-success');
          });
          it('should return a success CSS class when contribution state is refunded', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'refunded'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-refunded');
          });
          it('should return a warning CSS class when contribution state is pending', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'pending'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-waiting');
          });
          it('should return an error CSS class when contribution state is refused', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'refused'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-error');
          });
          it('should return an error CSS class when contribution state is not known', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'foo'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-error');
          });
      });

      describe('paymentMethodClass function', function () {
          var CSSboleto = '.fa-barcode',
              CSScreditcard = '.fa-credit-card',
              CSSerror = '.fa-question';

          it('should return a boleto CSS class when contribution payment method is boleto', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'BoletoBancario'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);
          });
          it('should return a credit card CSS class when contribution payment method is credit card', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'CartaoDeCredito'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);
          });
          it('should return an error CSS class when contribution payment method is not known', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'foo'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSSerror);
          });
      });

      describe('view', function () {
          var getOutput = function getOutput(payment_method) {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: payment_method
              })[0],
                  payment = {
                  gateway: contribution.gateway,
                  gateway_data: contribution.gateway_data,
                  installments: contribution.installments,
                  state: contribution.state,
                  payment_method: contribution.payment_method
              };
              return mq(m$1.component(paymentStatus, {
                  item: payment
              }));
          };

          it('should return an HTML element describing a boleto when payment_method is boleto', function () {
              expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();
          });
          it('should return an HTML element describing a credit card when payment_method is credit card', function () {
              expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();
          });
      });
  });

  var projectRewardList = {
      view: function view(ctrl, args) {
          //FIXME: MISSING ADJUSTS
          // - add draft admin modifications
          var project = args.project;
          return m$1('#rewards.u-marginbottom-30', _$1.map(args.rewardDetails(), function (reward) {
              var contributionUrlWithReward = '/projects/' + project().id + '/contributions/new?reward_id=' + reward.id;

              return m$1('a[class="' + (h$1.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project().open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project().open_for_contributions && !h$1.rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [m$1('.u-marginbottom-20', [m$1('.fontsize-base.fontweight-semibold', 'Para R$ ' + h$1.formatNumber(reward.minimum_value) + ' ou mais'), m$1('.fontsize-smaller.fontweight-semibold', h$1.pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m$1('.maximum_contributions.in_time_to_confirm.clearfix', [m$1('.pending.fontsize-smallest.fontcolor-secondary', h$1.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h$1.rewardSouldOut(reward) ? m$1('.u-margintop-10', [m$1('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m$1('.u-margintop-10', [m$1('span.badge.badge-attention.fontsize-smaller', [m$1('span.fontweight-bold', 'Limitada'), ' (' + h$1.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), m$1('.fontsize-smaller.u-margintop-20', m$1.trust(h$1.simpleFormat(reward.description))), !_$1.isEmpty(reward.deliver_at) ? m$1('.fontsize-smaller', [m$1('b', 'Estimativa de Entrega: '), h$1.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project().open_for_contributions && !h$1.rewardSouldOut(reward) ? m$1('.project-reward-box-hover', [m$1('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
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

          return m$1('#suggestions', _$1.map(suggestedValues, function (amount) {
              return m$1('a[href="' + suggestionUrl(amount) + '"].card-reward.card-big.card-secondary.u-marginbottom-20', [m$1('.fontsize-larger', 'R$ ' + amount)]);
          }));
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
              return project.is_published && h$1.existy(project.zone_expires_at) ? m$1('.funding-period', [m$1('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'), m$1('.fontsize-small.u-text-center-small-only', h$1.momentify(project.zone_online_date) + ' - ' + h$1.momentify(project.zone_expires_at) + ' (' + onlineDays() + ' dias)')]) : '';
          };

          return m$1('#project-about', [m$1('.project-about.w-col.w-col-8', {
              config: h$1.UIHelper()
          }, [m$1('p.fontsize-base', [m$1('strong', 'O projeto')]), m$1('.fontsize-base[itemprop="about"]', m$1.trust(h$1.selfOrEmpty(project.about_html, '...'))), project.budget ? [m$1('p.fontsize-base.fontweight-semibold', 'Orçamento'), m$1('p.fontsize-base', m$1.trust(project.budget))] : '']), m$1('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m$1.component(projectRewardList, {
              project: args.project,
              rewardDetails: args.rewardDetails
          }), fundingPeriod()] : [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), m$1.component(projectSuggestedContributions, { project: args.project }), fundingPeriod()])]);
      }
  };

  describe('ProjectAbout', function () {
      var $output = void 0,
          projectDetail = void 0,
          rewardDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              rewardDetail = RewardDetailsMockery()[0];
              var component = m$1.component(projectAbout, {
                  project: m$1.prop(projectDetail),
                  rewardDetails: m$1.prop(RewardDetailsMockery())
              }),
                  view = component.view();
              $output = mq(view);
          });

          it('should render project about and reward list', function () {
              expect($output.contains(projectDetail.about_html)).toEqual(true);
              expect($output.contains(rewardDetail.description)).toEqual(true);
          });
      });
  });

  var I18nScope = _$1.partial(h$1.i18nScope, 'projects.card');
  var projectCard = {
      view: function view(ctrl, args) {
          var project = args.project,
              progress = project.progress.toFixed(2),
              remainingTextObj = h$1.translatedTime(project.remaining_time),
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

          return m$1(css(type).wrapper, [m$1(css(type).innerWrapper, [m$1('a' + css(type).thumb + '[href="' + link + '"]', {
              style: {
                  'background-image': 'url(' + project.project_img + ')',
                  'display': 'block'
              }
          }), m$1(css(type).descriptionWrapper, [m$1(css(type).description, [m$1(css(type).title, [m$1('a.link-hidden[href="' + link + '"]', project.project_name)]), m$1(css(type).author, I18n$1.t('by', I18nScope()) + ' ' + project.owner_name), m$1(css(type).headline, [m$1('a.link-hidden[href="' + link + '"]', project.headline)])]), m$1(css(type).city, [m$1('.fontsize-smallest.fontcolor-secondary', [m$1('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m$1('.card-project-meter.' + project.state, [_$1.contains(['successful', 'failed', 'waiting_funds'], project.state) ? m$1('div', I18n$1.t('display_status.' + project.state, I18nScope())) : m$1('.meter', [m$1('.meter-fill', {
              style: {
                  width: (progress > 100 ? 100 : progress) + '%'
              }
          })])]), m$1('.card-project-stats', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m$1('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m$1('.fontsize-smaller.fontweight-semibold', 'R$ ' + h$1.formatNumber(project.pledged)), m$1('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [m$1('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m$1('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [m$1('.fontsize-smallest.lineheight-tight', ['Prazo em', m$1('br'), 'aberto'])])])])])])]);
      }
  };

  describe('ProjectCard', function () {
      var project = void 0,
          component = void 0,
          view = void 0,
          $output = void 0,
          $customOutput = void 0,
          remainingTimeObj = void 0;

      describe('view', function () {
          beforeAll(function () {
              project = ProjectMockery()[0];
              remainingTimeObj = h$1.translatedTime(project.remaining_time);
              $output = function $output(type) {
                  return mq(m$1.component(projectCard, {
                      project: project, type: type
                  }));
              };
          });

          it('should render the project card', function () {
              expect($output().find('.card-project').length).toEqual(1);
              expect($output().contains(project.owner_name)).toEqual(true);
              expect($output().contains(remainingTimeObj.unit)).toEqual(true);
          });

          it('should render a big project card when type is big', function () {
              expect($output('big').find('.card-project-thumb.big').length).toEqual(1);
              expect($output('big').contains(project.owner_name)).toEqual(true);
              expect($output('big').contains(remainingTimeObj.unit)).toEqual(true);
          });

          it('should render a medium project card when type is medium', function () {
              expect($output('medium').find('.card-project-thumb.medium').length).toEqual(1);
              expect($output('medium').contains(project.owner_name)).toEqual(true);
              expect($output('medium').contains(remainingTimeObj.unit)).toEqual(true);
          });
      });
  });

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
          return m$1('#project_contributions.content.w-col.w-col-12', [args.project().is_owner_or_admin ? m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-1', [m$1('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
              onclick: ctrl.toggleWaiting()
          })]), m$1('.w-col.w-col-5', [m$1('label[for="contribution_state_available_to_count"]', 'Confirmados')]), m$1('.w-col.w-col-1', [m$1('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
              onclick: ctrl.toggleWaiting(true)
          })]), m$1('.w-col.w-col-5', [m$1('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')])]) : '', m$1('.project-contributions', _$1.map(list.collection(), function (contribution) {
              return m$1('.w-clearfix', [m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-1', [m$1('a[href="/users/' + contribution.user_id + '"]', [m$1('.thumb.u-left.u-round[style="background-image: url(' + (!_$1.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')])]), m$1('.w-col.w-col-11', [m$1('.fontsize-base.fontweight-semibold', [m$1('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), contribution.is_owner_or_admin ? m$1('.fontsize-smaller', ['R$ ' + h$1.formatNumber(contribution.value, 2, 3), contribution.anonymous ? [m$1.trust('&nbsp;-&nbsp;'), m$1('strong', 'Apoiador anônimo')] : '']) : '', m$1('.fontsize-smaller', h$1.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'), m$1('.fontsize-smaller', contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora')])])]), m$1('.divider.u-marginbottom-20')]);
          })), m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h$1.loader()])])]);
      }
  };

  describe('projectContributions', function () {
      var $output = void 0,
          projectContribution = void 0;

      describe('view', function () {
          beforeAll(function () {
              jasmine.Ajax.stubRequest(new RegExp('(' + apiPrefix + '\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({
                  'responseText': JSON.stringify(projectContributionsMockery())
              });

              spyOn(m$1, 'component').and.callThrough();
              projectContribution = projectContributionsMockery()[0];
              var project = m$1.prop({
                  id: 1231
              });
              var component = m$1.component(projectContributions, {
                  project: project
              }),
                  view = component.view(component.controller({
                  project: project
              }));

              $output = mq(view);
          });

          it('should render project contributions list', function () {
              expect($output.contains(projectContribution.user_name)).toEqual(true);
          });
      });
  });

  var I18nScope$1 = _$1.partial(h$1.i18nScope, 'projects.dashboard_nav');

  var projectDashboardMenu = {
      controller: function controller(args) {
          var body = document.getElementsByTagName('body')[0],
              editLinksToggle = h$1.toggleProp(true, false),
              showPublish = h$1.toggleProp(true, false),
              bodyToggleForNav = h$1.toggleProp('body-project open', 'body-project closed');

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
          var optionalOpt = project.mode === 'flex' ? m$1('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

          ctrl.body.className = ctrl.bodyToggleForNav();

          return m$1('#project-nav', [m$1('.project-nav-wrapper', [m$1('nav.w-section.dashboard-nav.side', [m$1('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m$1('img.thumb-project-dashboard[src="' + (_$1.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m$1('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m$1('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m$1('#info-links', [m$1('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h$1.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m$1('span.fa.fa-bar-chart.fa-lg.fa-fw'), I18n$1.t('start_tab', I18nScope$1())]), project.is_published ? [m$1('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m$1('span.fa.fa.fa-table.fa-lg.fa-fw'), I18n$1.t('reports_tab', I18nScope$1())]), m$1('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m$1('span.fa.fa-bullhorn.fa-fw.fa-lg'), I18n$1.t('posts_tab', I18nScope$1()), m$1('span.badge', project.posts_count)])] : '']), m$1('.edit-project-div', [!project.is_published ? '' : m$1('button#toggle-edit-menu.dashboard-nav-link-left', {
              onclick: ctrl.editLinksToggle.toggle
          }, [m$1('span.fa.fa-pencil.fa-fw.fa-lg'), I18n$1.t('edit_project', I18nScope$1())]), ctrl.editLinksToggle() ? m$1('#edit-menu-items', [m$1('#dashboard-links', [!project.is_published || project.is_admin_role ? [m$1('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m$1('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Financiamento')] : '', m$1('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m$1('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m$1('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', 'Orçamento'), m$1('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m$1('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m$1('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.mode === 'flex' || project.is_published || project.state === 'approved' || project.is_admin_role ? [m$1('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m$1('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m$1('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published && ctrl.showPublish() ? [m$1('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m$1('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', I18n$1.t('send', I18nScope$1())) : '', project.state === 'approved' ? m$1('a.btn.btn-medium[href="/projects/' + project.id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$1()), m$1.trust('&nbsp;&nbsp;'), m$1('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m$1('a.btn.btn-medium[href="/flexible_projects/' + project.flex_id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$1()), m$1.trust('&nbsp;&nbsp;'), m$1('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' && project.is_published ? [m$1('.btn-send-draft-fixed', _$1.isNull(project.expires_at) ? m$1('a.w-button.btn.btn-medium.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', I18n$1.t('announce_expiration', I18nScope$1())) : '')] : '']])])]), m$1('a.btn-dashboard href="js:void(0);"', {
              onclick: ctrl.bodyToggleForNav.toggle
          }, [m$1('span.fa.fa-bars.fa-lg')])]);
      }
  };

  describe('ProjectDashboardMenu', function () {
      var generateContextByNewState = void 0;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  var body = jasmine.createSpyObj('body', ['className']),
                      projectDetail = m$1.prop(ProjectDetailsMockery(newState)[0]),
                      component = m$1.component(projectDashboardMenu, {
                      project: projectDetail
                  }),
                      ctrl = component.controller({
                      project: projectDetail
                  });

                  spyOn(m$1, 'component').and.callThrough();
                  spyOn(ctrl, 'body').and.returnValue(body);

                  return {
                      output: mq(component, {
                          project: projectDetail
                      }),
                      projectDetail: projectDetail
                  };
              };
          });

          it('when project is online', function () {
              var _generateContextByNew = generateContextByNewState({
                  state: 'online'
              });

              var output = _generateContextByNew.output;
              var projectDetail = _generateContextByNew.projectDetail;


              output.should.contain(projectDetail().name);
              output.should.have('#info-links');
          });
      });
  });

  var projectShareBox = {
      controller: function controller() {
          return {
              displayEmbed: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          return m$1('.pop-share', {
              style: 'display: block;'
          }, [m$1('.w-hidden-main.w-hidden-medium.w-clearfix', [m$1('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
              onclick: args.displayShareBox.toggle
          }, 'Fechar'), m$1('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m$1('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [m$1('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), m$1('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m$1('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project().name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dtwitter&via=catarse"]')]), m$1('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
              onclick: ctrl.displayEmbed.toggle
          }, '< embed >'), ctrl.displayEmbed() ? m$1('.embed-expanded.u-margintop-30', [m$1('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m$1('.w-form', [m$1('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project().id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m$1('.card-embed', [m$1('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().id + '/embed"][width="300px"][scrolling="no"]')])]) : '', m$1('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project().permalink + '?ref=facebook&title=' + args.project().name + '"][target="_blank"]', [m$1('span.fa.fa-facebook'), ' Compartilhe']), m$1('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project().name + ' htts://www.catarse.me/' + args.project().permalink + '?ref=twitterr"][target="_blank"]', [m$1('span.fa.fa-twitter'), ' Tweet'])]);
      }
  };

  var projectHighlight = {
      controller: function controller() {
          return {
              displayShareBox: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var project = args.project,
              address = project().address || { state_acronym: '', city: '' };

          return m$1('#project-highlight', [project().video_embed_url ? m$1('.w-embed.w-video.project-video', {
              style: 'min-height: 240px;'
          }, [m$1('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m$1('.project-image', {
              style: 'background-image:url(' + project().original_image + ');'
          }), m$1('.project-blurb', project().headline), m$1('.u-text-center-small-only.u-marginbottom-30', [!_$1.isNull(address) ? m$1('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', [m$1('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '', m$1('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project().category_id + '"]', [m$1('span.fa.fa-tag'), ' ', project().category_name]), m$1('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
              onclick: ctrl.displayShareBox.toggle
          }, 'Compartilhar'), ctrl.displayShareBox() ? m$1.component(projectShareBox, {
              project: project,
              displayShareBox: ctrl.displayShareBox
          }) : ''])]);
      }
  };

  var tooltip = {
      controller: function controller(args) {
          var parentHeight = m$1.prop(0),
              width = m$1.prop(args.width || 280),
              top = m$1.prop(0),
              left = m$1.prop(0),
              opacity = m$1.prop(0),
              parentOffset = m$1.prop({ top: 0, left: 0 }),
              tooltip = h$1.toggleProp(0, 1),
              toggle = function toggle() {
              tooltip.toggle();
              m$1.redraw();
          };

          var setParentPosition = function setParentPosition(el, isInitialized) {
              if (!isInitialized) {
                  parentOffset(h$1.cumulativeOffset(el));
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
          return m$1(args.el, {
              onclick: ctrl.toggle,
              config: ctrl.setParentPosition,
              style: { cursor: 'pointer' }
          }, ctrl.tooltip() ? [m$1('.tooltip.dark[style="width: ' + width + 'px; top: ' + ctrl.top() + 'px; left: ' + ctrl.left() + 'px;"]', {
              config: ctrl.setPosition
          }, [m$1('.fontsize-smallest', args.text)])] : '');
      }
  };

  var projectMode = {
      view: function view(ctrl, args) {
          var project = args.project(),
              mode = project.mode,
              modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
              modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
              goal = _$1.isNull(project.goal) ? 'não definida' : h$1.formatNumber(project.goal),
              buildTooltip = function buildTooltip(el) {
              return m$1.component(tooltip, {
                  el: el,
                  text: mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + h$1.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.',
                  width: 280
              });
          };

          return m$1('#' + mode + '.w-row', [m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_$1.isEmpty(project) ? m$1('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m$1('.fontsize-base.fontweight-semibold', 'Meta R$ ' + h$1.selfOrEmpty(goal, '--')), m$1('.w-inline-block.fontsize-smallest._w-inline-block', [!_$1.isEmpty(project) ? modeTitle : '', buildTooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
      }
  };

  var popNotification = {
      controller: function controller() {
          return {
              displayNotification: h$1.toggleProp(true, false)
          };
      },
      view: function view(ctrl, args) {
          return ctrl.displayNotification() ? m$1('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', [m$1('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
              onclick: ctrl.displayNotification.toggle
          }), m$1('.fontsize-small', args.message)]) : m$1('span');
      }
  };

  var projectReminder = {
      controller: function controller(args) {
          var l = m$1.prop(false);
          var project = args.project,
              filterVM = postgrest.filtersVM({
              project_id: 'eq'
          }),
              storeReminderName = 'remind_' + project().id,
              popNotification = m$1.prop(false),
              submitReminder = function submitReminder() {
              if (!h$1.getUser()) {
                  h$1.storeAction(storeReminderName, submitReminder);
                  return h$1.navigateToDevise();
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
                          m$1.redraw();
                      }, 5000);
                  } else {
                      popNotification(false);
                  }
              });
          };

          h$1.callStoredAction(storeReminderName, submitReminder);
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

          return m$1('#project-reminder' + mainClass, [m$1('button[class="' + buttonClass + ' ' + (project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
              onclick: ctrl.submitReminder
          }, [ctrl.l() ? 'aguarde ...' : m$1('span.fa.fa-clock-o', [m$1('span' + (hideTextOnMobile ? '.w-hidden-medium' : ''), project().in_reminder ? ' Lembrete ativo' : ' Lembrar-me')])]), ctrl.popNotification() ? m$1.component(popNotification, {
              message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
          }) : '']);
      }
  };

  var ownerMessageContent = {
      controller: function controller(args) {
          var l = m$1.prop(false),
              sendSuccess = m$1.prop(false),
              sendMessage = function sendMessage() {
              var loaderOpts = models.directMessage.postOptions({
                  from_name: document.getElementById('from_name').value,
                  from_email: document.getElementById('from_email').value,
                  user_id: h$1.getUser()['user_id'],
                  content: document.getElementById('message_content').value,
                  project_id: h$1.getCurrentProject()['project_id'],
                  to_user_id: h$1.getCurrentProject()['project_user_id']
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
          var user = h$1.getUser(),
              successMessage = m$1('.modal-dialog-content.u-text-center', [m$1('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m$1('p.fontsize-large', 'Sua mensagem foi enviada com sucesso para ' + _$1.first(ctrl.userDetails()).name + '. Você vai receber uma cópia no seu email e pode seguir a conversa por lá!')]),
              contactForm = [m$1('.modal-dialog-content', [m$1('.w-form', [m$1('form', { onsubmit: ctrl.sendMessage }, [m$1('.w-row', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.fontsize-smaller', 'Seu nome'), m$1('input.w-input.text-field[value=\'' + (user ? user['name'] : '') + '\'][id=\'from_name\'][type=\'text\'][required]')]), m$1('.w-col.w-col-6', [m$1('label.fontsize-smaller', 'Seu email'), m$1('input.w-input.text-field[value=\'' + (user ? user['email'] : '') + '\'][id=\'from_email\'][type=\'text\'][required]')])]), m$1('label', 'Mensagem'), m$1('textarea.w-input.text-field.height-small[id=\'message_content\'][required]'), m$1('.fontsize-smallest.fontcolor-terciary', 'Você receberá uma cópia desta mensagem em seu email.'), m$1('.modal-dialog-nav-bottom', m$1('.w-row', m$1('.w-col.w-col-6.w-col-push-3', m$1('input.w-button.btn.btn-large[type="submit"][value="Enviar mensagem"]'))))])])])];

          return m$1('div', [m$1('.modal-dialog-header', m$1('.fontsize-large.u-text-center', 'Enviar mensagem')), ctrl.sendSuccess() ? successMessage : contactForm]);
      }
  };

  var modalBox = {
      view: function view(ctrl, args) {
          return m$1('.modal-backdrop', [m$1('.modal-dialog-outer', [m$1('.modal-dialog-inner.modal-dialog-small', [m$1('a.w-inline-block.modal-close.fa.fa-close.fa-lg[href="javascript:void(0);"]', {
              onclick: args.displayModal.toggle
          }), m$1.component(args.content[0], args.content[1])])])]);
      }
  };

  var projectUserCard = {
      controller: function controller(args) {
          return { displayModal: h$1.toggleProp(false, true) };
      },
      view: function view(ctrl, args) {
          var contactModalC = [ownerMessageContent, args.userDetails];

          return m$1('#user-card', _$1.map(args.userDetails(), function (userDetail) {
              return m$1('.u-marginbottom-30.u-text-center-small-only', [ctrl.displayModal() ? m$1.component(modalBox, {
                  displayModal: ctrl.displayModal,
                  content: contactModalC
              }) : '', m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m$1('.w-col.w-col-8', [m$1('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [m$1('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m$1('.fontsize-smallest', [h$1.pluralize(userDetail.total_published_projects, ' criado', ' criados'), m$1.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h$1.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), m$1('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_$1.isEmpty(userDetail.facebook_link) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_$1.isEmpty(userDetail.twitter_username) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _$1.map(userDetail.links, function (link) {
                  var parsedLink = h$1.parseUrl(link);

                  return !_$1.isEmpty(parsedLink.hostname) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)]) : '';
              })]), !_$1.isEmpty(userDetail.email) ? [m$1('a.w-button.btn.btn-terciary.btn-small.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.displayModal.toggle }, 'Enviar mensagem')] : ''])])]);
          }));
      }
  };

  var I18nScope$2 = _$1.partial(h$1.i18nScope, 'projects.project_sidebar');

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
                              pledgedEl.innerText = 'R$ ' + h$1.formatNumber(pledged);
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
                  'approved': I18n$1.t('display_status.approved', I18nScope$2()),
                  'online': h$1.existy(project().zone_expires_at) ? I18n$1.t('display_status.online', I18nScope$2({ date: h$1.momentify(project().zone_expires_at) })) : '',
                  'failed': I18n$1.t('display_status.failed', I18nScope$2({ date: h$1.momentify(project().zone_expires_at), goal: project().goal })),
                  'rejected': I18n$1.t('display_status.rejected', I18nScope$2()),
                  'in_analysis': I18n$1.t('display_status.in_analysis', I18nScope$2()),
                  'successful': I18n$1.t('display_status.successful', I18nScope$2({ date: h$1.momentify(project().zone_expires_at) })),
                  'waiting_funds': I18n$1.t('display_status.waiting_funds', I18nScope$2()),
                  'draft': I18n$1.t('display_status.draft', I18nScope$2())
              };

              return states[project().state];
          };

          return m$1('#project-sidebar.aside', [m$1('.project-stats', [m$1('.project-stats-inner', [m$1('.project-stats-info', [m$1('.u-marginbottom-20', [m$1('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? h$1.formatNumber(project().pledged) : '0')), m$1('.fontsize-small.u-text-center-small-only', [I18n$1.t('contributors_call', I18nScope$2()), m$1('span#contributors.fontweight-semibold', I18n$1.t('contributors_count', I18nScope$2({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + I18n$1.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope$2()) : ''])]), m$1('.meter', [m$1('#progressBar.meter-fill', {
              style: {
                  width: project().progress + '%'
              }
          })]), m$1('.w-row.u-margintop-10', [m$1('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m$1('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m$1('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m$1('span.fontweight-semibold', remaining.total), I18n$1.t('remaining_time.' + remaining.unit, I18nScope$2({ count: remaining.total }))] : '')])])]), m$1('.w-row', [m$1.component(projectMode, {
              project: project
          })])]), project().open_for_contributions ? m$1('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project().id + '/contributions/new"]', I18n$1.t('submit', I18nScope$2())) : '', project().open_for_contributions ? m$1.component(projectReminder, {
              project: project,
              type: 'link'
          }) : '', m$1('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), m$1('.user-c', m$1.component(projectUserCard, {
              userDetails: args.userDetails
          }))]);
      }
  };

  var projectHeader = {
      view: function view(ctrl, args) {
          var project = args.project;

          if (_$1.isUndefined(project())) {
              project = m$1.prop({});
          }

          return m$1('#project-header', [m$1('.w-section.section-product.' + project().mode), m$1('.w-section.page-header.u-text-center', [m$1('.w-container', [m$1('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h$1.selfOrEmpty(project().name)), m$1('h2.fontsize-base.lineheight-looser[itemprop="author"]', project().user ? ['por ', project().user.name] : '')])]), m$1('.w-section.project-main', [m$1('.w-container', [m$1('.w-row.project-main', [m$1('.w-col.w-col-8.project-highlight', m$1.component(projectHighlight, {
              project: project
          })), m$1('.w-col.w-col-4', m$1.component(projectSidebar, {
              project: project,
              userDetails: args.userDetails
          }))])])])]);
      }
  };

  describe('ProjectHeader', function () {
      var $output = void 0,
          projectDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m$1.prop(ProjectDetailsMockery()[0]);
              var component = m$1.component(projectHeader, {
                  project: projectDetail,
                  userDetails: m$1.prop([])
              }),
                  view = component.view(null, {
                  project: projectDetail,
                  userDetails: m$1.prop([])
              });
              $output = mq(view);
          });

          it('should a project header', function () {
              expect($output.find('#project-header').length).toEqual(1);
              expect($output.contains(projectDetail().name)).toEqual(true);
          });

          it('should render project-highlight / project-sidebar component area', function () {
              expect($output.find('.project-highlight').length).toEqual(1);
              expect($output.find('#project-sidebar').length).toEqual(1);
          });
      });
  });

  describe('ProjectHighlight', function () {
      var $output = void 0,
          projectDetail = void 0;

      it('when project video is not filled should render image', function () {
          projectDetail = m$1.prop(_.extend({}, ProjectDetailsMockery()[0], {
              original_image: 'original_image',
              video_embed_url: null
          }));
          var component = m$1.component(projectHighlight, {
              project: projectDetail
          }),
              view = component.view(component.controller(), {
              project: projectDetail
          });
          $output = mq(view);

          expect($output.find('.project-image').length).toEqual(1);
          expect($output.find('iframe.embedly-embed').length).toEqual(0);
      });

      describe('view', function () {
          beforeAll(function () {
              spyOn(m$1, 'component').and.callThrough();
              projectDetail = m$1.prop(ProjectDetailsMockery()[0]);
              $output = mq(projectHighlight, {
                  project: projectDetail
              });
          });

          it('should render project video, headline, category and address info', function () {
              expect($output.find('iframe.embedly-embed').length).toEqual(1);
              expect($output.find('span.fa.fa-map-marker').length).toEqual(1);
              expect($output.contains(projectDetail().address.city)).toEqual(true);
          });

          it('should render project share box when click on share', function () {
              $output.click('#share-box');
              $output.redraw();
              $output.should.have('.pop-share');
          });
      });
  });

  describe('ProjectMode', function () {
      var project = void 0,
          component = void 0,
          view = void 0,
          $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              project = m$1.prop(ProjectMockery()[0]);
          });

          it('should render the project mode', function () {
              component = m$1.component(projectMode, {
                  project: project
              });
              $output = mq(component);
              expect($output.find('.w-row').length).toEqual(1);
          });

          it('should render the project mode when goal is null', function () {
              component = m$1.component(projectMode, {
                  project: m$1.prop(_.extend({}, project, { goal: null }))
              });
              $output = mq(component);
              expect($output.find('.w-row').length).toEqual(1);
          });
      });
  });

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

          return m$1('.project-posts.w-section', [m$1('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _$1.isEmpty(list.collection()) ? m$1('.w-hidden-small.w-hidden-tiny', [m$1('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '' : '', m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4'), m$1('.w-col.w-col-4', [m$1('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.id + '/edit#posts\']', 'Escrever novidade')]), m$1('.w-col.w-col-4')])] : '', _$1.map(list.collection(), function (post) {
              return m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10', [m$1('.post', [m$1('.u-marginbottom-60 .w-clearfix', [m$1('.fontsize-small.fontcolor-secondary.u-text-center', h$1.momentify(post.created_at)), m$1('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title), !_$1.isEmpty(post.comment_html) ? m$1('.fontsize-base', m$1.trust(post.comment_html)) : m$1('.fontsize-base', 'Post exclusivo para apoiadores.')]), m$1('.divider.u-marginbottom-60')])]), m$1('.w-col.w-col-1')]);
          }), m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? 'Nenhuma novidade.' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h$1.loader()])])])]);
      }
  };

  describe('ProjectPosts', function () {
      var $output = void 0,
          projectPostDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              spyOn(m$1, 'component').and.callThrough();
              projectPostDetail = ProjectPostDetailsMockery()[0];
              var project = m$1.prop({ id: 1231 });
              var component = m$1.component(projectPosts, {
                  project: project
              }),
                  view = component.view(component.controller({
                  project: project
              }));

              $output = mq(view);
          });

          it('should render project post list', function () {
              expect($output.find('.post').length).toEqual(1);
              expect($output.contains(projectPostDetail.title)).toEqual(true);
          });
      });
  });

  var projectReminderCount = {
      view: function view(ctrl, args) {
          var project = args.resource;
          return m$1('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m$1('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), m$1('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), m$1('.fontsize-jumbo', project.reminder_count)]);
      }
  };

  describe('ProjectReminderCount', function () {
      var $output = void 0,
          projectDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m$1.prop(ProjectDetailsMockery()[0]);
              var component = m$1.component(projectReminderCount, {
                  resource: projectDetail
              }),
                  view = component.view(null, {
                  resource: projectDetail
              });
              $output = mq(view);
          });

          it('should render reminder total count', function () {
              expect($output.find('#project-reminder-count').length).toEqual(1);
          });
      });
  });

  describe('ProjectRewardList', function () {
      var generateContextByNewState = void 0;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  spyOn(m$1, 'component').and.callThrough();
                  var rewardDetail = RewardDetailsMockery(newState),
                      component = m$1.component(projectRewardList, {
                      project: m$1.prop({
                          id: 1231
                      }),
                      rewardDetails: m$1.prop(rewardDetail)
                  });

                  return {
                      output: mq(component.view()),
                      rewardDetail: rewardDetail[0]
                  };
              };
          });

          it('should render card-gone when reward sould out', function () {
              var _generateContextByNew = generateContextByNewState({
                  maximum_contributions: 4,
                  paid_count: 4
              });

              var output = _generateContextByNew.output;
              var rewardDetail = _generateContextByNew.rewardDetail;


              expect(output.find('.card-gone').length).toEqual(1);
              expect(output.contains('Esgotada')).toEqual(true);
          });

          it('should render card-reward when reward is not sould out', function () {
              var _generateContextByNew2 = generateContextByNewState({
                  maximum_contributions: null
              });

              var output = _generateContextByNew2.output;
              var rewardDetail = _generateContextByNew2.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Esgotada')).toEqual(false);
          });

          it('should render card-reward stats when reward is limited', function () {
              var _generateContextByNew3 = generateContextByNewState({
                  maximum_contributions: 10,
                  paid_count: 2,
                  waiting_payment_count: 5
              });

              var output = _generateContextByNew3.output;
              var rewardDetail = _generateContextByNew3.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Limitada')).toEqual(true);
              expect(output.contains('(3 de 10 disponíveis)')).toEqual(true);
              expect(output.contains('2 apoios')).toEqual(true);
              expect(output.contains('5 apoios em prazo de confirmação')).toEqual(true);
          });

          it('should render card-reward details', function () {
              var _generateContextByNew4 = generateContextByNewState({
                  minimum_value: 20
              });

              var output = _generateContextByNew4.output;
              var rewardDetail = _generateContextByNew4.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Para R$ 20 ou mais')).toEqual(true);
              expect(output.contains('Estimativa de Entrega:')).toEqual(true);
              expect(output.contains(window.c.h.momentify(rewardDetail.deliver_at, 'MMM/YYYY'))).toEqual(true);
              expect(output.contains(rewardDetail.description)).toEqual(true);
          });
      });
  });

  var projectRow = {
      view: function view(ctrl, args) {
          var collection = args.collection,
              title = args.title || collection.title,
              ref = args.ref,
              wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

          if (collection.loader() || collection.collection().length > 0) {
              return m$1(wrapper, [m$1('.w-container', [!_$1.isUndefined(collection.title) || !_$1.isUndefined(collection.hash) ? m$1('.w-row.u-marginbottom-30', [m$1('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-large.lineheight-looser', title)]), m$1('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m$1('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.loader() ? h$1.loader() : m$1('.w-row', _$1.map(collection.collection(), function (project) {
                  return m$1.component(projectCard, {
                      project: project,
                      ref: ref
                  });
              }))])]);
          } else {
              return m$1('div');
          }
      }
  };

  describe('ProjectRow', function () {
      var $output;

      describe('view', function () {
          var collection = {
              title: 'test collection',
              hash: 'testhash',
              collection: m$1.prop([]),
              loader: m$1.prop(false)
          };

          describe('when we have a ref parameter', function () {
              it('should not render row', function () {
                  var _ProjectMockery = ProjectMockery();

                  var _ProjectMockery2 = babelHelpers.slicedToArray(_ProjectMockery, 1);

                  var project = _ProjectMockery2[0];

                  collection.collection([project]);
                  var component = m$1.component(projectRow),
                      view = component.view(null, {
                      collection: collection,
                      ref: 'ref_test'
                  });
                  $output = mq(view);
                  expect($output.find('.card-project a[href="/' + project.permalink + '?ref=ref_test"]').length).toEqual(3);
              });
          });

          describe('when collection is empty and loader true', function () {
              beforeAll(function () {
                  collection.collection([]);
                  collection.loader(true);
                  var component = m$1.component(projectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render loader', function () {
                  expect($output.find('img[alt="Loader"]').length).toEqual(1);
              });
          });

          describe('when collection is empty and loader false', function () {
              beforeAll(function () {
                  collection.collection([]);
                  collection.loader(false);
                  var component = m$1.component(projectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render nothing', function () {
                  expect($output.find('img[alt="Loader"]').length).toEqual(0);
                  expect($output.find('.w-section').length).toEqual(0);
              });
          });

          describe('when collection has projects', function () {
              beforeAll(function () {
                  collection.collection(ProjectMockery());
                  var component = m$1.component(projectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render projects in row', function () {
                  expect($output.find('.w-section').length).toEqual(1);
              });
          });
      });
  });

  describe('ProjectShareBox', function () {
      var $output = void 0,
          projectDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m$1.prop(ProjectDetailsMockery()[0]);
              var args = {
                  project: projectDetail,
                  displayShareBox: {
                      toggle: jasmine.any(Function)
                  }
              },
                  component = m$1.component(projectShareBox, args),
                  view = component.view(component.controller(), args);
              $output = mq(ProjectShareBox, args);
          });

          it('should render project project share pop', function () {
              $output.should.have('.pop-share');
              $output.should.have('.w-widget-facebook');
              $output.should.have('.w-widget-twitter');
              $output.should.have('.widget-embed');
          });

          it('should open embed box when click on embed', function () {
              $output.click('a.widget-embed');
              $output.should.have('.embed-expanded');
          });
      });
  });

  describe('ProjectSidebar', function () {
      var generateContextByNewState = void 0;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  spyOn(m$1, 'component').and.callThrough();
                  var projectDetail = m$1.prop(_.extend({}, ProjectDetailsMockery()[0], newState)),
                      component = m$1.component(projectSidebar, {
                      project: projectDetail,
                      userDetails: m$1.prop([])
                  }),
                      ctrl = component.controller({
                      project: projectDetail,
                      userDetails: m$1.prop([])
                  }),
                      view = component.view(component.controller(), {
                      project: projectDetail,
                      userDetails: m$1.prop([])
                  });

                  return {
                      output: mq(view),
                      ctrl: ctrl,
                      projectDetail: projectDetail
                  };
              };
          });

          it('should render project stats', function () {
              var _generateContextByNew = generateContextByNewState({
                  state: 'successful'
              });

              var output = _generateContextByNew.output;
              var projectDetail = _generateContextByNew.projectDetail;


              expect(output.find('#project-sidebar.aside').length).toEqual(1);
              expect(output.find('.card-success').length).toEqual(1);
          });

          it('should render a all or nothing badge when is aon', function () {
              var _generateContextByNew2 = generateContextByNewState({
                  mode: 'aon'
              });

              var output = _generateContextByNew2.output;
              var projectDetail = _generateContextByNew2.projectDetail;


              expect(output.find('#aon').length).toEqual(1);
          });

          it('should render a flex badge when project mode is flexible', function () {
              var _generateContextByNew3 = generateContextByNewState({
                  mode: 'flex'
              });

              var output = _generateContextByNew3.output;
              var projectDetail = _generateContextByNew3.projectDetail;


              expect(output.find('#flex').length).toEqual(1);
          });

          describe('reminder', function () {
              it('should render reminder when project is open_for_contributions and user signed in and is in_reminder', function () {
                  var _generateContextByNew4 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: true,
                      in_reminder: true
                  });

                  var output = _generateContextByNew4.output;
                  var projectDetail = _generateContextByNew4.projectDetail;


                  expect(output.contains('Lembrete ativo')).toEqual(true);
                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder', function () {
                  var _generateContextByNew5 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: true,
                      in_reminder: false
                  });

                  var output = _generateContextByNew5.output;
                  var projectDetail = _generateContextByNew5.projectDetail;


                  expect(output.contains('Lembrar-me')).toEqual(true);
                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should render reminder when project is open_for_contributions and user not signed in', function () {
                  var _generateContextByNew6 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: false
                  });

                  var output = _generateContextByNew6.output;
                  var projectDetail = _generateContextByNew6.projectDetail;


                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should not render reminder when project is not open_for_contributions and user signed in', function () {
                  var _generateContextByNew7 = generateContextByNewState({
                      open_for_contributions: false,
                      user_signed_in: true
                  });

                  var output = _generateContextByNew7.output;
                  var projectDetail = _generateContextByNew7.projectDetail;


                  expect(output.find('#project-reminder').length).toEqual(0);
              });
          });
      });
  });

  var projectTabs = {
      controller: function controller(args) {
          var isFixed = m$1.prop(false),
              originalPosition = m$1.prop(-1);

          var fixOnScroll = function fixOnScroll(el) {
              return function () {
                  var viewportOffset = el.getBoundingClientRect();

                  if (window.scrollY <= originalPosition()) {
                      originalPosition(-1);
                      isFixed(false);
                      m$1.redraw();
                  }

                  if (viewportOffset.top < 0 || window.scrollY > originalPosition() && originalPosition() > 0) {
                      if (!isFixed()) {
                          originalPosition(window.scrollY);
                          isFixed(true);
                          m$1.redraw();
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

          return m$1('nav-wrapper', project() ? [m$1(mainClass, {
              config: ctrl.navDisplay
          }, [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m$1('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h$1.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
              style: 'float: left;'
          }, 'Recompensas') : m$1('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h$1.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
              style: 'float: left;'
          }, 'Valores Sugeridos'), m$1('a[id="about-link"][class="dashboard-nav-link mf ' + (h$1.hashMatch('#about') || h$1.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
              style: 'float: left;'
          }, 'Sobre'), m$1('a[id="posts-link"][class="dashboard-nav-link mf ' + (h$1.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
              style: 'float: left;'
          }, ['Novidades ', m$1('span.badge', project() ? project().posts_count : '')]), m$1('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h$1.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
              style: 'float: left;'
          }, ['Apoios ', m$1('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributions : '-')]), m$1('a[id="comments-link"][class="dashboard-nav-link mf ' + (h$1.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
              style: 'float: left;'
          }, ['Comentários ', project() ? m$1('fb:comments-count[href="http://www.catarse.me/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m$1.trust('&nbsp;')) : '-'])]), project() ? m$1('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [m$1('.w-row.project-nav-back-button', [m$1('.w-col.w-col-6.w-col-medium-8', [m$1('a.w-button.btn[href="/projects/' + project().id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m$1('.w-col.w-col-6.w-col-medium-4', [m$1.component(projectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? m$1('.w-section.project-nav') : ''] : '');
      }
  };

  describe('ProjectTabs', function () {
      var $output = void 0,
          projectDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m$1.prop(ProjectDetailsMockery()[0]);
              var component = m$1.component(projectTabs, {
                  project: m$1.prop(projectDetail),
                  rewardDetails: m$1.prop([])
              });
              $output = mq(component);
          });

          it('should render project-tabs', function () {
              expect($output.find('a.dashboard-nav-link').length).toEqual(5);
              expect($output.find('a#about-link').length).toEqual(1);
          });

          it('should call hashMatch when click on some link', function () {
              var oldHash = window.location.hash;
              window.location.hash = 'posts';
              $output.redraw();
              $output.should.have('a#posts-link.selected');
              window.location.hash = oldHash;
          });
      });
  });

  var projectVM = function projectVM(project_id, project_user_id) {
      var vm = postgrest.filtersVM({
          project_id: 'eq'
      }),
          idVM = h$1.idVM,
          projectDetails = m$1.prop([]),
          userDetails = m$1.prop([]),
          rewardDetails = m$1.prop([]);

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
          return project().is_owner_or_admin ? m$1.component(projectDashboardMenu, { project: project }) : '';
      }
  };

  describe('ProjectsDashboard', function () {
      var $output = void 0,
          projectDetail = void 0;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              var component = m$1.component(projectsDashboard, {
                  project_id: projectDetail.project_id,
                  project_user_id: projectDetail.user.id
              });
              $output = mq(component);
          });

          it('should render project about and reward list', function () {
              expect($output.has('.project-nav-wrapper')).toBeTrue();
          });
      });
  });

  var contributionListVM = postgrest.paginationVM(models.contributionDetail, 'id.desc', { 'Prefer': 'count=exact' });

  var vm = postgrest$1.filtersVM({
      full_text_index: '@@',
      state: 'eq',
      gateway: 'eq',
      value: 'between',
      created_at: 'between'
  });
  var paramToString = function paramToString(p) {
      return (p || '').toString().trim();
  };
  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({
      id: 'desc'
  });

  vm.created_at.lte.toFilter = function () {
      var filter = paramToString(vm.created_at.lte());
      return filter && h$1.momentFromString(filter).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function () {
      var filter = paramToString(vm.created_at.gte());
      return filter && h$1.momentFromString(filter).format();
  };

  vm.full_text_index.toFilter = function () {
      var filter = paramToString(vm.full_text_index());
      return filter && replaceDiacritics(filter) || undefined;
  };

  var adminProject = {
      view: function view(ctrl, args) {
          var project = args.item;
          return m$1('.w-row.admin-project', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m$1('.fontsize-smallest.fontweight-semibold', project.project_state), m$1('.fontsize-smallest.fontcolor-secondary', h$1.momentify(project.project_online_date) + ' a ' + h$1.momentify(project.project_expires_at))])]);
      }
  };

  var adminContribution = {
      view: function view(ctrl, args) {
          var contribution = args.item;
          return m$1('.w-row.admin-contribution', [m$1('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), m$1('.fontsize-smallest.fontcolor-secondary', h$1.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m$1('.fontsize-smallest', ['ID do Gateway: ', m$1('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
      }
  };

  var adminContributionUser = {
      view: function view(ctrl, args) {
          var item = args.item,
              user = {
              profile_img_thumbnail: item.user_profile_img,
              id: item.user_id,
              name: item.user_name,
              email: item.email
          };

          var additionalData = m$1('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
          return m$1.component(adminUser, { item: user, additional_data: additionalData });
      }
  };

  var adminContributionItem = {
      controller: function controller() {
          return {
              itemBuilder: [{
                  component: adminContributionUser,
                  wrapperClass: '.w-col.w-col-4'
              }, {
                  component: adminProject,
                  wrapperClass: '.w-col.w-col-4'
              }, {
                  component: adminContribution,
                  wrapperClass: '.w-col.w-col-2'
              }, {
                  component: paymentStatus,
                  wrapperClass: '.w-col.w-col-2'
              }]
          };
      },
      view: function view(ctrl, args) {
          return m$1('.w-row', _.map(ctrl.itemBuilder, function (panel) {
              return m$1(panel.wrapperClass, [m$1.component(panel.component, {
                  item: args.item,
                  key: args.key
              })]);
          }));
      }
  };

  var adminContributionDetail = {
      controller: function controller(args) {
          var l = void 0;
          var loadReward = function loadReward() {
              var model = models.rewardDetail,
                  reward_id = args.item.reward_id,
                  opts = model.getRowOptions(h$1.idVM.id(reward_id).parameters()),
                  reward = m$1.prop({});

              l = postgrest.loaderWithToken(opts);

              if (reward_id) {
                  l.load().then(_$1.compose(reward, _$1.first));
              }

              return reward;
          };

          return {
              reward: loadReward(),
              actions: {
                  transfer: {
                      property: 'user_id',
                      updateKey: 'id',
                      callToAction: 'Transferir',
                      innerLabel: 'Id do novo apoiador:',
                      outerLabel: 'Transferir Apoio',
                      placeholder: 'ex: 129908',
                      successMessage: 'Apoio transferido com sucesso!',
                      errorMessage: 'O apoio não foi transferido!',
                      model: models.contributionDetail
                  },
                  reward: {
                      getKey: 'project_id',
                      updateKey: 'contribution_id',
                      selectKey: 'reward_id',
                      radios: 'rewards',
                      callToAction: 'Alterar Recompensa',
                      outerLabel: 'Recompensa',
                      getModel: models.rewardDetail,
                      updateModel: models.contributionDetail,
                      selectedItem: loadReward(),
                      validate: function validate(rewards, newRewardID) {
                          var reward = _$1.findWhere(rewards, { id: newRewardID });
                          return args.item.value >= reward.minimum_value ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
                      }
                  },
                  refund: {
                      updateKey: 'id',
                      callToAction: 'Reembolso direto',
                      innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                      outerLabel: 'Reembolsar Apoio',
                      model: models.contributionDetail
                  },
                  remove: {
                      property: 'state',
                      updateKey: 'id',
                      callToAction: 'Apagar',
                      innerLabel: 'Tem certeza que deseja apagar esse apoio?',
                      outerLabel: 'Apagar Apoio',
                      forceValue: 'deleted',
                      successMessage: 'Apoio removido com sucesso!',
                      errorMessage: 'O apoio não foi removido!',
                      model: models.contributionDetail
                  }
              },
              l: l
          };
      },
      view: function view(ctrl, args) {
          var actions = ctrl.actions,
              item = args.item,
              reward = ctrl.reward;

          var addOptions = function addOptions(builder, id) {
              return _$1.extend({}, builder, {
                  requestOptions: {
                      url: '/admin/contributions/' + id + '/gateway_refund',
                      method: 'PUT'
                  }
              });
          };

          return m$1('#admin-contribution-detail-box', [m$1('.divider.u-margintop-20.u-marginbottom-20'), m$1('.w-row.u-marginbottom-30', [m$1.component(adminInputAction, {
              data: actions.transfer,
              item: item
          }), ctrl.l() ? h$1.loader : m$1.component(adminRadioAction, {
              data: actions.reward,
              item: reward,
              getKeyValue: item.project_id,
              updateKeyValue: item.contribution_id
          }), m$1.component(adminExternalAction, {
              data: addOptions(actions.refund, item.id),
              item: item
          }), m$1.component(adminInputAction, {
              data: actions.remove,
              item: item
          })]), m$1('.w-row.card.card-terciary.u-radius', [m$1.component(adminTransaction, {
              contribution: item
          }), m$1.component(adminTransactionHistory, {
              contribution: item
          }), ctrl.l() ? h$1.loader : m$1.component(adminReward, {
              reward: reward,
              key: item.key
          })])]);
      }
  };

  var adminConstributions = {
      controller: function controller() {
          var listVM = contributionListVM,
              filterVM = vm,
              error = m$1.prop(''),
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
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: 'paid',
                      option: 'paid'
                  }, {
                      value: 'refused',
                      option: 'refused'
                  }, {
                      value: 'pending',
                      option: 'pending'
                  }, {
                      value: 'pending_refund',
                      option: 'pending_refund'
                  }, {
                      value: 'refunded',
                      option: 'refunded'
                  }, {
                      value: 'chargeback',
                      option: 'chargeback'
                  }, {
                      value: 'deleted',
                      option: 'deleted'
                  }]
              }
          }, { //gateway
              component: 'FilterDropdown',
              data: {
                  label: 'gateway',
                  name: 'gateway',
                  vm: filterVM.gateway,
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: 'Pagarme',
                      option: 'Pagarme'
                  }, {
                      value: 'MoIP',
                      option: 'MoIP'
                  }, {
                      value: 'PayPal',
                      option: 'PayPal'
                  }, {
                      value: 'Credits',
                      option: 'Créditos'
                  }]
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
              error(false);
              listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                  error(serverError.message);
              });
              return false;
          };

          return {
              filterVM: filterVM,
              filterBuilder: filterBuilder,
              listVM: {
                  list: listVM,
                  error: error
              },
              data: {
                  label: 'Apoios'
              },
              submit: submit
          };
      },
      view: function view(ctrl) {
          return [m$1.component(adminFilter, {
              form: ctrl.filterVM.formDescriber,
              filterBuilder: ctrl.filterBuilder,
              submit: ctrl.submit
          }), m$1.component(adminList, {
              vm: ctrl.listVM,
              listItem: adminContributionItem,
              listDetail: adminContributionDetail
          })];
      }
  };

  describe('adminContributions', function () {
    var ctrl = void 0,
        $output = void 0;

    beforeAll(function () {
      ctrl = m.component(adminConstributions).controller();
    });

    describe('controller', function () {
      it('should instantiate a list view-model', function () {
        expect(ctrl.listVM).toBeDefined();
      });

      it('should instantiate a filter view-model', function () {
        expect(ctrl.filterVM).toBeDefined();
      });
    });

    describe('view', function () {
      beforeAll(function () {
        $output = mq(adminConstributions);
      });

      it('should render AdminFilter nested component', function () {
        expect($output.has('#admin-contributions-filter')).toBeTrue();
      });
      it('should render AdminList nested component', function () {
        expect($output.has('#admin-contributions-list')).toBeTrue();
      });
    });
  });

  var userListVM = postgrest.paginationVM(models.user, 'id.desc', { 'Prefer': 'count=exact' });

  var vm$1 = postgrest.filtersVM({
      full_text_index: '@@',
      deactivated_at: 'is.null'
  });
  var paramToString$1 = function paramToString(p) {
      return (p || '').toString().trim();
  };
  // Set default values
  vm$1.deactivated_at(null).order({
      id: 'desc'
  });

  vm$1.deactivated_at.toFilter = function () {
      var filter = JSON.parse(vm$1.deactivated_at());
      return filter;
  };

  vm$1.full_text_index.toFilter = function () {
      var filter = paramToString$1(vm$1.full_text_index());
      return filter && replaceDiacritics(filter) || undefined;
  };

  var adminUserItem = {
      view: function view(ctrl, args) {
          return m$1('.w-row', [m$1('.w-col.w-col-4', [m$1.component(adminUser, args)])]);
      }
  };

  var adminResetPassword = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              key = builder.property,
              data = {},
              item = args.item;

          builder.requestOptions.config = function (xhr) {
              if (h$1.authenticityToken()) {
                  xhr.setRequestHeader('X-CSRF-Token', h$1.authenticityToken());
              }
          };

          var l = m$1.prop(false),
              load = function load() {
              return m$1.request(_$1.extend({}, { data: data }, builder.requestOptions));
          },
              newPassword = m$1.prop(''),
              error_message = m$1.prop('');

          var requestError = function requestError(err) {
              l(false);
              error_message(err.errors[0]);
              complete(true);
              error(true);
          };
          var updateItem = function updateItem(res) {
              l(false);
              _$1.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              l(true);
              data[key] = newPassword();
              load().then(updateItem, requestError);
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
              };
          };

          return {
              complete: complete,
              error: error,
              error_message: error_message,
              l: l,
              newPassword: newPassword,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), m$1('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
              onchange: m$1.withAttr('value', ctrl.newPassword),
              value: ctrl.newPassword()
          }), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Senha alterada com sucesso.')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', ctrl.error_message())])])]) : '']);
      }
  };

  var adminUserDetail = {
      controller: function controller() {
          return {
              actions: {
                  reset: {
                      property: 'password',
                      callToAction: 'Redefinir',
                      innerLabel: 'Nova senha de Usuário:',
                      outerLabel: 'Redefinir senha',
                      placeholder: 'ex: 123mud@r',
                      model: c.models.user
                  },
                  reactivate: {
                      property: 'deactivated_at',
                      updateKey: 'id',
                      callToAction: 'Reativar',
                      innerLabel: 'Tem certeza que deseja reativar esse usuário?',
                      successMessage: 'Usuário reativado com sucesso!',
                      errorMessage: 'O usuário não pôde ser reativado!',
                      outerLabel: 'Reativar usuário',
                      forceValue: null,
                      model: c.models.user
                  }
              }
          };
      },
      view: function view(ctrl, args) {
          var actions = ctrl.actions,
              item = args.item,
              details = args.details,
              addOptions = function addOptions(builder, id) {
              return _$1.extend({}, builder, {
                  requestOptions: {
                      url: '/users/' + id + '/new_password',
                      method: 'POST'
                  }
              });
          };

          return m$1('#admin-contribution-detail-box', [m$1('.divider.u-margintop-20.u-marginbottom-20'), m$1('.w-row.u-marginbottom-30', [m$1.component(adminResetPassword, {
              data: addOptions(actions.reset, item.id),
              item: item
          }), item.deactivated_at ? m$1.component(adminInputAction, { data: actions.reactivate, item: item }) : '']), m$1('.w-row.card.card-terciary.u-radius', [m$1.component(adminNotificationHistory, {
              user: item
          })])]);
      }
  };

  var adminUsers = {
      controller: function controller() {
          var listVM = userListVM,
              filterVM = vm$1,
              error = m$1.prop(''),
              itemBuilder = [{
              component: 'AdminUser',
              wrapperClass: '.w-col.w-col-4'
          }],
              filterBuilder = [{ //name
              component: 'FilterMain',
              data: {
                  vm: filterVM.full_text_index,
                  placeholder: 'Busque por nome, e-mail, Ids do usuário...'
              }
          }, { //status
              component: 'FilterDropdown',
              data: {
                  label: 'Com o estado',
                  index: 'status',
                  name: 'deactivated_at',
                  vm: filterVM.deactivated_at,
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: null,
                      option: 'ativo'
                  }, {
                      value: !null,
                      option: 'desativado'
                  }]
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
              listVM: {
                  list: listVM,
                  error: error
              },
              submit: submit
          };
      },
      view: function view(ctrl) {
          var label = 'Usuários';

          return [m$1.component(adminFilter, {
              form: ctrl.filterVM.formDescriber,
              filterBuilder: ctrl.filterBuilder,
              label: label,
              submit: ctrl.submit
          }), m$1.component(adminList, {
              vm: ctrl.listVM,
              label: label,
              listItem: adminUserItem,
              listDetail: adminUserDetail
          })];
      }
  };

  describe('adminUsers', function () {
    var ctrl = void 0,
        $output = void 0;

    beforeAll(function () {
      ctrl = m.component(adminUsers).controller();
    });

    describe('controller', function () {
      it('should instantiate a list view-model', function () {
        expect(ctrl.listVM).toBeDefined();
      });

      it('should instantiate a filter view-model', function () {
        expect(ctrl.filterVM).toBeDefined();
      });
    });

    describe('view', function () {
      beforeAll(function () {
        $output = mq(adminUsers);
      });

      it('should render AdminFilter nested component', function () {
        expect($output.has('#admin-contributions-filter')).toBeTrue();
      });
      it('should render AdminList nested component', function () {
        expect($output.has('#admin-contributions-list')).toBeTrue();
      });
    });
  });

  var liveStatistics = {
      controller: function controller() {
          var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

          var pageStatistics = m$1.prop([]),
              notificationData = m$1.prop({});

          models.statistic.getRow().then(pageStatistics);
          // args.socket is a socket provided by socket.io
          // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
          if (args.socket && _$1.isFunction(args.socket.on)) {
              args.socket.on('new_paid_contributions', function (msg) {
                  notificationData(JSON.parse(msg.payload));
                  models.statistic.getRow().then(pageStatistics);
                  m$1.redraw();
              });
          }

          return {
              pageStatistics: pageStatistics,
              notificationData: notificationData
          };
      },
      view: function view(ctrl) {
          var data = ctrl.notificationData();

          return m$1('.w-section.bg-stats.section.min-height-100', [m$1('.w-container.u-text-center', _$1.map(ctrl.pageStatistics(), function (stat) {
              return [m$1('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m$1('.fontcolor-negative.u-marginbottom-40', [m$1('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h$1.formatNumber(stat.total_contributed, 2, 3)), m$1('.fontsize-large', 'Doados para projetos publicados por aqui')]), m$1('.fontcolor-negative.u-marginbottom-60', [m$1('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m$1('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
          })), !_$1.isEmpty(data) ? m$1('.w-container', [m$1('div', [m$1('.card.u-radius.u-marginbottom-60.medium', [m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4', [m$1('img.thumb.u-round[src="' + h$1.useAvatarOrDefault(data.user_image) + '"]')]), m$1('.w-col.w-col-8.w-col-small-8', [m$1('.fontsize-large.lineheight-tight', data.user_name)])])]), m$1('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m$1('div', 'acabou de apoiar o')]), m$1('.w-col.w-col-4', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4', [m$1('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m$1('.w-col.w-col-8.w-col-small-8', [m$1('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m$1('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m$1('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m$1('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
      }
  };

  describe('pages.LiveStatistics', function () {
    var $output = void 0,
        statistic = void 0;

    describe('view', function () {
      beforeAll(function () {
        statistic = StatisticMockery()[0];
        var component = m.component(liveStatistics);
        $output = mq(component.view(component.controller(), {}));
      });

      it('should render statistics', function () {
        expect($output.contains(h$1.formatNumber(statistic.total_contributed, 2, 3))).toEqual(true);
        expect($output.contains(statistic.total_contributors)).toEqual(true);
      });
    });
  });

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

          return m$1('#search.w-container.w-hidden-main.w-hidden-medium', [m$1('.w-row', [m$1('.w-col.w-col-10.u-marginbottom-20', [m$1('.w-form', [m$1('form#email-form', { action: action, method: method }, [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m$1('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')]), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m$1('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [m$1('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
      }
  };

  var projectsExplore = {
      controller: function controller() {
          var filters = postgrest$1.filtersVM,
              projectFiltersVM$$ = projectFiltersVM(),
              filtersMap = projectFiltersVM$$.filters,
              defaultFilter = h$1.paramByName('filter') || 'score',
              fallbackFilter = 'all',
              currentFilter = m$1.prop(filtersMap[defaultFilter]),
              changeFilter = function changeFilter(newFilter) {
              currentFilter(filtersMap[newFilter]);
              loadRoute();
          },
              resetContextFilter = function resetContextFilter() {
              currentFilter(filtersMap[defaultFilter]);
              projectFiltersVM$$.setContextFilters(['score', 'finished', 'all']);
          },
              isSearch = m$1.prop(false),
              categoryCollection = m$1.prop([]),
              categoryId = m$1.prop(),
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
          projects = m$1.prop({ collection: m$1.prop([]), isLoading: function isLoading() {
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
                  search = h$1.paramByName('pg_search'),
                  searchProjects = function searchProjects() {
                  var l = postgrest$1.loaderWithToken(models.projectSearch.postOptions({ query: search })),
                      page = { // We build an object with the same interface as paginationVM
                      collection: m$1.prop([]),
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
              title = m$1.prop(),
              toggleCategories = h$1.toggleProp(false, true);

          window.addEventListener('hashchange', function () {
              resetContextFilter();
              loadRoute();
              m$1.redraw();
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
              projectFiltersVM: projectFiltersVM$$,
              toggleCategories: toggleCategories,
              isSearch: isSearch
          };
      },
      view: function view(ctrl, args) {
          if (!ctrl.projects().isLoading() && _$1.isEmpty(ctrl.projects().collection()) && !ctrl.isSearch()) {
              ctrl.projectFiltersVM.removeContextFilter(ctrl.currentFilter());
              ctrl.changeFilter(ctrl.fallbackFilter);
          }

          return [m$1('.w-section.hero-search', [m$1.component(search), m$1('.w-container.u-marginbottom-10', [m$1('.u-text-center.u-marginbottom-40', [m$1('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                  return ctrl.toggleCategories.toggle();
              } }, ['Explore projetos incríveis ', m$1('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m$1('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m$1('.w-row.u-marginbottom-30', [_$1.map(ctrl.categories(), function (category) {
              return m$1.component(categoryButton, { category: category });
          })])])])]), m$1('.w-section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [m$1('.fontsize-larger', ctrl.title())]), m$1('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? m$1('select.w-select.text-field.positive', { onchange: m$1.withAttr('value', ctrl.changeFilter) }, _$1.map(ctrl.projectFiltersVM.getContextFilters(), function (pageFilter, idx) {
              var projects = ctrl.projects(),
                  isSelected = ctrl.currentFilter() == pageFilter;

              return m$1('option[value="' + pageFilter.keyName + '"]', { selected: isSelected }, pageFilter.nicename);
          })) : '')])])]), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-row', _$1.map(ctrl.projects().collection(), function (project, idx) {
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

              return m$1.component(projectCard, { project: project, ref: ref, type: cardType });
          })), ctrl.projects().isLoading() ? h$1.loader() : _$1.isEmpty(ctrl.projects().collection()) ? m$1('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : ''])])]), m$1('.w-section.u-marginbottom-80', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _$1.isEmpty(ctrl.projects().collection()) ? '' : m$1('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                  ctrl.projects().nextPage();return false;
              } }, 'Carregar mais')])])])]), m$1('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [m$1('.w-container.u-text-center', [m$1('img.u-marginbottom-20.icon-hero', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png' }), m$1('h2.fontsize-larger.u-marginbottom-60', 'Lance sua campanha no Catarse!'), m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Aprenda como')])])])])];
      }
  };

  describe('ProjectsExplore', function () {
      var $output = void 0,
          project = void 0,
          component = void 0;

      beforeAll(function () {
          window.location.hash = '#by_category_id/1';

          component = m.component(projectsExplore);
          $output = mq(component);
      });

      it('should render search container', function () {
          $output.should.have('.hero-search');
      });
  });

  var projectComments = {
      controller: function controller() {
          var loadComments = function loadComments(el, isInitialized) {
              return function (el, isInitialized) {
                  if (isInitialized) {
                      return;
                  }
                  h$1.fbParse();
              };
          };

          return { loadComments: loadComments };
      },
      view: function view(ctrl, args) {
          var project = args.project();
          return m$1('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() });
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
                  '#rewards': m$1('.w-col.w-col-12', m$1.component(projectRewardList, _$1.extend({}, {
                      rewardDetails: args.rewardDetails
                  }, c_opts))),
                  '#contribution_suggestions': m$1.component(projectSuggestedContributions, c_opts),
                  '#contributions': m$1.component(projectContributions, c_opts),
                  '#about': m$1.component(projectAbout, _$1.extend({}, {
                      rewardDetails: args.rewardDetails
                  }, c_opts)),
                  '#comments': m$1.component(projectComments, c_opts),
                  '#posts': m$1.component(projectPosts, c_opts)
              };

              if (_$1.isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                  return tabs['#about'];
              }

              return tabs[hash];
          };

          h$1.redrawHashChange();

          return {
              displayTabContent: displayTabContent
          };
      },
      view: function view(ctrl, args) {
          return m$1('section.section[itemtype="http://schema.org/CreativeWork"]', [m$1('.w-container', [m$1('.w-row', args.project() ? ctrl.displayTabContent() : '')])]);
      }
  };

  var projectsShow = {
      controller: function controller(args) {
          return projectVM(args.project_id, args.project_user_id);
      },
      view: function view(ctrl) {
          var project = ctrl.projectDetails;

          return m$1('.project-show', [m$1.component(projectHeader, {
              project: project,
              userDetails: ctrl.userDetails
          }), m$1.component(projectTabs, {
              project: project,
              rewardDetails: ctrl.rewardDetails
          }), m$1.component(projectMain, {
              project: project,
              rewardDetails: ctrl.rewardDetails
          }), project() && project().is_owner_or_admin ? m$1.component(projectDashboardMenu, {
              project: project
          }) : '']);
      }
  };

  describe('ProjectsShow', function () {
    var $output = void 0,
        projectDetail = void 0;

    beforeAll(function () {
      window.location.hash = '';
      projectDetail = ProjectDetailsMockery()[0];
      var component = m.component(projectsShow, { project_id: 123, project_user_id: 1231 }),
          view = component.view(component.controller());
      $output = mq(view);
    });

    it('should render project some details', function () {
      expect($output.contains(projectDetail.name)).toEqual(true);
      $output.should.have('#project-sidebar');
      $output.should.have('#project-header');
      $output.should.have('.project-highlight');
      $output.should.have('.project-nav');
      $output.should.have('#rewards');
    });
  });

  var I18nScope$3 = _$1.partial(h$1.i18nScope, 'users.balance');

  var userBalance = {
      controller: function controller(args) {
          args.balanceManager.load();

          return {
              userBalances: args.balanceManager.collection,
              displayModal: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var balance = _$1.first(ctrl.userBalances()),
              balanceRequestModalC = ['UserBalanceRequestModalContent', _$1.extend({}, { balance: balance }, args)];

          return m$1('.w-section.section.user-balance-section', [ctrl.displayModal() ? m$1.component(modalBox, {
              displayModal: ctrl.displayModal,
              content: balanceRequestModalC
          }) : '', m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [m$1('.fontsize-larger', [I18n.t('totals', I18nScope$3()), m$1('span.text-success', 'R$ ' + h$1.formatNumber(balance.amount, 2, 3))])]), m$1('.w-col.w-col-4', [m$1('a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ' + (balance.amount <= 0 ? 'btn-inactive' : '') + '"][href="js:void(0);"]', { onclick: balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);' }, I18n.t('withdraw_cta', I18nScope$3()))])])])]);
      }
  };

  var I18nScope$4 = _.partial(h$1.i18nScope, 'users.balance');

  var userBalanceTrasactionRow = {
      controller: function controller(args) {
          var expanded = h$1.toggleProp(false, true);

          if (args.index == 0) {
              expanded.toggle();
          }

          return {
              expanded: expanded
          };
      },
      view: function view(ctrl, args) {
          var item = args.item,
              createdAt = h$1.momentFromString(item.created_at, 'YYYY-MM-DD');

          return m$1('div[class=\'balance-card ' + (ctrl.expanded() ? 'card-detailed-open' : '') + '\']', m$1('.w-clearfix.card.card-clickable', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-tiny-2', [m$1('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')), m$1('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))]), m$1('.w-col.w-col-10.w-col-tiny-10', [m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('debit', I18nScope$4())), m$1.trust('&nbsp;'), m$1('span.fontsize-base.text-error', 'R$ ' + h$1.formatNumber(Math.abs(item.debit), 2, 3))])]), m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('credit', I18nScope$4())), m$1.trust('&nbsp;'), m$1('span.fontsize-base.text-success', 'R$ ' + h$1.formatNumber(item.credit, 2, 3))])]), m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('totals', I18nScope$4())), m$1.trust('&nbsp;'), m$1('span.fontsize-base', 'R$ ' + h$1.formatNumber(item.total_amount, 2, 3))])])])])]), m$1('a.w-inline-block.arrow-admin.' + (ctrl.expanded() ? 'arrow-admin-opened' : '') + '.fa.fa-chevron-down.fontcolor-secondary[href="js:(void(0));"]', { onclick: ctrl.expanded.toggle })]), ctrl.expanded() ? m$1('.card', _.map(item.source, function (transaction) {
              var pos = transaction.amount >= 0;

              return m$1('div', [m$1('.w-row.fontsize-small.u-marginbottom-10', [m$1('.w-col.w-col-2', [m$1('.text-' + (pos ? 'success' : 'error'), (pos ? '+' : '-') + ' R$ ' + h$1.formatNumber(Math.abs(transaction.amount), 2, 3))]), m$1('.w-col.w-col-10', [m$1('div', transaction.event_name + ' ' + transaction.origin_object.name)])]), m$1('.divider.u-marginbottom-10')]);
          })) : '');
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

          return m$1('.w-section.section.card-terciary.before-footer.balance-transactions-area', [m$1('.w-container', _$1.map(list.collection(), function (item, index) {
              return m$1.component(userBalanceTrasactionRow, { item: item, index: index });
          })), m$1('.container', [m$1('.w-row.u-margintop-40', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h$1.loader()])])])]);
      }
  };

  var userBalanceMain = {
      controller: function controller(args) {
          var userIdVM = postgrest$1.filtersVM({ user_id: 'eq' });

          userIdVM.user_id(args.user_id);

          // Handles with user balance request data
          var balanceManager = function () {
              var collection = m$1.prop([{ amount: 0, user_id: args.user_id }]),
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
              var collection = m$1.prop([]),
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
          return m$1('#balance-area', [m$1.component(userBalance, opts), m$1('.divider'), m$1.component(userBalanceTransactions, opts), m$1('.u-marginbottom-40'), m$1('.w-section.section.card-terciary.before-footer')]);
      }
  };

  describe('UsersBalanceMain', function () {
      var $output = void 0,
          component = void 0;

      beforeAll(function () {
          component = m.component(userBalanceMain, { user_id: 1 });
          $output = mq(component);
      });

      it('should render user balance area', function () {
          $output.should.have('.user-balance-section');
      });

      it('should render user balance transactions area', function () {
          $output.should.have('.balance-transactions-area');
      });
  });

  describe('Search', function () {
      var $outputaction = '/test',
          method = 'POST';

      describe('view', function () {
          beforeEach(function () {
              $output = mq(search.view({}, { action: action, method: method }));
          });

          it('should render the search form', function () {
              expect($output.find('form').length).toEqual(1);
              expect($output.find('input[type="text"]').length).toEqual(1);
              expect($output.find('button').length).toEqual(1);
          });
          it('should set the given action', function () {
              expect($output.find('form[action="' + action + '"]').length).toEqual(1);
          });
          it('should set the given method', function () {
              expect($output.find('form[method="' + method + '"]').length).toEqual(1);
          });
      });
  });

  var slider = {
      controller: function controller(args) {
          var interval = void 0;
          var selectedSlideIdx = m$1.prop(0),
              translationSize = m$1.prop(1600),
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
                  m$1.redraw();
              }, sliderTime);
          },
              resetSliderTimer = function resetSliderTimer() {
              clearInterval(interval);
              startSliderTimer();
          },
              config = function config(el, isInitialized, context) {
              if (!isInitialized) {
                  translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                  m$1.redraw();
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

          return m$1('.w-slider.' + wrapperClass, {
              config: ctrl.config
          }, [m$1('.fontsize-larger', args.title), m$1('.w-slider-mask', [_$1.map(args.slides, function (slide, idx) {
              var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                  translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

              return m$1('.slide.w-slide.' + slideClass, {
                  style: effectStyle(idx, translateStr) + ' ' + slide.customStyle
              }, [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-8.w-col-push-2', slide.content)])])]);
          }), m$1('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
              onclick: function onclick() {
                  return sliderClick(ctrl.decrementSlide);
              }
          }, [m$1('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')]), m$1('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
              onclick: function onclick() {
                  return sliderClick(ctrl.incrementSlide);
              }
          }, [m$1('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')]), m$1('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _$1(args.slides.length).times(function (idx) {
              return m$1('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                  onclick: function onclick() {
                      return sliderClick(ctrl.selectedSlideIdx, idx);
                  }
              });
          }))])]);
      }
  };

  describe('Slider', function () {
      var $output = void 0,
          title = 'TitleSample',
          defaultDocumentWidth = 1600,
          slides = [m('h1', 'teste'), m('h1', 'teste'), m('h1', 'teste'), m('h1', 'teste')];

      describe('view', function () {
          beforeEach(function () {
              $output = mq(slider, { title: title, slides: slides });
          });

          it('should render all the slides', function () {
              expect($output.find('.slide').length).toEqual(slides.length);
          });
          it('should render one bullet for each slide', function () {
              expect($output.find('.slide-bullet').length).toEqual(slides.length);
          });
          it('should move to next slide on slide next click', function () {
              $output.click('#slide-next');
              var firstSlide = $output.first('.slide');
              expect(firstSlide.attrs.style.indexOf('-' + defaultDocumentWidth + 'px')).toBeGreaterThan(-1);
          });
          it('should move to previous slide on slide prev click', function () {
              $output.click('#slide-next');
              $output.click('#slide-prev');
              var firstSlide = $output.first('.slide');
              expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);
          });
      });
  });

  var teamMembers = {
      controller: function controller() {
          var vm = {
              collection: m$1.prop([])
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
          return m$1('#team-members-static.w-section.section', [m$1('.w-container', [_$1.map(ctrl.vm.collection(), function (group) {
              return m$1('.w-row.u-text-center', [_$1.map(group, function (member) {
                  return m$1('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [m$1('a.alt-link[href="/users/' + member.id + '"]', [m$1('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m$1('.fontweight-semibold.fontsize-base', member.name)]), m$1('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')]);
              })]);
          })])]);
      }
  };

  describe('TeamMembers', function () {
      var $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(teamMembers);
          });

          it('should render fetched team members', function () {
              expect($output.has('#team-members-static')).toEqual(true);
              expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
          });
      });
  });

  var teamTotal = {
      controller: function controller() {
          var vm = {
              collection: m$1.prop([])
          };

          models.teamTotal.getRow().then(function (data) {
              vm.collection(data);
          });

          return {
              vm: vm
          };
      },
      view: function view(ctrl, args) {
          return m$1('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
              return m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m$1('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h$1.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m$1('.w-col.w-col-2')])]);
          })]);
      }
  };

  describe('TeamTotal', function () {
      var $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(teamTotal);
          });

          it('should render fetched team total info', function () {
              expect($output.find('#team-total-static').length).toEqual(1);
          });
      });
  });

  describe('Tooltip', function () {
      var $output = void 0,
          element = 'a#tooltip-trigger[href="#"]',
          text = 'tooltipText',
          tooltip = function tooltip(el) {
          return m$1.component(tooltip, {
              el: el,
              text: text,
              width: 320
          });
      };

      describe('view', function () {
          beforeEach(function () {
              $output = mq(tooltip(element));
          });

          it('should not render the tooltip at first', function () {
              expect($output.find('.tooltip').length).toEqual(0);
          });
          it('should render the tooltip on element mouseenter', function () {
              $output.click('#tooltip-trigger');
              expect($output.find('.tooltip').length).toEqual(1);
              expect($output.contains(text)).toBeTrue();
          });
          it('should hide the tooltip again on element mouseleave', function () {
              $output.click('#tooltip-trigger');
              $output.click('#tooltip-trigger');
              expect($output.find('.tooltip').length).toEqual(0);
          });
      });
  });

  var I18nScope$5 = _$1.partial(h$1.i18nScope, 'users.balance');

  var userBalanceRequestModelContent = {
      controller: function controller(args) {
          var vm = postgrest.filtersVM({ user_id: 'eq' }),
              balance = args.balance,
              loaderOpts = models.balanceTransfer.postOptions({
              user_id: balance.user_id }),
              requestLoader = postgrest.loaderWithToken(loaderOpts),
              displayDone = h$1.toggleProp(false, true),
              requestFund = function requestFund() {
              requestLoader.load().then(function (data) {
                  args.balanceManager.load();
                  args.balanceTransactionManager.load();
                  displayDone.toggle();
              });
          };

          args.bankAccountManager.load();

          return {
              requestLoader: requestLoader,
              requestFund: requestFund,
              bankAccounts: args.bankAccountManager.collection,
              displayDone: displayDone,
              loadBankA: args.bankAccountManager.loader
          };
      },
      view: function view(ctrl, args) {
          var balance = args.balance;

          return ctrl.loadBankA() ? h$1.loader() : m$1('div', _$1.map(ctrl.bankAccounts(), function (item) {
              return [m$1('.modal-dialog-header', [m$1('.fontsize-large.u-text-center', I18n$1.t('withdraw', I18nScope$5()))]), ctrl.displayDone() ? m$1('.modal-dialog-content.u-text-center', [m$1('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m$1('p.fontsize-large', I18n$1.t('sucess_message', I18nScope$5()))]) : m$1('.modal-dialog-content', [m$1('.fontsize-base.u-marginbottom-20', [m$1('span.fontweight-semibold', 'Valor:'), m$1.trust('&nbsp;'), m$1('span.text-success', 'R$ ' + h$1.formatNumber(balance.amount, 2, 3))]), m$1('.fontsize-base.u-marginbottom-10', [m$1('span', { style: { 'font-weight': ' 600' } }, I18n$1.t('bank.account', I18nScope$5()))]), m$1('.fontsize-small.u-marginbottom-10', [m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.name', I18nScope$5())), m$1.trust('&nbsp;'), item.owner_name]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.cpf_cnpj', I18nScope$5())), m$1.trust('&nbsp;'), item.owner_document]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.bank_name', I18nScope$5())), m$1.trust('&nbsp;'), item.bank_name]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.agency', I18nScope$5())), m$1.trust('&nbsp;'), item.agency + '-' + item.agency_digit]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.account', I18nScope$5())), m$1.trust('&nbsp;'), item.account + '-' + item.account_digit])])]), !ctrl.displayDone() ? m$1('.modal-dialog-nav-bottom', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [ctrl.requestLoader() ? h$1.loader() : m$1('a.btn.btn-large.btn-request-fund[href="js:void(0);"]', { onclick: ctrl.requestFund }, 'Solicitar saque')]), m$1('.w-col.w-col-3')])]) : ''];
          }));
      }
  };

  describe('UserBalanceRequestModalContent', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0;

      beforeAll(function () {
          parentComponent = m$1.component(usersBalance, { user_id: 1 });
          component = m$1.component(userBalanceRequestModelContent, _.extend({}, parentComponent.controller(), {
              balance: {
                  amount: 205,
                  user_id: 1
              }
          }));
          $output = mq(component);
      });

      it('should call bank account endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/bank_accounts?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user bank account / amount data', function () {
          expect($output.contains('R$ 205,00')).toEqual(true);
          expect($output.contains('Banco XX')).toEqual(true);
          $output.should.have('.btn-request-fund');
      });

      it('should call balance transfer endpoint when click on request fund btn and show success message', function () {
          $output.click('.btn-request-fund');
          $output.should.have('.fa-check-circle');

          var lastRequest = jasmine.Ajax.requests.filter(/balance_transfers/)[0];
          expect(lastRequest.url).toEqual(apiPrefix + '/balance_transfers');
          expect(lastRequest.method).toEqual('POST');
      });
  });

  describe('UserBalanceTransactions', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0;

      beforeAll(function () {
          parentComponent = m$1.component(userBalanceMain, { user_id: 1 });
          component = m$1.component(userBalanceTransactions, _.extend({}, parentComponent.controller(), { user_id: 1 }));
          $output = mq(component);
      });

      it('should call balance transactions endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/balance_transactions?order=created_at.desc&user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user balance transactions', function () {
          $output.should.have('.card-detailed-open');
          expect($output.contains('R$ 604,50')).toEqual(true);
          expect($output.contains('R$ 0,00')).toEqual(true);
          expect($output.contains('R$ -604,50')).toEqual(true);
          expect($output.contains('Project x')).toEqual(true);
      });
  });

  describe('UserBalance', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0;

      beforeAll(function () {
          parentComponent = m$1.component(usersBalance, { user_id: 1 });
          component = m$1.component(userBalance, _.extend({}, parentComponent.controller(), { user_id: 1 }));
          $output = mq(component);
      });

      it('should call balances endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/balances?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user balance', function () {
          expect($output.contains('R$ 205,00')).toEqual(true);
      });

      it('should render request fund btn', function () {
          $output.should.have('.r-fund-btn');
      });

      it('should call bank_account endpoint when click on request fund btn and show modal', function () {
          $output.click('.r-fund-btn');
          $output.should.have('.modal-dialog-inner');
          expect($output.contains('Banco XX')).toEqual(true);

          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/bank_accounts?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });
  });

  describe('admin.contributionFilterVM', function () {
    var vm$$ = vm,
        momentFromString = h$1.momentFromString;

    describe("created_at.lte.toFilter", function () {
      it("should use end of the day timestamp to send filter", function () {
        vm$$.created_at.lte('21/12/1999');
        expect(vm$$.created_at.lte.toFilter()).toEqual(momentFromString(vm$$.created_at.lte()).endOf('day').format());
      });
    });

    describe("full_text_index.toFilter", function () {
      it("should remove all diacritics to send filter", function () {
        vm$$.full_text_index('rémoção dos acêntüs');
        expect(vm$$.full_text_index.toFilter()).toEqual('remocao dos acentus');
      });
    });
  });

  describe('admin.userFilterVM', function () {
    var vm = vm$1;

    describe("deactivated_at.toFilter", function () {
      it("should parse string inputs to json objects to send filter", function () {
        vm.deactivated_at('null');
        expect(vm.deactivated_at.toFilter()).toEqual(null);
      });
    });

    describe("full_text_index.toFilter", function () {
      it("should remove all diacritics to send filter", function () {
        vm.full_text_index('rémoção dos acêntüs');
        expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');
      });
    });
  });

  var youtubeLightbox = {
      controller: function controller(args) {
          var player = void 0;
          var showLightbox = h$1.toggleProp(false, true),
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
          return m$1('#youtube-lightbox', [m$1('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', {
              onclick: ctrl.showLightbox.toggle
          }), m$1('#lightbox.w-lightbox-backdrop[style="display:' + (ctrl.showLightbox() ? 'block' : 'none') + '"]', [m$1('.w-lightbox-container', [m$1('.w-lightbox-content', [m$1('.w-lightbox-view', [m$1('.w-lightbox-frame', [m$1('figure.w-lightbox-figure', [m$1('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m$1('#ytvideo.embedly-embed.w-lightbox-embed', { config: ctrl.setYoutube })])])]), m$1('.w-lightbox-spinner.w-lightbox-hide'), m$1('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m$1('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m$1('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.closeVideo })]), m$1('.w-lightbox-strip')])])]);
      }
  };

  describe('YoutubeLightbox', function () {
      var $output = void 0,
          visibleStyl = 'display:block',
          invisibleStyl = 'display:none';

      describe('view', function () {
          beforeEach(function () {
              $output = mq(youtubeLightbox, { src: 'FlFTcDSKnLM' });
          });

          it('should not render the lightbox at first', function () {
              expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);
          });
          it('should render the lightbox on play button click', function () {
              $output.click('#youtube-play');
              expect($output.find('#lightbox')[0].attrs.style).toEqual(visibleStyl);
          });
          it('should close the lightbox on close button click', function () {
              $output.click('#youtube-play');
              $output.click('#youtube-close');
              expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);
          });
      });
  });

  var landingSignup = {
      controller: function controller(args) {
          var builder = args.builder,
              email = m$1.prop(''),
              error = m$1.prop(false),
              submit = function submit() {
              if (h$1.validateEmail(email())) {
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
          return m$1('form.w-form[id="email-form"][method="post"][action="' + args.builder.customAction + '"]', {
              onsubmit: ctrl.submit
          }, [m$1('.w-col.w-col-5', [m$1('input' + errorClasses + '.w-input.text-field.medium[name="EMAIL"][placeholder="Digite seu email"][type="text"]', {
              config: h$1.RDTracker('landing-flex'),
              onchange: m$1.withAttr('value', ctrl.email),
              value: ctrl.email()
          }), ctrl.error() ? m$1('span.fontsize-smaller.text-error', 'E-mail inválido') : '']), m$1('.w-col.w-col-3', [m$1('input.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')])]);
      }
  };

  var landingQA = {
      controller: function controller(args) {
          return {
              showAnswer: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          return m$1('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [m$1('.fontsize-base', {
              onclick: ctrl.showAnswer.toggle
          }, args.question), ctrl.showAnswer() ? m$1('p.u-margintop-20.fontsize-small', m$1.trust(args.answer)) : '']);
      }
  };

  var Flex = {
      controller: function controller() {
          var stats = m$1.prop([]),
              projects = m$1.prop([]),
              l = m$1.prop(),
              sample3 = _.partial(_.sample, _, 3),
              builder = {
              customAction: 'http://fazum.catarse.me/obrigado-landing-catarse-flex'
          },
              addDisqus = function addDisqus(el, isInitialized) {
              if (!isInitialized) {
                  h$1.discuss('https://catarse.me/flex', 'flex_page');
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

          return [m$1('.w-section.hero-full.hero-zelo', [m$1('.w-container.u-text-center', [m$1('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m$1('.w-row', [m$1('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding! Cadastre seu email e saiba como inscrever o seu projeto no flex!')]), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1.component(landingSignup, {
              builder: ctrl.builder
          }), m$1('.w-col.w-col-2')])])]), [m$1('.section', [m$1('.w-container', [m$1('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m$1('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m$1('div', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', [m$1('.u-text-center.u-marginbottom-20', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m$1('.fontsize-largest.lineheight-loose', 'Causas')]), m$1('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistenciais, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center.u-marginbottom-20', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m$1('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m$1('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m$1('.w-section.section.bg-greenlime.fontcolor-negative', [m$1('.w-container', [m$1('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m$1('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m$1('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m$1('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m$1('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? h$1.loader() : m$1.component(projectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m$1('.w-section.divider'), m$1('.w-section.section', [m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', [m$1.component(landingQA, {
              question: 'Quais são as taxas da modalidade flexível? ',
              answer: 'Como no Catarse, enviar um projeto não custa nada! A taxa cobrada no serviço Catarse flex é de 13% sobre o valor arrecadado.'
          }), m$1.component(landingQA, {
              question: 'De onde vem o dinheiro do meu projeto?',
              answer: 'Família, amigos, fãs e membros de comunidades que você faz parte são seus maiores colaboradores. São eles que irão divulgar sua campanha para as pessoas que eles conhecem, e assim o círculo de apoiadores vai aumentando e a sua campanha ganha força.'
          }), m$1.component(landingQA, {
              question: 'Qual a diferença entre o flexível e o "tudo ou nada"?',
              answer: 'Atualmente o Catarse utiliza apenas o modelo "tudo ou nada", onde você só fica com o dinheiro se bater a meta de arrecadação dentro do prazo da campanha. O modelo flexível é diferente pois permite que o realizador fique com o que arrecadar, independente de atingir ou não a meta do projeto no prazo da campanha. Não haverá limite de tempo para as campanhas. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado.'
          })]), m$1('.w-col.w-col-6', [m$1.component(landingQA, {
              question: 'Posso inscrever projetos para a modalidade flexível já?',
              answer: 'Sim. Cadastre seu email e saiba como inscrever o seu projeto no flex!'
          }), m$1.component(landingQA, {
              question: 'Por quê vocês querem fazer o Catarse flex?',
              answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O Catarse flex é mais um passo nessa direção.'
          }), m$1.component(landingQA, {
              question: 'Quando vocês irão lançar o Catarse flex?',
              answer: 'Ainda não sabemos quando abriremos o flex para o público em geral, mas você pode cadastrar seu email nessa página e receber um material especial de como inscrever seu projeto.'
          })])])])]), m$1('.w-section.section-large.u-text-center.bg-purple', [m$1('.w-container.fontcolor-negative', [m$1('.fontsize-largest', 'Inscreva seu projeto!'), m$1('.fontsize-base.u-marginbottom-60', 'Cadastre seu email e saiba como inscrever o seu projeto no flex!'), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1.component(landingSignup, {
              builder: ctrl.builder
          }), m$1('.w-col.w-col-2')])])]), m$1('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m$1('.w-container.u-text-center', [m$1('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), m$1('.w-row.u-text-center', ctrl.statsLoader() ? h$1.loader() : [m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', h$1.formatNumber(stats.total_contributors, 0, 3)), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', h$1.formatNumber(stats.total_projects_success, 0, 3)), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), m$1('.w-section.section.bg-blue-one.fontcolor-negative', [m$1('.w-container', [m$1('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.w-row', [m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('div', [m$1('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m$1('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('div', [m$1('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m$1('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), m$1('.w-col.w-col-2')])])]), m$1('.w-section.section-large.bg-greenlime', [m$1('.w-container', [m$1('#participe-do-debate.u-text-center', { config: h$1.toAnchor() }, [m$1('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m$1('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), m$1('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
              config: ctrl.addDisqus
          })])])]];
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
          return m$1('.card.u-radius.medium.u-marginbottom-30', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), m$1('.w-row', [m$1('.w-col.w-col-12.overflow-auto', [m$1('canvas[id="chart"][width="860"][height="300"]', {
              config: ctrl.renderChart
          })])])]);
      }
  };

  var projectDataTable = {
      controller: function controller(args) {
          var table = m$1.prop(args.table),
              sortIndex = m$1.prop(-1);

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
          return m$1('.table-outer.u-marginbottom-60', [m$1('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _$1.map(header, function (heading, idx) {
              var sort = function sort() {
                  return ctrl.sortTable(idx);
              };
              return m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m$1('a.link-hidden[href="javascript:void(0);"]', {
                  onclick: sort
              }, [heading + ' ', m$1('span.fa.fa-sort')])]);
          })), m$1('.table-inner.fontsize-small', _$1.map(body, function (rowData) {
              return m$1('.w-row.table-row', _$1.map(rowData, function (row) {
                  //Check if a custom comparator is used => Read component description
                  row = _$1.isArray(row) && row.length > 1 ? row[1] : row;
                  return m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m$1('div', row)]);
              }));
          }))]);
      }
  };

  var I18nScope$6 = _$1.partial(h$1.i18nScope, 'projects.insights');

  var insights = {
      controller: function controller(args) {
          var filtersVM = postgrest$1.filtersVM({
              project_id: 'eq'
          }),
              displayModal = h$1.toggleProp(false, true),
              projectDetails = m$1.prop([]),
              contributionsPerDay = m$1.prop([]),
              contributionsPerLocation = m$1.prop([]),
              loader = postgrest$1.loaderWithToken;

          if (h$1.paramByName('online_success') === 'true') {
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
                  m$1('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h$1.formatNumber(contribution.total_contributed, 2, 3), m$1('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                  return contributionsPerLocationTable.push(column);
              }) : [];
          };

          var lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
          lContributionsPerLocation.load().then(buildPerLocationTable);

          var contributionsPerRefTable = [[I18n$1.t('ref_table.header.origin', I18nScope$6()), I18n$1.t('ref_table.header.contributions', I18nScope$6()), I18n$1.t('ref_table.header.amount', I18nScope$6())]];
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

                  column.push(contribution.referral_link ? I18n$1.t('referral.' + contribution.referral_link, I18nScope$6({ defaultValue: contribution.referral_link })) : I18n$1.t('referral.others', I18nScope$6()));
                  column.push(contribution.total);
                  column.push([contribution.total_amount, [m$1('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h$1.formatNumber(contribution.total_amount, 2, 3), m$1('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
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
              return m$1.component(tooltip, {
                  el: el,
                  text: ['Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ', m$1('a[href="' + I18n$1.t('ref_table.help_url', I18nScope$6()) + '"][target=\'_blank\']', 'aqui.')],
                  width: 380
              });
          };

          project.user.name = project.user.name || 'Realizador';

          return m$1('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? m$1.component(projectDashboardMenu, {
              project: m$1.prop(project)
          }) : '', ctrl.displayModal() ? m$1.component(modalBox, {
              displayModal: ctrl.displayModal,
              content: successModalC
          }) : '', m$1('.w-container', [m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8.dashboard-header.u-text-center', [m$1('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n$1.t('campaign_title', I18nScope$6())), m$1.component(adminProjectDetailsCard, {
              resource: project
          }), m$1('p.' + project.state + '-project-text.fontsize-small.lineheight-loose', [project.mode === 'flex' && _$1.isNull(project.expires_at) && project.state !== 'draft' ? m$1('span', [I18n$1.t('finish_explanation', I18nScope$6()), m$1('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', I18n$1.t('know_more', I18nScope$6()))]) : m$1.trust(I18n$1.t('campaign.' + project.mode + '.' + project.state, I18nScope$6({ username: project.user.name, expires_at: h$1.momentify(project.zone_expires_at), sent_to_analysis_at: h$1.momentify(project.sent_to_analysis_at) })))])]), m$1('.w-col.w-col-2')])]), project.is_published ? [m$1('.divider'), m$1('.w-section.section-one-column.section.bg-gray.before-footer', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', {
              style: {
                  'min-height': '300px'
              }
          }, [!ctrl.lContributionsPerDay() ? m$1.component(projectDataChart, {
              collection: ctrl.contributionsPerDay,
              label: I18n$1.t('amount_per_day_label', I18nScope$6()),
              dataKey: 'total_amount',
              xAxis: function xAxis(item) {
                  return h$1.momentify(item.paid_at);
              }
          }) : h$1.loader()])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', {
              style: {
                  'min-height': '300px'
              }
          }, [!ctrl.lContributionsPerDay() ? m$1.component(projectDataChart, {
              collection: ctrl.contributionsPerDay,
              label: I18n$1.t('contributions_per_day_label', I18nScope$6()),
              dataKey: 'total',
              xAxis: function xAxis(item) {
                  return h$1.momentify(item.paid_at);
              }
          }) : h$1.loader()])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1('.project-contributions-per-ref', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n$1.t('ref_origin_title', I18nScope$6()), h$1.newFeatureBadge(), buildTooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? m$1.component(projectDataTable, {
              table: ctrl.contributionsPerRefTable,
              defaultSortIndex: -2
          }) : h$1.loader()])])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1('.project-contributions-per-ref', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n$1.t('location_origin_title', I18nScope$6())), !ctrl.lContributionsPerLocation() ? m$1.component(projectDataTable, {
              table: ctrl.contributionsPerLocationTable,
              defaultSortIndex: -2
          }) : h$1.loader()])])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1.component(projectReminderCount, {
              resource: project
          })])])])])] : ''] : h$1.loader());
      }
  };

  var I18nScope$7 = _.partial(h$1.i18nScope, 'pages.jobs');

  var jobs = {
      view: function view(ctrl, args) {
          return [m$1('.w-section.hero-jobs.hero-medium', [m$1('.w-containe.u-text-center', [m$1('img.icon-hero[src="/assets/logo-white.png"]'), m$1('.u-text-center.u-marginbottom-20.fontsize-largest', I18n$1.t('title', I18nScope$7()))])]), m$1('.w-section.section', [m$1('.w-container.u-margintop-40', [m$1('.w-row', [m$1('.w-col.w-col-8.w-col-push-2.u-text-center', [m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('info', I18nScope$7())), m$1('a[href="/projects/new"].w-button.btn.btn-large.btn-inline', I18n$1.t('cta', I18nScope$7()))])])])])];
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

          return m$1('.w-section.dashboard-header', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]), m$1('.w-col.w-col-3')]), m$1('.w-form', [m$1('form', { onsubmit: args.submit }, [m$1('.w-row', [m$1('.w-col.w-col-5', [m$1('.w-row', [m$1.component(c[paymentStateFilter.component], paymentStateFilter.data), m$1.component(c[rewardFilter.component], rewardFilter.data)])]), m$1('.w-col.w-col-7.u-margintop-20', [m$1('.w-row', [m$1('.w-col.w-col-8._w-sub-col', [m$1.component(c[mainFilter.component], mainFilter.data)]), m$1('.w-col.w-col-4.w-clearfix.w-hidden-small.w-hidden-tiny', [m$1('a.alt-link.u-right.fontsize-small.lineheight-looser[target="__blank" href="/projects/' + project_id + '/edit#reports"]', [m$1('span.fa.fa-download', '.'), ' Baixar relatórios'])])])])])])])])]);
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
          return m$1('.w-clearfix.card.card-clickable', [m$1('.w-row', [m$1('.w-col.w-col-1.w-col-tiny-1', [m$1('img.user-avatar.u-marginbottom-10[src=\'' + profile_img + '\']')]), m$1('.w-col.w-col-11.w-col-tiny-11', [m$1('.w-row', [m$1('.w-col.w-col-3', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name), m$1('.fontsize-smallest.lineheight-looser', [contribution.has_another ? [m$1('a.link-hidden-light.badge.badge-light', '+1 apoio'), m$1.trust('&nbsp;')] : '', contribution.anonymous ? m$1('span.fa.fa-eye-slash.fontcolor-secondary') : ''])]), m$1(".w-col.w-col-3", [m$1(".lineheight-tighter", [m$1('span.fa.fa-circle.fontsize-smallest.' + ctrl.stateClass(contribution.state), "."), "   ", m$1("span.fontsize-large", 'R$ ' + h$1.formatNumber(contribution.value, 2, 3))])]), m$1(".w-col.w-col-3.w-hidden-small.w-hidden-tiny", [m$1(".fontsize-smallest.fontweight-semibold", 'Recompensa: R$ ' + h$1.formatNumber(reward.minimum_value, 2, 3)), m$1(".fontsize-smallest", reward.description.substring(0, 80) + '...')]) /*,
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
          return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1(".w-row.u-marginbottom-20", [m$1(".w-col.w-col-9.w-col-small-6.w-col-tiny-6", [m$1(".fontsize-base", [m$1("span.fontweight-semibold", list.isLoading() ? '' : list.total()), " apoios"])])]),
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
              var contribution = m$1.prop(item);
              return m$1.component(projectContributionReportContentCard, { contribution: contribution });
          })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais') : h$1.loader()])])])])]);
      }
  };

  var vm$2 = postgrest.filtersVM({
      full_text_index: '@@',
      state: 'eq',
      reward_id: 'eq',
      project_id: 'eq'
  });
  var paramToString$2 = function paramToString(p) {
      return (p || '').toString().trim();
  };
  vm$2.state('');
  vm$2.order({
      id: 'desc'
  });

  vm$2.full_text_index.toFilter = function () {
      var filter = paramToString$2(vm$2.full_text_index());
      return filter && replaceDiacritics(filter) || undefined;
  };

  var projectContributionReport = {
      controller: function controller(args) {
          var listVM = postgrest$1.paginationVM(models.projectContribution, 'id.desc', { 'Prefer': 'count=exact' }),
              filterVM = vm$2,
              project = m$1.prop({}),
              rewards = m$1.prop([]),
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
                          option: 'R$ ' + h$1.formatNumber(r.minimum_value, 2, 3) + ' - ' + r.description.substring(0, 20)
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

          return [m$1.component(projectDashboardMenu, { project: m$1.prop(_$1.first(ctrl.project())) }), m$1.component(projectContributionReportHeader, {
              submit: ctrl.submit,
              filterBuilder: ctrl.filterBuilder,
              form: ctrl.filterVM.formDescriber,
              mapRewardsToOptions: ctrl.mapRewardsToOptions,
              filterVM: ctrl.filterVM
          }), m$1('.divider.u-margintop-30'), m$1.component(projectContributionReportContent, {
              list: list
          })];
      }
  };

  var homeVM = function homeVM() {
      var i18nStart = I18n$1.translations[I18n$1.currentLocale()].projects.home,
          banners = i18nStart.banners;

      return {
          banners: banners
      };
  };

  var contributionActivities = {
      controller: function controller(args) {
          var interval = void 0;
          var collection = m$1.prop([]),
              resource = m$1.prop(),
              collectionIndex = m$1.prop(0),
              collectionSize = m$1.prop(),
              collectionL = postgrest.loader(models.contributionActivity.getPageOptions()),
              nextResource = function nextResource() {
              if (collectionIndex() + 1 > collectionSize()) {
                  collectionIndex(0);
              }

              collectionIndex(collectionIndex() + 1);
              resource(collection()[collectionIndex()]);
              m$1.redraw();
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
                  elapsed = h$1.translatedTime(resource.elapsed_time),
                  project_link = 'https://catarse.me/' + resource.permalink + '?ref=ctrse_home_activities';

              return m$1('.w-section.section.bg-backs-carrosel', { config: ctrl.startConfig }, [m$1('.w-container.u-text-center.fontcolor-negative', [m$1('.fontsize-large.u-marginbottom-30', 'há ' + parseInt(elapsed.total) + ' ' + elapsed.unit + '...'), m$1('.w-clearfix.w-inline-block.u-marginbottom-10', [m$1('a', { href: project_link }, [m$1('img.thumb-author.u-round', { src: resource.thumbnail, width: 80 })]), m$1('img.thumb-author.u-round', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png' }), m$1('a', { href: project_link }, [m$1('img.thumb-author.u-round', { src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;' })])]), m$1('.fontsize-large', resource.name + ' apoiou'), m$1('.fontsize-larger', [m$1('a.link-hidden-white', { href: project_link }, resource.project_name)])])]);
          } else {
              return m$1('div');
          }
      }
  };

  var I18nScope$8 = _$1.partial(h$1.i18nScope, 'projects.home');

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
                  collection = m$1.prop([]);

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
                  var content = m$1('.w-container.u-text-center', [m$1('.w-row.u-marginbottom-40', [m$1('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title), m$1('h2.fontcolor-negative.fontsize-large', m$1.trust(slide.subtitle))]), m$1('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)]);

                  return {
                      content: content,
                      customStyle: customStyle
                  };
              });
          };

          return [m$1.component(slider, {
              slides: slides(),
              effect: 'fade',
              slideClass: 'hero-slide start',
              wrapperClass: 'hero-full hero-full-slide',
              sliderTime: 10000
          }), _$1.map(ctrl.collections, function (collection) {
              return m$1.component(projectRow, {
                  collection: collection,
                  title: I18n$1.t('row_title', I18nScope$8()),
                  ref: 'home_' + collection.hash
              });
          }), m$1.component(contributionActivities)];
      }
  };

  var I18nScope$9 = _$1.partial(h$1.i18nScope, 'projects.publish');

  var publish = {
    controller: function controller(args) {
      var filtersVM = postgrest.filtersVM({
        project_id: 'eq'
      }),
          projectAccount = m$1.prop([]),
          projectDetails = m$1.prop([]),
          acceptTerm = m$1.prop([true, true, true, true, true, true, true, true, true]),
          flexAcceptTerm = m$1.prop([true, true, true, true, true, true, true, true, true]),
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
        return [m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m$1('span.fontweight-semibold', 'Regras da modalidade FLEX')]), m$1('div', 'Você escolheu a campanha flexível. Dessa maneira, você irá receber os recursos arrecadados  junto aos apoiadores ao final do prazo da campanha (descontando a taxa do Catarse) e deverá cumprir com a execução do projeto e com a entrega das recompensas oferecidas independente do quanto arrecadar.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m$1('span.fontweight-semibold', 'Meta de arrecadação')]), m$1('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m$1('span.fontweight-semibold', 'Taxas')]), m$1('div', ['Ao final da campanha, cobraremos 13% sobre o ', m$1('span.fontweight-semibold', 'valor total arrecadado.')])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m$1('span.fontweight-semibold', 'Prazo da campanha')]), m$1('div', 'Sua campanha poderá ficar até 12 meses arrecadando dentro do Catarse. Durante esse período você deverá definir um prazo de encerramento da campanha para poder receber os recursos arrecadados. Uma vez definido, o prazo de encerramento não poderá ser alterado.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m$1('span.fontweight-semibold', 'Prazo para repasse')]), m$1('div', 'Após encerrar a sua campanha e confirmar seus dados bancários, o Catarse realizará o repasse diretamente na sua conta corrente em até 10 dias úteis. O valor depositado já estará considerando o desconto de 13% da taxa.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m$1('span.fontweight-semibold', 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m$1('div', [m$1('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\
                    ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m$1('span.fontweight-semibold', 'Responsabilidade do Catarse')]), [m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m$1('span.fontweight-semibold', 'Suas responsabilidades')]), m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m$1('div', [m$1('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m$1('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
      },
          terms = function terms(project) {
        return [m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m$1('span.fontweight-semibold', 'Regras da modalidade Tudo-ou-nada')]), m$1('div', ['Você escolheu a campanha tudo-ou-nada. Dessa maneira, você só irá receber os recursos arrecadados ', m$1('span.fontweight-semibold', 'caso atinja ou supere a meta de arrecadação'), '. Caso contrário, todos seus apoiadores serão reembolsados. Você será responsável pela entrega das recompensas oferecidas se seu projeto alcançar a meta de arrecadação.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Meta de arrecadação')]), m$1('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Taxas')]), m$1('div', ['Cobramos 13% sobre o ', m$1('span.fontweight-semibold', 'valor total arrecadado'), ' pelo seu projeto caso ele atinja ou supere a meta dentro do prazo da campanha. Se o projeto não atingir a meta, nenhuma taxa será cobrada.', m$1('span.fontweight-semibold')])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Prazo da campanha')]), m$1('div', 'Seu projeto estará em arrecadação no Catarse até o dia ' + h$1.momentify(project.zone_expires_at) + ' às 23h59min59s. Este prazo não poderá ser alterado após a publicação do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Regras do repasse e reembolso')]), m$1('div', ['Após encerrar o seu projeto e confirmar seus dados bancários, o Catarse depositará o valor arrecadado, já com o desconto da taxa, na sua conta corrente em até 10 dias úteis. Caso o projeto não atinja 100% da meta dentro do prazo, o Catarse irá reembolsar os apoiadores. ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Saiba mais sobre o processo de reembolso'), '.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m$1('div', [m$1('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Responsabilidade do Catarse')]), [m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Suas responsabilidades')]), m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m$1('div', [m$1('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m$1('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
      };

      return [!ctrl.l() && !ctrl.accountL() ? [project.is_owner_or_admin ? m$1.component(projectDashboardMenu, {
        project: m$1.prop(project),
        hidePublish: true
      }) : '', m$1('.w-section.section-product.' + project.mode), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'), m$1('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')])]), m$1('.w-col.w-col-3')])])]), m$1('.divider'), m$1('.w-section.section-one-column.bg-gray.section.before-footer', [m$1('.w-container', [m$1('.card.medium.u-marginbottom-60.card-terciary', [m$1('.w-row', [m$1('.w-col.w-col-6.w-clearfix', [m$1('img.card-project-thumb.u-right[src=' + project.large_image + ']')]), m$1('.w-col.w-col-6', [m$1('.u-marginbottom-30.fontsize-base', [m$1('div', [m$1('span.fontweight-semibold', 'Título: '), project.name]), m$1('div', [m$1('span.fontweight-semibold', 'Link: '), 'www.catarse.me/' + project.permalink]), m$1('div', [m$1('span.fontweight-semibold', 'Modalidade de financiamento: '), I18n$1.t(project.mode, I18nScope$9())]), m$1('div', [m$1('span.fontweight-semibold', 'Meta de arrecadação: '), 'R$ ' + h$1.formatNumber(project.goal, 2, 3)]), project.mode !== 'flex' ? m$1('div', [m$1('span.fontweight-semibold', 'Prazo: ' + project.online_days + ' dias')]) : '', m$1('div', [m$1('span.fontweight-semibold', 'Responsável: '), account.owner_name]), m$1('div', [m$1('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])])])]), m$1('.u-text-center', [m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10', [m$1('.divider.u-marginbottom-10'), m$1('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')]), m$1('.w-col.w-col-1')])])]), m$1('.card.medium.u-radius.u-marginbottom-60', [m$1('.u-text-center.u-marginbottom-60', [m$1('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ', m$1('a.alt-link[href=\'https://equipecatarse.zendesk.com/account/dropboxes/20298537\'][target=\'_blank\']', 'entre em contato'), '!'])]), m$1('.w-col.w-col-2')])]), _$1.map(project.mode == 'flex' ? flexTerms(project) : terms(project), function (term, index) {
        return m$1('.u-marginbottom-30.fontsize-base' + (index == 0 ? '' : '.w-hidden.publish-rules'), [m$1('.w-row[id=\'rule-' + index + '\']', [m$1('.w-col.w-col-1.u-text-center', [m$1('div', [m$1((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? 'a.w-inline-block.checkbox-big[href=\'#rule-' + (index + 1) + '\']' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href=\'#rule-' + (index + 1) + '\']', { onclick: function onclick() {
            return ctrl.showNextTerm(index, project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm);
          } })])]), term])]);
      })]), m$1('.w-row.publish-btn-section.w-hidden', [m$1('.w-col.w-col-4'), m$1('.w-col.w-col-4', [m$1('a.btn.btn-large.u-marginbottom-20[href=/' + (project.mode == 'flex' ? 'flexible_projects' : 'projects') + '/' + (project.mode == 'flex' ? project.flex_id : project.id) + '/push_to_online]', 'Publicar agora!'), m$1('.u-text-center.fontsize-smaller', ['Ao publicar o seu projeto, você está aceitando os ', m$1('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), ', ', project.mode == 'flex' ? m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/206574833-Regras-para-a-fase-de-testes-do-Catarse-Flex\'][target=\'_blank\']', 'Regras do Flex') : '', ' e ', m$1('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')])]), m$1('.w-col.w-col-4')])])]), '\
    '] : h$1.loader()];
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

  var I18nScope$10 = _$1.partial(h$1.i18nScope, 'pages.start');

  var start = {
      controller: function controller() {
          var stats = m$1.prop([]),
              categories = m$1.prop([]),
              selectedPane = m$1.prop(0),
              selectedCategory = m$1.prop([]),
              featuredProjects = m$1.prop([]),
              selectedCategoryIdx = m$1.prop(-1),
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
                  m$1.redraw();
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
                  var content = m$1('.card.u-radius.card-big.card-terciary', [m$1('.u-text-center.u-marginbottom-20', [m$1('img.thumb-testimonial.u-round.u-marginbottom-20[src="' + testimonial.thumbUrl + '"]')]), m$1('p.fontsize-large.u-marginbottom-30', '"' + testimonial.content + '"'), m$1('.u-text-center', [m$1('.fontsize-large.fontweight-semibold', testimonial.name), m$1('.fontsize-base', testimonial.totals)])]);

                  return {
                      content: content
                  };
              });
          };

          return [m$1('.w-section.hero-full.hero-start', [m$1('.w-container.u-text-center', [m$1('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n$1.t('slogan', I18nScope$10())), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('a.btn.btn-large.u-marginbottom-10[href="#start-form"]', {
              config: h$1.scrollTo()
          }, I18n$1.t('submit', I18nScope$10()))])]), m$1('.w-row', _$1.isEmpty(stats) ? '' : [m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', h$1.formatNumber(stats.total_contributors, 0, 3)), m$1('p.fontsize-small.start-stats', I18n$1.t('header.people', I18nScope$10()))]), m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m$1('p.fontsize-small.start-stats', I18n$1.t('header.money', I18nScope$10()))]), m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', h$1.formatNumber(stats.total_projects_success, 0, 3)), m$1('p.fontsize-small.start-stats', I18n$1.t('header.success', I18nScope$10()))])])])]), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-push-1.u-text-center', [m$1('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n$1.t('page-title', I18nScope$10())), m$1('.fontsize-small', I18n$1.t('page-subtitle', I18nScope$10()))])]), m$1('.w-clearfix.how-row', [m$1('.w-hidden-small.w-hidden-tiny.how-col-01', [m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.2', I18nScope$10()))]), m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.4', I18nScope$10()))])]), m$1('.how-col-02'), m$1('.how-col-03', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.5', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.6', I18nScope$10())), m$1('.fontweight-semibold.fontsize-large.u-margintop-30', I18n$1.t('banner.7', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.8', I18nScope$10()))]), m$1('.w-hidden-main.w-hidden-medium.how-col-01', [m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.2', I18nScope$10()))]), m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$10())), m$1('.fontsize-base', I18n$1.t('banner.4', I18nScope$10()))])])])])]), m$1('.w-section.divider'), m$1('.w-section.section-large', [m$1('.w-container.u-text-center.u-marginbottom-60', [m$1('div', [m$1('span.fontsize-largest.fontweight-semibold', I18n$1.t('features.title', I18nScope$10()))]), m$1('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n$1.t('features.subtitle', I18nScope$10())), m$1('.w-hidden-main.w-hidden-medium.u-margintop-30', [m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_1', I18nScope$10())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_2', I18nScope$10())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_3', I18nScope$10())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_4', I18nScope$10())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_5', I18nScope$10()))])]), m$1('.w-container', [m$1('.w-tabs.w-hidden-small.w-hidden-tiny', [m$1('.w-tab-menu.w-col.w-col-4', _$1.map(ctrl.paneImages, function (pane, idx) {
              return m$1('btn.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                  onclick: ctrl.selectPane(idx)
              }, pane.label);
          })), m$1('.w-tab-content.w-col.w-col-8', _$1.map(ctrl.paneImages, function (pane, idx) {
              return m$1('.w-tab-pane', [m$1('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
          }))])])]), m$1('.w-section.section-large.bg-blue-one', [m$1('.w-container.u-text-center', [m$1('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n$1.t('video.title', I18nScope$10()), m$1('br'), I18n$1.t('video.subtitle', I18nScope$10())]), m$1.component(youtubeLightbox, {
              src: I18n$1.t('video.src', I18nScope$10())
          })])]), m$1('.w-hidden-small.w-hidden-tiny.section-categories', [m$1('.w-container', [m$1('.u-text-center', [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-push-1', [m$1('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n$1.t('categories.title', I18nScope$10()))])])]), m$1('.w-tabs', [m$1('.w-tab-menu.u-text-center', _$1.map(ctrl.categories(), function (category) {
              return m$1('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                  onclick: ctrl.selectCategory(category)
              }, [m$1('div', category.name)]);
          })), m$1('.w-tab-content.u-margintop-40', [m$1('.w-tab-pane.w--tab-active', [m$1('.w-row', ctrl.selectedCategoryIdx() !== -1 ? _$1.map(ctrl.selectedCategory(), function (category) {
              return [m$1('.w-col.w-col-5', [m$1('.fontsize-jumbo.u-marginbottom-20', category.name), m$1('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="#start-form"]', {
                  config: h$1.scrollTo()
              }, I18n$1.t('submit', I18nScope$10()))]), m$1('.w-col.w-col-7', [m$1('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + (category.total_successful_value ? h$1.formatNumber(category.total_successful_value, 2, 3) : '...')), m$1('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m$1('.fontsize-megajumbo.fontcolor-negative', category.successful_projects ? category.successful_projects : '...'), m$1('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_$1.isEmpty(ctrl.featuredProjects()) ? _$1.map(ctrl.featuredProjects(), function (project) {
                  return !_$1.isUndefined(project) ? m$1('.w-row.u-marginbottom-10', [m$1('.w-col.w-col-1', [m$1('img.user-avatar[src="' + h$1.useAvatarOrDefault(project.userThumb) + '"]')]), m$1('.w-col.w-col-11', [m$1('.fontsize-base.fontweight-semibold', project.user.name), m$1('.fontsize-smallest', [I18n$1.t('categories.pledged', I18nScope$10({ pledged: h$1.formatNumber(project.pledged), contributors: project.total_contributors })), m$1('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m$1('.fontsize-base', I18n$1.t('categories.loading_featured', I18nScope$10()));
              }) : ''])];
          }) : '')])])])])]), m$1.component(slider, {
              slides: testimonials(),
              title: I18n$1.t('testimonials_title', I18nScope$10()),
              slideClass: 'slide-testimonials-content',
              wrapperClass: 'slide-testimonials'
          }), m$1('.w-section.divider.u-margintop-30'), m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', I18n$1.t('qa_title', I18nScope$10())), m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', _$1.map(ctrl.questions.col_1, function (question) {
              return m$1.component(landingQA, {
                  question: question.question,
                  answer: question.answer
              });
          })), m$1('.w-col.w-col-6', _$1.map(ctrl.questions.col_2, function (question) {
              return m$1.component(landingQA, {
                  question: question.question,
                  answer: question.answer
              });
          }))])]), m$1('#start-form.w-section.section-large.u-text-center.bg-purple.before-footer', [m$1('.w-container', [m$1('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m$1('form[action="/projects/fallback_create"][method="GET"].w-row.w-form', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n$1.t('form.title', I18nScope$10())), m$1('input[name="utf8"][type="hidden"][value="✓"]'), m$1('input[name="authenticity_token"][type="hidden"][value="' + h$1.authenticityToken() + '"]'), m$1('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', { name: 'project[name]' }), m$1('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m$1('select.w-select.text-field.medium.u-marginbottom-40', { name: 'project[category_id]' }, [m$1('option[value=""]', I18n$1.t('form.select_default', I18nScope$10())), _$1.map(ctrl.categories(), function (category) {
              return m$1('option[value="' + category.id + '"]', category.name);
          })])]), m$1('.w-col.w-col-2'), m$1('.w-row.u-marginbottom-80', [m$1('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m$1('input[type="submit"][value="' + I18n$1.t('form.submit', I18nScope$10()) + '"].w-button.btn.btn-large')])])])])])];
      }
  };

  var team = {
      view: function view() {
          return m$1('#static-team-app', [m$1.component(teamTotal), m$1.component(teamMembers)]);
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

  var userCard = {
      controller: function controller(args) {
          var vm = h$1.idVM,
              userDetails = m$1.prop([]);

          vm.id(args.userId);

          //FIXME: can call anon requests when token fails (requestMaybeWithToken)
          models.userDetail.getRowWithToken(vm.parameters()).then(userDetails);

          return {
              userDetails: userDetails
          };
      },
      view: function view(ctrl) {
          return m$1('#user-card', _$1.map(ctrl.userDetails(), function (userDetail) {
              return m$1('.card.card-user.u-radius.u-marginbottom-30[itemprop="author"]', [m$1('.w-row', [m$1('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', [m$1('img.thumb.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m$1('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m$1('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop="name"]', [m$1('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m$1('.fontsize-smallest.lineheight-looser[itemprop="address"]', userDetail.address_city), m$1('.fontsize-smallest', userDetail.total_published_projects + ' projetos criados'), m$1('.fontsize-smallest', 'apoiou ' + userDetail.total_contributed_projects + ' projetos')])]), m$1('.project-author-contacts', [m$1('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [!_$1.isEmpty(userDetail.facebook_link) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_$1.isEmpty(userDetail.twitter_username) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _$1.map(userDetail.links, function (link) {
                  return m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)]);
              })])]), !_$1.isEmpty(userDetail.email) ? m$1('a.btn.btn-medium.btn-message[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '']);
          }));
      }
  };

}((this.catarseSpecs = this.catarseSpecs || {}),m,_,moment,I18n,postgrest,replaceDiacritics,Chart));
//# sourceMappingURL=bundle.spec.js.map