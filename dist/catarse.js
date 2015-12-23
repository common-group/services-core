"use strict";

window.c = (function () {
    return {
        models: {},
        root: {},
        admin: {},
        h: {}
    };
})();
'use strict';

window.c.h = (function (m, moment, I18n) {
    //Date Helpers

    var hashMatch = function hashMatch(str) {
        return window.location.hash === str;
    },
        paramByName = function paramByName(name) {
        var normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
            regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
        setMomentifyLocale = function setMomentifyLocale() {
        moment.locale('pt', {
            monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
        });
    },
        existy = function existy(x) {
        return x != null;
    },
        momentify = function momentify(date, format) {
        format = format || 'DD/MM/YYYY';
        return date ? moment(date).locale('pt').format(format) : 'no date';
    },
        storeAction = function storeAction(action) {
        if (!sessionStorage.getItem(action)) {
            return sessionStorage.setItem(action, action);
        }
    },
        callStoredAction = function callStoredAction(action, func) {
        if (sessionStorage.getItem(action)) {
            func.call();
            return sessionStorage.removeItem(action);
        }
    },
        discuss = function discuss(page, identifier) {
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
    },
        momentFromString = function momentFromString(date, format) {
        var european = moment(date, format || 'DD/MM/YYYY');
        return european.isValid() ? european : moment(date);
    },
        translatedTimeUnits = {
        days: 'dias',
        minutes: 'minutos',
        hours: 'horas',
        seconds: 'segundos'
    },

    //Object manipulation helpers
    translatedTime = function translatedTime(time) {
        var translatedTime = translatedTimeUnits,
            unit = function unit() {
            var projUnit = translatedTime[time.unit || 'seconds'];

            return time.total <= 1 ? projUnit.slice(0, -1) : projUnit;
        };

        return {
            unit: unit(),
            total: time.total
        };
    },

    //Number formatting helpers
    generateFormatNumber = function generateFormatNumber(s, c) {
        return function (number, n, x) {
            if (!_.isNumber(number)) {
                return null;
            }

            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
                num = number.toFixed(Math.max(0, ~ ~n));
            return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
        };
    },
        formatNumber = generateFormatNumber('.', ','),
        toggleProp = function toggleProp(defaultState, alternateState) {
        var p = m.prop(defaultState);
        p.toggle = function () {
            return p(p() === alternateState ? defaultState : alternateState);
        };

        return p;
    },
        idVM = m.postgrest.filtersVM({
        id: 'eq'
    }),
        getUser = function getUser() {
        var body = document.getElementsByTagName('body'),
            data = _.first(body).getAttribute('data-user');
        if (data) {
            return JSON.parse(data);
        } else {
            return false;
        }
    },
        locationActionMatch = function locationActionMatch(action) {
        var act = window.location.pathname.split('/').slice(-1)[0];
        return action === act;
    },
        useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
        return avatarPath || '/assets/catarse_bootstrap/user.jpg';
    },

    //Templates
    loader = function loader() {
        return m('.u-text-center.u-margintop-30 u-marginbottom-30', [m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
    },
        newFeatureBadge = function newFeatureBadge() {
        return m('span.badge.badge-success.margin-side-5', I18n.t('projects.new_feature_badge'));
    },
        fbParse = function fbParse() {
        var tryParse = function tryParse() {
            try {
                window.FB.XFBML.parse();
            } catch (e) {
                console.log(e);
            }
        };

        return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
    },
        pluralize = function pluralize(count, s, p) {
        return count > 1 ? count + p : count + s;
    },
        simpleFormat = function simpleFormat() {
        var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        str = str.replace(/\r\n?/, '\n');
        if (str.length > 0) {
            str = str.replace(/\n\n+/g, '</p><p>');
            str = str.replace(/\n/g, '<br />');
            str = '<p>' + str + '</p>';
        }
        return str;
    },
        rewardSouldOut = function rewardSouldOut(reward) {
        return reward.maximum_contributions > 0 ? reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions : false;
    },
        rewardRemaning = function rewardRemaning(reward) {
        return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
    },
        parseUrl = function parseUrl(href) {
        var l = document.createElement('a');
        l.href = href;
        return l;
    },
        mixpanelTrack = function mixpanelTrack() {
        return function (el, isInitialized) {
            if (!isInitialized) {
                window.CatarseMixpanel.activate();
            }
        };
    },
        UIHelper = function UIHelper() {
        return function (el, isInitialized) {
            if (!isInitialized && $) {
                window.UIHelper.setupResponsiveIframes($(el));
            }
        };
    },
        toAnchor = function toAnchor() {
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
    },
        validateEmail = function validateEmail(email) {
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    },
        navigateToDevise = function navigateToDevise() {
        window.location.href = '/pt/login';
        return false;
    },
        cumulativeOffset = function cumulativeOffset(element) {
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
    },
        closeFlash = function closeFlash() {
        var el = document.getElementsByClassName('icon-close')[0];
        if (_.isElement(el)) {
            el.onclick = function (event) {
                event.preventDefault();

                el.parentElement.remove();
            };
        };
    },
        i18nScope = function i18nScope(scope, obj) {
        obj = obj || {};
        return _.extend({}, obj, { scope: scope });
    },
        authenticityToken = function authenticityToken() {
        return _.first(document.querySelectorAll('[data-authenticitytoken]')).dataset.authenticitytoken;
    };

    setMomentifyLocale();
    closeFlash();

    return {
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
        useAvatarOrDefault: useAvatarOrDefault,
        locationActionMatch: locationActionMatch,
        mixpanelTrack: mixpanelTrack,
        navigateToDevise: navigateToDevise,
        storeAction: storeAction,
        callStoredAction: callStoredAction,
        UIHelper: UIHelper,
        toAnchor: toAnchor,
        paramByName: paramByName,
        i18nScope: i18nScope
    };
})(window.m, window.moment, window.I18n);
'use strict';

window.c.models = (function (m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        projectDetail = m.postgrest.model('project_details'),
        userDetail = m.postgrest.model('user_details'),
        user = m.postgrest.model('users'),
        rewardDetail = m.postgrest.model('reward_details'),
        projectReminder = m.postgrest.model('project_reminders'),
        contributions = m.postgrest.model('contributions'),
        teamTotal = m.postgrest.model('team_totals'),
        projectContribution = m.postgrest.model('project_contributions'),
        projectPostDetail = m.postgrest.model('project_posts_details'),
        projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
        projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
        projectContributionsPerRef = m.postgrest.model('project_contributions_per_ref'),
        project = m.postgrest.model('projects'),
        projectSearch = m.postgrest.model('rpc/project_search'),
        category = m.postgrest.model('categories'),
        categoryTotals = m.postgrest.model('category_totals'),
        categoryFollower = m.postgrest.model('category_followers'),
        teamMember = m.postgrest.model('team_members'),
        notification = m.postgrest.model('notifications'),
        statistic = m.postgrest.model('statistics');

    teamMember.pageSize(40);
    rewardDetail.pageSize(false);
    project.pageSize(30);
    category.pageSize(50);

    return {
        contributionDetail: contributionDetail,
        projectDetail: projectDetail,
        userDetail: userDetail,
        user: user,
        rewardDetail: rewardDetail,
        contributions: contributions,
        teamTotal: teamTotal,
        teamMember: teamMember,
        project: project,
        projectSearch: projectSearch,
        category: category,
        categoryTotals: categoryTotals,
        categoryFollower: categoryFollower,
        projectContributionsPerDay: projectContributionsPerDay,
        projectContributionsPerLocation: projectContributionsPerLocation,
        projectContributionsPerRef: projectContributionsPerRef,
        projectContribution: projectContribution,
        projectPostDetail: projectPostDetail,
        projectReminder: projectReminder,
        notification: notification,
        statistic: statistic
    };
})(window.m);
'use strict';

window.c.AdminContributionDetail = (function (m, _, c, h) {
    return {
        controller: function controller(args) {
            var l = undefined;
            var loadReward = function loadReward() {
                var model = c.models.rewardDetail,
                    reward_id = args.item.reward_id,
                    opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
                    reward = m.prop({});
                l = m.postgrest.loaderWithToken(opts);
                if (reward_id) {
                    l.load().then(_.compose(reward, _.first));
                }
                return reward;
            };
            var reward = loadReward();
            return {
                reward: reward,
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
                        model: c.models.contributionDetail
                    },
                    reward: {
                        getKey: 'project_id',
                        updateKey: 'contribution_id',
                        selectKey: 'reward_id',
                        radios: 'rewards',
                        callToAction: 'Alterar Recompensa',
                        outerLabel: 'Recompensa',
                        getModel: c.models.rewardDetail,
                        updateModel: c.models.contributionDetail,
                        selectedItem: reward,
                        validate: function validate(rewards, newRewardID) {
                            var reward = _.findWhere(rewards, { id: newRewardID });
                            return args.item.value >= reward.minimum_value ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
                        }
                    },
                    refund: {
                        updateKey: 'id',
                        callToAction: 'Reembolso direto',
                        innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                        outerLabel: 'Reembolsar Apoio',
                        model: c.models.contributionDetail
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
                        model: c.models.contributionDetail
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
                return _.extend({}, builder, {
                    requestOptions: {
                        url: '/admin/contributions/' + id + '/gateway_refund',
                        method: 'PUT'
                    }
                });
            };

            return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', [m.component(c.AdminInputAction, {
                data: actions.transfer,
                item: item
            }), ctrl.l() ? h.loader : m.component(c.AdminRadioAction, {
                data: actions.reward,
                item: reward,
                getKeyValue: item.project_id,
                updateKeyValue: item.contribution_id
            }), m.component(c.AdminExternalAction, {
                data: addOptions(actions.refund, item.id),
                item: item
            }), m.component(c.AdminInputAction, {
                data: actions.remove,
                item: item
            })]), m('.w-row.card.card-terciary.u-radius', [m.component(c.AdminTransaction, {
                contribution: item
            }), m.component(c.AdminTransactionHistory, {
                contribution: item
            }), ctrl.l() ? h.loader : m.component(c.AdminReward, {
                reward: reward,
                key: item.key
            })])]);
        }
    };
})(window.m, window._, window.c, window.c.h);
'use strict';

window.c.AdminContributionItem = (function (m, c, h) {
    return {
        controller: function controller() {
            return {
                itemBuilder: [{
                    component: 'AdminContributionUser',
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
                }]
            };
        },

        view: function view(ctrl, args) {
            return m('.w-row', _.map(ctrl.itemBuilder, function (panel) {
                return m(panel.wrapperClass, [m.component(c[panel.component], {
                    item: args.item,
                    key: args.key
                })]);
            }));
        }
    };
})(window.m, window.c, window.c.h);
/**
 * window.c.AdminContributionUser component
 * An itembuilder component that returns additional data
 * to be included in AdminUser.
 *
 * Example:
 * controller: function() {
 *     return {
 *         itemBuilder: [{
 *             component: 'AdminContributionUser',
 *             wrapperClass: '.w-col.w-col-4'
 *         }]
 *     }
 * }
 */
'use strict';

window.c.AdminContributionUser = (function (m) {
    return {
        view: function view(ctrl, args) {
            var item = args.item,
                user = {
                profile_img_thumbnail: item.user_profile_img,
                id: item.user_id,
                name: item.user_name,
                email: item.email
            };

            var additionalData = m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
            return m.component(c.AdminUser, { item: user, additional_data: additionalData });
        }
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
/**
 * window.c.AdminExternalAction component
 * Makes arbitrary ajax requests and update underlying
 * data from source endpoint.
 *
 * Example:
 * m.component(c.AdminExternalAction, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
'use strict';

window.c.AdminExternalAction = (function (m, h, c, _) {
    return {
        controller: function controller(args) {
            var builder = args.data,
                complete = m.prop(false),
                error = m.prop(false),
                fail = m.prop(false),
                data = {},
                item = args.item;

            builder.requestOptions.config = function (xhr) {
                if (window.document.querySelectorAll('meta[name="csrf-token"]').length > 0) {
                    xhr.setRequestHeader('X-CSRF-Token', window.document.querySelectorAll('meta[name="csrf-token"]')[0].content);
                }
            };

            var reload = _.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
                l = m.postgrest.loader(builder.requestOptions, m.request);

            var reloadItem = function reloadItem(data) {
                reload().then(updateItem);
            };

            var requestError = function requestError(err) {
                complete(true);
                error(true);
            };

            var updateItem = function updateItem(res) {
                _.extend(item, res[0]);
                complete(true);
                error(false);
            };

            var submit = function submit() {
                l.load().then(reloadItem, requestError);
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
                l: l,
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
            }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                config: ctrl.unload
            }, [m('form.w-form', {
                onsubmit: ctrl.submit
            }, !ctrl.complete() ? [m('label', data.innerLabel), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Requisição feita com sucesso.')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição.')])])]) : '']);
        }
    };
})(window.m, window.c.h, window.c, window._);
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
                data = args.data,
                label = args.label || '',
                main = _.findWhere(filterBuilder, {
                component: 'FilterMain'
            });

            return m('#admin-contributions-filter.w-section.page-header', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-30', label), m('.w-form', [m('form', {
                onsubmit: args.submit
            }, [_.findWhere(filterBuilder, {
                component: 'FilterMain'
            }) ? m.component(c[main.component], main.data) : '', m('.u-marginbottom-20.w-row', m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
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
                forceValue = builder.forceValue || null,
                newValue = m.prop(forceValue);

            h.idVM.id(item[builder.updateKey]);

            var l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

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
                toggler: h.toggleProp(false, true),
                unload: unload
            };
        },
        view: function view(ctrl, args) {
            var data = args.data,
                btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

            return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
                onclick: ctrl.toggler.toggle
            }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                config: ctrl.unload
            }, [m('form.w-form', {
                onsubmit: ctrl.submit
            }, !ctrl.complete() ? [m('label', data.innerLabel), data.forceValue === undefined ? m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
                onchange: m.withAttr('value', ctrl.newValue),
                value: ctrl.newValue()
            }) : '', m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', data.successMessage)])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição. ' + data.errorMessage)])])]) : '']);
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

            return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [m.component(args.listItem, {
                item: item,
                key: args.key
            }), m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
                onclick: ctrl.displayDetailBox.toggle
            }), ctrl.displayDetailBox() ? m.component(args.listDetail, {
                item: item,
                key: args.key
            }) : '']);
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
                error = args.vm.error,
                label = args.label || '';
            return m('.w-section.section', [m('.w-container', error() ? m('.card.card-error.u-radius.fontweight-bold', error()) : [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-9', [m('.fontsize-base', list.isLoading() ? 'Carregando ' + label.toLowerCase() + '...' : [m('span.fontweight-semibold', list.total()), ' ' + label.toLowerCase() + ' encontrados'])])]), m('#admin-contributions-list.w-container', [list.collection().map(function (item) {
                return m.component(c.AdminItem, {
                    listItem: args.listItem,
                    listDetail: args.listDetail,
                    item: item,
                    key: item.id
                });
            }), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? h.loader() : m('button#load-more.btn.btn-medium.btn-terciary', {
                onclick: list.nextPage
            }, 'Carregar mais')])])])])])])]);
        }
    };
})(window.m, window.c.h, window.c);
/**
 * window.c.AdminNotificationHistory component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminNotificationHistory, {
 *     user: user
 * })
 */

'use strict';

window.c.AdminNotificationHistory = (function (m, h, _, models) {
    return {
        controller: function controller(args) {
            var notifications = m.prop([]),
                getNotifications = function getNotifications(user) {
                var notification = models.notification;
                notification.getPageWithToken(m.postgrest.filtersVM({
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
            return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'), ctrl.notifications().map(function (cEvent) {
                return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-24', [m('.fontcolor-secondary', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', cEvent.template_name, cEvent.origin ? ' - ' + cEvent.origin : '')])]);
            })]);
        }
    };
})(window.m, window.c.h, window._, window.c.models);
/**
 * window.c.AdminProjectDetailsCard component
 * render an box with some project statistics info
 *
 * Example:
 * m.component(c.AdminProjectDetailsCard, {
 *     resource: projectDetail Object,
 * })
 */
'use strict';

window.c.AdminProjectDetailsCard = (function (m, h, moment) {
    return {
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
                return !_.isNull(project.expires_at) && moment().add(8, 'days') >= moment(project.zone_expires_at);
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
                'class': statusTextObj.cssClass
            }, ctrl.isFinalLap() && project.open_for_contributions ? 'RETA FINAL' : statusTextObj.text), ' ']), (function () {
                if (project.is_published) {
                    return [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', {
                        style: {
                            width: (progress > 100 ? 100 : progress) + '%'
                        }
                    })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'financiado'), m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'levantados'), m('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)])]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios'), m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há'), m('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'restam'), m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])];
                }
                return [];
            })()])]);
        }
    };
})(window.m, window.c.h, window.moment);
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

window.c.AdminRadioAction = (function (m, h, c, _) {
    return {
        controller: function controller(args) {
            var builder = args.data,
                complete = m.prop(false),
                data = {},

            //TODO: Implement a descriptor to abstract the initial description
            error = m.prop(false),
                fail = m.prop(false),
                item = args.item(),
                description = m.prop(item.description || ''),
                key = builder.getKey,
                newID = m.prop(''),
                getFilter = {},
                setFilter = {},
                radios = m.prop(),
                getAttr = builder.radios,
                getKey = builder.getKey,
                getKeyValue = args.getKeyValue,
                updateKey = builder.updateKey,
                updateKeyValue = args.updateKeyValue,
                validate = builder.validate,
                selectedItem = builder.selectedItem || m.prop();

            setFilter[updateKey] = 'eq';
            var setVM = m.postgrest.filtersVM(setFilter);
            setVM[updateKey](updateKeyValue);

            getFilter[getKey] = 'eq';
            var getVM = m.postgrest.filtersVM(getFilter);
            getVM[getKey](getKeyValue);

            var getLoader = m.postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

            var setLoader = m.postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

            var updateItem = function updateItem(data) {
                if (data.length > 0) {
                    var newItem = _.findWhere(radios(), {
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
                    if (_.isUndefined(validation)) {
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
                newID: newID,
                submit: submit,
                toggler: h.toggleProp(false, true),
                unload: unload,
                radios: radios
            };
        },
        view: function view(ctrl, args) {
            var data = args.data,
                item = args.item(),
                btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

            return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
                onclick: ctrl.toggler.toggle
            }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                config: ctrl.unload
            }, [m('form.w-form', {
                onsubmit: ctrl.submit
            }, !ctrl.complete() ? [ctrl.radios() ? _.map(ctrl.radios(), function (radio, index) {
                var set = function set() {
                    ctrl.newID(radio.id);
                    ctrl.setDescription(radio.description);
                };
                var selected = radio.id === (item[data.selectKey] || item.id) ? true : false;

                return m('.w-radio', [m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
                    onclick: set
                }), m('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
            }) : h.loader(), m('strong', 'Descrição'), m('p', ctrl.description()), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Recompensa alterada com sucesso!')])] : [m('.w-form-error[style="display:block;"]', [m('p', ctrl.error().message)])])]) : '']);
        }
    };
})(window.m, window.c.h, window.c, window._);
/**
 * window.c.AdminResetPassword component
 * Makes ajax request to update User password.
 *
 * Example:
 * m.component(c.AdminResetPassword, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
'use strict';

window.c.AdminResetPassword = (function (m, h, c, _) {
    return {
        controller: function controller(args) {
            var builder = args.data,
                complete = m.prop(false),
                error = m.prop(false),
                fail = m.prop(false),
                key = builder.property,
                data = {},
                item = args.item;

            builder.requestOptions.config = function (xhr) {
                if (window.document.querySelectorAll('meta[name="csrf-token"]').length > 0) {
                    xhr.setRequestHeader('X-CSRF-Token', window.document.querySelectorAll('meta[name="csrf-token"]')[0].content);
                }
            };

            var l = m.postgrest.loader(_.extend({}, { data: data }, builder.requestOptions), m.request),
                newPassword = m.prop(''),
                error_message = m.prop('');

            var requestError = function requestError(err) {
                error_message(err.errors[0]);
                complete(true);
                error(true);
            };
            var updateItem = function updateItem(res) {
                _.extend(item, res[0]);
                complete(true);
                error(false);
            };

            var submit = function submit() {
                data[key] = newPassword();
                l.load().then(updateItem, requestError);
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
                toggler: h.toggleProp(false, true),
                unload: unload
            };
        },
        view: function view(ctrl, args) {
            var data = args.data,
                btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

            return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
                onclick: ctrl.toggler.toggle
            }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                config: ctrl.unload
            }, [m('form.w-form', {
                onsubmit: ctrl.submit
            }, !ctrl.complete() ? [m('label', data.innerLabel), m('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
                onchange: m.withAttr('value', ctrl.newPassword),
                value: ctrl.newPassword()
            }), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Senha alterada com sucesso.')])] : [m('.w-form-error[style="display:block;"]', [m('p', ctrl.error_message())])])]) : '']);
        }
    };
})(window.m, window.c.h, window.c, window._);
'use strict';

window.c.AdminReward = (function (m, c, h, _) {
    return {
        view: function view(ctrl, args) {
            var reward = args.reward(),
                available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

            return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, m('br'), 'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3), m('br'), m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m('br'), 'Descrição: ' + reward.description] : 'Apoio sem recompensa')]);
        }
    };
})(window.m, window.c, window.c.h, window._);
'use strict';

window.c.AdminTransactionHistory = (function (m, h, _) {
    return {
        controller: function controller(args) {
            var contribution = args.contribution,
                mapEvents = _.reduce([{
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
/**
 * window.c.AdminUserDetail component
 * Return action inputs to be used inside AdminList component.
 *
 * Example:
 * m.component(c.AdminList, {
 *     data: {},
 *     listDetail: c.AdminUserDetail
 * })
 */
'use strict';

window.c.AdminUserDetail = (function (m, _, c) {
    return {
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
                details = args.details;

            var addOptions = function addOptions(builder, id) {
                return _.extend({}, builder, {
                    requestOptions: {
                        url: '/users/' + id + '/new_password',
                        method: 'POST'
                    }
                });
            };

            return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', [m.component(c.AdminResetPassword, {
                data: addOptions(actions.reset, item.id),
                item: item
            }), item.deactivated_at ? m.component(c.AdminInputAction, { data: actions.reactivate, item: item }) : '']), m('.w-row.card.card-terciary.u-radius', [m.component(c.AdminNotificationHistory, {
                user: item
            })])]);
        }
    };
})(window.m, window._, window.c);
'use strict';

window.c.AdminUserItem = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            return m('.w-row', [m('.w-col.w-col-4', [m.component(c.AdminUser, args)])]);
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.AdminUser = (function (m, h) {
    return {
        view: function view(ctrl, args) {
            var user = args.item;
            return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m('.fontsize-smallest', 'Usuário: ' + user.id), m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
        }
    };
})(window.m, window.c.h);
/**
 * window.c.AonAdminProjectDetailsExplanation component
 * render an explanation about project all or nothing project mde.
 *
 * Example:
 * m.component(c.AonAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
'use strict';

window.c.AonAdminProjectDetailsExplanation = (function (m, h) {
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
/**
 * window.c.CategoryButton component
 * Return a link with a btn-category class.
 * It uses a category parameter.
 *
 * Example:
 * m.component(c.CategoryButton, {
 *     category: {
 *         id: 1,
 *         name: 'Video',
 *         online_projects: 1
 *     }
 * })
 */
'use strict';

window.c.CategoryButton = (function (m, c) {
    return {
        view: function view(ctrl, args) {
            var category = args.category;
            return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.w-inline-block.btn-category' + (category.name.length > 13 ? '.double-line' : '') + '[href=\'#by_category_id/' + category.id + '\']', [m('div', [category.name, m('span.badge.explore', category.online_projects)])])]);
        }
    };
})(window.m, window.c);
/**
 * window.c.FilterButton component
 * Return a link with a filters class.
 * It uses a href and a title parameter.
 *
 * Example:
 * m.component(c.FilterButton, {
 *     title: 'Filter by category',
 *     href: 'filter_by_category'
 * })
 */
'use strict';

window.c.FilterButton = (function (m, c) {
    return {
        view: function view(ctrl, args) {
            var title = args.title,
                href = args.href;
            return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.w-inline-block.btn-category.filters' + (title.length > 13 ? '.double-line' : '') + '[href=\'#' + href + '\']', [m('div', [title])])]);
        }
    };
})(window.m, window.c);
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
            return m('.w-row', [m('.w-col.w-col-10', [m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', {
                onchange: m.withAttr('value', args.vm),
                value: args.vm()
            })]), m('.w-col.w-col-2', [m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]')])]);
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
/**
 * window.c.FlexAdminProjectDetailsExplanation component
 * render an explanation about project flex project mde.
 *
 * Example:
 * m.component(c.FlexAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
'use strict';

window.c.FlexAdminProjectDetailsExplanation = (function (m, h, _) {
    return {
        controller: function controller(args) {
            var explanation = function explanation(resource) {
                var stateText = {
                    online: [_.isNull(resource.expires_at) ? m('span', [m('a.alt-link[href="/projects/' + resource.id + '/edit#announce_expiration"]', 'Quero iniciar'), ' a reta final de 7 dias']) : m('span', 'Você recebe tudo que arrecadar até as ' + h.momentify(resource.zone_expires_at, 'HH:mm:ss') + ' de ' + h.momentify(resource.zone_expires_at))],
                    successful: [m('span.fontweight-semibold', resource.user.name + ', comemore que você merece!'), ' Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ', 'Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ', m('a.alt-link[href="/guides"]', 'Guia dos Realizadores'), ' e de informar-se sobre ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')],
                    waiting_funds: [m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'), ' Seu projeto foi finalizado em ' + h.momentify(resource.zone_expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ', 'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.')],
                    rejected: [m('span.fontweight-semibold', resource.user.name + ', infelizmente não foi desta vez.'), ' Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ', 'Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ', 'Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', 'critérios da plataforma'), ' e no ', m('a.alt-link[href="/guides"]', 'guia dos realizadores'), '.'],
                    draft: [m('span.fontweight-semibold', resource.user.name + ', construa o seu projeto!'), ' Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ', 'Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ', 'Quando tudo estiver pronto, clique no botão PUBLICAR.']
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
})(window.m, window.c.h, window._);
/**
 * window.c.landingQA component
 * A visual component that displays a question/answer box with toggle
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingQA, {
 *          question: 'Whats your name?',
 *          answer: 'Darth Vader.'
 *      })
 *      ...
 *  }
 */
'use strict';

window.c.landingQA = (function (m, h) {
    return {
        controller: function controller(args) {
            return {
                showAnswer: h.toggleProp(false, true)
            };
        },
        view: function view(ctrl, args) {
            return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', {
                onclick: ctrl.showAnswer.toggle
            }, [m('.fontsize-base', args.question), ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', args.answer) : '']);
        }
    };
})(window.m, window.c.h);
/**
 * window.c.landingSignup component
 * A visual component that displays signup email typically used on landing pages.
 * It accepts a custom form action to attach to third-party services like Mailchimp
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingSignup, {
 *          builder: {
 *              customAction: 'http://formendpoint.com'
 *          }
 *      })
 *      ...
 *  }
 */
'use strict';

window.c.landingSignup = (function (m, h) {
    return {
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
                onchange: m.withAttr('value', ctrl.email),
                value: ctrl.email()
            }), ctrl.error() ? m('span.fontsize-smaller.text-error', 'E-mail inválido') : '']), m('.w-col.w-col-3', [m('input.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')])]);
        }
    };
})(window.m, window.c.h);
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

