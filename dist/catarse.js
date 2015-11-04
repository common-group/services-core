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
    var setMomentifyLocale = function setMomentifyLocale() {
        moment.locale('pt', {
            monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
        });
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

    //Object manipulation helpers
    generateRemaingTime = function generateRemaingTime(project) {
        var remainingTextObj = m.prop({}),
            remainingTime = project.remaining_time.total,
            translatedTime = {
            days: 'dias',
            minutes: 'minutos',
            hours: 'horas',
            seconds: 'segundos'
        },
            unit = function unit() {
            var projUnit = translatedTime[project.remaining_time.unit || 'seconds'];

            return remainingTime <= 1 ? projUnit.slice(0, -1) : projUnit;
        };

        remainingTextObj({
            unit: unit(),
            total: remainingTime
        });

        return remainingTextObj;
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
        hashMatch = function hashMatch(str) {
        return window.location.hash === str;
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
    };

    setMomentifyLocale();

    return {
        discuss: discuss,
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
        generateRemaingTime: generateRemaingTime,
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
        project = m.postgrest.model('projects'),
        teamMember = m.postgrest.model('team_members'),
        statistic = m.postgrest.model('statistics');

    teamMember.pageSize(40);
    rewardDetail.pageSize(false);
    project.pageSize(30);

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
        projectContributionsPerDay: projectContributionsPerDay,
        projectContributionsPerLocation: projectContributionsPerLocation,
        projectContribution: projectContribution,
        projectPostDetail: projectPostDetail,
        projectReminder: projectReminder,
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
'use strict';

window.c.AdminProjectDetailsCard = (function (m, h) {
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

            return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m('div', [m('.fontsize-small.fontweight-semibold', [m('span.fontcolor-secondary', 'Status:'), ' ', m('span', {
                'class': statusTextObj.cssClass
            }, statusTextObj.text), ' ']), (function () {
                if (project.is_published) {
                    return [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', {
                        style: {
                            width: (progress > 100 ? 100 : progress) + '%'
                        }
                    })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)]), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' restantes')])])];
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
                        property: 'user_password',
                        updateKey: 'password',
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
            return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', [m.component(c.AdminInputAction, { data: actions.reset, item: item }), item.deactivated_at ? m.component(c.AdminInputAction, { data: actions.reactivate, item: item }) : ''])]);
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
            var project = args.project;
            return m('#project-about', [m('.project-about.w-col.w-col-8', {
                config: h.UIHelper()
            }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)), m('p.fontsize-large.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', [m('.w-hidden-small.w-hidden-tiny.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(c.ProjectRewardList, {
                project: project,
                rewardDetails: args.rewardDetails
            }), project.is_published ? m('.funding-period', [m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'), m('.fontsize-small.u-text-center-small-only', [h.momentify(project.online_date), ' - ', h.momentify(project.zone_expires_at), ' (' + project.online_days + ' dias) '])]) : ''])]);
        }
    };
})(window.m, window.c, window.c.h);
'use strict';

window.c.ProjectCard = (function (m, h, models) {
    return {

        view: function view(ctrl, args) {
            var project = args.project,
                progress = project.progress.toFixed(2),
                remainingTextObj = h.generateRemaingTime(project)(),
                link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : '');

            return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + link + '"]', {
                style: {
                    'background-image': 'url(' + project.project_img + ')',
                    'display': 'block'
                }
            }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter', [m('.meter', [m('.meter-fill', {
                style: {
                    width: (progress > 100 ? 100 : progress) + '%'
                }
            })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')])])])])]);
        }
    };
})(window.m, window.c.h, window._);
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
            return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'R$ arrecadados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', {
                config: ctrl.renderChart
            })])])]);
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
            return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Apoios confirmados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', {
                config: ctrl.renderChart
            })])])]);
        }
    };
})(window.m, window.Chart, window._, window.c.h);
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

window.c.ProjectContributionsPerLocationTable = (function (m, models, h, _) {
    return {
        controller: function controller(args) {
            var vm = m.postgrest.filtersVM({
                project_id: 'eq'
            }),
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
                return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', 'Estado')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', {
                    onclick: ctrl.generateSort('total_contributions')
                }, ['Apoios ', m('span.fa.fa-sort')])]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', {
                    onclick: ctrl.generateSort('total_contributed')
                }, ['R$ apoiados ', m('span.w-hidden-small.w-hidden-tiny', '(% do total) '), ' ', m('span.fa.fa-sort')])])]), m('.table-inner.fontsize-small', [_.map(contributionLocation.source, function (source) {
                    return m('.w-row.table-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.state_acronym || 'Outro/other')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.total_contributions)]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', ['R$ ', h.formatNumber(source.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + source.total_on_percentage.toFixed(2) + '%)')])])]);
                })])]);
            })]);
        }
    };
})(window.m, window.c.models, window.c.h, window._);
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
                return m('.w-clearfix', [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('a[href="/users/' + contribution.user_id + '"]', [m('.thumb.u-left.u-round[style="background-image: url(' + (!_.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')])]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', [m('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), contribution.is_owner_or_admin ? m('.fontsize-smaller', ['R$ ' + h.formatNumber(contribution.value, 2, 3), contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '']) : '', m('.fontsize-smaller', h.momentify(contribution.created_at, 'DD/MM/YYYY, h:mm') + 'h'), m('.fontsize-smaller', contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora')])])]), m('.divider.u-marginbottom-20')]);
            })), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                onclick: list.nextPage
            }, 'Carregar mais') : h.loader()])])]);
        }
    };
})(window.m, window.c.models, window.c.h, window._);
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

            ctrl.body.className = ctrl.bodyToggleForNav();

            return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (_.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name)]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), ' Minha Campanha']), project.is_published ? [m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), ' Relatórios de apoios']), m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), ' Novidades ', m('span.badge', project.posts_count)])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
                onclick: ctrl.editLinksToggle.toggle
            }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), ' Editar projeto']), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Meta e prazo')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', 'Vídeo'), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', 'Orçamento'), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', 'Recompensas'), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published ? [m('.btn-send-draft-fixed', [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', 'Enviar') : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : ''])])]), m('a.btn-dashboard href="js:void(0);"', {
                onclick: ctrl.bodyToggleForNav.toggle
            }, [m('span.fa.fa-bars.fa-lg')])]);
        }
    };
})(window.m, window._, window.c.h);
'use strict';

window.c.ProjectHeader = (function (m, c) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            return m('#project-header', [m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['por ', project.user.name])])]), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {
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
        view: function view(ctrl) {
            return m('#project-reminder.u-text-center.u-marginbottom-30', [m('button[class="btn-link link-hidden fontsize-small ' + (ctrl.inReminder() ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
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

                return m('a[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project.open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project.open_for_contributions && !h.rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [m('.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'), m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoiador', ' apoiadores')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h.rewardSouldOut(reward) ? m('.u-margintop-10', [m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m('.u-margintop-10', [m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', 'Limitada'), ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(reward.description))), !_.isEmpty(reward.deliver_at) ? m('.fontsize-smaller', [m('b', 'Estimativa de Entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project.open_for_contributions && !h.rewardSouldOut(reward) ? m('.project-reward-box-hover', [m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
            }));
        }
    };
})(window.m, window.c.h, window._);
'use strict';

window.c.ProjectRow = (function (m) {
    return {

        view: function view(ctrl, args) {
            var collection = args.collection,
                ref = args.ref;
            return collection.collection().length > 0 ? m('.w-section.section.u-marginbottom-40', [m('.w-container', [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]), m('.w-row', _.map(collection.collection(), function (project) {
                return m.component(c.ProjectCard, {
                    project: project,
                    ref: ref
                });
            }))])]) : m('');
        }
    };
})(window.m);
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
                    'online': 'Você pode apoiar este projeto até o dia ' + h.momentify(project.zone_expires_at) + ' às 23h59m59s',
                    'failed': 'Este projeto não atingiu o mínimo de R$ ' + h.formatNumber(project.goal) + ' até ' + h.momentify(project.zone_expires_at) + ' e não foi financiado',
                    'rejected': 'Este projeto não foi aceito. Não é possível realizar um apoio.',
                    'in_analysis': 'Este projeto está em análise e ainda não está aberto para receber apoios.',
                    'successful': 'Este projeto foi bem-sucedido e foi financiado em ' + h.momentify(project.zone_expires_at),
                    'waiting_funds': 'O prazo de captação desse projeto está encerrado. Estamos aguardando a confirmação dos últimos pagamentos.',
                    'draft': 'Este projeto é apenas um rascunho e ainda não pode receber apoios.'
                };

                return states[project.state];
            };

            return {
                displayCardClass: displayCardClass,
                displayStatusText: displayStatusText
            };
        },

        view: function view(ctrl, args) {
            var project = args.project,
                timeObj = h.generateRemaingTime(project)();

            return m('#project-sidebar.aside', [m('.project-stats', [m('.w-clearfix.u-marginbottom-20', [m('.w-col.w-col-tiny-6.w-col-small-4.fontweight-semibold.u-marginbottom-20', [m('.fontsize-largest', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smaller.lineheight-tightest', 'atingidos de R$ ' + h.formatNumber(project.goal))]), m('.w-col.w-col-tiny-3.w-col-small-4.fontweight-semibold.u-marginbottom-20', [m('.fontsize-largest', project.total_contributions), m('.fontsize-smaller.lineheight-tightest', 'apoios')]), m('.w-col.w-col-tiny-3.w-col-small-4.u-marginbottom-10.fontweight-semibold', [m('.fontsize-largest', project.is_published ? timeObj.total : project.online_days || 0), m('.fontsize-smaller.lineheight-tightest', [m('span[style="text-transform:capitalize;"]', project.is_published ? timeObj.unit : 'dias'), timeObj.total > 1 ? ' restantes' : ' restante'])])]), project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar este projeto') : '', project.open_for_contributions ? m.component(c.ProjectReminder, {
                project: project
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + ctrl.displayCardClass() + '"]', ctrl.displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
                userDetails: args.userDetails
            }))]);
        }
    };
})(window.m, window.c.h, window.c);
'use strict';

window.c.ProjectTabs = (function (m, h) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            return m('.w-section.project-nav.mf', [m('.w-container', [m('.w-row', [m('.w-col.w-col-9', [m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
                style: 'float: left;'
            }, 'Recompensas'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
                style: 'float: left;'
            }, 'Sobre'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
                style: 'float: left;'
            }, ['Novidades ', m('span.badge', project.posts_count)]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
                style: 'float: left;'
            }, ['Apoios ', m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
                style: 'float: left;'
            }, ['Comentários ', m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))])])])])]);
        }
    };
})(window.m, window.c.h);
'use strict';

