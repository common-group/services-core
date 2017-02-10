var c = (function (m$1,I18n$1,_$1,moment$1,$,postgrest$1,CatarseAnalytics$1,replaceDiacritics,Chart) {
'use strict';

m$1 = 'default' in m$1 ? m$1['default'] : m$1;
I18n$1 = 'default' in I18n$1 ? I18n$1['default'] : I18n$1;
_$1 = 'default' in _$1 ? _$1['default'] : _$1;
moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;
$ = 'default' in $ ? $['default'] : $;
postgrest$1 = 'default' in postgrest$1 ? postgrest$1['default'] : postgrest$1;
CatarseAnalytics$1 = 'default' in CatarseAnalytics$1 ? CatarseAnalytics$1['default'] : CatarseAnalytics$1;
replaceDiacritics = 'default' in replaceDiacritics ? replaceDiacritics['default'] : replaceDiacritics;
Chart = 'default' in Chart ? Chart['default'] : Chart;

//      
var _dataCache = {};
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
    var emptyState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    return obj ? obj : emptyState;
};
var setMomentifyLocale = function setMomentifyLocale() {
    moment$1.locale('pt', {
        months: 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
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
var storeAction = function storeAction(action, value) {
    if (!sessionStorage.getItem(action)) {
        return sessionStorage.setItem(action, String(value));
    }
};
var storeObject = function storeObject(sessionKey, obj) {
    return sessionStorage.setItem(sessionKey, JSON.stringify(obj));
};
var getStoredObject = function getStoredObject(sessionKey) {
    if (sessionStorage.getItem(sessionKey)) {
        return JSON.parse(String(sessionStorage.getItem(sessionKey)));
    } else {
        return null;
    }
};
var callStoredAction = function callStoredAction(action) {
    var item = sessionStorage.getItem(action);

    if (item) {
        sessionStorage.removeItem(action);
        return item;
    } else {
        return null;
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
    s.setAttribute('data-timestamp', String(+new Date()));
    (d.head || d.body).appendChild(s);
    return m$1('');
};
var validateEmail = function validateEmail(email) {
    var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
};
var validateCnpj = function validateCnpj(cnpjStr) {
    var tamanho = void 0,
        numeros = void 0,
        digitos = void 0,
        soma = void 0,
        pos = void 0,
        resultado = void 0;
    var cnpj = cnpjStr.replace(/[^\d]+/g, '');

    if (cnpj == '') {
        return false;
    }

    if (cnpj.length != 14) {
        return false;
    }

    if (cnpj == '00000000000000' || cnpj == '11111111111111' || cnpj == '22222222222222' || cnpj == '33333333333333' || cnpj == '44444444444444' || cnpj == '55555555555555' || cnpj == '66666666666666' || cnpj == '77777777777777' || cnpj == '88888888888888' || cnpj == '99999999999999') {

        return false;
    }

    tamanho = cnpj.length - 2;
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (var i = tamanho; i >= 1; i--) {
        soma += Number(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (String(resultado) != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var _i = tamanho; _i >= 1; _i--) {
        soma += Number(numeros.charAt(tamanho - _i)) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (String(resultado) != digitos.charAt(1)) {
        return false;
    }

    return true;
};
var validateCpf = function validateCpf(strCPF) {
    var sum = 0,
        remainder = void 0;

    if (strCPF == '00000000000') return false;

    for (var i = 1; i <= 9; i++) {
        sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = sum * 10 % 11;

    if (remainder == 10 || remainder == 11) {
        remainder = 0;
    }

    if (remainder != parseInt(strCPF.substring(9, 10))) {
        return false;
    }

    sum = 0;

    for (var _i2 = 1; _i2 <= 10; _i2++) {
        sum = sum + parseInt(strCPF.substring(_i2 - 1, _i2)) * (12 - _i2);
    }

    remainder = sum * 10 % 11;

    if (remainder == 10 || remainder == 11) {
        remainder = 0;
    }

    if (remainder != parseInt(strCPF.substring(10, 11))) {
        return false;
    }

    return true;
};
var validationErrors = m$1.prop([]);
var resetValidations = function resetValidations() {
    return validationErrors([]);
};
var validate$1 = function validate$1() {
    var errorFields = m$1.prop([]);

    return {
        submit: function submit(fields, fn) {
            return function () {
                resetValidations();

                _$1.map(fields, function (field) {
                    if (field.rule === 'email') {
                        if (!validateEmail(field.prop())) {
                            validationErrors().push({ field: field.prop, message: 'E-mail inválido.' });
                        }
                    }

                    if (field.rule === 'text') {
                        if (field.prop().trim() === '') {
                            validationErrors().push({ field: field.prop, message: 'O campo não pode ser vazio.' });
                        }
                    }
                });

                return !validationErrors().length > 0 ? fn() : false;
            };
        },
        hasError: function hasError(fieldProp) {
            return _$1.reduce(validationErrors(), function (memo, fieldError) {
                return fieldError.field() === fieldProp() || memo;
            }, false);
        }
    };
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

        return Number(time.total) <= 1 ? projUnit.slice(0, -1) : projUnit;
    };

    return {
        unit: unit(),
        total: time.total
    };
};
var generateFormatNumber = function generateFormatNumber(s, c) {
    return function (number, n, x) {
        if (!_$1.isNumber(number)) {
            return null;
        }

        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = number.toFixed(Math.max(0, ~~n));
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
var idVM = postgrest$1.filtersVM({
    id: 'eq'
});
var getCurrentProject = function getCurrentProject() {
    if (_dataCache.currentProject) return _dataCache.currentProject;

    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');
    if (data) {
        return _dataCache.currentProject = JSON.parse(data);
    } else {
        return null;
    }
};
var getRdToken = function getRdToken() {
    if (_dataCache.rdToken) return _dataCache.rdToken;

    var meta = _$1.first(document.querySelectorAll('[name=rd-token]'));
    return meta ? _dataCache.rdToken = meta.getAttribute('content') : null;
};
var getSimilityCustomer = function getSimilityCustomer() {
    if (_dataCache.similityCustomer) return _dataCache.similityCustomer;

    var meta = _$1.first(document.querySelectorAll('[name=simility-customer]'));
    return meta ? _dataCache.similityCustomer = meta.getAttribute('content') : null;
};
var getMailchimpUrl = function getMailchimpUrl() {
    if (_dataCache.mailchumUrl) return _dataCache.mailchumUrl;

    var meta = _$1.first(document.querySelectorAll('[name=mailchimp-url]'));
    return meta ? _dataCache.mailchumUrl = meta.getAttribute('content') : null;
};
var getUser = function getUser() {
    if (_dataCache.user) return _dataCache.user;

    var body = document.getElementsByTagName('body'),
        data = _$1.first(body).getAttribute('data-user');
    if (data) {
        return _dataCache.user = JSON.parse(data);
    } else {
        return null;
    }
};
var getUserID = function getUserID() {
    var user = getUser();
    return user == null || user.user_id == null ? null : user.user_id;
};
var userSignedIn = function userSignedIn() {
    return !_$1.isNull(getUserID());
};
var getBlogPosts$1 = function getBlogPosts$1() {
    if (_dataCache.blogPosts) return _dataCache.blogPosts;

    var posts = _$1.first(document.getElementsByTagName('body')).getAttribute('data-blog');

    if (posts) {
        return _dataCache.blogPosts = JSON.parse(posts);
    } else {
        return null;
    }
};
var getApiHost = function getApiHost() {
    if (_dataCache.apiHost) return _dataCache.apiHost;

    var el = document.getElementById('api-host');
    return _dataCache.apiHost = el && el.getAttribute('content');
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
var strip = function strip(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};
var simpleFormat = function simpleFormat() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

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
        if (!isInitialized && window.$) {
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
var navigateToDevise = function navigateToDevise() {
    window.location.href = '/pt/login';
    return false;
};
var navigateTo = function navigateTo(path) {
    window.location.href = path;
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
    // Temp for rails unstyled close links
    var close = function close(elm, selector) {
        var all = document.getElementsByClassName(selector);
        var cur = elm.parentNode;
        while (cur && !_$1.contains(all, cur)) {
            cur = cur.parentNode;
        }
        if (cur) {
            cur.style.display = 'none';
        }
        return cur;
    };

    var elById = document.getElementById('modal-close');
    if (_$1.isElement(elById)) {
        elById.onclick = function (event) {
            event.preventDefault();
            close(elById, 'modal-backdrop');
        };
    }

    var els = document.getElementsByClassName('modal-close');
    _$1.map(els, function (el) {
        if (_$1.isElement(el)) {
            el.onclick = function (event) {
                event.preventDefault();
                close(el, 'modal-backdrop');
            };
        }
    });
};
var closeFlash = function closeFlash() {
    var el = document.getElementsByClassName('icon-close')[0];
    if (_$1.isElement(el)) {
        el.onclick = function (event) {
            event.preventDefault();
            if (el.parentElement) {
                el.parentElement.remove();
            }
        };
    }
};
var i18nScope = function i18nScope(scope, obj) {
    obj = obj || {};
    return _$1.extend({}, obj, { scope: scope });
};
var redrawHashChange = function redrawHashChange(before) {
    var callback = _$1.isFunction(before) ? function () {
        before();
        m$1.redraw();
    } : m$1.redraw;

    window.addEventListener('hashchange', callback, false);
};
var authenticityToken = function authenticityToken() {
    var meta = _$1.first(document.querySelectorAll('[name=csrf-token]'));
    return meta ? meta.getAttribute('content') : null;
};
var authenticityParam = function authenticityParam() {
    var meta = _$1.first(document.querySelectorAll('[name=csrf-param]'));
    return meta ? meta.getAttribute('content') : null;
};
var animateScrollTo = function animateScrollTo(el) {
    var scrolled = window.scrollY;

    var offset = cumulativeOffset(el).top,
        duration = 300,
        dFrame = (offset - scrolled) / duration,

    // EaseInOutCubic easing function. We'll abstract all animation funs later.
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

            if (_$1.isElement(anchorEl)) {
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
var projectStateTextClass = function projectStateTextClass(state) {
    var statusText = {
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

    return statusText[state];
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
                    return window.RdIntegration.integrate(getRdToken(), eventId);
                };
                integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
            }

            return false;
        }
    };
};
var analyticsEvent = function analyticsEvent(eventObj) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Function.prototype;

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
    if (!eventObj) {
        return fn;
    }

    return function () {
        try {
            if (!eventObj.project) eventObj.project = getCurrentProject();
            if (!eventObj.user) eventObj.user = getUser();
            CatarseAnalytics$1.event(eventObj);
        } catch (e) {
            console.error('[h.analyticsEvent] error:', e);
        }
        fn();
    };
};
var _analyticsOneTimeEventFired = {};
var analyticsOneTimeEvent = function analyticsOneTimeEvent(eventObj, fn) {
    if (!eventObj) {
        return fn;
    }

    var eventKey = _$1.compact([eventObj.cat, eventObj.act]).join('_');
    if (!eventKey) {
        throw new Error('Should inform cat or act');
    }
    return function () {
        if (!_analyticsOneTimeEventFired[eventKey]) {
            //console.log('oneTimeEvent',eventKey);
            _analyticsOneTimeEventFired[eventKey] = true;
            var fireEvent = analyticsEvent(eventObj, fn);
            fireEvent();
        }
    };
};
var monetaryToFloat = function monetaryToFloat(propValue) {
    return parseFloat(propValue().replace('.', '').replace(',', '.'));
};
var applyMonetaryMask = function applyMonetaryMask(number) {
    var onlyNumbers = String(number).replace(/[^0-9]|[.,]/g, ''),
        integerPart = onlyNumbers.slice(0, onlyNumbers.length - 2),
        decimalPart = onlyNumbers.slice(onlyNumbers.length - 2);

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return integerPart + ',' + decimalPart;
};
var noNumbersMask = function noNumbersMask(value) {
    return value.replace(/[0-9]/g, '');
};
var numbersOnlyMask = function numbersOnlyMask(value) {
    return value.replace(/[^0-9]/g, '');
};
var addChar = function addChar(position, maskChar) {
    return function (char) {
        return function (string) {
            if (string.length === position && char !== maskChar) {
                return string + maskChar;
            }
            return string;
        };
    };
};
var readMaskDefinition = function readMaskDefinition(maskCharDefinitions) {
    return function (maskDefinition) {
        return _$1.compact(_$1.map(maskDefinition, function (letter, index) {
            return letter in maskCharDefinitions ? null : [index, letter];
        }));
    };
};
var isCharAllowed = function isCharAllowed(maskCharDefinitions) {
    return function (maskDefinition) {
        return function (position, newChar) {
            if (position >= maskDefinition.length) {
                return false;
            }

            var maskChar = maskDefinition.charAt(position);
            if (maskChar in maskCharDefinitions) {
                return maskCharDefinitions[maskChar].test(newChar);
            } else {
                return newChar === maskChar || isCharAllowed(maskCharDefinitions)(maskDefinition)(position + 1, newChar);
            }
        };
    };
};
var applyMask = function applyMask(maskDefinition) {
    var maskFunctions = _$1.map(maskDefinition, function (maskChar) {
        return addChar(maskChar[0], maskChar[1]);
    });
    return function (string, newChar) {
        var addNewCharFunctions = _$1.map(maskFunctions, function (el) {
            return el(newChar);
        });
        var applyMaskFunctions = _$1.reduce(addNewCharFunctions, function (memo, f) {
            return _$1.isFunction(memo) ? _$1.compose(f, memo) : f;
        });
        return applyMaskFunctions(string);
    };
};
var mask = function mask(maskDefinition, value) {
    var maskCharDefinitions = {
        '9': /\d/,
        'A': /[a-zA-Z]/
    },
        readMask = readMaskDefinition(maskCharDefinitions),
        isStrCharAllowed = isCharAllowed(maskCharDefinitions),
        applyValueMask = applyMask(readMask(maskDefinition)),
        restrictInput = isStrCharAllowed(maskDefinition);

    return _$1.reduce(value, function (memo, chr) {
        if (restrictInput(memo.length, chr)) {
            memo = applyValueMask(memo, chr) + chr;
        }
        return memo;
    }, '');
};
var removeStoredObject = function removeStoredObject(sessionKey) {
    return sessionStorage.removeItem(sessionKey);
};
var currentProject = m$1.prop();
var setProject = function setProject(project) {
    currentProject(project);
};
var getProject = function getProject() {
    return currentProject;
};
var currentReward = m$1.prop();
var setReward = function setReward(reward) {
    currentReward(reward);
};
var getReward = function getReward() {
    return currentReward;
};
var buildLink = function buildLink(link, refStr) {
    return '/' + link + (refStr ? '?ref=' + refStr : '');
};
var analyticsWindowScroll = function analyticsWindowScroll(eventObj) {
    if (eventObj) {
        (function () {
            var fired = false;
            window.addEventListener('scroll', function (e) {
                //console.log('windowScroll');
                if (!fired && window.$ && $(document).scrollTop() > $(window).height() * (3 / 4)) {
                    fired = true;
                    var fireEvent = analyticsEvent(eventObj);
                    fireEvent();
                }
            });
        })();
    }
};
var analytics = {
    event: analyticsEvent,
    oneTimeEvent: analyticsOneTimeEvent,
    windowScroll: analyticsWindowScroll
};
var projectFullPermalink = function projectFullPermalink(project) {
    var permalink = void 0;
    if (typeof project === 'function') {
        permalink = project().permalink;
    } else {
        permalink = project.permalink;
    }

    return 'https://www.catarse.me/' + permalink;
};
var isHome = function isHome() {
    var path = window.location.pathname;

    return path == '/pt' || path == '/';
};
var isProjectPage = function isProjectPage() {
    var path = window.location.pathname,
        isOnInsights = path.indexOf('/insights') > -1,
        isOnEdit = path.indexOf('/edit') > -1,
        isOnContribution = path.indexOf('/contribution') > -1;

    return !isOnEdit && !isOnInsights && !isOnContribution;
};
var setPageTitle = function setPageTitle(title) {
    return function (el, isInitialized) {
        var titleEl = document.getElementsByTagName('title')[0],
            currentTitle = titleEl.innerText;

        if (currentTitle !== title) {
            return titleEl.innerText = title;
        }
    };
};
var checkReminder = function checkReminder() {
    var reminder = sessionStorage.getItem('reminder');

    if (reminder && isHome()) {
        window.location.href = '/projects/' + reminder;
    }
};
var rootUrl = function rootUrl() {
    if (_dataCache.rootUrl) return _dataCache.rootUrl;

    var meta = _$1.first(document.querySelectorAll('[name=root-url]'));

    return meta ? _dataCache.rootUrl = meta.getAttribute('content') : null;
};
var redactorConfig = function redactorConfig(params) {
    return {
        source: false,
        formatting: ['p'],
        formattingAdd: [{
            tag: 'blockquote',
            title: 'Citar',
            class: 'fontsize-base quote',
            clear: true
        }, {
            tag: 'p',
            title: 'Cabeçalho 1',
            class: 'fontsize-larger fontweight-semibold',
            clear: true
        }, {
            tag: 'p',
            title: 'Cabeçalho 2',
            class: 'fontsize-large',
            clear: true
        }],
        lang: 'pt_br',
        maxHeight: 800,
        minHeight: 300,
        convertVideoLinks: true,
        convertUrlLinks: true,
        convertImageLinks: false,
        // You can specify, which ones plugins you need.
        // If you want to use plugins, you have add plugins to your
        // application.js and application.css files and uncomment the line below:
        // "plugins": ['fontsize', 'fontcolor', 'fontfamily', 'fullscreen', 'textdirection', 'clips'],
        plugins: ['video'],
        "imageUpload": "/redactor_rails/pictures?" + params,
        "imageGetJson": "/redactor_rails/pictures",
        "path": "/assets/redactor-rails",
        "css": "style.css"
    };
};
var setRedactor = function setRedactor(prop) {
    return function (el, isInit) {
        if (!isInit) {
            (function () {
                var $editor = window.$(el);
                var csrf_token = authenticityToken();
                var csrf_param = authenticityParam();
                var params = '';
                if (csrf_param && csrf_token) {
                    params = csrf_param + "=" + encodeURIComponent(csrf_token);
                }
                $editor.redactor(redactorConfig(params));
                $editor.redactor('code.set', prop());
                // If we need to get redactor values and send it to js objects we'll have to add
                // a hook on the change.callback.redactor event. e.g.:
                //$editor.on('change.callback.redactor', () => prop($editor.redactor('code.get')) );
                // TODO: workaround to get redactor data
                window.$('.redactor-editor').on('blur', function () {
                    return prop($editor.redactor('code.get'));
                });
            })();
        }
    };
};
var redactor = function redactor(name, prop) {
    return m$1('textarea.input_field.redactor.w-input.text-field.bottom.jumbo.positive', {
        name: name, config: setRedactor(prop)
    });
};
var setCsrfToken = function setCsrfToken(xhr) {
    if (authenticityToken()) {
        xhr.setRequestHeader('X-CSRF-Token', authenticityToken());
    }
    return;
};

setMomentifyLocale();
closeFlash();
closeModal();
checkReminder();

var h = {
    authenticityParam: authenticityParam,
    authenticityToken: authenticityToken,
    buildLink: buildLink,
    cumulativeOffset: cumulativeOffset,
    discuss: discuss,
    existy: existy,
    validateEmail: validateEmail,
    validateCpf: validateCpf,
    validateCnpj: validateCnpj,
    momentify: momentify,
    momentFromString: momentFromString,
    formatNumber: formatNumber,
    idVM: idVM,
    getUser: getUser,
    getUserID: getUserID,
    getSimilityCustomer: getSimilityCustomer,
    getApiHost: getApiHost,
    getMailchimpUrl: getMailchimpUrl,
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
    navigateTo: navigateTo,
    storeAction: storeAction,
    callStoredAction: callStoredAction,
    UIHelper: UIHelper,
    toAnchor: toAnchor,
    paramByName: paramByName,
    i18nScope: i18nScope,
    RDTracker: RDTracker,
    selfOrEmpty: selfOrEmpty,
    animateScrollTo: animateScrollTo,
    scrollTo: scrollTo,
    projectStateTextClass: projectStateTextClass,
    validationErrors: validationErrors,
    validate: validate$1,
    analytics: analytics,
    strip: strip,
    storeObject: storeObject,
    getStoredObject: getStoredObject,
    removeStoredObject: removeStoredObject,
    setProject: setProject,
    getProject: getProject,
    setReward: setReward,
    getReward: getReward,
    applyMonetaryMask: applyMonetaryMask,
    noNumbersMask: noNumbersMask,
    numbersOnlyMask: numbersOnlyMask,
    monetaryToFloat: monetaryToFloat,
    mask: mask,
    projectFullPermalink: projectFullPermalink,
    isProjectPage: isProjectPage,
    setPageTitle: setPageTitle,
    rootUrl: rootUrl,
    redactor: redactor,
    setCsrfToken: setCsrfToken,
    userSignedIn: userSignedIn
};

var models = {
    country: postgrest$1.model('countries'),
    state: postgrest$1.model('states'),
    contributionDetail: postgrest$1.model('contribution_details'),
    contributionActivity: postgrest$1.model('contribution_activities'),
    projectDetail: postgrest$1.model('project_details'),
    userDetail: postgrest$1.model('user_details'),
    balance: postgrest$1.model('balances'),
    balanceTransaction: postgrest$1.model('balance_transactions'),
    balanceTransfer: postgrest$1.model('balance_transfers'),
    user: postgrest$1.model('users'),
    userCreditCard: postgrest$1.model('user_credit_cards'),
    bankAccount: postgrest$1.model('bank_accounts'),
    bank: postgrest$1.model('banks'),
    rewardDetail: postgrest$1.model('reward_details'),
    projectReminder: postgrest$1.model('project_reminders'),
    projectReport: postgrest$1.model('project_reports'),
    contributions: postgrest$1.model('contributions'),
    directMessage: postgrest$1.model('direct_messages'),
    teamTotal: postgrest$1.model('team_totals'),
    recommendedProjects: postgrest$1.model('recommended_projects'),
    projectAccount: postgrest$1.model('project_accounts'),
    projectAccountError: postgrest$1.model('project_account_errors'),
    projectContribution: postgrest$1.model('project_contributions'),
    projectContributiorsStat: postgrest$1.model('project_stat_contributors'),
    projectPostDetail: postgrest$1.model('project_posts_details'),
    projectContributionsPerDay: postgrest$1.model('project_contributions_per_day'),
    projectContributionsPerLocation: postgrest$1.model('project_contributions_per_location'),
    projectContributionsPerRef: postgrest$1.model('project_contributions_per_ref'),
    projectTransfer: postgrest$1.model('project_transfers'),
    project: postgrest$1.model('projects'),
    projectSearch: postgrest$1.model('rpc/project_search'),
    category: postgrest$1.model('categories'),
    categoryTotals: postgrest$1.model('category_totals'),
    categoryFollower: postgrest$1.model('category_followers'),
    teamMember: postgrest$1.model('team_members'),
    notification: postgrest$1.model('notifications'),
    statistic: postgrest$1.model('statistics'),
    successfulProject: postgrest$1.model('successful_projects'),
    finishedProject: postgrest$1.model('finished_projects'),
    userFriend: postgrest$1.model('user_friends'),
    userFollow: postgrest$1.model('user_follows'),
    followAllFriends: postgrest$1.model('rpc/follow_all_friends'),
    contributor: postgrest$1.model('contributors'),
    userFollower: postgrest$1.model('user_followers'),
    creatorSuggestion: postgrest$1.model('creator_suggestions'),
    userContribution: postgrest$1.model('user_contributions'),
    deleteProject: postgrest$1.model('rpc/delete_project'),
    cancelProject: postgrest$1.model('rpc/cancel_project')
};

models.teamMember.pageSize(40);
models.rewardDetail.pageSize(false);
models.project.pageSize(30);
models.category.pageSize(50);
models.contributionActivity.pageSize(40);
models.successfulProject.pageSize(9);
models.finishedProject.pageSize(9);
models.country.pageSize(false);
models.state.pageSize(false);
models.projectContribution.pageSize(9);
models.contributor.pageSize(9);
models.recommendedProjects.pageSize(3);

var userListVM = postgrest.paginationVM(models.user, 'id.desc', { 'Prefer': 'count=exact' });

var vm = postgrest.filtersVM({
    full_text_index: '@@',
    deactivated_at: 'is.null'
});
var paramToString = function paramToString(p) {
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
            toggler: h.toggleProp(false, true)
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

var adminItem = {
    controller: function controller(args) {
        return {
            displayDetailBox: h.toggleProp(false, true)
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
        }), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? h.loader() : m$1('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais')])])])])])])]);
    }
};

var adminUser = {
    view: function view(ctrl, args) {
        var user = args.item;

        return m$1('.w-row.admin-user', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m$1('.fontsize-smallest', 'Usuário: ' + user.id), m$1('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
    }
};

var adminUserItem = {
    view: function view(ctrl, args) {
        return m$1('.w-row', [m$1('.w-col.w-col-4', [m$1.component(adminUser, args)])]);
    }
};

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
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
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
            toggler: h.toggleProp(false, true),
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

        h.idVM.id(item[builder.updateKey]);

        var l = postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

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

/**
 * window.c.AdminNotificationHistory component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminNotificationHistory, {
 *     user: user
 * })
 */
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
            return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event', [m$1('.w-col.w-col-24', [m$1('.fontcolor-secondary', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', m$1('a[target="blank"][href="/notifications/' + cEvent.relation + '/' + cEvent.id + '"]', cEvent.template_name), cEvent.origin ? ' - ' + cEvent.origin : '')])]);
        })]);
    }
};

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
                    model: models.user
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
                    model: models.user
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

var dropdown = {
    view: function view(ctrl, args) {
        var opts = _$1.isFunction(args.options) ? args.options() : args.options;

        return m$1('select' + args.classes + '[id="' + args.id + '"]', {
            onchange: m$1.withAttr('value', args.valueProp),
            value: args.valueProp()
        }, _$1.map(opts, function (data) {
            return m$1('option[value="' + data.value + '"]', data.option);
        }));
    }
};

var filterDropdown = {
    view: function view(ctrl, args) {
        var wrapper_c = args.wrapper_class || '.w-col.w-col-3.w-col-small-6';
        return m$1(wrapper_c, [m$1('label.fontsize-smaller[for="' + args.index + '"]', args.custom_label ? m$1.component(args.custom_label[0], args.custom_label[1]) : args.label), m$1.component(dropdown, {
            id: args.index,
            classes: '.w-select.text-field.positive',
            valueProp: args.vm,
            options: args.options
        })]);
    }
};

var adminUsers = {
    controller: function controller() {
        var listVM = userListVM,
            filterVM = vm,
            error = m$1.prop(''),
            itemBuilder = [{
            component: adminUser,
            wrapperClass: '.w-col.w-col-4'
        }],
            filterBuilder = [{ //name
            component: filterMain,
            data: {
                vm: filterVM.full_text_index,
                placeholder: 'Busque por nome, e-mail, Ids do usuário...'
            }
        }, { //status
            component: filterDropdown,
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

var contributionListVM = postgrest.paginationVM(models.contributionDetail, 'id.desc', { 'Prefer': 'count=exact' });

var vm$1 = postgrest$1.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
});
var paramToString$1 = function paramToString$1(p) {
    return (p || '').toString().trim();
};

// Set default values
vm$1.state('');
vm$1.gateway('');
vm$1.order({
    id: 'desc'
});

vm$1.created_at.lte.toFilter = function () {
    var filter = paramToString$1(vm$1.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$1.created_at.gte.toFilter = function () {
    var filter = paramToString$1(vm$1.created_at.gte());
    return filter && h.momentFromString(filter).format();
};

vm$1.full_text_index.toFilter = function () {
    var filter = paramToString$1(vm$1.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

var adminProject = {
    view: function view(ctrl, args) {
        var project = args.item;
        return m$1('.w-row.admin-project', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m$1('.fontsize-smallest.fontweight-semibold', project.project_state), m$1('.fontsize-smallest.fontcolor-secondary', h.momentify(project.project_online_date) + ' a ' + h.momentify(project.project_expires_at))])]);
    }
};

var adminContribution = {
    view: function view(ctrl, args) {
        var contribution = args.item;
        return m$1('.w-row.admin-contribution', [m$1('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), m$1('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m$1('.fontsize-smallest', ['ID do Gateway: ', m$1('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
    }
};

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

//Add translations to payment state.
var I18nScope = _.partial(h.i18nScope, 'projects.payment');

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

        return m$1('.w-row.payment-status', [m$1('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m$1('span.fa.fa-circle' + ctrl.stateClass()), ' ' + I18n$1.t(payment.state, I18nScope())]), m$1('.fontsize-smallest.fontweight-semibold', [m$1('span.fa' + ctrl.paymentMethodClass()), ' ', m$1('a.link-hidden[href="#"]', payment.payment_method)]), m$1('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
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
            radios = m$1.prop([]),
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

        var populateRadios = function populateRadios(data) {
            var emptyState = builder.addEmpty;

            radios(data);

            if (!_$1.isUndefined(emptyState)) {
                radios().unshift(emptyState);
            }
        };

        var fetch = function fetch() {
            getLoader.load().then(populateRadios, error);
        };

        var submit = function submit() {
            if (newID()) {
                var validation = validate(radios(), newID());
                if (_$1.isUndefined(validation)) {
                    data[builder.selectKey] = newID() === -1 ? null : newID();
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
            toggler: h.toggleProp(false, true),
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
            return m$1('.w-radio', [m$1('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]', {
                checked: radio.id === (item[data.selectKey] || item.id),
                onclick: function onclick() {
                    ctrl.newID(radio.id);
                    ctrl.setDescription(radio.description);
                }
            }), m$1('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
        }) : h.loader(), m$1('strong', 'Descrição'), m$1('p', ctrl.description()), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Recompensa alterada com sucesso!')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', ctrl.error().message)])])]) : '']);
    }
};

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
var adminExternalAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = m$1.prop(false),
            error = m$1.prop(false),
            fail = m$1.prop(false),
            data = {},
            item = args.item;

        builder.requestOptions.config = function (xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        var reload = _$1.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
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
            toggler: h.toggleProp(false, true),
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

var adminTransaction = {
    view: function view(ctrl, args) {
        var contribution = args.contribution;
        return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m$1('.fontsize-smallest.lineheight-looser', ['Valor: R$' + h.formatNumber(contribution.value, 2, 3), m$1('br'), 'Taxa: R$' + h.formatNumber(contribution.gateway_fee, 2, 3), m$1('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), m$1('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), m$1('br'), 'Id pagamento: ' + contribution.gateway_id, m$1('br'), 'Apoio: ' + contribution.contribution_id, m$1('br'), 'Chave: \n', m$1('br'), contribution.key, m$1('br'), 'Meio: ' + contribution.gateway, m$1('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m$1('br'), contribution.is_second_slip ? [m$1('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m$1('span.badge', '2a via')] : ''])]);
    }
};

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
                item.date = h.momentify(item.date, 'DD/MM/YYYY, HH:mm');
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

var adminReward = {
    view: function view(ctrl, args) {
        var reward = args.reward(),
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

        return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m$1('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, m$1('br'), 'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3), m$1('br'), m$1.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m$1('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m$1('br'), 'Descrição: ' + reward.description] : 'Apoio sem recompensa')]);
    }
};

var adminContributionDetail = {
    controller: function controller(args) {
        var l = void 0;
        var loadReward = function loadReward() {
            var model = models.rewardDetail,
                reward_id = args.item.reward_id,
                opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
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
                    addEmpty: { id: -1, minimum_value: 10, description: 'Sem recompensa' },
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
        }), ctrl.l() ? h.loader : m$1.component(adminRadioAction, {
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
        }), ctrl.l() ? h.loader : m$1.component(adminReward, {
            reward: reward,
            key: item.key
        })])]);
    }
};

var filterNumberRange = {
    view: function view(ctrl, args) {
        return m$1('.w-col.w-col-3.w-col-small-6', [m$1('label.fontsize-smaller[for="' + args.index + '"]', args.label), m$1('.w-row', [m$1('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m$1('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: m$1.withAttr('value', args.first),
            value: args.first()
        })]), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m$1('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m$1('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m$1('input.w-input.text-field.positive[type="text"]', {
            onchange: m$1.withAttr('value', args.last),
            value: args.last()
        })])])]);
    }
};

var filterDateRange = {
    view: function view(ctrl, args) {
        return m$1('.w-col.w-col-3.w-col-small-6', [m$1('label.fontsize-smaller[for="' + args.index + '"]', args.label), m$1('.w-row', [m$1('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m$1('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: m$1.withAttr('value', args.first),
            value: args.first()
        })]), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m$1('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m$1('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m$1('input.w-input.text-field.positive[type="text"]', {
            onchange: m$1.withAttr('value', args.last),
            value: args.last()
        })])])]);
    }
};

var adminContributions = {
    controller: function controller() {
        var listVM = contributionListVM,
            filterVM = vm$1,
            error = m$1.prop(''),
            filterBuilder = [{ //full_text_index
            component: filterMain,
            data: {
                vm: filterVM.full_text_index,
                placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
            }
        }, { //state
            component: filterDropdown,
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
            component: filterDropdown,
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
            component: filterNumberRange,
            data: {
                label: 'Valores entre',
                first: filterVM.value.gte,
                last: filterVM.value.lte
            }
        }, { //created_at
            component: filterDateRange,
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
var landingSignup = {
    controller: function controller(args) {
        var builder = args.builder,
            email = m$1.prop(''),
            error = m$1.prop(false),
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
        return m$1('form.w-form[id="email-form"][method="post"][action="' + args.builder.customAction + '"]', {
            onsubmit: ctrl.submit
        }, [m$1('.w-col.w-col-5', [m$1('input' + errorClasses + '.w-input.text-field.medium[name="EMAIL"][placeholder="Digite seu email"][type="text"]', {
            config: h.RDTracker('landing-flex'),
            onchange: m$1.withAttr('value', ctrl.email),
            value: ctrl.email()
        }), ctrl.error() ? m$1('span.fontsize-smaller.text-error', 'E-mail inválido') : '']), m$1('.w-col.w-col-3', [m$1('input.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')])]);
    }
};

var error$1 = m.prop('');
var rewards = m.prop([]);
var noReward = {
    id: -1,
    description: 'Obrigado. Eu só quero ajudar o projeto.',
    minimum_value: 10
};
var contributionValue = m.prop(noReward.minimum_value + ',00');
var selectedReward = m.prop(noReward);
var vm$3 = postgrest$1.filtersVM({
    project_id: 'eq'
});

var rewardsLoader = function rewardsLoader(project_id) {
    vm$3.project_id(project_id);

    return postgrest$1.loaderWithToken(models.rewardDetail.getPageOptions(vm$3.parameters()));
};

var fetchRewards = function fetchRewards(project_id) {
    return rewardsLoader(project_id).load().then(rewards);
};

var getSelectedReward = function getSelectedReward() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        var contribution = JSON.parse(data);
        var reward = selectedReward(contribution.reward);

        m.redraw(true);

        return selectedReward;
    } else {
        return false;
    }
};

var selectReward = function selectReward(reward) {
    return function () {
        if (rewardVM.selectedReward() !== reward) {
            rewardVM.selectedReward(reward);

            contributionValue(h.applyMonetaryMask(reward.minimum_value + ',00'));
        }
    };
};

var applyMask$1 = _.compose(contributionValue, h.applyMonetaryMask);

var rewardVM = {
    error: error$1,
    rewards: rewards,
    applyMask: applyMask$1,
    noReward: noReward,
    fetchRewards: fetchRewards,
    selectReward: selectReward,
    getSelectedReward: getSelectedReward,
    selectedReward: selectedReward,
    contributionValue: contributionValue,
    rewardsLoader: rewardsLoader,
    getValue: contributionValue,
    setValue: contributionValue
};

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
        contributed_by_friends = filtersVM({
        open_for_contributions: 'eq',
        contributed_by_friends: 'eq'
    }).open_for_contributions('true').contributed_by_friends(true),
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
        contributed_by_friends: {
            title: 'Amigos',
            filter: contributed_by_friends,
            nicename: 'Amigos',
            isContextual: false,
            keyName: 'contributed_by_friends'
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

var idVM$2 = h.idVM;
var userDetails$1 = m$1.prop([]);
var currentUser = m$1.prop({});
var createdVM = postgrest$1.filtersVM({ project_user_id: 'eq' });

var getUserCreatedProjects = function getUserCreatedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    createdVM.project_user_id(user_id).order({ project_id: 'desc' });

    models.project.pageSize(pageSize);

    var lUserCreated = postgrest$1.loaderWithToken(models.project.getPageOptions(createdVM.parameters()));

    return lUserCreated.load();
};

var getPublicUserContributedProjects = function getPublicUserContributedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    models.contributor.pageSize(pageSize);

    var lUserContributed = postgrest$1.loaderWithToken(models.contributor.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};

var getUserBankAccount = function getUserBankAccount(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    var lUserAccount = postgrest$1.loaderWithToken(models.bankAccount.getPageOptions(contextVM.parameters()));
    return lUserAccount.load();
};

var getUserProjectReminders = function getUserProjectReminders(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq',
        without_notification: 'eq'
    });

    contextVM.user_id(user_id).without_notification(true);

    models.projectReminder;

    var lUserReminders = postgrest$1.loaderWithToken(models.projectReminder.getPageOptions(contextVM.parameters()));

    return lUserReminders.load();
};

var getUserCreditCards = function getUserCreditCards(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    models.userCreditCard.pageSize(false);

    var lUserCards = postgrest$1.loaderWithToken(models.userCreditCard.getPageOptions(contextVM.parameters()));

    return lUserCards.load();
};

var getUserContributedProjects = function getUserContributedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq',
        state: 'in'
    });

    contextVM.user_id(user_id).order({
        created_at: 'desc'
    }).state(['refunded', 'pending_refund', 'paid']);

    models.userContribution.pageSize(pageSize);

    var lUserContributed = postgrest$1.loaderWithToken(models.userContribution.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};

var fetchUser = function fetchUser(user_id) {
    var handlePromise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var customProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : currentUser;

    idVM$2.id(user_id);

    var lUser = postgrest$1.loaderWithToken(models.userDetail.getRowOptions(idVM$2.parameters()));

    return !handlePromise ? lUser.load() : lUser.load().then(_$1.compose(customProp, _$1.first));
};

var getCurrentUser = function getCurrentUser() {
    fetchUser(h.getUserID());
    return currentUser;
};

var displayImage = function displayImage(user) {
    return user.profile_img_thumbnail || "https://catarse.me/assets/catarse_bootstrap/user.jpg";
};

var displayCover = function displayCover(user) {
    return user.profile_cover_image || displayImage(user);
};

var getUserRecommendedProjects = function getUserRecommendedProjects(contribution) {
    var sample3 = _$1.partial(_$1.sample, _$1, 3),
        loaders = m$1.prop([]),
        collection = m$1.prop([]),
        _h$getUser = h.getUser(),
        user_id = _h$getUser.user_id;


    var loader = function loader() {
        return _$1.reduce(loaders(), function (memo, curr) {
            var _memo = _$1.isFunction(memo) ? memo() : memo,
                _curr = _$1.isFunction(curr) ? curr() : curr;

            return _memo && _curr;
        }, true);
    };

    var loadPopular = function loadPopular() {
        var filters = projectFiltersVM().filters;
        var popular = postgrest$1.loaderWithToken(models.project.getPageOptions(_$1.extend({}, { order: 'score.desc' }, filters['score'].filter.parameters())));

        loaders().push(popular);

        popular.load().then(_$1.compose(collection, sample3));
    };

    var pushProject = function pushProject(_ref) {
        var project_id = _ref.project_id;

        var project = postgrest$1.loaderWithToken(models.project.getPageOptions(postgrest$1.filtersVM({ project_id: 'eq' }).project_id(project_id).parameters()));

        loaders().push(project);
        project.load().then(function (data) {
            collection().push(_$1.first(data));
        });
    };

    var projects = postgrest$1.loaderWithToken(models.recommendedProjects.getPageOptions(postgrest$1.filtersVM({ user_id: 'eq' }).user_id(user_id).parameters()));

    projects.load().then(function (recommended) {
        if (recommended.length > 0) {
            _$1.map(recommended, pushProject);
        } else {
            loadPopular();
        }
    });

    return {
        loader: loader,
        collection: collection
    };
};

var userVM = {
    getUserCreatedProjects: getUserCreatedProjects,
    getUserCreditCards: getUserCreditCards,
    getUserProjectReminders: getUserProjectReminders,
    getUserRecommendedProjects: getUserRecommendedProjects,
    getUserContributedProjects: getUserContributedProjects,
    getUserBankAccount: getUserBankAccount,
    getPublicUserContributedProjects: getPublicUserContributedProjects,
    displayImage: displayImage,
    displayCover: displayCover,
    fetchUser: fetchUser,
    getCurrentUser: getCurrentUser
};

var idVM$1 = h.idVM;
var currentProject$1 = m$1.prop();
var userDetails = m$1.prop();
var projectContributions = m$1.prop([]);
var vm$2 = postgrest$1.filtersVM({ project_id: 'eq' });

var setProject$1 = function setProject$1(project_user_id) {
    return function (data) {
        currentProject$1(_$1.first(data));

        if (!project_user_id) {
            userVM.fetchUser(currentProject$1().user_id, true, userDetails);
        }

        return currentProject$1;
    };
};

var init = function init(project_id, project_user_id) {
    vm$2.project_id(project_id);

    var lProject = postgrest$1.loaderWithToken(models.projectDetail.getRowOptions(vm$2.parameters()));

    fetchParallelData(project_id, project_user_id);

    /*try {
        if(project_id && _.contains([29706], project_id)) {
            (window.$zopim && window.$zopim.livechat)||(function(d,s){var z=window.$zopim=function(c){z._.push(c)},$=z.s=d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set._.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute('charset','utf-8');$.src='//v2.zopim.com/?2qPtIfZX0Exh5Szx5JUoUxWKqrTQI5Tm';z.t=+new Date;$.type='text/javascript';e.parentNode.insertBefore($,e)})(document,'script');
            setTimeout(function t(){
                const c = window.$zopim && window.$zopim.livechat;
                if(c) {
                    const u = h.getUser();
                    if(u) {
                        c.setEmail(u.email);
                        c.setName(u.name);
                    }
                    window.zE && window.zE.hide();
                } else {
                    setTimeout(t, 1000);
                }
            }, 1000);
        }
    } catch(e) {
        console.error(e);
    }*/

    return lProject.load().then(setProject$1(project_user_id));
};

var resetData = function resetData() {
    userDetails({});
    rewardVM.rewards([]);
};

var fetchParallelData = function fetchParallelData(project_id, project_user_id) {
    if (project_user_id) {
        userVM.fetchUser(project_user_id, true, userDetails);
    }

    rewardVM.fetchRewards(project_id);
};

var getCurrentProject$1 = function getCurrentProject$1() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');

    if (data) {
        var _currentProject = currentProject$1(JSON.parse(data)),
            project_id = _currentProject.project_id,
            project_user_id = _currentProject.project_user_id;

        m$1.redraw(true);

        init(project_id, project_user_id);

        return currentProject$1();
    } else {
        return false;
    }
};

var routeToProject = function routeToProject(project, ref) {
    return function () {
        currentProject$1(project);

        resetData();

        m$1.route(h.buildLink(project.permalink, ref), { project_id: project.project_id, project_user_id: project.project_user_id });

        return false;
    };
};

var setProjectPageTitle = function setProjectPageTitle() {
    if (currentProject$1()) {
        var projectName = currentProject$1().project_name || currentProject$1().name;

        return projectName ? h.setPageTitle(projectName) : Function.prototype;
    }
};

var projectVM = {
    userDetails: userDetails,
    getCurrentProject: getCurrentProject$1,
    projectContributions: projectContributions,
    currentProject: currentProject$1,
    rewardDetails: rewardVM.rewards,
    routeToProject: routeToProject,
    setProjectPageTitle: setProjectPageTitle,
    init: init
};

var projectFriends = {
    controller: function controller(args) {
        var project = args.project,
            friendsSample = m$1.prop([]),
            listVM = postgrest$1.paginationVM(models.contributor, 'user_id.desc', {
            'Prefer': 'count=exact'
        }),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq',
            is_follow: 'eq'
        }).project_id(project.project_id).is_follow(true);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters()).then(function () {
                friendsSample(_$1.sample(listVM.collection(), 2));
            });
        }
        return {
            project: project,
            listVM: listVM,
            friendsSample: friendsSample
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project,
            friendsCount = ctrl.listVM.collection().length;
        return m$1('.friend-backed-card', [m$1('.friend-facepile', [_$1.map(ctrl.friendsSample(), function (user) {
            var profile_img = _$1.isEmpty(user.data.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : user.data.profile_img_thumbnail;
            return m$1('img.user-avatar[src=\'' + profile_img + '\']');
        })]), m$1('p.fontsize-smallest.friend-namepile.lineheight-tighter', [m$1('span.fontweight-semibold', _$1.map(ctrl.friendsSample(), function (user) {
            return user.data.name.split(' ')[0];
        }).join(friendsCount > 2 ? ', ' : ' e ')), friendsCount > 2 ? [' e ', m$1('span.fontweight-semibold', 'mais ' + (friendsCount - ctrl.friendsSample().length))] : '', friendsCount > 1 ? ' apoiaram' : ' apoiou'])]);
    }
};

var I18nScope$1 = _$1.partial(h.i18nScope, 'projects.card');
var projectCard = {
    controller: function controller(args) {
        var project = args.project,
            progress = project.progress.toFixed(2),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time),
            type = args.type || 'small';

        var css = function css() {
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

            return cssClasses[type];
        };

        var cardMeter = function cardMeter() {
            var failed = function failed() {
                return project.state === 'failed' || project.state === 'waiting_funds' ? 'card-secondary' : '';
            };

            return '.card-project-meter.' + project.mode + '.' + project.state + '.' + progress + '.' + failed();
        };

        return {
            css: css,
            type: type,
            progress: progress,
            remainingTextObj: remainingTextObj,
            elapsedTextObj: elapsedTextObj,
            cardMeter: cardMeter
        };
    },
    view: function view(ctrl, args) {
        var project = args.project;

        return m$1(ctrl.css().wrapper, [m$1(ctrl.css().innerWrapper, [m$1('a' + ctrl.css().thumb + '[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref),
            style: {
                'background-image': 'url(' + project.project_img + ')',
                'display': 'block'
            }
        }), m$1(ctrl.css().descriptionWrapper, [m$1(ctrl.css().description, [m$1(ctrl.css().title, [m$1('a.link-hidden[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref)
        }, project.project_name)]), m$1(ctrl.css().author, I18n$1.t('by', I18nScope$1()) + ' ' + project.owner_name), m$1(ctrl.css().headline, [m$1('a.link-hidden[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref)
        }, project.headline)])]), m$1(ctrl.css().city, [m$1('.fontsize-smallest.fontcolor-secondary', [m$1('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m$1(ctrl.cardMeter(), [_$1.contains(['successful', 'failed', 'waiting_funds'], project.state) ? m$1('div', project.state === 'successful' && ctrl.progress < 100 ? I18n$1.t('display_status.flex_successful', I18nScope$1()) : I18n$1.t('display_status.' + project.state, I18nScope$1())) : m$1('.meter', [m$1('.meter-fill', {
            style: {
                width: (ctrl.progress > 100 ? 100 : ctrl.progress) + '%'
            }
        })])]), m$1('.card-project-stats', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m$1('.fontsize-base.fontweight-semibold', Math.floor(project.progress) + '%')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m$1('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m$1('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [m$1('.fontsize-smaller.fontweight-semibold', ctrl.remainingTextObj.total + ' ' + ctrl.remainingTextObj.unit), m$1('.fontsize-smallest.lineheight-tightest', ctrl.remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [m$1('.fontsize-smallest.lineheight-tight', ['Iniciado há', m$1('br'), ctrl.elapsedTextObj.total + ' ' + ctrl.elapsedTextObj.unit])])])])]), args.showFriends && ctrl.type === 'big' ? m$1('.w-col.w-col-4.w-col-medium-6', [m$1.component(projectFriends, { project: project })]) : '']), args.showFriends && ctrl.type !== 'big' ? m$1.component(projectFriends, { project: project }) : '']);
    }
};

var projectRow = {
    view: function view(ctrl, args) {
        var collection = args.collection,
            title = args.title || collection.title,
            ref = args.ref,
            showFriends = args.showFriends,
            wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

        if (collection.loader() || collection.collection().length > 0) {
            return m$1(wrapper, [m$1('.w-container', [!_$1.isUndefined(collection.title) || !_$1.isUndefined(collection.hash) ? m$1('.w-row.u-marginbottom-30', [m$1(showFriends ? '.w-col.w-col-8.w-col-small-6.w-col-tiny-6' : '.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-large.lineheight-looser', title)]), m$1(showFriends ? '.w-col.w-col-4.w-col-small-6.w-col-tiny-6' : '.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m$1('.w-row', [showFriends ? m$1('.w-col.w-col-6', [m$1('a.btn.btn-no-border.btn-small.btn-terciary[href="/connect-facebook?ref=' + ref + '"]', 'Encontrar amigos')]) : '', m$1(showFriends ? '.w-col.w-col-6' : '.w-col.w-col-12', m$1('a.btn.btn-small.btn-terciary[href="/explore?ref=' + ref + '&filter=' + collection.hash + '"]', {
                config: m$1.route
            }, 'Ver todos'))])])]) : '', collection.loader() ? h.loader() : m$1('.w-row', _$1.map(collection.collection(), function (project) {
                return m$1.component(projectCard, {
                    project: project,
                    ref: ref,
                    showFriends: showFriends
                });
            }))])]);
        } else {
            return m$1('div');
        }
    }
};

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
var landingQA = {
    controller: function controller(args) {
        return {
            showAnswer: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m$1('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [m$1('.fontsize-base', {
            onclick: function onclick() {
                ctrl.showAnswer.toggle();
                args.onclick && args.onclick();
            }
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
                h.discuss('https://catarse.me/flex', 'flex_page');
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
        }), m$1('.w-col.w-col-2')])])]), [m$1('.section', [m$1('.w-container', [m$1('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m$1('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m$1('div', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', [m$1('.u-text-center.u-marginbottom-20', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m$1('.fontsize-largest.lineheight-loose', 'Causas')]), m$1('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistenciais, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center.u-marginbottom-20', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m$1('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m$1('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m$1('.w-section.section.bg-greenlime.fontcolor-negative', [m$1('.w-container', [m$1('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m$1('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m$1('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m$1('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m$1('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m$1('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? h.loader() : m$1.component(projectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m$1('.w-section.divider'), m$1('.w-section.section', [m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', [m$1.component(landingQA, {
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
        }), m$1('.w-col.w-col-2')])])]), m$1('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m$1('.w-container.u-text-center', [m$1('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), m$1('.w-row.u-text-center', ctrl.statsLoader() ? h.loader() : [m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), m$1('.w-col.w-col-4', [m$1('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m$1('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), m$1('.w-section.section.bg-blue-one.fontcolor-negative', [m$1('.w-container', [m$1('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.w-row', [m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('div', [m$1('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m$1('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('div', [m$1('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m$1('a.w-button.btn.btn-large.btn-tweet[href="https://twitter.com/intent/tweet?text=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), m$1('.w-col.w-col-2')])])]), m$1('.w-section.section-large.bg-greenlime', [m$1('.w-container', [m$1('#participe-do-debate.u-text-center', { config: h.toAnchor() }, [m$1('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), m$1('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), m$1('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
            config: ctrl.addDisqus
        })])])]];
    }
};

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
var tooltip = {
    controller: function controller(args) {
        var parentHeight = m$1.prop(0),
            width = m$1.prop(args.width || 280),
            top = m$1.prop(0),
            left = m$1.prop(0),
            opacity = m$1.prop(0),
            parentOffset = m$1.prop({ top: 0, left: 0 }),
            tooltip = h.toggleProp(0, 1),
            toggle = function toggle() {
            tooltip.toggle();
            m$1.redraw();
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
        return m$1(args.el, {
            onclick: ctrl.toggle,
            config: ctrl.setParentPosition,
            style: { cursor: 'pointer' }
        }, ctrl.tooltip() ? [m$1('.tooltip.dark[style="width: ' + width + 'px; top: ' + ctrl.top() + 'px; left: ' + ctrl.left() + 'px;"]', {
            config: ctrl.setPosition
        }, [m$1('.fontsize-smallest', args.text)])] : '');
    }
};

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
var I18nScope$3 = _$1.partial(h.i18nScope, 'projects.dashboard_nav');
var linksScope = _$1.partial(h.i18nScope, 'projects.dashboard_nav_links');

var projectDashboardMenu = {
    controller: function controller(args) {
        var body = document.getElementsByTagName('body')[0],
            editLinksToggle = h.toggleProp(true, false),
            showPublish = h.toggleProp(true, false),
            bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed');

        var projectThumb = function projectThumb(project) {
            if (_$1.isEmpty(project.large_image)) {
                if (_$1.isEmpty(project.thumb_image)) {
                    return '/assets/thumb-project.png';
                } else {
                    return project.thumb_image;
                }
            } else {
                return project.large_image;
            }
        };

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
            bodyToggleForNav: bodyToggleForNav,
            projectThumb: projectThumb
        };
    },
    view: function view(ctrl, args) {
        var project = args.project(),
            projectRoute = '/projects/' + project.project_id,
            editRoute = projectRoute + '/edit',
            editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');
        var optionalOpt = m$1('span.fontsize-smallest.fontcolor-secondary', ' (opcional)');

        ctrl.body.className = ctrl.bodyToggleForNav();

        return m$1('#project-nav', [m$1('.project-nav-wrapper', [m$1('nav.w-section.dashboard-nav.side', [m$1('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m$1('img.thumb-project-dashboard[src="' + (project ? ctrl.projectThumb(project) : '/assets/thumb-project.png') + '"][width="114"]'), m$1('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m$1('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m$1('#info-links', [m$1('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m$1('span.fa.fa-bar-chart.fa-lg.fa-fw'), I18n$1.t('start_tab', I18nScope$3())]), project.is_published ? [m$1('a#dashboard_reports_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('contributions_report') ? 'selected' : '') + ('"][href="' + projectRoute + '/contributions_report"]'), [m$1('span.fa.fa.fa-table.fa-lg.fa-fw'), I18n$1.t('reports_tab', I18nScope$3())]), m$1('a#dashboard_reports_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('posts') ? 'selected' : '') + ('"][href="' + projectRoute + '/posts"]'), [m$1('span.fa.fa-bullhorn.fa-fw.fa-lg'), I18n$1.t('posts_tab', I18nScope$3()), m$1('span.badge', project.posts_count)])] : '']), m$1('.edit-project-div', [!project.is_published ? '' : m$1('button#toggle-edit-menu.dashboard-nav-link-left', {
            onclick: ctrl.editLinksToggle.toggle
        }, [m$1('span.fa.fa-pencil.fa-fw.fa-lg'), I18n$1.t('edit_project', I18nScope$3())]), ctrl.editLinksToggle() ? m$1('#edit-menu-items', [m$1('#dashboard-links', [!project.is_published || project.is_admin_role ? [m$1('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', I18n$1.t(project.mode + '.basics_tab', linksScope())), m$1('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', I18n$1.t(project.mode + '.goal_tab', linksScope()))] : '', m$1('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', I18n$1.t(project.mode + '.description_tab', linksScope())), m$1('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', m$1('span.fontsize-smallest.fontcolor-secondary', ' (opcional)')]), m$1('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', I18n$1.t(project.mode + '.budget_tab', linksScope())), m$1('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', I18n$1.t(project.mode + '.card_tab', linksScope())), m$1('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m$1('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', I18n$1.t(project.mode + '.about_you_tab', linksScope())), project.is_published || project.state === 'draft' || project.is_admin_role ? [m$1('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', I18n$1.t(project.mode + '.account_tab', linksScope()))] : '', !project.is_published ? [m$1('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m$1('span.fa.fa-fw.fa-eye.fa-lg'), I18n$1.t(project.mode + '.preview_tab', linksScope())])] : ''])]) : '', !project.is_published && ctrl.showPublish() ? [m$1('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m$1('a.btn.btn-medium[href="/projects/' + project.project_id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$3()), m$1.trust('&nbsp;&nbsp;'), m$1('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m$1('a.btn.btn-medium[href="/flexible_projects/' + project.project_id + '/validate_publish"]', [I18n$1.t('publish', I18nScope$3()), m$1.trust('&nbsp;&nbsp;'), m$1('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' && project.is_published ? [m$1('.btn-send-draft-fixed', _$1.isNull(project.expires_at) ? m$1('a.w-button.btn.btn-medium.btn-secondary-dark[href="/projects/' + project.project_id + '/edit#announce_expiration"]', I18n$1.t('announce_expiration', I18nScope$3())) : '')] : '']])])]), m$1('a.btn-dashboard href="javascript:void(0);"', {
            onclick: ctrl.bodyToggleForNav.toggle
        }, [m$1('span.fa.fa-bars.fa-lg')])]);
    }
};

/**
 * window.c.ModalBox component
 * Buils the template for using modal
 *
 * Example:
 * m.component(c.ModalBox, {
 *     displayModal: tooglePropObject,
 *     content: ['ComponentName', {argx: 'x', argy: 'y'}]
 * })
 * ComponentName structure =>  m('div', [
 *                  m('.modal-dialog-header', []),
 *                  m('.modal-dialog-content', []),
 *                  m('.modal-dialog-nav-bottom', []),
 *              ])
 */
var modalBox = {
    view: function view(ctrl, args) {
        return m$1('.modal-backdrop', [m$1('.modal-dialog-outer', [m$1('.modal-dialog-inner.modal-dialog-small', [m$1('a.w-inline-block.fa.fa-lg.modal-close' + (args.hideCloseButton ? '' : '.fa-close') + '[href="javascript:void(0);"]', {
            onclick: args.displayModal.toggle
        }), m$1.component(args.content[0], args.content[1])])])]);
    }
};

/**
 * window.c.AdminProjectDetailsCard component
 * render an box with some project statistics info
 *
 * Example:
 * m.component(c.AdminProjectDetailsCard, {
 *     resource: projectDetail Object,
 * })
 */
var adminProjectDetailsCard = {
    controller: function controller(args) {
        var project = args.resource,
            isFinalLap = function isFinalLap() {
            // @TODO: use 8 days because timezone on js
            return !_.isNull(project.expires_at) && moment$1().add(8, 'days') >= moment$1(project.zone_expires_at);
        };
        return {
            project: project,
            remainingTextObj: h.translatedTime(project.remaining_time),
            elapsedTextObj: h.translatedTime(project.elapsed_time),
            isFinalLap: isFinalLap
        };
    },
    view: function view(ctrl) {
        var project = ctrl.project,
            progress = project.progress.toFixed(2),
            statusTextObj = h.projectStateTextClass(project.state),
            remainingTextObj = ctrl.remainingTextObj,
            elapsedTextObj = ctrl.elapsedTextObj;

        return m$1('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m$1('div', [m$1('.fontsize-small.fontweight-semibold', [m$1('span.fontcolor-secondary', 'Status:'), ' ', m$1('span', {
            class: statusTextObj.cssClass
        }, ctrl.isFinalLap() && project.open_for_contributions ? 'RETA FINAL' : statusTextObj.text), ' ']), project.is_published ? [m$1('.meter.u-margintop-20.u-marginbottom-10', [m$1('.meter-fill', {
            style: {
                width: (progress > 100 ? 100 : progress) + '%'
            }
        })]), m$1('.w-row', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'financiado'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'levantados'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)])]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'restam'), m$1('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])] : ''])]);
    }
};

/**
 * window.c.OnlineSuccessModalContent component
 * Render online success message
 *
 */
var onlineSuccessModalContent = {
    view: function view(ctrl, args) {
        return m$1('.modal-dialog-content.u-text-center', [m$1('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m$1('p.fontsize-larger.lineheight-tight', 'Sua campanha está no ar!!! Parabéns por esse primeiro grande passo. Boa sorte nessa jornada ;)')]);
    }
};

/**
 * window.c.ProjectDataStats component
 * render a row with project stats info like:
 * state / total_contributions / total_pledged / elapsed | remaning time
 *
 * Example:
 * m.component(c.ProjectDataStats, {project: project})
 **/
var projectDataStats = {
    view: function view(ctrl, args) {
        var project = args.project(),
            progress = project.progress.toFixed(2),
            statusTextObj = h.projectStateTextClass(project.state),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time);

        return m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-3.u-text-center-small-only', [m$1('.fontsize-small.fontweight-semibold.u-marginbottom-20', [m$1('span.fontcolor-secondary', 'Status: '), m$1('span', { class: statusTextObj.cssClass }, statusTextObj.text)])]), m$1('.w-col.w-col-9', [m$1('.w-row.u-text-center', [m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m$1('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'), m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')]), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m$1('.fontweight-semibold.fontsize-large.lineheight-tight', 'R$ ' + h.formatNumber(project.pledged, 2)), m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')]), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m$1('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions), m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')]), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [_$1.isNull(project.expires_at) ? [m$1('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit), m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há')] : [m$1('.fontweight-semibold.fontsize-large.lineheight-tight', '' + remainingTextObj.total), m$1('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' ' + (remainingTextObj.total > 0 ? 'restantes' : 'restante'))]])])])]);
    }
};

/**
 * window.c.deleteProjectModalContent component
 * Render delete project modal
 *
 */
var deleteProjectModalContent = {
  controller: function controller(args) {
    var l = m$1.prop(false),
        deleteSuccess = m$1.prop(false),
        confirmed = m$1.prop(true),
        error = m$1.prop(''),
        check = m$1.prop('');

    var deleteProject = function deleteProject() {
      if (check() === 'deletar-rascunho') {
        var loaderOpts = models.deleteProject.postOptions({
          _project_id: args.project.project_id
        });
        l = postgrest$1.loaderWithToken(loaderOpts);
        l.load().then(function () {
          deleteSuccess(true);
        }).catch(function (err) {
          confirmed(false);
          error('Erro ao deletar projeto. Por favor tente novamente.');
          m$1.redraw();
        });
      } else {
        confirmed(false);
        error('Por favor, corrija os seguintes erros: para deletar definitivamente o projeto você deverá preencher "deletar-rascunho".');
      }
      return false;
    };

    return {
      deleteProject: deleteProject,
      confirmed: confirmed,
      deleteSuccess: deleteSuccess,
      error: error,
      check: check
    };
  },
  view: function view(ctrl, args) {
    var project = args.project;
    return m$1('div', ctrl.deleteSuccess() ? '' : m$1('.modal-dialog-header', m$1('.fontsize-large.u-text-center', ['Confirmar ', m$1('span.fa.fa-trash', '')])), m$1('form.modal-dialog-content', { onsubmit: ctrl.deleteProject }, ctrl.deleteSuccess() ? [m$1('.fontsize-base.u-margintop-30', 'Projeto deletado com sucesso. Clique no link abaixo para voltar a página inicial.'), m$1('a.btn.btn-inactive.btn-large.u-margintop-30[href=\'/pt/users/' + h.getUser().user_id + '/edit#projects\']', 'Voltar')] : [m$1('.fontsize-base.u-marginbottom-60', ['O projeto será deletado permanentemente e todos os dados que você preencheu na edição do rascunho não poderão ser recuperados.']), m$1('.fontsize-base.u-marginbottom-10', ['Confirme escrevendo ', 'no campo abaixo ', m$1('span.fontweight-semibold.text-error', 'deletar-rascunho')]), m$1('.w-form', m$1('.text-error.u-marginbottom-10', ctrl.error()), [m$1('div', m$1('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: ctrl.confirmed() ? false : 'error', placeholder: 'deletar-rascunho', onchange: m$1.withAttr('value', ctrl.check) }))]), m$1('div', m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.u-text-center.w-col.w-col-6', [m$1('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Deletar para sempre\']'), m$1('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: args.displayDeleteModal.toggle }, 'Cancelar')]), m$1('.w-col.w-col-3')]))]));
  }
};

/**
 * window.c.projectDeleteButton component
 * A button showing modal to delete draft project
 */
var projectDeleteButton = {
    controller: function controller(args) {
        var displayDeleteModal = h.toggleProp(false, true);
        return {
            displayDeleteModal: displayDeleteModal
        };
    },
    view: function view(ctrl, args) {
        return m$1('div', [ctrl.displayDeleteModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayDeleteModal,
            hideCloseButton: true,
            content: [deleteProjectModalContent, { displayDeleteModal: ctrl.displayDeleteModal, project: args.project }]
        }) : '', m$1('.before-footer', m$1('.w-container', m$1('a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button[href=\'javascript:void(0);\']', { onclick: ctrl.displayDeleteModal.toggle, style: { 'transition': 'all 0.5s ease 0s' } }, [m$1.trust('&nbsp;'), 'Deletar projeto ', m$1('span.fa.fa-trash', '')])))]);
    }
};

/**
 * window.c.cancelProjectModalContent component
 * Render cancel project modal
 *
 */
var cancelProjectModalContent = {
    controller: function controller(args) {
        var l = m$1.prop(false),
            checkError = m$1.prop(false),
            check = m$1.prop('');

        var showNextModal = function showNextModal() {
            if (check() === 'cancelar-projeto') {
                args.displayModal.toggle();
                document.getElementById('send-message').style.display = 'block';
            } else {
                checkError(true);
            }
            return false;
        };

        return {
            showNextModal: showNextModal,
            checkError: checkError,
            check: check
        };
    },
    view: function view(ctrl, args) {
        return m$1('form.cancel-project-modal.modal-dialog-content', { onsubmit: ctrl.showNextModal }, [m$1('.fontsize-small.u-marginbottom-20', ['Após o cancelamento, sua campanha constará na plataforma como "não financiada" e os seus apoiadores serão imediatamente reembolsados. ', m$1('span.fontweight-semibold', 'Essa ação não poderá ser desfeita!'), m$1('br'), m$1('span.fontweight-semibold')]), m$1('.fontsize-small.u-marginbottom-10', ['Se você tem certeza que deseja cancelar seu projeto, confirme escrevendo ', m$1('span.fontweight-semibold.text-error', 'cancelar-projeto '), 'no campo abaixo. Em seguida te pediremos para escrever uma mensagem aos seus apoiadores e seu projeto será então cancelado.', m$1('span.fontweight-semibold.text-error')]), m$1('.w-form', [m$1('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: !ctrl.checkError() ? false : 'error', placeholder: 'cancelar-projeto', onchange: m$1.withAttr('value', ctrl.check) })]), m$1('div', m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.u-text-center.w-col.w-col-6', [m$1('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Próximo passo >\']'), m$1('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: args.displayModal.toggle }, 'Cancelar')]), m$1('.w-col.w-col-3')]))]);
    }
};

/**
 * window.c.projectCancelButton component
 * A button showing modal to cancel online project
 */
var projectCancelButton = {
    controller: function controller(args) {
        var displayCancelModal = h.toggleProp(false, true);
        return {
            displayCancelModal: displayCancelModal
        };
    },
    view: function view(ctrl, args) {
        return m$1('div', [ctrl.displayCancelModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayCancelModal,
            content: [cancelProjectModalContent, { displayModal: ctrl.displayCancelModal }]
        }) : '', m$1('.w-row.before-footer', m$1('.w-col.w-col-12', m$1('.w-container', m$1('button.btn.btn-cancel.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button', { onclick: ctrl.displayCancelModal.toggle, style: { 'transition': 'all 0.5s ease 0s' } }, [m$1('span.fa.fa-times-circle', ''), m$1.trust('&nbsp;'), 'Cancelar projeto']))))]);
    }
};

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
            renderChart: renderChart,
            source: source
        };
    },
    view: function view(ctrl, args) {
        return m$1('.card.u-radius.medium.u-marginbottom-30', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), m$1('.w-row', [m$1('.w-col.w-col-12.overflow-auto', [!_$1.isEmpty(ctrl.source) ? m$1('canvas[id="chart"][width="860"][height="300"]', {
            config: ctrl.renderChart
        }) : m$1('.w-col.w-col-8.w-col-push-2', m$1('p.fontsize-base', args.emptyState))])])]);
    }
};

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

var projectReminderCount = {
    view: function view(ctrl, args) {
        var project = args.resource;
        return m$1('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m$1('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), m$1('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), m$1('.fontsize-jumbo', project.reminder_count)]);
    }
};

/**
 * window.c.DashboardInfo component
 * render a row of information with an icon and an optional call to action
 *
 * Example:
 * m.component(c.DashboardInfo, {
 *      content: {
 *          icon: 'url://to.icon',
 *          title: 'title',
 *          href: '#where-to',
 *          cta: 'next step'
 *      }
 * })
 **/
var dashboardInfo = {
    controller: function controller(args) {
        var toRedraw = args.dataToRedraw || {},
            listenToReplace = function listenToReplace(element, isInitialized, context) {

            if (isInitialized) return;

            _$1.map(element.children, function (item) {
                var toR = toRedraw[item.getAttribute('id')];

                if (toR) {
                    item[toR.action] = toR.actionSource;
                }
            });
        };

        return {
            listenToReplace: listenToReplace
        };
    },
    view: function view(ctrl, args) {
        var content = args.content;

        return m$1('.w-container', [m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6.w-col-push-3', [m$1('.u-text-center', [m$1('img.u-marginbottom-20', { src: content.icon, width: 94 }), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-20', content.title), m$1('.fontsize-base.u-marginbottom-30', { config: ctrl.listenToReplace }, m$1.trust(content.text)), content.cta ? m$1('a.btn.btn-large.btn-inline', { href: content.href, onclick: args.nextStage }, content.cta) : ''])])])]);
    }
};

/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountError component
 * render error form to collect user answer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountError, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
var I18nScope$6 = _$1.partial(h.i18nScope, 'projects.successful_onboard.confirm_account.refuse');

var projectSuccessfulOnboardConfirmAccountError = {
    controller: function controller(args) {
        var errorReasonM = m$1.prop(''),
            error = m$1.prop(false);

        var addErrorReason = function addErrorReason() {
            if (errorReasonM().trim() === '') {
                return error(true);
            } else {
                return args.addErrorReason(errorReasonM).call();
            }
        };

        return {
            addErrorReason: addErrorReason,
            errorReasonM: errorReasonM,
            error: error
        };
    },
    view: function view(ctrl, args) {
        return m$1('.w-row.bank-transfer-answer', [m$1('.w-col.w-col-6.w-col-push-3', [m$1('.w-form.bank-transfer-problem.card.u-radius', [m$1('form#successful-onboard-error', [m$1('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', { href: '#confirm_account', onclick: args.changeToAction('start') }), m$1('label.field-label.fontweight-semibold.u-marginbottom-20', I18n$1.t('title', I18nScope$6())), m$1('textarea.w-input.text-field', {
            placeholder: I18n$1.t('placeholder', I18nScope$6()),
            class: ctrl.error() ? 'error' : '',
            onfocus: function onfocus() {
                return ctrl.error(false);
            },
            onchange: m$1.withAttr('value', ctrl.errorReasonM)
        }), ctrl.error() ? m$1('.w-row', [m$1('.w-col.w-col-6.w-col-push-3.u-text-center', [m$1('span.fontsize-smallest.text-error', 'Campo Obrigatório')])]) : '', m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('a.w-button.btn.btn-medium', {
            href: '#confirm_account_refuse',
            onclick: ctrl.addErrorReason
        }, I18n$1.t('cta', I18nScope$6()))])])])])])]);
    }
};

/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountAccept component
 * render confirmation message to accept bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountAccept, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
var I18nScope$7 = _$1.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

var projectSuccessfulOnboardConfirmAccountAccept = {
    view: function view(ctrl, args) {
        return m$1('.w-row.bank-transfer-answer', [m$1('.w-col.w-col-6.w-col-push-3', [m$1('.w-form.bank-transfer-confirm.card.u-radius', [m$1('form#successful-onboard-form', [m$1('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', { href: '#confirm_account', onclick: args.changeToAction('start') }), m$1('label.field-label.fontweight-semibold.u-marginbottom-20', I18n$1.t('accept.title', I18nScope$7())), m$1('.fontsize-smaller.u-marginbottom-30', I18n$1.t('accept.info', I18nScope$7())), m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', [!args.acceptAccountLoader() ? m$1('a.w-button.btn.btn-medium', {
            href: '#accept_account',
            onclick: args.acceptAccount
        }, I18n$1.t('accept.cta', I18nScope$7())) : h.loader()])])])])])]);
    }
};

/**
 * window.c.ProjectSuccessfulOnboardConfirmAccount component
 * render project account data to confirm or add error
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccount, {projectAccount: projectAccount})
 **/
var I18nScope$5 = _$1.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

var projectSuccessfulOnboardConfirmAccount = {
    controller: function controller(args) {
        var actionStages = {
            'error': projectSuccessfulOnboardConfirmAccountError,
            'accept': projectSuccessfulOnboardConfirmAccountAccept
        },
            currentStage = m$1.prop('start'),
            actionStage = function actionStage() {
            return actionStages[currentStage()];
        },
            changeToAction = function changeToAction(stage) {
            return function () {
                currentStage(stage);

                return false;
            };
        };

        return {
            changeToAction: changeToAction,
            actionStage: actionStage,
            currentStage: currentStage
        };
    },
    view: function view(ctrl, args) {
        var projectAccount = args.projectAccount,
            actionStage = ctrl.actionStage,
            currentStage = ctrl.currentStage,
            personKind = projectAccount.owner_document.length > 14 ? 'juridical' : 'natural',
            juridicalPerson = projectAccount.owner_document.length > 14;

        return m$1('.w-container.u-marginbottom-40', [m$1('.u-text-center', [m$1('.fontsize-large.fontweight-semibold.u-marginbottom-30', I18n$1.t('title', I18nScope$5()))]), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-6', [m$1('.fontsize-base.u-marginbottom-30.card.card-terciary', [m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.label', I18nScope$5())), I18n$1.t('person.' + personKind + '.label', I18nScope$5())]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.' + personKind + '.name', I18nScope$5())), projectAccount.owner_name]), projectAccount.state_inscription && juridicalPerson ? m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.state_inscription', I18nScope$5())), projectAccount.state_inscription]) : '', m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.' + personKind + '.document', I18nScope$5())), projectAccount.owner_document]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.bank.name', I18nScope$5())), projectAccount.bank_name]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.bank.agency', I18nScope$5())), '' + projectAccount.agency + (_$1.isEmpty(projectAccount.agency_digit) ? '' : '-' + projectAccount.agency_digit)]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.bank.account', I18nScope$5())), projectAccount.account + '-' + projectAccount.account_digit])])]), m$1('.w-col.w-col-6', [m$1('.fontsize-base.u-marginbottom-30.card.card-terciary', [m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.address', I18nScope$5())), projectAccount.address_street + ', ' + projectAccount.address_number + ' ' + (!_$1.isNull(projectAccount.address_complement) ? ', ' + projectAccount.address_complement : '')]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.neighbourhood', I18nScope$5())), projectAccount.address_neighbourhood]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.city', I18nScope$5())), projectAccount.address_city]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.state', I18nScope$5())), projectAccount.address_state]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('person.zip_code', I18nScope$5())), projectAccount.address_zip_code])])])]), currentStage() === 'start' ? m$1('#confirmation-dialog.w-row.bank-transfer-answer', [m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny'), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m$1('a#confirm-account.btn.btn-large', { href: '#confirm_account', onclick: ctrl.changeToAction('accept') }, 'Sim')]), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m$1('a#refuse-account.btn.btn-large.btn-terciary', { href: '#error_account', onclick: ctrl.changeToAction('error') }, 'Não')]), m$1('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny')]) : m$1.component(actionStage(), {
            projectAccount: projectAccount,
            changeToAction: ctrl.changeToAction,
            addErrorReason: args.addErrorReason,
            acceptAccount: args.acceptAccount,
            acceptAccountLoader: args.acceptAccountLoader
        })]);
    }
};

/**
 * window.c.SuccessfulProjectTaxModal component
 * Modal content for show project transfer complete values data
 */
var successfulProjectTaxModal = {
    view: function view(ctrl, args) {
        var pt = args.projectTransfer;

        return m$1('div', [m$1('.modal-dialog-header', [m$1('.fontsize-large.u-text-center', 'Extrato do projeto')]), m$1('.modal-dialog-content', [m$1('p.fontsize-small.u-marginbottom-40', ['Confira o extrato do seu projeto, já incluindo as taxas e retenções. Se você tiver dúvidas sobre como esse cálculo é feito, ', m$1('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="__blank"]', 'acesse aqui'), '.']), m$1('div', [m$1('.w-row.fontsize-small.u-marginbottom-10', [m$1('.w-col.w-col-4', [m$1('.text-success', '+\xA0R$ ' + h.formatNumber(pt.pledged, 2))]), m$1('.w-col.w-col-8', [m$1('div', 'Arrecada\xE7\xE3o total (' + pt.total_contributions + ' apoios)')])]), pt.irrf_tax > 0 ? m$1('.w-row.fontsize-small.u-marginbottom-10', [m$1('.w-col.w-col-4', [m$1('.text-success', '+ R$ ' + h.formatNumber(pt.irrf_tax, 2))]), m$1('.w-col.w-col-8', [m$1('div', 'Retenção IRF (Imposto de Renda na Fonte)')])]) : '', m$1('.w-row.fontsize-small.u-marginbottom-10', [m$1('.w-col.w-col-4', [m$1('.text-error', '- R$ ' + h.formatNumber(pt.catarse_fee, 2))]), m$1('.w-col.w-col-8', [m$1('div', 'Taxa do Catarse e meio de pagamento (' + h.formatNumber(pt.service_fee * 100, 2) + '%)\xA0')])]), m$1('.divider.u-marginbottom-10'), m$1('.w-row.fontsize-base.fontweight-semibold', [m$1('.w-col.w-col-4', [m$1('div', 'R$ ' + h.formatNumber(pt.total_amount, 2))]), m$1('.w-col.w-col-8', [m$1('div', 'Total a ser transferido')])])])])]);
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var I18nScope$8 = _$1.partial(h.i18nScope, 'projects.successful_onboard');

var parseAccountData = function parseAccountData(account, transfer) {
    return {
        transfer_limit_date: h.momentify(account.transfer_limit_date),
        total_amount: h.formatNumber(transfer.total_amount, 2),
        bank_name: account.bank_name,
        agency: '' + account.agency + (account.agency_digit ? '-' + account.agency_digit : ''),
        account: '' + account.account + (account.account_digit ? '-' + account.account_digit : ''),
        user_email: account.user_email
    };
};

var insightVM = {
    content: function content(state, data) {
        var translations = I18n$1.translations[I18n$1.currentLocale()].projects.successful_onboard[state],
            translationContext = state === 'finished' ? {} : parseAccountData(_$1.first(data.account()), _$1.first(data.transfer()));
        var contentObj = {};

        _$1.map(translations, function (translation, translationKey) {
            contentObj = _$1.extend({}, contentObj, defineProperty({}, translationKey, I18n$1.t(state + '.' + translationKey, I18nScope$8(translationContext))));
        });
        return contentObj;
    }
};

/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/
var I18nScope$4 = _.partial(h.i18nScope, 'projects.successful_onboard');

var projectSuccessfulOnboard = {
    controller: function controller(args) {
        var projectIdVM = postgrest$1.filtersVM({ project_id: 'eq' }),
            projectAccounts = m$1.prop([]),
            projectTransfers = m$1.prop([]),
            showTaxModal = h.toggleProp(false, true),
            onboardComponents = {
            'start': dashboardInfo,
            'confirm_account': projectSuccessfulOnboardConfirmAccount,
            'error_account': dashboardInfo,
            'pending_transfer': dashboardInfo,
            'finished': dashboardInfo
        },
            currentState = m$1.prop('start'),
            currentComponent = function currentComponent() {
            return onboardComponents[currentState()];
        },
            content = function content() {
            return insightVM.content(currentState(), {
                account: projectAccounts,
                transfer: projectTransfers,
                showTaxModal: showTaxModal
            });
        },
            loader = postgrest$1.loaderWithToken,
            declineAccountLoader = function declineAccountLoader(errorMsg) {
            var pa = _.first(projectAccounts());

            return postgrest$1.loaderWithToken(models.projectAccountError.postOptions({
                project_id: args.project().project_id,
                reason: errorMsg
            }));
        },
            acceptAccountLoader = postgrest$1.loaderWithToken(models.projectAccount.postOptions({
            project_id: args.project().project_id
        }));

        projectIdVM.project_id(args.project().project_id);

        var lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
        lProjectAccount.load().then(function (data) {
            projectAccounts(data);

            loadCurrentStage();
        });

        var lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
        lProjectTransfer.load().then(projectTransfers);

        var setStage = function setStage(state) {
            currentState(state);

            return currentComponent;
        },
            nextStage = function nextStage() {
            var keys = _.keys(onboardComponents),
                nextKey = keys[_.indexOf(keys, currentState()) + 1];

            currentState(nextKey);

            return currentComponent;
        },
            loadCurrentStage = function loadCurrentStage() {
            if (!lProjectAccount()) {
                var pa = _.first(projectAccounts());

                if (_.isNull(pa)) {
                    return setStage('finished')();
                }

                if (_.isNull(pa.error_reason) && _.isNull(pa.transfer_state)) {
                    return setStage('start')();
                } else if (!_.isNull(pa.error_reason)) {
                    return setStage('error_account')();
                } else if (!_.isNull(pa.transfer_state)) {
                    if (pa.transfer_state == 'transferred') {
                        return setStage('finished')();
                    } else {
                        return setStage('pending_transfer')();
                    }
                }
            }

            return false;
        },


        // TODO: need to add an error validation to not null
        addErrorReason = function addErrorReason(errorProp) {
            return function () {
                var fn = declineAccountLoader(errorProp());
                fn.load().then(function () {
                    setStage('error_account')();
                });

                return false;
            };
        },
            acceptAccount = function acceptAccount() {
            acceptAccountLoader.load().then(function () {
                setStage('pending_transfer')();
            });

            return false;
        };

        return {
            projectAccounts: projectAccounts,
            projectTransfers: projectTransfers,
            lProjectAccount: lProjectAccount,
            lProjectTransfer: lProjectTransfer,
            setStage: setStage,
            nextStage: nextStage,
            currentComponent: currentComponent,
            addErrorReason: addErrorReason,
            acceptAccount: acceptAccount,
            acceptAccountLoader: acceptAccountLoader,
            content: content,
            declineAccountLoader: declineAccountLoader,
            loadCurrentStage: loadCurrentStage,
            showTaxModal: showTaxModal
        };
    },
    view: function view(ctrl, args) {
        var projectAccount = _.first(ctrl.projectAccounts()),
            projectTransfer = _.first(ctrl.projectTransfers()),
            lpa = ctrl.lProjectAccount,
            lpt = ctrl.lProjectTransfer;

        return m$1('.w-section.section', [ctrl.showTaxModal() ? m$1.component(modalBox, {
            displayModal: ctrl.showTaxModal,
            content: [successfulProjectTaxModal, {
                projectTransfer: projectTransfer
            }]
        }) : '', !lpa() && !lpt() ? m$1.component(ctrl.currentComponent(), {
            projectTransfer: projectTransfer,
            projectAccount: projectAccount,
            setStage: ctrl.setStage,
            addErrorReason: ctrl.addErrorReason,
            acceptAccount: ctrl.acceptAccount,
            acceptAccountLoader: ctrl.acceptAccountLoader,
            nextStage: ctrl.nextStage,
            content: ctrl.content(),
            dataToRedraw: {
                'tax_link': {
                    action: 'onclick',
                    actionSource: function actionSource() {
                        ctrl.showTaxModal.toggle();
                        m$1.redraw();
                    }
                }
            }
        }) : h.loader()]);
    }
};

var facebookButton = {
    controller: function controller(args) {
        var share = function share() {
            if (FB) {
                FB.ui({
                    method: args.messenger ? 'send' : 'share',
                    link: args.url,
                    href: args.url
                });
            }
        };

        return {
            share: share
        };
    },
    view: function view(ctrl, args) {
        var buttonCss = function buttonCss() {
            if (args.mobile) {
                return 'w-hidden-main w-hidden-medium u-marginbottom-20 btn btn-medium btn-fb';
            } else if (args.big) {
                return 'btn btn-fb btn-large u-marginbottom-20 w-button';
            } else if (args.medium) {
                return 'btn ' + (args.messenger ? 'btn-messenger' : 'btn-fb') + ' btn-medium u-marginbottom-20 w-button';
            } else {
                return 'btn btn-inline btn-medium btn-terciary u-marginright-20';
            }
        };

        return m$1('button', {
            class: buttonCss(),
            onclick: ctrl.share
        }, [m$1('span.fa', {
            class: args.messenger ? 'fa-comment' : 'fa-facebook'
        }), args.messenger ? ' Messenger' : ' Facebook']);
    }
};

var popNotification = {
    controller: function controller() {
        return {
            displayNotification: h.toggleProp(true, false)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.displayNotification() ? m$1('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', {
            class: args.error ? 'card-error' : ''
        }, [m$1('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
            onclick: ctrl.displayNotification.toggle
        }), m$1('.fontsize-small', args.message)]) : m$1('span');
    }
};

/**
 * copyTextInput component
 * Displays a text input that copies it's content on click
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(copyTextInput, {value: 'some value'})
 *   ...
 * }
 */
var copyTextInput = {
    controller: function controller(args) {
        var showSuccess = m$1.prop(false);

        var select = function select(el) {
            var range = void 0,
                selection = void 0;

            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        var setClickHandler = function setClickHandler(el, isInitialized) {
            var copy = void 0;
            if (!isInitialized) {
                (function () {
                    var textarea = document.getElementById('copy-textarea');
                    el.onclick = function () {
                        select(textarea);
                        copy = document.execCommand('copy');
                        if (copy) {
                            showSuccess(true);
                            m$1.redraw();
                        } else {
                            textarea.blur();
                        }
                    };
                })();
            }
        };

        return {
            setClickHandler: setClickHandler,
            showSuccess: showSuccess
        };
    },
    view: function view(ctrl, args) {
        return m$1('#clipboard.w-row', [m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m$1('textarea#copy-textarea.positive.text-field.w-input', {
            style: 'margin-bottom:0;'
        }, args.value)), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', m$1('.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-clipboard.w-button', {
            config: ctrl.setClickHandler
        })), ctrl.showSuccess() ? m$1.component(popNotification, { message: 'Link copiado' }) : '']);
    }
};

var projectInviteCard = {
    view: function view(ctrl, args) {
        var project = args.project;

        return m$1('.card.card-secondary.u-marginbottom-20.u-radius.w-clearfix', [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-30.u-text-center', 'Convide seus amigos para apoiar sua campanha'), m$1('.w-row', [m$1('.w-sub-col.u-marginbottom-20.w-col.w-col-4', [m$1.component(facebookButton, { url: h.projectFullPermalink(project) + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share_insights', medium: true })]), m$1('.w-sub-col.u-marginbottom-20.w-col.w-col-4', [m$1.component(facebookButton, { messenger: true, url: h.projectFullPermalink(project) + '?ref=facebook&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share_insights', medium: true })]), m$1('.w-col.w-col-4', [m$1('.w-form', [m$1('form[data-name=\'Email Form 2\'][id=\'email-form-2\'][name=\'email-form-2\']', [m$1.component(copyTextInput, { value: h.projectFullPermalink(project) + '?ref=project_link' })])])])])]);
    }
};

var I18nScope$2 = _$1.partial(h.i18nScope, 'projects.insights');

var insights = {
    controller: function controller(args) {
        var filtersVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            displayModal = h.toggleProp(false, true),
            projectDetails = m$1.prop([]),
            contributionsPerDay = m$1.prop([]),
            contributionsPerLocation = m$1.prop([]),
            loader = postgrest$1.loaderWithToken,
            setProjectId = function setProjectId() {
            try {
                var project_id = m$1.route.param('project_id');

                filtersVM.project_id(project_id);
            } catch (e) {
                filtersVM.project_id(args.root.getAttribute('data-id'));
            }
        };

        if (h.paramByName('online_success') === 'true') {
            displayModal.toggle();
        }

        setProjectId();

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
                m$1('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_contributed, 2, 3), m$1('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        var lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        var contributionsPerRefTable = [[I18n$1.t('ref_table.header.origin', I18nScope$2()), I18n$1.t('ref_table.header.contributions', I18nScope$2()), I18n$1.t('ref_table.header.amount', I18nScope$2())]];
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

                column.push(contribution.referral_link ? I18n$1.t('referral.' + contribution.referral_link, I18nScope$2({ defaultValue: contribution.referral_link })) : I18n$1.t('referral.others', I18nScope$2()));
                column.push(contribution.total);
                column.push([contribution.total_amount, [m$1('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_amount, 2, 3), m$1('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
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
            buildTooltip = function buildTooltip(el) {
            return m$1.component(tooltip, {
                el: el,
                text: ['Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ', m$1('a[href="' + I18n$1.t('ref_table.help_url', I18nScope$2()) + '"][target=\'_blank\']', 'aqui.')],
                width: 380
            });
        };

        if (!ctrl.l()) {
            project.user.name = project.user.name || 'Realizador';
        }

        return m$1('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? m$1.component(projectDashboardMenu, {
            project: m$1.prop(project)
        }) : '', ctrl.displayModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: [onlineSuccessModalContent]
        }) : '', m$1('.w-container', project.state === 'successful' ? m$1.component(projectSuccessfulOnboard, { project: m$1.prop(project) }) : [m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-8.w-col-push-2', [m$1('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10.u-text-center.dashboard-header', I18n$1.t('campaign_title', I18nScope$2())), project.state === 'online' ? m$1.component(projectInviteCard, { project: project }) : '', project.state === 'draft' ? m$1.component(adminProjectDetailsCard, {
            resource: project
        }) : '', m$1('p.' + project.state + '-project-text.u-text-center.fontsize-small.lineheight-loose', [project.mode === 'flex' && _$1.isNull(project.expires_at) && project.state !== 'draft' ? m$1('span', [I18n$1.t('finish_explanation', I18nScope$2()), m$1('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/213783503-tudo-sobre-Prazo-da-campanha"][target="_blank"]', I18n$1.t('know_more', I18nScope$2()))]) : m$1.trust(I18n$1.t('campaign.' + project.mode + '.' + project.state, I18nScope$2({ username: project.user.name, expires_at: h.momentify(project.zone_expires_at), sent_to_analysis_at: h.momentify(project.sent_to_analysis_at) })))])])])]), project.state === 'draft' ? m$1.component(projectDeleteButton, { project: project }) : '', project.is_published ? [m$1('.divider'), m$1('.w-section.section-one-column.section.bg-gray.before-footer', [m$1('.w-container', [m$1.component(projectDataStats, { project: m$1.prop(project) }), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m$1.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: I18n$1.t('amount_per_day_label', I18nScope$2()),
            dataKey: 'total_amount',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: I18n$1.t('amount_per_day_empty', I18nScope$2())
        }) : h.loader()])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m$1.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: I18n$1.t('contributions_per_day_label', I18nScope$2()),
            dataKey: 'total',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: I18n$1.t('contributions_per_day_empty', I18nScope$2())
        }) : h.loader()])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1('.project-contributions-per-ref', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n$1.t('ref_origin_title', I18nScope$2()), h.newFeatureBadge(), buildTooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? !_$1.isEmpty(_$1.rest(ctrl.contributionsPerRefTable)) ? m$1.component(projectDataTable, {
            table: ctrl.contributionsPerRefTable,
            defaultSortIndex: -2
        }) : m$1('.card.u-radius.medium.u-marginbottom-60', m$1('.w-row.u-text-center.u-margintop-40.u-marginbottom-40', m$1('.w-col.w-col-8.w-col-push-2', m$1('p.fontsize-base', I18n$1.t('contributions_per_ref_empty', I18nScope$2()))))) : h.loader()])])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1('.project-contributions-per-ref', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n$1.t('location_origin_title', I18nScope$2())), !ctrl.lContributionsPerLocation() ? !_$1.isEmpty(_$1.rest(ctrl.contributionsPerLocationTable)) ? m$1.component(projectDataTable, {
            table: ctrl.contributionsPerLocationTable,
            defaultSortIndex: -2
        }) : m$1('.card.u-radius.medium.u-marginbottom-60', m$1('.w-row.u-text-center.u-margintop-40.u-marginbottom-40', m$1('.w-col.w-col-8.w-col-push-2', m$1('p.fontsize-base', I18n$1.t('contributions_per_location_empty', I18nScope$2()))))) : h.loader()])])]), m$1('.w-row', [m$1('.w-col.w-col-12.u-text-center', [m$1.component(projectReminderCount, {
            resource: project
        })])])])]), project.state === 'online' && (project.is_admin_role || project.pledged == 0) ? m$1.component(projectCancelButton, { project: project }) : ''] : ''] : h.loader());
    }
};

var postsPreview = {
    controller: function controller(args) {
        var togglePreview = function togglePreview() {
            args.showPreview(false);
        },
            sendNotification = function sendNotification(e) {
            e.preventDefault();

            var notificationData = {
                title: args.title(),
                comment_html: args.comment_html(),
                reward_id: args.reward_id >= 1 ? args.reward_id : null,
                recipients: args.reward_id >= 1 ? 'reward' : args.reward_id == '-1' ? 'public' : 'backers'
            };

            return m$1.request({
                method: 'POST',
                url: '/projects/' + args.project_id + '/posts.json',
                data: {
                    project_post: notificationData,
                    project: args.project_id
                },
                config: h.setCsrfToken
            }).then(function () {
                args.showSuccess(true);
                args.comment_html('');
                args.title('');
                togglePreview();
                m$1.redraw();
            }).catch(function (err) {
                args.errors('Erro ao enviar mensagem.'), args.showError(true);
                m$1.redraw();
            });
        };
        return {
            sendNotification: sendNotification,
            togglePreview: togglePreview
        };
    },
    view: function view(ctrl, args) {
        var comment_html = args.comment_html(),
            title = args.title(),
            recipientsText = args.reward_id > 1 ? m$1('.fontsize-small.u-marginbottom-30', ['A novidade acima será enviada por email para os ', m$1('span.fontweight-semibold', args.rewardText), ' e ficará ', m$1('span.fontweight-semibold', 'visível na plataforma somente para esses apoiadores.')]) : args.reward_id == '-1' ? m$1('.fontsize-small.u-marginbottom-30', ['A novidade acima será  ', m$1('span.fontweight-semibold', 'enviada por email para todos'), ' os apoiadores e ficará ', m$1('span.fontweight-semibold', 'visível publicamente '), 'na plataforma.']) : m$1('.fontsize-small.u-marginbottom-30', [m$1('span', ' A novidade acima será  '), m$1('span.fontweight-semibold', 'enviada por email para todos os apoiadores'), m$1('span', ' e ficará '), m$1('span.fontweight-semibold', 'visível somente para esses na plataforma.')]);

        return m$1('div', [m$1('.dashboard-header.u-text-center', m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', m$1('.fontsize-larger.fontweight-semibold.lineheight-tight', 'Revise sua novidade antes de enviar!')), m$1('.w-col.w-col-3')]))), m$1('.section', [m$1('.w-container', m$1('.card.u-marginbottom-60.u-radius.w-row', [m$1('.w-col.w-col-1'), m$1('.u-marginbottom-30.u-margintop-30.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [m$1('.fontcolor-secondary.fontsize-small.u-text-center', '16/01/2017'), m$1('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center', title), m$1('.fontsize-base', m$1.trust(comment_html))]), m$1('.w-col.w-col-1')])), m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', recipientsText), m$1('.w-col.w-col-3')]), m$1('.u-marginbottom-20.w-row', [m$1('.w-col.w-col-3'), m$1('._w-sub-col.w-col.w-col-4', m$1('button.btn.btn-large', {
            onclick: ctrl.sendNotification
        }, [m$1('span.fa.fa-paper-plane', ''), ' ', m$1.trust('&nbsp;'), 'Enviar'])), m$1('.w-col.w-col-2', m$1('button.btn.btn-large.btn-terciary', {
            onclick: ctrl.togglePreview
        }, 'Editar')), m$1('.w-col.w-col-3')])])]);
    }
};

var posts = {
    controller: function controller(args) {

        var deleteFormSubmit = void 0;
        var showPreview = m$1.prop(false),
            showSuccess = m$1.prop(false),
            showError = m$1.prop(false),
            titleHasError = m$1.prop(false),
            commentHasError = m$1.prop(false),
            projectPosts = m$1.prop(),
            errors = m$1.prop(''),
            fields = {
            title: m$1.prop(''),
            comment_html: m$1.prop(''),
            reward_id: m$1.prop('-1')
        },
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            togglePreview = function togglePreview() {
            if (!validateTitle()) {
                errors('Título não pode ficar em branco.');
                showError(true);
            } else if (!validateComment()) {
                errors('Mensagem não pode ficar em branco.');
                showError(true);
            } else {
                showPreview(true);
            }
            return false;
        },
            project_id = args.root.getAttribute('data-id'),
            projectDetails = m$1.prop([]),
            loader = postgrest$1.loaderWithToken,
            validateComment = function validateComment() {
            var comment = String(fields.comment_html());
            if (comment.length == 0) {
                commentHasError(true);
            }

            return !commentHasError();
        },
            validateTitle = function validateTitle() {
            var title = String(fields.title());
            if (title.length == 0) {
                titleHasError(true);
            }

            return !titleHasError();
        },
            setProjectId = function setProjectId() {
            try {
                var _project_id = m$1.route.param('project_id');

                filterVM.project_id(_project_id);
            } catch (e) {
                filterVM.project_id(args.root.getAttribute('data-id'));
            }
        },
            rewardText = function rewardText(rewardId) {
            var reward = _$1.find(rewardVM.rewards(), function (reward) {
                return reward.id == rewardId;
            });
            return 'Apoiadores da recompensa R$' + reward.minimum_value + ' - ' + (reward.description.substring(0, 50) + '...');
        },
            showRecipientes = function showRecipientes(post) {
            if (post.recipients == 'public') {
                return 'Todo mundo (apoiadores e não apoiadores)';
            } else if (post.recipients == 'backers') {
                return 'Todos os apoiadores';
            } else {
                var reward = _$1.find(rewardVM.rewards(), function (reward) {
                    return reward.id == post.reward_id;
                });
                if (reward) {
                    return rewardText(reward.id);
                } else {
                    return '...';
                }
            }
        },
            toDeletePost = m$1.prop(-1),
            deletePost = function deletePost(post) {
            return function () {
                toDeletePost(post.id);
                m$1.redraw(true);
                deleteFormSubmit();
                return false;
            };
        },
            setPostDeletionForm = function setPostDeletionForm(el, isInit) {
            if (!isInit) {
                deleteFormSubmit = function deleteFormSubmit() {
                    return el.submit();
                };
            }
        };

        filterVM.project_id(project_id);
        var listVM = postgrest$1.loaderWithToken(models.projectPostDetail.getPageOptions(_$1.extend(filterVM.parameters(), { order: 'created_at.desc' }))),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        listVM.load().then(projectPosts);

        setProjectId();

        rewardVM.fetchRewards(project_id);

        l.load().then(projectDetails);

        return {
            l: l,
            projectPosts: projectPosts,
            showRecipientes: showRecipientes,
            fields: fields,
            showPreview: showPreview,
            togglePreview: togglePreview,
            project_id: project_id,
            deletePost: deletePost,
            rewardText: rewardText,
            errors: errors,
            showSuccess: showSuccess,
            titleHasError: titleHasError,
            commentHasError: commentHasError,
            showError: showError,
            setPostDeletionForm: setPostDeletionForm,
            toDeletePost: toDeletePost,
            projectDetails: projectDetails
        };
    },
    view: function view(ctrl) {
        var project = _$1.first(ctrl.projectDetails());

        return project ? m$1('.project-posts', project.is_owner_or_admin ? m$1.component(projectDashboardMenu, {
            project: m$1.prop(project)
        }) : '', ctrl.showPreview() ? m$1.component(postsPreview, {
            showError: ctrl.showError,
            showSuccess: ctrl.showSuccess,
            errors: ctrl.errors,
            showPreview: ctrl.showPreview,
            project_id: ctrl.project_id,
            comment_html: ctrl.fields.comment_html,
            title: ctrl.fields.title,
            reward_id: ctrl.fields.reward_id(),
            rewardText: ctrl.fields.reward_id() >= 1 ? ctrl.rewardText(ctrl.fields.reward_id()) : null
        }) : [ctrl.showSuccess() ? m$1.component(popNotification, {
            message: 'Mensagem enviada com sucesso'
        }) : '', ctrl.showError() ? m$1.component(popNotification, {
            message: ctrl.errors(),
            error: true
        }) : '', m$1('.dashboard-header.u-text-center', m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', m$1('.fontsize-larger.fontweight-semibold.lineheight-tight', 'Envie uma novidade para seus apoiadores')), m$1('.w-col.w-col-3')]))), m$1('.section', m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [m$1('.u-marginbottom-60.u-text-center', m$1('._w-inline-block.card.fontsize-small.u-radius', [m$1('span.fa.fa-lightbulb-o', ''), ' Veja ótimo motivos para ', m$1('a.alt-link[href=\'https://catarse.attach.io/B1AHAGm1x\'][target=\'_blank\']', 'falar com seus apoiadores agora mesmo!')])), m$1('.card.card-terciary.medium.u-marginbottom-80.w-form', [m$1('form', [m$1('label.field-label.fontweight-semibold', 'Destinatários'), m$1('select.positive.text-field.w-select', {
            onchange: m$1.withAttr('value', ctrl.fields.reward_id)
        }, [m$1('option[value=\'-1\']', {
            selected: true
        }, 'Todo mundo (apoiadores e não apoiadores)'), m$1('option[value=\'0\']', 'Todos os apoiadores'), _$1.map(rewardVM.rewards(), function (reward) {
            return m$1('option[value=\'' + reward.id + '\']', 'Apoiadores da recompensa R$' + reward.minimum_value + ' - ' + (reward.description.substring(0, 50) + '...'));
        })]), m$1('label.field-label.fontweight-semibold', 'Título'), m$1('input.positive.text-field.w-input[id=\'post_title\'][maxlength=\'256\'][type=\'text\']', {
            name: 'posts[title]',
            value: ctrl.fields.title(),
            onfocus: function onfocus() {
                return ctrl.titleHasError(false);
            },
            class: ctrl.titleHasError() ? 'error' : '',
            onchange: m$1.withAttr('value', ctrl.fields.title)
        }), m$1('label.field-label.fontweight-semibold', 'Texto'), m$1('.preview-container.u-marginbottom-40', h.redactor('posts[comment_html]', ctrl.fields.comment_html)), m$1('.u-marginbottom-20.w-row', [m$1('.w-col.w-col-3'), m$1('._w-sub-col.w-col.w-col-6', m$1('button.btn.btn-large', {
            onclick: ctrl.togglePreview
        }, 'Pré-visualizar')), m$1('.w-col.w-col-3')])])]), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-40', 'Novidades já enviadas'), m$1('.table-outer.u-marginbottom-60', [m$1('.fontsize-smaller.fontweight-semibold.header.table-row.w-row', [m$1('.table-col.w-col.w-col-5', m$1('div', 'Título')), m$1('.table-col.u-text-center.w-col.w-col-3', m$1('div', 'Enviadas')), m$1('.table-col.u-text-center.w-col.w-col-3', m$1('div', 'Abertas')), m$1('.table-col.w-col.w-col-1')]), !_$1.isEmpty(ctrl.projectPosts()) ? m$1('.fontsize-small.table-inner', [_$1.map(ctrl.projectPosts(), function (post) {
            return m$1('.table-row.w-row', [m$1('.table-col.w-col.w-col-5', [m$1('a.alt-link.fontsize-base[href=\'/projects/' + project.project_id + '/posts/' + post.id + '#posts#\'][target=\'_blank\']', post.title), m$1('.fontcolor-secondary.fontsize-smallest', [m$1('span.fontweight-semibold', 'Enviada em: '), h.momentify(post.created_at, 'DD/MM/YYYY, h:mm A')]), m$1('.fontcolor-secondary.fontsize-smallest', [m$1('span.fontweight-semibold', 'Destinatários: '), ctrl.showRecipientes(post)])]), m$1('.table-col.u-text-center.w-col.w-col-3', m$1('.fontsize-base', post.delivered_count)), m$1('.table-col.u-text-center.w-col.w-col-3', m$1('.fontsize-base', post.open_count)), m$1('.table-col.w-col.w-col-1', m$1('button.btn.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                onclick: ctrl.deletePost(post)
            }))]);
        }), m$1('form.w-hidden', {
            action: '/pt/projects/' + project.project_id + '/posts/' + ctrl.toDeletePost(),
            method: 'POST',
            config: ctrl.setPostDeletionForm
        }, [m$1('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'), m$1('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'), m$1('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']')])]) : h.loader()])]), m$1('.w-col.w-col-1')])))]) : h.loader();
    }
};

var I18nScope$9 = _.partial(h.i18nScope, 'pages.jobs');

var jobs = {
    view: function view(ctrl, args) {
        return [m$1('.w-section.hero-jobs.hero-medium', [m$1('.w-containe.u-text-center', [m$1('img.icon-hero[src="/assets/logo-white.png"]'), m$1('.u-text-center.u-marginbottom-20.fontsize-largest', I18n$1.t('title', I18nScope$9()))])]), m$1('.w-section.section', [m$1('.w-container.u-margintop-40', [m$1('.w-row', [m$1('.w-col.w-col-8.w-col-push-2.u-text-center', [m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('info', I18nScope$9())), m$1('a[href="/projects/new"].w-button.btn.btn-large.btn-inline', I18n$1.t('cta', I18nScope$9()))])])])])];
    }
};

var liveStatistics = {
    controller: function controller() {
        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
            return [m$1('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m$1('.fontcolor-negative.u-marginbottom-40', [m$1('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)), m$1('.fontsize-large', 'Doados para projetos publicados por aqui')]), m$1('.fontcolor-negative.u-marginbottom-60', [m$1('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m$1('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
        })), !_$1.isEmpty(data) ? m$1('.w-container', [m$1('div', [m$1('.card.u-radius.u-marginbottom-60.medium', [m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4', [m$1('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')]), m$1('.w-col.w-col-8.w-col-small-8', [m$1('.fontsize-large.lineheight-tight', data.user_name)])])]), m$1('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m$1('div', 'acabou de apoiar o')]), m$1('.w-col.w-col-4', [m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4', [m$1('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m$1('.w-col.w-col-8.w-col-small-8', [m$1('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m$1('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m$1('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m$1('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
    }
};

var projectContributionReportHeader = {
    view: function view(ctrl, args) {
        var filterBuilder = args.filterBuilder,
            paymentStateFilter = _$1.findWhere(filterBuilder, { label: 'payment_state' }),
            rewardFilter = _$1.findWhere(filterBuilder, { label: 'reward_filter' }),
            mainFilter = _$1.findWhere(filterBuilder, { component: filterMain }),
            project_id = args.filterVM.project_id();

        rewardFilter.data.options = args.mapRewardsToOptions();

        return m$1('.w-section.dashboard-header', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]), m$1('.w-col.w-col-3')]), m$1('.w-form', [m$1('form', { onsubmit: args.submit }, [m$1('.w-row', [m$1('.w-col.w-col-5', [m$1('.w-row', [m$1.component(paymentStateFilter.component, paymentStateFilter.data), m$1.component(rewardFilter.component, rewardFilter.data)])]), m$1('.w-col.w-col-7.u-margintop-20', [m$1('.w-row', [m$1('.w-col.w-col-8._w-sub-col', [m$1.component(mainFilter.component, mainFilter.data)]), m$1('.w-col.w-col-4.w-clearfix.w-hidden-small.w-hidden-tiny', [m$1('a.alt-link.u-right.fontsize-small.lineheight-looser[href="/projects/' + project_id + '/download_reports"]', [m$1('span.fa.fa-download', '.'), ' Baixar relatórios'])])])])])])])])]);
    }
};

var projectContributionReportContentCard = {
    controller: function controller(args) {
        var project = args.project(),
            stateClass = function stateClass(state) {
            var classes = {
                online: {
                    'paid': 'text-success.fa-circle',
                    'refunded': 'text-error.fa-circle',
                    'pending_refund': 'text-error.fa-circle',
                    'pending': 'text-waiting.fa-circle',
                    'refused': 'text-error.fa-circle'
                },
                failed: {
                    'paid': 'text-error.fa-circle-o',
                    'refunded': 'text-refunded.fa-circle',
                    'pending_refund': 'text-refunded.fa-circle-o',
                    'pending': 'text-refunded',
                    'refused': 'text-refunded'
                },
                waiting_funds: {
                    'paid': 'text-success.fa-circle',
                    'refunded': 'text-error.fa-circle',
                    'pending_refund': 'text-error.fa-circle',
                    'pending': 'text-waiting.fa-circle',
                    'refused': 'text-error.fa-circle'
                },
                successful: {
                    'paid': 'text-success.fa-circle',
                    'refunded': 'text-error.fa-circle',
                    'pending_refund': 'text-error.fa-circle',
                    'pending': 'text-waiting.fa-circle',
                    'refused': 'text-error.fa-circle'
                }
            };

            return classes[project.state][state];
        };

        return {
            stateClass: stateClass
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution(),
            profile_img = _$1.isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail,
            reward = contribution.reward || { minimum_value: 0, description: 'Nenhuma recompensa selecionada' };
        return m$1('.w-clearfix.card', [m$1('.w-row', [m$1('.w-col.w-col-1.w-col-tiny-1', [m$1('img.user-avatar.u-marginbottom-10[src=\'' + profile_img + '\']')]), m$1('.w-col.w-col-11.w-col-tiny-11', [m$1('.w-row', [m$1('.w-col.w-col-3', [m$1('.fontcolor-secondary.fontsize-mini.fontweight-semibold', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm')), m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name), m$1('.fontsize-smallest.lineheight-looser', [contribution.has_another ? [m$1('a.link-hidden-light.badge.badge-light', '+1 apoio ')] : '', contribution.anonymous ? m$1('span.fa.fa-eye-slash.fontcolor-secondary', m$1('span.fontcolor-secondary[style="font-size:11px;"]', ' Apoio não-público')) : '']), m$1('.fontsize-smallest.lineheight-looser', contribution.email)]), m$1('.w-col.w-col-3', [m$1('.lineheight-tighter', [m$1('span.fa.fontsize-smallest.' + ctrl.stateClass(contribution.state)), '   ', m$1('span.fontsize-large', 'R$ ' + h.formatNumber(contribution.value, 2, 3))])]), m$1('.w-col.w-col-3.w-hidden-small.w-hidden-tiny', [m$1('.fontsize-smallest.fontweight-semibold', 'Recompensa:\xA0R$ ' + h.formatNumber(reward.minimum_value, 2, 3)), m$1('.fontsize-smallest', reward.description.substring(0, 80) + '...')]) /*,
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
        return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-9.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-base', [m$1('span.fontweight-semibold', list.isLoading() ? '' : list.total()), ' apoios'])])]), _$1.map(list.collection(), function (item) {
            var contribution = m$1.prop(item);
            return m$1.component(projectContributionReportContentCard, { project: args.project, contribution: contribution });
        })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : h.loader()])])])])]);
    }
};

var vm$4 = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'in',
    reward_id: 'eq',
    project_id: 'eq'
});
var paramToString$2 = function paramToString$2(p) {
    return (p || '').toString().trim();
};

vm$4.state('');
vm$4.order({
    id: 'desc'
});

vm$4.full_text_index.toFilter = function () {
    var filter = paramToString$2(vm$4.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

vm$4.withNullParameters = function () {
    var withNullVm = postgrest.filtersVM({
        full_text_index: '@@',
        state: 'in',
        reward_id: 'is',
        project_id: 'eq'
    });

    withNullVm.full_text_index(vm$4.full_text_index());
    withNullVm.order(vm$4.order());
    withNullVm.state(vm$4.state());
    withNullVm.reward_id(vm$4.reward_id());
    withNullVm.project_id(vm$4.project_id());

    return withNullVm.parameters();
};

var I18nScope$10 = _$1.partial(h.i18nScope, 'projects.contributions_report.legend_labels');

var ProjectContributionStateLegendModal = {
    controller: function controller(args) {
        var translate = function translate(path) {
            return I18n$1.t(path, I18nScope$10());
        };

        return {
            stages: {
                online: [{
                    label: translate('online.paid.label'),
                    text: translate('online.paid.text'),
                    i_class: '.fa.fa-circle.text-success'
                }, {
                    label: translate('online.pending.label'),
                    text: translate('online.pending.text'),
                    i_class: '.fa.fa-circle.text-waiting'
                }, {
                    label: translate('online.refunded.label'),
                    text: translate('online.refunded.text'),
                    i_class: '.fa.fa-circle.text-error'
                }],
                failed: [{
                    label: translate('failed.pending_refund.label'),
                    text: translate('failed.pending_refund.text'),
                    i_class: '.fa.fa-circle-o.text-refunded'
                }, {
                    label: translate('failed.refunded.label'),
                    text: translate('failed.refunded.text'),
                    i_class: '.fa.fa-circle.text-refunded'
                }, {
                    label: translate('failed.paid.label'),
                    text: translate('failed.paid.text'),
                    i_class: '.fa.fa-circle-o.text-error'
                }],
                successful: [{
                    label: translate('successful.paid.label'),
                    text: translate('successful.paid.text'),
                    i_class: '.fa.fa-circle.text-success'
                }, {
                    label: translate('successful.refunded.label'),
                    text: translate('successful.refunded.text'),
                    i_class: '.fa.fa-circle.text-error'
                }]

            }
        };
    },
    view: function view(ctrl, args) {
        var project = _$1.first(args.project()),
            project_stage = project.state == 'waiting_funds' ? 'online' : project.state;

        return m$1('div', [m$1('.modal-dialog-header', [m$1('.fontsize-large.u-text-center', 'Status do apoio')]), m$1('.modal-dialog-content', _$1.map(ctrl.stages[project_stage], function (item, i) {
            return m$1('.u-marginbottom-20', [m$1('.fontsize-small.fontweight-semibold', [m$1('span' + item.i_class), ' \xA0' + item.label]), m$1('.fontsize-smaller', m$1.trust(item.text))]);
        }))]);
    }
};

var InfoProjectContributionStateLegend = {
    controller: function controller(args) {
        return {
            modalToggle: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m$1('span', [args.text, m$1.trust('&nbsp;'), m$1('a.fa.fa-question-circle.fontcolor-secondary[href="#"]', {
            onclick: ctrl.modalToggle.toggle
        }, ''), ctrl.modalToggle() ? m$1.component(modalBox, {
            displayModal: ctrl.modalToggle,
            content: [ProjectContributionStateLegendModal, {
                project: args.project
            }]
        }) : '']);
    }
};

var projectContributionReport = {
    controller: function controller(args) {
        var listVM = postgrest$1.paginationVM(models.projectContribution, 'id.desc', { 'Prefer': 'count=exact' }),
            filterVM = vm$4,
            project = m$1.prop([{}]),
            rewards = m$1.prop([]),
            contributionStateOptions = m$1.prop([]),
            reloadSelectOptions = function reloadSelectOptions(project_state) {
            var opts = [{ value: '', option: 'Todos' }];

            var options_map = {
                'online': [{ value: 'paid', option: 'Confirmado' }, { value: 'pending', option: 'Iniciado' }, { value: 'refunded,chargeback,deleted,pending_refund', option: 'Contestado' }],
                'waiting_funds': [{ value: 'paid', option: 'Confirmado' }, { value: 'pending', option: 'Iniciado' }, { value: 'refunded,chargeback,deleted,pending_refund', option: 'Contestado' }],
                'failed': [{ value: 'pending_refund', option: 'Reembolso em andamento' }, { value: 'refunded', option: 'Reembolsado' }, { value: 'paid', option: 'Reembolso não iniciado' }],
                'successful': [{ value: 'paid', option: 'Confirmado' }, { value: 'refunded,chargeback,deleted,pending_refund', option: 'Contestado' }]
            };

            opts = opts.concat(options_map[project_state] || []);

            contributionStateOptions(opts);
        },
            filterBuilder = [{
            component: filterMain,
            data: {
                inputWrapperClass: '.w-input.text-field',
                btnClass: '.btn.btn-medium',
                vm: filterVM.full_text_index,
                placeholder: 'Busque por nome ou email do apoiador'
            }
        }, {
            label: 'reward_filter',
            component: filterDropdown,
            data: {
                label: 'Recompensa',
                name: 'reward_id',
                vm: filterVM.reward_id,
                wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle',
                options: []
            }
        }, {
            label: 'payment_state',
            component: filterDropdown,
            data: {
                custom_label: [InfoProjectContributionStateLegend, {
                    text: 'Status do apoio',
                    project: project
                }],
                name: 'state',
                vm: filterVM.state,
                wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle',
                options: contributionStateOptions
            }
        }],
            submit = function submit() {
            if (filterVM.reward_id() === 'null') {
                listVM.firstPage(filterVM.withNullParameters()).then(null);
            } else {
                listVM.firstPage(filterVM.parameters()).then(null);
            }

            return false;
        };

        filterVM.project_id(args.root.getAttribute('data-id'));

        var lReward = postgrest$1.loaderWithToken(models.rewardDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));
        var lProject = postgrest$1.loaderWithToken(models.projectDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));

        lReward.load().then(rewards);
        lProject.load().then(function (data) {
            project(data);
            reloadSelectOptions(_$1.first(data).state);
        });

        var mapRewardsToOptions = function mapRewardsToOptions() {
            var options = [];
            if (!lReward()) {
                options = _$1.map(rewards(), function (r) {
                    return {
                        value: r.id,
                        option: 'R$ ' + h.formatNumber(r.minimum_value, 2, 3) + ' - ' + r.description.substring(0, 20)
                    };
                });
            }

            options.unshift({
                value: null,
                option: 'Sem recompensa'
            });

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
            lProject: lProject,
            rewards: rewards,
            project: project,
            mapRewardsToOptions: mapRewardsToOptions
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.listVM;

        if (!ctrl.lProject()) {
            return [m$1.component(projectDashboardMenu, { project: m$1.prop(_$1.first(ctrl.project())) }), m$1.component(projectContributionReportHeader, {
                submit: ctrl.submit,
                filterBuilder: ctrl.filterBuilder,
                form: ctrl.filterVM.formDescriber,
                mapRewardsToOptions: ctrl.mapRewardsToOptions,
                filterVM: ctrl.filterVM
            }), m$1('.divider.u-margintop-30'), m$1.component(projectContributionReportContent, {
                list: list,
                project: m$1.prop(_$1.first(ctrl.project()))
            })];
        } else {
            return h.loader();
        }
    }
};

/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
var projectsDashboard = {
    controller: function controller(args) {
        projectVM.init(args.project_id, args.project_user_id);

        return projectVM;
    },
    view: function view(ctrl) {
        var project = ctrl.currentProject;

        return project().is_owner_or_admin ? m$1.component(projectDashboardMenu, { project: project }) : '';
    }
};

/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

var search = {
    view: function view(ctrl) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var action = args.action || '/pt/explore?ref=ctrse_explore_pgsearch',
            method = args.method || 'GET';

        return m$1('#search.w-container.w-hidden-main.w-hidden-medium', [m$1('.w-row', [m$1('.w-col.w-col-10.u-marginbottom-20', [m$1('.w-form', [m$1('form#email-form', { action: action, method: method }, [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m$1('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')]), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m$1('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [m$1('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
    }
};

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
var categoryButton = {
    view: function view(ctrl, args) {
        var category = args.category;

        return m$1('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m$1('a.w-inline-block.btn-category[href=\'#by_category_id/' + category.id + '\']', [m$1('div', [category.name, m$1('span.badge.explore', category.online_projects)])])]);
    }
};

var UnsignedFriendFacebookConnect = {
    controller: function controller(args) {
        return {
            largeBg: function () {
                if (_$1.isUndefined(args)) {
                    return false;
                } else {
                    return _$1.isUndefined(args.largeBg) ? false : args.largeBg;
                }
            }()
        };
    },
    view: function view(ctrl, args) {
        return m$1('.w-section.section' + (ctrl.largeBg ? '.bg-backs-carrosel.section-large' : ''), [m$1('.w-container', [m$1('.card.card-big', [m$1('.w-row', [m$1('.w-col.w-col-8', [m$1('.fontsize-largest.u-marginbottom-20', 'Encontre projetos incríveis junto com seus amigos'), m$1('.fontsize-small', 'O universo do Catarse junto com a sua rede do Facebook te farão descobrir projetos incríveis!')]), m$1('.w-col.w-col-4', [m$1('a.w-button.btn.btn-fb.btn-large.u-margintop-30.u-marginbottom-10[href="/connect-facebook"]', 'Conecte seu facebook'), m$1('.fontsize-smallest.fontcolor-secondary.u-text-center', 'Nós nunca postaremos nada no facebook sem sua permissão')])])])])]);
    }
};

/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
var I18nScope$11 = _$1.partial(h.i18nScope, 'pages.explore');

// TODO Slim down controller by abstracting logic to view-models where it fits
var projectsExplore = {
    controller: function controller(args) {
        var filters = postgrest$1.filtersVM,
            projectFiltersVM$$1 = projectFiltersVM(),
            filtersMap = projectFiltersVM$$1.filters,
            defaultFilter = h.paramByName('filter') || 'all',
            fallbackFilter = 'all',
            currentFilter = m$1.prop(filtersMap[defaultFilter]),
            changeFilter = function changeFilter(newFilter) {
            currentFilter(filtersMap[newFilter]);
            loadRoute();
        },
            resetContextFilter = function resetContextFilter() {
            currentFilter(filtersMap[defaultFilter]);
            projectFiltersVM$$1.setContextFilters(['finished', 'all', 'contributed_by_friends']);
        },
            currentUser = h.getUser() || {},
            currentUserId = currentUser.id,
            hasFBAuth = currentUser.has_fb_auth,
            buildTooltip = function buildTooltip(tooltipText) {
            return m$1.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        },
            hint = function hint() {
            // TODO Add copies to i18n.
            var hintText = '',
                tooltipText = '',
                hasHint = false;
            if (currentFilter().keyName === 'all') {
                hasHint = true;
                hintText = 'Ordenados por popularidade ';
                tooltipText = 'O nosso fator popularidade é uma mistura da seleção do time do Catarse com um valor que é calculado pela velocidade de arrecadação do projeto';
            } else if (currentFilter().keyName === 'finished') {
                hasHint = true;
                hintText = 'Ordenados por R$ alcançado ';
                tooltipText = 'Os projetos com maior meta de arrecadação alcançada ficam no topo';
            } else if (currentFilter().keyName === 'contributed_by_friends') {
                hasHint = true;
                hintText = 'Projetos apoiados por amigos ';
                tooltipText = 'Projetos apoiados por amigos';
            }

            return hasHint ? m$1('.fontsize-smaller.fontcolor-secondary', [hintText, buildTooltip(tooltipText)]) : '';
        },
            isSearch = m$1.prop(false),
            categoryCollection = m$1.prop([]),
            categoryId = m$1.prop(),
            findCategory = function findCategory(id) {
            return _$1.find(categoryCollection(), function (c) {
                return c.id === parseInt(id);
            });
        },
            category = _$1.compose(findCategory, categoryId),
            loadCategories = function loadCategories() {
            return models.category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection);
        },

        // just small fix when have two scored projects only
        checkForMinScoredProjects = function checkForMinScoredProjects(collection) {
            return _$1.size(_$1.filter(collection, function (x) {
                return x.score >= 1;
            })) >= 3;
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
                search$$1 = h.paramByName('pg_search'),
                searchProjects = function searchProjects() {
                var l = postgrest$1.loaderWithToken(models.projectSearch.postOptions({ query: search$$1 })),
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

            if (_$1.isString(search$$1) && search$$1.length > 0 && route === null) {
                isSearch(true);
                title('Busca ' + search$$1);
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
            route || _$1.isString(search$$1) && search$$1.length > 0 ? toggleCategories(false) : toggleCategories(true);
        },
            title = m$1.prop(),
            toggleCategories = h.toggleProp(false, true);

        window.addEventListener('hashchange', function () {
            resetContextFilter();
            loadRoute();
            m$1.redraw();
        }, false);

        // Initial loads
        resetContextFilter();
        models.project.pageSize(9);
        loadCategories().then(loadRoute);

        if (args.filter) {
            currentFilter(filtersMap[args.filter]);
        }

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
            hint: hint,
            filtersMap: filtersMap,
            currentFilter: currentFilter,
            projectFiltersVM: projectFiltersVM$$1,
            toggleCategories: toggleCategories,
            isSearch: isSearch,
            hasFBAuth: hasFBAuth,
            checkForMinScoredProjects: checkForMinScoredProjects
        };
    },
    view: function view(ctrl, args) {
        var projects_collection = ctrl.projects().collection(),
            projectsCount = projects_collection.length,
            widowProjects = [],
            filterKeyName = ctrl.currentFilter().keyName,
            isContributedByFriendsFilter = filterKeyName === 'contributed_by_friends';

        if (!ctrl.projects().isLoading() && _$1.isEmpty(projects_collection) && !ctrl.isSearch()) {
            if (isContributedByFriendsFilter && !ctrl.hasFBAuth) {} else {
                ctrl.projectFiltersVM.removeContextFilter(ctrl.currentFilter());
                ctrl.changeFilter(ctrl.fallbackFilter);
            }
        }

        return m$1('#explore', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$11())) }, [m$1('.w-section.hero-search', [m$1.component(search), m$1('.w-container.u-marginbottom-10', [m$1('.u-text-center.u-marginbottom-40', [m$1('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                return ctrl.toggleCategories.toggle();
            } }, ['Explore projetos incríveis ', m$1('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m$1('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m$1('.w-row.u-marginbottom-30', [_$1.map(ctrl.categories(), function (category) {
            return m$1.component(categoryButton, { category: category });
        })])])])]), m$1('.w-section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [m$1('.fontsize-larger', ctrl.title()), ctrl.hint()]), m$1('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? m$1('select.w-select.text-field.positive', { onchange: m$1.withAttr('value', ctrl.changeFilter) }, _$1.map(ctrl.projectFiltersVM.getContextFilters(), function (pageFilter, idx) {
            var projects = ctrl.projects(),
                isSelected = ctrl.currentFilter() == pageFilter;

            return m$1('option[value="' + pageFilter.keyName + '"]', { selected: isSelected }, pageFilter.nicename);
        })) : '')])])]), isContributedByFriendsFilter && _$1.isEmpty(projects_collection) ? !ctrl.hasFBAuth ? m$1.component(UnsignedFriendFacebookConnect) : '' : '', m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-row', _$1.map(projects_collection, function (project, idx) {
            var cardType = 'small',
                ref = 'ctrse_explore';

            if (ctrl.isSearch()) {
                ref = 'ctrse_explore_pgsearch';
            } else if (isContributedByFriendsFilter) {
                ref = 'ctrse_explore_friends';
            } else if (filterKeyName === 'all') {
                if (project.score >= 1) {
                    if (idx === 0) {
                        cardType = 'big';
                        ref = 'ctrse_explore_featured_big';
                        widowProjects = [projectsCount - 1, projectsCount - 2];
                    } else if (idx === 1 || idx === 2) {
                        if (ctrl.checkForMinScoredProjects(projects_collection)) {
                            cardType = 'medium';
                            ref = 'ctrse_explore_featured_medium';
                            widowProjects = [];
                        } else {
                            cardType = 'big';
                            ref = 'ctrse_explore_featured_big';
                            widowProjects = [projectsCount - 1];
                        }
                    } else {
                        ref = 'ctrse_explore_featured';
                    }
                }
            }

            return _$1.indexOf(widowProjects, idx) > -1 && !ctrl.projects().isLastPage() ? '' : m$1.component(projectCard, { project: project, ref: ref, type: cardType, showFriends: isContributedByFriendsFilter });
        })), ctrl.projects().isLoading() ? h.loader() : _$1.isEmpty(projects_collection) && ctrl.hasFBAuth ? m$1('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : ''])])]), m$1('.w-section.u-marginbottom-80', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _$1.isEmpty(projects_collection) ? '' : m$1('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                ctrl.projects().nextPage();return false;
            } }, 'Carregar mais')])])])]), m$1('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [m$1('.w-container.u-text-center', [m$1('img.u-marginbottom-20.icon-hero', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png' }), m$1('h2.fontsize-larger.u-marginbottom-60', 'Lance sua campanha no Catarse!'), m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Aprenda como')])])])])]);
    }
};

var menuSearch = {
    view: function view(ctrl, args) {
        return m$1('span#menu-search', [m$1('.w-form.w-hidden-small.w-hidden-tiny.header-search[id=\'discover-form-wrapper\']', [m$1('form.discover-form[accept-charset=\'UTF-8\'][action=\'/pt/explore?ref=ctrse_header\'][id=\'search-form\'][method=\'get\']', [m$1('div', { style: { 'display': 'none' } }, m$1('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']')), m$1('input.w-input.text-field.prefix.search-input[autocomplete=\'off\'][id=\'pg_search\'][name=\'pg_search\'][placeholder=\'Busque projetos\'][type=\'text\']')]), m$1('.search-pre-result.w-hidden[data-searchpath=\'/pt/auto_complete_projects\']', [m$1('.result', m$1('.u-text-center', m$1('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader.gif\']'))), m$1('a.btn.btn-small.btn-terciary.see-more-projects[href=\'javascript:void(0);\']', ' ver todos')])]), m$1('a.w-inline-block.w-hidden-small.w-hidden-tiny.btn.btn-dark.btn-attached.postfix[href=\'#\'][id=\'pg_search_submit\']', m$1('img.header-lupa[alt=\'Lupa\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa.png\']'))]);
    }
};

var menuProfile = {
    controller: function controller(args) {
        var contributedProjects = m$1.prop(),
            latestProjects = m$1.prop([]),
            userDetails = m$1.prop({}),
            user_id = args.user.user_id;

        var userName = function userName() {
            var name = userDetails().name;
            if (name && !_$1.isEmpty(name)) {
                return _$1.first(name.split(' '));
            }

            return '';
        };

        userVM.fetchUser(user_id, true, userDetails);

        return {
            contributedProjects: contributedProjects,
            latestProjects: latestProjects,
            userDetails: userDetails,
            userName: userName,
            toggleMenu: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m$1('.w-dropdown.user-profile', [m$1('a.w-dropdown-toggle.dropdown-toggle[href=\'javascript:void()\'][id=\'user-menu\']', {
            onclick: ctrl.toggleMenu.toggle
        }, [m$1('.user-name-menu', ctrl.userName()), m$1('img.user-avatar[alt=\'Thumbnail - ' + user.name + '\'][height=\'40\'][src=\'' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '\'][width=\'40\']')]), ctrl.toggleMenu() ? m$1('nav.w-dropdown-list.dropdown-list.user-menu.w--open[id=\'user-menu-dropdown\']', { style: 'display:block;' }, [m$1('.w-row', [m$1('.w-col.w-col-12', [m$1('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'Meu hist\xF3rico'), m$1('ul.w-list-unstyled.u-marginbottom-20', [m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#contributions\']', 'Hist\xF3rico de apoio')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#projects\']', 'Projetos criados')), m$1('li.w-hidden-main.w-hidden-medium.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#projects\']', 'Projetos criados'))]), m$1('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'Configura\xE7\xF5es'), m$1('ul.w-list-unstyled.u-marginbottom-20', [m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/connect-facebook/\']', 'Encontre amigos'), m$1.trust('&nbsp;'), m$1('span.badge.badge-success', 'Novidade')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#about_me\']', 'Perfil p\xFAblico')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#notifications\']', 'Notifica\xE7\xF5es')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#settings\']', 'Dados e endere\xE7o')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '/edit#billing\']', 'Banco e cart\xF5es'))]), m$1('.divider.u-marginbottom-20'), args.user.is_admin_role ? m$1('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'Admin') : '', args.user.is_admin_role ? m$1('ul.w-list-unstyled.u-marginbottom-20', [m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/new-admin#/users\']', 'Usu\xE1rios')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/new-admin\']', 'Apoios')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/admin/financials\']', 'Rel. Financeiros')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/admin/projects\']', 'Admin projetos')), m$1('li.lineheight-looser', m$1('a.alt-link.fontsize-smaller[href=\'/pt/dbhero\']', 'Dataclips'))]) : '', m$1('.fontsize-mini', 'Seu e-mail de cadastro é: '), m$1('.fontsize-smallest.u-marginbottom-20', [m$1('span.fontweight-semibold', user.email + ' '), m$1('a.alt-link[href=\'/pt/users/' + user.id + '/edit#settings\']', 'alterar e-mail')]), m$1('.divider.u-marginbottom-20'), m$1('a.alt-link[href=\'/pt/logout\']', 'Sair')])])]) : '']);
    }
};

var menu = {
    controller: function controller(args) {
        var user = h.getUser(),
            menuCss = function menuCss() {
            var dynamicClasses = void 0;

            return (args.menuTransparency ? 'overlayer' : '') + ' ' + (args.withAlert ? 'with-global-alert' : '');
        },
            homeAttrs = function homeAttrs() {
            if (args.absoluteHome) {
                return {
                    href: h.rootUrl()
                };
            } else {
                return {
                    config: m$1.route
                };
            }
        };

        return {
            user: user,
            menuCss: menuCss,
            homeAttrs: homeAttrs
        };
    },
    view: function view(ctrl, args) {
        return m$1('header.main-header', {
            class: ctrl.menuCss()
        }, [m$1('.w-row', [m$1('.w-clearfix.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m$1('a.header-logo.w-inline-block[href=\'/?ref=ctrse_header\'][title=\'Catarse\']', ctrl.homeAttrs(), m$1('img[alt=\'Logo big\'][src=\'/assets/catarse_bootstrap/logo_big.png\']')), args.menuShort ? '' : m$1('div#menu-components', [m$1('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/start?ref=ctrse_header\']', { config: m$1.route }, 'Comece seu projeto'), m$1('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/explore?ref=ctrse_header\']', { config: m$1.route }, 'Explore'), m$1.component(menuSearch)])]), m$1('.text-align-right.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [ctrl.user ? m$1.component(menuProfile, { user: ctrl.user }) : m$1('a.w-nav-link.header-link.w-nav-link.btn-edit.u-right[href=\'/pt/login?ref=ctrse_header\']', 'Login')])]), args.menuShort ? '' : m$1('.header-controls-mobile.w-hidden-main.w-hidden-medium', [m$1('a.header-link.w-nav-link[href=\'/pt/start?ref=ctrse_header\']', { onclick: function onclick() {
                return m$1.route('/start');
            } }, 'Comece seu projeto'), m$1('a.header-link.w-nav-link[href=\'/pt/explore?ref=ctrse_header\']', { onclick: function onclick() {
                return m$1.route('/explore');
            } }, 'Explore')])]);
    }
};

var homeVM = function homeVM() {
    var i18nStart = I18n$1.translations[I18n$1.currentLocale()].projects.home,
        banners = i18nStart.banners;

    return {
        banners: banners
    };
};

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
            }

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
            args.onchange && args.onchange();
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

/**
 * window.c.ContributionActivities component
 * Render a component that pass on confirmed contributions in 24hours interval
 *
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.ContributionActivities)
 *     ...
 * }
 */

/*       */
var blogVM = {
    getBlogPosts: function getBlogPosts() {
        var deferred = m$1.deferred();
        var posts = _$1.first(document.getElementsByTagName('body')).getAttribute('data-blog');

        if (posts) {
            deferred.resolve(JSON.parse(posts));
        } else {
            m$1.request({ method: 'GET', url: '/posts' }).then(deferred.resolve).catch(deferred.reject);
        }

        return deferred.promise;
    }
};

//      
var blogBanner = {
    controller: function controller(args) {
        var posts = m$1.prop([]),
            error = m$1.prop(false);

        blogVM.getBlogPosts().then(posts).catch(error);

        return { posts: posts, error: error };
    },
    view: function view(ctrl, args) {

        return m$1('section.section-large.bg-gray.before-footer[id=\'blog\']', m$1('.w-container', [m$1('.u-text-center', [m$1('a[href=\'http://blog.catarse.me\'][target=\'blank\']', m$1('img.u-marginbottom-10[alt=\'Icon blog\'][src=\'/assets/icon-blog.png\']')), m$1('.fontsize-large.u-marginbottom-60.text-success', m$1('a.link-hidden-success[href=\'http://blog.catarse.me\'][target=\'__blank\']', 'Blog do Catarse'))]), m$1('.w-row', _$1.map(ctrl.posts(), function (post) {
            return m$1('.w-col.w-col-4.col-blog-post', [m$1('a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href="' + post[1][1] + '"][target=\'__blank\']', post[0][1]), m$1('.fontsize-smaller.fontcolor-secondary.u-margintop-10', m$1.trust(h.strip(post[6][1].substr(0, 130)) + '...'))]);
        })), ctrl.error() ? m$1('.w-row', m$1('.w-col.w-col-12.u-text-center', 'Erro ao carregar posts...')) : '']));
    }
};

var footer = {
    view: function view() {
        return m$1('footer.main-footer.main-footer-neg', [m$1('section.w-container', m$1('.w-row', [m$1('.w-col.w-col-9', m$1('.w-row', [m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny', [m$1('.footer-full-signature-text.fontsize-small', 'Bem-vindo'), m$1('a.link-footer[href=\'http://ano.catarse.me/2016?ref=ctrse_footer\']', ['Retrospectiva 2016', m$1.trust('&nbsp;'), m$1('span.badge.badge-success', 'Novidade‍')]), m$1('a.link-footer[href=\'http://crowdfunding.catarse.me/paratodos?ref=ctrse_footer\']', ' Como funciona'), m$1('a.link-footer[href=\'https://www.catarse.me/pt/flex?ref=ctrse_footer\']', ' Catarse flex'), m$1('a.link-footer[href=\'https://www.catarse.me/pt/team?ref=ctrse_footer\']', [' Nosso time ', m$1.trust('&lt;'), '3']), m$1('a.link-footer[href=\'http://facebook.com/catarse.me\']', ' Facebook'), m$1('a.link-footer[href=\'http://twitter.com/catarse\']', ' Twitter'), m$1('a.link-footer[href=\'http://instagram.com/catarse\']', ' Instagram'), m$1('a.link-footer[href=\'http://github.com/catarse/catarse\']', ' Github'), m$1('a.link-footer[href=\'http://blog.catarse.me\']', ' Blog'), m$1('a.link-footer[href=\'https://www.catarse.me/pt/jobs\']', ' Trabalhe conosco')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn', [m$1('.footer-full-signature-text.fontsize-small', 'Ajuda'), m$1('a.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/requests/new\'][target="_BLANK"]', ' Contato'), m$1('a.link-footer[href=\'http://crowdfunding.catarse.me/nossa-taxa?ref=ctrse_footer\']', ' Nossa Taxa'), m$1('a.link-footer[href=\'https://www.catarse.me/pt/press?ref=ctrse_footer\']', ' Imprensa'), m$1('a.link-footer[href=\'http://suporte.catarse.me?ref=ctrse_footer/\']', ' Central de Suporte'), m$1('a.link-footer[href=\'https://www.catarse.me/pt/guides?ref=ctrse_footer\']', ' Guia dos Realizadores'), m$1('a.link-footer[href=\'http://pesquisa.catarse.me/\']', ' Retrato FC Brasil 2013/2014'), m$1('a.link-footer[href=\'/pt/terms-of-use\']', ' Termos de uso'), m$1('a.link-footer[href=\'/pt/privacy-policy\']', ' Política de privacidade')]), m$1('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn', [m$1('.footer-full-signature-text.fontsize-small', 'Navegue'), m$1('a.w-hidden-small.w-hidden-tiny.link-footer[href=\'/pt/start?ref=ctrse_footer\']', ' Comece seu projeto'), m$1('a.link-footer[href=\'/pt/explore?ref=ctrse_footer\']', ' Explore projetos'), m$1('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://blog.catarse.me?ref=ctrse_footer\']', ' Blog'), m$1('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'https://equipecatarse.zendesk.com/account/dropboxes/20298537\']', ' Contato'), m$1('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=score&ref=ctrse_footer\']', ' Populares'), m$1('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=online&ref=ctrse_footer\']', ' No ar'), m$1('a.w-hidden-tiny.link-footer[href=\'/pt/explore?filter=finished&ref=ctrse_footer\']', ' Finalizados')])])), m$1('.w-col.w-col-3.column-social-media-footer', [m$1('.footer-full-signature-text.fontsize-small', 'Assine nossa news'), m$1('.w-form', m$1('form[accept-charset=\'UTF-8\'][action=\'' + h.getMailchimpUrl() + '\'][id=\'mailee-form\'][method=\'post\']', [m$1('.w-form.footer-newsletter', m$1('input.w-input.text-field.prefix[id=\'EMAIL\'][label=\'email\'][name=\'EMAIL\'][placeholder=\'Digite seu email\'][type=\'email\']')), m$1('button.w-inline-block.btn.btn-edit.postfix.btn-attached[style="padding:0;"]', m$1('img.footer-news-icon[alt=\'Icon newsletter\'][src=\'/assets/catarse_bootstrap/icon-newsletter.png\']'))])), m$1('.footer-full-signature-text.fontsize-small', 'Redes sociais'), m$1('.w-widget.w-widget-facebook.u-marginbottom-20', m$1('.facebook', m$1('.fb-like[data-colorscheme=\'dark\'][data-href=\'http://facebook.com/catarse.me\'][data-layout=\'button_count\'][data-send=\'false\'][data-show-faces=\'false\'][data-title=\'\'][data-width=\'260\']'))), m$1('.w-widget.w-widget-twitter', [m$1('a.twitter-follow-button[href="htt\u1E55://twitter.com/catarse"][data-button="blue"][data-text-color="#FFFFFF][data-link-color="#FFFFFF"][data-width="224px"]')]), m$1('.u-margintop-30', [m$1('.footer-full-signature-text.fontsize-small', 'Change language'), m$1('[id=\'google_translate_element\']')])])])), m$1('.w-container', m$1('.footer-full-copyleft', [m$1('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/logo-footer.png\']'), m$1('.lineheight-loose', m$1('a.link-footer-inline[href=\'http://github.com/catarse/catarse\']', ' Feito com amor | ' + new Date().getFullYear() + ' | Open source'))]))]);
    }
};

var I18nScope$12 = _$1.partial(h.i18nScope, 'projects.home');

var projectsHome = {
    controller: function controller(args) {
        var sample6 = _$1.partial(_$1.sample, _$1, 6),
            loader = postgrest$1.loaderWithToken,
            project = models.project,
            filters = projectFiltersVM().filters,
            userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            friendListVM = postgrest$1.paginationVM(models.userFriend, 'user_id.desc', {
            'Prefer': 'count=exact'
        }),
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            vm = homeVM();

        project.pageSize(20);

        userFriendVM.user_id(currentUser.user_id);

        if (hasFBAuth && !friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        var collections = _$1.map(['score', 'contributed_by_friends'], function (name) {
            var f = filters[name],
                cLoader = loader(project.getPageOptions(_$1.extend({}, { order: 'score.desc' }, f.filter.parameters()))),
                collection = m$1.prop([]);

            cLoader.load().then(_$1.compose(collection, sample6));

            return {
                title: f.nicename,
                hash: name === 'score' ? 'all' : name,
                collection: collection,
                loader: cLoader,
                showFriends: name === 'contributed_by_friends'
            };
        });

        return {
            collections: collections,
            slidesContent: vm.banners,
            hasFBAuth: hasFBAuth
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

        return m$1('#projects-home-component', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$12())) }, [
        // m.component(menu, {transparent: true}),
        m$1.component(slider, {
            slides: slides(),
            effect: 'fade',
            slideClass: 'hero-slide start',
            wrapperClass: 'hero-full hero-full-slide',
            sliderTime: 10000
        }), _$1.map(ctrl.collections, function (collection) {
            return m$1.component(projectRow, {
                collection: collection,
                title: collection.title,
                ref: 'home_' + (collection.hash === 'all' ? 'score' : collection.hash),
                showFriends: collection.showFriends
            });
        }),
        // m.component(contributionActivities),
        !ctrl.hasFBAuth ? m$1.component(UnsignedFriendFacebookConnect, { largeBg: true }) : '', m$1.component(blogBanner)
        // m.component(footer, {expanded: true}),
        // m.component(contributionActivities)
        ]);
    }
};

var projectShareBox = {
    controller: function controller() {
        return {
            displayEmbed: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m$1('.pop-share', {
            style: 'display: block;'
        }, [m$1('.w-hidden-main.w-hidden-medium.w-clearfix', [m$1('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
            onclick: args.displayShareBox.toggle
        }, 'Fechar'), m$1('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m$1('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m$1('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project().name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share&via=catarse"]')]), m$1('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
            onclick: ctrl.displayEmbed.toggle
        }, '< embed >'), ctrl.displayEmbed() ? m$1('.embed-expanded.u-margintop-30', [m$1('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m$1('.w-form', [m$1('input.w-input[type="text"][value="<iframe frameborder="0" height="340px" src="https://www.catarse.me/pt/projects/' + args.project().project_id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m$1('.card-embed', [m$1('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().project_id + '/embed"][width="300px"][scrolling="no"]')])]) : '', args.project().permalink ? m$1.component(facebookButton, {
            mobile: true,
            url: 'https://www.catarse.me/' + args.project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share'
        }) : '', m$1('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=Acabei%20de%20apoiar%20o%20projeto%20' + args.project().name + '%20https://www.catarse.me/' + args.project().permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]', [m$1('span.fa.fa-twitter'), ' Tweet']), m$1('a.w-hidden-main.w-hidden-medium.btn.btn-medium[data-action="share/whatsapp/share"]', {
            href: 'whatsapp://send?text=' + encodeURIComponent('https://www.catarse.me/' + args.project().permalink + '/?ref=whatsapp&utm_source=whatsapp&utm_medium=social&utm_campaign=project_share')
        }, [m$1('span.fa.fa-whatsapp'), ' Whatsapp'])]);
    }
};

var addressTag = {
    view: function view(ctrl, args) {
        var project = args.project,
            address = project().address || {
            state_acronym: '',
            city: ''
        };

        return !_.isNull(address) ? m$1('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_location_link',
                lbl: address.city + ' ' + address.state_acronym,
                project: project()
            })
        }, [m$1('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '';
    }
};

var categoryTag = {
    view: function view(ctrl, args) {
        var project = args.project;

        return project ? m$1('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project().category_id + '"]', {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_category_link',
                lbl: project().category_name,
                project: project()
            })
        }, [m$1('span.fa.fa-tag'), ' ', project().category_name]) : '';
    }
};

var projectHighlight = {
    controller: function controller() {
        return {
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project;

        return m$1('#project-highlight', [project().video_embed_url ? m$1('.w-embed.w-video.project-video', {
            style: 'min-height: 240px;'
        }, [m$1('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m$1('.project-image', {
            style: 'background-image:url(\'' + (project().original_image || project().project_img) + '\');'
        }), m$1('.w-hidden-small.w-hidden-tiny', [m$1.component(addressTag, { project: project }), m$1.component(categoryTag, { project: project })]), m$1('.project-blurb', project().headline), m$1('.project-share.w-hidden-small.w-hidden-tiny', m$1('.u-marginbottom-30.u-text-center-small-only', [m$1('.w-inline-block.fontcolor-secondary.fontsize-smaller.u-marginright-20', 'Compartilhar:'), project().permalink ? m$1.component(facebookButton, {
            url: 'https://www.catarse.me/' + project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share'
        }) : '', project().permalink ? m$1.component(facebookButton, {
            messenger: true,
            url: 'https://www.catarse.me/' + project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share'
        }) : '', m$1('button#more-share.btn.btn-inline.btn-medium.btn-terciary', {
            style: {
                'transition': 'all 0.5s ease 0s'
            },
            onclick: ctrl.displayShareBox.toggle
        }, ['···', ' Mais']), ctrl.displayShareBox() ? m$1(projectShareBox, {
            project: project,
            displayShareBox: ctrl.displayShareBox
        }) : '']))]);
    }
};

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

var projectMode = {
    view: function view(ctrl, args) {
        var project = args.project(),
            mode = project.mode,
            modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
            modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
            goal = _$1.isNull(project.goal) ? 'não definida' : h.formatNumber(project.goal),
            buildTooltip = function buildTooltip(el) {
            return m$1.component(tooltip, {
                el: el,
                text: mode === 'aon' ? 'Somente receber\xE1 os recursos se atingir ou ultrapassar a meta at\xE9 o dia ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.',
                width: 280
            });
        };

        return m$1('#' + mode + '.w-row', [m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_$1.isEmpty(project) ? m$1('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m$1('.fontsize-base.fontweight-semibold', 'Meta R$ ' + h.selfOrEmpty(goal, '--')), m$1('.w-inline-block.fontsize-smallest._w-inline-block', [!_$1.isEmpty(project) ? modeTitle : '', buildTooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
    }
};

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
var projectReminder = {
    controller: function controller(args) {
        var l = m$1.prop(false);
        var project = args.project,
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            storeReminderName = 'reminder',
            popNotification$$1 = m$1.prop(false),
            submitReminder = function submitReminder() {
            if (!h.getUser()) {
                h.storeAction(storeReminderName, project().project_id);
                return h.navigateToDevise();
            }
            var loaderOpts = project().in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                project_id: project().project_id
            });
            l = postgrest$1.loaderWithToken(loaderOpts);

            l.load().then(function () {
                project().in_reminder = !project().in_reminder;

                if (project().in_reminder) {
                    popNotification$$1(true);
                    setTimeout(function () {
                        popNotification$$1(false);
                        m$1.redraw();
                    }, 5000);
                } else {
                    popNotification$$1(false);
                }
            });
        };

        if (h.callStoredAction(storeReminderName) == project().project_id) {
            submitReminder();
        }

        filterVM.project_id(project().project_id);

        return {
            l: l,
            submitReminder: submitReminder,
            popNotification: popNotification$$1
        };
    },
    view: function view(ctrl, args) {
        var mainClass = args.type === 'button' ? '' : '.u-text-center.u-marginbottom-30',
            buttonClass = args.type === 'button' ? 'w-button btn btn-terciary btn-no-border' : 'btn-link link-hidden fontsize-small',
            hideTextOnMobile = args.hideTextOnMobile || false,
            project = args.project,
            onclickFunc = h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() }, ctrl.submitReminder);

        return m$1('#project-reminder' + mainClass, [m$1('a.btn.btn-small.btn-terciary.w-hidden-main.w-hidden-medium[data-ix=\'popshare\'][href=\'#\']', {
            onclick: onclickFunc
        }, project().in_reminder ? [m$1('span.fa.fa-heart'), ' Lembrete ativo'] : [m$1('span.fa.fa-heart-o'), ' Lembrar-me']), m$1('button[class="w-hidden-small w-hidden-tiny ' + buttonClass + ' ' + (project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
            onclick: onclickFunc
        }, [ctrl.l() ? h.loader() : project().in_reminder ? m$1('span.fa.fa-heart') : m$1('span.fa.fa-heart-o')]), ctrl.popNotification() ? m$1.component(popNotification, {
            message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
        }) : '']);
    }
};

/**
 * window.c.OwnerMessageContent component
 * Render project owner contact form
 *
 */
var ownerMessageContent = {
    controller: function controller(args) {
        var l = m$1.prop(false),
            sendSuccess = m$1.prop(false),
            userDetails = args,
            submitDisabled = m$1.prop(false),

        //sets default values when user is not logged in
        user = h.getUser() || {
            name: '',
            email: ''
        },
            from_name = m$1.prop(user.name),
            from_email = m$1.prop(user.email),
            content = m$1.prop('');

        var sendMessage = function sendMessage() {
            if (l()) {
                return false;
            }
            submitDisabled(true);
            content(content().split('\n').join('<br />'));
            var project = h.getCurrentProject();

            var loaderOpts = models.directMessage.postOptions({
                from_name: from_name(),
                from_email: from_email(),
                user_id: h.getUser().user_id,
                content: content(),
                project_id: project ? project.project_id : null,
                to_user_id: userDetails().id
            });

            l = postgrest.loaderWithToken(loaderOpts);

            l.load().then(sendSuccess(true));

            submitDisabled(false);
            return false;
        };

        return {
            sendMessage: sendMessage,
            submitDisabled: submitDisabled,
            sendSuccess: sendSuccess,
            userDetails: args,
            from_name: from_name,
            from_email: from_email,
            content: content,
            l: l
        };
    },
    view: function view(ctrl, args) {
        var successMessage = m$1('.modal-dialog-content.u-text-center', [m$1('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m$1('p.fontsize-large', 'Sua mensagem foi enviada com sucesso para ' + ctrl.userDetails().name + '. Voc\xEA vai receber uma c\xF3pia no seu email e pode seguir a conversa por l\xE1!')]),
            contactForm = [m$1('.modal-dialog-content', [m$1('.w-form', [m$1('form', {
            onsubmit: h.validate().submit([{
                prop: ctrl.from_name,
                rule: 'text'
            }, {
                prop: ctrl.from_email,
                rule: 'email'
            }, {
                prop: ctrl.content,
                rule: 'text'
            }], ctrl.sendMessage)
        }, [m$1('.w-row', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.fontsize-smaller', 'Seu nome'), m$1('input.w-input.text-field[value=\'' + ctrl.from_name() + '\'][type=\'text\'][required=\'required\']', {
            onchange: m$1.withAttr('value', ctrl.from_name),
            class: h.validate().hasError(ctrl.from_name) ? 'error' : ''
        })]), m$1('.w-col.w-col-6', [m$1('label.fontsize-smaller', 'Seu email'), m$1('input.w-input.text-field[value=\'' + ctrl.from_email() + '\'][type=\'text\'][required=\'required\']', {
            onchange: m$1.withAttr('value', ctrl.from_email),
            class: h.validate().hasError(ctrl.from_email) ? 'error' : ''
        })])]), m$1('label', 'Mensagem'), m$1('textarea.w-input.text-field.height-small[required=\'required\']', {
            onchange: m$1.withAttr('value', ctrl.content),
            class: h.validate().hasError(ctrl.content) ? 'error' : ''
        }), m$1('.u-marginbottom-10.fontsize-smallest.fontcolor-terciary', 'Você receberá uma cópia desta mensagem em seu email.'), m$1('.w-row', h.validationErrors().length ? _$1.map(h.validationErrors(), function (errors) {
            return m$1('span.fontsize-smallest.text-error', [m$1('span.fa.fa-exclamation-triangle'), ' ' + errors.message, m$1('br')]);
        }) : ''), m$1('.modal-dialog-nav-bottom', m$1('.w-row', m$1('.w-col.w-col-6.w-col-push-3', !ctrl.l() ? m$1('input.w-button.btn.btn-large[type="submit"][value="Enviar mensagem"]', {
            disabled: ctrl.submitDisabled()
        }) : h.loader())))])])])];

        return m$1('div', [m$1('.modal-dialog-header', m$1('.fontsize-large.u-text-center', 'Enviar mensagem')), ctrl.sendSuccess() ? successMessage : contactForm]);
    }
};

/*
 * UserFollowBtn - Component
 * Handles with follow / unfollow actions to an user
 *
 * Example:
 * m.component(c.UserFollowBtn, {follow_id: 10, following: false})
 */

var UserFollowBtn = {
    controller: function controller(args) {
        var following = m$1.prop(args.following || false),
            followVM = postgrest$1.filtersVM({ follow_id: 'eq' }),
            loading = m$1.prop(false),
            hover = m$1.prop(false),
            userFollowInsert = models.userFollow.postOptions({
            follow_id: args.follow_id }),
            userFollowDelete = function () {
            followVM.follow_id(args.follow_id);

            return models.userFollow.deleteOptions(followVM.parameters());
        }(),
            follow = function follow() {
            var l = postgrest$1.loaderWithToken(userFollowInsert);
            loading(true);

            l.load().then(function () {
                following(true);
                loading(false);
            });
        },
            unfollow = function unfollow() {
            var l = postgrest$1.loaderWithToken(userFollowDelete);
            loading(true);

            l.load().then(function () {
                following(false);
                loading(false);
            });
        };

        return {
            following: following,
            follow: follow,
            unfollow: unfollow,
            loading: loading,
            hover: hover
        };
    },
    view: function view(ctrl, args) {
        if (h.userSignedIn()) {
            var disableClass = args.disabledClass || '.w-button.btn.btn-medium.btn-terciary.u-margintop-20',
                enabledClass = args.enabledClass || '.w-button.btn.btn-medium.u-margintop-20';
            if (ctrl.loading()) {
                return h.loader();
            }
            if (ctrl.following()) {
                return m$1('a' + enabledClass, {
                    onclick: ctrl.unfollow,
                    onmouseover: function onmouseover() {
                        return ctrl.hover(true);
                    },
                    onmouseout: function onmouseout() {
                        return ctrl.hover(false);
                    }
                }, ctrl.hover() ? 'Deixar de seguir' : 'Seguindo');
            } else {
                return m$1('a' + disableClass, { onclick: ctrl.follow }, 'Seguir');
            }
        } else {
            return m$1('');
        }
    }
};

var projectUserCard = {
    controller: function controller(args) {
        return { displayModal: h.toggleProp(false, true) };
    },
    view: function view(ctrl, args) {
        var project = args.project;
        var contactModalC = [ownerMessageContent, args.userDetails];
        var userDetail = args.userDetails();

        return m$1('#user-card', _$1.isEmpty(userDetail) ? 'carregando...' : m$1('.u-marginbottom-30.u-text-center-small-only', [ctrl.displayModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : '', m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), m$1('.w-col.w-col-8', [m$1('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [m$1('a.link-hidden[href="/users/' + userDetail.id + '"]', { config: m$1.route, onclick: function onclick() {
                m$1.route("/users/" + userDetail.id, { user_id: userDetail.id });
                h.analytics.event({ cat: 'project_view', act: 'project_creator_link', lbl: userDetail.id, project: project() });
            } }, userDetail.public_name || userDetail.name)]), m$1('.fontsize-smallest', [h.pluralize(userDetail.total_published_projects, ' criado', ' criados'), m$1.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h.pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), m$1('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_$1.isEmpty(userDetail.facebook_link) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_fb', lbl: userDetail.facebook_link, project: project() }) }, 'Perfil no Facebook')]) : '', !_$1.isEmpty(userDetail.twitter_username) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_twitter', lbl: userDetail.twitter_username, project: project() }) }, 'Perfil no Twitter')]) : '', _$1.map(userDetail.links, function (link) {
            var parsedLink = h.parseUrl(link.link);

            return !_$1.isEmpty(parsedLink.hostname) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + link.link + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_otherlinks', lbl: link.link, project: project() }) }, parsedLink.hostname)]) : '';
        })]), !_$1.isEmpty(userDetail) ? [m$1(UserFollowBtn, {
            enabledClass: 'a.w-button.btn.btn-terciary.btn-small..u-marginbottom-10',
            disabledClass: 'a.w-button.btn.btn-terciary.btn-small.u-marginbottom-10',
            follow_id: userDetail.id, following: userDetail.following_this_user }), m$1('a.w-button.btn.btn-terciary.btn-small[href=\'javascript:void(0);\']', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_sendmsg', lbl: userDetail.id, project: project() }, ctrl.displayModal.toggle) }, 'Contato')] : '', args.project().is_admin_role ? m$1('p', userDetail.email) : ''])])]));
    }
};

var I18nScope$13 = _$1.partial(h.i18nScope, 'projects.project_sidebar');

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
        };

        return {
            animateProgress: animateProgress,
            displayShareBox: h.toggleProp(false, true)
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
                'approved': I18n$1.t('display_status.approved', I18nScope$13()),
                'online': h.existy(project().zone_expires_at) && project().open_for_contributions ? I18n$1.t('display_status.online', I18nScope$13({ date: h.momentify(project().zone_expires_at) })) : '',
                'failed': I18n$1.t('display_status.failed', I18nScope$13({ date: h.momentify(project().zone_expires_at), goal: project().goal })),
                'rejected': I18n$1.t('display_status.rejected', I18nScope$13()),
                'in_analysis': I18n$1.t('display_status.in_analysis', I18nScope$13()),
                'successful': I18n$1.t('display_status.successful', I18nScope$13({ date: h.momentify(project().zone_expires_at) })),
                'waiting_funds': I18n$1.t('display_status.waiting_funds', I18nScope$13()),
                'draft': I18n$1.t('display_status.draft', I18nScope$13())
            };

            return states[project().state];
        };

        return m$1('#project-sidebar.aside', [m$1('.project-stats', [m$1('.project-stats-inner', [m$1('.project-stats-info', [m$1('.u-marginbottom-20', [m$1('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? h.formatNumber(project().pledged) : '0')), m$1('.fontsize-small.u-text-center-small-only', [I18n$1.t('contributors_call', I18nScope$13()), m$1('span#contributors.fontweight-semibold', I18n$1.t('contributors_count', I18nScope$13({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + I18n$1.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope$13()) : ''])]), m$1('.meter', [m$1('#progressBar.meter-fill', {
            style: {
                width: project().progress + '%'
            }
        })]), m$1('.w-row.u-margintop-10', [m$1('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m$1('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m$1('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m$1('span.fontweight-semibold', remaining.total), I18n$1.t('remaining_time.' + remaining.unit, I18nScope$13({ count: remaining.total }))] : '')])])]), m$1('.w-row', [m$1.component(projectMode, {
            project: project
        })])]), project().open_for_contributions ? m$1('.back-project-btn-div', [m$1('.back-project--btn-row', [m$1('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="javascript:void(0);"]', {
            onclick: h.analytics.event({
                cat: 'contribution_create',
                act: 'contribution_button_click',
                project: project()
            }, function () {
                return h.navigateTo('/projects/' + project().project_id + '/contributions/new');
            })

        }, I18n$1.t('submit', I18nScope$13()))]), m$1('.back-project-btn-row-right', m$1.component(projectReminder, {
            project: project,
            type: 'link'
        }))]) : '', m$1('.friend-backed-card.project-page', [!_$1.isUndefined(project()) && project().contributed_by_friends ? m$1.component(projectFriends, { project: project() }) : '']), m$1('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), m$1('.project-share.w-hidden-main.w-hidden-medium', [m$1.component(addressTag, { project: project }), m$1.component(categoryTag, { project: project }), m$1('.u-marginbottom-30.u-text-center-small-only', m$1('button.btn.btn-inline.btn-medium.btn-terciary', {
            onclick: ctrl.displayShareBox.toggle
        }, 'Compartilhar este projeto')), ctrl.displayShareBox() ? m$1(projectShareBox, {
            project: project,
            displayShareBox: ctrl.displayShareBox
        }) : '']), m$1('.user-c', m$1.component(projectUserCard, {
            userDetails: args.userDetails,
            project: project
        }))]);
    }
};

var userContributionDetail = {
    controller: function controller(args) {
        var contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _$1.findWhere(rewardDetails(), { id: contribution.reward_id });

        return {
            contribution: contribution,
            chosenReward: chosenReward
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution;

        return m$1('.user-contribution-detail', [m$1('.w-col.w-col-4', [m$1('.fontsize-smallest.lineheight-tight.fontweight-semibold.u-marginbottom-10', 'Valor do apoio:'), m$1('.fontsize-large', 'R$' + contribution.value)]), m$1('.w-col.w-col-4', m$1.component(paymentStatus, { item: contribution })), m$1('.w-col.w-col-4', [m$1('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', 'Recompensa:'), m$1('.fontsize-smallest.lineheight-tight.u-marginbottom-20', !_$1.isUndefined(ctrl.chosenReward) ? ctrl.chosenReward.description : 'Nenhuma recompensa selecionada.'), m$1('.fontsize-smallest.lineheight-looser', !_$1.isUndefined(ctrl.chosenReward) ? [m$1('span.fontweight-semibold', 'Estimativa de entrega: '), h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')] : '')])]);
    }
};

var currentContribution = m.prop({});

var getUserProjectContributions = function getUserProjectContributions(user_id, project_id, states) {
    var vm = postgrest$1.filtersVM({
        user_id: 'eq',
        project_id: 'eq',
        state: 'in'
    });

    vm.user_id(user_id);
    vm.project_id(project_id);
    vm.state(states);

    var lProjectContributions = postgrest$1.loaderWithToken(models.userContribution.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
};

var getCurrentContribution = function getCurrentContribution() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        currentContribution(JSON.parse(data));

        m.redraw(true);

        return currentContribution;
    } else {
        return false;
    }
};

var wasConfirmed = function wasConfirmed(contribution) {
    return _$1.contains(['paid', 'pending_refund', 'refunded'], contribution.state);
};

var canShowReceipt = function canShowReceipt(contribution) {
    return wasConfirmed(contribution);
};

var canShowSlip = function canShowSlip(contribution) {
    return contribution.payment_method == 'BoletoBancario' && contribution.waiting_payment;
};

var canGenerateSlip = function canGenerateSlip(contribution) {
    return contribution.payment_method == 'BoletoBancario' && contribution.state == 'pending' && contribution.project_state == 'online' && !contribution.reward_sold_out && !contribution.waiting_payment;
};

var contributionVM = {
    getCurrentContribution: getCurrentContribution,
    canShowReceipt: canShowReceipt,
    canGenerateSlip: canGenerateSlip,
    canShowSlip: canShowSlip,
    getUserProjectContributions: getUserProjectContributions
};

var projectHeader = {
    controller: function controller(args) {
        var project = args.project,
            currentUser = h.getUser();

        if (h.isProjectPage() && currentUser && !_$1.isUndefined(project())) {
            contributionVM.getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund']).then(args.projectContributions);
        }

        return {
            projectContributions: args.projectContributions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            rewardDetails = args.rewardDetails;

        return !_$1.isUndefined(project()) ? m$1('#project-header', [m$1('.w-section.section-product.' + project().mode), m$1('.w-section.page-header.u-text-center', [m$1('.w-container', [m$1('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)), m$1('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['por ', project().user ? project().user.name : project().owner_name ? project().owner_name : '']), !_$1.isEmpty(ctrl.projectContributions()) ? m$1('.card.card-terciary.u-radius.u-margintop-20', [m$1('.fontsize-small.u-text-center', [m$1('span.fa.fa-thumbs-up'), ' Você é apoiador deste projeto! ', m$1('a.alt-link[href=\'javascript:void(0);\']', { onclick: ctrl.showContributions.toggle }, 'Detalhes')]), ctrl.showContributions() ? m$1('.card.u-margintop-20', m$1('.w-row', _$1.map(ctrl.projectContributions(), function (contribution) {
            return m$1.component(userContributionDetail, { contribution: contribution, rewardDetails: rewardDetails });
        }))) : '']) : ''])]), m$1('.w-section.project-main', [m$1('.w-container', [m$1('.w-row.project-main', [m$1('.w-col.w-col-8.project-highlight', m$1.component(projectHighlight, {
            project: project
        })), m$1('.w-col.w-col-4', m$1.component(projectSidebar, {
            project: project,
            userDetails: args.userDetails
        }))])])])]) : m$1('');
    }
};

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
        }, [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m$1('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf  ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="/' + project().permalink + '#rewards"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_rewards_view', project: project() })
        }, 'Recompensas') : m$1('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="/' + project().permalink + '#contribution_suggestions"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_contribsuggestions_view', project: project() })
        }, 'Valores Sugeridos'), m$1('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + '"][href="#about"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_about_view', project: project() })
        }, 'Sobre'), m$1('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_posts_view', project: project() })
        }, ['Novidades ', m$1('span.badge', project() ? project().posts_count : '')]), m$1('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_contributions_view', project: project() })
        }, ['Apoiadores ', m$1('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributors : '-')]), m$1('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_comments_view', project: project() })
        }, ['Comentários ', project() ? m$1('fb:comments-count[href="http://www.catarse.me/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m$1.trust('&nbsp;')) : '-'])]), project() ? m$1('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [m$1('.w-row.project-nav-back-button', [m$1('.w-col.w-col-6.w-col-medium-8', [m$1('a.w-button.btn[href="/projects/' + project().project_id + '/contributions/new"]', {
            onclick: h.analytics.event({ cat: 'contribution_create', act: 'contribution_floatingbtn_click', project: project() })
        }, 'Apoiar ‍este projeto')]), m$1('.w-col.w-col-6.w-col-medium-4', {
            onclick: h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() })
        }, [m$1.component(projectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? m$1('.w-section.project-nav') : ''] : '');
    }
};

var projectRewardList = {
    controller: function controller(args) {
        var storeKey = 'selectedReward',
            vm = rewardVM;

        var setInput = function setInput(el, isInitialized) {
            return !isInitialized ? el.focus() : false;
        };

        var submitContribution = function submitContribution() {
            var valueFloat = h.monetaryToFloat(vm.contributionValue);

            if (valueFloat < vm.selectedReward().minimum_value) {
                vm.error('O valor de apoio para essa recompensa deve ser de no m\xEDnimo R$' + vm.selectedReward().minimum_value);
            } else {
                vm.error('');

                // THIS CHECK IS ONLY NECESSARY IF WHEN WE START ROUTING DIRECTLY TO THE /contributions/edit page
                // if (!h.getUser()) {
                //     h.storeObject(storeKey, {value: valueFloat, reward: vm.selectedReward()});

                //     return h.navigateToDevise('/' + projectVM.currentProject().permalink);
                // } else {
                // vm.contributionValue(valueFloat);
                //h.navigateTo(`/projects/${projectVM.currentproject().project_id}/contributions/new?reward_id=${vm.selectedReward().id}`);
                h.navigateTo('/projects/' + projectVM.currentProject().project_id + '/contributions/fallback_create?contribution%5Breward_id%5D=' + vm.selectedReward().id + '&contribution%5Bvalue%5D=' + valueFloat);
                // m.route(`/projects/${projectVM.currentproject().project_id}/payment`, {
                //    project_user_id: projectVM.currentProject().user_id
                // });
                // }
            }

            return false;
        };

        if (h.getStoredObject(storeKey)) {
            var _h$getStoredObject = h.getStoredObject(storeKey),
                value = _h$getStoredObject.value,
                reward = _h$getStoredObject.reward;

            h.removeStoredObject(storeKey);
            vm.selectedReward(reward);
            vm.contributionValue(h.applyMonetaryMask(value + ',00'));
            submitContribution();
        }

        return {
            applyMask: vm.applyMask,
            error: vm.error,
            submitContribution: submitContribution,
            openedReward: vm.selectedReward,
            selectReward: vm.selectReward,
            contributionValue: vm.contributionValue,
            setInput: setInput
        };
    },
    view: function view(ctrl, args) {
        //FIXME: MISSING ADJUSTS
        // - add draft admin modifications
        var project = args.project() || {
            open_for_contributions: false
        };
        return m$1('#rewards.u-marginbottom-30', _$1.map(args.rewardDetails(), function (reward) {

            return m$1('div[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project.open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"]', {
                onclick: h.analytics.event({
                    cat: 'contribution_create',
                    act: 'contribution_reward_click',
                    lbl: reward.minimum_value,
                    project: project,
                    extraData: {
                        reward_id: reward.id,
                        reward_value: reward.minimum_value
                    }
                }, ctrl.selectReward(reward))
            }, [reward.minimum_value >= 100 ? m$1('.tag-circle-installment', [m$1('.fontsize-smallest.fontweight-semibold.lineheight-tightest', '3x'), m$1('.fontsize-mini.lineheight-tightest', 's/ juros')]) : '', m$1('.u-marginbottom-20', [m$1('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'), m$1('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m$1('.maximum_contributions.in_time_to_confirm.clearfix', [m$1('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h.rewardSouldOut(reward) ? m$1('.u-margintop-10', [m$1('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m$1('.u-margintop-10', [m$1('span.badge.badge-attention.fontsize-smaller', [m$1('span.fontweight-bold', 'Limitada'), project.open_for_contributions ? ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)' : ''])])] : '']), m$1('.fontsize-smaller.u-margintop-20', m$1.trust(h.simpleFormat(h.strip(reward.description)))), !_$1.isEmpty(reward.deliver_at) ? m$1('.fontsize-smaller', [m$1('b', 'Estimativa de Entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project.open_for_contributions && !h.rewardSouldOut(reward) ? [ctrl.openedReward().id === reward.id ? m$1('.w-form', [m$1('form.u-margintop-30', {
                onsubmit: ctrl.submitContribution
            }, [m$1('.divider.u-marginbottom-20'), m$1('.fontcolor-secondary.u-marginbottom-10', 'Valor do apoio'), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m$1('.back-reward-input-reward.placeholder', 'R$')), m$1('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m$1('input.w-input.back-reward-input-reward[type="tel"]', {
                config: ctrl.setInput,
                onkeyup: m$1.withAttr('value', ctrl.applyMask),
                value: ctrl.contributionValue()
            }))]), m$1('input.w-button.btn.btn-medium[type="submit"][value="Continuar >"]'), ctrl.error().length > 0 ? m$1('.text-error', [m$1('br'), m$1('span.fa.fa-exclamation-triangle'), ' ' + ctrl.error()]) : ''])]) : ''] : '']);
        }));
    }
};

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
var projectSuggestedContributions = {
    view: function view(ctrl, args) {
        var project = args.project();

        var suggestionUrl = function suggestionUrl(amount) {
            return '/projects/' + project.project_id + '/contributions/new?amount=' + amount;
        },
            suggestedValues = [10, 25, 50, 100];

        return m$1('#suggestions', _$1.map(suggestedValues, function (amount) {
            return project ? m$1('a[href="' + suggestionUrl(amount) + '"].card-reward.card-big.card-secondary.u-marginbottom-20', [m$1('.fontsize-larger', 'R$\xA0' + amount)]) : '';
        }));
    }
};

var projectContributions$1 = {
    controller: function controller(args) {
        var contributionsPerLocation = m$1.prop([]),
            contributionsPerDay = m$1.prop([]),
            listVM = postgrest$1.paginationVM(models.contributor),
            filterStats = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            groupedCollection = function groupedCollection() {
            var collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var grouped = [[]],
                group = 0;

            _$1.map(collection, function (item, index) {
                if (grouped[group].length >= 3) {
                    group = group + 1;
                    grouped[group] = [];
                }

                grouped[group].push(item);
            });

            return grouped;
        },
            contributionsStats = m$1.prop({});

        filterVM.project_id(args.project().project_id);
        filterStats.project_id(args.project().project_id);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }
        //TODO: Abstract table fetch and contruction logic to contributions-vm to avoid insights.js duplicated code.
        var lContributionsPerDay = postgrest$1.loader(models.projectContributionsPerDay.getRowOptions(filterStats.parameters()));
        lContributionsPerDay.load().then(contributionsPerDay);

        var contributionsPerLocationTable = [['Estado', 'Apoios', 'R$ apoiados (% do total)']];
        var buildPerLocationTable = function buildPerLocationTable(contributions) {
            return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                var column = [];

                column.push(contribution.state_acronym || 'Outro/other');
                column.push(contribution.total_contributions);
                column.push([contribution.total_contributed, [//Adding row with custom comparator => read project-data-table description
                m$1('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', h.formatNumber(contribution.total_contributed, 2, 3), m$1('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        var lContributionsPerLocation = postgrest$1.loader(models.projectContributionsPerLocation.getRowOptions(filterStats.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        var lContributionsStats = postgrest$1.loader(models.projectContributiorsStat.getRowOptions(filterStats.parameters()));
        lContributionsStats.load().then(function (data) {
            return contributionsStats(_$1.first(data));
        });

        return {
            listVM: listVM,
            filterVM: filterVM,
            groupedCollection: groupedCollection,
            lContributionsStats: lContributionsStats,
            contributionsPerLocationTable: contributionsPerLocationTable,
            lContributionsPerLocation: lContributionsPerLocation,
            contributionsPerDay: contributionsPerDay,
            lContributionsPerDay: lContributionsPerDay,
            contributionsStats: contributionsStats
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.listVM,
            stats = ctrl.contributionsStats(),
            groupedCollection = ctrl.groupedCollection(list.collection());

        return m$1('#project_contributions', m$1('#contributions_top', [m$1('.section.w-section', m$1('.w-container', m$1('.w-row', ctrl.lContributionsStats() ? h.loader() : !_$1.isEmpty(stats) ? [m$1('.u-marginbottom-20.u-text-center-small-only.w-col.w-col-6', [m$1('.fontsize-megajumbo', stats.total), m$1('.fontsize-large', 'pessoas apoiam este projeto')]), m$1('.w-col.w-col-6', m$1('.card.card-terciary.u-radius', m$1('.w-row', [m$1('.u-marginbottom-20.w-col.w-col-6.w-col-small-6', [m$1('.fontweight-semibold.u-marginbottom-10', 'Apoiadores novos'), m$1('.fontsize-largest.u-marginbottom-10', Math.floor(stats.new_percent) + '%'), m$1('.fontsize-smallest', 'apoiadores que nunca tinham apoiado um projeto no Catarse')]), m$1('.w-col.w-col-6.w-col-small-6', [m$1('.divider.u-marginbottom-20.w-hidden-main.w-hidden-medium.w-hidden-small'), m$1('.fontweight-semibold.u-marginbottom-10', 'Apoiadores recorrentes'), m$1('.fontsize-largest.u-marginbottom-10', Math.ceil(stats.returning_percent) + '%'), m$1('.fontsize-smallest', 'apoiadores que já tinham apoiado um projeto no Catarse')])])))] : ''))), m$1('.divider.w-section'), m$1('.section.w-section', m$1('.w-container', [m$1('.fontsize-large.fontweight-semibold.u-marginbottom-40.u-text-center', 'Apoiadores'), m$1('.project-contributions.w-clearfix', _$1.map(groupedCollection, function (group, idx) {
            return m$1('.w-row', _$1.map(group, function (contribution) {
                return m$1('.project-contribution-item.w-col.w-col-4', [
                // here new card
                m$1('.card.card-backer.u-marginbottom-20.u-radius.u-text-center', [m$1('a[href="/users/' + contribution.user_id + '"][style="display: block;"]', {
                    onclick: h.analytics.event({
                        cat: 'project_view',
                        act: 'project_backer_link',
                        lbl: contribution.user_id,
                        project: args.project()
                    })
                }, [m$1('img.thumb.u-marginbottom-10.u-round[src="' + (!_$1.isEmpty(contribution.data.profile_img_thumbnail) ? contribution.data.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '"]')]), m$1('a.fontsize-base.fontweight-semibold.lineheigh-tight.link-hidden-dark[href="/users/' + contribution.user_id + '"]', {
                    onclick: h.analytics.event({
                        cat: 'project_view',
                        act: 'project_backer_link',
                        lbl: contribution.user_id,
                        project: args.project()
                    })
                }, contribution.data.public_name || contribution.data.name), m$1('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', contribution.data.city + ',' + contribution.data.state), m$1('.fontsize-smaller', [m$1('span.fontweight-semibold', contribution.data.total_contributed_projects), ' apoiados  |  ', m$1('span.fontweight-semibold', contribution.data.total_published_projects), ' criado']), m$1('.btn-bottom-card.w-row', [m$1('.w-col.w-col-3.w-col-small-4.w-col-tiny-3'), m$1('.w-col.w-col-6.w-col-small-4.w-col-tiny-6', [m$1(UserFollowBtn, { follow_id: contribution.user_id, following: contribution.is_follow })]), m$1(".w-col.w-col-3.w-col-small-4.w-col-tiny-3")])])
                // new card
                ]);
            }));
        })), m$1('.w-row.u-marginbottom-40.u-margintop-20', [m$1('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : h.loader()])])]))]), m$1('.before-footer.bg-gray.section.w-section', m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m$1.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: 'R$ arrecadados por dia',
            dataKey: 'total_amount',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: 'Apoios não contabilizados'
        }) : h.loader()])]), m$1('.w-row', m$1('.w-col.w-col-12.u-text-center', [m$1('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'De onde vem os apoios'), !ctrl.lContributionsPerLocation() ? !_$1.isEmpty(_$1.rest(ctrl.contributionsPerLocationTable)) ? m$1.component(projectDataTable, {
            table: ctrl.contributionsPerLocationTable,
            defaultSortIndex: -2
        }) : '' : h.loader()]))])));
    }
};

/**
 * window.c.projectReport component
 * Render project report form
 *
 */
var projectReport = {
  controller: function controller(args) {
    var displayForm = h.toggleProp(false, true),
        sendSuccess = m$1.prop(false),
        submitDisabled = m$1.prop(false),
        user = h.getUser() || {},
        email = m$1.prop(user.email),
        details = m$1.prop(''),
        reason = m$1.prop(''),
        l = m$1.prop(false),
        storeReport = 'report',
        project = projectVM.currentProject(),
        hasPendingAction = project && h.callStoredAction(storeReport) == project.project_id,
        checkLogin = function checkLogin() {
      if (!_.isEmpty(user)) {
        displayForm.toggle();
      } else {
        h.storeAction(storeReport, project.project_id);
        return h.navigateToDevise();
      }
    },
        sendReport = function sendReport() {
      submitDisabled(true);
      var loaderOpts = models.projectReport.postOptions({
        email: email(),
        details: details(),
        reason: reason(),
        project_id: project.project_id
      });
      l = postgrest$1.loaderWithToken(loaderOpts);

      l.load().then(sendSuccess(true));
      submitDisabled(false);
      return false;
    },
        checkScroll = function checkScroll(el, isInit) {
      if (!isInit && hasPendingAction) {
        h.animateScrollTo(el);
      }
    };

    if (!_.isEmpty(user) && hasPendingAction) {
      displayForm(true);
    }

    return {
      checkScroll: checkScroll,
      checkLogin: checkLogin,
      displayForm: displayForm,
      sendSuccess: sendSuccess,
      submitDisabled: submitDisabled,
      sendReport: sendReport,
      user: user,
      email: email,
      details: details,
      reason: reason
    };
  },
  view: function view(ctrl, args) {
    var user = ctrl.user;

    return m$1('.card.card-terciary.u-radius', [m$1('.fontsize-small.u-marginbottom-20', ['Este projeto desrespeita', m$1.trust('&nbsp;'), m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638\'][target=\'_blank\']', 'nossas regras? ')]), ctrl.sendSuccess() ? m$1('.w-form', m$1('p', 'Obrigado! A sua denúncia foi recebida.')) : [m$1('.a.w-button.btn.btn-medium.btn-terciary.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.checkLogin }, 'Denunciar este projeto'), ctrl.displayForm() ? m$1('#report-form.u-margintop-30', m$1('.w-form', m$1('form', { onsubmit: ctrl.sendReport, config: ctrl.checkScroll }, [m$1('.fontsize-small.fontweight-semibold.u-marginbottom-10', 'Por que você está denunciando este projeto?'), m$1('select.w-select.text-field.positive[required=\'required\']', { onchange: m$1.withAttr('value', ctrl.reason) }, [m$1('option[value=\'\']', 'Selecione um motivo'), m$1('option[value=\'Violação de propriedade intelectual\']', 'Violação de propriedade intelectual'), m$1('option[value=\'Calúnia, injúria, difamação ou discriminação\']', 'Calúnia, injúria, difamação ou discriminação'), m$1('option[value=\'Escopo de projeto proibido\']', 'Escopo de projeto proibido'), m$1('option[value=\'Recompensas proibidas\']', 'Recompensas proibidas'), m$1('option[value=\'Cenas de sexo explícitas e gratuitas\']', 'Cenas de sexo explícitas e gratuitas'), m$1('option[value=\'Abuso de SPAM\']', 'Abuso de SPAM'), m$1('option[value=\'Outros\']', 'Outros')]), m$1('textarea.w-input.text-field.positive.u-marginbottom-30', { placeholder: 'Por favor, dê mais detalhes que nos ajudem a identificar o problema', onchange: m$1.withAttr('value', ctrl.details) }), m$1('input.w-button.btn.btn-medium.btn-inline.btn-dark[type=\'submit\'][value=\'Enviar denúncia\']', { disabled: ctrl.submitDisabled() })]))) : '']]);
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
            return project.is_published && h.existy(project.zone_expires_at) ? m$1('.funding-period', [m$1('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'), m$1('.fontsize-small.u-text-center-small-only', h.momentify(project.zone_online_date) + ' - ' + h.momentify(project.zone_expires_at) + ' (' + onlineDays() + ' dias)')]) : '';
        };

        return m$1('#project-about', [m$1('.project-about.w-col.w-col-8', {
            config: h.UIHelper()
        }, [m$1('p.fontsize-base', [m$1('strong', 'O projeto')]), m$1('.fontsize-base[itemprop="about"]', m$1.trust(h.selfOrEmpty(project.about_html, '...'))), project.budget ? [m$1('p.fontsize-base.fontweight-semibold', 'Orçamento'), m$1('p.fontsize-base', m$1.trust(project.budget))] : '', m$1.component(projectReport)]), m$1('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m$1.component(projectRewardList, {
            project: args.project,
            rewardDetails: args.rewardDetails
        }), fundingPeriod()] : [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), m$1.component(projectSuggestedContributions, { project: args.project }), fundingPeriod()])]);
    }
};

var projectComments = {
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
        var project = args.project();
        return m$1('.w-row', [m$1('.w-col.w-col-7', m$1('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() })), m$1('.w-col.w-col-5', m$1.component(projectReport))]);
    }
};

var I18nScope$14 = _$1.partial(h.i18nScope, 'projects.posts');

var projectPosts = {
    controller: function controller(args) {
        var listVM = postgrest$1.paginationVM(models.projectPostDetail),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq',
            id: 'eq'
        });

        filterVM.project_id(args.project().project_id);

        if (_$1.isNumber(args.post_id)) {
            filterVM.id(args.post_id);
        }

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

        return m$1('.project-posts.w-section', [m$1('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _$1.isEmpty(list.collection()) ? m$1('.w-hidden-small.w-hidden-tiny', [m$1('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '' : '', m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4'), m$1('.w-col.w-col-4', [m$1('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.project_id + '/edit#posts\']', 'Escrever novidade')]), m$1('.w-col.w-col-4')])] : '', _$1.map(list.collection(), function (post) {
            return m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10', [m$1('.post', [m$1('.u-marginbottom-60 .w-clearfix', [m$1('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)), m$1('p.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', [m$1('a.link-hidden[href="/projects/' + post.project_id + '/posts/' + post.id + '#posts"]', post.title)]), !_$1.isEmpty(post.comment_html) ? m$1('.fontsize-base', m$1.trust(post.comment_html)) : m$1('.fontsize-base', 'Post exclusivo para apoiadores.')]), m$1('.divider.u-marginbottom-60')])]), m$1('.w-col.w-col-1')]);
        }), m$1('.w-row', [!_$1.isUndefined(args.post_id) ? '' : !list.isLoading() ? list.collection().length === 0 && args.projectContributions().length === 0 ? !project.is_owner_or_admin ? m$1('.w-col.w-col-10.w-col-push-1', m$1('p.fontsize-base', m$1.trust(I18n$1.t('empty', I18nScope$14({
            project_user_name: args.userDetails().name,
            project_id: project.project_id
        }))))) : '' : m$1('.w-col.w-col-2.w-col-push-5', list.isLastPage() ? list.collection().length === 0 ? 'Nenhuma novidade.' : '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais')) : m$1('.w-col.w-col-2.w-col-push-5', h.loader())])])]);
    }
};

var projectMain = {
    controller: function controller(args) {
        var hash = m$1.prop(window.location.hash),
            displayTabContent = function displayTabContent(project) {
            var c_opts = {
                project: project,
                post_id: args.post_id
            },
                tabs = {
                '#rewards': m$1('.w-col.w-col-12', m$1.component(projectRewardList, _$1.extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts))),
                '#contribution_suggestions': m$1.component(projectSuggestedContributions, c_opts),
                '#contributions': m$1.component(projectContributions$1, c_opts),
                '#about': m$1.component(projectAbout, _$1.extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts)),
                '#comments': m$1.component(projectComments, c_opts),
                '#posts': m$1.component(projectPosts, _$1.extend({}, {
                    projectContributions: args.projectContributions,
                    userDetails: args.userDetails
                }, c_opts))
            };

            if (_$1.isNumber(args.post_id)) {
                window.location.hash = 'posts';
            }

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_' || hash() === '#preview') {
                return tabs['#about'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        return {
            displayTabContent: displayTabContent,
            hash: hash
        };
    },
    view: function view(ctrl, args) {
        return m$1('section.section[itemtype="http://schema.org/CreativeWork"]', [m$1('' + (ctrl.hash() !== '#contributions' ? '.w-container' : '.about-tab-content'), [m$1('.w-row', args.project() ? ctrl.displayTabContent(args.project) : h.loader())])]);
    }
};

var projectsShow = {
    controller: function controller(args) {
        var project_id = args.project_id,
            project_user_id = args.project_user_id;


        h.analytics.event({ cat: 'project_view', act: 'project_page_view', project: { id: project_id, user_id: project_user_id } });
        h.analytics.windowScroll({ cat: 'project_view', act: 'project_page_scroll', project: { id: project_id, user_id: project_user_id } });

        if (project_id && !_$1.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }

        return projectVM;
    },
    view: function view(ctrl, args) {
        var project = ctrl.currentProject;

        return m$1('.project-show', {
            config: ctrl.setProjectPageTitle()
        }, [m$1.component(projectHeader, {
            project: project,
            rewardDetails: ctrl.rewardDetails,
            userDetails: ctrl.userDetails,
            projectContributions: ctrl.projectContributions
        }), m$1.component(projectTabs, {
            project: project,
            rewardDetails: ctrl.rewardDetails
        }), m$1.component(projectMain, {
            project: project,
            post_id: args.post_id,
            rewardDetails: ctrl.rewardDetails,
            userDetails: ctrl.userDetails,
            projectContributions: ctrl.projectContributions
        }), project() && project().is_owner_or_admin ? m$1.component(projectDashboardMenu, {
            project: project
        }) : '']);
    }
};

//       weak
var userHeader = {
  view: function view(ctrl, args) {
    var user = args.user,
        hideDetails = args.hideDetails,
        profileImage = userVM.displayImage(user),
        coverImage = userVM.displayCover(user);

    return m$1('.hero-' + (hideDetails ? 'small' : 'half'), [m$1('.w-container.content-hero-profile', m$1('.w-row.u-text-center', m$1('.w-col.w-col-8.w-col-push-2', [hideDetails ? '' : m$1('.u-marginbottom-20', m$1('.avatar_wrapper', m$1('img.thumb.big.u-round[alt=\'User\'][src=\'' + profileImage + '\']'))), m$1('.fontsize-larger.fontweight-semibold.u-marginbottom-20', user.public_name || user.name), hideDetails ? '' : m$1('.w-hidden-small.w-hidden-tiny.u-marginbottom-40.fontsize-base', ['Chegou junto em ' + h.momentify(user.created_at, 'MMMM [de] YYYY'), m$1('br'), user.total_contributed_projects == 0 ? 'Ainda não apoiou projetos' : 'Apoiou ' + h.pluralize(user.total_contributed_projects, ' projeto', ' projetos'), user.total_published_projects > 0 ? ' e j\xE1 criou ' + h.pluralize(user.total_published_projects, ' projeto', ' projetos') : ''])]))), m$1('.hero-profile', { style: 'background-image:url(\'' + coverImage + '\');' })]);
  }
};

var inlineError = {
    view: function view(ctrl, args) {
        return m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m$1('span', ' ' + args.message));
    }
};

/**
 * window.c.loadMoreBtn component
 * Button to paginate collection
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.loadMoreBtn, {collection: collection, cssClass: 'class'})
 *   ...
 * }
 */
var loadMoreBtn = {
    view: function view(ctrl, args) {
        var collection = args.collection,
            cssClass = args.cssClass;
        return m$1('.w-col.w-col-2' + cssClass, [!collection.isLoading() ? collection.isLastPage() ? '' : m$1('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: collection.nextPage
        }, 'Carregar mais') : h.loader()]);
    }
};

var userCreated = {
    controller: function controller(args) {
        var createdProjects = m$1.prop(),
            user_id = args.userId,
            showDraft = args.showDraft || false,
            error = m$1.prop(false),
            pages = postgrest$1.paginationVM(models.project),
            loader = m$1.prop(true),
            contextVM = postgrest$1.filtersVM({
            project_user_id: 'eq',
            state: 'in'
        });

        var states = ['online', 'waiting_funds', 'successful', 'failed'];
        if (showDraft) {
            states.push('draft');
        }
        contextVM.state(states).project_user_id(user_id).order({
            updated_at: 'desc'
        });

        models.project.pageSize(9);
        pages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(function (err) {
            error(true);
            loader(false);
            m$1.redraw();
        });

        return {
            projects: pages,
            loader: loader,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var projects_collection = ctrl.projects.collection();

        return m$1('.content[id=\'created-tab\']', ctrl.error() ? m$1.component(inlineError, {
            message: 'Erro ao carregar os projetos.'
        }) : !ctrl.loader() ? [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m$1.component(projectCard, {
                project: project,
                ref: 'user_contributed',
                showFriends: false
            });
        }) : m$1('.w-container', m$1('.u-margintop-30.u-text-center.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.fontsize-large.u-marginbottom-30', 'O que você está esperando para tirar seu projeto do papel aqui no Catarse?'), m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', m$1('a.btn.btn-large[href=\'/start\']', 'Comece agora!')), m$1('.w-col.w-col-3')])]), m$1('.w-col.w-col-3')])), !_$1.isEmpty(projects_collection) ? m$1('.w-row.u-marginbottom-40.u-margintop-30', [m$1(loadMoreBtn, {
            collection: ctrl.projects,
            cssClass: '.w-col-push-5'
        })]) : ''] : h.loader());
    }
};

var userContributed = {
    controller: function controller(args) {
        var contributedProjects = m$1.prop(),
            user_id = args.userId,
            pages = postgrest$1.paginationVM(models.project),
            error = m$1.prop(false),
            loader = m$1.prop(true),
            contextVM = postgrest$1.filtersVM({
            project_id: 'in'
        });

        userVM.getPublicUserContributedProjects(user_id, null).then(function (data) {
            contributedProjects(data);
            if (!_$1.isEmpty(contributedProjects())) {
                contextVM.project_id(_$1.pluck(contributedProjects(), 'project_id')).order({
                    online_date: 'desc'
                });

                models.project.pageSize(9);
                pages.firstPage(contextVM.parameters()).then(function () {
                    loader(false);
                });
            } else {
                loader(false);
            }
        }).catch(function (err) {
            error(true);
            loader(false);
            m$1.redraw();
        });

        return {
            projects: pages,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var projects_collection = ctrl.projects.collection();
        return ctrl.error() ? m$1.component(inlineError, { message: 'Erro ao carregar os projetos.' }) : ctrl.loader() ? h.loader() : m$1('.content[id=\'contributed-tab\']', [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m$1.component(projectCard, {
                project: project,
                ref: 'user_contributed',
                showFriends: false
            });
        }) : m$1('.w-container', m$1('.u-margintop-30.u-text-center.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.fontsize-large.u-marginbottom-30', 'Ora, ora... você ainda não apoiou nenhum projeto no Catarse!'), m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', m$1('a.btn.btn-large[href=\'/explore\']', 'Que tal apoiar agora?')), m$1('.w-col.w-col-3')])]), m$1('.w-col.w-col-3')])), !_$1.isEmpty(projects_collection) ? m$1('.w-row.u-marginbottom-40.u-margintop-30', [m$1(loadMoreBtn, { collection: ctrl.projects, cssClass: '.w-col-push-5' })]) : '']);
    }
};

var userCard = {
    controller: function controller(args) {
        var userDetails = m$1.prop({}),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails);

        return {
            userDetails: userDetails,
            displayModal: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl) {
        var user = ctrl.userDetails(),
            contactModalC = [ownerMessageContent, ctrl.userDetails],
            profileImage = userVM.displayImage(user);
        return m$1('#user-card', m$1('.card.card-user.u-radius.u-marginbottom-30[itemprop=\'author\']', [m$1('.w-row', [m$1('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', m$1('img.thumb.u-round[itemprop=\'image\'][src=\'' + profileImage + '\'][width=\'100\']')), m$1('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m$1('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop=\'name\']', m$1('a.link-hidden[href="/users/' + user.id + '"]', user.public_name || user.name)), m$1('.fontsize-smallest.lineheight-looser[itemprop=\'address\']', user.address_city), m$1('.fontsize-smallest', h.pluralize(user.total_published_projects, ' projeto', ' projetos') + ' criados'), m$1('.fontsize-smallest', 'apoiou ' + h.pluralize(user.total_contributed_projects, ' projeto', ' projetos'))])]), m$1('.project-author-contacts', [m$1('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [!_$1.isEmpty(user.facebook_link) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + user.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_$1.isEmpty(user.twitter_username) ? m$1('li', [m$1('a.link-hidden[itemprop="url"][href="https://twitter.com/' + user.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _$1.map(user.links, function (link) {
            return m$1('li', [m$1('a.link-hidden[itemprop="url"][href="' + link.link + '"][target="_blank"]', link.link)]);
        })])]), ctrl.displayModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : '', m$1(UserFollowBtn, { follow_id: user.id, following: user.follwing_this_user, enabledClass: '.btn.btn-medium.btn-message.u-marginbottom-10', disabledClass: '.btn.btn-medium.btn-message.u-marginbottom-10' }), !_$1.isEmpty(user.email) ? m$1('a.btn.btn-medium.btn-message[href=\'javascript:void(0);\']', { onclick: ctrl.displayModal.toggle }, 'Enviar mensagem') : '']));
    }
};

var userAbout = {
    controller: function controller(args) {
        var userDetails = m$1.prop({}),
            loader = m$1.prop(true),
            error = m$1.prop(false),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails).then(function () {
            loader(false);
        }).catch(function (err) {
            error(true);
            loader(false);
            m$1.redraw();
        });

        return {
            userDetails: userDetails,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();
        return ctrl.error() ? m$1.component(inlineError, { message: 'Erro ao carregar dados.' }) : ctrl.loader() ? h.loader() : m$1('.content[id=\'about-tab\']', m$1('.w-container[id=\'about-content\']', m$1('.w-row', [m$1('.w-col.w-col-8', m$1('.fontsize-base', user.about_html ? m$1.trust(user.about_html) : '')), m$1('.w-col.w-col-4', user.id ? m$1.component(userCard, { userId: user.id }) : h.loader)])));
    }
};

var usersShow = {
    controller: function controller(args) {
        var userDetails = m$1.prop({}),
            user_id = args.user_id.split('-')[0],
            hash = m$1.prop(window.location.hash),
            displayTabContent = function displayTabContent(user) {
            var tabs = {
                '#created': m$1.component(userCreated, { userId: user.id }),
                '#contributed': m$1.component(userContributed, { userId: user.id }),
                '#about': m$1.component(userAbout, { userId: user.id })
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                if (user.total_published_projects > 0) {
                    hash('#created');
                    return tabs['#created'];
                } else if (user.total_contributed_projects > 0) {
                    hash('#contributed');
                    return tabs['#contributed'];
                } else {
                    hash('#about');
                    return tabs['#about'];
                }
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        userVM.fetchUser(user_id, true, userDetails);

        return {
            displayTabContent: displayTabContent,
            hash: hash,
            userDetails: userDetails
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m$1('div', [m$1.component(userHeader, { user: user }), m$1('nav.project-nav.u-text-center.u-marginbottom-30.profile', { style: { 'z-index': '10', 'position': 'relative' } }, m$1('.w-container[data-anchor=\'created\']', [!_$1.isEmpty(user) ? user.is_owner_or_admin ? m$1('a.dashboard-nav-link.dashboard[href=\'/pt/users/' + user.id + '/edit\']', { config: m$1.route, onclick: function onclick() {
                m$1.route("/users/edit/" + user.id, { user_id: user.id });
            } }, [m$1('span.fa.fa-cog'), m$1.trust('&nbsp;'), ' Editar perfil']) : '' : h.loader(), m$1('a[data-target=\'#contributed-tab\'][href=\'#contributed\'][id=\'contributed_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#contributed' ? 'selected' : '') + '\']', ['Apoiados ', m$1.trust('&nbsp;'), m$1('span.badge', user.total_contributed_projects)]), m$1('a[data-target=\'#created-tab\'][href=\'#created\'][id=\'created_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#created' ? 'selected' : '') + '\']', ['Criados ', m$1.trust('&nbsp;'), m$1('span.badge', user.total_published_projects)]), m$1('a[data-target=\'#about-tab\'][href=\'#about\'][id=\'about_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#about' ? 'selected' : '') + '\']', 'Sobre')])), m$1('section.section', m$1('.w-container', m$1('.w-row', user.id ? ctrl.displayTabContent(user) : h.loader())))]);
    }
};

var userAboutEdit = {
    controller: function controller(args) {
        var deleteUser = void 0;
        var user = args.user,
            fields = {
            password: m$1.prop(''),
            current_password: m$1.prop(''),
            uploaded_image: m$1.prop(userVM.displayImage(user)),
            cover_image: m$1.prop(user.profile_cover_image),
            email: m$1.prop(''),
            permalink: m$1.prop(user.permalink),
            public_name: m$1.prop(user.public_name),
            facebook_link: m$1.prop(user.facebook_link),
            twitter: m$1.prop(user.twitter_username),
            links: m$1.prop(user.links || []),
            about_html: m$1.prop(user.about_html || ''),
            email_confirmation: m$1.prop('')
        },
            passwordHasError = m$1.prop(false),
            emailHasError = m$1.prop(false),
            showEmailForm = h.toggleProp(false, true),
            showSuccess = m$1.prop(false),
            showError = m$1.prop(false),
            errors = m$1.prop(),
            loading = m$1.prop(false),
            uploading = m$1.prop(false),
            errorsArray = m$1.prop([]),
            pushErrosMessage = function pushErrosMessage() {
            errors(errorsArray().join('<br/>'));
        },
            updateFieldsFromUser = function updateFieldsFromUser() {
            userVM.fetchUser(args.userId, false).then(function (dataResponse) {
                var data = _$1.first(dataResponse);
                fields.uploaded_image(userVM.displayImage(data));
                fields.cover_image(data.profile_cover_image);
                fields.permalink(data.permalink);
                fields.public_name(data.public_name);
                fields.facebook_link(data.facebook_link);
                fields.twitter(data.twitter_username);
                fields.links(data.links);
                fields.about_html(data.about_html);
            });
        },
            uploadImage = function uploadImage() {
            var userUploadedImageEl = window.document.getElementById('user_uploaded_image'),
                userCoverImageEl = window.document.getElementById('user_cover_image'),
                formData = new FormData();

            formData.append('uploaded_image', userUploadedImageEl.files[0]);
            if (!args.hideCoverImg) {
                formData.append('cover_image', userCoverImageEl.files[0]);
            }

            uploading(true);
            m$1.redraw();

            return m$1.request({
                method: 'POST',
                url: '/users/' + user.id + '/upload_image.json',
                data: formData,
                config: h.setCsrfToken,
                serialize: function serialize(data) {
                    return data;
                }
            }).then(function (data) {
                fields.uploaded_image(data.uploaded_image);
                fields.cover_image(data.cover_image);
                uploading(false);
            }).catch(function (err) {
                if (_$1.isArray(err.errors)) {
                    errorsArray(errorsArray().concat(err.errors));
                } else {
                    errors('Erro ao atualizar informações.');
                }
                pushErrosMessage();
                showError(true);
                uploading(false);
            });
        },
            updateUser = function updateUser() {
            var userData = {
                current_password: fields.current_password(),
                password: fields.password(),
                email: fields.email(),
                permalink: fields.permalink(),
                public_name: fields.public_name(),
                facebook_link: fields.facebook_link(),
                twitter: fields.twitter(),
                about_html: fields.about_html(),
                links_attributes: linkAttributes()
            };

            loading(true);
            uploadImage();

            return m$1.request({
                method: 'PUT',
                url: '/users/' + user.id + '.json',
                data: {
                    user: userData
                },
                config: h.setCsrfToken
            }).then(function () {
                showSuccess(true);
                updateFieldsFromUser();
                loading(false);
                m$1.redraw();
            }).catch(function (err) {
                if (_$1.isArray(err.errors)) {
                    errorsArray(errorsArray().concat(err.errors));
                } else {
                    errors('Erro ao atualizar informações.');
                }

                pushErrosMessage();
                showError(true);
                loading(false);
                m$1.redraw();
            });
        },
            removeLinks = [],
            addLink = function addLink() {
            return fields.links().push({ link: '' });
        },
            removeLink = function removeLink(linkId, idx) {
            return function () {
                fields.links()[idx]._destroy = true;
                return false;
            };
        },
            linkAttributes = function linkAttributes() {
            return _$1.reduce(fields.links(), function (memo, item, index) {
                memo[index.toString()] = item;
                return memo;
            }, {});
        },
            validateEmailConfirmation = function validateEmailConfirmation() {
            if (fields.email() !== fields.email_confirmation()) {
                emailHasError(true);
            } else {
                emailHasError(false);
            }
            return !emailHasError();
        },
            validatePassword = function validatePassword() {
            var pass = String(fields.password());
            if (pass.length > 0 && pass.length <= 5) {
                passwordHasError(true);
            }

            return !passwordHasError();
        },
            setDeleteForm = function setDeleteForm(el, isInit) {
            if (!isInit) {
                deleteUser = function deleteUser() {
                    return el.submit();
                };
            }
        },
            deleteAccount = function deleteAccount() {
            if (window.confirm('Tem certeza que deseja desativar a sua conta?')) {
                deleteUser();
            }

            return false;
        },
            onSubmit = function onSubmit(e) {
            e.preventDefault();
            if (!validateEmailConfirmation()) {
                errors('Confirmação de email está incorreta.');
                showError(true);
            } else if (!validatePassword()) {
                errors('Nova senha está incorreta.');
                showError(true);
            } else {
                updateUser();
            }
            return false;
        };
        // Temporary fix for the menu selection bug. Should be fixed/removed as soon as we route all tabs from mithril.
        setTimeout(m$1.redraw, 0);

        return {
            removeLinks: removeLinks,
            removeLink: removeLink,
            addLink: addLink,
            fields: fields,
            loading: loading,
            showSuccess: showSuccess,
            showError: showError,
            errors: errors,
            uploading: uploading,
            onSubmit: onSubmit,
            emailHasError: emailHasError,
            showEmailForm: showEmailForm,
            validateEmailConfirmation: validateEmailConfirmation,
            passwordHasError: passwordHasError,
            validatePassword: validatePassword,
            deleteAccount: deleteAccount,
            setDeleteForm: setDeleteForm
        };
    },
    view: function view(ctrl, args) {
        var user = args.user || {},
            fields = ctrl.fields;

        return m$1('#about-tab.content', [ctrl.showSuccess() && !ctrl.loading() && !ctrl.uploading() ? m$1.component(popNotification, {
            message: 'As suas informações foram atualizadas'
        }) : '', ctrl.showError() && !ctrl.loading() && !ctrl.uploading() ? m$1.component(popNotification, {
            message: m$1.trust(ctrl.errors()),
            error: true
        }) : '', m$1('form.simple_form.w-form', { onsubmit: ctrl.onSubmit }, [m$1('input[name="utf8"][type="hidden"][value="✓"]'), m$1('input[name="_method"][type="hidden"][value="patch"]'), m$1('input[name="authenticity_token"][type="hidden"][value=' + h.authenticityToken() + ']'), m$1('div', m$1('.w-container', m$1('.w-row', m$1('.w-col.w-col-10.w-col-push-1', [!user.is_admin ? '' : m$1('.w-row.u-marginbottom-30.card.card-terciary', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', 'Endereço do seu perfil'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', 'Seu perfil público pode ter uma URL personalizada. Escolha uma fácil de guardar!    ')]), m$1('.w-col.w-col-7', m$1('.w-row', [m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', m$1('input.string.optional.w-input.text-field.text-field.positive.prefix[id="user_permalink"][type="text"]', {
            name: 'user[permalink]',
            value: fields.permalink(),
            onchange: m$1.withAttr('value', fields.permalink)
        })), m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.text-field.postfix.no-hover', m$1('.fontcolor-secondary.fontsize-smaller', '  .catarse.me'))]))]), m$1('.w-row.u-marginbottom-30.card.card-terciary', [m$1('.fontsize-base.fontweight-semibold', 'Email'), m$1('.fontsize-small.u-marginbottom-30', 'Mantenha esse email atualizado pois ele é o canal de comunicação entre você, a equipe do Catarse e a equipe dos projetos que você apoiou. '), m$1('.fontsize-base.u-marginbottom-40', [m$1('span.fontweight-semibold.card.u-radius', user.email), m$1('a.alt-link.fontsize-small.u-marginleft-10[href=\'javascript:void(0);\'][id=\'update_email\']', {
            onclick: function onclick() {
                ctrl.showEmailForm.toggle();
            }
        }, 'Alterar email')]), m$1((ctrl.showEmailForm() ? '' : '.w-hidden') + '.u-marginbottom-20.w-row[id=\'email_update_form\']', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.field-label.fontweight-semibold', 'Novo email'), m$1('input.w-input.text-field.positive[id=\'new_email\'][name=\'new_email\'][type=\'email\']', {
            class: ctrl.emailHasError() ? 'error' : '',
            value: fields.email(),
            onfocus: function onfocus() {
                return ctrl.emailHasError(false);
            },
            onchange: m$1.withAttr('value', fields.email)
        })]), m$1('.w-col.w-col-6', [m$1('label.field-label.fontweight-semibold', 'Confirmar novo email'), m$1('input.string.required.w-input.text-field.w-input.text-field.positive[id=\'new_email_confirmation\'][name=\'user[email]\'][type=\'text\']', {
            class: ctrl.emailHasError() ? 'error' : '',
            value: fields.email_confirmation(),
            onfocus: function onfocus() {
                return ctrl.emailHasError(false);
            },
            onblur: ctrl.validateEmailConfirmation,
            onchange: m$1.withAttr('value', fields.email_confirmation)
        })]), ctrl.emailHasError() ? m$1(inlineError, { message: 'Confirmação de email está incorreta.' }) : ''])]), m$1('.w-row.u-marginbottom-30.card.card-terciary', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', '  Nome no perfil público'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', '  Esse é o nome que os usuários irão ver no seu perfil. Não poderá ser alterado após a realização de um apoio ou públicação de um projeto.')]), m$1('.w-col.w-col-7', m$1('input.string.optional.w-input.text-field.positive[id="user_public_name"][type="text"]', {
            name: 'user[public_name]',
            value: fields.public_name(),
            onchange: m$1.withAttr('value', fields.public_name)
        }))]), m$1('.w-form', [m$1('.w-row.u-marginbottom-30.card.card-terciary', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', '  Imagem do perfil'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', '  Essa imagem será utilizada como a miniatura de seu perfil (PNG, JPG tamanho 280 x 280)')]), m$1('.w-col.w-col-4.w-sub-col', m$1('.input.file.optional.user_uploaded_image.field_with_hint', [m$1('label.field-label'), m$1('span.hint', m$1('img[alt="Avatar do Usuario"][src="' + fields.uploaded_image() + '"]')), m$1('input.file.optional.w-input.text-field[id="user_uploaded_image"][type="file"]', {
            name: 'user[uploaded_image]'
        })]))]), args.hideCoverImg ? '' : m$1('.w-row.u-marginbottom-30.card.card-terciary', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', '  Imagem de capa do perfil'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', '  Essa imagem será utilizada como fundo do cabeçalho do seu perfil público (PNG ou JPG). Caso você não envie nenhum imagem aqui, utilizaremos sua imagem de perfil como alternativa.')]), m$1('.w-col.w-col-4.w-sub-col', m$1('.input.file.optional.user_cover_image', [m$1('label.field-label'), m$1('span.hint', user.profile_cover_image ? m$1('img', { src: fields.cover_image() }) : ''), m$1('input.file.optional.w-input.text-field[id="user_cover_image"][type="file"]', { name: 'user[cover_image]' })]))])]), m$1('.w-row', m$1('.w-col', m$1('.card.card-terciary.u-marginbottom-30', [m$1('label.field-label.fontweight-semibold', 'Sobre'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'Fale sobre você e tente fornecer as informações mais relevantes para que visitantes possam te conhecer melhor. '), m$1('.w-form', m$1('.preview-container.u-marginbottom-40', h.redactor('user[about_html]', fields.about_html)))]))), m$1('.w-form.card.card-terciary.u-marginbottom-30', [m$1('.w-row.u-marginbottom-10', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', '  Perfil do facebook'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', '  Cole o link do seu perfil')]), m$1('.w-col.w-col-7', m$1('input.string.optional.w-input.text-field.positive[type="text"]', {
            name: 'user[facebook_link]',
            value: fields.facebook_link(),
            onchange: m$1.withAttr('value', fields.facebook_link)
        }))]), m$1('.w-row.u-marginbottom-10', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold', '  Perfil do twitter'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary', '  Cole o link do seu perfil')]), m$1('.w-col.w-col-7', m$1('input.string.optional.w-input.text-field.positive[type="text"]', {
            name: 'user[twitter]',
            value: fields.twitter(),
            onchange: m$1.withAttr('value', fields.twitter)
        }))])]), m$1('.w-form.card.card-terciary.u-marginbottom-30', m$1('.w-row.u-marginbottom-10', [m$1('.w-col.w-col-5.w-sub-col', [m$1('label.field-label.fontweight-semibold[for="name-8"]', ' Presença na internet'), m$1('label.field-label.fontsize-smallest.fontcolor-secondary[for="name-8"]', ' Inclua links que ajudem outros usuários a te conhecer melhor. ')]), m$1('.w-col.w-col-7', [m$1('.w-row', [fields.links() && fields.links().length <= 0 ? '' : m$1('.link', _$1.map(fields.links(), function (link, idx) {
            var toRemove = link._destroy;

            return m$1('div', {
                key: idx,
                class: toRemove ? 'w-hidden' : 'none'
            }, [m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m$1('input.string.w-input.text-field.w-input.text-field][type="text"][value="' + link.link + '"]', {
                class: link.link === '' ? 'positive' : 'optional',
                name: 'user[links_attributes][' + idx + '][link]',
                onchange: m$1.withAttr('value', function (val) {
                    return fields.links()[idx].link = val;
                })
            })), m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m$1('a.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border', {
                onclick: ctrl.removeLink(link.id, idx)
            })])]);
        }))]), m$1('.w-row', [m$1('.w-col.w-col-6.w-col-push-6', m$1('a.btn.btn-small.btn-terciary', { onclick: ctrl.addLink }, m$1('span.translation_missing', 'Add Link')))])])])), args.hidePasswordChange ? '' : m$1('.w-form.card.card-terciary.u-marginbottom-30', m$1('.w-row.u-marginbottom-10', [m$1('.fontsize-base.fontweight-semibold', 'Alterar minha senha'), m$1('.fontsize-small.u-marginbottom-20', 'Para que a senha seja alterada você precisa confirmar a sua senha atual.'), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.field-label.fontweight-semibold', ' Senha atual'), m$1('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_current_password\'][name=\'user[current_password]\'][type=\'password\']', {
            value: fields.current_password(),
            onchange: m$1.withAttr('value', fields.current_password)
        })]), m$1('.w-col.w-col-6', [m$1('label.field-label.fontweight-semibold', ' Nova senha'), m$1('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_password\'][name=\'user[password]\'][type=\'password\']', {
            class: ctrl.passwordHasError() ? 'error' : '',
            value: fields.password(),
            onfocus: function onfocus() {
                return ctrl.passwordHasError(false);
            },
            onblur: ctrl.validatePassword,
            onchange: m$1.withAttr('value', fields.password)
        }), !ctrl.passwordHasError() ? '' : m$1(inlineError, { message: 'A sua nova senha deve ter no mínimo 6 caracteres.' })])])])), args.hideDisableAcc ? '' : m$1('.w-form.card.card-terciary.u-marginbottom-30', m$1('.w-row.u-marginbottom-10', [m$1('.fontweight-semibold.fontsize-smaller', 'Desativar minha conta'), m$1('.fontsize-smallest', 'Todos os seus apoios serão convertidos em apoios anônimos, seus dados não serão mais visíveis, você sairá automaticamente do sistema e sua conta será desativada permanentemente.'), m$1('a.alt-link.fontsize-smaller[href=\'/pt/users/' + user.id + '\'][rel=\'nofollow\']', {
            onclick: ctrl.deleteAccount
        }, 'Desativar minha conta no Catarse'), m$1('form.w-hidden', { action: '/pt/users/' + user.id, method: 'post', config: ctrl.setDeleteForm }, [m$1('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']'), m$1('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']')])]))])))), m$1('div', m$1('.w-container' + (args.useFloatBtn ? '.w-section.save-draft-btn-section' : ''), m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('input[id="anchor"][name="anchor"][type="hidden"][value="about_me"]'), !ctrl.loading() && !ctrl.uploading() ? m$1('input.btn.btn.btn-large[name="commit"][type="submit"][value="Salvar"]', {
            onclick: ctrl.onSubmit
        }) : h.loader()]), m$1('.w-col.w-col-4')])))])]);
    }
};

var I18nScope$15 = _$1.partial(h.i18nScope, 'payment.state');

var userContributedBox = {
    controller: function controller(args) {
        var setCsrfToken = function setCsrfToken(xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
            return;
        };
        var toggleAnonymous = function toggleAnonymous(projectId, contributionId) {
            m$1.request({
                method: 'GET',
                config: setCsrfToken,
                url: '/projects/' + projectId + '/contributions/' + contributionId + '/toggle_anonymous'
            });
        };
        return {
            toggleAnonymous: toggleAnonymous
        };
    },
    view: function view(ctrl, args) {
        var collection = args.collection,
            pagination = args.pagination,
            title = args.title;
        return !_$1.isEmpty(collection) ? m$1('.section-one-column.u-marginbottom-30', [m$1('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center', title), m$1('.w-row.w-hidden-small.w-hidden-tiny.card.card-secondary', [m$1('.w-col.w-col-3', m$1('.fontsize-small.fontweight-semibold', 'Projetos que apoiei')), m$1('.w-col.w-col-2', m$1('.fontsize-small.fontweight-semibold', 'Valor do apoio')), m$1('.w-col.w-col-3', m$1('.fontsize-small.fontweight-semibold', 'Status do apoio')), m$1('.w-col.w-col-4', m$1('.fontsize-small.fontweight-semibold', 'Recompensa'))]), _$1.map(collection, function (contribution) {
            return m$1('.w-row.card', [m$1('.w-col.w-col-3', m$1('.w-row', [m$1('.w-col.w-col-4.u-marginbottom-10', m$1('a[href=\'/' + contribution.permalink + '\']', m$1('img.thumb-project.u-radius[alt=\'' + contribution.project_name + '\'][src=\'' + contribution.project_image + '\'][width=\'50\']'))), m$1('.w-col.w-col-8', m$1('.fontsize-small.fontweight-semibold', m$1('a.alt-link[href=\'/' + contribution.permalink + '\']', contribution.project_name)))])), m$1('.w-col.w-col-2.u-marginbottom-10', m$1('.fontsize-base.inline-block', [m$1('span.w-hidden-main.w-hidden-medium.fontweight-semibold', 'Valor do apoio'), ' R$ ' + contribution.value])), m$1('.w-col.w-col-3.u-marginbottom-10', [m$1('.w-hidden-main.w-hidden-medium.fontsize-smallest.fontweight-semibold', 'Status'), m$1('.fontsize-smaller.fontweight-semibold', [m$1('.lineheight-tighter'), m$1('span.fa.fa-circle.fontsize-smallest.' + (contribution.state == 'paid' ? 'text-success' : contribution.state == 'pending' ? 'text-waiting' : 'text-error'), m$1.trust('&nbsp;')), I18n.t(contribution.state, I18nScope$15({
                date: h.momentify(contribution[contribution.state + '_at'])
            }))]), m$1('.fontsize-smallest', contribution.installments > 1 ? contribution.installments + ' x R$ ' + contribution.installment_value + ' ' : '', contribution.payment_method == 'BoletoBancario' ? 'Boleto Bancário' : 'Cartão de Crédito'), contributionVM.canShowReceipt(contribution) ? m$1('a.btn.btn-inline.btn-small.u-margintop-10.btn-terciary[href=\'https://www.catarse.me/pt/projects/' + contribution.project_id + '/contributions/' + contribution.contribution_id + '/receipt\'][target=\'__blank\']', 'Ver recibo') : '', contributionVM.canShowSlip(contribution) ? m$1('a.btn.btn-inline.btn-small.u-margintop-10[href=\'' + contribution.gateway_data['boleto_url'] + '\'][target=\'__blank\']', 'Imprimir boleto') : '', contributionVM.canGenerateSlip(contribution) ? m$1('a.btn.btn-inline.btn-small.u-margintop-10[href=\'https://www.catarse.me/pt/projects/' + contribution.project_id + '/contributions/' + contribution.contribution_id + '/second_slip\'][target=\'__blank\']', 'Gerar 2a via') : '', m$1('.w-checkbox.fontsize-smallest.fontcolor-secondary.u-margintop-10', [m$1('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']' + (contribution.anonymous ? '[checked=\'checked\']' : '') + '[value=\'1\']', {
                onclick: function onclick() {
                    return ctrl.toggleAnonymous(contribution.project_id, contribution.contribution_id);
                }
            }), m$1('label.w-form-label', 'Quero que meu apoio não seja público')])]), m$1('.w-col.w-col-4', m$1('.fontsize-smallest', [m$1('span.w-hidden-main.w-hidden-medium.fontweight-semibold', 'Recompensa'), contribution.reward_id ? m$1.trust(h.simpleFormat(contribution.reward_description)) : ' Não selecionou recompensa']), m$1('.fontsize-smallest.lineheight-looser', [m$1('span.fontweight-semibold', 'Estimativa de entrega: '), h.momentify(contribution.deliver_at, 'MMMM/YYYY')]))]);
        }), m$1('.w-row.u-marginbottom-40.u-margintop-30', [m$1(loadMoreBtn, {
            collection: pagination,
            cssClass: '.w-col-push-5'
        })])]) : m$1('div', '');
    }
};

var userPrivateContributed = {
    controller: function controller(args) {
        var user_id = args.userId,
            online = postgrest$1.paginationVM(models.project),
            onlinePages = postgrest$1.paginationVM(models.userContribution),
            successfulPages = postgrest$1.paginationVM(models.userContribution),
            failedPages = postgrest$1.paginationVM(models.userContribution),
            error = m$1.prop(false),
            loader = m$1.prop(true),
            handleError = function handleError() {
            error(true);
            loader(false);
            m$1.redraw();
        },
            contextVM = postgrest$1.filtersVM({
            user_id: 'eq',
            state: 'in',
            project_state: 'in'
        });

        models.userContribution.pageSize(9);
        contextVM.user_id(user_id).order({
            created_at: 'desc'
        }).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

        contextVM.project_state(['online', 'waiting_funds']);
        onlinePages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['successful']);
        successfulPages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['failed']);
        failedPages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        return {
            onlinePages: onlinePages,
            successfulPages: successfulPages,
            failedPages: failedPages,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var onlineCollection = ctrl.onlinePages.collection(),
            successfulCollection = ctrl.successfulPages.collection(),
            failedCollection = ctrl.failedPages.collection();

        return m$1('.content[id=\'private-contributed-tab\']', ctrl.error() ? m$1.component(inlineError, {
            message: 'Erro ao carregar os projetos.'
        }) : ctrl.loader() ? h.loader() : _$1.isEmpty(onlineCollection) && _$1.isEmpty(successfulCollection) && _$1.isEmpty(failedCollection) ? m$1('.w-container', m$1('.w-row.u-margintop-30.u-text-center', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.fontsize-large.u-marginbottom-30', ['Você ainda não apoiou nenhum projeto no', m$1.trust('&nbsp;'), 'Catarse...']), m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', m$1('a.btn.btn-large[href=\'/pt/explore\']', {
            config: m$1.route,
            onclick: function onclick() {
                m$1.route('/explore');
            }
        }, 'Apoie agora!')), m$1('.w-col.w-col-3')])]), m$1('.w-col.w-col-3')])) : [m$1.component(userContributedBox, {
            title: 'Projetos em andamento',
            collection: onlineCollection,
            pagination: ctrl.onlinePages
        }), m$1.component(userContributedBox, {
            title: 'Projetos bem-sucedidos',
            collection: successfulCollection,
            pagination: ctrl.successfulPages
        }), m$1.component(userContributedBox, {
            title: 'Projetos não-financiados',
            collection: failedCollection,
            pagination: ctrl.failedPages
        })]);
    }
};

var userSettings = {
    controller: function controller(args) {
        var user = args.user,
            fields = {
            owner_document: m$1.prop(user.owner_document),
            country_id: m$1.prop(user.address.country_id),
            street: m$1.prop(user.address.street),
            number: m$1.prop(user.address.number),
            city: m$1.prop(user.address.city),
            zipcode: m$1.prop(user.address.zipcode),
            complement: m$1.prop(user.address.complement),
            neighbourhood: m$1.prop(user.address.neighbourhood),
            state: m$1.prop(user.address.state),
            phonenumber: m$1.prop(user.address.phonenumber),
            name: m$1.prop(user.name)
        },
            user_id = args.userId,
            error = m$1.prop(''),
            countries = m$1.prop(),
            states = m$1.prop(),
            loader = m$1.prop(true),
            showSuccess = m$1.prop(false),
            showError = m$1.prop(false),
            countriesLoader = postgrest$1.loader(models.country.getPageOptions()),
            statesLoader = postgrest$1.loader(models.state.getPageOptions()),
            phoneMask = _$1.partial(h.mask, '(99) 9999-99999'),
            documentMask = _$1.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _$1.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _$1.partial(h.mask, '99999-999'),
            isCnpj = m$1.prop(false),
            setCsrfToken = function setCsrfToken(xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
            return;
        },
            updateUserData = function updateUserData(user_id) {
            var userData = {
                country_id: fields.country_id(),
                address_street: fields.street(),
                address_number: fields.number(),
                address_city: fields.city(),
                address_zip_code: fields.zipcode(),
                address_complement: fields.complement(),
                address_state: fields.state(),
                address_neighbourhood: fields.neighbourhood(),
                phone_number: fields.phonenumber(),
                owner_document: fields.owner_document(),
                name: fields.name()
            };

            return m$1.request({
                method: 'PUT',
                url: '/users/' + user_id + '.json',
                data: {
                    user: userData
                },
                config: setCsrfToken
            }).then(function () {
                showSuccess(true);
                m$1.redraw();
            }).catch(function (err) {
                if (_$1.isArray(err.errors)) {
                    error(err.errors.join('<br>'));
                } else {
                    error('Erro ao atualizar informações.');
                }

                showError(true);
                m$1.redraw();
            });
        },
            validateDocument = function validateDocument() {
            var document = fields.owner_document(),
                striped = String(document).replace(/[\.|\-|\/]*/g, '');
            var isValid = false,
                errorMessage = '';

            if (document.length > 14) {
                return h.validateCnpj(document);
            } else if (document.length > 0) {
                return h.validateCpf(striped);
            }

            return;
        },

        // TODO: this form validation should be abstracted/merged together with others
        onSubmit = function onSubmit() {
            if (!validateDocument()) {
                error('CPF/CNPJ inválido');
                showError(true);
            } else {
                updateUserData(user_id);
            }

            return false;
        },
            applyZipcodeMask = _$1.compose(fields.zipcode, zipcodeMask),
            applyPhoneMask = _$1.compose(fields.phonenumber, phoneMask),
            applyDocumentMask = function applyDocumentMask(value) {
            if (value.length > 14) {
                isCnpj(true);
                fields.owner_document(documentCompanyMask(value));
            } else {
                isCnpj(false);
                fields.owner_document(documentMask(value));
            }

            return;
        };

        countriesLoader.load().then(countries);
        statesLoader.load().then(states);

        return {
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            countries: countries,
            states: states,
            fields: fields,
            loader: loader,
            showSuccess: showSuccess,
            showError: showError,
            user: user,
            onSubmit: onSubmit,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.user,
            fields = ctrl.fields;

        return m$1('[id=\'settings-tab\']', [ctrl.showSuccess() ? m$1.component(popNotification, {
            message: 'As suas informações foram atualizadas'
        }) : '', ctrl.showError() ? m$1.component(popNotification, {
            message: m$1.trust(ctrl.error()),
            error: true
        }) : '', m$1('form.w-form', {
            onsubmit: ctrl.onSubmit
        }, [m$1('div', [m$1('.w-container', m$1('.w-col.w-col-10.w-col-push-1', m$1('.w-form.card.card-terciary.u-marginbottom-20', [m$1('.fontsize-base.fontweight-semibold', 'Nome'), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-6.w-sub-col', m$1('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_name\'][name=\'user[name]\'][type=\'text\']', {
            value: fields.name(),
            onchange: m$1.withAttr('value', fields.name)
        })), m$1('.w-col.w-col-6')]), m$1('.fontsize-base.fontweight-semibold', 'CPF / CNPJ'), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-6.w-sub-col', m$1('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_cpf\'][name=\'user[cpf]\'][type=\'tel\']', {
            value: fields.owner_document(),
            onchange: m$1.withAttr('value', ctrl.applyDocumentMask),
            onkeyup: m$1.withAttr('value', ctrl.applyDocumentMask)
        })), m$1('.w-col.w-col-6')]), m$1('.divider.u-marginbottom-20'), m$1('.fontsize-base.fontweight-semibold', 'Endereço'), m$1('.fontsize-small.u-marginbottom-20', 'Esse é o endereço que foi informado ao realizar seu último apoio. Se você mudou de endereço, altere aqui e, caso você esteja aguardando alguma recompensa, avise por email ao realizador do projeto apoiado.'), m$1('.w-row', [m$1('.input.select.optional.user_country.w-col.w-col-6.w-sub-col', [m$1('label.field-label', 'País'), m$1('select.select.optional.w-input.text-field.w-select.positive[id=\'user_country_id\'][name=\'user[country_id]\']', {
            onchange: m$1.withAttr('value', fields.country_id)
        }, [m$1('option[value=\'\']'), !_$1.isEmpty(ctrl.countries()) ? _$1.map(ctrl.countries(), function (country) {
            return m$1('option' + (country.id == fields.country_id() ? '[selected="selected"]' : ''), {
                value: country.id
            }, country.name);
        }) : ''])]), m$1('.w-col.w-col-6')]), m$1('.w-row', [m$1('.input.string.optional.user_address_street.w-col.w-col-6.w-sub-col', [m$1('label.field-label', 'Endereço'), m$1('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_street\'][name=\'user[address_street]\'][type=\'text\']', {
            value: fields.street(),
            onchange: m$1.withAttr('value', fields.street)
        }), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_street\']', ' translation missing: pt.simple_form.validation_texts.user.address_street')]), m$1('.w-col.w-col-6', m$1('.w-row', [m$1('.input.tel.optional.user_address_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.field-label', 'Número'), m$1('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_number\'][name=\'user[address_number]\'][type=\'tel\']', {
            value: fields.number(),
            onchange: m$1.withAttr('value', fields.number)
        }), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_number\']', ' translation missing: pt.simple_form.validation_texts.user.address_number')]), m$1('.input.string.optional.user_address_complement.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('label.field-label', 'Complemento'), m$1('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_complement\'][name=\'user[address_complement]\'][type=\'text\']', {
            value: fields.complement(),
            onchange: m$1.withAttr('value', fields.complement)
        })])]))]), m$1('.w-row', [m$1('.input.string.optional.user_address_neighbourhood.w-col.w-col-6.w-sub-col', [m$1('label.field-label', 'Bairro'), m$1('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_neighbourhood\'][name=\'user[address_neighbourhood]\'][type=\'text\']', {
            value: fields.neighbourhood(),
            onchange: m$1.withAttr('value', fields.neighbourhood)
        })]), m$1('.input.string.optional.user_address_city.w-col.w-col-6', [m$1('label.field-label', 'Cidade'), m$1('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_city\'][name=\'user[address_city]\'][type=\'text\']', {
            value: fields.city(),
            onchange: m$1.withAttr('value', fields.city)
        }), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_city\']', ' translation missing: pt.simple_form.validation_texts.user.address_city')])]), m$1('.w-row', [m$1('.input.select.optional.user_address_state.w-col.w-col-6.w-sub-col', [m$1('label.field-label', 'Estado'), m$1('select.select.optional.w-input.text-field.w-select.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_state\'][name=\'user[address_state]\']', {

            onchange: m$1.withAttr('value', fields.state)
        }, [m$1('option[value=\'\']'), !_$1.isEmpty(ctrl.states()) ? _$1.map(ctrl.states(), function (state) {
            return m$1('option[value=\'' + state.acronym + '\']' + (state.acronym == fields.state() ? '[selected="selected"]' : ''), {
                value: state.acronym
            }, state.name);
        }) : '', m$1('option[value=\'outro / other\']', 'Outro / Other')]), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_state\']', ' translation missing: pt.simple_form.validation_texts.user.address_state')]), m$1('.w-col.w-col-6', m$1('.w-row', [m$1('.input.tel.optional.user_address_zip_code.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.field-label', 'CEP'), m$1('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'99999-999\'][data-required-in-brazil=\'true\'][id=\'user_address_zip_code\'][name=\'user[address_zip_code]\'][type=\'tel\']', {
            value: fields.zipcode(),
            onchange: m$1.withAttr('value', fields.zipcode)
        }), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_address_zip_code\']', ' translation missing: pt.simple_form.validation_texts.user.address_zip_code')]), m$1('.input.tel.optional.user_phone_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('label.field-label', 'Telefone'), m$1('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'(99) 9999-99999\'][data-required-in-brazil=\'true\'][id=\'user_phone_number\'][name=\'user[phone_number]\'][type=\'tel\']', {
            value: fields.phonenumber(),
            onchange: m$1.withAttr('value', fields.phonenumber),
            onkeyup: m$1.withAttr('value', function (value) {
                return ctrl.applyPhoneMask(value);
            })
        })])]))])]))), m$1('div', m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-4.w-col-push-4', m$1('input.btn.btn.btn-large[name=\'commit\'][type=\'submit\'][value=\'Salvar\']')), m$1('.w-col.w-col-4')])))])])]);
    }
};

var userBilling = {
    controller: function controller(args) {
        models.bank.pageSize(false);
        var deleteFormSubmit = void 0;
        var user = args.user,
            bankAccount = m$1.prop({}),
            fields = {
            owner_name: m$1.prop(''),
            agency: m$1.prop(''),
            bank_id: m$1.prop(''),
            agency_digit: m$1.prop(''),
            account: m$1.prop(''),
            account_digit: m$1.prop(''),
            owner_document: m$1.prop(''),
            bank_account_id: m$1.prop('')
        },
            userId = args.userId,
            error = m$1.prop(''),
            showError = m$1.prop(false),
            loader = m$1.prop(true),
            bankInput = m$1.prop(''),
            bankCode = m$1.prop('-1'),
            banks = m$1.prop(),
            creditCards = m$1.prop(),
            handleError = function handleError() {
            error(true);
            loader(false);
            m$1.redraw();
        },
            banksLoader = postgrest$1.loader(models.bank.getPageOptions()),
            showSuccess = m$1.prop(false),
            showOtherBanks = h.toggleProp(false, true),
            showOtherBanksInput = m$1.prop(false),
            setCsrfToken = function setCsrfToken(xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
            return;
        },
            confirmDelete = function confirmDelete(cardId) {
            var r = confirm('você tem certeza?');
            if (r) {
                return m$1.request({
                    method: 'DELETE',
                    url: '/users/' + user.id + '/credit_cards/' + cardId,
                    config: setCsrfToken
                }).then(function () {
                    location.reload();
                }).catch(handleError);
            }
            return false;
        },
            popularBanks = [{
            id: '51',
            code: '001',
            name: 'Banco do Brasil S.A.'
        }, {
            id: '131',
            code: '341',
            name: 'Itaú Unibanco S.A.'
        }, {
            id: '122',
            code: '104',
            name: 'Caixa Econômica Federal'
        }, {
            id: '104',
            code: '033',
            name: 'Banco Santander  (Brasil)  S.A.'
        }, {
            id: '127',
            code: '399',
            name: 'HSBC Bank Brasil S.A. - Banco Múltiplo'
        }, {
            id: '23',
            code: '237',
            name: 'Banco Bradesco S.A.'
        }],

        // Little trick to reproduce Rails+SimpleForm behavior
        // We create a hidden form with the correct input values set
        // Then we submit it when the remove card button is clicked
        // The card id is set on the go, with the help of a closure.
        toDeleteCard = m$1.prop(-1),
            deleteCard = function deleteCard(id) {
            return function () {
                toDeleteCard(id);
                // We must redraw here to update the action output of the hidden form on the DOM.
                m$1.redraw(true);
                deleteFormSubmit();
                return false;
            };
        },
            updateUserData = function updateUserData(user_id) {
            var userData = {
                owner_name: fields.owner_name(),
                owner_document: fields.owner_document(),
                bank_id: bankCode(),
                input_bank_number: bankInput(),
                agency_digit: fields.agency_digit(),
                agency: fields.agency(),
                account: fields.account(),
                account_digit: fields.account_digit()
            };
            if (fields.bank_account_id()) {
                userData['id'] = fields.bank_account_id().toString();
            }

            return m$1.request({
                method: 'PUT',
                url: '/users/' + user_id + '.json',
                data: {
                    user: { bank_account_attributes: userData }
                },
                config: setCsrfToken
            }).then(function () {
                showSuccess(true);
                m$1.redraw();
            }).catch(function (err) {
                if (_$1.isArray(err.errors)) {
                    error(err.errors.join('<br>'));
                } else {
                    error('Erro ao atualizar informações.');
                }

                showError(true);
                m$1.redraw();
            });
        },
            onSubmit = function onSubmit() {
            updateUserData(userId);

            return false;
        },
            setCardDeletionForm = function setCardDeletionForm(el, isInit) {
            if (!isInit) {
                deleteFormSubmit = function deleteFormSubmit() {
                    return el.submit();
                };
            }
        };

        userVM.getUserBankAccount(userId).then(function (data) {
            if (!_$1.isEmpty(_$1.first(data))) {
                bankAccount(_$1.first(data));
                fields.owner_document(bankAccount().owner_document);
                fields.owner_name(bankAccount().owner_name);
                fields.bank_account_id(bankAccount().bank_account_id);
                fields.account(bankAccount().account);
                fields.account_digit(bankAccount().account_digit);
                fields.agency(bankAccount().agency);
                fields.agency_digit(bankAccount().agency_digit);
                fields.bank_id(bankAccount().bank_id);
                bankCode(bankAccount().bank_id);
            }
        }).catch(handleError);

        userVM.getUserCreditCards(userId).then(creditCards).catch(handleError);
        banksLoader.load().then(banks).catch(handleError);

        return {
            creditCards: creditCards,
            deleteCard: deleteCard,
            toDeleteCard: toDeleteCard,
            setCardDeletionForm: setCardDeletionForm,
            bankAccount: bankAccount,
            confirmDelete: confirmDelete,
            bankInput: bankInput,
            banks: banks,
            showError: showError,
            showOtherBanks: showOtherBanks,
            fields: fields,
            showOtherBanksInput: showOtherBanksInput,
            loader: loader,
            bankCode: bankCode,
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            popularBanks: popularBanks,
            user: user,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var user = args.user,
            fields = ctrl.fields,
            bankAccount = ctrl.bankAccount();

        return m$1('[id=\'billing-tab\']', [ctrl.showSuccess() ? m$1.component(popNotification, {
            message: 'As suas informações foram atualizadas'
        }) : '', ctrl.showError() ? m$1.component(popNotification, {
            message: m$1.trust(ctrl.error()),
            error: true
        }) : '', m$1('.w-row', m$1('.w-col.w-col-10.w-col-push-1', [m$1('.w-form.card.card-terciary.u-marginbottom-20', [m$1('.fontsize-base.fontweight-semibold', 'Cartões de crédito'), m$1('.fontsize-small.u-marginbottom-20', ['Caso algum projeto que você tenha apoiado ', m$1('b', 'com Cartão de Crédito'), ' não seja bem-sucedido, nós efetuaremos o reembolso ', m$1('b', 'automaticamente'), ' no cartão utilizado para efetuar o apoio. ']), m$1('.divider.u-marginbottom-20'), m$1('.w-row.w-hidden-tiny.card', [m$1('.w-col.w-col-5.w-col-small-5', m$1('.fontsize-small.fontweight-semibold', 'Cartão')), m$1('.w-col.w-col-5.w-col-small-5', m$1('.fontweight-semibold.fontsize-small', 'Operadora')), m$1('.w-col.w-col-2.w-col-small-2')]), _$1.map(ctrl.creditCards(), function (card) {
            return m$1('.w-row.card', [m$1('.w-col.w-col-5.w-col-small-5', m$1('.fontsize-small.fontweight-semibold', ['XXXX XXXX XXXX', m$1.trust('&nbsp;'), card.last_digits])), m$1('.w-col.w-col-5.w-col-small-5', m$1('.fontsize-small.fontweight-semibold.u-marginbottom-10', card.card_brand.toUpperCase())), m$1('.w-col.w-col-2.w-col-small-2', m$1('a.btn.btn-terciary.btn-small[rel=\'nofollow\']', { onclick: ctrl.deleteCard(card.id) }, 'Remover'))]);
        }), m$1('form.w-hidden', { action: '/pt/users/' + user.id + '/credit_cards/' + ctrl.toDeleteCard(), method: 'POST', config: ctrl.setCardDeletionForm }, [m$1('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'), m$1('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'), m$1('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']')])]), m$1('form.simple_form.refund_bank_account_form', { onsubmit: ctrl.onSubmit }, [m$1('input[id=\'anchor\'][name=\'anchor\'][type=\'hidden\'][value=\'billing\']'), m$1('.w-form.card.card-terciary', [m$1('.fontsize-base.fontweight-semibold', 'Dados bancários'), m$1('.fontsize-small.u-marginbottom-20', ['Caso algum projeto que você tenha apoiado ', m$1('b', 'com Boleto Bancário'), ' não seja bem-sucedido, nós efetuaremos o reembolso de seu pagamento ', m$1('b', 'automaticamente'), ' na conta indicada abaixo.']), m$1('.divider.u-marginbottom-20'), m$1('.w-row', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_name\']', 'Nome do titular'), m$1('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_owner_name\'][type=\'text\']', {
            value: fields.owner_name(),
            name: 'user[bank_account_attributes][owner_name]',
            onchange: m$1.withAttr('value', fields.owner_name)
        })]), m$1('.w-col.w-col-6', [m$1('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']', 'CPF / CNPJ do titular'), m$1('input.string.tel.required.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
            value: fields.owner_document(),
            name: 'user[bank_account_attributes][owner_document]',
            onchange: m$1.withAttr('value', fields.owner_document)
        })])]), m$1('.w-row', [m$1('.w-col.w-col-6.w-sub-col' + (ctrl.showOtherBanksInput() ? '.w-hidden' : '') + '[id=\'bank_select\']', m$1('.input.select.required.user_bank_account_bank_id', [m$1('label.field-label', 'Banco'), m$1('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_bank_id\']', {
            name: 'user[bank_account_attributes][bank_id]',
            onchange: function onchange(e) {
                m$1.withAttr('value', ctrl.bankCode)(e);
                ctrl.showOtherBanksInput(ctrl.bankCode() == '0');
            }
        }, [m$1('option[value=\'\']', { selected: fields.bank_id() === '' }), _$1.map(ctrl.popularBanks, function (bank) {
            return fields.bank_id() != bank.id ? m$1('option[value=\'' + bank.id + '\']', {
                selected: fields.bank_id() == bank.id
            }, bank.code + ' . ' + bank.name) : '';
        }), fields.bank_id() === '' || _$1.find(ctrl.popularBanks, function (bank) {
            return bank.id === fields.bank_id();
        }) ? '' : m$1('option[value=\'' + fields.bank_id() + '\']', {
            selected: true
        }, bankAccount.bank_code + ' . ' + bankAccount.bank_name), m$1('option[value=\'0\']', 'Outro')]), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_bank_id\']', ' Selecione um banco')])), ctrl.showOtherBanksInput() ? m$1('.w-col.w-col-6.w-sub-col', m$1('.w-row.u-marginbottom-20[id=\'bank_search\']', m$1('.w-col.w-col-12', [m$1('.input.string.optional.user_bank_account_input_bank_number', [m$1('label.field-label', 'Número do banco (3 números)'), m$1('input.string.optional.w-input.text-field.bank_account_input_bank_number[id=\'user_bank_account_attributes_input_bank_number\'][maxlength=\'3\'][size=\'3\'][type=\'text\']', {
            name: 'user[bank_account_attributes][input_bank_number]',
            value: ctrl.bankInput(),
            onchange: m$1.withAttr('value', ctrl.bankInput)
        }), m$1('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_input_bank_number\']', ' Número do banco inválido')]), m$1('a.w-hidden-small.w-hidden-tiny.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
            onclick: ctrl.showOtherBanks.toggle
        }, ['Busca por nome  ', m$1.trust('&nbsp;'), m$1.trust('&gt;')]), m$1('a.w-hidden-main.w-hidden-medium.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
            onclick: ctrl.showOtherBanks.toggle
        }, ['Busca por nome  ', m$1.trust('&nbsp;'), m$1.trust('&gt;')])]))) : '', ctrl.showOtherBanks() ? m$1('.w-row[id=\'bank_search_list\']', m$1('.w-col.w-col-12', m$1('.select-bank-list[data-ix=\'height-0-on-load\']', {
            style: {
                'height': '395px'
            }
        }, m$1('.card.card-terciary', [m$1('.fontsize-small.fontweight-semibold.u-marginbottom-10.u-text-center', 'Selecione o seu banco abaixo'), m$1('.fontsize-smaller', [m$1('.w-row.card.card-secondary.fontweight-semibold', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m$1('div', 'Número')), m$1('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m$1('div', 'Nome'))]), !_$1.isEmpty(ctrl.banks()) ? _$1.map(ctrl.banks(), function (bank) {
            return m$1('.w-row.card.fontsize-smallest', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m$1('a.link-hidden.bank-resource-link[data-code=\'' + bank.code + '\'][data-id=\'' + bank.id + '\'][href=\'javascript:void(0)\']', {
                onclick: function onclick() {
                    ctrl.bankInput(bank.code);
                    ctrl.showOtherBanks.toggle();
                }
            }, bank.code)), m$1('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m$1('a.link-hidden.bank-resource-link[data-code=\'' + bank.code + '\'][data-id=\'' + bank.id + '\'][href=\'javascript:void(0)\']', {
                onclick: function onclick() {
                    ctrl.bankInput(bank.code);
                    ctrl.showOtherBanks.toggle();
                }
            }, bank.code + ' . ' + bank.name))]);
        }) : ''])])))) : '', m$1('.w-col.w-col-6', m$1('.w-row', [m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_agency\']', 'Agência'), m$1('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_agency\'][type=\'text\']', {
            value: fields.agency(),
            name: 'user[bank_account_attributes][agency]',
            onchange: m$1.withAttr('value', fields.agency)
        })]), m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('label.text.optional.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_agency_digit\']', 'Dígito agência'), m$1('input.string.optional.w-input.text-field.positive[id=\'user_bank_account_attributes_agency_digit\'][type=\'text\']', {
            value: fields.agency_digit(),
            name: 'user[bank_account_attributes][agency_digit]',
            onchange: m$1.withAttr('value', fields.agency_digit)
        })])]))]), m$1('.w-row', [m$1('.w-col.w-col-6.w-sub-col', [m$1('label.field-label.fontweight-semibold', 'Tipo de conta'), m$1('p.fontsize-smaller.u-marginbottom-20', 'Só aceitamos conta corrente')]), m$1('.w-col.w-col-6', m$1('.w-row', [m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_account\']', 'No. da conta'), m$1('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account\'][type=\'text\']', {
            value: fields.account(),
            onchange: m$1.withAttr('value', fields.account),
            name: 'user[bank_account_attributes][account]'
        })]), m$1('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m$1('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_account_digit\']', 'Dígito conta'), m$1('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account_digit\'][type=\'text\']', {
            value: fields.account_digit(),
            onchange: m$1.withAttr('value', fields.account_digit),
            name: 'user[bank_account_attributes][account_digit]'
        })])]))]), bankAccount.bank_account_id ? m$1('input[id=\'user_bank_account_attributes_id\'][type=\'hidden\']', {
            name: 'user[bank_account_attributes][id]',
            value: fields.bank_account_id()
        }) : '']), m$1('.u-margintop-30', m$1('.w-container', m$1('.w-row', m$1('.w-col.w-col-4.w-col-push-4', m$1('input.btn.btn-large[name=\'commit\'][type=\'submit\'][value=\'Salvar\']')))))])]))]);
    }
};

var userNotifications = {
    controller: function controller(args) {
        var contributedProjects = m$1.prop(),
            projectReminders = m$1.prop(),
            user_id = args.userId,
            showNotifications = h.toggleProp(false, true),
            error = m$1.prop(false);

        userVM.getUserProjectReminders(user_id).then(projectReminders).catch(function (err) {
            error(true);
            m$1.redraw();
        });

        userVM.getUserContributedProjects(user_id, null).then(contributedProjects).catch(function (err) {
            error(true);
            m$1.redraw();
        });

        return {
            projects: contributedProjects,
            showNotifications: showNotifications,
            projectReminders: projectReminders,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var user = args.user;
        var projects_collection = ctrl.projects(),
            reminders = ctrl.projectReminders();

        return m$1('[id=\'notifications-tab\']', ctrl.error() ? m$1.component(inlineError, {
            message: 'Erro ao carregar a página.'
        }) : m$1('form.simple_form.edit_user[accept-charset=\'UTF-8\'][action=\'/pt/users/' + user.id + '\'][method=\'post\'][novalidate=\'novalidate\']', [m$1('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'), m$1('input[name=\'_method\'][type=\'hidden\'][value=\'patch\']'), m$1('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']'), m$1('input[id=\'anchor\'][name=\'anchor\'][type=\'hidden\'][value=\'notifications\']'), m$1('.w-container', [m$1('.w-row', m$1('.w-col.w-col-10.w-col-push-1', m$1('.w-form.card.card-terciary', [m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4', m$1('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Newsletters:')), m$1('.w-col.w-col-8', m$1('.w-checkbox.w-clearfix', [m$1('input[name=user[newsletter]][type=\'hidden\'][value=\'0\']'), m$1('input.w-checkbox-input' + (user.newsletter ? '[checked=\'checked\']' : '') + '[id=\'user_newsletter\'][name=user[newsletter]][type=\'checkbox\'][value=\'1\']'), m$1('label.w-form-label.fontsize-base.fontweight-semibold[for=\'checkbox\']', ' Newsletter do Catarse (semanal)'), m$1('div', ['Projetos em destaque e posts do nosso Blog', m$1.trust('&nbsp;')])]))]), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4', m$1('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Projetos que você apoiou:')), m$1('.w-col.w-col-8', m$1('.w-checkbox.w-clearfix', [m$1('input[name=user[subscribed_to_project_posts]][type=\'hidden\'][value=\'0\']'), m$1('input.w-checkbox-input' + (user.subscribed_to_project_posts ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_project_posts\'][name=user[subscribed_to_project_posts]][type=\'checkbox\'][value=\'1\']'), m$1('label.w-form-label.fontsize-base.fontweight-semibold', ' Quero receber atualizações dos projetos'), m$1('.u-marginbottom-20', m$1('a.alt-link[href=\'javascript:void(0);\']', {
            onclick: ctrl.showNotifications.toggle
        }, ' Gerenciar as notifica\xE7\xF5es de ' + user.total_contributed_projects + ' projetos')), ctrl.showNotifications() ? m$1('ul.w-list-unstyled.u-radius.card.card-secondary[id=\'notifications-box\']', [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m$1('li', m$1('.w-checkbox.w-clearfix', [m$1('input[id=\'unsubscribes_' + project.project_id + '\'][type=\'hidden\'][value=\'\']', {
                name: 'unsubscribes[' + project.project_id + ']'
            }), m$1('input.w-checkbox-input' + (project.unsubscribed ? '' : '[checked=\'checked\']') + '[type=\'checkbox\'][value=\'1\'][id=\'user_unsubscribes_' + project.project_id + '\']', {
                name: 'unsubscribes[' + project.project_id + ']'
            }), m$1('label.w-form-label.fontsize-small', project.project_name)]));
        }) : '']) : '']))]), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4', m$1('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Social:')), m$1('.w-col.w-col-8', m$1('.w-checkbox.w-clearfix', [m$1('input[name=user[subscribed_to_friends_contributions]][type=\'hidden\'][value=\'0\']'), m$1('input.w-checkbox-input' + (user.subscribed_to_friends_contributions ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_friends_contributions\'][name=user[subscribed_to_friends_contributions]][type=\'checkbox\'][value=\'1\']'), m$1('label.w-form-label.fontsize-small', 'Um amigo apoiou ou lançou um projeto')])), m$1('.w-col.w-col-8', m$1('.w-checkbox.w-clearfix', [m$1('input[name=user[subscribed_to_new_followers]][type=\'hidden\'][value=\'0\']'), m$1('input.w-checkbox-input' + (user.subscribed_to_new_followers ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_new_followers\'][name=user[subscribed_to_new_followers]][type=\'checkbox\'][value=\'1\']'), m$1('label.w-form-label.fontsize-small', 'Um amigo começou a me seguir')]))]), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4', m$1('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Lembretes de projetos:')), m$1('.w-col.w-col-8', [!_$1.isEmpty(reminders) ? _$1.map(reminders, function (reminder) {
            return m$1('.w-checkbox.w-clearfix', [m$1('input[id=\'user_reminders_' + reminder.project_id + '\'][type=\'hidden\'][value=\'false\']', {
                name: 'user[reminders][' + reminder.project_id + ']'
            }), m$1('input.w-checkbox-input[checked=\'checked\'][type=\'checkbox\'][value=\'1\'][id=\'user_reminders_' + reminder.project_id + '\']', {
                name: 'user[reminders][' + reminder.project_id + ']'
            }), m$1('label.w-form-label.fontsize-small', reminder.project_name)]);
        }) : ''])])]))), m$1('.u-margintop-30', m$1('.w-container', m$1('.w-row', m$1('.w-col.w-col-4.w-col-push-4', m$1('input.btn.btn-large[id=\'save\'][name=\'commit\'][type=\'submit\'][value=\'Salvar\']')))))])]));
    }
};

var usersEdit = {
    controller: function controller(args) {
        var userDetails = m$1.prop({}),
            userId = args.user_id.split('-')[0],
            hash = m$1.prop(window.location.hash),
            displayTabContent = function displayTabContent(user) {
            var tabs = {
                '#projects': m$1(userCreated, {
                    userId: userId,
                    showDraft: true
                }),
                '#contributions': m$1(userPrivateContributed, {
                    userId: userId,
                    user: user
                }),
                '#about_me': m$1(userAboutEdit, {
                    userId: userId,
                    user: user
                }),
                '#settings': m$1(userSettings, {
                    userId: userId,
                    user: user
                }),
                '#notifications': m$1(userNotifications, {
                    userId: userId,
                    user: user
                }),
                '#billing': m$1(userBilling, {
                    userId: userId,
                    user: user
                })
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                hash('#contributions');
                return tabs['#contributions'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();
        userVM.fetchUser(userId, true, userDetails);
        return {
            displayTabContent: displayTabContent,
            hash: hash,
            userDetails: userDetails
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m$1('div', [m$1(menu, {
            menuTransparency: true
        }), m$1(userHeader, {
            user: user,
            hideDetails: true
        }), !_$1.isEmpty(user) ? [m$1('nav.dashboard-nav.u-text-center', {
            style: {
                'z-index': '10',
                'position': 'relative'
            }
        }, m$1('.w-container', [m$1('a.dashboard-nav-link' + (ctrl.hash() === '#contributions' ? '.selected' : '') + '[data-target=\'#dashboard_contributions\'][href=\'#contributions\'][id=\'dashboard_contributions_link\']', 'Apoiados'), m$1('a.dashboard-nav-link' + (ctrl.hash() === '#projects' ? '.selected' : '') + '[data-target=\'#dashboard_projects\'][href=\'#projects\'][id=\'dashboard_projects_link\']', 'Criados'), m$1('a.dashboard-nav-link' + (ctrl.hash() === '#about_me' ? '.selected' : '') + '[data-target=\'#dashboard_about_me\'][href=\'#about_me\'][id=\'dashboard_about_me_link\']', 'Perfil Público'), m$1('a.dashboard-nav-link' + (ctrl.hash() === '#settings' ? '.selected' : '') + '[data-target=\'#dashboard_settings\'][href=\'#settings\'][id=\'dashboard_settings_link\']', 'Dados e endereço'), m$1('a.dashboard-nav-link' + (ctrl.hash() === '#notifications' ? '.selected' : '') + '[data-target=\'#dashboard_notifications\'][href=\'#notifications\'][id=\'dashboard_notifications_link\']', 'Notificações'), m$1('a.dashboard-nav-link' + (ctrl.hash() === '#billing' ? '.selected' : '') + '[data-target=\'#dashboard_billing\'][href=\'#billing\'][id=\'dashboard_billing_link\']', 'Banco e cartões'), m$1('a.dashboard-nav-link.u-right-big-only[href=\'/pt/users/' + user.id + '\']', {
            config: m$1.route,
            onclick: function onclick() {
                m$1.route("/users/" + user.id, {
                    user_id: user.id
                });
            }
        }, 'Ir para o perfil público')])), m$1('section.section', m$1('.w-container', m$1('.w-row', user.id ? ctrl.displayTabContent(user) : h.loader())))] : '']);
    }
};

var I18nScope$17 = _$1.partial(h.i18nScope, 'projects.contributions.edit.errors');
var I18nIntScope$1 = _$1.partial(h.i18nScope, 'projects.contributions.edit_international.errors');

var paymentVM = function paymentVM() {
    var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'aon';

    var pagarme = m$1.prop({}),
        submissionError = m$1.prop(false),
        isLoading = m$1.prop(false);

    var setCsrfToken = function setCsrfToken(xhr) {
        if (h.authenticityToken()) {
            xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
        }
        return;
    };

    var fields = {
        completeName: m$1.prop(''),
        anonymous: m$1.prop(),
        countries: m$1.prop(),
        userCountryId: m$1.prop(),
        zipCode: m$1.prop(''),
        street: m$1.prop(''),
        number: m$1.prop(''),
        addressComplement: m$1.prop(''),
        neighbourhood: m$1.prop(''),
        city: m$1.prop(''),
        states: m$1.prop([]),
        userState: m$1.prop(),
        ownerDocument: m$1.prop(''),
        phone: m$1.prop(''),
        errors: m$1.prop([])
    };

    var creditCardFields = {
        name: m$1.prop(''),
        number: m$1.prop(''),
        expMonth: m$1.prop(''),
        expYear: m$1.prop(''),
        save: m$1.prop(false),
        cvv: m$1.prop(''),
        errors: m$1.prop([]),
        cardOwnerDocument: m$1.prop('')
    };

    var populateForm = function populateForm(fetchedData) {
        var data = _$1.first(fetchedData),
            countryId = data.address.country_id || _$1.findWhere(fields.countries(), { name: 'Brasil' }).id;

        fields.completeName(data.name);
        fields.city(data.address.city);
        fields.zipCode(data.address.zipcode);
        fields.street(data.address.street);
        fields.number(data.address.number);
        fields.addressComplement(data.address.complement);
        fields.userState(data.address.state);
        fields.userCountryId(countryId);
        fields.ownerDocument(data.owner_document);
        fields.phone(data.address.phonenumber);
        fields.neighbourhood(data.address.neighbourhood);

        creditCardFields.cardOwnerDocument(data.owner_document);
    };

    var expMonthOptions = function expMonthOptions() {
        return [[null, 'Mês'], [1, '01 - Janeiro'], [2, '02 - Fevereiro'], [3, '03 - Março'], [4, '04 - Abril'], [5, '05 - Maio'], [6, '06 - Junho'], [7, '07 - Julho'], [8, '08 - Agosto'], [9, '09 - Setembro'], [10, '10 - Outubro'], [11, '11 - Novembro'], [12, '12 - Dezembro']];
    };

    var expYearOptions = function expYearOptions() {
        var currentYear = moment$1().year();
        var yearsOptions = ['Ano'];
        for (var i = currentYear; i <= currentYear + 25; i++) {
            yearsOptions.push(i);
        }
        return yearsOptions;
    };

    var isInternational = function isInternational() {
        return !_$1.isEmpty(fields.countries()) ? fields.userCountryId() != _$1.findWhere(fields.countries(), { name: 'Brasil' }).id : false;
    };

    var scope = function scope(data) {
        return isInternational() ? I18nIntScope$1(data) : I18nScope$17(data);
    };

    var getLocale = function getLocale() {
        return isInternational() ? { locale: 'en' } : { locale: 'pt' };
    };

    var faq = function faq() {
        return I18n$1.translations[I18n$1.currentLocale()].projects.faq[mode];
    },
        currentUser = h.getUser() || {},
        countriesLoader = postgrest$1.loader(models.country.getPageOptions()),
        statesLoader = postgrest$1.loader(models.state.getPageOptions());

    var checkEmptyFields = function checkEmptyFields(checkedFields) {
        return _$1.map(checkedFields, function (field) {
            var val = fields[field]();

            if (!h.existy(val) || _$1.isEmpty(String(val).trim())) {
                fields.errors().push({ field: field, message: I18n$1.t('validation.empty_field', scope()) });
            }
        });
    };

    var checkEmail = function checkEmail() {
        var isValid = h.validateEmail(fields.email());

        if (!isValid) {
            fields.errors().push({ field: 'email', message: I18n$1.t('validation.email', scope()) });
        }
    };

    var checkDocument = function checkDocument() {
        var document = fields.ownerDocument(),
            striped = String(document).replace(/[\.|\-|\/]*/g, '');
        var isValid = false,
            errorMessage = '';

        if (document.length > 14) {
            isValid = h.validateCnpj(document);
            errorMessage = 'CNPJ inválido.';
        } else {
            isValid = h.validateCpf(striped);
            errorMessage = 'CPF inválido.';
        }

        if (!isValid) {
            fields.errors().push({ field: 'ownerDocument', message: errorMessage });
        }
    };

    var checkUserState = function checkUserState() {
        if (_$1.isEmpty(fields.userState()) || fields.userState() === 'null') {
            fields.errors().push({ field: 'userState', message: I18n$1.t('validation.state', scope()) });
        }
    };

    var checkPhone = function checkPhone() {
        var phone = fields.phone(),
            strippedPhone = String(phone).replace(/[\(|\)|\-|\s]*/g, ''),
            error = { field: 'phone', message: I18n$1.t('validation.phone', scope()) };

        if (strippedPhone.length < 10) {
            fields.errors().push(error);
        } else {
            var controlDigit = Number(strippedPhone.charAt(2));
            if (!(controlDigit >= 2 && controlDigit <= 9)) {
                fields.errors().push(error);
            }
        }
    };

    var validate = function validate() {
        fields.errors([]);

        checkEmptyFields(['completeName', 'zipCode', 'street', 'userState', 'city', 'userCountryId']);

        if (!isInternational()) {
            checkEmptyFields(['phone', 'number', 'neighbourhood', 'ownerDocument', 'userState']);
            checkUserState();
            checkDocument();
            checkPhone();
        }

        return _$1.isEmpty(fields.errors());
    };

    var getSlipPaymentDate = function getSlipPaymentDate(contribution_id) {
        var paymentDate = m$1.prop();

        m$1.request({
            method: 'GET',
            config: setCsrfToken,
            url: '/payment/pagarme/' + contribution_id + '/slip_data'
        }).then(paymentDate);

        return paymentDate;
    };

    var sendSlipPayment = function sendSlipPayment(contribution_id, project_id, error, loading, completed) {
        m$1.request({
            method: 'post',
            url: '/payment/pagarme/' + contribution_id + '/pay_slip.json',
            dataType: 'json'
        }).then(function (data) {
            if (data.payment_status == 'failed') {
                error(I18n$1.t('submission.slip_submission', scope()));
            } else if (data.boleto_url) {
                completed(true);
                window.location.href = '/projects/' + project_id + '/contributions/' + contribution_id;
            }
            loading(false);
            m$1.redraw();
        }).catch(function (err) {
            error(I18n$1.t('submission.slip_submission', scope()));
            loading(false);
            completed(false);
            m$1.redraw();
        });
    };

    var paySlip = function paySlip(contribution_id, project_id, error, loading, completed) {
        error(false);
        m$1.redraw();
        if (validate()) {
            updateContributionData(contribution_id, project_id).then(function () {
                sendSlipPayment(contribution_id, project_id, error, loading, completed);
            }).catch(function () {
                loading(false);
                error(I18n$1.t('submission.slip_validation', scope()));
                m$1.redraw();
            });
        } else {
            loading(false);
            error(I18n$1.t('submission.slip_validation', scope()));
            m$1.redraw();
        }
    };

    var savedCreditCards = m$1.prop([]);

    var getSavedCreditCards = function getSavedCreditCards(user_id) {
        var otherSample = {
            id: -1
        };

        return m$1.request({
            method: 'GET',
            config: setCsrfToken,
            url: '/users/' + user_id + '/credit_cards'
        }).then(function (creditCards) {
            if (_$1.isArray(creditCards)) {
                creditCards.push(otherSample);
            } else {
                creditCards = [];
            }

            return savedCreditCards(creditCards);
        });
    };

    var similityExecute = function similityExecute(contribution_id) {
        if (window.SimilityScript && h.getSimilityCustomer()) {
            var user = h.getUser() || {};
            var similityContext = {
                customer_id: h.getSimilityCustomer(),
                session_id: contribution_id,
                user_id: user.user_id
            };
            var ss = new window.SimilityScript(similityContext);
            ss.execute();
        }
    };

    var requestPayment = function requestPayment(data, contribution_id) {
        similityExecute(contribution_id);
        return m$1.request({
            method: 'POST',
            url: '/payment/pagarme/' + contribution_id + '/pay_credit_card',
            data: data,
            config: setCsrfToken
        });
    };

    var payWithSavedCard = function payWithSavedCard(creditCard, installment, contribution_id) {
        var data = {
            card_id: creditCard.card_key,
            payment_card_installments: installment
        };
        return requestPayment(data, contribution_id);
    };

    var setNewCreditCard = function setNewCreditCard() {
        var creditCard = new window.PagarMe.creditCard();
        creditCard.cardHolderName = creditCardFields.name();
        creditCard.cardExpirationMonth = creditCardFields.expMonth();
        creditCard.cardExpirationYear = creditCardFields.expYear();
        creditCard.cardNumber = creditCardFields.number();
        creditCard.cardCVV = creditCardFields.cvv();
        return creditCard;
    };

    var payWithNewCard = function payWithNewCard(contribution_id, installment) {
        var deferred = m$1.deferred();
        m$1.request({
            method: 'GET',
            url: '/payment/pagarme/' + contribution_id + '/get_encryption_key',
            config: setCsrfToken
        }).then(function (data) {
            window.PagarMe.encryption_key = data.key;
            var card = setNewCreditCard();
            var errors = card.fieldErrors();
            if (_$1.keys(errors).length > 0) {
                deferred.reject({ message: I18n$1.t('submission.card_invalid', scope()) });
            } else {
                card.generateHash(function (cardHash) {
                    var data = {
                        card_hash: cardHash,
                        save_card: creditCardFields.save().toString(),
                        payment_card_installments: installment
                    };

                    requestPayment(data, contribution_id).then(deferred.resolve).catch(deferred.reject);
                });
            }
        }).catch(function (error) {
            if (!_$1.isEmpty(error.message)) {
                deferred.reject(error);
            } else {
                deferred.reject({ message: I18n$1.t('submission.encryption_error', scope()) });
            }
        });

        return deferred.promise;
    };

    var updateContributionData = function updateContributionData(contribution_id, project_id) {
        var contributionData = {
            anonymous: fields.anonymous(),
            country_id: fields.userCountryId(),
            payer_name: fields.completeName(),
            payer_document: fields.ownerDocument(),
            address_street: fields.street(),
            address_number: fields.number(),
            address_complement: fields.addressComplement(),
            address_neighbourhood: fields.neighbourhood(),
            address_zip_code: fields.zipCode(),
            address_city: fields.city(),
            address_state: fields.userState(),
            address_phone_number: fields.phone(),
            card_owner_document: creditCardFields.cardOwnerDocument()
        };

        return m$1.request({
            method: 'PUT',
            url: '/projects/' + project_id + '/contributions/' + contribution_id + '.json',
            data: { contribution: contributionData },
            config: setCsrfToken
        });
    };

    var creditCardPaymentSuccess = function creditCardPaymentSuccess(deferred, project_id, contribution_id) {
        return function (data) {
            if (data.payment_status === 'failed') {
                var errorMsg = data.message || I18n$1.t('submission.payment_failed', scope());

                isLoading(false);
                submissionError(I18n$1.t('submission.error', scope({ message: errorMsg })));
                m$1.redraw();
                deferred.reject();
            } else {
                window.location.href = '/projects/' + project_id + '/contributions/' + contribution_id;
            }
        };
    };

    var creditCardPaymentFail = function creditCardPaymentFail(deferred) {
        return function (data) {
            var errorMsg = data.message || I18n$1.t('submission.payment_failed', scope());
            isLoading(false);
            submissionError(I18n$1.t('submission.error', scope({ message: errorMsg })));
            m$1.redraw();
            deferred.reject();
        };
    };

    var checkAndPayCreditCard = function checkAndPayCreditCard(deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment) {
        return function () {
            if (selectedCreditCard().id && selectedCreditCard().id !== -1) {
                return payWithSavedCard(selectedCreditCard(), selectedInstallment(), contribution_id).then(creditCardPaymentSuccess(deferred, project_id, contribution_id)).catch(creditCardPaymentFail(deferred));
            } else {
                return payWithNewCard(contribution_id, selectedInstallment).then(creditCardPaymentSuccess(deferred, project_id, contribution_id)).catch(creditCardPaymentFail(deferred));
            }
        };
    };

    var sendPayment = function sendPayment(selectedCreditCard, selectedInstallment, contribution_id, project_id) {
        var deferred = m$1.deferred();
        if (validate()) {
            isLoading(true);
            submissionError(false);
            m$1.redraw();
            updateContributionData(contribution_id, project_id).then(checkAndPayCreditCard(deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment)).catch(function () {
                isLoading(false);
                deferred.reject();
            });
        } else {
            isLoading(false);
            deferred.reject();
        }
        return deferred.promise;
    };

    var resetFieldError = function resetFieldError(fieldName) {
        return function () {
            var errors = fields.errors(),
                errorField = _$1.findWhere(fields.errors(), { field: fieldName }),
                newErrors = _$1.compose(fields.errors, _$1.without);

            return newErrors(fields.errors(), errorField);
        };
    };

    var resetCreditCardFieldError = function resetCreditCardFieldError(fieldName) {
        return function () {
            var errors = fields.errors(),
                errorField = _$1.findWhere(creditCardFields.errors(), { field: fieldName }),
                newErrors = _$1.compose(creditCardFields.errors, _$1.without);

            return newErrors(creditCardFields.errors(), errorField);
        };
    };

    var installments = m$1.prop([{ value: 10, number: 1 }]);

    var getInstallments = function getInstallments(contribution_id) {
        return m$1.request({
            method: 'GET',
            url: '/payment/pagarme/' + contribution_id + '/get_installment',
            config: h.setCsrfToken
        }).then(installments);
    };

    var creditCardMask = _$1.partial(h.mask, '9999 9999 9999 9999');

    var applyCreditCardMask = _$1.compose(creditCardFields.number, creditCardMask);

    countriesLoader.load().then(function (data) {
        var countryId = fields.userCountryId() || _$1.findWhere(data, { name: 'Brasil' }).id;
        fields.countries(_$1.sortBy(data, 'name_en'));
        fields.userCountryId(countryId);
    });
    statesLoader.load().then(function (data) {
        fields.states().push({ acronym: null, name: 'Estado' });
        _$1.map(data, function (state) {
            return fields.states().push(state);
        });
    });
    userVM.fetchUser(currentUser.user_id, false).then(populateForm);

    return {
        fields: fields,
        validate: validate,
        isInternational: isInternational,
        resetFieldError: resetFieldError,
        getSlipPaymentDate: getSlipPaymentDate,
        paySlip: paySlip,
        installments: installments,
        getInstallments: getInstallments,
        savedCreditCards: savedCreditCards,
        getSavedCreditCards: getSavedCreditCards,
        applyCreditCardMask: applyCreditCardMask,
        creditCardFields: creditCardFields,
        resetCreditCardFieldError: resetCreditCardFieldError,
        expMonthOptions: expMonthOptions,
        expYearOptions: expYearOptions,
        sendPayment: sendPayment,
        submissionError: submissionError,
        isLoading: isLoading,
        pagarme: pagarme,
        locale: getLocale,
        faq: faq,
        similityExecute: similityExecute
    };
};

var I18nScope$18 = _.partial(h.i18nScope, 'projects.faq');

var faqBox = {
    controller: function controller(args) {
        var mode = args.mode,
            questions = args.faq.questions,
            selectedQuestion = m$1.prop(-1),
            user = m$1.prop({ name: '...' }),
            tKey = function tKey() {
            return !args.vm.isInternational() ? '' + mode : 'international.' + mode;
        };

        var selectQuestion = function selectQuestion(idx) {
            return function () {
                return idx === selectedQuestion() ? selectedQuestion(-1) : selectedQuestion(idx);
            };
        };

        //This function rewrites questions from translate with proper scope for links
        var scopedQuestions = function scopedQuestions() {
            var updatedQuestions = {};
            _.each(questions, function (quest, idx) {
                _.extend(updatedQuestions, defineProperty({}, idx + 1, {
                    question: I18n$1.t(tKey() + '.questions.' + idx + '.question', I18nScope$18()),
                    answer: I18n$1.t(tKey() + '.questions.' + idx + '.answer', I18nScope$18({ userLink: '/users/' + user().id,
                        userName: user().name
                    }))
                }));
            });
            return updatedQuestions;
        };

        userVM.fetchUser(args.projectUserId, false).then(function (data) {
            return user(_.first(data));
        });

        return {
            scopedQuestions: scopedQuestions,
            selectQuestion: selectQuestion,
            selectedQuestion: selectedQuestion,
            tKey: tKey
        };
    },
    view: function view(ctrl, args) {
        return m$1('.faq-box.w-hidden-small.w-hidden-tiny.card.u-radius', [m$1('.w-row.u-marginbottom-30', [m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', m$1('img[width=\'30\']', {
            src: args.mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png'
        })), m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m$1('.w-inline-block.fontsize-smallest.w-inline-block.fontcolor-secondary', I18n$1.t(ctrl.tKey() + '.description', I18nScope$18())))]), m$1('.u-marginbottom-20.fontsize-small.fontweight-semibold', I18n$1.t('' + (args.vm.isInternational() ? 'international_title' : 'title'), I18nScope$18())), m$1('ul.w-list-unstyled', _.map(ctrl.scopedQuestions(), function (question, idx) {
            return [m$1('li#faq_question_' + idx + '.fontsize-smaller.alt-link.list-question', {
                onclick: ctrl.selectQuestion(idx)
            }, m$1('span', [m$1('span.faq-box-arrow'), ' ' + question.question])), m$1('li.list-answer', {
                class: ctrl.selectedQuestion() === idx ? 'list-answer-opened' : ''
            }, m$1('p#faq_answer_' + idx + '.fontsize-smaller', m$1.trust(question.answer)))];
        }))]);
    }
};

var I18nScope$20 = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

var paymentSlip = {
    controller: function controller(args) {
        var vm = args.vm,
            slipPaymentDate = vm.getSlipPaymentDate(args.contribution_id),
            loading = m$1.prop(false),
            error = m$1.prop(false),
            completed = m$1.prop(false);

        var buildSlip = function buildSlip() {
            loading(true);
            m$1.redraw();
            vm.paySlip(args.contribution_id, args.project_id, error, loading, completed);

            return false;
        };

        return {
            buildSlip: buildSlip,
            slipPaymentDate: slipPaymentDate,
            loading: loading,
            completed: completed,
            error: error
        };
    },
    view: function view(ctrl, args) {
        return m$1('.w-row', m$1('.w-col.w-col-12', m$1('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [m$1('.fontsize-small.u-marginbottom-20', ctrl.slipPaymentDate() ? 'Esse boleto banc\xE1rio vence no dia ' + h.momentify(ctrl.slipPaymentDate().slip_expiration_date) + '.' : 'carregando...'), m$1('.fontsize-small.u-marginbottom-40', 'Ao gerar o boleto, o realizador já está contando com o seu apoio. Pague até a data de vencimento pela internet, casas lotéricas, caixas eletrônicos ou agência bancária.'), m$1('.w-row', m$1('.w-col.w-col-8.w-col-push-2', [ctrl.loading() ? h.loader() : ctrl.completed() ? '' : m$1('input.btn.btn-large.u-marginbottom-20', {
            onclick: ctrl.buildSlip,
            value: 'Imprimir Boleto',
            type: 'submit'
        }), ctrl.error() ? m$1.component(inlineError, { message: ctrl.error() }) : '', m$1('.fontsize-smallest.u-text-center.u-marginbottom-30', ['Ao apoiar, você concorda com os ', m$1('a.alt-link[href=\'/pt/terms-of-use\']', 'Termos de Uso '), 'e ', m$1('a.alt-link[href=\'/pt/privacy-policy\']', 'Política de Privacidade')])]))])));
    }
};

var defaultFormat = /(\d{1,4})/g;

var indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i;
    }return -1;
};

var cards = [{
    type: 'elo',
    patterns: [401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 504175, 506699, 5067, 509, 627780, 636297, 636368, 650, 6516, 6550],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'maestro',
    patterns: [5018, 502, 503, 506, 56, 58, 639, 6220, 67],
    format: defaultFormat,
    length: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: [3],
    luhn: true
}, {
    type: 'forbrugsforeningen',
    patterns: [600],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'dankort',
    patterns: [5019],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'visa',
    patterns: [4],
    format: defaultFormat,
    length: [13, 16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'mastercard',
    patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'amex',
    patterns: [34, 37],
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    length: [15],
    cvvLength: [3, 4],
    luhn: true
}, {
    type: 'dinersclub',
    patterns: [30, 36, 38, 39],
    format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
    length: [14],
    cvvLength: [3],
    luhn: true
}, {
    type: 'discover',
    patterns: [60, 64, 65, 622],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'unionpay',
    patterns: [62, 88],
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvvLength: [3],
    luhn: false
}, {
    type: 'jcb',
    patterns: [35],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}];

var inputCardType = function inputCardType(num) {
    var ref;
    if (!num) {
        return null;
    }
    return ((ref = cardFromNumber(num)) != null ? ref.type : void 0) || null;
};

var cardFromType = function cardFromType(type) {
    var card = void 0,
        i = void 0,
        len = void 0;
    for (i = 0, len = cards.length; i < len; i++) {
        card = cards[i];
        if (card.type === type) {
            return card;
        }
    }
};

var setCardType = function setCardType(e, type) {
    var $target = void 0,
        allTypes = void 0,
        card = void 0,
        cardType = void 0,
        val = void 0;
    $target = e.currentTarget;
    val = $target.value;
    cardType = inputCardType(val) || 'unknown';
    return type(cardType);
};

var formatBackCardNumber = function formatBackCardNumber(e, prop) {
    var $target, value;
    $target = e.currentTarget;
    value = $target.value;
    if (e.which !== 8) {
        return;
    }
    if ($target.selectionStart != null && $target.selectionStart !== value.length) {
        return;
    }
    if (/\d\s$/.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value.replace(/\d\s$/, ''));
        });
    } else if (/\s\d?$/.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value.replace(/\d$/, ''));
        });
    }
};

var replaceFullWidthChars = function replaceFullWidthChars(str) {
    var chars, chr, fullWidth, halfWidth, i, idx, len, value;
    if (str == null) {
        str = '';
    }
    fullWidth = '\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19';
    halfWidth = '0123456789';
    value = '';
    chars = str.split('');
    for (i = 0, len = chars.length; i < len; i++) {
        chr = chars[i];
        idx = fullWidth.indexOf(chr);
        if (idx > -1) {
            chr = halfWidth[idx];
        }
        value += chr;
    }
    return value;
};

var safeVal = function safeVal(value, $target, prop) {
    var currPair, cursor, digit, error, error1, last, prevPair;
    try {
        cursor = $target.selectionStart;
    } catch (error1) {
        error = error1;
        cursor = null;
    }
    last = $target.value;
    $target.value = prop(value);
    if (cursor !== null && $target === document.activeElement) {
        if (cursor === last.length) {
            cursor = value.length;
        }
        if (last !== value) {
            prevPair = last.slice(cursor - 1, +cursor + 1 || 9e9);
            currPair = value.slice(cursor - 1, +cursor + 1 || 9e9);
            digit = value[cursor];
            if (/\d/.test(digit) && prevPair === digit + ' ' && currPair === ' ' + digit) {
                cursor = cursor + 1;
            }
        }
        $target.selectionStart = cursor;
        return $target.selectionEnd = cursor;
    }
};

var reFormatCardNumber = function reFormatCardNumber(e, prop) {
    var $target = e.currentTarget;
    return setTimeout(function () {
        var value;
        value = $target.value;
        value = replaceFullWidthChars(value);
        value = formatCardNumber(value);
        return safeVal(value, $target, prop);
    });
};

var formatCardNumber = function formatCardNumber(num) {
    var card = void 0,
        groups = void 0,
        ref = void 0,
        upperLength = void 0;
    num = num.replace(/\D/g, '');
    card = cardFromNumber(num);
    if (!card) {
        return num;
    }
    upperLength = card.length[card.length.length - 1];
    num = num.slice(0, upperLength);
    if (card.format.global) {
        return (ref = num.match(card.format)) != null ? ref.join(' ') : void 0;
    } else {
        groups = card.format.exec(num);
        if (groups == null) {
            return;
        }
        groups.shift();
        groups = _$1.filter(groups, function (n) {
            return n;
        });
        return groups.join(' ');
    }
};

var formatCardInputNumber = function formatCardInputNumber(e, prop) {
    var $target = void 0,
        card = void 0,
        digit = void 0,
        length = void 0,
        re = void 0,
        upperLength = void 0,
        value = void 0;
    digit = String.fromCharCode(e.which);
    if (!/^\d+$/.test(digit)) {
        return;
    }
    $target = e.currentTarget;
    value = $target.value;
    card = cardFromNumber(value + digit);
    length = (value.replace(/\D/g, '') + digit).length;
    upperLength = 16;
    if (card) {
        upperLength = card.length[card.length.length - 1];
    }
    if (length >= upperLength) {
        return;
    }
    if ($target.selectionStart != null && $target.selectionStart !== value.length) {
        return;
    }
    if (card && card.type === 'amex') {
        re = /^(\d{4}|\d{4}\s\d{6})$/;
    } else {
        re = /(?:^|\s)(\d{4})$/;
    }
    if (re.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value + ' ' + digit);
        });
    } else if (re.test(value + digit)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value + digit + ' ');
        });
    }
};

var cardFromNumber = function cardFromNumber(num) {
    var card = void 0,
        i = void 0,
        j = void 0,
        len = void 0,
        len1 = void 0,
        p = void 0,
        pattern = void 0,
        ref = void 0;
    num = (num + '').replace(/\D/g, '');
    for (i = 0, len = cards.length; i < len; i++) {
        card = cards[i];
        ref = card.patterns;
        for (j = 0, len1 = ref.length; j < len1; j++) {
            pattern = ref[j];
            p = pattern + '';
            if (num.substr(0, p.length) === p) {
                return card;
            }
        }
    }
};

var hasTextSelected = function hasTextSelected($target) {
    var ref = void 0;
    if ($target.selectionStart != null && $target.selectionStart !== $target.selectionEnd) {
        return true;
    }
    if ((typeof document !== 'undefined' && document !== null ? (ref = document.selection) != null ? ref.createRange : void 0 : void 0) != null) {
        if (document.selection.createRange().text) {
            return true;
        }
    }
    return false;
};

var restrictNumeric = function restrictNumeric(e) {
    var input = void 0;
    if (e.metaKey || e.ctrlKey) {
        return true;
    }
    if (e.which === 32) {
        return false;
    }
    if (e.which === 0) {
        return true;
    }
    if (e.which < 33) {
        return true;
    }
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
};

var restrictCardNumber = function restrictCardNumber(e) {
    var $target = void 0,
        card = void 0,
        digit = void 0,
        value = void 0;
    $target = e.currentTarget;
    digit = String.fromCharCode(e.which);
    if (!/^\d+$/.test(digit)) {
        return;
    }
    if (hasTextSelected($target)) {
        return;
    }
    value = ($target.value + digit).replace(/\D/g, '');
    card = cardFromNumber(value);
    if (card) {
        return value.length <= card.length[card.length.length - 1];
    } else {
        return value.length <= 16;
    }
};
var setEvents = function setEvents(el, cardType, prop) {
    el.onkeypress = function (event) {
        restrictNumeric(event);
        restrictCardNumber(event);
        formatCardInputNumber(event, prop);
    };
    el.oninput = function (event) {
        reFormatCardNumber(event, prop);
        setCardType(event, cardType);
    };
    el.onkeydown = function (event) {
        return formatBackCardNumber(event, prop);
    };
    el.onkeyup = function (event) {
        setCardType(event, cardType);
    };
    el.onpaste = function (event) {
        return reFormatCardNumber(event, prop);
    };
    el.onchange = function (event) {
        CatarseAnalytics.oneTimeEvent({ cat: 'contribution_finish', act: 'contribution_cc_edit' });
        reFormatCardNumber(event, prop);
    };
};

var luhnCheck = function luhnCheck(num) {
    var digit, digits, i, len, odd, sum;
    odd = true;
    sum = 0;
    digits = (num + '').split('').reverse();
    for (i = 0, len = digits.length; i < len; i++) {
        digit = digits[i];
        digit = parseInt(digit, 10);
        if (odd = !odd) {
            digit *= 2;
        }
        if (digit > 9) {
            digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

var validateCardNumber = function validateCardNumber(num) {
    var card = void 0,
        ref = void 0;
    num = (num + '').replace(/\s+|-/g, '');
    if (!/^\d+$/.test(num)) {
        return false;
    }
    card = cardFromNumber(num);
    if (!card) {
        return false;
    }
    return (ref = num.length, indexOf.call(card.length, ref) >= 0) && (card.luhn === false || luhnCheck(num));
};

var validateCardExpiry = function validateCardExpiry(month, year) {
    var currentTime, expiry, ref;
    if ((typeof month === 'undefined' ? 'undefined' : _typeof(month)) === 'object' && 'month' in month) {
        ref = month, month = ref.month, year = ref.year;
    }
    if (!(month && year)) {
        return false;
    }
    month = String(month).trim();
    year = String(year).trim();
    if (!/^\d+$/.test(month)) {
        return false;
    }
    if (!/^\d+$/.test(year)) {
        return false;
    }
    if (!(1 <= month && month <= 12)) {
        return false;
    }
    if (year.length === 2) {
        if (year < 70) {
            year = '20' + year;
        } else {
            year = '19' + year;
        }
    }
    if (year.length !== 4) {
        return false;
    }
    expiry = new Date(year, month);
    currentTime = new Date();
    expiry.setMonth(expiry.getMonth() - 1);
    expiry.setMonth(expiry.getMonth() + 1, 1);
    return expiry > currentTime;
};

var validateCardcvv = function validateCardcvv(cvv, type) {
    var card = void 0,
        ref = void 0;
    cvv = String(cvv).trim();
    if (!/^\d+$/.test(cvv)) {
        return false;
    }
    card = cardFromType(type);
    if (card != null) {
        return ref = cvv.length, indexOf.call(card.cvvLength, ref) >= 0;
    } else {
        return cvv.length >= 3 && cvv.length <= 4;
    }
};

var creditCardVM = {
    setEvents: setEvents,
    validateCardNumber: validateCardNumber,
    validateCardcvv: validateCardcvv,
    validateCardExpiry: validateCardExpiry
};

var creditCardInput = {
    controller: function controller(args) {
        var cardType = args.type || m$1.prop('unknown');
        // TODO: move all input logic to vdom paradigm
        // CreditCard Input still handle events on a dom-based model.
        var setCreditCardHandlers = function setCreditCardHandlers(el, isInitialized) {
            if (!isInitialized) {
                creditCardVM.setEvents(el, cardType, args.value);
            }
        };

        return {
            setCreditCardHandlers: setCreditCardHandlers,
            cardType: cardType
        };
    },
    view: function view(ctrl, args) {
        return m$1('input.w-input.text-field[name="' + args.name + '"][required="required"][type="tel"]', {
            onfocus: args.onfocus,
            class: args.class,
            config: ctrl.setCreditCardHandlers,
            onblur: args.onblur
        });
    }
};

var I18nScope$21 = _$1.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope$3 = _$1.partial(h.i18nScope, 'projects.contributions.edit_international');

var paymentCreditCard = {
    controller: function controller(args) {
        var vm = args.vm,
            loadingInstallments = m$1.prop(true),
            loadingSavedCreditCards = m$1.prop(true),
            selectedCreditCard = m$1.prop({ id: -1 }),
            selectedInstallment = m$1.prop('1'),
            showForm = m$1.prop(false),
            creditCardType = m$1.prop('unknown'),
            errors = m$1.prop([]),
            documentMask = _$1.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _$1.partial(h.mask, '99.999.999/9999-99');

        var onSubmit = function onSubmit() {
            if (selectedCreditCard().id === -1) {
                checkExpiry();
                checkcvv();
                checkCreditCard();
                checkCreditCardName();
            } else {
                vm.creditCardFields.errors([]);
            }

            if (vm.creditCardFields.errors().length === 0) {
                vm.sendPayment(selectedCreditCard, selectedInstallment, args.contribution_id, args.project_id);
            }

            return false;
        };

        var handleValidity = function handleValidity(isValid, errorObj) {
            if (!isValid) {
                vm.creditCardFields.errors().push(errorObj);
            } else {
                var errorsWithout = _$1.reject(vm.creditCardFields.errors(), function (err) {
                    return _$1.isEqual(err, errorObj);
                });
                vm.creditCardFields.errors(errorsWithout);
            }
        };

        var checkcvv = function checkcvv() {
            var isValid = creditCardVM.validateCardcvv(vm.creditCardFields.cvv(), creditCardType()),
                errorObj = { field: 'cvv', message: I18n$1.t('errors.inline.creditcard_cvv', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkExpiry = function checkExpiry() {
            var isValid = creditCardVM.validateCardExpiry(vm.creditCardFields.expMonth(), vm.creditCardFields.expYear()),
                errorObj = { field: 'expiry', message: I18n$1.t('errors.inline.creditcard_expiry', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkCreditCard = function checkCreditCard() {
            var isValid = creditCardVM.validateCardNumber(vm.creditCardFields.number()),
                errorObj = { field: 'number', message: I18n$1.t('errors.inline.creditcard_number', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkCardOwnerDocument = function checkCardOwnerDocument() {
            var document = vm.creditCardFields.cardOwnerDocument(),
                striped = String(document).replace(/[\.|\-|\/]*/g, '');
            var isValid = false,
                errorMessage = '';

            if (document.length > 14) {
                isValid = h.validateCnpj(document);
                errorMessage = 'CNPJ inválido.';
            } else {
                isValid = h.validateCpf(striped);
                errorMessage = 'CPF inválido.';
            }

            handleValidity(isValid, { field: 'cardOwnerDocument', message: errorMessage });
        };

        var checkCreditCardName = function checkCreditCardName() {
            var trimmedString = vm.creditCardFields.name().replace(/ /g, '');
            var charsOnly = /^[a-zA-Z]*$/;
            var errorObj = { field: 'name', message: I18n$1.t('errors.inline.creditcard_name', scope()) };
            var isValid = !(_$1.isEmpty(trimmedString) || !charsOnly.test(trimmedString));

            handleValidity(isValid, errorObj);
        };

        var applyCreditCardNameMask = _$1.compose(vm.creditCardFields.name, h.noNumbersMask);

        var applyCvvMask = function applyCvvMask(value) {
            var setValue = h.numbersOnlyMask(value.substr(0, 4));

            return vm.creditCardFields.cvv(setValue);
        };

        var applyDocumentMask = function applyDocumentMask(value) {
            if (value.length > 14) {
                vm.creditCardFields.cardOwnerDocument(documentCompanyMask(value));
            } else {
                vm.creditCardFields.cardOwnerDocument(documentMask(value));
            }

            return;
        };

        var fieldHasError = function fieldHasError(fieldName) {
            var fieldWithError = _$1.findWhere(vm.creditCardFields.errors(), { field: fieldName });

            return fieldWithError ? m$1.component(inlineError, { message: fieldWithError.message }) : '';
        };

        var buildTooltip = function buildTooltip(tooltipText) {
            return m$1.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        };

        var isCreditCardSelected = function isCreditCardSelected(card, idx) {
            return selectedCreditCard() === card;
        };

        var loadPagarme = function loadPagarme(el, isInit) {
            if (!isInit) {
                var script = document.createElement('script');
                script.src = '//assets.pagar.me/js/pagarme.min.js';
                document.body.appendChild(script);
                script.onload = function () {
                    vm.pagarme(window.PagarMe);
                };
            }
        };

        var selectCreditCard = function selectCreditCard(card) {
            selectedCreditCard(card);

            if (card.id === -1) {
                showForm(true);
            } else {
                showForm(false);
            }
        };

        var scope = function scope(attr) {
            return vm.isInternational() ? I18nIntScope$3(attr) : I18nScope$21(attr);
        };

        vm.getInstallments(args.contribution_id).then(function () {
            loadingInstallments(false);
            m$1.redraw();
        });

        vm.getSavedCreditCards(args.user_id).then(function (savedCards) {
            loadingSavedCreditCards(false);
            selectCreditCard(savedCards[0]);
            m$1.redraw();
        });

        return {
            vm: vm,
            onSubmit: onSubmit,
            fieldHasError: fieldHasError,
            buildTooltip: buildTooltip,
            loadingInstallments: loadingInstallments,
            loadingSavedCreditCards: loadingSavedCreditCards,
            installments: vm.installments,
            selectedInstallment: selectedInstallment,
            savedCreditCards: vm.savedCreditCards,
            creditCard: vm.creditCardFields,
            creditCardType: creditCardType,
            checkCreditCard: checkCreditCard,
            checkCreditCardName: checkCreditCardName,
            applyCreditCardNameMask: applyCreditCardNameMask,
            applyCreditCardMask: vm.applyCreditCardMask,
            applyDocumentMask: applyDocumentMask,
            checkCardOwnerDocument: checkCardOwnerDocument,
            applyCvvMask: applyCvvMask,
            checkcvv: checkcvv,
            selectCreditCard: selectCreditCard,
            isCreditCardSelected: isCreditCardSelected,
            expMonths: vm.expMonthOptions(),
            expYears: vm.expYearOptions(),
            loadPagarme: loadPagarme,
            scope: scope,
            showForm: showForm
        };
    },
    view: function view(ctrl, args) {
        var isInternational = ctrl.vm.isInternational();

        return m$1('.w-form.u-marginbottom-40', {
            config: ctrl.loadPagarme
        }, [m$1('form[name="email-form"]', {
            onsubmit: ctrl.onSubmit
        }, [!ctrl.loadingSavedCreditCards() && ctrl.savedCreditCards().length > 1 ? m$1('.my-credit-cards.w-form.back-payment-form-creditcard.records-choice.u-marginbottom-40', _$1.map(ctrl.savedCreditCards(), function (card, idx) {
            return m$1('div#credit-card-record-' + idx + '.w-row.creditcard-records', {
                style: 'cursor:pointer;',
                onclick: function onclick() {
                    return ctrl.selectCreditCard(card);
                }
            }, [m$1('.w-col.w-col-1.w-sub-col', m$1('.w-radio.w-clearfix.back-payment-credit-card-radio-field', m$1('input', {
                checked: ctrl.isCreditCardSelected(card, idx),
                name: 'payment_subscription_card',
                type: 'radio',
                value: card.card_key
            }))), card.id === -1 ? m$1('.w-col.w-col-11', m$1('.fontsize-small.fontweight-semibold.fontcolor-secondary', I18n$1.t('credit_card.use_another', ctrl.scope()))) : [m$1('.w-col.w-col-2.w-sub-col.w-sub-col-middle', m$1('.fontsize-small.fontweight-semibold.text-success', card.card_brand.toUpperCase())), m$1('.w-col.w-col-5.w-sub-col.w-sub-col-middle', m$1('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'XXXX.XXXX.XXXX.' + card.last_digits)), m$1('.w-col.w-col-4', ctrl.loadingInstallments() || ctrl.installments().length <= 1 ? '' : m$1('select.w-select.text-field.text-field-creditcard', {
                onchange: m$1.withAttr('value', ctrl.selectedInstallment),
                value: ctrl.selectedInstallment()
            }, _$1.map(ctrl.installments(), function (installment) {
                return m$1('option[value="' + installment.number + '"]', installment.number + ' X R$ ' + installment.amount);
            })))]]);
        })) : ctrl.loadingSavedCreditCards() ? m$1('.fontsize-small.u-marginbottom-40', I18n$1.t('credit_card.loading', ctrl.scope())) : '', !ctrl.showForm() ? '' : m$1('#credit-card-payment-form.u-marginbottom-40', [m$1('div#credit-card-name', [m$1('.w-row', [m$1(isInternational ? '.w-col.w-col-12' : '.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.field-label.fontweight-semibold[for="credit-card-name"]', I18n$1.t('credit_card.name', ctrl.scope())), m$1('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.name_tip', ctrl.scope())), m$1('input.w-input.text-field[name="credit-card-name"][type="text"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('name'),
            class: ctrl.fieldHasError('name') ? 'error' : '',
            onblur: ctrl.checkCreditCardName,
            onkeyup: m$1.withAttr('value', ctrl.applyCreditCardNameMask),
            value: ctrl.creditCard.name()
        }), ctrl.fieldHasError('name')]), !isInternational ? m$1('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [m$1('label.field-label.fontweight-semibold[for="credit-card-document"]', I18n$1.t('credit_card.document', ctrl.scope())), m$1('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.document_tip', ctrl.scope())), m$1('input.w-input.text-field[name="credit-card-document"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('cardOwnerDocument'),
            class: ctrl.fieldHasError('cardOwnerDocument') ? 'error' : '',
            onblur: ctrl.checkCardOwnerDocument,
            onkeyup: m$1.withAttr('value', ctrl.applyDocumentMask),
            value: ctrl.creditCard.cardOwnerDocument()
        }), ctrl.fieldHasError('cardOwnerDocument')]) : ''])]), m$1('div#credit-card-number', [m$1('label.field-label.fontweight-semibold[for="credit-card-number"]', I18n$1.t('credit_card.number', ctrl.scope())), m$1('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.number_tip', ctrl.scope())), m$1.component(creditCardInput, {
            onfocus: ctrl.vm.resetCreditCardFieldError('number'),
            onblur: ctrl.checkCreditCard,
            class: ctrl.fieldHasError('number') ? 'error' : '',
            value: ctrl.creditCard.number,
            name: 'credit-card-number',
            type: ctrl.creditCardType
        }), ctrl.fieldHasError('number')]), m$1('div#credit-card-date', [m$1('label.field-label.fontweight-semibold[for="expiration-date"]', [I18n$1.t('credit_card.expiry', ctrl.scope())]), m$1('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.expiry_tip', ctrl.scope())), m$1('.w-row', [m$1('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', m$1('select.w-select.text-field[name="expiration-date_month"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
            class: ctrl.fieldHasError('expiry') ? 'error' : '',
            onchange: m$1.withAttr('value', ctrl.creditCard.expMonth),
            value: ctrl.creditCard.expMonth()
        }, _$1.map(ctrl.expMonths, function (month) {
            return m$1('option', { value: month[0] }, month[1]);
        }))), m$1('.w-col.w-col-6.w-col-tiny-6', m$1('select.w-select.text-field[name="expiration-date_year"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
            class: ctrl.fieldHasError('expiry') ? 'error' : '',
            onchange: m$1.withAttr('value', ctrl.creditCard.expYear),
            onblur: ctrl.checkExpiry,
            value: ctrl.creditCard.expYear()
        }, _$1.map(ctrl.expYears, function (year) {
            return m$1('option', { value: year }, year);
        }))), m$1('.w-col.w-col-12', ctrl.fieldHasError('expiry'))])]), m$1('div#credit-card-cvv', [m$1('label.field-label.fontweight-semibold[for="credit-card-cvv"]', [I18n$1.t('credit_card.cvv', ctrl.scope()), ctrl.buildTooltip(I18n$1.t('credit_card.cvv_tooltip', ctrl.scope()))]), m$1('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.cvv_tip', ctrl.scope())), m$1('.w-row', [m$1('.w-col.w-col-8.w-col-tiny-6.w-sub-col-middle', m$1('input.w-input.text-field[name="credit-card-cvv"][type="tel"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('cvv'),
            class: ctrl.fieldHasError('cvv') ? 'error' : '',
            onkeyup: m$1.withAttr('value', ctrl.applyCvvMask),
            onblur: ctrl.checkcvv,
            value: ctrl.creditCard.cvv()
        }), ctrl.fieldHasError('cvv')), m$1('.w-col.w-col-4.w-col-tiny-6.u-text-center', m$1('img[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg"][width="176"]'))])]), ctrl.loadingInstallments() || ctrl.installments().length <= 1 ? '' : m$1('.w-row', [m$1('.w-col.w-col-6', [m$1('label.field-label.fontweight-semibold[for="split"]', I18n$1.t('credit_card.installments', ctrl.scope())), m$1('select.w-select.text-field[name="split"]', {
            onchange: m$1.withAttr('value', ctrl.selectedInstallment),
            value: ctrl.selectedInstallment()
        }, _$1.map(ctrl.installments(), function (installment) {
            return m$1('option[value="' + installment.number + '"]', installment.number + ' X R$ ' + installment.amount);
        }))]), m$1('.w-col.w-col-6')]), m$1('.w-checkbox.w-clearfix', [m$1('input#payment_save_card.w-checkbox-input[type="checkbox"][name="payment_save_card"]', {
            onchange: m$1.withAttr('checked', ctrl.creditCard.save),
            checked: ctrl.creditCard.save()
        }), m$1('label.w-form-label[for="payment_save_card"]', I18n$1.t('credit_card.save_card', ctrl.scope()))])]), m$1('.w-row', [m$1('.w-col.w-col-8.w-col-push-2', [!_$1.isEmpty(ctrl.vm.submissionError()) ? m$1('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller', m$1('.u-marginbottom-10.fontweight-bold', m$1.trust(ctrl.vm.submissionError()))) : '', ctrl.vm.isLoading() ? h.loader() : m$1('input.btn.btn-large.u-marginbottom-20[type="submit"]', { value: I18n$1.t('credit_card.finish_payment', ctrl.scope()) }), m$1('.fontsize-smallest.u-text-center.u-marginbottom-30', m$1.trust(I18n$1.t('credit_card.terms_of_use_agreement', ctrl.scope())))])])])]);
    }
};

var I18nScope$19 = _.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope$2 = _.partial(h.i18nScope, 'projects.contributions.edit_international');

var paymentForm = {
    controller: function controller(args) {
        var isSlip = m$1.prop(false),
            scope = function scope() {
            return args.vm.isInternational() ? I18nIntScope$2() : I18nScope$19();
        };

        var scrollTo = function scrollTo(el, isInit) {
            if (!isInit) {
                // h.animateScrollTo(el);
            }
        };

        return {
            scrollTo: scrollTo,
            isSlip: isSlip,
            scope: scope,
            vm: args.vm
        };
    },
    view: function view(ctrl, args) {
        return m$1('#catarse_pagarme_form', { config: ctrl.scrollTo }, [m$1('.u-text-center-small-only.u-marginbottom-30', [m$1('.fontsize-large.fontweight-semibold', I18n$1.t('payment_info', ctrl.scope())), m$1('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [m$1('span.fa.fa-lock'), I18n$1.t('safe_payment', ctrl.scope())])]), m$1('.flex-row.u-marginbottom-40', [m$1('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
            onclick: function onclick() {
                return ctrl.isSlip(false);
            },
            class: !ctrl.isSlip() ? 'selected' : ''
        }, [m$1('.fontsize-base.fontweight-semibold', I18n$1.t('credit_card_select', ctrl.scope())), m$1('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20', I18n$1.t('debit_card_info', ctrl.scope())), m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')]), !args.vm.isInternational() ? m$1('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
            onclick: function onclick() {
                return ctrl.isSlip(true);
            },
            class: ctrl.isSlip() ? 'selected' : ''
        }, [m$1('.fontsize-base.fontweight-semibold.u-marginbottom-20', 'Boleto bancário'), m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')]) : m$1('.flex-column')]), !ctrl.isSlip() ? m$1('#credit-card-section', [m$1.component(paymentCreditCard, { vm: args.vm, contribution_id: args.contribution_id, project_id: args.project_id, user_id: args.user_id })]) : !args.vm.isInternational() ? m$1('#boleto-section', [m$1.component(paymentSlip, { vm: args.vm, contribution_id: args.contribution_id, project_id: args.project_id })]) : '']);
    }
};

var I18nScope$16 = _.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

var projectsPayment = {
    controller: function controller(args) {
        var project = projectVM.getCurrentProject(),
            mode = project.mode,
            projectUserId = project.user.id,
            vm = paymentVM(mode),
            showPaymentForm = m$1.prop(false),
            contribution = contributionVM.getCurrentContribution(),
            reward = m$1.prop(contribution().reward),
            value = contribution().value,
            phoneMask = _.partial(h.mask, '(99) 9999-99999'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _.partial(h.mask, '99999-999'),
            isCnpj = m$1.prop(false),
            currentUserID = h.getUserID(),
            user = userVM.getCurrentUser();

        if (_.contains([41679, 40191, 40271, 38768, 42815, 43002, 42129, 41867, 39655], project.project_id)) {
            window.$zopim && window.$zopim.livechat || function (d, s) {
                var z = window.$zopim = function (c) {
                    z._.push(c);
                },
                    $$$1 = z.s = d.createElement(s),
                    e = d.getElementsByTagName(s)[0];z.set = function (o) {
                    z.set._.push(o);
                };z._ = [];z.set._ = [];$$$1.async = !0;$$$1.setAttribute('charset', 'utf-8');$$$1.src = '//v2.zopim.com/?2qPtIfZX0Exh5Szx5JUoUxWKqrTQI5Tm';z.t = +new Date();$$$1.type = 'text/javascript';e.parentNode.insertBefore($$$1, e);
            }(document, 'script');
            setTimeout(function t() {
                var c = window.$zopim && window.$zopim.livechat;
                if (c) {
                    var u = h.getUser();
                    if (u) {
                        c.setEmail(u.email);
                        c.setName(u.name);
                    }
                    window.zE && window.zE.hide();
                } else {
                    setTimeout(t, 1000);
                }
            }, 1000);
        }

        var validateForm = function validateForm() {
            if (vm.validate()) {
                vm.similityExecute(contribution().id);
                showPaymentForm(true);
            }
        };

        var fieldHasError = function fieldHasError(fieldName) {
            var fieldWithError = _.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m$1.component(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        var setStateOther = function setStateOther(el, isInit) {
            if (!isInit) {
                vm.fields.userState('');
            }
        };

        var applyDocumentMask = function applyDocumentMask(value) {
            if (value.length > 14) {
                isCnpj(true);
                vm.fields.ownerDocument(documentCompanyMask(value));
            } else {
                isCnpj(false);
                vm.fields.ownerDocument(documentMask(value));
            }

            return;
        };

        var applyZipcodeMask = _.compose(vm.fields.zipCode, zipcodeMask);

        var applyPhoneMask = _.compose(vm.fields.phone, phoneMask);

        var addressChange = function addressChange(fn) {
            return function (e) {
                CatarseAnalytics.oneTimeEvent({
                    cat: 'contribution_finish',
                    act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
                });

                if (_.isFunction(fn)) {
                    fn(e);
                }
            };
        };

        var scope = function scope(attr) {
            return vm.isInternational() ? I18nIntScope(attr) : I18nScope$16(attr);
        };

        if (_.isNull(currentUserID)) {
            return h.navigateToDevise();
        }

        vm.similityExecute(contribution().id);

        return {
            addressChange: addressChange,
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            fieldHasError: fieldHasError,
            setStateOther: setStateOther,
            validateForm: validateForm,
            projectUserId: projectUserId,
            showPaymentForm: showPaymentForm,
            contribution: contribution,
            reward: reward,
            value: value,
            mode: mode,
            scope: scope,
            isCnpj: isCnpj,
            vm: vm,
            user: user,
            project: project
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.user(),
            project = ctrl.project;

        return m$1('#project-payment.w-section.w-clearfix.section', [m$1('.w-col', m$1('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [m$1('.fontsize-smaller.fontweight-semibold', I18n$1.t('selected_reward.value', ctrl.scope())), m$1('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[href=\'#\']'), m$1('.w-clearfix.u-marginbottom-20', m$1('.fontsize-larger.text-success.u-left', 'R$ ' + Number(ctrl.value).toFixed())), m$1('.w-clearfix.back-payment-info-reward', {
            style: {
                'display': 'none'
            }
        }, [m$1('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', I18n$1.t('selected_reward.reward', ctrl.scope())), m$1('.fontsize-smallest', ctrl.reward().description ? ctrl.reward().description : m$1.trust(I18n$1.t('selected_reward.review_without_reward_html', ctrl.scope(_.extend({ value: Number(ctrl.value).toFixed() }))))), m$1('a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/' + project.project_id + '/contributions/new"]', I18n$1.t('selected_reward.edit', ctrl.scope()))])])), m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-8', [!_.isEmpty(ctrl.vm.fields.errors()) ? m$1('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller', m$1('.u-marginbottom-10.fontweight-bold', [I18n$1.t('errors.global', ctrl.scope()), m$1('.errors', _.map(ctrl.vm.fields.errors(), function (error) {
            return m$1('p', error.message);
        }))])) : '', m$1('.w-form', [m$1('form.u-marginbottom-40', [m$1('.u-marginbottom-40.u-text-center-small-only', [m$1('.fontweight-semibold.lineheight-tight.fontsize-large', I18n$1.t('title', ctrl.scope())), m$1('.fontsize-smaller', I18n$1.t('required', ctrl.scope()))]), user.name && user.owner_document ? m$1('.card.card-terciary.u-radius.u-marginbottom-40', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-small-2.w-col-tiny-2.w-hidden-tiny', [m$1('img.thumb.u-margintop-10.u-round[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"][width="100"]')]), m$1('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m$1('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', ['Dados do apoiador ', m$1('a.alt-link[href="/not-my-account?project_id=' + project.project_id + '"]', 'Não é você?')]), m$1('.fontsize-base.fontweight-semibold', user.name), m$1('label.field-label', 'CPF/CNPJ: ' + user.owner_document)])])]) : '', m$1('.w-row.u-marginbottom-30', [m$1('.w-col.w-col-7.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'country\']', ['País / ', m$1('em', 'Country'), ' *']), m$1('select.w-select.text-field[id=\'country\']', {
            onfocus: ctrl.vm.resetFieldError('userCountryId'),
            class: ctrl.fieldHasError('userCountryId') ? 'error' : false,
            onchange: m$1.withAttr('value', ctrl.vm.fields.userCountryId),
            value: ctrl.vm.fields.userCountryId()
        }, _.map(ctrl.vm.fields.countries(), function (country, idx) {
            return m$1('option', {
                value: country.id,
                key: idx,
                selected: country.id === ctrl.vm.fields.userCountryId()
            }, country.name_en);
        })), ctrl.fieldHasError('userCountryId')]), m$1('.w-col.w-col-5')]), user.name && user.owner_document ? '' : m$1('.w-row', [m$1('.w-col.w-col-7.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'complete-name\']', I18n$1.t('fields.complete_name', ctrl.scope())), m$1('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
            onfocus: ctrl.vm.resetFieldError('completeName'),
            class: ctrl.fieldHasError('completeName') ? 'error' : false,
            type: 'text',
            onchange: m$1.withAttr('value', ctrl.vm.fields.completeName),
            value: ctrl.vm.fields.completeName(),
            placeholder: 'Nome Completo'
        }), ctrl.fieldHasError('completeName')]), m$1('.w-col.w-col-5', ctrl.vm.isInternational() ? '' : [m$1('label.field-label.fontweight-semibold[for=\'document\']', I18n$1.t('fields.owner_document', ctrl.scope())), m$1('input.w-input.text-field[id=\'document\']', {
            onfocus: ctrl.vm.resetFieldError('ownerDocument'),
            class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
            type: 'tel',
            onkeyup: m$1.withAttr('value', ctrl.applyDocumentMask),
            value: ctrl.vm.fields.ownerDocument()
        }), ctrl.fieldHasError('ownerDocument')])]), m$1('.w-checkbox.w-clearfix', [m$1('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
            onclick: function onclick() {
                return CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_anonymous_change' });
            },
            onchange: m$1.withAttr('value', ctrl.vm.fields.anonymous),
            checked: ctrl.vm.fields.anonymous()
        }), m$1('label.w-form-label.fontsize-smallest[for=\'anonymous\']', I18n$1.t('fields.anonymous', ctrl.scope()))]), ctrl.vm.fields.anonymous() ? m$1('.card.card-message.u-radius.zindex-10.fontsize-smallest', m$1('div', [m$1('span.fontweight-bold', [I18n$1.t('anonymous_confirmation_title', ctrl.scope()), m$1('br')]), m$1('br'), I18n$1.t('anonymous_confirmation', ctrl.scope())])) : ''])]), m$1('.u-marginbottom-40', m$1('.w-form', [m$1('label.field-label.fontweight-semibold[for=\'street\']', I18n$1.t('fields.street', ctrl.scope())), m$1('input.w-input.text-field[id=\'street\']', {
            onfocus: ctrl.vm.resetFieldError('street'),
            class: ctrl.fieldHasError('street') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.street)),
            value: ctrl.vm.fields.street(),
            placeholder: 'Rua Da Minha Casa'
        }), ctrl.fieldHasError('street'), m$1('.w-row', ctrl.vm.isInternational() ? '' : [m$1('.w-col.w-col-4.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'number\']', I18n$1.t('fields.street_number', ctrl.scope())), m$1('input.w-input.text-field[id=\'number\']', {
            onfocus: ctrl.vm.resetFieldError('number'),
            class: ctrl.fieldHasError('number') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.number)),
            value: ctrl.vm.fields.number(),
            placeholder: '421'
        }), ctrl.fieldHasError('number')]), m$1('.w-col.w-col-4.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'address-complement\']', I18n$1.t('fields.street_complement', ctrl.scope())), m$1('input.w-input.text-field[id=\'address-complement\']', {
            onfocus: ctrl.vm.resetFieldError('addressComplement'),
            class: ctrl.fieldHasError('addressComplement') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.addressComplement)),
            value: ctrl.vm.fields.addressComplement(),
            placeholder: 'Residencial 123'
        }), ctrl.fieldHasError('addressComplement')]), m$1('.w-col.w-col-4', ctrl.vm.isInternational() ? '' : [m$1('label.field-label.fontweight-semibold[for=\'neighbourhood\']', I18n$1.t('fields.neighbourhood', ctrl.scope())), m$1('input.w-input.text-field[id=\'neighbourhood\']', {
            onfocus: ctrl.vm.resetFieldError('neighbourhood'),
            class: ctrl.fieldHasError('neighbourhood') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.neighbourhood)),
            value: ctrl.vm.fields.neighbourhood(),
            placeholder: 'São José'
        }), ctrl.fieldHasError('neighbourhood')])]), m$1('.w-row', [m$1('.w-col.w-col-4.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'zip-code\']', I18n$1.t('fields.zipcode', ctrl.scope())), m$1('input.w-input.text-field[id=\'zip-code\']', {
            type: 'tel',
            onfocus: ctrl.vm.resetFieldError('zipCode'),
            class: ctrl.fieldHasError('zipCode') ? 'error' : false,
            onchange: ctrl.addressChange(),
            onkeyup: m$1.withAttr('value', function (value) {
                return !ctrl.vm.isInternational() ? ctrl.applyZipcodeMask(value) : ctrl.vm.fields.zipCode(value);
            }),
            value: ctrl.vm.fields.zipCode(),
            placeholder: '42100000'
        }), ctrl.fieldHasError('zipCode')]), m$1('.w-col.w-col-4.w-sub-col', [m$1('label.field-label.fontweight-semibold[for=\'city\']', I18n$1.t('fields.city', ctrl.scope())), m$1('input.w-input.text-field[id=\'city\']', {
            onfocus: ctrl.vm.resetFieldError('city'),
            class: ctrl.fieldHasError('city') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.city)),
            value: ctrl.vm.fields.city(),
            placeholder: 'Cidade'
        }), ctrl.fieldHasError('city')]), m$1('.w-col.w-col-4', [m$1('label.field-label.fontweight-semibold[for=\'state\']', I18n$1.t('fields.state', ctrl.scope())), ctrl.vm.isInternational() ? m$1('input.w-input.text-field[id=\'address-state\']', {
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.userState)),
            class: ctrl.fieldHasError('userState') ? 'error' : false,
            value: ctrl.vm.fields.userState()
        }) : m$1('select.w-select.text-field[id=\'address-state\']', {
            onfocus: ctrl.vm.resetFieldError('userState'),
            class: ctrl.fieldHasError('userState') ? 'error' : false,
            onchange: ctrl.addressChange(m$1.withAttr('value', ctrl.vm.fields.userState)),
            value: ctrl.vm.fields.userState()
        }, _.map(ctrl.vm.fields.states(), function (state, idx) {
            return m$1('option', {
                value: state.acronym,
                selected: state.acronym === ctrl.vm.fields.userState()
            }, state.name);
        })), ctrl.fieldHasError('userState')])]), !ctrl.vm.isInternational() ? m$1('.w-row', [m$1('.w-col.w-col-6', [m$1('label.field-label.fontweight-semibold[for=\'phone\']', I18n$1.t('fields.phone', ctrl.scope())), m$1('input.w-input.text-field[id=\'phone\']', {
            onfocus: ctrl.vm.resetFieldError('phone'),
            class: ctrl.fieldHasError('phone') ? 'error' : false,
            type: 'tel',
            onkeyup: m$1.withAttr('value', ctrl.applyPhoneMask),
            value: ctrl.vm.fields.phone()
        }), ctrl.fieldHasError('phone')])]) : ''])), m$1('.w-row.u-marginbottom-40', !ctrl.showPaymentForm() ? m$1('.w-col.w-col-push-3.w-col-6', m$1('button.btn.btn-large', {
            onclick: function onclick() {
                return CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_next_click' }, ctrl.validateForm);
            }
        }, I18n$1.t('next_step', ctrl.scope()))) : ''), ctrl.showPaymentForm() ? m$1.component(paymentForm, {
            vm: ctrl.vm,
            contribution_id: ctrl.contribution().id,
            project_id: projectVM.currentProject().project_id,
            user_id: user.id
        }) : '']), m$1('.w-col.w-col-4', [m$1('.w-hidden-small.w-hidden-tiny.card.u-radius.u-marginbottom-20', [m$1('.fontsize-smaller.fontweight-semibold.u-marginbottom-20', I18n$1.t('selected_reward.value', ctrl.scope())), m$1('.w-clearfix.u-marginbottom-20', [m$1('.fontsize-larger.text-success.u-left', 'R$ ' + Number(ctrl.value).toFixed()), m$1('a.fontsize-small.link-hidden.u-right.fontweight-semibold[href="/projects/' + projectVM.currentProject().project_id + '/contributions/new' + (ctrl.reward().id ? '?reward_id=' + ctrl.reward().id : '') + '"]', I18n$1.t('selected_reward.edit', ctrl.scope()))]), m$1('.back-payment-info-reward', [m$1('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', I18n$1.t('selected_reward.reward', ctrl.scope())), m$1('.fontsize-smallest', ctrl.reward().description ? ctrl.reward().description : m$1.trust(I18n$1.t('selected_reward.review_without_reward_html', ctrl.scope(_.extend({ value: Number(ctrl.value).toFixed() })))))])]), m$1.component(faqBox, {
            mode: ctrl.mode,
            vm: ctrl.vm,
            faq: ctrl.vm.faq(),
            projectUserId: ctrl.projectUserId
        })])]))]);
    }
};

var projectsReward = {
    controller: function controller(args) {
        var vm = rewardVM,
            selectedReward = vm.selectedReward,
            selectReward = vm.selectReward,
            rewards = vm.rewards(),
            mode = projectVM.currentProject().mode,
            faq = I18n$1.translations[I18n$1.currentLocale()].projects.faq[mode];

        //TODO unify projectsReward and project-reward-list reward submission. fix routing issue.
        var submitContribution = function submitContribution() {
            var valueFloat = h.monetaryToFloat(vm.contributionValue);

            if (valueFloat < vm.selectedReward().minimum_value) {
                vm.error('O valor de apoio para essa recompensa deve ser de no m\xEDnimo R$' + vm.selectedReward().minimum_value);
            } else {
                if (!h.getUser()) {
                    h.storeObject(storeKey, { value: valueFloat, reward: vm.selectedReward() });

                    return h.navigateToDevise('/' + projectVM.currentProject().permalink);
                } else {
                    vm.error('');
                    vm.contributionValue(valueFloat);
                    m$1.route('/projects/' + projectVM.currentproject().project_id + '/payment', {
                        project_user_id: projectVM.currentProject().user_id
                    });
                }
            }

            return false;
        };

        var isSelected = function isSelected(reward) {
            return reward.id === selectedReward().id;
        };

        if (_$1.first(rewards).id !== vm.noReward.id) {
            rewards.unshift(vm.noReward);
        }

        return {
            rewards: rewards,
            project: projectVM.currentProject,
            contributionValue: vm.contributionValue,
            submitContribution: submitContribution,
            applyMask: vm.applyMask,
            error: vm.error,
            isSelected: isSelected,
            selectedReward: selectedReward,
            selectReward: selectReward,
            faq: faq
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project;

        return m$1('#project-rewards', [m$1('.w-section.page-header.u-text-center', [m$1('.w-container', [m$1('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)), m$1('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['por ', project().user ? project().user.name : project().owner_name ? project().owner_name : ''])])]), m$1('.w-section.header-cont-new', m$1('.w-container', m$1('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only', 'Escolha a recompensa e em seguida o valor do apoio'))), m$1('.section[id=\'new-contribution\']', m$1('.w-container', m$1('.w-row', [m$1('.w-col.w-col-8', m$1('.w-form.back-reward-form', m$1('form.simple_form.new_contribution', {
            onsubmit: ctrl.submitContribution
        }, _$1.map(ctrl.rewards, function (reward, index) {
            var isSelected = ctrl.isSelected(reward),
                monetaryMinimum = h.applyMonetaryMask(reward.minimum_value);

            return m$1('span.radio.w-radio.w-clearfix.back-reward-radio-reward', {
                class: isSelected ? 'selected' : '',
                onclick: ctrl.selectReward(reward),
                key: index
            }, m$1('label[for=\'contribution_reward_id_' + reward.id + '\']', [m$1('input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id=\'contribution_reward_id_' + reward.id + '\'][name=\'contribution[reward_id]\'][type=\'radio\'][value=\'' + reward.id + '\']', {
                checked: isSelected ? true : false
            }), m$1('label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for=\'contribution_reward_' + reward.id + '\']', reward.id === -1 ? 'Não quero recompensa' : 'R$ ' + reward.minimum_value + ' ou mais'), isSelected ? m$1('.w-row.back-reward-money', [m$1('.w-col.w-col-8.w-col-small-8.w-col-tiny-8.w-sub-col-middle.w-clearfix', [m$1('.w-row', [m$1('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m$1('.back-reward-input-reward.placeholder', 'R$')), m$1('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m$1('input.user-reward-value.back-reward-input-reward[autocomplete=\'off\'][type=\'tel\']', {
                class: ctrl.error() ? 'error' : '',
                min: monetaryMinimum,
                placeholder: monetaryMinimum,
                onkeyup: m$1.withAttr('value', ctrl.applyMask),
                value: ctrl.contributionValue()
            }))]), ctrl.error().length > 0 ? m$1('.text-error', [m$1('br'), m$1('span.fa.fa-exclamation-triangle'), ' ' + ctrl.error()]) : '']), m$1('.submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4', m$1('button.btn.btn-large', ['Continuar  ', m$1('span.fa.fa-chevron-right')]))]) : '', m$1('.back-reward-reward-description', [m$1('.fontsize-smaller.u-marginbottom-10', reward.description), reward.deliver_at ? m$1('.fontsize-smallest.fontcolor-secondary', 'Estimativa de entrega: ' + h.momentify(reward.deliver_at, 'MMM/YYYY')) : ''])])); //End map return
        })))), m$1('.w-col.w-col-4', m$1.component(faqBox, { mode: ctrl.project().mode, faq: ctrl.faq }))])))]);
    }
};

var I18nScope$22 = _$1.partial(h.i18nScope, 'projects.publish');

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

    var expiresAt = function expiresAt() {
      var project = _$1.first(projectDetails());
      return moment().add(project.online_days, 'days');
    };

    return {
      l: l,
      accountL: accountL,
      expiresAt: expiresAt,
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
      return [m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m$1('span.fontweight-semibold', 'Regras da modalidade FLEX')]), m$1('div', 'Você escolheu a campanha flexível. Dessa maneira, você irá receber todos os recursos arrecadados junto aos apoiadores ao final do prazo da campanha (descontando a taxa do Catarse) e deverá cumprir com a execução do projeto e com a entrega das recompensas oferecidas independente do quanto arrecadar.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m$1('span.fontweight-semibold', 'Meta de arrecadação')]), m$1('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m$1('span.fontweight-semibold', 'Taxas')]), m$1('div', ['Ao final da campanha, cobraremos 13% sobre o ', m$1('span.fontweight-semibold', 'valor total arrecadado.')])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m$1('span.fontweight-semibold', 'Prazo da campanha')]), m$1('div', 'Uma vez definido, o prazo de encerramento não poderá ser alterado. Caso você tenha iniciado a campanha com o prazo em aberto, deverá defini-lo durante a campanha, podendo deixar a campanha aberta por no máximo 12 meses.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m$1('span.fontweight-semibold', 'Prazo para repasse')]), m$1('div', 'Quando o prazo do seu projeto chegar ao fim, você deverá confirmar seus dados bancários. Após essa confirmação, o Catarse depositará na sua conta corrente em até 10 dias úteis. O valor depositado já estará considerando o desconto de 13% da taxa.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m$1('span.fontweight-semibold', 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m$1('div', [m$1('span.fontweight-semibold', 'Você não poderá:'), ' alterar o tipo de financiamento, nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo (caso já tenha definido), as recompensas onde existirem apoios já efetuados e a conta bancária registrada.\
                    ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito, as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m$1('span.fontweight-semibold', 'Responsabilidade do Catarse')]), [m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m$1('span.fontweight-semibold', 'Suas responsabilidades')]), m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m$1('div', [m$1('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m$1('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
    },
        terms = function terms(project) {
      return [m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m$1('span.fontweight-semibold', 'Regras da modalidade Tudo-ou-nada')]), m$1('div', ['Você escolheu a campanha tudo-ou-nada. Dessa maneira, você só irá receber os recursos arrecadados ', m$1('span.fontweight-semibold', 'caso atinja ou supere a meta de arrecadação'), '. Caso contrário, todos seus apoiadores serão reembolsados. Você será responsável pela entrega das recompensas oferecidas se seu projeto alcançar a meta de arrecadação.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Meta de arrecadação')]), m$1('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Taxas')]), m$1('div', ['Cobramos 13% sobre o ', m$1('span.fontweight-semibold', 'valor total arrecadado'), ' pelo seu projeto caso ele atinja ou supere a meta dentro do prazo da campanha. Se o projeto não atingir a meta, nenhuma taxa será cobrada.', m$1('span.fontweight-semibold')])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Prazo da campanha')]), m$1('div', 'Seu projeto estar\xE1 em arrecada\xE7\xE3o no Catarse at\xE9 o dia ' + h.momentify(ctrl.expiresAt()) + ' \xE0s 23h59min59s. Este prazo n\xE3o poder\xE1 ser alterado ap\xF3s a publica\xE7\xE3o do projeto.')]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Regras do repasse e reembolso')]), m$1('div', ['Quando o prazo do seu projeto chegar ao fim, você deverá confirmar seus dados bancários. Após essa confirmação, o Catarse depositará o valor arrecadado, já com o desconto da taxa, na sua conta corrente em até 10 dias úteis. Caso o projeto não atinja 100% da meta dentro do prazo, o Catarse irá reembolsar os apoiadores. ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Saiba mais sobre o processo de reembolso'), '.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [m$1('div', [m$1('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, o tipo de financiamento, a conta bancária, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito, as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Responsabilidade do Catarse')]), [m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', m$1('br'), m$1('br'), m$1('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Suas responsabilidades')]), m$1('div', [m$1('span.fontweight-semibold'), m$1('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), m$1('.w-col.w-col-11', [m$1('div', [m$1('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m$1('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), m$1('div', [m$1('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', m$1('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', m$1('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
    };

    return [!ctrl.l() && !ctrl.accountL() ? [project.is_owner_or_admin ? m$1.component(projectDashboardMenu, {
      project: m$1.prop(project),
      hidePublish: true
    }) : '', m$1('.w-section.section-product.' + project.mode), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [m$1('.u-text-center', [m$1('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'), m$1('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')])]), m$1('.w-col.w-col-3')])])]), m$1('.divider'), m$1('.w-section.section-one-column.bg-gray.section.before-footer', [m$1('.w-container', [m$1('.card.medium.u-marginbottom-60.card-terciary', [m$1('.w-row', [m$1('.w-col.w-col-6.w-clearfix', [m$1('img.card-project-thumb.u-right[src=' + project.large_image + ']')]), m$1('.w-col.w-col-6', [m$1('.u-marginbottom-30.fontsize-base', [m$1('div', [m$1('span.fontweight-semibold', 'Título: '), project.name]), m$1('div', [m$1('span.fontweight-semibold', 'Link: '), 'www.catarse.me/' + project.permalink]), m$1('div', [m$1('span.fontweight-semibold', 'Modalidade de financiamento: '), I18n$1.t(project.mode, I18nScope$22())]), m$1('div', [m$1('span.fontweight-semibold', 'Meta de arrecadação: '), 'R$ ' + h.formatNumber(project.goal, 2, 3)]), project.online_days !== null ? m$1('div', [m$1('span.fontweight-semibold', 'Prazo: ' + project.online_days + ' ' + (project.online_days > 1 ? 'dias' : 'dia'))]) : '', m$1('div', [m$1('span.fontweight-semibold', 'Responsável: '), account.owner_name]), m$1('div', [m$1('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])])])]), m$1('.u-text-center', [m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10', [m$1('.divider.u-marginbottom-10'), m$1('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')]), m$1('.w-col.w-col-1')])])]), m$1('.card.medium.u-radius.u-marginbottom-60', [m$1('.u-text-center.u-marginbottom-60', [m$1('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'), m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ', m$1('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/requests/new"][target="_blank"]', 'entre em contato'), '!'])]), m$1('.w-col.w-col-2')])]), _$1.map(project.mode == 'flex' ? flexTerms(project) : terms(project), function (term, index) {
      return m$1('.u-marginbottom-30.fontsize-base' + (index == 0 ? '' : '.w-hidden.publish-rules'), [m$1('.w-row[id=\'rule-' + index + '\']', [m$1('.w-col.w-col-1.u-text-center', [m$1('div', [m$1((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? 'a.w-inline-block.checkbox-big[href=\'#rule-' + (index + 1) + '\']' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href=\'#rule-' + (index + 1) + '\']', { onclick: function onclick() {
          return ctrl.showNextTerm(index, project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm);
        } })])]), term])]);
    })]), m$1('.w-row.publish-btn-section.w-hidden', [m$1('.w-col.w-col-4'), m$1('.w-col.w-col-4', [m$1('a.btn.btn-large.u-marginbottom-20[href=/' + (project.mode == 'flex' ? 'flexible_projects' : 'projects') + '/' + project.project_id + '/push_to_online]', 'Publicar agora!'), m$1('.u-text-center.fontsize-smaller', ['Ao publicar o seu projeto, você está aceitando os ', m$1('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), ' e ', m$1('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')])]), m$1('.w-col.w-col-4')])])]), '\
    '] : h.loader()];
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

var youtubeLightbox = {
    controller: function controller(args) {
        var player = void 0;
        var showLightbox = h.toggleProp(false, true),
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
            onclick: function onclick() {
                ctrl.showLightbox.toggle();
                args.onclick && args.onclick();
            }
        }), m$1('#lightbox.w-lightbox-backdrop[style="display:' + (ctrl.showLightbox() ? 'block' : 'none') + '"]', [m$1('.w-lightbox-container', [m$1('.w-lightbox-content', [m$1('.w-lightbox-view', [m$1('.w-lightbox-frame', [m$1('figure.w-lightbox-figure', [m$1('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m$1('#ytvideo.embedly-embed.w-lightbox-embed', { config: ctrl.setYoutube })])])]), m$1('.w-lightbox-spinner.w-lightbox-hide'), m$1('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m$1('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m$1('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.closeVideo })]), m$1('.w-lightbox-strip')])])]);
    }
};

var I18nScope$23 = _$1.partial(h.i18nScope, 'pages.start');

var start = {
    controller: function controller() {
        h.analytics.windowScroll({ cat: 'project_start', act: 'start_page_scroll' });
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
        },
            projectCategory = m$1.prop('-1'),
            projectName = m$1.prop(''),
            projectNameError = m$1.prop(false),
            projectCategoryError = m$1.prop(false),
            validateProjectForm = function validateProjectForm() {
            projectCategoryError(projectCategory() == -1);
            projectNameError(projectName().trim() === '');

            return !projectCategoryError() && !projectNameError();
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
            questions: startvm.questions,
            projectCategory: projectCategory,
            projectName: projectName,
            projectNameError: projectNameError,
            projectCategoryError: projectCategoryError,
            validateProjectForm: validateProjectForm
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

        return m$1('#start', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$23())) }, [m$1('.w-section.hero-full.hero-start', [m$1('.w-container.u-text-center', [m$1('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n$1.t('slogan', I18nScope$23())), m$1('.w-row.u-marginbottom-40', [m$1('.w-col.w-col-4.w-col-push-4', [m$1('a.btn.btn-large.u-marginbottom-10[href="#start-form"]', {
            config: h.scrollTo(),
            onclick: h.analytics.event({ cat: 'project_start', act: 'start_btnstart_click' })
        }, I18n$1.t('submit', I18nScope$23()))])]), m$1('.w-row', _$1.isEmpty(stats) ? '' : [m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m$1('p.fontsize-small.start-stats', I18n$1.t('header.people', I18nScope$23()))]), m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m$1('p.fontsize-small.start-stats', I18n$1.t('header.money', I18nScope$23()))]), m$1('.w-col.w-col-4', [m$1('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m$1('p.fontsize-small.start-stats', I18n$1.t('header.success', I18nScope$23()))])])])]), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-push-1.u-text-center', [m$1('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n$1.t('page-title', I18nScope$23())), m$1('.fontsize-small', I18n$1.t('page-subtitle', I18nScope$23()))])]), m$1('.w-clearfix.how-row', [m$1('.w-hidden-small.w-hidden-tiny.how-col-01', [m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.2', I18nScope$23()))]), m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.4', I18nScope$23()))])]), m$1('.how-col-02'), m$1('.how-col-03', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.5', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.6', I18nScope$23())), m$1('.fontweight-semibold.fontsize-large.u-margintop-30', I18n$1.t('banner.7', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.8', I18nScope$23()))]), m$1('.w-hidden-main.w-hidden-medium.how-col-01', [m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.2', I18nScope$23()))]), m$1('.info-howworks-backers', [m$1('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$23())), m$1('.fontsize-base', I18n$1.t('banner.4', I18nScope$23()))])])])])]), m$1('.w-section.divider'), m$1('.w-section.section-large', [m$1('.w-container.u-text-center.u-marginbottom-60', [m$1('div', [m$1('span.fontsize-largest.fontweight-semibold', I18n$1.t('features.title', I18nScope$23()))]), m$1('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n$1.t('features.subtitle', I18nScope$23())), m$1('.w-hidden-main.w-hidden-medium.u-margintop-30', [m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_1', I18nScope$23())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_2', I18nScope$23())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_3', I18nScope$23())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_4', I18nScope$23())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_5', I18nScope$23())), m$1('.fontsize-large.u-marginbottom-30', I18n$1.t('features.feature_6', I18nScope$23()))])]), m$1('.w-container', [m$1('.w-tabs.w-hidden-small.w-hidden-tiny', [m$1('.w-tab-menu.w-col.w-col-4', _$1.map(ctrl.paneImages, function (pane, idx) {
            return m$1('btn.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_solution_click', lbl: pane.label }, ctrl.selectPane(idx))
            }, pane.label);
        })), m$1('.w-tab-content.w-col.w-col-8', _$1.map(ctrl.paneImages, function (pane, idx) {
            return m$1('.w-tab-pane', [m$1('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
        }))])])]), m$1('.w-section.section-large.card-terciary', m$1('.w-container', [m$1('.u-text-center.u-marginbottom-40', [m$1('div', m$1('span.fontsize-largest.fontweight-semibold', I18n$1.t('mode.title', I18nScope$23()))), m$1('.w-row', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10', m$1('.fontsize-large.u-marginbottom-20', I18n$1.t('mode.subtitle', I18nScope$23()))), m$1('.w-col.w-col-1')])]), m$1('div', m$1('.flex-row.u-marginbottom-40', [m$1('.flex-column.card.u-radius.u-marginbottom-30', [m$1('.u-text-center.u-marginbottom-30', m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5632f334ec8a367d341b4bba_badge-aon.png\']')), m$1('.fontsize-large.flex-column.u-marginbottom-20', [I18n$1.t('mode.aon.info', I18nScope$23()), m$1.trust('&nbsp;')]), m$1('.fontsize-base.flex-column.fontcolor-secondary', I18n$1.t('mode.aon.info_2', I18nScope$23()))]), m$1('.flex-column.card.u-radius.u-marginbottom-30', [m$1('.u-text-center.u-marginbottom-30', m$1('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5632ebacd092957f34eaea9c_badge-flex.png\']')), m$1('.fontsize-large.flex-column.u-marginbottom-20', I18n$1.t('mode.flex.info', I18nScope$23())), m$1('.fontsize-base.flex-column.fontcolor-secondary', I18n$1.t('mode.flex.info_2', I18nScope$23()))])])), m$1('.u-text-center.u-marginbottom-30', [m$1('.fontsize-large.fontweight-semibold', I18n$1.t('mode.tax_info', I18nScope$23())), m$1('.fontsize-smallest.fontcolor-secondary', [I18n$1.t('mode.failed_info', I18nScope$23()), m$1.trust(I18n$1.t('mode.more_link', I18nScope$23()))])])])), m$1('.w-section.section-large.bg-blue-one', [m$1('.w-container.u-text-center', [m$1('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n$1.t('video.title', I18nScope$23()), m$1('br'), I18n$1.t('video.subtitle', I18nScope$23())]), m$1.component(youtubeLightbox, {
            src: I18n$1.t('video.src', I18nScope$23()),
            onclick: h.analytics.event({ cat: 'project_start', act: 'start_video_play' })
        })])]), m$1('.w-hidden-small.w-hidden-tiny.section-categories', [m$1('.w-container', [m$1('.u-text-center', [m$1('.w-row', [m$1('.w-col.w-col-10.w-col-push-1', [m$1('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n$1.t('categories.title', I18nScope$23()))])])]), m$1('.w-tabs', [m$1('.w-tab-menu.u-text-center', _$1.map(ctrl.categories(), function (category) {
            return m$1('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_category_click', lbl: category.name }, ctrl.selectCategory(category))
            }, [m$1('div', category.name)]);
        })), m$1('.w-tab-content.u-margintop-40', [m$1('.w-tab-pane.w--tab-active', [m$1('.w-row', ctrl.selectedCategoryIdx() !== -1 ? _$1.map(ctrl.selectedCategory(), function (category) {
            return [m$1('.w-col.w-col-5', [m$1('.fontsize-jumbo.u-marginbottom-20', category.name), m$1('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="#start-form"]', {
                config: h.scrollTo()
            }, I18n$1.t('submit', I18nScope$23()))]), m$1('.w-col.w-col-7', [m$1('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + (category.total_successful_value ? h.formatNumber(category.total_successful_value, 2, 3) : '...')), m$1('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m$1('.fontsize-megajumbo.fontcolor-negative', category.successful_projects ? category.successful_projects : '...'), m$1('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_$1.isEmpty(ctrl.featuredProjects()) ? _$1.map(ctrl.featuredProjects(), function (project) {
                return !_$1.isUndefined(project) ? m$1('.w-row.u-marginbottom-10', [m$1('.w-col.w-col-1', [m$1('img.user-avatar[src="' + h.useAvatarOrDefault(project.userThumb) + '"]')]), m$1('.w-col.w-col-11', [m$1('.fontsize-base.fontweight-semibold', project.user.name), m$1('.fontsize-smallest', [I18n$1.t('categories.pledged', I18nScope$23({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })), m$1('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m$1('.fontsize-base', I18n$1.t('categories.loading_featured', I18nScope$23()));
            }) : ''])];
        }) : '')])])])])]), m$1.component(slider, {
            slides: testimonials(),
            title: I18n$1.t('testimonials_title', I18nScope$23()),
            slideClass: 'slide-testimonials-content',
            wrapperClass: 'slide-testimonials',
            onchange: h.analytics.event({ cat: 'project_start', act: 'start_testimonials_change' })
        }), m$1('.w-section.divider.u-margintop-30'), m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', I18n$1.t('qa_title', I18nScope$23())), m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-6', _$1.map(ctrl.questions.col_1, function (question) {
            return m$1.component(landingQA, {
                question: question.question,
                answer: question.answer,
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_qa_click', lbl: question.question })
            });
        })), m$1('.w-col.w-col-6', _$1.map(ctrl.questions.col_2, function (question) {
            return m$1.component(landingQA, {
                question: question.question,
                answer: question.answer,
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_qa_click', lbl: question.question })
            });
        }))])]), m$1('#start-form.w-section.section-large.u-text-center.bg-purple.before-footer', [m$1('.w-container', [m$1('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m$1('form[action="/projects/fallback_create"][method="GET"].w-row.w-form', {
            onsubmit: function onsubmit(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_submit' })(e);
                return ctrl.validateProjectForm();
            }
        }, [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n$1.t('form.title', I18nScope$23())), m$1('input[name="utf8"][type="hidden"][value="✓"]'), m$1('input[name="authenticity_token"][type="hidden"][value="' + h.authenticityToken() + '"]'), m$1('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', {
            name: 'project[name]',
            class: ctrl.projectNameError() ? 'error' : '',
            onfocus: function onfocus() {
                return ctrl.projectNameError(false);
            },
            onchange: function onchange(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_change', lbl: 'name' })(e);
                m$1.withAttr('value', ctrl.projectName)(e);
            }
        }), m$1('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m$1('select.w-select.text-field.medium.u-marginbottom-40', {
            name: 'project[category_id]',
            class: ctrl.projectCategoryError() ? 'error' : '',
            onfocus: function onfocus() {
                return ctrl.projectCategoryError(false);
            },
            onchange: function onchange(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_change', lbl: 'category' })(e);
                m$1.withAttr('value', ctrl.projectCategory)(e);
            }
        }, [m$1('option[value="-1"]', I18n$1.t('form.select_default', I18nScope$23())), _$1.map(ctrl.categories(), function (category) {
            return m$1('option[value="' + category.id + '"]', { selected: ctrl.projectCategory() === category.id }, category.name);
        })])]), m$1('.w-col.w-col-2'), m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m$1('input[type="submit"][value="' + I18n$1.t('form.submit', I18nScope$23()) + '"].w-button.btn.btn-large')])]), m$1('.w-row.u-marginbottom-80', ctrl.projectNameError() || ctrl.projectCategoryError() ? m$1.component(inlineError, { message: 'Por favor, verifique novamente os campos acima!' }) : '')])])])]);
    }
};

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
            return m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2'), m$1('.w-col.w-col-8', [m$1('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m$1('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m$1('.w-col.w-col-2')])]);
        })]);
    }
};

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

var team = {
    view: function view() {
        return m$1('#static-team-app', [m$1.component(teamTotal), m$1.component(teamMembers)]);
    }
};

/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
var I18nScope$25 = _$1.partial(h.i18nScope, 'users.balance');

var userBalanceRequestModelContent = {
    controller: function controller(args) {
        var vm = postgrest.filtersVM({ user_id: 'eq' }),
            balance = args.balance,
            loaderOpts = models.balanceTransfer.postOptions({
            user_id: balance.user_id }),
            requestLoader = postgrest.loaderWithToken(loaderOpts),
            displayDone = h.toggleProp(false, true),
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

        return ctrl.loadBankA() ? h.loader() : m$1('div', _$1.map(ctrl.bankAccounts(), function (item) {
            return [m$1('.modal-dialog-header', [m$1('.fontsize-large.u-text-center', I18n$1.t('withdraw', I18nScope$25()))]), ctrl.displayDone() ? m$1('.modal-dialog-content.u-text-center', [m$1('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m$1('p.fontsize-large', I18n$1.t('sucess_message', I18nScope$25()))]) : m$1('.modal-dialog-content', [m$1('.fontsize-base.u-marginbottom-20', [m$1('span.fontweight-semibold', 'Valor:'), m$1.trust('&nbsp;'), m$1('span.text-success', 'R$ ' + h.formatNumber(balance.amount, 2, 3))]), m$1('.fontsize-base.u-marginbottom-10', [m$1('span', { style: { 'font-weight': ' 600' } }, I18n$1.t('bank.account', I18nScope$25()))]), m$1('.fontsize-small.u-marginbottom-10', [m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.name', I18nScope$25())), m$1.trust('&nbsp;'), item.owner_name]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.cpf_cnpj', I18nScope$25())), m$1.trust('&nbsp;'), item.owner_document]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.bank_name', I18nScope$25())), m$1.trust('&nbsp;'), item.bank_name]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.agency', I18nScope$25())), m$1.trust('&nbsp;'), item.agency + '-' + item.agency_digit]), m$1('div', [m$1('span.fontcolor-secondary', I18n$1.t('bank.account', I18nScope$25())), m$1.trust('&nbsp;'), item.account + '-' + item.account_digit])])]), !ctrl.displayDone() ? m$1('.modal-dialog-nav-bottom', [m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-6', [ctrl.requestLoader() ? h.loader() : m$1('a.btn.btn-large.btn-request-fund[href="js:void(0);"]', { onclick: ctrl.requestFund }, 'Solicitar saque')]), m$1('.w-col.w-col-3')])]) : ''];
        }));
    }
};

/**
 * window.c.UserBalance component
 * Render the current user total balance and request fund action
 *
 * Example:
 * m.component(c.UserBalance, {
 *     user_id: 123,
 * })
 */
var I18nScope$24 = _$1.partial(h.i18nScope, 'users.balance');

var userBalance = {
    controller: function controller(args) {
        args.balanceManager.load();

        return {
            userBalances: args.balanceManager.collection,
            displayModal: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var balance = _$1.first(ctrl.userBalances()),
            balanceRequestModalC = [userBalanceRequestModelContent, _$1.extend({}, { balance: balance }, args)];

        return m$1('.w-section.section.user-balance-section', [ctrl.displayModal() ? m$1.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: balanceRequestModalC
        }) : '', m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [m$1('.fontsize-larger', [I18n.t('totals', I18nScope$24()), m$1('span.text-success', 'R$ ' + h.formatNumber(balance.amount, 2, 3))])]), m$1('.w-col.w-col-4', [m$1('a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ' + (balance.amount <= 0 ? 'btn-inactive' : '') + '"][href="js:void(0);"]', { onclick: balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);' }, I18n.t('withdraw_cta', I18nScope$24()))])])])]);
    }
};

var I18nScope$26 = _.partial(h.i18nScope, 'users.balance');

var userBalanceTrasactionRow = {
    controller: function controller(args) {
        var expanded = h.toggleProp(false, true);

        if (args.index == 0) {
            expanded.toggle();
        }

        return {
            expanded: expanded
        };
    },
    view: function view(ctrl, args) {
        var item = args.item,
            createdAt = h.momentFromString(item.created_at, 'YYYY-MM-DD');

        return m$1('div[class=\'balance-card ' + (ctrl.expanded() ? 'card-detailed-open' : '') + '\']', m$1('.w-clearfix.card.card-clickable', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-tiny-2', [m$1('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')), m$1('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))]), m$1('.w-col.w-col-10.w-col-tiny-10', [m$1('.w-row', [m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('debit', I18nScope$26())), m$1.trust('&nbsp;'), m$1('span.fontsize-base.text-error', 'R$ ' + h.formatNumber(Math.abs(item.debit), 2, 3))])]), m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('credit', I18nScope$26())), m$1.trust('&nbsp;'), m$1('span.fontsize-base.text-success', 'R$ ' + h.formatNumber(item.credit, 2, 3))])]), m$1('.w-col.w-col-4', [m$1('div', [m$1('span.fontsize-smaller.fontcolor-secondary', I18n.t('totals', I18nScope$26())), m$1.trust('&nbsp;'), m$1('span.fontsize-base', 'R$ ' + h.formatNumber(item.total_amount, 2, 3))])])])])]), m$1('a.w-inline-block.arrow-admin.' + (ctrl.expanded() ? 'arrow-admin-opened' : '') + '.fa.fa-chevron-down.fontcolor-secondary[href="js:(void(0));"]', { onclick: ctrl.expanded.toggle })]), ctrl.expanded() ? m$1('.card', _.map(item.source, function (transaction) {
            var pos = transaction.amount >= 0;

            return m$1('div', [m$1('.w-row.fontsize-small.u-marginbottom-10', [m$1('.w-col.w-col-2', [m$1('.text-' + (pos ? 'success' : 'error'), (pos ? '+' : '-') + ' R$ ' + h.formatNumber(Math.abs(transaction.amount), 2, 3))]), m$1('.w-col.w-col-10', [m$1('div', transaction.event_name + ' ' + transaction.origin_object.name)])]), m$1('.divider.u-marginbottom-10')]);
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
        }, 'Carregar mais') : h.loader()])])])]);
    }
};

/**
 * window.c.root.Balance component
 * A root component to show user balance and transactions
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="UsersBalance" data-parameters="{'user_id': 10}">
 */
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

/*
 * UserFollowCard - Component
 * User info card with follow button
 *
 * Example:
 * m.component(c.UserFollowCard, {friend: friend})
 */

var UserFollowCard = {
  controller: function controller(args) {
    var friend = m$1.prop(args.friend);
    return {
      friend: friend
    };
  },
  view: function view(ctrl, args) {
    var friend = ctrl.friend(),
        profile_img = _$1.isEmpty(friend.avatar) ? '/assets/catarse_bootstrap/user.jpg' : friend.avatar;
    return m$1('.w-col.w-col-4', m$1('.card.card-backer.u-marginbottom-20.u-radius.u-text-center', [m$1('img.thumb.u-marginbottom-10.u-round[src=\'' + profile_img + '\']'), m$1('.fontsize-base.fontweight-semibold.lineheight-tight', m$1('a.link-hidden', { href: '/users/' + friend.friend_id }, friend.public_name || friend.name)), m$1('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', _$1.isNull(friend.city) ? '' : m$1('.fontsize-smaller.fontcolor-secondary.u-marginbottom-10', friend.city + ', ' + friend.state)), m$1('.fontsize-smaller', [m$1('span.fontweight-semibold', friend.total_contributed_projects), ' apoiados ', m$1.trust('&nbsp;'), '| ', m$1.trust('&nbsp;'), m$1('span.fontweight-semibold', friend.total_published_projects), ' criados']), m$1('.btn-bottom-card.w-row', [m$1('.w-col.w-col-3.w-col-small-4.w-col-tiny-3'), m$1('.w-col.w-col-6.w-col-small-4.w-col-tiny-6', m$1.component(UserFollowBtn, { following: friend.following, follow_id: friend.friend_id })), m$1('.w-col.w-col-3.w-col-small-4.w-col-tiny-3')])]));
  }
};

/**
 * window.c.userFriends component
 * Shows all friends cards and a follow-all button
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFriends, {user: user})
 *   ...
 * }
 */
var userFriends = {
    controller: function controller(args) {
        models.userFriend.pageSize(9);

        var userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            user = args.user,
            friendListVM = postgrest$1.paginationVM(models.userFriend, 'following.asc,total_contributed_projects.desc', {
            'Prefer': 'count=exact'
        }),
            allLoading = m$1.prop(false),
            followAll = function followAll() {
            allLoading(true);
            var l = postgrest$1.loaderWithToken(models.followAllFriends.postOptions({}));

            l.load().then(function () {
                friendListVM.firstPage(userFriendVM.parameters());
                allLoading(false);
            });
        };

        userFriendVM.user_id(user.user_id);

        if (!friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        return {
            friendListVM: friendListVM,
            followAll: followAll,
            allLoading: allLoading
        };
    },
    view: function view(ctrl, args) {
        var listVM = ctrl.friendListVM;
        return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1('.w-row.u-marginbottom-40.card.u-radius.card-terciary', [m$1('.w-col.w-col-7.w-col-small-6.w-col-tiny-6', [m$1('.fontsize-small', 'Comece agora! Siga todos os seus amigos ou somente alguns deles para descobrir projetos juntos!')]), m$1('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [ctrl.allLoading() ? h.loader() : m$1('a.w-button.btn.btn-medium', {
            onclick: ctrl.followAll
        }, 'Siga todos os seus ' + (listVM.total() ? listVM.total() : '') + ' amigos')])]), m$1('.w-row', [_$1.map(listVM.collection(), function (friend) {
            return m$1.component(UserFollowCard, { friend: friend });
        })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-5', [m$1('.u-marginright-20')]), m$1.component(loadMoreBtn, { collection: listVM }), m$1('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userFollows component
 * Shows all user follows cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFollows, {user: user})
 *   ...
 * }
 */
var userFollows = {
    controller: function controller(args) {
        models.userFollow.pageSize(9);
        var userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            user = args.user,
            hash = m$1.prop(window.location.hash),
            followsListVM = postgrest$1.paginationVM(models.userFollow, 'created_at.desc', {
            'Prefer': 'count=exact'
        });

        userFriendVM.user_id(user.user_id);
        if (!followsListVM.collection().length) {
            followsListVM.firstPage(userFriendVM.parameters());
        }

        return {
            followsListVM: followsListVM
        };
    },
    view: function view(ctrl, args) {
        var followsVM = ctrl.followsListVM;
        return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1('.w-row', [_$1.map(followsVM.collection(), function (friend) {
            return m$1.component(UserFollowCard, { friend: _$1.extend({}, { following: true, friend_id: friend.follow_id }, friend.source) });
        })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-5', [m$1('.u-marginright-20')]), m$1.component(loadMoreBtn, { collection: followsVM }), m$1('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userFollowers component
 * Shows all user followers cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFollowers, {user: user})
 *   ...
 * }
 */
var userFollowers = {
    controller: function controller(args) {
        models.userFollower.pageSize(9);
        var followersListVM = postgrest$1.paginationVM(models.userFollower, 'following.asc,created_at.desc', {
            'Prefer': 'count=exact'
        }),
            user = args.user,
            userIdVM = postgrest$1.filtersVM({ follow_id: 'eq' });

        userIdVM.follow_id(user.user_id);

        if (!followersListVM.collection().length) {
            followersListVM.firstPage(userIdVM.parameters());
        }
        return {
            followersListVM: followersListVM
        };
    },
    view: function view(ctrl, args) {
        var followersVM = ctrl.followersListVM;
        return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1('.w-row', [_$1.map(followersVM.collection(), function (friend) {
            return m$1.component(UserFollowCard, { friend: _$1.extend({}, { friend_id: friend.user_id }, friend.source) });
        })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-5', [m$1('.u-marginright-20')]), m$1.component(loadMoreBtn, { collection: followersVM }), m$1('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userCreators component
 * Shows all user creators suggestions cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userCreators, {user: user})
 *   ...
 * }
 */
var userCreators = {
    controller: function controller(args) {
        models.creatorSuggestion.pageSize(9);

        var creatorsListVM = postgrest$1.paginationVM(models.creatorSuggestion, 'following.asc, total_published_projects.desc, total_contributed_projects.desc', {
            'Prefer': 'count=exact'
        });

        if (!creatorsListVM.collection().length) {
            creatorsListVM.firstPage();
        }

        return {
            creatorsListVM: creatorsListVM
        };
    },
    view: function view(ctrl, args) {
        var creatorsVM = ctrl.creatorsListVM;

        return m$1('.w-section.bg-gray.before-footer.section', [m$1('.w-container', [m$1('.w-row', [_$1.map(creatorsVM.collection(), function (friend) {
            return m$1.component(UserFollowCard, {
                friend: _$1.extend({}, {
                    friend_id: friend.user_id
                }, friend)
            });
        })]), m$1('.w-section.section.bg-gray', [m$1('.w-container', [m$1('.w-row.u-marginbottom-60', [m$1('.w-col.w-col-5', [m$1('.u-marginright-20')]), m$1.component(loadMoreBtn, { collection: creatorsVM }), m$1('.w-col.w-col-5')])])])])]);
    }
};

var FollowFoundFriends = {
    controller: function controller(args) {
        var user = h.getUser(),
            hash = m$1.prop(window.location.hash),
            displayTabContent = function displayTabContent() {
            var c_opts = {
                user: user
            },
                tabs = {
                '#creators': m$1.component(userCreators, c_opts),
                '#friends': m$1.component(userFriends, c_opts),
                '#follows': m$1.component(userFollows, c_opts),
                '#followers': m$1.component(userFollowers, c_opts)
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                return tabs['#friends'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        return {
            user: user,
            displayTabContent: displayTabContent
        };
    },
    view: function view(ctrl, args) {
        return m$1('div', [m$1('.w-section.dashboard-header', [m$1('.w-container', [m$1('.w-row.u-margintop-20.u-marginbottom-20', [m$1('.w-col.w-col-1'), m$1('.w-col.w-col-10.u-text-center', [m$1('.fontsize-larger.fontweight-semibold.u-marginbottom-10', 'Descubra projetos com seus amigos'), m$1('.fontsize-small', 'Siga os seus amigos e nós iremos te notificar sempre que eles lançarem ou apoiarem algum projeto')]), m$1('.w-col.w-col-1')])])]), m$1('.divider.u-margintop-30'), m$1('.project-nav', m$1('.u-text-center.w-container', [m$1('a[id="creators-link"][class="dashboard-nav-link ' + (h.hashMatch('#creators') ? 'selected' : '') + '"] [href="#creators"]', 'Encontre realizadores'), m$1('a[id="friends-link"][class="dashboard-nav-link ' + (h.hashMatch('#friends') || h.hashMatch('') ? 'selected' : '') + '"] [href="#friends"]', 'Encontre amigos'), m$1('a[id="follows-link"][class="dashboard-nav-link ' + (h.hashMatch('#follows') ? 'selected' : '') + '"] [href="#follows"]', ['Seguindo', m$1.trust('&nbsp;'), m$1('span.w-hidden-small.w-hidden-tiny.badge', ctrl.user.follows_count)]), m$1('a[id="followers-link"][class="dashboard-nav-link ' + (h.hashMatch('#followers') ? 'selected' : '') + '"] [href="#followers"]', ['Seguidores', m$1.trust('&nbsp;'), m$1('span.w-hidden-small.w-hidden-tiny.badge', ctrl.user.followers_count)])])), ctrl.displayTabContent()]);
    }
};

var I18nScope$27 = _$1.partial(h.i18nScope, 'projects.contributions');

var thankYou = {
    controller: function controller(args) {
        var recommendedProjects = userVM.getUserRecommendedProjects(),
            isSlip = !_$1.isEmpty(args.contribution.slip_url);

        var setEvents = function setEvents(el, isInitialized) {
            if (!isInitialized) {
                CatarseAnalytics.event({
                    cat: 'contribution_finish',
                    act: 'contribution_finished',
                    lbl: isSlip ? 'slip' : 'creditcard',
                    val: args.contribution.value,
                    extraData: {
                        contribution_id: args.contribution.contribution_id
                    }
                });

                CatarseAnalytics.checkout('' + args.contribution.contribution_id, '[' + args.contribution.project.permalink + '] ' + args.contribution.reward.minimum_value + ' [' + (isSlip ? 'slip' : 'creditcard') + ']', '' + args.contribution.reward.reward_id, '' + args.contribution.project.category, '' + args.contribution.value, '' + args.contribution.value * args.contribution.project.service_fee);
            }
        };

        return {
            setEvents: setEvents,
            displayShareBox: h.toggleProp(false, true),
            isSlip: isSlip,
            recommendedProjects: recommendedProjects
        };
    },
    view: function view(ctrl, args) {
        return m$1('#thank-you', { config: ctrl.setEvents }, [m$1(".page-header.u-marginbottom-30", m$1(".w-container", m$1(".w-row", m$1(".w-col.w-col-10.w-col-push-1", [m$1(".u-marginbottom-20.u-text-center", m$1('img.big.thumb.u-round[src=\'' + args.contribution.project.user_thumb + '\']')), m$1("#thank-you.u-text-center", !ctrl.isSlip ? [m$1("#creditcard-thank-you.fontsize-larger.text-success.u-marginbottom-20", I18n$1.t('thank_you.thank_you', I18nScope$27())), m$1(".fontsize-base.u-marginbottom-40", m$1.trust(I18n$1.t('thank_you.thank_you_text_html', I18nScope$27({
            total: args.contribution.project.total_contributions,
            email: args.contribution.contribution_email,
            link2: '/pt/users/' + h.getUser().user_id + '/edit#contributions',
            link_email: '/pt/users/' + h.getUser().user_id + '/edit#about_me'
        })))), m$1(".fontsize-base.fontweight-semibold.u-marginbottom-20", "Compartilhe com seus amigos e ajude esse projeto a bater a meta!")] : [m$1('#slip-thank-you.fontsize-largest.text-success.u-marginbottom-20', I18n$1.t('thank_you_slip.thank_you', I18nScope$27())), m$1('.fontsize-base.u-marginbottom-40', m$1.trust(I18n$1.t('thank_you_slip.thank_you_text_html', I18nScope$27({
            email: args.contribution.contribution_email,
            link_email: '/pt/users/' + h.getUser().user_id + '/edit#about_me'
        }))))]), ctrl.isSlip ? '' : m$1(".w-row", [m$1(".w-hidden-small.w-hidden-tiny", [m$1('.w-sub-col.w-col.w-col-4', m$1.component(facebookButton, {
            url: 'https://www.catarse.me/' + args.contribution.project.permalink + '?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share',
            big: true
        })), m$1('.w-sub-col.w-col.w-col-4', m$1.component(facebookButton, {
            messenger: true,
            big: true,
            url: 'https://www.catarse.me/' + args.contribution.project.permalink + '?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=messenger&utm_campaign=thanks_share'
        })), m$1('.w-col.w-col-4', m$1('a.btn.btn-large.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=Acabei%20de%20apoiar%20o%20projeto%20' + args.contribution.project.name + '%20https://www.catarse.me/' + args.contribution.project.permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]', [m$1('span.fa.fa-twitter'), ' Twitter']))]), m$1(".w-hidden-main.w-hidden-medium", [m$1('.u-marginbottom-30.u-text-center-small-only', m$1('button.btn.btn-large.btn-terciary.u-marginbottom-40', {
            onclick: ctrl.displayShareBox.toggle
        }, 'Compartilhe')), ctrl.displayShareBox() ? m$1(projectShareBox, {
            // Mocking a project m.prop
            project: m$1.prop({
                permalink: args.contribution.project.permalink,
                name: args.contribution.project.name
            }),
            displayShareBox: ctrl.displayShareBox
        }) : ''])])])))), m$1(".section.u-marginbottom-40", m$1(".w-container", ctrl.isSlip ? m$1('.w-row', m$1('.w-col.w-col-8.w-col-offset-2', m$1('iframe.slip', {
            src: args.contribution.slip_url,
            width: '100%',
            height: '905px',
            frameborder: '0',
            style: 'overflow: hidden;'
        }))) : [m$1('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center', I18n$1.t('thank_you.project_recommendations', I18nScope$27())), m$1.component(projectRow, {
            collection: ctrl.recommendedProjects,
            ref: 'ctrse_thankyou_r'
        })]))]);
    }
};

var I18nScope$28 = _$1.partial(h.i18nScope, 'users.edit.email_confirmation');

var CheckEmail = {
    controller: function controller(args) {
        var userID = h.getUserID(),
            user = userVM.fetchUser(userID),
            confirmedEmail = m$1.prop(false),
            hideAlert = m$1.prop(false);

        return {
            confirmedEmail: confirmedEmail,
            hideAlert: hideAlert,
            user: user,
            checkEmail: function checkEmail() {
                return m$1.request({
                    method: 'PUT',
                    url: '/users/' + userID + '.json',
                    data: {
                        user: {
                            confirmed_email_at: true
                        }
                    },
                    config: h.setCsrfToken
                }).then(function (data) {
                    confirmedEmail(true);
                    window.setTimeout(function () {
                        hideAlert(true);
                        m$1.redraw(true);
                        console.log(data);
                    }, 4000);
                });
            }
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.user();
        if (user) {
            var userCreatedRecently = moment$1().isBefore(moment$1(user.created_at).add(2, 'days'));

            return user && !userCreatedRecently && !user.email_active && !ctrl.hideAlert() ? m$1('.card-alert.section.u-text-center', { style: args.menuTransparency ? { 'padding-top': '100px' } : {} }, [m$1('.w-container', ctrl.confirmedEmail() ? [m$1('.fontsize-large.fontweight-semibold', I18n$1.t('confirmed_title', I18nScope$28())), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n$1.t('confirmed_sub', I18nScope$28()))] : [m$1('.fontsize-large.fontweight-semibold', _$1.isNull(user.name) ? "Olá" : I18n$1.t('hello', I18nScope$28({ name: user.name }))), m$1('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n$1.t('hello_sub', I18nScope$28())), m$1('.fontsize-base.u-marginbottom-10', I18n$1.t('hello_email', I18nScope$28({ email: user.email }))), m$1('.w-row', [m$1('.w-col.w-col-3'), m$1('.w-col.w-col-3', [m$1('a.btn.btn-medium.btn-terciary.w-button[href="javacript:void(0);"]', {
                onclick: ctrl.checkEmail
            }, 'Sim!')]), m$1('.w-col.w-col-3', [m$1('a.btn.btn-medium.w-button[href="/users/' + user.id + '/edit#about_me"]', 'Editar o email')]), m$1('.w-col.w-col-3')])])]) : m$1('div');
        }

        return m$1('div');
    }
};

var projectEditUserAbout = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },
    view: function view(ctrl, args) {
        return m$1(userAboutEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            useFloatBtn: true,
            hideDisableAcc: true,
            hideCoverImg: true,
            hidePasswordChange: true
        });
    }
};

var c = {
    root: {
        AdminUsers: adminUsers,
        AdminContributions: adminContributions,
        Flex: Flex,
        Insights: insights,
        Posts: posts,
        Jobs: jobs,
        LiveStatistics: liveStatistics,
        ProjectsContributionReport: projectContributionReport,
        ProjectsDashboard: projectsDashboard,
        ProjectsExplore: projectsExplore,
        ProjectsHome: projectsHome,
        ProjectsShow: projectsShow,
        UsersShow: usersShow,
        UsersEdit: usersEdit,
        ProjectsPayment: projectsPayment,
        ProjectsReward: projectsReward,
        ThankYou: thankYou,
        Publish: publish,
        Start: start,
        Team: team,
        UsersBalance: userBalanceMain,
        Menu: menu,
        Footer: footer,
        FollowFoundFriends: FollowFoundFriends,
        CheckEmail: CheckEmail,
        projectEditUserAbout: projectEditUserAbout
    }
};

return c;

}(m,I18n,_,moment,$,postgrest,CatarseAnalytics,replaceDiacritics,Chart));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9