window.c.PopNotification = (function (m, h) {
    return {
        controller: function controller() {
            var displayNotification = h.toggleProp(true, false);

            return {
                displayNotification: displayNotification
            };
        },
        view: function view(ctrl, args) {
            return ctrl.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', [m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
                onclick: ctrl.displayNotification.toggle
            }), m('.fontsize-small', args.message)]) : m('span');
        }
    };
})(window.m, window.c.h);
'use strict';

window.c.ProjectAbout = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            var project = args.project,
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
            }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)), project.budget ? [m('p.fontsize-base.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))] : '']), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(c.ProjectRewardList, {
                project: project,
                rewardDetails: args.rewardDetails
            }), fundingPeriod()] : [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), m.component(c.ProjectSuggestedContributions, { project: project }), fundingPeriod()])]);
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.ProjectCard = (function (m, h, models, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'projects.card');

    return {
        view: function view(ctrl, args) {
            var project = args.project,
                progress = project.progress.toFixed(2),
                remainingTextObj = h.translatedTime(project.remaining_time),
                link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : '');

            return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + link + '"]', {
                style: {
                    'background-image': 'url(' + project.project_img + ')',
                    'display': 'block'
                }
            }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', I18n.t('by', I18nScope()) + ' ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m('.card-project-meter.' + project.state, [_.contains(['successful', 'failed', 'waiting_funds'], project.state) ? m('div', I18n.t('display_status.' + project.state, I18nScope())) : m('.meter', [m('.meter-fill', {
                style: {
                    width: (progress > 100 ? 100 : progress) + '%'
                }
            })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [m('.fontsize-smallest.lineheight-tight', ['Prazo em', m('br'), 'aberto'])])])])])]);
        }
    };
})(window.m, window.c.h, window._, window.I18n);
'use strict';

window.c.ProjectComments = (function (m, c, h) {
    return {
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
            var project = args.project;
            return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() });
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.ProjectContributions = (function (m, models, h, _) {
    return {
        controller: function controller(args) {
            var listVM = m.postgrest.paginationVM(models.projectContribution),
                filterVM = m.postgrest.filtersVM({
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

            filterVM.project_id(args.project.id).waiting_payment(false);

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
            return m('#project_contributions.content.w-col.w-col-12', [args.project.is_owner_or_admin ? m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
                onclick: ctrl.toggleWaiting()
            })]), m('.w-col.w-col-5', [m('label[for="contribution_state_available_to_count"]', 'Confirmados')]), m('.w-col.w-col-1', [m('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
                onclick: ctrl.toggleWaiting(true)
            })]), m('.w-col.w-col-5', [m('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')])]) : '', m('.project-contributions', _.map(list.collection(), function (contribution) {
                return m('.w-clearfix', [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('a[href="/users/' + contribution.user_id + '"]', [m('.thumb.u-left.u-round[style="background-image: url(' + (!_.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')])]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', [m('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), contribution.is_owner_or_admin ? m('.fontsize-smaller', ['R$ ' + h.formatNumber(contribution.value, 2, 3), contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '']) : '', m('.fontsize-smaller', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'), m('.fontsize-smaller', contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora')])])]), m('.divider.u-marginbottom-20')]);
            })), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                onclick: list.nextPage
            }, 'Carregar mais') : h.loader()])])]);
        }
    };
})(window.m, window.c.models, window.c.h, window._);
/**
 * window.c.ProjectDashboardMenu component
 * build dashboard project menu for project owners
 * and admin.
 *
 * Example:
 * m.component(c.ProjectDashboardMenu, {
 *     project: projectDetail Object,
 * })
 */
'use strict';

window.c.ProjectDashboardMenu = (function (m, _, h) {
    return {
        controller: function controller(args) {
            var body = document.getElementsByTagName('body')[0],
                editLinksToggle = h.toggleProp(false, true),
                bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed');

            if (!args.project.is_published) {
                editLinksToggle.toggle();
            }

            return {
                body: body,
                editLinksToggle: editLinksToggle,
                bodyToggleForNav: bodyToggleForNav
            };
        },
        view: function view(ctrl, args) {
            var project = args.project,
                projectRoute = '/projects/' + project.id,
                editRoute = projectRoute + '/edit',
                editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');
            var optionalOpt = project.mode === 'flex' ? m('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

            ctrl.body.className = ctrl.bodyToggleForNav();

            return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (_.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), ' Minha Campanha']), project.is_published ? [m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), ' Relatórios de apoios']), m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), ' Novidades ', m('span.badge', project.posts_count)])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
                onclick: ctrl.editLinksToggle.toggle
            }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), ' Editar projeto']), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', project.mode === 'aon' ? 'Meta e prazo' : 'Financiamento')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', ['Orçamento', optionalOpt]), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published ? [m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', 'Enviar') : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/edit#preview"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' ? [m('.btn-send-draft-fixed', _.isNull(project.expires_at) ? m('a.w-button.btn.btn-small.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', 'Iniciar reta final') : '')] : '']])])]), m('a.btn-dashboard href="js:void(0);"', {
                onclick: ctrl.bodyToggleForNav.toggle
            }, [m('span.fa.fa-bars.fa-lg')])]);
        }
    };
})(window.m, window._, window.c.h);
/**
 * window.c.ProjectDataChart component
 * A graph builder interface to be used on project related dashboards.
 * Example:
 * m.component(c.ProjectDataChart, {
 *     collection: ctrl.contributionsPerDay,
 *     label: 'R$ arrecadados por dia',
 *     dataKey: 'total_amount'
 * })
 */
'use strict';

window.c.ProjectDataChart = (function (m, Chart, _) {
    return {
        controller: function controller(args) {
            var resource = _.first(args.collection()),
                source = !_.isUndefined(resource) ? resource.source : [],
                mountDataset = function mountDataset() {
                return [{
                    fillColor: 'rgba(126,194,69,0.2)',
                    strokeColor: 'rgba(126,194,69,1)',
                    pointColor: 'rgba(126,194,69,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,220,220,1)',
                    data: _.map(source, function (item) {
                        return item[args.dataKey];
                    })
                }];
            },
                renderChart = function renderChart(element, isInitialized) {
                if (!isInitialized) {
                    var ctx = element.getContext('2d');

                    new Chart(ctx).Line({
                        labels: _.map(source, function (item) {
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
})(window.m, window.Chart, window._);
/**
 * window.c.ProjectDataTable component
 * A table interface constructor that should be used on project related dashboards.
 * It takes an array and a lable as it's sources.
 * The first item in the array is the header descriptor and the rest of them are row data.
 * Rows may return a string or an array and this value will be used as a row output.
 * All table rows are sortable by default. If you want to use a custom value as sort parameter
 * you may set a 2D array as row. In this case, the first array value will be the custom value
 * while the other will be the actual output.
 * Example:
 * m.component(c.ProjectDataTable, {
 *      label: 'Table label',
 *      table: [
 *          ['col header 1', 'col header 2'],
 *          ['value 1x1', [3, 'value 1x2']],
 *          ['value 2x1', [1, 'value 2x2']] //We are using a custom comparator two col 2 values
 *      ],
 *      //Allows you to set a specific column to be ordered by default.
 *      //If no value is set, the first row will be the default one to be ordered.
 *      //Negative values mean that the order should be reverted
 *      defaultSortIndex: -3
 *  })
 */
'use strict';

window.c.ProjectDataTable = (function (m, models, h, _) {
    return {
        controller: function controller(args) {
            var table = m.prop(args.table),
                sortIndex = m.prop(-1);

            var comparator = function comparator(a, b) {
                var idx = sortIndex(),

                //Check if a custom comparator is used => Read component description
                x = _.isArray(a[idx]) && a[idx].length > 1 ? a[idx][0] : a[idx],
                    y = _.isArray(b[idx]) && b[idx].length > 1 ? b[idx][0] : b[idx];

                if (x < y) {
                    return -1;
                }
                if (y < x) {
                    return 1;
                }
                return 0;
            };

            var sortTable = function sortTable(idx) {
                var header = _.first(table()),
                    body = undefined;
                if (sortIndex() === idx) {
                    body = _.rest(table()).reverse();
                } else {
                    sortIndex(idx);
                    body = _.rest(table()).sort(comparator);
                }

                table(_.union([header], body));
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
            var header = _.first(ctrl.table()),
                body = _.rest(ctrl.table());
            return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _.map(header, function (heading, idx) {
                var sort = function sort() {
                    return ctrl.sortTable(idx);
                };
                return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('a.link-hidden[href="javascript:void(0);"]', {
                    onclick: sort
                }, [heading + ' ', m('span.fa.fa-sort')])]);
            })), m('.table-inner.fontsize-small', _.map(body, function (rowData) {
                return m('.w-row.table-row', _.map(rowData, function (row) {
                    //Check if a custom comparator is used => Read component description
                    row = _.isArray(row) && row.length > 1 ? row[1] : row;
                    return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', row)]);
                }));
            }))]);
        }
    };
})(window.m, window.c.models, window.c.h, window._);
'use strict';

window.c.ProjectHeader = (function (m, c) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            return m('#project-header', [m('.w-section.section-product.' + project.mode), m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['por ', project.user.name])])]), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {
                project: project
            })), m('.w-col.w-col-4', m.component(c.ProjectSidebar, {
                project: project,
                userDetails: args.userDetails
            }))])])])]);
        }
    };
})(window.m, window.c);
'use strict';

window.c.ProjectHighlight = (function (m, _, h, c) {
    return {
        controller: function controller() {
            var displayShareBox = h.toggleProp(false, true);

            return {
                displayShareBox: displayShareBox
            };
        },
        view: function view(ctrl, args) {
            var project = args.project;
            return m('#project-highlight', [project.video_embed_url ? m('.w-embed.w-video.project-video', {
                style: 'min-height: 240px;'
            }, [m('iframe.embedly-embed[itemprop="video"][src="' + project.video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m('.project-image', {
                style: 'background-image:url(' + project.original_image + ');'
            }), m('.project-blurb', project.headline), m('.u-text-center-small-only.u-marginbottom-30', [!_.isNull(project.address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + project.address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project.category_id + '"]', [m('span.fa.fa-tag'), ' ', project.category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
                onclick: ctrl.displayShareBox.toggle
            }, 'Compartilhar'), ctrl.displayShareBox() ? m.component(c.ProjectShareBox, {
                project: project,
                displayShareBox: ctrl.displayShareBox
            }) : ''])]);
        }
    };
})(window.m, window._, window.c.h, window.c);
'use strict';

window.c.ProjectMain = (function (m, c, _, h) {
    return {
        controller: function controller(args) {
            var project = args.project,
                displayTabContent = function displayTabContent() {
                var hash = window.location.hash,
                    c_opts = {
                    project: project
                },
                    tabs = {
                    '#rewards': m('.w-col.w-col-12', m.component(c.ProjectRewardList, _.extend({}, {
                        rewardDetails: args.rewardDetails
                    }, c_opts))),
                    '#contribution_suggestions': m.component(c.ProjectSuggestedContributions, c_opts),
                    '#contributions': m.component(c.ProjectContributions, c_opts),
                    '#about': m.component(c.ProjectAbout, _.extend({}, {
                        rewardDetails: args.rewardDetails
                    }, c_opts)),
                    '#comments': m.component(c.ProjectComments, c_opts),
                    '#posts': m.component(c.ProjectPosts, c_opts)
                };

                if (_.isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                    return tabs['#about'];
                }

                return tabs[hash];
            };

            window.addEventListener('hashchange', m.redraw, false);

            return {
                displayTabContent: displayTabContent
            };
        },

        view: function view(ctrl) {
            return m('section.section[itemtype="http://schema.org/CreativeWork"]', [m('.w-container', [m('.w-row', ctrl.displayTabContent())])]);
        }
    };
})(window.m, window.c, window._, window.c.h);
/**
 * window.c.ProjectMode component
 * A simple component that displays a badge with the current project mode
 * together with a description of the mode, shown inside a tooltip.
 * It receives a project as resource
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectMode, {project: project})
 *  }
 */
'use strict';

window.c.ProjectMode = (function (m, c, h, _) {
    return {
        controller: function controller(args) {
            var project = args.project,
                mode = project.mode,
                tooltipText = mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.';

            return {
                mode: mode,
                tooltipText: tooltipText
            };
        },
        view: function view(ctrl, args) {
            var mode = ctrl.mode,
                modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
                modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
                goal = _.isNull(args.project.goal) ? 'não definida' : h.formatNumber(args.project.goal),
                tooltip = function tooltip(el) {
                return m.component(c.Tooltip, {
                    el: el,
                    text: ctrl.tooltipText,
                    width: 280
                });
            };

            return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('img[src="' + modeImgSrc + '"][width=\'30\']')]), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-smaller.fontweight-semibold', 'Meta R$ ' + goal), m('.w-inline-block.fontsize-smallest._w-inline-block', [modeTitle, tooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
        }
    };
})(window.m, window.c, window.c.h, window._);
'use strict';

window.c.ProjectPosts = (function (m, models, h, _) {
    return {
        controller: function controller(args) {
            var listVM = m.postgrest.paginationVM(models.projectPostDetail),
                filterVM = m.postgrest.filtersVM({
                project_id: 'eq'
            });

            filterVM.project_id(args.project.id);

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
                project = args.project;

            return m('.project-posts.w-section', [m('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _.isEmpty(list.collection()) ? m('.w-hidden-small.w-hidden-tiny', [m('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '' : '', m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.id + '/edit#posts\']', 'Escrever novidade')]), m('.w-col.w-col-4')])] : '', _.map(list.collection(), function (post) {
                return m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [m('.post', [m('.u-marginbottom-60 .w-clearfix', [m('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)), m('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title), !_.isEmpty(post.comment_html) ? m('.fontsize-base', m.trust(post.comment_html)) : m('.fontsize-base', 'Post exclusivo para apoiadores.')]), m('.divider.u-marginbottom-60')])]), m('.w-col.w-col-1')]);
            }), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                onclick: list.nextPage
            }, 'Carregar mais') : h.loader()])])])]);
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
/**
 * window.c.ProjectReminder component
 * A component that displays a clickable project reminder element.
 * The component can be of two types: a 'link' or a 'button'
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectReminder, {project: project, type: 'button'})
 *  }
 */
'use strict';

window.c.ProjectReminder = (function (m, models, h, c) {
    return {
        controller: function controller(args) {
            var project = args.project,
                filterVM = m.postgrest.filtersVM({
                project_id: 'eq'
            }),
                storeReminderName = 'remind_' + project.id,
                l = m.prop(false),
                popNotification = m.prop(false),
                submitReminder = function submitReminder() {
                if (!h.getUser()) {
                    h.storeAction(storeReminderName, submitReminder);
                    return h.navigateToDevise();
                }
                var loaderOpts = project.in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                    project_id: project.id
                });
                l = m.postgrest.loaderWithToken(loaderOpts);

                l.load().then(function () {
                    project.in_reminder = !project.in_reminder;

                    if (project.in_reminder) {
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
            filterVM.project_id(project.id);

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

            return m('#project-reminder' + mainClass, [m('button[class="' + buttonClass + ' ' + (project.in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
                onclick: ctrl.submitReminder
            }, [ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', [m('span' + (hideTextOnMobile ? '.w-hidden-medium' : ''), project.in_reminder ? ' Lembrete ativo' : ' Lembrar-me')])]), ctrl.popNotification() ? m.component(c.PopNotification, {
                message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
            }) : '']);
        }
    };
})(window.m, window.c.models, window.c.h, window.c);
'use strict';

window.c.ProjectRewardList = (function (m, h, _) {
    return {
        view: function view(ctrl, args) {
            //FIXME: MISSING ADJUSTS
            // - add draft admin modifications
            var project = args.project;
            return m('#rewards.u-marginbottom-30', _.map(args.rewardDetails(), function (reward) {
                var contributionUrlWithReward = '/projects/' + project.id + '/contributions/new?reward_id=' + reward.id;

                return m('a[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project.open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project.open_for_contributions && !h.rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [m('.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'), m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h.rewardSouldOut(reward) ? m('.u-margintop-10', [m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m('.u-margintop-10', [m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', 'Limitada'), ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(reward.description))), !_.isEmpty(reward.deliver_at) ? m('.fontsize-smaller', [m('b', 'Estimativa de Entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project.open_for_contributions && !h.rewardSouldOut(reward) ? m('.project-reward-box-hover', [m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
            }));
        }
    };
})(window.m, window.c.h, window._);
'use strict';

window.c.ProjectRow = (function (m, _, h) {
    return {
        view: function view(ctrl, args) {
            var collection = args.collection,
                ref = args.ref,
                wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';
            return m(wrapper, [m('.w-container', [!_.isUndefined(collection.title) || !_.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.collection().length ? m('.w-row', _.map(collection.collection(), function (project) {
                return m.component(c.ProjectCard, {
                    project: project,
                    ref: ref
                });
            })) : h.loader()])]);
        }
    };
})(window.m, window._, window.c.h);
'use strict';

window.c.ProjectShareBox = (function (m, h) {
    return {
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
            }, 'Fechar'), m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project.name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dtwitter&via=catarse"]')]), m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
                onclick: ctrl.displayEmbed.toggle
            }, '< embed >'), ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m('.w-form', [m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project.id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m('.card-embed', [m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project.id + '/embed"][width="300px"][scrolling="no"]')])]) : '', m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project.permalink + '?ref=facebook&title=' + args.project.name + '"][target="_blank"]', [m('span.fa.fa-facebook'), ' Compartilhe']), m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project.name + ' htts://www.catarse.me/' + args.project.permalink + '?ref=twitterr"][target="_blank"]', [m('span.fa.fa-twitter'), ' Tweet'])]);
        }
    };
})(window.m, window.c.h);
'use strict';

window.c.ProjectSidebar = (function (m, h, c, _, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'projects.project_sidebar');

    return {
        controller: function controller(args) {
            var project = args.project,
                animateProgress = function animateProgress(el, isInitialized) {
                if (!isInitialized) {
                    (function () {
                        var animation = undefined,
                            progress = 0,
                            pledged = 0,
                            contributors = 0,
                            pledgedIncrement = project.pledged / project.progress,
                            contributorsIncrement = project.total_contributors / project.progress;

                        var progressBar = document.getElementById('progressBar'),
                            pledgedEl = document.getElementById('pledged'),
                            contributorsEl = document.getElementById('contributors'),
                            animate = function animate() {
                            animation = setInterval(incrementProgress, 28);
                        },
                            incrementProgress = function incrementProgress() {
                            if (progress <= parseInt(project.progress)) {
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
            },
                displayCardClass = function displayCardClass() {
                var states = {
                    'waiting_funds': 'card-waiting',
                    'successful': 'card-success',
                    'failed': 'card-error',
                    'draft': 'card-dark',
                    'in_analysis': 'card-dark',
                    'approved': 'card-dark'
                };

                return states[project.state] ? 'card u-radius zindex-10 ' + states[project.state] : '';
            },
                displayStatusText = function displayStatusText() {
                var states = {
                    'approved': I18n.t('display_status.approved', I18nScope()),
                    'online': h.existy(project.zone_expires_at) ? I18n.t('display_status.online', I18nScope({ date: h.momentify(project.zone_expires_at) })) : '',
                    'failed': I18n.t('display_status.failed', I18nScope({ date: h.momentify(project.zone_expires_at), goal: project.goal })),
                    'rejected': I18n.t('display_status.rejected', I18nScope()),
                    'in_analysis': I18n.t('display_status.in_analysis', I18nScope()),
                    'successful': I18n.t('display_status.successful', I18nScope({ date: h.momentify(project.zone_expires_at) })),
                    'waiting_funds': I18n.t('display_status.waiting_funds', I18nScope()),
                    'draft': I18n.t('display_status.draft', I18nScope())
                };

                return states[project.state];
            };

            return {
                animateProgress: animateProgress,
                displayCardClass: displayCardClass,
                displayStatusText: displayStatusText
            };
        },

        view: function view(ctrl, args) {
            var project = args.project,
                elapsed = project.elapsed_time,
                remaining = project.remaining_time;

            return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-small.u-text-center-small-only', [I18n.t('contributors_call', I18nScope()), m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({ count: project.total_contributors }))), !project.expires_at ? ' em ' + I18n.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
                style: {
                    width: project.progress + '%'
                }
            })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', parseInt(project.progress) + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n.t('remaining_time.' + remaining.unit, I18nScope({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(c.ProjectMode, {
                project: project
            })])]), project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', I18n.t('submit', I18nScope())) : '', project.open_for_contributions ? m.component(c.ProjectReminder, {
                project: project,
                type: 'link'
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + ctrl.displayCardClass() + '"]', ctrl.displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
                userDetails: args.userDetails
            }))]);
        }
    };
})(window.m, window.c.h, window.c, window._, window.I18n);
/**
 * window.c.ProjectSuggestedContributions component
 * A Project-show page helper to show suggested amounts of contributions
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.ProjectSuggestedContributions, {project: project})
 *   ...
 * }
 */

'use strict';

window.c.ProjectSuggestedContributions = (function (m, c, _) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            var suggestionUrl = function suggestionUrl(amount) {
                return '/projects/' + project.project_id + '/contributions/new?amount=' + amount;
            },
                suggestedValues = [10, 25, 50, 100];

            return m('#suggestions', _.map(suggestedValues, function (amount) {
                return m('a[href="' + suggestionUrl(amount) + '"].card-reward.card-big.card-secondary.u-marginbottom-20', [m('.fontsize-larger', 'R$ ' + amount)]);
            }));
        }
    };
})(window.m, window.c, window._);
'use strict';

window.c.ProjectTabs = (function (m, h) {
    return {
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

            var mainClass = !ctrl.isFixed() || project.is_owner_or_admin ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

            return m('nav-wrapper', [m(mainClass, {
                config: ctrl.navDisplay
            }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
                style: 'float: left;'
            }, 'Recompensas') : m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
                style: 'float: left;'
            }, 'Valores Sugeridos'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
                style: 'float: left;'
            }, 'Sobre'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
                style: 'float: left;'
            }, ['Novidades ', m('span.badge', project.posts_count)]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
                style: 'float: left;'
            }, ['Apoios ', m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
                style: 'float: left;'
            }, ['Comentários ', m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))])]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project.open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6.w-col-medium-4', [m.component(c.ProjectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '')])])]), ctrl.isFixed() && !project.is_owner_or_admin ? m('.w-section.project-nav') : '']);
        }
    };
})(window.m, window.c.h);
'use strict';

window.c.ProjectUserCard = (function (m, _, h) {
    return {
        view: function view(ctrl, args) {
            return m('#user-card', _.map(args.userDetails(), function (userDetail) {
                return m('.u-marginbottom-30.u-text-center-small-only', [m('.w-row', [m('.w-col.w-col-4', [m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m('.w-col.w-col-8', [m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m('.fontsize-smallest', [h.pluralize(userDetail.total_published_projects, ' criado', ' criados'), m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_.isEmpty(userDetail.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_.isEmpty(userDetail.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _.map(userDetail.links, function (link) {
                    var parsedLink = h.parseUrl(link);

                    return !_.isEmpty(parsedLink.hostname) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)]) : '';
                })]), !_.isEmpty(userDetail.email) ? m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.alt-link.fontweight-semibold[itemprop="email"][target="_blank"]', userDetail.email) : ''])])]);
            }));
        }
    };
})(window.m, window._, window.c.h);
/**
 * window.c.Slider component
 * Build a slider from any array of mithril elements
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.Slider, {
 *         slides: [m('slide1'), m('slide2'), m('slide3')],
 *         title: 'O que estão dizendo por aí...'
 *     })
 *     ...
 * }
 */
'use strict';

window.c.Slider = (function (m, _) {
    return {
        controller: function controller(args) {
            var interval = undefined;
            var selectedSlideIdx = m.prop(0),
                translationSize = m.prop(1600),
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
                }, 6500);
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
            var sliderClick = function sliderClick(fn, param) {
                fn(param);
                ctrl.resetSliderTimer();
            };

            return m('.w-slider.slide-testimonials', {
                config: ctrl.config
            }, [m('.fontsize-larger', args.title), m('.w-slider-mask', [_.map(args.slides, function (slide, idx) {
                var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                    translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

                return m('.slide.w-slide.slide-testimonials-content', {
                    style: 'transform: ' + translateStr + '; -webkit-transform: ' + translateStr + '; -ms-transform:' + translateStr + ';'
                }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2', slide)])])]);
            }), m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return sliderClick(ctrl.decrementSlide);
                }
            }, [m('.w-icon-slider-left.fa.fa-chevron-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return sliderClick(ctrl.incrementSlide);
                }
            }, [m('.w-icon-slider-right.fa.fa-chevron-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times(function (idx) {
                return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                    onclick: function onclick() {
                        return sliderClick(ctrl.selectedSlideIdx, idx);
                    }
                });
            }))])]);
        }
    };
})(window.m, window._);
'use strict';

window.c.TeamMembers = (function (_, m, models) {
    return {
        controller: function controller() {
            var vm = {
                collection: m.prop([])
            },
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

        view: function view(ctrl) {
            return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
                return m('.w-container', [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m('.w-col.w-col-2')])]);
            })]);
        }
    };
})(window.m, window.c.h, window.c.models);
/**
 * window.c.Tooltip component
 * A component that allows you to show a tooltip on
 * a specified element hover. It receives the element you want
 * to trigger the tooltip and also the text to display as tooltip.
 *
 * Example of use:
 * view: () => {
 *     let tooltip = (el) => {
 *          return m.component(c.Tooltip, {
 *              el: el,
 *              text: 'text to tooltip',
 *              width: 300
 *          })
 *     }
 *
 *     return tooltip('a#link-wth-tooltip[href="#"]');
 *
 * }
 */
'use strict';

