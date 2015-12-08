window.c.h = ((m, moment, I18n) => {
    //Date Helpers

    const hashMatch = (str) => { return window.location.hash === str; },
        paramByName = (name) => {
            const normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
                regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
                results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        },
        setMomentifyLocale = () => {
            moment.locale('pt', {
                    monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
                });
        },
        existy = (x) => {
            return x != null;
        },

        momentify = (date, format) => {
            format = format || 'DD/MM/YYYY';
            return date ? moment(date).locale('pt').format(format) : 'no date';
        },

        storeAction = (action) => {
            if (!sessionStorage.getItem(action)) {
                return sessionStorage.setItem(action, action);
            }
        },

        callStoredAction = (action, func) => {
            if (sessionStorage.getItem(action)) {
                func.call();
                return sessionStorage.removeItem(action);
            }
        },

        discuss = (page, identifier) => {
            const d = document,
                s = d.createElement('script');
            window.disqus_config = function() {
                this.page.url = page;
                this.page.identifier = identifier;
            };
            s.src = '//catarseflex.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
            return m('');
        },

        momentFromString = (date, format) => {
            const european = moment(date, format || 'DD/MM/YYYY');
            return european.isValid() ? european : moment(date);
        },

        translatedTimeUnits = {
            days: 'dias',
            minutes: 'minutos',
            hours: 'horas',
            seconds: 'segundos'
        },
        //Object manipulation helpers
        translatedTime = (time) => {
            const translatedTime = translatedTimeUnits,
                unit = () => {
                    const projUnit = translatedTime[time.unit || 'seconds'];

                    return (time.total <= 1) ? projUnit.slice(0, -1) : projUnit;
                };

            return {
                unit: unit(),
                total: time.total
            };
        },

        //Number formatting helpers
        generateFormatNumber = (s, c) => {
            return (number, n, x) => {
                if (!_.isNumber(number)) {
                    return null;
                }

                const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
                    num = number.toFixed(Math.max(0, ~~n));
                return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
            };
        },
        formatNumber = generateFormatNumber('.', ','),

        toggleProp = (defaultState, alternateState) => {
            const p = m.prop(defaultState);
            p.toggle = () => {
                return p(((p() === alternateState) ? defaultState : alternateState));
            };

            return p;
        },

        idVM = m.postgrest.filtersVM({
            id: 'eq'
        }),

        getUser = () => {
            const body = document.getElementsByTagName('body'),
                data = _.first(body).getAttribute('data-user');
            if (data) {
                return JSON.parse(data);
            } else {
                return false;
            }
        },

        locationActionMatch = (action) => {
            const act = window.location.pathname.split('/').slice(-1)[0];
            return action === act;
        },

        useAvatarOrDefault = (avatarPath) => {
            return avatarPath || '/assets/catarse_bootstrap/user.jpg';
        },

        //Templates
        loader = () => {
            return m('.u-text-center.u-margintop-30 u-marginbottom-30', [
                m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')
            ]);
        },

        newFeatureBadge = () => {
            return m('span.badge.badge-success.margin-side-5', I18n.t('projects.new_feature_badge'));
        },

        fbParse = () => {
            const tryParse = () => {
                try {
                    window.FB.XFBML.parse();
                } catch (e) {
                    console.log(e);
                }
            };

            return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
        },

        pluralize = (count, s, p) => {
            return (count > 1 ? count + p : count + s);
        },

        simpleFormat = (str = '') => {
            str = str.replace(/\r\n?/, '\n');
            if (str.length > 0) {
                str = str.replace(/\n\n+/g, '</p><p>');
                str = str.replace(/\n/g, '<br />');
                str = '<p>' + str + '</p>';
            }
            return str;
        },

        rewardSouldOut = (reward) => {
            return (reward.maximum_contributions > 0 ?
                (reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions) : false);
        },

        rewardRemaning = (reward) => {
            return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
        },

        parseUrl = (href) => {
            const l = document.createElement('a');
            l.href = href;
            return l;
        },

        mixpanelTrack = () => {
            return (el, isInitialized) => {
                if (!isInitialized) {
                    window.CatarseMixpanel.activate();
                }
            };
        },

        UIHelper = () => {
            return (el, isInitialized) => {
                if (!isInitialized && $) {
                    window.UIHelper.setupResponsiveIframes($(el));
                }
            };
        },

        toAnchor = () => {
            return (el, isInitialized) => {
                if (!isInitialized){
                    const hash = window.location.hash.substr(1);
                    if (hash === el.id) {
                        window.location.hash = '';
                        setTimeout(function(){
                            window.location.hash = el.id;
                        });
                    }
                }
            };
        },

        validateEmail = (email) => {
            const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(email);
        },

        navigateToDevise = () => {
            window.location.href = '/pt/login';
            return false;
        },

        cumulativeOffset = (element) => {
            let top = 0, left = 0;
            do {
                top += element.offsetTop  || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);

            return {
                top: top,
                left: left
            };
        },

        closeFlash = () => {
            let el = document.getElementsByClassName('icon-close')[0];
            if (_.isElement(el)){
                el.onclick = (event) => {
                    event.preventDefault();

                    el.parentElement.remove();
                };
            };
        },

        i18nScope = (scope, obj) => {
            obj = obj || {};
            return _.extend({}, obj, {scope: scope});
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
}(window.m, window.moment, window.I18n));
