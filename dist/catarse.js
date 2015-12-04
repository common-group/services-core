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
    var hashMatch = function hashMatch(str) {
        return window.location.hash === str;
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
            p(p() === alternateState ? defaultState : alternateState);
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
        toAnchor: toAnchor
    };
})(window.m, window.moment);
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
        category = m.postgrest.model('categories'),
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
        category: category,
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

            var reload = _.compose(builder.model.getRow, h.idVM.id(item[builder.updateKey]).parameters),
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
                return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-24', [m('.fontcolor-secondary', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', cEvent.template_name)])]);
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
            return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name)]), m('.fontsize-smallest', 'Usuário: ' + user.id), m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data || m('')])]);
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
            }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)), m('p.fontsize-base.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(c.ProjectRewardList, {
                project: project,
                rewardDetails: args.rewardDetails
            }), fundingPeriod()] : [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), m.component(c.ProjectSuggestedContributions, { project: project }), fundingPeriod()])]);
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.ProjectCard = (function (m, h, models) {
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
            }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter.' + project.state, [project.state === 'successful' ? m('div', 'Bem-sucedido') : project.state === 'failed' ? m('div', 'Não-financiado') : project.state === 'waiting_funds' ? m('div', 'Prazo encerrado') : m('.meter', [m('.meter-fill', {
                style: {
                    width: (progress > 100 ? 100 : progress) + '%'
                }
            })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [m('.fontsize-smallest.lineheight-tight', ['Prazo em', m('br'), 'aberto'])])])])])]);
        }
    };
})(window.m, window.c.h, window._);
'use strict';

window.c.ProjectComments = (function (m) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            return m('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]');
        }
    };
})(window.m);
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
 *      ]
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

            return {
                table: table,
                sortTable: sortTable
            };
        },
        view: function view(ctrl, args) {
            var header = _.first(ctrl.table()),
                body = _.rest(ctrl.table());
            return m('.project-contributions-per-location', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _.map(header, function (heading, idx) {
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
            }))])]);
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
            }), m('.project-blurb', project.headline), m('.u-text-center-small-only.u-marginbottom-30', [!_.isNull(project.address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore#near_of/' + project.address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project.category_id + '"]', [m('span.fa.fa-tag'), ' ', project.category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
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

                h.fbParse();

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

            return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('img[src="' + modeImgSrc + '"][width=\'30\']')]), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-smaller.fontweight-semibold', 'Meta R$ ' + goal), m('.w-inline-block.fontsize-smallest._w-inline-block', [modeTitle, tooltip('span.w-inline-block._w-inline-block.fa.fa-question-circle.fontcolor-secondary')])])]);
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
                inReminder = h.toggleProp(false, true),
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
                var loaderOpts = inReminder() ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                    project_id: project.id
                });
                l = m.postgrest.loaderWithToken(loaderOpts);

                l.load().then(function () {
                    inReminder.toggle();

                    if (inReminder()) {
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
            inReminder(project.in_reminder);

            return {
                inReminder: inReminder,
                submitReminder: submitReminder,
                l: l,
                popNotification: popNotification
            };
        },
        view: function view(ctrl, args) {
            var mainClass = args.type === 'button' ? '' : '.u-text-center.u-marginbottom-30',
                buttonClass = args.type === 'button' ? 'w-button btn btn-terciary btn-no-border' : 'btn-link link-hidden fontsize-small';

            return m('#project-reminder' + mainClass, [m('button[class="' + buttonClass + ' ' + (ctrl.inReminder() ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
                onclick: ctrl.submitReminder
            }, [ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', ctrl.inReminder() ? ' Lembrete ativo' : ' Lembrar-me')]), ctrl.popNotification() ? m.component(c.PopNotification, {
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

window.c.ProjectRow = (function (m, _) {
    return {
        view: function view(ctrl, args) {
            var collection = args.collection,
                ref = args.ref,
                wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';
            return collection.collection().length > 0 ? m(wrapper, [m('.w-container', [!_.isUndefined(collection.title) || !_.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', m('.w-row', _.map(collection.collection(), function (project) {
                return m.component(c.ProjectCard, {
                    project: project,
                    ref: ref
                });
            }))])]) : m('');
        }
    };
})(window.m, window._);
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

window.c.ProjectSidebar = (function (m, h, c) {
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
                    'approved': 'Esse projeto já foi aprovado pelo Catarse. Em breve ele entrará no ar e estará pronto para receber apoios.',
                    'online': h.existy(project.zone_expires_at) ? 'Você pode apoiar este projeto até o dia ' + h.momentify(project.zone_expires_at) + ' às 23h59m59s' : '',
                    'failed': 'Este projeto não atingiu o mínimo de R$ ' + h.formatNumber(project.goal) + ' até ' + h.momentify(project.zone_expires_at) + ' e não foi financiado',
                    'rejected': 'Este projeto não foi aceito. Não é possível realizar um apoio.',
                    'in_analysis': 'Este projeto está em análise e ainda não está aberto para receber apoios.',
                    'successful': 'Este projeto foi financiado em ' + h.momentify(project.zone_expires_at),
                    'waiting_funds': 'O prazo de captação desse projeto está encerrado. Estamos aguardando a confirmação dos últimos pagamentos.',
                    'draft': 'Este projeto é apenas um rascunho e ainda não pode receber apoios.'
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
                elapsed = h.translatedTime(project.elapsed_time),
                remaining = h.translatedTime(project.remaining_time);

            return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-small.u-text-center-small-only', ['apoiados por ', m('span#contributors.fontweight-semibold', parseInt(project.total_contributors) + ' pessoas'), !remaining.total ? ' em ' + elapsed.total + ' ' + elapsed.unit : ''])]), m('.meter', [m('#progressBar.meter-fill', {
                style: {
                    width: project.progress + '%'
                }
            })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', parseInt(project.progress) + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining.total ? [m('span.fontweight-semibold', remaining.total), ' ' + remaining.unit + ' restantes'] : '')])])]), m('.w-row', [m.component(c.ProjectMode, {
                project: project
            })])]), project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar este projeto') : '', project.open_for_contributions ? m.component(c.ProjectReminder, {
                project: project,
                type: 'link'
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + ctrl.displayCardClass() + '"]', ctrl.displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
                userDetails: args.userDetails
            }))]);
        }
    };
})(window.m, window.c.h, window.c);
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

            var mainClass = !ctrl.isFixed() ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

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
            }, ['Comentários ', m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))])]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project.open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6', [m('a.w-button.btn[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6', [m.component(c.ProjectReminder, { project: project, type: 'button' })])])] : '')])])]), ctrl.isFixed() ? m('.w-section.project-nav') : '']);
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
                            console.log('Positioning center');
                            left(-el.offsetWidth / 2); //Positioning to the center
                        } else if (parentOffset().left + el.offsetWidth / 2 > window.innerWidth) {
                                console.log('Positioning right');
                                left(-el.offsetWidth + el.offsetParent.offsetWidth); //Positioning to the left
                            } else if (parentOffset().left - el.offsetWidth / 2 < 0) {
                                    console.log('positioning left');
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
                onmouseenter: ctrl.toggle,
                onmouseleave: ctrl.toggle,
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
                byCategory = filters({ state_order: 'gte', category_id: 'eq' }).state_order('published'),
                projects = m.postgrest.paginationVM(c.models.project, 'project_id.desc'),
                filtersMap = c.contribution.projectFilters(),
                categoryCollection = m.prop([]),
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
                    loadProjects = function loadProjects(pageTitle, filter, selectedCategory) {
                    title(pageTitle);
                    categoryId(selectedCategory && selectedCategory.id);
                    projects.firstPage(filter.order({
                        open_for_contributions: 'desc',
                        state_order: 'asc',
                        project_id: 'desc'
                    }).parameters());
                    toggleCategories.toggle();
                },
                    categoryFromRoute = function categoryFromRoute() {
                    return route && route[2] && findCategory(route[2]);
                },
                    filterFromRoute = function filterFromRoute() {
                    var cat = categoryFromRoute();
                    return route && route[1] && filtersMap[route[1]] || cat && { title: cat.name, filter: byCategory.category_id(cat.id) };
                },
                    filter = filterFromRoute() || filtersMap.recommended;

                return loadProjects(filter.title, filter.filter, categoryFromRoute());
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
            return [m('.w-section.hero-search', [m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a.link-hidden-white.fontweight-light.fontsize-larger[href=\'#\']', { onclick: function onclick() {
                    ctrl.toggleCategories.toggle();return false;
                } }, ['Explore projetos incríveis ', m('span.fa.fa-angle-down', '')])]), m('#categories.category-slider', ctrl.toggleCategories() ? [m('.w-row', [_.map(ctrl.categories(), function (category) {
                return m.component(c.CategoryButton, { category: category });
            })]), m('.w-row.u-marginbottom-30', [_.map(ctrl.filtersMap, function (filter, href) {
                return m.component(c.FilterButton, { title: filter.title, href: href });
            })])] : '')])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-6.w-col-small-7.w-col-tiny-7', [m('.fontsize-larger', ctrl.title())]), _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-small-5.w-col-tiny-5', [m('.w-row', [m('.w-col.w-col-8.w-hidden-small.w-hidden-tiny.w-clearfix', [m('.following.fontsize-small.fontcolor-secondary.u-right', ctrl.category().followers + ' seguidores')]), m('.w-col.w-col-4.w-col-small-12.w-col-tiny-12', [ctrl.category().following ? m('a.btn.btn-medium.btn-terciary.unfollow-btn[href=\'#\']', { onclick: ctrl.unFollowCategory(ctrl.category().id) }, 'Deixar de seguir') : m('a.btn.btn-medium.follow-btn[href=\'#\']', { onclick: ctrl.followCategory(ctrl.category().id) }, 'Seguir')])])]) : ''])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _.map(ctrl.projects.collection(), function (project) {
                return m.component(c.ProjectCard, { project: project });
            })), ctrl.projects.isLoading() ? h.loader() : ''])])]), m('.w-section.section.loadmore', [m('.w-container', [m('.w-row', [m('.w-col.w-col-5'), m('.w-col.w-col-2', [m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: ctrl.projects.nextPage }, 'Carregar mais')]), m('.w-col.w-col-5')])])])];
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
                return collection.loader() ? h.loader() : m.component(c.ProjectRow, {
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
            }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistencialistas, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m('.w-section.section', [m('.w-container', [m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça os primeiros projetos flex'), ctrl.projectsLoader() ? h.loader() : m.component(c.ProjectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m('.w-section.divider'), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(c.landingQA, {
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
'use strict';

window.c.pages.Team = (function (m, c) {
    return {
        view: function view() {
            return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
        }
    };
})(window.m, window.c);
'use strict';

window.c.project.Insights = (function (m, c, h, models, _) {
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

            var contributionsPerRefTable = [['Fonte', 'Apoios', 'R$ apoiados (% do total)']];
            var buildPerRefTable = function buildPerRefTable(contributions) {
                return !_.isEmpty(contributions) ? _.map(_.first(contributions).source, function (contribution) {
                    var column = [];

                    column.push(contribution.referral_link || 'direto');
                    column.push(contribution.total);
                    column.push([contribution.total_amount, [//Adding row with custom comparator => read project-data-table description
                    m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_amount, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
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
            var project = _.first(ctrl.projectDetails());

            return m('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                project: project
            }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'), m.component(c.AdminProjectDetailsCard, {
                resource: project
            }), m.component(ctrl.explanationModeComponent(project.mode), {
                resource: project
            })]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: 'R$ arrecadados por dia',
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
                label: 'Apoios confirmados por dia',
                dataKey: 'total',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectDataTable, {
                label: 'Localização geográfica dos apoios',
                table: ctrl.contributionsPerLocationTable
            })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectDataTable, {
                label: 'Origem dos apoios',
                table: ctrl.contributionsPerRefTable
            })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, {
                resource: project
            })])])])])] : ''] : h.loader());
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window._);
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
"use strict";