window.c.Tooltip = (function (m, c, h) {
    return {
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
})(window.m, window.c, window.c.h);
'use strict';

window.c.UserCard = (function (m, _, models, h) {
    return {
        controller: function controller(args) {
            var vm = h.idVM,
                userDetails = m.prop([]);

            vm.id(args.userId);

            //FIXME: can call anon requests when token fails (requestMaybeWithToken)
            models.userDetail.getRowWithToken(vm.parameters()).then(userDetails);

            return {
                userDetails: userDetails
            };
        },
        view: function view(ctrl) {
            return m('#user-card', _.map(ctrl.userDetails(), function (userDetail) {
                return m('.card.card-user.u-radius.u-marginbottom-30[itemprop="author"]', [m('.w-row', [m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', [m('img.thumb.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop="name"]', [m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m('.fontsize-smallest.lineheight-looser[itemprop="address"]', userDetail.address_city), m('.fontsize-smallest', userDetail.total_published_projects + ' projetos criados'), m('.fontsize-smallest', 'apoiou ' + userDetail.total_contributed_projects + ' projetos')])]), m('.project-author-contacts', [m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [!_.isEmpty(userDetail.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_.isEmpty(userDetail.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _.map(userDetail.links, function (link) {
                    return m('li', [m('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)]);
                })])]), !_.isEmpty(userDetail.email) ? m('a.btn.btn-medium.btn-message[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '']);
            }));
        }
    };
})(window.m, window._, window.c.models, window.c.h);
/**
 * window.c.youtubeLightbox component
 * A visual component that displays a lightbox with a youtube video
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.youtubeLightbox, {src: 'https://www.youtube.com/watch?v=FlFTcDSKnLM'})
 *      ...
 *  }
 */
'use strict';

window.c.YoutubeLightbox = (function (m, c, h, models) {
    return {
        controller: function controller() {
            var showLightbox = h.toggleProp(false, true);

            return {
                showLightbox: showLightbox
            };
        },
        view: function view(ctrl, args) {
            return m('#youtube-lightbox', [m('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', { onclick: ctrl.showLightbox.toggle }), ctrl.showLightbox() ? m('#lightbox.w-lightbox-backdrop', [m('.w-lightbox-container', [m('.w-lightbox-content', [m('.w-lightbox-view', [m('.w-lightbox-frame', [m('figure.w-lightbox-figure', [m('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m('iframe#video-lightbox.embedly-embed.w-lightbox-embed[allowfullscreen=\'\'][frameborder=\'0\'][height=\'528\'][scrolling=\'no\'][src=\'https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FFlFTcDSKnLM%3Fautoplay%3D1%26feature%3Doembed&url=' + encodeURI(args.src) + '&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FFlFTcDSKnLM%2Fhqdefault.jpg&key=c4e54deccf4d4ec997a64902e9a30300&autoplay=1&type=text%2Fhtml&schema=youtube\'][width=\'940\']')])])]), m('.w-lightbox-spinner.w-lightbox-hide'), m('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.showLightbox.toggle })]), m('.w-lightbox-strip')])]) : '']);
        }
    };
})(window.m, window.c, window.c.h, window.c.models);
'use strict';

window.c.admin.Contributions = (function (m, c, h) {
    var admin = c.admin;
    return {
        controller: function controller() {
            var listVM = admin.contributionListVM,
                filterVM = admin.contributionFilterVM,
                error = m.prop(''),
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
            return [m.component(c.AdminFilter, {
                form: ctrl.filterVM.formDescriber,
                filterBuilder: ctrl.filterBuilder,
                submit: ctrl.submit
            }), m.component(c.AdminList, {
                vm: ctrl.listVM,
                listItem: c.AdminContributionItem,
                listDetail: c.AdminContributionDetail
            })];
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.admin.Users = (function (m, c, h) {
    var admin = c.admin;
    return {
        controller: function controller() {
            var listVM = admin.userListVM,
                filterVM = admin.userFilterVM,
                error = m.prop(''),
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

            return [m.component(c.AdminFilter, {
                form: ctrl.filterVM.formDescriber,
                filterBuilder: ctrl.filterBuilder,
                label: label,
                submit: ctrl.submit
            }), m.component(c.AdminList, {
                vm: ctrl.listVM,
                label: label,
                listItem: c.AdminUserItem,
                listDetail: c.AdminUserDetail
            })];
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.root.Flex = (function (m, c, h, models) {
    return {
        controller: function controller() {
            var stats = m.prop([]),
                projects = m.prop([]),
                l = m.prop(),
                sample3 = _.partial(_.sample, _, 3),
                builder = {
                customAction: '//catarse.us5.list-manage.com/subscribe/post?u=ebfcd0d16dbb0001a0bea3639&amp;id=8a4c1a33ce'
            },
                addDisqus = function addDisqus(el, isInitialized) {
                if (!isInitialized) {
                    h.discuss('https://catarse.me/flex', 'flex_page');
                }
            },
                flexVM = m.postgrest.filtersVM({
                mode: 'eq',
                state: 'eq'
            }),
                statsLoader = m.postgrest.loaderWithToken(models.statistic.getRowOptions());

            flexVM.mode('flex').state('online');

            var projectsLoader = m.postgrest.loader(models.project.getPageOptions(flexVM.parameters()), m.postgrest.request);

            statsLoader.load().then(stats);

            projectsLoader.load().then(_.compose(projects, sample3));

            return {
                addDisqus: addDisqus,
                builder: builder,
                statsLoader: statsLoader,
                stats: stats,
                projectsLoader: projectsLoader,
                projects: { collection: projects }
            };
        },
        view: function view(ctrl, args) {
            var stats = _.first(ctrl.stats());
            return [m('.w-section.hero-full.hero-zelo', [m('.w-container.u-text-center', [m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m('.w-row', [m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding para o Catarse!  Junte-se a nós, inscreva seu email!')]), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
                builder: ctrl.builder
            }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistencialistas, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m('.w-section.section', [m('.w-container', [m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? h.loader() : m.component(c.ProjectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m('.w-section.divider'), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(c.landingQA, {
                question: 'Quais são as taxas da modalidade flexível? ',
                answer: 'Como no Catarse, enviar um projeto não custa nada! Estamos estudando opções para entender qual será a taxa cobrada no serviço Catarse flex.'
            }), m.component(c.landingQA, {
                question: 'De onde vem o dinheiro do meu projeto?',
                answer: 'Família, amigos, fãs e membros de comunidades que você faz parte são seus maiores colaboradores. São eles que irão divulgar sua campanha para as pessoas que eles conhecem, e assim o círculo de apoiadores vai aumentando e a sua campanha ganha força.'
            }), m.component(c.landingQA, {
                question: 'Qual a diferença entre o flexível e o "tudo ou nada"?',
                answer: 'Atualmente o Catarse utiliza apenas o modelo "tudo ou nada", onde você só fica com o dinheiro se bater a meta de arrecadação dentro do prazo da campanha. O modelo flexível é diferente pois permite que o realizador fique com o que arrecadar, independente de atingir ou não a meta do projeto no prazo da campanha. Não haverá limite de tempo para as campanhas. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado.'
            })]), m('.w-col.w-col-6', [m.component(c.landingQA, {
                question: 'Posso inscrever projetos para a modalidade flexível já?',
                answer: 'Por enquanto não. A modalidade flex será testada com alguns projetos específicos. Inscreva seu email e participe da conversa nessa página para receber informações, materiais, acompanhar projetos em teste e saber com antecedência a data de lançamento do flex.'
            }), m.component(c.landingQA, {
                question: 'Por quê vocês querem fazer o Catarse flex?',
                answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O Catarse flex é mais um passo nessa direção.'
            }), m.component(c.landingQA, {
                question: 'Quando vocês irão lançar o Catarse flex?',
                answer: 'Ainda não sabemos quando abriremos o flex para o público. Iremos primeiramente passar por um período de testes e depois estabelecer uma data de lançamento. Se você deseja acompanhar e receber notícias sobre essa caminhada, inscreva seu email nessa página.'
            })])])])]), m('.w-section.section-large.u-text-center.bg-purple', [m('.w-container.fontcolor-negative', [m('.fontsize-largest', 'Fique por dentro!'), m('.fontsize-base.u-marginbottom-60', 'Receba notícias e acompanhe a evolução do Catarse flex'), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
                builder: ctrl.builder
            }), m('.w-col.w-col-2')])])]), m('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m('.w-container.u-text-center', [m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), m('.w-row.u-text-center', ctrl.statsLoader() ? h.loader() : [m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), m('.w-section.section.bg-blue-one.fontcolor-negative', [m('.w-container', [m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), m('.w-col.w-col-2')])])]), m('.w-section.section-large.bg-greenlime', [m('.w-container', [m('#participe-do-debate.u-text-center', { config: h.toAnchor() }, [m('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), m('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
                config: ctrl.addDisqus
            })])])]];
        }
    };
})(window.m, window.c, window.c.h, window.c.models);
'use strict';

window.c.root.Insights = (function (m, c, h, models, _, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'projects.insights');

    return {
        controller: function controller(args) {
            var filtersVM = m.postgrest.filtersVM({
                project_id: 'eq'
            }),
                insightsVM = c.InsightsVM,
                projectDetails = m.prop([]),
                contributionsPerDay = m.prop([]),
                contributionsPerLocation = m.prop([]),
                loader = m.postgrest.loaderWithToken;

            filtersVM.project_id(args.root.getAttribute('data-id'));

            var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);

            var lContributionsPerDay = loader(models.projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
            lContributionsPerDay.load().then(contributionsPerDay);

            var contributionsPerLocationTable = [['Estado', 'Apoios', 'R$ apoiados (% do total)']];
            var buildPerLocationTable = function buildPerLocationTable(contributions) {
                return !_.isEmpty(contributions) ? _.map(_.first(contributions).source, function (contribution) {
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

            var contributionsPerRefTable = [[I18n.t('ref_table.header.origin', I18nScope()), I18n.t('ref_table.header.contributions', I18nScope()), I18n.t('ref_table.header.amount', I18nScope())]];
            var buildPerRefTable = function buildPerRefTable(contributions) {
                return !_.isEmpty(contributions) ? _.map(_.first(contributions).source, function (contribution) {
                    var re = /(ctrse_[a-z]*)/,
                        test = re.exec(contribution.referral_link);

                    var column = [];

                    if (test) {
                        contribution.referral_link = test[0];
                    }

                    column.push(contribution.referral_link ? I18n.t('referral.' + contribution.referral_link, I18nScope({ defaultValue: contribution.referral_link })) : I18n.t('referral.others', I18nScope()));
                    column.push(contribution.total);
                    column.push([contribution.total_amount, [m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_amount, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                    return contributionsPerRefTable.push(column);
                }) : [];
            };

            var lContributionsPerRef = loader(models.projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
            lContributionsPerRef.load().then(buildPerRefTable);

            var explanationModeComponent = function explanationModeComponent(projectMode) {
                var modes = {
                    'aon': c.AonAdminProjectDetailsExplanation,
                    'flex': c.FlexAdminProjectDetailsExplanation
                };

                return modes[projectMode];
            };

            return {
                l: l,
                lContributionsPerRef: lContributionsPerRef,
                lContributionsPerLocation: lContributionsPerLocation,
                lContributionsPerDay: lContributionsPerDay,
                filtersVM: filtersVM,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay,
                contributionsPerLocationTable: contributionsPerLocationTable,
                contributionsPerRefTable: contributionsPerRefTable,
                explanationModeComponent: explanationModeComponent
            };
        },
        view: function view(ctrl) {
            var project = _.first(ctrl.projectDetails()),
                tooltip = function tooltip(el) {
                return m.component(c.Tooltip, {
                    el: el,
                    text: ['Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ', m('a[href="' + I18n.t('ref_table.help_url', I18nScope()) + '"][target=\'_blank\']', 'aqui.')],
                    width: 380
                });
            };

            return m('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                project: project
            }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())), m.component(c.AdminProjectDetailsCard, {
                resource: project
            }), m.component(ctrl.explanationModeComponent(project.mode), {
                resource: project
            })]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [!ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('amount_per_day_label', I18nScope()),
                dataKey: 'total_amount',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [!ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('contributions_per_day_label', I18nScope()),
                dataKey: 'total',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n.t('ref_origin_title', I18nScope()), h.newFeatureBadge(), tooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerRefTable,
                defaultSortIndex: -2
            }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())), !ctrl.lContributionsPerLocation() ? m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerLocationTable,
                defaultSortIndex: -2
            }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, {
                resource: project
            })])])])])] : ''] : h.loader());
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window._, window.I18n);
'use strict';

window.c.root.LiveStatistics = (function (m, models, h, _, JSON) {
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
/**
 * window.c.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
'use strict';

window.c.root.ProjectsExplore = (function (m, c, h, _, moment) {
    return {

        controller: function controller() {
            var filters = m.postgrest.filtersVM,
                follow = c.models.categoryFollower,
                filtersMap = c.root.projectFilters(),
                categoryCollection = m.prop([]),

            // Fake projects object to be able to render page while loadding (in case of search)
            projects = m.prop({ collection: m.prop([]), isLoading: function isLoading() {
                    return true;
                } }),
                title = m.prop(),
                categoryId = m.prop(),
                findCategory = function findCategory(id) {
                return _.find(categoryCollection(), function (c) {
                    return c.id === parseInt(id);
                });
            },
                category = _.compose(findCategory, categoryId),
                loadCategories = function loadCategories() {
                return c.models.category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection);
            },
                followCategory = function followCategory(id) {
                return function () {
                    follow.postWithToken({ category_id: id }).then(loadCategories);
                    return false;
                };
            },
                unFollowCategory = function unFollowCategory(id) {
                return function () {
                    follow.deleteWithToken(filters({ category_id: 'eq' }).category_id(id).parameters()).then(loadCategories);
                    return false;
                };
            },
                loadRoute = function loadRoute() {
                var route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                    cat = route && route[2] && findCategory(route[2]),
                    filterFromRoute = function filterFromRoute() {
                    var byCategory = filters({
                        state_order: 'gte',
                        category_id: 'eq',
                        online_date: 'gt'
                    }).state_order('published').online_date(moment().subtract(60, 'days').format('YYYY-MM-DD'));

                    return route && route[1] && filtersMap[route[1]] || cat && { title: cat.name, filter: byCategory.category_id(cat.id) };
                },
                    filter = filterFromRoute() || filtersMap.recommended,
                    search = h.paramByName('pg_search'),
                    searchProjects = function searchProjects() {
                    var l = m.postgrest.loaderWithToken(c.models.projectSearch.postOptions({ query: search })),
                        page = { // We build an object with the same interface as paginationVM
                        collection: m.prop([]),
                        isLoading: l,
                        nextPage: function nextPage() {
                            return false;
                        }
                    };
                    l.load().then(page.collection);
                    return page;
                },
                    loadProjects = function loadProjects() {
                    var pages = m.postgrest.paginationVM(c.models.project);
                    pages.firstPage(filter.filter.order({
                        open_for_contributions: 'desc',
                        state_order: 'asc',
                        project_id: 'desc'
                    }).parameters());
                    return pages;
                };

                if (_.isString(search) && search.length > 0 && route === null) {
                    title('Busca ' + search);
                    projects(searchProjects());
                } else {
                    title(filter.title);
                    projects(loadProjects());
                }
                categoryId(cat && cat.id);
                toggleCategories.toggle();
            },
                toggleCategories = h.toggleProp(false, true);

            window.addEventListener('hashchange', function () {
                loadRoute();
                m.redraw();
            }, false);

            // Initial loads
            c.models.project.pageSize(9);
            loadCategories().then(loadRoute);

            return {
                categories: categoryCollection,
                followCategory: followCategory,
                unFollowCategory: unFollowCategory,
                projects: projects,
                category: category,
                title: title,
                filtersMap: filtersMap,
                toggleCategories: toggleCategories
            };
        },

        view: function view(ctrl) {
            return [m('.w-section.hero-search', [m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void();"]', { onclick: function onclick() {
                    return ctrl.toggleCategories.toggle();
                } }, ['Explore projetos incríveis ', m('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m('.w-row', [_.map(ctrl.categories(), function (category) {
                return m.component(c.CategoryButton, { category: category });
            })]), m('.w-row.u-marginbottom-30', [_.map(ctrl.filtersMap, function (filter, href) {
                return m.component(c.FilterButton, { title: filter.title, href: href });
            })])])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-6.w-col-small-7.w-col-tiny-7', [m('.fontsize-larger', ctrl.title())]), _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-small-5.w-col-tiny-5', [m('.w-row', [m('.w-col.w-col-8.w-hidden-small.w-hidden-tiny.w-clearfix', [m('.following.fontsize-small.fontcolor-secondary.u-right', ctrl.category().followers + ' seguidores')]), m('.w-col.w-col-4.w-col-small-12.w-col-tiny-12', [ctrl.category().following ? m('a.btn.btn-medium.btn-terciary.unfollow-btn[href=\'#\']', { onclick: ctrl.unFollowCategory(ctrl.category().id) }, 'Deixar de seguir') : m('a.btn.btn-medium.follow-btn[href=\'#\']', { onclick: ctrl.followCategory(ctrl.category().id) }, 'Seguir')])])]) : ''])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _.map(ctrl.projects().collection(), function (project) {
                return m.component(c.ProjectCard, { project: project, ref: 'ctrse_explore' });
            })), ctrl.projects().isLoading() ? h.loader() : ''])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-5'), m('.w-col.w-col-2', [m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                    ctrl.projects().nextPage();return false;
                } }, 'Carregar mais')]), m('.w-col.w-col-5')])])])];
        }
    };
})(window.m, window.c, window.c.h, window._, window.moment);
'use strict';

window.c.root.ProjectsHome = (function (m, c, moment, h, _) {
    var I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: function controller() {
            var sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                project = c.models.project,
                filters = c.root.projectFilters();

            var collections = _.map(['near_me', 'recommended', 'expiring', 'recent'], function (name) {
                var f = filters[name],
                    cLoader = loaderWithToken(project.getPageOptions(f.filter.parameters())),
                    collection = m.prop([]);

                cLoader.load().then(_.compose(collection, sample3));

                return {
                    title: f.title,
                    hash: name,
                    collection: collection,
                    loader: cLoader
                };
            });

            return {
                collections: collections
            };
        },

        view: function view(ctrl) {
            return [m('.w-section.hero-full.hero-2016', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.u-marginbottom-60.fontweight-semibold.fontcolor-negative', I18n.t('title', I18nScope())), m('a[href="http://2015.catarse.me/"].btn.btn-large.u-marginbottom-10.btn-inline', I18n.t('cta', I18nScope()))])]), _.map(ctrl.collections, function (collection) {
                return m.component(c.ProjectRow, {
                    collection: collection,
                    ref: 'home_' + collection.hash
                });
            })];
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._);
'use strict';

window.c.root.ProjectsShow = (function (m, c, _, models, h) {
    return {
        controller: function controller(args) {
            var vm = m.postgrest.filtersVM({
                project_id: 'eq'
            }),
                idVM = h.idVM,
                projectDetails = m.prop([]),
                userDetails = m.prop([]),
                rewardDetails = m.prop([]);

            vm.project_id(args.project_id);
            idVM.id(args.project_user_id);

            var lProject = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
                lUser = m.postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
                lReward = m.postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters()));

            lProject.load().then(function (data) {
                lUser.load().then(userDetails);
                lReward.load().then(rewardDetails);

                projectDetails(data);
            });

            return {
                projectDetails: projectDetails,
                userDetails: userDetails,
                rewardDetails: rewardDetails,
                lProject: lProject,
                lUser: lUser,
                lReward: lReward
            };
        },

        view: function view(ctrl) {
            return !(ctrl.lProject() || ctrl.lUser() || ctrl.lReward()) ? _.map(ctrl.projectDetails(), function (project) {
                return m('.project-show', {
                    config: h.mixpanelTrack()
                }, [m.component(c.ProjectHeader, {
                    project: project,
                    userDetails: ctrl.userDetails
                }), m.component(c.ProjectTabs, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }), m.component(c.ProjectMain, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }), project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                    project: project
                }) : '']);
            }) : h.loader();
        }
    };
})(window.m, window.c, window._, window.c.models, window.c.h);
"use strict";

window.c.root.startVM = (function (_) {
    return function (I18n) {
        var i18nStart = I18n.translations[I18n.currentLocale()].pages.start,
            testimonials = i18nStart.testimonials,
            categoryProjects = i18nStart.categoryProjects,
            panes = i18nStart.panes,
            qa = i18nStart.qa;

        return {
            testimonials: _.map(testimonials, function (testimonial) {
                return {
                    thumbUrl: testimonial.thumb,
                    content: testimonial.content,
                    name: testimonial.name,
                    totals: testimonial.totals
                };
            }),
            panes: _.map(panes, function (pane) {
                return {
                    label: pane.label,
                    src: pane.src
                };
            }),
            questions: {
                col_1: _.map(qa.col_1, function (question) {
                    return {
                        question: question.question,
                        answer: question.answer
                    };
                }),
                col_2: _.map(qa.col_2, function (question) {
                    return {
                        question: question.question,
                        answer: question.answer
                    };
                })
            },
            categoryProjects: _.map(categoryProjects, function (category) {
                return {
                    categoryId: category.category_id,
                    sampleProjects: [category.sample_project_ids.primary, category.sample_project_ids.secondary]
                };
            })
        };
    };
})(window._);
'use strict';

window.c.root.Start = (function (m, c, h, models, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'pages.start');

    return {
        controller: function controller() {
            var stats = m.prop([]),
                categories = m.prop([]),
                selectedPane = m.prop(0),
                selectedCategory = m.prop([]),
                featuredProjects = m.prop([]),
                selectedCategoryIdx = m.prop(-1),
                startvm = c.root.startVM(I18n),
                filters = m.postgrest.filtersVM,
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
                loader = m.postgrest.loaderWithToken,
                statsLoader = loader(models.statistic.getRowOptions()),
                loadCategories = function loadCategories() {
                return c.models.category.getPageWithToken(filters({}).order({
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
                selectCategory = function selectCategory(id) {
                return function () {
                    selectedCategoryIdx(id);
                    categoryvm.category_id(id);
                    selectedCategory([]);
                    m.redraw();
                    lCategory().load().then(loadCategoryProjects);
                };
            },
                setUser = function setUser(user, idx) {
                featuredProjects()[idx] = _.extend({}, featuredProjects()[idx], {
                    userThumb: _.first(user).profile_img_thumbnail
                });
            },
                setProject = function setProject(project, idx) {
                featuredProjects()[idx] = _.first(project);
                uservm.id(_.first(project).user.id);
                lUser().load().then(function (user) {
                    return setUser(user, idx);
                });
            },
                loadCategoryProjects = function loadCategoryProjects(category) {
                selectedCategory(category);
                var categoryProjects = _.findWhere(startvm.categoryProjects, {
                    categoryId: _.first(category).category_id
                });
                featuredProjects([]);
                if (!_.isUndefined(categoryProjects)) {
                    _.map(categoryProjects.sampleProjects, function (project_id, idx) {
                        if (!_.isUndefined(project_id)) {
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
            var stats = _.first(ctrl.stats());
            var testimonials = function testimonials() {
                return _.map(ctrl.testimonials, function (testimonial) {
                    return m('.card.u-radius.card-big.card-terciary', [m('.u-text-center.u-marginbottom-20', [m('img.thumb-testimonial.u-round.u-marginbottom-20[src="' + testimonial.thumbUrl + '"]')]), m('p.fontsize-large.u-marginbottom-30', '"' + testimonial.content + '"'), m('.u-text-center', [m('.fontsize-large.fontweight-semibold', testimonial.name), m('.fontsize-base', testimonial.totals)])]);
                });
            };

            return [m('.w-section.hero-full.hero-start', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n.t('slogan', I18nScope())), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-large.u-marginbottom-10[href=\'/projects/new\']', I18n.t('submit', I18nScope()))])]), m('.w-row', _.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.people', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.fontsize-small.start-stats', I18n.t('header.money', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.success', I18nScope()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n.t('page-title', I18nScope())), m('.fontsize-small', I18n.t('page-subtitle', I18nScope()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))])])])])]), m('.w-section.divider'), m('.w-section.section-large', [m('.w-container.u-text-center.u-marginbottom-60', [m('div', [m('span.fontsize-largest.fontweight-semibold', I18n.t('features.title', I18nScope()))]), m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n.t('features.subtitle', I18nScope())), m('.w-hidden-main.w-hidden-medium.u-margintop-30', [m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_1', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_2', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_3', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_4', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_5', I18nScope()))])]), m('.w-container', [m('.w-tabs.w-hidden-small.w-hidden-tiny', [m('.w-tab-menu.w-col.w-col-4', _.map(ctrl.paneImages, function (pane, idx) {
                return m('a.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                    onclick: ctrl.selectPane(idx)
                }, pane.label);
            })), m('.w-tab-content.w-col.w-col-8', _.map(ctrl.paneImages, function (pane, idx) {
                return m('.w-tab-pane', [m('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
            }))])])]), m('.w-section.section-large.bg-blue-one', [m('.w-container.u-text-center', [m('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n.t('video.title', I18nScope()), m('br'), I18n.t('video.subtitle', I18nScope())]), m.component(c.YoutubeLightbox, {
                src: I18n.t('video.src', I18nScope())
            })])]), m('.w-hidden-small.w-hidden-tiny.section-categories', [m('.w-container', [m('.u-text-center', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n.t('categories.title', I18nScope()))])])]), m('.w-tabs', [m('.w-tab-menu.u-text-center', _.map(ctrl.categories(), function (category) {
                return m('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                    onclick: ctrl.selectCategory(category.id)
                }, [m('div', category.name)]);
            })), m('.w-tab-content.u-margintop-40', [m('.w-tab-pane.w--tab-active', [m('.w-row', !(_.isEmpty(ctrl.selectedCategory()) && ctrl.selectedCategoryIdx() !== -1) ? _.map(ctrl.selectedCategory(), function (category) {
                return [m('.w-col.w-col-5', [m('.fontsize-jumbo.u-marginbottom-20', category.name), m('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="/projects/new"]', 'Comece o seu projeto')]), m('.w-col.w-col-7', [m('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + h.formatNumber(category.total_successful_value, 2, 3)), m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m('.fontsize-megajumbo.fontcolor-negative', category.successful_projects), m('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_.isEmpty(ctrl.featuredProjects()) ? _.map(ctrl.featuredProjects(), function (project) {
                    return !_.isUndefined(project) ? m('.w-row.u-marginbottom-10', [m('.w-col.w-col-1', [m('img.user-avatar[src="' + project.userThumb + '"]')]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', project.user.name), m('.fontsize-smallest', [I18n.t('categories.pledged', I18nScope({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })), m('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m('.fontsize-base', I18n.t('categories.loading_featured', I18nScope()));
                }) : m('.fontsize-base', I18n.t('categories.no_featured', I18nScope()))])];
            }) : h.loader())])])])])]), m.component(c.Slider, {
                slides: testimonials(),
                title: I18n.t('testimonials_title', I18nScope())
            }), m('.w-section.divider.u-margintop-30'), m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', I18n.t('qa_title', I18nScope())), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', _.map(ctrl.questions.col_1, function (question) {
                return m.component(c.landingQA, {
                    question: question.question,
                    answer: question.answer
                });
            })), m('.w-col.w-col-6', _.map(ctrl.questions.col_2, function (question) {
                return m.component(c.landingQA, {
                    question: question.question,
                    answer: question.answer
                });
            }))])]), m('.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m('form[action="/pt/projects"][method="POST"].w-row.w-form', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n.t('form.title', I18nScope())), m('input[name="utf8"][type="hidden"][value="✓"]'), m('input[name="authenticity_token"][type="hidden"][value="' + h.authenticityToken() + '"]'), m('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', { name: 'project[name]' }), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m('select.w-select.text-field.medium.u-marginbottom-40', { name: 'project[category_id]' }, [m('option[value=""]', I18n.t('form.select_default', I18nScope())), _.map(ctrl.categories(), function (category) {
                return m('option[value="' + category.id + '"]', category.name);
            })])]), m('.w-col.w-col-2'), m('.w-row.u-marginbottom-80', [m('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m('input[type="submit"][value="' + I18n.t('form.submit', I18nScope()) + '"].w-button.btn.btn-large')])])])])])];
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window.I18n);
'use strict';

window.c.root.Team = (function (m, c) {
    return {
        view: function view() {
            return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
        }
    };
})(window.m, window.c);
'use strict';

window.c.admin.userFilterVM = (function (m, replaceDiacritics) {
    var vm = m.postgrest.filtersVM({
        full_text_index: '@@',
        deactivated_at: 'is.null'
    }),
        paramToString = function paramToString(p) {
        return (p || '').toString().trim();
    };

    // Set default values
    vm.deactivated_at(null).order({
        id: 'desc'
    });

    vm.deactivated_at.toFilter = function () {
        var filter = JSON.parse(vm.deactivated_at());
        return filter;
    };

    vm.full_text_index.toFilter = function () {
        var filter = paramToString(vm.full_text_index());
        return filter && replaceDiacritics(filter) || undefined;
    };

    return vm;
})(window.m, window.replaceDiacritics);
'use strict';

window.c.admin.userListVM = (function (m, models) {
    return m.postgrest.paginationVM(models.user, 'id.desc', { 'Prefer': 'count=exact' });
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
    vm.order({
        id: 'desc'
    });

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
'use strict';

window.c.admin.contributionListVM = (function (m, models) {
    return m.postgrest.paginationVM(models.contributionDetail, 'id.desc', { 'Prefer': 'count=exact' });
})(window.m, window.c.models);
'use strict';

window.c.root.projectFilters = (function (m, h, moment) {
    return function () {
        var filters = m.postgrest.filtersVM,
            nearMe = filters({
            near_me: 'eq',
            open_for_contributions: 'eq',
            online_date: 'gt'
        }).open_for_contributions('true').near_me(true).online_date(moment().subtract(60, 'days').format('YYYY-MM-DD')),
            expiring = filters({
            expires_at: 'lte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),
            recent = filters({
            online_date: 'gte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),
            recommended = filters({
            recommended: 'eq',
            open_for_contributions: 'eq'
        }).recommended('true').open_for_contributions('true'),
            online = filters({
            open_for_contributions: 'eq'
        }).open_for_contributions('true'),
            successful = filters({
            state: 'eq',
            expires_at: 'gt'
        }).state('successful').expires_at(moment().subtract(30, 'days').format('YYYY-MM-DD'));

        return {
            recommended: {
                title: 'Recomendados',
                filter: recommended
            },
            online: {
                title: 'No ar',
                filter: online
            },
            expiring: {
                title: 'Reta final',
                filter: expiring
            },
            successful: {
                title: 'Bem-sucedidos',
                filter: successful
            },
            recent: {
                title: 'Recentes',
                filter: recent
            },
            near_me: {
                title: 'Próximos a mim',
                filter: nearMe
            }
        };
    };
})(window.m, window.c.h, window.moment);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLW5vdGlmaWNhdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWNhcmQuanMiLCJhZG1pbi1wcm9qZWN0LmpzIiwiYWRtaW4tcmFkaW8tYWN0aW9uLmpzIiwiYWRtaW4tcmVzZXQtcGFzc3dvcmQuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLWRldGFpbC5qcyIsImFkbWluLXVzZXItaXRlbS5qcyIsImFkbWluLXVzZXIuanMiLCJhb24tYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiY2F0ZWdvcnktYnV0dG9uLmpzIiwiZmlsdGVyLWJ1dHRvbi5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwiZmxleC1wcm9qZWN0LWRldGFpbHMtZXhwbGFuYXRpb24uanMiLCJsYW5kaW5nLXFhLmpzIiwibGFuZGluZy1zaWdudXAuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInBvcC1ub3RpZmljYXRpb24uanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtZGFzaGJvYXJkLW1lbnUuanMiLCJwcm9qZWN0LWRhdGEtY2hhcnQuanMiLCJwcm9qZWN0LWRhdGEtdGFibGUuanMiLCJwcm9qZWN0LWhlYWRlci5qcyIsInByb2plY3QtaGlnaGxpZ2h0LmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1tb2RlLmpzIiwicHJvamVjdC1wb3N0cy5qcyIsInByb2plY3QtcmVtaW5kZXItY291bnQuanMiLCJwcm9qZWN0LXJlbWluZGVyLmpzIiwicHJvamVjdC1yZXdhcmQtbGlzdC5qcyIsInByb2plY3Qtcm93LmpzIiwicHJvamVjdC1zaGFyZS1ib3guanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJzbGlkZXIuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItY2FyZC5qcyIsInlvdXR1YmUtbGlnaHRib3guanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiLCJyb290L2ZsZXguanMiLCJyb290L2luc2lnaHRzLmpzIiwicm9vdC9saXZlLXN0YXRpc3RpY3MuanMiLCJyb290L3Byb2plY3RzLWV4cGxvcmUuanMiLCJyb290L3Byb2plY3RzLWhvbWUuanMiLCJyb290L3Byb2plY3RzLXNob3cuanMiLCJyb290L3N0YXJ0LXZtLmpzIiwicm9vdC9zdGFydC5qcyIsInJvb3QvdGVhbS5qcyIsImFkbWluL3VzZXJzL3VzZXItZmlsdGVyLXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1saXN0LXZtLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tZmlsdGVyLXZtLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tbGlzdC12bS5qcyIsInJvb3Qvdm1zL3Byb2plY3RzLXZtcy5qcyJdLCJuYW1l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LENBQUMsTUFBTSxDQUFDO1lBRXJELE1BQU0sR0FBRyxPQUFPLENBQUM7QUFDYixrQ0FBc0IsRUFBRSxJQUFJO1NBQy9CLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUM7WUFFakMsVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUNqQixpQkFBSyxFQUFFLElBQUk7QUFDWCxzQkFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzs7QUFFNUYsZUFBTztBQUNILHVCQUFXLEVBQUU7QUFDVCxxQkFBSyxFQUFFLGNBQWM7QUFDckIsc0JBQU0sRUFBRSxXQUFXO2FBQ3RCO0FBQ0Qsa0JBQU0sRUFBRTtBQUNKLHFCQUFLLEVBQUUsT0FBTztBQUNkLHNCQUFNLEVBQUUsTUFBTTthQUNqQjtBQUNELG9CQUFRLEVBQUU7QUFDTixxQkFBSyxFQUFFLFlBQVk7QUFDbkIsc0JBQU0sRUFBRSxRQUFRO2FBQ25CO0FBQ0Qsc0JBQVUsRUFBRTtBQUNSLHFCQUFLLEVBQUUsZUFBZTtBQUN0QixzQkFBTSxFQUFFLFVBQVU7YUFDckI7QUFDRCxrQkFBTSxFQUFFO0FBQ0oscUJBQUssRUFBRSxVQUFVO0FBQ2pCLHNCQUFNLEVBQUUsTUFBTTthQUNqQjtBQUNELG1CQUFPLEVBQUU7QUFDTCxxQkFBSyxFQUFFLGdCQUFnQjtBQUN2QixzQkFBTSxFQUFFLE1BQU07YUFDakI7U0FDSixDQUFDO0tBQ0wsQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbHM6IHt9LFxuICAgICAgICByb290OiB7fSxcbiAgICAgICAgYWRtaW46IHt9LFxuICAgICAgICBoOiB7fVxuICAgIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9ICgobSwgbW9tZW50LCBJMThuKSA9PiB7XG4gICAgLy9EYXRlIEhlbHBlcnNcblxuICAgIGNvbnN0IGhhc2hNYXRjaCA9IChzdHIpID0+IHsgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSBzdHI7IH0sXG4gICAgICAgIHBhcmFtQnlOYW1lID0gKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbE5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKSxcbiAgICAgICAgICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5vcm1hbE5hbWUgKyAnPShbXiYjXSopJyksXG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldE1vbWVudGlmeUxvY2FsZSA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoJ3B0Jywge1xuICAgICAgICAgICAgICAgICAgICBtb250aHNTaG9ydDogJ2phbl9mZXZfbWFyX2Ficl9tYWlfanVuX2p1bF9hZ29fc2V0X291dF9ub3ZfZGV6Jy5zcGxpdCgnXycpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGV4aXN0eSA9ICh4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geCAhPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudGlmeSA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnREQvTU0vWVlZWSc7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5sb2NhbGUoJ3B0JykuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcmVBY3Rpb24gPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGFjdGlvbiwgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uID0gKGFjdGlvbiwgZnVuYykgPT4ge1xuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZ1bmMuY2FsbCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzY3VzcyA9IChwYWdlLCBpZGVudGlmaWVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkID0gZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgcyA9IGQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICB3aW5kb3cuZGlzcXVzX2NvbmZpZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBwYWdlO1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzLnNyYyA9ICcvL2NhdGFyc2VmbGV4LmRpc3F1cy5jb20vZW1iZWQuanMnO1xuICAgICAgICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXN0YW1wJywgK25ldyBEYXRlKCkpO1xuICAgICAgICAgICAgKGQuaGVhZCB8fCBkLmJvZHkpLmFwcGVuZENoaWxkKHMpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudEZyb21TdHJpbmcgPSAoZGF0ZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICAgICAgICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2xhdGVkVGltZVVuaXRzID0ge1xuICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgIH0sXG4gICAgICAgIC8vT2JqZWN0IG1hbmlwdWxhdGlvbiBoZWxwZXJzXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRUaW1lID0gdHJhbnNsYXRlZFRpbWVVbml0cyxcbiAgICAgICAgICAgICAgICB1bml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qVW5pdCA9IHRyYW5zbGF0ZWRUaW1lW3RpbWUudW5pdCB8fCAnc2Vjb25kcyddO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodGltZS50b3RhbCA8PSAxKSA/IHByb2pVbml0LnNsaWNlKDAsIC0xKSA6IHByb2pVbml0O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdW5pdDogdW5pdCgpLFxuICAgICAgICAgICAgICAgIHRvdGFsOiB0aW1lLnRvdGFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICAgICAgICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IChzLCBjKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciwgbiwgeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc051bWJlcihudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gICAgICAgIHRvZ2dsZVByb3AgPSAoZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcCA9IG0ucHJvcChkZWZhdWx0U3RhdGUpO1xuICAgICAgICAgICAgcC50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAoKChwKCkgPT09IGFsdGVybmF0ZVN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IGFsdGVybmF0ZVN0YXRlKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSxcblxuICAgICAgICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGlkOiAnZXEnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIGdldFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gXy5maXJzdChib2R5KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcicpO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2F0aW9uQWN0aW9uTWF0Y2ggPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3QgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uID09PSBhY3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXNlQXZhdGFyT3JEZWZhdWx0ID0gKGF2YXRhclBhdGgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgICAgfSxcblxuICAgICAgICAvL1RlbXBsYXRlc1xuICAgICAgICBsb2FkZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW50b3AtMzAgdS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5ld0ZlYXR1cmVCYWRnZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuLmJhZGdlLmJhZGdlLXN1Y2Nlc3MubWFyZ2luLXNpZGUtNScsIEkxOG4udCgncHJvamVjdHMubmV3X2ZlYXR1cmVfYmFkZ2UnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmJQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyeVBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5GQi5YRkJNTC5wYXJzZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgICAgICAgfSxcblxuICAgICAgICBwbHVyYWxpemUgPSAoY291bnQsIHMsIHApID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaW1wbGVGb3JtYXQgPSAoc3RyID0gJycpID0+IHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHJcXG4/LywgJ1xcbicpO1xuICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcblxcbisvZywgJzwvcD48cD4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSAnPHA+JyArIHN0ciArICc8L3A+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkU291bGRPdXQgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID9cbiAgICAgICAgICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJld2FyZFJlbWFuaW5nID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVVybCA9IChocmVmKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgbC5ocmVmID0gaHJlZjtcbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1peHBhbmVsVHJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5DYXRhcnNlTWl4cGFuZWwuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIFVJSGVscGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCAmJiAkKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5VSUhlbHBlci5zZXR1cFJlc3BvbnNpdmVJZnJhbWVzKCQoZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQW5jaG9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNoID09PSBlbC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlRW1haWwgPSAoZW1haWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlID0gL14oKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdK1xcLikrW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXXsyLH0pJC9pO1xuICAgICAgICAgICAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5hdmlnYXRlVG9EZXZpc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvcHQvbG9naW4nO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRvcCA9IDAsIGxlZnQgPSAwO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcCAgfHwgMDtcbiAgICAgICAgICAgICAgICBsZWZ0ICs9IGVsZW1lbnQub2Zmc2V0TGVmdCB8fCAwO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VGbGFzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ljb24tY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGkxOG5TY29wZSA9IChzY29wZSwgb2JqKSA9PiB7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwge307XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIG9iaiwge3Njb3BlOiBzY29wZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF1dGhlbnRpY2l0eVRva2VuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8uZmlyc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYXV0aGVudGljaXR5dG9rZW5dJykpLmRhdGFzZXQuYXV0aGVudGljaXR5dG9rZW47XG4gICAgICAgIH07XG5cbiAgICBzZXRNb21lbnRpZnlMb2NhbGUoKTtcbiAgICBjbG9zZUZsYXNoKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhdXRoZW50aWNpdHlUb2tlbjogYXV0aGVudGljaXR5VG9rZW4sXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQ6IGN1bXVsYXRpdmVPZmZzZXQsXG4gICAgICAgIGRpc2N1c3M6IGRpc2N1c3MsXG4gICAgICAgIGV4aXN0eTogZXhpc3R5LFxuICAgICAgICB2YWxpZGF0ZUVtYWlsOiB2YWxpZGF0ZUVtYWlsLFxuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBuZXdGZWF0dXJlQmFkZ2U6IG5ld0ZlYXR1cmVCYWRnZSxcbiAgICAgICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICAgICAgcGx1cmFsaXplOiBwbHVyYWxpemUsXG4gICAgICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgICAgICB0cmFuc2xhdGVkVGltZTogdHJhbnNsYXRlZFRpbWUsXG4gICAgICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICAgICAgcmV3YXJkUmVtYW5pbmc6IHJld2FyZFJlbWFuaW5nLFxuICAgICAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoLFxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQ6IHVzZUF2YXRhck9yRGVmYXVsdCxcbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaDogbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICAgICAgbWl4cGFuZWxUcmFjazogbWl4cGFuZWxUcmFjayxcbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZTogbmF2aWdhdGVUb0RldmlzZSxcbiAgICAgICAgc3RvcmVBY3Rpb246IHN0b3JlQWN0aW9uLFxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uOiBjYWxsU3RvcmVkQWN0aW9uLFxuICAgICAgICBVSUhlbHBlcjogVUlIZWxwZXIsXG4gICAgICAgIHRvQW5jaG9yOiB0b0FuY2hvcixcbiAgICAgICAgcGFyYW1CeU5hbWU6IHBhcmFtQnlOYW1lLFxuICAgICAgICBpMThuU2NvcGU6IGkxOG5TY29wZVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50LCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMubW9kZWxzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgY29udHJpYnV0aW9uRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbl9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9kZXRhaWxzJyksXG4gICAgICAgIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gICAgICAgIHVzZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcnMnKSxcbiAgICAgICAgcmV3YXJkRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Jld2FyZF9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3RSZW1pbmRlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3JlbWluZGVycycpLFxuICAgICAgICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgICAgICAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zJyksXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcG9zdHNfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfbG9jYXRpb24nKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWYgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9yZWYnKSxcbiAgICAgICAgcHJvamVjdCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0cycpLFxuICAgICAgICBwcm9qZWN0U2VhcmNoID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3JwYy9wcm9qZWN0X3NlYXJjaCcpLFxuICAgICAgICBjYXRlZ29yeSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yaWVzJyksXG4gICAgICAgIGNhdGVnb3J5VG90YWxzID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X3RvdGFscycpLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X2ZvbGxvd2VycycpLFxuICAgICAgICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpLFxuICAgICAgICBub3RpZmljYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgnbm90aWZpY2F0aW9ucycpLFxuICAgICAgICBzdGF0aXN0aWMgPSBtLnBvc3RncmVzdC5tb2RlbCgnc3RhdGlzdGljcycpO1xuXG4gICAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gICAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbiAgICBwcm9qZWN0LnBhZ2VTaXplKDMwKTtcbiAgICBjYXRlZ29yeS5wYWdlU2l6ZSg1MCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICAgICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgICAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBwcm9qZWN0U2VhcmNoOiBwcm9qZWN0U2VhcmNoLFxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgIGNhdGVnb3J5VG90YWxzOiBjYXRlZ29yeVRvdGFscyxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlcjogY2F0ZWdvcnlGb2xsb3dlcixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXk6IHByb2plY3RDb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWYsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb246IHByb2plY3RDb250cmlidXRpb24sXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsOiBwcm9qZWN0UG9zdERldGFpbCxcbiAgICAgICAgcHJvamVjdFJlbWluZGVyOiBwcm9qZWN0UmVtaW5kZXIsXG4gICAgICAgIG5vdGlmaWNhdGlvbjogbm90aWZpY2F0aW9uLFxuICAgICAgICBzdGF0aXN0aWM6IHN0YXRpc3RpY1xuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGw7XG4gICAgICAgICAgICBjb25zdCBsb2FkUmV3YXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gYy5tb2RlbHMucmV3YXJkRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmRfaWQgPSBhcmdzLml0ZW0ucmV3YXJkX2lkLFxuICAgICAgICAgICAgICAgICAgICBvcHRzID0gbW9kZWwuZ2V0Um93T3B0aW9ucyhoLmlkVk0uaWQocmV3YXJkX2lkKS5wYXJhbWV0ZXJzKCkpLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmQgPSBtLnByb3Aoe30pO1xuICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4ob3B0cyk7XG4gICAgICAgICAgICAgICAgaWYgKHJld2FyZF9pZCkge1xuICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKF8uY29tcG9zZShyZXdhcmQsIF8uZmlyc3QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCByZXdhcmQgPSBsb2FkUmV3YXJkKCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJld2FyZDogcmV3YXJkLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdUcmFuc2ZlcmlyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnVHJhbnNmZXJpciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2V4OiAxMjk5MDgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdBcG9pbyB0cmFuc2ZlcmlkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyBhcG9pbyBuw6NvIGZvaSB0cmFuc2ZlcmlkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnY29udHJpYnV0aW9uX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEtleTogJ3Jld2FyZF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb3M6ICdyZXdhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRNb2RlbDogYy5tb2RlbHMucmV3YXJkRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbTogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGU6IChyZXdhcmRzLCBuZXdSZXdhcmRJRCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXdhcmQgPSBfLmZpbmRXaGVyZShyZXdhcmRzLCB7aWQ6IG5ld1Jld2FyZElEfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhcmdzLml0ZW0udmFsdWUgPj0gcmV3YXJkLm1pbmltdW1fdmFsdWUpID8gdW5kZWZpbmVkIDogJ1ZhbG9yIG3DrW5pbW8gZGEgcmVjb21wZW5zYSDDqSBtYWlvciBkbyBxdWUgbyB2YWxvciBkYSBjb250cmlidWnDp8Ojby4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWZ1bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlZW1ib2xzbyBkaXJldG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgcmVlbWJvbHNhciBlc3NlIGFwb2lvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVlbWJvbHNhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBcGFnYXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgYXBhZ2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdBcG9pbyByZW1vdmlkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyBhcG9pbyBuw6NvIGZvaSByZW1vdmlkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsOiBsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gY3RybC5hY3Rpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgcmV3YXJkID0gY3RybC5yZXdhcmQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvYWRtaW4vY29udHJpYnV0aW9ucy8ke2lkfS9nYXRld2F5X3JlZnVuZGApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMudHJhbnNmZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmFkaW9BY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMucmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5VmFsdWU6IGl0ZW0ucHJvamVjdF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleVZhbHVlOiBpdGVtLmNvbnRyaWJ1dGlvbl9pZFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhZGRPcHRpb25zKGFjdGlvbnMucmVmdW5kLCBpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZW1vdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpKSA/IGgubG9hZGVyIDpcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJld2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGl0ZW0ua2V5XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb25JdGVtID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Qcm9qZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnUGF5bWVudFN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLFxuICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwuaXRlbUJ1aWxkZXIsIGZ1bmN0aW9uKHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKHBhbmVsLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1twYW5lbC5jb21wb25lbnRdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uVXNlciBjb21wb25lbnRcbiAqIEFuIGl0ZW1idWlsZGVyIGNvbXBvbmVudCB0aGF0IHJldHVybnMgYWRkaXRpb25hbCBkYXRhXG4gKiB0byBiZSBpbmNsdWRlZCBpbiBBZG1pblVzZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICogICAgIHJldHVybiB7XG4gKiAgICAgICAgIGl0ZW1CdWlsZGVyOiBbe1xuICogICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAqICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICogICAgICAgICB9XVxuICogICAgIH1cbiAqIH1cbiAqL1xud2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZV9pbWdfdGh1bWJuYWlsOiBpdGVtLnVzZXJfcHJvZmlsZV9pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0udXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnVzZXJfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogaXRlbS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxEYXRhID0gbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIGl0ZW0ucGF5ZXJfZW1haWwpO1xuICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5Vc2VyLCB7aXRlbTogdXNlciwgYWRkaXRpb25hbF9kYXRhOiBhZGRpdGlvbmFsRGF0YX0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1jb250cmlidXRpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLXNtYWxsJywgJ1IkJyArIGNvbnRyaWJ1dGlvbi52YWx1ZSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVkgSEg6bW1baF0nKSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cImh0dHBzOi8vZGFzaGJvYXJkLnBhZ2FyLm1lLyMvdHJhbnNhY3Rpb25zLycgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCArICdcIl0nLCBjb250cmlidXRpb24uZ2F0ZXdheV9pZClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkV4dGVybmFsQWN0aW9uIGNvbXBvbmVudFxuICogTWFrZXMgYXJiaXRyYXJ5IGFqYXggcmVxdWVzdHMgYW5kIHVwZGF0ZSB1bmRlcmx5aW5nXG4gKiBkYXRhIGZyb20gc291cmNlIGVuZHBvaW50LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBpdGVtOiByb3dGcm9tRGF0YWJhc2VcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gPSAoKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpWzBdLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbG9hZCA9IF8uY29tcG9zZShidWlsZGVyLm1vZGVsLmdldFJvd1dpdGhUb2tlbiwgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKS5wYXJhbWV0ZXJzKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyKGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMsIG0ucmVxdWVzdCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbG9hZEl0ZW0gPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlbG9hZCgpLnRoZW4odXBkYXRlSXRlbSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVJdGVtID0gKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4ocmVsb2FkSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlcXVpc2nDp8OjbyBmZWl0YSBjb20gc3VjZXNzby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkZpbHRlciA9IChmdW5jdGlvbihjLCBtLCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGxhYmVsID0gYXJncy5sYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICBtYWluID0gXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtZmlsdGVyLnctc2VjdGlvbi5wYWdlLWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIGxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkgPyBtLmNvbXBvbmVudChjW21haW4uY29tcG9uZW50XSwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMC53LXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWNvbC53LWNvbC0xMi5mb250c2l6ZS1zbWFsbGVzdC5saW5rLWhpZGRlbi1saWdodFtzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDtcIl1bdHlwZT1cImJ1dHRvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0ZpbHRyb3MgYXZhbsOnYWRvcyDCoD4nKSksIChjdHJsLnRvZ2dsZXIoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNhZHZhbmNlZC1zZWFyY2gudy1yb3cuYWRtaW4tZmlsdGVycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuY29tcG9uZW50ICE9PSAnRmlsdGVyTWFpbicpID8gbS5jb21wb25lbnQoY1tmLmNvbXBvbmVudF0sIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5jLCB3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluSW5wdXRBY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBmb3JjZVZhbHVlID0gYnVpbGRlci5mb3JjZVZhbHVlIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoZm9yY2VWYWx1ZSk7XG5cbiAgICAgICAgICAgIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSk7XG5cbiAgICAgICAgICAgIHZhciBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIubW9kZWwucGF0Y2hPcHRpb25zKGguaWRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlKGZvcmNlVmFsdWUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksIChkYXRhLmZvcmNlVmFsdWUgPT09IHVuZGVmaW5lZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3VmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLm5ld1ZhbHVlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBkYXRhLnN1Y2Nlc3NNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4gJyArIGRhdGEuZXJyb3JNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5JdGVtID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheURldGFpbEJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheURldGFpbEJveDogZGlzcGxheURldGFpbEJveFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4LmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMjAucmVzdWx0cy1hZG1pbi1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChhcmdzLmxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCdidXR0b24udy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheURldGFpbEJveC50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjdHJsLmRpc3BsYXlEZXRhaWxCb3goKSA/IG0uY29tcG9uZW50KGFyZ3MubGlzdERldGFpbCwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkxpc3QgPSAoZnVuY3Rpb24obSwgaCwgYykge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3Q7XG4gICAgICAgICAgICBpZiAoIWxpc3QuY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0LmZpcnN0UGFnZSkge1xuICAgICAgICAgICAgICAgIGxpc3QuZmlyc3RQYWdlKCkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhcmdzLnZtLmVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0LFxuICAgICAgICAgICAgICAgIGVycm9yID0gYXJncy52bS5lcnJvcixcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKCkgP1xuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC5jYXJkLWVycm9yLnUtcmFkaXVzLmZvbnR3ZWlnaHQtYm9sZCcsIGVycm9yKCkpIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBDYXJyZWdhbmRvICR7bGFiZWwudG9Mb3dlckNhc2UoKX0uLi5gIDogW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIGxpc3QudG90YWwoKSksIGAgJHtsYWJlbC50b0xvd2VyQ2FzZSgpfSBlbmNvbnRyYWRvc2BdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGFyZ3MubGlzdEl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBhcmdzLmxpc3REZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSBjb21wb25lbnRcbiAqIFJldHVybiBub3RpZmljYXRpb25zIGxpc3QgZnJvbSBhbiBVc2VyIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAqICAgICB1c2VyOiB1c2VyXG4gKiB9KVxuICovXG5cbndpbmRvdy5jLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSA9ICgobSwgaCwgXywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMgPSAodXNlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbm90aWZpY2F0aW9uID0gbW9kZWxzLm5vdGlmaWNhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmdldFBhZ2VXaXRoVG9rZW4obS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW50X2F0OiAnaXMubnVsbCdcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnVzZXJfaWQodXNlci5pZClcbiAgICAgICAgICAgICAgICAgICAgLnNlbnRfYXQoIW51bGwpXG4gICAgICAgICAgICAgICAgICAgIC5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW50X2F0OiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBhcmFtZXRlcnMoKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4obm90aWZpY2F0aW9ucyk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZ2V0Tm90aWZpY2F0aW9ucyhhcmdzLnVzZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbnM6IG5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRlIG5vdGlmaWNhw6fDtWVzJyksXG4gICAgICAgICAgICAgICAgY3RybC5ub3RpZmljYXRpb25zKCkubWFwKChjRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTI0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY0V2ZW50LnNlbnRfYXQsICdERC9NTS9ZWVlZLCBISDptbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAtICcsIGNFdmVudC50ZW1wbGF0ZV9uYW1lLCBjRXZlbnQub3JpZ2luID8gJyAtICcgKyBjRXZlbnQub3JpZ2luIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgY29tcG9uZW50XG4gKiByZW5kZXIgYW4gYm94IHdpdGggc29tZSBwcm9qZWN0IHN0YXRpc3RpY3MgaW5mb1xuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gKiAgICAgcmVzb3VyY2U6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoKG0sIGgsIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHVzVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOTyBBUidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTsODTyBGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBR1VBUkRBTkRPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JFQ1VTQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkFTQ1VOSE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdFTSBBTsOBTElTRSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJvdmVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0FQUk9WQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzVGV4dE9iajtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRmluYWxMYXAgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiB1c2UgOCBkYXlzIGJlY2F1c2UgdGltZXpvbmUgb24ganNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpICYmIG1vbWVudCgpLmFkZCg4LCAnZGF5cycpID49IG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QucmVtYWluaW5nX3RpbWUpLFxuICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QuZWxhcHNlZF90aW1lKSxcbiAgICAgICAgICAgICAgICBpc0ZpbmFsTGFwOiBpc0ZpbmFsTGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaixcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGV4dE9iaiA9IGN0cmwuZWxhcHNlZFRleHRPYmo7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1kZXRhaWxzLWNhcmQuY2FyZC51LXJhZGl1cy5jYXJkLXRlcmNpYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnU3RhdHVzOicpLCAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGN0cmwuaXNGaW5hbExhcCgpICYmIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdSRVRBIEZJTkFMJyA6IHN0YXR1c1RleHRPYmoudGV4dCkpLCAnwqAnXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnZmluYW5jaWFkbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9ncmVzcyArICclJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2xldmFudGFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2luaWNpYWRvIGjDoScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZWxhcHNlZFRleHRPYmoudG90YWwgKyAnICcgKyBlbGFwc2VkVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAncmVzdGFtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCArICcgJyArIHJlbWFpbmluZ1RleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSgpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3QgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz0nICsgcHJvamVjdC5wcm9qZWN0X2ltZyArICddW3dpZHRoPTUwXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3Rfb25saW5lX2RhdGUpICsgJyBhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3RfZXhwaXJlc19hdCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG0ucHJvcChpdGVtLmRlc2NyaXB0aW9uIHx8ICcnKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBuZXdJRCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZ2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgc2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgcmFkaW9zID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgZ2V0QXR0ciA9IGJ1aWxkZXIucmFkaW9zLFxuICAgICAgICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGdldEtleVZhbHVlID0gYXJncy5nZXRLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZSA9IGFyZ3MudXBkYXRlS2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdmFsaWRhdGUgPSBidWlsZGVyLnZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbSA9IGJ1aWxkZXIuc2VsZWN0ZWRJdGVtIHx8IG0ucHJvcCgpO1xuXG4gICAgICAgICAgICBzZXRGaWx0ZXJbdXBkYXRlS2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgc2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oc2V0RmlsdGVyKTtcbiAgICAgICAgICAgIHNldFZNW3VwZGF0ZUtleV0odXBkYXRlS2V5VmFsdWUpO1xuXG4gICAgICAgICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgICAgICAgIGdldFZNW2dldEtleV0oZ2V0S2V5VmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0UGFnZU9wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbSA9IF8uZmluZFdoZXJlKHJhZGlvcygpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YVswXVtidWlsZGVyLnNlbGVjdEtleV1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbShuZXdJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnTmVuaHVtIGl0ZW0gYXR1YWxpemFkbydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXIubG9hZCgpLnRoZW4ocmFkaW9zLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0lEKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZShyYWRpb3MoKSwgbmV3SUQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbGlkYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2J1aWxkZXIuc2VsZWN0S2V5XSA9IG5ld0lEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRMb2FkZXIubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdJRCgnJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmV0Y2goKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgbmV3SUQ6IG5ld0lELFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWQsXG4gICAgICAgICAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLnNldExvYWRlcigpIHx8IGN0cmwuZ2V0TG9hZGVyKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm5ld0lEKHJhZGlvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IChpdGVtW2RhdGEuc2VsZWN0S2V5XSB8fCBpdGVtLmlkKSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I3ItJyArIGluZGV4ICsgJy53LXJhZGlvLWlucHV0W3R5cGU9cmFkaW9dW25hbWU9XCJhZG1pbi1yYWRpb1wiXVt2YWx1ZT1cIicgKyByYWRpby5pZCArICdcIl0nICsgKChzZWxlY3RlZCkgPyAnW2NoZWNrZWRdJyA6ICcnKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbC53LWZvcm0tbGFiZWxbZm9yPVwici0nICsgaW5kZXggKyAnXCJdJywgJ1IkJyArIHJhZGlvLm1pbmltdW1fdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlY29tcGVuc2EgYWx0ZXJhZGEgY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3IoKS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkIGNvbXBvbmVudFxuICogTWFrZXMgYWpheCByZXF1ZXN0IHRvIHVwZGF0ZSBVc2VyIHBhc3N3b3JkLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpWzBdLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXIoXy5leHRlbmQoe30sIHtkYXRhOiBkYXRhfSwgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucyksIG0ucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2UgPSBtLnByb3AoJycpO1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZShlcnIuZXJyb3JzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVJdGVtID0gKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG5ld1Bhc3N3b3JkKCk7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCByZXF1ZXN0RXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVubG9hZCA9IChlbCwgaXNpbml0LCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2U6IGVycm9yX21lc3NhZ2UsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogbmV3UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bbmFtZT1cIicgKyBkYXRhLnByb3BlcnR5ICsgJ1wiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1Bhc3N3b3JkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdQYXNzd29yZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdTZW5oYSBhbHRlcmFkYSBjb20gc3VjZXNzby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5lcnJvcl9tZXNzYWdlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGMsIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gYXJncy5yZXdhcmQoKSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCByZXdhcmQuaWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yIG3DrW5pbW86IFIkJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdEZXNjcmnDp8OjbzogJyArIHJld2FyZC5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIF0gOiAnQXBvaW8gc2VtIHJlY29tcGVuc2EnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFt7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY29uZmlybWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wZW5kaW5nX3JlZnVuZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlZW1ib2xzbyBzb2xpY2l0YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNyaWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1c2VkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY2FuY2VsYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgfV0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0ZSAhPT0gbnVsbCAmJiBpdGVtLmRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9yZGVyZWRFdmVudHM6IF8uc29ydEJ5KG1hcEV2ZW50cywgJ29yaWdpbmFsRGF0ZScpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgICAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBjRXZlbnQuZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY0V2ZW50Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gQ29uZmlybWHDp8OjbzogJyArIChjb250cmlidXRpb24ud2FpdGluZ19wYXltZW50ID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQXBvaW86ICcgKyBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnTWVpbzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0oKSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsIGNvbXBvbmVudFxuICogUmV0dXJuIGFjdGlvbiBpbnB1dHMgdG8gYmUgdXNlZCBpbnNpZGUgQWRtaW5MaXN0IGNvbXBvbmVudC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVkZWZpbmlyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdOb3ZhIHNlbmhhIGRlIFVzdcOhcmlvOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVkZWZpbmlyIHNlbmhhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyM211ZEByJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlYWN0aXZhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVhdGl2YXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgcmVhdGl2YXIgZXNzZSB1c3XDoXJpbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdVc3XDoXJpbyByZWF0aXZhZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gdXN1w6FyaW8gbsOjbyBww7RkZSBzZXIgcmVhdGl2YWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVhdGl2YXIgdXN1w6FyaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gYXJncy5kZXRhaWxzO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRPcHRpb25zID0gKGJ1aWxkZXIsIGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBidWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IChgL3VzZXJzLyR7aWR9L25ld19wYXNzd29yZGApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJlc2V0UGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZXNldCwgaXRlbS5pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbS5kZWFjdGl2YXRlZF9hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7ZGF0YTogYWN0aW9ucy5yZWFjdGl2YXRlLCBpdGVtOiBpdGVtfSkgOiAnJ1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXJJdGVtID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Vc2VyLCBhcmdzKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlciA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnVzZXItYXZhdGFyW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdCh1c2VyLnByb2ZpbGVfaW1nX3RodW1ibmFpbCkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvdXNlcnMvJyArIHVzZXIuaWQgKyAnL2VkaXRcIl0nLCB1c2VyLm5hbWUgfHwgdXNlci5lbWFpbClcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdVc3XDoXJpbzogJyArIHVzZXIuaWQpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdFbWFpbDogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLmFkZGl0aW9uYWxfZGF0YVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGFsbCBvciBub3RoaW5nIHByb2plY3QgbWRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgbsOjbyBkZXNhbmltZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gbsOjbyBiYXRldSBhIG1ldGEgZSBzYWJlbW9zIHF1ZSBpc3NvIG7Do28gw6kgYSBtZWxob3IgZGFzIHNlbnNhw6fDtWVzLiBNYXMgbsOjbyBkZXNhbmltZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbmNhcmUgbyBwcm9jZXNzbyBjb21vIHVtIGFwcmVuZGl6YWRvIGUgbsOjbyBkZWl4ZSBkZSBjb2dpdGFyIHVtYSBzZWd1bmRhIHRlbnRhdGl2YS4gTsOjbyBzZSBwcmVvY3VwZSwgdG9kb3Mgb3Mgc2V1cyBhcG9pYWRvcmVzIHJlY2ViZXLDo28gbyBkaW5oZWlybyBkZSB2b2x0YS7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM2NTUwNy1SZWdyYXMtZS1mdW5jaW9uYW1lbnRvLWRvcy1yZWVtYm9sc29zLWVzdG9ybm9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gZmF6ZW1vcyBlc3Rvcm5vcyBlIHJlZW1ib2xzb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCAnLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgc2V1IHByb2pldG8gZm9pIGFwcm92YWRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUGFyYSBjb2xvY2FyIG8gc2V1IHByb2pldG8gbm8gYXIgw6kgcHJlY2lzbyBhcGVuYXMgcXVlIHZvY8OqIHByZWVuY2hhIG9zIGRhZG9zIG5lY2Vzc8OhcmlvcyBuYSBhYmHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIjdXNlcl9zZXR0aW5nc1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy4gw4kgaW1wb3J0YW50ZSBzYWJlciBxdWUgY29icmFtb3MgYSB0YXhhIGRlIDEzJSBkbyB2YWxvciB0b3RhbCBhcnJlY2FkYWRvIGFwZW5hcyBwb3IgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4gRW50ZW5kYcKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBmYXplbW9zIG8gcmVwYXNzZSBkbyBkaW5oZWlyby4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNhdGVnb3J5QnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgYnRuLWNhdGVnb3J5IGNsYXNzLlxuICogSXQgdXNlcyBhIGNhdGVnb3J5IHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge1xuICogICAgIGNhdGVnb3J5OiB7XG4gKiAgICAgICAgIGlkOiAxLFxuICogICAgICAgICBuYW1lOiAnVmlkZW8nLFxuICogICAgICAgICBvbmxpbmVfcHJvamVjdHM6IDFcbiAqICAgICB9XG4gKiB9KVxuICovXG53aW5kb3cuYy5DYXRlZ29yeUJ1dHRvbiA9ICgobSwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGFyZ3MuY2F0ZWdvcnk7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkke2NhdGVnb3J5Lm5hbWUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjYnlfY2F0ZWdvcnlfaWQvJHtjYXRlZ29yeS5pZH0nXWAsXG4gICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmV4cGxvcmUnLCBjYXRlZ29yeS5vbmxpbmVfcHJvamVjdHMpXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5GaWx0ZXJCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBmaWx0ZXJzIGNsYXNzLlxuICogSXQgdXNlcyBhIGhyZWYgYW5kIGEgdGl0bGUgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge1xuICogICAgIHRpdGxlOiAnRmlsdGVyIGJ5IGNhdGVnb3J5JyxcbiAqICAgICBocmVmOiAnZmlsdGVyX2J5X2NhdGVnb3J5J1xuICogfSlcbiAqL1xud2luZG93LmMuRmlsdGVyQnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXJncy50aXRsZSxcbiAgICAgICAgICAgICAgICAgIGhyZWYgPSBhcmdzLmhyZWY7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuZmlsdGVycyR7dGl0bGUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjJHtocmVmfSddYCwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuRmlsdGVyRGF0ZVJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyTnVtYmVyUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGZsZXggcHJvamVjdCBtZGUuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9ICgobSwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXhwbGFuYXRpb24gPSAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChyZXNvdXJjZS5leHBpcmVzX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3Byb2plY3RzLycgKyByZXNvdXJjZS5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgJ1F1ZXJvIGluaWNpYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBhIHJldGEgZmluYWwgZGUgNyBkaWFzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdzcGFuJywgYFZvY8OqIHJlY2ViZSB0dWRvIHF1ZSBhcnJlY2FkYXIgYXTDqSBhcyAke2gubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCwgJ0hIOm1tOnNzJyl9IGRlICR7aC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KX1gKSlcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLCBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksICcuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIFBVQkxJQ0FSLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmxhbmRpbmdRQSBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgcXVlc3Rpb24vYW5zd2VyIGJveCB3aXRoIHRvZ2dsZVxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICogICAgICAgICAgcXVlc3Rpb246ICdXaGF0cyB5b3VyIG5hbWU/JyxcbiAqICAgICAgICAgIGFuc3dlcjogJ0RhcnRoIFZhZGVyLidcbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nUUEgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dBbnN3ZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQucWEtY2FyZC51LW1hcmdpbmJvdHRvbS0yMC51LXJhZGl1cy5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zaG93QW5zd2VyLnRvZ2dsZVxuICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBhcmdzLnF1ZXN0aW9uKSxcbiAgICAgICAgICAgICAgICBjdHJsLnNob3dBbnN3ZXIoKSA/IG0oJ3AudS1tYXJnaW50b3AtMjAuZm9udHNpemUtc21hbGwnLCBhcmdzLmFuc3dlcikgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nU2lnbnVwID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgICAgICBlbWFpbCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgudmFsaWRhdGVFbWFpbChlbWFpbCgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvckNsYXNzZXMgPSAoIWN0cmwuZXJyb3IpID8gJy5wb3NpdGl2ZS5lcnJvcicgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCdmb3JtLnctZm9ybVtpZD1cImVtYWlsLWZvcm1cIl1bbWV0aG9kPVwicG9zdFwiXVthY3Rpb249XCInICsgYXJncy5idWlsZGVyLmN1c3RvbUFjdGlvbiArICdcIl0nLHtcbiAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLmVtYWlsKClcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2FyZCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgICAgICAgY2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICAgICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBvcE5vdGlmaWNhdGlvbiA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5Tm90aWZpY2F0aW9uID0gaC50b2dnbGVQcm9wKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Tm90aWZpY2F0aW9uOiBkaXNwbGF5Tm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24oKSA/IG0oJy5mbGFzaC53LWNsZWFyZml4LmNhcmQuY2FyZC1ub3RpZmljYXRpb24udS1yYWRpdXMuemluZGV4LTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWNsb3NlW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAveC5wbmdcIl1bd2lkdGg9XCIxMlwiXVthbHQ9XCJmZWNoYXJcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbi50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBhcmdzLm1lc3NhZ2UpXG4gICAgICAgICAgICBdKSA6IG0oJ3NwYW4nKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKChtLCBjLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgb25saW5lRGF5cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBtb21lbnQocHJvamVjdC56b25lX29ubGluZV9kYXRlKS5kaWZmKG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24oZGlmZik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1NYXRoLmNlaWwoZHVyYXRpb24uYXNEYXlzKCkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZnVuZGluZ1BlcmlvZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByb2plY3QuaXNfcHVibGlzaGVkICYmIGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSkgPyBtKCcuZnVuZGluZy1wZXJpb2QnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYCR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX29ubGluZV9kYXRlKX0gLSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gKCR7b25saW5lRGF5cygpfSBkaWFzKWApXG4gICAgICAgICAgICAgICAgXSkgOiAnJztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuYnVkZ2V0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnT3LDp2FtZW50bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgIV8uaXNFbXB0eShhcmdzLnJld2FyZERldGFpbHMoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnUmVjb21wZW5zYXMnKSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSwgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdTdWdlc3TDtWVzwqBkZcKgYXBvaW8nKSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICAgICAgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2FyZCA9ICgobSwgaCwgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuY2FyZCcpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSksXG4gICAgICAgICAgICAgICAgbGluayA9ICcvJyArIHByb2plY3QucGVybWFsaW5rICsgKGFyZ3MucmVmID8gJz9yZWY9JyArIGFyZ3MucmVmIDogJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBhLmNhcmQtcHJvamVjdC10aHVtYltocmVmPVwiJHtsaW5rfVwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7cHJvamVjdC5wcm9qZWN0X2ltZ30pYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBgJHtJMThuLnQoJ2J5JywgSTE4blNjb3BlKCkpfSAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZSA/IHByb2plY3QuY2l0eV9uYW1lIDogJyd9LCAke3Byb2plY3Quc3RhdGVfYWNyb255bSA/IHByb2plY3Quc3RhdGVfYWNyb255bSA6ICcnfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgLmNhcmQtcHJvamVjdC1tZXRlci4ke3Byb2plY3Quc3RhdGV9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uY29udGFpbnMoWydzdWNjZXNzZnVsJywgJ2ZhaWxlZCcsICd3YWl0aW5nX2Z1bmRzJ10sIHByb2plY3Quc3RhdGUpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgSTE4bi50KCdkaXNwbGF5X3N0YXR1cy4nICsgcHJvamVjdC5zdGF0ZSwgSTE4blNjb3BlKCkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0JywgcHJvamVjdC5leHBpcmVzX2F0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH0gJHtyZW1haW5pbmdUZXh0T2JqLnVuaXR9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgKHJlbWFpbmluZ1RleHRPYmoudG90YWwgPiAxKSA/ICdSZXN0YW50ZXMnIDogJ1Jlc3RhbnRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodCcsIFsnUHJhem8gZW0nLG0oJ2JyJyksJ2FiZXJ0byddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb21tZW50cyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbW1lbnRzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge3JldHVybjt9XG4gICAgICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge2xvYWRDb21tZW50czogbG9hZENvbW1lbnRzfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcuZmItY29tbWVudHNbZGF0YS1ocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bZGF0YS1udW0tcG9zdHM9NTBdW2RhdGEtd2lkdGg9XCI2MTBcIl0nLCB7Y29uZmlnOiBjdHJsLmxvYWRDb21tZW50cygpfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfcGF5bWVudDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmcgPSAod2FpdGluZyA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWTS53YWl0aW5nX3BheW1lbnQod2FpdGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpLndhaXRpbmdfcGF5bWVudChmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbGlzdFZNOiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmc6IHRvZ2dsZVdhaXRpbmdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk07XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3RfY29udHJpYnV0aW9ucy5jb250ZW50LnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgICAgIChhcmdzLnByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtjaGVja2VkPVwiY2hlY2tlZFwiXVtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt0eXBlPVwicmFkaW9cIl1bdmFsdWU9XCJhdmFpbGFibGVfdG9fY291bnRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXScsICdDb25maXJtYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdW3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3ZhbHVlPVwid2FpdGluZ19jb25maXJtYXRpb25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZyh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsICdQZW5kZW50ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucycsIF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudGh1bWIudS1sZWZ0LnUtcm91bmRbc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwpID8gY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCA6ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJykgKyAnKTsgYmFja2dyb3VuZC1zaXplOiBjb250YWluO1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi1kYXJrW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi51c2VyX25hbWUpLCAoY29udHJpYnV0aW9uLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLCAoY29udHJpYnV0aW9uLmFub255bW91cyA/IFttLnRydXN0KCcmbmJzcDstJm5ic3A7JyksIG0oJ3N0cm9uZycsICdBcG9pYWRvciBhbsO0bmltbycpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVksIEhIOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgWyFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSBjb21wb25lbnRcbiAqIGJ1aWxkIGRhc2hib2FyZCBwcm9qZWN0IG1lbnUgZm9yIHByb2plY3Qgb3duZXJzXG4gKiBhbmQgYWRtaW4uXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAqICAgICBwcm9qZWN0OiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXNoYm9hcmRNZW51ID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXYgPSBoLnRvZ2dsZVByb3AoJ2JvZHktcHJvamVjdCBvcGVuJywgJ2JvZHktcHJvamVjdCBjbG9zZWQnKTtcblxuICAgICAgICAgICAgaWYgKCFhcmdzLnByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHksXG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlOiBlZGl0TGlua3NUb2dnbGUsXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdjogYm9keVRvZ2dsZUZvck5hdlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0Um91dGUgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgICAgZWRpdFJvdXRlID0gcHJvamVjdFJvdXRlICsgJy9lZGl0JyxcbiAgICAgICAgICAgICAgICAgIGVkaXRMaW5rQ2xhc3MgPSAnZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICdpbmRlbnQnIDogJycpO1xuICAgICAgICAgICAgbGV0IG9wdGlvbmFsT3B0ID0gKHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnID8gbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJyAob3BjaW9uYWwpJykgOiAnJyk7XG5cbiAgICAgICAgICAgIGN0cmwuYm9keS5jbGFzc05hbWUgPSBjdHJsLmJvZHlUb2dnbGVGb3JOYXYoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LW5hdicsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1uYXYtd3JhcHBlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbmF2Lnctc2VjdGlvbi5kYXNoYm9hcmQtbmF2LnNpZGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmsudy1pbmxpbmUtYmxvY2suZGFzaGJvYXJkLXByb2plY3QtbmFtZVtocmVmPVwiJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcvJyArIHByb2plY3QucGVybWFsaW5rIDogZWRpdFJvdXRlICsgJyNwcmV2aWV3JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LWRhc2hib2FyZFtzcmM9XCInICsgKF8uaXNOdWxsKHByb2plY3QubGFyZ2VfaW1hZ2UpID8gJy9hc3NldHMvdGh1bWItcHJvamVjdC5wbmcnIDogcHJvamVjdC5sYXJnZV9pbWFnZSkgKyAnXCJdW3dpZHRoPVwiMTE0XCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS5saW5laGVpZ2h0LXRpZ2h0LmZvbnRzaXplLXNtYWxsJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudS1tYXJnaW50b3AtMTBbc3JjPVwiL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC9iYWRnZS0ke3Byb2plY3QubW9kZX0taC5wbmdcIl1bd2lkdGg9ODBdYClcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjaW5mby1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9ob21lX2xpbmtbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKGgubG9jYXRpb25BY3Rpb25NYXRjaCgnaW5zaWdodHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCInICsgcHJvamVjdFJvdXRlICsgJy9pbnNpZ2h0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXItY2hhcnQuZmEtbGcuZmEtZncnKSwgJyBNaW5oYSBDYW1wYW5oYSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEuZmEtdGFibGUuZmEtbGcuZmEtZncnKSwgJyBSZWxhdMOzcmlvcyBkZSBhcG9pb3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQudS1tYXJnaW5ib3R0b20tMzBbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Bvc3RzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksICcgTm92aWRhZGVzICcsIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1wZW5jaWwuZmEtZncuZmEtbGcnKSwgJyBFZGl0YXIgcHJvamV0bydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSksIChjdHJsLmVkaXRMaW5rc1RvZ2dsZSgpID8gbSgnI2VkaXQtbWVudS1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNiYXNpY3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYmFzaWNzJyArICdcIl0nLCAnQsOhc2ljbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSA9PT0gJ2FvbicgPyAnTWV0YSBlIHByYXpvJyA6ICdGaW5hbmNpYW1lbnRvJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGVzY3JpcHRpb25fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZGVzY3JpcHRpb24nICsgJ1wiXScsICdEZXNjcmnDp8OjbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSN2aWRlb19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN2aWRlbycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdWw61kZW8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnT3LDp2FtZW50bycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjY2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNjYXJkJyArICdcIl0nLCAnQ2FyZCBkbyBwcm9qZXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXdhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcmV3YXJkJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tcGVuc2FzJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9hYm91dF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX2Fib3V0JyArICdcIl0nLCAnU29icmUgdm9jw6onKSwgKChwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnKSB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9zZXR0aW5nc19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX3NldHRpbmdzJyArICdcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwcmV2aWV3JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZncuZmEtZXllLmZhLWxnJyksICcgUHJldmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsICdFbnZpYXInKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3B1Ymxpc2hcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUHVibGljYXInLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNwcmV2aWV3XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tc2Vjb25kYXJ5LWRhcmtbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgJ0luaWNpYXIgcmV0YSBmaW5hbCcpIDogJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLmJ0bi1kYXNoYm9hcmQgaHJlZj1cImpzOnZvaWQoMCk7XCInLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuYm9keVRvZ2dsZUZvck5hdi50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFycy5mYS1sZycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgY29tcG9uZW50XG4gKiBBIGdyYXBoIGJ1aWxkZXIgaW50ZXJmYWNlIHRvIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gKiAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICogICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gKiAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCdcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgPSAoKG0sIENoYXJ0LCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gXy5maXJzdChhcmdzLmNvbGxlY3Rpb24oKSksXG4gICAgICAgICAgICAgICAgICBzb3VyY2UgPSAoIV8uaXNVbmRlZmluZWQocmVzb3VyY2UpID8gcmVzb3VyY2Uuc291cmNlIDogW10pLFxuXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtW2FyZ3MuZGF0YUtleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0ID0gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJncy54QXhpcyhpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlIGNvbXBvbmVudFxuICogQSB0YWJsZSBpbnRlcmZhY2UgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEl0IHRha2VzIGFuIGFycmF5IGFuZCBhIGxhYmxlIGFzIGl0J3Mgc291cmNlcy5cbiAqIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSBpcyB0aGUgaGVhZGVyIGRlc2NyaXB0b3IgYW5kIHRoZSByZXN0IG9mIHRoZW0gYXJlIHJvdyBkYXRhLlxuICogUm93cyBtYXkgcmV0dXJuIGEgc3RyaW5nIG9yIGFuIGFycmF5IGFuZCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyBhIHJvdyBvdXRwdXQuXG4gKiBBbGwgdGFibGUgcm93cyBhcmUgc29ydGFibGUgYnkgZGVmYXVsdC4gSWYgeW91IHdhbnQgdG8gdXNlIGEgY3VzdG9tIHZhbHVlIGFzIHNvcnQgcGFyYW1ldGVyXG4gKiB5b3UgbWF5IHNldCBhIDJEIGFycmF5IGFzIHJvdy4gSW4gdGhpcyBjYXNlLCB0aGUgZmlyc3QgYXJyYXkgdmFsdWUgd2lsbCBiZSB0aGUgY3VzdG9tIHZhbHVlXG4gKiB3aGlsZSB0aGUgb3RoZXIgd2lsbCBiZSB0aGUgYWN0dWFsIG91dHB1dC5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAqICAgICAgbGFiZWw6ICdUYWJsZSBsYWJlbCcsXG4gKiAgICAgIHRhYmxlOiBbXG4gKiAgICAgICAgICBbJ2NvbCBoZWFkZXIgMScsICdjb2wgaGVhZGVyIDInXSxcbiAqICAgICAgICAgIFsndmFsdWUgMXgxJywgWzMsICd2YWx1ZSAxeDInXV0sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDJ4MScsIFsxLCAndmFsdWUgMngyJ11dIC8vV2UgYXJlIHVzaW5nIGEgY3VzdG9tIGNvbXBhcmF0b3IgdHdvIGNvbCAyIHZhbHVlc1xuICogICAgICBdLFxuICogICAgICAvL0FsbG93cyB5b3UgdG8gc2V0IGEgc3BlY2lmaWMgY29sdW1uIHRvIGJlIG9yZGVyZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgLy9JZiBubyB2YWx1ZSBpcyBzZXQsIHRoZSBmaXJzdCByb3cgd2lsbCBiZSB0aGUgZGVmYXVsdCBvbmUgdG8gYmUgb3JkZXJlZC5cbiAqICAgICAgLy9OZWdhdGl2ZSB2YWx1ZXMgbWVhbiB0aGF0IHRoZSBvcmRlciBzaG91bGQgYmUgcmV2ZXJ0ZWRcbiAqICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTNcbiAqICB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHRhYmxlID0gbS5wcm9wKGFyZ3MudGFibGUpLFxuICAgICAgICAgICAgICAgIHNvcnRJbmRleCA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBzb3J0SW5kZXgoKSxcbiAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgeCA9IChfLmlzQXJyYXkoYVtpZHhdKSAmJiBhW2lkeF0ubGVuZ3RoID4gMSkgPyBhW2lkeF1bMF0gOiBhW2lkeF0sXG4gICAgICAgICAgICAgICAgICAgIHkgPSAoXy5pc0FycmF5KGJbaWR4XSkgJiYgYltpZHhdLmxlbmd0aCA+IDEpID8gYltpZHhdWzBdIDogYltpZHhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHggPCB5KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeSA8IHgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzb3J0VGFibGUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QodGFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgIGJvZHk7XG4gICAgICAgICAgICAgICAgaWYgKHNvcnRJbmRleCgpID09PSBpZHgpe1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzb3J0SW5kZXgoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhYmxlKF8udW5pb24oW2hlYWRlcl0sYm9keSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc29ydFRhYmxlKE1hdGguYWJzKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCkgfHwgMCk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmRlZmF1bHRTb3J0SW5kZXggPCAwKXtcbiAgICAgICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICAgICAgc29ydFRhYmxlOiBzb3J0VGFibGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdChjdHJsLnRhYmxlKCkpLFxuICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QoY3RybC50YWJsZSgpKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoaGVhZGVyLCAoaGVhZGluZywgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2hlYWRpbmd9IGAsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGJvZHksIChyb3dEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnRhYmxlLXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cgPSAoXy5pc0FycmF5KHJvdykgJiYgcm93Lmxlbmd0aCA+IDEpID8gcm93WzFdIDogcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgcm93KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLXByb2R1Y3QuJyArIHByb2plY3QubW9kZSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wYWdlLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXIuZm9udHdlaWdodC1zZW1pYm9sZC5wcm9qZWN0LW5hbWVbaXRlbXByb3A9XCJuYW1lXCJdJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BvciAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnByb2plY3QtaGlnaGxpZ2h0JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGlnaGxpZ2h0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGlnaGxpZ2h0JywgW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlbycsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdtaW4taGVpZ2h0OiAyNDBweDsnXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIicgKyBwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3Qub3JpZ2luYWxfaW1hZ2UgKyAnKTsnXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWJsdXJiJywgcHJvamVjdC5oZWFkbGluZSksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzTnVsbChwcm9qZWN0LmFkZHJlc3MpID9cbiAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodC51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiL3B0L2V4cGxvcmU/cGdfc2VhcmNoPSR7cHJvamVjdC5hZGRyZXNzLnN0YXRlX2Fjcm9ueW19XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlcicpLCBgICR7cHJvamVjdC5hZGRyZXNzLmNpdHl9LCAke3Byb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0W2hyZWY9XCIvcHQvZXhwbG9yZSNieV9jYXRlZ29yeV9pZC8ke3Byb2plY3QuY2F0ZWdvcnlfaWR9XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS10YWcnKSwgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jYXRlZ29yeV9uYW1lXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jc2hhcmUtYm94LmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgfSwgJ0NvbXBhcnRpbGhhcicpLCAoY3RybC5kaXNwbGF5U2hhcmVCb3goKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdFNoYXJlQm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVNoYXJlQm94OiBjdHJsLmRpc3BsYXlTaGFyZUJveFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RNYWluID0gKChtLCBjLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZGlzcGxheVRhYkNvbnRlbnQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNfb3B0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFicyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jld2FyZHMnOiBtKCcudy1jb2wudy1jb2wtMTInLCBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29tbWVudHMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzWycjYWJvdXQnXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgbS5yZWRyYXcsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudDogZGlzcGxheVRhYkNvbnRlbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmRpc3BsYXlUYWJDb250ZW50KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0TW9kZSBjb21wb25lbnRcbiAqIEEgc2ltcGxlIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgYmFkZ2Ugd2l0aCB0aGUgY3VycmVudCBwcm9qZWN0IG1vZGVcbiAqIHRvZ2V0aGVyIHdpdGggYSBkZXNjcmlwdGlvbiBvZiB0aGUgbW9kZSwgc2hvd24gaW5zaWRlIGEgdG9vbHRpcC5cbiAqIEl0IHJlY2VpdmVzIGEgcHJvamVjdCBhcyByZXNvdXJjZVxuICpcbiAqIEV4YW1wbGU6XG4gKiAgdmlldzoge1xuICogICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0TW9kZSwge3Byb2plY3Q6IHByb2plY3R9KVxuICogIH1cbiAqL1xud2luZG93LmMuUHJvamVjdE1vZGUgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBtb2RlID0gcHJvamVjdC5tb2RlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBUZXh0ID0gKG1vZGUgPT09ICdhb24nKSA/IGBTb21lbnRlIHJlY2ViZXLDoSBvcyByZWN1cnNvcyBzZSBhdGluZ2lyIG91IHVsdHJhcGFzc2FyIGEgbWV0YSBhdMOpIG8gZGlhICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQsICdERC9NTS9ZWVlZJyl9LmAgOiAnTyByZWFsaXphZG9yIHJlY2ViZXLDoSB0b2RvcyBvcyByZWN1cnNvcyBxdWFuZG8gZW5jZXJyYXIgYSBjYW1wYW5oYSwgbWVzbW8gcXVlIG7Do28gdGVuaGEgYXRpbmdpZG8gZXN0YSBtZXRhLic7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbW9kZTogbW9kZSxcbiAgICAgICAgICAgICAgICB0b29sdGlwVGV4dDogdG9vbHRpcFRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbW9kZSA9IGN0cmwubW9kZSxcbiAgICAgICAgICAgICAgICBtb2RlSW1nU3JjID0gKG1vZGUgPT09ICdhb24nKSA/ICcvYXNzZXRzL2Fvbi1iYWRnZS5wbmcnIDogJy9hc3NldHMvZmxleC1iYWRnZS5wbmcnLFxuICAgICAgICAgICAgICAgIG1vZGVUaXRsZSA9IChtb2RlID09PSAnYW9uJykgPyAnQ2FtcGFuaGEgVHVkby1vdS1uYWRhICcgOiAnQ2FtcGFuaGEgRmxleMOtdmVsICcsXG4gICAgICAgICAgICAgICAgZ29hbCA9IChfLmlzTnVsbChhcmdzLnByb2plY3QuZ29hbCkgPyAnbsOjbyBkZWZpbmlkYScgOiBoLmZvcm1hdE51bWJlcihhcmdzLnByb2plY3QuZ29hbCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC50b29sdGlwVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCMke21vZGV9Lnctcm93YCwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbWdbc3JjPVwiJHttb2RlSW1nU3JjfVwiXVt3aWR0aD0nMzAnXWApXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTEwLnctY29sLXRpbnktMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTWV0YSBSJCAnICsgZ29hbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWlubGluZS1ibG9jay5mb250c2l6ZS1zbWFsbGVzdC5fdy1pbmxpbmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlVGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwKCdzcGFuLnctaW5saW5lLWJsb2NrLnRvb2x0aXAtd3JhcHBlci5mYS5mYS1xdWVzdGlvbi1jaXJjbGUuZm9udGNvbG9yLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFBvc3RzID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0UG9zdERldGFpbCksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXBvc3RzLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5pc0VtcHR5KGxpc3QuY29sbGVjdGlvbigpKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwLnUtbWFyZ2ludG9wLTIwJywgJ1RvZGEgbm92aWRhZGUgcHVibGljYWRhIG5vIENhdGFyc2Ugw6kgZW52aWFkYSBkaXJldGFtZW50ZSBwYXJhIG8gZW1haWwgZGUgcXVlbSBqw6EgYXBvaW91IHNldSBwcm9qZXRvIGUgdGFtYsOpbSBmaWNhIGRpc3BvbsOtdmVsIHBhcmEgdmlzdWFsaXphw6fDo28gbm8gc2l0ZS4gVm9jw6ogcG9kZSBvcHRhciBwb3IgZGVpeMOhLWxhIHDDumJsaWNhLCBvdSB2aXPDrXZlbCBzb21lbnRlIHBhcmEgc2V1cyBhcG9pYWRvcmVzIGFxdWkgbmVzdGEgYWJhLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1lZGl0LmJ0bi1zbWFsbFtocmVmPScvcHQvcHJvamVjdHMvJHtwcm9qZWN0LmlkfS9lZGl0I3Bvc3RzJ11gLCAnRXNjcmV2ZXIgbm92aWRhZGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucG9zdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS02MCAudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udGNvbG9yLXNlY29uZGFyeS51LXRleHQtY2VudGVyJywgaC5tb21lbnRpZnkocG9zdC5jcmVhdGVkX2F0KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSwgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXJlbWluZGVyLWNvdW50LmNhcmQudS1yYWRpdXMudS10ZXh0LWNlbnRlci5tZWRpdW0udS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8nLCBwcm9qZWN0LnJlbWluZGVyX2NvdW50KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgY2xpY2thYmxlIHByb2plY3QgcmVtaW5kZXIgZWxlbWVudC5cbiAqIFRoZSBjb21wb25lbnQgY2FuIGJlIG9mIHR3byB0eXBlczogYSAnbGluaycgb3IgYSAnYnV0dG9uJ1xuICpcbiAqIEV4YW1wbGU6XG4gKiAgdmlldzoge1xuICogICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJ30pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgPSAoKG0sIG1vZGVscywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdG9yZVJlbWluZGVyTmFtZSA9ICdyZW1pbmRfJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoLmdldFVzZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5zdG9yZUFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubmF2aWdhdGVUb0RldmlzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2FkZXJPcHRzID0gcHJvamVjdC5pbl9yZW1pbmRlciA/IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIuZGVsZXRlT3B0aW9ucyhmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpIDogbW9kZWxzLnByb2plY3RSZW1pbmRlci5wb3N0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiBwcm9qZWN0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGxvYWRlck9wdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5pbl9yZW1pbmRlciA9ICFwcm9qZWN0LmluX3JlbWluZGVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5pbl9yZW1pbmRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5jYWxsU3RvcmVkQWN0aW9uKHN0b3JlUmVtaW5kZXJOYW1lLCBzdWJtaXRSZW1pbmRlcik7XG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKHByb2plY3QuaWQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXI6IHN1Ym1pdFJlbWluZGVyLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbjogcG9wTm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFpbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJycgOiAnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJ3ctYnV0dG9uIGJ0biBidG4tdGVyY2lhcnkgYnRuLW5vLWJvcmRlcicgOiAnYnRuLWxpbmsgbGluay1oaWRkZW4gZm9udHNpemUtc21hbGwnLFxuICAgICAgICAgICAgICAgIGhpZGVUZXh0T25Nb2JpbGUgPSBhcmdzLmhpZGVUZXh0T25Nb2JpbGUgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCNwcm9qZWN0LXJlbWluZGVyJHttYWluQ2xhc3N9YCwgW1xuICAgICAgICAgICAgICAgIG0oYGJ1dHRvbltjbGFzcz1cIiR7YnV0dG9uQ2xhc3N9ICR7KHByb2plY3QuaW5fcmVtaW5kZXIgPyAnbGluay1oaWRkZW4tc3VjY2VzcycgOiAnZm9udGNvbG9yLXNlY29uZGFyeScpfSBmb250d2VpZ2h0LXNlbWlib2xkXCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnN1Ym1pdFJlbWluZGVyXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkgPyAnYWd1YXJkZSAuLi4nIDogbSgnc3Bhbi5mYS5mYS1jbG9jay1vJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShgc3BhbiR7aGlkZVRleHRPbk1vYmlsZSA/ICcudy1oaWRkZW4tbWVkaXVtJyA6ICcnfWAsIHByb2plY3QuaW5fcmVtaW5kZXIgPyAnIExlbWJyZXRlIGF0aXZvJyA6ICcgTGVtYnJhci1tZScpXG4gICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgIF0pLCAoY3RybC5wb3BOb3RpZmljYXRpb24oKSA/IG0uY29tcG9uZW50KGMuUG9wTm90aWZpY2F0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdPayEgVmFtb3MgdGUgbWFuZGFyIHVtIGxlbWJyZXRlIHBvciBlLW1haWwgNDggaG9yYXMgYW50ZXMgZG8gZmltIGRhIGNhbXBhbmhhJ1xuICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9ICgobSwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICAvL0ZJWE1FOiBNSVNTSU5HIEFESlVTVFNcbiAgICAgICAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNyZXdhcmRzLnUtbWFyZ2luYm90dG9tLTMwJywgXy5tYXAoYXJncy5yZXdhcmREZXRhaWxzKCksIChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2FbY2xhc3M9XCInICsgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/ICdjYXJkLWdvbmUnIDogJ2NhcmQtcmV3YXJkICcgKyAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ2NsaWNrYWJsZScgOiAnJykpICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyAmJiAhaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA6ICdqczp2b2lkKDApOycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pbycsICcgYXBvaW9zJykpLCAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wZW5kaW5nLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLnBsdXJhbGl6ZShyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LCAnIGFwb2lvIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28nLCAnIGFwb2lvcyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWdvbmUuZm9udHNpemUtc21hbGxlcicsICdFc2dvdGFkYScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtYXR0ZW50aW9uLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtYm9sZCcsICdMaW1pdGFkYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAoJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW50b3AtMjAnLCBtLnRydXN0KGguc2ltcGxlRm9ybWF0KHJld2FyZC5kZXNjcmlwdGlvbikpKSwgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2InLCAnRXN0aW1hdGl2YSBkZSBFbnRyZWdhOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm1vbWVudGlmeShyZXdhcmQuZGVsaXZlcl9hdCwgJ01NTS9ZWVlZJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1ob3ZlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Um93ID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBhcmdzLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgcmVmID0gYXJncy5yZWYsXG4gICAgICAgICAgICAgICAgd3JhcHBlciA9IGFyZ3Mud3JhcHBlciB8fCAnLnctc2VjdGlvbi5zZWN0aW9uLnUtbWFyZ2luYm90dG9tLTQwJztcbiAgICAgICAgICAgIHJldHVybiBtKHdyYXBwZXIsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLnRpdGxlKSB8fCAhXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLmhhc2gpKSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC1sb29zZXInLCBjb2xsZWN0aW9uLnRpdGxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgKGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCkgPyBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaGFyZUJveCA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVtYmVkOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5wb3Atc2hhcmUnLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OiBibG9jazsnXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZS51LXJpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdGZWNoYXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtZmFjZWJvb2sudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjE1MHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS92Mi4wL3BsdWdpbnMvc2hhcmVfYnV0dG9uLnBocD9hcHBfaWQ9MTczNzQ3MDQyNjYxNDkxJmNoYW5uZWw9aHR0cHMlM0ElMkYlMkZzLXN0YXRpYy5hay5mYWNlYm9vay5jb20lMkZjb25uZWN0JTJGeGRfYXJiaXRlciUyRjQ0T3dLNzR1MEllLmpzJTNGdmVyc2lvbiUzRDQxJTIzY2IlM0RmN2Q5YjkwMGMlMjZkb21haW4lM0R3d3cuY2F0YXJzZS5tZSUyNm9yaWdpbiUzRGh0dHBzJTI1M0ElMjUyRiUyNTJGd3d3LmNhdGFyc2UubWUlMjUyRmY0YjNhZDBjOCUyNnJlbGF0aW9uJTNEcGFyZW50LnBhcmVudCZjb250YWluZXJfd2lkdGg9MCZocmVmPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyUzRnJlZiUzRGZhY2Vib29rJmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPXB0X0JSJnNkaz1qb2V5XCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9XCJ0cnVlXCJdW3dpZHRoPVwiMTIwcHhcIl1baGVpZ2h0PVwiMjJweFwiXVtmcmFtZWJvcmRlcj1cIjBcIl1bc2Nyb2xsaW5nPVwibm9cIl1bc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzL3R3ZWV0X2J1dHRvbi44ZDAwN2RkZmMxODRlNjc3NmJlNzZmZTllNWU1MmQ2OS5lbi5odG1sI189MTQ0MjQyNTk4NDkzNiZjb3VudD1ob3Jpem9udGFsJmRudD1mYWxzZSZpZD10d2l0dGVyLXdpZGdldC0xJmxhbmc9ZW4mb3JpZ2luYWxfcmVmZXJlcj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICcmc2l6ZT1tJnRleHQ9Q29uZmlyYSUyMG8lMjBwcm9qZXRvJTIwJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyUyMG5vJTIwJTQwY2F0YXJzZSZ0eXBlPXNoYXJlJnVybD1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0R0d2l0dGVyJnZpYT1jYXRhcnNlXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLXNtYWxsLndpZGdldC1lbWJlZC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlFbWJlZC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnPCBlbWJlZCA+JyksIChjdHJsLmRpc3BsYXlFbWJlZCgpID8gbSgnLmVtYmVkLWV4cGFuZGVkLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0W3R5cGU9XCJ0ZXh0XCJdW3ZhbHVlPVwiPGlmcmFtZSBmcmFtZWJvcmRlcj1cIjBcIiBoZWlnaHQ9XCIzMTRweFwiIHNyYz1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtZW1iZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0LmlkICsgJy9lbWJlZFwiXVt3aWR0aD1cIjMwMHB4XCJdW3Njcm9sbGluZz1cIm5vXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi1mYi51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGFyZ3MucHJvamVjdC5uYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZmFjZWJvb2snKSwgJyBDb21wYXJ0aWxoZSdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9QWNhYmVpIGRlIGFwb2lhciBvIHByb2pldG8gJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyBodHRzOi8vd3d3LmNhdGFyc2UubWUvJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnP3JlZj10d2l0dGVyclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCAnIFR3ZWV0J1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoKG0sIGgsIGMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5wcm9qZWN0X3NpZGViYXInKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzcyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbmltYXRpb24sIHByb2dyZXNzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRJbmNyZW1lbnQgPSBwcm9qZWN0LnBsZWRnZWQgLyBwcm9qZWN0LnByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0luY3JlbWVudCA9IHByb2plY3QudG90YWxfY29udHJpYnV0b3JzIC8gcHJvamVjdC5wcm9ncmVzcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3NCYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxlZGdlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyaWJ1dG9ycycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IHNldEludGVydmFsKGluY3JlbWVudFByb2dyZXNzLCAyOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRQcm9ncmVzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzIDw9IHBhcnNlSW50KHByb2plY3QucHJvZ3Jlc3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IGAke3Byb2dyZXNzfSVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsLmlubmVyVGV4dCA9IGBSJCAke2guZm9ybWF0TnVtYmVyKHBsZWRnZWQpfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNFbC5pbm5lclRleHQgPSBgJHtwYXJzZUludChjb250cmlidXRvcnMpfSBwZXNzb2FzYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmlubmVyVGV4dCA9IGAke3Byb2dyZXNzfSVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IHBsZWRnZWQgKyBwbGVkZ2VkSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gY29udHJpYnV0b3JzICsgY29udHJpYnV0b3JzSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9ncmVzcyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxODAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ2NhcmQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogJ2NhcmQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdjYXJkLWRhcmsnXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gPyAnY2FyZCB1LXJhZGl1cyB6aW5kZXgtMTAgJyArIHN0YXRlc1twcm9qZWN0LnN0YXRlXSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmFwcHJvdmVkJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29ubGluZSc6IGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSA/IEkxOG4udCgnZGlzcGxheV9zdGF0dXMub25saW5lJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9KSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmYWlsZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmZhaWxlZCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCBnb2FsOiBwcm9qZWN0LmdvYWx9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVqZWN0ZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLnJlamVjdGVkJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5pbl9hbmFseXNpcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5zdWNjZXNzZnVsJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMud2FpdGluZ19mdW5kcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuZHJhZnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZVByb2dyZXNzOiBhbmltYXRlUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzczogZGlzcGxheUNhcmRDbGFzcyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZWxhcHNlZCA9IHByb2plY3QuZWxhcHNlZF90aW1lLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHByb2plY3QucmVtYWluaW5nX3RpbWU7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1zaWRlYmFyLmFzaWRlJywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbm5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLWluZm8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGxlZGdlZC5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnY29udHJpYnV0b3JzX2NhbGwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuI2NvbnRyaWJ1dG9ycy5mb250d2VpZ2h0LXNlbWlib2xkJywgSTE4bi50KCdjb250cmlidXRvcnNfY291bnQnLCBJMThuU2NvcGUoe2NvdW50OiBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9yc30pKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuZXhwaXJlc19hdCkgPyAnIGVtICcgKyBJMThuLnQoJ2RhdGV0aW1lLmRpc3RhbmNlX2luX3dvcmRzLnhfJyArIGVsYXBzZWQudW5pdCwge2NvdW50OiBlbGFwc2VkLnRvdGFsfSwgSTE4blNjb3BlKCkpIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwcm9ncmVzc0Jhci5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7cHJvamVjdC5wcm9ncmVzc30lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXInLCBgJHtwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1yaWdodC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LXRpZ2h0ZXInLCByZW1haW5pbmcudG90YWwgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVtYWluaW5nLnRvdGFsKSwgSTE4bi50KCdyZW1haW5pbmdfdGltZS4nICsgcmVtYWluaW5nLnVuaXQsIEkxOG5TY29wZSh7Y291bnQ6IHJlbWFpbmluZy50b3RhbH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgLCAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gbSgnYSNjb250cmlidXRlX3Byb2plY3RfZm9ybS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3XCJdJywgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpIDogJycpLCAoKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucykgPyBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJ1xuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnVzZXItYycsIG0uY29tcG9uZW50KGMuUHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zIGNvbXBvbmVudFxuICogQSBQcm9qZWN0LXNob3cgcGFnZSBoZWxwZXIgdG8gc2hvdyBzdWdnZXN0ZWQgYW1vdW50cyBvZiBjb250cmlidXRpb25zXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgIC4uLlxuICogICBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgIC4uLlxuICogfVxuICovXG5cbndpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uVXJsID0gKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgL3Byb2plY3RzLyR7cHJvamVjdC5wcm9qZWN0X2lkfS9jb250cmlidXRpb25zL25ldz9hbW91bnQ9JHthbW91bnR9YDtcbiAgICAgICAgICAgIH0sIHN1Z2dlc3RlZFZhbHVlcyA9IFsxMCwgMjUsIDUwLCAxMDBdO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3N1Z2dlc3Rpb25zJywgXy5tYXAoc3VnZ2VzdGVkVmFsdWVzLCAoYW1vdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oYGFbaHJlZj1cIiR7c3VnZ2VzdGlvblVybChhbW91bnQpfVwiXS5jYXJkLXJld2FyZC5jYXJkLWJpZy5jYXJkLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMGAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGBSJMKgJHthbW91bnR9YClcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RUYWJzID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBpc0ZpeGVkID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gbS5wcm9wKC0xKTtcblxuICAgICAgICAgICAgY29uc3QgZml4T25TY3JvbGwgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmlld3BvcnRPZmZzZXQgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LnNjcm9sbFkgPD0gb3JpZ2luYWxQb3NpdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC50b3AgPCAwIHx8ICh3aW5kb3cuc2Nyb2xsWSA+IG9yaWdpbmFsUG9zaXRpb24oKSAmJiBvcmlnaW5hbFBvc2l0aW9uKCkgPiAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpeGVkKCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24od2luZG93LnNjcm9sbFkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBuYXZEaXNwbGF5ID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpeE5hdkJhciA9IGZpeE9uU2Nyb2xsKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZpeE5hdkJhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYXZEaXNwbGF5OiBuYXZEaXNwbGF5LFxuICAgICAgICAgICAgICAgIGlzRml4ZWQ6IGlzRml4ZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHJld2FyZHMgPSBhcmdzLnJld2FyZERldGFpbHM7XG5cbiAgICAgICAgICAgIGxldCBtYWluQ2xhc3MgPSAoIWN0cmwuaXNGaXhlZCgpIHx8IHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4pID8gJy53LXNlY3Rpb24ucHJvamVjdC1uYXYnIDogJy53LXNlY3Rpb24ucHJvamVjdC1uYXYucHJvamVjdC1uYXYtZml4ZWQnO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnbmF2LXdyYXBwZXInLFtcbiAgICAgICAgICAgICAgICBtKG1haW5DbGFzcywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwubmF2RGlzcGxheVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgWyFfLmlzRW1wdHkocmV3YXJkcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnUmVjb21wZW5zYXMnKSA6IG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25fc3VnZ2VzdGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1ZhbG9yZXMgU3VnZXJpZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJhYm91dC1saW5rXCJdW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdTb2JyZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicG9zdHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcG9zdHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcG9zdHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdmlkYWRlcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QucG9zdHNfY291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29udHJpYnV0aW9ucy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQXBvaW9zICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29tbWVudHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29tbWVudHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29tbWVudHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWVudMOhcmlvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbmF2LWJhY2stYnV0dG9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtbWVkaXVtLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG5baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFywqDigI1lc3RlwqBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtbWVkaXVtLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJywgaGlkZVRleHRPbk1vYmlsZTogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgKGN0cmwuaXNGaXhlZCgpICYmICFwcm9qZWN0LmlzX293bmVyX29yX2FkbWluKSA/IG0oJy53LXNlY3Rpb24ucHJvamVjdC1uYXYnKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VXNlckNhcmQgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChhcmdzLnVzZXJEZXRhaWxzKCksICh1c2VyRGV0YWlsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy51LW1hcmdpbmJvdHRvbS0zMC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LW1hcmdpbmJvdHRvbS0zMC51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmxpbmVoZWlnaHQtdGlnaHRbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMsICcgY3JpYWRvJywgJyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cywgJyBhcG9pYWRvJywgJyBhcG9pYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1oaWRkZW4tdGlueS53LWhpZGRlbi1zbWFsbC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIChsaW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkTGluayA9IGgucGFyc2VVcmwobGluayk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShwYXJzZWRMaW5rLmhvc3RuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBwYXJzZWRMaW5rLmhvc3RuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuYWx0LWxpbmsuZm9udHdlaWdodC1zZW1pYm9sZFtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHVzZXJEZXRhaWwuZW1haWwpIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuU2xpZGVyIGNvbXBvbmVudFxuICogQnVpbGQgYSBzbGlkZXIgZnJvbSBhbnkgYXJyYXkgb2YgbWl0aHJpbCBlbGVtZW50c1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgIC4uLlxuICogICAgIG0uY29tcG9uZW50KGMuU2xpZGVyLCB7XG4gKiAgICAgICAgIHNsaWRlczogW20oJ3NsaWRlMScpLCBtKCdzbGlkZTInKSwgbSgnc2xpZGUzJyldLFxuICogICAgICAgICB0aXRsZTogJ08gcXVlIGVzdMOjbyBkaXplbmRvIHBvciBhw60uLi4nXG4gKiAgICAgfSlcbiAqICAgICAuLi5cbiAqIH1cbiAqL1xud2luZG93LmMuU2xpZGVyID0gKChtLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbDtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkU2xpZGVJZHggPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25TaXplID0gbS5wcm9wKDE2MDApLFxuICAgICAgICAgICAgICAgIGRlY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoYXJncy5zbGlkZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpIDwgKGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KHNlbGVjdGVkU2xpZGVJZHgoKSArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgNjUwMCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXNldFNsaWRlclRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnID0gKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGFydFNsaWRlclRpbWVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemU6IHRyYW5zbGF0aW9uU2l6ZSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZTogZGVjcmVtZW50U2xpZGUsXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgICAgIHJlc2V0U2xpZGVyVGltZXI6IHJlc2V0U2xpZGVyVGltZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbGlkZXJDbGljayA9IChmbiwgcGFyYW0pID0+IHtcbiAgICAgICAgICAgICAgICBmbihwYXJhbSk7XG4gICAgICAgICAgICAgICAgY3RybC5yZXNldFNsaWRlclRpbWVyKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2xpZGVyLnNsaWRlLXRlc3RpbW9uaWFscycsIHtcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuY29uZmlnXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGFyZ3MudGl0bGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNsaWRlci1tYXNrJywgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChhcmdzLnNsaWRlcywgKHNsaWRlLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVWYWx1ZSA9IChpZHggLSBjdHJsLnNlbGVjdGVkU2xpZGVJZHgoKSkgKiBjdHJsLnRyYW5zbGF0aW9uU2l6ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVN0ciA9IGB0cmFuc2xhdGUzZCgke3RyYW5zbGF0ZVZhbHVlfXB4LCAwLCAwKWA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcuc2xpZGUudy1zbGlkZS5zbGlkZS10ZXN0aW1vbmlhbHMtY29udGVudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogYHRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtd2Via2l0LXRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtbXMtdHJhbnNmb3JtOiR7dHJhbnNsYXRlU3RyfTtgXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1wdXNoLTInLCBzbGlkZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcjc2xpZGUtcHJldi53LXNsaWRlci1hcnJvdy1sZWZ0LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBzbGlkZXJDbGljayhjdHJsLmRlY3JlbWVudFNsaWRlKVxuICAgICAgICAgICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWljb24tc2xpZGVyLWxlZnQuZmEuZmEtY2hldnJvbi1sZWZ0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcjc2xpZGUtbmV4dC53LXNsaWRlci1hcnJvdy1yaWdodC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5pbmNyZW1lbnRTbGlkZSlcbiAgICAgICAgICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1pY29uLXNsaWRlci1yaWdodC5mYS5mYS1jaGV2cm9uLXJpZ2h0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbmF2Lnctc2xpZGVyLW5hdi1pbnZlcnQudy1yb3VuZC5zbGlkZS1uYXYnLCBfKGFyZ3Muc2xpZGVzLmxlbmd0aCkudGltZXMoKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYC5zbGlkZS1idWxsZXQudy1zbGlkZXItZG90JHtjdHJsLnNlbGVjdGVkU2xpZGVJZHgoKSA9PT0gaWR4ID8gJy53LWFjdGl2ZScgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5zZWxlY3RlZFNsaWRlSWR4LCBpZHgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5UZWFtTWVtYmVycyA9IChmdW5jdGlvbihfLCBtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBncm91cENvbGxlY3Rpb24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBncm91cFRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tbWVtYmVycy1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnZtLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChncm91cCwgZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIuYmlnLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMTBbc3JjPVwiJyArIG1lbWJlci5pbWcgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtYmFzZScsIG1lbWJlci5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdBcG9pb3UgJyArIG1lbWJlci50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Ll8sIHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLlRlYW1Ub3RhbCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbVRvdGFsLmdldFJvdygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24udS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0hvamUgc29tb3MgJyArIHRlYW1Ub3RhbC5tZW1iZXJfY291bnQgKyAnIHBlc3NvYXMgZXNwYWxoYWRhcyBwb3IgJyArIHRlYW1Ub3RhbC50b3RhbF9jaXRpZXMgKyAnIGNpZGFkZXMgZW0gJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMubGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgcGHDrXNlcyAoJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMudG9TdHJpbmcoKSArICcpISBPIENhdGFyc2Ugw6kgaW5kZXBlbmRlbnRlLCBzZW0gaW52ZXN0aWRvcmVzLCBkZSBjw7NkaWdvIGFiZXJ0byBlIGNvbnN0cnXDrWRvIGNvbSBhbW9yLiBOb3NzYSBwYWl4w6NvIMOpIGNvbnN0cnVpciB1bSBhbWJpZW50ZSBvbmRlIGNhZGEgdmV6IG1haXMgcHJvamV0b3MgcG9zc2FtIGdhbmhhciB2aWRhLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQudGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Ub29sdGlwIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3MgeW91IHRvIHNob3cgYSB0b29sdGlwIG9uXG4gKiBhIHNwZWNpZmllZCBlbGVtZW50IGhvdmVyLiBJdCByZWNlaXZlcyB0aGUgZWxlbWVudCB5b3Ugd2FudFxuICogdG8gdHJpZ2dlciB0aGUgdG9vbHRpcCBhbmQgYWxzbyB0aGUgdGV4dCB0byBkaXNwbGF5IGFzIHRvb2x0aXAuXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgbGV0IHRvb2x0aXAgPSAoZWwpID0+IHtcbiAqICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlRvb2x0aXAsIHtcbiAqICAgICAgICAgICAgICBlbDogZWwsXG4gKiAgICAgICAgICAgICAgdGV4dDogJ3RleHQgdG8gdG9vbHRpcCcsXG4gKiAgICAgICAgICAgICAgd2lkdGg6IDMwMFxuICogICAgICAgICAgfSlcbiAqICAgICB9XG4gKlxuICogICAgIHJldHVybiB0b29sdGlwKCdhI2xpbmstd3RoLXRvb2x0aXBbaHJlZj1cIiNcIl0nKTtcbiAqXG4gKiB9XG4gKi9cbndpbmRvdy5jLlRvb2x0aXAgPSAoKG0sIGMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHBhcmVudEhlaWdodCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICB3aWR0aCA9IG0ucHJvcChhcmdzLndpZHRoIHx8IDI4MCksXG4gICAgICAgICAgICAgICAgdG9wID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIGxlZnQgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXQgPSBtLnByb3Aoe3RvcDogMCwgbGVmdDogMH0pLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSBoLnRvZ2dsZVByb3AoMCwgMSksXG4gICAgICAgICAgICAgICAgdG9nZ2xlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHNldFBhcmVudFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0KGguY3VtdWxhdGl2ZU9mZnNldChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb24gPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbFRvcCA9IGVsLm9mZnNldEhlaWdodCArIGVsLm9mZnNldFBhcmVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IChlbC5vZmZzZXRXaWR0aCArIDIgKiBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIDMwKSl7IC8vMzAgaGVyZSBpcyBhIHNhZmUgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDMwOyAvL0FkZGluZyB0aGUgc2FmZSBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1wYXJlbnRPZmZzZXQoKS5sZWZ0ICsgMTUpOyAvL3Bvc2l0aW9uaW5nIGNlbnRlciBvZiB3aW5kb3csIGNvbnNpZGVyaW5nIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA8PSB3aW5kb3cuaW5uZXJXaWR0aCAmJiAocGFyZW50T2Zmc2V0KCkubGVmdCAtIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1lbC5vZmZzZXRXaWR0aCAvIDIpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgKyAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgbGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCAtIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1lbC5vZmZzZXRQYXJlbnQub2Zmc2V0V2lkdGgpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wKC1lbFRvcCk7IC8vU2V0dGluZyB0b3AgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eSxcbiAgICAgICAgICAgICAgICB0b29sdGlwOiB0b29sdGlwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZTogdG9nZ2xlLFxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBzZXRQYXJlbnRQb3NpdGlvbjogc2V0UGFyZW50UG9zaXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdHJsLndpZHRoKCk7XG4gICAgICAgICAgICByZXR1cm4gbShhcmdzLmVsLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGUsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnNldFBhcmVudFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9XG4gICAgICAgICAgICB9LCBjdHJsLnRvb2x0aXAoKSA/IFtcbiAgICAgICAgICAgICAgICBtKGAudG9vbHRpcC5kYXJrW3N0eWxlPVwid2lkdGg6ICR7d2lkdGh9cHg7IHRvcDogJHtjdHJsLnRvcCgpfXB4OyBsZWZ0OiAke2N0cmwubGVmdCgpfXB4O1wiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnNldFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBhcmdzLnRleHQpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0gOiAnJyk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgICAgICAgLy9GSVhNRTogY2FuIGNhbGwgYW5vbiByZXF1ZXN0cyB3aGVuIHRva2VuIGZhaWxzIChyZXF1ZXN0TWF5YmVXaXRoVG9rZW4pXG4gICAgICAgICAgICBtb2RlbHMudXNlckRldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHVzZXJEZXRhaWxzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCBmdW5jdGlvbih1c2VyRGV0YWlsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLmNhcmQtdXNlci51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0zMFtpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04LnctY29sLXRpbnktOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXJbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImFkZHJlc3NcIl0nLCB1c2VyRGV0YWlsLmFkZHJlc3NfY2l0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnYXBvaW91ICcgKyB1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWF1dGhvci1jb250YWN0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAodXNlckRldGFpbC5saW5rcywgZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgbGluaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy55b3V0dWJlTGlnaHRib3ggY29tcG9uZW50XG4gKiBBIHZpc3VhbCBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGxpZ2h0Ym94IHdpdGggYSB5b3V0dWJlIHZpZGVvXG4gKlxuICogRXhhbXBsZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAgLi4uXG4gKiAgICAgIG0uY29tcG9uZW50KGMueW91dHViZUxpZ2h0Ym94LCB7c3JjOiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1GbEZUY0RTS25MTSd9KVxuICogICAgICAuLi5cbiAqICB9XG4gKi9cbndpbmRvdy5jLllvdXR1YmVMaWdodGJveCA9ICgobSwgYywgaCwgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2hvd0xpZ2h0Ym94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzaG93TGlnaHRib3g6IHNob3dMaWdodGJveFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjeW91dHViZS1saWdodGJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCdhI3lvdXR1YmUtcGxheS53LWxpZ2h0Ym94LnctaW5saW5lLWJsb2NrLmZhLmZhLXBsYXktY2lyY2xlLmZvbnRjb2xvci1uZWdhdGl2ZS5mYS01eFtocmVmPVxcJ2phdmFzY3JpcHQ6dm9pZCgwKTtcXCddJywge29uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZX0pLFxuICAgICAgICAgICAgICAgIGN0cmwuc2hvd0xpZ2h0Ym94KCkgP1xuICAgICAgICAgICAgICAgIG0oJyNsaWdodGJveC53LWxpZ2h0Ym94LWJhY2tkcm9wJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXZpZXcnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWZyYW1lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmlndXJlLnctbGlnaHRib3gtZmlndXJlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy53LWxpZ2h0Ym94LWltZy53LWxpZ2h0Ym94LWltYWdlW3NyYz1cXCdkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCwlM0NzdmclMjB4bWxucz0lMjJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyUyMiUyMHdpZHRoPSUyMjk0MCUyMiUyMGhlaWdodD0lMjI1MjglMjIvJTNFXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlmcmFtZSN2aWRlby1saWdodGJveC5lbWJlZGx5LWVtYmVkLnctbGlnaHRib3gtZW1iZWRbYWxsb3dmdWxsc2NyZWVuPVxcJ1xcJ11bZnJhbWVib3JkZXI9XFwnMFxcJ11baGVpZ2h0PVxcJzUyOFxcJ11bc2Nyb2xsaW5nPVxcJ25vXFwnXVtzcmM9XFwnaHR0cHM6Ly9jZG4uZW1iZWRseS5jb20vd2lkZ2V0cy9tZWRpYS5odG1sP3NyYz1odHRwcyUzQSUyRiUyRnd3dy55b3V0dWJlLmNvbSUyRmVtYmVkJTJGRmxGVGNEU0tuTE0lM0ZhdXRvcGxheSUzRDElMjZmZWF0dXJlJTNEb2VtYmVkJnVybD0ke2VuY29kZVVSSShhcmdzLnNyYyl9JmltYWdlPWh0dHBzJTNBJTJGJTJGaS55dGltZy5jb20lMkZ2aSUyRkZsRlRjRFNLbkxNJTJGaHFkZWZhdWx0LmpwZyZrZXk9YzRlNTRkZWNjZjRkNGVjOTk3YTY0OTAyZTlhMzAzMDAmYXV0b3BsYXk9MSZ0eXBlPXRleHQlMkZodG1sJnNjaGVtYT15b3V0dWJlXFwnXVt3aWR0aD1cXCc5NDBcXCddYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtc3Bpbm5lci53LWxpZ2h0Ym94LWhpZGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtbGVmdC53LWxpZ2h0Ym94LWluYWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LXJpZ2h0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjeW91dHViZS1jbG9zZS53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1jbG9zZScsIHtvbmNsaWNrOiBjdHJsLnNob3dMaWdodGJveC50b2dnbGV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zdHJpcCcpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4uQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi5jb250cmlidXRpb25MaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIHByb2pldG8sIGVtYWlsLCBJZHMgZG8gdXN1w6FyaW8gZSBkbyBhcG9pby4uLidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BhaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BhaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1c2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1c2VkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmdfcmVmdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVuZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1bmRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2NoYXJnZWJhY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdkZWxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9nYXRld2F5XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYWdhcm1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYWdhcm1lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnTW9JUCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnTW9JUCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BheVBhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGF5UGFsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnQ3JlZGl0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnQ3LDqWRpdG9zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy92YWx1ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmFsb3JlcyBlbnRyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0udmFsdWUuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BlcsOtb2RvIGRvIGFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBsaXN0Vk06IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBjLkFkbWluQ29udHJpYnV0aW9uSXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pbkNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Vc2VycyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi51c2VyTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4udXNlckZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlciA9IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL25hbWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3Igbm9tZSwgZS1tYWlsLCBJZHMgZG8gdXN1w6FyaW8uLi4nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogJ3N0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmRlYWN0aXZhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnYXRpdm8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICFudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2Rlc2F0aXZhZG8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSAnVXN1w6FyaW9zJztcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Vc2VySXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMucm9vdC5GbGV4ID0gKGZ1bmN0aW9uKG0sIGMsIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgc2FtcGxlMyA9IF8ucGFydGlhbChfLnNhbXBsZSwgXywgMyksXG4gICAgICAgICAgICAgICAgYnVpbGRlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnLy9jYXRhcnNlLnVzNS5saXN0LW1hbmFnZS5jb20vc3Vic2NyaWJlL3Bvc3Q/dT1lYmZjZDBkMTZkYmIwMDAxYTBiZWEzNjM5JmFtcDtpZD04YTRjMWEzM2NlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmxleFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIGZsZXhWTS5tb2RlKCdmbGV4Jykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcihtb2RlbHMucHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmbGV4Vk0ucGFyYW1ldGVycygpKSwgbS5wb3N0Z3Jlc3QucmVxdWVzdCk7XG5cbiAgICAgICAgICAgIHN0YXRzTG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcblxuICAgICAgICAgICAgcHJvamVjdHNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHByb2plY3RzLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzOiBhZGREaXNxdXMsXG4gICAgICAgICAgICAgICAgYnVpbGRlcjogYnVpbGRlcixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlcjogc3RhdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICAgICAgICAgIHByb2plY3RzTG9hZGVyOiBwcm9qZWN0c0xvYWRlcixcbiAgICAgICAgICAgICAgICBwcm9qZWN0czoge2NvbGxlY3Rpb246IHByb2plY3RzfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmxvZ28tZmxleC1ob21lW3NyYz1cXCcvYXNzZXRzL2xvZ28tZmxleC5wbmdcXCddW3dpZHRoPVxcJzM1OVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNjAudy1jb2wtcHVzaC0yLnctY29sLTgnLCAnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISAgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlcicsICdQcmEgcXVlbSBzZXLDoT8nKSwgbSgnLmZvbnRzaXplLWJhc2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MCcsICdJbmljaWFyZW1vcyBhIGZhc2UgZGUgdGVzdGVzIGNvbSBjYXRlZ29yaWFzIGRlIHByb2pldG9zIGVzcGVjw61maWNhcycpLCBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5M2EwMWI2NmUyNTBhY2E2N2NiX2ljb24temVsby1jb20ucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnQ2F1c2FzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhbGlzdGFzLCBzYcO6ZGUsIGFqdWRhcyBodW1hbml0w6FyaWFzLCBwcm90ZcOnw6NvIGFvcyBhbmltYWlzLCBlbXByZWVuZGVkb3Jpc21vIHNvY2lvYW1iaWVudGFsLCBhdGl2aXNtbyBvdSBxdWFscXVlciBjb2lzYSBxdWUgdW5hIGFzIHBlc3NvYXMgcGFyYSBmYXplciBvIGJlbS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5MjlhMGRhZWEyMzBhNWYxMmNkX2ljb24temVsby1wZXNzb2FsLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ1ZhcXVpbmhhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJ3AuZm9udHNpemUtYmFzZScsICdDYW1wYW5oYXMgc2ltcGxlcyBxdWUgcHJlY2lzYW0gZGUgZmxleGliaWxpZGFkZSBwYXJhIGFycmVjYWRhciBkaW5oZWlybyBjb20gcGVzc29hcyBwcsOzeGltYXMuIEVzdGFyZW1vcyBhYmVydG9zIGEgdW1hIHZhcmllZGFkZSBkZSBjYW1wYW5oYXMgcGVzc29haXMgcXVlIHBvZGVtIGlyIGRlc2RlIGNvYnJpciBjdXN0b3MgZGUgZXN0dWRvcyBhIGFqdWRhciBxdWVtIHByZWNpc2EgZGUgdHJhdGFtZW50byBtw6lkaWNvLiBEZSBqdW50YXIgYSBncmFuYSBwYXJhIGZhemVyIGFxdWVsYSBmZXN0YSBhIGNvbXByYXIgcHJlc2VudGVzIHBhcmEgYWxndcOpbSBjb20gYSBhanVkYSBkYSBnYWxlcmEuICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWdyZWVubGltZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS1tYXJnaW5ib3R0b20tNjAudS10ZXh0LWNlbnRlcicsICdDb21vIGZ1bmNpb25hcsOhPycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWM1NzhiMjg0NDkzZTJhNDI4YV96ZWxvLW1vbmV5LnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdGaXF1ZSBjb20gcXVhbnRvIGFycmVjYWRhcicpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdPIGZsZXggw6kgcGFyYSBpbXB1bHNpb25hciBjYW1wYW5oYXMgb25kZSB0b2RvIGRpbmhlaXJvIMOpIGJlbSB2aW5kbyEgVm9jw6ogZmljYSBjb20gdHVkbyBxdWUgY29uc2VndWlyIGFycmVjYWRhci4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZDM3YzAxM2Q0YTNlZTY4N2QyX2ljb24tcmV3YXJkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdOw6NvIHByZWNpc2EgZGUgcmVjb21wZW5zYXMnKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTm8gZmxleCBvZmVyZWNlciByZWNvbXBlbnNhcyDDqSBvcGNpb25hbC4gVm9jw6ogZXNjb2xoZSBzZSBvZmVyZWPDqi1sYXMgZmF6IHNlbnRpZG8gcGFyYSBvIHNldSBwcm9qZXRvIGUgY2FtcGFuaGEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlmYjAxYjY2ZTI1MGFjYTY3ZTNfaWNvbi1jdXJhZC5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVm9jw6ogbWVzbW8gcHVibGljYSBzZXUgcHJvamV0bycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdUb2RvcyBvcyBwcm9qZXRvcyBpbnNjcml0b3Mgbm8gZmxleCBlbnRyYW0gbm8gYXIuIEFnaWxpZGFkZSBlIGZhY2lsaWRhZGUgcGFyYSB2b2PDqiBjYXB0YXIgcmVjdXJzb3MgYXRyYXbDqXMgZGEgaW50ZXJuZXQuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWU3N2MwMTNkNGEzZWU2ODdkNF9pY29uLXRpbWUucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0VuY2VycmUgYSBjYW1wYW5oYSBxdWFuZG8gcXVpc2VyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ07Do28gaMOhIGxpbWl0ZSBkZSB0ZW1wbyBkZSBjYXB0YcOnw6NvLiBWb2PDqiBlc2NvbGhlICBxdWFuZG8gZW5jZXJyYXIgc3VhIGNhbXBhbmhhIGUgcmVjZWJlciBvcyB2YWxvcmVzIGFycmVjYWRhZG9zLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2ludG9wLTQwLnUtbWFyZ2luLWJvdHRvbS00MC51LXRleHQtY2VudGVyJywgJ0Nvbmhlw6dhIGFsZ3VucyBkb3MgcHJpbWVpcm9zIHByb2pldG9zIGZsZXgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnByb2plY3RzTG9hZGVyKCkgPyBoLmxvYWRlcigpIDogbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7Y29sbGVjdGlvbjogY3RybC5wcm9qZWN0cywgcmVmOiAnY3Ryc2VfZmxleCcsIHdyYXBwZXI6ICcudy1yb3cudS1tYXJnaW50b3AtNDAnfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MC51LW1hcmdpbnRvcC00MCcsICdEw7p2aWRhcycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWlzIHPDo28gYXMgdGF4YXMgZGEgbW9kYWxpZGFkZSBmbGV4w612ZWw/ICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQ29tbyBubyBDYXRhcnNlLCBlbnZpYXIgdW0gcHJvamV0byBuw6NvIGN1c3RhIG5hZGEhIEVzdGFtb3MgZXN0dWRhbmRvIG9ww6fDtWVzIHBhcmEgZW50ZW5kZXIgcXVhbCBzZXLDoSBhIHRheGEgY29icmFkYSBubyBzZXJ2acOnbyBDYXRhcnNlIGZsZXguJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnRGUgb25kZSB2ZW0gbyBkaW5oZWlybyBkbyBtZXUgcHJvamV0bz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0ZhbcOtbGlhLCBhbWlnb3MsIGbDo3MgZSBtZW1icm9zIGRlIGNvbXVuaWRhZGVzIHF1ZSB2b2PDqiBmYXogcGFydGUgc8OjbyBzZXVzIG1haW9yZXMgY29sYWJvcmFkb3Jlcy4gU8OjbyBlbGVzIHF1ZSBpcsOjbyBkaXZ1bGdhciBzdWEgY2FtcGFuaGEgcGFyYSBhcyBwZXNzb2FzIHF1ZSBlbGVzIGNvbmhlY2VtLCBlIGFzc2ltIG8gY8OtcmN1bG8gZGUgYXBvaWFkb3JlcyB2YWkgYXVtZW50YW5kbyBlIGEgc3VhIGNhbXBhbmhhIGdhbmhhIGZvcsOnYS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFsIGEgZGlmZXJlbsOnYSBlbnRyZSBvIGZsZXjDrXZlbCBlIG8gXCJ0dWRvIG91IG5hZGFcIj8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0F0dWFsbWVudGUgbyBDYXRhcnNlIHV0aWxpemEgYXBlbmFzIG8gbW9kZWxvIFwidHVkbyBvdSBuYWRhXCIsIG9uZGUgdm9jw6ogc8OzIGZpY2EgY29tIG8gZGluaGVpcm8gc2UgYmF0ZXIgYSBtZXRhIGRlIGFycmVjYWRhw6fDo28gZGVudHJvIGRvIHByYXpvIGRhIGNhbXBhbmhhLiBPIG1vZGVsbyBmbGV4w612ZWwgw6kgZGlmZXJlbnRlIHBvaXMgcGVybWl0ZSBxdWUgbyByZWFsaXphZG9yIGZpcXVlIGNvbSBvIHF1ZSBhcnJlY2FkYXIsIGluZGVwZW5kZW50ZSBkZSBhdGluZ2lyIG91IG7Do28gYSBtZXRhIGRvIHByb2pldG8gbm8gcHJhem8gZGEgY2FtcGFuaGEuIE7Do28gaGF2ZXLDoSBsaW1pdGUgZGUgdGVtcG8gcGFyYSBhcyBjYW1wYW5oYXMuIE5vc3NvIHNpc3RlbWEgZmxleMOtdmVsIHNlcsOhIGFsZ28gbm92byBlbSByZWxhw6fDo28gYW9zIG1vZGVsb3MgcXVlIGV4aXN0ZW0gYXR1YWxtZW50ZSBubyBtZXJjYWRvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUG9zc28gaW5zY3JldmVyIHByb2pldG9zIHBhcmEgYSBtb2RhbGlkYWRlIGZsZXjDrXZlbCBqw6E/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdQb3IgZW5xdWFudG8gbsOjby4gQSBtb2RhbGlkYWRlIGZsZXggc2Vyw6EgdGVzdGFkYSBjb20gYWxndW5zIHByb2pldG9zIGVzcGVjw61maWNvcy4gSW5zY3JldmEgc2V1IGVtYWlsIGUgcGFydGljaXBlIGRhIGNvbnZlcnNhIG5lc3NhIHDDoWdpbmEgcGFyYSByZWNlYmVyIGluZm9ybWHDp8O1ZXMsIG1hdGVyaWFpcywgYWNvbXBhbmhhciBwcm9qZXRvcyBlbSB0ZXN0ZSBlIHNhYmVyIGNvbSBhbnRlY2Vkw6puY2lhIGEgZGF0YSBkZSBsYW7Dp2FtZW50byBkbyBmbGV4LidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1BvciBxdcOqIHZvY8OqcyBxdWVyZW0gZmF6ZXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBY3JlZGl0YW1vcyBxdWUgbyBhbWJpZW50ZSBkbyBjcm93ZGZ1bmRpbmcgYnJhc2lsZWlybyBhaW5kYSB0ZW0gZXNwYcOnbyBwYXJhIG11aXRhcyBhw6fDtWVzLCB0ZXN0ZXMgZSBleHBlcmltZW50YcOnw7VlcyBwYXJhIGVudGVuZGVyIGRlIGZhdG8gbyBxdWUgYXMgcGVzc29hcyBwcmVjaXNhbS4gU29uaGFtb3MgY29tIHRvcm5hciBvIGZpbmFuY2lhbWVudG8gY29sZXRpdm8gdW0gaMOhYml0byBubyBCcmFzaWwuIE8gQ2F0YXJzZSBmbGV4IMOpIG1haXMgdW0gcGFzc28gbmVzc2EgZGlyZcOnw6NvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YW5kbyB2b2PDqnMgaXLDo28gbGFuw6dhciBvIENhdGFyc2UgZmxleD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0FpbmRhIG7Do28gc2FiZW1vcyBxdWFuZG8gYWJyaXJlbW9zIG8gZmxleCBwYXJhIG8gcMO6YmxpY28uIElyZW1vcyBwcmltZWlyYW1lbnRlIHBhc3NhciBwb3IgdW0gcGVyw61vZG8gZGUgdGVzdGVzIGUgZGVwb2lzIGVzdGFiZWxlY2VyIHVtYSBkYXRhIGRlIGxhbsOnYW1lbnRvLiBTZSB2b2PDqiBkZXNlamEgYWNvbXBhbmhhciBlIHJlY2ViZXIgbm90w61jaWFzIHNvYnJlIGVzc2EgY2FtaW5oYWRhLCBpbnNjcmV2YSBzZXUgZW1haWwgbmVzc2EgcMOhZ2luYS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLnUtdGV4dC1jZW50ZXIuYmctcHVycGxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsICdGaXF1ZSBwb3IgZGVudHJvIScpLCBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS02MCcsICdSZWNlYmEgbm90w61jaWFzIGUgYWNvbXBhbmhlIGEgZXZvbHXDp8OjbyBkbyBDYXRhcnNlIGZsZXgnKSwgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctY2F0YXJzZS16ZWxvLnNlY3Rpb24tbGFyZ2Vbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWVkaXRhYmxlLnUtbWFyZ2luYm90dG9tLTQwLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LmZvbnRjb2xvci1uZWdhdGl2ZScsICdPIGZsZXggw6kgdW0gZXhwZXJpbWVudG8gZSBpbmljaWF0aXZhIGRvIENhdGFyc2UsIG1haW9yIHBsYXRhZm9ybWEgZGUgY3Jvd2RmdW5kaW5nIGRvIEJyYXNpbC4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIChjdHJsLnN0YXRzTG9hZGVyKCkpID8gaC5sb2FkZXIoKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQZXNzb2FzIGphIGFwb2lhcmFtIHBlbG8gbWVub3MgMDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfcHJvamVjdHNfc3VjY2VzcywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Byb2pldG9zIGphIGZvcmFtIGZpbmFuY2lhZG9zIG5vwqBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgc3RhdHMudG90YWxfY29udHJpYnV0ZWQudG9TdHJpbmcoKS5zbGljZSgwLCAyKSArICcgbWlsaMO1ZXMnKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdGb3JhbSBpbnZlc3RpZG9zIGVtIGlkZWlhcyBwdWJsaWNhZGFzIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWJsdWUtb25lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbWVuZGUgbyBDYXRhcnNlIGZsZXggcGFyYSBhbWlnb3MhICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudy1zdWItY29sLW1pZGRsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24tc2hhcmUtbW9iaWxlW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzUzYTNmNjZlMDVlYjYxNDQxNzFkOGVkYl9mYWNlYm9vay14eGwucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi1mYltocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ0Nvbmhlw6dhIG8gbm92byBDYXRhcnNlIEZsZXghJykgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdDb21wYXJ0aWxoYXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NTEwNWViNjE0NDE3MWQ4ZWRhX3R3aXR0ZXItMjU2LnBuZ1xcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tdHdlZXRbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ1ZhbW9zIGNvbnN0cnVpciB1bWEgbm92YSBtb2RhbGlkYWRlIGRlIGNyb3dkZnVuZGluZyBwYXJhIG8gQ2F0YXJzZSEgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJykgKyAnaHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj10d2l0dGVyXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdUdWl0YXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLmJnLWdyZWVubGltZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGFydGljaXBlLWRvLWRlYmF0ZS51LXRleHQtY2VudGVyJywge2NvbmZpZzogaC50b0FuY2hvcigpfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXN0LmZvbnRjb2xvci1uZWdhdGl2ZScsJ0NvbnN0cnVhIG8gZmxleCBjb25vc2NvJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwLmZvbnRjb2xvci1uZWdhdGl2ZScsICdJbmljaWUgdW1hIGNvbnZlcnNhLCBwZXJndW50ZSwgY29tZW50ZSwgY3JpdGlxdWUgZSBmYcOnYSBzdWdlc3TDtWVzIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rpc3F1c190aHJlYWQuY2FyZC51LXJhZGl1c1tzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuYWRkRGlzcXVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5yb290Lkluc2lnaHRzID0gKChtLCBjLCBoLCBtb2RlbHMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5pbnNpZ2h0cycpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgaW5zaWdodHNWTSA9IGMuSW5zaWdodHNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW47XG5cbiAgICAgICAgICAgIGZpbHRlcnNWTS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsLmxvYWQoKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJEYXkubG9hZCgpLnRoZW4oY29udHJpYnV0aW9uc1BlckRheSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IFtbJ0VzdGFkbycsICdBcG9pb3MnLCAnUiQgYXBvaWFkb3MgKCUgZG8gdG90YWwpJ11dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJMb2NhdGlvblRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbiA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsWy8vQWRkaW5nIHJvdyB3aXRoIGN1c3RvbSBjb21wYXJhdG9yID0+IHJlYWQgcHJvamVjdC1kYXRhLXRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUucHVzaChjb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5sb2FkKCkudGhlbihidWlsZFBlckxvY2F0aW9uVGFibGUpO1xuXG4gICAgICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlID0gW1tcbiAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl90YWJsZS5oZWFkZXIub3JpZ2luJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5jb250cmlidXRpb25zJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5hbW91bnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgIF1dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gLyhjdHJzZV9bYS16XSopLyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZS5leGVjKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3Qpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPSB0ZXN0WzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPyBJMThuLnQoJ3JlZmVycmFsLicgKyBjb250cmlidXRpb24ucmVmZXJyYWxfbGluaywgSTE4blNjb3BlKHtkZWZhdWx0VmFsdWU6IGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rfSkpIDogSTE4bi50KCdyZWZlcnJhbC5vdGhlcnMnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWwpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnICgnICsgY29udHJpYnV0aW9uLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGxDb250cmlidXRpb25zUGVyUmVmID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZi5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmLmxvYWQoKS50aGVuKGJ1aWxkUGVyUmVmVGFibGUpO1xuXG4gICAgICAgICAgICBjb25zdCBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQgPSAocHJvamVjdE1vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2Fvbic6IGMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnZmxleCc6IGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZXNbcHJvamVjdE1vZGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmOiBsQ29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyRGF5OiBsQ29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzVk06IGZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZTogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlOiBjb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50OiBleHBsYW5hdGlvbk1vZGVDb21wb25lbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gXy5maXJzdChjdHJsLnByb2plY3REZXRhaWxzKCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbmZvcm1hIGRlIG9uZGUgdmllcmFtIG9zIGFwb2lvcyBkZSBzZXUgcHJvamV0by4gU2FpYmEgY29tbyB1c2FyIGVzc2EgdGFiZWxhIGUgcGxhbmVqYXIgbWVsaG9yIHN1YXMgYcOnw7VlcyBkZSBjb211bmljYcOnw6NvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYVtocmVmPVwiJHtJMThuLnQoJ3JlZl90YWJsZS5oZWxwX3VybCcsIEkxOG5TY29wZSgpKX1cIl1bdGFyZ2V0PSdfYmxhbmsnXWAsICdhcXVpLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCAhY3RybC5sKCkgPyBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5kYXNoYm9hcmQtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdjYW1wYWlnbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGN0cmwuZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50KHByb2plY3QubW9kZSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckRheSgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2Ftb3VudF9wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckRheSgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2NvbnRyaWJ1dGlvbnNfcGVyX2RheV9sYWJlbCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhS2V5OiAndG90YWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm5ld0ZlYXR1cmVCYWRnZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LnRvb2x0aXAtd3JhcHBlci5mYS5mYS1xdWVzdGlvbi1jaXJjbGUuZm9udGNvbG9yLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJSZWYoKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogY3RybC5jb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItcmVmJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBJMThuLnQoJ2xvY2F0aW9uX29yaWdpbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0U29ydEluZGV4OiAtMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6ICcnXG4gICAgICAgICAgICBdIDogaC5sb2FkZXIoKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5yb290LkxpdmVTdGF0aXN0aWNzID0gKChtLCBtb2RlbHMsIGgsIF8sIEpTT04pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFnZVN0YXRpc3RpY3MgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgLy8gYXJncy5zb2NrZXQgaXMgYSBzb2NrZXQgcHJvdmlkZWQgYnkgc29ja2V0LmlvXG4gICAgICAgICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgICAgICAgIGlmIChhcmdzLnNvY2tldCAmJiBfLmlzRnVuY3Rpb24oYXJncy5zb2NrZXQub24pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5zb2NrZXQub24oJ25ld19wYWlkX2NvbnRyaWJ1dGlvbnMnLCAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25EYXRhOiBub3RpZmljYXRpb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBjdHJsLm5vdGlmaWNhdGlvbkRhdGEoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uYmctc3RhdHMuc2VjdGlvbi5taW4taGVpZ2h0LTEwMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdpbWcudS1tYXJnaW5ib3R0b20tNjBbc3JjPVwiaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NWFkYTVkZDExYjM2YTUyNjE2ZDk3ZGZfc3ltYm9sLWNhdGFyc2UucG5nXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcyBwdWJsaWNhZG9zIHBvciBhcXVpJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBzdGF0LnRvdGFsX2NvbnRyaWJ1dG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ1Blc3NvYXMgasOhIGFwb2lhcmFtIHBlbG8gbWVub3MgMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9KSksICghXy5pc0VtcHR5KGRhdGEpID8gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS02MC5tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS51c2VyX25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnYWNhYm91IGRlIGFwb2lhciBvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz1cIicgKyBkYXRhLnByb2plY3RfaW1hZ2UgKyAnXCJdW3dpZHRoPVwiNzVcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLmZvbnRjb2xvci1uZWdhdGl2ZVtocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2VcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1naXRodWInLCAnLicpLCAnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5yb290LlByb2plY3RzRXhwbG9yZSBjb21wb25lbnRcbiAqIEEgcm9vdCBjb21wb25lbnQgdG8gc2hvdyBwcm9qZWN0cyBhY2NvcmRpbmcgdG8gdXNlciBkZWZpbmVkIGZpbHRlcnNcbiAqXG4gKiBFeGFtcGxlOlxuICogVG8gbW91bnQgdGhpcyBjb21wb25lbnQganVzdCBjcmVhdGUgYSBET00gZWxlbWVudCBsaWtlOlxuICogPGRpdiBkYXRhLW1pdGhyaWw9XCJQcm9qZWN0c0V4cGxvcmVcIj5cbiAqL1xud2luZG93LmMucm9vdC5Qcm9qZWN0c0V4cGxvcmUgPSAoKG0sIGMsIGgsIF8sIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICAgIGZvbGxvdyA9IGMubW9kZWxzLmNhdGVnb3J5Rm9sbG93ZXIsXG4gICAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwID0gYy5yb290LnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeV9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnN0YXRlX29yZGVyKCdwdWJsaXNoZWQnKS5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg2MCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RpdGxlOiBjYXQubmFtZSwgZmlsdGVyOiBieUNhdGVnb3J5LmNhdGVnb3J5X2lkKGNhdC5pZCl9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXJGcm9tUm91dGUoKSB8fCBmaWx0ZXJzTWFwLnJlY29tbWVuZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYy5tb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHsgLy8gV2UgYnVpbGQgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgaW50ZXJmYWNlIGFzIHBhZ2luYXRpb25WTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQYWdlOiAoKSA9PiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHBhZ2UuY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKGMubW9kZWxzLnByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlcy5maXJzdFBhZ2UoZmlsdGVyLmZpbHRlci5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2FzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhzZWFyY2gpICYmIHNlYXJjaC5sZW5ndGggPiAwICYmIHJvdXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKCdCdXNjYSAnICsgc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMobG9hZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNleHBsb3JlLW9wZW4ubGluay1oaWRkZW4td2hpdGUuZm9udHdlaWdodC1saWdodC5mb250c2l6ZS1sYXJnZXJbaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgpO1wiXScse29uY2xpY2s6ICgpID0+IGN0cmwudG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKX0sIFsnRXhwbG9yZSBwcm9qZXRvcyBpbmNyw612ZWlzICcsbShgc3BhbiNleHBsb3JlLWJ0bi5mYS5mYS1hbmdsZS1kb3duJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsICcnKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYCNjYXRlZ29yaWVzLmNhdGVnb3J5LXNsaWRlciR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge2NhdGVnb3J5OiBjYXRlZ29yeX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmZpbHRlcnNNYXAsIChmaWx0ZXIsIGhyZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge3RpdGxlOiBmaWx0ZXIudGl0bGUsIGhyZWY6IGhyZWZ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC03LnctY29sLXRpbnktNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGN0cmwudGl0bGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNPYmplY3QoY3RybC5jYXRlZ29yeSgpKSA/IG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbGxvd2luZy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtcmlnaHQnLCBgJHtjdHJsLmNhdGVnb3J5KCkuZm9sbG93ZXJzfSBzZWd1aWRvcmVzYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtMTIudy1jb2wtdGlueS0xMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmNhdGVnb3J5KCkuZm9sbG93aW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnkudW5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC51bkZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnRGVpeGFyIGRlIHNlZ3VpcicpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC5mb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ1NlZ3VpcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiAnY3Ryc2VfZXhwbG9yZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0cygpLmlzTG9hZGluZygpID8gaC5sb2FkZXIoKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5W2hyZWY9XFwnI2xvYWRNb3JlXFwnXScsIHtvbmNsaWNrOiAoKSA9PiB7IGN0cmwucHJvamVjdHMoKS5uZXh0UGFnZSgpOyByZXR1cm4gZmFsc2U7IH19LCAnQ2FycmVnYXIgbWFpcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKV07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmhvbWUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMucm9vdC5wcm9qZWN0RmlsdGVycygpO1xuXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9ucyA9IF8ubWFwKFsnbmVhcl9tZScsICdyZWNvbW1lbmRlZCcsICdleHBpcmluZycsICdyZWNlbnQnXSwgKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gZmlsdGVyc1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICBjTG9hZGVyID0gbG9hZGVyV2l0aFRva2VuKHByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZi5maWx0ZXIucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgICAgICBjTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShjb2xsZWN0aW9uLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZi50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjTG9hZGVyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLTIwMTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby51LW1hcmdpbmJvdHRvbS02MC5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRjb2xvci1uZWdhdGl2ZScsIEkxOG4udCgndGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiaHR0cDovLzIwMTUuY2F0YXJzZS5tZS9cIl0uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5idG4taW5saW5lJywgSTE4bi50KCdjdGEnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5tb21lbnQsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzU2hvdyA9ICgobSwgYywgXywgbW9kZWxzLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGlkVk0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnByb2plY3RfaWQpO1xuICAgICAgICAgICAgaWRWTS5pZChhcmdzLnByb2plY3RfdXNlcl9pZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxQcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnModm0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgbFVzZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyhpZFZNLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgbFByb2plY3QubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgbFJld2FyZC5sb2FkKCkudGhlbihyZXdhcmREZXRhaWxzKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlscyxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0OiBsUHJvamVjdCxcbiAgICAgICAgICAgICAgICBsVXNlcjogbFVzZXIsXG4gICAgICAgICAgICAgICAgbFJld2FyZDogbFJld2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICghKGN0cmwubFByb2plY3QoKSB8fCBjdHJsLmxVc2VyKCkgfHwgY3RybC5sUmV3YXJkKCkpKSA/IF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLm1peHBhbmVsVHJhY2soKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGN0cmwudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFRhYnMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5yb290LnN0YXJ0Vk0gPSAoKF8pID0+IHtcbiAgICByZXR1cm4gKEkxOG4pID0+IHtcbiAgICAgICAgY29uc3QgaTE4blN0YXJ0ID0gSTE4bi50cmFuc2xhdGlvbnNbSTE4bi5jdXJyZW50TG9jYWxlKCldLnBhZ2VzLnN0YXJ0LFxuICAgICAgICAgICAgdGVzdGltb25pYWxzID0gaTE4blN0YXJ0LnRlc3RpbW9uaWFscyxcbiAgICAgICAgICAgIGNhdGVnb3J5UHJvamVjdHMgPSBpMThuU3RhcnQuY2F0ZWdvcnlQcm9qZWN0cyxcbiAgICAgICAgICAgIHBhbmVzID0gaTE4blN0YXJ0LnBhbmVzLFxuICAgICAgICAgICAgcWEgPSBpMThuU3RhcnQucWE7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlc3RpbW9uaWFsczogXy5tYXAodGVzdGltb25pYWxzLCAodGVzdGltb25pYWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aHVtYlVybDogdGVzdGltb25pYWwudGh1bWIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRlc3RpbW9uaWFsLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRlc3RpbW9uaWFsLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsczogdGVzdGltb25pYWwudG90YWxzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcGFuZXM6IF8ubWFwKHBhbmVzLCAocGFuZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwYW5lLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IHBhbmUuc3JjXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcXVlc3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgY29sXzE6IF8ubWFwKHFhLmNvbF8xLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY29sXzI6IF8ubWFwKHFhLmNvbF8yLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYXRlZ29yeVByb2plY3RzOiBfLm1hcChjYXRlZ29yeVByb2plY3RzLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRlZ29yeS5jYXRlZ29yeV9pZCxcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlUHJvamVjdHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LnNhbXBsZV9wcm9qZWN0X2lkcy5wcmltYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkuc2FtcGxlX3Byb2plY3RfaWRzLnNlY29uZGFyeVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnJvb3QuU3RhcnQgPSAoKG0sIGMsIGgsIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLnN0YXJ0Jyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZHggPSBtLnByb3AoLTEpLFxuICAgICAgICAgICAgICAgIHN0YXJ0dm0gPSBjLnJvb3Quc3RhcnRWTShJMThuKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXMgPSBzdGFydHZtLnBhbmVzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHVzZXJ2bSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IGxvYWRlcihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSksXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdhc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmUoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxDYXRlZ29yeSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMuY2F0ZWdvcnlUb3RhbHMuZ2V0Um93T3B0aW9ucyhjYXRlZ29yeXZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFByb2plY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhwcm9qZWN0dm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsVXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKHVzZXJ2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0uY2F0ZWdvcnlfaWQoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbENhdGVnb3J5KCkubG9hZCgpLnRoZW4obG9hZENhdGVnb3J5UHJvamVjdHMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0VXNlciA9ICh1c2VyLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmV4dGVuZCh7fSwgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJUaHVtYjogIF8uZmlyc3QodXNlcikucHJvZmlsZV9pbWdfdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0UHJvamVjdCA9IChwcm9qZWN0LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmZpcnN0KHByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICB1c2Vydm0uaWQoXy5maXJzdChwcm9qZWN0KS51c2VyLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgbFVzZXIoKS5sb2FkKCkudGhlbigodXNlcikgPT4gc2V0VXNlcih1c2VyLCBpZHgpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yeVByb2plY3RzID0gKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2F0ZWdvcnlQcm9qZWN0cyA9IF8uZmluZFdoZXJlKHN0YXJ0dm0uY2F0ZWdvcnlQcm9qZWN0cywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogXy5maXJzdChjYXRlZ29yeSkuY2F0ZWdvcnlfaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMoW10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoY2F0ZWdvcnlQcm9qZWN0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGNhdGVnb3J5UHJvamVjdHMuc2FtcGxlUHJvamVjdHMsIChwcm9qZWN0X2lkLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQocHJvamVjdF9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxQcm9qZWN0KCkubG9hZCgpLnRoZW4oKHByb2plY3QpID0+IHNldFByb2plY3QocHJvamVjdCwgaWR4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG4gICAgICAgICAgICBsb2FkQ2F0ZWdvcmllcygpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXM6IHBhbmVJbWFnZXMsXG4gICAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IHNlbGVjdENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IHNlbGVjdGVkQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeDogc2VsZWN0ZWRDYXRlZ29yeUlkeCxcbiAgICAgICAgICAgICAgICBzZWxlY3RQYW5lOiBzZWxlY3RQYW5lLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFuZTogc2VsZWN0ZWRQYW5lLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHM6IGZlYXR1cmVkUHJvamVjdHMsXG4gICAgICAgICAgICAgICAgdGVzdGltb25pYWxzOiBzdGFydHZtLnRlc3RpbW9uaWFscyxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnM6IHN0YXJ0dm0ucXVlc3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgY29uc3QgdGVzdGltb25pYWxzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnRlc3RpbW9uaWFscywgKHRlc3RpbW9uaWFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5jYXJkLWJpZy5jYXJkLXRlcmNpYXJ5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnRodW1iLXRlc3RpbW9uaWFsLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMjBbc3JjPVwiJHt0ZXN0aW1vbmlhbC50aHVtYlVybH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgYFwiJHt0ZXN0aW1vbmlhbC5jb250ZW50fVwiYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIHRlc3RpbW9uaWFsLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgdGVzdGltb25pYWwudG90YWxzKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWZ1bGwuaGVyby1zdGFydCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tNDAnLCBJMThuLnQoJ3Nsb2dhbicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbaHJlZj1cXCcvcHJvamVjdHMvbmV3XFwnXScsICBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLmlzRW1wdHkoc3RhdHMpID8gJycgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnBlb3BsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5tb25leScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnN1Y2Nlc3MnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ3BhZ2UtdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBJMThuLnQoJ3BhZ2Utc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4Lmhvdy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuaG93LWNvbC0wMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjInLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5ob3ctY29sLTAzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjYnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbnRvcC0zMCcsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjgnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci40JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci42JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci44JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2ZlYXR1cmVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsIEkxOG4udCgnZmVhdHVyZXMuc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV80JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudy1jb2wudy1jb2wtNCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYS53LXRhYi1saW5rLnctaW5saW5lLWJsb2NrLnRhYi1saXN0LWl0ZW0keyhpZHggPT09IGN0cmwuc2VsZWN0ZWRQYW5lKCkpID8gJy5zZWxlY3RlZCcgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNlbGVjdFBhbmUoaWR4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBwYW5lLmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLWNvbnRlbnQudy1jb2wudy1jb2wtOCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctdGFiLXBhbmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWdbc3JjPVwiJHtwYW5lLnNyY31cIl0ucGFuZS1pbWFnZSR7KGlkeCA9PT0gY3RybC5zZWxlY3RlZFBhbmUoKSkgPyAnLnNlbGVjdGVkJyA6ICcnfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctYmx1ZS1vbmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3ZpZGVvLnRpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCd2aWRlby5zdWJ0aXRsZScsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLllvdXR1YmVMaWdodGJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogSTE4bi50KCd2aWRlby5zcmMnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2VjdGlvbi1jYXRlZ29yaWVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1wdXNoLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNDAuZm9udGNvbG9yLW5lZ2F0aXZlJywgSTE4bi50KCdjYXRlZ29yaWVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwuY2F0ZWdvcmllcygpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYGEudy10YWItbGluay53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuc21hbGwuYnRuLWlubGluZSR7KGN0cmwuc2VsZWN0ZWRDYXRlZ29yeUlkeCgpID09PSBjYXRlZ29yeS5pZCkgPyAnLnctLWN1cnJlbnQnIDogJyd9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeS5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY2F0ZWdvcnkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1jb250ZW50LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItcGFuZS53LS10YWItYWN0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgKCEoXy5pc0VtcHR5KGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpKSAmJiBjdHJsLnNlbGVjdGVkQ2F0ZWdvcnlJZHgoKSAhPT0gLTEpKSA/IF8ubWFwKGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby51LW1hcmdpbmJvdHRvbS0yMCcsIGNhdGVnb3J5Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4taW5saW5lLmJ0bi1kYXJrW2hyZWY9XCIvcHJvamVjdHMvbmV3XCJdJywgJ0NvbWVjZSBvIHNldSBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250Y29sb3ItbmVnYXRpdmUnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihjYXRlZ29yeS50b3RhbF9zdWNjZXNzZnVsX3ZhbHVlLCAyLCAzKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250Y29sb3ItbmVnYXRpdmUnLCBjYXRlZ29yeS5zdWNjZXNzZnVsX3Byb2plY3RzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsICdQcm9qZXRvcyBmaW5hbmNpYWRvcycpLCAhXy5pc0VtcHR5KGN0cmwuZmVhdHVyZWRQcm9qZWN0cygpKSA/IF8ubWFwKGN0cmwuZmVhdHVyZWRQcm9qZWN0cygpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChwcm9qZWN0KSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudXNlci1hdmF0YXJbc3JjPVwiJHtwcm9qZWN0LnVzZXJUaHVtYn1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QudXNlci5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ2NhdGVnb3JpZXMucGxlZGdlZCcsIEkxOG5TY29wZSh7cGxlZGdlZDogaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKSwgY29udHJpYnV0b3JzOiBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9yc30pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIvJHtwcm9qZWN0LnBlcm1hbGlua31cIl1gLCBwcm9qZWN0Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2NhdGVnb3JpZXMubG9hZGluZ19mZWF0dXJlZCcsIEkxOG5TY29wZSgpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdjYXRlZ29yaWVzLm5vX2ZlYXR1cmVkJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuU2xpZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlczogdGVzdGltb25pYWxzKCksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBJMThuLnQoJ3Rlc3RpbW9uaWFsc190aXRsZScsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlci51LW1hcmdpbnRvcC0zMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgSTE4bi50KCdxYV90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgXy5tYXAoY3RybC5xdWVzdGlvbnMuY29sXzEsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIF8ubWFwKGN0cmwucXVlc3Rpb25zLmNvbF8yLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLnUtdGV4dC1jZW50ZXIuYmctcHVycGxlLmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNjAnLCAnQ3JpZSBvIHNldSByYXNjdW5obyBncmF0dWl0YW1lbnRlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybVthY3Rpb249XCIvcHQvcHJvamVjdHNcIl1bbWV0aG9kPVwiUE9TVFwiXS53LXJvdy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCBJMThuLnQoJ2Zvcm0udGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtuYW1lPVwidXRmOFwiXVt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwi4pyTXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W25hbWU9XCJhdXRoZW50aWNpdHlfdG9rZW5cIl1bdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIiR7aC5hdXRoZW50aWNpdHlUb2tlbigpfVwiXWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwW3R5cGU9XCJ0ZXh0XCJdJywge25hbWU6ICdwcm9qZWN0W25hbWVdJ30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS0xMCcsICduYSBjYXRlZ29yaWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQubWVkaXVtLnUtbWFyZ2luYm90dG9tLTQwJywge25hbWU6ICdwcm9qZWN0W2NhdGVnb3J5X2lkXSd9LFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ29wdGlvblt2YWx1ZT1cIlwiXScsIEkxOG4udCgnZm9ybS5zZWxlY3RfZGVmYXVsdCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYG9wdGlvblt2YWx1ZT1cIiR7Y2F0ZWdvcnkuaWR9XCJdYCwgY2F0ZWdvcnkubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1wdXNoLTQudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJHtJMThuLnQoJ2Zvcm0uc3VibWl0JywgSTE4blNjb3BlKCkpfVwiXS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMucm9vdC5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLmFkbWluLnVzZXJGaWx0ZXJWTSA9IChmdW5jdGlvbihtLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBkZWFjdGl2YXRlZF9hdDogJ2lzLm51bGwnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQobnVsbCkub3JkZXIoe1xuICAgICAgICBpZDogJ2Rlc2MnXG4gICAgfSk7XG5cbiAgICB2bS5kZWFjdGl2YXRlZF9hdC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gSlNPTi5wYXJzZSh2bS5kZWFjdGl2YXRlZF9hdCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnVzZXIsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIGgsIHJlcGxhY2VEaWFjcml0aWNzKSB7XG4gICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICAgICAgICAgIHN0YXRlOiAnZXEnLFxuICAgICAgICAgICAgZ2F0ZXdheTogJ2VxJyxcbiAgICAgICAgICAgIHZhbHVlOiAnYmV0d2VlbicsXG4gICAgICAgICAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgICAgICAgfSksXG5cbiAgICAgICAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICAgIH07XG5cbiAgICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgICB2bS5zdGF0ZSgnJyk7XG4gICAgdm0uZ2F0ZXdheSgnJyk7XG4gICAgdm0ub3JkZXIoe1xuICAgICAgICBpZDogJ2Rlc2MnXG4gICAgfSk7XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmx0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmx0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5lbmRPZignZGF5JykuZm9ybWF0KCcnKTtcbiAgICB9O1xuXG4gICAgdm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5ndGUoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZm9ybWF0KCk7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbCwgJ2lkLmRlc2MnLCB7J1ByZWZlcic6ICdjb3VudD1leGFjdCd9KTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMucm9vdC5wcm9qZWN0RmlsdGVycyA9ICgobSwgaCwgbW9tZW50KSA9PiB7XG4gICAgcmV0dXJuICgpID0+e1xuICAgICAgICBjb25zdCBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuXG4gICAgICAgICAgICAgIG5lYXJNZSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgbmVhcl9tZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcScsXG4gICAgICAgICAgICAgICAgICBvbmxpbmVfZGF0ZTogJ2d0J1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykubmVhcl9tZSh0cnVlKS5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg2MCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSksXG5cbiAgICAgICAgICAgICAgZXhwaXJpbmcgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIGV4cGlyZXNfYXQ6ICdsdGUnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykuZXhwaXJlc19hdChtb21lbnQoKS5hZGQoMTQsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY2VudCA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgb25saW5lX2RhdGU6ICdndGUnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNSwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSksXG5cbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5yZWNvbW1lbmRlZCgndHJ1ZScpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBvbmxpbmUgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLFxuXG4gICAgICAgICAgICAgIHN1Y2Nlc3NmdWwgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgZXhwaXJlc19hdDogJ2d0J1xuICAgICAgICAgICAgICB9KS5zdGF0ZSgnc3VjY2Vzc2Z1bCcpLmV4cGlyZXNfYXQobW9tZW50KCkuc3VidHJhY3QoMzAsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWNvbW1lbmRlZDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjb21lbmRhZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY29tbWVuZGVkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdObyBhcicsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBvbmxpbmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleHBpcmluZzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmV0YSBmaW5hbCcsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBleHBpcmluZ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0JlbS1zdWNlZGlkb3MnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlY2VudDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjZW50ZXMnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogcmVjZW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmVhcl9tZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgbWltJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IG5lYXJNZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
