/** global CatarseAnalytics */
import m from 'mithril';
import _ from 'underscore';
import h from './h';
import c from './c';

let app = document.getElementById('application');
let body = document.body;

export function wrap(component, customAttr) {
    if (!app) {
        app = document.getElementById('application');
    }

    let firstRun = true; // Indica se é a primeira vez q executa um controller.
    return {
        oninit: function (vnode) {

            try {
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
                    thankYouParam = app && JSON.parse(app.getAttribute('data-contribution'));
    
                const addToAttr = function (newAttr) {
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
            } catch(e) {
                console.log('Error on wrap.oninit:', e);
            }
        },
        oncreate: function(vnode) {
            const hasUnmanagedRootComponent = app && 
                app.children.app &&
                app.children.length > 1;

            const removeUnmanagedRootComponentFromDom = () => {
                app.removeChild(app.children.app);
            };

            if (hasUnmanagedRootComponent) {
                removeUnmanagedRootComponentFromDom();
            }
        },
        view: function ({ state }) {
            const key = 0;
            try {
                return m('div#app', {key}, [
                    m(c.root.Menu, state.attr),
                    h.getUserID() ? m(c.root.CheckEmail, state.attr) : '',
                    m(component, state.attr),
                    state.attr.hideFooter ? '' : m(c.root.Footer, state.attr),
                ]);
            } catch(e) {
                console.log('Error on wrap.view:', e);
                return m('div#app', {key});
            }
        }
    };
}