window.c.admin.contributionListVM = (function (m, models) {
    return m.postgrest.paginationVM(models.contributionDetail);
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
"use strict";

window.c.admin.userListVM = (function (m, models) {
    return m.postgrest.paginationVM(models.user);
})(window.m, window.c.models);
'use strict';

window.c.contribution.projectFilters = (function (m, h, moment) {
    return function () {
        var filters = m.postgrest.filtersVM,
            nearMe = filters({
            near_me: 'eq',
            open_for_contributions: 'eq'
        }).near_me(true),
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
            state: 'eq'
        }).state('successful');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLW5vdGlmaWNhdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWNhcmQuanMiLCJhZG1pbi1wcm9qZWN0LmpzIiwiYWRtaW4tcmFkaW8tYWN0aW9uLmpzIiwiYWRtaW4tcmVzZXQtcGFzc3dvcmQuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLWRldGFpbC5qcyIsImFkbWluLXVzZXItaXRlbS5qcyIsImFkbWluLXVzZXIuanMiLCJhb24tYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiY2F0ZWdvcnktYnV0dG9uLmpzIiwiZmlsdGVyLWJ1dHRvbi5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwiZmxleC1wcm9qZWN0LWRldGFpbHMtZXhwbGFuYXRpb24uanMiLCJsYW5kaW5nLXFhLmpzIiwibGFuZGluZy1zaWdudXAuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInBvcC1ub3RpZmljYXRpb24uanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtZGFzaGJvYXJkLW1lbnUuanMiLCJwcm9qZWN0LWRhdGEtY2hhcnQuanMiLCJwcm9qZWN0LWRhdGEtdGFibGUuanMiLCJwcm9qZWN0LWhlYWRlci5qcyIsInByb2plY3QtaGlnaGxpZ2h0LmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1tb2RlLmpzIiwicHJvamVjdC1wb3N0cy5qcyIsInByb2plY3QtcmVtaW5kZXItY291bnQuanMiLCJwcm9qZWN0LXJlbWluZGVyLmpzIiwicHJvamVjdC1yZXdhcmQtbGlzdC5qcyIsInByb2plY3Qtcm93LmpzIiwicHJvamVjdC1zaGFyZS1ib3guanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItY2FyZC5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMuanMiLCJhZG1pbi91c2Vycy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0cy1leHBsb3JlLmpzIiwiY29udHJpYnV0aW9uL3Byb2plY3RzLWhvbWUuanMiLCJwYWdlcy9mbGV4LmpzIiwicGFnZXMvbGl2ZS1zdGF0aXN0aWNzLmpzIiwicGFnZXMvdGVhbS5qcyIsInByb2plY3QvaW5zaWdodHMuanMiLCJwcm9qZWN0L3Nob3cuanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1saXN0LXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1maWx0ZXItdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWxpc3Qtdm0uanMiLCJjb250cmlidXRpb24vdm1zL3Byb2plY3RzLXZtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxDQUFDLEdBQUks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QkFBTSxFQUFFLFVBQVU7YUFDckI7QUFDRCxrQkFBTSxFQUFFO0FBQ0oscUJBQUssRUFBRSxVQUFVO0FBQ2pCLHNCQUFNLEVBQUUsTUFBTTthQUNqQjtBQUNELG1CQUFPLEVBQUU7QUFDTCxxQkFBSyxFQUFFLGdCQUFnQjtBQUN2QixzQkFBTSxFQUFFLE1BQU07YUFDakI7U0FDSixDQUFDO0tBQ0wsQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbHM6IHt9LFxuICAgICAgICBwYWdlczoge30sXG4gICAgICAgIGNvbnRyaWJ1dGlvbjoge30sXG4gICAgICAgIGFkbWluOiB7fSxcbiAgICAgICAgcHJvamVjdDoge30sXG4gICAgICAgIGg6IHt9XG4gICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKChtLCBtb21lbnQpID0+IHtcbiAgICAvL0RhdGUgSGVscGVyc1xuICAgIGNvbnN0IGhhc2hNYXRjaCA9IChzdHIpID0+IHtyZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IHN0cjt9LFxuXG4gICAgICAgICAgc2V0TW9tZW50aWZ5TG9jYWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgICBtb21lbnQubG9jYWxlKCdwdCcsIHtcbiAgICAgICAgICAgICAgICAgIG1vbnRoc1Nob3J0OiAnamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXonLnNwbGl0KCdfJylcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGV4aXN0eSA9ICh4KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB4ICE9IG51bGw7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIG1vbWVudGlmeSA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGUgPyBtb21lbnQoZGF0ZSkubG9jYWxlKCdwdCcpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzdG9yZUFjdGlvbiA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGFjdGlvbiwgYWN0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBjYWxsU3RvcmVkQWN0aW9uID0gKGFjdGlvbiwgZnVuYykgPT4ge1xuICAgICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgICBmdW5jLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGFjdGlvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZGlzY3VzcyA9IChwYWdlLCBpZGVudGlmaWVyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGQgPSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICAgICAgcyA9IGQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgIHdpbmRvdy5kaXNxdXNfY29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gcGFnZTtcbiAgICAgICAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcy5zcmMgPSAnLy9jYXRhcnNlZmxleC5kaXNxdXMuY29tL2VtYmVkLmpzJztcbiAgICAgICAgICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXN0YW1wJywgK25ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAoZC5oZWFkIHx8IGQuYm9keSkuYXBwZW5kQ2hpbGQocyk7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcnKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbW9tZW50RnJvbVN0cmluZyA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXVyb3BlYW4gPSBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XG4gICAgICAgICAgICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdHJhbnNsYXRlZFRpbWVVbml0cyA9IHtcbiAgICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICAgIGhvdXJzOiAnaG9yYXMnLFxuICAgICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICAgICAgICAgIHRyYW5zbGF0ZWRUaW1lID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZFRpbWUgPSB0cmFuc2xhdGVkVGltZVVuaXRzLFxuICAgICAgICAgICAgICAgICAgICB1bml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvalVuaXQgPSB0cmFuc2xhdGVkVGltZVt0aW1lLnVuaXQgfHwgJ3NlY29uZHMnXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aW1lLnRvdGFsIDw9IDEpID8gcHJvalVuaXQuc2xpY2UoMCwgLTEpIDogcHJvalVuaXQ7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIHVuaXQ6IHVuaXQoKSxcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiB0aW1lLnRvdGFsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICAgICAgICAgIGdlbmVyYXRlRm9ybWF0TnVtYmVyID0gKHMsIGMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChudW1iZXIsIG4sIHgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICghXy5pc051bWJlcihudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gICAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICAgICAgICAgICAgcC50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgICB9KSxcblxuICAgICAgICAgIGdldFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gXy5maXJzdChib2R5KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcicpO1xuICAgICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYWN0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgICAgICByZXR1cm4gYWN0aW9uID09PSBhY3Q7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdCA9IChhdmF0YXJQYXRoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLy9UZW1wbGF0ZXNcbiAgICAgICAgICBsb2FkZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMCB1LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB0cnlQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcGx1cmFsaXplID0gKGNvdW50LCBzLCBwKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2ltcGxlRm9ybWF0ID0gKHN0ciA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHJcXG4/LywgJ1xcbicpO1xuICAgICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHJld2FyZFNvdWxkT3V0ID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICByZXdhcmRSZW1hbmluZyA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcGFyc2VVcmwgPSAoaHJlZikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbWl4cGFuZWxUcmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LkNhdGFyc2VNaXhwYW5lbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBVSUhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVUlIZWxwZXIuc2V0dXBSZXNwb25zaXZlSWZyYW1lcygkKGVsKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHRvQW5jaG9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2ggPT09IGVsLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdmFsaWRhdGVFbWFpbCA9IChlbWFpbCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByZSA9IC9eKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXStcXC4pK1tePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl17Mix9KSQvaTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBuYXZpZ2F0ZVRvRGV2aXNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvcHQvbG9naW4nO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGN1bXVsYXRpdmVPZmZzZXQgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDA7XG4gICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcCAgfHwgMDtcbiAgICAgICAgICAgICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDA7XG4gICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQ7XG4gICAgICAgICAgICAgIH0gd2hpbGUgKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgY2xvc2VGbGFzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaWNvbi1jbG9zZScpWzBdO1xuICAgICAgICAgICAgICBpZiAoXy5pc0VsZW1lbnQoZWwpKXtcbiAgICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgZWwucGFyZW50RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuICAgIGNsb3NlRmxhc2goKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQ6IGN1bXVsYXRpdmVPZmZzZXQsXG4gICAgICAgIGRpc2N1c3M6IGRpc2N1c3MsXG4gICAgICAgIGV4aXN0eTogZXhpc3R5LFxuICAgICAgICB2YWxpZGF0ZUVtYWlsOiB2YWxpZGF0ZUVtYWlsLFxuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBmYlBhcnNlOiBmYlBhcnNlLFxuICAgICAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICAgICAgc2ltcGxlRm9ybWF0OiBzaW1wbGVGb3JtYXQsXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lOiB0cmFuc2xhdGVkVGltZSxcbiAgICAgICAgcmV3YXJkU291bGRPdXQ6IHJld2FyZFNvdWxkT3V0LFxuICAgICAgICByZXdhcmRSZW1hbmluZzogcmV3YXJkUmVtYW5pbmcsXG4gICAgICAgIHBhcnNlVXJsOiBwYXJzZVVybCxcbiAgICAgICAgaGFzaE1hdGNoOiBoYXNoTWF0Y2gsXG4gICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdDogdXNlQXZhdGFyT3JEZWZhdWx0LFxuICAgICAgICBsb2NhdGlvbkFjdGlvbk1hdGNoOiBsb2NhdGlvbkFjdGlvbk1hdGNoLFxuICAgICAgICBtaXhwYW5lbFRyYWNrOiBtaXhwYW5lbFRyYWNrLFxuICAgICAgICBuYXZpZ2F0ZVRvRGV2aXNlOiBuYXZpZ2F0ZVRvRGV2aXNlLFxuICAgICAgICBzdG9yZUFjdGlvbjogc3RvcmVBY3Rpb24sXG4gICAgICAgIGNhbGxTdG9yZWRBY3Rpb246IGNhbGxTdG9yZWRBY3Rpb24sXG4gICAgICAgIFVJSGVscGVyOiBVSUhlbHBlcixcbiAgICAgICAgdG9BbmNob3I6IHRvQW5jaG9yXG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKSB7XG4gICAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICAgICAgICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICAgICAgICB1c2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJzJyksXG4gICAgICAgIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9yZW1pbmRlcnMnKSxcbiAgICAgICAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgICAgIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfcmVmJyksXG4gICAgICAgIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgICAgICAgY2F0ZWdvcnkgPSBtLnBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcmllcycpLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X2ZvbGxvd2VycycpLFxuICAgICAgICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpLFxuICAgICAgICBub3RpZmljYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgnbm90aWZpY2F0aW9ucycpLFxuICAgICAgICBzdGF0aXN0aWMgPSBtLnBvc3RncmVzdC5tb2RlbCgnc3RhdGlzdGljcycpO1xuXG4gICAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gICAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbiAgICBwcm9qZWN0LnBhZ2VTaXplKDMwKTtcbiAgICBjYXRlZ29yeS5wYWdlU2l6ZSg1MCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICAgICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgICAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgIGNhdGVnb3J5Rm9sbG93ZXI6IGNhdGVnb3J5Rm9sbG93ZXIsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWY6IHByb2plY3RDb250cmlidXRpb25zUGVyUmVmLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbDogcHJvamVjdFBvc3REZXRhaWwsXG4gICAgICAgIHByb2plY3RSZW1pbmRlcjogcHJvamVjdFJlbWluZGVyLFxuICAgICAgICBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbixcbiAgICAgICAgc3RhdGlzdGljOiBzdGF0aXN0aWNcbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb25EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBsO1xuICAgICAgICAgICAgY29uc3QgbG9hZFJld2FyZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlbCA9IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkX2lkID0gYXJncy5pdGVtLnJld2FyZF9pZCxcbiAgICAgICAgICAgICAgICAgICAgb3B0cyA9IG1vZGVsLmdldFJvd09wdGlvbnMoaC5pZFZNLmlkKHJld2FyZF9pZCkucGFyYW1ldGVycygpKSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkID0gbS5wcm9wKHt9KTtcbiAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG9wdHMpO1xuICAgICAgICAgICAgICAgIGlmIChyZXdhcmRfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihfLmNvbXBvc2UocmV3YXJkLCBfLmZpcnN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXdhcmQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gbG9hZFJld2FyZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3VzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnVHJhbnNmZXJpcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnSWQgZG8gbm92byBhcG9pYWRvcjonLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTI5OTA4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnQXBvaW8gdHJhbnNmZXJpZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXk6ICdwcm9qZWN0X2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RLZXk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9zOiAncmV3YXJkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBbHRlcmFyIFJlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TW9kZWw6IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlOiAocmV3YXJkcywgbmV3UmV3YXJkSUQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV3YXJkID0gXy5maW5kV2hlcmUocmV3YXJkcywge2lkOiBuZXdSZXdhcmRJRH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYXJncy5pdGVtLnZhbHVlID49IHJld2FyZC5taW5pbXVtX3ZhbHVlKSA/IHVuZGVmaW5lZCA6ICdWYWxvciBtw61uaW1vIGRhIHJlY29tcGVuc2Egw6kgbWFpb3IgZG8gcXVlIG8gdmFsb3IgZGEgY29udHJpYnVpw6fDo28uJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVmdW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWVtYm9sc28gZGlyZXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlZW1ib2xzYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlZW1ib2xzYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIGFwYWdhciBlc3NlIGFwb2lvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnQXBhZ2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbDogbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIHJld2FyZCA9IGN0cmwucmV3YXJkO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRPcHRpb25zID0gKGJ1aWxkZXIsIGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBidWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IChgL2FkbWluL2NvbnRyaWJ1dGlvbnMvJHtpZH0vZ2F0ZXdheV9yZWZ1bmRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnRyYW5zZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpKSA/IGgubG9hZGVyIDpcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJhZGlvQWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEtleVZhbHVlOiBpdGVtLnByb2plY3RfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZTogaXRlbS5jb250cmlidXRpb25faWRcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlZnVuZCwgaXRlbS5pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMucmVtb3ZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZDogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmtleVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uSXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAnLnctcm93JyxcbiAgICAgICAgICAgICAgICBfLm1hcChjdHJsLml0ZW1CdWlsZGVyLCBmdW5jdGlvbihwYW5lbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShwYW5lbC53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbcGFuZWwuY29tcG9uZW50XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgY29tcG9uZW50XG4gKiBBbiBpdGVtYnVpbGRlciBjb21wb25lbnQgdGhhdCByZXR1cm5zIGFkZGl0aW9uYWwgZGF0YVxuICogdG8gYmUgaW5jbHVkZWQgaW4gQWRtaW5Vc2VyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4ge1xuICogICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAqICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gKiAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAqICAgICAgICAgfV1cbiAqICAgICB9XG4gKiB9XG4gKi9cbndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uVXNlciA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICB1c2VyID0ge1xuICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1nX3RodW1ibmFpbDogaXRlbS51c2VyX3Byb2ZpbGVfaW1nLFxuICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS51c2VyX25hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgZW1haWw6IGl0ZW0uZW1haWwsXG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0dhdGV3YXk6ICcgKyBpdGVtLnBheWVyX2VtYWlsKTtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluVXNlciwge2l0ZW06IHVzZXIsIGFkZGl0aW9uYWxfZGF0YTogYWRkaXRpb25hbERhdGF9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEIGRvIEdhdGV3YXk6ICcsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiBjb21wb25lbnRcbiAqIE1ha2VzIGFyYml0cmFyeSBhamF4IHJlcXVlc3RzIGFuZCB1cGRhdGUgdW5kZXJseWluZ1xuICogZGF0YSBmcm9tIHNvdXJjZSBlbmRwb2ludC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pbkV4dGVybmFsQWN0aW9uID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucy5jb25maWcgPSAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKVswXS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWQgPSBfLmNvbXBvc2UoYnVpbGRlci5tb2RlbC5nZXRSb3csIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSkucGFyYW1ldGVycyksXG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcihidWlsZGVyLnJlcXVlc3RPcHRpb25zLCBtLnJlcXVlc3QpO1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICByZWxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHJlbG9hZEl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZXF1aXNpw6fDo28gZmVpdGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJycsXG4gICAgICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGZvcmNlVmFsdWUpO1xuXG4gICAgICAgICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICAgICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgZGF0YS5zdWNjZXNzTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYXJncy5saXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChhcmdzLmxpc3REZXRhaWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2FycmVnYW5kbyAke2xhYmVsLnRvTG93ZXJDYXNlKCl9Li4uYCA6IFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCBgICR7bGFiZWwudG9Mb3dlckNhc2UoKX0gZW5jb250cmFkb3NgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBhcmdzLmxpc3RJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYXJncy5saXN0RGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgY29tcG9uZW50XG4gKiBSZXR1cm4gbm90aWZpY2F0aW9ucyBsaXN0IGZyb20gYW4gVXNlciBvYmplY3QuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gKiAgICAgdXNlcjogdXNlclxuICogfSlcbiAqL1xuXG53aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgPSAoKG0sIGgsIF8sIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZXROb3RpZmljYXRpb25zID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG1vZGVscy5ub3RpZmljYXRpb247XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5nZXRQYWdlV2l0aFRva2VuKG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2lzLm51bGwnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC51c2VyX2lkKHVzZXIuaWQpXG4gICAgICAgICAgICAgICAgICAgIC5zZW50X2F0KCFudWxsKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2Rlc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXJzKCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGlmaWNhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMoYXJncy51c2VyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25zOiBub3RpZmljYXRpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkZSBub3RpZmljYcOnw7VlcycpLFxuICAgICAgICAgICAgICAgIGN0cmwubm90aWZpY2F0aW9ucygpLm1hcCgoY0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNFdmVudC5zZW50X2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgLSAnLCBjRXZlbnQudGVtcGxhdGVfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBib3ggd2l0aCBzb21lIHByb2plY3Qgc3RhdGlzdGljcyBpbmZvXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQsIHtcbiAqICAgICByZXNvdXJjZTogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCA9ICgobSwgaCwgbW9tZW50KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVN0YXR1c1RleHQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGF0dXNUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ05PIEFSJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0FHVUFSREFORE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3RlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkVDVVNBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFmdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSQVNDVU5ITydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0VNIEFOw4FMSVNFJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQVBST1ZBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNUZXh0T2JqO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNGaW5hbExhcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQFRPRE86IHVzZSA4IGRheXMgYmVjYXVzZSB0aW1lem9uZSBvbiBqc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIV8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgJiYgbW9tZW50KCkuYWRkKDgsICdkYXlzJykgPj0gbW9tZW50KHByb2plY3Quem9uZV9leHBpcmVzX2F0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmo6IGdlbmVyYXRlU3RhdHVzVGV4dCgpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSksXG4gICAgICAgICAgICAgICAgZWxhcHNlZFRleHRPYmo6IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5lbGFwc2VkX3RpbWUpLFxuICAgICAgICAgICAgICAgIGlzRmluYWxMYXA6IGlzRmluYWxMYXBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gY3RybC5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmogPSBjdHJsLnN0YXR1c1RleHRPYmooKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gY3RybC5yZW1haW5pbmdUZXh0T2JqLFxuICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqID0gY3RybC5lbGFwc2VkVGV4dE9iajtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoY3RybC5pc0ZpbmFsTGFwKCkgJiYgcHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ1JFVEEgRklOQUwnIDogc3RhdHVzVGV4dE9iai50ZXh0KSksICfCoCdcbiAgICAgICAgICAgICAgICAgICAgXSksICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpICsgJyUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdmaW5hbmNpYWRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnbGV2YW50YWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnaW5pY2lhZG8gaMOhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBlbGFwc2VkVGV4dE9iai50b3RhbCArICcgJyArIGVsYXBzZWRUZXh0T2JqLnVuaXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdyZXN0YW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsICsgJyAnICsgcmVtYWluaW5nVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgICAgICAgICB9KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXByb2plY3QnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5SYWRpb0FjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICAvL1RPRE86IEltcGxlbWVudCBhIGRlc2NyaXB0b3IgdG8gYWJzdHJhY3QgdGhlIGluaXRpYWwgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSgpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gbS5wcm9wKGl0ZW0uZGVzY3JpcHRpb24gfHwgJycpLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIG5ld0lEID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBnZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICAgICAgICBnZXRBdHRyID0gYnVpbGRlci5yYWRpb3MsXG4gICAgICAgICAgICAgICAgZ2V0S2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgICAgICAgZ2V0S2V5VmFsdWUgPSBhcmdzLmdldEtleVZhbHVlLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleSA9IGJ1aWxkZXIudXBkYXRlS2V5LFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleVZhbHVlID0gYXJncy51cGRhdGVLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZSA9IGJ1aWxkZXIudmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtID0gYnVpbGRlci5zZWxlY3RlZEl0ZW0gfHwgbS5wcm9wKCk7XG5cbiAgICAgICAgICAgIHNldEZpbHRlclt1cGRhdGVLZXldID0gJ2VxJztcbiAgICAgICAgICAgIHZhciBzZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgICAgICAgc2V0Vk1bdXBkYXRlS2V5XSh1cGRhdGVLZXlWYWx1ZSk7XG5cbiAgICAgICAgICAgIGdldEZpbHRlcltnZXRLZXldID0gJ2VxJztcbiAgICAgICAgICAgIHZhciBnZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgICAgICAgZ2V0Vk1bZ2V0S2V5XShnZXRLZXlWYWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciBnZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5nZXRNb2RlbC5nZXRQYWdlT3B0aW9ucyhnZXRWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgdmFyIHNldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gXy5maW5kV2hlcmUocmFkaW9zKCksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhWzBdW2J1aWxkZXIuc2VsZWN0S2V5XVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtKG5ld0l0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdOZW5odW0gaXRlbSBhdHVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBmZXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGdldExvYWRlci5sb2FkKCkudGhlbihyYWRpb3MsIGVycm9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3SUQoKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsaWRhdGlvbiA9IHZhbGlkYXRlKHJhZGlvcygpLCBuZXdJRCgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsaWRhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbYnVpbGRlci5zZWxlY3RLZXldID0gbmV3SUQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB2YWxpZGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0lEKCcnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldERlc2NyaXB0aW9uID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uKHRleHQpO1xuICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmZXRjaCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgc2V0RGVzY3JpcHRpb246IHNldERlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBzZXRMb2FkZXI6IHNldExvYWRlcixcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXI6IGdldExvYWRlcixcbiAgICAgICAgICAgICAgICBuZXdJRDogbmV3SUQsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZCxcbiAgICAgICAgICAgICAgICByYWRpb3M6IHJhZGlvc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSgpLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLnJhZGlvcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCBmdW5jdGlvbihyYWRpbywgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubmV3SUQocmFkaW8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldERlc2NyaXB0aW9uKHJhZGlvLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChyYWRpby5pZCA9PT0gKGl0ZW1bZGF0YS5zZWxlY3RLZXldIHx8IGl0ZW0uaWQpKSA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yYWRpbycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjci0nICsgaW5kZXggKyAnLnctcmFkaW8taW5wdXRbdHlwZT1yYWRpb11bbmFtZT1cImFkbWluLXJhZGlvXCJdW3ZhbHVlPVwiJyArIHJhZGlvLmlkICsgJ1wiXScgKyAoKHNlbGVjdGVkKSA/ICdbY2hlY2tlZF0nIDogJycpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLnctZm9ybS1sYWJlbFtmb3I9XCJyLScgKyBpbmRleCArICdcIl0nLCAnUiQnICsgcmFkaW8ubWluaW11bV92YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3N0cm9uZycsICdEZXNjcmnDp8OjbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZGVzY3JpcHRpb24oKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5lcnJvcigpLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblJlc2V0UGFzc3dvcmQgY29tcG9uZW50XG4gKiBNYWtlcyBhamF4IHJlcXVlc3QgdG8gdXBkYXRlIFVzZXIgcGFzc3dvcmQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5SZXNldFBhc3N3b3JkLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblJlc2V0UGFzc3dvcmQgPSAoKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJylbMF0uY29udGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcihfLmV4dGVuZCh7fSwge2RhdGE6IGRhdGF9LCBidWlsZGVyLnJlcXVlc3RPcHRpb25zKSwgbS5yZXF1ZXN0KSxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZSA9IG0ucHJvcCgnJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlKGVyci5lcnJvcnNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3UGFzc3dvcmQoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogZXJyb3JfbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtuYW1lPVwiJyArIGRhdGEucHJvcGVydHkgKyAnXCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3UGFzc3dvcmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLm5ld1Bhc3N3b3JkKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1NlbmhhIGFsdGVyYWRhIGNvbSBzdWNlc3NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yX21lc3NhZ2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgYywgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXdhcmQgPSBhcmdzLnJld2FyZCgpLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZSA9IHBhcnNlSW50KHJld2FyZC5wYWlkX2NvdW50KSArIHBhcnNlSW50KHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21wZW5zYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIHJld2FyZC5pZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCdEaXNwb27DrXZlaXM6ICcgKyBhdmFpbGFibGUgKyAnIC8gJyArIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIHx8ICcmaW5maW47JykpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgXSA6ICdBcG9pbyBzZW0gcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5ID0gKGZ1bmN0aW9uKG0sIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW3tcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdW5kZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdFc3Rvcm5vIHJlYWxpemFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY3JpYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uZGVsZXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGV4Y2x1w61kbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICB9XSwgZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0ZSA9IGgubW9tZW50aWZ5KGl0ZW0uZGF0ZSwgJ0REL01NL1lZWVksIEhIOm1tJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgICAgICAgICBjdHJsLm9yZGVyZWRFdmVudHMubWFwKGZ1bmN0aW9uKGNFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0RldGFsaGVzIGRvIGFwb2lvJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgW1xuICAgICAgICAgICAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdUYXhhOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24uZ2F0ZXdheV9mZWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnSWQgcGFnYW1lbnRvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5rZXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgJ0JvbGV0byBiYW5jw6FyaW8nKSwgJyAnLCBtKCdzcGFuLmJhZGdlJywgJzJhIHZpYScpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSgpKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgY29tcG9uZW50XG4gKiBSZXR1cm4gYWN0aW9uIGlucHV0cyB0byBiZSB1c2VkIGluc2lkZSBBZG1pbkxpc3QgY29tcG9uZW50LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Vc2VyRGV0YWlsXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICByZXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWRlZmluaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ05vdmEgc2VuaGEgZGUgVXN1w6FyaW86JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWRlZmluaXIgc2VuaGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTIzbXVkQHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RpdmF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWF0aXZhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWF0aXZhciBlc3NlIHVzdcOhcmlvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ1VzdcOhcmlvIHJlYXRpdmFkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyB1c3XDoXJpbyBuw6NvIHDDtGRlIHNlciByZWF0aXZhZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWF0aXZhciB1c3XDoXJpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGRldGFpbHMgPSBhcmdzLmRldGFpbHM7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvdXNlcnMvJHtpZH0vbmV3X3Bhc3N3b3JkYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlc2V0LCBpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtLmRlYWN0aXZhdGVkX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtkYXRhOiBhY3Rpb25zLnJlYWN0aXZhdGUsIGl0ZW06IGl0ZW19KSA6ICcnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlckl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VyID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudXNlci1hdmF0YXJbc3JjPVwiJyArIGgudXNlQXZhdGFyT3JEZWZhdWx0KHVzZXIucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci5pZCArICcvZWRpdFwiXScsIHVzZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdVc3XDoXJpbzogJyArIHVzZXIuaWQpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdFbWFpbDogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLmFkZGl0aW9uYWxfZGF0YSB8fCBtKCcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGFsbCBvciBub3RoaW5nIHByb2plY3QgbWRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgbsOjbyBkZXNhbmltZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gbsOjbyBiYXRldSBhIG1ldGEgZSBzYWJlbW9zIHF1ZSBpc3NvIG7Do28gw6kgYSBtZWxob3IgZGFzIHNlbnNhw6fDtWVzLiBNYXMgbsOjbyBkZXNhbmltZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbmNhcmUgbyBwcm9jZXNzbyBjb21vIHVtIGFwcmVuZGl6YWRvIGUgbsOjbyBkZWl4ZSBkZSBjb2dpdGFyIHVtYSBzZWd1bmRhIHRlbnRhdGl2YS4gTsOjbyBzZSBwcmVvY3VwZSwgdG9kb3Mgb3Mgc2V1cyBhcG9pYWRvcmVzIHJlY2ViZXLDo28gbyBkaW5oZWlybyBkZSB2b2x0YS7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM2NTUwNy1SZWdyYXMtZS1mdW5jaW9uYW1lbnRvLWRvcy1yZWVtYm9sc29zLWVzdG9ybm9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gZmF6ZW1vcyBlc3Rvcm5vcyBlIHJlZW1ib2xzb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCAnLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgc2V1IHByb2pldG8gZm9pIGFwcm92YWRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUGFyYSBjb2xvY2FyIG8gc2V1IHByb2pldG8gbm8gYXIgw6kgcHJlY2lzbyBhcGVuYXMgcXVlIHZvY8OqIHByZWVuY2hhIG9zIGRhZG9zIG5lY2Vzc8OhcmlvcyBuYSBhYmHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIjdXNlcl9zZXR0aW5nc1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy4gw4kgaW1wb3J0YW50ZSBzYWJlciBxdWUgY29icmFtb3MgYSB0YXhhIGRlIDEzJSBkbyB2YWxvciB0b3RhbCBhcnJlY2FkYWRvIGFwZW5hcyBwb3IgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4gRW50ZW5kYcKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBmYXplbW9zIG8gcmVwYXNzZSBkbyBkaW5oZWlyby4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNhdGVnb3J5QnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgYnRuLWNhdGVnb3J5IGNsYXNzLlxuICogSXQgdXNlcyBhIGNhdGVnb3J5IHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge1xuICogICAgIGNhdGVnb3J5OiB7XG4gKiAgICAgICAgIGlkOiAxLFxuICogICAgICAgICBuYW1lOiAnVmlkZW8nLFxuICogICAgICAgICBvbmxpbmVfcHJvamVjdHM6IDFcbiAqICAgICB9XG4gKiB9KVxuICovXG53aW5kb3cuYy5DYXRlZ29yeUJ1dHRvbiA9ICgobSwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGFyZ3MuY2F0ZWdvcnk7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkke2NhdGVnb3J5Lm5hbWUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjYnlfY2F0ZWdvcnlfaWQvJHtjYXRlZ29yeS5pZH0nXWAsXG4gICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmV4cGxvcmUnLCBjYXRlZ29yeS5vbmxpbmVfcHJvamVjdHMpXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5GaWx0ZXJCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBmaWx0ZXJzIGNsYXNzLlxuICogSXQgdXNlcyBhIGhyZWYgYW5kIGEgdGl0bGUgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge1xuICogICAgIHRpdGxlOiAnRmlsdGVyIGJ5IGNhdGVnb3J5JyxcbiAqICAgICBocmVmOiAnZmlsdGVyX2J5X2NhdGVnb3J5J1xuICogfSlcbiAqL1xud2luZG93LmMuRmlsdGVyQnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXJncy50aXRsZSxcbiAgICAgICAgICAgICAgICAgIGhyZWYgPSBhcmdzLmhyZWY7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuZmlsdGVycyR7dGl0bGUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjJHtocmVmfSddYCwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuRmlsdGVyRGF0ZVJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyTnVtYmVyUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBleHBsYW5hdGlvbiBhYm91dCBwcm9qZWN0IGZsZXggcHJvamVjdCBtZGUuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9ICgobSwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXhwbGFuYXRpb24gPSAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChyZXNvdXJjZS5leHBpcmVzX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3Byb2plY3RzLycgKyByZXNvdXJjZS5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgJ1F1ZXJvIGluaWNpYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBhIHJldGEgZmluYWwgZGUgNyBkaWFzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdzcGFuJywgYFZvY8OqIHJlY2ViZSB0dWRvIHF1ZSBhcnJlY2FkYXIgYXTDqSBhcyAke2gubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCwgJ0hIOm1tOnNzJyl9IGRlICR7aC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KX1gKSlcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLCBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksICcuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIFBVQkxJQ0FSLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmxhbmRpbmdRQSBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgcXVlc3Rpb24vYW5zd2VyIGJveCB3aXRoIHRvZ2dsZVxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICogICAgICAgICAgcXVlc3Rpb246ICdXaGF0cyB5b3VyIG5hbWU/JyxcbiAqICAgICAgICAgIGFuc3dlcjogJ0RhcnRoIFZhZGVyLidcbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nUUEgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dBbnN3ZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQucWEtY2FyZC51LW1hcmdpbmJvdHRvbS0yMC51LXJhZGl1cy5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zaG93QW5zd2VyLnRvZ2dsZVxuICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBhcmdzLnF1ZXN0aW9uKSxcbiAgICAgICAgICAgICAgICBjdHJsLnNob3dBbnN3ZXIoKSA/IG0oJ3AudS1tYXJnaW50b3AtMjAuZm9udHNpemUtc21hbGwnLCBhcmdzLmFuc3dlcikgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nU2lnbnVwID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgICAgICBlbWFpbCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgudmFsaWRhdGVFbWFpbChlbWFpbCgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvckNsYXNzZXMgPSAoIWN0cmwuZXJyb3IpID8gJy5wb3NpdGl2ZS5lcnJvcicgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCdmb3JtLnctZm9ybVtpZD1cImVtYWlsLWZvcm1cIl1bbWV0aG9kPVwicG9zdFwiXVthY3Rpb249XCInICsgYXJncy5idWlsZGVyLmN1c3RvbUFjdGlvbiArICdcIl0nLHtcbiAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLmVtYWlsKClcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2FyZCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgICAgICAgY2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICAgICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBvcE5vdGlmaWNhdGlvbiA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5Tm90aWZpY2F0aW9uID0gaC50b2dnbGVQcm9wKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Tm90aWZpY2F0aW9uOiBkaXNwbGF5Tm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24oKSA/IG0oJy5mbGFzaC53LWNsZWFyZml4LmNhcmQuY2FyZC1ub3RpZmljYXRpb24udS1yYWRpdXMuemluZGV4LTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWNsb3NlW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAveC5wbmdcIl1bd2lkdGg9XCIxMlwiXVthbHQ9XCJmZWNoYXJcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbi50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBhcmdzLm1lc3NhZ2UpXG4gICAgICAgICAgICBdKSA6IG0oJ3NwYW4nKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKChtLCBjLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgb25saW5lRGF5cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBtb21lbnQocHJvamVjdC56b25lX29ubGluZV9kYXRlKS5kaWZmKG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24oZGlmZik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1NYXRoLmNlaWwoZHVyYXRpb24uYXNEYXlzKCkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZnVuZGluZ1BlcmlvZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByb2plY3QuaXNfcHVibGlzaGVkICYmIGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSkgPyBtKCcuZnVuZGluZy1wZXJpb2QnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYCR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX29ubGluZV9kYXRlKX0gLSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gKCR7b25saW5lRGF5cygpfSBkaWFzKWApXG4gICAgICAgICAgICAgICAgXSkgOiAnJztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICFfLmlzRW1wdHkoYXJncy5yZXdhcmREZXRhaWxzKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksIGZ1bmRpbmdQZXJpb2QoKVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnU3VnZXN0w7Vlc8KgZGXCoGFwb2lvJyksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgICAgIGZ1bmRpbmdQZXJpb2QoKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENhcmQgPSAoKG0sIGgsIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QucmVtYWluaW5nX3RpbWUpLFxuICAgICAgICAgICAgICAgIGxpbmsgPSAnLycgKyBwcm9qZWN0LnBlcm1hbGluayArIChhcmdzLnJlZiA/ICc/cmVmPScgKyBhcmdzLnJlZiA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgYS5jYXJkLXByb2plY3QtdGh1bWJbaHJlZj1cIiR7bGlua31cIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3Byb2plY3QucHJvamVjdF9pbWd9KWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYHBvciAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZX0sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgLmNhcmQtcHJvamVjdC1tZXRlci4ke3Byb2plY3Quc3RhdGV9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdzdWNjZXNzZnVsJykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdCZW0tc3VjZWRpZG8nKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2ZhaWxlZCcpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnTsOjby1maW5hbmNpYWRvJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICd3YWl0aW5nX2Z1bmRzJykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdQcmF6byBlbmNlcnJhZG8nKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0JywgcHJvamVjdC5leHBpcmVzX2F0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH0gJHtyZW1haW5pbmdUZXh0T2JqLnVuaXR9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgKHJlbWFpbmluZ1RleHRPYmoudG90YWwgPiAxKSA/ICdSZXN0YW50ZXMnIDogJ1Jlc3RhbnRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodCcsIFsnUHJhem8gZW0nLG0oJ2JyJyksJ2FiZXJ0byddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdENvbW1lbnRzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcuZmItY29tbWVudHNbZGF0YS1ocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bZGF0YS1udW0tcG9zdHM9NTBdW2RhdGEtd2lkdGg9XCI2MTBcIl0nKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbiksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nID0gKHdhaXRpbmcgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nOiB0b2dnbGVXYWl0aW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgICAgICAoYXJncy5wcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl0nLCAnQ29uZmlybWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXVt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt2YWx1ZT1cIndhaXRpbmdfY29uZmlybWF0aW9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl0nLCAnUGVuZGVudGVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMnLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tZGFya1tocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBjb250cmlidXRpb24udXNlcl9uYW1lKSwgKGNvbnRyaWJ1dGlvbi5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSwgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyBbbS50cnVzdCgnJm5ic3A7LSZuYnNwOycpLCBtKCdzdHJvbmcnLCAnQXBvaWFkb3IgYW7DtG5pbW8nKV0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBISDptbScpICsgJ2gnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyA+IDEgPyAnQXBvaW91IGVzdGUgZSBtYWlzIG91dHJvcyAnICsgY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycgOiAnQXBvaW91IHNvbWVudGUgZXN0ZSBwcm9qZXRvIGF0w6kgYWdvcmEnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS0yMCcpXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFshbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgY29tcG9uZW50XG4gKiBidWlsZCBkYXNoYm9hcmQgcHJvamVjdCBtZW51IGZvciBwcm9qZWN0IG93bmVyc1xuICogYW5kIGFkbWluLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gKiAgICAgcHJvamVjdDogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSA9ICgobSwgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2ID0gaC50b2dnbGVQcm9wKCdib2R5LXByb2plY3Qgb3BlbicsICdib2R5LXByb2plY3QgY2xvc2VkJyk7XG5cbiAgICAgICAgICAgIGlmICghYXJncy5wcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZS50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5LFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZTogZWRpdExpbmtzVG9nZ2xlLFxuICAgICAgICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXY6IGJvZHlUb2dnbGVGb3JOYXZcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgcHJvamVjdFJvdXRlID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCxcbiAgICAgICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgICAgICBlZGl0TGlua0NsYXNzID0gJ2Rhc2hib2FyZC1uYXYtbGluay1sZWZ0ICcgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnaW5kZW50JyA6ICcnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25hbE9wdCA9IChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyA/IG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICcgKG9wY2lvbmFsKScpIDogJycpO1xuXG4gICAgICAgICAgICBjdHJsLmJvZHkuY2xhc3NOYW1lID0gY3RybC5ib2R5VG9nZ2xlRm9yTmF2KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1uYXYnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtbmF2LXdyYXBwZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ25hdi53LXNlY3Rpb24uZGFzaGJvYXJkLW5hdi5zaWRlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rLnctaW5saW5lLWJsb2NrLmRhc2hib2FyZC1wcm9qZWN0LW5hbWVbaHJlZj1cIicgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnLycgKyBwcm9qZWN0LnBlcm1hbGluayA6IGVkaXRSb3V0ZSArICcjcHJldmlldycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC1kYXNoYm9hcmRbc3JjPVwiJyArIChfLmlzTnVsbChwcm9qZWN0LmxhcmdlX2ltYWdlKSA/ICcvYXNzZXRzL3RodW1iLXByb2plY3QucG5nJyA6IHByb2plY3QubGFyZ2VfaW1hZ2UpICsgJ1wiXVt3aWR0aD1cIjExNFwiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUubGluZWhlaWdodC10aWdodC5mb250c2l6ZS1zbWFsbCcsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnUtbWFyZ2ludG9wLTEwW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvYmFkZ2UtJHtwcm9qZWN0Lm1vZGV9LWgucG5nXCJdW3dpZHRoPTgwXWApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2luZm8tbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfaG9tZV9saW5rW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChoLmxvY2F0aW9uQWN0aW9uTWF0Y2goJ2luc2lnaHRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiJyArIHByb2plY3RSb3V0ZSArICcvaW5zaWdodHNcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFyLWNoYXJ0LmZhLWxnLmZhLWZ3JyksICcgTWluaGEgQ2FtcGFuaGEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0W2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNyZXBvcnRzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLmZhLXRhYmxlLmZhLWxnLmZhLWZ3JyksICcgUmVsYXTDs3Jpb3MgZGUgYXBvaW9zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0LnUtbWFyZ2luYm90dG9tLTMwW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwb3N0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1idWxsaG9ybi5mYS1mdy5mYS1sZycpLCAnIE5vdmlkYWRlcyAnLCBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5lZGl0LXByb2plY3QtZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyAnJyA6IG0oJ2J1dHRvbiN0b2dnbGUtZWRpdC1tZW51LmRhc2hib2FyZC1uYXYtbGluay1sZWZ0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmVkaXRMaW5rc1RvZ2dsZS50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtcGVuY2lsLmZhLWZ3LmZhLWxnJyksICcgRWRpdGFyIHByb2pldG8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpLCAoY3RybC5lZGl0TGlua3NUb2dnbGUoKSA/IG0oJyNlZGl0LW1lbnUtaXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNkYXNoYm9hcmQtbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjYmFzaWNzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Jhc2ljcycgKyAnXCJdJywgJ0LDoXNpY28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2dvYWxfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZ29hbCcgKyAnXCJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gJ01ldGEgZSBwcmF6bycgOiAnRmluYW5jaWFtZW50bycpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rlc2NyaXB0aW9uX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Rlc2NyaXB0aW9uJyArICdcIl0nLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjdmlkZW9fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdmlkZW8nICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVsOtZGVvJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNidWRnZXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYnVkZ2V0JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ09yw6dhbWVudG8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbXBlbnNhcycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfYWJvdXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9hYm91dCcgKyAnXCJdJywgJ1NvYnJlIHZvY8OqJyksICgocHJvamVjdC5pc19wdWJsaXNoZWQgfHwgcHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJykgfHwgcHJvamVjdC5pc19hZG1pbl9yb2xlID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfc2V0dGluZ3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9zZXR0aW5ncycgKyAnXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3ByZXZpZXdfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcHJldmlldycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZ3LmZhLWV5ZS5mYS1sZycpLCAnIFByZXZpZXcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnYW9uJyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3NlbmRfdG9fYW5hbHlzaXNcIl0nLCAnRW52aWFyJykgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9wdWJsaXNoXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjcHJldmlld1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQdWJsaWNhcicsIG0udHJ1c3QoJyZuYnNwOyZuYnNwOycpLCBtKCdzcGFuLmZhLmZhLWNoZXZyb24tcmlnaHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgPyBtKCdhLnctYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXNlY29uZGFyeS1kYXJrW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjYW5ub3VuY2VfZXhwaXJhdGlvblwiXScsICdJbmljaWFyIHJldGEgZmluYWwnKSA6ICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS5idG4tZGFzaGJvYXJkIGhyZWY9XCJqczp2b2lkKDApO1wiJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmJvZHlUb2dnbGVGb3JOYXYudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhcnMuZmEtbGcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YUNoYXJ0IGNvbXBvbmVudFxuICogQSBncmFwaCBidWlsZGVyIGludGVyZmFjZSB0byBiZSB1c2VkIG9uIHByb2plY3QgcmVsYXRlZCBkYXNoYm9hcmRzLlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFDaGFydCwge1xuICogICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAqICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICogICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnXG4gKiB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YUNoYXJ0ID0gKChtLCBDaGFydCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZSA9IF8uZmlyc3QoYXJncy5jb2xsZWN0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgc291cmNlID0gKCFfLmlzVW5kZWZpbmVkKHJlc291cmNlKSA/IHJlc291cmNlLnNvdXJjZSA6IFtdKSxcblxuICAgICAgICAgICAgICAgIG1vdW50RGF0YXNldCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHNvdXJjZSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVthcmdzLmRhdGFLZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IChlbGVtZW50LCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHNvdXJjZSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3MueEF4aXMoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi5vdmVyZmxvdy1hdXRvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5yZW5kZXJDaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhdGFUYWJsZSBjb21wb25lbnRcbiAqIEEgdGFibGUgaW50ZXJmYWNlIGNvbnN0cnVjdG9yIHRoYXQgc2hvdWxkIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBJdCB0YWtlcyBhbiBhcnJheSBhbmQgYSBsYWJsZSBhcyBpdCdzIHNvdXJjZXMuXG4gKiBUaGUgZmlyc3QgaXRlbSBpbiB0aGUgYXJyYXkgaXMgdGhlIGhlYWRlciBkZXNjcmlwdG9yIGFuZCB0aGUgcmVzdCBvZiB0aGVtIGFyZSByb3cgZGF0YS5cbiAqIFJvd3MgbWF5IHJldHVybiBhIHN0cmluZyBvciBhbiBhcnJheSBhbmQgdGhpcyB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgYSByb3cgb3V0cHV0LlxuICogQWxsIHRhYmxlIHJvd3MgYXJlIHNvcnRhYmxlIGJ5IGRlZmF1bHQuIElmIHlvdSB3YW50IHRvIHVzZSBhIGN1c3RvbSB2YWx1ZSBhcyBzb3J0IHBhcmFtZXRlclxuICogeW91IG1heSBzZXQgYSAyRCBhcnJheSBhcyByb3cuIEluIHRoaXMgY2FzZSwgdGhlIGZpcnN0IGFycmF5IHZhbHVlIHdpbGwgYmUgdGhlIGN1c3RvbSB2YWx1ZVxuICogd2hpbGUgdGhlIG90aGVyIHdpbGwgYmUgdGhlIGFjdHVhbCBvdXRwdXQuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gKiAgICAgIGxhYmVsOiAnVGFibGUgbGFiZWwnLFxuICogICAgICB0YWJsZTogW1xuICogICAgICAgICAgWydjb2wgaGVhZGVyIDEnLCAnY29sIGhlYWRlciAyJ10sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDF4MScsIFszLCAndmFsdWUgMXgyJ11dLFxuICogICAgICAgICAgWyd2YWx1ZSAyeDEnLCBbMSwgJ3ZhbHVlIDJ4MiddXSAvL1dlIGFyZSB1c2luZyBhIGN1c3RvbSBjb21wYXJhdG9yIHR3byBjb2wgMiB2YWx1ZXNcbiAqICAgICAgXVxuICogIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXRhVGFibGUgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFibGUgPSBtLnByb3AoYXJncy50YWJsZSksXG4gICAgICAgICAgICAgICAgc29ydEluZGV4ID0gbS5wcm9wKC0xKTtcblxuICAgICAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IHNvcnRJbmRleCgpLFxuICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB4ID0gKF8uaXNBcnJheShhW2lkeF0pICYmIGFbaWR4XS5sZW5ndGggPiAxKSA/IGFbaWR4XVswXSA6IGFbaWR4XSxcbiAgICAgICAgICAgICAgICAgICAgeSA9IChfLmlzQXJyYXkoYltpZHhdKSAmJiBiW2lkeF0ubGVuZ3RoID4gMSkgPyBiW2lkeF1bMF0gOiBiW2lkeF07XG5cbiAgICAgICAgICAgICAgICBpZiAoeCA8IHkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh5IDwgeCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHNvcnRUYWJsZSA9IChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdCh0YWJsZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTtcbiAgICAgICAgICAgICAgICBpZiAoc29ydEluZGV4KCkgPT09IGlkeCl7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QodGFibGUoKSkucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNvcnRJbmRleChpZHgpO1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFibGUoXy51bmlvbihbaGVhZGVyXSxib2R5KSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRhYmxlOiB0YWJsZSxcbiAgICAgICAgICAgICAgICBzb3J0VGFibGU6IHNvcnRUYWJsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBfLmZpcnN0KGN0cmwudGFibGUoKSksXG4gICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdChjdHJsLnRhYmxlKCkpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChoZWFkZXIsIChoZWFkaW5nLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aGVhZGluZ30gYCwgbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChib2R5LCAocm93RGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9IChfLmlzQXJyYXkocm93KSAmJiByb3cubGVuZ3RoID4gMSkgPyByb3dbMV0gOiByb3c7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHJvdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdEhlYWRlciA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1wcm9kdWN0LicgKyBwcm9qZWN0Lm1vZGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQucHJvamVjdC1uYW1lW2l0ZW1wcm9wPVwibmFtZVwiXScsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMi5mb250c2l6ZS1iYXNlLmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwb3IgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LnVzZXIubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5wcm9qZWN0LWhpZ2hsaWdodCcsIG0uY29tcG9uZW50KGMuUHJvamVjdEhpZ2hsaWdodCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0U2lkZWJhciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogYXJncy51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RIaWdobGlnaHQgPSAoKG0sIF8sIGgsIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheVNoYXJlQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5U2hhcmVCb3g6IGRpc3BsYXlTaGFyZUJveFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhpZ2hsaWdodCcsIFtcbiAgICAgICAgICAgICAgICAocHJvamVjdC52aWRlb19lbWJlZF91cmwgPyBtKCcudy1lbWJlZC53LXZpZGVvLnByb2plY3QtdmlkZW8nLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnbWluLWhlaWdodDogMjQwcHg7J1xuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lLmVtYmVkbHktZW1iZWRbaXRlbXByb3A9XCJ2aWRlb1wiXVtzcmM9XCInICsgcHJvamVjdC52aWRlb19lbWJlZF91cmwgKyAnXCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVthbGxvd0Z1bGxTY3JlZW5dJylcbiAgICAgICAgICAgICAgICBdKSA6IG0oJy5wcm9qZWN0LWltYWdlJywge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2JhY2tncm91bmQtaW1hZ2U6dXJsKCcgKyBwcm9qZWN0Lm9yaWdpbmFsX2ltYWdlICsgJyk7J1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1ibHVyYicsIHByb2plY3QuaGVhZGxpbmUpLFxuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc051bGwocHJvamVjdC5hZGRyZXNzKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHQudS1tYXJnaW5ib3R0b20tMTBbaHJlZj1cIi9wdC9leHBsb3JlI25lYXJfb2YvJHtwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bX1cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1tYXAtbWFya2VyJyksIGAgJHtwcm9qZWN0LmFkZHJlc3MuY2l0eX0sICR7cHJvamVjdC5hZGRyZXNzLnN0YXRlX2Fjcm9ueW19YFxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHRbaHJlZj1cIi9wdC9leHBsb3JlI2J5X2NhdGVnb3J5X2lkLyR7cHJvamVjdC5jYXRlZ29yeV9pZH1cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXRhZycpLCAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmNhdGVnb3J5X25hbWVcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbiNzaGFyZS1ib3guYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnQ29tcGFydGlsaGFyJyksIChjdHJsLmRpc3BsYXlTaGFyZUJveCgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0U2hhcmVCb3gsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5U2hhcmVCb3g6IGN0cmwuZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdE1haW4gPSAoKG0sIGMsIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY19vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcmV3YXJkcyc6IG0oJy53LWNvbC53LWNvbC0xMicsIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2Fib3V0JzogbS5jb21wb25lbnQoYy5Qcm9qZWN0QWJvdXQsIF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29tbWVudHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb21tZW50cywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Bvc3RzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0UG9zdHMsIGNfb3B0cylcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNFbXB0eShoYXNoKSB8fCBoYXNoID09PSAnI189XycgfHwgaGFzaCA9PT0gJyNwcmV2aWV3Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYnNbJyNhYm91dCddO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYnNbaGFzaF07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBtLnJlZHJhdywgZmFsc2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50OiBkaXNwbGF5VGFiQ29udGVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NlY3Rpb24uc2VjdGlvbltpdGVtdHlwZT1cImh0dHA6Ly9zY2hlbWEub3JnL0NyZWF0aXZlV29ya1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIGN0cmwuZGlzcGxheVRhYkNvbnRlbnQoKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RNb2RlIGNvbXBvbmVudFxuICogQSBzaW1wbGUgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBiYWRnZSB3aXRoIHRoZSBjdXJyZW50IHByb2plY3QgbW9kZVxuICogdG9nZXRoZXIgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBtb2RlLCBzaG93biBpbnNpZGUgYSB0b29sdGlwLlxuICogSXQgcmVjZWl2ZXMgYSBwcm9qZWN0IGFzIHJlc291cmNlXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0TW9kZSA9ICgobSwgYywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIG1vZGUgPSBwcm9qZWN0Lm1vZGUsXG4gICAgICAgICAgICAgICAgdG9vbHRpcFRleHQgPSAobW9kZSA9PT0gJ2FvbicpID8gYFNvbWVudGUgcmVjZWJlcsOhIG9zIHJlY3Vyc29zIHNlIGF0aW5naXIgb3UgdWx0cmFwYXNzYXIgYSBtZXRhIGF0w6kgbyBkaWEgJHtoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCwgJ0REL01NL1lZWVknKX0uYCA6ICdPIHJlYWxpemFkb3IgcmVjZWJlcsOhIHRvZG9zIG9zIHJlY3Vyc29zIHF1YW5kbyBlbmNlcnJhciBhIGNhbXBhbmhhLCBtZXNtbyBxdWUgbsOjbyB0ZW5oYSBhdGluZ2lkbyBlc3RhIG1ldGEuJztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtb2RlOiBtb2RlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBUZXh0OiB0b29sdGlwVGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBtb2RlID0gY3RybC5tb2RlLFxuICAgICAgICAgICAgICAgIG1vZGVJbWdTcmMgPSAobW9kZSA9PT0gJ2FvbicpID8gJy9hc3NldHMvYW9uLWJhZGdlLnBuZycgOiAnL2Fzc2V0cy9mbGV4LWJhZGdlLnBuZycsXG4gICAgICAgICAgICAgICAgbW9kZVRpdGxlID0gKG1vZGUgPT09ICdhb24nKSA/ICdDYW1wYW5oYSBUdWRvLW91LW5hZGEgJyA6ICdDYW1wYW5oYSBGbGV4w612ZWwgJyxcbiAgICAgICAgICAgICAgICBnb2FsID0gKF8uaXNOdWxsKGFyZ3MucHJvamVjdC5nb2FsKSA/ICduw6NvIGRlZmluaWRhJyA6IGguZm9ybWF0TnVtYmVyKGFyZ3MucHJvamVjdC5nb2FsKSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Ub29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjdHJsLnRvb2x0aXBUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDI4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbShgIyR7bW9kZX0udy1yb3dgLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oYGltZ1tzcmM9XCIke21vZGVJbWdTcmN9XCJdW3dpZHRoPSczMCddYClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtMTAudy1jb2wtdGlueS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdNZXRhIFIkICcgKyBnb2FsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctaW5saW5lLWJsb2NrLmZvbnRzaXplLXNtYWxsZXN0Ll93LWlubGluZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4udy1pbmxpbmUtYmxvY2suX3ctaW5saW5lLWJsb2NrLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UG9zdHMgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RQb3N0RGV0YWlsKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzRW1wdHkobGlzdC5jb2xsZWN0aW9uKCkpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAudS1tYXJnaW50b3AtMjAnLCAnVG9kYSBub3ZpZGFkZSBwdWJsaWNhZGEgbm8gQ2F0YXJzZSDDqSBlbnZpYWRhIGRpcmV0YW1lbnRlIHBhcmEgbyBlbWFpbCBkZSBxdWVtIGrDoSBhcG9pb3Ugc2V1IHByb2pldG8gZSB0YW1iw6ltIGZpY2EgZGlzcG9uw612ZWwgcGFyYSB2aXN1YWxpemHDp8OjbyBubyBzaXRlLiBWb2PDqiBwb2RlIG9wdGFyIHBvciBkZWl4w6EtbGEgcMO6YmxpY2EsIG91IHZpc8OtdmVsIHNvbWVudGUgcGFyYSBzZXVzIGFwb2lhZG9yZXMgYXF1aSBuZXN0YSBhYmEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyksIChfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wb3N0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIHBvc3QudGl0bGUpLCAoIV8uaXNFbXB0eShwb3N0LmNvbW1lbnRfaHRtbCkgPyBtKCcuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocG9zdC5jb21tZW50X2h0bWwpKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgJ1Bvc3QgZXhjbHVzaXZvIHBhcmEgYXBvaWFkb3Jlcy4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tNjAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ1VtIGxlbWJyZXRlIHBvciBlbWFpbCDDqSBlbnZpYWRvIDQ4IGhvcmFzIGFudGVzIGRvIHTDqXJtaW5vIGRhIHN1YSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RSZW1pbmRlciBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBjbGlja2FibGUgcHJvamVjdCByZW1pbmRlciBlbGVtZW50LlxuICogVGhlIGNvbXBvbmVudCBjYW4gYmUgb2YgdHdvIHR5cGVzOiBhICdsaW5rJyBvciBhICdidXR0b24nXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge3Byb2plY3Q6IHByb2plY3QsIHR5cGU6ICdidXR0b24nfSlcbiAqICB9XG4gKi9cbndpbmRvdy5jLlByb2plY3RSZW1pbmRlciA9ICgobSwgbW9kZWxzLCBoLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGluUmVtaW5kZXIgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN0b3JlUmVtaW5kZXJOYW1lID0gJ3JlbWluZF8nICsgcHJvamVjdC5pZCxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24gPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdFJlbWluZGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWguZ2V0VXNlcigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoLnN0b3JlQWN0aW9uKHN0b3JlUmVtaW5kZXJOYW1lLCBzdWJtaXRSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaC5uYXZpZ2F0ZVRvRGV2aXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvYWRlck9wdHMgPSBpblJlbWluZGVyKCkgPyBtb2RlbHMucHJvamVjdFJlbWluZGVyLmRlbGV0ZU9wdGlvbnMoZmlsdGVyVk0ucGFyYW1ldGVycygpKSA6IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogcHJvamVjdC5pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihsb2FkZXJPcHRzKTtcblxuICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluUmVtaW5kZXIudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpblJlbWluZGVyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGguY2FsbFN0b3JlZEFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChwcm9qZWN0LmlkKTtcbiAgICAgICAgICAgIGluUmVtaW5kZXIocHJvamVjdC5pbl9yZW1pbmRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaW5SZW1pbmRlcjogaW5SZW1pbmRlcixcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlcjogc3VibWl0UmVtaW5kZXIsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb246IHBvcE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1haW5DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICcnIDogJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICBidXR0b25DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICd3LWJ1dHRvbiBidG4gYnRuLXRlcmNpYXJ5IGJ0bi1uby1ib3JkZXInIDogJ2J0bi1saW5rIGxpbmstaGlkZGVuIGZvbnRzaXplLXNtYWxsJztcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCNwcm9qZWN0LXJlbWluZGVyJHttYWluQ2xhc3N9YCwgW1xuICAgICAgICAgICAgICAgIG0oYGJ1dHRvbltjbGFzcz1cIiR7YnV0dG9uQ2xhc3N9ICR7KGN0cmwuaW5SZW1pbmRlcigpID8gJ2xpbmstaGlkZGVuLXN1Y2Nlc3MnIDogJ2ZvbnRjb2xvci1zZWNvbmRhcnknKX0gZm9udHdlaWdodC1zZW1pYm9sZFwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zdWJtaXRSZW1pbmRlclxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpID8gJ2FndWFyZGUgLi4uJyA6IG0oJ3NwYW4uZmEuZmEtY2xvY2stbycsIGN0cmwuaW5SZW1pbmRlcigpID8gJyBMZW1icmV0ZSBhdGl2bycgOiAnIExlbWJyYXItbWUnKSlcbiAgICAgICAgICAgICAgICBdKSwgKGN0cmwucG9wTm90aWZpY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlBvcE5vdGlmaWNhdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnT2shIFZhbW9zIHRlIG1hbmRhciB1bSBsZW1icmV0ZSBwb3IgZS1tYWlsIDQ4IGhvcmFzIGFudGVzIGRvIGZpbSBkYSBjYW1wYW5oYSdcbiAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFJld2FyZExpc3QgPSAoKG0sIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAgICAgICAvLyAtIGFkZCBkcmFmdCBhZG1pbiBtb2RpZmljYXRpb25zXG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGFyZ3MucmV3YXJkRGV0YWlscygpLCAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ldz9yZXdhcmRfaWQ9JyArIHJld2FyZC5pZDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyAnY2FyZC1nb25lJyA6ICdjYXJkLXJld2FyZCAnICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdjbGlja2FibGUnIDogJycpKSArICcgY2FyZCBjYXJkLXNlY29uZGFyeSB1LW1hcmdpbmJvdHRvbS0xMFwiXVtocmVmPVwiJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUGFyYSBSJCAnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUpICsgJyBvdSBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgaC5wbHVyYWxpemUocmV3YXJkLnBhaWRfY291bnQsICcgYXBvaW8nLCAnIGFwb2lvcycpKSwgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID4gMCA/IG0oJy5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMuaW5fdGltZV90b19jb25maXJtLmNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucGVuZGluZy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5wbHVyYWxpemUocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCwgJyBhcG9pbyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvJywgJyBhcG9pb3MgZW0gcHJhem8gZGUgY29uZmlybWHDp8Ojby4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1nb25lLmZvbnRzaXplLXNtYWxsZXInLCAnRXNnb3RhZGEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWF0dGVudGlvbi5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LWJvbGQnLCAnTGltaXRhZGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgKCcgKyBoLnJld2FyZFJlbWFuaW5nKHJld2FyZCkgKyAnIGRlICcgKyByZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zICsgJyBkaXNwb27DrXZlaXMpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksICghXy5pc0VtcHR5KHJld2FyZC5kZWxpdmVyX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5tb21lbnRpZnkocmV3YXJkLmRlbGl2ZXJfYXQsICdNTU0vWVlZWScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyAmJiAhaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtaG92ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1zZWxlY3QtdGV4dC51LXRleHQtY2VudGVyJywgJ1NlbGVjaW9uZSBlc3NhIHJlY29tcGVuc2EnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJvdyA9ICgobSwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIHJlZiA9IGFyZ3MucmVmLFxuICAgICAgICAgICAgICAgIHdyYXBwZXIgPSBhcmdzLndyYXBwZXIgfHwgJy53LXNlY3Rpb24uc2VjdGlvbi51LW1hcmdpbmJvdHRvbS00MCc7XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5jb2xsZWN0aW9uKCkubGVuZ3RoID4gMCA/IG0od3JhcHBlciwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzVW5kZWZpbmVkKGNvbGxlY3Rpb24udGl0bGUpIHx8ICFfLmlzVW5kZWZpbmVkKGNvbGxlY3Rpb24uaGFzaCkpID8gbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj1cIi9wdC9leHBsb3JlP3JlZj0ke3JlZn0jJHtjb2xsZWN0aW9uLmhhc2h9XCJdYCwgJ1ZlciB0b2RvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSA6IG0oJycpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2hhcmVCb3ggPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTogYmxvY2s7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGFyZ3MuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ0NvbXBhcnRpbGhlIGVzdGUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LXR3aXR0ZXIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53aWRnZXQtZW1iZWQudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RW1iZWQudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QuaWQgKyAnL2VtYmVkXCIgd2lkdGg9XCIzMDBweFwiIHNjcm9sbGluZz1cIm5vXCI+PC9pZnJhbWU+XCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2ZyYW1lYm9yZGVyPVwiMFwiXVtoZWlnaHQ9XCIzNTBweFwiXVtzcmM9XCIvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QubmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZhY2Vib29rJyksICcgQ29tcGFydGlsaGUnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tdHdlZXQudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPUFjYWJlaSBkZSBhcG9pYXIgbyBwcm9qZXRvICcgKyBhcmdzLnByb2plY3QubmFtZSArICcgaHR0czovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXR3aXR0ZXInKSwgJyBUd2VldCdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3MgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW5pbWF0aW9uLCBwcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkSW5jcmVtZW50ID0gcHJvamVjdC5wbGVkZ2VkIC8gcHJvamVjdC5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNJbmNyZW1lbnQgPSBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9ycyAvIHByb2plY3QucHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzQmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsZWRnZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmlidXRvcnMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBzZXRJbnRlcnZhbChpbmNyZW1lbnRQcm9ncmVzcywgMjgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50UHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA8PSBwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRFbC5pbm5lclRleHQgPSBgUiQgJHtoLmZvcm1hdE51bWJlcihwbGVkZ2VkKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwuaW5uZXJUZXh0ID0gYCR7cGFyc2VJbnQoY29udHJpYnV0b3JzKX0gcGVzc29hc2A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWQgPSBwbGVkZ2VkICsgcGxlZGdlZEluY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycyArIGNvbnRyaWJ1dG9yc0luY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvZ3Jlc3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDE4MDApO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3Quc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogJ0Vzc2UgcHJvamV0byBqw6EgZm9pIGFwcm92YWRvIHBlbG8gQ2F0YXJzZS4gRW0gYnJldmUgZWxlIGVudHJhcsOhIG5vIGFyIGUgZXN0YXLDoSBwcm9udG8gcGFyYSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29ubGluZSc6IGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSA/ICdWb2PDqiBwb2RlIGFwb2lhciBlc3RlIHByb2pldG8gYXTDqSBvIGRpYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpICsgJyDDoHMgMjNoNTltNTlzJyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdFc3RlIHByb2pldG8gbsOjbyBhdGluZ2l1IG8gbcOtbmltbyBkZSBSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5nb2FsKSArICcgYXTDqSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpICsgJyBlIG7Do28gZm9pIGZpbmFuY2lhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkJzogJ0VzdGUgcHJvamV0byBuw6NvIGZvaSBhY2VpdG8uIE7Do28gw6kgcG9zc8OtdmVsIHJlYWxpemFyIHVtIGFwb2lvLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnRXN0ZSBwcm9qZXRvIGVzdMOhIGVtIGFuw6FsaXNlIGUgYWluZGEgbsOjbyBlc3TDoSBhYmVydG8gcGFyYSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnRXN0ZSBwcm9qZXRvIGZvaSBmaW5hbmNpYWRvIGVtICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6ICdPIHByYXpvIGRlIGNhcHRhw6fDo28gZGVzc2UgcHJvamV0byBlc3TDoSBlbmNlcnJhZG8uIEVzdGFtb3MgYWd1YXJkYW5kbyBhIGNvbmZpcm1hw6fDo28gZG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdFc3RlIHByb2pldG8gw6kgYXBlbmFzIHVtIHJhc2N1bmhvIGUgYWluZGEgbsOjbyBwb2RlIHJlY2ViZXIgYXBvaW9zLidcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZVByb2dyZXNzOiBhbmltYXRlUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzczogZGlzcGxheUNhcmRDbGFzcyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZWxhcHNlZCA9IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5lbGFwc2VkX3RpbWUpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1zaWRlYmFyLmFzaWRlJywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbm5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLWluZm8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGxlZGdlZC5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFsnYXBvaWFkb3MgcG9ywqAnLCBtKCdzcGFuI2NvbnRyaWJ1dG9ycy5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cGFyc2VJbnQocHJvamVjdC50b3RhbF9jb250cmlidXRvcnMpfSBwZXNzb2FzYCksICFyZW1haW5pbmcudG90YWwgPyBgIGVtICR7ZWxhcHNlZC50b3RhbH0gJHtlbGFwc2VkLnVuaXR9YCA6ICcnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwcm9ncmVzc0Jhci5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7cHJvamVjdC5wcm9ncmVzc30lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXInLCBgJHtwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1yaWdodC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LXRpZ2h0ZXInLCByZW1haW5pbmcudG90YWwgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVtYWluaW5nLnRvdGFsKSwgYCAke3JlbWFpbmluZy51bml0fSByZXN0YW50ZXNgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1vZGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAsIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBtKCdhI2NvbnRyaWJ1dGVfcHJvamVjdF9mb3JtLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFyIGVzdGUgcHJvamV0bycpIDogJycpLCAoKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucykgPyBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJ1xuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnVzZXItYycsIG0uY29tcG9uZW50KGMuUHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyBjb21wb25lbnRcbiAqIEEgUHJvamVjdC1zaG93IHBhZ2UgaGVscGVyIHRvIHNob3cgc3VnZ2VzdGVkIGFtb3VudHMgb2YgY29udHJpYnV0aW9uc1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAuLi5cbiAqICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KVxuICogICAuLi5cbiAqIH1cbiAqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICBsZXQgc3VnZ2VzdGlvblVybCA9IChhbW91bnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYC9wcm9qZWN0cy8ke3Byb2plY3QucHJvamVjdF9pZH0vY29udHJpYnV0aW9ucy9uZXc/YW1vdW50PSR7YW1vdW50fWA7XG4gICAgICAgICAgICB9LCBzdWdnZXN0ZWRWYWx1ZXMgPSBbMTAsIDI1LCA1MCwgMTAwXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNzdWdnZXN0aW9ucycsIF8ubWFwKHN1Z2dlc3RlZFZhbHVlcywgKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKGBhW2hyZWY9XCIke3N1Z2dlc3Rpb25VcmwoYW1vdW50KX1cIl0uY2FyZC1yZXdhcmQuY2FyZC1iaWcuY2FyZC1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjBgLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBgUiTCoCR7YW1vdW50fWApXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VGFicyA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNGaXhlZCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeE9uU2Nyb2xsID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZpZXdwb3J0T2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZIDw9IG9yaWdpbmFsUG9zaXRpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbigtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQudG9wIDwgMCB8fCAod2luZG93LnNjcm9sbFkgPiBvcmlnaW5hbFBvc2l0aW9uKCkgJiYgb3JpZ2luYWxQb3NpdGlvbigpID4gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXhlZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKHdpbmRvdy5zY3JvbGxZKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbmF2RGlzcGxheSA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXhOYXZCYXIgPSBmaXhPblNjcm9sbChlbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmaXhOYXZCYXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmF2RGlzcGxheTogbmF2RGlzcGxheSxcbiAgICAgICAgICAgICAgICBpc0ZpeGVkOiBpc0ZpeGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICByZXdhcmRzID0gYXJncy5yZXdhcmREZXRhaWxzO1xuXG4gICAgICAgICAgICBsZXQgbWFpbkNsYXNzID0gIWN0cmwuaXNGaXhlZCgpID8gJy53LXNlY3Rpb24ucHJvamVjdC1uYXYnIDogJy53LXNlY3Rpb24ucHJvamVjdC1uYXYucHJvamVjdC1uYXYtZml4ZWQnO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnbmF2LXdyYXBwZXInLFtcbiAgICAgICAgICAgICAgICBtKG1haW5DbGFzcywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwubmF2RGlzcGxheVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgWyFfLmlzRW1wdHkocmV3YXJkcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnUmVjb21wZW5zYXMnKSA6IG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25fc3VnZ2VzdGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1ZhbG9yZXMgU3VnZXJpZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJhYm91dC1saW5rXCJdW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdTb2JyZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicG9zdHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcG9zdHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcG9zdHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdmlkYWRlcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QucG9zdHNfY291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29udHJpYnV0aW9ucy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQXBvaW9zICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29tbWVudHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29tbWVudHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29tbWVudHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWVudMOhcmlvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbmF2LWJhY2stYnV0dG9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG5baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFywqDigI1lc3RlwqBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJ30pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgY3RybC5pc0ZpeGVkKCkgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5saW5laGVpZ2h0LXRpZ2h0W2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMsICcgYXBvaWFkbycsICcgYXBvaWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctaGlkZGVuLXRpbnkudy1oaWRkZW4tc21hbGwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCAobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgcGFyc2VkTGluay5ob3N0bmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCB1c2VyRGV0YWlsLmVtYWlsKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5UZWFtTWVtYmVycyA9IChmdW5jdGlvbihfLCBtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBncm91cENvbGxlY3Rpb24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBncm91cFRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tbWVtYmVycy1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnZtLmNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChncm91cCwgZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIuYmlnLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMTBbc3JjPVwiJyArIG1lbWJlci5pbWcgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtYmFzZScsIG1lbWJlci5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdBcG9pb3UgJyArIG1lbWJlci50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Ll8sIHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLlRlYW1Ub3RhbCA9IChmdW5jdGlvbihtLCBoLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbVRvdGFsLmdldFJvdygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24udS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0hvamUgc29tb3MgJyArIHRlYW1Ub3RhbC5tZW1iZXJfY291bnQgKyAnIHBlc3NvYXMgZXNwYWxoYWRhcyBwb3IgJyArIHRlYW1Ub3RhbC50b3RhbF9jaXRpZXMgKyAnIGNpZGFkZXMgZW0gJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMubGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgcGHDrXNlcyAoJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMudG9TdHJpbmcoKSArICcpISBPIENhdGFyc2Ugw6kgaW5kZXBlbmRlbnRlLCBzZW0gaW52ZXN0aWRvcmVzLCBkZSBjw7NkaWdvIGFiZXJ0byBlIGNvbnN0cnXDrWRvIGNvbSBhbW9yLiBOb3NzYSBwYWl4w6NvIMOpIGNvbnN0cnVpciB1bSBhbWJpZW50ZSBvbmRlIGNhZGEgdmV6IG1haXMgcHJvamV0b3MgcG9zc2FtIGdhbmhhciB2aWRhLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQudGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Ub29sdGlwIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3MgeW91IHRvIHNob3cgYSB0b29sdGlwIG9uXG4gKiBhIHNwZWNpZmllZCBlbGVtZW50IGhvdmVyLiBJdCByZWNlaXZlcyB0aGUgZWxlbWVudCB5b3Ugd2FudFxuICogdG8gdHJpZ2dlciB0aGUgdG9vbHRpcCBhbmQgYWxzbyB0aGUgdGV4dCB0byBkaXNwbGF5IGFzIHRvb2x0aXAuXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgbGV0IHRvb2x0aXAgPSAoZWwpID0+IHtcbiAqICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlRvb2x0aXAsIHtcbiAqICAgICAgICAgICAgICBlbDogZWwsXG4gKiAgICAgICAgICAgICAgdGV4dDogJ3RleHQgdG8gdG9vbHRpcCcsXG4gKiAgICAgICAgICAgICAgd2lkdGg6IDMwMFxuICogICAgICAgICAgfSlcbiAqICAgICB9XG4gKlxuICogICAgIHJldHVybiB0b29sdGlwKCdhI2xpbmstd3RoLXRvb2x0aXBbaHJlZj1cIiNcIl0nKTtcbiAqXG4gKiB9XG4gKi9cbndpbmRvdy5jLlRvb2x0aXAgPSAoKG0sIGMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHBhcmVudEhlaWdodCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICB3aWR0aCA9IG0ucHJvcChhcmdzLndpZHRoIHx8IDI4MCksXG4gICAgICAgICAgICAgICAgdG9wID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIGxlZnQgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXQgPSBtLnByb3Aoe3RvcDogMCwgbGVmdDogMH0pLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSBoLnRvZ2dsZVByb3AoMCwgMSksXG4gICAgICAgICAgICAgICAgdG9nZ2xlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHNldFBhcmVudFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0KGguY3VtdWxhdGl2ZU9mZnNldChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbFRvcCA9IGVsLm9mZnNldEhlaWdodCArIGVsLm9mZnNldFBhcmVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAoZWwub2Zmc2V0V2lkdGggKyAyICogcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyAzMCkpeyAvLzMwIGhlcmUgaXMgYSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDMwOyAvL0FkZGluZyB0aGUgc2FmZSBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLXBhcmVudE9mZnNldCgpLmxlZnQgKyAxNSk7IC8vcG9zaXRpb25pbmcgY2VudGVyIG9mIHdpbmRvdywgY29uc2lkZXJpbmcgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgKyAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPD0gd2luZG93LmlubmVyV2lkdGggJiYgKHBhcmVudE9mZnNldCgpLmxlZnQgLSAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPj0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9zaXRpb25pbmcgY2VudGVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1lbC5vZmZzZXRXaWR0aCAvIDIpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9zaXRpb25pbmcgcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgbGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Bvc2l0aW9uaW5nIGxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wKC1lbFRvcCk7IC8vU2V0dGluZyB0b3AgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICAgICAgdG9vbHRpcDogdG9vbHRpcCxcbiAgICAgICAgICAgICAgICB0b2dnbGU6IHRvZ2dsZSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbjogc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc2V0UGFyZW50UG9zaXRpb246IHNldFBhcmVudFBvc2l0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3RybC53aWR0aCgpO1xuICAgICAgICAgICAgcmV0dXJuIG0oYXJncy5lbCwge1xuICAgICAgICAgICAgICAgIG9ubW91c2VlbnRlcjogY3RybC50b2dnbGUsXG4gICAgICAgICAgICAgICAgb25tb3VzZWxlYXZlOiBjdHJsLnRvZ2dsZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UGFyZW50UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ31cbiAgICAgICAgICAgIH0sIGN0cmwudG9vbHRpcCgpID8gW1xuICAgICAgICAgICAgICAgIG0oYC50b29sdGlwLmRhcmtbc3R5bGU9XCJ3aWR0aDogJHt3aWR0aH1weDsgdG9wOiAke2N0cmwudG9wKCl9cHg7IGxlZnQ6ICR7Y3RybC5sZWZ0KCl9cHg7XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UG9zaXRpb25cbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIGFyZ3MudGV4dClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVXNlckNhcmQgPSAoZnVuY3Rpb24obSwgXywgbW9kZWxzLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAgICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgICAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlsc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChjdHJsLnVzZXJEZXRhaWxzKCksIGZ1bmN0aW9uKHVzZXJEZXRhaWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQuY2FyZC11c2VyLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTMwW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LmNvbC1zbWFsbC00LnctY29sLXRpbnktNC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgudy1jb2wtdGlueS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi91c2Vycy8nICsgdXNlckRldGFpbC5pZCArICdcIl0nLCB1c2VyRGV0YWlsLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCB1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cyArICcgcHJvamV0b3MgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdhcG9pb3UgJyArIHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCBmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLW1lc3NhZ2VbaHJlZj1cIm1haWx0bzonICsgdXNlckRldGFpbC5lbWFpbCArICdcIl1baXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW52aWFyIG1lbnNhZ2VtJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9mdWxsX3RleHRfaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3N0YXRlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb20gbyBlc3RhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGFpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGFpZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVzZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVzZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmdfcmVmdW5kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdW5kZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVuZGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnY2hhcmdlYmFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnY2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2RlbGV0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2dhdGV3YXlcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BhZ2FybWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BhZ2FybWUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdNb0lQJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdNb0lQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGF5UGFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYXlQYWwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdDcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdDcsOpZGl0b3MnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3ZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck51bWJlclJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWYWxvcmVzIGVudHJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS52YWx1ZS5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9jcmVhdGVkX2F0XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRhdGVSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVyw61vZG8gZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlciwge1xuICAgICAgICAgICAgICAgICAgICBmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Db250cmlidXRpb25JdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLlVzZXJzID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLnVzZXJMaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi51c2VyRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vbmFtZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBub21lLCBlLW1haWwsIElkcyBkbyB1c3XDoXJpby4uLicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSwgeyAvL3N0YXR1c1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiAnc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZGVhY3RpdmF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdhdGl2bydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIW51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnZGVzYXRpdmFkbydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9ICdVc3XDoXJpb3MnO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pblVzZXJJdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0V4cGxvcmUgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIHNob3cgcHJvamVjdHMgYWNjb3JkaW5nIHRvIHVzZXIgZGVmaW5lZCBmaWx0ZXJzXG4gKlxuICogRXhhbXBsZTpcbiAqIFRvIG1vdW50IHRoaXMgY29tcG9uZW50IGp1c3QgY3JlYXRlIGEgRE9NIGVsZW1lbnQgbGlrZTpcbiAqIDxkaXYgZGF0YS1taXRocmlsPVwiUHJvamVjdHNFeHBsb3JlXCI+XG4gKi9cbndpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0V4cGxvcmUgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgICBmb2xsb3cgPSBjLm1vZGVscy5jYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICAgICAgICAgICAgYnlDYXRlZ29yeSA9IGZpbHRlcnMoe3N0YXRlX29yZGVyOiAnZ3RlJywgY2F0ZWdvcnlfaWQ6ICdlcSd9KS5zdGF0ZV9vcmRlcigncHVibGlzaGVkJyksXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShjLm1vZGVscy5wcm9qZWN0LCAncHJvamVjdF9pZC5kZXNjJyksXG4gICAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwID0gYy5jb250cmlidXRpb24ucHJvamVjdEZpbHRlcnMoKSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5Q29sbGVjdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFByb2plY3RzID0gKHBhZ2VUaXRsZSwgZmlsdGVyLCBzZWxlY3RlZENhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKHBhZ2VUaXRsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQoc2VsZWN0ZWRDYXRlZ29yeSAmJiBzZWxlY3RlZENhdGVnb3J5LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMuZmlyc3RQYWdlKGZpbHRlci5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2FzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlGcm9tUm91dGUgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5KHJvdXRlWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBjYXRlZ29yeUZyb21Sb3V0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm91dGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlWzFdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwW3JvdXRlWzFdXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGl0bGU6IGNhdC5uYW1lLCBmaWx0ZXI6IGJ5Q2F0ZWdvcnkuY2F0ZWdvcnlfaWQoY2F0LmlkKX07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IGZpbHRlckZyb21Sb3V0ZSgpIHx8IGZpbHRlcnNNYXAucmVjb21tZW5kZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9hZFByb2plY3RzKGZpbHRlci50aXRsZSwgZmlsdGVyLmZpbHRlciwgY2F0ZWdvcnlGcm9tUm91dGUoKSk7XG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi13aGl0ZS5mb250d2VpZ2h0LWxpZ2h0LmZvbnRzaXplLWxhcmdlcltocmVmPVxcJyNcXCddJyx7b25jbGljazogKCkgPT4geyBjdHJsLnRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCk7IHJldHVybiBmYWxzZTt9fSwgWydFeHBsb3JlIHByb2pldG9zIGluY3LDrXZlaXMgJyxtKCdzcGFuLmZhLmZhLWFuZ2xlLWRvd24nLCAnJyldKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNjYXRlZ29yaWVzLmNhdGVnb3J5LXNsaWRlcicsIGN0cmwudG9nZ2xlQ2F0ZWdvcmllcygpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQ2F0ZWdvcnlCdXR0b24sIHtjYXRlZ29yeTogY2F0ZWdvcnl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5maWx0ZXJzTWFwLCAoZmlsdGVyLCBocmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5GaWx0ZXJCdXR0b24sIHt0aXRsZTogZmlsdGVyLnRpdGxlLCBocmVmOiBocmVmfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC03LnctY29sLXRpbnktNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGN0cmwudGl0bGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNPYmplY3QoY3RybC5jYXRlZ29yeSgpKSA/IG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbGxvd2luZy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtcmlnaHQnLCBgJHtjdHJsLmNhdGVnb3J5KCkuZm9sbG93ZXJzfSBzZWd1aWRvcmVzYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtMTIudy1jb2wtdGlueS0xMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmNhdGVnb3J5KCkuZm9sbG93aW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnkudW5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC51bkZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnRGVpeGFyIGRlIHNlZ3VpcicpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC5mb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ1NlZ3VpcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMuY29sbGVjdGlvbigpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge3Byb2plY3Q6IHByb2plY3R9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0cy5pc0xvYWRpbmcoKSA/IGgubG9hZGVyKCkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5sb2FkbW9yZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5W2hyZWY9XFwnI2xvYWRNb3JlXFwnXScsIHtvbmNsaWNrOiBjdHJsLnByb2plY3RzLm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSldO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuY29udHJpYnV0aW9uLlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMuY29udHJpYnV0aW9uLnByb2plY3RGaWx0ZXJzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gXy5tYXAoWyduZWFyX21lJywgJ3JlY29tbWVuZGVkJywgJ2V4cGlyaW5nJywgJ3JlY2VudCddLCAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBmaWx0ZXJzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgIGNMb2FkZXIgPSBsb2FkZXJXaXRoVG9rZW4ocHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmLmZpbHRlci5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgICAgIGNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKGNvbGxlY3Rpb24sIHNhbXBsZTMpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNMb2FkZXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5sb2FkZXIoKSA/IGgubG9hZGVyKCkgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSb3csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IGBob21lXyR7Y29sbGVjdGlvbi5oYXNofWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5tb21lbnQsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5GbGV4ID0gKGZ1bmN0aW9uKG0sIGMsIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgc2FtcGxlMyA9IF8ucGFydGlhbChfLnNhbXBsZSwgXywgMyksXG4gICAgICAgICAgICAgICAgYnVpbGRlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnLy9jYXRhcnNlLnVzNS5saXN0LW1hbmFnZS5jb20vc3Vic2NyaWJlL3Bvc3Q/dT1lYmZjZDBkMTZkYmIwMDAxYTBiZWEzNjM5JmFtcDtpZD04YTRjMWEzM2NlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmxleFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIGZsZXhWTS5tb2RlKCdmbGV4Jykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcihtb2RlbHMucHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmbGV4Vk0ucGFyYW1ldGVycygpKSwgbS5wb3N0Z3Jlc3QucmVxdWVzdCk7XG5cbiAgICAgICAgICAgIHN0YXRzTG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcblxuICAgICAgICAgICAgcHJvamVjdHNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHByb2plY3RzLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzOiBhZGREaXNxdXMsXG4gICAgICAgICAgICAgICAgYnVpbGRlcjogYnVpbGRlcixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlcjogc3RhdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICAgICAgICAgIHByb2plY3RzTG9hZGVyOiBwcm9qZWN0c0xvYWRlcixcbiAgICAgICAgICAgICAgICBwcm9qZWN0czoge2NvbGxlY3Rpb246IHByb2plY3RzfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmxvZ28tZmxleC1ob21lW3NyYz1cXCcvYXNzZXRzL2xvZ28tZmxleC5wbmdcXCddW3dpZHRoPVxcJzM1OVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNjAudy1jb2wtcHVzaC0yLnctY29sLTgnLCAnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISAgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlcicsICdQcmEgcXVlbSBzZXLDoT8nKSwgbSgnLmZvbnRzaXplLWJhc2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MCcsICdJbmljaWFyZW1vcyBhIGZhc2UgZGUgdGVzdGVzIGNvbSBjYXRlZ29yaWFzIGRlIHByb2pldG9zIGVzcGVjw61maWNhcycpLCBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5M2EwMWI2NmUyNTBhY2E2N2NiX2ljb24temVsby1jb20ucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnQ2F1c2FzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhbGlzdGFzLCBzYcO6ZGUsIGFqdWRhcyBodW1hbml0w6FyaWFzLCBwcm90ZcOnw6NvIGFvcyBhbmltYWlzLCBlbXByZWVuZGVkb3Jpc21vIHNvY2lvYW1iaWVudGFsLCBhdGl2aXNtbyBvdSBxdWFscXVlciBjb2lzYSBxdWUgdW5hIGFzIHBlc3NvYXMgcGFyYSBmYXplciBvIGJlbS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5MjlhMGRhZWEyMzBhNWYxMmNkX2ljb24temVsby1wZXNzb2FsLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ1ZhcXVpbmhhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJ3AuZm9udHNpemUtYmFzZScsICdDYW1wYW5oYXMgc2ltcGxlcyBxdWUgcHJlY2lzYW0gZGUgZmxleGliaWxpZGFkZSBwYXJhIGFycmVjYWRhciBkaW5oZWlybyBjb20gcGVzc29hcyBwcsOzeGltYXMuIEVzdGFyZW1vcyBhYmVydG9zIGEgdW1hIHZhcmllZGFkZSBkZSBjYW1wYW5oYXMgcGVzc29haXMgcXVlIHBvZGVtIGlyIGRlc2RlIGNvYnJpciBjdXN0b3MgZGUgZXN0dWRvcyBhIGFqdWRhciBxdWVtIHByZWNpc2EgZGUgdHJhdGFtZW50byBtw6lkaWNvLiBEZSBqdW50YXIgYSBncmFuYSBwYXJhIGZhemVyIGFxdWVsYSBmZXN0YSBhIGNvbXByYXIgcHJlc2VudGVzIHBhcmEgYWxndcOpbSBjb20gYSBhanVkYSBkYSBnYWxlcmEuICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWdyZWVubGltZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS1tYXJnaW5ib3R0b20tNjAudS10ZXh0LWNlbnRlcicsICdDb21vIGZ1bmNpb25hcsOhPycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWM1NzhiMjg0NDkzZTJhNDI4YV96ZWxvLW1vbmV5LnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdGaXF1ZSBjb20gcXVhbnRvIGFycmVjYWRhcicpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdPIGZsZXggw6kgcGFyYSBpbXB1bHNpb25hciBjYW1wYW5oYXMgb25kZSB0b2RvIGRpbmhlaXJvIMOpIGJlbSB2aW5kbyEgVm9jw6ogZmljYSBjb20gdHVkbyBxdWUgY29uc2VndWlyIGFycmVjYWRhci4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZDM3YzAxM2Q0YTNlZTY4N2QyX2ljb24tcmV3YXJkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdOw6NvIHByZWNpc2EgZGUgcmVjb21wZW5zYXMnKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTm8gZmxleCBvZmVyZWNlciByZWNvbXBlbnNhcyDDqSBvcGNpb25hbC4gVm9jw6ogZXNjb2xoZSBzZSBvZmVyZWPDqi1sYXMgZmF6IHNlbnRpZG8gcGFyYSBvIHNldSBwcm9qZXRvIGUgY2FtcGFuaGEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlmYjAxYjY2ZTI1MGFjYTY3ZTNfaWNvbi1jdXJhZC5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVm9jw6ogbWVzbW8gcHVibGljYSBzZXUgcHJvamV0bycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdUb2RvcyBvcyBwcm9qZXRvcyBpbnNjcml0b3Mgbm8gZmxleCBlbnRyYW0gbm8gYXIuIEFnaWxpZGFkZSBlIGZhY2lsaWRhZGUgcGFyYSB2b2PDqiBjYXB0YXIgcmVjdXJzb3MgYXRyYXbDqXMgZGEgaW50ZXJuZXQuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWU3N2MwMTNkNGEzZWU2ODdkNF9pY29uLXRpbWUucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0VuY2VycmUgYSBjYW1wYW5oYSBxdWFuZG8gcXVpc2VyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ07Do28gaMOhIGxpbWl0ZSBkZSB0ZW1wbyBkZSBjYXB0YcOnw6NvLiBWb2PDqiBlc2NvbGhlICBxdWFuZG8gZW5jZXJyYXIgc3VhIGNhbXBhbmhhIGUgcmVjZWJlciBvcyB2YWxvcmVzIGFycmVjYWRhZG9zLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2ludG9wLTQwLnUtbWFyZ2luLWJvdHRvbS00MC51LXRleHQtY2VudGVyJywgJ0Nvbmhlw6dhIG9zIHByaW1laXJvcyBwcm9qZXRvcyBmbGV4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0c0xvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge2NvbGxlY3Rpb246IGN0cmwucHJvamVjdHMsIHJlZjogJ2N0cnNlX2ZsZXgnLCB3cmFwcGVyOiAnLnctcm93LnUtbWFyZ2ludG9wLTQwJ30pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAudS1tYXJnaW50b3AtNDAnLCAnRMO6dmlkYXMnKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFpcyBzw6NvIGFzIHRheGFzIGRhIG1vZGFsaWRhZGUgZmxleMOtdmVsPyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0NvbW8gbm8gQ2F0YXJzZSwgZW52aWFyIHVtIHByb2pldG8gbsOjbyBjdXN0YSBuYWRhISBFc3RhbW9zIGVzdHVkYW5kbyBvcMOnw7VlcyBwYXJhIGVudGVuZGVyIHF1YWwgc2Vyw6EgYSB0YXhhIGNvYnJhZGEgbm8gc2VydmnDp28gQ2F0YXJzZSBmbGV4LidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ0RlIG9uZGUgdmVtIG8gZGluaGVpcm8gZG8gbWV1IHByb2pldG8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdGYW3DrWxpYSwgYW1pZ29zLCBmw6NzIGUgbWVtYnJvcyBkZSBjb211bmlkYWRlcyBxdWUgdm9jw6ogZmF6IHBhcnRlIHPDo28gc2V1cyBtYWlvcmVzIGNvbGFib3JhZG9yZXMuIFPDo28gZWxlcyBxdWUgaXLDo28gZGl2dWxnYXIgc3VhIGNhbXBhbmhhIHBhcmEgYXMgcGVzc29hcyBxdWUgZWxlcyBjb25oZWNlbSwgZSBhc3NpbSBvIGPDrXJjdWxvIGRlIGFwb2lhZG9yZXMgdmFpIGF1bWVudGFuZG8gZSBhIHN1YSBjYW1wYW5oYSBnYW5oYSBmb3LDp2EuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbCBhIGRpZmVyZW7Dp2EgZW50cmUgbyBmbGV4w612ZWwgZSBvIFwidHVkbyBvdSBuYWRhXCI/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBdHVhbG1lbnRlIG8gQ2F0YXJzZSB1dGlsaXphIGFwZW5hcyBvIG1vZGVsbyBcInR1ZG8gb3UgbmFkYVwiLCBvbmRlIHZvY8OqIHPDsyBmaWNhIGNvbSBvIGRpbmhlaXJvIHNlIGJhdGVyIGEgbWV0YSBkZSBhcnJlY2FkYcOnw6NvIGRlbnRybyBkbyBwcmF6byBkYSBjYW1wYW5oYS4gTyBtb2RlbG8gZmxleMOtdmVsIMOpIGRpZmVyZW50ZSBwb2lzIHBlcm1pdGUgcXVlIG8gcmVhbGl6YWRvciBmaXF1ZSBjb20gbyBxdWUgYXJyZWNhZGFyLCBpbmRlcGVuZGVudGUgZGUgYXRpbmdpciBvdSBuw6NvIGEgbWV0YSBkbyBwcm9qZXRvIG5vIHByYXpvIGRhIGNhbXBhbmhhLiBOw6NvIGhhdmVyw6EgbGltaXRlIGRlIHRlbXBvIHBhcmEgYXMgY2FtcGFuaGFzLiBOb3NzbyBzaXN0ZW1hIGZsZXjDrXZlbCBzZXLDoSBhbGdvIG5vdm8gZW0gcmVsYcOnw6NvIGFvcyBtb2RlbG9zIHF1ZSBleGlzdGVtIGF0dWFsbWVudGUgbm8gbWVyY2Fkby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1Bvc3NvIGluc2NyZXZlciBwcm9qZXRvcyBwYXJhIGEgbW9kYWxpZGFkZSBmbGV4w612ZWwgasOhPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnUG9yIGVucXVhbnRvIG7Do28uIEEgbW9kYWxpZGFkZSBmbGV4IHNlcsOhIHRlc3RhZGEgY29tIGFsZ3VucyBwcm9qZXRvcyBlc3BlY8OtZmljb3MuIEluc2NyZXZhIHNldSBlbWFpbCBlIHBhcnRpY2lwZSBkYSBjb252ZXJzYSBuZXNzYSBww6FnaW5hIHBhcmEgcmVjZWJlciBpbmZvcm1hw6fDtWVzLCBtYXRlcmlhaXMsIGFjb21wYW5oYXIgcHJvamV0b3MgZW0gdGVzdGUgZSBzYWJlciBjb20gYW50ZWNlZMOqbmNpYSBhIGRhdGEgZGUgbGFuw6dhbWVudG8gZG8gZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3IgcXXDqiB2b2PDqnMgcXVlcmVtIGZhemVyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWNyZWRpdGFtb3MgcXVlIG8gYW1iaWVudGUgZG8gY3Jvd2RmdW5kaW5nIGJyYXNpbGVpcm8gYWluZGEgdGVtIGVzcGHDp28gcGFyYSBtdWl0YXMgYcOnw7VlcywgdGVzdGVzIGUgZXhwZXJpbWVudGHDp8O1ZXMgcGFyYSBlbnRlbmRlciBkZSBmYXRvIG8gcXVlIGFzIHBlc3NvYXMgcHJlY2lzYW0uIFNvbmhhbW9zIGNvbSB0b3JuYXIgbyBmaW5hbmNpYW1lbnRvIGNvbGV0aXZvIHVtIGjDoWJpdG8gbm8gQnJhc2lsLiBPIENhdGFyc2UgZmxleCDDqSBtYWlzIHVtIHBhc3NvIG5lc3NhIGRpcmXDp8Ojby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFuZG8gdm9jw6pzIGlyw6NvIGxhbsOnYXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBaW5kYSBuw6NvIHNhYmVtb3MgcXVhbmRvIGFicmlyZW1vcyBvIGZsZXggcGFyYSBvIHDDumJsaWNvLiBJcmVtb3MgcHJpbWVpcmFtZW50ZSBwYXNzYXIgcG9yIHVtIHBlcsOtb2RvIGRlIHRlc3RlcyBlIGRlcG9pcyBlc3RhYmVsZWNlciB1bWEgZGF0YSBkZSBsYW7Dp2FtZW50by4gU2Ugdm9jw6ogZGVzZWphIGFjb21wYW5oYXIgZSByZWNlYmVyIG5vdMOtY2lhcyBzb2JyZSBlc3NhIGNhbWluaGFkYSwgaW5zY3JldmEgc2V1IGVtYWlsIG5lc3NhIHDDoWdpbmEuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnRmlxdWUgcG9yIGRlbnRybyEnKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAnLCAnUmVjZWJhIG5vdMOtY2lhcyBlIGFjb21wYW5oZSBhIGV2b2x1w6fDo28gZG8gQ2F0YXJzZSBmbGV4JyksIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyOiBjdHJsLmJ1aWxkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLmJnLWNhdGFyc2UtemVsby5zZWN0aW9uLWxhcmdlW3N0eWxlPVwibWluLWhlaWdodDogNTB2aDtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS51LW1hcmdpbmJvdHRvbS00MC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC5mb250Y29sb3ItbmVnYXRpdmUnLCAnTyBmbGV4IMOpIHVtIGV4cGVyaW1lbnRvIGUgaW5pY2lhdGl2YSBkbyBDYXRhcnNlLCBtYWlvciBwbGF0YWZvcm1hIGRlIGNyb3dkZnVuZGluZyBkbyBCcmFzaWwuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCAoY3RybC5zdGF0c0xvYWRlcigpKSA/IGgubG9hZGVyKCkgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfY29udHJpYnV0b3JzLCAwLCAzKSksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnUGVzc29hcyBqYSBhcG9pYXJhbSBwZWxvIG1lbm9zIDAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQcm9qZXRvcyBqYSBmb3JhbSBmaW5hbmNpYWRvcyBub8KgQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnRm9yYW0gaW52ZXN0aWRvcyBlbSBpZGVpYXMgcHVibGljYWRhcyBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1ibHVlLW9uZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21lbmRlIG8gQ2F0YXJzZSBmbGV4IHBhcmEgYW1pZ29zISAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02Lnctc3ViLWNvbC1taWRkbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY2ZTA1ZWI2MTQ0MTcxZDhlZGJfZmFjZWJvb2steHhsLnBuZ1xcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tZmJbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj1mYWNlYm9vayZ0aXRsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdDb25oZcOnYSBvIG5vdm8gQ2F0YXJzZSBGbGV4IScpICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnQ29tcGFydGlsaGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24tc2hhcmUtbW9iaWxlW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzUzYTNmNjUxMDVlYjYxNDQxNzFkOGVkYV90d2l0dGVyLTI1Ni5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLXR3ZWV0W2hyZWY9XCJodHRwOi8vdHdpdHRlci5jb20vP3N0YXR1cz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmcgcGFyYSBvIENhdGFyc2UhIEp1bnRlLXNlIGEgbsOzcywgaW5zY3JldmEgc2V1IGVtYWlsIScpICsgJ2h0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9dHdpdHRlclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnVHVpdGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS5iZy1ncmVlbmxpbWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BhcnRpY2lwZS1kby1kZWJhdGUudS10ZXh0LWNlbnRlcicsIHtjb25maWc6IGgudG9BbmNob3IoKX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VzdC5mb250Y29sb3ItbmVnYXRpdmUnLCdDb25zdHJ1YSBvIGZsZXggY29ub3NjbycpLCBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS02MC5mb250Y29sb3ItbmVnYXRpdmUnLCAnSW5pY2llIHVtYSBjb252ZXJzYSwgcGVyZ3VudGUsIGNvbWVudGUsIGNyaXRpcXVlIGUgZmHDp2Egc3VnZXN0w7VlcyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNkaXNxdXNfdGhyZWFkLmNhcmQudS1yYWRpdXNbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLmFkZERpc3F1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMucGFnZXMuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgICAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgICAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pKSwgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdChkYXRhLnVzZXJfaW1hZ2UpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdhY2Fib3UgZGUgYXBvaWFyIG8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWdpdGh1YicsICcuJyksICcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCJ3aW5kb3cuYy5wYWdlcy5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnByb2plY3QuSW5zaWdodHMgPSAoKG0sIGMsIGgsIG1vZGVscywgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyc1ZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGluc2lnaHRzVk0gPSBjLkluc2lnaHRzVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcChmYWxzZSk7XG5cbiAgICAgICAgICAgIGZpbHRlcnNWTS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsLmxvYWQoKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvdyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKS50aGVuKGNvbnRyaWJ1dGlvbnNQZXJEYXkpO1xuXG4gICAgICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUgPSBbWydFc3RhZG8nLCAnQXBvaW9zJywgJ1IkIGFwb2lhZG9zICglIGRvIHRvdGFsKSddXTtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkUGVyTG9jYXRpb25UYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24uc3RhdGVfYWNyb255bSB8fCAnT3V0cm8vb3RoZXInKTtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkLFsvL0FkZGluZyByb3cgd2l0aCBjdXN0b20gY29tcGFyYXRvciA9PiByZWFkIHByb2plY3QtZGF0YS10YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIiR7Y29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkfVwiYCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnICgnICsgY29udHJpYnV0aW9uLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLnB1c2goY29sdW1uKTtcbiAgICAgICAgICAgICAgICB9KSA6IFtdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKS50aGVuKGJ1aWxkUGVyTG9jYXRpb25UYWJsZSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyUmVmVGFibGUgPSBbWydGb250ZScsICdBcG9pb3MnLCAnUiQgYXBvaWFkb3MgKCUgZG8gdG90YWwpJ11dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24ucmVmZXJyYWxfbGluayB8fCAnZGlyZXRvJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfYW1vdW50LFsvL0FkZGluZyByb3cgd2l0aCBjdXN0b20gY29tcGFyYXRvciA9PiByZWFkIHByb2plY3QtZGF0YS10YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIiR7Y29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkfVwiYCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi50b3RhbF9hbW91bnQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJyAoJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250cmlidXRpb25zUGVyUmVmVGFibGUucHVzaChjb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyUmVmLmdldFJvdyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKS50aGVuKGJ1aWxkUGVyUmVmVGFibGUpO1xuXG4gICAgICAgICAgICBjb25zdCBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQgPSAocHJvamVjdE1vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2Fvbic6IGMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnZmxleCc6IGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZXNbcHJvamVjdE1vZGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIGZpbHRlcnNWTTogZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5OiBjb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlOiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyUmVmVGFibGU6IGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQ6IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBfLmZpcnN0KGN0cmwucHJvamVjdERldGFpbHMoKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1pbnNpZ2h0cycsICFjdHJsLmwoKSA/IFtcbiAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY3RybC5leHBsYW5hdGlvbk1vZGVDb21wb25lbnQocHJvamVjdC5tb2RlKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFDaGFydCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFDaGFydCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhS2V5OiAndG90YWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTG9jYWxpemHDp8OjbyBnZW9ncsOhZmljYSBkb3MgYXBvaW9zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogY3RybC5jb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3JpZ2VtIGRvcyBhcG9pb3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6ICcnXG4gICAgICAgICAgICBdIDogaC5sb2FkZXIoKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnByb2plY3QuU2hvdyA9ICgobSwgYywgXywgbW9kZWxzLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGlkVk0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnByb2plY3RfaWQpO1xuICAgICAgICAgICAgaWRWTS5pZChhcmdzLnByb2plY3RfdXNlcl9pZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxQcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnModm0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgbFVzZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyhpZFZNLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgbFByb2plY3QubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgbFJld2FyZC5sb2FkKCkudGhlbihyZXdhcmREZXRhaWxzKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlscyxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0OiBsUHJvamVjdCxcbiAgICAgICAgICAgICAgICBsVXNlcjogbFVzZXIsXG4gICAgICAgICAgICAgICAgbFJld2FyZDogbFJld2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICghKGN0cmwubFByb2plY3QoKSB8fCBjdHJsLmxVc2VyKCkgfHwgY3RybC5sUmV3YXJkKCkpKSA/IF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLm1peHBhbmVsVHJhY2soKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGN0cmwudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFRhYnMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgIGdhdGV3YXk6ICdlcScsXG4gICAgICAgICAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgICAgICAgICAgY3JlYXRlZF9hdDogJ2JldHdlZW4nXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uc3RhdGUoJycpO1xuICAgIHZtLmdhdGV3YXkoJycpO1xuICAgIHZtLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gICAgfTtcblxuICAgIHZtLmNyZWF0ZWRfYXQuZ3RlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xuICAgIH07XG5cbiAgICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwpO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgZGVhY3RpdmF0ZWRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLmRlYWN0aXZhdGVkX2F0KG51bGwpLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IEpTT04ucGFyc2Uodm0uZGVhY3RpdmF0ZWRfYXQoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuY29udHJpYnV0aW9uLnByb2plY3RGaWx0ZXJzID0gKChtLCBoLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4gKCkgPT57XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG5cbiAgICAgICAgICAgICAgbmVhck1lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBuZWFyX21lOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5uZWFyX21lKHRydWUpLFxuXG4gICAgICAgICAgICAgIGV4cGlyaW5nID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiAnbHRlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSxcblxuICAgICAgICAgICAgICByZWNlbnQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3RlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkucmVjb21tZW5kZWQoJ3RydWUnKS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJyksXG5cbiAgICAgICAgICAgICAgb25saW5lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBzdWNjZXNzZnVsID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJ1xuICAgICAgICAgICAgICB9KS5zdGF0ZSgnc3VjY2Vzc2Z1bCcpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWNvbW1lbmRlZDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjb21lbmRhZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY29tbWVuZGVkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdObyBhcicsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBvbmxpbmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleHBpcmluZzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmV0YSBmaW5hbCcsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBleHBpcmluZ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0JlbS1zdWNlZGlkb3MnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlY2VudDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjZW50ZXMnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogcmVjZW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmVhcl9tZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgbWltJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IG5lYXJNZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=