window.c.ProjectUserCard = (function (m, _, h) {
    return {
        view: function view(ctrl, args) {
            return m('#user-card', _.map(args.userDetails(), function (userDetail) {
                return m('.u-marginbottom-30.u-text-center-small-only', [m('.w-row', [m('.w-col.w-col-4', [m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m('.w-col.w-col-8', [m('.fontsize-small.link-hidden.fontweight-semibold.lineheight-looser[itemprop="name"]', [m('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), m('.fontsize-smallest', [h.pluralize(userDetail.total_published_projects, ' criado', ' criados'), m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_.isEmpty(userDetail.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_.isEmpty(userDetail.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _.map(userDetail.links, function (link) {
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

window.c.contribution.ProjectsHome = (function (m, c, moment, h, _) {
    return {
        controller: function controller() {
            var sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                vm = {
                recommendedCollection: m.prop([]),
                recentCollection: m.prop([]),
                nearMeCollection: m.prop([]),
                expiringCollection: m.prop([])
            },
                project = c.models.project,
                expiring = m.postgrest.filtersVM({
                expires_at: 'lte',
                state: 'eq'
            }),
                nearMe = m.postgrest.filtersVM({
                near_me: 'eq',
                state: 'eq'
            }),
                recents = m.postgrest.filtersVM({
                online_date: 'gte',
                state: 'eq'
            }),
                recommended = m.postgrest.filtersVM({
                recommended: 'eq',
                state: 'eq'
            });

            expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
            expiring.state('online');

            nearMe.near_me('true').state('online');

            recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
            recents.state('online');

            recommended.recommended('true').state('online');

            var nearMeLoader = loaderWithToken(project.getPageOptions(nearMe.parameters()));
            nearMeLoader.load().then(_.compose(vm.nearMeCollection, sample3));
            var recommendedLoader = loader(project.getPageOptions(recommended.parameters()));
            recommendedLoader.load().then(_.compose(vm.recommendedCollection, sample3));
            var recentLoader = loader(project.getPageOptions(recents.parameters()));
            recentLoader.load().then(_.compose(vm.recentCollection, sample3));
            var expiringLoader = loader(project.getPageOptions(expiring.parameters()));
            expiringLoader.load().then(_.compose(vm.expiringCollection, sample3));

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
                collections: collections,
                nearMeLoader: nearMeLoader,
                recommendedLoader: recommendedLoader,
                expiringLoader: expiringLoader,
                recentLoader: recentLoader
            };
        },

        view: function view(ctrl) {
            var isLoading = m.prop(ctrl.nearMeLoader() || ctrl.recommendedLoader() || ctrl.expiringLoader() || ctrl.recentLoader());
            return !isLoading() ? _.map(ctrl.collections, function (collection) {
                return m.component(c.ProjectRow, {
                    collection: collection,
                    ref: 'home_' + collection.hash
                });
            }) : h.loader();
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._);
'use strict';

window.c.pages.Flex = (function (m, c, h, models) {
    return {
        controller: function controller() {
            var stats = m.prop([]),
                l = m.prop(),
                builder = {
                customAction: '//catarse.us5.list-manage.com/subscribe/post?u=ebfcd0d16dbb0001a0bea3639&amp;id=8a4c1a33ce'
            },
                addDisqus = function addDisqus(el, isInitialized) {
                if (!isInitialized) {
                    h.discuss('https://catarse.me/flex', 'flex_page');
                }
            },
                loader = m.postgrest.loaderWithToken(models.statistic.getRowOptions());

            loader.load().then(stats);

            return {
                addDisqus: addDisqus,
                builder: builder,
                loader: loader,
                stats: stats
            };
        },
        view: function view(ctrl, args) {
            var stats = _.first(ctrl.stats());
            return [m('.w-section.hero-full.hero-zelo', [m('.w-container.u-text-center', [m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m('.w-row', [m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding para o Catarse!  Junte-se a nós, inscreva seu email!')]), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
                builder: ctrl.builder
            }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistencialistas, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no Flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(c.landingQA, {
                question: 'Quais são as taxas da modalidade flexível? ',
                answer: 'Como no Catarse, enviar um projeto não custa nada! Estamos estudando opções para entender qual será a taxa cobrada no serviço Catarse Flex.'
            }), m.component(c.landingQA, {
                question: 'De onde vem o dinheiro do meu projeto?',
                answer: 'Como no Catarse, enviar um projeto não custa nada! Estamos estudando opções para entender qual será a taxa cobrada no serviço Catarse Flex.'
            }), m.component(c.landingQA, {
                question: 'Qual a diferença entre o flexível e o "tudo ou nada"?',
                answer: 'Atualmente o Catarse utiliza apenas o modelo "tudo ou nada", onde você só fica com o dinheiro se bater a meta de arrecadação dentro do prazo da campanha. O modelo flexível é diferente pois permite que o realizador fique com o que arrecadar, independente de atingir ou não a meta do projeto no prazo da campanha. Não haverá limite de tempo para as campanhas. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado.'
            })]), m('.w-col.w-col-6', [m.component(c.landingQA, {
                question: 'Posso inscrever projetos para a modalidade flexível já?',
                answer: 'Por enquanto não. A modalidade flex será testada com alguns projetos específicos. Inscreva seu email e participe da conversa nessa página para receber informações, materiais, acompanhar projetos em teste e saber com antecedência a data de lançamento do flex.'
            }), m.component(c.landingQA, {
                question: 'Por quê vocês querem fazer o CatarseFlex?',
                answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O CatarseFlex é mais um passo nessa direção.'
            }), m.component(c.landingQA, {
                question: 'Quando vocês irão lançar o Catarse flex?',
                answer: 'Ainda não sabemos quando abriremos o Flex para o público. Iremos primeiramente passar por um período de testes e depois estabelecer uma data de lançamento. Se você deseja acompanhar e receber notícias sobre essa caminhada, inscreva seu email nessa página.'
            })])])])]), m('.w-section.section-large.u-text-center.bg-purple', [m('.w-container.fontcolor-negative', [m('.fontsize-largest', 'Fique por dentro!'), m('.fontsize-base.u-marginbottom-60', 'Receba notícias e acompanhe a evolução do Catarse flex'), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
                builder: ctrl.builder
            }), m('.w-col.w-col-2')])])]), m('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m('.w-container.u-text-center', [m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O Flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), m('.w-row.u-text-center', ctrl.loader() ? h.loader() : [m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), m('.w-section.section.bg-blue-one', [m('.w-container', [m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), m('.w-col.w-col-2')])])]), m('.w-section.section-large.bg-greenlime', [m('.w-container', [m('#participe-do-debate.u-text-center', { config: h.toAnchor() }, [m('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), m('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
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

window.c.project.Insights = (function (m, c, models, _) {
    return {
        controller: function controller(args) {
            var vm = m.postgrest.filtersVM({
                project_id: 'eq'
            }),
                projectDetails = m.prop([]),
                contributionsPerDay = m.prop([]);

            vm.project_id(args.root.getAttribute('data-id'));

            models.projectDetail.getRowWithToken(vm.parameters()).then(projectDetails);
            models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay);

            return {
                vm: vm,
                projectDetails: projectDetails,
                contributionsPerDay: contributionsPerDay
            };
        },
        view: function view(ctrl) {
            return _.map(ctrl.projectDetails(), function (project) {
                return m('.project-insights', [project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                    project: project
                }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'), m.component(c.AdminProjectDetailsCard, {
                    resource: project
                }), m.component(c.AdminProjectDetailsExplanation, {
                    resource: project
                })]), m('.w-col.w-col-2')])]), (function (project) {
                    if (project.is_published) {
                        return [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                            style: {
                                'min-height': '300px'
                            }
                        }, [m.component(c.ProjectChartContributionTotalPerDay, {
                            collection: ctrl.contributionsPerDay
                        })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                            style: {
                                'min-height': '300px'
                            }
                        }, [m.component(c.ProjectChartContributionAmountPerDay, {
                            collection: ctrl.contributionsPerDay
                        })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectContributionsPerLocationTable, {
                            resourceId: ctrl.vm.project_id()
                        })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, {
                            resource: project
                        })])])])])];
                    }
                })(project)]);
            });
        }
    };
})(window.m, window.c, window.c.models, window._);
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
                    project: project
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
        full_text_index: '@@'
    }),
        paramToString = function paramToString(p) {
        return (p || '').toString().trim();
    };

    // Set default values
    vm.order({
        id: 'desc'
    });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1jYXJkLmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiYWRtaW4tcHJvamVjdC5qcyIsImFkbWluLXJhZGlvLWFjdGlvbi5qcyIsImFkbWluLXJld2FyZC5qcyIsImFkbWluLXRyYW5zYWN0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi10cmFuc2FjdGlvbi5qcyIsImFkbWluLXVzZXItZGV0YWlsLmpzIiwiYWRtaW4tdXNlci1pdGVtLmpzIiwiYWRtaW4tdXNlci5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwibGFuZGluZy1xYS5qcyIsImxhbmRpbmctc2lnbnVwLmpzIiwicGF5bWVudC1zdGF0dXMuanMiLCJwb3Atbm90aWZpY2F0aW9uLmpzIiwicHJvamVjdC1hYm91dC5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29tbWVudHMuanMiLCJwcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uLXRhYmxlLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC1kYXNoYm9hcmQtbWVudS5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmVtaW5kZXIuanMiLCJwcm9qZWN0LXJld2FyZC1saXN0LmpzIiwicHJvamVjdC1yb3cuanMiLCJwcm9qZWN0LXNoYXJlLWJveC5qcyIsInByb2plY3Qtc2lkZWJhci5qcyIsInByb2plY3QtdGFicy5qcyIsInByb2plY3QtdXNlci1jYXJkLmpzIiwidGVhbS1tZW1iZXJzLmpzIiwidGVhbS10b3RhbC5qcyIsInVzZXItY2FyZC5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMuanMiLCJhZG1pbi91c2Vycy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0cy1ob21lLmpzIiwicGFnZXMvZmxleC5qcyIsInBhZ2VzL2xpdmUtc3RhdGlzdGljcy5qcyIsInBhZ2VzL3RlYW0uanMiLCJwcm9qZWN0L2luc2lnaHRzLmpzIiwicHJvamVjdC9zaG93LmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tZmlsdGVyLXZtLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy9jb250cmlidXRpb24tbGlzdC12bS5qcyIsImFkbWluL3VzZXJzL3VzZXItZmlsdGVyLXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1saXN0LXZtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxDQUFDLENBQUMsR0FBSSxDQUFBLFlBQVc7QUFDbkIsV0FBTztBQUNILGNBQU0sRUFBRSxFQUFFO0FBQ1YsYUFBSyxFQUFFLEVBQUU7QUFDVCxvQkFBWSxFQUFFLEVBQUU7QUFDaEIsYUFBSyxFQUFFLEVBQUU7QUFDVCxlQUFPLEVBQUUsRUFBRTtBQUNYLFNBQUMsRUFBRSxFQUFFO0tBQ1IsQ0FBQztDQUNMLENBQUEsRUFBRSxBQUFDLENBQUM7OztBQ1RMLE1B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LGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDdEMsQ0FBQzs7O0FBR04sTUFBRSxDQUFDLEtBQUssQ0FBQztBQUNMLFVBQUUsRUFBRSxNQUFNO0tBQ2IsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxHQUFHLFlBQVc7QUFDckMsWUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELGVBQU8sTUFBTSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQztLQUMzRCxDQUFDOztBQUVGLFdBQU8sRUFBRSxDQUFDO0NBQ2IsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEFBQUMsQ0FBQzs7O0FDcEJ2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDN0MsV0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDaEQsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9IChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbHM6IHt9LFxuICAgICAgICBwYWdlczoge30sXG4gICAgICAgIGNvbnRyaWJ1dGlvbjoge30sXG4gICAgICAgIGFkbWluOiB7fSxcbiAgICAgICAgcHJvamVjdDoge30sXG4gICAgICAgIGg6IHt9XG4gICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKChtLCBtb21lbnQpID0+IHtcbiAgICAvL0RhdGUgSGVscGVyc1xuICAgIGNvbnN0IHNldE1vbWVudGlmeUxvY2FsZSA9ICgpID0+IHtcbiAgICAgICAgbW9tZW50LmxvY2FsZSgncHQnLCB7XG4gICAgICAgICAgICAgICAgbW9udGhzU2hvcnQ6ICdqYW5fZmV2X21hcl9hYnJfbWFpX2p1bl9qdWxfYWdvX3NldF9vdXRfbm92X2Rleicuc3BsaXQoJ18nKVxuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICAgICBtb21lbnRpZnkgPSAoZGF0ZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGUgPyBtb21lbnQoZGF0ZSkubG9jYWxlKCdwdCcpLmZvcm1hdChmb3JtYXQpIDogJ25vIGRhdGUnO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3JlQWN0aW9uID0gKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKCFzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShhY3Rpb24sIGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbFN0b3JlZEFjdGlvbiA9IChhY3Rpb24sIGZ1bmMpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmdW5jLmNhbGwoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2N1c3MgPSAocGFnZSwgaWRlbnRpZmllcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZCA9IGRvY3VtZW50LFxuICAgICAgICAgICAgICAgIHMgPSBkLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgd2luZG93LmRpc3F1c19jb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gcGFnZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IGlkZW50aWZpZXI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcy5zcmMgPSAnLy9jYXRhcnNlZmxleC5kaXNxdXMuY29tL2VtYmVkLmpzJztcbiAgICAgICAgICAgIHMuc2V0QXR0cmlidXRlKCdkYXRhLXRpbWVzdGFtcCcsICtuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIChkLmhlYWQgfHwgZC5ib2R5KS5hcHBlbmRDaGlsZChzKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb21lbnRGcm9tU3RyaW5nID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXVyb3BlYW4gPSBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XG4gICAgICAgICAgICByZXR1cm4gZXVyb3BlYW4uaXNWYWxpZCgpID8gZXVyb3BlYW4gOiBtb21lbnQoZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgICAgICAgZ2VuZXJhdGVSZW1haW5nVGltZSA9IChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmdUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUaW1lID0gcHJvamVjdC5yZW1haW5pbmdfdGltZS50b3RhbCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVkVGltZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnaG9yYXMnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1bml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qVW5pdCA9IHRyYW5zbGF0ZWRUaW1lW3Byb2plY3QucmVtYWluaW5nX3RpbWUudW5pdCB8fCAnc2Vjb25kcyddO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocmVtYWluaW5nVGltZSA8PSAxKSA/IHByb2pVbml0LnNsaWNlKDAsIC0xKSA6IHByb2pVbml0O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmooe1xuICAgICAgICAgICAgICAgIHVuaXQ6IHVuaXQoKSxcbiAgICAgICAgICAgICAgICB0b3RhbDogcmVtYWluaW5nVGltZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW1haW5pbmdUZXh0T2JqO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICAgICAgICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IChzLCBjKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciwgbiwgeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChudW1iZXIgPT09IG51bGwgfHwgbnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbnVtYmVyLnRvRml4ZWQoTWF0aC5tYXgoMCwgfn5uKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXROdW1iZXIgPSBnZW5lcmF0ZUZvcm1hdE51bWJlcignLicsICcsJyksXG5cbiAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgICAgICAgICBwLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaWRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICB9KSxcblxuICAgICAgICBnZXRVc2VyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JyksXG4gICAgICAgICAgICAgICAgZGF0YSA9IF8uZmlyc3QoYm9keSkuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZXInKTtcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBoYXNoTWF0Y2ggPSAoc3RyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhdGlvbkFjdGlvbk1hdGNoID0gKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbiA9PT0gYWN0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdCA9IChhdmF0YXJQYXRoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXZhdGFyUGF0aCB8fCAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZyc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9UZW1wbGF0ZXNcbiAgICAgICAgbG9hZGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2ludG9wLTMwIHUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJ5UGFyc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQodHJ5UGFyc2UsIDUwMCk7IC8vdXNlIHRpbWVvdXQgdG8gd2FpdCBhc3luYyBvZiBmYWNlYm9va1xuICAgICAgICB9LFxuXG4gICAgICAgIHBsdXJhbGl6ZSA9IChjb3VudCwgcywgcCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjb3VudCA+IDEgPyBjb3VudCArIHAgOiBjb3VudCArIHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbXBsZUZvcm1hdCA9IChzdHIgPSAnJykgPT4ge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG4vZywgJzxiciAvPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICByZXdhcmRTb3VsZE91dCA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAgICAgICAgIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPj0gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucykgOiBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkUmVtYW5pbmcgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyAtIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVXJsID0gKGhyZWYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWl4cGFuZWxUcmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkNhdGFyc2VNaXhwYW5lbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgVUlIZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlVJSGVscGVyLnNldHVwUmVzcG9uc2l2ZUlmcmFtZXMoJChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICBcbiAgICAgICAgfSxcblxuICAgICAgICB0b0FuY2hvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzaCA9PT0gZWwuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbC5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZUVtYWlsID0gKGVtYWlsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZSA9IC9eKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXStcXC4pK1tePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl17Mix9KSQvaTtcbiAgICAgICAgICAgIHJldHVybiByZS50ZXN0KGVtYWlsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuYXZpZ2F0ZVRvRGV2aXNlID0gKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3B0L2xvZ2luJztcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGlzY3VzczogZGlzY3VzcyxcbiAgICAgICAgdmFsaWRhdGVFbWFpbDogdmFsaWRhdGVFbWFpbCxcbiAgICAgICAgbW9tZW50aWZ5OiBtb21lbnRpZnksXG4gICAgICAgIG1vbWVudEZyb21TdHJpbmc6IG1vbWVudEZyb21TdHJpbmcsXG4gICAgICAgIGZvcm1hdE51bWJlcjogZm9ybWF0TnVtYmVyLFxuICAgICAgICBpZFZNOiBpZFZNLFxuICAgICAgICBnZXRVc2VyOiBnZXRVc2VyLFxuICAgICAgICB0b2dnbGVQcm9wOiB0b2dnbGVQcm9wLFxuICAgICAgICBsb2FkZXI6IGxvYWRlcixcbiAgICAgICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICAgICAgcGx1cmFsaXplOiBwbHVyYWxpemUsXG4gICAgICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgICAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lLFxuICAgICAgICByZXdhcmRTb3VsZE91dDogcmV3YXJkU291bGRPdXQsXG4gICAgICAgIHJld2FyZFJlbWFuaW5nOiByZXdhcmRSZW1hbmluZyxcbiAgICAgICAgcGFyc2VVcmw6IHBhcnNlVXJsLFxuICAgICAgICBoYXNoTWF0Y2g6IGhhc2hNYXRjaCxcbiAgICAgICAgdXNlQXZhdGFyT3JEZWZhdWx0OiB1c2VBdmF0YXJPckRlZmF1bHQsXG4gICAgICAgIGxvY2F0aW9uQWN0aW9uTWF0Y2g6IGxvY2F0aW9uQWN0aW9uTWF0Y2gsXG4gICAgICAgIG1peHBhbmVsVHJhY2s6IG1peHBhbmVsVHJhY2ssXG4gICAgICAgIG5hdmlnYXRlVG9EZXZpc2U6IG5hdmlnYXRlVG9EZXZpc2UsXG4gICAgICAgIHN0b3JlQWN0aW9uOiBzdG9yZUFjdGlvbixcbiAgICAgICAgY2FsbFN0b3JlZEFjdGlvbjogY2FsbFN0b3JlZEFjdGlvbixcbiAgICAgICAgVUlIZWxwZXI6IFVJSGVscGVyLFxuICAgICAgICB0b0FuY2hvcjogdG9BbmNob3JcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMubW9kZWxzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgY29udHJpYnV0aW9uRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbl9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9kZXRhaWxzJyksXG4gICAgICAgIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gICAgICAgIHVzZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcnMnKSxcbiAgICAgICAgcmV3YXJkRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Jld2FyZF9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3RSZW1pbmRlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3JlbWluZGVycycpLFxuICAgICAgICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgICAgICAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zJyksXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcG9zdHNfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfbG9jYXRpb24nKSxcbiAgICAgICAgcHJvamVjdCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0cycpLFxuICAgICAgICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpLFxuICAgICAgICBzdGF0aXN0aWMgPSBtLnBvc3RncmVzdC5tb2RlbCgnc3RhdGlzdGljcycpO1xuXG4gICAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gICAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbiAgICBwcm9qZWN0LnBhZ2VTaXplKDMwKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyaWJ1dGlvbkRldGFpbDogY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICBwcm9qZWN0RGV0YWlsOiBwcm9qZWN0RGV0YWlsLFxuICAgICAgICB1c2VyRGV0YWlsOiB1c2VyRGV0YWlsLFxuICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICByZXdhcmREZXRhaWw6IHJld2FyZERldGFpbCxcbiAgICAgICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICAgICAgdGVhbVRvdGFsOiB0ZWFtVG90YWwsXG4gICAgICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbixcbiAgICAgICAgcHJvamVjdFBvc3REZXRhaWw6IHByb2plY3RQb3N0RGV0YWlsLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXI6IHByb2plY3RSZW1pbmRlcixcbiAgICAgICAgc3RhdGlzdGljOiBzdGF0aXN0aWNcbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb25EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBsO1xuICAgICAgICAgICAgY29uc3QgbG9hZFJld2FyZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlbCA9IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkX2lkID0gYXJncy5pdGVtLnJld2FyZF9pZCxcbiAgICAgICAgICAgICAgICAgICAgb3B0cyA9IG1vZGVsLmdldFJvd09wdGlvbnMoaC5pZFZNLmlkKHJld2FyZF9pZCkucGFyYW1ldGVycygpKSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkID0gbS5wcm9wKHt9KTtcbiAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG9wdHMpO1xuICAgICAgICAgICAgICAgIGlmIChyZXdhcmRfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihfLmNvbXBvc2UocmV3YXJkLCBfLmZpcnN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXdhcmQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gbG9hZFJld2FyZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3VzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnVHJhbnNmZXJpcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnSWQgZG8gbm92byBhcG9pYWRvcjonLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTI5OTA4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnQXBvaW8gdHJhbnNmZXJpZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXk6ICdwcm9qZWN0X2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RLZXk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9zOiAncmV3YXJkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBbHRlcmFyIFJlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TW9kZWw6IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlOiAocmV3YXJkcywgbmV3UmV3YXJkSUQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV3YXJkID0gXy5maW5kV2hlcmUocmV3YXJkcywge2lkOiBuZXdSZXdhcmRJRH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYXJncy5pdGVtLnZhbHVlID49IHJld2FyZC5taW5pbXVtX3ZhbHVlKSA/IHVuZGVmaW5lZCA6ICdWYWxvciBtw61uaW1vIGRhIHJlY29tcGVuc2Egw6kgbWFpb3IgZG8gcXVlIG8gdmFsb3IgZGEgY29udHJpYnVpw6fDo28uJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVmdW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWVtYm9sc28gZGlyZXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlZW1ib2xzYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlZW1ib2xzYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIGFwYWdhciBlc3NlIGFwb2lvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnQXBhZ2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbDogbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIHJld2FyZCA9IGN0cmwucmV3YXJkO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRPcHRpb25zID0gKGJ1aWxkZXIsIGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBidWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IChgL2FkbWluL2NvbnRyaWJ1dGlvbnMvJHtpZH0vZ2F0ZXdheV9yZWZ1bmRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnRyYW5zZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpKSA/IGgubG9hZGVyIDpcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJhZGlvQWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEtleVZhbHVlOiBpdGVtLnByb2plY3RfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZTogaXRlbS5jb250cmlidXRpb25faWRcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlZnVuZCwgaXRlbS5pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMucmVtb3ZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZDogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmtleVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uSXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAnLnctcm93JyxcbiAgICAgICAgICAgICAgICBfLm1hcChjdHJsLml0ZW1CdWlsZGVyLCBmdW5jdGlvbihwYW5lbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShwYW5lbC53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbcGFuZWwuY29tcG9uZW50XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgY29tcG9uZW50XG4gKiBBbiBpdGVtYnVpbGRlciBjb21wb25lbnQgdGhhdCByZXR1cm5zIGFkZGl0aW9uYWwgZGF0YVxuICogdG8gYmUgaW5jbHVkZWQgaW4gQWRtaW5Vc2VyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4ge1xuICogICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAqICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gKiAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAqICAgICAgICAgfV1cbiAqICAgICB9XG4gKiB9XG4gKi9cbndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uVXNlciA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICB1c2VyID0ge1xuICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1nX3RodW1ibmFpbDogaXRlbS51c2VyX3Byb2ZpbGVfaW1nLFxuICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS51c2VyX25hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgZW1haWw6IGl0ZW0uZW1haWwsXG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0dhdGV3YXk6ICcgKyBpdGVtLnBheWVyX2VtYWlsKTtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluVXNlciwge2l0ZW06IHVzZXIsIGFkZGl0aW9uYWxfZGF0YTogYWRkaXRpb25hbERhdGF9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEIGRvIEdhdGV3YXk6ICcsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiBjb21wb25lbnRcbiAqIE1ha2VzIGFyYml0cmFyeSBhamF4IHJlcXVlc3RzIGFuZCB1cGRhdGUgdW5kZXJseWluZ1xuICogZGF0YSBmcm9tIHNvdXJjZSBlbmRwb2ludC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pbkV4dGVybmFsQWN0aW9uID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucy5jb25maWcgPSAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKVswXS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWQgPSBfLmNvbXBvc2UoYnVpbGRlci5tb2RlbC5nZXRSb3csIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSkucGFyYW1ldGVycyksXG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcihidWlsZGVyLnJlcXVlc3RPcHRpb25zLCBtLnJlcXVlc3QpO1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICByZWxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHJlbG9hZEl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZXF1aXNpw6fDo28gZmVpdGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJycsXG4gICAgICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGZvcmNlVmFsdWUpO1xuXG4gICAgICAgICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICAgICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgZGF0YS5zdWNjZXNzTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYXJncy5saXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChhcmdzLmxpc3REZXRhaWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2FycmVnYW5kbyAke2xhYmVsLnRvTG93ZXJDYXNlKCl9Li4uYCA6IFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCBgICR7bGFiZWwudG9Mb3dlckNhc2UoKX0gZW5jb250cmFkb3NgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBhcmdzLmxpc3RJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYXJncy5saXN0RGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVN0YXR1c1RleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTk8gQVInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0ZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ07Dg08gRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXdhaXRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQUdVQVJEQU5ETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSRUNVU0FETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWZ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JBU0NVTkhPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRU0gQU7DgUxJU0UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBUFJPVkFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmooc3RhdHVzVGV4dFtwcm9qZWN0LnN0YXRlXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmo6IGdlbmVyYXRlU3RhdHVzVGV4dCgpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwgJ8KgJywgbSgnc3BhbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgc3RhdHVzVGV4dE9iai50ZXh0KSwgJ8KgJ1xuICAgICAgICAgICAgICAgICAgICBdKSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdmaW5hbmNpYWRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdsZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCByZW1haW5pbmdUZXh0T2JqLnVuaXQgKyAnIHJlc3RhbnRlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0oKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXhwbGFuYXRpb24gPSBmdW5jdGlvbihyZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsICdWb2PDqiBwb2RlIHJlY2ViZXIgYXBvaW9zIGF0w6kgMjNoczU5bWluNTlzIGRvIGRpYSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcuIExlbWJyZS1zZSwgw6kgdHVkby1vdS1uYWRhIGUgdm9jw6ogc8OzIGxldmFyw6Egb3MgcmVjdXJzb3MgY2FwdGFkb3Mgc2UgYmF0ZXIgYSBtZXRhIGRlbnRybyBkZXNzZSBwcmF6by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgbsOjbyBkZXNhbmltZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gbsOjbyBiYXRldSBhIG1ldGEgZSBzYWJlbW9zIHF1ZSBpc3NvIG7Do28gw6kgYSBtZWxob3IgZGFzIHNlbnNhw6fDtWVzLiBNYXMgbsOjbyBkZXNhbmltZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbmNhcmUgbyBwcm9jZXNzbyBjb21vIHVtIGFwcmVuZGl6YWRvIGUgbsOjbyBkZWl4ZSBkZSBjb2dpdGFyIHVtYSBzZWd1bmRhIHRlbnRhdGl2YS4gTsOjbyBzZSBwcmVvY3VwZSwgdG9kb3Mgb3Mgc2V1cyBhcG9pYWRvcmVzIHJlY2ViZXLDo28gbyBkaW5oZWlybyBkZSB2b2x0YS7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM2NTUwNy1SZWdyYXMtZS1mdW5jaW9uYW1lbnRvLWRvcy1yZWVtYm9sc29zLWVzdG9ybm9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gZmF6ZW1vcyBlc3Rvcm5vcyBlIHJlZW1ib2xzb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCAnLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBFTlZJQVIgZSBlbnRyYXJlbW9zIGVtIGNvbnRhdG8gcGFyYSBhdmFsaWFyIG8gc2V1IHByb2pldG8uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgc2V1IHByb2pldG8gZm9pIGFwcm92YWRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUGFyYSBjb2xvY2FyIG8gc2V1IHByb2pldG8gbm8gYXIgw6kgcHJlY2lzbyBhcGVuYXMgcXVlIHZvY8OqIHByZWVuY2hhIG9zIGRhZG9zIG5lY2Vzc8OhcmlvcyBuYSBhYmHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIjdXNlcl9zZXR0aW5nc1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy4gw4kgaW1wb3J0YW50ZSBzYWJlciBxdWUgY29icmFtb3MgYSB0YXhhIGRlIDEzJSBkbyB2YWxvciB0b3RhbCBhcnJlY2FkYWRvIGFwZW5hcyBwb3IgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4gRW50ZW5kYcKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBmYXplbW9zIG8gcmVwYXNzZSBkbyBkaW5oZWlyby4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3QgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz0nICsgcHJvamVjdC5wcm9qZWN0X2ltZyArICddW3dpZHRoPTUwXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3Rfb25saW5lX2RhdGUpICsgJyBhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3RfZXhwaXJlc19hdCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG0ucHJvcChpdGVtLmRlc2NyaXB0aW9uIHx8ICcnKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBuZXdJRCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZ2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgc2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgcmFkaW9zID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgZ2V0QXR0ciA9IGJ1aWxkZXIucmFkaW9zLFxuICAgICAgICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGdldEtleVZhbHVlID0gYXJncy5nZXRLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZSA9IGFyZ3MudXBkYXRlS2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdmFsaWRhdGUgPSBidWlsZGVyLnZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbSA9IGJ1aWxkZXIuc2VsZWN0ZWRJdGVtIHx8IG0ucHJvcCgpO1xuXG4gICAgICAgICAgICBzZXRGaWx0ZXJbdXBkYXRlS2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgc2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oc2V0RmlsdGVyKTtcbiAgICAgICAgICAgIHNldFZNW3VwZGF0ZUtleV0odXBkYXRlS2V5VmFsdWUpO1xuXG4gICAgICAgICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgICAgICAgIGdldFZNW2dldEtleV0oZ2V0S2V5VmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0UGFnZU9wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbSA9IF8uZmluZFdoZXJlKHJhZGlvcygpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YVswXVtidWlsZGVyLnNlbGVjdEtleV1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbShuZXdJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnTmVuaHVtIGl0ZW0gYXR1YWxpemFkbydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXIubG9hZCgpLnRoZW4ocmFkaW9zLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0lEKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZShyYWRpb3MoKSwgbmV3SUQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbGlkYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2J1aWxkZXIuc2VsZWN0S2V5XSA9IG5ld0lEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRMb2FkZXIubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdJRCgnJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmV0Y2goKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgbmV3SUQ6IG5ld0lELFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWQsXG4gICAgICAgICAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLnNldExvYWRlcigpIHx8IGN0cmwuZ2V0TG9hZGVyKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm5ld0lEKHJhZGlvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IChpdGVtW2RhdGEuc2VsZWN0S2V5XSB8fCBpdGVtLmlkKSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I3ItJyArIGluZGV4ICsgJy53LXJhZGlvLWlucHV0W3R5cGU9cmFkaW9dW25hbWU9XCJhZG1pbi1yYWRpb1wiXVt2YWx1ZT1cIicgKyByYWRpby5pZCArICdcIl0nICsgKChzZWxlY3RlZCkgPyAnW2NoZWNrZWRdJyA6ICcnKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbC53LWZvcm0tbGFiZWxbZm9yPVwici0nICsgaW5kZXggKyAnXCJdJywgJ1IkJyArIHJhZGlvLm1pbmltdW1fdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlY29tcGVuc2EgYWx0ZXJhZGEgY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3IoKS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluUmV3YXJkID0gKGZ1bmN0aW9uKG0sIGMsIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gYXJncy5yZXdhcmQoKSxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCByZXdhcmQuaWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yIG3DrW5pbW86IFIkJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdEZXNjcmnDp8OjbzogJyArIHJld2FyZC5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIF0gOiAnQXBvaW8gc2VtIHJlY29tcGVuc2EnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uLFxuICAgICAgICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFt7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wYWlkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY29uZmlybWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5wZW5kaW5nX3JlZnVuZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlZW1ib2xzbyBzb2xpY2l0YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY3JlYXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNyaWFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1c2VkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY2FuY2VsYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uY2hhcmdlYmFja19hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgfV0sIGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0ZSAhPT0gbnVsbCAmJiBpdGVtLmRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcmlnaW5hbERhdGUgPSBpdGVtLmRhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9yZGVyZWRFdmVudHM6IF8uc29ydEJ5KG1hcEV2ZW50cywgJ29yaWdpbmFsRGF0ZScpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgICAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5kYXRlLWV2ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBjRXZlbnQuZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY0V2ZW50Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbG9yOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gQ29uZmlybWHDp8OjbzogJyArIChjb250cmlidXRpb24ud2FpdGluZ19wYXltZW50ID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQW7DtG5pbW86ICcgKyAoY29udHJpYnV0aW9uLmFub255bW91cyA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQXBvaW86ICcgKyBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2lkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQ2hhdmU6wqBcXG4nLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnTWVpbzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnT3BlcmFkb3JhOiAnICsgKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEgJiYgY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YS5hY3F1aXJlcl9uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyaWJ1dGlvbi5pc19zZWNvbmRfc2xpcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0oKSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsIGNvbXBvbmVudFxuICogUmV0dXJuIGFjdGlvbiBpbnB1dHMgdG8gYmUgdXNlZCBpbnNpZGUgQWRtaW5MaXN0IGNvbXBvbmVudC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5Vc2VyRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWRlZmluaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ05vdmEgc2VuaGEgZGUgVXN1w6FyaW86JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWRlZmluaXIgc2VuaGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTIzbXVkQHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RpdmF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWF0aXZhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWF0aXZhciBlc3NlIHVzdcOhcmlvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ1VzdcOhcmlvIHJlYXRpdmFkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyB1c3XDoXJpbyBuw6NvIHDDtGRlIHNlciByZWF0aXZhZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWF0aXZhciB1c3XDoXJpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGRldGFpbHMgPSBhcmdzLmRldGFpbHM7XG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtkYXRhOiBhY3Rpb25zLnJlc2V0LCBpdGVtOiBpdGVtfSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtLmRlYWN0aXZhdGVkX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge2RhdGE6IGFjdGlvbnMucmVhY3RpdmF0ZSwgaXRlbTogaXRlbX0pIDogJydcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VySXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVXNlciwgYXJncylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB1c2VyID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi11c2VyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQodXNlci5wcm9maWxlX2ltZ190aHVtYm5haWwpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLmlkICsgJy9lZGl0XCJdJywgdXNlci5uYW1lKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci5pZCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0VtYWlsOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MuYWRkaXRpb25hbF9kYXRhIHx8IG0oJycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkZpbHRlckRhdGVSYW5nZSA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdvcHRpb25bdmFsdWU9XCInICsgZGF0YS52YWx1ZSArICdcIl0nLCBkYXRhLm9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJNYWluID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlck51bWJlclJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmxhbmRpbmdRQSBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgcXVlc3Rpb24vYW5zd2VyIGJveCB3aXRoIHRvZ2dsZVxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICogICAgICAgICAgcXVlc3Rpb246ICdXaGF0cyB5b3VyIG5hbWU/JyxcbiAqICAgICAgICAgIGFuc3dlcjogJ0RhcnRoIFZhZGVyLidcbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nUUEgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dBbnN3ZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQucWEtY2FyZC51LW1hcmdpbmJvdHRvbS0yMC51LXJhZGl1cy5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zaG93QW5zd2VyLnRvZ2dsZVxuICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBhcmdzLnF1ZXN0aW9uKSxcbiAgICAgICAgICAgICAgICBjdHJsLnNob3dBbnN3ZXIoKSA/IG0oJ3AudS1tYXJnaW50b3AtMjAuZm9udHNpemUtc21hbGwnLCBhcmdzLmFuc3dlcikgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nU2lnbnVwID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgICAgICBlbWFpbCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgudmFsaWRhdGVFbWFpbChlbWFpbCgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvckNsYXNzZXMgPSAoIWN0cmwuZXJyb3IpID8gJy5wb3NpdGl2ZS5lcnJvcicgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCdmb3JtLnctZm9ybVtpZD1cImVtYWlsLWZvcm1cIl1bbWV0aG9kPVwicG9zdFwiXVthY3Rpb249XCInICsgYXJncy5idWlsZGVyLmN1c3RvbUFjdGlvbiArICdcIl0nLHtcbiAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLmVtYWlsKClcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2FyZCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgICAgICAgY2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICAgICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBvcE5vdGlmaWNhdGlvbiA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5Tm90aWZpY2F0aW9uID0gaC50b2dnbGVQcm9wKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Tm90aWZpY2F0aW9uOiBkaXNwbGF5Tm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24oKSA/IG0oJy5mbGFzaC53LWNsZWFyZml4LmNhcmQuY2FyZC1ub3RpZmljYXRpb24udS1yYWRpdXMuemluZGV4LTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWNsb3NlW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAveC5wbmdcIl1bd2lkdGg9XCIxMlwiXVthbHQ9XCJmZWNoYXJcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbi50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBhcmdzLm1lc3NhZ2UpXG4gICAgICAgICAgICBdKSA6IG0oJ3NwYW4nKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocHJvamVjdC5idWRnZXQpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZ1bmRpbmctcGVyaW9kJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHByb2plY3Qub25saW5lX2RhdGUpLCAnIC0gJywgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCAnICgnICsgcHJvamVjdC5vbmxpbmVfZGF5cyArICcgZGlhcykgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENhcmQgPSAoKG0sIGgsIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpLFxuICAgICAgICAgICAgICAgIGxpbmsgPSAnLycgKyBwcm9qZWN0LnBlcm1hbGluayArIChhcmdzLnJlZiA/ICc/cmVmPScgKyBhcmdzLnJlZiA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgYS5jYXJkLXByb2plY3QtdGh1bWJbaHJlZj1cIiR7bGlua31cIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3Byb2plY3QucHJvamVjdF9pbWd9KWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYHBvciAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZX0sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHsocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcyl9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke01hdGguY2VpbChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdCcsICdMZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtyZW1haW5pbmdUZXh0T2JqLnRvdGFsfSAke3JlbWFpbmluZ1RleHRPYmoudW5pdH1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAocmVtYWluaW5nVGV4dE9iai50b3RhbCA+IDEpID8gJ1Jlc3RhbnRlcycgOiAnUmVzdGFudGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG90YWxfYW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi5vdmVyZmxvdy1hdXRvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5yZW5kZXJDaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MgY29uZmlybWFkb3MgcG9yIGRpYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnRvdGFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIub3ZlcmZsb3ctYXV0bycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwucmVuZGVyQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29tbWVudHMgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5mYi1jb21tZW50c1tkYXRhLWhyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtkYXRhLW51bS1wb3N0cz01MF1bZGF0YS13aWR0aD1cIjYxMFwiXScpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29sbGVjdGlvblswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAnREVTQyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5zb3VyY2UgPSBvcmRlcmVkU291cmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgICAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJykoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsICdMb2NhbGl6YcOnw6NvIGdlb2dyw6FmaWNhIGRvcyBhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ0VzdGFkbycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLCBtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbFtkYXRhLWl4PVwic29ydC1hcnJvd3NcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydCgndG90YWxfY29udHJpYnV0ZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgYXBvaWFkb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcoJSBkbyB0b3RhbCkgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGNvbnRyaWJ1dGlvbkxvY2F0aW9uLnNvdXJjZSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKHNvdXJjZS50b3RhbF9jb250cmlidXRlZCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBzb3VyY2UudG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbiksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nID0gKHdhaXRpbmcgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nOiB0b2dnbGVXYWl0aW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgICAgICAoYXJncy5wcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl0nLCAnQ29uZmlybWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXVt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt2YWx1ZT1cIndhaXRpbmdfY29uZmlybWF0aW9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl0nLCAnUGVuZGVudGVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMnLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tZGFya1tocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBjb250cmlidXRpb24udXNlcl9uYW1lKSwgKGNvbnRyaWJ1dGlvbi5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSwgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyBbbS50cnVzdCgnJm5ic3A7LSZuYnNwOycpLCBtKCdzdHJvbmcnLCAnQXBvaWFkb3IgYW7DtG5pbW8nKV0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBoOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgWyFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZSA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdiA9IGgudG9nZ2xlUHJvcCgnYm9keS1wcm9qZWN0IG9wZW4nLCAnYm9keS1wcm9qZWN0IGNsb3NlZCcpO1xuXG4gICAgICAgICAgICBpZiAoIWFyZ3MucHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUudG9nZ2xlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGU6IGVkaXRMaW5rc1RvZ2dsZSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2OiBib2R5VG9nZ2xlRm9yTmF2XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9qZWN0Um91dGUgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgICAgZWRpdExpbmtDbGFzcyA9ICdkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJ2luZGVudCcgOiAnJyk7XG5cbiAgICAgICAgICAgIGN0cmwuYm9keS5jbGFzc05hbWUgPSBjdHJsLmJvZHlUb2dnbGVGb3JOYXYoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LW5hdicsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1uYXYtd3JhcHBlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbmF2Lnctc2VjdGlvbi5kYXNoYm9hcmQtbmF2LnNpZGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmsudy1pbmxpbmUtYmxvY2suZGFzaGJvYXJkLXByb2plY3QtbmFtZVtocmVmPVwiJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcvJyArIHByb2plY3QucGVybWFsaW5rIDogZWRpdFJvdXRlICsgJyNwcmV2aWV3JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LWRhc2hib2FyZFtzcmM9XCInICsgKF8uaXNOdWxsKHByb2plY3QubGFyZ2VfaW1hZ2UpID8gJy9hc3NldHMvdGh1bWItcHJvamVjdC5wbmcnIDogcHJvamVjdC5sYXJnZV9pbWFnZSkgKyAnXCJdW3dpZHRoPVwiMTE0XCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS5saW5laGVpZ2h0LXRpZ2h0LmZvbnRzaXplLXNtYWxsJywgcHJvamVjdC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjaW5mby1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9ob21lX2xpbmtbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKGgubG9jYXRpb25BY3Rpb25NYXRjaCgnaW5zaWdodHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCInICsgcHJvamVjdFJvdXRlICsgJy9pbnNpZ2h0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXItY2hhcnQuZmEtbGcuZmEtZncnKSwgJyBNaW5oYSBDYW1wYW5oYSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEuZmEtdGFibGUuZmEtbGcuZmEtZncnKSwgJyBSZWxhdMOzcmlvcyBkZSBhcG9pb3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQudS1tYXJnaW5ib3R0b20tMzBbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Bvc3RzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksICcgTm92aWRhZGVzICcsIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1wZW5jaWwuZmEtZncuZmEtbGcnKSwgJyBFZGl0YXIgcHJvamV0bydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSksIChjdHJsLmVkaXRMaW5rc1RvZ2dsZSgpID8gbSgnI2VkaXQtbWVudS1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNiYXNpY3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYmFzaWNzJyArICdcIl0nLCAnQsOhc2ljbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLCAnTWV0YSBlIHByYXpvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkZXNjcmlwdGlvbl9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNkZXNjcmlwdGlvbicgKyAnXCJdJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI3ZpZGVvX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ZpZGVvJyArICdcIl0nLCAnVsOtZGVvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX2Fib3V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfYWJvdXQnICsgJ1wiXScsICdTb2JyZSB2b2PDqicpLCAoKHByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcpIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX3NldHRpbmdzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfc2V0dGluZ3MnICsgJ1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSwgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ByZXZpZXcnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mdy5mYS1leWUuZmEtbGcnKSwgJyBQcmV2aWV3J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsICdFbnZpYXInKSA6ICcnKSwgKHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3B1Ymxpc2hcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLmJ0bi1kYXNoYm9hcmQgaHJlZj1cImpzOnZvaWQoMCk7XCInLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuYm9keVRvZ2dsZUZvck5hdi50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFycy5mYS1sZycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wYWdlLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXIuZm9udHdlaWdodC1zZW1pYm9sZC5wcm9qZWN0LW5hbWVbaXRlbXByb3A9XCJuYW1lXCJdJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BvciAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnByb2plY3QtaGlnaGxpZ2h0JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGlnaGxpZ2h0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGlnaGxpZ2h0JywgW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlbycsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdtaW4taGVpZ2h0OiAyNDBweDsnXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIicgKyBwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3Qub3JpZ2luYWxfaW1hZ2UgKyAnKTsnXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWJsdXJiJywgcHJvamVjdC5oZWFkbGluZSksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzTnVsbChwcm9qZWN0LmFkZHJlc3MpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodC51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiL3B0L2V4cGxvcmUjbmVhcl9vZi8ke3Byb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXInKSwgYCAke3Byb2plY3QuYWRkcmVzcy5jaXR5fSwgJHtwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bX1gXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodFtocmVmPVwiL3B0L2V4cGxvcmUjYnlfY2F0ZWdvcnlfaWQvJHtwcm9qZWN0LmNhdGVnb3J5X2lkfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdGFnJyksICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuY2F0ZWdvcnlfbmFtZVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI3NoYXJlLWJveC5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wYXJ0aWxoYXInKSwgKGN0cmwuZGlzcGxheVNoYXJlQm94KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3RTaGFyZUJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogY3RybC5kaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9ICgobSwgYywgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBjX29wdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY19vcHRzKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29tbWVudHMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzWycjYWJvdXQnXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgbS5yZWRyYXcsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudDogZGlzcGxheVRhYkNvbnRlbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmRpc3BsYXlUYWJDb250ZW50KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFBvc3RzID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0UG9zdERldGFpbCksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXBvc3RzLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5pc0VtcHR5KGxpc3QuY29sbGVjdGlvbigpKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwLnUtbWFyZ2ludG9wLTIwJywgJ1RvZGEgbm92aWRhZGUgcHVibGljYWRhIG5vIENhdGFyc2Ugw6kgZW52aWFkYSBkaXJldGFtZW50ZSBwYXJhIG8gZW1haWwgZGUgcXVlbSBqw6EgYXBvaW91IHNldSBwcm9qZXRvIGUgdGFtYsOpbSBmaWNhIGRpc3BvbsOtdmVsIHBhcmEgdmlzdWFsaXphw6fDo28gbm8gc2l0ZS4gVm9jw6ogcG9kZSBvcHRhciBwb3IgZGVpeMOhLWxhIHDDumJsaWNhLCBvdSB2aXPDrXZlbCBzb21lbnRlIHBhcmEgc2V1cyBhcG9pYWRvcmVzIGFxdWkgbmVzdGEgYWJhLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1lZGl0LmJ0bi1zbWFsbFtocmVmPScvcHQvcHJvamVjdHMvJHtwcm9qZWN0LmlkfS9lZGl0I3Bvc3RzJ11gLCAnRXNjcmV2ZXIgbm92aWRhZGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucG9zdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS02MCAudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udGNvbG9yLXNlY29uZGFyeS51LXRleHQtY2VudGVyJywgaC5tb21lbnRpZnkocG9zdC5jcmVhdGVkX2F0KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSwgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTYwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnJlc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXJlbWluZGVyLWNvdW50LmNhcmQudS1yYWRpdXMudS10ZXh0LWNlbnRlci5tZWRpdW0udS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVG90YWwgZGUgcGVzc29hcyBxdWUgY2xpY2FyYW0gbm8gYm90w6NvIExlbWJyYXItbWUnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8nLCBwcm9qZWN0LnJlbWluZGVyX2NvdW50KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUHJvamVjdFJlbWluZGVyID0gKChtLCBtb2RlbHMsIGgsIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgaW5SZW1pbmRlciA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RvcmVSZW1pbmRlck5hbWUgPSAncmVtaW5kXycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbiA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaC5nZXRVc2VyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguc3RvcmVBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoLm5hdmlnYXRlVG9EZXZpc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbG9hZGVyT3B0cyA9IGluUmVtaW5kZXIoKSA/IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIuZGVsZXRlT3B0aW9ucyhmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpIDogbW9kZWxzLnByb2plY3RSZW1pbmRlci5wb3N0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiBwcm9qZWN0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGxvYWRlck9wdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5SZW1pbmRlci50b2dnbGUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluUmVtaW5kZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5jYWxsU3RvcmVkQWN0aW9uKHN0b3JlUmVtaW5kZXJOYW1lLCBzdWJtaXRSZW1pbmRlcik7XG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKHByb2plY3QuaWQpO1xuICAgICAgICAgICAgaW5SZW1pbmRlcihwcm9qZWN0LmluX3JlbWluZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpblJlbWluZGVyOiBpblJlbWluZGVyLFxuICAgICAgICAgICAgICAgIHN1Ym1pdFJlbWluZGVyOiBzdWJtaXRSZW1pbmRlcixcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbjogcG9wTm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXJlbWluZGVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uW2NsYXNzPVwiYnRuLWxpbmsgbGluay1oaWRkZW4gZm9udHNpemUtc21hbGwgJyArIChjdHJsLmluUmVtaW5kZXIoKSA/ICdsaW5rLWhpZGRlbi1zdWNjZXNzJyA6ICdmb250Y29sb3Itc2Vjb25kYXJ5JykgKyAnIGZvbnR3ZWlnaHQtc2VtaWJvbGRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc3VibWl0UmVtaW5kZXJcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSA/ICdhZ3VhcmRlIC4uLicgOiBtKCdzcGFuLmZhLmZhLWNsb2NrLW8nLCBjdHJsLmluUmVtaW5kZXIoKSA/ICcgTGVtYnJldGUgYXRpdm8nIDogJyBMZW1icmFyLW1lJykpXG4gICAgICAgICAgICAgICAgXSksIChjdHJsLnBvcE5vdGlmaWNhdGlvbigpID8gbS5jb21wb25lbnQoYy5Qb3BOb3RpZmljYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ09rISBWYW1vcyB0ZSBtYW5kYXIgdW0gbGVtYnJldGUgcG9yIGUtbWFpbCA0OCBob3JhcyBhbnRlcyBkbyBmaW0gZGEgY2FtcGFuaGEnXG4gICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZXdhcmRMaXN0ID0gKChtLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vRklYTUU6IE1JU1NJTkcgQURKVVNUU1xuICAgICAgICAgICAgLy8gLSBhZGQgZHJhZnQgYWRtaW4gbW9kaWZpY2F0aW9uc1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Jld2FyZHMudS1tYXJnaW5ib3R0b20tMzAnLCBfLm1hcChhcmdzLnJld2FyZERldGFpbHMoKSwgKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXc/cmV3YXJkX2lkPScgKyByZXdhcmQuaWQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnYVtjbGFzcz1cIicgKyAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gJ2NhcmQtZ29uZScgOiAnY2FyZC1yZXdhcmQgJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSkgKyAnIGNhcmQgY2FyZC1zZWNvbmRhcnkgdS1tYXJnaW5ib3R0b20tMTBcIl1baHJlZj1cIicgKyAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkIDogJ2pzOnZvaWQoMCk7JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1BhcmEgUiQgJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlKSArICcgb3UgbWFpcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGgucGx1cmFsaXplKHJld2FyZC5wYWlkX2NvdW50LCAnIGFwb2lhZG9yJywgJyBhcG9pYWRvcmVzJykpLCAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPiAwID8gbSgnLm1heGltdW1fY29udHJpYnV0aW9ucy5pbl90aW1lX3RvX2NvbmZpcm0uY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wZW5kaW5nLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLnBsdXJhbGl6ZShyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LCAnIGFwb2lvIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28nLCAnIGFwb2lvcyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWdvbmUuZm9udHNpemUtc21hbGxlcicsICdFc2dvdGFkYScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtYXR0ZW50aW9uLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtYm9sZCcsICdMaW1pdGFkYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAoJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW50b3AtMjAnLCBtLnRydXN0KGguc2ltcGxlRm9ybWF0KHJld2FyZC5kZXNjcmlwdGlvbikpKSwgKCFfLmlzRW1wdHkocmV3YXJkLmRlbGl2ZXJfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2InLCAnRXN0aW1hdGl2YSBkZSBFbnRyZWdhOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm1vbWVudGlmeShyZXdhcmQuZGVsaXZlcl9hdCwgJ01NTS9ZWVlZJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1ob3ZlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Um93ID0gKChtKSA9PiB7XG4gICAgcmV0dXJuIHtcblxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGFyZ3MuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICByZWYgPSBhcmdzLnJlZjtcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKS5sZW5ndGggPiAwID8gbSgnLnctc2VjdGlvbi5zZWN0aW9uLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj1cIi9wdC9leHBsb3JlP3JlZj0ke3JlZn0jJHtjb2xsZWN0aW9uLmhhc2h9XCJdYCwgJ1ZlciB0b2RvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgXy5tYXAoY29sbGVjdGlvbi5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiByZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSkgOiBtKCcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2hhcmVCb3ggPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTogYmxvY2s7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGFyZ3MuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ0NvbXBhcnRpbGhlIGVzdGUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LXR3aXR0ZXIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53aWRnZXQtZW1iZWQudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RW1iZWQudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QuaWQgKyAnL2VtYmVkXCIgd2lkdGg9XCIzMDBweFwiIHNjcm9sbGluZz1cIm5vXCI+PC9pZnJhbWU+XCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2ZyYW1lYm9yZGVyPVwiMFwiXVtoZWlnaHQ9XCIzNTBweFwiXVtzcmM9XCIvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QubmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZhY2Vib29rJyksICcgQ29tcGFydGlsaGUnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tdHdlZXQudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPUFjYWJlaSBkZSBhcG9pYXIgbyBwcm9qZXRvICcgKyBhcmdzLnByb2plY3QubmFtZSArICcgaHR0czovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXR3aXR0ZXInKSwgJyBUd2VldCdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5Q2FyZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6ICdjYXJkLXdhaXRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnY2FyZC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmYWlsZWQnOiAnY2FyZC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZHJhZnQnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogJ2NhcmQtZGFyaydcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHN0YXRlc1twcm9qZWN0LnN0YXRlXSA/ICdjYXJkIHUtcmFkaXVzIHppbmRleC0xMCAnICsgc3RhdGVzW3Byb2plY3Quc3RhdGVdIDogJycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdFc3NlIHByb2pldG8gasOhIGZvaSBhcHJvdmFkbyBwZWxvIENhdGFyc2UuIEVtIGJyZXZlIGVsZSBlbnRyYXLDoSBubyBhciBlIGVzdGFyw6EgcHJvbnRvIHBhcmEgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmxpbmUnOiAnVm9jw6ogcG9kZSBhcG9pYXIgZXN0ZSBwcm9qZXRvIGF0w6kgbyBkaWEgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgw6BzIDIzaDU5bTU5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogJ0VzdGUgcHJvamV0byBuw6NvIGF0aW5naXUgbyBtw61uaW1vIGRlIFIkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LmdvYWwpICsgJyBhdMOpICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgbsOjbyBmb2kgZmluYW5jaWFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVqZWN0ZWQnOiAnRXN0ZSBwcm9qZXRvIG7Do28gZm9pIGFjZWl0by4gTsOjbyDDqSBwb3Nzw612ZWwgcmVhbGl6YXIgdW0gYXBvaW8uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdFc3RlIHByb2pldG8gZXN0w6EgZW0gYW7DoWxpc2UgZSBhaW5kYSBuw6NvIGVzdMOhIGFiZXJ0byBwYXJhIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdFc3RlIHByb2pldG8gZm9pIGJlbS1zdWNlZGlkbyBlIGZvaSBmaW5hbmNpYWRvIGVtICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6ICdPIHByYXpvIGRlIGNhcHRhw6fDo28gZGVzc2UgcHJvamV0byBlc3TDoSBlbmNlcnJhZG8uIEVzdGFtb3MgYWd1YXJkYW5kbyBhIGNvbmZpcm1hw6fDo28gZG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdFc3RlIHByb2pldG8gw6kgYXBlbmFzIHVtIHJhc2N1bmhvIGUgYWluZGEgbsOjbyBwb2RlIHJlY2ViZXIgYXBvaW9zLicsXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlc1twcm9qZWN0LnN0YXRlXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3M6IGRpc3BsYXlDYXJkQ2xhc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQ6IGRpc3BsYXlTdGF0dXNUZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHRpbWVPYmogPSBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdCkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LXNpZGViYXIuYXNpZGUnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLXRpbnktNi53LWNvbC1zbWFsbC00LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnYXRpbmdpZG9zIGRlIFIkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LmdvYWwpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS0zLnctY29sLXNtYWxsLTQuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsICdhcG9pb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS0zLnctY29sLXNtYWxsLTQudS1tYXJnaW5ib3R0b20tMTAuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IHRpbWVPYmoudG90YWwgOiAocHJvamVjdC5vbmxpbmVfZGF5cyB8fCAwKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW5bc3R5bGU9XCJ0ZXh0LXRyYW5zZm9ybTpjYXBpdGFsaXplO1wiXScsIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IHRpbWVPYmoudW5pdCA6ICdkaWFzJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGltZU9iai50b3RhbCA+IDEpID8gJyByZXN0YW50ZXMnIDogJyByZXN0YW50ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBtKCdhI2NvbnRyaWJ1dGVfcHJvamVjdF9mb3JtLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFyIGVzdGUgcHJvamV0bycpIDogJycpLCAoKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucykgPyBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnVzZXItYycsIG0uY29tcG9uZW50KGMuUHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFRhYnMgPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2Lm1mJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInJld2FyZHMtbGlua1wiXVtjbGFzcz1cInctaGlkZGVuLW1haW4gdy1oaWRkZW4tbWVkaXVtIGRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcmV3YXJkcycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNyZXdhcmRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnUmVjb21wZW5zYXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiYWJvdXQtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1NvYnJlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInBvc3RzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QucG9zdHNfY291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbnRyaWJ1dGlvbnMtbGlua1wiXVtjbGFzcz1cInctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnkgZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25zJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbnRyaWJ1dGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbW1lbnRzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDb21lbnTDoXJpb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RVc2VyQ2FyZCA9ICgobSwgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGFyZ3MudXNlckRldGFpbHMoKSwgKHVzZXJEZXRhaWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnUtbWFyZ2luYm90dG9tLTMwLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtbWFyZ2luYm90dG9tLTMwLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMsICcgY3JpYWRvJywgJyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cywgJyBhcG9pYWRvJywgJyBhcG9pYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1oaWRkZW4tdGlueS53LWhpZGRlbi1zbWFsbC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIChsaW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkTGluayA9IGgucGFyc2VVcmwobGluayk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShwYXJzZWRMaW5rLmhvc3RuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBwYXJzZWRMaW5rLmhvc3RuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuYWx0LWxpbmsuZm9udHdlaWdodC1zZW1pYm9sZFtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHVzZXJEZXRhaWwuZW1haWwpIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGdyb3VwVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoTWF0aC5jZWlsKGNvbGxlY3Rpb24ubGVuZ3RoIC8gZ3JvdXBUb3RhbCkpLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5zbGljZShpICogZ3JvdXBUb3RhbCwgKGkgKyAxKSAqIGdyb3VwVG90YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwudm0uY29sbGVjdGlvbigpLCBmdW5jdGlvbihncm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGdyb3VwLCBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi5iaWcudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0xMFtzcmM9XCInICsgbWVtYmVyLmltZyArICdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tdG90YWwtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vc3NhIGVxdWlwZSwganVudGEsIGrDoSBhcG9pb3UgUiQnICsgaC5mb3JtYXROdW1iZXIodGVhbVRvdGFsLnRvdGFsX2Ftb3VudCkgKyAnIHBhcmEgJyArIHRlYW1Ub3RhbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5Vc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgICAgICB2bS5pZChhcmdzLnVzZXJJZCk7XG5cbiAgICAgICAgICAgIC8vRklYTUU6IGNhbiBjYWxsIGFub24gcmVxdWVzdHMgd2hlbiB0b2tlbiBmYWlscyAocmVxdWVzdE1heWJlV2l0aFRva2VuKVxuICAgICAgICAgICAgbW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbih1c2VyRGV0YWlscyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LncuY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyW2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhZGRyZXNzXCJdJywgdXNlckRldGFpbC5hZGRyZXNzX2NpdHkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hdXRob3ItY29udGFjdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd1bC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIGxpbmspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tbWVzc2FnZVtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLkNvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL2Z1bGxfdGV4dF9pbmRleFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBwcm9qZXRvLCBlbWFpbCwgSWRzIGRvIHVzdcOhcmlvIGUgZG8gYXBvaW8uLi4nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwYWlkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwYWlkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdXNlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdXNlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nX3JlZnVuZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZ19yZWZ1bmQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1bmRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdW5kZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdjaGFyZ2ViYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdjaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnZGVsZXRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGFnYXJtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGFnYXJtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ01vSVAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ01vSVAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYXlQYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BheVBhbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ0NyZWRpdHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ0Nyw6lkaXRvcydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTnVtYmVyUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLnZhbHVlLmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLnZhbHVlLmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2NyZWF0ZWRfYXRcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRGF0ZVJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgdm06IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Db250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuYWRtaW4uVXNlcnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4udXNlckxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLnVzZXJGaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9uYW1lXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIG5vbWUsIGUtbWFpbCwgSWRzIGRvIHVzdcOhcmlvLi4uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9ICdVc3XDoXJpb3MnO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pblVzZXJJdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluVXNlckRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5jb250cmlidXRpb24uUHJvamVjdHNIb21lID0gKCgobSwgYywgbW9tZW50LCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNhbXBsZTMgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDMpLFxuICAgICAgICAgICAgICAgIGxvYWRlcldpdGhUb2tlbiA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbixcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBfLnBhcnRpYWwobS5wb3N0Z3Jlc3QubG9hZGVyLCBfLCBtLnBvc3RncmVzdC5yZXF1ZXN0KSxcbiAgICAgICAgICAgICAgICB2bSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb21tZW5kZWRDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgICByZWNlbnRDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgICBuZWFyTWVDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmluZ0NvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByb2plY3QgPSBjLm1vZGVscy5wcm9qZWN0LFxuXG4gICAgICAgICAgICAgICAgZXhwaXJpbmcgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiAnbHRlJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBuZWFyTWUgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBuZWFyX21lOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHJlY2VudHMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmVfZGF0ZTogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kZWQgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZXhwaXJpbmcuZXhwaXJlc19hdChtb21lbnQoKS5hZGQoMTQsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgICAgICAgZXhwaXJpbmcuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgICBuZWFyTWUubmVhcl9tZSgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgcmVjZW50cy5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg1LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgICAgICAgIHJlY2VudHMuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgICByZWNvbW1lbmRlZC5yZWNvbW1lbmRlZCgndHJ1ZScpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgbGV0IG5lYXJNZUxvYWRlciA9IGxvYWRlcldpdGhUb2tlbihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKG5lYXJNZS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIG5lYXJNZUxvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2Uodm0ubmVhck1lQ29sbGVjdGlvbiwgc2FtcGxlMykpO1xuICAgICAgICAgICAgbGV0IHJlY29tbWVuZGVkTG9hZGVyID0gbG9hZGVyKHByb2plY3QuZ2V0UGFnZU9wdGlvbnMocmVjb21tZW5kZWQucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICByZWNvbW1lbmRlZExvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2Uodm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uLCBzYW1wbGUzKSk7XG4gICAgICAgICAgICBsZXQgcmVjZW50TG9hZGVyID0gbG9hZGVyKHByb2plY3QuZ2V0UGFnZU9wdGlvbnMocmVjZW50cy5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIHJlY2VudExvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2Uodm0ucmVjZW50Q29sbGVjdGlvbiwgc2FtcGxlMykpO1xuICAgICAgICAgICAgbGV0IGV4cGlyaW5nTG9hZGVyID0gbG9hZGVyKHByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZXhwaXJpbmcucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBleHBpcmluZ0xvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2Uodm0uZXhwaXJpbmdDb2xsZWN0aW9uLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9ucyA9IFt7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdQcsOzeGltb3MgYSB2b2PDqicsXG4gICAgICAgICAgICAgICAgaGFzaDogJ25lYXJfb2YnLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHZtLm5lYXJNZUNvbGxlY3Rpb25cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY29tZW5kYWRvcycsXG4gICAgICAgICAgICAgICAgaGFzaDogJ3JlY29tbWVuZGVkJyxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5yZWNvbW1lbmRlZENvbGxlY3Rpb25cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ05hIHJldGEgZmluYWwnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdleHBpcmluZycsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdm0uZXhwaXJpbmdDb2xsZWN0aW9uXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZWNlbnRlcycsXG4gICAgICAgICAgICAgICAgaGFzaDogJ3JlY2VudCcsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjZW50Q29sbGVjdGlvblxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zLFxuICAgICAgICAgICAgICAgIG5lYXJNZUxvYWRlcjogbmVhck1lTG9hZGVyLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkTG9hZGVyOiByZWNvbW1lbmRlZExvYWRlcixcbiAgICAgICAgICAgICAgICBleHBpcmluZ0xvYWRlcjogZXhwaXJpbmdMb2FkZXIsXG4gICAgICAgICAgICAgICAgcmVjZW50TG9hZGVyOiByZWNlbnRMb2FkZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGxldCBpc0xvYWRpbmcgPSBtLnByb3AoY3RybC5uZWFyTWVMb2FkZXIoKSB8fCBjdHJsLnJlY29tbWVuZGVkTG9hZGVyKCkgfHwgY3RybC5leHBpcmluZ0xvYWRlcigpIHx8IGN0cmwucmVjZW50TG9hZGVyKCkpO1xuICAgICAgICAgICAgcmV0dXJuICghaXNMb2FkaW5nKCkpID8gXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Lm1vbWVudCwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnBhZ2VzLkZsZXggPSAoZnVuY3Rpb24obSwgYywgaCwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICBsID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgICBidWlsZGVyID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUFjdGlvbjogJy8vY2F0YXJzZS51czUubGlzdC1tYW5hZ2UuY29tL3N1YnNjcmliZS9wb3N0P3U9ZWJmY2QwZDE2ZGJiMDAwMWEwYmVhMzYzOSZhbXA7aWQ9OGE0YzFhMzNjZSdcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBhZGREaXNxdXMgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgbG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93T3B0aW9ucygpKTtcblxuICAgICAgICAgICAgbG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhZGREaXNxdXM6IGFkZERpc3F1cyxcbiAgICAgICAgICAgICAgICBidWlsZGVyOiBidWlsZGVyLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0c1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmxvZ28tZmxleC1ob21lW3NyYz1cXCcvYXNzZXRzL2xvZ28tZmxleC5wbmdcXCddW3dpZHRoPVxcJzM1OVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNjAudy1jb2wtcHVzaC0yLnctY29sLTgnLCAnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISAgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlcicsICdQcmEgcXVlbSBzZXLDoT8nKSwgbSgnLmZvbnRzaXplLWJhc2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MCcsICdJbmljaWFyZW1vcyBhIGZhc2UgZGUgdGVzdGVzIGNvbSBjYXRlZ29yaWFzIGRlIHByb2pldG9zIGVzcGVjw61maWNhcycpLCBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5M2EwMWI2NmUyNTBhY2E2N2NiX2ljb24temVsby1jb20ucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnQ2F1c2FzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhbGlzdGFzLCBzYcO6ZGUsIGFqdWRhcyBodW1hbml0w6FyaWFzLCBwcm90ZcOnw6NvIGFvcyBhbmltYWlzLCBlbXByZWVuZGVkb3Jpc21vIHNvY2lvYW1iaWVudGFsLCBhdGl2aXNtbyBvdSBxdWFscXVlciBjb2lzYSBxdWUgdW5hIGFzIHBlc3NvYXMgcGFyYSBmYXplciBvIGJlbS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5MjlhMGRhZWEyMzBhNWYxMmNkX2ljb24temVsby1wZXNzb2FsLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ1ZhcXVpbmhhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJ3AuZm9udHNpemUtYmFzZScsICdDYW1wYW5oYXMgc2ltcGxlcyBxdWUgcHJlY2lzYW0gZGUgZmxleGliaWxpZGFkZSBwYXJhIGFycmVjYWRhciBkaW5oZWlybyBjb20gcGVzc29hcyBwcsOzeGltYXMuIEVzdGFyZW1vcyBhYmVydG9zIGEgdW1hIHZhcmllZGFkZSBkZSBjYW1wYW5oYXMgcGVzc29haXMgcXVlIHBvZGVtIGlyIGRlc2RlIGNvYnJpciBjdXN0b3MgZGUgZXN0dWRvcyBhIGFqdWRhciBxdWVtIHByZWNpc2EgZGUgdHJhdGFtZW50byBtw6lkaWNvLiBEZSBqdW50YXIgYSBncmFuYSBwYXJhIGZhemVyIGFxdWVsYSBmZXN0YSBhIGNvbXByYXIgcHJlc2VudGVzIHBhcmEgYWxndcOpbSBjb20gYSBhanVkYSBkYSBnYWxlcmEuICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWdyZWVubGltZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS1tYXJnaW5ib3R0b20tNjAudS10ZXh0LWNlbnRlcicsICdDb21vIGZ1bmNpb25hcsOhPycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWM1NzhiMjg0NDkzZTJhNDI4YV96ZWxvLW1vbmV5LnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdGaXF1ZSBjb20gcXVhbnRvIGFycmVjYWRhcicpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdPIGZsZXggw6kgcGFyYSBpbXB1bHNpb25hciBjYW1wYW5oYXMgb25kZSB0b2RvIGRpbmhlaXJvIMOpIGJlbSB2aW5kbyEgVm9jw6ogZmljYSBjb20gdHVkbyBxdWUgY29uc2VndWlyIGFycmVjYWRhci4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZDM3YzAxM2Q0YTNlZTY4N2QyX2ljb24tcmV3YXJkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdOw6NvIHByZWNpc2EgZGUgcmVjb21wZW5zYXMnKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTm8gZmxleCBvZmVyZWNlciByZWNvbXBlbnNhcyDDqSBvcGNpb25hbC4gVm9jw6ogZXNjb2xoZSBzZSBvZmVyZWPDqi1sYXMgZmF6IHNlbnRpZG8gcGFyYSBvIHNldSBwcm9qZXRvIGUgY2FtcGFuaGEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlmYjAxYjY2ZTI1MGFjYTY3ZTNfaWNvbi1jdXJhZC5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVm9jw6ogbWVzbW8gcHVibGljYSBzZXUgcHJvamV0bycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdUb2RvcyBvcyBwcm9qZXRvcyBpbnNjcml0b3Mgbm8gRmxleCBlbnRyYW0gbm8gYXIuIEFnaWxpZGFkZSBlIGZhY2lsaWRhZGUgcGFyYSB2b2PDqiBjYXB0YXIgcmVjdXJzb3MgYXRyYXbDqXMgZGEgaW50ZXJuZXQuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWU3N2MwMTNkNGEzZWU2ODdkNF9pY29uLXRpbWUucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0VuY2VycmUgYSBjYW1wYW5oYSBxdWFuZG8gcXVpc2VyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ07Do28gaMOhIGxpbWl0ZSBkZSB0ZW1wbyBkZSBjYXB0YcOnw6NvLiBWb2PDqiBlc2NvbGhlICBxdWFuZG8gZW5jZXJyYXIgc3VhIGNhbXBhbmhhIGUgcmVjZWJlciBvcyB2YWxvcmVzIGFycmVjYWRhZG9zLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgJ0TDunZpZGFzJyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhaXMgc8OjbyBhcyB0YXhhcyBkYSBtb2RhbGlkYWRlIGZsZXjDrXZlbD8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdDb21vIG5vIENhdGFyc2UsIGVudmlhciB1bSBwcm9qZXRvIG7Do28gY3VzdGEgbmFkYSEgRXN0YW1vcyBlc3R1ZGFuZG8gb3DDp8O1ZXMgcGFyYSBlbnRlbmRlciBxdWFsIHNlcsOhIGEgdGF4YSBjb2JyYWRhIG5vIHNlcnZpw6dvIENhdGFyc2UgRmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdEZSBvbmRlIHZlbSBvIGRpbmhlaXJvIGRvIG1ldSBwcm9qZXRvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQ29tbyBubyBDYXRhcnNlLCBlbnZpYXIgdW0gcHJvamV0byBuw6NvIGN1c3RhIG5hZGEhIEVzdGFtb3MgZXN0dWRhbmRvIG9ww6fDtWVzIHBhcmEgZW50ZW5kZXIgcXVhbCBzZXLDoSBhIHRheGEgY29icmFkYSBubyBzZXJ2acOnbyBDYXRhcnNlIEZsZXguJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbCBhIGRpZmVyZW7Dp2EgZW50cmUgbyBmbGV4w612ZWwgZSBvIFwidHVkbyBvdSBuYWRhXCI/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBdHVhbG1lbnRlIG8gQ2F0YXJzZSB1dGlsaXphIGFwZW5hcyBvIG1vZGVsbyBcInR1ZG8gb3UgbmFkYVwiLCBvbmRlIHZvY8OqIHPDsyBmaWNhIGNvbSBvIGRpbmhlaXJvIHNlIGJhdGVyIGEgbWV0YSBkZSBhcnJlY2FkYcOnw6NvIGRlbnRybyBkbyBwcmF6byBkYSBjYW1wYW5oYS4gTyBtb2RlbG8gZmxleMOtdmVsIMOpIGRpZmVyZW50ZSBwb2lzIHBlcm1pdGUgcXVlIG8gcmVhbGl6YWRvciBmaXF1ZSBjb20gbyBxdWUgYXJyZWNhZGFyLCBpbmRlcGVuZGVudGUgZGUgYXRpbmdpciBvdSBuw6NvIGEgbWV0YSBkbyBwcm9qZXRvIG5vIHByYXpvIGRhIGNhbXBhbmhhLiBOw6NvIGhhdmVyw6EgbGltaXRlIGRlIHRlbXBvIHBhcmEgYXMgY2FtcGFuaGFzLiBOb3NzbyBzaXN0ZW1hIGZsZXjDrXZlbCBzZXLDoSBhbGdvIG5vdm8gZW0gcmVsYcOnw6NvIGFvcyBtb2RlbG9zIHF1ZSBleGlzdGVtIGF0dWFsbWVudGUgbm8gbWVyY2Fkby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1Bvc3NvIGluc2NyZXZlciBwcm9qZXRvcyBwYXJhIGEgbW9kYWxpZGFkZSBmbGV4w612ZWwgasOhPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnUG9yIGVucXVhbnRvIG7Do28uIEEgbW9kYWxpZGFkZSBmbGV4IHNlcsOhIHRlc3RhZGEgY29tIGFsZ3VucyBwcm9qZXRvcyBlc3BlY8OtZmljb3MuIEluc2NyZXZhIHNldSBlbWFpbCBlIHBhcnRpY2lwZSBkYSBjb252ZXJzYSBuZXNzYSBww6FnaW5hIHBhcmEgcmVjZWJlciBpbmZvcm1hw6fDtWVzLCBtYXRlcmlhaXMsIGFjb21wYW5oYXIgcHJvamV0b3MgZW0gdGVzdGUgZSBzYWJlciBjb20gYW50ZWNlZMOqbmNpYSBhIGRhdGEgZGUgbGFuw6dhbWVudG8gZG8gZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3IgcXXDqiB2b2PDqnMgcXVlcmVtIGZhemVyIG8gQ2F0YXJzZUZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBY3JlZGl0YW1vcyBxdWUgbyBhbWJpZW50ZSBkbyBjcm93ZGZ1bmRpbmcgYnJhc2lsZWlybyBhaW5kYSB0ZW0gZXNwYcOnbyBwYXJhIG11aXRhcyBhw6fDtWVzLCB0ZXN0ZXMgZSBleHBlcmltZW50YcOnw7VlcyBwYXJhIGVudGVuZGVyIGRlIGZhdG8gbyBxdWUgYXMgcGVzc29hcyBwcmVjaXNhbS4gU29uaGFtb3MgY29tIHRvcm5hciBvIGZpbmFuY2lhbWVudG8gY29sZXRpdm8gdW0gaMOhYml0byBubyBCcmFzaWwuIE8gQ2F0YXJzZUZsZXggw6kgbWFpcyB1bSBwYXNzbyBuZXNzYSBkaXJlw6fDo28uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbmRvIHZvY8OqcyBpcsOjbyBsYW7Dp2FyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWluZGEgbsOjbyBzYWJlbW9zIHF1YW5kbyBhYnJpcmVtb3MgbyBGbGV4IHBhcmEgbyBww7pibGljby4gSXJlbW9zIHByaW1laXJhbWVudGUgcGFzc2FyIHBvciB1bSBwZXLDrW9kbyBkZSB0ZXN0ZXMgZSBkZXBvaXMgZXN0YWJlbGVjZXIgdW1hIGRhdGEgZGUgbGFuw6dhbWVudG8uIFNlIHZvY8OqIGRlc2VqYSBhY29tcGFuaGFyIGUgcmVjZWJlciBub3TDrWNpYXMgc29icmUgZXNzYSBjYW1pbmhhZGEsIGluc2NyZXZhIHNldSBlbWFpbCBuZXNzYSBww6FnaW5hLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UudS10ZXh0LWNlbnRlci5iZy1wdXJwbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ0ZpcXVlIHBvciBkZW50cm8hJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwJywgJ1JlY2ViYSBub3TDrWNpYXMgZSBhY29tcGFuaGUgYSBldm9sdcOnw6NvIGRvIENhdGFyc2UgZmxleCcpLCBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1NpZ251cCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1jYXRhcnNlLXplbG8uc2VjdGlvbi1sYXJnZVtzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUudS1tYXJnaW5ib3R0b20tNDAuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ08gRmxleCDDqSB1bSBleHBlcmltZW50byBlIGluaWNpYXRpdmEgZG8gQ2F0YXJzZSwgbWFpb3IgcGxhdGFmb3JtYSBkZSBjcm93ZGZ1bmRpbmcgZG8gQnJhc2lsLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgKGN0cmwubG9hZGVyKCkpID8gaC5sb2FkZXIoKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQZXNzb2FzIGphIGFwb2lhcmFtIHBlbG8gbWVub3MgMDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfcHJvamVjdHNfc3VjY2VzcywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Byb2pldG9zIGphIGZvcmFtIGZpbmFuY2lhZG9zIG5vwqBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgc3RhdHMudG90YWxfY29udHJpYnV0ZWQudG9TdHJpbmcoKS5zbGljZSgwLCAyKSArICcgbWlsaMO1ZXMnKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdGb3JhbSBpbnZlc3RpZG9zIGVtIGlkZWlhcyBwdWJsaWNhZGFzIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWJsdWUtb25lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tZW5kZSBvIENhdGFyc2UgZmxleCBwYXJhIGFtaWdvcyEgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LXN1Yi1jb2wtbWlkZGxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NmUwNWViNjE0NDE3MWQ4ZWRiX2ZhY2Vib29rLXh4bC5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLWZiW2hyZWY9XCJodHRwOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PWh0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnQ29uaGXDp2EgbyBub3ZvIENhdGFyc2UgRmxleCEnKSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0NvbXBhcnRpbGhhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY1MTA1ZWI2MTQ0MTcxZDhlZGFfdHdpdHRlci0yNTYucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi10d2VldFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISBKdW50ZS1zZSBhIG7Ds3MsIGluc2NyZXZhIHNldSBlbWFpbCEnKSArICdodHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPXR3aXR0ZXJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1R1aXRhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctZ3JlZW5saW1lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwYXJ0aWNpcGUtZG8tZGViYXRlLnUtdGV4dC1jZW50ZXInLCB7Y29uZmlnOiBoLnRvQW5jaG9yKCl9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlc3QuZm9udGNvbG9yLW5lZ2F0aXZlJywnQ29uc3RydWEgbyBmbGV4IGNvbm9zY28nKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0luaWNpZSB1bWEgY29udmVyc2EsIHBlcmd1bnRlLCBjb21lbnRlLCBjcml0aXF1ZSBlIGZhw6dhIHN1Z2VzdMO1ZXMhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjZGlzcXVzX3RocmVhZC5jYXJkLnUtcmFkaXVzW3N0eWxlPVwibWluLWhlaWdodDogNTB2aDtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5hZGREaXNxdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLkxpdmVTdGF0aXN0aWNzID0gKChtLCBtb2RlbHMsIGgsIF8sIEpTT04pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFnZVN0YXRpc3RpY3MgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgLy8gYXJncy5zb2NrZXQgaXMgYSBzb2NrZXQgcHJvdmlkZWQgYnkgc29ja2V0LmlvXG4gICAgICAgICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgICAgICAgIGlmIChhcmdzLnNvY2tldCAmJiBfLmlzRnVuY3Rpb24oYXJncy5zb2NrZXQub24pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5zb2NrZXQub24oJ25ld19wYWlkX2NvbnRyaWJ1dGlvbnMnLCAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25EYXRhOiBub3RpZmljYXRpb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBjdHJsLm5vdGlmaWNhdGlvbkRhdGEoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uYmctc3RhdHMuc2VjdGlvbi5taW4taGVpZ2h0LTEwMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdpbWcudS1tYXJnaW5ib3R0b20tNjBbc3JjPVwiaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NWFkYTVkZDExYjM2YTUyNjE2ZDk3ZGZfc3ltYm9sLWNhdGFyc2UucG5nXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcyBwdWJsaWNhZG9zIHBvciBhcXVpJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBzdGF0LnRvdGFsX2NvbnRyaWJ1dG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ1Blc3NvYXMgasOhIGFwb2lhcmFtIHBlbG8gbWVub3MgMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9KSksICghXy5pc0VtcHR5KGRhdGEpID8gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS02MC5tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS51c2VyX25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnYWNhYm91IGRlIGFwb2lhciBvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz1cIicgKyBkYXRhLnByb2plY3RfaW1hZ2UgKyAnXCJdW3dpZHRoPVwiNzVcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLmZvbnRjb2xvci1uZWdhdGl2ZVtocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2VcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1naXRodWInLCAnLicpLCAnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwid2luZG93LmMucGFnZXMuVGVhbSA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5wcm9qZWN0Lkluc2lnaHRzID0gKGZ1bmN0aW9uKG0sIGMsIG1vZGVscywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgICAgICAgbW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbihwcm9qZWN0RGV0YWlscyk7XG4gICAgICAgICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoZnVuY3Rpb24ocHJvamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvbkFtb3VudFBlckRheSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogY3RybC52bS5wcm9qZWN0X2lkKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlckNvdW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0ocHJvamVjdCkpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMucHJvamVjdC5TaG93ID0gKChtLCBjLCBfLCBtb2RlbHMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgaWRWTSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdF9pZCk7XG4gICAgICAgICAgICBpZFZNLmlkKGFyZ3MucHJvamVjdF91c2VyX2lkKTtcblxuICAgICAgICAgICAgY29uc3QgbFByb2plY3QgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICBsVXNlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKGlkVk0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgbFJld2FyZCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucmV3YXJkRGV0YWlsLmdldFBhZ2VPcHRpb25zKHZtLnBhcmFtZXRlcnMoKSkpO1xuXG4gICAgICAgICAgICBsUHJvamVjdC5sb2FkKCkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGxVc2VyLmxvYWQoKS50aGVuKHVzZXJEZXRhaWxzKTtcbiAgICAgICAgICAgICAgICBsUmV3YXJkLmxvYWQoKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMoZGF0YSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzLFxuICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IHJld2FyZERldGFpbHMsXG4gICAgICAgICAgICAgICAgbFByb2plY3Q6IGxQcm9qZWN0LFxuICAgICAgICAgICAgICAgIGxVc2VyOiBsVXNlcixcbiAgICAgICAgICAgICAgICBsUmV3YXJkOiBsUmV3YXJkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKCEoY3RybC5sUHJvamVjdCgpIHx8IGN0cmwubFVzZXIoKSB8fCBjdHJsLmxSZXdhcmQoKSkpID8gXy5tYXAoY3RybC5wcm9qZWN0RGV0YWlscygpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1zaG93Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGgubWl4cGFuZWxUcmFjaygpXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RIZWFkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogY3RybC51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0VGFicywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0TWFpbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGN0cmwucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSA6IGgubG9hZGVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIGgsIHJlcGxhY2VEaWFjcml0aWNzKSB7XG4gICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICAgICAgICAgIHN0YXRlOiAnZXEnLFxuICAgICAgICAgICAgZ2F0ZXdheTogJ2VxJyxcbiAgICAgICAgICAgIHZhbHVlOiAnYmV0d2VlbicsXG4gICAgICAgICAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgICAgICAgfSksXG5cbiAgICAgICAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICAgIH07XG5cbiAgICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgICB2bS5zdGF0ZSgnJyk7XG4gICAgdm0uZ2F0ZXdheSgnJyk7XG4gICAgdm0ub3JkZXIoe1xuICAgICAgICBpZDogJ2Rlc2MnXG4gICAgfSk7XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmx0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmx0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5lbmRPZignZGF5JykuZm9ybWF0KCcnKTtcbiAgICB9O1xuXG4gICAgdm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5ndGUoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZm9ybWF0KCk7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbCk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLnVzZXJGaWx0ZXJWTSA9IChmdW5jdGlvbihtLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCdcbiAgICAgICAgfSksXG5cbiAgICAgICAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICAgIH07XG5cbiAgICAvLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbiAgICB2bS5vcmRlcih7XG4gICAgICAgIGlkOiAnZGVzYydcbiAgICB9KTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9