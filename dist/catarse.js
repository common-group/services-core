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
        navigateToDevise = function navigateToDevise() {
        window.location.href = '/pt/login';
        return false;
    };

    setMomentifyLocale();

    return {
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
        UIHelper: UIHelper
    };
})(window.m, window.moment);
'use strict';

window.c.models = (function (m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        projectDetail = m.postgrest.model('project_details'),
        userDetail = m.postgrest.model('user_details'),
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
                        model: c.models.userDetail
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
                        model: c.models.userDetail
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

            return m('.project-posts.w-section', [m('.w-container.u-margintop-20', [project.is_owner_or_admin ? [_.isEmpty(list.collection()) ? m('.w-hidden-small.w-hidden-tiny', [m('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '', m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.id + '/edit#posts\']', 'Escrever novidade')]), m('.w-col.w-col-4')])] : '', _.map(list.collection(), function (post) {
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
            return m('#team-total-static.w-section.section-one-column.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
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
                        return [m('.divider'), m('.w-section.section-one-column.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
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
            return !ctrl.lProject() ? _.map(ctrl.projectDetails(), function (project) {
                return m('.project-show', {
                    config: h.mixpanelTrack()
                }, [!ctrl.lUser() ? m.component(c.ProjectHeader, {
                    project: project,
                    userDetails: ctrl.userDetails
                }) : h.loader(), m.component(c.ProjectTabs, {
                    project: project
                }), !ctrl.lReward() ? m.component(c.ProjectMain, {
                    project: project,
                    rewardDetails: ctrl.rewardDetails
                }) : h.loader(), project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
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
    return m.postgrest.paginationVM(models.userDetail);
})(window.m, window.c.models);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1jYXJkLmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiYWRtaW4tcHJvamVjdC5qcyIsImFkbWluLXJhZGlvLWFjdGlvbi5qcyIsImFkbWluLXJld2FyZC5qcyIsImFkbWluLXRyYW5zYWN0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi10cmFuc2FjdGlvbi5qcyIsImFkbWluLXVzZXItZGV0YWlsLmpzIiwiYWRtaW4tdXNlci1pdGVtLmpzIiwiYWRtaW4tdXNlci5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwicGF5bWVudC1zdGF0dXMuanMiLCJwb3Atbm90aWZpY2F0aW9uLmpzIiwicHJvamVjdC1hYm91dC5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29tbWVudHMuanMiLCJwcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uLXRhYmxlLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC1kYXNoYm9hcmQtbWVudS5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmVtaW5kZXIuanMiLCJwcm9qZWN0LXJld2FyZC1saXN0LmpzIiwicHJvamVjdC1yb3cuanMiLCJwcm9qZWN0LXNoYXJlLWJveC5qcyIsInByb2plY3Qtc2lkZWJhci5qcyIsInByb2plY3QtdGFicy5qcyIsInByb2plY3QtdXNlci1jYXJkLmpzIiwidGVhbS1tZW1iZXJzLmpzIiwidGVhbS10b3RhbC5qcyIsInVzZXItY2FyZC5qcyIsInBhZ2VzL2xpdmUtc3RhdGlzdGljcy5qcyIsInBhZ2VzL3RlYW0uanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiLCJjb250cmlidXRpb24vcHJvamVjdHMtaG9tZS5qcyIsInByb2plY3QvaW5zaWdodHMuanMiLCJwcm9qZWN0L3Nob3cuanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1saXN0LXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1maWx0ZXItdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLENBQUMsQ0FBQyxHQUFJLENBQUEsWUFBVztBQUNuQixXQUFPO0FBQ0gsY0FBTSxFQUFFLEVBQUU7QUFDVixhQUFLLEVBQUUsRUFBRTtBQUNULG9CQUFZLEVBQUUsRUFBRTtBQUNoQixhQUFLLEVBQUUsRUFBRTtBQUNULGVBQU8sRUFBRSxFQUFFO0FBQ1gsU0FBQyxFQUFFLEVBQUU7S0FDUixDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDVEwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFN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TSxFQUFFO0FBQzdDLFdBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3RELENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQyIsImZpbGUiOiJjYXRhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LmMgPSAoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbW9kZWxzOiB7fSxcbiAgICAgICAgcGFnZXM6IHt9LFxuICAgICAgICBjb250cmlidXRpb246IHt9LFxuICAgICAgICBhZG1pbjoge30sXG4gICAgICAgIHByb2plY3Q6IHt9LFxuICAgICAgICBoOiB7fVxuICAgIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9ICgobSwgbW9tZW50KSA9PiB7XG4gICAgLy9EYXRlIEhlbHBlcnNcbiAgICBjb25zdCBzZXRNb21lbnRpZnlMb2NhbGUgPSAoKSA9PiB7XG4gICAgICAgIG1vbWVudC5sb2NhbGUoJ3B0Jywge1xuICAgICAgICAgICAgbW9udGhzU2hvcnQ6ICdqYW5fZmV2X21hcl9hYnJfbWFpX2p1bl9qdWxfYWdvX3NldF9vdXRfbm92X2Rleicuc3BsaXQoJ18nKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgICAgICAgbW9tZW50aWZ5ID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ0REL01NL1lZWVknO1xuICAgICAgICAgICAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5sb2NhbGUoJ3B0JykuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHN0b3JlQWN0aW9uID0gKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgICBpZiAoIXNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oYWN0aW9uLCBhY3Rpb24pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNhbGxTdG9yZWRBY3Rpb24gPSAoYWN0aW9uLCBmdW5jKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgIGZ1bmMuY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oYWN0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBtb21lbnRGcm9tU3RyaW5nID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICAgICAgICAgIGdlbmVyYXRlUmVtYWluZ1RpbWUgPSAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nVGltZSA9IHByb2plY3QucmVtYWluaW5nX3RpbWUudG90YWwsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZWRUaW1lID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVuaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qVW5pdCA9IHRyYW5zbGF0ZWRUaW1lW3Byb2plY3QucmVtYWluaW5nX3RpbWUudW5pdCB8fCAnc2Vjb25kcyddO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHJlbWFpbmluZ1RpbWUgPD0gMSkgPyBwcm9qVW5pdC5zbGljZSgwLCAtMSkgOiBwcm9qVW5pdDtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqKHtcbiAgICAgICAgICAgICAgICAgIHVuaXQ6IHVuaXQoKSxcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiByZW1haW5pbmdUaW1lXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJldHVybiByZW1haW5pbmdUZXh0T2JqO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgICAgICAgICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IChzLCBjKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAobnVtYmVyLCBuLCB4KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAobnVtYmVyID09PSBudWxsIHx8IG51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gICAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHAgPSBtLnByb3AoZGVmYXVsdFN0YXRlKTtcbiAgICAgICAgICAgICAgcC50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBwKCgocCgpID09PSBhbHRlcm5hdGVTdGF0ZSkgPyBkZWZhdWx0U3RhdGUgOiBhbHRlcm5hdGVTdGF0ZSkpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgICB9KSxcblxuICAgICAgICAgIGdldFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gXy5maXJzdChib2R5KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcicpO1xuICAgICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaGFzaE1hdGNoID0gKHN0cikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IHN0cjtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYWN0ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgICAgICByZXR1cm4gYWN0aW9uID09PSBhY3Q7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdCA9IChhdmF0YXJQYXRoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLy9UZW1wbGF0ZXNcbiAgICAgICAgICBsb2FkZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMCB1LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB0cnlQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcGx1cmFsaXplID0gKGNvdW50LCBzLCBwKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2ltcGxlRm9ybWF0ID0gKHN0ciA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHJcXG4/LywgJ1xcbicpO1xuICAgICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHJld2FyZFNvdWxkT3V0ID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICByZXdhcmRSZW1hbmluZyA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcGFyc2VVcmwgPSAoaHJlZikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbWl4cGFuZWxUcmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LkNhdGFyc2VNaXhwYW5lbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBVSUhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVUlIZWxwZXIuc2V0dXBSZXNwb25zaXZlSWZyYW1lcygkKGVsKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIG5hdmlnYXRlVG9EZXZpc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9wdC9sb2dpbic7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgc2V0TW9tZW50aWZ5TG9jYWxlKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBmYlBhcnNlOiBmYlBhcnNlLFxuICAgICAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICAgICAgc2ltcGxlRm9ybWF0OiBzaW1wbGVGb3JtYXQsXG4gICAgICAgIGdlbmVyYXRlUmVtYWluZ1RpbWU6IGdlbmVyYXRlUmVtYWluZ1RpbWUsXG4gICAgICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICAgICAgcmV3YXJkUmVtYW5pbmc6IHJld2FyZFJlbWFuaW5nLFxuICAgICAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoLFxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQ6IHVzZUF2YXRhck9yRGVmYXVsdCxcbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaDogbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICAgICAgbWl4cGFuZWxUcmFjazogbWl4cGFuZWxUcmFjayxcbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZTogbmF2aWdhdGVUb0RldmlzZSxcbiAgICAgICAgc3RvcmVBY3Rpb246IHN0b3JlQWN0aW9uLFxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uOiBjYWxsU3RvcmVkQWN0aW9uLFxuICAgICAgICBVSUhlbHBlcjogVUlIZWxwZXJcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMubW9kZWxzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgY29udHJpYnV0aW9uRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbl9kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9kZXRhaWxzJyksXG4gICAgICAgIHVzZXJEZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gICAgICAgIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9yZW1pbmRlcnMnKSxcbiAgICAgICAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgICAgIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gICAgICAgIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgICAgICAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgICAgICAgc3RhdGlzdGljID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3N0YXRpc3RpY3MnKTtcblxuICAgIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICAgIHJld2FyZERldGFpbC5wYWdlU2l6ZShmYWxzZSk7XG4gICAgcHJvamVjdC5wYWdlU2l6ZSgzMCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICAgICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICAgICAgcmV3YXJkRGV0YWlsOiByZXdhcmREZXRhaWwsXG4gICAgICAgIGNvbnRyaWJ1dGlvbnM6IGNvbnRyaWJ1dGlvbnMsXG4gICAgICAgIHRlYW1Ub3RhbDogdGVhbVRvdGFsLFxuICAgICAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb246IHByb2plY3RDb250cmlidXRpb24sXG4gICAgICAgIHByb2plY3RQb3N0RGV0YWlsOiBwcm9qZWN0UG9zdERldGFpbCxcbiAgICAgICAgcHJvamVjdFJlbWluZGVyOiBwcm9qZWN0UmVtaW5kZXIsXG4gICAgICAgIHN0YXRpc3RpYzogc3RhdGlzdGljXG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbDtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXdhcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZWwgPSBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZF9pZCA9IGFyZ3MuaXRlbS5yZXdhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSBtb2RlbC5nZXRSb3dPcHRpb25zKGguaWRWTS5pZChyZXdhcmRfaWQpLnBhcmFtZXRlcnMoKSksXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCA9IG0ucHJvcCh7fSk7XG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihvcHRzKTtcbiAgICAgICAgICAgICAgICBpZiAocmV3YXJkX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oXy5jb21wb3NlKHJld2FyZCwgXy5maXJzdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV3YXJkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGxvYWRSZXdhcmQoKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICd1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdUcmFuc2ZlcmlyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5OiAncHJvamVjdF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdjb250cmlidXRpb25faWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0S2V5OiAncmV3YXJkX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQWx0ZXJhciBSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZTogKHJld2FyZHMsIG5ld1Jld2FyZElEKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJld2FyZCA9IF8uZmluZFdoZXJlKHJld2FyZHMsIHtpZDogbmV3UmV3YXJkSUR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFyZ3MuaXRlbS52YWx1ZSA+PSByZXdhcmQubWluaW11bV92YWx1ZSkgPyB1bmRlZmluZWQgOiAnVmFsb3IgbcOtbmltbyBkYSByZWNvbXBlbnNhIMOpIG1haW9yIGRvIHF1ZSBvIHZhbG9yIGRhIGNvbnRyaWJ1acOnw6NvLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlZnVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVlbWJvbHNvIGRpcmV0bycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWVtYm9sc2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWVtYm9sc2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FwYWdhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ0FwYWdhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGw6IGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICByZXdhcmQgPSBjdHJsLnJld2FyZDtcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC9hZG1pbi9jb250cmlidXRpb25zLyR7aWR9L2dhdGV3YXlfcmVmdW5kYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy50cmFuc2ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SYWRpb0FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZTogaXRlbS5wcm9qZWN0X2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWU6IGl0ZW0uY29udHJpYnV0aW9uX2lkXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZWZ1bmQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJlbW92ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5rZXlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblByb2plY3QnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdQYXltZW50U3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5pdGVtQnVpbGRlciwgZnVuY3Rpb24ocGFuZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ocGFuZWwud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW3BhbmVsLmNvbXBvbmVudF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyIGNvbXBvbmVudFxuICogQW4gaXRlbWJ1aWxkZXIgY29tcG9uZW50IHRoYXQgcmV0dXJucyBhZGRpdGlvbmFsIGRhdGFcbiAqIHRvIGJlIGluY2x1ZGVkIGluIEFkbWluVXNlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuIHtcbiAqICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gKiAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICogICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gKiAgICAgICAgIH1dXG4gKiAgICAgfVxuICogfVxuICovXG53aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltZ190aHVtYm5haWw6IGl0ZW0udXNlcl9wcm9maWxlX2ltZyxcbiAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlcl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBpdGVtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgaXRlbS5wYXllcl9lbWFpbCk7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIHtpdGVtOiB1c2VyLCBhZGRpdGlvbmFsX2RhdGE6IGFkZGl0aW9uYWxEYXRhfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gY29tcG9uZW50XG4gKiBNYWtlcyBhcmJpdHJhcnkgYWpheCByZXF1ZXN0cyBhbmQgdXBkYXRlIHVuZGVybHlpbmdcbiAqIGRhdGEgZnJvbSBzb3VyY2UgZW5kcG9pbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJylbMF0uY29udGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkID0gXy5jb21wb3NlKGJ1aWxkZXIubW9kZWwuZ2V0Um93LCBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pLnBhcmFtZXRlcnMpLFxuICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXIoYnVpbGRlci5yZXF1ZXN0T3B0aW9ucywgbS5yZXF1ZXN0KTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkSXRlbSA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVsb2FkKCkudGhlbih1cGRhdGVJdGVtKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihyZWxvYWRJdGVtLCByZXF1ZXN0RXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVubG9hZCA9IChlbCwgaXNpbml0LCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVxdWlzacOnw6NvIGZlaXRhIGNvbSBzdWNlc3NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluRmlsdGVyID0gKGZ1bmN0aW9uKGMsIG0sIF8sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJCdWlsZGVyID0gYXJncy5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnLFxuICAgICAgICAgICAgICAgIG1haW4gPSBfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgbGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogYXJncy5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSA/IG0uY29tcG9uZW50KGNbbWFpbi5jb21wb25lbnRdLCBtYWluLmRhdGEpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwLnctcm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctY29sLnctY29sLTEyLmZvbnRzaXplLXNtYWxsZXN0LmxpbmstaGlkZGVuLWxpZ2h0W3N0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBvdXRsaW5lOiBub25lOyB0ZXh0LWFsaWduOiBsZWZ0O1wiXVt0eXBlPVwiYnV0dG9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkdmFuY2VkLXNlYXJjaC53LXJvdy5hZG1pbi1maWx0ZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoZmlsdGVyQnVpbGRlciwgZnVuY3Rpb24oZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoZi5jb21wb25lbnQgIT09ICdGaWx0ZXJNYWluJykgPyBtLmNvbXBvbmVudChjW2YuY29tcG9uZW50XSwgZi5kYXRhKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93LmMsIHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5JbnB1dEFjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWUgPSBidWlsZGVyLmZvcmNlVmFsdWUgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IG0ucHJvcChmb3JjZVZhbHVlKTtcblxuICAgICAgICAgICAgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKTtcblxuICAgICAgICAgICAgdmFyIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5tb2RlbC5wYXRjaE9wdGlvbnMoaC5pZFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICAgICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUoZm9yY2VWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSwgKGRhdGEuZm9yY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdWYWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwubmV3VmFsdWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGRhdGEuc3VjY2Vzc01lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkl0ZW0gPSAoZnVuY3Rpb24obSwgXywgaCwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5RGV0YWlsQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5RGV0YWlsQm94OiBkaXNwbGF5RGV0YWlsQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0yMC5yZXN1bHRzLWFkbWluLWl0ZW1zJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGFyZ3MubGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RGV0YWlsQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGN0cmwuZGlzcGxheURldGFpbEJveCgpID8gbS5jb21wb25lbnQoYXJncy5saXN0RGV0YWlsLCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICB9KSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluTGlzdCA9IChmdW5jdGlvbihtLCBoLCBjKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcbiAgICAgICAgICAgIGlmICghbGlzdC5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3QuZmlyc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3Mudm0uZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3QsXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBhcmdzLnZtLmVycm9yLFxuICAgICAgICAgICAgICAgIGxhYmVsID0gYXJncy5sYWJlbCB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLmNhcmQtZXJyb3IudS1yYWRpdXMuZm9udHdlaWdodC1ib2xkJywgZXJyb3IoKSkgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYENhcnJlZ2FuZG8gJHtsYWJlbC50b0xvd2VyQ2FzZSgpfS4uLmAgOiBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgbGlzdC50b3RhbCgpKSwgYCAke2xhYmVsLnRvTG93ZXJDYXNlKCl9IGVuY29udHJhZG9zYF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWxpc3Qudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5JdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYXJncy5saXN0SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGFyZ3MubGlzdERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGl0ZW0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ05PIEFSJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0FHVUFSREFORE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3RlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkVDVVNBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFmdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSQVNDVU5ITydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0VNIEFOw4FMSVNFJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQVBST1ZBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNUZXh0T2JqO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqOiBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmooKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksICfCoCcsIG0oJ3NwYW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHN0YXR1c1RleHRPYmoudGV4dCksICfCoCdcbiAgICAgICAgICAgICAgICAgICAgXSksIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnZmluYW5jaWFkbycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnbGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgcmVtYWluaW5nVGV4dE9iai51bml0ICsgJyByZXN0YW50ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGV4cGxhbmF0aW9uID0gZnVuY3Rpb24ocmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAnVm9jw6ogcG9kZSByZWNlYmVyIGFwb2lvcyBhdMOpIDIzaHM1OW1pbjU5cyBkbyBkaWEgJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnLiBMZW1icmUtc2UsIMOpIHR1ZG8tb3UtbmFkYSBlIHZvY8OqIHPDsyBsZXZhcsOhIG9zIHJlY3Vyc29zIGNhcHRhZG9zIHNlIGJhdGVyIGEgbWV0YSBkZW50cm8gZGVzc2UgcHJhem8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLCBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBmYWlsZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIG7Do28gZGVzYW5pbWUhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIG7Do28gYmF0ZXUgYSBtZXRhIGUgc2FiZW1vcyBxdWUgaXNzbyBuw6NvIMOpIGEgbWVsaG9yIGRhcyBzZW5zYcOnw7Vlcy4gTWFzIG7Do28gZGVzYW5pbWUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRW5jYXJlIG8gcHJvY2Vzc28gY29tbyB1bSBhcHJlbmRpemFkbyBlIG7Do28gZGVpeGUgZGUgY29naXRhciB1bWEgc2VndW5kYSB0ZW50YXRpdmEuIE7Do28gc2UgcHJlb2N1cGUsIHRvZG9zIG9zIHNldXMgYXBvaWFkb3JlcyByZWNlYmVyw6NvIG8gZGluaGVpcm8gZGUgdm9sdGEuwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDctUmVncmFzLWUtZnVuY2lvbmFtZW50by1kb3MtcmVlbWJvbHNvcy1lc3Rvcm5vc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIGZhemVtb3MgZXN0b3Jub3MgZSByZWVtYm9sc29zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBpbmZlbGl6bWVudGUgbsOjbyBmb2kgZGVzdGEgdmV6LicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBWb2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBkbyBDYXRhcnNlIGUgZW50ZW5kZW1vcyBxdWUgZWxlIG7Do28gZXN0w6EgZGUgYWNvcmRvIGNvbSBvIHBlcmZpbCBkbyBzaXRlLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RlciB1bSBwcm9qZXRvIHJlY3VzYWRvIG7Do28gaW1wZWRlIHF1ZSB2b2PDqiBlbnZpZSBub3ZvcyBwcm9qZXRvcyBwYXJhIGF2YWxpYcOnw6NvIG91IHJlZm9ybXVsZSBzZXUgcHJvamV0byBhdHVhbC4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb252ZXJzZSBjb20gbm9zc28gYXRlbmRpbWVudG8hIFJlY29tZW5kYW1vcyBxdWUgdm9jw6ogZMOqIHVtYSBib2Egb2xoYWRhIG5vc8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzg3NjM4LURpcmV0cml6ZXMtcGFyYS1jcmlhJUMzJUE3JUMzJUEzby1kZS1wcm9qZXRvc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY3JpdMOpcmlvcyBkYSBwbGF0YWZvcm1hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIG5vwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdndWlhIGRvcyByZWFsaXphZG9yZXMnKSwgJy4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGRyYWZ0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb25zdHJ1YSBvIHNldSBwcm9qZXRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUXVhbnRvIG1haXMgY3VpZGFkb3NvIGUgYmVtIGZvcm1hdGFkbyBmb3IgdW0gcHJvamV0bywgbWFpb3JlcyBhcyBjaGFuY2VzIGRlIGVsZSBzZXIgYmVtIHN1Y2VkaWRvIG5hIHN1YSBjYW1wYW5oYSBkZSBjYXB0YcOnw6NvLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FudGVzIGRlIGVudmlhciBzZXUgcHJvamV0byBwYXJhIGEgbm9zc2EgYW7DoWxpc2UsIHByZWVuY2hhIHRvZGFzIGFzIGFiYXMgYW8gbGFkbyBjb20gY2FyaW5oby4gVm9jw6ogcG9kZSBzYWx2YXIgYXMgYWx0ZXJhw6fDtWVzIGUgdm9sdGFyIGFvIHJhc2N1bmhvIGRlIHByb2pldG8gcXVhbnRhcyB2ZXplcyBxdWlzZXIuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUXVhbmRvIHR1ZG8gZXN0aXZlciBwcm9udG8sIGNsaXF1ZSBubyBib3TDo28gRU5WSUFSIGUgZW50cmFyZW1vcyBlbSBjb250YXRvIHBhcmEgYXZhbGlhciBvIHNldSBwcm9qZXRvLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHNldSBwcm9qZXRvIGZvaSBhcHJvdmFkbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFBhcmEgY29sb2NhciBvIHNldSBwcm9qZXRvIG5vIGFyIMOpIHByZWNpc28gYXBlbmFzIHF1ZSB2b2PDqiBwcmVlbmNoYSBvcyBkYWRvcyBuZWNlc3PDoXJpb3MgbmEgYWJhwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiI3VzZXJfc2V0dGluZ3NcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcuIMOJIGltcG9ydGFudGUgc2FiZXIgcXVlIGNvYnJhbW9zIGEgdGF4YSBkZSAxMyUgZG8gdmFsb3IgdG90YWwgYXJyZWNhZGFkbyBhcGVuYXMgcG9yIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuIEVudGVuZGHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gZmF6ZW1vcyBvIHJlcGFzc2UgZG8gZGluaGVpcm8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QucHJvamVjdF9zdGF0ZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJhZGlvQWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoaXRlbS5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgICAgICAgbmV3SUQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZSA9IGFyZ3MuZ2V0S2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXksXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWUgPSBhcmdzLnVwZGF0ZUtleVZhbHVlLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlID0gYnVpbGRlci52YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSBidWlsZGVyLnNlbGVjdGVkSXRlbSB8fCBtLnByb3AoKTtcblxuICAgICAgICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICAgICAgICBzZXRWTVt1cGRhdGVLZXldKHVwZGF0ZUtleVZhbHVlKTtcblxuICAgICAgICAgICAgZ2V0RmlsdGVyW2dldEtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIGdldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKGdldEZpbHRlcik7XG4gICAgICAgICAgICBnZXRWTVtnZXRLZXldKGdldEtleVZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFBhZ2VPcHRpb25zKGdldFZNLnBhcmFtZXRlcnMoKSkpO1xuXG4gICAgICAgICAgICB2YXIgc2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIudXBkYXRlTW9kZWwucGF0Y2hPcHRpb25zKHNldFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICAgICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBfLmZpbmRXaGVyZShyYWRpb3MoKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGFbMF1bYnVpbGRlci5zZWxlY3RLZXldXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0obmV3SXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ05lbmh1bSBpdGVtIGF0dWFsaXphZG8nXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKHJhZGlvcywgZXJyb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdJRCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWxpZGF0aW9uID0gdmFsaWRhdGUocmFkaW9zKCksIG5ld0lEKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWxpZGF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtidWlsZGVyLnNlbGVjdEtleV0gPSBuZXdJRCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3SUQoJycpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24odGV4dCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZldGNoKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIHNldExvYWRlcjogc2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIG5ld0lEOiBuZXdJRCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICAgICAgICAgIHJhZGlvczogcmFkaW9zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwucmFkaW9zKCksIGZ1bmN0aW9uKHJhZGlvLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdJRChyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0RGVzY3JpcHRpb24ocmFkaW8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKHJhZGlvLmlkID09PSAoaXRlbVtkYXRhLnNlbGVjdEtleV0gfHwgaXRlbS5pZCkpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yKCkubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJld2FyZCA9IChmdW5jdGlvbihtLCBjLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGFyZ3MucmV3YXJkKCksXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgcmV3YXJkLmlkID8gW1xuICAgICAgICAgICAgICAgICAgICAnSUQ6ICcgKyByZXdhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo286ICcgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBdIDogJ0Fwb2lvIHNlbSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICBtYXBFdmVudHMgPSBfLnJlZHVjZShbe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGFpZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNvbmZpcm1hZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjcmlhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNoYXJnZWJhY2tfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdDaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgIH1dLCBmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3JpZ2luYWxEYXRlID0gaXRlbS5kYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkYSB0cmFuc2HDp8OjbycpLFxuICAgICAgICAgICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICdWYWxvcjogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fuw7RuaW1vOiAnICsgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0NoYXZlOsKgXFxuJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ09wZXJhZG9yYTogJyArIChjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhICYmIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEuYWNxdWlyZXJfbmFtZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cmlidXRpb24uaXNfc2Vjb25kX3NsaXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KCkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluVXNlckRldGFpbCBjb21wb25lbnRcbiAqIFJldHVybiBhY3Rpb24gaW5wdXRzIHRvIGJlIHVzZWQgaW5zaWRlIEFkbWluTGlzdCBjb21wb25lbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluVXNlckRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3VzZXJfcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVkZWZpbmlyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdOb3ZhIHNlbmhhIGRlIFVzdcOhcmlvOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVkZWZpbmlyIHNlbmhhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyM211ZEByJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlYWN0aXZhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVhdGl2YXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ1RlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgcmVhdGl2YXIgZXNzZSB1c3XDoXJpbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdVc3XDoXJpbyByZWF0aXZhZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gdXN1w6FyaW8gbsOjbyBww7RkZSBzZXIgcmVhdGl2YWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVhdGl2YXIgdXN1w6FyaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy51c2VyRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gYXJncy5kZXRhaWxzO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7ZGF0YTogYWN0aW9ucy5yZXNldCwgaXRlbTogaXRlbX0pLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbS5kZWFjdGl2YXRlZF9hdCkgP1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtkYXRhOiBhY3Rpb25zLnJlYWN0aXZhdGUsIGl0ZW06IGl0ZW19KSA6ICcnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlckl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VyID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudXNlci1hdmF0YXJbc3JjPVwiJyArIGgudXNlQXZhdGFyT3JEZWZhdWx0KHVzZXIucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci5pZCArICcvZWRpdFwiXScsIHVzZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdVc3XDoXJpbzogJyArIHVzZXIuaWQpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdFbWFpbDogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLmFkZGl0aW9uYWxfZGF0YSB8fCBtKCcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlckRyb3Bkb3duID0gKGZ1bmN0aW9uKG0sIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYXJncy5vcHRpb25zLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZS5tZWRpdW1bcGxhY2Vob2xkZXI9XCInICsgYXJncy5wbGFjZWhvbGRlciArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjZmlsdGVyLWJ0bi5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCJCdXNjYXJcIl0nKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUGF5bWVudFN0YXR1cyA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2FyZCA9IG51bGwsXG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgICAgICAgY2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuZ2F0ZXdheS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmFuZGVpcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfbGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2JyYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IGNhcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcjY3JlZGl0Y2FyZC1kZXRhaWwuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5maXJzdF9kaWdpdHMgKyAnKioqKioqJyArIGNhcmREYXRhLmxhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkRGF0YS5icmFuZCArICcgJyArIHBheW1lbnQuaW5zdGFsbG1lbnRzICsgJ3gnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnBheW1lbnRfbWV0aG9kLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtYmFyY29kZSc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1jcmVkaXQtY2FyZCc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdGVDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWlkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZnVuZGVkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtcmVmdW5kZWQnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZ19yZWZ1bmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC13YWl0aW5nJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtZXJyb3InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzczogcGF5bWVudE1ldGhvZENsYXNzLFxuICAgICAgICAgICAgICAgIHN0YXRlQ2xhc3M6IHN0YXRlQ2xhc3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnBheW1lbnQtc3RhdHVzJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWNpcmNsZScgKyBjdHJsLnN0YXRlQ2xhc3MoKSksICfCoCcgKyBwYXltZW50LnN0YXRlXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEnICsgY3RybC5wYXltZW50TWV0aG9kQ2xhc3MoKSksICcgJywgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsIHBheW1lbnQucGF5bWVudF9tZXRob2QpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5UGF5bWVudE1ldGhvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBvcE5vdGlmaWNhdGlvbiA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5Tm90aWZpY2F0aW9uID0gaC50b2dnbGVQcm9wKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Tm90aWZpY2F0aW9uOiBkaXNwbGF5Tm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24oKSA/IG0oJy5mbGFzaC53LWNsZWFyZml4LmNhcmQuY2FyZC1ub3RpZmljYXRpb24udS1yYWRpdXMuemluZGV4LTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWNsb3NlW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAveC5wbmdcIl1bd2lkdGg9XCIxMlwiXVthbHQ9XCJmZWNoYXJcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbi50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBhcmdzLm1lc3NhZ2UpXG4gICAgICAgICAgICBdKSA6IG0oJ3NwYW4nKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdEFib3V0ID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QocHJvamVjdC5hYm91dF9odG1sKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocHJvamVjdC5idWRnZXQpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZ1bmRpbmctcGVyaW9kJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHByb2plY3Qub25saW5lX2RhdGUpLCAnIC0gJywgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCAnICgnICsgcHJvamVjdC5vbmxpbmVfZGF5cyArICcgZGlhcykgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENhcmQgPSAoKG0sIGgsIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpLFxuICAgICAgICAgICAgICAgIGxpbmsgPSAnLycgKyBwcm9qZWN0LnBlcm1hbGluayArIChhcmdzLnJlZiA/ICc/cmVmPScgKyBhcmdzLnJlZiA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgYS5jYXJkLXByb2plY3QtdGh1bWJbaHJlZj1cIiR7bGlua31cIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3Byb2plY3QucHJvamVjdF9pbWd9KWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYHBvciAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZX0sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHsocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcyl9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke01hdGguY2VpbChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdCcsICdMZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtyZW1haW5pbmdUZXh0T2JqLnRvdGFsfSAke3JlbWFpbmluZ1RleHRPYmoudW5pdH1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAocmVtYWluaW5nVGV4dE9iai50b3RhbCA+IDEpID8gJ1Jlc3RhbnRlcycgOiAnUmVzdGFudGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG90YWxfYW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi5vdmVyZmxvdy1hdXRvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5yZW5kZXJDaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gYXJncy5jb2xsZWN0aW9uKClbMF0sXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MgY29uZmlybWFkb3MgcG9yIGRpYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnRvdGFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAocmVzb3VyY2Uuc291cmNlLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0Fwb2lvcyBjb25maXJtYWRvcyBwb3IgZGlhJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIub3ZlcmZsb3ctYXV0bycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwucmVuZGVyQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29tbWVudHMgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5mYi1jb21tZW50c1tkYXRhLWhyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtkYXRhLW51bS1wb3N0cz01MF1bZGF0YS13aWR0aD1cIjYxMFwiXScpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29sbGVjdGlvblswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAnREVTQyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5zb3VyY2UgPSBvcmRlcmVkU291cmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgICAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVNvcnQoJ3RvdGFsX2NvbnRyaWJ1dGVkJykoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsICdMb2NhbGl6YcOnw6NvIGdlb2dyw6FmaWNhIGRvcyBhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ0VzdGFkbycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLCBtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbFtkYXRhLWl4PVwic29ydC1hcnJvd3NcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmdlbmVyYXRlU29ydCgndG90YWxfY29udHJpYnV0ZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgYXBvaWFkb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcoJSBkbyB0b3RhbCkgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGNvbnRyaWJ1dGlvbkxvY2F0aW9uLnNvdXJjZSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHNvdXJjZS5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKHNvdXJjZS50b3RhbF9jb250cmlidXRlZCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBzb3VyY2UudG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbiksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nID0gKHdhaXRpbmcgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nOiB0b2dnbGVXYWl0aW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgICAgICAoYXJncy5wcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl0nLCAnQ29uZmlybWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXVt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt2YWx1ZT1cIndhaXRpbmdfY29uZmlybWF0aW9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl0nLCAnUGVuZGVudGVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMnLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tZGFya1tocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBjb250cmlidXRpb24udXNlcl9uYW1lKSwgKGNvbnRyaWJ1dGlvbi5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSwgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyBbbS50cnVzdCgnJm5ic3A7LSZuYnNwOycpLCBtKCdzdHJvbmcnLCAnQXBvaWFkb3IgYW7DtG5pbW8nKV0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBoOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgWyFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZSA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdiA9IGgudG9nZ2xlUHJvcCgnYm9keS1wcm9qZWN0IG9wZW4nLCAnYm9keS1wcm9qZWN0IGNsb3NlZCcpO1xuXG4gICAgICAgICAgICBpZiAoIWFyZ3MucHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUudG9nZ2xlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGU6IGVkaXRMaW5rc1RvZ2dsZSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2OiBib2R5VG9nZ2xlRm9yTmF2XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9qZWN0Um91dGUgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgICAgZWRpdExpbmtDbGFzcyA9ICdkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJ2luZGVudCcgOiAnJyk7XG5cbiAgICAgICAgICAgIGN0cmwuYm9keS5jbGFzc05hbWUgPSBjdHJsLmJvZHlUb2dnbGVGb3JOYXYoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LW5hdicsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1uYXYtd3JhcHBlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbmF2Lnctc2VjdGlvbi5kYXNoYm9hcmQtbmF2LnNpZGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmsudy1pbmxpbmUtYmxvY2suZGFzaGJvYXJkLXByb2plY3QtbmFtZVtocmVmPVwiJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcvJyArIHByb2plY3QucGVybWFsaW5rIDogZWRpdFJvdXRlICsgJyNwcmV2aWV3JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LWRhc2hib2FyZFtzcmM9XCInICsgKF8uaXNOdWxsKHByb2plY3QubGFyZ2VfaW1hZ2UpID8gJy9hc3NldHMvdGh1bWItcHJvamVjdC5wbmcnIDogcHJvamVjdC5sYXJnZV9pbWFnZSkgKyAnXCJdW3dpZHRoPVwiMTE0XCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS5saW5laGVpZ2h0LXRpZ2h0LmZvbnRzaXplLXNtYWxsJywgcHJvamVjdC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjaW5mby1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9ob21lX2xpbmtbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKGgubG9jYXRpb25BY3Rpb25NYXRjaCgnaW5zaWdodHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCInICsgcHJvamVjdFJvdXRlICsgJy9pbnNpZ2h0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXItY2hhcnQuZmEtbGcuZmEtZncnKSwgJyBNaW5oYSBDYW1wYW5oYSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEuZmEtdGFibGUuZmEtbGcuZmEtZncnKSwgJyBSZWxhdMOzcmlvcyBkZSBhcG9pb3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQudS1tYXJnaW5ib3R0b20tMzBbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Bvc3RzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksICcgTm92aWRhZGVzICcsIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1wZW5jaWwuZmEtZncuZmEtbGcnKSwgJyBFZGl0YXIgcHJvamV0bydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSksIChjdHJsLmVkaXRMaW5rc1RvZ2dsZSgpID8gbSgnI2VkaXQtbWVudS1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNiYXNpY3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYmFzaWNzJyArICdcIl0nLCAnQsOhc2ljbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLCAnTWV0YSBlIHByYXpvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkZXNjcmlwdGlvbl9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNkZXNjcmlwdGlvbicgKyAnXCJdJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI3ZpZGVvX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ZpZGVvJyArICdcIl0nLCAnVsOtZGVvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX2Fib3V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfYWJvdXQnICsgJ1wiXScsICdTb2JyZSB2b2PDqicpLCAoKHByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcpIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX3NldHRpbmdzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfc2V0dGluZ3MnICsgJ1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSwgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ByZXZpZXcnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mdy5mYS1leWUuZmEtbGcnKSwgJyBQcmV2aWV3J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsICdFbnZpYXInKSA6ICcnKSwgKHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3B1Ymxpc2hcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLmJ0bi1kYXNoYm9hcmQgaHJlZj1cImpzOnZvaWQoMCk7XCInLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuYm9keVRvZ2dsZUZvck5hdi50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFycy5mYS1sZycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wYWdlLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXIuZm9udHdlaWdodC1zZW1pYm9sZC5wcm9qZWN0LW5hbWVbaXRlbXByb3A9XCJuYW1lXCJdJywgcHJvamVjdC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BvciAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1tYWluJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnByb2plY3QtaGlnaGxpZ2h0JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGlnaGxpZ2h0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBtLmNvbXBvbmVudChjLlByb2plY3RTaWRlYmFyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGlnaGxpZ2h0JywgW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCA/IG0oJy53LWVtYmVkLnctdmlkZW8ucHJvamVjdC12aWRlbycsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdtaW4taGVpZ2h0OiAyNDBweDsnXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWUuZW1iZWRseS1lbWJlZFtpdGVtcHJvcD1cInZpZGVvXCJdW3NyYz1cIicgKyBwcm9qZWN0LnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3Qub3JpZ2luYWxfaW1hZ2UgKyAnKTsnXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWJsdXJiJywgcHJvamVjdC5oZWFkbGluZSksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKCFfLmlzTnVsbChwcm9qZWN0LmFkZHJlc3MpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodC51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiL3B0L2V4cGxvcmUjbmVhcl9vZi8ke3Byb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXInKSwgYCAke3Byb2plY3QuYWRkcmVzcy5jaXR5fSwgJHtwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bX1gXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodFtocmVmPVwiL3B0L2V4cGxvcmUjYnlfY2F0ZWdvcnlfaWQvJHtwcm9qZWN0LmNhdGVnb3J5X2lkfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdGFnJyksICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuY2F0ZWdvcnlfbmFtZVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI3NoYXJlLWJveC5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wYXJ0aWxoYXInKSwgKGN0cmwuZGlzcGxheVNoYXJlQm94KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3RTaGFyZUJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogY3RybC5kaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9ICgobSwgYywgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBjX29wdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY19vcHRzKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29tbWVudHMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzWycjYWJvdXQnXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgbS5yZWRyYXcsIGZhbHNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudDogZGlzcGxheVRhYkNvbnRlbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzZWN0aW9uLnNlY3Rpb25baXRlbXR5cGU9XCJodHRwOi8vc2NoZW1hLm9yZy9DcmVhdGl2ZVdvcmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBjdHJsLmRpc3BsYXlUYWJDb250ZW50KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFBvc3RzID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdFZNID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0UG9zdERldGFpbCksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXBvc3RzLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNFbXB0eShsaXN0LmNvbGxlY3Rpb24oKSkgPyBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMC51LW1hcmdpbnRvcC0yMCcsICdUb2RhIG5vdmlkYWRlIHB1YmxpY2FkYSBubyBDYXRhcnNlIMOpIGVudmlhZGEgZGlyZXRhbWVudGUgcGFyYSBvIGVtYWlsIGRlIHF1ZW0gasOhIGFwb2lvdSBzZXUgcHJvamV0byBlIHRhbWLDqW0gZmljYSBkaXNwb27DrXZlbCBwYXJhIHZpc3VhbGl6YcOnw6NvIG5vIHNpdGUuIFZvY8OqIHBvZGUgb3B0YXIgcG9yIGRlaXjDoS1sYSBww7pibGljYSwgb3Ugdmlzw612ZWwgc29tZW50ZSBwYXJhIHNldXMgYXBvaWFkb3JlcyBhcXVpIG5lc3RhIGFiYS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyksIChfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wb3N0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIHBvc3QudGl0bGUpLCAoIV8uaXNFbXB0eShwb3N0LmNvbW1lbnRfaHRtbCkgPyBtKCcuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocG9zdC5jb21tZW50X2h0bWwpKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgJ1Bvc3QgZXhjbHVzaXZvIHBhcmEgYXBvaWFkb3Jlcy4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tNjAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ1VtIGxlbWJyZXRlIHBvciBlbWFpbCDDqSBlbnZpYWRvIDQ4IGhvcmFzIGFudGVzIGRvIHTDqXJtaW5vIGRhIHN1YSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UmVtaW5kZXIgPSAoKG0sIG1vZGVscywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBpblJlbWluZGVyID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdG9yZVJlbWluZGVyTmFtZSA9ICdyZW1pbmRfJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoLmdldFVzZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5zdG9yZUFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubmF2aWdhdGVUb0RldmlzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2FkZXJPcHRzID0gaW5SZW1pbmRlcigpID8gbW9kZWxzLnByb2plY3RSZW1pbmRlci5kZWxldGVPcHRpb25zKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkgOiBtb2RlbHMucHJvamVjdFJlbWluZGVyLnBvc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6IHByb2plY3QuaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obG9hZGVyT3B0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpblJlbWluZGVyLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5SZW1pbmRlcigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBoLmNhbGxTdG9yZWRBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQocHJvamVjdC5pZCk7XG4gICAgICAgICAgICBpblJlbWluZGVyKHByb2plY3QuaW5fcmVtaW5kZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGluUmVtaW5kZXI6IGluUmVtaW5kZXIsXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXI6IHN1Ym1pdFJlbWluZGVyLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uOiBwb3BOb3RpZmljYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b25bY2xhc3M9XCJidG4tbGluayBsaW5rLWhpZGRlbiBmb250c2l6ZS1zbWFsbCAnICsgKGN0cmwuaW5SZW1pbmRlcigpID8gJ2xpbmstaGlkZGVuLXN1Y2Nlc3MnIDogJ2ZvbnRjb2xvci1zZWNvbmRhcnknKSArICcgZm9udHdlaWdodC1zZW1pYm9sZFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zdWJtaXRSZW1pbmRlclxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpID8gJ2FndWFyZGUgLi4uJyA6IG0oJ3NwYW4uZmEuZmEtY2xvY2stbycsIGN0cmwuaW5SZW1pbmRlcigpID8gJyBMZW1icmV0ZSBhdGl2bycgOiAnIExlbWJyYXItbWUnKSlcbiAgICAgICAgICAgICAgICBdKSwgKGN0cmwucG9wTm90aWZpY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlBvcE5vdGlmaWNhdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnT2shIFZhbW9zIHRlIG1hbmRhciB1bSBsZW1icmV0ZSBwb3IgZS1tYWlsIDQ4IGhvcmFzIGFudGVzIGRvIGZpbSBkYSBjYW1wYW5oYSdcbiAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFJld2FyZExpc3QgPSAoKG0sIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAgICAgICAvLyAtIGFkZCBkcmFmdCBhZG1pbiBtb2RpZmljYXRpb25zXG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGFyZ3MucmV3YXJkRGV0YWlscygpLCAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ldz9yZXdhcmRfaWQ9JyArIHJld2FyZC5pZDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyAnY2FyZC1nb25lJyA6ICdjYXJkLXJld2FyZCAnICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdjbGlja2FibGUnIDogJycpKSArICcgY2FyZCBjYXJkLXNlY29uZGFyeSB1LW1hcmdpbmJvdHRvbS0xMFwiXVtocmVmPVwiJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUGFyYSBSJCAnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUpICsgJyBvdSBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgaC5wbHVyYWxpemUocmV3YXJkLnBhaWRfY291bnQsICcgYXBvaWFkb3InLCAnIGFwb2lhZG9yZXMnKSksIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCA+IDAgPyBtKCcubWF4aW11bV9jb250cmlidXRpb25zLmluX3RpbWVfdG9fY29uZmlybS5jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICgnICsgaC5yZXdhcmRSZW1hbmluZyhyZXdhcmQpICsgJyBkZSAnICsgcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyArICcgZGlzcG9uw612ZWlzKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbnRvcC0yMCcsIG0udHJ1c3QoaC5zaW1wbGVGb3JtYXQocmV3YXJkLmRlc2NyaXB0aW9uKSkpLCAoIV8uaXNFbXB0eShyZXdhcmQuZGVsaXZlcl9hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYicsICdFc3RpbWF0aXZhIGRlIEVudHJlZ2E6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtc2VsZWN0LXRleHQudS10ZXh0LWNlbnRlcicsICdTZWxlY2lvbmUgZXNzYSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0pID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIHJlZiA9IGFyZ3MucmVmO1xuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCA+IDAgPyBtKCcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtbG9vc2VyJywgY29sbGVjdGlvbi50aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeVtocmVmPVwiL3B0L2V4cGxvcmU/cmVmPSR7cmVmfSMke2NvbGxlY3Rpb24uaGFzaH1cIl1gLCAnVmVyIHRvZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSA6IG0oJycpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaGFyZUJveCA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVtYmVkOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5wb3Atc2hhcmUnLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OiBibG9jazsnXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZS51LXJpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdGZWNoYXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtZmFjZWJvb2sudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjE1MHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS92Mi4wL3BsdWdpbnMvc2hhcmVfYnV0dG9uLnBocD9hcHBfaWQ9MTczNzQ3MDQyNjYxNDkxJmNoYW5uZWw9aHR0cHMlM0ElMkYlMkZzLXN0YXRpYy5hay5mYWNlYm9vay5jb20lMkZjb25uZWN0JTJGeGRfYXJiaXRlciUyRjQ0T3dLNzR1MEllLmpzJTNGdmVyc2lvbiUzRDQxJTIzY2IlM0RmN2Q5YjkwMGMlMjZkb21haW4lM0R3d3cuY2F0YXJzZS5tZSUyNm9yaWdpbiUzRGh0dHBzJTI1M0ElMjUyRiUyNTJGd3d3LmNhdGFyc2UubWUlMjUyRmY0YjNhZDBjOCUyNnJlbGF0aW9uJTNEcGFyZW50LnBhcmVudCZjb250YWluZXJfd2lkdGg9MCZocmVmPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJyUzRnJlZiUzRGZhY2Vib29rJmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPXB0X0JSJnNkaz1qb2V5XCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9XCJ0cnVlXCJdW3dpZHRoPVwiMTIwcHhcIl1baGVpZ2h0PVwiMjJweFwiXVtmcmFtZWJvcmRlcj1cIjBcIl1bc2Nyb2xsaW5nPVwibm9cIl1bc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzL3R3ZWV0X2J1dHRvbi44ZDAwN2RkZmMxODRlNjc3NmJlNzZmZTllNWU1MmQ2OS5lbi5odG1sI189MTQ0MjQyNTk4NDkzNiZjb3VudD1ob3Jpem9udGFsJmRudD1mYWxzZSZpZD10d2l0dGVyLXdpZGdldC0xJmxhbmc9ZW4mb3JpZ2luYWxfcmVmZXJlcj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICcmc2l6ZT1tJnRleHQ9Q29uZmlyYSUyMG8lMjBwcm9qZXRvJTIwJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyUyMG5vJTIwJTQwY2F0YXJzZSZ0eXBlPXNoYXJlJnVybD1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0R0d2l0dGVyJnZpYT1jYXRhcnNlXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLXNtYWxsLndpZGdldC1lbWJlZC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlFbWJlZC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnPCBlbWJlZCA+JyksIChjdHJsLmRpc3BsYXlFbWJlZCgpID8gbSgnLmVtYmVkLWV4cGFuZGVkLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0W3R5cGU9XCJ0ZXh0XCJdW3ZhbHVlPVwiPGlmcmFtZSBmcmFtZWJvcmRlcj1cIjBcIiBoZWlnaHQ9XCIzMTRweFwiIHNyYz1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtZW1iZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0LmlkICsgJy9lbWJlZFwiXVt3aWR0aD1cIjMwMHB4XCJdW3Njcm9sbGluZz1cIm5vXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi1mYi51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGFyZ3MucHJvamVjdC5uYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZmFjZWJvb2snKSwgJyBDb21wYXJ0aWxoZSdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9QWNhYmVpIGRlIGFwb2lhciBvIHByb2pldG8gJyArIGFyZ3MucHJvamVjdC5uYW1lICsgJyBodHRzOi8vd3d3LmNhdGFyc2UubWUvJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnP3JlZj10d2l0dGVyclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCAnIFR3ZWV0J1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoZnVuY3Rpb24obSwgaCwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3Quc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogJ0Vzc2UgcHJvamV0byBqw6EgZm9pIGFwcm92YWRvIHBlbG8gQ2F0YXJzZS4gRW0gYnJldmUgZWxlIGVudHJhcsOhIG5vIGFyIGUgZXN0YXLDoSBwcm9udG8gcGFyYSByZWNlYmVyIGFwb2lvcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29ubGluZSc6ICdWb2PDqiBwb2RlIGFwb2lhciBlc3RlIHByb2pldG8gYXTDqSBvIGRpYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpICsgJyDDoHMgMjNoNTltNTlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmYWlsZWQnOiAnRXN0ZSBwcm9qZXRvIG7Do28gYXRpbmdpdSBvIG3DrW5pbW8gZGUgUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkgKyAnIGF0w6kgJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSArICcgZSBuw6NvIGZvaSBmaW5hbmNpYWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZWplY3RlZCc6ICdFc3RlIHByb2pldG8gbsOjbyBmb2kgYWNlaXRvLiBOw6NvIMOpIHBvc3PDrXZlbCByZWFsaXphciB1bSBhcG9pby4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ0VzdGUgcHJvamV0byBlc3TDoSBlbSBhbsOhbGlzZSBlIGFpbmRhIG7Do28gZXN0w6EgYWJlcnRvIHBhcmEgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ0VzdGUgcHJvamV0byBmb2kgYmVtLXN1Y2VkaWRvIGUgZm9pIGZpbmFuY2lhZG8gZW0gJyArIGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ08gcHJhem8gZGUgY2FwdGHDp8OjbyBkZXNzZSBwcm9qZXRvIGVzdMOhIGVuY2VycmFkby4gRXN0YW1vcyBhZ3VhcmRhbmRvIGEgY29uZmlybWHDp8OjbyBkb3Mgw7psdGltb3MgcGFnYW1lbnRvcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogJ0VzdGUgcHJvamV0byDDqSBhcGVuYXMgdW0gcmFzY3VuaG8gZSBhaW5kYSBuw6NvIHBvZGUgcmVjZWJlciBhcG9pb3MuJyxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3Quc3RhdGVdO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzczogZGlzcGxheUNhcmRDbGFzcyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dDogZGlzcGxheVN0YXR1c1RleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgdGltZU9iaiA9IGguZ2VuZXJhdGVSZW1haW5nVGltZShwcm9qZWN0KSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY2xlYXJmaXgudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtdGlueS02LnctY29sLXNtYWxsLTQuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsICdhdGluZ2lkb3MgZGUgUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC10aW55LTMudy1jb2wtc21hbGwtNC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ2Fwb2lvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC10aW55LTMudy1jb2wtc21hbGwtNC51LW1hcmdpbmJvdHRvbS0xMC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgKHByb2plY3QuaXNfcHVibGlzaGVkID8gdGltZU9iai50b3RhbCA6IChwcm9qZWN0Lm9ubGluZV9kYXlzIHx8IDApKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbltzdHlsZT1cInRleHQtdHJhbnNmb3JtOmNhcGl0YWxpemU7XCJdJywgKHByb2plY3QuaXNfcHVibGlzaGVkID8gdGltZU9iai51bml0IDogJ2RpYXMnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0aW1lT2JqLnRvdGFsID4gMSkgPyAnIHJlc3RhbnRlcycgOiAnIHJlc3RhbnRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJ2EjY29udHJpYnV0ZV9wcm9qZWN0X2Zvcm0uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsICdBcG9pYXIgZXN0ZSBwcm9qZXRvJykgOiAnJyksICgocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdkaXZbY2xhc3M9XCJmb250c2l6ZS1zbWFsbGVyIHUtbWFyZ2luYm90dG9tLTMwICcgKyAoY3RybC5kaXNwbGF5Q2FyZENsYXNzKCkpICsgJ1wiXScsIGN0cmwuZGlzcGxheVN0YXR1c1RleHQoKSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudXNlci1jJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0VXNlckNhcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3MudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VGFicyA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24ucHJvamVjdC1uYXYubWYnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNyZXdhcmRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Jld2FyZHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJhYm91dC1saW5rXCJdW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnU29icmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicG9zdHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcG9zdHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcG9zdHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdmlkYWRlcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29udHJpYnV0aW9ucy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQXBvaW9zICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2Uudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29tbWVudHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29tbWVudHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29tbWVudHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWVudMOhcmlvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdmYjpjb21tZW50cy1jb3VudFtocmVmPVwiaHR0cDovL3d3dy5jYXRhcnNlLm1lLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl1bY2xhc3M9XCJiYWRnZSBwcm9qZWN0LWZiLWNvbW1lbnQgdy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueVwiXVtzdHlsZT1cImRpc3BsYXk6IGlubGluZVwiXScsIG0udHJ1c3QoJyZuYnNwOycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cIm5hbWVcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi91c2Vycy8nICsgdXNlckRldGFpbC5pZCArICdcIl0nLCB1c2VyRGV0YWlsLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cywgJyBjcmlhZG8nLCAnIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7Jm5ic3A7fCZuYnNwOyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzLCAnIGFwb2lhZG8nLCAnIGFwb2lhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCd1bC53LWhpZGRlbi10aW55LnctaGlkZGVuLXNtYWxsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAodXNlckRldGFpbC5saW5rcywgKGxpbmspID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWRMaW5rID0gaC5wYXJzZVVybChsaW5rKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KHBhcnNlZExpbmsuaG9zdG5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHBhcnNlZExpbmsuaG9zdG5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5hbHQtbGluay5mb250d2VpZ2h0LXNlbWlib2xkW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgdXNlckRldGFpbC5lbWFpbCkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtTWVtYmVyLmdldFBhZ2UoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGdyb3VwQ29sbGVjdGlvbihkYXRhLCA0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnRlYW0tbWVtYmVyLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvdXNlcnMvJyArIG1lbWJlci5pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vc3NhIGVxdWlwZSwganVudGEsIGrDoSBhcG9pb3UgUiQnICsgaC5mb3JtYXROdW1iZXIodGVhbVRvdGFsLnRvdGFsX2Ftb3VudCkgKyAnIHBhcmEgJyArIHRlYW1Ub3RhbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5Vc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgICAgICB2bS5pZChhcmdzLnVzZXJJZCk7XG5cbiAgICAgICAgICAgIC8vRklYTUU6IGNhbiBjYWxsIGFub24gcmVxdWVzdHMgd2hlbiB0b2tlbiBmYWlscyAocmVxdWVzdE1heWJlV2l0aFRva2VuKVxuICAgICAgICAgICAgbW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbih1c2VyRGV0YWlscyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LncuY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyW2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhZGRyZXNzXCJdJywgdXNlckRldGFpbC5hZGRyZXNzX2NpdHkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hdXRob3ItY29udGFjdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd1bC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIGxpbmspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tbWVzc2FnZVtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLkxpdmVTdGF0aXN0aWNzID0gKChtLCBtb2RlbHMsIGgsIF8sIEpTT04pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFnZVN0YXRpc3RpY3MgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgLy8gYXJncy5zb2NrZXQgaXMgYSBzb2NrZXQgcHJvdmlkZWQgYnkgc29ja2V0LmlvXG4gICAgICAgICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgICAgICAgIGlmIChhcmdzLnNvY2tldCAmJiBfLmlzRnVuY3Rpb24oYXJncy5zb2NrZXQub24pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5zb2NrZXQub24oJ25ld19wYWlkX2NvbnRyaWJ1dGlvbnMnLCAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25EYXRhOiBub3RpZmljYXRpb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBjdHJsLm5vdGlmaWNhdGlvbkRhdGEoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uYmctc3RhdHMuc2VjdGlvbi5taW4taGVpZ2h0LTEwMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdpbWcudS1tYXJnaW5ib3R0b20tNjBbc3JjPVwiaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NWFkYTVkZDExYjM2YTUyNjE2ZDk3ZGZfc3ltYm9sLWNhdGFyc2UucG5nXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcyBwdWJsaWNhZG9zIHBvciBhcXVpJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBzdGF0LnRvdGFsX2NvbnRyaWJ1dG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ1Blc3NvYXMgasOhIGFwb2lhcmFtIHBlbG8gbWVub3MgMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9KSksICghXy5pc0VtcHR5KGRhdGEpID8gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS02MC5tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS51c2VyX25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnYWNhYm91IGRlIGFwb2lhciBvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz1cIicgKyBkYXRhLnByb2plY3RfaW1hZ2UgKyAnXCJdW3dpZHRoPVwiNzVcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLmZvbnRjb2xvci1uZWdhdGl2ZVtocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2VcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1naXRodWInLCAnLicpLCAnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwid2luZG93LmMucGFnZXMuVGVhbSA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLmNvbnRyaWJ1dGlvbkZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9mdWxsX3RleHRfaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3N0YXRlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb20gbyBlc3RhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGFpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGFpZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVzZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVzZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmdfcmVmdW5kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdW5kZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3JlZnVuZGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnY2hhcmdlYmFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnY2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2RlbGV0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2dhdGV3YXlcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BhZ2FybWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BhZ2FybWUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdNb0lQJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdNb0lQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGF5UGFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYXlQYWwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdDcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdDcsOpZGl0b3MnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL3ZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck51bWJlclJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWYWxvcmVzIGVudHJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS52YWx1ZS5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9jcmVhdGVkX2F0XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRhdGVSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGVyw61vZG8gZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5sdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Fwb2lvcydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlciwge1xuICAgICAgICAgICAgICAgICAgICBmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHZtOiBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Db250cmlidXRpb25JdGVtLFxuICAgICAgICAgICAgICAgICAgICBsaXN0RGV0YWlsOiBjLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmFkbWluLlVzZXJzID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxpc3RWTSA9IGFkbWluLnVzZXJMaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi51c2VyRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vbmFtZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBub21lLCBlLW1haWwsIElkcyBkbyB1c3XDoXJpby4uLicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSAnVXN1w6FyaW9zJztcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Vc2VySXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuY29udHJpYnV0aW9uLlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgdm0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkQ29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgcmVjZW50Q29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgbmVhck1lQ29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJpbmdDb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYy5tb2RlbHMucHJvamVjdCxcblxuICAgICAgICAgICAgICAgIGV4cGlyaW5nID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlc19hdDogJ2x0ZScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbmVhck1lID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgbmVhcl9tZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICByZWNlbnRzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgb25saW5lX2RhdGU6ICdndGUnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGV4cGlyaW5nLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcbiAgICAgICAgICAgIGV4cGlyaW5nLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgbmVhck1lLm5lYXJfbWUoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgICAgICAgIHJlY2VudHMub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNSwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICAgICAgICAgICByZWNlbnRzLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgcmVjb21tZW5kZWQucmVjb21tZW5kZWQoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgICAgICAgIGxldCBuZWFyTWVMb2FkZXIgPSBsb2FkZXJXaXRoVG9rZW4ocHJvamVjdC5nZXRQYWdlT3B0aW9ucyhuZWFyTWUucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBuZWFyTWVMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHZtLm5lYXJNZUNvbGxlY3Rpb24sIHNhbXBsZTMpKTtcbiAgICAgICAgICAgIGxldCByZWNvbW1lbmRlZExvYWRlciA9IGxvYWRlcihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKHJlY29tbWVuZGVkLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgcmVjb21tZW5kZWRMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHZtLnJlY29tbWVuZGVkQ29sbGVjdGlvbiwgc2FtcGxlMykpO1xuICAgICAgICAgICAgbGV0IHJlY2VudExvYWRlciA9IGxvYWRlcihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKHJlY2VudHMucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICByZWNlbnRMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHZtLnJlY2VudENvbGxlY3Rpb24sIHNhbXBsZTMpKTtcbiAgICAgICAgICAgIGxldCBleHBpcmluZ0xvYWRlciA9IGxvYWRlcihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKGV4cGlyaW5nLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgZXhwaXJpbmdMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHZtLmV4cGlyaW5nQ29sbGVjdGlvbiwgc2FtcGxlMykpO1xuXG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbnMgPSBbe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgdm9jw6onLFxuICAgICAgICAgICAgICAgIGhhc2g6ICduZWFyX29mJyxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB2bS5uZWFyTWVDb2xsZWN0aW9uXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdyZWNvbW1lbmRlZCcsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdOYSByZXRhIGZpbmFsJyxcbiAgICAgICAgICAgICAgICBoYXNoOiAnZXhwaXJpbmcnLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHZtLmV4cGlyaW5nQ29sbGVjdGlvblxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjZW50ZXMnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdyZWNlbnQnLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHZtLnJlY2VudENvbGxlY3Rpb25cbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9ucyxcbiAgICAgICAgICAgICAgICBuZWFyTWVMb2FkZXI6IG5lYXJNZUxvYWRlcixcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRlZExvYWRlcjogcmVjb21tZW5kZWRMb2FkZXIsXG4gICAgICAgICAgICAgICAgZXhwaXJpbmdMb2FkZXI6IGV4cGlyaW5nTG9hZGVyLFxuICAgICAgICAgICAgICAgIHJlY2VudExvYWRlcjogcmVjZW50TG9hZGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNMb2FkaW5nID0gbS5wcm9wKGN0cmwubmVhck1lTG9hZGVyKCkgfHwgY3RybC5yZWNvbW1lbmRlZExvYWRlcigpIHx8IGN0cmwuZXhwaXJpbmdMb2FkZXIoKSB8fCBjdHJsLnJlY2VudExvYWRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiAoIWlzTG9hZGluZygpKSA/IF8ubWFwKGN0cmwuY29sbGVjdGlvbnMsIChjb2xsZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICByZWY6IGBob21lXyR7Y29sbGVjdGlvbi5oYXNofWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5tb21lbnQsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5wcm9qZWN0Lkluc2lnaHRzID0gKGZ1bmN0aW9uKG0sIGMsIG1vZGVscywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgICAgICAgbW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbihwcm9qZWN0RGV0YWlscyk7XG4gICAgICAgICAgICBtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93KHZtLnBhcmFtZXRlcnMoKSkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXk6IGNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnByb2plY3REZXRhaWxzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCAnTWluaGEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoZnVuY3Rpb24ocHJvamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDaGFydENvbnRyaWJ1dGlvblRvdGFsUGVyRGF5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWluLWhlaWdodCc6ICczMDBweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2hhcnRDb250cmlidXRpb25BbW91bnRQZXJEYXksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IGN0cmwudm0ucHJvamVjdF9pZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KHByb2plY3QpKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnByb2plY3QuU2hvdyA9ICgobSwgYywgXywgbW9kZWxzLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGlkVk0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnByb2plY3RfaWQpO1xuICAgICAgICAgICAgaWRWTS5pZChhcmdzLnByb2plY3RfdXNlcl9pZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxQcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnModm0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgbFVzZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyhpZFZNLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgbFByb2plY3QubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgbFJld2FyZC5sb2FkKCkudGhlbihyZXdhcmREZXRhaWxzKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlscyxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0OiBsUHJvamVjdCxcbiAgICAgICAgICAgICAgICBsVXNlcjogbFVzZXIsXG4gICAgICAgICAgICAgICAgbFJld2FyZDogbFJld2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICghY3RybC5sUHJvamVjdCgpKSA/IF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLm1peHBhbmVsVHJhY2soKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKCFjdHJsLmxVc2VyKCkpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGN0cmwudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RUYWJzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgIH0pLCAoIWN0cmwubFJld2FyZCgpKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLCAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgc3RhdGU6ICdlcScsXG4gICAgICAgICAgICBnYXRld2F5OiAnZXEnLFxuICAgICAgICAgICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICAgICAgICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLnN0YXRlKCcnKTtcbiAgICB2bS5nYXRld2F5KCcnKTtcbiAgICB2bS5vcmRlcih7XG4gICAgICAgIGlkOiAnZGVzYydcbiAgICB9KTtcblxuICAgIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICAgIH07XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsKTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckZpbHRlclZNID0gKGZ1bmN0aW9uKG0sIHJlcGxhY2VEaWFjcml0aWNzKSB7XG4gICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnVzZXJEZXRhaWwpO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=