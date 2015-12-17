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
    };

    setMomentifyLocale();
    closeFlash();

    return {
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
            return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m('.fontsize-smallest', 'Usuário: ' + user.id), m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data || m('')])]);
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
            }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', I18n.t('by', I18nScope()) + ' ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m('.card-project-meter.' + project.state, [_.contains(['successful', 'failed', 'waitint_funds'], project.state) ? m('div', I18n.t('display_status.' + project.state, I18nScope())) : m('.meter', [m('.meter-fill', {
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
            }, ['Comentários ', m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))])]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project.open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6.w-col-medium-4', [m.component(c.ProjectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '')])])]), ctrl.isFixed() ? m('.w-section.project-nav') : '']);
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
                changeSlideTimer = setInterval(function () {
                incrementSlide();
                m.redraw();
            }, 6500),
                config = function config(el, isInitialized, context) {
                if (!isInitialized) {
                    translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    m.redraw();
                };

                context.onunload = function () {
                    return clearInterval(changeSlideTimer);
                };
            };

            return {
                config: config,
                selectedSlideIdx: selectedSlideIdx,
                translationSize: translationSize,
                decrementSlide: decrementSlide,
                incrementSlide: incrementSlide
            };
        },
        view: function view(ctrl, args) {
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
                    return ctrl.decrementSlide();
                }
            }, [m('.w-icon-slider-left.fa.fa-chevron-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return ctrl.incrementSlide();
                }
            }, [m('.w-icon-slider-right.fa.fa-chevron-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times(function (idx) {
                return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                    onclick: function onclick() {
                        return ctrl.selectedSlideIdx(idx);
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
/**
 * window.c.contribution.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
'use strict';

window.c.contribution.ProjectsExplore = (function (m, c, h, _) {
    return {

        controller: function controller() {
            var filters = m.postgrest.filtersVM,
                follow = c.models.categoryFollower,
                filtersMap = c.contribution.projectFilters(),
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
                    var byCategory = filters({ state_order: 'gte', category_id: 'eq' }).state_order('published');

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
                return m.component(c.ProjectCard, { project: project });
            })), ctrl.projects().isLoading() ? h.loader() : ''])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-5'), m('.w-col.w-col-2', [m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                    ctrl.projects().nextPage();return false;
                } }, 'Carregar mais')]), m('.w-col.w-col-5')])])])];
        }
    };
})(window.m, window.c, window.c.h, window._);
'use strict';

window.c.contribution.ProjectsHome = (function (m, c, moment, h, _) {
    return {
        controller: function controller() {
            var sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                project = c.models.project,
                filters = c.contribution.projectFilters();

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
            return _.map(ctrl.collections, function (collection) {
                return m.component(c.ProjectRow, {
                    collection: collection,
                    ref: 'home_' + collection.hash
                });
            });
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._);
'use strict';

window.c.pages.Flex = (function (m, c, h, models) {
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
"use strict";

window.c.pages.startVM = (function (_) {
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

window.c.pages.Start = (function (m, c, h, models, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'pages.start');

    return {
        controller: function controller() {
            var stats = m.prop([]),
                categories = m.prop([]),
                selectedPane = m.prop(0),
                selectedCategory = m.prop([]),
                featuredProjects = m.prop([]),
                selectedCategoryIdx = m.prop(-1),
                startvm = c.pages.startVM(I18n),
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
            }))])]), m('.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m('form[action="/projects/new"][method="GET"].w-row.w-form', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n.t('form.title', I18nScope())), m('input.w-input.text-field.medium.u-marginbottom-30[name=\'name\'][type=\'text\']'), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m('select.w-select.text-field.medium.u-marginbottom-40[name=\'category_id\']', [m('option[value=""]', I18n.t('form.select_default', I18nScope())), _.map(ctrl.categories(), function (category) {
                return m('option[value="' + category.id + '"]', category.name);
            })])]), m('.w-col.w-col-2'), m('.w-row.u-marginbottom-80', [m('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m('input[type="submit"][value="' + I18n.t('form.submit', I18nScope()) + '"].w-button.btn.btn-large')])])])])])];
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window.I18n);
'use strict';

window.c.pages.Team = (function (m, c) {
    return {
        view: function view() {
            return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
        }
    };
})(window.m, window.c);
'use strict';

window.c.project.Insights = (function (m, c, h, models, _, I18n) {
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
                l = m.prop(false);

            filtersVM.project_id(args.root.getAttribute('data-id'));

            l = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);

            models.projectContributionsPerDay.getRow(filtersVM.parameters()).then(contributionsPerDay);

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
            models.projectContributionsPerLocation.getRow(filtersVM.parameters()).then(buildPerLocationTable);

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
            models.projectContributionsPerRef.getRow(filtersVM.parameters()).then(buildPerRefTable);

            var explanationModeComponent = function explanationModeComponent(projectMode) {
                var modes = {
                    'aon': c.AonAdminProjectDetailsExplanation,
                    'flex': c.FlexAdminProjectDetailsExplanation
                };

                return modes[projectMode];
            };

            return {
                l: l,
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
            }, [m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('amount_per_day_label', I18nScope()),
                dataKey: 'total_amount',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('contributions_per_day_label', I18nScope()),
                dataKey: 'total',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n.t('ref_origin_title', I18nScope()), h.newFeatureBadge(), tooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerRefTable,
                defaultSortIndex: -2
            })])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())), m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerLocationTable,
                defaultSortIndex: -2
            })])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, {
                resource: project
            })])])])])] : ''] : h.loader());
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window._, window.I18n);
'use strict';

window.c.project.Show = (function (m, c, _, models, h) {
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

window.c.contribution.projectFilters = (function (m, h, moment) {
    return function () {
        var filters = m.postgrest.filtersVM,
            nearMe = filters({
            near_me: 'eq',
            open_for_contributions: 'eq',
            online_date: 'gt'
        }).open_for_contributions('true').near_me(true).online_date(moment().subtract(30, 'days').format('YYYY-MM-DD')),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLW5vdGlmaWNhdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWNhcmQuanMiLCJhZG1pbi1wcm9qZWN0LmpzIiwiYWRtaW4tcmFkaW8tYWN0aW9uLmpzIiwiYWRtaW4tcmVzZXQtcGFzc3dvcmQuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLWRldGFpbC5qcyIsImFkbWluLXVzZXItaXRlbS5qcyIsImFkbWluLXVzZXIuanMiLCJhb24tYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiY2F0ZWdvcnktYnV0dG9uLmpzIiwiZmlsdGVyLWJ1dHRvbi5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwiZmxleC1wcm9qZWN0LWRldGFpbHMtZXhwbGFuYXRpb24uanMiLCJsYW5kaW5nLXFhLmpzIiwibGFuZGluZy1zaWdudXAuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInBvcC1ub3RpZmljYXRpb24uanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtZGFzaGJvYXJkLW1lbnUuanMiLCJwcm9qZWN0LWRhdGEtY2hhcnQuanMiLCJwcm9qZWN0LWRhdGEtdGFibGUuanMiLCJwcm9qZWN0LWhlYWRlci5qcyIsInByb2plY3QtaGlnaGxpZ2h0LmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1tb2RlLmpzIiwicHJvamVjdC1wb3N0cy5qcyIsInByb2plY3QtcmVtaW5kZXItY291bnQuanMiLCJwcm9qZWN0LXJlbWluZGVyLmpzIiwicHJvamVjdC1yZXdhcmQtbGlzdC5qcyIsInByb2plY3Qtcm93LmpzIiwicHJvamVjdC1zaGFyZS1ib3guanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJzbGlkZXIuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItY2FyZC5qcyIsInlvdXR1YmUtbGlnaHRib3guanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiLCJjb250cmlidXRpb24vcHJvamVjdHMtZXhwbG9yZS5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0cy1ob21lLmpzIiwicGFnZXMvZmxleC5qcyIsInBhZ2VzL2xpdmUtc3RhdGlzdGljcy5qcyIsInBhZ2VzL3N0YXJ0LXZtLmpzIiwicGFnZXMvc3RhcnQuanMiLCJwYWdlcy90ZWFtLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsInByb2plY3Qvc2hvdy5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWZpbHRlci12bS5qcyIsImFkbWluL3VzZXJzL3VzZXItbGlzdC12bS5qcyIsImNvbnRyaWJ1dGlvbi92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LEVBQUUsTUFBTTthQUNqQjtTQUNKLENBQUM7S0FDTCxDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUMiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG1vZGVsczoge30sXG4gICAgICAgIHBhZ2VzOiB7fSxcbiAgICAgICAgY29udHJpYnV0aW9uOiB7fSxcbiAgICAgICAgYWRtaW46IHt9LFxuICAgICAgICBwcm9qZWN0OiB7fSxcbiAgICAgICAgaDoge31cbiAgICB9O1xufSgpKTtcbiIsIndpbmRvdy5jLmggPSAoKG0sIG1vbWVudCwgSTE4bikgPT4ge1xuICAgIC8vRGF0ZSBIZWxwZXJzXG5cbiAgICBjb25zdCBoYXNoTWF0Y2ggPSAoc3RyKSA9PiB7IHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gc3RyOyB9LFxuICAgICAgICBwYXJhbUJ5TmFtZSA9IChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxOYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyksXG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBub3JtYWxOYW1lICsgJz0oW14mI10qKScpLFxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRNb21lbnRpZnlMb2NhbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBtb21lbnQubG9jYWxlKCdwdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgbW9udGhzU2hvcnQ6ICdqYW5fZmV2X21hcl9hYnJfbWFpX2p1bl9qdWxfYWdvX3NldF9vdXRfbm92X2Rleicuc3BsaXQoJ18nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBleGlzdHkgPSAoeCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHggIT0gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBtb21lbnRpZnkgPSAoZGF0ZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGUgPyBtb21lbnQoZGF0ZSkubG9jYWxlKCdwdCcpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3JlQWN0aW9uID0gKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKCFzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShhY3Rpb24sIGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbFN0b3JlZEFjdGlvbiA9IChhY3Rpb24sIGZ1bmMpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmdW5jLmNhbGwoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2N1c3MgPSAocGFnZSwgaWRlbnRpZmllcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZCA9IGRvY3VtZW50LFxuICAgICAgICAgICAgICAgIHMgPSBkLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgd2luZG93LmRpc3F1c19jb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gcGFnZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IGlkZW50aWZpZXI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcy5zcmMgPSAnLy9jYXRhcnNlZmxleC5kaXNxdXMuY29tL2VtYmVkLmpzJztcbiAgICAgICAgICAgIHMuc2V0QXR0cmlidXRlKCdkYXRhLXRpbWVzdGFtcCcsICtuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIChkLmhlYWQgfHwgZC5ib2R5KS5hcHBlbmRDaGlsZChzKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb21lbnRGcm9tU3RyaW5nID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXVyb3BlYW4gPSBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XG4gICAgICAgICAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJhbnNsYXRlZFRpbWVVbml0cyA9IHtcbiAgICAgICAgICAgIGRheXM6ICdkaWFzJyxcbiAgICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dG9zJyxcbiAgICAgICAgICAgIGhvdXJzOiAnaG9yYXMnLFxuICAgICAgICAgICAgc2Vjb25kczogJ3NlZ3VuZG9zJ1xuICAgICAgICB9LFxuICAgICAgICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICAgICAgICB0cmFuc2xhdGVkVGltZSA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2xhdGVkVGltZSA9IHRyYW5zbGF0ZWRUaW1lVW5pdHMsXG4gICAgICAgICAgICAgICAgdW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvalVuaXQgPSB0cmFuc2xhdGVkVGltZVt0aW1lLnVuaXQgfHwgJ3NlY29uZHMnXTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHRpbWUudG90YWwgPD0gMSkgPyBwcm9qVW5pdC5zbGljZSgwLCAtMSkgOiBwcm9qVW5pdDtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVuaXQ6IHVuaXQoKSxcbiAgICAgICAgICAgICAgICB0b3RhbDogdGltZS50b3RhbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgICAgICAgZ2VuZXJhdGVGb3JtYXROdW1iZXIgPSAocywgYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChudW1iZXIsIG4sIHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNOdW1iZXIobnVtYmVyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZSA9ICdcXFxcZCg/PShcXFxcZHsnICsgKHggfHwgMykgKyAnfSkrJyArIChuID4gMCA/ICdcXFxcRCcgOiAnJCcpICsgJyknLFxuICAgICAgICAgICAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGMgPyBudW0ucmVwbGFjZSgnLicsIGMpIDogbnVtKS5yZXBsYWNlKG5ldyBSZWdFeHAocmUsICdnJyksICckJicgKyAocyB8fCAnLCcpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1hdE51bWJlciA9IGdlbmVyYXRlRm9ybWF0TnVtYmVyKCcuJywgJywnKSxcblxuICAgICAgICB0b2dnbGVQcm9wID0gKGRlZmF1bHRTdGF0ZSwgYWx0ZXJuYXRlU3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICAgICAgICAgIHAudG9nZ2xlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaWRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICB9KSxcblxuICAgICAgICBnZXRVc2VyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JyksXG4gICAgICAgICAgICAgICAgZGF0YSA9IF8uZmlyc3QoYm9keSkuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZXInKTtcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhdGlvbkFjdGlvbk1hdGNoID0gKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbiA9PT0gYWN0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdCA9IChhdmF0YXJQYXRoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXZhdGFyUGF0aCB8fCAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZyc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9UZW1wbGF0ZXNcbiAgICAgICAgbG9hZGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwIHUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXdGZWF0dXJlQmFkZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnc3Bhbi5iYWRnZS5iYWRnZS1zdWNjZXNzLm1hcmdpbi1zaWRlLTUnLCBJMThuLnQoJ3Byb2plY3RzLm5ld19mZWF0dXJlX2JhZGdlJykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZiUGFyc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cnlQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuRkIuWEZCTUwucGFyc2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dCh0cnlQYXJzZSwgNTAwKTsgLy91c2UgdGltZW91dCB0byB3YWl0IGFzeW5jIG9mIGZhY2Vib29rXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGx1cmFsaXplID0gKGNvdW50LCBzLCBwKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGNvdW50ID4gMSA/IGNvdW50ICsgcCA6IGNvdW50ICsgcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2ltcGxlRm9ybWF0ID0gKHN0ciA9ICcnKSA9PiB7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxyXFxuPy8sICdcXG4nKTtcbiAgICAgICAgICAgIGlmIChzdHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcbi9nLCAnPGJyIC8+Jyk7XG4gICAgICAgICAgICAgICAgc3RyID0gJzxwPicgKyBzdHIgKyAnPC9wPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJld2FyZFNvdWxkT3V0ID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/XG4gICAgICAgICAgICAgICAgKHJld2FyZC5wYWlkX2NvdW50ICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCA+PSByZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zKSA6IGZhbHNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXdhcmRSZW1hbmluZyA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIC0gKHJld2FyZC5wYWlkX2NvdW50ICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VVcmwgPSAoaHJlZikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIGwuaHJlZiA9IGhyZWY7XG4gICAgICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgfSxcblxuICAgICAgICBtaXhwYW5lbFRyYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuQ2F0YXJzZU1peHBhbmVsLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBVSUhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQgJiYgJCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVUlIZWxwZXIuc2V0dXBSZXNwb25zaXZlSWZyYW1lcygkKGVsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0FuY2hvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzaCA9PT0gZWwuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZUVtYWlsID0gKGVtYWlsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZSA9IC9eKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXStcXC4pK1tePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl17Mix9KSQvaTtcbiAgICAgICAgICAgIHJldHVybiByZS50ZXN0KGVtYWlsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuYXZpZ2F0ZVRvRGV2aXNlID0gKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3B0L2xvZ2luJztcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjdW11bGF0aXZlT2Zmc2V0ID0gKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0b3AgPSAwLCBsZWZ0ID0gMDtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB0b3AgKz0gZWxlbWVudC5vZmZzZXRUb3AgIHx8IDA7XG4gICAgICAgICAgICAgICAgbGVmdCArPSBlbGVtZW50Lm9mZnNldExlZnQgfHwgMDtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQ7XG4gICAgICAgICAgICB9IHdoaWxlIChlbGVtZW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlRmxhc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpY29uLWNsb3NlJylbMF07XG4gICAgICAgICAgICBpZiAoXy5pc0VsZW1lbnQoZWwpKXtcbiAgICAgICAgICAgICAgICBlbC5vbmNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWwucGFyZW50RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpMThuU2NvcGUgPSAoc2NvcGUsIG9iaikgPT4ge1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBvYmosIHtzY29wZTogc2NvcGV9KTtcbiAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuICAgIGNsb3NlRmxhc2goKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQ6IGN1bXVsYXRpdmVPZmZzZXQsXG4gICAgICAgIGRpc2N1c3M6IGRpc2N1c3MsXG4gICAgICAgIGV4aXN0eTogZXhpc3R5LFxuICAgICAgICB2YWxpZGF0ZUVtYWlsOiB2YWxpZGF0ZUVtYWlsLFxuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBuZXdGZWF0dXJlQmFkZ2U6IG5ld0ZlYXR1cmVCYWRnZSxcbiAgICAgICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICAgICAgcGx1cmFsaXplOiBwbHVyYWxpemUsXG4gICAgICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgICAgICB0cmFuc2xhdGVkVGltZTogdHJhbnNsYXRlZFRpbWUsXG4gICAgICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICAgICAgcmV3YXJkUmVtYW5pbmc6IHJld2FyZFJlbWFuaW5nLFxuICAgICAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoLFxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQ6IHVzZUF2YXRhck9yRGVmYXVsdCxcbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaDogbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICAgICAgbWl4cGFuZWxUcmFjazogbWl4cGFuZWxUcmFjayxcbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZTogbmF2aWdhdGVUb0RldmlzZSxcbiAgICAgICAgc3RvcmVBY3Rpb246IHN0b3JlQWN0aW9uLFxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uOiBjYWxsU3RvcmVkQWN0aW9uLFxuICAgICAgICBVSUhlbHBlcjogVUlIZWxwZXIsXG4gICAgICAgIHRvQW5jaG9yOiB0b0FuY2hvcixcbiAgICAgICAgcGFyYW1CeU5hbWU6IHBhcmFtQnlOYW1lLFxuICAgICAgICBpMThuU2NvcGU6IGkxOG5TY29wZVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50LCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMubW9kZWxzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgY29udHJpYnV0aW9uRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbl9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9kZXRhaWxzJyksXG4gICAgICAgIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gICAgICAgIHVzZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcnMnKSxcbiAgICAgICAgcmV3YXJkRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Jld2FyZF9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3RSZW1pbmRlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3JlbWluZGVycycpLFxuICAgICAgICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgICAgICAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zJyksXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcG9zdHNfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfbG9jYXRpb24nKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWYgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9yZWYnKSxcbiAgICAgICAgcHJvamVjdCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0cycpLFxuICAgICAgICBwcm9qZWN0U2VhcmNoID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3JwYy9wcm9qZWN0X3NlYXJjaCcpLFxuICAgICAgICBjYXRlZ29yeSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yaWVzJyksXG4gICAgICAgIGNhdGVnb3J5VG90YWxzID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X3RvdGFscycpLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X2ZvbGxvd2VycycpLFxuICAgICAgICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpLFxuICAgICAgICBub3RpZmljYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgnbm90aWZpY2F0aW9ucycpLFxuICAgICAgICBzdGF0aXN0aWMgPSBtLnBvc3RncmVzdC5tb2RlbCgnc3RhdGlzdGljcycpO1xuXG4gICAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gICAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbiAgICBwcm9qZWN0LnBhZ2VTaXplKDMwKTtcbiAgICBjYXRlZ29yeS5wYWdlU2l6ZSg1MCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICAgICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgICAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBwcm9qZWN0U2VhcmNoOiBwcm9qZWN0U2VhcmNoLFxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgIGNhdGVnb3J5VG90YWxzOiBjYXRlZ29yeVRvdGFscyxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlcjogY2F0ZWdvcnlGb2xsb3dlcixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXk6IHByb2plY3RDb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWYsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb246IHByb2plY3RDb250cmlidXRpb24sXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsOiBwcm9qZWN0UG9zdERldGFpbCxcbiAgICAgICAgcHJvamVjdFJlbWluZGVyOiBwcm9qZWN0UmVtaW5kZXIsXG4gICAgICAgIG5vdGlmaWNhdGlvbjogbm90aWZpY2F0aW9uLFxuICAgICAgICBzdGF0aXN0aWM6IHN0YXRpc3RpY1xuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGw7XG4gICAgICAgICAgICBjb25zdCBsb2FkUmV3YXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gYy5tb2RlbHMucmV3YXJkRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmRfaWQgPSBhcmdzLml0ZW0ucmV3YXJkX2lkLFxuICAgICAgICAgICAgICAgICAgICBvcHRzID0gbW9kZWwuZ2V0Um93T3B0aW9ucyhoLmlkVk0uaWQocmV3YXJkX2lkKS5wYXJhbWV0ZXJzKCkpLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmQgPSBtLnByb3Aoe30pO1xuICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4ob3B0cyk7XG4gICAgICAgICAgICAgICAgaWYgKHJld2FyZF9pZCkge1xuICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKF8uY29tcG9zZShyZXdhcmQsIF8uZmlyc3QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCByZXdhcmQgPSBsb2FkUmV3YXJkKCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJld2FyZDogcmV3YXJkLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdUcmFuc2ZlcmlyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnVHJhbnNmZXJpciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2V4OiAxMjk5MDgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdBcG9pbyB0cmFuc2ZlcmlkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyBhcG9pbyBuw6NvIGZvaSB0cmFuc2ZlcmlkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnY29udHJpYnV0aW9uX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEtleTogJ3Jld2FyZF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb3M6ICdyZXdhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRNb2RlbDogYy5tb2RlbHMucmV3YXJkRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbTogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGU6IChyZXdhcmRzLCBuZXdSZXdhcmRJRCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXdhcmQgPSBfLmZpbmRXaGVyZShyZXdhcmRzLCB7aWQ6IG5ld1Jld2FyZElEfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhcmdzLml0ZW0udmFsdWUgPj0gcmV3YXJkLm1pbmltdW1fdmFsdWUpID8gdW5kZWZpbmVkIDogJ1ZhbG9yIG3DrW5pbW8gZGEgcmVjb21wZW5zYSDDqSBtYWlvciBkbyBxdWUgbyB2YWxvciBkYSBjb250cmlidWnDp8Ojby4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWZ1bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlZW1ib2xzbyBkaXJldG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgcmVlbWJvbHNhciBlc3NlIGFwb2lvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVlbWJvbHNhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBcGFnYXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgYXBhZ2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdBcG9pbyByZW1vdmlkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyBhcG9pbyBuw6NvIGZvaSByZW1vdmlkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsOiBsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gY3RybC5hY3Rpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgcmV3YXJkID0gY3RybC5yZXdhcmQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvYWRtaW4vY29udHJpYnV0aW9ucy8ke2lkfS9nYXRld2F5X3JlZnVuZGApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMudHJhbnNmZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmFkaW9BY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMucmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5VmFsdWU6IGl0ZW0ucHJvamVjdF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleVZhbHVlOiBpdGVtLmNvbnRyaWJ1dGlvbl9pZFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhZGRPcHRpb25zKGFjdGlvbnMucmVmdW5kLCBpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZW1vdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpKSA/IGgubG9hZGVyIDpcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJld2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGl0ZW0ua2V5XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb25JdGVtID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Qcm9qZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnUGF5bWVudFN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLFxuICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwuaXRlbUJ1aWxkZXIsIGZ1bmN0aW9uKHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKHBhbmVsLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1twYW5lbC5jb21wb25lbnRdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uVXNlciBjb21wb25lbnRcbiAqIEFuIGl0ZW1idWlsZGVyIGNvbXBvbmVudCB0aGF0IHJldHVybnMgYWRkaXRpb25hbCBkYXRhXG4gKiB0byBiZSBpbmNsdWRlZCBpbiBBZG1pblVzZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICogICAgIHJldHVybiB7XG4gKiAgICAgICAgIGl0ZW1CdWlsZGVyOiBbe1xuICogICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAqICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICogICAgICAgICB9XVxuICogICAgIH1cbiAqIH1cbiAqL1xud2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZV9pbWdfdGh1bWJuYWlsOiBpdGVtLnVzZXJfcHJvZmlsZV9pbWcsXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0udXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnVzZXJfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogaXRlbS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxEYXRhID0gbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnR2F0ZXdheTogJyArIGl0ZW0ucGF5ZXJfZW1haWwpO1xuICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5Vc2VyLCB7aXRlbTogdXNlciwgYWRkaXRpb25hbF9kYXRhOiBhZGRpdGlvbmFsRGF0YX0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1jb250cmlidXRpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLXNtYWxsJywgJ1IkJyArIGNvbnRyaWJ1dGlvbi52YWx1ZSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVkgSEg6bW1baF0nKSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cImh0dHBzOi8vZGFzaGJvYXJkLnBhZ2FyLm1lLyMvdHJhbnNhY3Rpb25zLycgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCArICdcIl0nLCBjb250cmlidXRpb24uZ2F0ZXdheV9pZClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkV4dGVybmFsQWN0aW9uIGNvbXBvbmVudFxuICogTWFrZXMgYXJiaXRyYXJ5IGFqYXggcmVxdWVzdHMgYW5kIHVwZGF0ZSB1bmRlcmx5aW5nXG4gKiBkYXRhIGZyb20gc291cmNlIGVuZHBvaW50LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBpdGVtOiByb3dGcm9tRGF0YWJhc2VcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gPSAoKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpWzBdLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbG9hZCA9IF8uY29tcG9zZShidWlsZGVyLm1vZGVsLmdldFJvd1dpdGhUb2tlbiwgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKS5wYXJhbWV0ZXJzKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyKGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMsIG0ucmVxdWVzdCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbG9hZEl0ZW0gPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlbG9hZCgpLnRoZW4odXBkYXRlSXRlbSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVJdGVtID0gKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4ocmVsb2FkSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlcXVpc2nDp8OjbyBmZWl0YSBjb20gc3VjZXNzby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkZpbHRlciA9IChmdW5jdGlvbihjLCBtLCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGxhYmVsID0gYXJncy5sYWJlbCB8fCAnJyxcbiAgICAgICAgICAgICAgICBtYWluID0gXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtZmlsdGVyLnctc2VjdGlvbi5wYWdlLWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIGxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkgPyBtLmNvbXBvbmVudChjW21haW4uY29tcG9uZW50XSwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMC53LXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWNvbC53LWNvbC0xMi5mb250c2l6ZS1zbWFsbGVzdC5saW5rLWhpZGRlbi1saWdodFtzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgb3V0bGluZTogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDtcIl1bdHlwZT1cImJ1dHRvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0ZpbHRyb3MgYXZhbsOnYWRvcyDCoD4nKSksIChjdHJsLnRvZ2dsZXIoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNhZHZhbmNlZC1zZWFyY2gudy1yb3cuYWRtaW4tZmlsdGVycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuY29tcG9uZW50ICE9PSAnRmlsdGVyTWFpbicpID8gbS5jb21wb25lbnQoY1tmLmNvbXBvbmVudF0sIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5jLCB3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluSW5wdXRBY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBmb3JjZVZhbHVlID0gYnVpbGRlci5mb3JjZVZhbHVlIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoZm9yY2VWYWx1ZSk7XG5cbiAgICAgICAgICAgIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSk7XG5cbiAgICAgICAgICAgIHZhciBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIubW9kZWwucGF0Y2hPcHRpb25zKGguaWRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBuZXdWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlKGZvcmNlVmFsdWUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksIChkYXRhLmZvcmNlVmFsdWUgPT09IHVuZGVmaW5lZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3VmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLm5ld1ZhbHVlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBkYXRhLnN1Y2Nlc3NNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0hvdXZlIHVtIHByb2JsZW1hIG5hIHJlcXVpc2nDp8Ojby4gJyArIGRhdGEuZXJyb3JNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5JdGVtID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheURldGFpbEJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheURldGFpbEJveDogZGlzcGxheURldGFpbEJveFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4LmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMjAucmVzdWx0cy1hZG1pbi1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChhcmdzLmxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCdidXR0b24udy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheURldGFpbEJveC50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjdHJsLmRpc3BsYXlEZXRhaWxCb3goKSA/IG0uY29tcG9uZW50KGFyZ3MubGlzdERldGFpbCwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkxpc3QgPSAoZnVuY3Rpb24obSwgaCwgYykge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3Q7XG4gICAgICAgICAgICBpZiAoIWxpc3QuY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0LmZpcnN0UGFnZSkge1xuICAgICAgICAgICAgICAgIGxpc3QuZmlyc3RQYWdlKCkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhcmdzLnZtLmVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0LFxuICAgICAgICAgICAgICAgIGVycm9yID0gYXJncy52bS5lcnJvcixcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKCkgP1xuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC5jYXJkLWVycm9yLnUtcmFkaXVzLmZvbnR3ZWlnaHQtYm9sZCcsIGVycm9yKCkpIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBDYXJyZWdhbmRvICR7bGFiZWwudG9Mb3dlckNhc2UoKX0uLi5gIDogW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIGxpc3QudG90YWwoKSksIGAgJHtsYWJlbC50b0xvd2VyQ2FzZSgpfSBlbmNvbnRyYWRvc2BdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1saXN0LnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGFyZ3MubGlzdEl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBhcmdzLmxpc3REZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSBjb21wb25lbnRcbiAqIFJldHVybiBub3RpZmljYXRpb25zIGxpc3QgZnJvbSBhbiBVc2VyIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAqICAgICB1c2VyOiB1c2VyXG4gKiB9KVxuICovXG5cbndpbmRvdy5jLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSA9ICgobSwgaCwgXywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMgPSAodXNlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbm90aWZpY2F0aW9uID0gbW9kZWxzLm5vdGlmaWNhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmdldFBhZ2VXaXRoVG9rZW4obS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW50X2F0OiAnaXMubnVsbCdcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnVzZXJfaWQodXNlci5pZClcbiAgICAgICAgICAgICAgICAgICAgLnNlbnRfYXQoIW51bGwpXG4gICAgICAgICAgICAgICAgICAgIC5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW50X2F0OiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBhcmFtZXRlcnMoKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4obm90aWZpY2F0aW9ucyk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZ2V0Tm90aWZpY2F0aW9ucyhhcmdzLnVzZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbnM6IG5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRlIG5vdGlmaWNhw6fDtWVzJyksXG4gICAgICAgICAgICAgICAgY3RybC5ub3RpZmljYXRpb25zKCkubWFwKChjRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTI0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY0V2ZW50LnNlbnRfYXQsICdERC9NTS9ZWVlZLCBISDptbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAtICcsIGNFdmVudC50ZW1wbGF0ZV9uYW1lLCBjRXZlbnQub3JpZ2luID8gJyAtICcgKyBjRXZlbnQub3JpZ2luIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgY29tcG9uZW50XG4gKiByZW5kZXIgYW4gYm94IHdpdGggc29tZSBwcm9qZWN0IHN0YXRpc3RpY3MgaW5mb1xuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gKiAgICAgcmVzb3VyY2U6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoKG0sIGgsIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHVzVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOTyBBUidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTsODTyBGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBR1VBUkRBTkRPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JFQ1VTQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkFTQ1VOSE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdFTSBBTsOBTElTRSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJvdmVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0FQUk9WQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iaihzdGF0dXNUZXh0W3Byb2plY3Quc3RhdGVdKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzVGV4dE9iajtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRmluYWxMYXAgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiB1c2UgOCBkYXlzIGJlY2F1c2UgdGltZXpvbmUgb24ganNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpICYmIG1vbWVudCgpLmFkZCg4LCAnZGF5cycpID49IG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QucmVtYWluaW5nX3RpbWUpLFxuICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QuZWxhcHNlZF90aW1lKSxcbiAgICAgICAgICAgICAgICBpc0ZpbmFsTGFwOiBpc0ZpbmFsTGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaixcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGV4dE9iaiA9IGN0cmwuZWxhcHNlZFRleHRPYmo7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1kZXRhaWxzLWNhcmQuY2FyZC51LXJhZGl1cy5jYXJkLXRlcmNpYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnU3RhdHVzOicpLCAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGN0cmwuaXNGaW5hbExhcCgpICYmIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdSRVRBIEZJTkFMJyA6IHN0YXR1c1RleHRPYmoudGV4dCkpLCAnwqAnXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnZmluYW5jaWFkbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9ncmVzcyArICclJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2xldmFudGFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2luaWNpYWRvIGjDoScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZWxhcHNlZFRleHRPYmoudG90YWwgKyAnICcgKyBlbGFwc2VkVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAncmVzdGFtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCArICcgJyArIHJlbWFpbmluZ1RleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSgpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3QgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz0nICsgcHJvamVjdC5wcm9qZWN0X2ltZyArICddW3dpZHRoPTUwXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3Rfb25saW5lX2RhdGUpICsgJyBhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3RfZXhwaXJlc19hdCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG0ucHJvcChpdGVtLmRlc2NyaXB0aW9uIHx8ICcnKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBuZXdJRCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZ2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgc2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgcmFkaW9zID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgZ2V0QXR0ciA9IGJ1aWxkZXIucmFkaW9zLFxuICAgICAgICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGdldEtleVZhbHVlID0gYXJncy5nZXRLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZSA9IGFyZ3MudXBkYXRlS2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdmFsaWRhdGUgPSBidWlsZGVyLnZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbSA9IGJ1aWxkZXIuc2VsZWN0ZWRJdGVtIHx8IG0ucHJvcCgpO1xuXG4gICAgICAgICAgICBzZXRGaWx0ZXJbdXBkYXRlS2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgc2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oc2V0RmlsdGVyKTtcbiAgICAgICAgICAgIHNldFZNW3VwZGF0ZUtleV0odXBkYXRlS2V5VmFsdWUpO1xuXG4gICAgICAgICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgICAgICAgIGdldFZNW2dldEtleV0oZ2V0S2V5VmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0UGFnZU9wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbSA9IF8uZmluZFdoZXJlKHJhZGlvcygpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YVswXVtidWlsZGVyLnNlbGVjdEtleV1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbShuZXdJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnTmVuaHVtIGl0ZW0gYXR1YWxpemFkbydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXIubG9hZCgpLnRoZW4ocmFkaW9zLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0lEKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZShyYWRpb3MoKSwgbmV3SUQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbGlkYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2J1aWxkZXIuc2VsZWN0S2V5XSA9IG5ld0lEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRMb2FkZXIubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdJRCgnJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmV0Y2goKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgbmV3SUQ6IG5ld0lELFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWQsXG4gICAgICAgICAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLnNldExvYWRlcigpIHx8IGN0cmwuZ2V0TG9hZGVyKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm5ld0lEKHJhZGlvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IChpdGVtW2RhdGEuc2VsZWN0S2V5XSB8fCBpdGVtLmlkKSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I3ItJyArIGluZGV4ICsgJy53LXJhZGlvLWlucHV0W3R5cGU9cmFkaW9dW25hbWU9XCJhZG1pbi1yYWRpb1wiXVt2YWx1ZT1cIicgKyByYWRpby5pZCArICdcIl0nICsgKChzZWxlY3RlZCkgPyAnW2NoZWNrZWRdJyA6ICcnKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbC53LWZvcm0tbGFiZWxbZm9yPVwici0nICsgaW5kZXggKyAnXCJdJywgJ1IkJyArIHJhZGlvLm1pbmltdW1fdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlY29tcGVuc2EgYWx0ZXJhZGEgY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3IoKS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkIGNvbXBvbmVudFxuICogTWFrZXMgYWpheCByZXF1ZXN0IHRvIHVwZGF0ZSBVc2VyIHBhc3N3b3JkLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpWzBdLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXIoXy5leHRlbmQoe30sIHtkYXRhOiBkYXRhfSwgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucyksIG0ucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2UgPSBtLnByb3AoJycpO1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZShlcnIuZXJyb3JzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVJdGVtID0gKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG5ld1Bhc3N3b3JkKCk7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCByZXF1ZXN0RXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVubG9hZCA9IChlbCwgaXNpbml0LCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2U6IGVycm9yX21lc3NhZ2UsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogbmV3UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bbmFtZT1cIicgKyBkYXRhLnByb3BlcnR5ICsgJ1wiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1Bhc3N3b3JkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdQYXNzd29yZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdTZW5oYSBhbHRlcmFkYSBjb20gc3VjZXNzby4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5lcnJvcl9tZXNzYWdlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGMsIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gYXJncy5yZXdhcmQoKSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCByZXdhcmQuaWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yIG3DrW5pbW86IFIkJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdEZXNjcmnDp8OjbzogJyArIHJld2FyZC5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIF0gOiAnQXBvaW8gc2VtIHJlY29tcGVuc2EnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFt7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY29uZmlybWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wZW5kaW5nX3JlZnVuZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlZW1ib2xzbyBzb2xpY2l0YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNyaWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1c2VkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY2FuY2VsYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgfV0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0ZSAhPT0gbnVsbCAmJiBpdGVtLmRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9yZGVyZWRFdmVudHM6IF8uc29ydEJ5KG1hcEV2ZW50cywgJ29yaWdpbmFsRGF0ZScpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgICAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBjRXZlbnQuZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY0V2ZW50Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gQ29uZmlybWHDp8OjbzogJyArIChjb250cmlidXRpb24ud2FpdGluZ19wYXltZW50ID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQXBvaW86ICcgKyBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnTWVpbzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0oKSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsIGNvbXBvbmVudFxuICogUmV0dXJuIGFjdGlvbiBpbnB1dHMgdG8gYmUgdXNlZCBpbnNpZGUgQWRtaW5MaXN0IGNvbXBvbmVudC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVkZWZpbmlyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdOb3ZhIHNlbmhhIGRlIFVzdcOhcmlvOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVkZWZpbmlyIHNlbmhhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyM211ZEByJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlYWN0aXZhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVhdGl2YXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgcmVhdGl2YXIgZXNzZSB1c3XDoXJpbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdVc3XDoXJpbyByZWF0aXZhZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gdXN1w6FyaW8gbsOjbyBww7RkZSBzZXIgcmVhdGl2YWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVhdGl2YXIgdXN1w6FyaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gYXJncy5kZXRhaWxzO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRPcHRpb25zID0gKGJ1aWxkZXIsIGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBidWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IChgL3VzZXJzLyR7aWR9L25ld19wYXNzd29yZGApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJlc2V0UGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZXNldCwgaXRlbS5pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbS5kZWFjdGl2YXRlZF9hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7ZGF0YTogYWN0aW9ucy5yZWFjdGl2YXRlLCBpdGVtOiBpdGVtfSkgOiAnJ1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXJJdGVtID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Vc2VyLCBhcmdzKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlciA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHVzZXIgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnVzZXItYXZhdGFyW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdCh1c2VyLnByb2ZpbGVfaW1nX3RodW1ibmFpbCkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvdXNlcnMvJyArIHVzZXIuaWQgKyAnL2VkaXRcIl0nLCB1c2VyLm5hbWUgfHwgdXNlci5lbWFpbClcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdVc3XDoXJpbzogJyArIHVzZXIuaWQpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdFbWFpbDogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLmFkZGl0aW9uYWxfZGF0YSB8fCBtKCcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGFsbCBvciBub3RoaW5nIHByb2plY3QgbWRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgbsOjbyBkZXNhbmltZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gbsOjbyBiYXRldSBhIG1ldGEgZSBzYWJlbW9zIHF1ZSBpc3NvIG7Do28gw6kgYSBtZWxob3IgZGFzIHNlbnNhw6fDtWVzLiBNYXMgbsOjbyBkZXNhbmltZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbmNhcmUgbyBwcm9jZXNzbyBjb21vIHVtIGFwcmVuZGl6YWRvIGUgbsOjbyBkZWl4ZSBkZSBjb2dpdGFyIHVtYSBzZWd1bmRhIHRlbnRhdGl2YS4gTsOjbyBzZSBwcmVvY3VwZSwgdG9kb3Mgb3Mgc2V1cyBhcG9pYWRvcmVzIHJlY2ViZXLDo28gbyBkaW5oZWlybyBkZSB2b2x0YS7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM2NTUwNy1SZWdyYXMtZS1mdW5jaW9uYW1lbnRvLWRvcy1yZWVtYm9sc29zLWVzdG9ybm9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gZmF6ZW1vcyBlc3Rvcm5vcyBlIHJlZW1ib2xzb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCAnLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgc2V1IHByb2pldG8gZm9pIGFwcm92YWRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUGFyYSBjb2xvY2FyIG8gc2V1IHByb2pldG8gbm8gYXIgw6kgcHJlY2lzbyBhcGVuYXMgcXVlIHZvY8OqIHByZWVuY2hhIG9zIGRhZG9zIG5lY2Vzc8OhcmlvcyBuYSBhYmHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIjdXNlcl9zZXR0aW5nc1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy4gw4kgaW1wb3J0YW50ZSBzYWJlciBxdWUgY29icmFtb3MgYSB0YXhhIGRlIDEzJSBkbyB2YWxvciB0b3RhbCBhcnJlY2FkYWRvIGFwZW5hcyBwb3IgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4gRW50ZW5kYcKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBmYXplbW9zIG8gcmVwYXNzZSBkbyBkaW5oZWlyby4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNhdGVnb3J5QnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgYnRuLWNhdGVnb3J5IGNsYXNzLlxuICogSXQgdXNlcyBhIGNhdGVnb3J5IHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge1xuICogICAgIGNhdGVnb3J5OiB7XG4gKiAgICAgICAgIGlkOiAxLFxuICogICAgICAgICBuYW1lOiAnVmlkZW8nLFxuICogICAgICAgICBvbmxpbmVfcHJvamVjdHM6IDFcbiAqICAgICB9XG4gKiB9KVxuICovXG53aW5kb3cuYy5DYXRlZ29yeUJ1dHRvbiA9ICgobSwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGFyZ3MuY2F0ZWdvcnk7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkke2NhdGVnb3J5Lm5hbWUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjYnlfY2F0ZWdvcnlfaWQvJHtjYXRlZ29yeS5pZH0nXWAsXG4gICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmV4cGxvcmUnLCBjYXRlZ29yeS5vbmxpbmVfcHJvamVjdHMpXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5GaWx0ZXJCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBmaWx0ZXJzIGNsYXNzLlxuICogSXQgdXNlcyBhIGhyZWYgYW5kIGEgdGl0bGUgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge1xuICogICAgIHRpdGxlOiAnRmlsdGVyIGJ5IGNhdGVnb3J5JyxcbiAqICAgICBocmVmOiAnZmlsdGVyX2J5X2NhdGVnb3J5J1xuICogfSlcbiAqL1xud2luZG93LmMuRmlsdGVyQnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXJncy50aXRsZSxcbiAgICAgICAgICAgICAgICAgIGhyZWYgPSBhcmdzLmhyZWY7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuZmlsdGVycyR7dGl0bGUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjJHtocmVmfSddYCwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuRmlsdGVyRGF0ZVJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyTnVtYmVyUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGZsZXggcHJvamVjdCBtZGUuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9ICgobSwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXhwbGFuYXRpb24gPSAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChyZXNvdXJjZS5leHBpcmVzX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3Byb2plY3RzLycgKyByZXNvdXJjZS5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgJ1F1ZXJvIGluaWNpYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBhIHJldGEgZmluYWwgZGUgNyBkaWFzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdzcGFuJywgYFZvY8OqIHJlY2ViZSB0dWRvIHF1ZSBhcnJlY2FkYXIgYXTDqSBhcyAke2gubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCwgJ0hIOm1tOnNzJyl9IGRlICR7aC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KX1gKSlcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLCBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksICcuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIFBVQkxJQ0FSLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmxhbmRpbmdRQSBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgcXVlc3Rpb24vYW5zd2VyIGJveCB3aXRoIHRvZ2dsZVxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICogICAgICAgICAgcXVlc3Rpb246ICdXaGF0cyB5b3VyIG5hbWU/JyxcbiAqICAgICAgICAgIGFuc3dlcjogJ0RhcnRoIFZhZGVyLidcbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nUUEgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dBbnN3ZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQucWEtY2FyZC51LW1hcmdpbmJvdHRvbS0yMC51LXJhZGl1cy5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zaG93QW5zd2VyLnRvZ2dsZVxuICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBhcmdzLnF1ZXN0aW9uKSxcbiAgICAgICAgICAgICAgICBjdHJsLnNob3dBbnN3ZXIoKSA/IG0oJ3AudS1tYXJnaW50b3AtMjAuZm9udHNpemUtc21hbGwnLCBhcmdzLmFuc3dlcikgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nU2lnbnVwID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgICAgICBlbWFpbCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgudmFsaWRhdGVFbWFpbChlbWFpbCgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvckNsYXNzZXMgPSAoIWN0cmwuZXJyb3IpID8gJy5wb3NpdGl2ZS5lcnJvcicgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCdmb3JtLnctZm9ybVtpZD1cImVtYWlsLWZvcm1cIl1bbWV0aG9kPVwicG9zdFwiXVthY3Rpb249XCInICsgYXJncy5idWlsZGVyLmN1c3RvbUFjdGlvbiArICdcIl0nLHtcbiAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLmVtYWlsKClcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2FyZCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgICAgICAgY2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICAgICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBvcE5vdGlmaWNhdGlvbiA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5Tm90aWZpY2F0aW9uID0gaC50b2dnbGVQcm9wKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Tm90aWZpY2F0aW9uOiBkaXNwbGF5Tm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24oKSA/IG0oJy5mbGFzaC53LWNsZWFyZml4LmNhcmQuY2FyZC1ub3RpZmljYXRpb24udS1yYWRpdXMuemluZGV4LTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWNsb3NlW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAveC5wbmdcIl1bd2lkdGg9XCIxMlwiXVthbHQ9XCJmZWNoYXJcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbi50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBhcmdzLm1lc3NhZ2UpXG4gICAgICAgICAgICBdKSA6IG0oJ3NwYW4nKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKChtLCBjLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgb25saW5lRGF5cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBtb21lbnQocHJvamVjdC56b25lX29ubGluZV9kYXRlKS5kaWZmKG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24oZGlmZik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1NYXRoLmNlaWwoZHVyYXRpb24uYXNEYXlzKCkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZnVuZGluZ1BlcmlvZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByb2plY3QuaXNfcHVibGlzaGVkICYmIGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSkgPyBtKCcuZnVuZGluZy1wZXJpb2QnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYCR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX29ubGluZV9kYXRlKX0gLSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gKCR7b25saW5lRGF5cygpfSBkaWFzKWApXG4gICAgICAgICAgICAgICAgXSkgOiAnJztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuYnVkZ2V0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnT3LDp2FtZW50bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgIV8uaXNFbXB0eShhcmdzLnJld2FyZERldGFpbHMoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnUmVjb21wZW5zYXMnKSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSwgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdTdWdlc3TDtWVzwqBkZcKgYXBvaW8nKSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICAgICAgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2FyZCA9ICgobSwgaCwgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuY2FyZCcpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSksXG4gICAgICAgICAgICAgICAgbGluayA9ICcvJyArIHByb2plY3QucGVybWFsaW5rICsgKGFyZ3MucmVmID8gJz9yZWY9JyArIGFyZ3MucmVmIDogJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBhLmNhcmQtcHJvamVjdC10aHVtYltocmVmPVwiJHtsaW5rfVwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7cHJvamVjdC5wcm9qZWN0X2ltZ30pYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBgJHtJMThuLnQoJ2J5JywgSTE4blNjb3BlKCkpfSAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZSA/IHByb2plY3QuY2l0eV9uYW1lIDogJyd9LCAke3Byb2plY3Quc3RhdGVfYWNyb255bSA/IHByb2plY3Quc3RhdGVfYWNyb255bSA6ICcnfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgLmNhcmQtcHJvamVjdC1tZXRlci4ke3Byb2plY3Quc3RhdGV9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uY29udGFpbnMoWydzdWNjZXNzZnVsJywgJ2ZhaWxlZCcsICd3YWl0aW50X2Z1bmRzJ10sIHByb2plY3Quc3RhdGUpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgSTE4bi50KCdkaXNwbGF5X3N0YXR1cy4nICsgcHJvamVjdC5zdGF0ZSwgSTE4blNjb3BlKCkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0JywgcHJvamVjdC5leHBpcmVzX2F0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH0gJHtyZW1haW5pbmdUZXh0T2JqLnVuaXR9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgKHJlbWFpbmluZ1RleHRPYmoudG90YWwgPiAxKSA/ICdSZXN0YW50ZXMnIDogJ1Jlc3RhbnRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodCcsIFsnUHJhem8gZW0nLG0oJ2JyJyksJ2FiZXJ0byddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb21tZW50cyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbW1lbnRzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge3JldHVybjt9XG4gICAgICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge2xvYWRDb21tZW50czogbG9hZENvbW1lbnRzfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcuZmItY29tbWVudHNbZGF0YS1ocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bZGF0YS1udW0tcG9zdHM9NTBdW2RhdGEtd2lkdGg9XCI2MTBcIl0nLCB7Y29uZmlnOiBjdHJsLmxvYWRDb21tZW50cygpfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfcGF5bWVudDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmcgPSAod2FpdGluZyA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWTS53YWl0aW5nX3BheW1lbnQod2FpdGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpLndhaXRpbmdfcGF5bWVudChmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbGlzdFZNOiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmc6IHRvZ2dsZVdhaXRpbmdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk07XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3RfY29udHJpYnV0aW9ucy5jb250ZW50LnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgICAgIChhcmdzLnByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtjaGVja2VkPVwiY2hlY2tlZFwiXVtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt0eXBlPVwicmFkaW9cIl1bdmFsdWU9XCJhdmFpbGFibGVfdG9fY291bnRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXScsICdDb25maXJtYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdW3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3ZhbHVlPVwid2FpdGluZ19jb25maXJtYXRpb25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZyh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsICdQZW5kZW50ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucycsIF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudGh1bWIudS1sZWZ0LnUtcm91bmRbc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwpID8gY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCA6ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJykgKyAnKTsgYmFja2dyb3VuZC1zaXplOiBjb250YWluO1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi1kYXJrW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi51c2VyX25hbWUpLCAoY29udHJpYnV0aW9uLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLCAoY29udHJpYnV0aW9uLmFub255bW91cyA/IFttLnRydXN0KCcmbmJzcDstJm5ic3A7JyksIG0oJ3N0cm9uZycsICdBcG9pYWRvciBhbsO0bmltbycpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVksIEhIOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgWyFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSBjb21wb25lbnRcbiAqIGJ1aWxkIGRhc2hib2FyZCBwcm9qZWN0IG1lbnUgZm9yIHByb2plY3Qgb3duZXJzXG4gKiBhbmQgYWRtaW4uXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAqICAgICBwcm9qZWN0OiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXNoYm9hcmRNZW51ID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXYgPSBoLnRvZ2dsZVByb3AoJ2JvZHktcHJvamVjdCBvcGVuJywgJ2JvZHktcHJvamVjdCBjbG9zZWQnKTtcblxuICAgICAgICAgICAgaWYgKCFhcmdzLnByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHksXG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlOiBlZGl0TGlua3NUb2dnbGUsXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdjogYm9keVRvZ2dsZUZvck5hdlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0Um91dGUgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgICAgZWRpdFJvdXRlID0gcHJvamVjdFJvdXRlICsgJy9lZGl0JyxcbiAgICAgICAgICAgICAgICAgIGVkaXRMaW5rQ2xhc3MgPSAnZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICdpbmRlbnQnIDogJycpO1xuICAgICAgICAgICAgbGV0IG9wdGlvbmFsT3B0ID0gKHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnID8gbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJyAob3BjaW9uYWwpJykgOiAnJyk7XG5cbiAgICAgICAgICAgIGN0cmwuYm9keS5jbGFzc05hbWUgPSBjdHJsLmJvZHlUb2dnbGVGb3JOYXYoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LW5hdicsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1uYXYtd3JhcHBlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbmF2Lnctc2VjdGlvbi5kYXNoYm9hcmQtbmF2LnNpZGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmsudy1pbmxpbmUtYmxvY2suZGFzaGJvYXJkLXByb2plY3QtbmFtZVtocmVmPVwiJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcvJyArIHByb2plY3QucGVybWFsaW5rIDogZWRpdFJvdXRlICsgJyNwcmV2aWV3JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LWRhc2hib2FyZFtzcmM9XCInICsgKF8uaXNOdWxsKHByb2plY3QubGFyZ2VfaW1hZ2UpID8gJy9hc3NldHMvdGh1bWItcHJvamVjdC5wbmcnIDogcHJvamVjdC5sYXJnZV9pbWFnZSkgKyAnXCJdW3dpZHRoPVwiMTE0XCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS5saW5laGVpZ2h0LXRpZ2h0LmZvbnRzaXplLXNtYWxsJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudS1tYXJnaW50b3AtMTBbc3JjPVwiL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC9iYWRnZS0ke3Byb2plY3QubW9kZX0taC5wbmdcIl1bd2lkdGg9ODBdYClcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjaW5mby1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9ob21lX2xpbmtbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKGgubG9jYXRpb25BY3Rpb25NYXRjaCgnaW5zaWdodHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCInICsgcHJvamVjdFJvdXRlICsgJy9pbnNpZ2h0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXItY2hhcnQuZmEtbGcuZmEtZncnKSwgJyBNaW5oYSBDYW1wYW5oYSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEuZmEtdGFibGUuZmEtbGcuZmEtZncnKSwgJyBSZWxhdMOzcmlvcyBkZSBhcG9pb3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQudS1tYXJnaW5ib3R0b20tMzBbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Bvc3RzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksICcgTm92aWRhZGVzICcsIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1wZW5jaWwuZmEtZncuZmEtbGcnKSwgJyBFZGl0YXIgcHJvamV0bydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSksIChjdHJsLmVkaXRMaW5rc1RvZ2dsZSgpID8gbSgnI2VkaXQtbWVudS1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNiYXNpY3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYmFzaWNzJyArICdcIl0nLCAnQsOhc2ljbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSA9PT0gJ2FvbicgPyAnTWV0YSBlIHByYXpvJyA6ICdGaW5hbmNpYW1lbnRvJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGVzY3JpcHRpb25fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZGVzY3JpcHRpb24nICsgJ1wiXScsICdEZXNjcmnDp8OjbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSN2aWRlb19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN2aWRlbycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdWw61kZW8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnT3LDp2FtZW50bycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjY2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNjYXJkJyArICdcIl0nLCAnQ2FyZCBkbyBwcm9qZXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXdhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcmV3YXJkJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tcGVuc2FzJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9hYm91dF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX2Fib3V0JyArICdcIl0nLCAnU29icmUgdm9jw6onKSwgKChwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnKSB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9zZXR0aW5nc19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX3NldHRpbmdzJyArICdcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwcmV2aWV3JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZncuZmEtZXllLmZhLWxnJyksICcgUHJldmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsICdFbnZpYXInKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3B1Ymxpc2hcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUHVibGljYXInLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNwcmV2aWV3XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tc2Vjb25kYXJ5LWRhcmtbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgJ0luaWNpYXIgcmV0YSBmaW5hbCcpIDogJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLmJ0bi1kYXNoYm9hcmQgaHJlZj1cImpzOnZvaWQoMCk7XCInLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuYm9keVRvZ2dsZUZvck5hdi50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFycy5mYS1sZycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgY29tcG9uZW50XG4gKiBBIGdyYXBoIGJ1aWxkZXIgaW50ZXJmYWNlIHRvIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gKiAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICogICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gKiAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCdcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgPSAoKG0sIENoYXJ0LCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gXy5maXJzdChhcmdzLmNvbGxlY3Rpb24oKSksXG4gICAgICAgICAgICAgICAgICBzb3VyY2UgPSAoIV8uaXNVbmRlZmluZWQocmVzb3VyY2UpID8gcmVzb3VyY2Uuc291cmNlIDogW10pLFxuXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtW2FyZ3MuZGF0YUtleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0ID0gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJncy54QXhpcyhpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlIGNvbXBvbmVudFxuICogQSB0YWJsZSBpbnRlcmZhY2UgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEl0IHRha2VzIGFuIGFycmF5IGFuZCBhIGxhYmxlIGFzIGl0J3Mgc291cmNlcy5cbiAqIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSBpcyB0aGUgaGVhZGVyIGRlc2NyaXB0b3IgYW5kIHRoZSByZXN0IG9mIHRoZW0gYXJlIHJvdyBkYXRhLlxuICogUm93cyBtYXkgcmV0dXJuIGEgc3RyaW5nIG9yIGFuIGFycmF5IGFuZCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyBhIHJvdyBvdXRwdXQuXG4gKiBBbGwgdGFibGUgcm93cyBhcmUgc29ydGFibGUgYnkgZGVmYXVsdC4gSWYgeW91IHdhbnQgdG8gdXNlIGEgY3VzdG9tIHZhbHVlIGFzIHNvcnQgcGFyYW1ldGVyXG4gKiB5b3UgbWF5IHNldCBhIDJEIGFycmF5IGFzIHJvdy4gSW4gdGhpcyBjYXNlLCB0aGUgZmlyc3QgYXJyYXkgdmFsdWUgd2lsbCBiZSB0aGUgY3VzdG9tIHZhbHVlXG4gKiB3aGlsZSB0aGUgb3RoZXIgd2lsbCBiZSB0aGUgYWN0dWFsIG91dHB1dC5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAqICAgICAgbGFiZWw6ICdUYWJsZSBsYWJlbCcsXG4gKiAgICAgIHRhYmxlOiBbXG4gKiAgICAgICAgICBbJ2NvbCBoZWFkZXIgMScsICdjb2wgaGVhZGVyIDInXSxcbiAqICAgICAgICAgIFsndmFsdWUgMXgxJywgWzMsICd2YWx1ZSAxeDInXV0sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDJ4MScsIFsxLCAndmFsdWUgMngyJ11dIC8vV2UgYXJlIHVzaW5nIGEgY3VzdG9tIGNvbXBhcmF0b3IgdHdvIGNvbCAyIHZhbHVlc1xuICogICAgICBdLFxuICogICAgICAvL0FsbG93cyB5b3UgdG8gc2V0IGEgc3BlY2lmaWMgY29sdW1uIHRvIGJlIG9yZGVyZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgLy9JZiBubyB2YWx1ZSBpcyBzZXQsIHRoZSBmaXJzdCByb3cgd2lsbCBiZSB0aGUgZGVmYXVsdCBvbmUgdG8gYmUgb3JkZXJlZC5cbiAqICAgICAgLy9OZWdhdGl2ZSB2YWx1ZXMgbWVhbiB0aGF0IHRoZSBvcmRlciBzaG91bGQgYmUgcmV2ZXJ0ZWRcbiAqICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTNcbiAqICB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHRhYmxlID0gbS5wcm9wKGFyZ3MudGFibGUpLFxuICAgICAgICAgICAgICAgIHNvcnRJbmRleCA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBzb3J0SW5kZXgoKSxcbiAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgeCA9IChfLmlzQXJyYXkoYVtpZHhdKSAmJiBhW2lkeF0ubGVuZ3RoID4gMSkgPyBhW2lkeF1bMF0gOiBhW2lkeF0sXG4gICAgICAgICAgICAgICAgICAgIHkgPSAoXy5pc0FycmF5KGJbaWR4XSkgJiYgYltpZHhdLmxlbmd0aCA+IDEpID8gYltpZHhdWzBdIDogYltpZHhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHggPCB5KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeSA8IHgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzb3J0VGFibGUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QodGFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgIGJvZHk7XG4gICAgICAgICAgICAgICAgaWYgKHNvcnRJbmRleCgpID09PSBpZHgpe1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzb3J0SW5kZXgoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhYmxlKF8udW5pb24oW2hlYWRlcl0sYm9keSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc29ydFRhYmxlKE1hdGguYWJzKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCkgfHwgMCk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmRlZmF1bHRTb3J0SW5kZXggPCAwKXtcbiAgICAgICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICAgICAgc29ydFRhYmxlOiBzb3J0VGFibGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdChjdHJsLnRhYmxlKCkpLFxuICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QoY3RybC50YWJsZSgpKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoaGVhZGVyLCAoaGVhZGluZywgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2hlYWRpbmd9IGAsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGJvZHksIChyb3dEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnRhYmxlLXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cgPSAoXy5pc0FycmF5KHJvdykgJiYgcm93Lmxlbmd0aCA+IDEpID8gcm93WzFdIDogcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgcm93KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLXByb2R1Y3QuJyArIHByb2plY3QubW9kZSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wYWdlLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXIuZm9udHdlaWdodC1zZW1pYm9sZC5wcm9qZWN0LW5hbWVbaXRlbXByb3A9XCJuYW1lXCJdJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BvciAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnByb2plY3QtaGlnaGxpZ2h0JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGlnaGxpZ2h0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGlnaGxpZ2h0JywgW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlbycsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdtaW4taGVpZ2h0OiAyNDBweDsnXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIicgKyBwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3Qub3JpZ2luYWxfaW1hZ2UgKyAnKTsnXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWJsdXJiJywgcHJvamVjdC5oZWFkbGluZSksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzTnVsbChwcm9qZWN0LmFkZHJlc3MpID9cbiAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodC51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiL3B0L2V4cGxvcmU/cGdfc2VhcmNoPSR7cHJvamVjdC5hZGRyZXNzLnN0YXRlX2Fjcm9ueW19XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlcicpLCBgICR7cHJvamVjdC5hZGRyZXNzLmNpdHl9LCAke3Byb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0W2hyZWY9XCIvcHQvZXhwbG9yZSNieV9jYXRlZ29yeV9pZC8ke3Byb2plY3QuY2F0ZWdvcnlfaWR9XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS10YWcnKSwgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jYXRlZ29yeV9uYW1lXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jc2hhcmUtYm94LmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgfSwgJ0NvbXBhcnRpbGhhcicpLCAoY3RybC5kaXNwbGF5U2hhcmVCb3goKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdFNoYXJlQm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVNoYXJlQm94OiBjdHJsLmRpc3BsYXlTaGFyZUJveFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RNYWluID0gKChtLCBjLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZGlzcGxheVRhYkNvbnRlbnQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNfb3B0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFicyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jld2FyZHMnOiBtKCcudy1jb2wudy1jb2wtMTInLCBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29tbWVudHMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzWycjYWJvdXQnXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgbS5yZWRyYXcsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudDogZGlzcGxheVRhYkNvbnRlbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmRpc3BsYXlUYWJDb250ZW50KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0TW9kZSBjb21wb25lbnRcbiAqIEEgc2ltcGxlIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgYmFkZ2Ugd2l0aCB0aGUgY3VycmVudCBwcm9qZWN0IG1vZGVcbiAqIHRvZ2V0aGVyIHdpdGggYSBkZXNjcmlwdGlvbiBvZiB0aGUgbW9kZSwgc2hvd24gaW5zaWRlIGEgdG9vbHRpcC5cbiAqIEl0IHJlY2VpdmVzIGEgcHJvamVjdCBhcyByZXNvdXJjZVxuICpcbiAqIEV4YW1wbGU6XG4gKiAgdmlldzoge1xuICogICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0TW9kZSwge3Byb2plY3Q6IHByb2plY3R9KVxuICogIH1cbiAqL1xud2luZG93LmMuUHJvamVjdE1vZGUgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBtb2RlID0gcHJvamVjdC5tb2RlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBUZXh0ID0gKG1vZGUgPT09ICdhb24nKSA/IGBTb21lbnRlIHJlY2ViZXLDoSBvcyByZWN1cnNvcyBzZSBhdGluZ2lyIG91IHVsdHJhcGFzc2FyIGEgbWV0YSBhdMOpIG8gZGlhICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQsICdERC9NTS9ZWVlZJyl9LmAgOiAnTyByZWFsaXphZG9yIHJlY2ViZXLDoSB0b2RvcyBvcyByZWN1cnNvcyBxdWFuZG8gZW5jZXJyYXIgYSBjYW1wYW5oYSwgbWVzbW8gcXVlIG7Do28gdGVuaGEgYXRpbmdpZG8gZXN0YSBtZXRhLic7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbW9kZTogbW9kZSxcbiAgICAgICAgICAgICAgICB0b29sdGlwVGV4dDogdG9vbHRpcFRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbW9kZSA9IGN0cmwubW9kZSxcbiAgICAgICAgICAgICAgICBtb2RlSW1nU3JjID0gKG1vZGUgPT09ICdhb24nKSA/ICcvYXNzZXRzL2Fvbi1iYWRnZS5wbmcnIDogJy9hc3NldHMvZmxleC1iYWRnZS5wbmcnLFxuICAgICAgICAgICAgICAgIG1vZGVUaXRsZSA9IChtb2RlID09PSAnYW9uJykgPyAnQ2FtcGFuaGEgVHVkby1vdS1uYWRhICcgOiAnQ2FtcGFuaGEgRmxleMOtdmVsICcsXG4gICAgICAgICAgICAgICAgZ29hbCA9IChfLmlzTnVsbChhcmdzLnByb2plY3QuZ29hbCkgPyAnbsOjbyBkZWZpbmlkYScgOiBoLmZvcm1hdE51bWJlcihhcmdzLnByb2plY3QuZ29hbCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC50b29sdGlwVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCMke21vZGV9Lnctcm93YCwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbWdbc3JjPVwiJHttb2RlSW1nU3JjfVwiXVt3aWR0aD0nMzAnXWApXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTEwLnctY29sLXRpbnktMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTWV0YSBSJCAnICsgZ29hbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWlubGluZS1ibG9jay5mb250c2l6ZS1zbWFsbGVzdC5fdy1pbmxpbmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlVGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwKCdzcGFuLnctaW5saW5lLWJsb2NrLnRvb2x0aXAtd3JhcHBlci5mYS5mYS1xdWVzdGlvbi1jaXJjbGUuZm9udGNvbG9yLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFBvc3RzID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0UG9zdERldGFpbCksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXBvc3RzLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5pc0VtcHR5KGxpc3QuY29sbGVjdGlvbigpKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwLnUtbWFyZ2ludG9wLTIwJywgJ1RvZGEgbm92aWRhZGUgcHVibGljYWRhIG5vIENhdGFyc2Ugw6kgZW52aWFkYSBkaXJldGFtZW50ZSBwYXJhIG8gZW1haWwgZGUgcXVlbSBqw6EgYXBvaW91IHNldSBwcm9qZXRvIGUgdGFtYsOpbSBmaWNhIGRpc3BvbsOtdmVsIHBhcmEgdmlzdWFsaXphw6fDo28gbm8gc2l0ZS4gVm9jw6ogcG9kZSBvcHRhciBwb3IgZGVpeMOhLWxhIHDDumJsaWNhLCBvdSB2aXPDrXZlbCBzb21lbnRlIHBhcmEgc2V1cyBhcG9pYWRvcmVzIGFxdWkgbmVzdGEgYWJhLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1lZGl0LmJ0bi1zbWFsbFtocmVmPScvcHQvcHJvamVjdHMvJHtwcm9qZWN0LmlkfS9lZGl0I3Bvc3RzJ11gLCAnRXNjcmV2ZXIgbm92aWRhZGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucG9zdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS02MCAudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udGNvbG9yLXNlY29uZGFyeS51LXRleHQtY2VudGVyJywgaC5tb21lbnRpZnkocG9zdC5jcmVhdGVkX2F0KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSwgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXJlbWluZGVyLWNvdW50LmNhcmQudS1yYWRpdXMudS10ZXh0LWNlbnRlci5tZWRpdW0udS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8nLCBwcm9qZWN0LnJlbWluZGVyX2NvdW50KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgY2xpY2thYmxlIHByb2plY3QgcmVtaW5kZXIgZWxlbWVudC5cbiAqIFRoZSBjb21wb25lbnQgY2FuIGJlIG9mIHR3byB0eXBlczogYSAnbGluaycgb3IgYSAnYnV0dG9uJ1xuICpcbiAqIEV4YW1wbGU6XG4gKiAgdmlldzoge1xuICogICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJ30pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgPSAoKG0sIG1vZGVscywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdG9yZVJlbWluZGVyTmFtZSA9ICdyZW1pbmRfJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoLmdldFVzZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5zdG9yZUFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubmF2aWdhdGVUb0RldmlzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2FkZXJPcHRzID0gcHJvamVjdC5pbl9yZW1pbmRlciA/IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIuZGVsZXRlT3B0aW9ucyhmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpIDogbW9kZWxzLnByb2plY3RSZW1pbmRlci5wb3N0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiBwcm9qZWN0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGxvYWRlck9wdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5pbl9yZW1pbmRlciA9ICFwcm9qZWN0LmluX3JlbWluZGVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5pbl9yZW1pbmRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5jYWxsU3RvcmVkQWN0aW9uKHN0b3JlUmVtaW5kZXJOYW1lLCBzdWJtaXRSZW1pbmRlcik7XG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKHByb2plY3QuaWQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXI6IHN1Ym1pdFJlbWluZGVyLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbjogcG9wTm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFpbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJycgOiAnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJ3ctYnV0dG9uIGJ0biBidG4tdGVyY2lhcnkgYnRuLW5vLWJvcmRlcicgOiAnYnRuLWxpbmsgbGluay1oaWRkZW4gZm9udHNpemUtc21hbGwnLFxuICAgICAgICAgICAgICAgIGhpZGVUZXh0T25Nb2JpbGUgPSBhcmdzLmhpZGVUZXh0T25Nb2JpbGUgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCNwcm9qZWN0LXJlbWluZGVyJHttYWluQ2xhc3N9YCwgW1xuICAgICAgICAgICAgICAgIG0oYGJ1dHRvbltjbGFzcz1cIiR7YnV0dG9uQ2xhc3N9ICR7KHByb2plY3QuaW5fcmVtaW5kZXIgPyAnbGluay1oaWRkZW4tc3VjY2VzcycgOiAnZm9udGNvbG9yLXNlY29uZGFyeScpfSBmb250d2VpZ2h0LXNlbWlib2xkXCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnN1Ym1pdFJlbWluZGVyXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkgPyAnYWd1YXJkZSAuLi4nIDogbSgnc3Bhbi5mYS5mYS1jbG9jay1vJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShgc3BhbiR7aGlkZVRleHRPbk1vYmlsZSA/ICcudy1oaWRkZW4tbWVkaXVtJyA6ICcnfWAsIHByb2plY3QuaW5fcmVtaW5kZXIgPyAnIExlbWJyZXRlIGF0aXZvJyA6ICcgTGVtYnJhci1tZScpXG4gICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgIF0pLCAoY3RybC5wb3BOb3RpZmljYXRpb24oKSA/IG0uY29tcG9uZW50KGMuUG9wTm90aWZpY2F0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdPayEgVmFtb3MgdGUgbWFuZGFyIHVtIGxlbWJyZXRlIHBvciBlLW1haWwgNDggaG9yYXMgYW50ZXMgZG8gZmltIGRhIGNhbXBhbmhhJ1xuICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmV3YXJkTGlzdCA9ICgobSwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICAvL0ZJWE1FOiBNSVNTSU5HIEFESlVTVFNcbiAgICAgICAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNyZXdhcmRzLnUtbWFyZ2luYm90dG9tLTMwJywgXy5tYXAoYXJncy5yZXdhcmREZXRhaWxzKCksIChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2FbY2xhc3M9XCInICsgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/ICdjYXJkLWdvbmUnIDogJ2NhcmQtcmV3YXJkICcgKyAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ2NsaWNrYWJsZScgOiAnJykpICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyAmJiAhaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA6ICdqczp2b2lkKDApOycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBoLnBsdXJhbGl6ZShyZXdhcmQucGFpZF9jb3VudCwgJyBhcG9pbycsICcgYXBvaW9zJykpLCAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wZW5kaW5nLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLnBsdXJhbGl6ZShyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LCAnIGFwb2lvIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28nLCAnIGFwb2lvcyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWdvbmUuZm9udHNpemUtc21hbGxlcicsICdFc2dvdGFkYScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtYXR0ZW50aW9uLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtYm9sZCcsICdMaW1pdGFkYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAoJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW50b3AtMjAnLCBtLnRydXN0KGguc2ltcGxlRm9ybWF0KHJld2FyZC5kZXNjcmlwdGlvbikpKSwgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2InLCAnRXN0aW1hdGl2YSBkZSBFbnRyZWdhOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm1vbWVudGlmeShyZXdhcmQuZGVsaXZlcl9hdCwgJ01NTS9ZWVlZJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1ob3ZlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Um93ID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBhcmdzLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgcmVmID0gYXJncy5yZWYsXG4gICAgICAgICAgICAgICAgd3JhcHBlciA9IGFyZ3Mud3JhcHBlciB8fCAnLnctc2VjdGlvbi5zZWN0aW9uLnUtbWFyZ2luYm90dG9tLTQwJztcbiAgICAgICAgICAgIHJldHVybiBtKHdyYXBwZXIsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLnRpdGxlKSB8fCAhXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLmhhc2gpKSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC1sb29zZXInLCBjb2xsZWN0aW9uLnRpdGxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgKGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCkgPyBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaGFyZUJveCA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVtYmVkOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5wb3Atc2hhcmUnLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OiBibG9jazsnXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZS51LXJpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdGZWNoYXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtZmFjZWJvb2sudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjE1MHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS92Mi4wL3BsdWdpbnMvc2hhcmVfYnV0dG9uLnBocD9hcHBfaWQ9MTczNzQ3MDQyNjYxNDkxJmNoYW5uZWw9aHR0cHMlM0ElMkYlMkZzLXN0YXRpYy5hay5mYWNlYm9vay5jb20lMkZjb25uZWN0JTJGeGRfYXJiaXRlciUyRjQ0T3dLNzR1MEllLmpzJTNGdmVyc2lvbiUzRDQxJTIzY2IlM0RmN2Q5YjkwMGMlMjZkb21haW4lM0R3d3cuY2F0YXJzZS5tZSUyNm9yaWdpbiUzRGh0dHBzJTI1M0ElMjUyRiUyNTJGd3d3LmNhdGFyc2UubWUlMjUyRmY0YjNhZDBjOCUyNnJlbGF0aW9uJTNEcGFyZW50LnBhcmVudCZjb250YWluZXJfd2lkdGg9MCZocmVmPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyUzRnJlZiUzRGZhY2Vib29rJmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPXB0X0JSJnNkaz1qb2V5XCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9XCJ0cnVlXCJdW3dpZHRoPVwiMTIwcHhcIl1baGVpZ2h0PVwiMjJweFwiXVtmcmFtZWJvcmRlcj1cIjBcIl1bc2Nyb2xsaW5nPVwibm9cIl1bc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzL3R3ZWV0X2J1dHRvbi44ZDAwN2RkZmMxODRlNjc3NmJlNzZmZTllNWU1MmQ2OS5lbi5odG1sI189MTQ0MjQyNTk4NDkzNiZjb3VudD1ob3Jpem9udGFsJmRudD1mYWxzZSZpZD10d2l0dGVyLXdpZGdldC0xJmxhbmc9ZW4mb3JpZ2luYWxfcmVmZXJlcj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICcmc2l6ZT1tJnRleHQ9Q29uZmlyYSUyMG8lMjBwcm9qZXRvJTIwJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyUyMG5vJTIwJTQwY2F0YXJzZSZ0eXBlPXNoYXJlJnVybD1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0R0d2l0dGVyJnZpYT1jYXRhcnNlXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLXNtYWxsLndpZGdldC1lbWJlZC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlFbWJlZC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnPCBlbWJlZCA+JyksIChjdHJsLmRpc3BsYXlFbWJlZCgpID8gbSgnLmVtYmVkLWV4cGFuZGVkLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0W3R5cGU9XCJ0ZXh0XCJdW3ZhbHVlPVwiPGlmcmFtZSBmcmFtZWJvcmRlcj1cIjBcIiBoZWlnaHQ9XCIzMTRweFwiIHNyYz1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtZW1iZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0LmlkICsgJy9lbWJlZFwiXVt3aWR0aD1cIjMwMHB4XCJdW3Njcm9sbGluZz1cIm5vXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi1mYi51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGFyZ3MucHJvamVjdC5uYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZmFjZWJvb2snKSwgJyBDb21wYXJ0aWxoZSdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9QWNhYmVpIGRlIGFwb2lhciBvIHByb2pldG8gJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyBodHRzOi8vd3d3LmNhdGFyc2UubWUvJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnP3JlZj10d2l0dGVyclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCAnIFR3ZWV0J1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoKG0sIGgsIGMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5wcm9qZWN0X3NpZGViYXInKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzcyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbmltYXRpb24sIHByb2dyZXNzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRJbmNyZW1lbnQgPSBwcm9qZWN0LnBsZWRnZWQgLyBwcm9qZWN0LnByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0luY3JlbWVudCA9IHByb2plY3QudG90YWxfY29udHJpYnV0b3JzIC8gcHJvamVjdC5wcm9ncmVzcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3NCYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxlZGdlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyaWJ1dG9ycycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IHNldEludGVydmFsKGluY3JlbWVudFByb2dyZXNzLCAyOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRQcm9ncmVzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzIDw9IHBhcnNlSW50KHByb2plY3QucHJvZ3Jlc3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IGAke3Byb2dyZXNzfSVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsLmlubmVyVGV4dCA9IGBSJCAke2guZm9ybWF0TnVtYmVyKHBsZWRnZWQpfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNFbC5pbm5lclRleHQgPSBgJHtwYXJzZUludChjb250cmlidXRvcnMpfSBwZXNzb2FzYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmlubmVyVGV4dCA9IGAke3Byb2dyZXNzfSVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IHBsZWRnZWQgKyBwbGVkZ2VkSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gY29udHJpYnV0b3JzICsgY29udHJpYnV0b3JzSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9ncmVzcyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxODAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ2NhcmQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogJ2NhcmQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdjYXJkLWRhcmsnXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gPyAnY2FyZCB1LXJhZGl1cyB6aW5kZXgtMTAgJyArIHN0YXRlc1twcm9qZWN0LnN0YXRlXSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmFwcHJvdmVkJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29ubGluZSc6IGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSA/IEkxOG4udCgnZGlzcGxheV9zdGF0dXMub25saW5lJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9KSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmYWlsZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmZhaWxlZCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCBnb2FsOiBwcm9qZWN0LmdvYWx9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVqZWN0ZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLnJlamVjdGVkJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5pbl9hbmFseXNpcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5zdWNjZXNzZnVsJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMud2FpdGluZ19mdW5kcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuZHJhZnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZVByb2dyZXNzOiBhbmltYXRlUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzczogZGlzcGxheUNhcmRDbGFzcyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZWxhcHNlZCA9IHByb2plY3QuZWxhcHNlZF90aW1lLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHByb2plY3QucmVtYWluaW5nX3RpbWU7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1zaWRlYmFyLmFzaWRlJywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbm5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLWluZm8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGxlZGdlZC5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnY29udHJpYnV0b3JzX2NhbGwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuI2NvbnRyaWJ1dG9ycy5mb250d2VpZ2h0LXNlbWlib2xkJywgSTE4bi50KCdjb250cmlidXRvcnNfY291bnQnLCBJMThuU2NvcGUoe2NvdW50OiBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9yc30pKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuZXhwaXJlc19hdCkgPyAnIGVtICcgKyBJMThuLnQoJ2RhdGV0aW1lLmRpc3RhbmNlX2luX3dvcmRzLnhfJyArIGVsYXBzZWQudW5pdCwge2NvdW50OiBlbGFwc2VkLnRvdGFsfSwgSTE4blNjb3BlKCkpIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwcm9ncmVzc0Jhci5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7cHJvamVjdC5wcm9ncmVzc30lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXInLCBgJHtwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1yaWdodC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LXRpZ2h0ZXInLCByZW1haW5pbmcudG90YWwgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVtYWluaW5nLnRvdGFsKSwgSTE4bi50KCdyZW1haW5pbmdfdGltZS4nICsgcmVtYWluaW5nLnVuaXQsIEkxOG5TY29wZSh7Y291bnQ6IHJlbWFpbmluZy50b3RhbH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgLCAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gbSgnYSNjb250cmlidXRlX3Byb2plY3RfZm9ybS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3XCJdJywgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpIDogJycpLCAoKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucykgPyBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJ1xuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnVzZXItYycsIG0uY29tcG9uZW50KGMuUHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zIGNvbXBvbmVudFxuICogQSBQcm9qZWN0LXNob3cgcGFnZSBoZWxwZXIgdG8gc2hvdyBzdWdnZXN0ZWQgYW1vdW50cyBvZiBjb250cmlidXRpb25zXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgIC4uLlxuICogICBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgIC4uLlxuICogfVxuICovXG5cbndpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uVXJsID0gKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgL3Byb2plY3RzLyR7cHJvamVjdC5wcm9qZWN0X2lkfS9jb250cmlidXRpb25zL25ldz9hbW91bnQ9JHthbW91bnR9YDtcbiAgICAgICAgICAgIH0sIHN1Z2dlc3RlZFZhbHVlcyA9IFsxMCwgMjUsIDUwLCAxMDBdO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3N1Z2dlc3Rpb25zJywgXy5tYXAoc3VnZ2VzdGVkVmFsdWVzLCAoYW1vdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oYGFbaHJlZj1cIiR7c3VnZ2VzdGlvblVybChhbW91bnQpfVwiXS5jYXJkLXJld2FyZC5jYXJkLWJpZy5jYXJkLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMGAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGBSJMKgJHthbW91bnR9YClcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RUYWJzID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBpc0ZpeGVkID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gbS5wcm9wKC0xKTtcblxuICAgICAgICAgICAgY29uc3QgZml4T25TY3JvbGwgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmlld3BvcnRPZmZzZXQgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LnNjcm9sbFkgPD0gb3JpZ2luYWxQb3NpdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC50b3AgPCAwIHx8ICh3aW5kb3cuc2Nyb2xsWSA+IG9yaWdpbmFsUG9zaXRpb24oKSAmJiBvcmlnaW5hbFBvc2l0aW9uKCkgPiAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpeGVkKCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24od2luZG93LnNjcm9sbFkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBuYXZEaXNwbGF5ID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpeE5hdkJhciA9IGZpeE9uU2Nyb2xsKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZpeE5hdkJhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYXZEaXNwbGF5OiBuYXZEaXNwbGF5LFxuICAgICAgICAgICAgICAgIGlzRml4ZWQ6IGlzRml4ZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHJld2FyZHMgPSBhcmdzLnJld2FyZERldGFpbHM7XG5cbiAgICAgICAgICAgIGxldCBtYWluQ2xhc3MgPSAoIWN0cmwuaXNGaXhlZCgpIHx8IHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4pID8gJy53LXNlY3Rpb24ucHJvamVjdC1uYXYnIDogJy53LXNlY3Rpb24ucHJvamVjdC1uYXYucHJvamVjdC1uYXYtZml4ZWQnO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnbmF2LXdyYXBwZXInLFtcbiAgICAgICAgICAgICAgICBtKG1haW5DbGFzcywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwubmF2RGlzcGxheVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgWyFfLmlzRW1wdHkocmV3YXJkcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnUmVjb21wZW5zYXMnKSA6IG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25fc3VnZ2VzdGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1ZhbG9yZXMgU3VnZXJpZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJhYm91dC1saW5rXCJdW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdTb2JyZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicG9zdHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcG9zdHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcG9zdHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdmlkYWRlcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QucG9zdHNfY291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29udHJpYnV0aW9ucy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQXBvaW9zICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29tbWVudHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29tbWVudHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29tbWVudHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWVudMOhcmlvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbmF2LWJhY2stYnV0dG9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtbWVkaXVtLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG5baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFywqDigI1lc3RlwqBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtbWVkaXVtLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJywgaGlkZVRleHRPbk1vYmlsZTogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgY3RybC5pc0ZpeGVkKCkgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5saW5laGVpZ2h0LXRpZ2h0W2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMsICcgYXBvaWFkbycsICcgYXBvaWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctaGlkZGVuLXRpbnkudy1oaWRkZW4tc21hbGwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCAobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgcGFyc2VkTGluay5ob3N0bmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCB1c2VyRGV0YWlsLmVtYWlsKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlNsaWRlciBjb21wb25lbnRcbiAqIEJ1aWxkIGEgc2xpZGVyIGZyb20gYW55IGFycmF5IG9mIG1pdGhyaWwgZWxlbWVudHNcbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAuLi5cbiAqICAgICBtLmNvbXBvbmVudChjLlNsaWRlciwge1xuICogICAgICAgICBzbGlkZXM6IFttKCdzbGlkZTEnKSwgbSgnc2xpZGUyJyksIG0oJ3NsaWRlMycpXSxcbiAqICAgICAgICAgdGl0bGU6ICdPIHF1ZSBlc3TDo28gZGl6ZW5kbyBwb3IgYcOtLi4uJ1xuICogICAgIH0pXG4gKiAgICAgLi4uXG4gKiB9XG4gKi9cbndpbmRvdy5jLlNsaWRlciA9ICgobSwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFNsaWRlSWR4ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uU2l6ZSA9IG0ucHJvcCgxNjAwKSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoc2VsZWN0ZWRTbGlkZUlkeCgpIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA8IChhcmdzLnNsaWRlcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoYW5nZVNsaWRlVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSwgNjUwMCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0gKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSAoKSA9PiBjbGVhckludGVydmFsKGNoYW5nZVNsaWRlVGltZXIpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemU6IHRyYW5zbGF0aW9uU2l6ZSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZTogZGVjcmVtZW50U2xpZGUsXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNsaWRlci5zbGlkZS10ZXN0aW1vbmlhbHMnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLmNvbmZpZ1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBhcmdzLnRpdGxlKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbWFzaycsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYXJncy5zbGlkZXMsIChzbGlkZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnNsYXRlVmFsdWUgPSAoaWR4IC0gY3RybC5zZWxlY3RlZFNsaWRlSWR4KCkpICogY3RybC50cmFuc2xhdGlvblNpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTdHIgPSBgdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVWYWx1ZX1weCwgMCwgMClgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnNsaWRlLnctc2xpZGUuc2xpZGUtdGVzdGltb25pYWxzLWNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGB0cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLXdlYmtpdC10cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLW1zLXRyYW5zZm9ybToke3RyYW5zbGF0ZVN0cn07YFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yJywgc2xpZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI3NsaWRlLXByZXYudy1zbGlkZXItYXJyb3ctbGVmdC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gY3RybC5kZWNyZW1lbnRTbGlkZSgpXG4gICAgICAgICAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItbGVmdC5mYS5mYS1jaGV2cm9uLWxlZnQuZm9udGNvbG9yLXRlcmNpYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJyNzbGlkZS1uZXh0Lnctc2xpZGVyLWFycm93LXJpZ2h0LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBjdHJsLmluY3JlbWVudFNsaWRlKClcbiAgICAgICAgICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1pY29uLXNsaWRlci1yaWdodC5mYS5mYS1jaGV2cm9uLXJpZ2h0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbmF2Lnctc2xpZGVyLW5hdi1pbnZlcnQudy1yb3VuZC5zbGlkZS1uYXYnLCBfKGFyZ3Muc2xpZGVzLmxlbmd0aCkudGltZXMoKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYC5zbGlkZS1idWxsZXQudy1zbGlkZXItZG90JHtjdHJsLnNlbGVjdGVkU2xpZGVJZHgoKSA9PT0gaWR4ID8gJy53LWFjdGl2ZScgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gY3RybC5zZWxlY3RlZFNsaWRlSWR4KGlkeClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGdyb3VwVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoTWF0aC5jZWlsKGNvbGxlY3Rpb24ubGVuZ3RoIC8gZ3JvdXBUb3RhbCkpLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5zbGljZShpICogZ3JvdXBUb3RhbCwgKGkgKyAxKSAqIGdyb3VwVG90YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwudm0uY29sbGVjdGlvbigpLCBmdW5jdGlvbihncm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGdyb3VwLCBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi5iaWcudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0xMFtzcmM9XCInICsgbWVtYmVyLmltZyArICdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tdG90YWwtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vc3NhIGVxdWlwZSwganVudGEsIGrDoSBhcG9pb3UgUiQnICsgaC5mb3JtYXROdW1iZXIodGVhbVRvdGFsLnRvdGFsX2Ftb3VudCkgKyAnIHBhcmEgJyArIHRlYW1Ub3RhbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlRvb2x0aXAgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyB5b3UgdG8gc2hvdyBhIHRvb2x0aXAgb25cbiAqIGEgc3BlY2lmaWVkIGVsZW1lbnQgaG92ZXIuIEl0IHJlY2VpdmVzIHRoZSBlbGVtZW50IHlvdSB3YW50XG4gKiB0byB0cmlnZ2VyIHRoZSB0b29sdGlwIGFuZCBhbHNvIHRoZSB0ZXh0IHRvIGRpc3BsYXkgYXMgdG9vbHRpcC5cbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICBsZXQgdG9vbHRpcCA9IChlbCkgPT4ge1xuICogICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICogICAgICAgICAgICAgIGVsOiBlbCxcbiAqICAgICAgICAgICAgICB0ZXh0OiAndGV4dCB0byB0b29sdGlwJyxcbiAqICAgICAgICAgICAgICB3aWR0aDogMzAwXG4gKiAgICAgICAgICB9KVxuICogICAgIH1cbiAqXG4gKiAgICAgcmV0dXJuIHRvb2x0aXAoJ2EjbGluay13dGgtdG9vbHRpcFtocmVmPVwiI1wiXScpO1xuICpcbiAqIH1cbiAqL1xud2luZG93LmMuVG9vbHRpcCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyZW50SGVpZ2h0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHdpZHRoID0gbS5wcm9wKGFyZ3Mud2lkdGggfHwgMjgwKSxcbiAgICAgICAgICAgICAgICB0b3AgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgbGVmdCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldCA9IG0ucHJvcCh7dG9wOiAwLCBsZWZ0OiAwfSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IGgudG9nZ2xlUHJvcCgwLCAxKSxcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc2V0UGFyZW50UG9zaXRpb24gPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXQoaC5jdW11bGF0aXZlT2Zmc2V0KGVsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVsVG9wID0gZWwub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgKGVsLm9mZnNldFdpZHRoICsgMiAqIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgMzApKXsgLy8zMCBoZXJlIGlzIGEgc2FmZSBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMzA7IC8vQWRkaW5nIHRoZSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLXBhcmVudE9mZnNldCgpLmxlZnQgKyAxNSk7IC8vcG9zaXRpb25pbmcgY2VudGVyIG9mIHdpbmRvdywgY29uc2lkZXJpbmcgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpIDw9IHdpbmRvdy5pbm5lcldpZHRoICYmIChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpID49IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoIC8gMik7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0V2lkdGggKyBlbC5vZmZzZXRQYXJlbnQub2Zmc2V0V2lkdGgpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AoLWVsVG9wKTsgLy9TZXR0aW5nIHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRvb2x0aXAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlOiB0b2dnbGUsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb246IHNldFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIHNldFBhcmVudFBvc2l0aW9uOiBzZXRQYXJlbnRQb3NpdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN0cmwud2lkdGgoKTtcbiAgICAgICAgICAgIHJldHVybiBtKGFyZ3MuZWwsIHtcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UGFyZW50UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ31cbiAgICAgICAgICAgIH0sIGN0cmwudG9vbHRpcCgpID8gW1xuICAgICAgICAgICAgICAgIG0oYC50b29sdGlwLmRhcmtbc3R5bGU9XCJ3aWR0aDogJHt3aWR0aH1weDsgdG9wOiAke2N0cmwudG9wKCl9cHg7IGxlZnQ6ICR7Y3RybC5sZWZ0KCl9cHg7XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UG9zaXRpb25cbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIGFyZ3MudGV4dClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVXNlckNhcmQgPSAoZnVuY3Rpb24obSwgXywgbW9kZWxzLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAgICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgICAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlsc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChjdHJsLnVzZXJEZXRhaWxzKCksIGZ1bmN0aW9uKHVzZXJEZXRhaWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQuY2FyZC11c2VyLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTMwW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LmNvbC1zbWFsbC00LnctY29sLXRpbnktNC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgudy1jb2wtdGlueS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi91c2Vycy8nICsgdXNlckRldGFpbC5pZCArICdcIl0nLCB1c2VyRGV0YWlsLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCB1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cyArICcgcHJvamV0b3MgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdhcG9pb3UgJyArIHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCBmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLW1lc3NhZ2VbaHJlZj1cIm1haWx0bzonICsgdXNlckRldGFpbC5lbWFpbCArICdcIl1baXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW52aWFyIG1lbnNhZ2VtJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnlvdXR1YmVMaWdodGJveCBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgbGlnaHRib3ggd2l0aCBhIHlvdXR1YmUgdmlkZW9cbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy55b3V0dWJlTGlnaHRib3gsIHtzcmM6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUZsRlRjRFNLbkxNJ30pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMuWW91dHViZUxpZ2h0Ym94ID0gKChtLCBjLCBoLCBtb2RlbHMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaG93TGlnaHRib3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dMaWdodGJveDogc2hvd0xpZ2h0Ym94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN5b3V0dWJlLWxpZ2h0Ym94JywgW1xuICAgICAgICAgICAgICAgIG0oJ2EjeW91dHViZS1wbGF5LnctbGlnaHRib3gudy1pbmxpbmUtYmxvY2suZmEuZmEtcGxheS1jaXJjbGUuZm9udGNvbG9yLW5lZ2F0aXZlLmZhLTV4W2hyZWY9XFwnamF2YXNjcmlwdDp2b2lkKDApO1xcJ10nLCB7b25jbGljazogY3RybC5zaG93TGlnaHRib3gudG9nZ2xlfSksXG4gICAgICAgICAgICAgICAgY3RybC5zaG93TGlnaHRib3goKSA/XG4gICAgICAgICAgICAgICAgbSgnI2xpZ2h0Ym94LnctbGlnaHRib3gtYmFja2Ryb3AnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtdmlldycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtZnJhbWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdmaWd1cmUudy1saWdodGJveC1maWd1cmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnctbGlnaHRib3gtaW1nLnctbGlnaHRib3gtaW1hZ2Vbc3JjPVxcJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LCUzQ3N2ZyUyMHhtbG5zPSUyMmh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJTIyJTIwd2lkdGg9JTIyOTQwJTIyJTIwaGVpZ2h0PSUyMjUyOCUyMi8lM0VcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaWZyYW1lI3ZpZGVvLWxpZ2h0Ym94LmVtYmVkbHktZW1iZWQudy1saWdodGJveC1lbWJlZFthbGxvd2Z1bGxzY3JlZW49XFwnXFwnXVtmcmFtZWJvcmRlcj1cXCcwXFwnXVtoZWlnaHQ9XFwnNTI4XFwnXVtzY3JvbGxpbmc9XFwnbm9cXCddW3NyYz1cXCdodHRwczovL2Nkbi5lbWJlZGx5LmNvbS93aWRnZXRzL21lZGlhLmh0bWw/c3JjPWh0dHBzJTNBJTJGJTJGd3d3LnlvdXR1YmUuY29tJTJGZW1iZWQlMkZGbEZUY0RTS25MTSUzRmF1dG9wbGF5JTNEMSUyNmZlYXR1cmUlM0RvZW1iZWQmdXJsPSR7ZW5jb2RlVVJJKGFyZ3Muc3JjKX0maW1hZ2U9aHR0cHMlM0ElMkYlMkZpLnl0aW1nLmNvbSUyRnZpJTJGRmxGVGNEU0tuTE0lMkZocWRlZmF1bHQuanBnJmtleT1jNGU1NGRlY2NmNGQ0ZWM5OTdhNjQ5MDJlOWEzMDMwMCZhdXRvcGxheT0xJnR5cGU9dGV4dCUyRmh0bWwmc2NoZW1hPXlvdXR1YmVcXCddW3dpZHRoPVxcJzk0MFxcJ11gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zcGlubmVyLnctbGlnaHRib3gtaGlkZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1sZWZ0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtcmlnaHQudy1saWdodGJveC1pbmFjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyN5b3V0dWJlLWNsb3NlLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LWNsb3NlJywge29uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXN0cmlwJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9mdWxsX3RleHRfaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3N0YXRlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb20gbyBlc3RhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGFpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGFpZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVzZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVzZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmdfcmVmdW5kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdW5kZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVuZGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnY2hhcmdlYmFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnY2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2RlbGV0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2dhdGV3YXlcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BhZ2FybWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BhZ2FybWUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdNb0lQJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdNb0lQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGF5UGFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYXlQYWwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdDcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdDcsOpZGl0b3MnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3ZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck51bWJlclJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWYWxvcmVzIGVudHJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS52YWx1ZS5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9jcmVhdGVkX2F0XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRhdGVSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVyw61vZG8gZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlciwge1xuICAgICAgICAgICAgICAgICAgICBmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Db250cmlidXRpb25JdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLlVzZXJzID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLnVzZXJMaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi51c2VyRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vbmFtZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBub21lLCBlLW1haWwsIElkcyBkbyB1c3XDoXJpby4uLicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSwgeyAvL3N0YXR1c1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiAnc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZGVhY3RpdmF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdhdGl2bydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIW51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnZGVzYXRpdmFkbydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9ICdVc3XDoXJpb3MnO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pblVzZXJJdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0V4cGxvcmUgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIHNob3cgcHJvamVjdHMgYWNjb3JkaW5nIHRvIHVzZXIgZGVmaW5lZCBmaWx0ZXJzXG4gKlxuICogRXhhbXBsZTpcbiAqIFRvIG1vdW50IHRoaXMgY29tcG9uZW50IGp1c3QgY3JlYXRlIGEgRE9NIGVsZW1lbnQgbGlrZTpcbiAqIDxkaXYgZGF0YS1taXRocmlsPVwiUHJvamVjdHNFeHBsb3JlXCI+XG4gKi9cbndpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0V4cGxvcmUgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgICBmb2xsb3cgPSBjLm1vZGVscy5jYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcCA9IGMuY29udHJpYnV0aW9uLnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7c3RhdGVfb3JkZXI6ICdndGUnLCBjYXRlZ29yeV9pZDogJ2VxJ30pLnN0YXRlX29yZGVyKCdwdWJsaXNoZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm91dGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlWzFdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwW3JvdXRlWzFdXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGl0bGU6IGNhdC5uYW1lLCBmaWx0ZXI6IGJ5Q2F0ZWdvcnkuY2F0ZWdvcnlfaWQoY2F0LmlkKX07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IGZpbHRlckZyb21Sb3V0ZSgpIHx8IGZpbHRlcnNNYXAucmVjb21tZW5kZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoID0gaC5wYXJhbUJ5TmFtZSgncGdfc2VhcmNoJyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hQcm9qZWN0cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihjLm1vZGVscy5wcm9qZWN0U2VhcmNoLnBvc3RPcHRpb25zKHtxdWVyeTogc2VhcmNofSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlID0geyAvLyBXZSBidWlsZCBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgcGFnaW5hdGlvblZNXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNMb2FkaW5nOiBsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBhZ2U6ICgpID0+IHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4ocGFnZS5jb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRQcm9qZWN0cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0oYy5tb2RlbHMucHJvamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VzLmZpcnN0UGFnZShmaWx0ZXIuZmlsdGVyLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdkZXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlX29yZGVyOiAnYXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdkZXNjJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzU3RyaW5nKHNlYXJjaCkgJiYgc2VhcmNoLmxlbmd0aCA+IDAgJiYgcm91dGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoJ0J1c2NhICcgKyBzZWFyY2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0cyhzZWFyY2hQcm9qZWN0cygpKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZShmaWx0ZXIudGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0cyhsb2FkUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQoY2F0ICYmIGNhdC5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXMgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkUm91dGUoKTtcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgICAvLyBJbml0aWFsIGxvYWRzXG4gICAgICAgICAgICBjLm1vZGVscy5wcm9qZWN0LnBhZ2VTaXplKDkpO1xuICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMoKS50aGVuKGxvYWRSb3V0ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcnlDb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIGZvbGxvd0NhdGVnb3J5OiBmb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICB1bkZvbGxvd0NhdGVnb3J5OiB1bkZvbGxvd0NhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHByb2plY3RzOiBwcm9qZWN0cyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgICAgIGZpbHRlcnNNYXA6IGZpbHRlcnNNYXAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2F0ZWdvcmllczogdG9nZ2xlQ2F0ZWdvcmllc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tc2VhcmNoJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2V4cGxvcmUtb3Blbi5saW5rLWhpZGRlbi13aGl0ZS5mb250d2VpZ2h0LWxpZ2h0LmZvbnRzaXplLWxhcmdlcltocmVmPVwiamF2YXNjcmlwdDp2b2lkKCk7XCJdJyx7b25jbGljazogKCkgPT4gY3RybC50b2dnbGVDYXRlZ29yaWVzLnRvZ2dsZSgpfSwgWydFeHBsb3JlIHByb2pldG9zIGluY3LDrXZlaXMgJyxtKGBzcGFuI2V4cGxvcmUtYnRuLmZhLmZhLWFuZ2xlLWRvd24ke2N0cmwudG9nZ2xlQ2F0ZWdvcmllcygpID8gJy5vcGVuZWQnIDogJyd9YCwgJycpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbShgI2NhdGVnb3JpZXMuY2F0ZWdvcnktc2xpZGVyJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwuY2F0ZWdvcmllcygpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkNhdGVnb3J5QnV0dG9uLCB7Y2F0ZWdvcnk6IGNhdGVnb3J5fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwuZmlsdGVyc01hcCwgKGZpbHRlciwgaHJlZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuRmlsdGVyQnV0dG9uLCB7dGl0bGU6IGZpbHRlci50aXRsZSwgaHJlZjogaHJlZn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTcudy1jb2wtdGlueS03JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgY3RybC50aXRsZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc09iamVjdChjdHJsLmNhdGVnb3J5KCkpID8gbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9sbG93aW5nLmZvbnRzaXplLXNtYWxsLmZvbnRjb2xvci1zZWNvbmRhcnkudS1yaWdodCcsIGAke2N0cmwuY2F0ZWdvcnkoKS5mb2xsb3dlcnN9IHNlZ3VpZG9yZXNgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC0xMi53LWNvbC10aW55LTEyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY2F0ZWdvcnkoKS5mb2xsb3dpbmcgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeS51bmZvbGxvdy1idG5baHJlZj1cXCcjXFwnXScsIHtvbmNsaWNrOiBjdHJsLnVuRm9sbG93Q2F0ZWdvcnkoY3RybC5jYXRlZ29yeSgpLmlkKX0sICdEZWl4YXIgZGUgc2VndWlyJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbWVkaXVtLmZvbGxvdy1idG5baHJlZj1cXCcjXFwnXScsIHtvbmNsaWNrOiBjdHJsLmZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnU2VndWlyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgXy5tYXAoY3RybC5wcm9qZWN0cygpLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdENhcmQsIHtwcm9qZWN0OiBwcm9qZWN0fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucHJvamVjdHMoKS5pc0xvYWRpbmcoKSA/IGgubG9hZGVyKCkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeVtocmVmPVxcJyNsb2FkTW9yZVxcJ10nLCB7b25jbGljazogKCkgPT4geyBjdHJsLnByb2plY3RzKCkubmV4dFBhZ2UoKTsgcmV0dXJuIGZhbHNlOyB9fSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSldO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuY29udHJpYnV0aW9uLlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMuY29udHJpYnV0aW9uLnByb2plY3RGaWx0ZXJzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gXy5tYXAoWyduZWFyX21lJywgJ3JlY29tbWVuZGVkJywgJ2V4cGlyaW5nJywgJ3JlY2VudCddLCAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBmaWx0ZXJzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgIGNMb2FkZXIgPSBsb2FkZXJXaXRoVG9rZW4ocHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmLmZpbHRlci5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgICAgIGNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKGNvbGxlY3Rpb24sIHNhbXBsZTMpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNMb2FkZXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cubW9tZW50LCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMucGFnZXMuRmxleCA9IChmdW5jdGlvbihtLCBjLCBoLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIHNhbXBsZTMgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDMpLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUFjdGlvbjogJy8vY2F0YXJzZS51czUubGlzdC1tYW5hZ2UuY29tL3N1YnNjcmliZS9wb3N0P3U9ZWJmY2QwZDE2ZGJiMDAwMWEwYmVhMzYzOSZhbXA7aWQ9OGE0YzFhMzNjZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZERpc3F1cyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguZGlzY3VzcygnaHR0cHM6Ly9jYXRhcnNlLm1lL2ZsZXgnLCAnZmxleF9wYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZsZXhWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpO1xuXG4gICAgICAgICAgICBmbGV4Vk0ubW9kZSgnZmxleCcpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgY29uc3QgcHJvamVjdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXIobW9kZWxzLnByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZmxleFZNLnBhcmFtZXRlcnMoKSksIG0ucG9zdGdyZXN0LnJlcXVlc3QpO1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG5cbiAgICAgICAgICAgIHByb2plY3RzTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShwcm9qZWN0cywgc2FtcGxlMykpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFkZERpc3F1czogYWRkRGlzcXVzLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXI6IHN0YXRzTG9hZGVyLFxuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBwcm9qZWN0c0xvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgcHJvamVjdHM6IHtjb2xsZWN0aW9uOiBwcm9qZWN0c31cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBzdGF0cyA9IF8uZmlyc3QoY3RybC5zdGF0cygpKTtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWZ1bGwuaGVyby16ZWxvJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5sb2dvLWZsZXgtaG9tZVtzcmM9XFwnL2Fzc2V0cy9sb2dvLWZsZXgucG5nXFwnXVt3aWR0aD1cXCczNTlcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTYwLnctY29sLXB1c2gtMi53LWNvbC04JywgJ1ZhbW9zIGNvbnN0cnVpciB1bWEgbm92YSBtb2RhbGlkYWRlIGRlIGNyb3dkZnVuZGluZyBwYXJhIG8gQ2F0YXJzZSEgIEp1bnRlLXNlIGEgbsOzcywgaW5zY3JldmEgc2V1IGVtYWlsIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1NpZ251cCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyOiBjdHJsLmJ1aWxkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXInLCAnUHJhIHF1ZW0gc2Vyw6E/JyksIG0oJy5mb250c2l6ZS1iYXNlLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCAnSW5pY2lhcmVtb3MgYSBmYXNlIGRlIHRlc3RlcyBjb20gY2F0ZWdvcmlhcyBkZSBwcm9qZXRvcyBlc3BlY8OtZmljYXMnKSwgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOTNhMDFiNjZlMjUwYWNhNjdjYl9pY29uLXplbG8tY29tLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ0NhdXNhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJ3AuZm9udHNpemUtYmFzZScsICdGbGV4aWJpbGlkYWRlIHBhcmEgY2F1c2FzIGRlIGltcGFjdG8hIEVzdGFyZW1vcyBhYmVydG9zIGEgY2FtcGFuaGFzIGRlIG9yZ2FuaXphw6fDtWVzIG91IHBlc3NvYXMgZsOtc2ljYXMgcGFyYSBhcnJlY2FkYcOnw6NvIGRlIHJlY3Vyc29zIHBhcmEgY2F1c2FzIHBlc3NvYWlzLCBwcm9qZXRvcyBhc3Npc3RlbmNpYWxpc3Rhcywgc2HDumRlLCBhanVkYXMgaHVtYW5pdMOhcmlhcywgcHJvdGXDp8OjbyBhb3MgYW5pbWFpcywgZW1wcmVlbmRlZG9yaXNtbyBzb2Npb2FtYmllbnRhbCwgYXRpdmlzbW8gb3UgcXVhbHF1ZXIgY29pc2EgcXVlIHVuYSBhcyBwZXNzb2FzIHBhcmEgZmF6ZXIgbyBiZW0uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOTI5YTBkYWVhMjMwYTVmMTJjZF9pY29uLXplbG8tcGVzc29hbC5wbmdcXCddW3dpZHRoPVxcJzIxMFxcJ10nKSwgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsICdWYXF1aW5oYXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCdwLmZvbnRzaXplLWJhc2UnLCAnQ2FtcGFuaGFzIHNpbXBsZXMgcXVlIHByZWNpc2FtIGRlIGZsZXhpYmlsaWRhZGUgcGFyYSBhcnJlY2FkYXIgZGluaGVpcm8gY29tIHBlc3NvYXMgcHLDs3hpbWFzLiBFc3RhcmVtb3MgYWJlcnRvcyBhIHVtYSB2YXJpZWRhZGUgZGUgY2FtcGFuaGFzIHBlc3NvYWlzIHF1ZSBwb2RlbSBpciBkZXNkZSBjb2JyaXIgY3VzdG9zIGRlIGVzdHVkb3MgYSBhanVkYXIgcXVlbSBwcmVjaXNhIGRlIHRyYXRhbWVudG8gbcOpZGljby4gRGUganVudGFyIGEgZ3JhbmEgcGFyYSBmYXplciBhcXVlbGEgZmVzdGEgYSBjb21wcmFyIHByZXNlbnRlcyBwYXJhIGFsZ3XDqW0gY29tIGEgYWp1ZGEgZGEgZ2FsZXJhLiAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1ncmVlbmxpbWUuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LnUtbWFyZ2ludG9wLTQwLnUtbWFyZ2luYm90dG9tLTYwLnUtdGV4dC1jZW50ZXInLCAnQ29tbyBmdW5jaW9uYXLDoT8nKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzljNTc4YjI4NDQ5M2UyYTQyOGFfemVsby1tb25leS5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnRmlxdWUgY29tIHF1YW50byBhcnJlY2FkYXInKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTyBmbGV4IMOpIHBhcmEgaW1wdWxzaW9uYXIgY2FtcGFuaGFzIG9uZGUgdG9kbyBkaW5oZWlybyDDqSBiZW0gdmluZG8hIFZvY8OqIGZpY2EgY29tIHR1ZG8gcXVlIGNvbnNlZ3VpciBhcnJlY2FkYXIuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWQzN2MwMTNkNGEzZWU2ODdkMl9pY29uLXJld2FyZC5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTsOjbyBwcmVjaXNhIGRlIHJlY29tcGVuc2FzJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ05vIGZsZXggb2ZlcmVjZXIgcmVjb21wZW5zYXMgw6kgb3BjaW9uYWwuIFZvY8OqIGVzY29saGUgc2Ugb2ZlcmVjw6otbGFzIGZheiBzZW50aWRvIHBhcmEgbyBzZXUgcHJvamV0byBlIGNhbXBhbmhhLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZmIwMWI2NmUyNTBhY2E2N2UzX2ljb24tY3VyYWQucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZvY8OqIG1lc21vIHB1YmxpY2Egc2V1IHByb2pldG8nKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnVG9kb3Mgb3MgcHJvamV0b3MgaW5zY3JpdG9zIG5vIGZsZXggZW50cmFtIG5vIGFyLiBBZ2lsaWRhZGUgZSBmYWNpbGlkYWRlIHBhcmEgdm9jw6ogY2FwdGFyIHJlY3Vyc29zIGF0cmF2w6lzIGRhIGludGVybmV0LicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzllNzdjMDEzZDRhM2VlNjg3ZDRfaWNvbi10aW1lLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdFbmNlcnJlIGEgY2FtcGFuaGEgcXVhbmRvIHF1aXNlcicpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdOw6NvIGjDoSBsaW1pdGUgZGUgdGVtcG8gZGUgY2FwdGHDp8Ojby4gVm9jw6ogZXNjb2xoZSAgcXVhbmRvIGVuY2VycmFyIHN1YSBjYW1wYW5oYSBlIHJlY2ViZXIgb3MgdmFsb3JlcyBhcnJlY2FkYWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWVkaXRhYmxlLmZvbnRzaXplLWxhcmdlci51LW1hcmdpbnRvcC00MC51LW1hcmdpbi1ib3R0b20tNDAudS10ZXh0LWNlbnRlcicsICdDb25oZcOnYSBhbGd1bnMgZG9zIHByaW1laXJvcyBwcm9qZXRvcyBmbGV4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0c0xvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge2NvbGxlY3Rpb246IGN0cmwucHJvamVjdHMsIHJlZjogJ2N0cnNlX2ZsZXgnLCB3cmFwcGVyOiAnLnctcm93LnUtbWFyZ2ludG9wLTQwJ30pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAudS1tYXJnaW50b3AtNDAnLCAnRMO6dmlkYXMnKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFpcyBzw6NvIGFzIHRheGFzIGRhIG1vZGFsaWRhZGUgZmxleMOtdmVsPyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0NvbW8gbm8gQ2F0YXJzZSwgZW52aWFyIHVtIHByb2pldG8gbsOjbyBjdXN0YSBuYWRhISBFc3RhbW9zIGVzdHVkYW5kbyBvcMOnw7VlcyBwYXJhIGVudGVuZGVyIHF1YWwgc2Vyw6EgYSB0YXhhIGNvYnJhZGEgbm8gc2VydmnDp28gQ2F0YXJzZSBmbGV4LidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ0RlIG9uZGUgdmVtIG8gZGluaGVpcm8gZG8gbWV1IHByb2pldG8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdGYW3DrWxpYSwgYW1pZ29zLCBmw6NzIGUgbWVtYnJvcyBkZSBjb211bmlkYWRlcyBxdWUgdm9jw6ogZmF6IHBhcnRlIHPDo28gc2V1cyBtYWlvcmVzIGNvbGFib3JhZG9yZXMuIFPDo28gZWxlcyBxdWUgaXLDo28gZGl2dWxnYXIgc3VhIGNhbXBhbmhhIHBhcmEgYXMgcGVzc29hcyBxdWUgZWxlcyBjb25oZWNlbSwgZSBhc3NpbSBvIGPDrXJjdWxvIGRlIGFwb2lhZG9yZXMgdmFpIGF1bWVudGFuZG8gZSBhIHN1YSBjYW1wYW5oYSBnYW5oYSBmb3LDp2EuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbCBhIGRpZmVyZW7Dp2EgZW50cmUgbyBmbGV4w612ZWwgZSBvIFwidHVkbyBvdSBuYWRhXCI/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBdHVhbG1lbnRlIG8gQ2F0YXJzZSB1dGlsaXphIGFwZW5hcyBvIG1vZGVsbyBcInR1ZG8gb3UgbmFkYVwiLCBvbmRlIHZvY8OqIHPDsyBmaWNhIGNvbSBvIGRpbmhlaXJvIHNlIGJhdGVyIGEgbWV0YSBkZSBhcnJlY2FkYcOnw6NvIGRlbnRybyBkbyBwcmF6byBkYSBjYW1wYW5oYS4gTyBtb2RlbG8gZmxleMOtdmVsIMOpIGRpZmVyZW50ZSBwb2lzIHBlcm1pdGUgcXVlIG8gcmVhbGl6YWRvciBmaXF1ZSBjb20gbyBxdWUgYXJyZWNhZGFyLCBpbmRlcGVuZGVudGUgZGUgYXRpbmdpciBvdSBuw6NvIGEgbWV0YSBkbyBwcm9qZXRvIG5vIHByYXpvIGRhIGNhbXBhbmhhLiBOw6NvIGhhdmVyw6EgbGltaXRlIGRlIHRlbXBvIHBhcmEgYXMgY2FtcGFuaGFzLiBOb3NzbyBzaXN0ZW1hIGZsZXjDrXZlbCBzZXLDoSBhbGdvIG5vdm8gZW0gcmVsYcOnw6NvIGFvcyBtb2RlbG9zIHF1ZSBleGlzdGVtIGF0dWFsbWVudGUgbm8gbWVyY2Fkby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1Bvc3NvIGluc2NyZXZlciBwcm9qZXRvcyBwYXJhIGEgbW9kYWxpZGFkZSBmbGV4w612ZWwgasOhPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnUG9yIGVucXVhbnRvIG7Do28uIEEgbW9kYWxpZGFkZSBmbGV4IHNlcsOhIHRlc3RhZGEgY29tIGFsZ3VucyBwcm9qZXRvcyBlc3BlY8OtZmljb3MuIEluc2NyZXZhIHNldSBlbWFpbCBlIHBhcnRpY2lwZSBkYSBjb252ZXJzYSBuZXNzYSBww6FnaW5hIHBhcmEgcmVjZWJlciBpbmZvcm1hw6fDtWVzLCBtYXRlcmlhaXMsIGFjb21wYW5oYXIgcHJvamV0b3MgZW0gdGVzdGUgZSBzYWJlciBjb20gYW50ZWNlZMOqbmNpYSBhIGRhdGEgZGUgbGFuw6dhbWVudG8gZG8gZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3IgcXXDqiB2b2PDqnMgcXVlcmVtIGZhemVyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWNyZWRpdGFtb3MgcXVlIG8gYW1iaWVudGUgZG8gY3Jvd2RmdW5kaW5nIGJyYXNpbGVpcm8gYWluZGEgdGVtIGVzcGHDp28gcGFyYSBtdWl0YXMgYcOnw7VlcywgdGVzdGVzIGUgZXhwZXJpbWVudGHDp8O1ZXMgcGFyYSBlbnRlbmRlciBkZSBmYXRvIG8gcXVlIGFzIHBlc3NvYXMgcHJlY2lzYW0uIFNvbmhhbW9zIGNvbSB0b3JuYXIgbyBmaW5hbmNpYW1lbnRvIGNvbGV0aXZvIHVtIGjDoWJpdG8gbm8gQnJhc2lsLiBPIENhdGFyc2UgZmxleCDDqSBtYWlzIHVtIHBhc3NvIG5lc3NhIGRpcmXDp8Ojby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFuZG8gdm9jw6pzIGlyw6NvIGxhbsOnYXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBaW5kYSBuw6NvIHNhYmVtb3MgcXVhbmRvIGFicmlyZW1vcyBvIGZsZXggcGFyYSBvIHDDumJsaWNvLiBJcmVtb3MgcHJpbWVpcmFtZW50ZSBwYXNzYXIgcG9yIHVtIHBlcsOtb2RvIGRlIHRlc3RlcyBlIGRlcG9pcyBlc3RhYmVsZWNlciB1bWEgZGF0YSBkZSBsYW7Dp2FtZW50by4gU2Ugdm9jw6ogZGVzZWphIGFjb21wYW5oYXIgZSByZWNlYmVyIG5vdMOtY2lhcyBzb2JyZSBlc3NhIGNhbWluaGFkYSwgaW5zY3JldmEgc2V1IGVtYWlsIG5lc3NhIHDDoWdpbmEuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnRmlxdWUgcG9yIGRlbnRybyEnKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAnLCAnUmVjZWJhIG5vdMOtY2lhcyBlIGFjb21wYW5oZSBhIGV2b2x1w6fDo28gZG8gQ2F0YXJzZSBmbGV4JyksIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyOiBjdHJsLmJ1aWxkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLmJnLWNhdGFyc2UtemVsby5zZWN0aW9uLWxhcmdlW3N0eWxlPVwibWluLWhlaWdodDogNTB2aDtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS51LW1hcmdpbmJvdHRvbS00MC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC5mb250Y29sb3ItbmVnYXRpdmUnLCAnTyBmbGV4IMOpIHVtIGV4cGVyaW1lbnRvIGUgaW5pY2lhdGl2YSBkbyBDYXRhcnNlLCBtYWlvciBwbGF0YWZvcm1hIGRlIGNyb3dkZnVuZGluZyBkbyBCcmFzaWwuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCAoY3RybC5zdGF0c0xvYWRlcigpKSA/IGgubG9hZGVyKCkgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfY29udHJpYnV0b3JzLCAwLCAzKSksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnUGVzc29hcyBqYSBhcG9pYXJhbSBwZWxvIG1lbm9zIDAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQcm9qZXRvcyBqYSBmb3JhbSBmaW5hbmNpYWRvcyBub8KgQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnRm9yYW0gaW52ZXN0aWRvcyBlbSBpZGVpYXMgcHVibGljYWRhcyBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1ibHVlLW9uZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21lbmRlIG8gQ2F0YXJzZSBmbGV4IHBhcmEgYW1pZ29zISAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02Lnctc3ViLWNvbC1taWRkbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY2ZTA1ZWI2MTQ0MTcxZDhlZGJfZmFjZWJvb2steHhsLnBuZ1xcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tZmJbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj1mYWNlYm9vayZ0aXRsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdDb25oZcOnYSBvIG5vdm8gQ2F0YXJzZSBGbGV4IScpICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnQ29tcGFydGlsaGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24tc2hhcmUtbW9iaWxlW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzUzYTNmNjUxMDVlYjYxNDQxNzFkOGVkYV90d2l0dGVyLTI1Ni5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLXR3ZWV0W2hyZWY9XCJodHRwOi8vdHdpdHRlci5jb20vP3N0YXR1cz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmcgcGFyYSBvIENhdGFyc2UhIEp1bnRlLXNlIGEgbsOzcywgaW5zY3JldmEgc2V1IGVtYWlsIScpICsgJ2h0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9dHdpdHRlclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnVHVpdGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS5iZy1ncmVlbmxpbWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BhcnRpY2lwZS1kby1kZWJhdGUudS10ZXh0LWNlbnRlcicsIHtjb25maWc6IGgudG9BbmNob3IoKX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VzdC5mb250Y29sb3ItbmVnYXRpdmUnLCdDb25zdHJ1YSBvIGZsZXggY29ub3NjbycpLCBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS02MC5mb250Y29sb3ItbmVnYXRpdmUnLCAnSW5pY2llIHVtYSBjb252ZXJzYSwgcGVyZ3VudGUsIGNvbWVudGUsIGNyaXRpcXVlIGUgZmHDp2Egc3VnZXN0w7VlcyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNkaXNxdXNfdGhyZWFkLmNhcmQudS1yYWRpdXNbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLmFkZERpc3F1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMucGFnZXMuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgICAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgICAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pKSwgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdChkYXRhLnVzZXJfaW1hZ2UpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdhY2Fib3UgZGUgYXBvaWFyIG8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWdpdGh1YicsICcuJyksICcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5zdGFydFZNID0gKChfKSA9PiB7XG4gICAgcmV0dXJuIChJMThuKSA9PiB7XG4gICAgICAgIGNvbnN0IGkxOG5TdGFydCA9IEkxOG4udHJhbnNsYXRpb25zW0kxOG4uY3VycmVudExvY2FsZSgpXS5wYWdlcy5zdGFydCxcbiAgICAgICAgICAgIHRlc3RpbW9uaWFscyA9IGkxOG5TdGFydC50ZXN0aW1vbmlhbHMsXG4gICAgICAgICAgICBjYXRlZ29yeVByb2plY3RzID0gaTE4blN0YXJ0LmNhdGVnb3J5UHJvamVjdHMsXG4gICAgICAgICAgICBwYW5lcyA9IGkxOG5TdGFydC5wYW5lcyxcbiAgICAgICAgICAgIHFhID0gaTE4blN0YXJ0LnFhO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXN0aW1vbmlhbHM6IF8ubWFwKHRlc3RpbW9uaWFscywgKHRlc3RpbW9uaWFsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGh1bWJVcmw6IHRlc3RpbW9uaWFsLnRodW1iLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB0ZXN0aW1vbmlhbC5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0ZXN0aW1vbmlhbC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbHM6IHRlc3RpbW9uaWFsLnRvdGFsc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHBhbmVzOiBfLm1hcChwYW5lcywgKHBhbmUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFuZS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBwYW5lLnNyY1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHF1ZXN0aW9uczoge1xuICAgICAgICAgICAgICAgIGNvbF8xOiBfLm1hcChxYS5jb2xfMSwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGNvbF8yOiBfLm1hcChxYS5jb2xfMiwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2F0ZWdvcnlQcm9qZWN0czogXy5tYXAoY2F0ZWdvcnlQcm9qZWN0cywgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogY2F0ZWdvcnkuY2F0ZWdvcnlfaWQsXG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZVByb2plY3RzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5zYW1wbGVfcHJvamVjdF9pZHMucHJpbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LnNhbXBsZV9wcm9qZWN0X2lkcy5zZWNvbmRhcnlcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5TdGFydCA9ICgobSwgYywgaCwgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncGFnZXMuc3RhcnQnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmUgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeSA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeCA9IG0ucHJvcCgtMSksXG4gICAgICAgICAgICAgICAgc3RhcnR2bSA9IGMucGFnZXMuc3RhcnRWTShJMThuKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXMgPSBzdGFydHZtLnBhbmVzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHVzZXJ2bSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IGxvYWRlcihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSksXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdhc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmUoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxDYXRlZ29yeSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMuY2F0ZWdvcnlUb3RhbHMuZ2V0Um93T3B0aW9ucyhjYXRlZ29yeXZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFByb2plY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhwcm9qZWN0dm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsVXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKHVzZXJ2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0uY2F0ZWdvcnlfaWQoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbENhdGVnb3J5KCkubG9hZCgpLnRoZW4obG9hZENhdGVnb3J5UHJvamVjdHMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0VXNlciA9ICh1c2VyLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmV4dGVuZCh7fSwgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJUaHVtYjogIF8uZmlyc3QodXNlcikucHJvZmlsZV9pbWdfdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0UHJvamVjdCA9IChwcm9qZWN0LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmZpcnN0KHByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICB1c2Vydm0uaWQoXy5maXJzdChwcm9qZWN0KS51c2VyLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgbFVzZXIoKS5sb2FkKCkudGhlbigodXNlcikgPT4gc2V0VXNlcih1c2VyLCBpZHgpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yeVByb2plY3RzID0gKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2F0ZWdvcnlQcm9qZWN0cyA9IF8uZmluZFdoZXJlKHN0YXJ0dm0uY2F0ZWdvcnlQcm9qZWN0cywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogXy5maXJzdChjYXRlZ29yeSkuY2F0ZWdvcnlfaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMoW10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoY2F0ZWdvcnlQcm9qZWN0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGNhdGVnb3J5UHJvamVjdHMuc2FtcGxlUHJvamVjdHMsIChwcm9qZWN0X2lkLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQocHJvamVjdF9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxQcm9qZWN0KCkubG9hZCgpLnRoZW4oKHByb2plY3QpID0+IHNldFByb2plY3QocHJvamVjdCwgaWR4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG4gICAgICAgICAgICBsb2FkQ2F0ZWdvcmllcygpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXM6IHBhbmVJbWFnZXMsXG4gICAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IHNlbGVjdENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IHNlbGVjdGVkQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeDogc2VsZWN0ZWRDYXRlZ29yeUlkeCxcbiAgICAgICAgICAgICAgICBzZWxlY3RQYW5lOiBzZWxlY3RQYW5lLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFuZTogc2VsZWN0ZWRQYW5lLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHM6IGZlYXR1cmVkUHJvamVjdHMsXG4gICAgICAgICAgICAgICAgdGVzdGltb25pYWxzOiBzdGFydHZtLnRlc3RpbW9uaWFscyxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnM6IHN0YXJ0dm0ucXVlc3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgY29uc3QgdGVzdGltb25pYWxzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnRlc3RpbW9uaWFscywgKHRlc3RpbW9uaWFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5jYXJkLWJpZy5jYXJkLXRlcmNpYXJ5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnRodW1iLXRlc3RpbW9uaWFsLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMjBbc3JjPVwiJHt0ZXN0aW1vbmlhbC50aHVtYlVybH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgYFwiJHt0ZXN0aW1vbmlhbC5jb250ZW50fVwiYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIHRlc3RpbW9uaWFsLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgdGVzdGltb25pYWwudG90YWxzKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWZ1bGwuaGVyby1zdGFydCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tNDAnLCBJMThuLnQoJ3Nsb2dhbicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbaHJlZj1cXCcvcHJvamVjdHMvbmV3XFwnXScsICBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLmlzRW1wdHkoc3RhdHMpID8gJycgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnBlb3BsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5tb25leScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnN1Y2Nlc3MnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ3BhZ2UtdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBJMThuLnQoJ3BhZ2Utc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4Lmhvdy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuaG93LWNvbC0wMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjInLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5ob3ctY29sLTAzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjYnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbnRvcC0zMCcsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjgnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci40JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci42JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci44JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2ZlYXR1cmVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsIEkxOG4udCgnZmVhdHVyZXMuc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV80JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudy1jb2wudy1jb2wtNCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYS53LXRhYi1saW5rLnctaW5saW5lLWJsb2NrLnRhYi1saXN0LWl0ZW0keyhpZHggPT09IGN0cmwuc2VsZWN0ZWRQYW5lKCkpID8gJy5zZWxlY3RlZCcgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNlbGVjdFBhbmUoaWR4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBwYW5lLmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLWNvbnRlbnQudy1jb2wudy1jb2wtOCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctdGFiLXBhbmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWdbc3JjPVwiJHtwYW5lLnNyY31cIl0ucGFuZS1pbWFnZSR7KGlkeCA9PT0gY3RybC5zZWxlY3RlZFBhbmUoKSkgPyAnLnNlbGVjdGVkJyA6ICcnfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctYmx1ZS1vbmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3ZpZGVvLnRpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCd2aWRlby5zdWJ0aXRsZScsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLllvdXR1YmVMaWdodGJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogSTE4bi50KCd2aWRlby5zcmMnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2VjdGlvbi1jYXRlZ29yaWVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1wdXNoLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNDAuZm9udGNvbG9yLW5lZ2F0aXZlJywgSTE4bi50KCdjYXRlZ29yaWVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwuY2F0ZWdvcmllcygpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYGEudy10YWItbGluay53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuc21hbGwuYnRuLWlubGluZSR7KGN0cmwuc2VsZWN0ZWRDYXRlZ29yeUlkeCgpID09PSBjYXRlZ29yeS5pZCkgPyAnLnctLWN1cnJlbnQnIDogJyd9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeS5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY2F0ZWdvcnkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1jb250ZW50LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItcGFuZS53LS10YWItYWN0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgKCEoXy5pc0VtcHR5KGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpKSAmJiBjdHJsLnNlbGVjdGVkQ2F0ZWdvcnlJZHgoKSAhPT0gLTEpKSA/IF8ubWFwKGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby51LW1hcmdpbmJvdHRvbS0yMCcsIGNhdGVnb3J5Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4taW5saW5lLmJ0bi1kYXJrW2hyZWY9XCIvcHJvamVjdHMvbmV3XCJdJywgJ0NvbWVjZSBvIHNldSBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250Y29sb3ItbmVnYXRpdmUnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihjYXRlZ29yeS50b3RhbF9zdWNjZXNzZnVsX3ZhbHVlLCAyLCAzKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250Y29sb3ItbmVnYXRpdmUnLCBjYXRlZ29yeS5zdWNjZXNzZnVsX3Byb2plY3RzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsICdQcm9qZXRvcyBmaW5hbmNpYWRvcycpLCAhXy5pc0VtcHR5KGN0cmwuZmVhdHVyZWRQcm9qZWN0cygpKSA/IF8ubWFwKGN0cmwuZmVhdHVyZWRQcm9qZWN0cygpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChwcm9qZWN0KSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudXNlci1hdmF0YXJbc3JjPVwiJHtwcm9qZWN0LnVzZXJUaHVtYn1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QudXNlci5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ2NhdGVnb3JpZXMucGxlZGdlZCcsIEkxOG5TY29wZSh7cGxlZGdlZDogaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKSwgY29udHJpYnV0b3JzOiBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9yc30pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIvJHtwcm9qZWN0LnBlcm1hbGlua31cIl1gLCBwcm9qZWN0Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2NhdGVnb3JpZXMubG9hZGluZ19mZWF0dXJlZCcsIEkxOG5TY29wZSgpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdjYXRlZ29yaWVzLm5vX2ZlYXR1cmVkJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuU2xpZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlczogdGVzdGltb25pYWxzKCksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBJMThuLnQoJ3Rlc3RpbW9uaWFsc190aXRsZScsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlci51LW1hcmdpbnRvcC0zMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgSTE4bi50KCdxYV90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgXy5tYXAoY3RybC5xdWVzdGlvbnMuY29sXzEsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIF8ubWFwKGN0cmwucXVlc3Rpb25zLmNvbF8yLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLnUtdGV4dC1jZW50ZXIuYmctcHVycGxlLmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNjAnLCAnQ3JpZSBvIHNldSByYXNjdW5obyBncmF0dWl0YW1lbnRlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybVthY3Rpb249XCIvcHJvamVjdHMvbmV3XCJdW21ldGhvZD1cIkdFVFwiXS53LXJvdy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCBJMThuLnQoJ2Zvcm0udGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwW25hbWU9XFwnbmFtZVxcJ11bdHlwZT1cXCd0ZXh0XFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS0xMCcsICduYSBjYXRlZ29yaWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQubWVkaXVtLnUtbWFyZ2luYm90dG9tLTQwW25hbWU9XFwnY2F0ZWdvcnlfaWRcXCddJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnb3B0aW9uW3ZhbHVlPVwiXCJdJywgSTE4bi50KCdmb3JtLnNlbGVjdF9kZWZhdWx0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwuY2F0ZWdvcmllcygpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgb3B0aW9uW3ZhbHVlPVwiJHtjYXRlZ29yeS5pZH1cIl1gLCBjYXRlZ29yeS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXB1c2gtNC51LW1hcmdpbnRvcC00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCIke0kxOG4udCgnZm9ybS5zdWJtaXQnLCBJMThuU2NvcGUoKSl9XCJdLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2VgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnByb2plY3QuSW5zaWdodHMgPSAoKG0sIGMsIGgsIG1vZGVscywgXywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmluc2lnaHRzJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbHRlcnNWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbnNpZ2h0c1ZNID0gYy5JbnNpZ2h0c1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpO1xuXG4gICAgICAgICAgICBmaWx0ZXJzVk0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbC5sb2FkKCkudGhlbihwcm9qZWN0RGV0YWlscyk7XG5cbiAgICAgICAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheS5nZXRSb3coZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICAgICAgbGV0IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gW1snRXN0YWRvJywgJ0Fwb2lvcycsICdSJCBhcG9pYWRvcyAoJSBkbyB0b3RhbCknXV07XG4gICAgICAgICAgICBjb25zdCBidWlsZFBlckxvY2F0aW9uVGFibGUgPSAoY29udHJpYnV0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShjb250cmlidXRpb25zKSkgPyBfLm1hcChfLmZpcnN0KGNvbnRyaWJ1dGlvbnMpLnNvdXJjZSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnN0YXRlX2Fjcm9ueW0gfHwgJ091dHJvL290aGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goW2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZCxbLy9BZGRpbmcgcm93IHdpdGggY3VzdG9tIGNvbXBhcmF0b3IgPT4gcmVhZCBwcm9qZWN0LWRhdGEtdGFibGUgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJyAoJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5nZXRSb3coZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkudGhlbihidWlsZFBlckxvY2F0aW9uVGFibGUpO1xuXG4gICAgICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlID0gW1tcbiAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl90YWJsZS5oZWFkZXIub3JpZ2luJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5jb250cmlidXRpb25zJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5hbW91bnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgIF1dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gLyhjdHJzZV9bYS16XSopLyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZS5leGVjKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3Qpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPSB0ZXN0WzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPyBJMThuLnQoJ3JlZmVycmFsLicgKyBjb250cmlidXRpb24ucmVmZXJyYWxfbGluaywgSTE4blNjb3BlKHtkZWZhdWx0VmFsdWU6IGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rfSkpIDogSTE4bi50KCdyZWZlcnJhbC5vdGhlcnMnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWwpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnICgnICsgY29udHJpYnV0aW9uLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWYuZ2V0Um93KGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpLnRoZW4oYnVpbGRQZXJSZWZUYWJsZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudCA9IChwcm9qZWN0TW9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAnYW9uJzogYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICdmbGV4JzogYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2Rlc1twcm9qZWN0TW9kZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgZmlsdGVyc1ZNOiBmaWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGU6IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZTogY29udHJpYnV0aW9uc1BlclJlZlRhYmxlLFxuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudDogZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IF8uZmlyc3QoY3RybC5wcm9qZWN0RGV0YWlscygpKSxcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlRvb2x0aXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSW5mb3JtYSBkZSBvbmRlIHZpZXJhbSBvcyBhcG9pb3MgZGUgc2V1IHByb2pldG8uIFNhaWJhIGNvbW8gdXNhciBlc3NhIHRhYmVsYSBlIHBsYW5lamFyIG1lbGhvciBzdWFzIGHDp8O1ZXMgZGUgY29tdW5pY2HDp8OjbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGFbaHJlZj1cIiR7STE4bi50KCdyZWZfdGFibGUuaGVscF91cmwnLCBJMThuU2NvcGUoKSl9XCJdW3RhcmdldD0nX2JsYW5rJ11gLCAnYXF1aS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzODBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWluc2lnaHRzJywgIWN0cmwubCgpID8gW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgfSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LWxvb3Nlci51LW1hcmdpbmJvdHRvbS0xMCcsIEkxOG4udCgnY2FtcGFpZ25fdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjdHJsLmV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudChwcm9qZWN0Lm1vZGUpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5zZWN0aW9uLmJnLWdyYXkuYmVmb3JlLWZvb3RlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWluLWhlaWdodCc6ICczMDBweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2Ftb3VudF9wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFDaGFydCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogSTE4bi50KCdjb250cmlidXRpb25zX3Blcl9kYXlfbGFiZWwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4QXhpczogKGl0ZW0pID0+IGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm5ld0ZlYXR1cmVCYWRnZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LnRvb2x0aXAtd3JhcHBlci5mYS5mYS1xdWVzdGlvbi1jaXJjbGUuZm9udGNvbG9yLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLXJlZicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgSTE4bi50KCdsb2NhdGlvbl9vcmlnaW5fdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogY3RybC5jb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6ICcnXG4gICAgICAgICAgICBdIDogaC5sb2FkZXIoKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5wcm9qZWN0LlNob3cgPSAoKG0sIGMsIF8sIG1vZGVscywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpZFZNID0gaC5pZFZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLnByb2plY3RfaWQoYXJncy5wcm9qZWN0X2lkKTtcbiAgICAgICAgICAgIGlkVk0uaWQoYXJncy5wcm9qZWN0X3VzZXJfaWQpO1xuXG4gICAgICAgICAgICBjb25zdCBsUHJvamVjdCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKHZtLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgIGxVc2VyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy51c2VyRGV0YWlsLmdldFJvd09wdGlvbnMoaWRWTS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICBsUmV3YXJkID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5yZXdhcmREZXRhaWwuZ2V0UGFnZU9wdGlvbnModm0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgICAgIGxQcm9qZWN0LmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgbFVzZXIubG9hZCgpLnRoZW4odXNlckRldGFpbHMpO1xuICAgICAgICAgICAgICAgIGxSZXdhcmQubG9hZCgpLnRoZW4ocmV3YXJkRGV0YWlscyk7XG5cbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyhkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHMsXG4gICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogcmV3YXJkRGV0YWlscyxcbiAgICAgICAgICAgICAgICBsUHJvamVjdDogbFByb2plY3QsXG4gICAgICAgICAgICAgICAgbFVzZXI6IGxVc2VyLFxuICAgICAgICAgICAgICAgIGxSZXdhcmQ6IGxSZXdhcmRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoIShjdHJsLmxQcm9qZWN0KCkgfHwgY3RybC5sVXNlcigpIHx8IGN0cmwubFJld2FyZCgpKSkgPyBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXNob3cnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogaC5taXhwYW5lbFRyYWNrKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdEhlYWRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBjdHJsLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RUYWJzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNYWluLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgc3RhdGU6ICdlcScsXG4gICAgICAgICAgICBnYXRld2F5OiAnZXEnLFxuICAgICAgICAgICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICAgICAgICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLnN0YXRlKCcnKTtcbiAgICB2bS5nYXRld2F5KCcnKTtcbiAgICB2bS5vcmRlcih7XG4gICAgICAgIGlkOiAnZGVzYydcbiAgICB9KTtcblxuICAgIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICAgIH07XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgZGVhY3RpdmF0ZWRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLmRlYWN0aXZhdGVkX2F0KG51bGwpLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IEpTT04ucGFyc2Uodm0uZGVhY3RpdmF0ZWRfYXQoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5jb250cmlidXRpb24ucHJvamVjdEZpbHRlcnMgPSAoKG0sIGgsIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiAoKSA9PntcbiAgICAgICAgY29uc3QgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcblxuICAgICAgICAgICAgICBuZWFyTWUgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG5lYXJfbWU6ICdlcScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb25saW5lX2RhdGU6ICdndCdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm5lYXJfbWUodHJ1ZSkub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoMzAsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIGV4cGlyaW5nID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiAnbHRlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSxcblxuICAgICAgICAgICAgICByZWNlbnQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3RlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkucmVjb21tZW5kZWQoJ3RydWUnKS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJyksXG5cbiAgICAgICAgICAgICAgb25saW5lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBzdWNjZXNzZnVsID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIGV4cGlyZXNfYXQ6ICdndCdcbiAgICAgICAgICAgICAgfSkuc3RhdGUoJ3N1Y2Nlc3NmdWwnKS5leHBpcmVzX2F0KG1vbWVudCgpLnN1YnRyYWN0KDMwLCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVjb21tZW5kZWQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY29tZW5kYWRvcycsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiByZWNvbW1lbmRlZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ubGluZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnTm8gYXInLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogb25saW5lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXhwaXJpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JldGEgZmluYWwnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZXhwaXJpbmdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdCZW0tc3VjZWRpZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWNlbnQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY2VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5lYXJfbWU6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIG1pbScsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBuZWFyTWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Lm1vbWVudCkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9