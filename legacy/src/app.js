import m from 'mithril';
import h from './h';
import _ from 'underscore';
import c from './c';
import Chart from 'chart.js';
import { isNumber } from 'util';

(function() {
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.responsive = false;
    Chart.defaults.global.scaleFontFamily = 'proxima-nova';

    // NOTE: comment when need to use multilanguage i18n support
    window.I18n.defaultLocale = 'pt';
    window.I18n.locale = 'pt';

    const adminRoot = document.getElementById('new-admin');

    if (adminRoot) {
        const adminWrap = function(component, customAttr) {
            return {
                oninit: function(vnode) {
                    const attr = customAttr;

                    vnode.state = {
                        attr,
                    };
                },
                view: function({ state }) {
                    const { attr } = state;
                    return m('#app', [m(c.root.Menu, attr), m(component, attr), attr.hideFooter ? '' : m(c.root.Footer, attr)]);
                },
            };
        };
        m.route.prefix('#');

        m.route(adminRoot, '/', {
            '/': adminWrap(c.root.AdminContributions, { root: adminRoot, menuTransparency: false, hideFooter: true }),
            '/users': adminWrap(c.root.AdminUsers, { menuTransparency: false, hideFooter: true }),
            '/subscriptions': adminWrap(c.root.AdminSubscriptions, { menuTransparency: false, hideFooter: true }),
            '/projects': adminWrap(c.root.AdminProjects, { menuTransparency: false, hideFooter: true }),
            '/notifications': adminWrap(c.root.AdminNotifications, { menuTransparency: false, hideFooter: true }),
            '/balance-transfers': adminWrap(c.root.AdminBalanceTranfers, { menuTransparency: false, hideFooter: true }),
        });
    }

    const app = document.getElementById('application'),
        body = document.getElementsByTagName('body')[0];

    let firstRun = true; // Indica se é a primeira vez q executa um controller.
    const wrap = function(component, customAttr) {
        return {
            oninit: function(vnode) {
                if (firstRun) {
                    firstRun = false;
                } else {
                    // só roda se nao for firstRun
                    try {
                        CatarseAnalytics.pageView(false);
                        CatarseAnalytics.origin(); //force update of origin's cookie
                    } catch (e) {
                        console.error(e);
                    }
                }
                const parameters = app.getAttribute('data-parameters') ? JSON.parse(app.getAttribute('data-parameters')) : {};
                let attr = customAttr,
                    postParam = m.route.param('post_id') || parameters.post_id,
                    projectParam = m.route.param('project_id') || parameters.project_id,
                    projectUserIdParam = m.route.param('project_user_id') || parameters.user_id || parameters.project_user_id,
                    userParam = m.route.param('user_id') || app.getAttribute('data-userid') || parameters.user_id,
                    rewardIdParam = m.route.param('reward_id'),
                    surveyIdParam = m.route.param('survey_id'),
                    filterParam = m.route.param('filter'),
                    thankYouParam = app && JSON.parse(app.getAttribute('data-contribution'));

                const addToAttr = function(newAttr) {
                    attr = _.extend({}, newAttr, attr);
                };

                if (postParam) {
                    addToAttr({ post_id: postParam });
                }

                if (projectParam) {
                    addToAttr({ project_id: projectParam });
                }

                if (userParam) {
                    addToAttr({ user_id: userParam });
                }

                if (projectUserIdParam) {
                    addToAttr({ project_user_id: projectUserIdParam });
                }

                if (surveyIdParam) {
                    addToAttr({ survey_id: surveyIdParam });
                }

                if (rewardIdParam) {
                    addToAttr({ reward_id: rewardIdParam });
                }

                if (filterParam) {
                    addToAttr({ filter: filterParam });
                }

                if (thankYouParam) {
                    addToAttr({ contribution: thankYouParam });
                }

                if (window.localStorage && window.localStorage.getItem('globalVideoLanding') !== 'true') {
                    addToAttr({ withAlert: false });
                }

                if (document.getElementById('fixed-alert')) {
                    addToAttr({ withFixedAlert: true });
                }

                body.className = 'body-project closed';

                vnode.state.attr = attr;
            },
            view: function({ state }) {
                return m('#app', [
                    m(c.root.Menu, state.attr),
                    h.getUserID() ? m(c.root.CheckEmail, state.attr) : '',
                    m(component, state.attr),
                    state.attr.hideFooter ? '' : m(c.root.Footer, state.attr),
                ]);
            },
        };
    };

    const urlWithLocale = function(url) {
        return `/${window.I18n.locale}${url}`;
    };

    if (app) {
        const rootEl = app,
            isUserProfile =
                body.getAttribute('data-controller-name') == 'users' &&
                body.getAttribute('data-action') == 'show' &&
                app.getAttribute('data-hassubdomain') == 'true';

        m.route.prefix('');

        m.route(rootEl, '/', {
            '/': wrap(isUserProfile ? c.root.UsersShow : c.root.ProjectsHome, { menuTransparency: true, footerBig: true, absoluteHome: isUserProfile }),
            '/explore': wrap(c.root.ProjectsExplore, { menuTransparency: true, footerBig: true }),
            '/start': wrap(c.root.Start, { menuTransparency: true, footerBig: true }),
            '/start-sub': wrap(c.root.SubProjectNew, { menuTransparency: false }),
            '/projects/:project_id/contributions/new': wrap(c.root.ProjectsContribution),
            '/projects/:project_id/contributions/fallback_create': wrap(c.root.ProjectsContribution),
            '/projects/:project_id/contributions/:contribution_id/edit': wrap(c.root.ProjectsPayment, { menuShort: true }),
            '/projects/:project_id/subscriptions/start': wrap(c.root.ProjectsSubscriptionContribution, { menuShort: true, footerBig: false }),
            '/projects/:project_id/subscriptions/checkout': wrap(c.root.ProjectsSubscriptionCheckout, { menuShort: true, footerBig: false }),
            '/projects/:project_id/subscriptions/thank_you': wrap(c.root.ProjectsSubscriptionThankYou, { menuShort: true, footerBig: false }),
            [urlWithLocale('/projects/:project_id/contributions/new')]: wrap(c.root.ProjectsContribution),
            [urlWithLocale('/projects/:project_id/contributions/:contribution_id/edit')]: wrap(c.root.ProjectsPayment, { menuShort: true }),
            [urlWithLocale('/projects/:project_id/subscriptions/start')]: wrap(c.root.ProjectsSubscriptionContribution, { menuShort: true, footerBig: false }),
            [urlWithLocale('/projects/:project_id/subscriptions/checkout')]: wrap(c.root.ProjectsSubscriptionCheckout, { menuShort: true, footerBig: false }),
            [urlWithLocale('/projects/subscriptions/thank_you')]: wrap(c.root.ProjectsSubscriptionThankYou, { menuShort: true, footerBig: false }),
            '/en': wrap(c.root.ProjectsHome, { menuTransparency: true, footerBig: true }),
            '/pt': wrap(c.root.ProjectsHome, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/flexible_projects')]: wrap(c.root.ProjectsHome, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/projects')]: wrap(c.root.ProjectsHome, { menuTransparency: true, footerBig: true }),
            '/projects': wrap(c.root.ProjectsHome, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/explore')]: wrap(c.root.ProjectsExplore, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/start')]: wrap(c.root.Start, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/projects/:project_id/contributions/:contribution_id')]: wrap(c.root.ThankYou, { menuTransparency: false, footerBig: false }),
            '/projects/:project_id/contributions/:contribution_id': wrap(c.root.ThankYou, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/:project')]: wrap(c.root.ProjectsShow, { menuTransparency: false, footerBig: false }),
            '/projects/:project_id/insights': wrap(c.root.Insights, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/projects/:project_id/insights')]: wrap(c.root.Insights, { menuTransparency: false, footerBig: false }),
            '/projects/:project_id/contributions_report': wrap(c.root.ProjectsContributionReport, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/projects/:project_id/contributions_report')]: wrap(c.root.ProjectsContributionReport, {
                menuTransparency: false,
                footerBig: false,
            }),
            '/projects/:project_id/subscriptions_report': wrap(c.root.ProjectsSubscriptionReport, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/projects/:project_id/subscriptions_report')]: wrap(c.root.ProjectsSubscriptionReport, {
                menuTransparency: false,
                footerBig: false,
            }),
            '/projects/:project_id/subscriptions_report_download': wrap(c.root.ProjectsSubscriptionReportDownload, {
                menuTransparency: false,
                footerBig: false,
            }),
            [urlWithLocale('/projects/:project_id/subscriptions_report_download')]: wrap(c.root.ProjectsSubscriptionReportDownload, {
                menuTransparency: false,
                footerBig: false,
            }),
            '/projects/:project_id/surveys': wrap(c.root.Surveys, { menuTransparency: false, footerBig: false, menuShort: true }),
            '/projects/:project_id/fiscal': wrap(c.root.ProjectsFiscal, { menuTransparency: false, footerBig: false, menuShort: true }),
            '/projects/:project_id/posts': wrap(c.root.Posts, { menuTransparency: false, footerBig: false }),
            '/projects/:project_id/posts/:post_id': wrap(c.root.ProjectsShow, { menuTransparency: false, footerBig: true }),
            [urlWithLocale('/projects/:project_id/posts')]: wrap(c.root.Posts, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/projects/:project_id/posts/:post_id')]: wrap(c.root.ProjectsShow, { menuTransparency: false, footerBig: true }),
            '/projects/:project_id': wrap(c.root.ProjectsShow, { menuTransparency: false, footerBig: false }),
            '/users/:user_id': wrap(c.root.UsersShow, { menuTransparency: true, footerBig: false }),
            [urlWithLocale('/users/:user_id')]: wrap(c.root.UsersShow, { menuTransparency: true, footerBig: false }),
            '/contributions/:contribution_id/surveys/:survey_id': wrap(c.root.SurveysShow, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/contributions/:contribution_id/surveys/:survey_id')]: wrap(c.root.SurveysShow, { menuTransparency: false, footerBig: false }),
            '/users/:user_id/edit': wrap(c.root.UsersEdit, { menuTransparency: true, footerBig: false }),
            [urlWithLocale('/users/:user_id/edit')]: wrap(c.root.UsersEdit, { menuTransparency: true, footerBig: false }),
            '/projects/:project_id/edit': wrap(c.root.ProjectEdit, { menuTransparency: false, hideFooter: true, menuShort: true }),
            [urlWithLocale('/projects/:project_id/edit')]: wrap(c.root.ProjectEdit, { menuTransparency: false, hideFooter: true, menuShort: true }),
            '/projects/:project_id/rewards/:reward_id/surveys/new': wrap(c.root.SurveyCreate, { menuTransparency: false, hideFooter: true, menuShort: true }),
            [urlWithLocale('/follow-fb-friends')]: wrap(c.root.FollowFoundFriends, { menuTransparency: false, footerBig: false }),
            '/follow-fb-friends': wrap(c.root.FollowFoundFriends, { menuTransparency: false, footerBig: false }),
            '/:project': wrap(c.root.ProjectsShow, { menuTransparency: false, footerBig: false }),
            [urlWithLocale('/team')]: wrap(c.root.Team, { menuTransparency: true, footerBig: true }),
            '/team': wrap(c.root.Team, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/jobs')]: wrap(c.root.Jobs, { menuTransparency: true, footerBig: true }),
            '/jobs': wrap(c.root.Jobs, { menuTransparency: true, footerBig: true }),
            '/press': wrap(c.root.Press, { menuTransparency: true, footerBig: true }),
            [urlWithLocale('/press')]: wrap(c.root.Press, { menuTransparency: true, footerBig: true }),

            [urlWithLocale('/projects/:project_id/publish')]: wrap(c.root.Publish, { menuTransparency: false, hideFooter: true, menuShort: true }),
            ['/projects/:project_id/publish']: wrap(c.root.Publish, { menuTransparency: false, hideFooter: true, menuShort: true }),
        });
    }
})();
