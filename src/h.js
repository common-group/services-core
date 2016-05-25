import m from 'mithril';
import moment from 'moment';
import I18n from 'i18n-js';

const hashMatch = (str) => { return window.location.hash === str; },
    paramByName = (name) => {
        const normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
            regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
	selfOrEmpty = (obj, emptyState = '') => {
    return obj ? obj : emptyState;
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

    applyMonetaryMask = (number) => {
        let onlyNumbers = String(number).replace(/[^0-9]|[.,]/g, ""),
            integerPart = onlyNumbers.slice(0, onlyNumbers.length - 2),
            decimalPart = onlyNumbers.slice(onlyNumbers.length - 2);

        console.log("integerpart is ", integerPart);

        console.log("decimalPart is ", decimalPart);

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        console.log('OnlyNumbers is ', onlyNumbers);

        console.log('I will apply a mask and resulting in ', `${integerPart},${decimalPart}`);

        return `${integerPart},${decimalPart}`;
    },

    monetaryToFloat = (propValue) => {
        return parseFloat(propValue().replace('.', '').replace(',', '.'));
    },

    validateEmail = (email) => {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    },

    validationErrors = m.prop([]),

    resetValidations = () => validationErrors([]),

    validate = () => {
        const errorFields = m.prop([]);

        return {
            submit(fields, fn) {
                return () => {
                    resetValidations();

                    _.map(fields, field => {
                        if (field.rule === 'email') {
                            if (!validateEmail(field.prop())) {
                                validationErrors().push({field: field.prop, message: 'E-mail inválido.'});
                            }
                        }

                        if (field.rule === 'text') {
                            if (field.prop().trim() === '') {
                                validationErrors().push({field: field.prop, message: 'O campo não pode ser vazio.'});
                            }
                        }
                    });

                    return !validationErrors().length > 0 ? fn() : false;
                };
            },
            hasError(fieldProp) {
                return _.reduce(validationErrors(), (memo, fieldError) => fieldError.field() === fieldProp() || memo, false);
            }
        };
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

    idVM = postgrest.filtersVM({
        id: 'eq'
    }),

    getCurrentProject = () => {
        const root = document.getElementById('project-show-root'),
            data = root.getAttribute('data-parameters');
        if (data) {
            return JSON.parse(data);
        } else {
            return false;
        }
    },

    getRdToken = () => {
        const meta = _.first(document.querySelectorAll('[name=rd-token]'));

        return meta ? meta.content : undefined;
    },

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
    strip = (html) =>  {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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

    closeModal = () => {
        let el = document.getElementsByClassName('modal-close')[0];
        if (_.isElement(el)){
            el.onclick = (event) => {
                event.preventDefault();

                document.getElementsByClassName('modal-backdrop')[0].style.display = 'none';
            };
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
    },

    redrawHashChange = (before) => {
        const callback = _.isFunction(before) ?
                  () => {
                      before();
                      m.redraw();
                  } : m.redraw;

        window.addEventListener('hashchange', callback, false);
    },

    authenticityToken = () => {
        const meta = _.first(document.querySelectorAll('[name=csrf-token]'));
        return meta ? meta.content : undefined;
    },
    animateScrollTo = (el) => {
        let scrolled = window.scrollY;

        const offset = cumulativeOffset(el).top,
            duration = 300,
            dFrame = (offset - scrolled) / duration,
            //EaseInOutCubic easing function. We'll abstract all animation funs later.
            eased = (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            animation = setInterval(() => {
                let pos = eased(scrolled / offset) * scrolled;

                window.scrollTo(0, pos);

                if (scrolled >= offset) {
                    clearInterval(animation);
                }

                scrolled = scrolled + dFrame;
            }, 1);
    },
    scrollTo = () => {
        const setTrigger = (el, anchorId) => {
            el.onclick = () => {
                const anchorEl = document.getElementById(anchorId);

                if (_.isElement(anchorEl)) {
                    animateScrollTo(anchorEl);
                }

                return false;
            };
        };

        return (el, isInitialized) => {
            if (!isInitialized) {
                setTrigger(el, el.hash.slice(1));
            }
        };
    },

    RDTracker = (eventId) => {
        return (el, isInitialized) => {
            if (!isInitialized) {
                const integrationScript = document.createElement('script');
                integrationScript.type = 'text/javascript';
                integrationScript.id = 'RDIntegration';

                if (!document.getElementById(integrationScript.id)){
                    document.body.appendChild(integrationScript);
                    integrationScript.onload = () => RdIntegration.integrate(getRdToken(), eventId);
                    integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
                }

                return false;
            }
        };
    },

    analyticsEvent = (eventObj, fn=Function.prototype) => {
        //https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
        if (!eventObj){
            return fn;
        }

        const fireEvent = () => {
            try {
                var dataProject = eventObj.project ? {
                    project_id: eventObj.project.id,
                    category_id: eventObj.project.category_id,
                    state: eventObj.project.address && eventObj.project.address.state_acronym,
                    city: eventObj.project.address && eventObj.project.address.city
                } : null;
                var dataUser = eventObj.user ? {} : null;//TODO
                var data = _.extend({},dataProject, dataUser,eventObj.extraData);

                const ga = window.ga;
                if (typeof ga === 'function') {
                    //https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits#the_send_method
                    ga('send', 'event', eventObj.cat, eventObj.act, eventObj.lbl, {
                        nonInteraction: eventObj.nonInteraction !== false,
                        transport: 'beacon',
                    });
                }
            } catch (e) {
                console.error('[h.analytics.event] error:',e);
            }
        };

        return () => {
            fireEvent();
            fn();
        };
    },
    _analyticsOneTimeEventFired = {},
    analyticsOneTimeEvent = (eventObj, fn) => {
        if (!eventObj) {
            return fn;
        }

        const eventKey = _.compact([eventObj.cat,eventObj.act]).join('_');
        if (!eventKey) {
            throw new Error('Should inform cat or act');
        }
        const fireEvent = analyticsEvent(eventObj, fn);
        return () => {
            if (!_analyticsOneTimeEventFired[eventKey]) {
                //console.log('oneTimeEvent',eventKey);
                _analyticsOneTimeEventFired[eventKey] = true;
                fireEvent();
            }
        };
    },
    analyticsWindowScroll = (eventObj) => {
        if (eventObj) {
            let fireEvent = analyticsEvent(eventObj);
            window.addEventListener('scroll', function(e){
                //console.log('windowScroll');
                if (fireEvent && $ && $(document).scrollTop() > $(window).height() * (3 / 4)) {
                    fireEvent();
                }
            });
        }
    },
    analytics = {
        event: analyticsEvent,
        oneTimeEvent: analyticsOneTimeEvent,
        windowScroll: analyticsWindowScroll
    };

setMomentifyLocale();
closeFlash();
closeModal();

export default {
    authenticityToken,
    cumulativeOffset,
    discuss,
    existy,
    validateEmail,
    momentify,
    momentFromString,
    formatNumber,
    idVM,
    getUser,
    getCurrentProject,
    toggleProp,
    loader,
    newFeatureBadge,
    fbParse,
    pluralize,
    simpleFormat,
    translatedTime,
    rewardSouldOut,
    rewardRemaning,
    parseUrl,
    hashMatch,
    redrawHashChange,
    useAvatarOrDefault,
    locationActionMatch,
    navigateToDevise,
    storeAction,
    callStoredAction,
    UIHelper,
    toAnchor,
    paramByName,
    i18nScope,
    RDTracker,
    selfOrEmpty,
    scrollTo,
    validationErrors,
    validate,
    strip,
    analytics,
    applyMonetaryMask,
    monetaryToFloat
};
