'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var hashMatch = function hashMatch(str) {
    return window.location.hash === str;
},
    paramByName = function paramByName(name) {
    var normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
        regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
},
    selfOrEmpty = function selfOrEmpty(obj) {
    var emptyState = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    return obj ? obj : emptyState;
},
    setMomentifyLocale = function setMomentifyLocale() {
    _moment2['default'].locale('pt', {
        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
    });
},
    existy = function existy(x) {
    return x != null;
},
    momentify = function momentify(date, format) {
    format = format || 'DD/MM/YYYY';
    return date ? (0, _moment2['default'])(date).locale('pt').format(format) : 'no date';
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
    return (0, _mithril2['default'])('');
},
    momentFromString = function momentFromString(date, format) {
    var european = (0, _moment2['default'])(date, format || 'DD/MM/YYYY');
    return european.isValid() ? european : (0, _moment2['default'])(date);
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
    var p = _mithril2['default'].prop(defaultState);
    p.toggle = function () {
        return p(p() === alternateState ? defaultState : alternateState);
    };

    return p;
},
    idVM = postgrest.filtersVM({
    id: 'eq'
}),
    getCurrentProject = function getCurrentProject() {
    var root = document.getElementById('project-show-root'),
        data = root.getAttribute('data-parameters');
    if (data) {
        return JSON.parse(data);
    } else {
        return false;
    }
},
    getRdToken = function getRdToken() {
    var meta = _.first(document.querySelectorAll('[name=rd-token]'));

    return meta ? meta.content : undefined;
},
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
    return (0, _mithril2['default'])('.u-text-center.u-margintop-30 u-marginbottom-30', [(0, _mithril2['default'])('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
},
    newFeatureBadge = function newFeatureBadge() {
    return (0, _mithril2['default'])('span.badge.badge-success.margin-side-5', _i18nJs2['default'].t('projects.new_feature_badge'));
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
    closeModal = function closeModal() {
    var el = document.getElementsByClassName('modal-close')[0];
    if (_.isElement(el)) {
        el.onclick = function (event) {
            event.preventDefault();

            document.getElementsByClassName('modal-backdrop')[0].style.display = 'none';
        };
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
    redrawHashChange = function redrawHashChange(before) {
    var callback = _.isFunction(before) ? function () {
        before();
        _mithril2['default'].redraw();
    } : _mithril2['default'].redraw;

    window.addEventListener('hashchange', callback, false);
},
    authenticityToken = function authenticityToken() {
    var meta = _.first(document.querySelectorAll('[name=csrf-token]'));
    return meta ? meta.content : undefined;
},
    animateScrollTo = function animateScrollTo(el) {
    var scrolled = window.scrollY;

    var offset = cumulativeOffset(el).top,
        duration = 300,
        dFrame = (offset - scrolled) / duration,

    //EaseInOutCubic easing function. We'll abstract all animation funs later.
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
},
    scrollTo = function scrollTo() {
    var setTrigger = function setTrigger(el, anchorId) {
        el.onclick = function () {
            var anchorEl = document.getElementById(anchorId);

            if (_.isElement(anchorEl)) {
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
},
    RDTracker = function RDTracker(eventId) {
    return function (el, isInitialized) {
        if (!isInitialized) {
            var integrationScript = document.createElement('script');
            integrationScript.type = 'text/javascript';
            integrationScript.id = 'RDIntegration';

            if (!document.getElementById(integrationScript.id)) {
                document.body.appendChild(integrationScript);
                integrationScript.onload = function () {
                    return RdIntegration.integrate(getRdToken(), eventId);
                };
                integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
            }

            return false;
        }
    };
};

setMomentifyLocale();
closeFlash();
closeModal();

exports['default'] = {
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
    storeAction: storeAction,
    callStoredAction: callStoredAction,
    UIHelper: UIHelper,
    toAnchor: toAnchor,
    paramByName: paramByName,
    i18nScope: i18nScope,
    RDTracker: RDTracker,
    selfOrEmpty: selfOrEmpty,
    scrollTo: scrollTo
};
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var models = {
    contributionDetail: postgrest.model('contribution_details'),
    contributionActivity: postgrest.model('contribution_activities'),
    projectDetail: postgrest.model('project_details'),
    userDetail: postgrest.model('user_details'),
    balance: postgrest.model('balances'),
    balanceTransaction: postgrest.model('balance_transactions'),
    balanceTransfer: postgrest.model('balance_transfers'),
    user: postgrest.model('users'),
    bankAccount: postgrest.model('bank_accounts'),
    rewardDetail: postgrest.model('reward_details'),
    projectReminder: postgrest.model('project_reminders'),
    contributions: postgrest.model('contributions'),
    directMessage: postgrest.model('direct_messages'),
    teamTotal: postgrest.model('team_totals'),
    projectAccount: postgrest.model('project_accounts'),
    projectContribution: postgrest.model('project_contributions'),
    projectPostDetail: postgrest.model('project_posts_details'),
    projectContributionsPerDay: postgrest.model('project_contributions_per_day'),
    projectContributionsPerLocation: postgrest.model('project_contributions_per_location'),
    projectContributionsPerRef: postgrest.model('project_contributions_per_ref'),
    project: postgrest.model('projects'),
    projectSearch: postgrest.model('rpc/project_search'),
    category: postgrest.model('categories'),
    categoryTotals: postgrest.model('category_totals'),
    categoryFollower: postgrest.model('category_followers'),
    teamMember: postgrest.model('team_members'),
    notification: postgrest.model('notifications'),
    statistic: postgrest.model('statistics'),
    successfulProject: postgrest.model('successful_projects')
};

models.teamMember.pageSize(40);
models.rewardDetail.pageSize(false);
models.project.pageSize(30);
models.category.pageSize(50);
models.contributionActivity.pageSize(40);
models.successfulProject.pageSize(9);

exports['default'] = models;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _mithrilPostgrest = require('mithril-postgrest');

var _mithrilPostgrest2 = _interopRequireDefault(_mithrilPostgrest);

var _h = require('../h');

var _h2 = _interopRequireDefault(_h);

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

var _cLandingSignup = require('../c/landing-signup');

var _cLandingSignup2 = _interopRequireDefault(_cLandingSignup);

var _cProjectRow = require('../c/project-row');

var _cProjectRow2 = _interopRequireDefault(_cProjectRow);

var _cLandingQa = require('../c/landing-qa');

var _cLandingQa2 = _interopRequireDefault(_cLandingQa);

var Flex = {
    controller: function controller() {
        var stats = _mithril2['default'].prop([]),
            projects = _mithril2['default'].prop([]),
            l = _mithril2['default'].prop(),
            sample3 = _.partial(_.sample, _, 3),
            builder = {
            customAction: 'http://fazum.catarse.me/obrigado-landing-catarse-flex'
        },
            addDisqus = function addDisqus(el, isInitialized) {
            if (!isInitialized) {
                _h2['default'].discuss('https://catarse.me/flex', 'flex_page');
            }
        },
            flexVM = _mithrilPostgrest2['default'].filtersVM({
            mode: 'eq',
            state: 'eq',
            recommended: 'eq'
        }),
            statsLoader = _mithrilPostgrest2['default'].loaderWithToken(_models2['default'].statistic.getRowOptions());

        flexVM.mode('flex').state('online').recommended(true);

        var projectsLoader = _mithrilPostgrest2['default'].loader(_models2['default'].project.getPageOptions(flexVM.parameters()));

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

        return [(0, _mithril2['default'])('.w-section.hero-full.hero-zelo', [(0, _mithril2['default'])('.w-container.u-text-center', [(0, _mithril2['default'])('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding! Cadastre seu email e saiba como inscrever o seu projeto no flex!')]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2'), _mithril2['default'].component(_cLandingSignup2['default'], {
            builder: ctrl.builder
        }), (0, _mithril2['default'])('.w-col.w-col-2')])])]), [(0, _mithril2['default'])('.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), (0, _mithril2['default'])('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('.w-row.u-marginbottom-60', [(0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center.u-marginbottom-20', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), (0, _mithril2['default'])('.fontsize-largest.lineheight-loose', 'Causas')]), (0, _mithril2['default'])('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistenciais, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center.u-marginbottom-20', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), (0, _mithril2['default'])('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), (0, _mithril2['default'])('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), (0, _mithril2['default'])('.w-section.section.bg-greenlime.fontcolor-negative', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), (0, _mithril2['default'])('.w-row.u-marginbottom-40', [(0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), (0, _mithril2['default'])('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), (0, _mithril2['default'])('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), (0, _mithril2['default'])('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), (0, _mithril2['default'])('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), (0, _mithril2['default'])('.w-row.u-marginbottom-40', [(0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), (0, _mithril2['default'])('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), (0, _mithril2['default'])('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), (0, _mithril2['default'])('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), (0, _mithril2['default'])('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? _h2['default'].loader() : _mithril2['default'].component(_cProjectRow2['default'], { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), (0, _mithril2['default'])('.w-section.divider'), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), (0, _mithril2['default'])('.w-row.u-marginbottom-60', [(0, _mithril2['default'])('.w-col.w-col-6', [_mithril2['default'].component(_cLandingQa2['default'], {
            question: 'Quais são as taxas da modalidade flexível? ',
            answer: 'Como no Catarse, enviar um projeto não custa nada! A taxa cobrada no serviço Catarse flex é de 13% sobre o valor arrecadado.'
        }), _mithril2['default'].component(_cLandingQa2['default'], {
            question: 'De onde vem o dinheiro do meu projeto?',
            answer: 'Família, amigos, fãs e membros de comunidades que você faz parte são seus maiores colaboradores. São eles que irão divulgar sua campanha para as pessoas que eles conhecem, e assim o círculo de apoiadores vai aumentando e a sua campanha ganha força.'
        }), _mithril2['default'].component(_cLandingQa2['default'], {
            question: 'Qual a diferença entre o flexível e o "tudo ou nada"?',
            answer: 'Atualmente o Catarse utiliza apenas o modelo "tudo ou nada", onde você só fica com o dinheiro se bater a meta de arrecadação dentro do prazo da campanha. O modelo flexível é diferente pois permite que o realizador fique com o que arrecadar, independente de atingir ou não a meta do projeto no prazo da campanha. Não haverá limite de tempo para as campanhas. Nosso sistema flexível será algo novo em relação aos modelos que existem atualmente no mercado.'
        })]), (0, _mithril2['default'])('.w-col.w-col-6', [_mithril2['default'].component(_cLandingQa2['default'], {
            question: 'Posso inscrever projetos para a modalidade flexível já?',
            answer: 'Sim. Cadastre seu email e saiba como inscrever o seu projeto no flex!'
        }), _mithril2['default'].component(_cLandingQa2['default'], {
            question: 'Por quê vocês querem fazer o Catarse flex?',
            answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O Catarse flex é mais um passo nessa direção.'
        }), _mithril2['default'].component(_cLandingQa2['default'], {
            question: 'Quando vocês irão lançar o Catarse flex?',
            answer: 'Ainda não sabemos quando abriremos o flex para o público em geral, mas você pode cadastrar seu email nessa página e receber um material especial de como inscrever seu projeto.'
        })])])])]), (0, _mithril2['default'])('.w-section.section-large.u-text-center.bg-purple', [(0, _mithril2['default'])('.w-container.fontcolor-negative', [(0, _mithril2['default'])('.fontsize-largest', 'Inscreva seu projeto!'), (0, _mithril2['default'])('.fontsize-base.u-marginbottom-60', 'Cadastre seu email e saiba como inscrever o seu projeto no flex!'), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2'), _mithril2['default'].component(_cLandingSignup2['default'], {
            builder: ctrl.builder
        }), (0, _mithril2['default'])('.w-col.w-col-2')])])]), (0, _mithril2['default'])('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [(0, _mithril2['default'])('.w-container.u-text-center', [(0, _mithril2['default'])('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'O flex é um experimento e iniciativa do Catarse, maior plataforma de crowdfunding do Brasil.'), (0, _mithril2['default'])('.w-row.u-text-center', ctrl.statsLoader() ? _h2['default'].loader() : [(0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontsize-jumbo.text-success.lineheight-loose', _h2['default'].formatNumber(stats.total_contributors, 0, 3)), (0, _mithril2['default'])('p.start-stats.fontsize-base.fontcolor-negative', 'Pessoas ja apoiaram pelo menos 01 projeto no Catarse')]), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontsize-jumbo.text-success.lineheight-loose', _h2['default'].formatNumber(stats.total_projects_success, 0, 3)), (0, _mithril2['default'])('p.start-stats.fontsize-base.fontcolor-negative', 'Projetos ja foram financiados no Catarse')]), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), (0, _mithril2['default'])('p.start-stats.fontsize-base.fontcolor-negative', 'Foram investidos em ideias publicadas no Catarse')])])])]), (0, _mithril2['default'])('.w-section.section.bg-blue-one.fontcolor-negative', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.fontsize-large.u-text-center.u-marginbottom-20', 'Recomende o Catarse flex para amigos! '), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2'), (0, _mithril2['default'])('.w-col.w-col-8', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), (0, _mithril2['default'])('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Conheça o novo Catarse Flex!') + '"][target="_blank"]', 'Compartilhar')])]), (0, _mithril2['default'])('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), (0, _mithril2['default'])('a.w-button.btn.btn-large.btn-tweet[href="http://twitter.com/?status=' + encodeURIComponent('Vamos construir uma nova modalidade de crowdfunding para o Catarse! Junte-se a nós, inscreva seu email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'Tuitar')])])])]), (0, _mithril2['default'])('.w-col.w-col-2')])])]), (0, _mithril2['default'])('.w-section.section-large.bg-greenlime', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('#participe-do-debate.u-text-center', { config: _h2['default'].toAnchor() }, [(0, _mithril2['default'])('h1.fontsize-largest.fontcolor-negative', 'Construa o flex conosco'), (0, _mithril2['default'])('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Inicie uma conversa, pergunte, comente, critique e faça sugestões!')]), (0, _mithril2['default'])('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
            config: ctrl.addDisqus
        })])])]];
    }
};

exports['default'] = Flex;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _mithrilPostgres = require('mithril-postgres');

var _mithrilPostgres2 = _interopRequireDefault(_mithrilPostgres);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _insightsVm = require('insights-vm');

var _insightsVm2 = _interopRequireDefault(_insightsVm);

var _tooltip = require('tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _projectDashboardMenu = require('project-dashboard-menu');

var _projectDashboardMenu2 = _interopRequireDefault(_projectDashboardMenu);

var _modalBox = require('modal-box');

var _modalBox2 = _interopRequireDefault(_modalBox);

var _adminProjectDetailsCard = require('admin-project-details-card');

var _adminProjectDetailsCard2 = _interopRequireDefault(_adminProjectDetailsCard);

var _projectDataChart = require('project-data-chart');

var _projectDataChart2 = _interopRequireDefault(_projectDataChart);

var _projectDataTable = require('project-data-table');

var _projectDataTable2 = _interopRequireDefault(_projectDataTable);

var _projectReminderCount = require('project-reminder-count');

var _projectReminderCount2 = _interopRequireDefault(_projectReminderCount);

var I18nScope = _underscore2['default'].partial(_h2['default'].i18nScope, 'projects.insights');

var insights = {
    controller: function controller(args) {
        var filtersVM = _mithrilPostgres2['default'].filtersVM({
            project_id: 'eq'
        }),
            displayModal = _h2['default'].toggleProp(false, true),
            insightsVM = insightsVM,
            projectDetails = _mithril2['default'].prop([]),
            contributionsPerDay = _mithril2['default'].prop([]),
            contributionsPerLocation = _mithril2['default'].prop([]),
            loader = _mithrilPostgres2['default'].loaderWithToken;

        if (_h2['default'].paramByName('online_success') === 'true') {
            displayModal.toggle();
        }

        filtersVM.project_id(args.root.getAttribute('data-id'));

        var l = loader(_models2['default'].projectDetail.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);

        var lContributionsPerDay = loader(_models2['default'].projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
        lContributionsPerDay.load().then(contributionsPerDay);

        var contributionsPerLocationTable = [['Estado', 'Apoios', 'R$ apoiados (% do total)']];
        var buildPerLocationTable = function buildPerLocationTable(contributions) {
            return !_underscore2['default'].isEmpty(contributions) ? _underscore2['default'].map(_underscore2['default'].first(contributions).source, function (contribution) {
                var column = [];

                column.push(contribution.state_acronym || 'Outro/other');
                column.push(contribution.total_contributions);
                column.push([contribution.total_contributed, [//Adding row with custom comparator => read project-data-table description
                (0, _mithril2['default'])('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', _h2['default'].formatNumber(contribution.total_contributed, 2, 3), (0, _mithril2['default'])('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        var lContributionsPerLocation = loader(_models2['default'].projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        var contributionsPerRefTable = [[_i18nJs2['default'].t('ref_table.header.origin', I18nScope()), _i18nJs2['default'].t('ref_table.header.contributions', I18nScope()), _i18nJs2['default'].t('ref_table.header.amount', I18nScope())]];
        var buildPerRefTable = function buildPerRefTable(contributions) {
            return !_underscore2['default'].isEmpty(contributions) ? _underscore2['default'].map(_underscore2['default'].first(contributions).source, function (contribution) {
                //Test if the string matches a word starting with ctrse_ and followed by any non-digit group of characters
                //This allows to remove any versioned referral (i.e.: ctrse_newsletter_123) while still getting ctrse_test_ref
                var re = /(ctrse_[\D]*)/,
                    test = re.exec(contribution.referral_link);

                var column = [];

                if (test) {
                    //Removes last underscore if it exists
                    contribution.referral_link = test[0].substr(-1) === '_' ? test[0].substr(0, test[0].length - 1) : test[0];
                }

                column.push(contribution.referral_link ? _i18nJs2['default'].t('referral.' + contribution.referral_link, I18nScope({ defaultValue: contribution.referral_link })) : _i18nJs2['default'].t('referral.others', I18nScope()));
                column.push(contribution.total);
                column.push([contribution.total_amount, [(0, _mithril2['default'])('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'R$ ', _h2['default'].formatNumber(contribution.total_amount, 2, 3), (0, _mithril2['default'])('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerRefTable.push(column);
            }) : [];
        };

        var lContributionsPerRef = loader(_models2['default'].projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
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
        var project = _underscore2['default'].first(ctrl.projectDetails()),
            successModalC = ['OnlineSucessModalContent'],
            tooltip = function tooltip(el) {
            return _mithril2['default'].component(tooltip, {
                el: el,
                text: ['Informa de onde vieram os apoios de seu projeto. Saiba como usar essa tabela e planejar melhor suas ações de comunicação ', (0, _mithril2['default'])('a[href="' + _i18nJs2['default'].t('ref_table.help_url', I18nScope()) + '"][target=\'_blank\']', 'aqui.')],
                width: 380
            });
        };

        project.user.name = project.user.name || 'Realizador';

        return (0, _mithril2['default'])('.project-insights', !ctrl.l() ? [project.is_owner_or_admin ? _mithril2['default'].component(_projectDashboardMenu2['default'], {
            project: _mithril2['default'].prop(project)
        }) : '', ctrl.displayModal() ? _mithril2['default'].component(_modalBox2['default'], {
            displayModal: ctrl.displayModal,
            content: successModalC
        }) : '', (0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row.u-marginbottom-40', [(0, _mithril2['default'])('.w-col.w-col-2'), (0, _mithril2['default'])('.w-col.w-col-8.dashboard-header.u-text-center', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', _i18nJs2['default'].t('campaign_title', I18nScope())), _mithril2['default'].component(_adminProjectDetailsCard2['default'], {
            resource: project
        }), (0, _mithril2['default'])('p.' + project.state + '-project-text.fontsize-small.lineheight-loose', [project.mode === 'flex' && _underscore2['default'].isNull(project.expires_at) && project.state !== 'draft' ? (0, _mithril2['default'])('span', [_i18nJs2['default'].t('finish_explanation', I18nScope()), (0, _mithril2['default'])('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', _i18nJs2['default'].t('know_more', I18nScope()))]) : _mithril2['default'].trust(_i18nJs2['default'].t('campaign.' + project.mode + '.' + project.state, I18nScope({ username: project.user.name, expires_at: _h2['default'].momentify(project.zone_expires_at), sent_to_analysis_at: _h2['default'].momentify(project.sent_to_analysis_at) })))])]), (0, _mithril2['default'])('.w-col.w-col-2')])]), project.is_published ? [(0, _mithril2['default'])('.divider'), (0, _mithril2['default'])('.w-section.section-one-column.section.bg-gray.before-footer', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? _mithril2['default'].component(_projectDataChart2['default'], {
            collection: ctrl.contributionsPerDay,
            label: _i18nJs2['default'].t('amount_per_day_label', I18nScope()),
            dataKey: 'total_amount',
            xAxis: function xAxis(item) {
                return _h2['default'].momentify(item.paid_at);
            }
        }) : _h2['default'].loader()])]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? _mithril2['default'].component(_projectDataChart2['default'], {
            collection: ctrl.contributionsPerDay,
            label: _i18nJs2['default'].t('contributions_per_day_label', I18nScope()),
            dataKey: 'total',
            xAxis: function xAxis(item) {
                return _h2['default'].momentify(item.paid_at);
            }
        }) : _h2['default'].loader()])]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.u-text-center', [(0, _mithril2['default'])('.project-contributions-per-ref', [(0, _mithril2['default'])('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [_i18nJs2['default'].t('ref_origin_title', I18nScope()), _h2['default'].newFeatureBadge(), tooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? _mithril2['default'].component(_projectDataTable2['default'], {
            table: ctrl.contributionsPerRefTable,
            defaultSortIndex: -2
        }) : _h2['default'].loader()])])]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.u-text-center', [(0, _mithril2['default'])('.project-contributions-per-ref', [(0, _mithril2['default'])('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', _i18nJs2['default'].t('location_origin_title', I18nScope())), !ctrl.lContributionsPerLocation() ? _mithril2['default'].component(_projectDataTable2['default'], {
            table: ctrl.contributionsPerLocationTable,
            defaultSortIndex: -2
        }) : _h2['default'].loader()])])]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.u-text-center', [_mithril2['default'].component(_projectReminderCount2['default'], {
            resource: project
        })])])])])] : ''] : _h2['default'].loader());
    }
};

exports['default'] = insights;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var I18nScope = _.partial(h.i18nScope, 'pages.jobs');

var jobs = {
    view: function view(ctrl, args) {
        return [(0, _mithril2['default'])('.w-section.hero-jobs.hero-medium', [(0, _mithril2['default'])('.w-containe.u-text-center', [(0, _mithril2['default'])('img.icon-hero[src="/assets/logo-white.png"]'), (0, _mithril2['default'])('.u-text-center.u-marginbottom-20.fontsize-largest', _i18nJs2['default'].t('title', I18nScope()))])]), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container.u-margintop-40', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-8.w-col-push-2.u-text-center', [(0, _mithril2['default'])('.fontsize-large.u-marginbottom-30', _i18nJs2['default'].t('info', I18nScope())), (0, _mithril2['default'])('a[href="/projects/new"].w-button.btn.btn-large.btn-inline', _i18nJs2['default'].t('cta', I18nScope()))])])])])];
    }
};

exports['default'] = jobs;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var liveStatistics = {
    controller: function controller() {
        var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var pageStatistics = _mithril2['default'].prop([]),
            notificationData = _mithril2['default'].prop({});

        _models2['default'].statistic.getRow().then(pageStatistics);
        // args.socket is a socket provided by socket.io
        // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
        if (args.socket && _underscore2['default'].isFunction(args.socket.on)) {
            args.socket.on('new_paid_contributions', function (msg) {
                notificationData(JSON.parse(msg.payload));
                _models2['default'].statistic.getRow().then(pageStatistics);
                _mithril2['default'].redraw();
            });
        }

        return {
            pageStatistics: pageStatistics,
            notificationData: notificationData
        };
    },
    view: function view(ctrl) {
        var data = ctrl.notificationData();

        return (0, _mithril2['default'])('.w-section.bg-stats.section.min-height-100', [(0, _mithril2['default'])('.w-container.u-text-center', _underscore2['default'].map(ctrl.pageStatistics(), function (stat) {
            return [(0, _mithril2['default'])('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), (0, _mithril2['default'])('.fontcolor-negative.u-marginbottom-40', [(0, _mithril2['default'])('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + _h2['default'].formatNumber(stat.total_contributed, 2, 3)), (0, _mithril2['default'])('.fontsize-large', 'Doados para projetos publicados por aqui')]), (0, _mithril2['default'])('.fontcolor-negative.u-marginbottom-60', [(0, _mithril2['default'])('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), (0, _mithril2['default'])('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
        })), !_underscore2['default'].isEmpty(data) ? (0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('.card.u-radius.u-marginbottom-60.medium', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4', [(0, _mithril2['default'])('img.thumb.u-round[src="' + _h2['default'].useAvatarOrDefault(data.user_image) + '"]')]), (0, _mithril2['default'])('.w-col.w-col-8.w-col-small-8', [(0, _mithril2['default'])('.fontsize-large.lineheight-tight', data.user_name)])])]), (0, _mithril2['default'])('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [(0, _mithril2['default'])('div', 'acabou de apoiar o')]), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4', [(0, _mithril2['default'])('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), (0, _mithril2['default'])('.w-col.w-col-8.w-col-small-8', [(0, _mithril2['default'])('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', (0, _mithril2['default'])('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [(0, _mithril2['default'])('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [(0, _mithril2['default'])('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
    }
};

exports['default'] = liveStatistics;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _mithrilPostgrest = require('mithril-postgrest');

var _mithrilPostgrest2 = _interopRequireDefault(_mithrilPostgrest);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectDashboardMenu = require('project-dashboard-menu');

var _projectDashboardMenu2 = _interopRequireDefault(_projectDashboardMenu);

var _projectContributionReportHeader = require('project-contribution-report-header');

var _projectContributionReportHeader2 = _interopRequireDefault(_projectContributionReportHeader);

var _projectContributionReportContent = require('project-contribution-report-content');

var _projectContributionReportContent2 = _interopRequireDefault(_projectContributionReportContent);

var _projectsContributionReportVm = require('projects-contribution-report-vm');

var _projectsContributionReportVm2 = _interopRequireDefault(_projectsContributionReportVm);

var projectContributionReport = {
    controller: function controller(args) {
        var listVM = _mithrilPostgrest2['default'].paginationVM(_models2['default'].projectContribution, 'id.desc', { 'Prefer': 'count=exact' }),
            filterVM = _projectsContributionReportVm2['default'],
            project = _mithril2['default'].prop({}),
            rewards = _mithril2['default'].prop([]),
            filterBuilder = [{
            component: 'FilterMain',
            data: {
                inputWrapperClass: '.w-input.text-field',
                btnClass: '.btn.btn-medium',
                vm: filterVM.full_text_index,
                placeholder: 'Busque por nome ou email do apoiador'
            }
        }, {
            label: 'reward_filter',
            component: 'FilterDropdown',
            data: {
                label: 'Recompensa',
                name: 'reward_id',
                vm: filterVM.reward_id,
                wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                options: []
            }
        }, {
            label: 'payment_state',
            component: 'FilterDropdown',
            data: {
                label: 'Status do apoio',
                name: 'state',
                vm: filterVM.state,
                wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                options: [{
                    value: '',
                    option: 'Todos'
                }, {
                    value: 'paid',
                    option: 'Pago'
                }, {
                    value: 'refused',
                    option: 'Cancelado'
                }, {
                    value: 'pending',
                    option: 'Pendente'
                }, {
                    value: 'pending_refund',
                    option: 'Reembolso pendente'
                }, {
                    value: 'refunded',
                    option: 'Reembolsado'
                }, {
                    value: 'chargeback',
                    option: 'Contestado'
                }]
            }
        }],
            submit = function submit() {
            listVM.firstPage(filterVM.parameters()).then(null);
            return false;
        };

        filterVM.project_id(args.root.getAttribute('data-id'));

        var lReward = _mithrilPostgrest2['default'].loaderWithToken(_models2['default'].rewardDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));
        var lProject = _mithrilPostgrest2['default'].loaderWithToken(_models2['default'].projectDetail.getPageOptions({ project_id: 'eq.' + filterVM.project_id() }));

        lReward.load().then(rewards);
        lProject.load().then(project);

        var mapRewardsToOptions = function mapRewardsToOptions() {
            var options = [];
            if (!lReward()) {
                options = _underscore2['default'].map(rewards(), function (r) {
                    return {
                        value: r.id,
                        option: 'R$ ' + _h2['default'].formatNumber(r.minimum_value, 2, 3) + ' - ' + r.description.substring(0, 20)
                    };
                });
            }

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
            rewards: rewards,
            project: project,
            mapRewardsToOptions: mapRewardsToOptions
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.listVM;

        return [_mithril2['default'].component(_projectDashboardMenu2['default'], { project: _mithril2['default'].prop(_underscore2['default'].first(ctrl.project())) }), _mithril2['default'].component(_projectContributionReportHeader2['default'], {
            submit: ctrl.submit,
            filterBuilder: ctrl.filterBuilder,
            form: ctrl.filterVM.formDescriber,
            mapRewardsToOptions: ctrl.mapRewardsToOptions,
            filterVM: ctrl.filterVM
        }), (0, _mithril2['default'])('.divider.u-margintop-30'), _mithril2['default'].component(_projectContributionReportContent2['default'], {
            list: list
        })];
    }
};

exports['default'] = projectContributionReport;
module.exports = exports['default'];
/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectVm = require('project-vm');

var _projectVm2 = _interopRequireDefault(_projectVm);

var _projectDashboardMenu = require('project-dashboard-menu');

var _projectDashboardMenu2 = _interopRequireDefault(_projectDashboardMenu);

var projectsDashboard = {
    controller: function controller(args) {
        return (0, _projectVm2['default'])(args.project_id, args.project_user_id);
    },
    view: function view(ctrl) {
        var project = ctrl.projectDetails;
        return project().is_owner_or_admin ? _mithril2['default'].component(_projectDashboardMenu2['default'], { project: project }) : '';
    }
};

exports['default'] = projectsDashboard;
module.exports = exports['default'];
/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _mithrilPostgrest = require('mithril-postgrest');

var _mithrilPostgrest2 = _interopRequireDefault(_mithrilPostgrest);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _projectFiltersVm = require('project-filters-vm');

var _projectFiltersVm2 = _interopRequireDefault(_projectFiltersVm);

var _search = require('search');

var _search2 = _interopRequireDefault(_search);

var _categoryButton = require('category-button');

var _categoryButton2 = _interopRequireDefault(_categoryButton);

var _projectCard = require('project-card');

var _projectCard2 = _interopRequireDefault(_projectCard);

var projectsExplore = {
    controller: function controller() {
        var filters = _mithrilPostgrest2['default'].filtersVM,
            projectFilters = projectFilters(),
            filtersMap = projectFilters.filters,
            defaultFilter = _h2['default'].paramByName('filter') || 'score',
            fallbackFilter = 'all',
            currentFilter = _mithril2['default'].prop(filtersMap[defaultFilter]),
            changeFilter = function changeFilter(newFilter) {
            currentFilter(filtersMap[newFilter]);
            loadRoute();
        },
            resetContextFilter = function resetContextFilter() {
            currentFilter(filtersMap[defaultFilter]);
            projectFilters.setContextFilters(['score', 'finished', 'all']);
        },
            isSearch = _mithril2['default'].prop(false),
            categoryCollection = _mithril2['default'].prop([]),
            categoryId = _mithril2['default'].prop(),
            findCategory = function findCategory(id) {
            return _underscore2['default'].find(categoryCollection(), function (c) {
                return id === parseInt(id);
            });
        },
            category = _underscore2['default'].compose(findCategory, categoryId),
            loadCategories = function loadCategories() {
            return _models2['default'].category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection);
        },

        // Fake projects object to be able to render page while loadding (in case of search)
        projects = _mithril2['default'].prop({ collection: _mithril2['default'].prop([]), isLoading: function isLoading() {
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
                search = _h2['default'].paramByName('pg_search'),
                searchProjects = function searchProjects() {
                var l = _mithrilPostgrest2['default'].loaderWithToken(_models2['default'].projectSearch.postOptions({ query: search })),
                    page = { // We build an object with the same interface as paginationVM
                    collection: _mithril2['default'].prop([]),
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
                var pages = _mithrilPostgrest2['default'].paginationVM(_models2['default'].project);
                var parameters = _underscore2['default'].extend({}, currentFilter().filter.parameters(), filter.filter.order({
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
                var pages = _mithrilPostgrest2['default'].paginationVM(_models2['default'].finishedProject),
                    parameters = _underscore2['default'].extend({}, currentFilter().filter.parameters(), filter.filter.order({
                    state_order: 'asc',
                    state: 'desc',
                    pledged: 'desc'
                }).parameters());
                pages.firstPage(parameters);

                return pages;
            };

            if (_underscore2['default'].isString(search) && search.length > 0 && route === null) {
                isSearch(true);
                title('Busca ' + search);
                projects(searchProjects());
            } else if (currentFilter().keyName === 'finished') {
                isSearch(false);
                projects(loadFinishedProjects());
            } else {
                isSearch(false);
                title(filter.title);
                if (!_underscore2['default'].isNull(route) && route[1] == 'finished') {
                    projects(loadFinishedProjects());
                } else {
                    projects(loadProjects());
                }
            }
            categoryId(cat && cat.id);
            route || _underscore2['default'].isString(search) && search.length > 0 ? toggleCategories(false) : toggleCategories(true);
        },
            title = _mithril2['default'].prop(),
            toggleCategories = _h2['default'].toggleProp(false, true);

        window.addEventListener('hashchange', function () {
            resetContextFilter();
            loadRoute();
            _mithril2['default'].redraw();
        }, false);

        // Initial loads
        resetContextFilter();
        _models2['default'].project.pageSize(9);
        loadCategories().then(loadRoute);

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
            filtersMap: filtersMap,
            currentFilter: currentFilter,
            projectFilters: projectFilters,
            toggleCategories: toggleCategories,
            isSearch: isSearch
        };
    },
    view: function view(ctrl, args) {
        if (!ctrl.projects().isLoading() && _underscore2['default'].isEmpty(ctrl.projects().collection()) && !ctrl.isSearch()) {
            ctrl.projectFilters.removeContextFilter(ctrl.currentFilter());
            ctrl.changeFilter(ctrl.fallbackFilter);
        }

        return [(0, _mithril2['default'])('.w-section.hero-search', [_mithril2['default'].component(_search2['default']), (0, _mithril2['default'])('.w-container.u-marginbottom-10', [(0, _mithril2['default'])('.u-text-center.u-marginbottom-40', [(0, _mithril2['default'])('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                return ctrl.toggleCategories.toggle();
            } }, ['Explore projetos incríveis ', (0, _mithril2['default'])('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), (0, _mithril2['default'])('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [(0, _mithril2['default'])('.w-row.u-marginbottom-30', [_underscore2['default'].map(ctrl.categories(), function (category) {
            return _mithril2['default'].component(_categoryButton2['default'], { category: category });
        })])])])]), (0, _mithril2['default'])('.w-section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [(0, _mithril2['default'])('.fontsize-larger', ctrl.title())]), (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? (0, _mithril2['default'])('select.w-select.text-field.positive', { onchange: _mithril2['default'].withAttr('value', ctrl.changeFilter) }, _underscore2['default'].map(ctrl.projectFilters.getContextFilters(), function (pageFilter, idx) {
            var projects = ctrl.projects(),
                isSelected = ctrl.currentFilter() == pageFilter;

            return (0, _mithril2['default'])('option[value="' + pageFilter.keyName + '"]', { selected: isSelected }, pageFilter.nicename);
        })) : '')])])]), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-row', _underscore2['default'].map(ctrl.projects().collection(), function (project, idx) {
            var cardType = 'small',
                ref = 'ctrse_explore';

            if (ctrl.currentFilter().keyName === 'score' && !ctrl.isSearch()) {
                if (idx === 0) {
                    cardType = 'big';
                    ref = 'ctrse_explore_featured_big';
                } else if (idx === 1 || idx === 2) {
                    cardType = 'medium';
                    ref = 'ctrse_explore_featured_medium';
                } else {
                    ref = 'ctrse_explore_featured';
                }
            }

            return _mithril2['default'].component(_projectCard2['default'], { project: project, ref: ref, type: cardType });
        })), ctrl.projects().isLoading() ? _h2['default'].loader() : _underscore2['default'].isEmpty(ctrl.projects().collection()) ? (0, _mithril2['default'])('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : ''])])]), (0, _mithril2['default'])('.w-section.u-marginbottom-80', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _underscore2['default'].isEmpty(ctrl.projects().collection()) ? '' : (0, _mithril2['default'])('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                ctrl.projects().nextPage();return false;
            } }, 'Carregar mais')])])])]), (0, _mithril2['default'])('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [(0, _mithril2['default'])('.w-container.u-text-center', [(0, _mithril2['default'])('img.u-marginbottom-20.icon-hero', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png' }), (0, _mithril2['default'])('h2.fontsize-larger.u-marginbottom-60', 'Lance sua campanha no Catarse!'), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4.w-col-push-4', [(0, _mithril2['default'])('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Aprenda como')])])])])];
    }
};

exports['default'] = projectsExplore;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _projectFiltersVm = require('project-filters-vm');

var _projectFiltersVm2 = _interopRequireDefault(_projectFiltersVm);

var _projectsHomeVm = require('projects-home-vm');

var _projectsHomeVm2 = _interopRequireDefault(_projectsHomeVm);

var _slider = require('slider');

var _slider2 = _interopRequireDefault(_slider);

var _projectRow = require('project-row');

var _projectRow2 = _interopRequireDefault(_projectRow);

var _contributionActivities = require('contribution-activities');

var _contributionActivities2 = _interopRequireDefault(_contributionActivities);

var I18nScope = _underscore2['default'].partial(_h2['default'].i18nScope, 'projects.home');

var projectsHome = {
    controller: function controller() {
        var sample6 = _underscore2['default'].partial(_underscore2['default'].sample, _underscore2['default'], 6),
            loader = postgrest.loader,
            project = _models2['default'].project,
            filters = (0, _projectFiltersVm2['default'])().filters,
            vm = (0, _projectsHomeVm2['default'])();

        var collections = _underscore2['default'].map(['score'], function (name) {
            var f = filters[name],
                cLoader = loader(project.getPageOptions(f.filter.parameters())),
                collection = _mithril2['default'].prop([]);

            cLoader.load().then(_underscore2['default'].compose(collection, sample6));

            return {
                title: f.title,
                hash: name,
                collection: collection,
                loader: cLoader
            };
        });

        return {
            collections: collections,
            slidesContent: vm.banners
        };
    },
    view: function view(ctrl) {
        var slides = function slides() {
            return _underscore2['default'].map(ctrl.slidesContent, function (slide) {
                var customStyle = 'background-image: url(' + slide.image + ');';
                var content = (0, _mithril2['default'])('.w-container.u-text-center', [(0, _mithril2['default'])('.w-row.u-marginbottom-40', [(0, _mithril2['default'])('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title), (0, _mithril2['default'])('h2.fontcolor-negative.fontsize-large', _mithril2['default'].trust(slide.subtitle))]), (0, _mithril2['default'])('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)]);

                return {
                    content: content,
                    customStyle: customStyle
                };
            });
        };

        return [_mithril2['default'].component(_slider2['default'], {
            slides: slides(),
            effect: 'fade',
            slideClass: 'hero-slide start',
            wrapperClass: 'hero-full hero-full-slide',
            sliderTime: 10000
        }), _underscore2['default'].map(ctrl.collections, function (collection) {
            return _mithril2['default'].component(_projectRow2['default'], {
                collection: collection,
                title: _i18nJs2['default'].t('row_title', I18nScope()),
                ref: 'home_' + collection.hash
            });
        }), _mithril2['default'].component(_contributionActivities2['default'])];
    }
};

exports['default'] = projectsHome;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectVm = require('project-vm');

var _projectVm2 = _interopRequireDefault(_projectVm);

var _projectHeader = require('project-header');

var _projectHeader2 = _interopRequireDefault(_projectHeader);

var _projectTabs = require('project-tabs');

var _projectTabs2 = _interopRequireDefault(_projectTabs);

var _projectMain = require('project-main');

var _projectMain2 = _interopRequireDefault(_projectMain);

var _projectDashboardMenu = require('project-dashboard-menu');

var _projectDashboardMenu2 = _interopRequireDefault(_projectDashboardMenu);

var projectsShow = {
    controller: function controller(args) {
        return (0, _projectVm2['default'])(args.project_id, args.project_user_id);
    },
    view: function view(ctrl) {
        var project = ctrl.projectDetails;

        return (0, _mithril2['default'])('.project-show', [_mithril2['default'].component(_projectHeader2['default'], {
            project: project,
            userDetails: ctrl.userDetails
        }), _mithril2['default'].component(_projectTabs2['default'], {
            project: project,
            rewardDetails: ctrl.rewardDetails
        }), _mithril2['default'].component(_projectMain2['default'], {
            project: project,
            rewardDetails: ctrl.rewardDetails
        }), project() && project().is_owner_or_admin ? _mithril2['default'].component(_projectDashboardMenu2['default'], {
            project: project
        }) : '']);
    }
};

exports['default'] = projectsShow;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _publishVm = require('publish-vm');

var _publishVm2 = _interopRequireDefault(_publishVm);

var _projectDashboardMenu = require('project-dashboard-menu');

var _projectDashboardMenu2 = _interopRequireDefault(_projectDashboardMenu);

var I18nScope = _underscore2['default'].partial(_h2['default'].i18nScope, 'projects.publish');

var publish = {
  controller: function controller(args) {
    var filtersVM = postgrest.filtersVM({
      project_id: 'eq'
    }),
        publishVM = publishVM,
        projectAccount = _mithril2['default'].prop([]),
        projectDetails = _mithril2['default'].prop([]),
        acceptTerm = _mithril2['default'].prop([true, true, true, true, true, true, true, true, true]),
        flexAcceptTerm = _mithril2['default'].prop([true, true, true, true, true, true, true, true, true]),
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

    var l = loader(_models2['default'].projectDetail.getRowOptions(filtersVM.parameters())),
        accountL = loader(_models2['default'].projectAccount.getRowOptions(filtersVM.parameters()));
    l.load().then(projectDetails);
    accountL.load().then(projectAccount);

    return {
      l: l,
      accountL: accountL,
      filtersVM: filtersVM,
      acceptTerm: acceptTerm,
      flexAcceptTerm: flexAcceptTerm,
      showNextTerm: showNextTerm,
      projectAccount: projectAccount,
      projectDetails: projectDetails
    };
  },
  view: function view(ctrl, args) {
    var project = _underscore2['default'].first(ctrl.projectDetails()),
        account = _underscore2['default'].first(ctrl.projectAccount()),
        flexTerms = function flexTerms(project) {
      return [(0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Regras da modalidade FLEX')]), (0, _mithril2['default'])('div', 'Você escolheu a campanha flexível. Dessa maneira, você irá receber os recursos arrecadados  junto aos apoiadores ao final do prazo da campanha (descontando a taxa do Catarse) e deverá cumprir com a execução do projeto e com a entrega das recompensas oferecidas independente do quanto arrecadar.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Meta de arrecadação')]), (0, _mithril2['default'])('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Taxas')]), (0, _mithril2['default'])('div', ['Ao final da campanha, cobraremos 13% sobre o ', (0, _mithril2['default'])('span.fontweight-semibold', 'valor total arrecadado.')])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Prazo da campanha')]), (0, _mithril2['default'])('div', 'Sua campanha poderá ficar até 12 meses arrecadando dentro do Catarse. Durante esse período você deverá definir um prazo de encerramento da campanha para poder receber os recursos arrecadados. Uma vez definido, o prazo de encerramento não poderá ser alterado.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Prazo para repasse')]), (0, _mithril2['default'])('div', 'Após encerrar a sua campanha e confirmar seus dados bancários, o Catarse realizará o repasse diretamente na sua conta corrente em até 10 dias úteis. O valor depositado já estará considerando o desconto de 13% da taxa.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\
                    ', (0, _mithril2['default'])('br'), (0, _mithril2['default'])('br'), (0, _mithril2['default'])('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Responsabilidade do Catarse')]), [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), (0, _mithril2['default'])('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', (0, _mithril2['default'])('br'), (0, _mithril2['default'])('br'), (0, _mithril2['default'])('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Suas responsabilidades')]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), (0, _mithril2['default'])('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', (0, _mithril2['default'])('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', (0, _mithril2['default'])('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
    },
        terms = function terms(project) {
      return [(0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', (0, _mithril2['default'])('span.fontweight-semibold', 'Regras da modalidade Tudo-ou-nada')]), (0, _mithril2['default'])('div', ['Você escolheu a campanha tudo-ou-nada. Dessa maneira, você só irá receber os recursos arrecadados ', (0, _mithril2['default'])('span.fontweight-semibold', 'caso atinja ou supere a meta de arrecadação'), '. Caso contrário, todos seus apoiadores serão reembolsados. Você será responsável pela entrega das recompensas oferecidas se seu projeto alcançar a meta de arrecadação.'])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Meta de arrecadação')]), (0, _mithril2['default'])('div', 'A meta não poderá ser alterada após o publicação do projeto.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Taxas')]), (0, _mithril2['default'])('div', ['Cobramos 13% sobre o ', (0, _mithril2['default'])('span.fontweight-semibold', 'valor total arrecadado'), ' pelo seu projeto caso ele atinja ou supere a meta dentro do prazo da campanha. Se o projeto não atingir a meta, nenhuma taxa será cobrada.', (0, _mithril2['default'])('span.fontweight-semibold')])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Prazo da campanha')]), (0, _mithril2['default'])('div', 'Seu projeto estará em arrecadação no Catarse até o dia ' + _h2['default'].momentify(project.zone_expires_at) + ' às 23h59min59s. Este prazo não poderá ser alterado após a publicação do projeto.')]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Regras do repasse e reembolso')]), (0, _mithril2['default'])('div', ['Após encerrar o seu projeto e confirmar seus dados bancários, o Catarse depositará o valor arrecadado, já com o desconto da taxa, na sua conta corrente em até 10 dias úteis. Caso o projeto não atinja 100% da meta dentro do prazo, o Catarse irá reembolsar os apoiadores. ', (0, _mithril2['default'])('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Saiba mais sobre o processo de reembolso'), '.'])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'O que pode e não pode alterar na página do projeto a partir da publicação?')]), [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Você não poderá:'), ' alterar o nome do projeto, a URL (link) do projeto, a categoria escolhida, a meta de arrecadação, o prazo escolhido e as recompensas onde existirem apoios já efetuados.\ ', (0, _mithril2['default'])('br'), (0, _mithril2['default'])('br'), (0, _mithril2['default'])('span.fontweight-semibold', 'Você poderá: '), 'editar o conteúdo da descrição do projeto, alterar o vídeo principal da campanha, a imagem do projeto, a frase de efeito as recompensas onde não existirem apoios efetuados, além de adicionar novas recompensas durante a arrecadação.'])]]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Responsabilidade do Catarse')]), [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), (0, _mithril2['default'])('span.fontweight-semibold', 'O Catarse é responsável:'), ' pelo desenvolvimento tecnológico da plataforma, atendimento de dúvidas e problemas (tanto de apoiadores quanto de realizadores), por hospedar o projeto na plataforma e por garantir a segurança das transações financeiras.\ ', (0, _mithril2['default'])('br'), (0, _mithril2['default'])('br'), (0, _mithril2['default'])('span.fontweight-semibold', 'O Catarse não é responsável:'), ' pelo financiamento, divulgação e execução, nem pela entrega de recompensas dos projetos inscritos.'])]]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Suas responsabilidades')]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), (0, _mithril2['default'])('span.fontweight-semibold'), 'É sua responsabilidade tudo aquilo que diz respeito a formatação do projeto, planejamento e divulgação da campanha de arrecadação, mobilização de apoiadores, execução do projeto, produção e entrega de recompensas dentro do prazo estimado e comunicação com apoiadores.'])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', (0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, 'Retiradas de projetos no ar')]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold'), 'O CATARSE reserva-se o direito de, a seu exclusivo critério e uma vez notificado a respeito, cancelar projetos e encerrar as contas de CRIADORES DE PROJETOS que violem nossas ', (0, _mithril2['default'])('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Regras do Jogo'), ' e ', (0, _mithril2['default'])('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), '.'])])];
    };

    return [!ctrl.l() && !ctrl.accountL() ? [project.is_owner_or_admin ? _mithril2['default'].component(_projectDashboardMenu2['default'], {
      project: _mithril2['default'].prop(project),
      hidePublish: true
    }) : '', (0, _mithril2['default'])('.w-section.section-product.' + project.mode), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-3'), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'), (0, _mithril2['default'])('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Pronto para lançar sua campanha?'), (0, _mithril2['default'])('.fontsize-base.u-marginbottom-30', 'Preparamos uma lista com informações importantes para você checar antes de colocar seu projeto no ar!')])]), (0, _mithril2['default'])('.w-col.w-col-3')])])]), (0, _mithril2['default'])('.divider'), (0, _mithril2['default'])('.w-section.section-one-column.bg-gray.section.before-footer', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.card.medium.u-marginbottom-60.card-terciary', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-6.w-clearfix', [(0, _mithril2['default'])('img.card-project-thumb.u-right[src=' + project.large_image + ']')]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.u-marginbottom-30.fontsize-base', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Título: '), project.name]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Link: '), 'www.catarse.me/' + project.permalink]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Modalidade de financiamento: '), _i18nJs2['default'].t(project.mode, I18nScope())]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Meta de arrecadação: '), 'R$ ' + _h2['default'].formatNumber(project.goal, 2, 3)]), project.mode !== 'flex' ? (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Prazo: ' + project.online_days + ' dias')]) : '', (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'Responsável: '), account.owner_name]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])])])]), (0, _mithril2['default'])('.u-text-center', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-1'), (0, _mithril2['default'])('.w-col.w-col-10', [(0, _mithril2['default'])('.divider.u-marginbottom-10'), (0, _mithril2['default'])('.fontsize-small.fontcolor-secondary', 'Os dados acima não podem ser alterados após o projeto entrar no ar. Se você precisa fazer mudanças, navegue na barra lateral e volte aqui quando estiver tudo pronto!')]), (0, _mithril2['default'])('.w-col.w-col-1')])])]), (0, _mithril2['default'])('.card.medium.u-radius.u-marginbottom-60', [(0, _mithril2['default'])('.u-text-center.u-marginbottom-60', [(0, _mithril2['default'])('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2'), (0, _mithril2['default'])('.w-col.w-col-8', [(0, _mithril2['default'])('.fontsize-small', ['Antes de publicar, clique nos círculos abaixo e confirme que você está ciente de como funciona o Catarse. Qualquer dúvida, ', (0, _mithril2['default'])('a.alt-link[href=\'https://equipecatarse.zendesk.com/account/dropboxes/20298537\'][target=\'_blank\']', 'entre em contato'), '!'])]), (0, _mithril2['default'])('.w-col.w-col-2')])]), _underscore2['default'].map(project.mode == 'flex' ? flexTerms(project) : terms(project), function (term, index) {
      return (0, _mithril2['default'])('.u-marginbottom-30.fontsize-base' + (index == 0 ? '' : '.w-hidden.publish-rules'), [(0, _mithril2['default'])('.w-row[id=\'rule-' + index + '\']', [(0, _mithril2['default'])('.w-col.w-col-1.u-text-center', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? 'a.w-inline-block.checkbox-big[href=\'#rule-' + (index + 1) + '\']' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href=\'#rule-' + (index + 1) + '\']', { onclick: function onclick() {
          return ctrl.showNextTerm(index, project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm);
        } })])]), term])]);
    })]), (0, _mithril2['default'])('.w-row.publish-btn-section.w-hidden', [(0, _mithril2['default'])('.w-col.w-col-4'), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('a.btn.btn-large.u-marginbottom-20[href=/' + (project.mode == 'flex' ? 'flexible_projects' : 'projects') + '/' + (project.mode == 'flex' ? project.flex_id : project.id) + '/push_to_online]', 'Publicar agora!'), (0, _mithril2['default'])('.u-text-center.fontsize-smaller', ['Ao publicar o seu projeto, você está aceitando os ', (0, _mithril2['default'])('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Termos de Uso'), ', ', project.mode == 'flex' ? (0, _mithril2['default'])('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/206574833-Regras-para-a-fase-de-testes-do-Catarse-Flex\'][target=\'_blank\']', 'Regras do Flex') : '', ' e ', (0, _mithril2['default'])('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Politica de Privacidade')])]), (0, _mithril2['default'])('.w-col.w-col-4')])])]), '\
    '] : _h2['default'].loader()];
  }
};

exports['default'] = publish;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _teamTotal = require('team-total');

var _teamTotal2 = _interopRequireDefault(_teamTotal);

var _teamMembers = require('team-members');

var _teamMembers2 = _interopRequireDefault(_teamMembers);

var team = {
    view: function view() {
        return (0, _mithril2['default'])('#static-team-app', [_mithril2['default'].component(_teamTotal2['default']), _mithril2['default'].component(_teamMembers2['default'])]);
    }
};

exports['default'] = team;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _adminProject = require('admin-project');

var _adminProject2 = _interopRequireDefault(_adminProject);

var _adminContribution = require('admin-contribution');

var _adminContribution2 = _interopRequireDefault(_adminContribution);

var _adminContributionUser = require('admin-contribution-user');

var _adminContributionUser2 = _interopRequireDefault(_adminContributionUser);

var _paymentStatus = require('payment-status');

var _paymentStatus2 = _interopRequireDefault(_paymentStatus);

var adminContributionItem = {
    controller: function controller() {
        return {
            itemBuilder: [{
                component: _adminContributionUser2['default'],
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: _adminProject2['default'],
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: _adminContribution2['default'],
                wrapperClass: '.w-col.w-col-2'
            }, {
                component: _paymentStatus2['default'],
                wrapperClass: '.w-col.w-col-2'
            }]
        };
    },
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.w-row', _.map(ctrl.itemBuilder, function (panel) {
            return (0, _mithril2['default'])(panel.wrapperClass, [_mithril2['default'].component(panel.component, {
                item: args.item,
                key: args.key
            })]);
        }));
    }
};

exports['default'] = adminContributionItem;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _adminUser = require('admin-user');

var _adminUser2 = _interopRequireDefault(_adminUser);

var adminContributionUser = {
    view: function view(ctrl, args) {
        var item = args.item,
            user = {
            profile_img_thumbnail: item.user_profile_img,
            id: item.user_id,
            name: item.user_name,
            email: item.email
        };

        var additionalData = (0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
        return _mithril2['default'].component(_adminUser2['default'], { item: user, additional_data: additionalData });
    }
};

exports['default'] = adminContributionUser;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminContribution = {
    view: function view(ctrl, args) {
        var contribution = args.item;
        return (0, _mithril2['default'])('.w-row.admin-contribution', [(0, _mithril2['default'])('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', _h2['default'].momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), (0, _mithril2['default'])('.fontsize-smallest', ['ID do Gateway: ', (0, _mithril2['default'])('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
    }
};

exports['default'] = adminContribution;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminExternalAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = _mithril2['default'].prop(false),
            error = _mithril2['default'].prop(false),
            fail = _mithril2['default'].prop(false),
            data = {},
            item = args.item;

        builder.requestOptions.config = function (xhr) {
            if (_h2['default'].authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', _h2['default'].authenticityToken());
            }
        };

        var reload = _underscore2['default'].compose(builder.model.getRowWithToken, _h2['default'].idVM.id(item[builder.updateKey]).parameters),
            l = _mithril2['default'].prop(false);

        var reloadItem = function reloadItem() {
            return reload().then(updateItem);
        };

        var requestError = function requestError(err) {
            l(false);
            complete(true);
            error(true);
        };

        var updateItem = function updateItem(res) {
            _underscore2['default'].extend(item, res[0]);
            complete(true);
            error(false);
        };

        var submit = function submit() {
            l(true);
            _mithril2['default'].request(builder.requestOptions).then(reloadItem, requestError);
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
            toggler: _h2['default'].toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

        return (0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? (0, _mithril2['default'])('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [(0, _mithril2['default'])('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [(0, _mithril2['default'])('label', data.innerLabel), (0, _mithril2['default'])('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [(0, _mithril2['default'])('.w-form-done[style="display:block;"]', [(0, _mithril2['default'])('p', 'Requisição feita com sucesso.')])] : [(0, _mithril2['default'])('.w-form-error[style="display:block;"]', [(0, _mithril2['default'])('p', 'Houve um problema na requisição.')])])]) : '']);
    }
};

exports['default'] = adminExternalAction;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _filterMain = require('filter-main');

var _filterMain2 = _interopRequireDefault(_filterMain);

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
            main = _underscore2['default'].findWhere(filterBuilder, {
            component: _filterMain2['default']
        });

        return (0, _mithril2['default'])('#admin-contributions-filter.w-section.page-header', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.fontsize-larger.u-text-center.u-marginbottom-30', label), (0, _mithril2['default'])('.w-form', [(0, _mithril2['default'])('form', {
            onsubmit: args.submit
        }, [main ? _mithril2['default'].component(main.component, main.data) : '', (0, _mithril2['default'])('.u-marginbottom-20.w-row', (0, _mithril2['default'])('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
            onclick: ctrl.toggler.toggle
        }, 'Filtros avançados  >')), ctrl.toggler() ? (0, _mithril2['default'])('#advanced-search.w-row.admin-filters', [_underscore2['default'].map(filterBuilder, function (f) {
            return f.component !== _filterMain2['default'] ? _mithril2['default'].component(f.component, f.data) : '';
        })]) : ''])])])]);
    }
};

exports['default'] = adminFilter;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminInputAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = _mithril2['default'].prop(false),
            error = _mithril2['default'].prop(false),
            fail = _mithril2['default'].prop(false),
            data = {},
            item = args.item,
            key = builder.property,
            forceValue = builder.forceValue || null,
            newValue = _mithril2['default'].prop(forceValue);

        _h2['default'].idVM.id(item[builder.updateKey]);

        var l = postgrest.loaderWithToken(builder.model.patchOptions(_h2['default'].idVM.parameters(), data));

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
            toggler: _h2['default'].toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

        return (0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? (0, _mithril2['default'])('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [(0, _mithril2['default'])('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [(0, _mithril2['default'])('label', data.innerLabel), data.forceValue === undefined ? (0, _mithril2['default'])('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
            onchange: _mithril2['default'].withAttr('value', ctrl.newValue),
            value: ctrl.newValue()
        }) : '', (0, _mithril2['default'])('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [(0, _mithril2['default'])('.w-form-done[style="display:block;"]', [(0, _mithril2['default'])('p', data.successMessage)])] : [(0, _mithril2['default'])('.w-form-error[style="display:block;"]', [(0, _mithril2['default'])('p', 'Houve um problema na requisição. ' + data.errorMessage)])])]) : '']);
    }
};

exports['default'] = adminInputAction;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _adminItem = require('admin-item');

var _adminItem2 = _interopRequireDefault(_adminItem);

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

        return (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', error() ? (0, _mithril2['default'])('.card.card-error.u-radius.fontweight-bold', error()) : [(0, _mithril2['default'])('.w-row.u-marginbottom-20', [(0, _mithril2['default'])('.w-col.w-col-9', [(0, _mithril2['default'])('.fontsize-base', list.isLoading() ? 'Carregando ' + label.toLowerCase() + '...' : [(0, _mithril2['default'])('span.fontweight-semibold', list.total()), ' ' + label.toLowerCase() + ' encontrados'])])]), (0, _mithril2['default'])('#admin-contributions-list.w-container', [list.collection().map(function (item) {
            return _mithril2['default'].component(_adminItem2['default'], {
                listItem: args.listItem,
                listDetail: args.listDetail,
                item: item,
                key: item.id
            });
        }), (0, _mithril2['default'])('.w-section.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? _h2['default'].loader() : (0, _mithril2['default'])('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais')])])])])])])]);
    }
};

exports['default'] = adminList;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var adminNotificationHistory = {
    controller: function controller(args) {
        var notifications = _mithril2['default'].prop([]),
            getNotifications = function getNotifications(user) {
            var notification = _models2['default'].notification;
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
        return (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'), ctrl.notifications().map(function (cEvent) {
            return (0, _mithril2['default'])('.w-row.fontsize-smallest.lineheight-looser.date-event', [(0, _mithril2['default'])('.w-col.w-col-24', [(0, _mithril2['default'])('.fontcolor-secondary', _h2['default'].momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', cEvent.template_name, cEvent.origin ? ' - ' + cEvent.origin : '')])]);
        })]);
    }
};

exports['default'] = adminNotificationHistory;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var adminProjectDetailsCard = {
    controller: function controller(args) {
        var project = args.resource,
            generateStatusText = function generateStatusText() {
            var statusTextObj = _mithril2['default'].prop({}),
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
            return !_.isNull(project.expires_at) && (0, _moment2['default'])().add(8, 'days') >= (0, _moment2['default'])(project.zone_expires_at);
        };
        return {
            project: project,
            statusTextObj: generateStatusText(),
            remainingTextObj: _h2['default'].translatedTime(project.remaining_time),
            elapsedTextObj: _h2['default'].translatedTime(project.elapsed_time),
            isFinalLap: isFinalLap
        };
    },
    view: function view(ctrl) {
        var project = ctrl.project,
            progress = project.progress.toFixed(2),
            statusTextObj = ctrl.statusTextObj(),
            remainingTextObj = ctrl.remainingTextObj,
            elapsedTextObj = ctrl.elapsedTextObj;

        return (0, _mithril2['default'])('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('.fontsize-small.fontweight-semibold', [(0, _mithril2['default'])('span.fontcolor-secondary', 'Status:'), ' ', (0, _mithril2['default'])('span', {
            'class': statusTextObj.cssClass
        }, ctrl.isFinalLap() && project.open_for_contributions ? 'RETA FINAL' : statusTextObj.text), ' ']), (function () {
            if (project.is_published) {
                return [(0, _mithril2['default'])('.meter.u-margintop-20.u-marginbottom-10', [(0, _mithril2['default'])('.meter-fill', {
                    style: {
                        width: (progress > 100 ? 100 : progress) + '%'
                    }
                })]), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [(0, _mithril2['default'])('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'financiado'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [(0, _mithril2['default'])('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'levantados'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + _h2['default'].formatNumber(project.pledged, 2)])]), (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [(0, _mithril2['default'])('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [(0, _mithril2['default'])('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [(0, _mithril2['default'])('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'restam'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])];
            }
            return [];
        })()])]);
    }
};

exports['default'] = adminProjectDetailsCard;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminProject = {
    view: function view(ctrl, args) {
        var project = args.item;
        return (0, _mithril2['default'])('.w-row.admin-project', [(0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [(0, _mithril2['default'])('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), (0, _mithril2['default'])('.w-col.w-col-9.w-col-small-9', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [(0, _mithril2['default'])('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), (0, _mithril2['default'])('.fontsize-smallest.fontweight-semibold', project.project_state), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', _h2['default'].momentify(project.project_online_date) + ' a ' + _h2['default'].momentify(project.project_expires_at))])]);
    }
};

exports['default'] = adminProject;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminRadioAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = _mithril2['default'].prop(false),
            data = {},
            error = _mithril2['default'].prop(false),
            fail = _mithril2['default'].prop(false),
            item = args.item(),
            description = _mithril2['default'].prop(item.description || ''),
            key = builder.getKey,
            newID = _mithril2['default'].prop(''),
            getFilter = {},
            setFilter = {},
            radios = _mithril2['default'].prop(),
            getAttr = builder.radios,
            getKey = builder.getKey,
            getKeyValue = args.getKeyValue,
            updateKey = builder.updateKey,
            updateKeyValue = args.updateKeyValue,
            validate = builder.validate,
            selectedItem = builder.selectedItem || _mithril2['default'].prop();

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
                var newItem = _underscore2['default'].findWhere(radios(), {
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
                if (_underscore2['default'].isUndefined(validation)) {
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
            _mithril2['default'].redraw();
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
            toggler: _h2['default'].toggleProp(false, true),
            unload: unload,
            radios: radios
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            item = args.item(),
            btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

        return (0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? (0, _mithril2['default'])('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [(0, _mithril2['default'])('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [ctrl.radios() ? _underscore2['default'].map(ctrl.radios(), function (radio, index) {
            var set = function set() {
                ctrl.newID(radio.id);
                ctrl.setDescription(radio.description);
            };
            var selected = radio.id === (item[data.selectKey] || item.id) ? true : false;

            return (0, _mithril2['default'])('.w-radio', [(0, _mithril2['default'])('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
                onclick: set
            }), (0, _mithril2['default'])('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
        }) : _h2['default'].loader(), (0, _mithril2['default'])('strong', 'Descrição'), (0, _mithril2['default'])('p', ctrl.description()), (0, _mithril2['default'])('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [(0, _mithril2['default'])('.w-form-done[style="display:block;"]', [(0, _mithril2['default'])('p', 'Recompensa alterada com sucesso!')])] : [(0, _mithril2['default'])('.w-form-error[style="display:block;"]', [(0, _mithril2['default'])('p', ctrl.error().message)])])]) : '']);
    }
};

exports['default'] = adminRadioAction;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminResetPassword = {
    controller: function controller(args) {
        var builder = args.data,
            complete = _mithril2['default'].prop(false),
            error = _mithril2['default'].prop(false),
            fail = _mithril2['default'].prop(false),
            key = builder.property,
            data = {},
            item = args.item;

        builder.requestOptions.config = function (xhr) {
            if (_h2['default'].authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', _h2['default'].authenticityToken());
            }
        };

        var l = _mithril2['default'].prop(false),
            load = function load() {
            return _mithril2['default'].request(_underscore2['default'].extend({}, { data: data }, builder.requestOptions));
        },
            newPassword = _mithril2['default'].prop(''),
            error_message = _mithril2['default'].prop('');

        var requestError = function requestError(err) {
            l(false);
            error_message(err.errors[0]);
            complete(true);
            error(true);
        };
        var updateItem = function updateItem(res) {
            l(false);
            _underscore2['default'].extend(item, res[0]);
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
            toggler: _h2['default'].toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

        return (0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? (0, _mithril2['default'])('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [(0, _mithril2['default'])('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [(0, _mithril2['default'])('label', data.innerLabel), (0, _mithril2['default'])('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
            onchange: _mithril2['default'].withAttr('value', ctrl.newPassword),
            value: ctrl.newPassword()
        }), (0, _mithril2['default'])('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [(0, _mithril2['default'])('.w-form-done[style="display:block;"]', [(0, _mithril2['default'])('p', 'Senha alterada com sucesso.')])] : [(0, _mithril2['default'])('.w-form-error[style="display:block;"]', [(0, _mithril2['default'])('p', ctrl.error_message())])])]) : '']);
    }
};

exports['default'] = adminResetPassword;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminReward = {
    view: function view(ctrl, args) {
        var reward = args.reward(),
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

        return (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), (0, _mithril2['default'])('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, (0, _mithril2['default'])('br'), 'Valor mínimo: R$' + _h2['default'].formatNumber(reward.minimum_value, 2, 3), (0, _mithril2['default'])('br'), _mithril2['default'].trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), (0, _mithril2['default'])('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, (0, _mithril2['default'])('br'), 'Descrição: ' + reward.description] : 'Apoio sem recompensa')]);
    }
};

exports['default'] = adminReward;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var adminTransactionHistory = {
    controller: function controller(args) {
        var contribution = args.contribution,
            mapEvents = _underscore2['default'].reduce([{
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
                item.date = _h2['default'].momentify(item.date, 'DD/MM/YYYY, HH:mm');
                return memo.concat(item);
            }

            return memo;
        }, []);

        return {
            orderedEvents: _underscore2['default'].sortBy(mapEvents, 'originalDate')
        };
    },
    view: function view(ctrl) {
        return (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'), ctrl.orderedEvents.map(function (cEvent) {
            return (0, _mithril2['default'])('.w-row.fontsize-smallest.lineheight-looser.date-event', [(0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.fontcolor-secondary', cEvent.date)]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('div', cEvent.name)])]);
        })]);
    }
};

exports['default'] = adminTransactionHistory;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var adminTransaction = {
    view: function view(ctrl, args) {
        var contribution = args.contribution;
        return (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), (0, _mithril2['default'])('.fontsize-smallest.lineheight-looser', ['Valor: R$' + _underscore2['default'].formatNumber(contribution.value, 2, 3), (0, _mithril2['default'])('br'), 'Taxa: R$' + _underscore2['default'].formatNumber(contribution.gateway_fee, 2, 3), (0, _mithril2['default'])('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), (0, _mithril2['default'])('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), (0, _mithril2['default'])('br'), 'Id pagamento: ' + contribution.gateway_id, (0, _mithril2['default'])('br'), 'Apoio: ' + contribution.contribution_id, (0, _mithril2['default'])('br'), 'Chave: \n', (0, _mithril2['default'])('br'), contribution.key, (0, _mithril2['default'])('br'), 'Meio: ' + contribution.gateway, (0, _mithril2['default'])('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), (0, _mithril2['default'])('br'), contribution.is_second_slip ? [(0, _mithril2['default'])('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', (0, _mithril2['default'])('span.badge', '2a via')] : ''])]);
    }
};

exports['default'] = adminTransaction;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _adminResetPassword = require('admin-reset-password');

var _adminResetPassword2 = _interopRequireDefault(_adminResetPassword);

var _adminInputAction = require('admin-input-action');

var _adminInputAction2 = _interopRequireDefault(_adminInputAction);

var _adminNotificationHistory = require('admin-notification-history');

var _adminNotificationHistory2 = _interopRequireDefault(_adminNotificationHistory);

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
            details = args.details,
            addOptions = function addOptions(builder, id) {
            return _underscore2['default'].extend({}, builder, {
                requestOptions: {
                    url: '/users/' + id + '/new_password',
                    method: 'POST'
                }
            });
        };

        return (0, _mithril2['default'])('#admin-contribution-detail-box', [(0, _mithril2['default'])('.divider.u-margintop-20.u-marginbottom-20'), (0, _mithril2['default'])('.w-row.u-marginbottom-30', [_mithril2['default'].component(_adminResetPassword2['default'], {
            data: addOptions(actions.reset, item.id),
            item: item
        }), item.deactivated_at ? _mithril2['default'].component(_adminInputAction2['default'], { data: actions.reactivate, item: item }) : '']), (0, _mithril2['default'])('.w-row.card.card-terciary.u-radius', [_mithril2['default'].component(_adminNotificationHistory2['default'], {
            user: item
        })])]);
    }
};

exports['default'] = adminUserDetail;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _adminUser = require('admin-user');

var _adminUser2 = _interopRequireDefault(_adminUser);

var adminUserItem = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4', [_mithril2['default'].component(_adminUser2['default'], args)])]);
    }
};

exports['default'] = adminUserItem;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var adminUser = {
    view: function view(ctrl, args) {
        var user = args.item;

        return (0, _mithril2['default'])('.w-row.admin-user', [(0, _mithril2['default'])('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [(0, _mithril2['default'])('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), (0, _mithril2['default'])('.w-col.w-col-9.w-col-small-9', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [(0, _mithril2['default'])('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), (0, _mithril2['default'])('.fontsize-smallest', 'Usuário: ' + user.id), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
    }
};

exports['default'] = adminUser;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var categoryButton = {
    view: function view(ctrl, args) {
        var category = args.category;

        return (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('a.w-inline-block.btn-category' + (category.name.length > 13 ? '.double-line' : '') + '[href=\'#by_category_id/' + category.id + '\']', [(0, _mithril2['default'])('div', [category.name, (0, _mithril2['default'])('span.badge.explore', category.online_projects)])])]);
    }
};

exports['default'] = categoryButton;
module.exports = exports['default'];
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var contributionActivities = {
    controller: function controller(args) {
        var interval = undefined;
        var collection = _mithril2['default'].prop([]),
            resource = _mithril2['default'].prop(),
            collectionIndex = _mithril2['default'].prop(0),
            collectionSize = _mithril2['default'].prop(),
            collectionL = postgrest.loader(_models2['default'].contributionActivity.getPageOptions()),
            nextResource = function nextResource() {
            if (collectionIndex() + 1 > collectionSize()) {
                collectionIndex(0);
            }

            collectionIndex(collectionIndex() + 1);
            resource(collection()[collectionIndex()]);
            _mithril2['default'].redraw();
        },
            startConfig = function startConfig(el, isinitialized, context) {
            context.onunload = function () {
                return clearInterval(interval);
            };
        },
            startTimer = function startTimer() {
            interval = setInterval(nextResource, 15000);
        };

        collectionL.load().then(function (data) {
            collection(data);
            collectionSize(data.length);
            resource(_underscore2['default'].first(data));
        });

        startTimer();

        return {
            collection: collection,
            collectionL: collectionL,
            resource: resource,
            collectionSize: collectionSize
        };
    },
    view: function view(ctrl, args) {
        if (!ctrl.collectionL() && !_underscore2['default'].isUndefined(ctrl.resource()) && (ctrl.collectionSize() || 0) > 0) {
            var resource = ctrl.resource(),
                elapsed = _h2['default'].translatedTime(resource.elapsed_time),
                project_link = 'https://catarse.me/' + resource.permalink + '?ref=ctrse_home_activities';

            return (0, _mithril2['default'])('.w-section.section.bg-backs-carrosel', { config: ctrl.startConfig }, [(0, _mithril2['default'])('.w-container.u-text-center.fontcolor-negative', [(0, _mithril2['default'])('.fontsize-large.u-marginbottom-30', 'há ' + parseInt(elapsed.total) + ' ' + elapsed.unit + '...'), (0, _mithril2['default'])('.w-clearfix.w-inline-block.u-marginbottom-10', [(0, _mithril2['default'])('a', { href: project_link }, [(0, _mithril2['default'])('img.thumb-author.u-round', { src: resource.thumbnail, width: 80 })]), (0, _mithril2['default'])('img.thumb-author.u-round', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png' }), (0, _mithril2['default'])('a', { href: project_link }, [(0, _mithril2['default'])('img.thumb-author.u-round', { src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;' })])]), (0, _mithril2['default'])('.fontsize-large', resource.name + ' apoiou'), (0, _mithril2['default'])('.fontsize-larger', [(0, _mithril2['default'])('a.link-hidden-white', { href: project_link }, resource.project_name)])])]);
        } else {
            return (0, _mithril2['default'])('div');
        }
    }
};

exports['default'] = contributionActivities;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var dropdown = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('select' + args.classes + '[id="' + args.id + '"]', {
            onchange: _mithril2['default'].withAttr('value', args.valueProp),
            value: args.valueProp()
        }, _underscore2['default'].map(args.options, function (data) {
            return (0, _mithril2['default'])('option[value="' + data.value + '"]', data.option);
        }));
    }
};

exports['default'] = dropdown;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var filterButton = {
    view: function view(ctrl, args) {
        var title = args.title,
            href = args.href;
        return (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('a.w-inline-block.btn-category.filters' + (title.length > 13 ? '.double-line' : '') + '[href=\'#' + href + '\']', [(0, _mithril2['default'])('div', [title])])]);
    }
};

exports['default'] = filterButton;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var filterDateRange = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-6', [(0, _mithril2['default'])('label.fontsize-smaller[for="' + args.index + '"]', args.label), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [(0, _mithril2['default'])('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: _mithril2['default'].withAttr('value', args.first),
            value: args.first()
        })]), (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [(0, _mithril2['default'])('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), (0, _mithril2['default'])('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [(0, _mithril2['default'])('input.w-input.text-field.positive[type="text"]', {
            onchange: _mithril2['default'].withAttr('value', args.last),
            value: args.last()
        })])])]);
    }
};

exports['default'] = filterDateRange;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var filterDropdown = {
    view: function view(ctrl, args) {
        var wrapper_c = args.wrapper_class || '.w-col.w-col-3.w-col-small-6';
        return (0, _mithril2['default'])(wrapper_c, [(0, _mithril2['default'])('label.fontsize-smaller[for="' + args.index + '"]', args.label), _mithril2['default'].component(c.Dropdown, {
            id: args.index,
            classes: '.w-select.text-field.positive',
            valueProp: args.vm,
            options: args.options
        })]);
    }
};

exports['default'] = filterDropdown;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var filterMain = {
    view: function view(ctrl, args) {
        var inputWrapperClass = args.inputWrapperClass || '.w-input.text-field.positive.medium',
            btnClass = args.btnClass || '.btn.btn-large.u-marginbottom-10';

        return (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-10', [(0, _mithril2['default'])('input' + inputWrapperClass + '[placeholder="' + args.placeholder + '"][type="text"]', {
            onchange: _mithril2['default'].withAttr('value', args.vm),
            value: args.vm()
        })]), (0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('input#filter-btn' + btnClass + '[type="submit"][value="Buscar"]')])]);
    }
};

exports['default'] = filterMain;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var filterNumberRange = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.w-col.w-col-3.w-col-small-6', [(0, _mithril2['default'])('label.fontsize-smaller[for="' + args.index + '"]', args.label), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [(0, _mithril2['default'])('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: _mithril2['default'].withAttr('value', args.first),
            value: args.first()
        })]), (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [(0, _mithril2['default'])('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), (0, _mithril2['default'])('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [(0, _mithril2['default'])('input.w-input.text-field.positive[type="text"]', {
            onchange: _mithril2['default'].withAttr('value', args.last),
            value: args.last()
        })])])]);
    }
};

exports['default'] = filterNumberRange;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var landingQA = {
    controller: function controller(args) {
        return {
            showAnswer: _h2['default'].toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [(0, _mithril2['default'])('.fontsize-base', {
            onclick: ctrl.showAnswer.toggle
        }, args.question), ctrl.showAnswer() ? (0, _mithril2['default'])('p.u-margintop-20.fontsize-small', _mithril2['default'].trust(args.answer)) : '']);
    }
};

exports['default'] = landingQA;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var landingSignup = {
    controller: function controller(args) {
        var builder = args.builder,
            email = _mithril2['default'].prop(''),
            error = _mithril2['default'].prop(false),
            submit = function submit() {
            if (_h2['default'].validateEmail(email())) {
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
        return (0, _mithril2['default'])('form.w-form[id="email-form"][method="post"][action="' + args.builder.customAction + '"]', {
            onsubmit: ctrl.submit
        }, [(0, _mithril2['default'])('.w-col.w-col-5', [(0, _mithril2['default'])('input' + errorClasses + '.w-input.text-field.medium[name="EMAIL"][placeholder="Digite seu email"][type="text"]', {
            config: _h2['default'].RDTracker('landing-flex'),
            onchange: _mithril2['default'].withAttr('value', ctrl.email),
            value: ctrl.email()
        }), ctrl.error() ? (0, _mithril2['default'])('span.fontsize-smaller.text-error', 'E-mail inválido') : '']), (0, _mithril2['default'])('.w-col.w-col-3', [(0, _mithril2['default'])('input.w-button.btn.btn-large[type="submit"][value="Cadastrar"]')])]);
    }
};

exports['default'] = landingSignup;
module.exports = exports['default'];
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var modalBox = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.modal-backdrop', [(0, _mithril2['default'])('.modal-dialog-outer', [(0, _mithril2['default'])('.modal-dialog-inner.modal-dialog-small', [(0, _mithril2['default'])('a.w-inline-block.modal-close.fa.fa-close.fa-lg[href="javascript:void(0);"]', {
            onclick: args.displayModal.toggle
        }), _mithril2['default'].component(args.content[0], args.content[1])])])]);
    }
};

exports['default'] = modalBox;
module.exports = exports['default'];
/**
 * window.c.OnlineSucessModalContent component
 * Render online success message
 *
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var onlineSucessModalContent = {
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.modal-dialog-content.u-text-center', [(0, _mithril2['default'])('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), (0, _mithril2['default'])('p.fontsize-larger.lineheight-tight', 'Sua campanha está no ar!!! Parabéns por esse primeiro grande passo. Boa sorte nessa jornada ;)')]);
    }
};

exports['default'] = onlineSucessModalContent;
module.exports = exports['default'];
/**
 * window.c.OwnerMessageContent component
 * Render project owner contact form
 *
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var ownerMessageContent = {
    controller: function controller(args) {
        var l = _mithril2['default'].prop(false),
            sendSuccess = _mithril2['default'].prop(false),
            sendMessage = function sendMessage() {
            var loaderOpts = _models2['default'].directMessage.postOptions({
                from_name: document.getElementById('from_name').value,
                from_email: document.getElementById('from_email').value,
                user_id: _h2['default'].getUser()['user_id'],
                content: document.getElementById('message_content').value,
                project_id: _h2['default'].getCurrentProject()['project_id'],
                to_user_id: _h2['default'].getCurrentProject()['project_user_id']
            });
            l = postgrest.loaderWithToken(loaderOpts);

            l.load().then(sendSuccess(true));
            return false;
        };

        return {
            sendMessage: sendMessage,
            sendSuccess: sendSuccess,
            userDetails: args
        };
    },
    view: function view(ctrl, args) {
        var user = _h2['default'].getUser(),
            successMessage = (0, _mithril2['default'])('.modal-dialog-content.u-text-center', [(0, _mithril2['default'])('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), (0, _mithril2['default'])('p.fontsize-large', 'Sua mensagem foi enviada com sucesso para ' + _underscore2['default'].first(ctrl.userDetails()).name + '. Você vai receber uma cópia no seu email e pode seguir a conversa por lá!')]),
            contactForm = [(0, _mithril2['default'])('.modal-dialog-content', [(0, _mithril2['default'])('.w-form', [(0, _mithril2['default'])('form', { onsubmit: ctrl.sendMessage }, [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-6.w-sub-col', [(0, _mithril2['default'])('label.fontsize-smaller', 'Seu nome'), (0, _mithril2['default'])('input.w-input.text-field[value=\'' + (user ? user['name'] : '') + '\'][id=\'from_name\'][type=\'text\'][required]')]), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('label.fontsize-smaller', 'Seu email'), (0, _mithril2['default'])('input.w-input.text-field[value=\'' + (user ? user['email'] : '') + '\'][id=\'from_email\'][type=\'text\'][required]')])]), (0, _mithril2['default'])('label', 'Mensagem'), (0, _mithril2['default'])('textarea.w-input.text-field.height-small[id=\'message_content\'][required]'), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-terciary', 'Você receberá uma cópia desta mensagem em seu email.'), (0, _mithril2['default'])('.modal-dialog-nav-bottom', (0, _mithril2['default'])('.w-row', (0, _mithril2['default'])('.w-col.w-col-6.w-col-push-3', (0, _mithril2['default'])('input.w-button.btn.btn-large[type="submit"][value="Enviar mensagem"]'))))])])])];

        return (0, _mithril2['default'])('div', [(0, _mithril2['default'])('.modal-dialog-header', (0, _mithril2['default'])('.fontsize-large.u-text-center', 'Enviar mensagem')), ctrl.sendSuccess() ? successMessage : contactForm]);
    }
};

exports['default'] = ownerMessageContent;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectRewardList = require('project-reward-list');

var _projectRewardList2 = _interopRequireDefault(_projectRewardList);

var _projectSuggestedContributions = require('project-suggested-contributions');

var _projectSuggestedContributions2 = _interopRequireDefault(_projectSuggestedContributions);

var projectAbout = {
    view: function view(ctrl, args) {
        var project = args.project() || {},
            onlineDays = function onlineDays() {
            var diff = moment(project.zone_online_date).diff(moment(project.zone_expires_at)),
                duration = moment.duration(diff);

            return -Math.ceil(duration.asDays());
        };
        var fundingPeriod = function fundingPeriod() {
            return project.is_published && _h2['default'].existy(project.zone_expires_at) ? (0, _mithril2['default'])('.funding-period', [(0, _mithril2['default'])('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Período de campanha'), (0, _mithril2['default'])('.fontsize-small.u-text-center-small-only', _h2['default'].momentify(project.zone_online_date) + ' - ' + _h2['default'].momentify(project.zone_expires_at) + ' (' + onlineDays() + ' dias)')]) : '';
        };

        return (0, _mithril2['default'])('#project-about', [(0, _mithril2['default'])('.project-about.w-col.w-col-8', {
            config: _h2['default'].UIHelper()
        }, [(0, _mithril2['default'])('p.fontsize-base', [(0, _mithril2['default'])('strong', 'O projeto')]), (0, _mithril2['default'])('.fontsize-base[itemprop="about"]', _mithril2['default'].trust(_h2['default'].selfOrEmpty(project.about_html, '...'))), project.budget ? [(0, _mithril2['default'])('p.fontsize-base.fontweight-semibold', 'Orçamento'), (0, _mithril2['default'])('p.fontsize-base', _mithril2['default'].trust(project.budget))] : '']), (0, _mithril2['default'])('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), _mithril2['default'].component(_projectRewardList2['default'], {
            project: args.project,
            rewardDetails: args.rewardDetails
        }), fundingPeriod()] : [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Sugestões de apoio'), _mithril2['default'].component(projectSuggestedContributions, { project: args.project }), fundingPeriod()])]);
    }
};

exports['default'] = projectAbout;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var I18nScope = _underscore2['default'].partial(_h2['default'].i18nScope, 'projects.card');
var projectCard = {
    view: function view(ctrl, args) {
        var project = args.project,
            progress = project.progress.toFixed(2),
            remainingTextObj = _h2['default'].translatedTime(project.remaining_time),
            link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : ''),
            type = args.type || 'small',
            css = function css(cardType) {
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

            return cssClasses[cardType];
        };

        return (0, _mithril2['default'])(css(type).wrapper, [(0, _mithril2['default'])(css(type).innerWrapper, [(0, _mithril2['default'])('a' + css(type).thumb + '[href="' + link + '"]', {
            style: {
                'background-image': 'url(' + project.project_img + ')',
                'display': 'block'
            }
        }), (0, _mithril2['default'])(css(type).descriptionWrapper, [(0, _mithril2['default'])(css(type).description, [(0, _mithril2['default'])(css(type).title, [(0, _mithril2['default'])('a.link-hidden[href="' + link + '"]', project.project_name)]), (0, _mithril2['default'])(css(type).author, _i18nJs2['default'].t('by', I18nScope()) + ' ' + project.owner_name), (0, _mithril2['default'])(css(type).headline, [(0, _mithril2['default'])('a.link-hidden[href="' + link + '"]', project.headline)])]), (0, _mithril2['default'])(css(type).city, [(0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', [(0, _mithril2['default'])('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), (0, _mithril2['default'])('.card-project-meter.' + project.state, [_underscore2['default'].contains(['successful', 'failed', 'waiting_funds'], project.state) ? (0, _mithril2['default'])('div', _i18nJs2['default'].t('display_status.' + project.state, I18nScope())) : (0, _mithril2['default'])('.meter', [(0, _mithril2['default'])('.meter-fill', {
            style: {
                width: (progress > 100 ? 100 : progress) + '%'
            }
        })])]), (0, _mithril2['default'])('.card-project-stats', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), (0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [(0, _mithril2['default'])('.fontsize-smaller.fontweight-semibold', 'R$ ' + _h2['default'].formatNumber(project.pledged)), (0, _mithril2['default'])('.fontsize-smallest.lineheight-tightest', 'Levantados')]), (0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', project.expires_at ? [(0, _mithril2['default'])('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), (0, _mithril2['default'])('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Restantes' : 'Restante')] : [(0, _mithril2['default'])('.fontsize-smallest.lineheight-tight', ['Prazo em', (0, _mithril2['default'])('br'), 'aberto'])])])])])])]);
    }
};

exports['default'] = projectCard;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectComments = {
    controller: function controller() {
        var loadComments = function loadComments(el, isInitialized) {
            return function (el, isInitialized) {
                if (isInitialized) {
                    return;
                }
                _h2['default'].fbParse();
            };
        };

        return { loadComments: loadComments };
    },
    view: function view(ctrl, args) {
        var project = args.project();
        return (0, _mithril2['default'])('.fb-comments[data-href="http://www.catarse.me/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() });
    }
};

exports['default'] = projectComments;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectContributionReportContentCard = {
    controller: function controller(args) {
        var stateClass = function stateClass(state) {
            var classes = {
                'paid': 'text-success',
                'refunded': 'text-refunded',
                'pending_refund': 'text-refunded',
                'pending': 'text-waiting',
                'refused': 'text-error'
            };

            return classes[state];
        };

        return {
            stateClass: stateClass
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution(),
            profile_img = _underscore2['default'].isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail,
            reward = contribution.reward || { minimum_value: 0, description: 'Nenhuma recompensa selecionada' };
        return (0, _mithril2['default'])('.w-clearfix.card.card-clickable', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-1.w-col-tiny-1', [(0, _mithril2['default'])('img.user-avatar.u-marginbottom-10[src=\'' + profile_img + '\']')]), (0, _mithril2['default'])('.w-col.w-col-11.w-col-tiny-11', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-3', [(0, _mithril2['default'])('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name), (0, _mithril2['default'])('.fontsize-smallest.lineheight-looser', [contribution.has_another ? [(0, _mithril2['default'])('a.link-hidden-light.badge.badge-light', '+1 apoio'), _mithril2['default'].trust('&nbsp;')] : '', contribution.anonymous ? (0, _mithril2['default'])('span.fa.fa-eye-slash.fontcolor-secondary') : ''])]), (0, _mithril2['default'])(".w-col.w-col-3", [(0, _mithril2['default'])(".lineheight-tighter", [(0, _mithril2['default'])('span.fa.fa-circle.fontsize-smallest.' + ctrl.stateClass(contribution.state), "."), "   ", (0, _mithril2['default'])("span.fontsize-large", 'R$ ' + _h2['default'].formatNumber(contribution.value, 2, 3))])]), (0, _mithril2['default'])(".w-col.w-col-3.w-hidden-small.w-hidden-tiny", [(0, _mithril2['default'])(".fontsize-smallest.fontweight-semibold", 'Recompensa: R$ ' + _h2['default'].formatNumber(reward.minimum_value, 2, 3)), (0, _mithril2['default'])(".fontsize-smallest", reward.description.substring(0, 80) + '...')]) /*,
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

//m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-detail-box'][href='#']")
exports['default'] = projectContributionReportContentCard;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectContributionReportContentCard = require('project-contribution-report-content-card');

var _projectContributionReportContentCard2 = _interopRequireDefault(_projectContributionReportContentCard);

var projectContributionReportContent = {
    view: function view(ctrl, args) {
        var list = args.list;
        return (0, _mithril2['default'])('.w-section.bg-gray.before-footer.section', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])(".w-row.u-marginbottom-20", [(0, _mithril2['default'])(".w-col.w-col-9.w-col-small-6.w-col-tiny-6", [(0, _mithril2['default'])(".fontsize-base", [(0, _mithril2['default'])("span.fontweight-semibold", list.isLoading() ? '' : list.total()), " apoios"])])]),
        //m(".fontsize-large.fontweight-semibold", "R$ 12.000,00")

        /*
         TODO: ordering filter template
        m(".w-col.w-col-3.w-col-small-6.w-col-tiny-6", [
            m(".w-form", [
                m("form[data-name='Email Form 5'][id='email-form-5'][name='email-form-5']", [
                    m(".fontsize-smallest.fontcolor-secondary", "Ordenar por:"),
                    m("select.w-select.text-field.positive.fontsize-smallest[id='field-9'][name='field-9']", [
                        m("option[value='']", "Data (recentes para antigos)"),
                        m("option[value='']", "Data (antigos para recentes)"),
                        m("option[value='']", "Valor (maior para menor)"),
                        m("option[value='First']", "Valor (menor para maior)")
                    ])
                ])
            ])
        ])*/
        _underscore2['default'].map(list.collection(), function (item) {
            var contribution = _mithril2['default'].prop(item);
            return _mithril2['default'].component(_projectContributionReportContentCard2['default'], { contribution: contribution });
        })]), (0, _mithril2['default'])('.w-section.section.bg-gray', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row.u-marginbottom-60', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : (0, _mithril2['default'])('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : _h2['default'].loader()])])])])]);
    }
};

exports['default'] = projectContributionReportContent;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var projectContributionReportHeader = {
    view: function view(ctrl, args) {
        var filterBuilder = args.filterBuilder,
            paymentStateFilter = _underscore2['default'].findWhere(filterBuilder, { label: 'payment_state' }),
            rewardFilter = _underscore2['default'].findWhere(filterBuilder, { label: 'reward_filter' }),
            mainFilter = _underscore2['default'].findWhere(filterBuilder, { component: 'FilterMain' }),
            project_id = args.filterVM.project_id();

        rewardFilter.data.options = args.mapRewardsToOptions();

        return (0, _mithril2['default'])('.w-section.dashboard-header', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-3'), (0, _mithril2['default'])('.w-col.w-col-6', [(0, _mithril2['default'])('.fontsize-larger.u-text-center.fontweight-semibold.lineheight-looser.u-marginbottom-30', 'Relatório de apoios')]), (0, _mithril2['default'])('.w-col.w-col-3')]), (0, _mithril2['default'])('.w-form', [(0, _mithril2['default'])('form', { onsubmit: args.submit }, [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-5', [(0, _mithril2['default'])('.w-row', [_mithril2['default'].component(c[paymentStateFilter.component], paymentStateFilter.data), _mithril2['default'].component(c[rewardFilter.component], rewardFilter.data)])]), (0, _mithril2['default'])('.w-col.w-col-7.u-margintop-20', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-8._w-sub-col', [_mithril2['default'].component(c[mainFilter.component], mainFilter.data)]), (0, _mithril2['default'])('.w-col.w-col-4.w-clearfix.w-hidden-small.w-hidden-tiny', [(0, _mithril2['default'])('a.alt-link.u-right.fontsize-small.lineheight-looser[target="__blank" href="/projects/' + project_id + '/edit#reports"]', [(0, _mithril2['default'])('span.fa.fa-download', '.'), ' Baixar relatórios'])])])])])])])])]);
    }
};

exports['default'] = projectContributionReportHeader;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectContributions = {
    controller: function controller(args) {
        var listVM = postgrest.paginationVM(_models2['default'].projectContribution),
            filterVM = postgrest.filtersVM({
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

        filterVM.project_id(args.project().id).waiting_payment(false);

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
        return (0, _mithril2['default'])('#project_contributions.content.w-col.w-col-12', [args.project().is_owner_or_admin ? (0, _mithril2['default'])('.w-row.u-marginbottom-20', [(0, _mithril2['default'])('.w-col.w-col-1', [(0, _mithril2['default'])('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
            onclick: ctrl.toggleWaiting()
        })]), (0, _mithril2['default'])('.w-col.w-col-5', [(0, _mithril2['default'])('label[for="contribution_state_available_to_count"]', 'Confirmados')]), (0, _mithril2['default'])('.w-col.w-col-1', [(0, _mithril2['default'])('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
            onclick: ctrl.toggleWaiting(true)
        })]), (0, _mithril2['default'])('.w-col.w-col-5', [(0, _mithril2['default'])('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')])]) : '', (0, _mithril2['default'])('.project-contributions', _underscore2['default'].map(list.collection(), function (contribution) {
            return (0, _mithril2['default'])('.w-clearfix', [(0, _mithril2['default'])('.w-row.u-marginbottom-20', [(0, _mithril2['default'])('.w-col.w-col-1', [(0, _mithril2['default'])('a[href="/users/' + contribution.user_id + '"]', [(0, _mithril2['default'])('.thumb.u-left.u-round[style="background-image: url(' + (!_underscore2['default'].isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')])]), (0, _mithril2['default'])('.w-col.w-col-11', [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold', [(0, _mithril2['default'])('a.link-hidden-dark[href="/users/' + contribution.user_id + '"]', contribution.user_name), contribution.is_owner_or_admin ? (0, _mithril2['default'])('.fontsize-smaller', ['R$ ' + _h2['default'].formatNumber(contribution.value, 2, 3), contribution.anonymous ? [_mithril2['default'].trust('&nbsp;-&nbsp;'), (0, _mithril2['default'])('strong', 'Apoiador anônimo')] : '']) : '', (0, _mithril2['default'])('.fontsize-smaller', _h2['default'].momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'), (0, _mithril2['default'])('.fontsize-smaller', contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora')])])]), (0, _mithril2['default'])('.divider.u-marginbottom-20')]);
        })), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : (0, _mithril2['default'])('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : _h2['default'].loader()])])]);
    }
};

exports['default'] = projectContributions;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectDashboardMenu = {
    controller: function controller(args) {
        var body = document.getElementsByTagName('body')[0],
            editLinksToggle = _h2['default'].toggleProp(true, false),
            showPublish = _h2['default'].toggleProp(true, false),
            bodyToggleForNav = _h2['default'].toggleProp('body-project open', 'body-project closed');

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
            bodyToggleForNav: bodyToggleForNav
        };
    },
    view: function view(ctrl, args) {
        var project = args.project(),
            projectRoute = '/projects/' + project.id,
            editRoute = projectRoute + '/edit',
            editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');
        var optionalOpt = project.mode === 'flex' ? (0, _mithril2['default'])('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

        ctrl.body.className = ctrl.bodyToggleForNav();

        return (0, _mithril2['default'])('#project-nav', [(0, _mithril2['default'])('.project-nav-wrapper', [(0, _mithril2['default'])('nav.w-section.dashboard-nav.side', [(0, _mithril2['default'])('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [(0, _mithril2['default'])('img.thumb-project-dashboard[src="' + (_underscore2['default'].isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), (0, _mithril2['default'])('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), (0, _mithril2['default'])('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), (0, _mithril2['default'])('#info-links', [(0, _mithril2['default'])('a#dashboard_home_link[class="dashboard-nav-link-left ' + (_h2['default'].locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [(0, _mithril2['default'])('span.fa.fa-bar-chart.fa-lg.fa-fw'), _i18nJs2['default'].t('start_tab', I18nScope())]), project.is_published ? [(0, _mithril2['default'])('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [(0, _mithril2['default'])('span.fa.fa.fa-table.fa-lg.fa-fw'), _i18nJs2['default'].t('reports_tab', I18nScope())]), (0, _mithril2['default'])('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [(0, _mithril2['default'])('span.fa.fa-bullhorn.fa-fw.fa-lg'), _i18nJs2['default'].t('posts_tab', I18nScope()), (0, _mithril2['default'])('span.badge', project.posts_count)])] : '']), (0, _mithril2['default'])('.edit-project-div', [!project.is_published ? '' : (0, _mithril2['default'])('button#toggle-edit-menu.dashboard-nav-link-left', {
            onclick: ctrl.editLinksToggle.toggle
        }, [(0, _mithril2['default'])('span.fa.fa-pencil.fa-fw.fa-lg'), _i18nJs2['default'].t('edit_project', I18nScope())]), ctrl.editLinksToggle() ? (0, _mithril2['default'])('#edit-menu-items', [(0, _mithril2['default'])('#dashboard-links', [!project.is_published || project.is_admin_role ? [(0, _mithril2['default'])('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), (0, _mithril2['default'])('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Financiamento')] : '', (0, _mithril2['default'])('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), (0, _mithril2['default'])('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), (0, _mithril2['default'])('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', 'Orçamento'), (0, _mithril2['default'])('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), (0, _mithril2['default'])('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), (0, _mithril2['default'])('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.mode === 'flex' || project.is_published || project.state === 'approved' || project.is_admin_role ? [(0, _mithril2['default'])('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [(0, _mithril2['default'])('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [(0, _mithril2['default'])('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published && ctrl.showPublish() ? [(0, _mithril2['default'])('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? (0, _mithril2['default'])('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', _i18nJs2['default'].t('send', I18nScope())) : '', project.state === 'approved' ? (0, _mithril2['default'])('a.btn.btn-medium[href="/projects/' + project.id + '/validate_publish"]', [_i18nJs2['default'].t('publish', I18nScope()), _mithril2['default'].trust('&nbsp;&nbsp;'), (0, _mithril2['default'])('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? (0, _mithril2['default'])('a.btn.btn-medium[href="/flexible_projects/' + project.flex_id + '/validate_publish"]', [_i18nJs2['default'].t('publish', I18nScope()), _mithril2['default'].trust('&nbsp;&nbsp;'), (0, _mithril2['default'])('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' && project.is_published ? [(0, _mithril2['default'])('.btn-send-draft-fixed', _underscore2['default'].isNull(project.expires_at) ? (0, _mithril2['default'])('a.w-button.btn.btn-medium.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', _i18nJs2['default'].t('announce_expiration', I18nScope())) : '')] : '']])])]), (0, _mithril2['default'])('a.btn-dashboard href="js:void(0);"', {
            onclick: ctrl.bodyToggleForNav.toggle
        }, [(0, _mithril2['default'])('span.fa.fa-bars.fa-lg')])]);
    }
};

exports['default'] = projectDashboardMenu;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _chartjs = require('chartjs');

var _chartjs2 = _interopRequireDefault(_chartjs);

var projectDataChart = {
    controller: function controller(args) {
        var resource = _underscore2['default'].first(args.collection()),
            source = !_underscore2['default'].isUndefined(resource) ? resource.source : [],
            mountDataset = function mountDataset() {
            return [{
                fillColor: 'rgba(126,194,69,0.2)',
                strokeColor: 'rgba(126,194,69,1)',
                pointColor: 'rgba(126,194,69,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: _underscore2['default'].map(source, function (item) {
                    return item[args.dataKey];
                })
            }];
        },
            renderChart = function renderChart(element, isInitialized) {
            if (!isInitialized) {
                var ctx = element.getContext('2d');

                new _chartjs2['default'](ctx).Line({
                    labels: _underscore2['default'].map(source, function (item) {
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
        return (0, _mithril2['default'])('.card.u-radius.medium.u-marginbottom-30', [(0, _mithril2['default'])('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-12.overflow-auto', [(0, _mithril2['default'])('canvas[id="chart"][width="860"][height="300"]', {
            config: ctrl.renderChart
        })])])]);
    }
};

exports['default'] = projectDataChart;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectDataTable = {
    controller: function controller(args) {
        var table = _mithril2['default'].prop(args.table),
            sortIndex = _mithril2['default'].prop(-1);

        var comparator = function comparator(a, b) {
            var idx = sortIndex(),

            //Check if a custom comparator is used => Read component description
            x = _underscore2['default'].isArray(a[idx]) && a[idx].length > 1 ? a[idx][0] : a[idx],
                y = _underscore2['default'].isArray(b[idx]) && b[idx].length > 1 ? b[idx][0] : b[idx];

            if (x < y) {
                return -1;
            }
            if (y < x) {
                return 1;
            }
            return 0;
        };

        var sortTable = function sortTable(idx) {
            var header = _underscore2['default'].first(table()),
                body = undefined;
            if (sortIndex() === idx) {
                body = _underscore2['default'].rest(table()).reverse();
            } else {
                sortIndex(idx);
                body = _underscore2['default'].rest(table()).sort(comparator);
            }

            table(_underscore2['default'].union([header], body));
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
        var header = _underscore2['default'].first(ctrl.table()),
            body = _underscore2['default'].rest(ctrl.table());
        return (0, _mithril2['default'])('.table-outer.u-marginbottom-60', [(0, _mithril2['default'])('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _underscore2['default'].map(header, function (heading, idx) {
            var sort = function sort() {
                return ctrl.sortTable(idx);
            };
            return (0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [(0, _mithril2['default'])('a.link-hidden[href="javascript:void(0);"]', {
                onclick: sort
            }, [heading + ' ', (0, _mithril2['default'])('span.fa.fa-sort')])]);
        })), (0, _mithril2['default'])('.table-inner.fontsize-small', _underscore2['default'].map(body, function (rowData) {
            return (0, _mithril2['default'])('.w-row.table-row', _underscore2['default'].map(rowData, function (row) {
                //Check if a custom comparator is used => Read component description
                row = _underscore2['default'].isArray(row) && row.length > 1 ? row[1] : row;
                return (0, _mithril2['default'])('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [(0, _mithril2['default'])('div', row)]);
            }));
        }))]);
    }
};

exports['default'] = projectDataTable;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectShareBox = require('project-share-box');

var _projectShareBox2 = _interopRequireDefault(_projectShareBox);

var projectHighlight = {
    controller: function controller() {
        return {
            displayShareBox: _h2['default'].toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            address = project().address || { state_acronym: '', city: '' };

        return (0, _mithril2['default'])('#project-highlight', [project().video_embed_url ? (0, _mithril2['default'])('.w-embed.w-video.project-video', {
            style: 'min-height: 240px;'
        }, [(0, _mithril2['default'])('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : (0, _mithril2['default'])('.project-image', {
            style: 'background-image:url(' + project().original_image + ');'
        }), (0, _mithril2['default'])('.project-blurb', project().headline), (0, _mithril2['default'])('.u-text-center-small-only.u-marginbottom-30', [!_underscore2['default'].isNull(address) ? (0, _mithril2['default'])('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', [(0, _mithril2['default'])('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '', (0, _mithril2['default'])('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project().category_id + '"]', [(0, _mithril2['default'])('span.fa.fa-tag'), ' ', project().category_name]), (0, _mithril2['default'])('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
            onclick: ctrl.displayShareBox.toggle
        }, 'Compartilhar'), ctrl.displayShareBox() ? _mithril2['default'].component(_projectShareBox2['default'], {
            project: project,
            displayShareBox: ctrl.displayShareBox
        }) : ''])]);
    }
};

exports['default'] = projectHighlight;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectRewardList = require('project-reward-list');

var _projectRewardList2 = _interopRequireDefault(_projectRewardList);

var _projectSuggestedContributions = require('project-suggested-contributions');

var _projectSuggestedContributions2 = _interopRequireDefault(_projectSuggestedContributions);

var _projectContributions = require('project-contributions');

var _projectContributions2 = _interopRequireDefault(_projectContributions);

var _projectAbout = require('project-about');

var _projectAbout2 = _interopRequireDefault(_projectAbout);

var _projectComments = require('project-comments');

var _projectComments2 = _interopRequireDefault(_projectComments);

var _projectPosts = require('project-posts');

var _projectPosts2 = _interopRequireDefault(_projectPosts);

var projectMain = {
    controller: function controller(args) {
        var project = args.project,
            displayTabContent = function displayTabContent() {
            var hash = window.location.hash,
                c_opts = {
                project: project
            },
                tabs = {
                '#rewards': (0, _mithril2['default'])('.w-col.w-col-12', _mithril2['default'].component(_projectRewardList2['default'], _underscore2['default'].extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts))),
                '#contribution_suggestions': _mithril2['default'].component(_projectSuggestedContributions2['default'], c_opts),
                '#contributions': _mithril2['default'].component(_projectContributions2['default'], c_opts),
                '#about': _mithril2['default'].component(_projectAbout2['default'], _underscore2['default'].extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts)),
                '#comments': _mithril2['default'].component(_projectComments2['default'], c_opts),
                '#posts': _mithril2['default'].component(_projectPosts2['default'], c_opts)
            };

            if (_underscore2['default'].isEmpty(hash) || hash === '#_=_' || hash === '#preview') {
                return tabs['#about'];
            }

            return tabs[hash];
        };

        _h2['default'].redrawHashChange();

        return {
            displayTabContent: displayTabContent
        };
    },
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('section.section[itemtype="http://schema.org/CreativeWork"]', [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', args.project() ? ctrl.displayTabContent() : '')])]);
    }
};

exports['default'] = projectMain;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _tooltip = require('tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var projectMode = {
    view: function view(ctrl, args) {
        var project = args.project(),
            mode = project.mode,
            modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
            modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
            goal = _underscore2['default'].isNull(project.goal) ? 'não definida' : _h2['default'].formatNumber(project.goal),
            tooltip = function tooltip(el) {
            return _mithril2['default'].component(tooltip, {
                el: el,
                text: mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + _h2['default'].momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.',
                width: 280
            });
        };

        return (0, _mithril2['default'])('#' + mode + '.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_underscore2['default'].isEmpty(project) ? (0, _mithril2['default'])('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), (0, _mithril2['default'])('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold', 'Meta R$ ' + _h2['default'].selfOrEmpty(goal, '--')), (0, _mithril2['default'])('.w-inline-block.fontsize-smallest._w-inline-block', [!_underscore2['default'].isEmpty(project) ? modeTitle : '', tooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
    }
};

exports['default'] = projectMode;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _mithrilPostgrest = require('mithril-postgrest');

var _mithrilPostgrest2 = _interopRequireDefault(_mithrilPostgrest);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectPosts = {
    ctrl: function ctrl(args) {
        var listVM = _mithrilPostgrest2['default'].paginationVM(_models2['default'].projectPostDetail),
            filterVM = _mithrilPostgrest2['default'].filtersVM({
            project_id: 'eq'
        });

        filterVM.project_id(args.project().id);

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

        return (0, _mithril2['default'])('.project-posts.w-section', [(0, _mithril2['default'])('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _underscore2['default'].isEmpty(list.collection()) ? (0, _mithril2['default'])('.w-hidden-small.w-hidden-tiny', [(0, _mithril2['default'])('.fontsize-base.u-marginbottom-30.u-margintop-20', 'Toda novidade publicada no Catarse é enviada diretamente para o email de quem já apoiou seu projeto e também fica disponível para visualização no site. Você pode optar por deixá-la pública, ou visível somente para seus apoiadores aqui nesta aba.')]) : '' : '', (0, _mithril2['default'])('.w-row.u-marginbottom-20', [(0, _mithril2['default'])('.w-col.w-col-4'), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('a.btn.btn-edit.btn-small[href=\'/pt/projects/' + project.id + '/edit#posts\']', 'Escrever novidade')]), (0, _mithril2['default'])('.w-col.w-col-4')])] : '', _underscore2['default'].map(list.collection(), function (post) {
            return (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-1'), (0, _mithril2['default'])('.w-col.w-col-10', [(0, _mithril2['default'])('.post', [(0, _mithril2['default'])('.u-marginbottom-60 .w-clearfix', [(0, _mithril2['default'])('.fontsize-small.fontcolor-secondary.u-text-center', _h2['default'].momentify(post.created_at)), (0, _mithril2['default'])('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title), !_underscore2['default'].isEmpty(post.comment_html) ? (0, _mithril2['default'])('.fontsize-base', _mithril2['default'].trust(post.comment_html)) : (0, _mithril2['default'])('.fontsize-base', 'Post exclusivo para apoiadores.')]), (0, _mithril2['default'])('.divider.u-marginbottom-60')])]), (0, _mithril2['default'])('.w-col.w-col-1')]);
        }), (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? 'Nenhuma novidade.' : (0, _mithril2['default'])('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : _h2['default'].loader()])])])]);
    }
};

exports['default'] = projectPosts;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var projectReminderCount = {
    view: function view(ctrl, args) {
        var project = args.resource;
        return (0, _mithril2['default'])('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [(0, _mithril2['default'])('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), (0, _mithril2['default'])('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), (0, _mithril2['default'])('.fontsize-jumbo', project.reminder_count)]);
    }
};

exports['default'] = projectReminderCount;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectRewardList = {
    view: function view(ctrl, args) {
        //FIXME: MISSING ADJUSTS
        // - add draft admin modifications
        var project = args.project;
        return (0, _mithril2['default'])('#rewards.u-marginbottom-30', _underscore2['default'].map(args.rewardDetails(), function (reward) {
            var contributionUrlWithReward = '/projects/' + project().id + '/contributions/new?reward_id=' + reward.id;

            return (0, _mithril2['default'])('a[class="' + (_h2['default'].rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project().open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project().open_for_contributions && !_h2['default'].rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [(0, _mithril2['default'])('.u-marginbottom-20', [(0, _mithril2['default'])('.fontsize-base.fontweight-semibold', 'Para R$ ' + _h2['default'].formatNumber(reward.minimum_value) + ' ou mais'), (0, _mithril2['default'])('.fontsize-smaller.fontweight-semibold', _h2['default'].pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? (0, _mithril2['default'])('.maximum_contributions.in_time_to_confirm.clearfix', [(0, _mithril2['default'])('.pending.fontsize-smallest.fontcolor-secondary', _h2['default'].pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', _h2['default'].rewardSouldOut(reward) ? (0, _mithril2['default'])('.u-margintop-10', [(0, _mithril2['default'])('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : (0, _mithril2['default'])('.u-margintop-10', [(0, _mithril2['default'])('span.badge.badge-attention.fontsize-smaller', [(0, _mithril2['default'])('span.fontweight-bold', 'Limitada'), ' (' + _h2['default'].rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), (0, _mithril2['default'])('.fontsize-smaller.u-margintop-20', _mithril2['default'].trust(_h2['default'].simpleFormat(reward.description))), !_underscore2['default'].isEmpty(reward.deliver_at) ? (0, _mithril2['default'])('.fontsize-smaller', [(0, _mithril2['default'])('b', 'Estimativa de Entrega: '), _h2['default'].momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project().open_for_contributions && !_h2['default'].rewardSouldOut(reward) ? (0, _mithril2['default'])('.project-reward-box-hover', [(0, _mithril2['default'])('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
        }));
    }
};

exports['default'] = projectRewardList;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectCard = require('project-card');

var _projectCard2 = _interopRequireDefault(_projectCard);

var projectRow = {
    view: function view(ctrl, args) {
        var collection = args.collection,
            title = args.title || collection.title,
            ref = args.ref,
            wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

        if (collection.loader() || collection.collection().length > 0) {
            return (0, _mithril2['default'])(wrapper, [(0, _mithril2['default'])('.w-container', [!_underscore2['default'].isUndefined(collection.title) || !_underscore2['default'].isUndefined(collection.hash) ? (0, _mithril2['default'])('.w-row.u-marginbottom-30', [(0, _mithril2['default'])('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('.fontsize-large.lineheight-looser', title)]), (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.loader() ? _h2['default'].loader() : (0, _mithril2['default'])('.w-row', _underscore2['default'].map(collection.collection(), function (project) {
                return _mithril2['default'].component(_projectCard2['default'], {
                    project: project,
                    ref: ref
                });
            }))])]);
        } else {
            return (0, _mithril2['default'])('div');
        }
    }
};

exports['default'] = projectRow;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var projectShareBox = {
    controller: function controller() {
        return {
            displayEmbed: _h2['default'].toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('.pop-share', {
            style: 'display: block;'
        }, [(0, _mithril2['default'])('.w-hidden-main.w-hidden-medium.w-clearfix', [(0, _mithril2['default'])('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
            onclick: args.displayShareBox.toggle
        }, 'Fechar'), (0, _mithril2['default'])('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), (0, _mithril2['default'])('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [(0, _mithril2['default'])('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), (0, _mithril2['default'])('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [(0, _mithril2['default'])('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project().name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dtwitter&via=catarse"]')]), (0, _mithril2['default'])('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
            onclick: ctrl.displayEmbed.toggle
        }, '< embed >'), ctrl.displayEmbed() ? (0, _mithril2['default'])('.embed-expanded.u-margintop-30', [(0, _mithril2['default'])('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), (0, _mithril2['default'])('.w-form', [(0, _mithril2['default'])('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project().id + '/embed" width="300px" scrolling="no"></iframe>"]')]), (0, _mithril2['default'])('.card-embed', [(0, _mithril2['default'])('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().id + '/embed"][width="300px"][scrolling="no"]')])]) : '', (0, _mithril2['default'])('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project().permalink + '?ref=facebook&title=' + args.project().name + '"][target="_blank"]', [(0, _mithril2['default'])('span.fa.fa-facebook'), ' Compartilhe']), (0, _mithril2['default'])('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project().name + ' htts://www.catarse.me/' + args.project().permalink + '?ref=twitterr"][target="_blank"]', [(0, _mithril2['default'])('span.fa.fa-twitter'), ' Tweet'])]);
    }
};

exports['default'] = projectShareBox;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectMode = require('project-mode');

var _projectMode2 = _interopRequireDefault(_projectMode);

var _projectReminder = require('project-reminder');

var _projectReminder2 = _interopRequireDefault(_projectReminder);

var _projectUserCard = require('project-user-card');

var _projectUserCard2 = _interopRequireDefault(_projectUserCard);

var projectSidebar = {
    controller: function controller(args) {
        var project = args.project,
            animateProgress = function animateProgress(el, isInitialized) {
            if (!isInitialized) {
                (function () {
                    var animation = undefined,
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
                            pledgedEl.innerText = 'R$ ' + _h2['default'].formatNumber(pledged);
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
            animateProgress: animateProgress
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
                'approved': _i18nJs2['default'].t('display_status.approved', I18nScope()),
                'online': _h2['default'].existy(project().zone_expires_at) ? _i18nJs2['default'].t('display_status.online', I18nScope({ date: _h2['default'].momentify(project().zone_expires_at) })) : '',
                'failed': _i18nJs2['default'].t('display_status.failed', I18nScope({ date: _h2['default'].momentify(project().zone_expires_at), goal: project().goal })),
                'rejected': _i18nJs2['default'].t('display_status.rejected', I18nScope()),
                'in_analysis': _i18nJs2['default'].t('display_status.in_analysis', I18nScope()),
                'successful': _i18nJs2['default'].t('display_status.successful', I18nScope({ date: _h2['default'].momentify(project().zone_expires_at) })),
                'waiting_funds': _i18nJs2['default'].t('display_status.waiting_funds', I18nScope()),
                'draft': _i18nJs2['default'].t('display_status.draft', I18nScope())
            };

            return states[project().state];
        };

        return (0, _mithril2['default'])('#project-sidebar.aside', [(0, _mithril2['default'])('.project-stats', [(0, _mithril2['default'])('.project-stats-inner', [(0, _mithril2['default'])('.project-stats-info', [(0, _mithril2['default'])('.u-marginbottom-20', [(0, _mithril2['default'])('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? _h2['default'].formatNumber(project().pledged) : '0')), (0, _mithril2['default'])('.fontsize-small.u-text-center-small-only', [_i18nJs2['default'].t('contributors_call', I18nScope()), (0, _mithril2['default'])('span#contributors.fontweight-semibold', _i18nJs2['default'].t('contributors_count', I18nScope({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + _i18nJs2['default'].t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope()) : ''])]), (0, _mithril2['default'])('.meter', [(0, _mithril2['default'])('#progressBar.meter-fill', {
            style: {
                width: project().progress + '%'
            }
        })]), (0, _mithril2['default'])('.w-row.u-margintop-10', [(0, _mithril2['default'])('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [(0, _mithril2['default'])('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), (0, _mithril2['default'])('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [(0, _mithril2['default'])('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [(0, _mithril2['default'])('span.fontweight-semibold', remaining.total), _i18nJs2['default'].t('remaining_time.' + remaining.unit, I18nScope({ count: remaining.total }))] : '')])])]), (0, _mithril2['default'])('.w-row', [_mithril2['default'].component(_projectMode2['default'], {
            project: project
        })])]), project().open_for_contributions ? (0, _mithril2['default'])('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project().id + '/contributions/new"]', _i18nJs2['default'].t('submit', I18nScope())) : '', project().open_for_contributions ? _mithril2['default'].component(_projectReminder2['default'], {
            project: project,
            type: 'link'
        }) : '', (0, _mithril2['default'])('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), (0, _mithril2['default'])('.user-c', _mithril2['default'].component(_projectUserCard2['default'], {
            userDetails: args.userDetails
        }))]);
    }
};

exports['default'] = projectSidebar;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var projectSuggestedContributions = {
    view: function view(ctrl, args) {
        var project = args.project();
        var suggestionUrl = function suggestionUrl(amount) {
            return '/projects/' + project.project_id + '/contributions/new?amount=' + amount;
        },
            suggestedValues = [10, 25, 50, 100];

        return (0, _mithril2['default'])('#suggestions', _underscore2['default'].map(suggestedValues, function (amount) {
            return (0, _mithril2['default'])('a[href="' + suggestionUrl(amount) + '"].card-reward.card-big.card-secondary.u-marginbottom-20', [(0, _mithril2['default'])('.fontsize-larger', 'R$ ' + amount)]);
        }));
    }
};

exports['default'] = projectSuggestedContributions;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _projectReminder = require('projectReminder');

var _projectReminder2 = _interopRequireDefault(_projectReminder);

var projectTabs = {
    controller: function controller(args) {
        var isFixed = _mithril2['default'].prop(false),
            originalPosition = _mithril2['default'].prop(-1);

        var fixOnScroll = function fixOnScroll(el) {
            return function () {
                var viewportOffset = el.getBoundingClientRect();

                if (window.scrollY <= originalPosition()) {
                    originalPosition(-1);
                    isFixed(false);
                    _mithril2['default'].redraw();
                }

                if (viewportOffset.top < 0 || window.scrollY > originalPosition() && originalPosition() > 0) {
                    if (!isFixed()) {
                        originalPosition(window.scrollY);
                        isFixed(true);
                        _mithril2['default'].redraw();
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

        return (0, _mithril2['default'])('nav-wrapper', project() ? [(0, _mithril2['default'])(mainClass, {
            config: ctrl.navDisplay
        }, [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-8', [!_.isEmpty(rewards()) ? (0, _mithril2['default'])('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (_h2['default'].hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
            style: 'float: left;'
        }, 'Recompensas') : (0, _mithril2['default'])('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (_h2['default'].hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
            style: 'float: left;'
        }, 'Valores Sugeridos'), (0, _mithril2['default'])('a[id="about-link"][class="dashboard-nav-link mf ' + (_h2['default'].hashMatch('#about') || _h2['default'].hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
            style: 'float: left;'
        }, 'Sobre'), (0, _mithril2['default'])('a[id="posts-link"][class="dashboard-nav-link mf ' + (_h2['default'].hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
            style: 'float: left;'
        }, ['Novidades ', (0, _mithril2['default'])('span.badge', project() ? project().posts_count : '')]), (0, _mithril2['default'])('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (_h2['default'].hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
            style: 'float: left;'
        }, ['Apoios ', (0, _mithril2['default'])('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributions : '-')]), (0, _mithril2['default'])('a[id="comments-link"][class="dashboard-nav-link mf ' + (_h2['default'].hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
            style: 'float: left;'
        }, ['Comentários ', project() ? (0, _mithril2['default'])('fb:comments-count[href="http://www.catarse.me/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', _mithril2['default'].trust('&nbsp;')) : '-'])]), project() ? (0, _mithril2['default'])('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [(0, _mithril2['default'])('.w-row.project-nav-back-button', [(0, _mithril2['default'])('.w-col.w-col-6.w-col-medium-8', [(0, _mithril2['default'])('a.w-button.btn[href="/projects/' + project().id + '/contributions/new"]', 'Apoiar ‍este projeto')]), (0, _mithril2['default'])('.w-col.w-col-6.w-col-medium-4', [_mithril2['default'].component(_projectReminder2['default'], { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? (0, _mithril2['default'])('.w-section.project-nav') : ''] : '');
    }
};

exports['default'] = projectTabs;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _ownerMessageContent = require('owner-message-content');

var _ownerMessageContent2 = _interopRequireDefault(_ownerMessageContent);

var _modalBox = require('modal-box');

var _modalBox2 = _interopRequireDefault(_modalBox);

var projectUserCard = {
    controller: function controller(args) {
        return { displayModal: _h2['default'].toggleProp(false, true) };
    },
    view: function view(ctrl, args) {
        var contactModalC = [_ownerMessageContent2['default'], args.userDetails];

        return (0, _mithril2['default'])('#user-card', _underscore2['default'].map(args.userDetails(), function (userDetail) {
            return (0, _mithril2['default'])('.u-marginbottom-30.u-text-center-small-only', [ctrl.displayModal() ? _mithril2['default'].component(_modalBox2['default'], {
                displayModal: ctrl.displayModal,
                content: contactModalC
            }) : '', (0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), (0, _mithril2['default'])('.w-col.w-col-8', [(0, _mithril2['default'])('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [(0, _mithril2['default'])('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), (0, _mithril2['default'])('.fontsize-smallest', [_h2['default'].pluralize(userDetail.total_published_projects, ' criado', ' criados'), _mithril2['default'].trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), _h2['default'].pluralize(userDetail.total_contributed_projects, ' apoiado', ' apoiados')]), (0, _mithril2['default'])('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_underscore2['default'].isEmpty(userDetail.facebook_link) ? (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_underscore2['default'].isEmpty(userDetail.twitter_username) ? (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _underscore2['default'].map(userDetail.links, function (link) {
                var parsedLink = _h2['default'].parseUrl(link);

                return !_underscore2['default'].isEmpty(parsedLink.hostname) ? (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', parsedLink.hostname)]) : '';
            })]), !_underscore2['default'].isEmpty(userDetail.email) ? [(0, _mithril2['default'])('a.w-button.btn.btn-terciary.btn-small.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.displayModal.toggle }, 'Enviar mensagem')] : ''])])]);
        }));
    }
};

exports['default'] = projectUserCard;
module.exports = exports['default'];
/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var search = {
    view: function view(ctrl) {
        var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var action = args.action || '/pt/explore',
            method = args.method || 'GET';

        return (0, _mithril2['default'])('#search.w-container.w-hidden-main.w-hidden-medium', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-10.u-marginbottom-20', [(0, _mithril2['default'])('.w-form', [(0, _mithril2['default'])('form#email-form', { action: action, method: method }, [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [(0, _mithril2['default'])('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')]), (0, _mithril2['default'])('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [(0, _mithril2['default'])('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [(0, _mithril2['default'])('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
    }
};

exports['default'] = search;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var slider = {
    controller: function controller(args) {
        var interval = undefined;
        var selectedSlideIdx = _mithril2['default'].prop(0),
            translationSize = _mithril2['default'].prop(1600),
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
                _mithril2['default'].redraw();
            }, sliderTime);
        },
            resetSliderTimer = function resetSliderTimer() {
            clearInterval(interval);
            startSliderTimer();
        },
            config = function config(el, isInitialized, context) {
            if (!isInitialized) {
                translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                _mithril2['default'].redraw();
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
        var slideClass = args.slideClass || '',
            wrapperClass = args.wrapperClass || '',
            effect = args.effect || 'slide',
            sliderClick = function sliderClick(fn, param) {
            fn(param);
            ctrl.resetSliderTimer();
        },
            effectStyle = function effectStyle(idx, translateStr) {
            var slideFx = 'transform: ' + translateStr + '; -webkit-transform: ' + translateStr + '; -ms-transform:' + translateStr,
                fadeFx = idx === ctrl.selectedSlideIdx() ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden;';

            return effect === 'fade' ? fadeFx : slideFx;
        };

        return (0, _mithril2['default'])('.w-slider.' + wrapperClass, {
            config: ctrl.config
        }, [(0, _mithril2['default'])('.fontsize-larger', args.title), (0, _mithril2['default'])('.w-slider-mask', [_underscore2['default'].map(args.slides, function (slide, idx) {
            var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

            return (0, _mithril2['default'])('.slide.w-slide.' + slideClass, {
                style: effectStyle(idx, translateStr) + ' ' + slide.customStyle
            }, [(0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-8.w-col-push-2', slide.content)])])]);
        }), (0, _mithril2['default'])('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
            onclick: function onclick() {
                return sliderClick(ctrl.decrementSlide);
            }
        }, [(0, _mithril2['default'])('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')]), (0, _mithril2['default'])('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
            onclick: function onclick() {
                return sliderClick(ctrl.incrementSlide);
            }
        }, [(0, _mithril2['default'])('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')]), (0, _mithril2['default'])('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', (0, _underscore2['default'])(args.slides.length).times(function (idx) {
            return (0, _mithril2['default'])('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                onclick: function onclick() {
                    return sliderClick(ctrl.selectedSlideIdx, idx);
                }
            });
        }))])]);
    }
};

exports['default'] = slider;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var teamMembers = {
    controller: function controller() {
        var vm = {
            collection: _mithril2['default'].prop([])
        },
            groupCollection = function groupCollection(collection, groupTotal) {
            return _underscore2['default'].map(_underscore2['default'].range(Math.ceil(collection.length / groupTotal)), function (i) {
                return collection.slice(i * groupTotal, (i + 1) * groupTotal);
            });
        };

        _models2['default'].teamMember.getPage().then(function (data) {
            vm.collection(groupCollection(data, 4));
        });

        return {
            vm: vm
        };
    },
    view: function view(ctrl) {
        return (0, _mithril2['default'])('#team-members-static.w-section.section', [(0, _mithril2['default'])('.w-container', [_underscore2['default'].map(ctrl.vm.collection(), function (group) {
            return (0, _mithril2['default'])('.w-row.u-text-center', [_underscore2['default'].map(group, function (member) {
                return (0, _mithril2['default'])('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [(0, _mithril2['default'])('a.alt-link[href="/users/' + member.id + '"]', [(0, _mithril2['default'])('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), (0, _mithril2['default'])('.fontweight-semibold.fontsize-base', member.name)]), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')]);
            })]);
        })])]);
    }
};

exports['default'] = teamMembers;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var teamTotal = {
    controller: function controller() {
        var vm = {
            collection: _mithril2['default'].prop([])
        };

        _models2['default'].teamTotal.getRow().then(function (data) {
            vm.collection(data);
        });

        return {
            vm: vm
        };
    },
    view: function view(ctrl, args) {
        return (0, _mithril2['default'])('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
            return (0, _mithril2['default'])('.w-container', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2'), (0, _mithril2['default'])('.w-col.w-col-8', [(0, _mithril2['default'])('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), (0, _mithril2['default'])('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + _h2['default'].formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), (0, _mithril2['default'])('.w-col.w-col-2')])]);
        })]);
    }
};

exports['default'] = teamTotal;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var tooltip = {
    controller: function controller(args) {
        var parentHeight = _mithril2['default'].prop(0),
            width = _mithril2['default'].prop(args.width || 280),
            top = _mithril2['default'].prop(0),
            left = _mithril2['default'].prop(0),
            opacity = _mithril2['default'].prop(0),
            parentOffset = _mithril2['default'].prop({ top: 0, left: 0 }),
            tooltip = _h2['default'].toggleProp(0, 1),
            toggle = function toggle() {
            tooltip.toggle();
            _mithril2['default'].redraw();
        };

        var setParentPosition = function setParentPosition(el, isInitialized) {
            if (!isInitialized) {
                parentOffset(_h2['default'].cumulativeOffset(el));
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
        return (0, _mithril2['default'])(args.el, {
            onclick: ctrl.toggle,
            config: ctrl.setParentPosition,
            style: { cursor: 'pointer' }
        }, ctrl.tooltip() ? [(0, _mithril2['default'])('.tooltip.dark[style="width: ' + width + 'px; top: ' + ctrl.top() + 'px; left: ' + ctrl.left() + 'px;"]', {
            config: ctrl.setPosition
        }, [(0, _mithril2['default'])('.fontsize-smallest', args.text)])] : '');
    }
};

exports['default'] = tooltip;
module.exports = exports['default'];
/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var I18nScope = _underscore2['default'].partial(_h2['default'].i18nScope, 'users.balance');

var userBalanceRequestModelContent = {
    controller: function controller(args) {
        var vm = postgrest.filtersVM({ user_id: 'eq' }),
            balance = args.balance,
            loaderOpts = _models2['default'].balanceTransfer.postOptions({
            user_id: balance.user_id }),
            requestLoader = postgrest.loaderWithToken(loaderOpts),
            displayDone = _h2['default'].toggleProp(false, true),
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

        return ctrl.loadBankA() ? _h2['default'].loader() : (0, _mithril2['default'])('div', _underscore2['default'].map(ctrl.bankAccounts(), function (item) {
            return [(0, _mithril2['default'])('.modal-dialog-header', [(0, _mithril2['default'])('.fontsize-large.u-text-center', _i18nJs2['default'].t('withdraw', I18nScope()))]), ctrl.displayDone() ? (0, _mithril2['default'])('.modal-dialog-content.u-text-center', [(0, _mithril2['default'])('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), (0, _mithril2['default'])('p.fontsize-large', _i18nJs2['default'].t('sucess_message', I18nScope()))]) : (0, _mithril2['default'])('.modal-dialog-content', [(0, _mithril2['default'])('.fontsize-base.u-marginbottom-20', [(0, _mithril2['default'])('span.fontweight-semibold', 'Valor:'), _mithril2['default'].trust('&nbsp;'), (0, _mithril2['default'])('span.text-success', 'R$ ' + _h2['default'].formatNumber(balance.amount, 2, 3))]), (0, _mithril2['default'])('.fontsize-base.u-marginbottom-10', [(0, _mithril2['default'])('span', { style: { 'font-weight': ' 600' } }, _i18nJs2['default'].t('bank.account', I18nScope()))]), (0, _mithril2['default'])('.fontsize-small.u-marginbottom-10', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontcolor-secondary', _i18nJs2['default'].t('bank.name', I18nScope())), _mithril2['default'].trust('&nbsp;'), item.owner_name]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontcolor-secondary', _i18nJs2['default'].t('bank.cpf_cnpj', I18nScope())), _mithril2['default'].trust('&nbsp;'), item.owner_document]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontcolor-secondary', _i18nJs2['default'].t('bank.bank_name', I18nScope())), _mithril2['default'].trust('&nbsp;'), item.bank_name]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontcolor-secondary', _i18nJs2['default'].t('bank.agency', I18nScope())), _mithril2['default'].trust('&nbsp;'), item.agency + '-' + item.agency_digit]), (0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontcolor-secondary', _i18nJs2['default'].t('bank.account', I18nScope())), _mithril2['default'].trust('&nbsp;'), item.account + '-' + item.account_digit])])]), !ctrl.displayDone() ? (0, _mithril2['default'])('.modal-dialog-nav-bottom', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-3'), (0, _mithril2['default'])('.w-col.w-col-6', [ctrl.requestLoader() ? _h2['default'].loader() : (0, _mithril2['default'])('a.btn.btn-large.btn-request-fund[href="js:void(0);"]', { onclick: ctrl.requestFund }, 'Solicitar saque')]), (0, _mithril2['default'])('.w-col.w-col-3')])]) : ''];
        }));
    }
};

exports['default'] = userBalanceRequestModelContent;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var I18nScope = _.partial(_h2['default'].i18nScope, 'users.balance');

var userBalanceTrasactionRow = {
    controller: function controller(args) {
        var expanded = _h2['default'].toggleProp(false, true);

        if (args.index == 0) {
            expanded.toggle();
        }

        return {
            expanded: expanded
        };
    },
    view: function view(ctrl, args) {
        var item = args.item,
            createdAt = _h2['default'].momentFromString(item.created_at, 'YYYY-MM-DD');

        return (0, _mithril2['default'])('div[class=\'balance-card ' + (ctrl.expanded() ? 'card-detailed-open' : '') + '\']', (0, _mithril2['default'])('.w-clearfix.card.card-clickable', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-tiny-2', [(0, _mithril2['default'])('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')), (0, _mithril2['default'])('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))]), (0, _mithril2['default'])('.w-col.w-col-10.w-col-tiny-10', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smaller.fontcolor-secondary', I18n.t('debit', I18nScope())), _mithril2['default'].trust('&nbsp;'), (0, _mithril2['default'])('span.fontsize-base.text-error', 'R$ ' + _h2['default'].formatNumber(Math.abs(item.debit), 2, 3))])]), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smaller.fontcolor-secondary', I18n.t('credit', I18nScope())), _mithril2['default'].trust('&nbsp;'), (0, _mithril2['default'])('span.fontsize-base.text-success', 'R$ ' + _h2['default'].formatNumber(item.credit, 2, 3))])]), (0, _mithril2['default'])('.w-col.w-col-4', [(0, _mithril2['default'])('div', [(0, _mithril2['default'])('span.fontsize-smaller.fontcolor-secondary', I18n.t('totals', I18nScope())), _mithril2['default'].trust('&nbsp;'), (0, _mithril2['default'])('span.fontsize-base', 'R$ ' + _h2['default'].formatNumber(item.total_amount, 2, 3))])])])])]), (0, _mithril2['default'])('a.w-inline-block.arrow-admin.' + (ctrl.expanded() ? 'arrow-admin-opened' : '') + '.fa.fa-chevron-down.fontcolor-secondary[href="js:(void(0));"]', { onclick: ctrl.expanded.toggle })]), ctrl.expanded() ? (0, _mithril2['default'])('.card', _.map(item.source, function (transaction) {
            var pos = transaction.amount >= 0;

            return (0, _mithril2['default'])('div', [(0, _mithril2['default'])('.w-row.fontsize-small.u-marginbottom-10', [(0, _mithril2['default'])('.w-col.w-col-2', [(0, _mithril2['default'])('.text-' + (pos ? 'success' : 'error'), (pos ? '+' : '-') + ' R$ ' + _h2['default'].formatNumber(Math.abs(transaction.amount), 2, 3))]), (0, _mithril2['default'])('.w-col.w-col-10', [(0, _mithril2['default'])('div', transaction.event_name + ' ' + transaction.origin_object.name)])]), (0, _mithril2['default'])('.divider.u-marginbottom-10')]);
        })) : '');
    }
};

exports['default'] = userBalanceTrasactionRow;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var userBalanceTransactions = {
    controller: function controller(args) {
        args.balanceTransactionManager.load();

        return {
            list: args.balanceTransactionManager.list
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.list;

        return (0, _mithril2['default'])('.w-section.section.card-terciary.before-footer.balance-transactions-area', [(0, _mithril2['default'])('.w-container', _underscore2['default'].map(list.collection(), function (item, index) {
            return _mithril2['default'].component(c.UserBalanceTransactionRow, { item: item, index: index });
        })), (0, _mithril2['default'])('.container', [(0, _mithril2['default'])('.w-row.u-margintop-40', [(0, _mithril2['default'])('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : (0, _mithril2['default'])('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Carregar mais') : _h2['default'].loader()])])])]);
    }
};

exports['default'] = userBalanceTransactions;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var userCard = {
    controller: function controller(args) {
        var vm = _h2['default'].idVM,
            userDetails = _mithril2['default'].prop([]);

        vm.id(args.userId);

        //FIXME: can call anon requests when token fails (requestMaybeWithToken)
        _models2['default'].userDetail.getRowWithToken(vm.parameters()).then(userDetails);

        return {
            userDetails: userDetails
        };
    },
    view: function view(ctrl) {
        return (0, _mithril2['default'])('#user-card', _underscore2['default'].map(ctrl.userDetails(), function (userDetail) {
            return (0, _mithril2['default'])('.card.card-user.u-radius.u-marginbottom-30[itemprop="author"]', [(0, _mithril2['default'])('.w-row', [(0, _mithril2['default'])('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', [(0, _mithril2['default'])('img.thumb.u-round[width="100"][itemprop="image"][src="' + userDetail.profile_img_thumbnail + '"]')]), (0, _mithril2['default'])('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [(0, _mithril2['default'])('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop="name"]', [(0, _mithril2['default'])('a.link-hidden[href="/users/' + userDetail.id + '"]', userDetail.name)]), (0, _mithril2['default'])('.fontsize-smallest.lineheight-looser[itemprop="address"]', userDetail.address_city), (0, _mithril2['default'])('.fontsize-smallest', userDetail.total_published_projects + ' projetos criados'), (0, _mithril2['default'])('.fontsize-smallest', 'apoiou ' + userDetail.total_contributed_projects + ' projetos')])]), (0, _mithril2['default'])('.project-author-contacts', [(0, _mithril2['default'])('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [!_underscore2['default'].isEmpty(userDetail.facebook_link) ? (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', 'Perfil no Facebook')]) : '', !_underscore2['default'].isEmpty(userDetail.twitter_username) ? (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', 'Perfil no Twitter')]) : '', _underscore2['default'].map(userDetail.links, function (link) {
                return (0, _mithril2['default'])('li', [(0, _mithril2['default'])('a.link-hidden[itemprop="url"][href="' + link + '"][target="_blank"]', link)]);
            })])]), !_underscore2['default'].isEmpty(userDetail.email) ? (0, _mithril2['default'])('a.btn.btn-medium.btn-message[href="mailto:' + userDetail.email + '"][itemprop="email"][target="_blank"]', 'Enviar mensagem') : '']);
        }));
    }
};

exports['default'] = userCard;
module.exports = exports['default'];
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var youtubeLightbox = {
    controller: function controller(args) {
        var player = undefined;
        var showLightbox = _h2['default'].toggleProp(false, true),
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
        return (0, _mithril2['default'])('#youtube-lightbox', [(0, _mithril2['default'])('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', {
            onclick: ctrl.showLightbox.toggle
        }), (0, _mithril2['default'])('#lightbox.w-lightbox-backdrop[style="display:' + (ctrl.showLightbox() ? 'block' : 'none') + '"]', [(0, _mithril2['default'])('.w-lightbox-container', [(0, _mithril2['default'])('.w-lightbox-content', [(0, _mithril2['default'])('.w-lightbox-view', [(0, _mithril2['default'])('.w-lightbox-frame', [(0, _mithril2['default'])('figure.w-lightbox-figure', [(0, _mithril2['default'])('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), (0, _mithril2['default'])('#ytvideo.embedly-embed.w-lightbox-embed', { config: ctrl.setYoutube })])])]), (0, _mithril2['default'])('.w-lightbox-spinner.w-lightbox-hide'), (0, _mithril2['default'])('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), (0, _mithril2['default'])('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), (0, _mithril2['default'])('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.closeVideo })]), (0, _mithril2['default'])('.w-lightbox-strip')])])]);
    }
};

exports['default'] = youtubeLightbox;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i18nJs = require('i18n-js');

var _i18nJs2 = _interopRequireDefault(_i18nJs);

var homeVM = function homeVM(I18n) {
    return function () {
        var i18nStart = I18n.translations[I18n.currentLocale()].projects.home,
            banners = i18nStart.banners;

        return {
            banners: banners
        };
    };
};

exports['default'] = homeVM;
module.exports = exports['default'];
'use strict';

window.c.vms.project = (function (m, h, _, models) {
    return function (project_id, project_user_id) {
        var vm = postgrest.filtersVM({
            project_id: 'eq'
        }),
            idVM = h.idVM,
            projectDetails = m.prop([]),
            userDetails = m.prop([]),
            rewardDetails = m.prop([]);

        vm.project_id(project_id);
        idVM.id(project_user_id);

        var lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
            lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
            lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters())),
            isLoading = function isLoading() {
            return lProject() || lUser() || lReward();
        };

        lProject.load().then(function (data) {
            lUser.load().then(userDetails);
            lReward.load().then(rewardDetails);

            projectDetails(data);
        });

        return {
            projectDetails: _.compose(_.first, projectDetails),
            userDetails: userDetails,
            rewardDetails: rewardDetails,
            isLoading: isLoading
        };
    };
})(window.m, window.c.h, window._, window.c.models);
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _replaceDiacritics = require('replaceDiacritics');

var _replaceDiacritics2 = _interopRequireDefault(_replaceDiacritics);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var vm = postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    reward_id: 'eq',
    project_id: 'eq'
}),
    paramToString = function paramToString(p) {
    return (p || '').toString().trim();
};

vm.state('');
vm.order({
    id: 'desc'
});

vm.full_text_index.toFilter = function () {
    var filter = paramToString(vm.full_text_index());
    return filter && (0, _replaceDiacritics2['default'])(filter) || undefined;
};

exports['default'] = vm;
module.exports = exports['default'];
"use strict";

window.c.vms.start = (function (_) {
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _h = require('h');

var _h2 = _interopRequireDefault(_h);

var _mithrilPostgrest = require('mithril-postgrest');

var _mithrilPostgrest2 = _interopRequireDefault(_mithrilPostgrest);

var _replaceDiacritics = require('replaceDiacritics');

var _replaceDiacritics2 = _interopRequireDefault(_replaceDiacritics);

var vm = _mithrilPostgrest2['default'].filtersVM({
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
    return filter && _h2['default'].momentFromString(filter).endOf('day').format('');
};

vm.created_at.gte.toFilter = function () {
    var filter = paramToString(vm.created_at.gte());
    return filter && _h2['default'].momentFromString(filter).format();
};

vm.full_text_index.toFilter = function () {
    var filter = paramToString(vm.full_text_index());
    return filter && (0, _replaceDiacritics2['default'])(filter) || undefined;
};

exports['default'] = vm;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

exports['default'] = postgrest.paginationVM(_models2['default'].contributionDetail, 'id.desc', { 'Prefer': 'count=exact' });
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _replaceDiacritics = require('replaceDiacritics');

var _replaceDiacritics2 = _interopRequireDefault(_replaceDiacritics);

var vm = postgrest.filtersVM({
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
    return filter && (0, _replaceDiacritics2['default'])(filter) || undefined;
};

exports['default'] = vm;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _models = require('models');

var _models2 = _interopRequireDefault(_models);

exports['default'] = postgrest.paginationVM(_models2['default'].user, 'id.desc', { 'Prefer': 'count=exact' });
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImguanMiLCJtb2RlbHMuanMiLCJmbGV4LmpzIiwiaW5zaWdodHMuanMiLCJqb2JzLmpzIiwibGl2ZS1zdGF0aXN0aWNzLmpzIiwicHJvamVjdHMtY29udHJpYnV0aW9uLXJlcG9ydC5qcyIsInByb2plY3RzLWRhc2hib2FyZC5qcyIsInByb2plY3RzLWV4cGxvcmUuanMiLCJwcm9qZWN0cy1ob21lLmpzIiwicHJvamVjdHMtc2hvdy5qcyIsInB1Ymxpc2guanMiLCJ0ZWFtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWl0ZW0uanMiLCJhZG1pbi1jb250cmlidXRpb24tdXNlci5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi5qcyIsImFkbWluLWV4dGVybmFsLWFjdGlvbi5qcyIsImFkbWluLWZpbHRlci5qcyIsImFkbWluLWlucHV0LWFjdGlvbi5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1ub3RpZmljYXRpb24taGlzdG9yeS5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1jYXJkLmpzIiwiYWRtaW4tcHJvamVjdC5qcyIsImFkbWluLXJhZGlvLWFjdGlvbi5qcyIsImFkbWluLXJlc2V0LXBhc3N3b3JkLmpzIiwiYWRtaW4tcmV3YXJkLmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24taGlzdG9yeS5qcyIsImFkbWluLXRyYW5zYWN0aW9uLmpzIiwiYWRtaW4tdXNlci1kZXRhaWwuanMiLCJhZG1pbi11c2VyLWl0ZW0uanMiLCJhZG1pbi11c2VyLmpzIiwiY2F0ZWdvcnktYnV0dG9uLmpzIiwiY29udHJpYnV0aW9uLWFjdGl2aXRpZXMuanMiLCJkcm9wZG93bi5qcyIsImZpbHRlci1idXR0b24uanMiLCJmaWx0ZXItZGF0ZS1yYW5nZS5qcyIsImZpbHRlci1kcm9wZG93bi5qcyIsImZpbHRlci1tYWluLmpzIiwiZmlsdGVyLW51bWJlci1yYW5nZS5qcyIsImxhbmRpbmctcWEuanMiLCJsYW5kaW5nLXNpZ251cC5qcyIsIm1vZGFsLWJveC5qcyIsIm9ubGluZS1zdWNjZXNzLW1vZGFsLWNvbnRlbnQuanMiLCJvd25lci1tZXNzYWdlLWNvbnRlbnQuanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9uLXJlcG9ydC1jb250ZW50LWNhcmQuanMiLCJwcm9qZWN0LWNvbnRyaWJ1dGlvbi1yZXBvcnQtY29udGVudC5qcyIsInByb2plY3QtY29udHJpYnV0aW9uLXJlcG9ydC1oZWFkZXIuanMiLCJwcm9qZWN0LWNvbnRyaWJ1dGlvbnMuanMiLCJwcm9qZWN0LWRhc2hib2FyZC1tZW51LmpzIiwicHJvamVjdC1kYXRhLWNoYXJ0LmpzIiwicHJvamVjdC1kYXRhLXRhYmxlLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LW1vZGUuanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXJvdy5qcyIsInByb2plY3Qtc2hhcmUtYm94LmpzIiwicHJvamVjdC1zaWRlYmFyLmpzIiwicHJvamVjdC1zdWdnZXN0ZWQtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtdGFicy5qcyIsInByb2plY3QtdXNlci1jYXJkLmpzIiwic2VhcmNoLmpzIiwic2xpZGVyLmpzIiwidGVhbS1tZW1iZXJzLmpzIiwidGVhbS10b3RhbC5qcyIsInRvb2x0aXAuanMiLCJ1c2VyLWJhbGFuY2UtcmVxdWVzdC1tb2RhbC1jb250ZW50LmpzIiwidXNlci1iYWxhbmNlLXRyYW5zYWN0aW9uLXJvdy5qcyIsInVzZXItYmFsYW5jZS10cmFuc2FjdGlvbnMuanMiLCJ1c2VyLWNhcmQuanMiLCJ5b3V0dWJlLWxpZ2h0Ym94LmpzIiwidm1zL2hvbWUtdm0uanMiLCJ2bXMvcHJvamVjdC12bS5qcyIsInZtcy9wcm9qZWN0cy1jb250cmlidXRpb24tcmVwb3J0LWZpbHRlci12bS5qcyIsInZtcy9zdGFydC12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWZpbHRlci12bS5qcyIsImFkbWluL3VzZXJzL3VzZXItbGlzdC12bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozt1QkFBYyxTQUFTOzs7O3NCQUNKLFFBQVE7Ozs7c0JBQ1YsU0FBUzs7OztBQUd0QixJQUFNLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxHQUFHLEVBQUs7QUFBRSxXQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQztDQUFFO0lBQy9ELFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxJQUFJLEVBQUs7QUFDcEIsUUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDakUsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDO1FBQ3ZELE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQyxXQUFPLE9BQU8sS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDckY7SUFDUCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksR0FBRyxFQUFzQjtRQUFwQixVQUFVLHlEQUFHLEVBQUU7O0FBQ2pDLFdBQU8sR0FBRyxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUM7Q0FDL0I7SUFDSyxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsR0FBUztBQUN2Qix3QkFBTyxN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SSxFQUFFLENBQUM7Q0FDdEMsQ0FBQzs7O0FBR04sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDMUIsTUFBRSxFQUFFLE1BQU07Q0FDYixDQUFDLENBQUM7O0FBRUgsRUFBRSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNwQyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLFdBQU8sTUFBTSxDQUFDO0NBQ2pCLENBQUM7O0FBRUYsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNyQyxRQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDakQsV0FBTyxNQUFNLElBQUksb0NBQWtCLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQztDQUMzRCxDQUFDOztxQkFFYSxFQUFFOzs7Ozs7Ozs7O3VCQzNCSCxTQUFTOzs7O3NCQUNKLFFBQVE7Ozs7cUJBRVosU0FBUyxDQUFDLFlBQVksQ0FBQyxvQkFBTyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBJMThuIGZyb20gJ2kxOG4tanMnO1xuXG5cbiAgICBjb25zdCBoYXNoTWF0Y2ggPSAoc3RyKSA9PiB7IHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gc3RyOyB9LFxuICAgICAgICBwYXJhbUJ5TmFtZSA9IChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxOYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyksXG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBub3JtYWxOYW1lICsgJz0oW14mI10qKScpLFxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgICAgICB9LFxuXHRcdHNlbGZPckVtcHR5ID0gKG9iaiwgZW1wdHlTdGF0ZSA9ICcnKSA9PiB7XG4gICAgcmV0dXJuIG9iaiA/IG9iaiA6IGVtcHR5U3RhdGU7XG5cdFx0fSxcbiAgICAgICAgc2V0TW9tZW50aWZ5TG9jYWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgbW9tZW50LmxvY2FsZSgncHQnLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1Nob3J0OiAnamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXonLnNwbGl0KCdfJylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhpc3R5ID0gKHgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4ICE9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50aWZ5ID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICAgICAgICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmxvY2FsZSgncHQnKS5mb3JtYXQoZm9ybWF0KSA6ICdubyBkYXRlJztcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9yZUFjdGlvbiA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGlmICghc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oYWN0aW9uLCBhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxTdG9yZWRBY3Rpb24gPSAoYWN0aW9uLCBmdW5jKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZnVuYy5jYWxsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXNjdXNzID0gKHBhZ2UsIGlkZW50aWZpZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGQgPSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICBzID0gZC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNxdXNfY29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLnVybCA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHMuc3JjID0gJy8vY2F0YXJzZWZsZXguZGlzcXVzLmNvbS9lbWJlZC5qcyc7XG4gICAgICAgICAgICBzLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lc3RhbXAnLCArbmV3IERhdGUoKSk7XG4gICAgICAgICAgICAoZC5oZWFkIHx8IGQuYm9keSkuYXBwZW5kQ2hpbGQocyk7XG4gICAgICAgICAgICByZXR1cm4gbSgnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50RnJvbVN0cmluZyA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV1cm9wZWFuID0gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpO1xuICAgICAgICAgICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lVW5pdHMgPSB7XG4gICAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgfSxcbiAgICAgICAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZFRpbWUgPSB0cmFuc2xhdGVkVGltZVVuaXRzLFxuICAgICAgICAgICAgICAgIHVuaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2pVbml0ID0gdHJhbnNsYXRlZFRpbWVbdGltZS51bml0IHx8ICdzZWNvbmRzJ107XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aW1lLnRvdGFsIDw9IDEpID8gcHJvalVuaXQuc2xpY2UoMCwgLTEpIDogcHJvalVuaXQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1bml0OiB1bml0KCksXG4gICAgICAgICAgICAgICAgdG90YWw6IHRpbWUudG90YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9OdW1iZXIgZm9ybWF0dGluZyBoZWxwZXJzXG4gICAgICAgIGdlbmVyYXRlRm9ybWF0TnVtYmVyID0gKHMsIGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyLCBuLCB4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzTnVtYmVyKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbnVtYmVyLnRvRml4ZWQoTWF0aC5tYXgoMCwgfn5uKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXROdW1iZXIgPSBnZW5lcmF0ZUZvcm1hdE51bWJlcignLicsICcsJyksXG5cbiAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgICAgICAgICBwLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCgoKHAoKSA9PT0gYWx0ZXJuYXRlU3RhdGUpID8gZGVmYXVsdFN0YXRlIDogYWx0ZXJuYXRlU3RhdGUpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlkVk0gPSBwb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGlkOiAnZXEnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIGdldEN1cnJlbnRQcm9qZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0LXNob3ctcm9vdCcpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSByb290LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJhbWV0ZXJzJyk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UmRUb2tlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBfLmZpcnN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuYW1lPXJkLXRva2VuXScpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1ldGEgPyBtZXRhLmNvbnRlbnQgOiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBfLmZpcnN0KGJvZHkpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VyJyk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb24gPT09IGFjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQgPSAoYXZhdGFyUGF0aCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGF2YXRhclBhdGggfHwgJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vVGVtcGxhdGVzXG4gICAgICAgIGxvYWRlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMCB1LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdpbWdbYWx0PVwiTG9hZGVyXCJdW3NyYz1cImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9jYXRhcnNlLmZpbGVzL2xvYWRlci5naWZcIl0nKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV3RmVhdHVyZUJhZGdlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4uYmFkZ2UuYmFkZ2Utc3VjY2Vzcy5tYXJnaW4tc2lkZS01JywgSTE4bi50KCdwcm9qZWN0cy5uZXdfZmVhdHVyZV9iYWRnZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJ5UGFyc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQodHJ5UGFyc2UsIDUwMCk7IC8vdXNlIHRpbWVvdXQgdG8gd2FpdCBhc3luYyBvZiBmYWNlYm9va1xuICAgICAgICB9LFxuXG4gICAgICAgIHBsdXJhbGl6ZSA9IChjb3VudCwgcywgcCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjb3VudCA+IDEgPyBjb3VudCArIHAgOiBjb3VudCArIHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbXBsZUZvcm1hdCA9IChzdHIgPSAnJykgPT4ge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG4vZywgJzxiciAvPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICByZXdhcmRTb3VsZE91dCA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAgICAgICAgIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPj0gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucykgOiBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkUmVtYW5pbmcgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyAtIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVXJsID0gKGhyZWYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgVUlIZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlVJSGVscGVyLnNldHVwUmVzcG9uc2l2ZUlmcmFtZXMoJChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BbmNob3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2ggPT09IGVsLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVFbWFpbCA9IChlbWFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmUgPSAvXigoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rXFwuKStbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdezIsfSkkL2k7XG4gICAgICAgICAgICByZXR1cm4gcmUudGVzdChlbWFpbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9wdC9sb2dpbic7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3VtdWxhdGl2ZU9mZnNldCA9IChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDA7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgdG9wICs9IGVsZW1lbnQub2Zmc2V0VG9wICB8fCAwO1xuICAgICAgICAgICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDA7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICAgICAgfSB3aGlsZSAoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZU1vZGFsID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwtY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbC1iYWNrZHJvcCcpWzBdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VGbGFzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ljb24tY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGkxOG5TY29wZSA9IChzY29wZSwgb2JqKSA9PiB7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwge307XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIG9iaiwge3Njb3BlOiBzY29wZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZHJhd0hhc2hDaGFuZ2UgPSAoYmVmb3JlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IF8uaXNGdW5jdGlvbihiZWZvcmUpID9cbiAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gOiBtLnJlZHJhdztcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF1dGhlbnRpY2l0eVRva2VuID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IF8uZmlyc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW25hbWU9Y3NyZi10b2tlbl0nKSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YSA/IG1ldGEuY29udGVudCA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0ZVNjcm9sbFRvID0gKGVsKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2Nyb2xsZWQgPSB3aW5kb3cuc2Nyb2xsWTtcblxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gY3VtdWxhdGl2ZU9mZnNldChlbCkudG9wLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gMzAwLFxuICAgICAgICAgICAgICAgIGRGcmFtZSA9IChvZmZzZXQgLSBzY3JvbGxlZCkgLyBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAvL0Vhc2VJbk91dEN1YmljIGVhc2luZyBmdW5jdGlvbi4gV2UnbGwgYWJzdHJhY3QgYWxsIGFuaW1hdGlvbiBmdW5zIGxhdGVyLlxuICAgICAgICAgICAgICAgIGVhc2VkID0gKHQpID0+IHQgPCAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDEsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZWFzZWQoc2Nyb2xsZWQgLyBvZmZzZXQpICogc2Nyb2xsZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIHBvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcm9sbGVkID49IG9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsZWQgPSBzY3JvbGxlZCArIGRGcmFtZTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2Nyb2xsVG8gPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXRUcmlnZ2VyID0gKGVsLCBhbmNob3JJZCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuY2hvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5jaG9ySWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChhbmNob3JFbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVTY3JvbGxUbyhhbmNob3JFbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VHJpZ2dlcihlbCwgZWwuaGFzaC5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBSRFRyYWNrZXIgPSAoZXZlbnRJZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlZ3JhdGlvblNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgICAgICBpbnRlZ3JhdGlvblNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCdcbiAgICAgICAgICAgICAgICAgICAgaW50ZWdyYXRpb25TY3JpcHQuaWQgPSAnUkRJbnRlZ3JhdGlvbic7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpbnRlZ3JhdGlvblNjcmlwdC5pZCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbnRlZ3JhdGlvblNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlZ3JhdGlvblNjcmlwdC5vbmxvYWQgPSAoKSA9PiBSZEludGVncmF0aW9uLmludGVncmF0ZShnZXRSZFRva2VuKCksIGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZWdyYXRpb25TY3JpcHQuc3JjID0gJ2h0dHBzOi8vZDMzNWx1dXB1Z3N5Mi5jbG91ZGZyb250Lm5ldC9qcy9pbnRlZ3JhdGlvbi9zdGFibGUvcmQtanMtaW50ZWdyYXRpb24ubWluLmpzJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICBzZXRNb21lbnRpZnlMb2NhbGUoKTtcbiAgICBjbG9zZUZsYXNoKCk7XG4gICAgY2xvc2VNb2RhbCgpO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgYXV0aGVudGljaXR5VG9rZW4sXG4gICAgY3VtdWxhdGl2ZU9mZnNldCxcbiAgICBkaXNjdXNzLFxuICAgIGV4aXN0eSxcbiAgICB2YWxpZGF0ZUVtYWlsLFxuICAgIG1vbWVudGlmeSxcbiAgICBtb21lbnRGcm9tU3RyaW5nLFxuICAgIGZvcm1hdE51bWJlcixcbiAgICBpZFZNLFxuICAgIGdldFVzZXIsXG4gICAgZ2V0Q3VycmVudFByb2plY3QsXG4gICAgdG9nZ2xlUHJvcCxcbiAgICBsb2FkZXIsXG4gICAgbmV3RmVhdHVyZUJhZGdlLFxuICAgIGZiUGFyc2UsXG4gICAgcGx1cmFsaXplLFxuICAgIHNpbXBsZUZvcm1hdCxcbiAgICB0cmFuc2xhdGVkVGltZSxcbiAgICByZXdhcmRTb3VsZE91dCxcbiAgICByZXdhcmRSZW1hbmluZyxcbiAgICBwYXJzZVVybCxcbiAgICBoYXNoTWF0Y2gsXG4gICAgcmVkcmF3SGFzaENoYW5nZSxcbiAgICB1c2VBdmF0YXJPckRlZmF1bHQsXG4gICAgbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICBuYXZpZ2F0ZVRvRGV2aXNlLFxuICAgIHN0b3JlQWN0aW9uLFxuICAgIGNhbGxTdG9yZWRBY3Rpb24sXG4gICAgVUlIZWxwZXIsXG4gICAgdG9BbmNob3IsXG4gICAgcGFyYW1CeU5hbWUsXG4gICAgaTE4blNjb3BlLFxuICAgIFJEVHJhY2tlcixcbiAgICBzZWxmT3JFbXB0eSxcbiAgICBzY3JvbGxUb1xufTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuXG5jb25zdCBtb2RlbHMgPSB7XG4gICAgY29udHJpYnV0aW9uRGV0YWlsOiBwb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbl9kZXRhaWxzJyksXG4gICAgY29udHJpYnV0aW9uQWN0aXZpdHk6IHBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2FjdGl2aXRpZXMnKSxcbiAgICBwcm9qZWN0RGV0YWlsOiBwb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICAgIHVzZXJEZXRhaWw6IHBvc3RncmVzdC5tb2RlbCgndXNlcl9kZXRhaWxzJyksXG4gICAgYmFsYW5jZTogcG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlcycpLFxuICAgIGJhbGFuY2VUcmFuc2FjdGlvbjogcG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlX3RyYW5zYWN0aW9ucycpLFxuICAgIGJhbGFuY2VUcmFuc2ZlcjogcG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlX3RyYW5zZmVycycpLFxuICAgIHVzZXI6IHBvc3RncmVzdC5tb2RlbCgndXNlcnMnKSxcbiAgICBiYW5rQWNjb3VudDogcG9zdGdyZXN0Lm1vZGVsKCdiYW5rX2FjY291bnRzJyksXG4gICAgcmV3YXJkRGV0YWlsOiBwb3N0Z3Jlc3QubW9kZWwoJ3Jld2FyZF9kZXRhaWxzJyksXG4gICAgcHJvamVjdFJlbWluZGVyOiBwb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcmVtaW5kZXJzJyksXG4gICAgY29udHJpYnV0aW9uczogcG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgZGlyZWN0TWVzc2FnZTogcG9zdGdyZXN0Lm1vZGVsKCdkaXJlY3RfbWVzc2FnZXMnKSxcbiAgICB0ZWFtVG90YWw6IHBvc3RncmVzdC5tb2RlbCgndGVhbV90b3RhbHMnKSxcbiAgICBwcm9qZWN0QWNjb3VudDogcG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2FjY291bnRzJyksXG4gICAgcHJvamVjdENvbnRyaWJ1dGlvbjogcG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnMnKSxcbiAgICBwcm9qZWN0UG9zdERldGFpbDogcG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2RheScpLFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmOiBwb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfcmVmJyksXG4gICAgcHJvamVjdDogcG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0cycpLFxuICAgIHByb2plY3RTZWFyY2g6IHBvc3RncmVzdC5tb2RlbCgncnBjL3Byb2plY3Rfc2VhcmNoJyksXG4gICAgY2F0ZWdvcnk6IHBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcmllcycpLFxuICAgIGNhdGVnb3J5VG90YWxzOiBwb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X3RvdGFscycpLFxuICAgIGNhdGVnb3J5Rm9sbG93ZXI6IHBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcnlfZm9sbG93ZXJzJyksXG4gICAgdGVhbU1lbWJlcjogcG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgICBub3RpZmljYXRpb246IHBvc3RncmVzdC5tb2RlbCgnbm90aWZpY2F0aW9ucycpLFxuICAgIHN0YXRpc3RpYzogcG9zdGdyZXN0Lm1vZGVsKCdzdGF0aXN0aWNzJyksXG4gICAgc3VjY2Vzc2Z1bFByb2plY3Q6IHBvc3RncmVzdC5tb2RlbCgnc3VjY2Vzc2Z1bF9wcm9qZWN0cycpXG59O1xuXG5tb2RlbHMudGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG5tb2RlbHMucmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbm1vZGVscy5wcm9qZWN0LnBhZ2VTaXplKDMwKTtcbm1vZGVscy5jYXRlZ29yeS5wYWdlU2l6ZSg1MCk7XG5tb2RlbHMuY29udHJpYnV0aW9uQWN0aXZpdHkucGFnZVNpemUoNDApO1xubW9kZWxzLnN1Y2Nlc3NmdWxQcm9qZWN0LnBhZ2VTaXplKDkpO1xuXG5leHBvcnQgZGVmYXVsdCBtb2RlbHM7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJ1xuaW1wb3J0IHBvc3RncmVzdCBmcm9tICdtaXRocmlsLXBvc3RncmVzdCdcbmltcG9ydCBoIGZyb20gJy4uL2gnXG5pbXBvcnQgbW9kZWxzIGZyb20gJy4uL21vZGVscydcbmltcG9ydCBsYW5kaW5nU2lnbnVwIGZyb20gJy4uL2MvbGFuZGluZy1zaWdudXAnXG5pbXBvcnQgcHJvamVjdFJvdyBmcm9tICcuLi9jL3Byb2plY3Qtcm93J1xuaW1wb3J0IGxhbmRpbmdRQSBmcm9tICcuLi9jL2xhbmRpbmctcWEnXG5cbmNvbnN0IEZsZXggPSB7XG4gICAgY29udHJvbGxlciAoKSB7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgIHByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgIGwgPSBtLnByb3AoKSxcbiAgICAgICAgICAgIHNhbXBsZTMgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDMpLFxuICAgICAgICAgICAgYnVpbGRlciA9IHtcbiAgICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZmF6dW0uY2F0YXJzZS5tZS9vYnJpZ2Fkby1sYW5kaW5nLWNhdGFyc2UtZmxleCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGREaXNxdXMgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmxleFZNID0gcG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgbW9kZTogJ2VxJyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzdGF0c0xvYWRlciA9IHBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpO1xuXG4gICAgICAgIGZsZXhWTS5tb2RlKCdmbGV4Jykuc3RhdGUoJ29ubGluZScpLnJlY29tbWVuZGVkKHRydWUpO1xuXG4gICAgICAgIGNvbnN0IHByb2plY3RzTG9hZGVyID0gcG9zdGdyZXN0LmxvYWRlcihtb2RlbHMucHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmbGV4Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgc3RhdHNMb2FkZXIubG9hZCgpLnRoZW4oc3RhdHMpO1xuXG4gICAgICAgIHByb2plY3RzTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShwcm9qZWN0cywgc2FtcGxlMykpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGREaXNxdXM6IGFkZERpc3F1cyxcbiAgICAgICAgICAgIGJ1aWxkZXI6IGJ1aWxkZXIsXG4gICAgICAgICAgICBzdGF0c0xvYWRlcjogc3RhdHNMb2FkZXIsXG4gICAgICAgICAgICBzdGF0czogc3RhdHMsXG4gICAgICAgICAgICBwcm9qZWN0c0xvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICBwcm9qZWN0czoge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogcHJvamVjdHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5sb2dvLWZsZXgtaG9tZVtzcmM9XFwnL2Fzc2V0cy9sb2dvLWZsZXgucG5nXFwnXVt3aWR0aD1cXCczNTlcXCddJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS02MC53LWNvbC1wdXNoLTIudy1jb2wtOCcsICdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmchIENhZGFzdHJlIHNldSBlbWFpbCBlIHNhaWJhIGNvbW8gaW5zY3JldmVyIG8gc2V1IHByb2pldG8gbm8gZmxleCEnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyOiBjdHJsLmJ1aWxkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSwgW1xuICAgICAgICAgICAgICAgIG0oJy5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyJywgJ1ByYSBxdWVtIHNlcsOhPycpLCBtKCcuZm9udHNpemUtYmFzZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwJywgJ0luaWNpYXJlbW9zIGEgZmFzZSBkZSB0ZXN0ZXMgY29tIGNhdGVnb3JpYXMgZGUgcHJvamV0b3MgZXNwZWPDrWZpY2FzJyksIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOTNhMDFiNjZlMjUwYWNhNjdjYl9pY29uLXplbG8tY29tLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ0NhdXNhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhaXMsIHNhw7pkZSwgYWp1ZGFzIGh1bWFuaXTDoXJpYXMsIHByb3Rlw6fDo28gYW9zIGFuaW1haXMsIGVtcHJlZW5kZWRvcmlzbW8gc29jaW9hbWJpZW50YWwsIGF0aXZpc21vIG91IHF1YWxxdWVyIGNvaXNhIHF1ZSB1bmEgYXMgcGVzc29hcyBwYXJhIGZhemVyIG8gYmVtLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkyOWEwZGFlYTIzMGE1ZjEyY2RfaWNvbi16ZWxvLXBlc3NvYWwucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnVmFxdWluaGFzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCdwLmZvbnRzaXplLWJhc2UnLCAnQ2FtcGFuaGFzIHNpbXBsZXMgcXVlIHByZWNpc2FtIGRlIGZsZXhpYmlsaWRhZGUgcGFyYSBhcnJlY2FkYXIgZGluaGVpcm8gY29tIHBlc3NvYXMgcHLDs3hpbWFzLiBFc3RhcmVtb3MgYWJlcnRvcyBhIHVtYSB2YXJpZWRhZGUgZGUgY2FtcGFuaGFzIHBlc3NvYWlzIHF1ZSBwb2RlbSBpciBkZXNkZSBjb2JyaXIgY3VzdG9zIGRlIGVzdHVkb3MgYSBhanVkYXIgcXVlbSBwcmVjaXNhIGRlIHRyYXRhbWVudG8gbcOpZGljby4gRGUganVudGFyIGEgZ3JhbmEgcGFyYSBmYXplciBhcXVlbGEgZmVzdGEgYSBjb21wcmFyIHByZXNlbnRlcyBwYXJhIGFsZ3XDqW0gY29tIGEgYWp1ZGEgZGEgZ2FsZXJhLiAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctZ3JlZW5saW1lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS1tYXJnaW5ib3R0b20tNjAudS10ZXh0LWNlbnRlcicsICdDb21vIGZ1bmNpb25hcsOhPycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWM1NzhiMjg0NDkzZTJhNDI4YV96ZWxvLW1vbmV5LnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0ZpcXVlIGNvbSBxdWFudG8gYXJyZWNhZGFyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ08gZmxleCDDqSBwYXJhIGltcHVsc2lvbmFyIGNhbXBhbmhhcyBvbmRlIHRvZG8gZGluaGVpcm8gw6kgYmVtIHZpbmRvISBWb2PDqiBmaWNhIGNvbSB0dWRvIHF1ZSBjb25zZWd1aXIgYXJyZWNhZGFyLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlkMzdjMDEzZDRhM2VlNjg3ZDJfaWNvbi1yZXdhcmQucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTsOjbyBwcmVjaXNhIGRlIHJlY29tcGVuc2FzJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ05vIGZsZXggb2ZlcmVjZXIgcmVjb21wZW5zYXMgw6kgb3BjaW9uYWwuIFZvY8OqIGVzY29saGUgc2Ugb2ZlcmVjw6otbGFzIGZheiBzZW50aWRvIHBhcmEgbyBzZXUgcHJvamV0byBlIGNhbXBhbmhhLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWZiMDFiNjZlMjUwYWNhNjdlM19pY29uLWN1cmFkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZvY8OqIG1lc21vIHB1YmxpY2Egc2V1IHByb2pldG8nKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnVG9kb3Mgb3MgcHJvamV0b3MgaW5zY3JpdG9zIG5vIGZsZXggZW50cmFtIG5vIGFyLiBBZ2lsaWRhZGUgZSBmYWNpbGlkYWRlIHBhcmEgdm9jw6ogY2FwdGFyIHJlY3Vyc29zIGF0cmF2w6lzIGRhIGludGVybmV0LicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzllNzdjMDEzZDRhM2VlNjg3ZDRfaWNvbi10aW1lLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0VuY2VycmUgYSBjYW1wYW5oYSBxdWFuZG8gcXVpc2VyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ07Do28gaMOhIGxpbWl0ZSBkZSB0ZW1wbyBkZSBjYXB0YcOnw6NvLiBWb2PDqiBlc2NvbGhlICBxdWFuZG8gZW5jZXJyYXIgc3VhIGNhbXBhbmhhIGUgcmVjZWJlciBvcyB2YWxvcmVzIGFycmVjYWRhZG9zLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS5mb250c2l6ZS1sYXJnZXIudS1tYXJnaW50b3AtNDAudS1tYXJnaW4tYm90dG9tLTQwLnUtdGV4dC1jZW50ZXInLCAnQ29uaGXDp2EgYWxndW5zIGRvcyBwcmltZWlyb3MgcHJvamV0b3MgZmxleCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0c0xvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0uY29tcG9uZW50KHByb2plY3RSb3csIHtjb2xsZWN0aW9uOiBjdHJsLnByb2plY3RzLCByZWY6ICdjdHJzZV9mbGV4Jywgd3JhcHBlcjogJy53LXJvdy51LW1hcmdpbnRvcC00MCd9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgJ0TDunZpZGFzJyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQobGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWlzIHPDo28gYXMgdGF4YXMgZGEgbW9kYWxpZGFkZSBmbGV4w612ZWw/ICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdDb21vIG5vIENhdGFyc2UsIGVudmlhciB1bSBwcm9qZXRvIG7Do28gY3VzdGEgbmFkYSEgQSB0YXhhIGNvYnJhZGEgbm8gc2VydmnDp28gQ2F0YXJzZSBmbGV4IMOpIGRlIDEzJSBzb2JyZSBvIHZhbG9yIGFycmVjYWRhZG8uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQobGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ0RlIG9uZGUgdmVtIG8gZGluaGVpcm8gZG8gbWV1IHByb2pldG8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0ZhbcOtbGlhLCBhbWlnb3MsIGbDo3MgZSBtZW1icm9zIGRlIGNvbXVuaWRhZGVzIHF1ZSB2b2PDqiBmYXogcGFydGUgc8OjbyBzZXVzIG1haW9yZXMgY29sYWJvcmFkb3Jlcy4gU8OjbyBlbGVzIHF1ZSBpcsOjbyBkaXZ1bGdhciBzdWEgY2FtcGFuaGEgcGFyYSBhcyBwZXNzb2FzIHF1ZSBlbGVzIGNvbmhlY2VtLCBlIGFzc2ltIG8gY8OtcmN1bG8gZGUgYXBvaWFkb3JlcyB2YWkgYXVtZW50YW5kbyBlIGEgc3VhIGNhbXBhbmhhIGdhbmhhIGZvcsOnYS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChsYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbCBhIGRpZmVyZW7Dp2EgZW50cmUgbyBmbGV4w612ZWwgZSBvIFwidHVkbyBvdSBuYWRhXCI/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0F0dWFsbWVudGUgbyBDYXRhcnNlIHV0aWxpemEgYXBlbmFzIG8gbW9kZWxvIFwidHVkbyBvdSBuYWRhXCIsIG9uZGUgdm9jw6ogc8OzIGZpY2EgY29tIG8gZGluaGVpcm8gc2UgYmF0ZXIgYSBtZXRhIGRlIGFycmVjYWRhw6fDo28gZGVudHJvIGRvIHByYXpvIGRhIGNhbXBhbmhhLiBPIG1vZGVsbyBmbGV4w612ZWwgw6kgZGlmZXJlbnRlIHBvaXMgcGVybWl0ZSBxdWUgbyByZWFsaXphZG9yIGZpcXVlIGNvbSBvIHF1ZSBhcnJlY2FkYXIsIGluZGVwZW5kZW50ZSBkZSBhdGluZ2lyIG91IG7Do28gYSBtZXRhIGRvIHByb2pldG8gbm8gcHJhem8gZGEgY2FtcGFuaGEuIE7Do28gaGF2ZXLDoSBsaW1pdGUgZGUgdGVtcG8gcGFyYSBhcyBjYW1wYW5oYXMuIE5vc3NvIHNpc3RlbWEgZmxleMOtdmVsIHNlcsOhIGFsZ28gbm92byBlbSByZWxhw6fDo28gYW9zIG1vZGVsb3MgcXVlIGV4aXN0ZW0gYXR1YWxtZW50ZSBubyBtZXJjYWRvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChsYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUG9zc28gaW5zY3JldmVyIHByb2pldG9zIHBhcmEgYSBtb2RhbGlkYWRlIGZsZXjDrXZlbCBqw6E/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ1NpbS4gQ2FkYXN0cmUgc2V1IGVtYWlsIGUgc2FpYmEgY29tbyBpbnNjcmV2ZXIgbyBzZXUgcHJvamV0byBubyBmbGV4ISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3IgcXXDqiB2b2PDqnMgcXVlcmVtIGZhemVyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBY3JlZGl0YW1vcyBxdWUgbyBhbWJpZW50ZSBkbyBjcm93ZGZ1bmRpbmcgYnJhc2lsZWlybyBhaW5kYSB0ZW0gZXNwYcOnbyBwYXJhIG11aXRhcyBhw6fDtWVzLCB0ZXN0ZXMgZSBleHBlcmltZW50YcOnw7VlcyBwYXJhIGVudGVuZGVyIGRlIGZhdG8gbyBxdWUgYXMgcGVzc29hcyBwcmVjaXNhbS4gU29uaGFtb3MgY29tIHRvcm5hciBvIGZpbmFuY2lhbWVudG8gY29sZXRpdm8gdW0gaMOhYml0byBubyBCcmFzaWwuIE8gQ2F0YXJzZSBmbGV4IMOpIG1haXMgdW0gcGFzc28gbmVzc2EgZGlyZcOnw6NvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFuZG8gdm9jw6pzIGlyw6NvIGxhbsOnYXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0FpbmRhIG7Do28gc2FiZW1vcyBxdWFuZG8gYWJyaXJlbW9zIG8gZmxleCBwYXJhIG8gcMO6YmxpY28gZW0gZ2VyYWwsIG1hcyB2b2PDqiBwb2RlIGNhZGFzdHJhciBzZXUgZW1haWwgbmVzc2EgcMOhZ2luYSBlIHJlY2ViZXIgdW0gbWF0ZXJpYWwgZXNwZWNpYWwgZGUgY29tbyBpbnNjcmV2ZXIgc2V1IHByb2pldG8uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ0luc2NyZXZhIHNldSBwcm9qZXRvIScpLCBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS02MCcsICdDYWRhc3RyZSBzZXUgZW1haWwgZSBzYWliYSBjb21vIGluc2NyZXZlciBvIHNldSBwcm9qZXRvIG5vIGZsZXghJyksIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctY2F0YXJzZS16ZWxvLnNlY3Rpb24tbGFyZ2Vbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS51LW1hcmdpbmJvdHRvbS00MC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC5mb250Y29sb3ItbmVnYXRpdmUnLCAnTyBmbGV4IMOpIHVtIGV4cGVyaW1lbnRvIGUgaW5pY2lhdGl2YSBkbyBDYXRhcnNlLCBtYWlvciBwbGF0YWZvcm1hIGRlIGNyb3dkZnVuZGluZyBkbyBCcmFzaWwuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIChjdHJsLnN0YXRzTG9hZGVyKCkpID8gaC5sb2FkZXIoKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfY29udHJpYnV0b3JzLCAwLCAzKSksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnUGVzc29hcyBqYSBhcG9pYXJhbSBwZWxvIG1lbm9zIDAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQcm9qZXRvcyBqYSBmb3JhbSBmaW5hbmNpYWRvcyBub8KgQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnRm9yYW0gaW52ZXN0aWRvcyBlbSBpZGVpYXMgcHVibGljYWRhcyBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctYmx1ZS1vbmUuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbWVuZGUgbyBDYXRhcnNlIGZsZXggcGFyYSBhbWlnb3MhICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02Lnctc3ViLWNvbC1taWRkbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NmUwNWViNjE0NDE3MWQ4ZWRiX2ZhY2Vib29rLXh4bC5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tZmJbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj1mYWNlYm9vayZ0aXRsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdDb25oZcOnYSBvIG5vdm8gQ2F0YXJzZSBGbGV4IScpICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnQ29tcGFydGlsaGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY1MTA1ZWI2MTQ0MTcxZDhlZGFfdHdpdHRlci0yNTYucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLXR3ZWV0W2hyZWY9XCJodHRwOi8vdHdpdHRlci5jb20vP3N0YXR1cz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmcgcGFyYSBvIENhdGFyc2UhIEp1bnRlLXNlIGEgbsOzcywgaW5zY3JldmEgc2V1IGVtYWlsIScpICsgJ2h0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9dHdpdHRlclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnVHVpdGFyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctZ3JlZW5saW1lJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGFydGljaXBlLWRvLWRlYmF0ZS51LXRleHQtY2VudGVyJywge2NvbmZpZzogaC50b0FuY2hvcigpfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlc3QuZm9udGNvbG9yLW5lZ2F0aXZlJywnQ29uc3RydWEgbyBmbGV4IGNvbm9zY28nKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0luaWNpZSB1bWEgY29udmVyc2EsIHBlcmd1bnRlLCBjb21lbnRlLCBjcml0aXF1ZSBlIGZhw6dhIHN1Z2VzdMO1ZXMhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rpc3F1c190aHJlYWQuY2FyZC51LXJhZGl1c1tzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5hZGREaXNxdXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgXTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBGbGV4O1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgcG9zdGdyZXN0IGZyb20gJ21pdGhyaWwtcG9zdGdyZXMnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgSTE4biBmcm9tICdpMThuLWpzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IG1vZGVscyBmcm9tICdtb2RlbHMnO1xuaW1wb3J0IGluc2lnaHRzVk0gZnJvbSAnaW5zaWdodHMtdm0nO1xuaW1wb3J0IHRvb2x0aXAgZnJvbSAndG9vbHRpcCc7XG5pbXBvcnQgcHJvamVjdERhc2hib2FyZE1lbnUgZnJvbSAncHJvamVjdC1kYXNoYm9hcmQtbWVudSc7XG5pbXBvcnQgbW9kYWxCb3ggZnJvbSAnbW9kYWwtYm94JztcbmltcG9ydCBhZG1pblByb2plY3REZXRhaWxzQ2FyZCBmcm9tICdhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZCc7XG5pbXBvcnQgcHJvamVjdERhdGFDaGFydCBmcm9tICdwcm9qZWN0LWRhdGEtY2hhcnQnO1xuaW1wb3J0IHByb2plY3REYXRhVGFibGUgZnJvbSAncHJvamVjdC1kYXRhLXRhYmxlJztcbmltcG9ydCBwcm9qZWN0UmVtaW5kZXJDb3VudCBmcm9tICdwcm9qZWN0LXJlbWluZGVyLWNvdW50JztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuaW5zaWdodHMnKTtcblxuY29uc3QgaW5zaWdodHMgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgZmlsdGVyc1ZNID0gcG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBkaXNwbGF5TW9kYWwgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgaW5zaWdodHNWTSA9IGluc2lnaHRzVk0sXG4gICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICBsb2FkZXIgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuO1xuXG4gICAgICAgIGlmIChoLnBhcmFtQnlOYW1lKCdvbmxpbmVfc3VjY2VzcycpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGRpc3BsYXlNb2RhbC50b2dnbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbHRlcnNWTS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgICAgY29uc3QgbCA9IGxvYWRlcihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgbC5sb2FkKCkudGhlbihwcm9qZWN0RGV0YWlscyk7XG5cbiAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICBsQ29udHJpYnV0aW9uc1BlckRheS5sb2FkKCkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUgPSBbWydFc3RhZG8nLCAnQXBvaW9zJywgJ1IkIGFwb2lhZG9zICglIGRvIHRvdGFsKSddXTtcbiAgICAgICAgY29uc3QgYnVpbGRQZXJMb2NhdGlvblRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShjb250cmlidXRpb25zKSkgPyBfLm1hcChfLmZpcnN0KGNvbnRyaWJ1dGlvbnMpLnNvdXJjZSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpO1xuICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkLFsvL0FkZGluZyByb3cgd2l0aCBjdXN0b20gY29tcGFyYXRvciA9PiByZWFkIHByb2plY3QtZGF0YS10YWJsZSBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLnB1c2goY29sdW1uKTtcbiAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IGxvYWRlcihtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5sb2FkKCkudGhlbihidWlsZFBlckxvY2F0aW9uVGFibGUpO1xuXG4gICAgICAgIGxldCBjb250cmlidXRpb25zUGVyUmVmVGFibGUgPSBbW1xuICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLm9yaWdpbicsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5jb250cmlidXRpb25zJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLmFtb3VudCcsIEkxOG5TY29wZSgpKVxuICAgICAgICBdXTtcbiAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAvL1Rlc3QgaWYgdGhlIHN0cmluZyBtYXRjaGVzIGEgd29yZCBzdGFydGluZyB3aXRoIGN0cnNlXyBhbmQgZm9sbG93ZWQgYnkgYW55IG5vbi1kaWdpdCBncm91cCBvZiBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgICAgLy9UaGlzIGFsbG93cyB0byByZW1vdmUgYW55IHZlcnNpb25lZCByZWZlcnJhbCAoaS5lLjogY3Ryc2VfbmV3c2xldHRlcl8xMjMpIHdoaWxlIHN0aWxsIGdldHRpbmcgY3Ryc2VfdGVzdF9yZWZcbiAgICAgICAgICAgICAgICBjb25zdCByZSA9IC8oY3Ryc2VfW1xcRF0qKS8sXG4gICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZS5leGVjKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rKTtcblxuICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgLy9SZW1vdmVzIGxhc3QgdW5kZXJzY29yZSBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPSB0ZXN0WzBdLnN1YnN0cigtMSkgPT09ICdfJyA/IHRlc3RbMF0uc3Vic3RyKDAsIHRlc3RbMF0ubGVuZ3RoIC0gMSkgOiB0ZXN0WzBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rID8gSTE4bi50KCdyZWZlcnJhbC4nICsgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmssIEkxOG5TY29wZSh7ZGVmYXVsdFZhbHVlOiBjb250cmlidXRpb24ucmVmZXJyYWxfbGlua30pKSA6IEkxOG4udCgncmVmZXJyYWwub3RoZXJzJywgSTE4blNjb3BlKCkpKTtcbiAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWwpO1xuICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfYW1vdW50LFtcbiAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIiR7Y29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkfVwiYCksXG4gICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfYW1vdW50LCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJyAoJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlclJlZlRhYmxlLnB1c2goY29sdW1uKTtcbiAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJSZWYgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyUmVmLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICBsQ29udHJpYnV0aW9uc1BlclJlZi5sb2FkKCkudGhlbihidWlsZFBlclJlZlRhYmxlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmOiBsQ29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyTG9jYXRpb246IGxDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckRheTogbENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICBkaXNwbGF5TW9kYWw6IGRpc3BsYXlNb2RhbCxcbiAgICAgICAgICAgIGZpbHRlcnNWTTogZmlsdGVyc1ZNLFxuICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlOiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSxcbiAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZTogY29udHJpYnV0aW9uc1BlclJlZlRhYmxlXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBfLmZpcnN0KGN0cmwucHJvamVjdERldGFpbHMoKSksXG4gICAgICAgICAgICBzdWNjZXNzTW9kYWxDID0gWydPbmxpbmVTdWNlc3NNb2RhbENvbnRlbnQnXSxcbiAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQodG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmZvcm1hIGRlIG9uZGUgdmllcmFtIG9zIGFwb2lvcyBkZSBzZXUgcHJvamV0by4gU2FpYmEgY29tbyB1c2FyIGVzc2EgdGFiZWxhIGUgcGxhbmVqYXIgbWVsaG9yIHN1YXMgYcOnw7VlcyBkZSBjb211bmljYcOnw6NvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBhW2hyZWY9XCIke0kxOG4udCgncmVmX3RhYmxlLmhlbHBfdXJsJywgSTE4blNjb3BlKCkpfVwiXVt0YXJnZXQ9J19ibGFuayddYCwgJ2FxdWkuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM4MFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBwcm9qZWN0LnVzZXIubmFtZSA9IHByb2plY3QudXNlci5uYW1lIHx8ICdSZWFsaXphZG9yJztcblxuICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCAhY3RybC5sKCkgPyBbXG4gICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KHByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogbS5wcm9wKHByb2plY3QpXG4gICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgIChjdHJsLmRpc3BsYXlNb2RhbCgpID8gbS5jb21wb25lbnQobW9kYWxCb3gsIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kYWw6IGN0cmwuZGlzcGxheU1vZGFsLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHN1Y2Nlc3NNb2RhbENcbiAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdjYW1wYWlnbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChhZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuJyArIHByb2plY3Quc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnICYmIF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgJiYgcHJvamVjdC5zdGF0ZSAhPT0gJ2RyYWZ0JyA/IG0oJ3NwYW4nLCBbSTE4bi50KCdmaW5pc2hfZXhwbGFuYXRpb24nLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDY1MDc4NjMtQ2F0YXJzZS1mbGV4LVByaW5jaXBhaXMtcGVyZ3VudGFzLWUtcmVzcG9zdGFzLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBJMThuLnQoJ2tub3dfbW9yZScsIEkxOG5TY29wZSgpKSldKSA6IG0udHJ1c3QoSTE4bi50KGBjYW1wYWlnbi4ke3Byb2plY3QubW9kZX0uJHtwcm9qZWN0LnN0YXRlfWAsIEkxOG5TY29wZSh7dXNlcm5hbWU6IHByb2plY3QudXNlci5uYW1lLCBleHBpcmVzX2F0OiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksIHNlbnRfdG9fYW5hbHlzaXNfYXQ6IGgubW9tZW50aWZ5KHByb2plY3Quc2VudF90b19hbmFseXNpc19hdCl9KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkKSA/IFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWluLWhlaWdodCc6ICczMDBweCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJEYXkoKSA/IG0uY29tcG9uZW50KHByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2Ftb3VudF9wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4QXhpczogKGl0ZW0pID0+IGgubW9tZW50aWZ5KGl0ZW0ucGFpZF9hdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckRheSgpID8gbS5jb21wb25lbnQocHJvamVjdERhdGFDaGFydCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnY29udHJpYnV0aW9uc19wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX29yaWdpbl90aXRsZScsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm5ld0ZlYXR1cmVCYWRnZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4uZm9udHNpemUtc21hbGxlc3QudG9vbHRpcC13cmFwcGVyLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJSZWYoKSA/IG0uY29tcG9uZW50KHByb2plY3REYXRhVGFibGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogY3RybC5jb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLXJlZicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBJMThuLnQoJ2xvY2F0aW9uX29yaWdpbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkgPyBtLmNvbXBvbmVudChwcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGU6IGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3RSZW1pbmRlckNvdW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6ICcnXG4gICAgICAgIF0gOiBoLmxvYWRlcigpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluc2lnaHRzO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgSTE4biBmcm9tICdpMThuLWpzJztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncGFnZXMuam9icycpO1xuXG5jb25zdCBqb2JzID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1qb2JzLmhlcm8tbWVkaXVtJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lLnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24taGVyb1tzcmM9XCIvYXNzZXRzL2xvZ28td2hpdGUucG5nXCJdJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwLmZvbnRzaXplLWxhcmdlc3QnLCBJMThuLnQoJ3RpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXB1c2gtMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnaW5mbycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiL3Byb2plY3RzL25ld1wiXS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi1pbmxpbmUnLCBJMThuLnQoJ2N0YScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF07XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgam9icztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgbGl2ZVN0YXRpc3RpY3MgPSB7XG4gICAgY29udHJvbGxlciAoYXJncyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHBhZ2VTdGF0aXN0aWNzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgIC8vIGFyZ3Muc29ja2V0IGlzIGEgc29ja2V0IHByb3ZpZGVkIGJ5IHNvY2tldC5pb1xuICAgICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgIGFyZ3Muc29ja2V0Lm9uKCduZXdfcGFpZF9jb250cmlidXRpb25zJywgKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLmJnLXN0YXRzLnNlY3Rpb24ubWluLWhlaWdodC0xMDAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdQZXNzb2FzIGrDoSBhcG9pYXJhbSBwZWxvIG1lbm9zIDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSkpLCAoIV8uaXNFbXB0eShkYXRhKSA/IG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS51c2VyX25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ2FjYWJvdSBkZSBhcG9pYXIgbycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZ2l0aHViJywgJy4nKSwgJyBPcGVuIFNvdXJjZSBjb20gb3JndWxobyEgJ1xuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaXZlU3RhdGlzdGljcztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgcG9zdGdyZXN0IGZyb20gJ21pdGhyaWwtcG9zdGdyZXN0JztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHByb2plY3REYXNoYm9hcmRNZW51IGZyb20gJ3Byb2plY3QtZGFzaGJvYXJkLW1lbnUnO1xuaW1wb3J0IHByb2plY3RDb250cmlidXRpb25SZXBvcnRIZWFkZXIgZnJvbSAncHJvamVjdC1jb250cmlidXRpb24tcmVwb3J0LWhlYWRlcic7XG5pbXBvcnQgcHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydENvbnRlbnQgZnJvbSAncHJvamVjdC1jb250cmlidXRpb24tcmVwb3J0LWNvbnRlbnQnO1xuaW1wb3J0IHByb2plY3RzQ29udHJpYnV0aW9uUmVwb3J0Vk0gZnJvbSAncHJvamVjdHMtY29udHJpYnV0aW9uLXJlcG9ydC12bSc7XG5cbmNvbnN0IHByb2plY3RDb250cmlidXRpb25SZXBvcnQgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCBsaXN0Vk0gPSBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pLFxuICAgICAgICAgICAgICBmaWx0ZXJWTSA9IHByb2plY3RzQ29udHJpYnV0aW9uUmVwb3J0Vk0sXG4gICAgICAgICAgICAgIHByb2plY3QgPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICByZXdhcmRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0V3JhcHBlckNsYXNzOiAnLnctaW5wdXQudGV4dC1maWVsZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bkNsYXNzOiAnLmJ0bi5idG4tbWVkaXVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIG5vbWUgb3UgZW1haWwgZG8gYXBvaWFkb3InXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncmV3YXJkX2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3Jld2FyZF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5yZXdhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXJfY2xhc3M6ICcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi5fdy1zdWItY29sLW1pZGRsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncGF5bWVudF9zdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGF0dXMgZG8gYXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXJfY2xhc3M6ICcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi5fdy1zdWItY29sLW1pZGRsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdUb2RvcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwYWlkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BhZ28nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdXNlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdDYW5jZWxhZG8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQZW5kZW50ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nX3JlZnVuZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdSZWVtYm9sc28gcGVuZGVudGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdW5kZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUmVlbWJvbHNhZG8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnY2hhcmdlYmFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdDb250ZXN0YWRvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xuXG4gICAgICAgIGNvbnN0IGxSZXdhcmQgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5yZXdhcmREZXRhaWwuZ2V0UGFnZU9wdGlvbnMoe3Byb2plY3RfaWQ6IGBlcS4ke2ZpbHRlclZNLnByb2plY3RfaWQoKX1gfSkpO1xuICAgICAgICBjb25zdCBsUHJvamVjdCA9IHBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnByb2plY3REZXRhaWwuZ2V0UGFnZU9wdGlvbnMoe3Byb2plY3RfaWQ6IGBlcS4ke2ZpbHRlclZNLnByb2plY3RfaWQoKX1gfSkpO1xuXG4gICAgICAgIGxSZXdhcmQubG9hZCgpLnRoZW4ocmV3YXJkcyk7XG4gICAgICAgIGxQcm9qZWN0LmxvYWQoKS50aGVuKHByb2plY3QpO1xuXG4gICAgICAgIGNvbnN0IG1hcFJld2FyZHNUb09wdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IFtdO1xuICAgICAgICAgICAgaWYoIWxSZXdhcmQoKSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLm1hcChyZXdhcmRzKCksIChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogYFIkICR7aC5mb3JtYXROdW1iZXIoci5taW5pbXVtX3ZhbHVlLCAyLCAzKX0gLSAke3IuZGVzY3JpcHRpb24uc3Vic3RyaW5nKDAsIDIwKX1gXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgIG9wdGlvbjogJ1RvZGFzJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgbFJld2FyZDogbFJld2FyZCxcbiAgICAgICAgICAgIHJld2FyZHM6IHJld2FyZHMsXG4gICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgbWFwUmV3YXJkc1RvT3B0aW9uczogbWFwUmV3YXJkc1RvT3B0aW9uc1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk07XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3REYXNoYm9hcmRNZW51LCB7cHJvamVjdDogbS5wcm9wKF8uZmlyc3QoY3RybC5wcm9qZWN0KCkpKX0pLFxuICAgICAgICAgICAgbS5jb21wb25lbnQocHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydEhlYWRlciwge1xuICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXQsXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICBtYXBSZXdhcmRzVG9PcHRpb25zOiBjdHJsLm1hcFJld2FyZHNUb09wdGlvbnMsXG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGN0cmwuZmlsdGVyVk1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMzAnKSxcbiAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3RDb250cmlidXRpb25SZXBvcnRDb250ZW50LCB7XG4gICAgICAgICAgICAgICAgbGlzdDogbGlzdFxuICAgICAgICAgICAgfSlcbiAgICAgICAgXTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0Q29udHJpYnV0aW9uUmVwb3J0O1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5yb290LlByb2plY3RzRGFzaGJvYXJkIGNvbXBvbmVudFxuICogQSByb290IGNvbXBvbmVudCB0byBtYW5hZ2UgcHJvamVjdHNcbiAqXG4gKiBFeGFtcGxlOlxuICogVG8gbW91bnQgdGhpcyBjb21wb25lbnQganVzdCBjcmVhdGUgYSBET00gZWxlbWVudCBsaWtlOlxuICogPGRpdiBkYXRhLW1pdGhyaWw9XCJQcm9qZWN0c0Rhc2hib2FyZFwiPlxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgcHJvamVjdFZNIGZyb20gJ3Byb2plY3Qtdm0nO1xuaW1wb3J0IHByb2plY3REYXNoYm9hcmRNZW51IGZyb20gJ3Byb2plY3QtZGFzaGJvYXJkLW1lbnUnO1xuXG5jb25zdCBwcm9qZWN0c0Rhc2hib2FyZCA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIHJldHVybiBwcm9qZWN0Vk0oYXJncy5wcm9qZWN0X2lkLCBhcmdzLnByb2plY3RfdXNlcl9pZCk7XG4gICAgfSxcbiAgICB2aWV3IChjdHJsKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBjdHJsLnByb2plY3REZXRhaWxzO1xuICAgICAgICByZXR1cm4gcHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3REYXNoYm9hcmRNZW51LCB7cHJvamVjdDogcHJvamVjdH0pIDogJyc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0c0Rhc2hib2FyZDtcbiIsIi8qKlxuICogd2luZG93LnJvb3QuUHJvamVjdHNFeHBsb3JlIGNvbXBvbmVudFxuICogQSByb290IGNvbXBvbmVudCB0byBzaG93IHByb2plY3RzIGFjY29yZGluZyB0byB1c2VyIGRlZmluZWQgZmlsdGVyc1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlByb2plY3RzRXhwbG9yZVwiPlxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBwb3N0Z3Jlc3QgZnJvbSAnbWl0aHJpbC1wb3N0Z3Jlc3QnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcbmltcG9ydCBwcm9qZWN0RmlsdGVycyBmcm9tICdwcm9qZWN0LWZpbHRlcnMtdm0nO1xuaW1wb3J0IHNlYXJjaCBmcm9tICdzZWFyY2gnO1xuaW1wb3J0IGNhdGVnb3J5QnV0dG9uIGZyb20gJ2NhdGVnb3J5LWJ1dHRvbic7XG5pbXBvcnQgcHJvamVjdENhcmQgZnJvbSAncHJvamVjdC1jYXJkJztcblxuXG5jb25zdCBwcm9qZWN0c0V4cGxvcmUgPSB7XG4gICAgY29udHJvbGxlciAoKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBwb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICBwcm9qZWN0RmlsdGVycyA9IHByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgIGZpbHRlcnNNYXAgPSBwcm9qZWN0RmlsdGVycy5maWx0ZXJzLFxuICAgICAgICAgICAgICBkZWZhdWx0RmlsdGVyID0gaC5wYXJhbUJ5TmFtZSgnZmlsdGVyJykgfHwgJ3Njb3JlJyxcbiAgICAgICAgICAgICAgZmFsbGJhY2tGaWx0ZXIgPSAnYWxsJyxcbiAgICAgICAgICAgICAgY3VycmVudEZpbHRlciA9IG0ucHJvcChmaWx0ZXJzTWFwW2RlZmF1bHRGaWx0ZXJdKSxcbiAgICAgICAgICAgICAgY2hhbmdlRmlsdGVyID0gKG5ld0ZpbHRlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcihmaWx0ZXJzTWFwW25ld0ZpbHRlcl0pO1xuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlc2V0Q29udGV4dEZpbHRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXIoZmlsdGVyc01hcFtkZWZhdWx0RmlsdGVyXSk7XG4gICAgICAgICAgICAgICAgICBwcm9qZWN0RmlsdGVycy5zZXRDb250ZXh0RmlsdGVycyhbJ3Njb3JlJywgJ2ZpbmlzaGVkJywgJ2FsbCddKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaXNTZWFyY2ggPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICBjYXRlZ29yeUlkID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgIGZpbmRDYXRlZ29yeSA9IChpZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBpZCA9PT0gcGFyc2VJbnQoaWQpOyB9KTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBfLmNvbXBvc2UoZmluZENhdGVnb3J5LCBjYXRlZ29yeUlkKSxcbiAgICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxzLmNhdGVnb3J5LmdldFBhZ2VXaXRoVG9rZW4oZmlsdGVycyh7fSkub3JkZXIoe25hbWU6ICdhc2MnfSkucGFyYW1ldGVycygpKS50aGVuKGNhdGVnb3J5Q29sbGVjdGlvbik7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEZha2UgcHJvamVjdHMgb2JqZWN0IHRvIGJlIGFibGUgdG8gcmVuZGVyIHBhZ2Ugd2hpbGUgbG9hZGRpbmcgKGluIGNhc2Ugb2Ygc2VhcmNoKVxuICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9LCBpc0xhc3RQYWdlOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgIGxvYWRSb3V0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlWzJdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5KHJvdXRlWzJdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm91dGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVbMV0gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aXRsZTogY2F0Lm5hbWUsIGZpbHRlcjogYnlDYXRlZ29yeS5jYXRlZ29yeV9pZChjYXQuaWQpfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IGZpbHRlckZyb21Sb3V0ZSgpIHx8IGN1cnJlbnRGaWx0ZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hQcm9qZWN0cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsID0gcG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlID0geyAvLyBXZSBidWlsZCBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgcGFnaW5hdGlvblZNXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNMYXN0UGFnZTogKCkgPT4geyByZXR1cm4gdHJ1ZTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBhZ2U6ICgpID0+IHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHBhZ2UuY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gXy5leHRlbmQoe30sIGN1cnJlbnRGaWx0ZXIoKS5maWx0ZXIucGFyYW1ldGVycygpLCBmaWx0ZXIuZmlsdGVyLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2Rlc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2FzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWQ6ICdkZXNjJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMuZmlyc3RQYWdlKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRGaW5pc2hlZFByb2plY3RzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gcG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuZmluaXNoZWRQcm9qZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzID0gXy5leHRlbmQoe30sIGN1cnJlbnRGaWx0ZXIoKS5maWx0ZXIucGFyYW1ldGVycygpLCBmaWx0ZXIuZmlsdGVyLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVfb3JkZXI6ICdhc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogJ2Rlc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VzLmZpcnN0UGFnZShwYXJhbWV0ZXJzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgIGlmIChfLmlzU3RyaW5nKHNlYXJjaCkgJiYgc2VhcmNoLmxlbmd0aCA+IDAgJiYgcm91dGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpc1NlYXJjaCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZSgnQnVzY2EgJyArIHNlYXJjaCk7XG4gICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRGaWx0ZXIoKS5rZXlOYW1lID09PSAnZmluaXNoZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaXNTZWFyY2goZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RzKGxvYWRGaW5pc2hlZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBpc1NlYXJjaChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNOdWxsKHJvdXRlKSAmJiByb3V0ZVsxXSA9PSAnZmluaXNoZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RzKGxvYWRGaW5pc2hlZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RzKGxvYWRQcm9qZWN0cygpKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgcm91dGUgfHwgKF8uaXNTdHJpbmcoc2VhcmNoKSAmJiBzZWFyY2gubGVuZ3RoID4gMCkgPyB0b2dnbGVDYXRlZ29yaWVzKGZhbHNlKSA6IHRvZ2dsZUNhdGVnb3JpZXModHJ1ZSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpdGxlID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXMgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgcmVzZXRDb250ZXh0RmlsdGVyKCk7XG4gICAgICAgICAgICBsb2FkUm91dGUoKTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAvLyBJbml0aWFsIGxvYWRzXG4gICAgICAgIHJlc2V0Q29udGV4dEZpbHRlcigpO1xuICAgICAgICBtb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgbG9hZENhdGVnb3JpZXMoKS50aGVuKGxvYWRSb3V0ZSk7XG5cbiAgICAgICAgaWYgKCFjdXJyZW50RmlsdGVyKCkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXIoZmlsdGVyc01hcFtkZWZhdWx0RmlsdGVyXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcnlDb2xsZWN0aW9uLFxuICAgICAgICAgICAgY2hhbmdlRmlsdGVyOiBjaGFuZ2VGaWx0ZXIsXG4gICAgICAgICAgICBmYWxsYmFja0ZpbHRlcjogZmFsbGJhY2tGaWx0ZXIsXG4gICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgY3VycmVudEZpbHRlcjogY3VycmVudEZpbHRlcixcbiAgICAgICAgICAgIHByb2plY3RGaWx0ZXJzOiBwcm9qZWN0RmlsdGVycyxcbiAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXMsXG4gICAgICAgICAgICBpc1NlYXJjaDogaXNTZWFyY2hcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgaWYgKCFjdHJsLnByb2plY3RzKCkuaXNMb2FkaW5nKCkgJiYgXy5pc0VtcHR5KGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCkpICYmICFjdHJsLmlzU2VhcmNoKCkpe1xuICAgICAgICAgICAgY3RybC5wcm9qZWN0RmlsdGVycy5yZW1vdmVDb250ZXh0RmlsdGVyKGN0cmwuY3VycmVudEZpbHRlcigpKTtcbiAgICAgICAgICAgIGN0cmwuY2hhbmdlRmlsdGVyKGN0cmwuZmFsbGJhY2tGaWx0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1zZWFyY2gnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoc2VhcmNoKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNleHBsb3JlLW9wZW4ubGluay1oaWRkZW4td2hpdGUuZm9udHdlaWdodC1saWdodC5mb250c2l6ZS1sYXJnZXJbaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvbmNsaWNrOiAoKSA9PiBjdHJsLnRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnRXhwbG9yZSBwcm9qZXRvcyBpbmNyw612ZWlzICcsIG0oYHNwYW4jZXhwbG9yZS1idG4uZmEuZmEtYW5nbGUtZG93biR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCAnJyldKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgI2NhdGVnb3JpZXMuY2F0ZWdvcnktc2xpZGVyJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjYXRlZ29yeUJ1dHRvbiwge2NhdGVnb3J5OiBjYXRlZ29yeX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC04LnctY29sLXRpbnktOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgY3RybC50aXRsZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwuaXNTZWFyY2goKSA/IG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLnBvc2l0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwuY2hhbmdlRmlsdGVyKX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwucHJvamVjdEZpbHRlcnMuZ2V0Q29udGV4dEZpbHRlcnMoKSwgKHBhZ2VGaWx0ZXIsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvamVjdHMgPSBjdHJsLnByb2plY3RzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZCA9IGN0cmwuY3VycmVudEZpbHRlcigpID09IHBhZ2VGaWx0ZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGBvcHRpb25bdmFsdWU9XCIke3BhZ2VGaWx0ZXIua2V5TmFtZX1cIl1gLHsgc2VsZWN0ZWQ6IGlzU2VsZWN0ZWQgfSxwYWdlRmlsdGVyLm5pY2VuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCksIChwcm9qZWN0LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZFR5cGUgPSAnc21hbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgPSAnY3Ryc2VfZXhwbG9yZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5jdXJyZW50RmlsdGVyKCkua2V5TmFtZSA9PT0gJ3Njb3JlJyAmJiAhY3RybC5pc1NlYXJjaCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZHggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRUeXBlID0gJ2JpZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgPSAnY3Ryc2VfZXhwbG9yZV9mZWF0dXJlZF9iaWcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkeCA9PT0gMSB8fCBpZHggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRUeXBlID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgPSAnY3Ryc2VfZXhwbG9yZV9mZWF0dXJlZF9tZWRpdW0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmID0gJ2N0cnNlX2V4cGxvcmVfZmVhdHVyZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KHByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiByZWYsIHR5cGU6IGNhcmRUeXBlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnByb2plY3RzKCkuaXNMb2FkaW5nKCkgPyBoLmxvYWRlcigpIDogXy5pc0VtcHR5KGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCkpID8gbSgnLmZvbnRzaXplLWJhc2Uudy1jb2wudy1jb2wtMTInLCAnTmVuaHVtIHByb2pldG8gcGFyYSBtb3N0cmFyLicpIDogJydcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24udS1tYXJnaW5ib3R0b20tODAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLnByb2plY3RzKCkuaXNMYXN0UGFnZSgpIHx8IGN0cmwucHJvamVjdHMoKS5pc0xvYWRpbmcoKSB8fCBfLmlzRW1wdHkoY3RybC5wcm9qZWN0cygpLmNvbGxlY3Rpb24oKSkpID8gJycgOiBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeVtocmVmPVxcJyNsb2FkTW9yZVxcJ10nLCB7b25jbGljazogKCkgPT4geyBjdHJsLnByb2plY3RzKCkubmV4dFBhZ2UoKTsgcmV0dXJuIGZhbHNlOyB9fSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmVmb3JlLWZvb3Rlci51LW1hcmdpbnRvcC04MC5iZy1ncmF5LmRpdmlkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy51LW1hcmdpbmJvdHRvbS0yMC5pY29uLWhlcm8nLCB7c3JjOiAnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NmY0NDE0ZDNhMGZjYzAxMjRlYzlhMjRfaWNvbi1sYXVuY2gtZXhwbG9yZS5wbmcnfSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWxhcmdlci51LW1hcmdpbmJvdHRvbS02MCcsICdMYW5jZSBzdWEgY2FtcGFuaGEgbm8gQ2F0YXJzZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZScsIHtocmVmOiAnL3N0YXJ0P3JlZj1jdHJzZV9leHBsb3JlJ30sICdBcHJlbmRhIGNvbW8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0c0V4cGxvcmU7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IEkxOG4gZnJvbSAnaTE4bi1qcyc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcbmltcG9ydCBwcm9qZWN0RmlsdGVycyBmcm9tICdwcm9qZWN0LWZpbHRlcnMtdm0nO1xuaW1wb3J0IGhvbWVWTSBmcm9tICdwcm9qZWN0cy1ob21lLXZtJztcbmltcG9ydCBzbGlkZXIgZnJvbSAnc2xpZGVyJztcbmltcG9ydCBwcm9qZWN0Um93IGZyb20gJ3Byb2plY3Qtcm93JztcbmltcG9ydCBjb250cmlidXRpb25BY3Rpdml0aWVzIGZyb20gJ2NvbnRyaWJ1dGlvbi1hY3Rpdml0aWVzJztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuaG9tZScpO1xuXG5jb25zdCBwcm9qZWN0c0hvbWUgPSB7XG4gICAgY29udHJvbGxlciAoKSB7XG4gICAgICAgIGxldCBzYW1wbGU2ID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCA2KSxcbiAgICAgICAgICAgIGxvYWRlciA9IHBvc3RncmVzdC5sb2FkZXIsXG4gICAgICAgICAgICBwcm9qZWN0ID0gbW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICBmaWx0ZXJzID0gcHJvamVjdEZpbHRlcnMoKS5maWx0ZXJzLFxuICAgICAgICAgICAgdm0gPSBob21lVk0oKTtcblxuICAgICAgICBjb25zdCBjb2xsZWN0aW9ucyA9IF8ubWFwKFsnc2NvcmUnXSwgKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSBmaWx0ZXJzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgY0xvYWRlciA9IGxvYWRlcihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKGYuZmlsdGVyLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIGNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKGNvbGxlY3Rpb24sIHNhbXBsZTYpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZi50aXRsZSxcbiAgICAgICAgICAgICAgICBoYXNoOiBuYW1lLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjTG9hZGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zLFxuICAgICAgICAgICAgc2xpZGVzQ29udGVudDogdm0uYmFubmVyc1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCkge1xuICAgICAgICBjb25zdCBzbGlkZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAoY3RybC5zbGlkZXNDb250ZW50LCAoc2xpZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21TdHlsZSA9IGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtzbGlkZS5pbWFnZX0pO2A7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJyxbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRjb2xvci1uZWdhdGl2ZS5mb250c2l6ZS1tZWdhanVtYm8udS1tYXJnaW5ib3R0b20tMjAnLCBzbGlkZS50aXRsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMi5mb250Y29sb3ItbmVnYXRpdmUuZm9udHNpemUtbGFyZ2UnLCBtLnRydXN0KHNsaWRlLnN1YnRpdGxlKSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5idG4taW5saW5lJyx7aHJlZjogc2xpZGUubGlua30sIHNsaWRlLmN0YSlcbiAgICAgICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbVN0eWxlOiBjdXN0b21TdHlsZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbS5jb21wb25lbnQoc2xpZGVyLCB7XG4gICAgICAgICAgICAgICAgc2xpZGVzOiBzbGlkZXMoKSxcbiAgICAgICAgICAgICAgICBlZmZlY3Q6ICdmYWRlJyxcbiAgICAgICAgICAgICAgICBzbGlkZUNsYXNzOiAnaGVyby1zbGlkZSBzdGFydCcsXG4gICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnaGVyby1mdWxsIGhlcm8tZnVsbC1zbGlkZScsXG4gICAgICAgICAgICAgICAgc2xpZGVyVGltZTogMTAwMDBcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQocHJvamVjdFJvdywge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogSTE4bi50KCdyb3dfdGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtLmNvbXBvbmVudChjb250cmlidXRpb25BY3Rpdml0aWVzKVxuICAgICAgICBdO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RzSG9tZTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBwcm9qZWN0Vk0gZnJvbSAncHJvamVjdC12bSc7XG5pbXBvcnQgcHJvamVjdEhlYWRlciBmcm9tICdwcm9qZWN0LWhlYWRlcic7XG5pbXBvcnQgcHJvamVjdFRhYnMgZnJvbSAncHJvamVjdC10YWJzJztcbmltcG9ydCBwcm9qZWN0TWFpbiBmcm9tICdwcm9qZWN0LW1haW4nO1xuaW1wb3J0IHByb2plY3REYXNoYm9hcmRNZW51IGZyb20gJ3Byb2plY3QtZGFzaGJvYXJkLW1lbnUnO1xuXG5jb25zdCBwcm9qZWN0c1Nob3cgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICByZXR1cm4gcHJvamVjdFZNKGFyZ3MucHJvamVjdF9pZCwgYXJncy5wcm9qZWN0X3VzZXJfaWQpO1xuICAgIH0sXG4gICAgdmlldyAoY3RybCkge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gY3RybC5wcm9qZWN0RGV0YWlscztcblxuICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChwcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBjdHJsLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQocHJvamVjdFRhYnMsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQocHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgKHByb2plY3QoKSAmJiBwcm9qZWN0KCkuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChwcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RzU2hvdztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgSTE4biBmcm9tICdpMThuLWpzJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHB1Ymxpc2hWTSBmcm9tICdwdWJsaXNoLXZtJztcbmltcG9ydCBwcm9qZWN0RGFzaGJvYXJkTWVudSBmcm9tICdwcm9qZWN0LWRhc2hib2FyZC1tZW51JztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMucHVibGlzaCcpO1xuXG5jb25zdCBwdWJsaXNoID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgbGV0IGZpbHRlcnNWTSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcHVibGlzaFZNID0gcHVibGlzaFZNLFxuICAgICAgICAgICAgcHJvamVjdEFjY291bnQgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgYWNjZXB0VGVybSA9IG0ucHJvcChbdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWVdKSxcbiAgICAgICAgICAgIGZsZXhBY2NlcHRUZXJtID0gbS5wcm9wKFt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZV0pLFxuICAgICAgICAgICAgc2hvd05leHRUZXJtID0gKGluZGV4LCBhY2NlcHRUZXJtcykgPT4ge1xuICAgICAgICAgICAgICAgIHZhciB0ZXJtcyA9IGFjY2VwdFRlcm1zKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRlcm1zW2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICB0ZXJtc1tpbmRleF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0VGVybXModGVybXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFRlcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3LWhpZGRlbiBwdWJsaXNoLXJ1bGVzJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0VGVybVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGVybVswXS5jbGFzc0xpc3QucmVtb3ZlKCd3LWhpZGRlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vc2hvdyBwdWJsaXNoIGJ1dHRvbiBhZnRlciBhY2NlcHRpbmcgYWxsIHJ1bGVzXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSB0ZXJtcy5sZW5ndGggLSAxKXtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncHVibGlzaC1idG4tc2VjdGlvbicpWzBdLmNsYXNzTGlzdC5yZW1vdmUoJ3ctaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvYWRlciA9IHBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW47XG5cbiAgICAgICAgZmlsdGVyc1ZNLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgICBjb25zdCBsID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgYWNjb3VudEwgPSBsb2FkZXIobW9kZWxzLnByb2plY3RBY2NvdW50LmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICBsLmxvYWQoKS50aGVuKHByb2plY3REZXRhaWxzKTtcbiAgICAgICAgYWNjb3VudEwubG9hZCgpLnRoZW4ocHJvamVjdEFjY291bnQpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgYWNjb3VudEw6IGFjY291bnRMLFxuICAgICAgICAgICAgZmlsdGVyc1ZNOiBmaWx0ZXJzVk0sXG4gICAgICAgICAgICBhY2NlcHRUZXJtOiBhY2NlcHRUZXJtLFxuICAgICAgICAgICAgZmxleEFjY2VwdFRlcm06IGZsZXhBY2NlcHRUZXJtLFxuICAgICAgICAgICAgc2hvd05leHRUZXJtOiBzaG93TmV4dFRlcm0sXG4gICAgICAgICAgICBwcm9qZWN0QWNjb3VudDogcHJvamVjdEFjY291bnQsXG4gICAgICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHNcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IF8uZmlyc3QoY3RybC5wcm9qZWN0RGV0YWlscygpKSxcbiAgICAgICAgICBhY2NvdW50ID0gXy5maXJzdChjdHJsLnByb2plY3RBY2NvdW50KCkpLFxuICAgICAgICAgIGZsZXhUZXJtcyA9IChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICcxLzknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1JlZ3JhcyBkYSBtb2RhbGlkYWRlIEZMRVgnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ1ZvY8OqIGVzY29saGV1IGEgY2FtcGFuaGEgZmxleMOtdmVsLiBEZXNzYSBtYW5laXJhLCB2b2PDqiBpcsOhIHJlY2ViZXIgb3MgcmVjdXJzb3MgYXJyZWNhZGFkb3MgwqBqdW50byBhb3MgYXBvaWFkb3JlcyBhbyBmaW5hbCBkbyBwcmF6byBkYSBjYW1wYW5oYSAoZGVzY29udGFuZG8gYSB0YXhhIGRvIENhdGFyc2UpIGUgZGV2ZXLDoSBjdW1wcmlyIGNvbSBhIGV4ZWN1w6fDo28gZG8gcHJvamV0byBlIGNvbSBhIGVudHJlZ2EgZGFzIHJlY29tcGVuc2FzIG9mZXJlY2lkYXMgaW5kZXBlbmRlbnRlIGRvIHF1YW50byBhcnJlY2FkYXIuJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnMi85JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdNZXRhIGRlIGFycmVjYWRhw6fDo28nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ0EgbWV0YSBuw6NvIHBvZGVyw6Egc2VyIGFsdGVyYWRhIGFww7NzIG8gcHVibGljYcOnw6NvIGRvIHByb2pldG8uJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnMy85JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdUYXhhcycpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ0FvIGZpbmFsIGRhIGNhbXBhbmhhLCBjb2JyYXJlbW9zIDEzJSBzb2JyZSBvICcsXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ3ZhbG9yIHRvdGFsIGFycmVjYWRhZG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnNC85JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdQcmF6byBkYSBjYW1wYW5oYScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnU3VhIGNhbXBhbmhhIHBvZGVyw6EgZmljYXIgYXTDqSAxMiBtZXNlcyBhcnJlY2FkYW5kbyBkZW50cm8gZG8gQ2F0YXJzZS4gRHVyYW50ZSBlc3NlIHBlcsOtb2RvIHZvY8OqIGRldmVyw6EgZGVmaW5pciB1bSBwcmF6byBkZSBlbmNlcnJhbWVudG8gZGEgY2FtcGFuaGEgcGFyYSBwb2RlciByZWNlYmVyIG9zIHJlY3Vyc29zIGFycmVjYWRhZG9zLiBVbWEgdmV6IGRlZmluaWRvLCBvIHByYXpvIGRlIGVuY2VycmFtZW50byBuw6NvIHBvZGVyw6Egc2VyIGFsdGVyYWRvLicpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzUvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUHJhem8gcGFyYSByZXBhc3NlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdBcMOzcyBlbmNlcnJhciBhIHN1YSBjYW1wYW5oYSBlIGNvbmZpcm1hciBzZXVzIGRhZG9zIGJhbmPDoXJpb3MsIG8gQ2F0YXJzZSByZWFsaXphcsOhIG8gcmVwYXNzZSBkaXJldGFtZW50ZSBuYSBzdWEgY29udGEgY29ycmVudGUgZW0gYXTDqSAxMCBkaWFzIMO6dGVpcy4gTyB2YWxvciBkZXBvc2l0YWRvIGrDoSBlc3RhcsOhIGNvbnNpZGVyYW5kbyBvIGRlc2NvbnRvIGRlIDEzJSBkYSB0YXhhLicpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzYvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTyBxdWUgcG9kZSBlIG7Do28gcG9kZSBhbHRlcmFyIG5hIHDDoWdpbmEgZG8gcHJvamV0byBhIHBhcnRpciBkYSBwdWJsaWNhw6fDo28/JylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBbbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBuw6NvIHBvZGVyw6E6JyksJyBhbHRlcmFyIG8gbm9tZSBkbyBwcm9qZXRvLCBhIFVSTCAobGluaykgZG8gcHJvamV0bywgYSBjYXRlZ29yaWEgZXNjb2xoaWRhLCBhIG1ldGEgZGUgYXJyZWNhZGHDp8OjbywgbyBwcmF6byBlc2NvbGhpZG8gZSBhcyByZWNvbXBlbnNhcyBvbmRlIGV4aXN0aXJlbSBhcG9pb3MgasOhIGVmZXR1YWRvcy5cXFxuICAgICAgICAgICAgICAgICAgICAnICAgICAgICAgICAgICAgICAgICAgICAgICAsbSgnYnInKSxtKCdicicpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBwb2RlcsOhOiAnKSwnZWRpdGFyIG8gY29udGXDumRvIGRhIGRlc2NyacOnw6NvIGRvIHByb2pldG8sIGFsdGVyYXIgbyB2w61kZW8gcHJpbmNpcGFsIGRhIGNhbXBhbmhhLCBhIGltYWdlbSBkbyBwcm9qZXRvLCBhIGZyYXNlIGRlIGVmZWl0byBhcyByZWNvbXBlbnNhcyBvbmRlIG7Do28gZXhpc3RpcmVtIGFwb2lvcyBlZmV0dWFkb3MsIGFsw6ltIGRlIGFkaWNpb25hciBub3ZhcyByZWNvbXBlbnNhcyBkdXJhbnRlIGEgYXJyZWNhZGHDp8Ojby4nXSldXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzcvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUmVzcG9uc2FiaWxpZGFkZSBkbyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBbbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdPIENhdGFyc2Ugw6kgcmVzcG9uc8OhdmVsOicpLCfCoHBlbG8gZGVzZW52b2x2aW1lbnRvIHRlY25vbMOzZ2ljbyBkYSBwbGF0YWZvcm1hLCBhdGVuZGltZW50byBkZSBkw7p2aWRhcyBlIHByb2JsZW1hcyAodGFudG8gZGUgYXBvaWFkb3JlcyBxdWFudG8gZGUgcmVhbGl6YWRvcmVzKSwgcG9yIGhvc3BlZGFyIG8gcHJvamV0byBuYSBwbGF0YWZvcm1hIGUgcG9yIGdhcmFudGlyIGEgc2VndXJhbsOnYSBkYXMgdHJhbnNhw6fDtWVzIGZpbmFuY2VpcmFzLlxcICcsbSgnYnInKSxtKCdicicpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdPIENhdGFyc2UgbsOjbyDDqSByZXNwb25zw6F2ZWw6JyksJ8KgcGVsbyBmaW5hbmNpYW1lbnRvLCBkaXZ1bGdhw6fDo28gZSBleGVjdcOnw6NvLCBuZW0gcGVsYSBlbnRyZWdhIGRlIHJlY29tcGVuc2FzIGRvcyBwcm9qZXRvcyBpbnNjcml0b3MuJ10pXVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICc4LzknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1N1YXMgcmVzcG9uc2FiaWxpZGFkZXMnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLCfDiSBzdWEgcmVzcG9uc2FiaWxpZGFkZSB0dWRvIGFxdWlsbyBxdWUgZGl6IHJlc3BlaXRvIGEgZm9ybWF0YcOnw6NvIGRvIHByb2pldG8sIHBsYW5lamFtZW50byBlIGRpdnVsZ2HDp8OjbyBkYSBjYW1wYW5oYSBkZSBhcnJlY2FkYcOnw6NvLCBtb2JpbGl6YcOnw6NvIGRlIGFwb2lhZG9yZXMsIGV4ZWN1w6fDo28gZG8gcHJvamV0bywgcHJvZHXDp8OjbyBlIGVudHJlZ2EgZGUgcmVjb21wZW5zYXMgZGVudHJvIGRvIHByYXpvIGVzdGltYWRvIGUgY29tdW5pY2HDp8OjbyBjb20gYXBvaWFkb3Jlcy4nXSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzkvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtzdHlsZTogeydmb250LXdlaWdodCc6ICcgNjAwJ319LCAnUmV0aXJhZGFzIGRlIHByb2pldG9zIG5vIGFyJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnKSwnTyBDQVRBUlNFIHJlc2VydmEtc2UgbyBkaXJlaXRvIGRlLCBhIHNldSBleGNsdXNpdm8gY3JpdMOpcmlvIGUgdW1hIHZleiBub3RpZmljYWRvIGEgcmVzcGVpdG8sIGNhbmNlbGFyIHByb2pldG9zIGUgZW5jZXJyYXIgYXMgY29udGFzIGRlIENSSUFET1JFUyBERSBQUk9KRVRPUyBxdWUgdmlvbGVtIG5vc3NhcyAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cXCdodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1JlZ3JhcyBkbyBKb2dvJyksJyBlICcsbSgnYS5hbHQtbGlua1tocmVmPVxcJ2h0dHA6Ly93d3cuY2F0YXJzZS5tZS90ZXJtcy1vZi11c2VcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1Rlcm1vcyBkZSBVc28nKSwnLiddKVxuICAgICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgIF07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHRlcm1zID0gKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIFttKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzEvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1JlZ3JhcyBkYSBtb2RhbGlkYWRlIFR1ZG8tb3UtbmFkYScpXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgWydWb2PDqiBlc2NvbGhldSBhIGNhbXBhbmhhIHR1ZG8tb3UtbmFkYS4gRGVzc2EgbWFuZWlyYSwgdm9jw6ogc8OzIGlyw6EgcmVjZWJlciBvcyByZWN1cnNvcyBhcnJlY2FkYWRvcyAnLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdjYXNvIGF0aW5qYSBvdSBzdXBlcmUgYSBtZXRhIGRlIGFycmVjYWRhw6fDo28nKSwnLiBDYXNvIGNvbnRyw6FyaW8sIHRvZG9zIHNldXMgYXBvaWFkb3JlcyBzZXLDo28gcmVlbWJvbHNhZG9zLiBWb2PDqiBzZXLDoSByZXNwb25zw6F2ZWwgcGVsYSBlbnRyZWdhIGRhcyByZWNvbXBlbnNhcyBvZmVyZWNpZGFzIHNlIHNldSBwcm9qZXRvIGFsY2Fuw6dhciBhIG1ldGEgZGUgYXJyZWNhZGHDp8Ojby4nXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICcyLzknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge3N0eWxlOiB7J2ZvbnQtd2VpZ2h0JzogJyA2MDAnfX0sICdNZXRhIGRlIGFycmVjYWRhw6fDo28nKVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdBIG1ldGEgbsOjbyBwb2RlcsOhIHNlciBhbHRlcmFkYSBhcMOzcyBvIHB1YmxpY2HDp8OjbyBkbyBwcm9qZXRvLicpLFxuXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnMy85JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtzdHlsZTogeydmb250LXdlaWdodCc6ICcgNjAwJ319LCAnVGF4YXMnKVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb2JyYW1vcyAxMyUgc29icmUgbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ3ZhbG9yIHRvdGFsIGFycmVjYWRhZG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgcGVsbyBzZXUgcHJvamV0byBjYXNvIGVsZSBhdGluamEgb3Ugc3VwZXJlIGEgbWV0YSBkZW50cm8gZG8gcHJhem8gZGEgY2FtcGFuaGEuIFNlIG8gcHJvamV0byBuw6NvIGF0aW5naXIgYSBtZXRhLCBuZW5odW1hIHRheGEgc2Vyw6EgY29icmFkYS4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJylcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzQvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7c3R5bGU6IHsnZm9udC13ZWlnaHQnOiAnIDYwMCd9fSwgJ1ByYXpvIGRhIGNhbXBhbmhhJylcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBgU2V1IHByb2pldG8gZXN0YXLDoSBlbSBhcnJlY2FkYcOnw6NvIG5vIENhdGFyc2UgYXTDqSBvIGRpYSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gw6BzIDIzaDU5bWluNTlzLiBFc3RlIHByYXpvIG7Do28gcG9kZXLDoSBzZXIgYWx0ZXJhZG8gYXDDs3MgYSBwdWJsaWNhw6fDo28gZG8gcHJvamV0by5gKVxuICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzUvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7c3R5bGU6IHsnZm9udC13ZWlnaHQnOiAnIDYwMCd9fSwgJ1JlZ3JhcyBkbyByZXBhc3NlIGUgcmVlbWJvbHNvJylcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbJ0Fww7NzIGVuY2VycmFyIG8gc2V1IHByb2pldG8gZSBjb25maXJtYXIgc2V1cyBkYWRvcyBiYW5jw6FyaW9zLCBvIENhdGFyc2UgZGVwb3NpdGFyw6EgbyB2YWxvciBhcnJlY2FkYWRvLCBqw6EgY29tIG8gZGVzY29udG8gZGEgdGF4YSwgbmEgc3VhIGNvbnRhIGNvcnJlbnRlIGVtIGF0w6kgMTAgZGlhcyDDunRlaXMuIENhc28gbyBwcm9qZXRvIG7Do28gYXRpbmphIDEwMCUgZGEgbWV0YSBkZW50cm8gZG8gcHJhem8sIG8gQ2F0YXJzZSBpcsOhIHJlZW1ib2xzYXIgb3MgYXBvaWFkb3Jlcy4gJyxtKCdhLmFsdC1saW5rW2hyZWY9XFwnaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDdcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1NhaWJhIG1haXMgc29icmUgbyBwcm9jZXNzbyBkZSByZWVtYm9sc28nKSwnLiddKVxuICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJzYvOScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7c3R5bGU6IHsnZm9udC13ZWlnaHQnOiAnIDYwMCd9fSwgJ08gcXVlIHBvZGUgZSBuw6NvIHBvZGUgYWx0ZXJhciBuYSBww6FnaW5hIGRvIHByb2pldG8gYSBwYXJ0aXIgZGEgcHVibGljYcOnw6NvPycpXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIFttKCdkaXYnLCBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZvY8OqIG7Do28gcG9kZXLDoTonKSwnIGFsdGVyYXIgbyBub21lIGRvIHByb2pldG8sIGEgVVJMIChsaW5rKSBkbyBwcm9qZXRvLCBhIGNhdGVnb3JpYSBlc2NvbGhpZGEsIGEgbWV0YSBkZSBhcnJlY2FkYcOnw6NvLCBvIHByYXpvIGVzY29saGlkbyBlIGFzIHJlY29tcGVuc2FzIG9uZGUgZXhpc3RpcmVtIGFwb2lvcyBqw6EgZWZldHVhZG9zLlxcICcsbSgnYnInKSxtKCdicicpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBwb2RlcsOhOiAnKSwnZWRpdGFyIG8gY29udGXDumRvIGRhIGRlc2NyacOnw6NvIGRvIHByb2pldG8sIGFsdGVyYXIgbyB2w61kZW8gcHJpbmNpcGFsIGRhIGNhbXBhbmhhLCBhIGltYWdlbSBkbyBwcm9qZXRvLCBhIGZyYXNlIGRlIGVmZWl0byBhcyByZWNvbXBlbnNhcyBvbmRlIG7Do28gZXhpc3RpcmVtIGFwb2lvcyBlZmV0dWFkb3MsIGFsw6ltIGRlIGFkaWNpb25hciBub3ZhcyByZWNvbXBlbnNhcyBkdXJhbnRlIGEgYXJyZWNhZGHDp8Ojby4nXSldXSksXG5cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICc3LzknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge3N0eWxlOiB7J2ZvbnQtd2VpZ2h0JzogJyA2MDAnfX0sICdSZXNwb25zYWJpbGlkYWRlIGRvIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBbbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdPIENhdGFyc2Ugw6kgcmVzcG9uc8OhdmVsOicpLCfCoHBlbG8gZGVzZW52b2x2aW1lbnRvIHRlY25vbMOzZ2ljbyBkYSBwbGF0YWZvcm1hLCBhdGVuZGltZW50byBkZSBkw7p2aWRhcyBlIHByb2JsZW1hcyAodGFudG8gZGUgYXBvaWFkb3JlcyBxdWFudG8gZGUgcmVhbGl6YWRvcmVzKSwgcG9yIGhvc3BlZGFyIG8gcHJvamV0byBuYSBwbGF0YWZvcm1hIGUgcG9yIGdhcmFudGlyIGEgc2VndXJhbsOnYSBkYXMgdHJhbnNhw6fDtWVzIGZpbmFuY2VpcmFzLlxcICcsbSgnYnInKSxtKCdicicpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdPIENhdGFyc2UgbsOjbyDDqSByZXNwb25zw6F2ZWw6JyksJ8KgcGVsbyBmaW5hbmNpYW1lbnRvLCBkaXZ1bGdhw6fDo28gZSBleGVjdcOnw6NvLCBuZW0gcGVsYSBlbnRyZWdhIGRlIHJlY29tcGVuc2FzIGRvcyBwcm9qZXRvcyBpbnNjcml0b3MuJ10pXV0pLFxuXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnOC85JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtzdHlsZTogeydmb250LXdlaWdodCc6ICcgNjAwJ319LCAnU3VhcyByZXNwb25zYWJpbGlkYWRlcycpXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcpLCfDiSBzdWEgcmVzcG9uc2FiaWxpZGFkZSB0dWRvIGFxdWlsbyBxdWUgZGl6IHJlc3BlaXRvIGEgZm9ybWF0YcOnw6NvIGRvIHByb2pldG8sIHBsYW5lamFtZW50byBlIGRpdnVsZ2HDp8OjbyBkYSBjYW1wYW5oYSBkZSBhcnJlY2FkYcOnw6NvLCBtb2JpbGl6YcOnw6NvIGRlIGFwb2lhZG9yZXMsIGV4ZWN1w6fDo28gZG8gcHJvamV0bywgcHJvZHXDp8OjbyBlIGVudHJlZ2EgZGUgcmVjb21wZW5zYXMgZGVudHJvIGRvIHByYXpvIGVzdGltYWRvIGUgY29tdW5pY2HDp8OjbyBjb20gYXBvaWFkb3Jlcy4nXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICc5LzknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge3N0eWxlOiB7J2ZvbnQtd2VpZ2h0JzogJyA2MDAnfX0sICdSZXRpcmFkYXMgZGUgcHJvamV0b3Mgbm8gYXInKVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnKSwnTyBDQVRBUlNFIHJlc2VydmEtc2UgbyBkaXJlaXRvIGRlLCBhIHNldSBleGNsdXNpdm8gY3JpdMOpcmlvIGUgdW1hIHZleiBub3RpZmljYWRvIGEgcmVzcGVpdG8sIGNhbmNlbGFyIHByb2pldG9zIGUgZW5jZXJyYXIgYXMgY29udGFzIGRlIENSSUFET1JFUyBERSBQUk9KRVRPUyBxdWUgdmlvbGVtIG5vc3NhcyAnLG0oJ2EuYWx0LWxpbmtbaHJlZj1cXCdodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1JlZ3JhcyBkbyBKb2dvJyksJyBlICcsbSgnYS5hbHQtbGlua1tocmVmPVxcJ2h0dHA6Ly93d3cuY2F0YXJzZS5tZS90ZXJtcy1vZi11c2VcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1Rlcm1vcyBkZSBVc28nKSwnLiddKVxuICAgICAgICAgICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gWyFjdHJsLmwoKSAmJiAhY3RybC5hY2NvdW50TCgpID8gW1xuICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KHByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICBwcm9qZWN0OiBtLnByb3AocHJvamVjdCksXG4gICAgICAgICAgICBoaWRlUHVibGlzaDogdHJ1ZVxuICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgbShgLnctc2VjdGlvbi5zZWN0aW9uLXByb2R1Y3QuJHtwcm9qZWN0Lm1vZGV9YCksXG4gICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgbSgnaW1nLnUtbWFyZ2luYm90dG9tLTIwW3NyYz1cXCcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL2xhdW5jaC1pY29uLnBuZ1xcJ11bd2lkdGg9XFwnOTRcXCddJyksXG4gICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdQcm9udG8gcGFyYSBsYW7Dp2FyIHN1YSBjYW1wYW5oYT8nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJywgJ1ByZXBhcmFtb3MgdW1hIGxpc3RhIGNvbSBpbmZvcm1hw6fDtWVzIGltcG9ydGFudGVzIHBhcmEgdm9jw6ogY2hlY2FyIGFudGVzIGRlIGNvbG9jYXIgc2V1IHByb2pldG8gbm8gYXIhJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctZ3JheS5zZWN0aW9uLmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLmNhcmQubWVkaXVtLnUtbWFyZ2luYm90dG9tLTYwLmNhcmQtdGVyY2lhcnknLCBbXG4gICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgbSgnaW1nLmNhcmQtcHJvamVjdC10aHVtYi51LXJpZ2h0W3NyYz0nICsgcHJvamVjdC5sYXJnZV9pbWFnZSArICddJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0zMC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1TDrXR1bG86ICcpLCBwcm9qZWN0Lm5hbWVdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdMaW5rOiAnKSxgd3d3LmNhdGFyc2UubWUvJHtwcm9qZWN0LnBlcm1hbGlua31gXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTW9kYWxpZGFkZSBkZSBmaW5hbmNpYW1lbnRvOiAnKSwgSTE4bi50KHByb2plY3QubW9kZSwgSTE4blNjb3BlKCkpXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnTWV0YSBkZSBhcnJlY2FkYcOnw6NvOiAnKSxgUiQgJHtoLmZvcm1hdE51bWJlcihwcm9qZWN0LmdvYWwsIDIsIDMpfWBdKSxcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSAhPT0gJ2ZsZXgnKSA/IG0oJ2RpdicsIFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUHJhem86ICR7cHJvamVjdC5vbmxpbmVfZGF5c30gZGlhc2ApXSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSZXNwb25zw6F2ZWw6ICcpLCBhY2NvdW50Lm93bmVyX25hbWVdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdDUEYvQ05QSjogJyksIGFjY291bnQub3duZXJfZG9jdW1lbnRdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMTAnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnT3MgZGFkb3MgYWNpbWEgbsOjbyBwb2RlbSBzZXIgYWx0ZXJhZG9zIGFww7NzIG8gcHJvamV0byBlbnRyYXIgbm8gYXIuIFNlIHZvY8OqIHByZWNpc2EgZmF6ZXIgbXVkYW7Dp2FzLCBuYXZlZ3VlIG5hIGJhcnJhIGxhdGVyYWwgZSB2b2x0ZSBhcXVpIHF1YW5kbyBlc3RpdmVyIHR1ZG8gcHJvbnRvIScpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcuY2FyZC5tZWRpdW0udS1yYWRpdXMudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1JlbGVtYnJlIG5vc3NhcyByZWdyYXMnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbCcsIFsnQW50ZXMgZGUgcHVibGljYXIsIGNsaXF1ZSBub3MgY8OtcmN1bG9zIGFiYWl4byBlIGNvbmZpcm1lIHF1ZSB2b2PDqiBlc3TDoSBjaWVudGUgZGUgY29tbyBmdW5jaW9uYSBvIENhdGFyc2UuIFF1YWxxdWVyIGTDunZpZGEsICcsbSgnYS5hbHQtbGlua1tocmVmPVxcJ2h0dHBzOi8vZXF1aXBlY2F0YXJzZS56ZW5kZXNrLmNvbS9hY2NvdW50L2Ryb3Bib3hlcy8yMDI5ODUzN1xcJ11bdGFyZ2V0PVxcJ19ibGFua1xcJ10nLCAnZW50cmUgZW0gY29udGF0bycpLCchJ10pXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICBfLm1hcChwcm9qZWN0Lm1vZGUgPT0gJ2ZsZXgnID8gZmxleFRlcm1zKHByb2plY3QpIDogdGVybXMocHJvamVjdCksICh0ZXJtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYC51LW1hcmdpbmJvdHRvbS0zMC5mb250c2l6ZS1iYXNlJHtpbmRleCA9PSAwID8gJycgOiAnLnctaGlkZGVuLnB1Ymxpc2gtcnVsZXMnfWAsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgLnctcm93W2lkPSdydWxlLSR7aW5kZXh9J11gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgocHJvamVjdC5tb2RlID09ICdmbGV4JyA/IGN0cmwuZmxleEFjY2VwdFRlcm0oKSA6IGN0cmwuYWNjZXB0VGVybSgpKVtpbmRleF0gPyBgYS53LWlubGluZS1ibG9jay5jaGVja2JveC1iaWdbaHJlZj0nI3J1bGUtJHtpbmRleCArIDF9J11gIDogYGEudy1pbmxpbmUtYmxvY2suY2hlY2tib3gtYmlnLmNoZWNrYm94LS1zZWxlY3RlZC5mYS5mYS1jaGVjay5mYS1sZ1tocmVmPScjcnVsZS0ke2luZGV4ICsgMX0nXWAsIHtvbmNsaWNrOiAoKSA9PiBjdHJsLnNob3dOZXh0VGVybShpbmRleCwgKHByb2plY3QubW9kZSA9PSAnZmxleCcgPyBjdHJsLmZsZXhBY2NlcHRUZXJtIDogY3RybC5hY2NlcHRUZXJtKSl9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICB0ZXJtXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctcm93LnB1Ymxpc2gtYnRuLXNlY3Rpb24udy1oaWRkZW4nLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPS8ke3Byb2plY3QubW9kZSA9PSAnZmxleCcgPyAnZmxleGlibGVfcHJvamVjdHMnIDogJ3Byb2plY3RzJ30vJHtwcm9qZWN0Lm1vZGUgPT0gJ2ZsZXgnID8gcHJvamVjdC5mbGV4X2lkIDogcHJvamVjdC5pZH0vcHVzaF90b19vbmxpbmVdYCwgJ1B1YmxpY2FyIGFnb3JhIScpLFxuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAnQW8gcHVibGljYXIgbyBzZXUgcHJvamV0bywgdm9jw6ogZXN0w6EgYWNlaXRhbmRvIG9zICcsXG4gICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XFwnL3Rlcm1zLW9mLXVzZVxcJ11bdGFyZ2V0PVxcJ19ibGFua1xcJ10nLCAnVGVybW9zIGRlIFVzbycpLFxuICAgICAgICAgICAgICAgICAgJywgJyxcbiAgICAgICAgICAgICAgICAgIHByb2plY3QubW9kZSA9PSAnZmxleCcgP1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XFwnaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDY1NzQ4MzMtUmVncmFzLXBhcmEtYS1mYXNlLWRlLXRlc3Rlcy1kby1DYXRhcnNlLUZsZXhcXCddW3RhcmdldD1cXCdfYmxhbmtcXCddJywgJ1JlZ3JhcyBkbyBGbGV4JykgOiAnJyxcbiAgICAgICAgICAgICAgICAgICcgZSAnLFxuICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVxcJy9wcml2YWN5LXBvbGljeVxcJ11bdGFyZ2V0PVxcJ19ibGFua1xcJ10nLCAnUG9saXRpY2EgZGUgUHJpdmFjaWRhZGUnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pLFxuICAgICAgICAnXFxcbiAgICAnXG4gICAgICBdIDogaC5sb2FkZXIoKV07XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHVibGlzaDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IHRlYW1Ub3RhbCBmcm9tICd0ZWFtLXRvdGFsJztcbmltcG9ydCB0ZWFtTWVtYmVycyBmcm9tICd0ZWFtLW1lbWJlcnMnO1xuXG5jb25zdCB0ZWFtID0ge1xuICAgIHZpZXcgKCkge1xuICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgIG0uY29tcG9uZW50KHRlYW1Ub3RhbCksXG4gICAgICAgICAgICBtLmNvbXBvbmVudCh0ZWFtTWVtYmVycylcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB0ZWFtO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBhZG1pblByb2plY3QgZnJvbSAnYWRtaW4tcHJvamVjdCc7XG5pbXBvcnQgYWRtaW5Db250cmlidXRpb24gZnJvbSAnYWRtaW4tY29udHJpYnV0aW9uJztcbmltcG9ydCBhZG1pbkNvbnRyaWJ1dGlvblVzZXIgZnJvbSAnYWRtaW4tY29udHJpYnV0aW9uLXVzZXInO1xuaW1wb3J0IHBheW1lbnRTdGF0dXMgZnJvbSAncGF5bWVudC1zdGF0dXMnO1xuXG5jb25zdCBhZG1pbkNvbnRyaWJ1dGlvbkl0ZW0gPSB7XG4gICAgY29udHJvbGxlciAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGFkbWluQ29udHJpYnV0aW9uVXNlcixcbiAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGFkbWluUHJvamVjdCxcbiAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGFkbWluQ29udHJpYnV0aW9uLFxuICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC0yJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogcGF5bWVudFN0YXR1cyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgJy53LXJvdycsXG4gICAgICAgICAgICBfLm1hcChjdHJsLml0ZW1CdWlsZGVyLCBmdW5jdGlvbihwYW5lbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKHBhbmVsLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChwYW5lbC5jb21wb25lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRtaW5Db250cmlidXRpb25JdGVtO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgY29tcG9uZW50XG4gKiBBbiBpdGVtYnVpbGRlciBjb21wb25lbnQgdGhhdCByZXR1cm5zIGFkZGl0aW9uYWwgZGF0YVxuICogdG8gYmUgaW5jbHVkZWQgaW4gQWRtaW5Vc2VyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4ge1xuICogICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAqICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gKiAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAqICAgICAgICAgfV1cbiAqICAgICB9XG4gKiB9XG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGFkbWluVXNlciBmcm9tICdhZG1pbi11c2VyJztcblxuY29uc3QgYWRtaW5Db250cmlidXRpb25Vc2VyID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1nX3RodW1ibmFpbDogaXRlbS51c2VyX3Byb2ZpbGVfaW1nLFxuICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0udXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlcl9uYW1lLFxuICAgICAgICAgICAgICAgICAgZW1haWw6IGl0ZW0uZW1haWwsXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgaXRlbS5wYXllcl9lbWFpbCk7XG4gICAgICAgIHJldHVybiBtLmNvbXBvbmVudChhZG1pblVzZXIsIHtpdGVtOiB1c2VyLCBhZGRpdGlvbmFsX2RhdGE6IGFkZGl0aW9uYWxEYXRhfSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRtaW5Db250cmlidXRpb25Vc2VyO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgYWRtaW5Db250cmlidXRpb24gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLXNtYWxsJywgJ1IkJyArIGNvbnRyaWJ1dGlvbi52YWx1ZSksXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAnSUQgZG8gR2F0ZXdheTogJyxcbiAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhZG1pbkNvbnRyaWJ1dGlvbjtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiBjb21wb25lbnRcbiAqIE1ha2VzIGFyYml0cmFyeSBhamF4IHJlcXVlc3RzIGFuZCB1cGRhdGUgdW5kZXJseWluZ1xuICogZGF0YSBmcm9tIHNvdXJjZSBlbmRwb2ludC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IGFkbWluRXh0ZXJuYWxBY3Rpb24gPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgaC5hdXRoZW50aWNpdHlUb2tlbigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCByZWxvYWQgPSBfLmNvbXBvc2UoYnVpbGRlci5tb2RlbC5nZXRSb3dXaXRoVG9rZW4sIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSkucGFyYW1ldGVycyksXG4gICAgICAgICAgICBsID0gbS5wcm9wKGZhbHNlKTtcblxuICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKCkgPT4gcmVsb2FkKCkudGhlbih1cGRhdGVJdGVtKTtcblxuICAgICAgICBjb25zdCByZXF1ZXN0RXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICBsKGZhbHNlKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBsKHRydWUpO1xuICAgICAgICAgICAgbS5yZXF1ZXN0KGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMpLnRoZW4ocmVsb2FkSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlcXVpc2nDp8OjbyBmZWl0YSBjb20gc3VjZXNzby4nKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLicpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhZG1pbkV4dGVybmFsQWN0aW9uO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBmaWx0ZXJNYWluIGZyb20gJ2ZpbHRlci1tYWluJztcblxuY29uc3QgYWRtaW5GaWx0ZXIgPSB7XG4gICAgY29udHJvbGxlciAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnLFxuICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGZpbHRlck1haW5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIGxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGFyZ3Muc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW4gPyBtLmNvbXBvbmVudChtYWluLmNvbXBvbmVudCwgbWFpbi5kYXRhKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwLnctcm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoZi5jb21wb25lbnQgIT09IGZpbHRlck1haW4pID8gbS5jb21wb25lbnQoZi5jb21wb25lbnQsIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkbWluRmlsdGVyO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgYWRtaW5JbnB1dEFjdGlvbiA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoZm9yY2VWYWx1ZSk7XG5cbiAgICAgICAgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKTtcblxuICAgICAgICBjb25zdCBsID0gcG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICBuZXdWYWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdWYWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGRhdGEuc3VjY2Vzc01lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkbWluSW5wdXRBY3Rpb247XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IGFkbWluSXRlbSBmcm9tICdhZG1pbi1pdGVtJztcblxuY29uc3QgYWRtaW5MaXN0ID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcblxuICAgICAgICBpZiAoIWxpc3QuY29sbGVjdGlvbigpLmxlbmd0aCAmJiBsaXN0LmZpcnN0UGFnZSkge1xuICAgICAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBhcmdzLnZtLmxpc3QsXG4gICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJyc7XG5cbiAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYENhcnJlZ2FuZG8gJHtsYWJlbC50b0xvd2VyQ2FzZSgpfS4uLmAgOiBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgbGlzdC50b3RhbCgpKSwgYCAke2xhYmVsLnRvTG93ZXJDYXNlKCl9IGVuY29udHJhZG9zYF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuY29sbGVjdGlvbigpLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChhZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGFyZ3MubGlzdEl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGFyZ3MubGlzdERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhZG1pbkxpc3Q7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSBjb21wb25lbnRcbiAqIFJldHVybiBub3RpZmljYXRpb25zIGxpc3QgZnJvbSBhbiBVc2VyIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAqICAgICB1c2VyOiB1c2VyXG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5cbmNvbnN0IGFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgZ2V0Tm90aWZpY2F0aW9ucyA9ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG1vZGVscy5ub3RpZmljYXRpb247XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmdldFBhZ2VXaXRoVG9rZW4ocG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHNlbnRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnVzZXJfaWQodXNlci5pZClcbiAgICAgICAgICAgICAgICAuc2VudF9hdCghbnVsbClcbiAgICAgICAgICAgICAgICAub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICBzZW50X2F0OiAnZGVzYydcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXJzKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4obm90aWZpY2F0aW9ucyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGdldE5vdGlmaWNhdGlvbnMoYXJncy51c2VyKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uczogbm90aWZpY2F0aW9uc1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCkge1xuICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRlIG5vdGlmaWNhw6fDtWVzJyksXG4gICAgICAgICAgICBjdHJsLm5vdGlmaWNhdGlvbnMoKS5tYXAoKGNFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTI0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjRXZlbnQuc2VudF9hdCwgJ0REL01NL1lZWVksIEhIOm1tJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICcgLSAnLCBjRXZlbnQudGVtcGxhdGVfbmFtZSwgY0V2ZW50Lm9yaWdpbiA/ICcgLSAnICsgY0V2ZW50Lm9yaWdpbiA6ICcnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkbWluTm90aWZpY2F0aW9uSGlzdG9yeTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgY29tcG9uZW50XG4gKiByZW5kZXIgYW4gYm94IHdpdGggc29tZSBwcm9qZWN0IHN0YXRpc3RpY3MgaW5mb1xuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gKiAgICAgcmVzb3VyY2U6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xuaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuY29uc3QgYWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgICBnZW5lcmF0ZVN0YXR1c1RleHQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOTyBBUidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ07Dg08gRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXdhaXRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBR1VBUkRBTkRPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkVDVVNBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JBU0NVTkhPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdFTSBBTsOBTElTRSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQVBST1ZBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNGaW5hbExhcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBAVE9ETzogdXNlIDggZGF5cyBiZWNhdXNlIHRpbWV6b25lIG9uIGpzXG4gICAgICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpICYmIG1vbWVudCgpLmFkZCg4LCAnZGF5cycpID49IG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgIHN0YXR1c1RleHRPYmo6IGdlbmVyYXRlU3RhdHVzVGV4dCgpLFxuICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QuZWxhcHNlZF90aW1lKSxcbiAgICAgICAgICAgIGlzRmluYWxMYXA6IGlzRmluYWxMYXBcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwpIHtcbiAgICAgICAgbGV0IHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgIHN0YXR1c1RleHRPYmogPSBjdHJsLnN0YXR1c1RleHRPYmooKSxcbiAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmosXG4gICAgICAgICAgICBlbGFwc2VkVGV4dE9iaiA9IGN0cmwuZWxhcHNlZFRleHRPYmo7XG5cbiAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksICfCoCcsXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc1xuICAgICAgICAgICAgICAgICAgICB9LCAoY3RybC5pc0ZpbmFsTGFwKCkgJiYgcHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ1JFVEEgRklOQUwnIDogc3RhdHVzVGV4dE9iai50ZXh0KSksICfCoCdcbiAgICAgICAgICAgICAgICBdKSwgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2ZpbmFuY2lhZG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9ncmVzcyArICclJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2xldmFudGFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdpbmljaWFkbyBow6EnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZWxhcHNlZFRleHRPYmoudG90YWwgKyAnICcgKyBlbGFwc2VkVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ3Jlc3RhbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCArICcgJyArIHJlbWFpbmluZ1RleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICB9KCkpXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZG1pblByb2plY3REZXRhaWxzQ2FyZDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IGFkbWluUHJvamVjdCA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLml0ZW07XG4gICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRtaW5Qcm9qZWN0O1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuXG5jb25zdCBhZG1pblJhZGlvQWN0aW9uID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSgpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoaXRlbS5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgIG5ld0lEID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgc2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgZ2V0S2V5VmFsdWUgPSBhcmdzLmdldEtleVZhbHVlLFxuICAgICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXksXG4gICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZSA9IGFyZ3MudXBkYXRlS2V5VmFsdWUsXG4gICAgICAgICAgICB2YWxpZGF0ZSA9IGJ1aWxkZXIudmFsaWRhdGUsXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSBidWlsZGVyLnNlbGVjdGVkSXRlbSB8fCBtLnByb3AoKTtcblxuICAgICAgICBzZXRGaWx0ZXJbdXBkYXRlS2V5XSA9ICdlcSc7XG4gICAgICAgIGNvbnN0IHNldFZNID0gcG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgICBzZXRWTVt1cGRhdGVLZXldKHVwZGF0ZUtleVZhbHVlKTtcblxuICAgICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICAgIGNvbnN0IGdldFZNID0gcG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgICBnZXRWTVtnZXRLZXldKGdldEtleVZhbHVlKTtcblxuICAgICAgICBjb25zdCBnZXRMb2FkZXIgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0UGFnZU9wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgY29uc3Qgc2V0TG9hZGVyID0gcG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgICBjb25zdCB1cGRhdGVJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gXy5maW5kV2hlcmUocmFkaW9zKCksIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGFbMF1bYnVpbGRlci5zZWxlY3RLZXldXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtKG5ld0l0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdOZW5odW0gaXRlbSBhdHVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZmV0Y2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBnZXRMb2FkZXIubG9hZCgpLnRoZW4ocmFkaW9zLCBlcnJvcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG5ld0lEKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsaWRhdGlvbiA9IHZhbGlkYXRlKHJhZGlvcygpLCBuZXdJRCgpKTtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWxpZGF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2J1aWxkZXIuc2VsZWN0S2V5XSA9IG5ld0lEKCk7XG4gICAgICAgICAgICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHVubG9hZCA9IChlbCwgaXNpbml0LCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgbmV3SUQoJycpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzZXREZXNjcmlwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmV0Y2goKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgc2V0RGVzY3JpcHRpb246IHNldERlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgICAgICBnZXRMb2FkZXI6IGdldExvYWRlcixcbiAgICAgICAgICAgIG5ld0lEOiBuZXdJRCxcbiAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCAocmFkaW8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdJRChyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IChpdGVtW2RhdGEuc2VsZWN0S2V5XSB8fCBpdGVtLmlkKSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yYWRpbycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yKCkubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZG1pblJhZGlvQWN0aW9uO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblJlc2V0UGFzc3dvcmQgY29tcG9uZW50XG4gKiBNYWtlcyBhamF4IHJlcXVlc3QgdG8gdXBkYXRlIFVzZXIgcGFzc3dvcmQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5SZXNldFBhc3N3b3JkLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IGFkbWluUmVzZXRQYXNzd29yZCA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgaC5hdXRoZW50aWNpdHlUb2tlbigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIGxvYWQgPSAoKSA9PiBtLnJlcXVlc3QoXy5leHRlbmQoe30sIHtkYXRhOiBkYXRhfSwgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucykpLFxuICAgICAgICAgICAgbmV3UGFzc3dvcmQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZSA9IG0ucHJvcCgnJyk7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgbChmYWxzZSk7XG4gICAgICAgICAgICBlcnJvcl9tZXNzYWdlKGVyci5lcnJvcnNbMF0pO1xuICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgIGwoZmFsc2UpO1xuICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGwodHJ1ZSk7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSBuZXdQYXNzd29yZCgpO1xuICAgICAgICAgICAgbG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICBlcnJvcl9tZXNzYWdlOiBlcnJvcl9tZXNzYWdlLFxuICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdQYXNzd29yZCxcbiAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtuYW1lPVwiJyArIGRhdGEucHJvcGVydHkgKyAnXCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdQYXNzd29yZCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdQYXNzd29yZCgpXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnU2VuaGEgYWx0ZXJhZGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5lcnJvcl9tZXNzYWdlKCkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRtaW5SZXNldFBhc3N3b3JkO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgYWRtaW5SZXdhcmQgPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCByZXdhcmQgPSBhcmdzLnJld2FyZCgpLFxuICAgICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21wZW5zYScpLFxuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgcmV3YXJkLmlkID8gW1xuICAgICAgICAgICAgICAgICdJRDogJyArIHJld2FyZC5pZCxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBtLnRydXN0KCdEaXNwb27DrXZlaXM6ICcgKyBhdmFpbGFibGUgKyAnIC8gJyArIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIHx8ICcmaW5maW47JykpLFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgJ0FndWFyZGFuZG8gY29uZmlybWHDp8OjbzogJyArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICAgIF0gOiAnQXBvaW8gc2VtIHJlY29tcGVuc2EnKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZG1pblJld2FyZDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgYWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgIG1hcEV2ZW50cyA9IF8ucmVkdWNlKFt7XG4gICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNvbmZpcm1hZG8nXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LFxuICAgICAgICAgICAgICAgIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbydcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdW5kZWRfYXQsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjcmlhZG8nXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbydcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uZGVsZXRlZF9hdCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LFxuICAgICAgICAgICAgICAgIG5hbWU6ICdDaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgfV0sIChtZW1vLCBpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0ZSAhPT0gbnVsbCAmJiBpdGVtLmRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCkge1xuICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdIaXN0w7NyaWNvIGRhIHRyYW5zYcOnw6NvJyksXG4gICAgICAgICAgICBjdHJsLm9yZGVyZWRFdmVudHMubWFwKChjRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBjRXZlbnQuZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgY0V2ZW50Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZG1pblRyYW5zYWN0aW9uSGlzdG9yeTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGggZnJvbSAndW5kZXJzY29yZSc7XG5cbmNvbnN0IGFkbWluVHJhbnNhY3Rpb24gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIFtcbiAgICAgICAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwID8gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldIDogJydcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkbWluVHJhbnNhY3Rpb247XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluVXNlckRldGFpbCBjb21wb25lbnRcbiAqIFJldHVybiBhY3Rpb24gaW5wdXRzIHRvIGJlIHVzZWQgaW5zaWRlIEFkbWluTGlzdCBjb21wb25lbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAqIH0pXG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgYWRtaW5SZXNldFBhc3N3b3JkIGZyb20gJ2FkbWluLXJlc2V0LXBhc3N3b3JkJztcbmltcG9ydCBhZG1pbklucHV0QWN0aW9uIGZyb20gJ2FkbWluLWlucHV0LWFjdGlvbic7XG5pbXBvcnQgYWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5IGZyb20gJ2FkbWluLW5vdGlmaWNhdGlvbi1oaXN0b3J5JztcblxuY29uc3QgYWRtaW5Vc2VyRGV0YWlsID0ge1xuICAgIGNvbnRyb2xsZXIgKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgIHJlc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWRlZmluaXInLFxuICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnTm92YSBzZW5oYSBkZSBVc3XDoXJpbzonLFxuICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnUmVkZWZpbmlyIHNlbmhhJyxcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTIzbXVkQHInLFxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMudXNlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVhY3RpdmF0ZToge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RlYWN0aXZhdGVkX2F0JyxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWF0aXZhcicsXG4gICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlYXRpdmFyIGVzc2UgdXN1w6FyaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6ICdVc3XDoXJpbyByZWF0aXZhZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyB1c3XDoXJpbyBuw6NvIHDDtGRlIHNlciByZWF0aXZhZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlYXRpdmFyIHVzdcOhcmlvJyxcbiAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgZGV0YWlscyA9IGFyZ3MuZGV0YWlscyxcbiAgICAgICAgICAgIGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvdXNlcnMvJHtpZH0vbmV3X3Bhc3N3b3JkYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGFkbWluUmVzZXRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBhZGRPcHRpb25zKGFjdGlvbnMucmVzZXQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgKGl0ZW0uZGVhY3RpdmF0ZWRfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYWRtaW5JbnB1dEFjdGlvbiwge2RhdGE6IGFjdGlvbnMucmVhY3RpdmF0ZSwgaXRlbTogaXRlbX0pIDogJydcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChhZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogaXRlbVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYWRtaW5Vc2VyRGV0YWlsO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBhZG1pblVzZXIgZnJvbSAnYWRtaW4tdXNlcic7XG5cbmNvbnN0IGFkbWluVXNlckl0ZW0gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGFkbWluVXNlciwgYXJncylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkbWluVXNlckl0ZW07XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxuY29uc3QgYWRtaW5Vc2VyID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGFyZ3MuaXRlbTtcblxuICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXVzZXInLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQodXNlci5wcm9maWxlX2ltZ190aHVtYm5haWwpICsgJ1wiXScpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvdXNlcnMvJyArIHVzZXIuaWQgKyAnL2VkaXRcIl0nLCB1c2VyLm5hbWUgfHwgdXNlci5lbWFpbClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLmlkKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdFbWFpbDogJyArIHVzZXIuZW1haWwpLFxuICAgICAgICAgICAgICAgIGFyZ3MuYWRkaXRpb25hbF9kYXRhXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZG1pblVzZXI7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNhdGVnb3J5QnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgYnRuLWNhdGVnb3J5IGNsYXNzLlxuICogSXQgdXNlcyBhIGNhdGVnb3J5IHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge1xuICogICAgIGNhdGVnb3J5OiB7XG4gKiAgICAgICAgIGlkOiAxLFxuICogICAgICAgICBuYW1lOiAnVmlkZW8nLFxuICogICAgICAgICBvbmxpbmVfcHJvamVjdHM6IDFcbiAqICAgICB9XG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxuY29uc3QgY2F0ZWdvcnlCdXR0b24gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGFyZ3MuY2F0ZWdvcnk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICBtKGBhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeSR7Y2F0ZWdvcnkubmFtZS5sZW5ndGggPiAxMyA/ICcuZG91YmxlLWxpbmUnIDogJyd9W2hyZWY9JyNieV9jYXRlZ29yeV9pZC8ke2NhdGVnb3J5LmlkfSddYCxcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5leHBsb3JlJywgY2F0ZWdvcnkub25saW5lX3Byb2plY3RzKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2F0ZWdvcnlCdXR0b247XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNvbnRyaWJ1dGlvbkFjdGl2aXRpZXMgY29tcG9uZW50XG4gKiBSZW5kZXIgYSBjb21wb25lbnQgdGhhdCBwYXNzIG9uIGNvbmZpcm1lZCBjb250cmlidXRpb25zIGluIDI0aG91cnMgaW50ZXJ2YWxcbiAqXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgLi4uXG4gKiAgICAgbS5jb21wb25lbnQoYy5Db250cmlidXRpb25BY3Rpdml0aWVzKVxuICogICAgIC4uLlxuICogfVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5cbmNvbnN0IGNvbnRyaWJ1dGlvbkFjdGl2aXRpZXMgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgaW50ZXJ2YWw7XG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICByZXNvdXJjZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICBjb2xsZWN0aW9uSW5kZXggPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TaXplID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25MID0gcG9zdGdyZXN0LmxvYWRlcihcbiAgICAgICAgICAgICAgICAgIG1vZGVscy5jb250cmlidXRpb25BY3Rpdml0eS5nZXRQYWdlT3B0aW9ucygpKSxcbiAgICAgICAgICAgICAgbmV4dFJlc291cmNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKChjb2xsZWN0aW9uSW5kZXgoKSArIDEpID4gY29sbGVjdGlvblNpemUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25JbmRleCgwKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbkluZGV4KGNvbGxlY3Rpb25JbmRleCgpICsgMSk7XG4gICAgICAgICAgICAgICAgICByZXNvdXJjZShjb2xsZWN0aW9uKClbY29sbGVjdGlvbkluZGV4KCldKTtcbiAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHN0YXJ0Q29uZmlnID0gKGVsLCBpc2luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHN0YXJ0VGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKG5leHRSZXNvdXJjZSwgMTUwMDApO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgIGNvbGxlY3Rpb25MLmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgY29sbGVjdGlvblNpemUoZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgcmVzb3VyY2UoXy5maXJzdChkYXRhKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0YXJ0VGltZXIoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgIGNvbGxlY3Rpb25MOiBjb2xsZWN0aW9uTCxcbiAgICAgICAgICAgIHJlc291cmNlOiByZXNvdXJjZSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25TaXplOiBjb2xsZWN0aW9uU2l6ZVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBpZiAoIWN0cmwuY29sbGVjdGlvbkwoKSAmJiAhXy5pc1VuZGVmaW5lZChjdHJsLnJlc291cmNlKCkpICYmIChjdHJsLmNvbGxlY3Rpb25TaXplKCkgfHwgMCkgPiAwKSB7XG4gICAgICAgICAgICBsZXQgcmVzb3VyY2UgPSBjdHJsLnJlc291cmNlKCksXG4gICAgICAgICAgICAgICAgZWxhcHNlZCA9IGgudHJhbnNsYXRlZFRpbWUocmVzb3VyY2UuZWxhcHNlZF90aW1lKSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0X2xpbmsgPSBgaHR0cHM6Ly9jYXRhcnNlLm1lLyR7cmVzb3VyY2UucGVybWFsaW5rfT9yZWY9Y3Ryc2VfaG9tZV9hY3Rpdml0aWVzYDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1iYWNrcy1jYXJyb3NlbCcsIHtjb25maWc6IGN0cmwuc3RhcnRDb25maWd9LCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBgaMOhICR7cGFyc2VJbnQoZWxhcHNlZC50b3RhbCl9ICR7ZWxhcHNlZC51bml0fS4uLmApLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jbGVhcmZpeC53LWlubGluZS1ibG9jay51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EnLCB7aHJlZjogcHJvamVjdF9saW5rfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1hdXRob3IudS1yb3VuZCcsIHtzcmM6IHJlc291cmNlLnRodW1ibmFpbCwgd2lkdGg6IDgwfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1hdXRob3IudS1yb3VuZCcsIHtzcmM6ICdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2ZDY0NmY3NzEwYTcxMjYzMzhiNDZmZl9sb2dvLWNhdGFyc2UtYmFjay1jYXJyb3NlbC5wbmcnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhJywge2hyZWY6IHByb2plY3RfbGlua30sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItYXV0aG9yLnUtcm91bmQnLCB7c3JjOiByZXNvdXJjZS5wcm9qZWN0X3RodW1ibmFpbCwgd2lkdGg6IDgwLCBzdHlsZTogJ21hcmdpbi1yaWdodDogMDsnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgYCR7cmVzb3VyY2UubmFtZX0gYXBvaW91YCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLXdoaXRlJywge2hyZWY6IHByb2plY3RfbGlua30sIHJlc291cmNlLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnZGl2Jyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb250cmlidXRpb25BY3Rpdml0aWVzO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcblxuY29uc3QgZHJvcGRvd24gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgIGBzZWxlY3Qke2FyZ3MuY2xhc3Nlc31baWQ9XCIke2FyZ3MuaWR9XCJdYCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZhbHVlUHJvcCksXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MudmFsdWVQcm9wKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkcm9wZG93bjtcbiIsIi8qKlxuICogd2luZG93LmMuRmlsdGVyQnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgZmlsdGVycyBjbGFzcy5cbiAqIEl0IHVzZXMgYSBocmVmIGFuZCBhIHRpdGxlIHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5GaWx0ZXJCdXR0b24sIHtcbiAqICAgICB0aXRsZTogJ0ZpbHRlciBieSBjYXRlZ29yeScsXG4gKiAgICAgaHJlZjogJ2ZpbHRlcl9ieV9jYXRlZ29yeSdcbiAqIH0pXG4gKi9cblxuaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5cbmNvbnN0IGZpbHRlckJ1dHRvbiA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gYXJncy50aXRsZSxcbiAgICAgICAgICAgICAgaHJlZiA9IGFyZ3MuaHJlZjtcbiAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuZmlsdGVycyR7dGl0bGUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjJHtocmVmfSddYCwgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZmlsdGVyQnV0dG9uO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5cbmNvbnN0IGZpbHRlckRhdGVSYW5nZSA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmaWx0ZXJEYXRlUmFuZ2U7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxuY29uc3QgZmlsdGVyRHJvcGRvd24gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCB3cmFwcGVyX2MgPSBhcmdzLndyYXBwZXJfY2xhc3MgfHwgJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnO1xuICAgICAgICByZXR1cm4gbSh3cmFwcGVyX2MsIFtcbiAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICBtLmNvbXBvbmVudChjLkRyb3Bkb3duLCB7XG4gICAgICAgICAgICAgICAgaWQ6IGFyZ3MuaW5kZXgsXG4gICAgICAgICAgICAgICAgY2xhc3NlczogJy53LXNlbGVjdC50ZXh0LWZpZWxkLnBvc2l0aXZlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZVByb3A6IGFyZ3Mudm0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczogYXJncy5vcHRpb25zXG4gICAgICAgICAgICB9KVxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZpbHRlckRyb3Bkb3duO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5cbmNvbnN0IGZpbHRlck1haW4gPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBpbnB1dFdyYXBwZXJDbGFzcyA9IGFyZ3MuaW5wdXRXcmFwcGVyQ2xhc3MgfHwgJy53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtJyxcbiAgICAgICAgICAgICAgYnRuQ2xhc3MgPSBhcmdzLmJ0bkNsYXNzIHx8ICcuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMCc7XG5cbiAgICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICBtKGBpbnB1dCR7aW5wdXRXcmFwcGVyQ2xhc3N9W3BsYWNlaG9sZGVyPVwiJHthcmdzLnBsYWNlaG9sZGVyfVwiXVt0eXBlPVwidGV4dFwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKGBpbnB1dCNmaWx0ZXItYnRuJHtidG5DbGFzc31bdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXWApXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZpbHRlck1haW47XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxuY29uc3QgZmlsdGVyTnVtYmVyUmFuZ2UgPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZmlsdGVyTnVtYmVyUmFuZ2U7XG4iLCIvKipcbiAqIHdpbmRvdy5jLmxhbmRpbmdRQSBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgcXVlc3Rpb24vYW5zd2VyIGJveCB3aXRoIHRvZ2dsZVxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICogICAgICAgICAgcXVlc3Rpb246ICdXaGF0cyB5b3VyIG5hbWU/JyxcbiAqICAgICAgICAgIGFuc3dlcjogJ0RhcnRoIFZhZGVyLidcbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuXG5jb25zdCBsYW5kaW5nUUEgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hvd0Fuc3dlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICByZXR1cm4gbSgnLmNhcmQucWEtY2FyZC51LW1hcmdpbmJvdHRvbS0yMC51LXJhZGl1cy5idG4tdGVyY2lhcnknLFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0Fuc3dlci50b2dnbGVcbiAgICAgICAgICAgIH0sIGFyZ3MucXVlc3Rpb24pLFxuICAgICAgICAgICAgY3RybC5zaG93QW5zd2VyKCkgPyBtKCdwLnUtbWFyZ2ludG9wLTIwLmZvbnRzaXplLXNtYWxsJywgbS50cnVzdChhcmdzLmFuc3dlcikpIDogJydcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbGFuZGluZ1FBO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuXG5jb25zdCBsYW5kaW5nU2lnbnVwID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgIGVtYWlsID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaC52YWxpZGF0ZUVtYWlsKGVtYWlsKCkpKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgbGV0IGVycm9yQ2xhc3NlcyA9ICghY3RybC5lcnJvcikgPyAnLnBvc2l0aXZlLmVycm9yJyA6ICcnO1xuICAgICAgICByZXR1cm4gbSgnZm9ybS53LWZvcm1baWQ9XCJlbWFpbC1mb3JtXCJdW21ldGhvZD1cInBvc3RcIl1bYWN0aW9uPVwiJyArIGFyZ3MuYnVpbGRlci5jdXN0b21BY3Rpb24gKyAnXCJdJyx7XG4gICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogaC5SRFRyYWNrZXIoJ2xhbmRpbmctZmxleCcpLFxuICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwuZW1haWwoKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGxhbmRpbmdTaWdudXA7XG4iLCIvKipcbiAqIHdpbmRvdy5jLk1vZGFsQm94IGNvbXBvbmVudFxuICogQnVpbHMgdGhlIHRlbXBsYXRlIGZvciB1c2luZyBtb2RhbFxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLk1vZGFsQm94LCB7XG4gKiAgICAgZGlzcGxheU1vZGFsOiB0b29nbGVQcm9wT2JqZWN0LFxuICogICAgIGNvbnRlbnQ6IFsnQ29tcG9uZW50TmFtZScsIHthcmd4OiAneCcsIGFyZ3k6ICd5J31dXG4gKiB9KVxuICogQ29tcG9uZW50TmFtZSBzdHJ1Y3R1cmUgPT4gIG0oJ2RpdicsIFtcbiAqICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1oZWFkZXInLCBbXSksXG4gKiAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctY29udGVudCcsIFtdKSxcbiAqICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1uYXYtYm90dG9tJywgW10pLFxuICogICAgICAgICAgICAgIF0pXG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuXG5jb25zdCBtb2RhbEJveCA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBtKCcubW9kYWwtYmFja2Ryb3AnLCBbXG4gICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLW91dGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaW5uZXIubW9kYWwtZGlhbG9nLXNtYWxsJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLnctaW5saW5lLWJsb2NrLm1vZGFsLWNsb3NlLmZhLmZhLWNsb3NlLmZhLWxnW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5TW9kYWwudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChhcmdzLmNvbnRlbnRbMF0sIGFyZ3MuY29udGVudFsxXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbW9kYWxCb3g7XG4iLCIvKipcbiAqIHdpbmRvdy5jLk9ubGluZVN1Y2Vzc01vZGFsQ29udGVudCBjb21wb25lbnRcbiAqIFJlbmRlciBvbmxpbmUgc3VjY2VzcyBtZXNzYWdlXG4gKlxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxuY29uc3Qgb25saW5lU3VjZXNzTW9kYWxDb250ZW50ID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG0oJy5tb2RhbC1kaWFsb2ctY29udGVudC51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgbSgnLmZhLmZhLWNoZWNrLWNpcmNsZS5mYS01eC50ZXh0LXN1Y2Nlc3MudS1tYXJnaW5ib3R0b20tNDAnKSxcbiAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQnLCAnU3VhIGNhbXBhbmhhIGVzdMOhIG5vIGFyISEhIFBhcmFiw6lucyBwb3IgZXNzZSBwcmltZWlybyBncmFuZGUgcGFzc28uIEJvYSBzb3J0ZSBuZXNzYSBqb3JuYWRhIDspJylcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBvbmxpbmVTdWNlc3NNb2RhbENvbnRlbnQ7XG4iLCIvKipcbiAqIHdpbmRvdy5jLk93bmVyTWVzc2FnZUNvbnRlbnQgY29tcG9uZW50XG4gKiBSZW5kZXIgcHJvamVjdCBvd25lciBjb250YWN0IGZvcm1cbiAqXG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcblxuY29uc3Qgb3duZXJNZXNzYWdlQ29udGVudCA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGxldCBsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIHNlbmRTdWNjZXNzID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBsb2FkZXJPcHRzID0gbW9kZWxzLmRpcmVjdE1lc3NhZ2UucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgZnJvbV9uYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJvbV9uYW1lJykudmFsdWUsXG4gICAgICAgICAgICAgICAgICBmcm9tX2VtYWlsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJvbV9lbWFpbCcpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgdXNlcl9pZDogaC5nZXRVc2VyKClbJ3VzZXJfaWQnXSxcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXNzYWdlX2NvbnRlbnQnKS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6IGguZ2V0Q3VycmVudFByb2plY3QoKVsncHJvamVjdF9pZCddLFxuICAgICAgICAgICAgICAgICAgdG9fdXNlcl9pZDogaC5nZXRDdXJyZW50UHJvamVjdCgpWydwcm9qZWN0X3VzZXJfaWQnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGwgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGxvYWRlck9wdHMpO1xuXG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihzZW5kU3VjY2Vzcyh0cnVlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VuZE1lc3NhZ2U6IHNlbmRNZXNzYWdlLFxuICAgICAgICAgICAgc2VuZFN1Y2Nlc3M6IHNlbmRTdWNjZXNzLFxuICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3NcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGguZ2V0VXNlcigpLFxuICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2UgPSBtKCcubW9kYWwtZGlhbG9nLWNvbnRlbnQudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZmEuZmEtY2hlY2stY2lyY2xlLmZhLTV4LnRleHQtc3VjY2Vzcy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UnLCBgU3VhIG1lbnNhZ2VtIGZvaSBlbnZpYWRhIGNvbSBzdWNlc3NvIHBhcmEgJHtfLmZpcnN0KGN0cmwudXNlckRldGFpbHMoKSkubmFtZX0uIFZvY8OqIHZhaSByZWNlYmVyIHVtYSBjw7NwaWEgbm8gc2V1IGVtYWlsIGUgcG9kZSBzZWd1aXIgYSBjb252ZXJzYSBwb3IgbMOhIWApXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGNvbnRhY3RGb3JtID0gW1xuICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctY29udGVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0nLCB7IG9uc3VibWl0OiBjdHJsLnNlbmRNZXNzYWdlIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02Lnctc3ViLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXInLCAnU2V1IG5vbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0LnctaW5wdXQudGV4dC1maWVsZFt2YWx1ZT0nJHt1c2VyID8gdXNlclsnbmFtZSddIDogJyd9J11baWQ9J2Zyb21fbmFtZSddW3R5cGU9J3RleHQnXVtyZXF1aXJlZF1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyJywgJ1NldSBlbWFpbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3ZhbHVlPScke3VzZXIgPyB1c2VyWydlbWFpbCddIDogJyd9J11baWQ9J2Zyb21fZW1haWwnXVt0eXBlPSd0ZXh0J11bcmVxdWlyZWRdYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsICdNZW5zYWdlbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RleHRhcmVhLnctaW5wdXQudGV4dC1maWVsZC5oZWlnaHQtc21hbGxbaWQ9XFwnbWVzc2FnZV9jb250ZW50XFwnXVtyZXF1aXJlZF0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXRlcmNpYXJ5JywgJ1ZvY8OqIHJlY2ViZXLDoSB1bWEgY8OzcGlhIGRlc3RhIG1lbnNhZ2VtIGVtIHNldSBlbWFpbC4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLW5hdi1ib3R0b20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtcHVzaC0zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLWxhcmdlW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCJFbnZpYXIgbWVuc2FnZW1cIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnRW52aWFyIG1lbnNhZ2VtJylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGN0cmwuc2VuZFN1Y2Nlc3MoKSA/IHN1Y2Nlc3NNZXNzYWdlIDogY29udGFjdEZvcm1cbiAgICAgICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG93bmVyTWVzc2FnZUNvbnRlbnQ7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHByb2plY3RSZXdhcmRMaXN0IGZyb20gJ3Byb2plY3QtcmV3YXJkLWxpc3QnO1xuaW1wb3J0IFByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zIGZyb20gJ3Byb2plY3Qtc3VnZ2VzdGVkLWNvbnRyaWJ1dGlvbnMnO1xuXG5jb25zdCBwcm9qZWN0QWJvdXQgPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0KCkgfHwge30sXG4gICAgICAgICAgICBvbmxpbmVEYXlzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gbW9tZW50KHByb2plY3Quem9uZV9vbmxpbmVfZGF0ZSkuZGlmZihtb21lbnQocHJvamVjdC56b25lX2V4cGlyZXNfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24oZGlmZik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gLU1hdGguY2VpbChkdXJhdGlvbi5hc0RheXMoKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICBsZXQgZnVuZGluZ1BlcmlvZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAocHJvamVjdC5pc19wdWJsaXNoZWQgJiYgaC5leGlzdHkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpKSA/IG0oJy5mdW5kaW5nLXBlcmlvZCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCAnUGVyw61vZG8gZGUgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYCR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX29ubGluZV9kYXRlKX0gLSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gKCR7b25saW5lRGF5cygpfSBkaWFzKWApXG4gICAgICAgICAgICBdKSA6ICcnO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgIG0oJy5wcm9qZWN0LWFib3V0LnctY29sLnctY29sLTgnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBoLlVJSGVscGVyKClcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3N0cm9uZycsICdPIHByb2pldG8nKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZVtpdGVtcHJvcD1cImFib3V0XCJdJywgbS50cnVzdChoLnNlbGZPckVtcHR5KHByb2plY3QuYWJvdXRfaHRtbCwgJy4uLicpKSksXG4gICAgICAgICAgICAgICAgcHJvamVjdC5idWRnZXQgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwcm9qZWN0LmJ1ZGdldCkpXG4gICAgICAgICAgICAgICAgXSA6ICcnLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgIV8uaXNFbXB0eShhcmdzLnJld2FyZERldGFpbHMoKSkgPyBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3RSZXdhcmRMaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgfSksIGZ1bmRpbmdQZXJpb2QoKVxuICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1N1Z2VzdMO1ZXPCoGRlwqBhcG9pbycpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogYXJncy5wcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0QWJvdXQ7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBJMThuIGZyb20gJ2kxOG4tanMnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuY2FyZCcpO1xuY29uc3QgcHJvamVjdENhcmQgPSB7XG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgIGxpbmsgPSAnLycgKyBwcm9qZWN0LnBlcm1hbGluayArIChhcmdzLnJlZiA/ICc/cmVmPScgKyBhcmdzLnJlZiA6ICcnKSxcbiAgICAgICAgICAgIHR5cGUgPSBhcmdzLnR5cGUgfHwgJ3NtYWxsJyxcbiAgICAgICAgICAgIGNzcyA9IChjYXJkVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzc0NsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICdzbWFsbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXI6ICcudy1jb2wudy1jb2wtNCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lcldyYXBwZXI6ICcuY2FyZC1wcm9qZWN0LmNhcmQudS1yYWRpdXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWI6ICcuY2FyZC1wcm9qZWN0LXRodW1iJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uV3JhcHBlcjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRob3I6ICcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6ICcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdtZWRpdW0nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVyOiAnLnctY29sLnctY29sLTYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJXcmFwcGVyOiAnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW1iOiAnLmNhcmQtcHJvamVjdC10aHVtYi5tZWRpdW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25XcmFwcGVyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnLmNhcmQtcHJvamVjdC1kZXNjcmlwdGlvbi5hbHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRob3I6ICcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6ICcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdiaWcnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVyOiAnLmNhcmQudS1yYWRpdXMuY2FyZC1wcm9qZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyV3JhcHBlcjogJy53LXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtYjogJy53LWNvbC53LWNvbC04LnctY29sLW1lZGl1bS02LmNhcmQtcHJvamVjdC10aHVtYi5iaWcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25XcmFwcGVyOiAnLnctY29sLnctY29sLTQudy1jb2wtbWVkaXVtLTYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmJpZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcjogJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRsaW5lOiAnLmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiAnLnctaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjc3NDbGFzc2VzW2NhcmRUeXBlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG0oY3NzKHR5cGUpLndyYXBwZXIsIFtcbiAgICAgICAgICAgIG0oY3NzKHR5cGUpLmlubmVyV3JhcHBlciwgW1xuICAgICAgICAgICAgICAgIG0oYGEke2Nzcyh0eXBlKS50aHVtYn1baHJlZj1cIiR7bGlua31cIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IGB1cmwoJHtwcm9qZWN0LnByb2plY3RfaW1nfSlgLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKGNzcyh0eXBlKS5kZXNjcmlwdGlvbldyYXBwZXIsIFtcbiAgICAgICAgICAgICAgICAgICAgbShjc3ModHlwZSkuZGVzY3JpcHRpb24sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oY3NzKHR5cGUpLnRpdGxlLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGNzcyh0eXBlKS5hdXRob3IsIGAke0kxOG4udCgnYnknLCBJMThuU2NvcGUoKSl9ICR7cHJvamVjdC5vd25lcl9uYW1lfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbShjc3ModHlwZSkuaGVhZGxpbmUsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKGNzcyh0eXBlKS5jaXR5LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZSA/IHByb2plY3QuY2l0eV9uYW1lIDogJyd9LCAke3Byb2plY3Quc3RhdGVfYWNyb255bSA/IHByb2plY3Quc3RhdGVfYWNyb255bSA6ICcnfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgLmNhcmQtcHJvamVjdC1tZXRlci4ke3Byb2plY3Quc3RhdGV9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uY29udGFpbnMoWydzdWNjZXNzZnVsJywgJ2ZhaWxlZCcsICd3YWl0aW5nX2Z1bmRzJ10sIHByb2plY3Quc3RhdGUpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgSTE4bi50KCdkaXNwbGF5X3N0YXR1cy4nICsgcHJvamVjdC5zdGF0ZSwgSTE4blNjb3BlKCkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0JywgcHJvamVjdC5leHBpcmVzX2F0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH0gJHtyZW1haW5pbmdUZXh0T2JqLnVuaXR9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgKHJlbWFpbmluZ1RleHRPYmoudG90YWwgPiAxKSA/ICdSZXN0YW50ZXMnIDogJ1Jlc3RhbnRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodCcsIFsnUHJhem8gZW0nLG0oJ2JyJyksJ2FiZXJ0byddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0Q2FyZDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHByb2plY3RDb21tZW50cyA9IHtcbiAgICBjb250cm9sbGVyICgpIHtcbiAgICAgICAgY29uc3QgbG9hZENvbW1lbnRzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtyZXR1cm47fVxuICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge2xvYWRDb21tZW50czogbG9hZENvbW1lbnRzfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpO1xuICAgICAgICByZXR1cm4gbSgnLmZiLWNvbW1lbnRzW2RhdGEtaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2RhdGEtbnVtLXBvc3RzPTUwXVtkYXRhLXdpZHRoPVwiNjEwXCJdJywge2NvbmZpZzogY3RybC5sb2FkQ29tbWVudHMoKX0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RDb21tZW50cztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgcHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydENvbnRlbnRDYXJkID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3Qgc3RhdGVDbGFzcyA9IChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgICAgICAncGFpZCc6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICdyZWZ1bmRlZCc6ICd0ZXh0LXJlZnVuZGVkJyxcbiAgICAgICAgICAgICAgICAncGVuZGluZ19yZWZ1bmQnOiAndGV4dC1yZWZ1bmRlZCcsXG4gICAgICAgICAgICAgICAgJ3BlbmRpbmcnOiAndGV4dC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAncmVmdXNlZCc6ICd0ZXh0LWVycm9yJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXNbc3RhdGVdO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0ZUNsYXNzOiBzdGF0ZUNsYXNzXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGxldCBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbigpLFxuICAgICAgICAgICAgcHJvZmlsZV9pbWcgPSAoXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwpID8gJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnIDogY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCksXG4gICAgICAgICAgICByZXdhcmQgPSBjb250cmlidXRpb24ucmV3YXJkIHx8IHttaW5pbXVtX3ZhbHVlOiAwLCBkZXNjcmlwdGlvbjogJ05lbmh1bWEgcmVjb21wZW5zYSBzZWxlY2lvbmFkYSd9O1xuICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC5jYXJkLWNsaWNrYWJsZScsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMS53LWNvbC10aW55LTEnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oYGltZy51c2VyLWF2YXRhci51LW1hcmdpbmJvdHRvbS0xMFtzcmM9JyR7cHJvZmlsZV9pbWd9J11gKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMS53LWNvbC10aW55LTExJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlcicsIGNvbnRyaWJ1dGlvbi51c2VyX25hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbnRyaWJ1dGlvbi5oYXNfYW5vdGhlciA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tbGlnaHQuYmFkZ2UuYmFkZ2UtbGlnaHQnLCAnKzEgYXBvaW8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY29udHJpYnV0aW9uLmFub255bW91cyA/IG0oJ3NwYW4uZmEuZmEtZXllLXNsYXNoLmZvbnRjb2xvci1zZWNvbmRhcnknKSA6ICcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTNcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIubGluZWhlaWdodC10aWdodGVyXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgc3Bhbi5mYS5mYS1jaXJjbGUuZm9udHNpemUtc21hbGxlc3QuJHtjdHJsLnN0YXRlQ2xhc3MoY29udHJpYnV0aW9uLnN0YXRlKX1gLCBcIi5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIMKgwqBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcInNwYW4uZm9udHNpemUtbGFyZ2VcIiwgYFIkICR7aC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTMudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueVwiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZFwiLCBgUmVjb21wZW5zYTrCoFIkICR7aC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0XCIsIHJld2FyZC5kZXNjcmlwdGlvbi5zdWJzdHJpbmcoMCwgODApICsgJy4uLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSkvKixcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnUtdGV4dC1jZW50ZXJcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeVwiLCBcIkVudmllaSFcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbGVzdC51LW1hcmdpbmJvdHRvbS0yMC5saW5laGVpZ2h0LWxvb3NlXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcImEuY2hlY2tib3gtYmlnW2hyZWY9JyMnXVwiLCBcIi5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTJcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3RcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiYS5saW5rLWhpZGRlbltocmVmPScjJ11cIiwgXCJRdWVzdGlvbsOhcmlvXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcIiBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsbShcInNwYW4uZm9udHdlaWdodC1zZW1pYm9sZC50ZXh0LXdhaXRpbmdcIiwgXCJlbnZpYWRvXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3ItdGVyY2lhcnlcIiwgXCJlbSAyOS8xMC8yMDE1XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSovXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgLy9tKFwiYS53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeVtkYXRhLWl4PSdzaG93LWRldGFpbC1ib3gnXVtocmVmPScjJ11cIilcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0Q29udHJpYnV0aW9uUmVwb3J0Q29udGVudENhcmQ7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgcHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydENvbnRlbnRDYXJkIGZyb20gJ3Byb2plY3QtY29udHJpYnV0aW9uLXJlcG9ydC1jb250ZW50LWNhcmQnO1xuXG5jb25zdCBwcm9qZWN0Q29udHJpYnV0aW9uUmVwb3J0Q29udGVudCA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBhcmdzLmxpc3Q7XG4gICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLmJnLWdyYXkuYmVmb3JlLWZvb3Rlci5zZWN0aW9uJywgW1xuICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgIG0oXCIudy1yb3cudS1tYXJnaW5ib3R0b20tMjBcIiwgW1xuICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTZcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1iYXNlXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwic3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkXCIsIChsaXN0LmlzTG9hZGluZygpID8gJycgOiBsaXN0LnRvdGFsKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBhcG9pb3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvL20oXCIuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZFwiLCBcIlIkIDEyLjAwMCwwMFwiKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgIFRPRE86IG9yZGVyaW5nIGZpbHRlciB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTZcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShcIi53LWZvcm1cIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCJmb3JtW2RhdGEtbmFtZT0nRW1haWwgRm9ybSA1J11baWQ9J2VtYWlsLWZvcm0tNSddW25hbWU9J2VtYWlsLWZvcm0tNSddXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5XCIsIFwiT3JkZW5hciBwb3I6XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwic2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmUuZm9udHNpemUtc21hbGxlc3RbaWQ9J2ZpZWxkLTknXVtuYW1lPSdmaWVsZC05J11cIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIm9wdGlvblt2YWx1ZT0nJ11cIiwgXCJEYXRhIChyZWNlbnRlcyBwYXJhIGFudGlnb3MpXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIm9wdGlvblt2YWx1ZT0nJ11cIiwgXCJEYXRhIChhbnRpZ29zIHBhcmEgcmVjZW50ZXMpXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIm9wdGlvblt2YWx1ZT0nJ11cIiwgXCJWYWxvciAobWFpb3IgcGFyYSBtZW5vcilcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwib3B0aW9uW3ZhbHVlPSdGaXJzdCddXCIsIFwiVmFsb3IgKG1lbm9yIHBhcmEgbWFpb3IpXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pKi9cbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udHJpYnV0aW9uID0gbS5wcm9wKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQocHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydENvbnRlbnRDYXJkLCB7IGNvbnRyaWJ1dGlvbjogY29udHJpYnV0aW9uIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1ncmF5JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDogaC5sb2FkZXIoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcblxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RDb250cmlidXRpb25SZXBvcnRDb250ZW50O1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcblxuY29uc3QgcHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydEhlYWRlcj0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgcGF5bWVudFN0YXRlRmlsdGVyID0gIF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtsYWJlbDogJ3BheW1lbnRfc3RhdGUnfSksXG4gICAgICAgICAgICAgIHJld2FyZEZpbHRlciA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtsYWJlbDogJ3Jld2FyZF9maWx0ZXInfSksXG4gICAgICAgICAgICAgIG1haW5GaWx0ZXIgPSBfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7Y29tcG9uZW50OiAnRmlsdGVyTWFpbid9KSxcbiAgICAgICAgICAgICAgcHJvamVjdF9pZCA9IGFyZ3MuZmlsdGVyVk0ucHJvamVjdF9pZCgpO1xuXG4gICAgICAgIHJld2FyZEZpbHRlci5kYXRhLm9wdGlvbnMgPSBhcmdzLm1hcFJld2FyZHNUb09wdGlvbnMoKTtcblxuICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5kYXNoYm9hcmQtaGVhZGVyJywgW1xuICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LWxvb3Nlci51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWxhdMOzcmlvIGRlIGFwb2lvcycpXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge29uc3VibWl0OiBhcmdzLnN1Ym1pdH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1twYXltZW50U3RhdGVGaWx0ZXIuY29tcG9uZW50XSwgcGF5bWVudFN0YXRlRmlsdGVyLmRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbcmV3YXJkRmlsdGVyLmNvbXBvbmVudF0sIHJld2FyZEZpbHRlci5kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnUtbWFyZ2ludG9wLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5fdy1zdWItY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbbWFpbkZpbHRlci5jb21wb25lbnRdLCBtYWluRmlsdGVyLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY2xlYXJmaXgudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmFsdC1saW5rLnUtcmlnaHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZXJbdGFyZ2V0PVwiX19ibGFua1wiIGhyZWY9XCIvcHJvamVjdHMvJHtwcm9qZWN0X2lkfS9lZGl0I3JlcG9ydHNcIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZG93bmxvYWQnLCAnLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIEJhaXhhciByZWxhdMOzcmlvcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdENvbnRyaWJ1dGlvblJlcG9ydEhlYWRlcjtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgcHJvamVjdENvbnRyaWJ1dGlvbnMgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCBsaXN0Vk0gPSBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uKSxcbiAgICAgICAgICAgIGZpbHRlclZNID0gcG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdG9nZ2xlV2FpdGluZyA9ICh3YWl0aW5nID0gZmFsc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWTS53YWl0aW5nX3BheW1lbnQod2FpdGluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdCgpLmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmc6IHRvZ2dsZVdhaXRpbmdcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICByZXR1cm4gbSgnI3Byb2plY3RfY29udHJpYnV0aW9ucy5jb250ZW50LnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgKGFyZ3MucHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdJywgJ0NvbmZpcm1hZG9zJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbaWQ9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl1bdHlwZT1cInJhZGlvXCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdmFsdWU9XCJ3YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsICdQZW5kZW50ZXMnKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucycsIF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLWRhcmtbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLnVzZXJfbmFtZSksIChjb250cmlidXRpb24uaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLCAoY29udHJpYnV0aW9uLmFub255bW91cyA/IFttLnRydXN0KCcmbmJzcDstJm5ic3A7JyksIG0oJ3N0cm9uZycsICdBcG9pYWRvciBhbsO0bmltbycpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBISDptbScpICsgJ2gnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMjAnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFshbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0Q29udHJpYnV0aW9ucztcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgY29tcG9uZW50XG4gKiBidWlsZCBkYXNoYm9hcmQgcHJvamVjdCBtZW51IGZvciBwcm9qZWN0IG93bmVyc1xuICogYW5kIGFkbWluLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gKiAgICAgcHJvamVjdDogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IEkxOG4gZnJvbSAnaTE4bi1qcyc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgcHJvamVjdERhc2hib2FyZE1lbnUgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUgPSBoLnRvZ2dsZVByb3AodHJ1ZSwgZmFsc2UpLFxuICAgICAgICAgICAgc2hvd1B1Ymxpc2ggPSBoLnRvZ2dsZVByb3AodHJ1ZSwgZmFsc2UpLFxuICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdiA9IGgudG9nZ2xlUHJvcCgnYm9keS1wcm9qZWN0IG9wZW4nLCAnYm9keS1wcm9qZWN0IGNsb3NlZCcpO1xuXG4gICAgICAgIGlmIChhcmdzLnByb2plY3QoKS5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZS50b2dnbGUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3MuaGlkZVB1Ymxpc2gpIHtcbiAgICAgICAgICAgIHNob3dQdWJsaXNoLnRvZ2dsZShmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZTogZWRpdExpbmtzVG9nZ2xlLFxuICAgICAgICAgICAgc2hvd1B1Ymxpc2g6IHNob3dQdWJsaXNoLFxuICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdjogYm9keVRvZ2dsZUZvck5hdlxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0KCksXG4gICAgICAgICAgICAgIHByb2plY3RSb3V0ZSA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgIGVkaXRMaW5rQ2xhc3MgPSAnZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICdpbmRlbnQnIDogJycpO1xuICAgICAgICBsZXQgb3B0aW9uYWxPcHQgPSAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnIChvcGNpb25hbCknKSA6ICcnKTtcblxuICAgICAgICBjdHJsLmJvZHkuY2xhc3NOYW1lID0gY3RybC5ib2R5VG9nZ2xlRm9yTmF2KCk7XG5cbiAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LW5hdicsIFtcbiAgICAgICAgICAgIG0oJy5wcm9qZWN0LW5hdi13cmFwcGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJ25hdi53LXNlY3Rpb24uZGFzaGJvYXJkLW5hdi5zaWRlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmsudy1pbmxpbmUtYmxvY2suZGFzaGJvYXJkLXByb2plY3QtbmFtZVtocmVmPVwiJyArIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcvJyArIHByb2plY3QucGVybWFsaW5rIDogZWRpdFJvdXRlICsgJyNwcmV2aWV3JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QtZGFzaGJvYXJkW3NyYz1cIicgKyAoXy5pc051bGwocHJvamVjdC5sYXJnZV9pbWFnZSkgPyAnL2Fzc2V0cy90aHVtYi1wcm9qZWN0LnBuZycgOiBwcm9qZWN0LmxhcmdlX2ltYWdlKSArICdcIl1bd2lkdGg9XCIxMTRcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUubGluZWhlaWdodC10aWdodC5mb250c2l6ZS1zbWFsbCcsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudS1tYXJnaW50b3AtMTBbc3JjPVwiL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC9iYWRnZS0ke3Byb2plY3QubW9kZX0taC5wbmdcIl1bd2lkdGg9ODBdYClcblxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI2luZm8tbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9ob21lX2xpbmtbY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKGgubG9jYXRpb25BY3Rpb25NYXRjaCgnaW5zaWdodHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCInICsgcHJvamVjdFJvdXRlICsgJy9pbnNpZ2h0c1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhci1jaGFydC5mYS1sZy5mYS1mdycpLCBJMThuLnQoJ3N0YXJ0X3RhYicsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnRbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3JlcG9ydHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS5mYS10YWJsZS5mYS1sZy5mYS1mdycpLCBJMThuLnQoJ3JlcG9ydHNfdGFiJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0LnUtbWFyZ2luYm90dG9tLTMwW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwb3N0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksIEkxOG4udCgncG9zdHNfdGFiJywgSTE4blNjb3BlKCkpLCBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gJycgOiBtKCdidXR0b24jdG9nZ2xlLWVkaXQtbWVudS5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmVkaXRMaW5rc1RvZ2dsZS50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXBlbmNpbC5mYS1mdy5mYS1sZycpLCBJMThuLnQoJ2VkaXRfcHJvamVjdCcsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkpLCAoY3RybC5lZGl0TGlua3NUb2dnbGUoKSA/IG0oJyNlZGl0LW1lbnUtaXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCghcHJvamVjdC5pc19wdWJsaXNoZWQgfHwgcHJvamVjdC5pc19hZG1pbl9yb2xlKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjYmFzaWNzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Jhc2ljcycgKyAnXCJdJywgJ0LDoXNpY28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLCAnRmluYW5jaWFtZW50bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rlc2NyaXB0aW9uX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Rlc2NyaXB0aW9uJyArICdcIl0nLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSN2aWRlb19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN2aWRlbycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1bDrWRlbycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjY2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNjYXJkJyArICdcIl0nLCAnQ2FyZCBkbyBwcm9qZXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3Jld2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNyZXdhcmQnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbXBlbnNhcycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX2Fib3V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfYWJvdXQnICsgJ1wiXScsICdTb2JyZSB2b2PDqicpLCAocHJvamVjdC5tb2RlID09PSAnZmxleCcgfHwgKHByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcpIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfc2V0dGluZ3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9zZXR0aW5ncycgKyAnXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ByZXZpZXcnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZ3LmZhLWV5ZS5mYS1sZycpLCAnIFByZXZpZXcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkICYmIGN0cmwuc2hvd1B1Ymxpc2goKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnZHJhZnQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9zZW5kX3RvX2FuYWx5c2lzXCJdJywgSTE4bi50KCdzZW5kJywgSTE4blNjb3BlKCkpKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvdmFsaWRhdGVfcHVibGlzaFwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdwdWJsaXNoJywgSTE4blNjb3BlKCkpLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9mbGV4aWJsZV9wcm9qZWN0cy8nICsgcHJvamVjdC5mbGV4X2lkICsgJy92YWxpZGF0ZV9wdWJsaXNoXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3B1Ymxpc2gnLCBJMThuU2NvcGUoKSksIG0udHJ1c3QoJyZuYnNwOyZuYnNwOycpLCBtKCdzcGFuLmZhLmZhLWNoZXZyb24tcmlnaHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICgocHJvamVjdC5tb2RlID09PSAnZmxleCcgJiYgcHJvamVjdC5pc19wdWJsaXNoZWQpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4tc2Vjb25kYXJ5LWRhcmtbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgSTE4bi50KCdhbm5vdW5jZV9leHBpcmF0aW9uJywgSTE4blNjb3BlKCkpKSA6ICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnYS5idG4tZGFzaGJvYXJkIGhyZWY9XCJqczp2b2lkKDApO1wiJywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuYm9keVRvZ2dsZUZvck5hdi50b2dnbGVcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhcnMuZmEtbGcnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdERhc2hib2FyZE1lbnU7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgY29tcG9uZW50XG4gKiBBIGdyYXBoIGJ1aWxkZXIgaW50ZXJmYWNlIHRvIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gKiAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICogICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gKiAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCdcbiAqIH0pXG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgQ2hhcnQgZnJvbSAnY2hhcnRqcyc7XG5cbmNvbnN0IHByb2plY3REYXRhQ2hhcnQgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCByZXNvdXJjZSA9IF8uZmlyc3QoYXJncy5jb2xsZWN0aW9uKCkpLFxuICAgICAgICAgICAgICBzb3VyY2UgPSAoIV8uaXNVbmRlZmluZWQocmVzb3VyY2UpID8gcmVzb3VyY2Uuc291cmNlIDogW10pLFxuXG4gICAgICAgICAgICBtb3VudERhdGFzZXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bYXJncy5kYXRhS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW5kZXJDaGFydCA9IChlbGVtZW50LCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzLnhBeGlzKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIub3ZlcmZsb3ctYXV0bycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0RGF0YUNoYXJ0O1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlIGNvbXBvbmVudFxuICogQSB0YWJsZSBpbnRlcmZhY2UgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEl0IHRha2VzIGFuIGFycmF5IGFuZCBhIGxhYmxlIGFzIGl0J3Mgc291cmNlcy5cbiAqIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSBpcyB0aGUgaGVhZGVyIGRlc2NyaXB0b3IgYW5kIHRoZSByZXN0IG9mIHRoZW0gYXJlIHJvdyBkYXRhLlxuICogUm93cyBtYXkgcmV0dXJuIGEgc3RyaW5nIG9yIGFuIGFycmF5IGFuZCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyBhIHJvdyBvdXRwdXQuXG4gKiBBbGwgdGFibGUgcm93cyBhcmUgc29ydGFibGUgYnkgZGVmYXVsdC4gSWYgeW91IHdhbnQgdG8gdXNlIGEgY3VzdG9tIHZhbHVlIGFzIHNvcnQgcGFyYW1ldGVyXG4gKiB5b3UgbWF5IHNldCBhIDJEIGFycmF5IGFzIHJvdy4gSW4gdGhpcyBjYXNlLCB0aGUgZmlyc3QgYXJyYXkgdmFsdWUgd2lsbCBiZSB0aGUgY3VzdG9tIHZhbHVlXG4gKiB3aGlsZSB0aGUgb3RoZXIgd2lsbCBiZSB0aGUgYWN0dWFsIG91dHB1dC5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAqICAgICAgbGFiZWw6ICdUYWJsZSBsYWJlbCcsXG4gKiAgICAgIHRhYmxlOiBbXG4gKiAgICAgICAgICBbJ2NvbCBoZWFkZXIgMScsICdjb2wgaGVhZGVyIDInXSxcbiAqICAgICAgICAgIFsndmFsdWUgMXgxJywgWzMsICd2YWx1ZSAxeDInXV0sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDJ4MScsIFsxLCAndmFsdWUgMngyJ11dIC8vV2UgYXJlIHVzaW5nIGEgY3VzdG9tIGNvbXBhcmF0b3IgdHdvIGNvbCAyIHZhbHVlc1xuICogICAgICBdLFxuICogICAgICAvL0FsbG93cyB5b3UgdG8gc2V0IGEgc3BlY2lmaWMgY29sdW1uIHRvIGJlIG9yZGVyZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgLy9JZiBubyB2YWx1ZSBpcyBzZXQsIHRoZSBmaXJzdCByb3cgd2lsbCBiZSB0aGUgZGVmYXVsdCBvbmUgdG8gYmUgb3JkZXJlZC5cbiAqICAgICAgLy9OZWdhdGl2ZSB2YWx1ZXMgbWVhbiB0aGF0IHRoZSBvcmRlciBzaG91bGQgYmUgcmV2ZXJ0ZWRcbiAqICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTNcbiAqICB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IG1vZGVscyBmcm9tICdtb2RlbHMnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHByb2plY3REYXRhVGFibGUgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCB0YWJsZSA9IG0ucHJvcChhcmdzLnRhYmxlKSxcbiAgICAgICAgICAgIHNvcnRJbmRleCA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWR4ID0gc29ydEluZGV4KCksXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB4ID0gKF8uaXNBcnJheShhW2lkeF0pICYmIGFbaWR4XS5sZW5ndGggPiAxKSA/IGFbaWR4XVswXSA6IGFbaWR4XSxcbiAgICAgICAgICAgICAgICB5ID0gKF8uaXNBcnJheShiW2lkeF0pICYmIGJbaWR4XS5sZW5ndGggPiAxKSA/IGJbaWR4XVswXSA6IGJbaWR4XTtcblxuICAgICAgICAgICAgaWYgKHggPCB5KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeSA8IHgpe1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgc29ydFRhYmxlID0gKGlkeCkgPT4ge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QodGFibGUoKSksXG4gICAgICAgICAgICAgICAgYm9keTtcbiAgICAgICAgICAgIGlmIChzb3J0SW5kZXgoKSA9PT0gaWR4KXtcbiAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnJldmVyc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc29ydEluZGV4KGlkeCk7XG4gICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZShfLnVuaW9uKFtoZWFkZXJdLGJvZHkpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcblxuICAgICAgICBpZiAoYXJncy5kZWZhdWx0U29ydEluZGV4IDwgMCl7XG4gICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICBzb3J0VGFibGU6IHNvcnRUYWJsZVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBfLmZpcnN0KGN0cmwudGFibGUoKSksXG4gICAgICAgICAgICBib2R5ID0gXy5yZXN0KGN0cmwudGFibGUoKSk7XG4gICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cudGFibGUtcm93LmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5oZWFkZXInLFxuICAgICAgICAgICAgICAgIF8ubWFwKGhlYWRlciwgKGhlYWRpbmcsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtoZWFkaW5nfSBgLCBtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgXy5tYXAoYm9keSwgKHJvd0RhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy50YWJsZS1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgYSBjdXN0b20gY29tcGFyYXRvciBpcyB1c2VkID0+IFJlYWQgY29tcG9uZW50IGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93ID0gKF8uaXNBcnJheShyb3cpICYmIHJvdy5sZW5ndGggPiAxKSA/IHJvd1sxXSA6IHJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCByb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdERhdGFUYWJsZTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBwcm9qZWN0U2hhcmVCb3ggZnJvbSAncHJvamVjdC1zaGFyZS1ib3gnO1xuXG5jb25zdCBwcm9qZWN0SGlnaGxpZ2h0ID0ge1xuICAgIGNvbnRyb2xsZXIgKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlzcGxheVNoYXJlQm94OiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICBhZGRyZXNzID0gcHJvamVjdCgpLmFkZHJlc3MgfHwge3N0YXRlX2Fjcm9ueW06ICcnLCBjaXR5OiAnJ307XG5cbiAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhpZ2hsaWdodCcsIFtcbiAgICAgICAgICAgIChwcm9qZWN0KCkudmlkZW9fZW1iZWRfdXJsID8gbSgnLnctZW1iZWQudy12aWRlby5wcm9qZWN0LXZpZGVvJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnbWluLWhlaWdodDogMjQwcHg7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJ2lmcmFtZS5lbWJlZGx5LWVtYmVkW2l0ZW1wcm9wPVwidmlkZW9cIl1bc3JjPVwiJyArIHByb2plY3QoKS52aWRlb19lbWJlZF91cmwgKyAnXCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVthbGxvd0Z1bGxTY3JlZW5dJylcbiAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdiYWNrZ3JvdW5kLWltYWdlOnVybCgnICsgcHJvamVjdCgpLm9yaWdpbmFsX2ltYWdlICsgJyk7J1xuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgbSgnLnByb2plY3QtYmx1cmInLCBwcm9qZWN0KCkuaGVhZGxpbmUpLFxuICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAoIV8uaXNOdWxsKGFkZHJlc3MpID9cbiAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCIvcHQvZXhwbG9yZT9wZ19zZWFyY2g9JHthZGRyZXNzLnN0YXRlX2Fjcm9ueW19XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1tYXAtbWFya2VyJyksIGAgJHthZGRyZXNzLmNpdHl9LCAke2FkZHJlc3Muc3RhdGVfYWNyb255bX1gXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodFtocmVmPVwiL3B0L2V4cGxvcmUjYnlfY2F0ZWdvcnlfaWQvJHtwcm9qZWN0KCkuY2F0ZWdvcnlfaWR9XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXRhZycpLCAnICcsXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QoKS5jYXRlZ29yeV9uYW1lXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uI3NoYXJlLWJveC5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnQ29tcGFydGlsaGFyJyksIChjdHJsLmRpc3BsYXlTaGFyZUJveCgpID8gbS5jb21wb25lbnQocHJvamVjdFNoYXJlQm94LCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogY3RybC5kaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdEhpZ2hsaWdodDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBwcm9qZWN0UmV3YXJkTGlzdCBmcm9tICdwcm9qZWN0LXJld2FyZC1saXN0JztcbmltcG9ydCBwcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyBmcm9tICdwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zJztcbmltcG9ydCBwcm9qZWN0Q29udHJpYnV0aW9ucyBmcm9tICdwcm9qZWN0LWNvbnRyaWJ1dGlvbnMnO1xuaW1wb3J0IHByb2plY3RBYm91dCBmcm9tICdwcm9qZWN0LWFib3V0JztcbmltcG9ydCBwcm9qZWN0Q29tbWVudHMgZnJvbSAncHJvamVjdC1jb21tZW50cyc7XG5pbXBvcnQgcHJvamVjdFBvc3RzIGZyb20gJ3Byb2plY3QtcG9zdHMnO1xuXG5jb25zdCBwcm9qZWN0TWFpbiA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY19vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcmV3YXJkcyc6IG0oJy53LWNvbC53LWNvbC0xMicsIG0uY29tcG9uZW50KHByb2plY3RSZXdhcmRMaXN0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnOiBtLmNvbXBvbmVudChwcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbnMnOiBtLmNvbXBvbmVudChwcm9qZWN0Q29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2Fib3V0JzogbS5jb21wb25lbnQocHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQocHJvamVjdENvbW1lbnRzLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcG9zdHMnOiBtLmNvbXBvbmVudChwcm9qZWN0UG9zdHMsIGNfb3B0cylcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFic1snI2Fib3V0J107XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgIGgucmVkcmF3SGFzaENoYW5nZSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudDogZGlzcGxheVRhYkNvbnRlbnRcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG0oJ3NlY3Rpb24uc2VjdGlvbltpdGVtdHlwZT1cImh0dHA6Ly9zY2hlbWEub3JnL0NyZWF0aXZlV29ya1wiXScsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBhcmdzLnByb2plY3QoKSA/IGN0cmwuZGlzcGxheVRhYkNvbnRlbnQoKSA6ICcnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdE1haW47XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RNb2RlIGNvbXBvbmVudFxuICogQSBzaW1wbGUgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBiYWRnZSB3aXRoIHRoZSBjdXJyZW50IHByb2plY3QgbW9kZVxuICogdG9nZXRoZXIgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBtb2RlLCBzaG93biBpbnNpZGUgYSB0b29sdGlwLlxuICogSXQgcmVjZWl2ZXMgYSBwcm9qZWN0IGFzIHJlc291cmNlXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgfVxuICovXG5cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCB0b29sdGlwIGZyb20gJ3Rvb2x0aXAnO1xuXG5jb25zdCBwcm9qZWN0TW9kZSA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QoKSxcbiAgICAgICAgICAgIG1vZGUgPSBwcm9qZWN0Lm1vZGUsXG4gICAgICAgICAgICBtb2RlSW1nU3JjID0gKG1vZGUgPT09ICdhb24nKSA/ICcvYXNzZXRzL2Fvbi1iYWRnZS5wbmcnIDogJy9hc3NldHMvZmxleC1iYWRnZS5wbmcnLFxuICAgICAgICAgICAgbW9kZVRpdGxlID0gKG1vZGUgPT09ICdhb24nKSA/ICdDYW1wYW5oYSBUdWRvLW91LW5hZGEgJyA6ICdDYW1wYW5oYSBGbGV4w612ZWwgJyxcbiAgICAgICAgICAgIGdvYWwgPSAoXy5pc051bGwocHJvamVjdC5nb2FsKSA/ICduw6NvIGRlZmluaWRhJyA6IGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkpLFxuICAgICAgICAgICAgdG9vbHRpcCA9IChlbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudCh0b29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogKG1vZGUgPT09ICdhb24nKSA/IGBTb21lbnRlIHJlY2ViZXLDoSBvcyByZWN1cnNvcyBzZSBhdGluZ2lyIG91IHVsdHJhcGFzc2FyIGEgbWV0YSBhdMOpIG8gZGlhICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQsICdERC9NTS9ZWVlZJyl9LmAgOiAnTyByZWFsaXphZG9yIHJlY2ViZXLDoSB0b2RvcyBvcyByZWN1cnNvcyBxdWFuZG8gZW5jZXJyYXIgYSBjYW1wYW5oYSwgbWVzbW8gcXVlIG7Do28gdGVuaGEgYXRpbmdpZG8gZXN0YSBtZXRhLicsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG0oYCMke21vZGV9Lnctcm93YCwgW1xuICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgIV8uaXNFbXB0eShwcm9qZWN0KSA/IG0oYGltZ1tzcmM9XCIke21vZGVJbWdTcmN9XCJdW3dpZHRoPSczMCddYCkgOiAnJ1xuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtMTAudy1jb2wtdGlueS0xMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ01ldGEgUiQgJyArIGguc2VsZk9yRW1wdHkoZ29hbCwgJy0tJykpLFxuICAgICAgICAgICAgICAgIG0oJy53LWlubGluZS1ibG9jay5mb250c2l6ZS1zbWFsbGVzdC5fdy1pbmxpbmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgICFfLmlzRW1wdHkocHJvamVjdCkgPyBtb2RlVGl0bGUgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcCgnc3Bhbi53LWlubGluZS1ibG9jay50b29sdGlwLXdyYXBwZXIuZmEuZmEtcXVlc3Rpb24tY2lyY2xlLmZvbnRjb2xvci1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0TW9kZTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IHBvc3RncmVzdCBmcm9tICdtaXRocmlsLXBvc3RncmVzdCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuXG5jb25zdCBwcm9qZWN0UG9zdHMgPSB7XG4gICAgY3RybCAoYXJncykge1xuICAgICAgICBjb25zdCBsaXN0Vk0gPSBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5wcm9qZWN0UG9zdERldGFpbCksXG4gICAgICAgICAgICBmaWx0ZXJWTSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0KCkuaWQpO1xuXG4gICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICBwcm9qZWN0ID0gYXJncy5wcm9qZWN0KCkgfHwge307XG5cbiAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LXBvc3RzLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IFtcbiAgICAgICAgICAgICAgICAgICAgKCFsaXN0LmlzTG9hZGluZygpKSA/XG4gICAgICAgICAgICAgICAgICAgIChfLmlzRW1wdHkobGlzdC5jb2xsZWN0aW9uKCkpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMC51LW1hcmdpbnRvcC0yMCcsICdUb2RhIG5vdmlkYWRlIHB1YmxpY2FkYSBubyBDYXRhcnNlIMOpIGVudmlhZGEgZGlyZXRhbWVudGUgcGFyYSBvIGVtYWlsIGRlIHF1ZW0gasOhIGFwb2lvdSBzZXUgcHJvamV0byBlIHRhbWLDqW0gZmljYSBkaXNwb27DrXZlbCBwYXJhIHZpc3VhbGl6YcOnw6NvIG5vIHNpdGUuIFZvY8OqIHBvZGUgb3B0YXIgcG9yIGRlaXjDoS1sYSBww7pibGljYSwgb3Ugdmlzw612ZWwgc29tZW50ZSBwYXJhIHNldXMgYXBvaWFkb3JlcyBhcXVpIG5lc3RhIGFiYS4nKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JyksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6ICcnKSwgKF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAocG9zdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucG9zdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnRjb2xvci1zZWNvbmRhcnkudS10ZXh0LWNlbnRlcicsIGgubW9tZW50aWZ5KHBvc3QuY3JlYXRlZF9hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBwb3N0LnRpdGxlKSwgKCFfLmlzRW1wdHkocG9zdC5jb21tZW50X2h0bWwpID8gbSgnLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHBvc3QuY29tbWVudF9odG1sKSkgOiBtKCcuZm9udHNpemUtYmFzZScsICdQb3N0IGV4Y2x1c2l2byBwYXJhIGFwb2lhZG9yZXMuJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS02MCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICdOZW5odW1hIG5vdmlkYWRlLicgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RQb3N0cztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuXG5jb25zdCBwcm9qZWN0UmVtaW5kZXJDb3VudCA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnJlc291cmNlO1xuICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1RvdGFsIGRlIHBlc3NvYXMgcXVlIGNsaWNhcmFtIG5vIGJvdMOjbyBMZW1icmFyLW1lJyksXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdFJlbWluZGVyQ291bnQ7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHByb2plY3RSZXdhcmRMaXN0ID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAgIC8vIC0gYWRkIGRyYWZ0IGFkbWluIG1vZGlmaWNhdGlvbnNcbiAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGFyZ3MucmV3YXJkRGV0YWlscygpLCAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uVXJsV2l0aFJld2FyZCA9ICcvcHJvamVjdHMvJyArIHByb2plY3QoKS5pZCArICcvY29udHJpYnV0aW9ucy9uZXc/cmV3YXJkX2lkPScgKyByZXdhcmQuaWQ7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyAnY2FyZC1nb25lJyA6ICdjYXJkLXJld2FyZCAnICsgKHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ2NsaWNrYWJsZScgOiAnJykpICsgJyBjYXJkIGNhcmQtc2Vjb25kYXJ5IHUtbWFyZ2luYm90dG9tLTEwXCJdW2hyZWY9XCInICsgKHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkIDogJ2pzOnZvaWQoMCk7JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdQYXJhIFIkICcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSkgKyAnIG91IG1haXMnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGgucGx1cmFsaXplKHJld2FyZC5wYWlkX2NvdW50LCAnIGFwb2lvJywgJyBhcG9pb3MnKSksIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID4gMCA/IG0oJy5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMuaW5fdGltZV90b19jb25maXJtLmNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wZW5kaW5nLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLnBsdXJhbGl6ZShyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LCAnIGFwb2lvIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28nLCAnIGFwb2lvcyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1nb25lLmZvbnRzaXplLXNtYWxsZXInLCAnRXNnb3RhZGEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LWJvbGQnLCAnTGltaXRhZGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAoJyArIGgucmV3YXJkUmVtYW5pbmcocmV3YXJkKSArICcgZGUgJyArIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgKyAnIGRpc3BvbsOtdmVpcyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksICghXy5pc0VtcHR5KHJld2FyZC5kZWxpdmVyX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYicsICdFc3RpbWF0aXZhIGRlIEVudHJlZ2E6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5tb21lbnRpZnkocmV3YXJkLmRlbGl2ZXJfYXQsICdNTU0vWVlZWScpXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtaG92ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RSZXdhcmRMaXN0O1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHByb2plY3RDYXJkIGZyb20gJ3Byb2plY3QtY2FyZCdcblxuY29uc3QgcHJvamVjdFJvdyA9IHtcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBhcmdzLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICB0aXRsZSA9IGFyZ3MudGl0bGUgfHwgY29sbGVjdGlvbi50aXRsZSxcbiAgICAgICAgICAgIHJlZiA9IGFyZ3MucmVmLFxuICAgICAgICAgICAgd3JhcHBlciA9IGFyZ3Mud3JhcHBlciB8fCAnLnctc2VjdGlvbi5zZWN0aW9uLnUtbWFyZ2luYm90dG9tLTQwJztcblxuICAgICAgICBpZiAoY29sbGVjdGlvbi5sb2FkZXIoKSB8fCBjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSh3cmFwcGVyLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAoIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi50aXRsZSkgfHwgIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi5oYXNoKSkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtbG9vc2VyJywgdGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj1cIi9wdC9leHBsb3JlP3JlZj0ke3JlZn0jJHtjb2xsZWN0aW9uLmhhc2h9XCJdYCwgJ1ZlciB0b2RvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uLmxvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0oJy53LXJvdycsIF8ubWFwKGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KHByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtKCdkaXYnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdFJvdztcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHByb2plY3RTaGFyZUJveCA9IHtcbiAgICBjb250cm9sbGVyICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OiBibG9jazsnXG4gICAgICAgIH0sIFtcbiAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZS51LXJpZ2h0Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBhcmdzLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnQ29tcGFydGlsaGUgZXN0ZSBwcm9qZXRvJylcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjE1MHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS92Mi4wL3BsdWdpbnMvc2hhcmVfYnV0dG9uLnBocD9hcHBfaWQ9MTczNzQ3MDQyNjYxNDkxJmNoYW5uZWw9aHR0cHMlM0ElMkYlMkZzLXN0YXRpYy5hay5mYWNlYm9vay5jb20lMkZjb25uZWN0JTJGeGRfYXJiaXRlciUyRjQ0T3dLNzR1MEllLmpzJTNGdmVyc2lvbiUzRDQxJTIzY2IlM0RmN2Q5YjkwMGMlMjZkb21haW4lM0R3d3cuY2F0YXJzZS5tZSUyNm9yaWdpbiUzRGh0dHBzJTI1M0ElMjUyRiUyNTJGd3d3LmNhdGFyc2UubWUlMjUyRmY0YjNhZDBjOCUyNnJlbGF0aW9uJTNEcGFyZW50LnBhcmVudCZjb250YWluZXJfd2lkdGg9MCZocmVmPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QoKS5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEZmFjZWJvb2smbGF5b3V0PWJ1dHRvbl9jb3VudCZsb2NhbGU9cHRfQlImc2RrPWpvZXlcIl0nKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxMjBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCIvL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMvdHdlZXRfYnV0dG9uLjhkMDA3ZGRmYzE4NGU2Nzc2YmU3NmZlOWU1ZTUyZDY5LmVuLmh0bWwjXz0xNDQyNDI1OTg0OTM2JmNvdW50PWhvcml6b250YWwmZG50PWZhbHNlJmlkPXR3aXR0ZXItd2lkZ2V0LTEmbGFuZz1lbiZvcmlnaW5hbF9yZWZlcmVyPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QoKS5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QoKS5uYW1lICsgJyUyMG5vJTIwJTQwY2F0YXJzZSZ0eXBlPXNoYXJlJnVybD1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJyUzRnJlZiUzRHR3aXR0ZXImdmlhPWNhdGFyc2VcIl0nKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCdhLnctaGlkZGVuLXNtYWxsLndpZGdldC1lbWJlZC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheUVtYmVkLnRvZ2dsZVxuICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgICAgICAgbSgnLnctZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QoKS5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0KCkuaWQgKyAnL2VtYmVkXCJdW3dpZHRoPVwiMzAwcHhcIl1bc2Nyb2xsaW5nPVwibm9cIl0nKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgIG0oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLWZiLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCJodHRwOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PWh0dHBzOi8vd3d3LmNhdGFyc2UubWUvJyArIGFyZ3MucHJvamVjdCgpLnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QoKS5uYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mYWNlYm9vaycpLCAnIENvbXBhcnRpbGhlJ1xuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9QWNhYmVpIGRlIGFwb2lhciBvIHByb2pldG8gJyArIGFyZ3MucHJvamVjdCgpLm5hbWUgKyAnIGh0dHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCAnIFR3ZWV0J1xuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RTaGFyZUJveDtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgSTE4biBmcm9tICdpMThuLWpzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHByb2plY3RNb2RlIGZyb20gJ3Byb2plY3QtbW9kZSc7XG5pbXBvcnQgcHJvamVjdFJlbWluZGVyIGZyb20gJ3Byb2plY3QtcmVtaW5kZXInO1xuaW1wb3J0IHByb2plY3RVc2VyQ2FyZCBmcm9tICdwcm9qZWN0LXVzZXItY2FyZCc7XG5cbmNvbnN0IHByb2plY3RTaWRlYmFyID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzcyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYW5pbWF0aW9uLCBwcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkSW5jcmVtZW50ID0gcHJvamVjdCgpLnBsZWRnZWQgLyBwcm9qZWN0KCkucHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNJbmNyZW1lbnQgPSBwcm9qZWN0KCkudG90YWxfY29udHJpYnV0b3JzIC8gcHJvamVjdCgpLnByb2dyZXNzO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzQmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxlZGdlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJpYnV0b3JzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IHNldEludGVydmFsKGluY3JlbWVudFByb2dyZXNzLCAyOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50UHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzIDw9IHBhcnNlSW50KHByb2plY3QoKS5wcm9ncmVzcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsLmlubmVyVGV4dCA9IGBSJCAke2guZm9ybWF0TnVtYmVyKHBsZWRnZWQpfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0VsLmlubmVyVGV4dCA9IGAke3BhcnNlSW50KGNvbnRyaWJ1dG9ycyl9IHBlc3NvYXNgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IHBsZWRnZWQgKyBwbGVkZ2VkSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMgPSBjb250cmlidXRvcnMgKyBjb250cmlidXRvcnNJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvZ3Jlc3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxODAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3M6IGFuaW1hdGVQcm9ncmVzc1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgZWxhcHNlZCA9IHByb2plY3QoKS5lbGFwc2VkX3RpbWUsXG4gICAgICAgICAgICByZW1haW5pbmcgPSBwcm9qZWN0KCkucmVtYWluaW5nX3RpbWUsXG4gICAgICAgICAgICBkaXNwbGF5Q2FyZENsYXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiAnY2FyZC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gKHN0YXRlc1twcm9qZWN0KCkuc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdCgpLnN0YXRlXSA6ICcnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuYXBwcm92ZWQnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICdvbmxpbmUnOiBoLmV4aXN0eShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KSA/IEkxOG4udCgnZGlzcGxheV9zdGF0dXMub25saW5lJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KX0pKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5mYWlsZWQnLCBJMThuU2NvcGUoe2RhdGU6IGgubW9tZW50aWZ5KHByb2plY3QoKS56b25lX2V4cGlyZXNfYXQpLCBnb2FsOiBwcm9qZWN0KCkuZ29hbH0pKSxcbiAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5yZWplY3RlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5pbl9hbmFseXNpcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3NmdWwnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLnN1Y2Nlc3NmdWwnLCBJMThuU2NvcGUoe2RhdGU6IGgubW9tZW50aWZ5KHByb2plY3QoKS56b25lX2V4cGlyZXNfYXQpfSkpLFxuICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMud2FpdGluZ19mdW5kcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5kcmFmdCcsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3QoKS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1zaWRlYmFyLmFzaWRlJywgW1xuICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMtaW5uZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLWluZm8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BsZWRnZWQuZm9udHNpemUtbGFyZ2VzdC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGBSJCAke3Byb2plY3QoKS5wbGVkZ2VkID8gaC5mb3JtYXROdW1iZXIocHJvamVjdCgpLnBsZWRnZWQpIDogJzAnfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnY29udHJpYnV0b3JzX2NhbGwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4jY29udHJpYnV0b3JzLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2NvbnRyaWJ1dG9yc19jb3VudCcsIEkxOG5TY29wZSh7Y291bnQ6IHByb2plY3QoKS50b3RhbF9jb250cmlidXRvcnN9KSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QoKS5leHBpcmVzX2F0ICYmIGVsYXBzZWQpID8gJyBlbSAnICsgSTE4bi50KCdkYXRldGltZS5kaXN0YW5jZV9pbl93b3Jkcy54XycgKyBlbGFwc2VkLnVuaXQsIHtjb3VudDogZWxhcHNlZC50b3RhbH0sIEkxOG5TY29wZSgpKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwcm9ncmVzc0Jhci5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke3Byb2plY3QoKS5wcm9ncmVzc30lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXInLCBgJHtwcm9qZWN0KCkucHJvZ3Jlc3MgPyBwYXJzZUludChwcm9qZWN0KCkucHJvZ3Jlc3MpIDogJzAnfSVgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXJpZ2h0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtdGlnaHRlcicsIHJlbWFpbmluZyAmJiByZW1haW5pbmcudG90YWwgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZW1haW5pbmcudG90YWwpLCBJMThuLnQoJ3JlbWFpbmluZ190aW1lLicgKyByZW1haW5pbmcudW5pdCwgSTE4blNjb3BlKHtjb3VudDogcmVtYWluaW5nLnRvdGFsfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KHByb2plY3RNb2RlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICwgKHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gbSgnYSNjb250cmlidXRlX3Byb2plY3RfZm9ybS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QoKS5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSkgOiAnJyksICgocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMpID8gbS5jb21wb25lbnQocHJvamVjdFJlbWluZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJ1xuICAgICAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJ2RpdltjbGFzcz1cImZvbnRzaXplLXNtYWxsZXIgdS1tYXJnaW5ib3R0b20tMzAgJyArIGRpc3BsYXlDYXJkQ2xhc3MoKSArICdcIl0nLCBkaXNwbGF5U3RhdHVzVGV4dCgpKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCcudXNlci1jJywgbS5jb21wb25lbnQocHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3MudXNlckRldGFpbHNcbiAgICAgICAgICAgIH0pKVxuICAgICAgICBdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9qZWN0U2lkZWJhcjtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMgY29tcG9uZW50XG4gKiBBIFByb2plY3Qtc2hvdyBwYWdlIGhlbHBlciB0byBzaG93IHN1Z2dlc3RlZCBhbW91bnRzIG9mIGNvbnRyaWJ1dGlvbnNcbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgLi4uXG4gKiAgIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMsIHtwcm9qZWN0OiBwcm9qZWN0fSlcbiAqICAgLi4uXG4gKiB9XG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5cbmNvbnN0IHByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zID0ge1xuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpO1xuICAgICAgICBjb25zdCBzdWdnZXN0aW9uVXJsID0gKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAvcHJvamVjdHMvJHtwcm9qZWN0LnByb2plY3RfaWR9L2NvbnRyaWJ1dGlvbnMvbmV3P2Ftb3VudD0ke2Ftb3VudH1gO1xuICAgICAgICB9LCBzdWdnZXN0ZWRWYWx1ZXMgPSBbMTAsIDI1LCA1MCwgMTAwXTtcblxuICAgICAgICByZXR1cm4gbSgnI3N1Z2dlc3Rpb25zJywgXy5tYXAoc3VnZ2VzdGVkVmFsdWVzLCAoYW1vdW50KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbShgYVtocmVmPVwiJHtzdWdnZXN0aW9uVXJsKGFtb3VudCl9XCJdLmNhcmQtcmV3YXJkLmNhcmQtYmlnLmNhcmQtc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwYCwgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBgUiTCoCR7YW1vdW50fWApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBwcm9qZWN0UmVtaW5kZXIgZnJvbSAncHJvamVjdFJlbWluZGVyJztcblxuY29uc3QgcHJvamVjdFRhYnMgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCBpc0ZpeGVkID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBtLnByb3AoLTEpO1xuXG4gICAgICAgIGNvbnN0IGZpeE9uU2Nyb2xsID0gKGVsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB2aWV3cG9ydE9mZnNldCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZIDw9IG9yaWdpbmFsUG9zaXRpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgaXNGaXhlZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0T2Zmc2V0LnRvcCA8IDAgfHwgKHdpbmRvdy5zY3JvbGxZID4gb3JpZ2luYWxQb3NpdGlvbigpICYmIG9yaWdpbmFsUG9zaXRpb24oKSA+IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXhlZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24od2luZG93LnNjcm9sbFkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNGaXhlZCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG5hdkRpc3BsYXkgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpeE5hdkJhciA9IGZpeE9uU2Nyb2xsKGVsKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZml4TmF2QmFyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmF2RGlzcGxheTogbmF2RGlzcGxheSxcbiAgICAgICAgICAgIGlzRml4ZWQ6IGlzRml4ZWRcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgIHJld2FyZHMgPSBhcmdzLnJld2FyZERldGFpbHM7XG5cbiAgICAgICAgbGV0IG1haW5DbGFzcyA9ICghY3RybC5pc0ZpeGVkKCkgfHwgcHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluKSA/ICcudy1zZWN0aW9uLnByb2plY3QtbmF2JyA6ICcudy1zZWN0aW9uLnByb2plY3QtbmF2LnByb2plY3QtbmF2LWZpeGVkJztcblxuICAgICAgICByZXR1cm4gbSgnbmF2LXdyYXBwZXInLCBwcm9qZWN0KCkgPyBbXG4gICAgICAgICAgICBtKG1haW5DbGFzcywge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5uYXZEaXNwbGF5XG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFshXy5pc0VtcHR5KHJld2FyZHMoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1JlY29tcGVuc2FzJykgOiBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnVmFsb3JlcyBTdWdlcmlkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiYWJvdXQtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1NvYnJlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInBvc3RzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QoKSA/IHByb2plY3QoKS5wb3N0c19jb3VudCA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJjb250cmlidXRpb25zLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1zbWFsbCB3LWhpZGRlbi10aW55IGRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29udHJpYnV0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBcG9pb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdCgpID8gcHJvamVjdCgpLnRvdGFsX2NvbnRyaWJ1dGlvbnMgOiAnLScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbW1lbnRzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDb21lbnTDoXJpb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdCgpID8gbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdCgpLnBlcm1hbGluayArICdcIl1bY2xhc3M9XCJiYWRnZSBwcm9qZWN0LWZiLWNvbW1lbnQgdy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueVwiXVtzdHlsZT1cImRpc3BsYXk6IGlubGluZVwiXScsIG0udHJ1c3QoJyZuYnNwOycpKSA6ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkgPyBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbmF2LWJhY2stYnV0dG9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1tZWRpdW0tOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QoKS5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFywqDigI1lc3RlwqBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQocHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbicsIGhpZGVUZXh0T25Nb2JpbGU6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpIDogJydcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAoY3RybC5pc0ZpeGVkKCkgJiYgIXByb2plY3QoKS5pc19vd25lcl9vcl9hZG1pbikgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICBdIDogJycpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2plY3RUYWJzO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IG93bmVyTWVzc2FnZUNvbnRlbnQgZnJvbSAnb3duZXItbWVzc2FnZS1jb250ZW50JztcbmltcG9ydCBtb2RhbEJveCBmcm9tICdtb2RhbC1ib3gnO1xuXG5jb25zdCBwcm9qZWN0VXNlckNhcmQgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICByZXR1cm4ge2Rpc3BsYXlNb2RhbDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKX07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhY3RNb2RhbEMgPSBbb3duZXJNZXNzYWdlQ29udGVudCwgYXJncy51c2VyRGV0YWlsc107XG5cbiAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChhcmdzLnVzZXJEZXRhaWxzKCksICh1c2VyRGV0YWlsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnUtbWFyZ2luYm90dG9tLTMwLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICAoY3RybC5kaXNwbGF5TW9kYWwoKSA/IG0uY29tcG9uZW50KG1vZGFsQm94LCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RhbDogY3RybC5kaXNwbGF5TW9kYWwsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRhY3RNb2RhbENcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtbWFyZ2luYm90dG9tLTMwLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAubGluZWhlaWdodC10aWdodFtpdGVtcHJvcD1cIm5hbWVcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLnBsdXJhbGl6ZSh1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzLCAnIGFwb2lhZG8nLCAnIGFwb2lhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1oaWRkZW4tdGlueS53LWhpZGRlbi1zbWFsbC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIChsaW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWRMaW5rID0gaC5wYXJzZVVybChsaW5rKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBwYXJzZWRMaW5rLmhvc3RuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gW20oJ2Eudy1idXR0b24uYnRuLmJ0bi10ZXJjaWFyeS5idG4tc21hbGwuYnRuLWlubGluZVtocmVmPVxcJ2phdmFzY3JpcHQ6dm9pZCgwKTtcXCddJyx7b25jbGljazogY3RybC5kaXNwbGF5TW9kYWwudG9nZ2xlfSwgJ0VudmlhciBtZW5zYWdlbScpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdFVzZXJDYXJkO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5TZWFyY2ggY29tcG9uZW50XG4gKiBSZXR1cm5zIGEgc2VhcmNoIGlucHV0XG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuU2VhcmNoLCB7YWN0aW9uOiAnL3NlYXJjaCcsIG1ldGhvZDogJ0dFVCd9KVxuICovXG5cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuXG5jb25zdCBzZWFyY2ggPSB7XG4gICAgdmlldyAoY3RybCwgYXJncyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGFyZ3MuYWN0aW9uIHx8ICcvcHQvZXhwbG9yZScsXG4gICAgICAgICAgICBtZXRob2QgPSBhcmdzLm1ldGhvZCB8fCAnR0VUJztcblxuICAgICAgICByZXR1cm4gbSgnI3NlYXJjaC53LWNvbnRhaW5lci53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bScsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtI2VtYWlsLWZvcm0nLCB7YWN0aW9uOiBhY3Rpb24sIG1ldGhvZDogbWV0aG9kfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTEwLnctY29sLXRpbnktMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFt0eXBlPVwidGV4dFwiXVtuYW1lPVwicGdfc2VhcmNoXCJdW3BsYWNlaG9sZGVyPVwiQnVzcXVlIHByb2pldG9zXCJdI3BnX3NlYXJjaF9pbnNpZGUudy1pbnB1dC50ZXh0LWZpZWxkLm5lZ2F0aXZlLnByZWZpeCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5idG4uYnRuLWRhcmsuYnRuLWF0dGFjaGVkLnBvc3RmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmhlYWRlci1sdXBhW3NyYz1cImh0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTRlNDQxNzhiMjEzNWZjZTJiNmNkMjM1X2x1cGEucG5nXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlYXJjaDtcbiIsIi8qKlxuICogd2luZG93LmMuU2xpZGVyIGNvbXBvbmVudFxuICogQnVpbGQgYSBzbGlkZXIgZnJvbSBhbnkgYXJyYXkgb2YgbWl0aHJpbCBlbGVtZW50c1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgIC4uLlxuICogICAgIG0uY29tcG9uZW50KGMuU2xpZGVyLCB7XG4gKiAgICAgICAgIHNsaWRlczogW20oJ3NsaWRlMScpLCBtKCdzbGlkZTInKSwgbSgnc2xpZGUzJyldLFxuICogICAgICAgICB0aXRsZTogJ08gcXVlIGVzdMOjbyBkaXplbmRvIHBvciBhw60uLi4nXG4gKiAgICAgfSlcbiAqICAgICAuLi5cbiAqIH1cbiAqL1xuXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuXG5jb25zdCBzbGlkZXIgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgaW50ZXJ2YWw7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkU2xpZGVJZHggPSBtLnByb3AoMCksXG4gICAgICAgICAgICB0cmFuc2xhdGlvblNpemUgPSBtLnByb3AoMTYwMCksXG4gICAgICAgICAgICBzbGlkZXJUaW1lID0gYXJncy5zbGlkZXJUaW1lIHx8IDY1MDAsXG4gICAgICAgICAgICBkZWNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KHNlbGVjdGVkU2xpZGVJZHgoKSAtIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoYXJncy5zbGlkZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFNsaWRlSWR4KCkgPCAoYXJncy5zbGlkZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFydFNsaWRlclRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH0sIHNsaWRlclRpbWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc2V0U2xpZGVyVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZyA9IChlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uU2l6ZShNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApKTtcbiAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9ICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBzdGFydFNsaWRlclRpbWVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uU2l6ZTogdHJhbnNsYXRpb25TaXplLFxuICAgICAgICAgICAgZGVjcmVtZW50U2xpZGU6IGRlY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgcmVzZXRTbGlkZXJUaW1lcjogcmVzZXRTbGlkZXJUaW1lclxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBzbGlkZUNsYXNzID0gYXJncy5zbGlkZUNsYXNzIHx8ICcnLFxuICAgICAgICAgICAgd3JhcHBlckNsYXNzID0gYXJncy53cmFwcGVyQ2xhc3MgfHwgJycsXG4gICAgICAgICAgICBlZmZlY3QgPSBhcmdzLmVmZmVjdCB8fCAnc2xpZGUnLFxuICAgICAgICAgICAgc2xpZGVyQ2xpY2sgPSAoZm4sIHBhcmFtKSA9PiB7XG4gICAgICAgICAgICAgICAgZm4ocGFyYW0pO1xuICAgICAgICAgICAgICAgIGN0cmwucmVzZXRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVmZmVjdFN0eWxlID0gKGlkeCwgdHJhbnNsYXRlU3RyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2xpZGVGeCA9IGB0cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLXdlYmtpdC10cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLW1zLXRyYW5zZm9ybToke3RyYW5zbGF0ZVN0cn1gLFxuICAgICAgICAgICAgICAgICAgICBmYWRlRnggPSBpZHggPT09IGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpID8gJ29wYWNpdHk6IDE7IHZpc2liaWxpdHk6IHZpc2libGU7JyA6ICdvcGFjaXR5OiAwOyB2aXNpYmlsaXR5OiBoaWRkZW47JztcblxuICAgICAgICAgICAgICAgIHJldHVybiBlZmZlY3QgPT09ICdmYWRlJyA/IGZhZGVGeCA6IHNsaWRlRng7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtKGAudy1zbGlkZXIuJHt3cmFwcGVyQ2xhc3N9YCwge1xuICAgICAgICAgICAgY29uZmlnOiBjdHJsLmNvbmZpZ1xuICAgICAgICB9LCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgYXJncy50aXRsZSksXG4gICAgICAgICAgICBtKCcudy1zbGlkZXItbWFzaycsIFtcbiAgICAgICAgICAgICAgICBfLm1hcChhcmdzLnNsaWRlcywgKHNsaWRlLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZVZhbHVlID0gKGlkeCAtIGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpKSAqIGN0cmwudHJhbnNsYXRpb25TaXplKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTdHIgPSBgdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVWYWx1ZX1weCwgMCwgMClgO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGAuc2xpZGUudy1zbGlkZS4ke3NsaWRlQ2xhc3N9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGAke2VmZmVjdFN0eWxlKGlkeCwgdHJhbnNsYXRlU3RyKX0gJHtzbGlkZS5jdXN0b21TdHlsZX1gXG4gICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXB1c2gtMicsIHNsaWRlLmNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJyNzbGlkZS1wcmV2Lnctc2xpZGVyLWFycm93LWxlZnQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5kZWNyZW1lbnRTbGlkZSlcbiAgICAgICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItbGVmdC5mYS5mYS1sZy5mYS1hbmdsZS1sZWZ0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnI3NsaWRlLW5leHQudy1zbGlkZXItYXJyb3ctcmlnaHQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5pbmNyZW1lbnRTbGlkZSlcbiAgICAgICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItcmlnaHQuZmEuZmEtbGcuZmEtYW5nbGUtcmlnaHQuZm9udGNvbG9yLXRlcmNpYXJ5JylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbmF2Lnctc2xpZGVyLW5hdi1pbnZlcnQudy1yb3VuZC5zbGlkZS1uYXYnLCBfKGFyZ3Muc2xpZGVzLmxlbmd0aCkudGltZXMoKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgLnNsaWRlLWJ1bGxldC53LXNsaWRlci1kb3Qke2N0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpID09PSBpZHggPyAnLnctYWN0aXZlJyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCwgaWR4KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNsaWRlcjtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5cbmNvbnN0IHRlYW1NZW1iZXJzID0ge1xuICAgIGNvbnRyb2xsZXIgKCkge1xuICAgICAgICBjb25zdCB2bSA9IHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBncm91cENvbGxlY3Rpb24gPSAoY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChfLnJhbmdlKE1hdGguY2VpbChjb2xsZWN0aW9uLmxlbmd0aCAvIGdyb3VwVG90YWwpKSwgKGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uc2xpY2UoaSAqIGdyb3VwVG90YWwsIChpICsgMSkgKiBncm91cFRvdGFsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCkge1xuICAgICAgICByZXR1cm4gbSgnI3RlYW0tbWVtYmVycy1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChncm91cCwgKG1lbWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtYmFzZScsIG1lbWJlci5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRlYW1NZW1iZXJzO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcblxuY29uc3QgdGVhbVRvdGFsID0ge1xuICAgIGNvbnRyb2xsZXIgKCkge1xuICAgICAgICBjb25zdCB2bSA9IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgfTtcblxuICAgICAgICBtb2RlbHMudGVhbVRvdGFsLmdldFJvdygpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHZtLmNvbGxlY3Rpb24oZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2bTogdm1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLXRvdGFsLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24udS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcCgodGVhbVRvdGFsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0hvamUgc29tb3MgJyArIHRlYW1Ub3RhbC5tZW1iZXJfY291bnQgKyAnIHBlc3NvYXMgZXNwYWxoYWRhcyBwb3IgJyArIHRlYW1Ub3RhbC50b3RhbF9jaXRpZXMgKyAnIGNpZGFkZXMgZW0gJyArIHRlYW1Ub3RhbC5jb3VudHJpZXMubGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3NzYSBlcXVpcGUsIGp1bnRhLCBqw6EgYXBvaW91IFIkJyArIGguZm9ybWF0TnVtYmVyKHRlYW1Ub3RhbC50b3RhbF9hbW91bnQpICsgJyBwYXJhICcgKyB0ZWFtVG90YWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdGVhbVRvdGFsO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Ub29sdGlwIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3MgeW91IHRvIHNob3cgYSB0b29sdGlwIG9uXG4gKiBhIHNwZWNpZmllZCBlbGVtZW50IGhvdmVyLiBJdCByZWNlaXZlcyB0aGUgZWxlbWVudCB5b3Ugd2FudFxuICogdG8gdHJpZ2dlciB0aGUgdG9vbHRpcCBhbmQgYWxzbyB0aGUgdGV4dCB0byBkaXNwbGF5IGFzIHRvb2x0aXAuXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgbGV0IHRvb2x0aXAgPSAoZWwpID0+IHtcbiAqICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlRvb2x0aXAsIHtcbiAqICAgICAgICAgICAgICBlbDogZWwsXG4gKiAgICAgICAgICAgICAgdGV4dDogJ3RleHQgdG8gdG9vbHRpcCcsXG4gKiAgICAgICAgICAgICAgd2lkdGg6IDMwMFxuICogICAgICAgICAgfSlcbiAqICAgICB9XG4gKlxuICogICAgIHJldHVybiB0b29sdGlwKCdhI2xpbmstd3RoLXRvb2x0aXBbaHJlZj1cIiNcIl0nKTtcbiAqXG4gKiB9XG4gKi9cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHRvb2x0aXAgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBsZXQgcGFyZW50SGVpZ2h0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgd2lkdGggPSBtLnByb3AoYXJncy53aWR0aCB8fCAyODApLFxuICAgICAgICAgICAgdG9wID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgbGVmdCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgIG9wYWNpdHkgPSBtLnByb3AoMCksXG4gICAgICAgICAgICBwYXJlbnRPZmZzZXQgPSBtLnByb3Aoe3RvcDogMCwgbGVmdDogMH0pLFxuICAgICAgICAgICAgdG9vbHRpcCA9IGgudG9nZ2xlUHJvcCgwLCAxKSxcbiAgICAgICAgICAgIHRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0b29sdGlwLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHNldFBhcmVudFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldChoLmN1bXVsYXRpdmVPZmZzZXQoZWwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgICAgIHNldFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVsVG9wID0gZWwub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IChlbC5vZmZzZXRXaWR0aCArIDIgKiBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIDMwKSl7IC8vMzAgaGVyZSBpcyBhIHNhZmUgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMzA7IC8vQWRkaW5nIHRoZSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtcGFyZW50T2Zmc2V0KCkubGVmdCArIDE1KTsgLy9wb3NpdGlvbmluZyBjZW50ZXIgb2Ygd2luZG93LCBjb25zaWRlcmluZyBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA8PSB3aW5kb3cuaW5uZXJXaWR0aCAmJiAocGFyZW50T2Zmc2V0KCkubGVmdCAtIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoIC8gMik7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpID4gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgbGVmdFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0b3AoLWVsVG9wKTsgLy9TZXR0aW5nIHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICB0b29sdGlwOiB0b29sdGlwLFxuICAgICAgICAgICAgdG9nZ2xlOiB0b2dnbGUsXG4gICAgICAgICAgICBzZXRQb3NpdGlvbjogc2V0UG9zaXRpb24sXG4gICAgICAgICAgICBzZXRQYXJlbnRQb3NpdGlvbjogc2V0UGFyZW50UG9zaXRpb25cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gY3RybC53aWR0aCgpO1xuICAgICAgICByZXR1cm4gbShhcmdzLmVsLCB7XG4gICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZSxcbiAgICAgICAgICAgIGNvbmZpZzogY3RybC5zZXRQYXJlbnRQb3NpdGlvbixcbiAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9XG4gICAgICAgIH0sIGN0cmwudG9vbHRpcCgpID8gW1xuICAgICAgICAgICAgbShgLnRvb2x0aXAuZGFya1tzdHlsZT1cIndpZHRoOiAke3dpZHRofXB4OyB0b3A6ICR7Y3RybC50b3AoKX1weDsgbGVmdDogJHtjdHJsLmxlZnQoKX1weDtcIl1gLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnNldFBvc2l0aW9uXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgYXJncy50ZXh0KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSA6ICcnKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB0b29sdGlwO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Vc2VyQmFsYW5jZVJlcXVlc3RNb2RhbENvbnRlbnQgY29tcG9uZW50XG4gKiBSZW5kZXIgdGhlIGN1cnJlbnQgdXNlciBiYW5rIGFjY291bnQgdG8gY29uZmlybSBmdW5kIHJlcXVlc3RcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Vc2VyQmFsYW5jZVJlcXVlc3RNb2RlbENvbnRlbnQsIHtcbiAqICAgICBiYWxhbmNlOiB7dXNlcl9pZDogMTIzLCBhbW91bnQ6IDEyM30gLy8gdXNlckJhbGFuY2Ugc3RydWN0XG4gKiB9KVxuICovXG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IEkxOG4gZnJvbSAnaTE4bi1qcyc7XG5pbXBvcnQgaCBmcm9tICdoJztcbmltcG9ydCBtb2RlbHMgZnJvbSAnbW9kZWxzJztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG5jb25zdCB1c2VyQmFsYW5jZVJlcXVlc3RNb2RlbENvbnRlbnQgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCB2bSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe3VzZXJfaWQ6ICdlcSd9KSxcbiAgICAgICAgICAgICAgYmFsYW5jZSA9IGFyZ3MuYmFsYW5jZSxcbiAgICAgICAgICAgICAgbG9hZGVyT3B0cyA9IG1vZGVscy5iYWxhbmNlVHJhbnNmZXIucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgdXNlcl9pZDogYmFsYW5jZS51c2VyX2lkfSksXG4gICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXIgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGxvYWRlck9wdHMpLFxuICAgICAgICAgICAgICBkaXNwbGF5RG9uZSA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgIHJlcXVlc3RGdW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmVxdWVzdExvYWRlci5sb2FkKCkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYmFsYW5jZU1hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYmFsYW5jZVRyYW5zYWN0aW9uTWFuYWdlci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgZGlzcGxheURvbmUudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICBhcmdzLmJhbmtBY2NvdW50TWFuYWdlci5sb2FkKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlcXVlc3RMb2FkZXI6IHJlcXVlc3RMb2FkZXIsXG4gICAgICAgICAgICByZXF1ZXN0RnVuZDogcmVxdWVzdEZ1bmQsXG4gICAgICAgICAgICBiYW5rQWNjb3VudHM6IGFyZ3MuYmFua0FjY291bnRNYW5hZ2VyLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICBkaXNwbGF5RG9uZTogZGlzcGxheURvbmUsXG4gICAgICAgICAgICBsb2FkQmFua0E6IGFyZ3MuYmFua0FjY291bnRNYW5hZ2VyLmxvYWRlclxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICBjb25zdCBiYWxhbmNlID0gYXJncy5iYWxhbmNlO1xuXG4gICAgICAgIHJldHVybiAoY3RybC5sb2FkQmFua0EoKSA/IGgubG9hZGVyKCkgOiBtKCdkaXYnLCBfLm1hcChjdHJsLmJhbmtBY2NvdW50cygpLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBJMThuLnQoJ3dpdGhkcmF3JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIChjdHJsLmRpc3BsYXlEb25lKCkgPyBtKCcubW9kYWwtZGlhbG9nLWNvbnRlbnQudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZhLmZhLWNoZWNrLWNpcmNsZS5mYS01eC50ZXh0LXN1Y2Nlc3MudS1tYXJnaW5ib3R0b20tNDAnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnc3VjZXNzX21lc3NhZ2UnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgXSkgOiBtKCcubW9kYWwtZGlhbG9nLWNvbnRlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZhbG9yOicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnRleHQtc3VjY2VzcycsIGBSJCAke2guZm9ybWF0TnVtYmVyKGJhbGFuY2UuYW1vdW50LCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge3N0eWxlOiB7J2ZvbnQtd2VpZ2h0JzogJyA2MDAnfX0sIEkxOG4udCgnYmFuay5hY2NvdW50JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5uYW1lJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm93bmVyX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5jcGZfY25waicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vd25lcl9kb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCdiYW5rLmJhbmtfbmFtZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5iYW5rX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5hZ2VuY3knLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2l0ZW0uYWdlbmN5fS0ke2l0ZW0uYWdlbmN5X2RpZ2l0fWBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5hY2NvdW50JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtpdGVtLmFjY291bnR9LSR7aXRlbS5hY2NvdW50X2RpZ2l0fWBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICAoIWN0cmwuZGlzcGxheURvbmUoKSA/XG4gICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctbmF2LWJvdHRvbScsIFtcbiAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5yZXF1ZXN0TG9hZGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdhLmJ0bi5idG4tbGFyZ2UuYnRuLXJlcXVlc3QtZnVuZFtocmVmPVwianM6dm9pZCgwKTtcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvbmNsaWNrOiBjdHJsLnJlcXVlc3RGdW5kfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU29saWNpdGFyIHNhcXVlJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnKVxuICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0pKSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlckJhbGFuY2VSZXF1ZXN0TW9kZWxDb250ZW50O1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCc7XG5pbXBvcnQgaCBmcm9tICdoJztcblxuY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG5jb25zdCB1c2VyQmFsYW5jZVRyYXNhY3Rpb25Sb3cgPSB7XG4gICAgY29udHJvbGxlciAoYXJncykge1xuICAgICAgICBjb25zdCBleHBhbmRlZCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKGFyZ3MuaW5kZXggPT0gMCkge1xuICAgICAgICAgICAgZXhwYW5kZWQudG9nZ2xlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXhwYW5kZWQ6IGV4cGFuZGVkXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IGgubW9tZW50RnJvbVN0cmluZyhpdGVtLmNyZWF0ZWRfYXQsICdZWVlZLU1NLUREJyk7XG5cbiAgICAgICAgcmV0dXJuIG0oYGRpdltjbGFzcz0nYmFsYW5jZS1jYXJkICR7KGN0cmwuZXhwYW5kZWQoKSA/ICdjYXJkLWRldGFpbGVkLW9wZW4nIDogJycpfSddYCxcbiAgICAgICAgICAgICAgICAgbSgnLnctY2xlYXJmaXguY2FyZC5jYXJkLWNsaWNrYWJsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgY3JlYXRlZEF0LmZvcm1hdCgnRCBNTU0nKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3ItdGVyY2lhcnknLCBjcmVhdGVkQXQuZm9ybWF0KCdZWVlZJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXRpbnktMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2RlYml0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtYmFzZS50ZXh0LWVycm9yJywgYFIkICR7aC5mb3JtYXROdW1iZXIoTWF0aC5hYnMoaXRlbS5kZWJpdCksIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnY3JlZGl0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtYmFzZS50ZXh0LXN1Y2Nlc3MnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihpdGVtLmNyZWRpdCwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtc21hbGxlci5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCd0b3RhbHMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlJywgYFIkICR7aC5mb3JtYXROdW1iZXIoaXRlbS50b3RhbF9hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi4keyhjdHJsLmV4cGFuZGVkKCkgPyAnYXJyb3ctYWRtaW4tb3BlbmVkJyA6ICcnKX0uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOih2b2lkKDApKTtcIl1gLCB7b25jbGljazogY3RybC5leHBhbmRlZC50b2dnbGV9KVxuICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgKGN0cmwuZXhwYW5kZWQoKSA/IG0oJy5jYXJkJywgXy5tYXAoaXRlbS5zb3VyY2UsICh0cmFuc2FjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRyYW5zYWN0aW9uLmFtb3VudCA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnZGl2JyxbXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYC50ZXh0LSR7KHBvcyA/ICdzdWNjZXNzJyA6ICdlcnJvcicpfWAsIGAke3BvcyA/ICcrJyA6ICctJ30gUiQgJHtoLmZvcm1hdE51bWJlcihNYXRoLmFicyh0cmFuc2FjdGlvbi5hbW91bnQpLCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgYCR7dHJhbnNhY3Rpb24uZXZlbnRfbmFtZX0gJHt0cmFuc2FjdGlvbi5vcmlnaW5fb2JqZWN0Lm5hbWV9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS0xMCcpXG4gICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgfSkpIDogJycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB1c2VyQmFsYW5jZVRyYXNhY3Rpb25Sb3c7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5cbmNvbnN0IHVzZXJCYWxhbmNlVHJhbnNhY3Rpb25zID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgYXJncy5iYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyLmxvYWQoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGlzdDogYXJncy5iYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyLmxpc3RcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXcgKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdDtcblxuICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5zZWN0aW9uLmNhcmQtdGVyY2lhcnkuYmVmb3JlLWZvb3Rlci5iYWxhbmNlLXRyYW5zYWN0aW9ucy1hcmVhJywgW1xuICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAgICAgYy5Vc2VyQmFsYW5jZVRyYW5zYWN0aW9uUm93LCB7aXRlbTogaXRlbSwgaW5kZXg6IGluZGV4fSk7XG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICBtKCcuY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbnRvcC00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlckJhbGFuY2VUcmFuc2FjdGlvbnM7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5pbXBvcnQgbW9kZWxzIGZyb20gJ21vZGVscyc7XG5cbmNvbnN0IHVzZXJDYXJkID0ge1xuICAgIGNvbnRyb2xsZXIgKGFyZ3MpIHtcbiAgICAgICAgY29uc3Qgdm0gPSBoLmlkVk0sXG4gICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAgIC8vRklYTUU6IGNhbiBjYWxsIGFub24gcmVxdWVzdHMgd2hlbiB0b2tlbiBmYWlscyAocmVxdWVzdE1heWJlV2l0aFRva2VuKVxuICAgICAgICBtb2RlbHMudXNlckRldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHVzZXJEZXRhaWxzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzXG4gICAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3IChjdHJsKSB7XG4gICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLmNhcmQtdXNlci51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0zMFtpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LncuY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXJbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi91c2Vycy8nICsgdXNlckRldGFpbC5pZCArICdcIl0nLCB1c2VyRGV0YWlsLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImFkZHJlc3NcIl0nLCB1c2VyRGV0YWlsLmFkZHJlc3NfY2l0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCB1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cyArICcgcHJvamV0b3MgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hdXRob3ItY29udGFjdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAodXNlckRldGFpbC5saW5rcywgKGxpbmspID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tbWVzc2FnZVtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB1c2VyQ2FyZDtcbiIsIi8qKlxuICogd2luZG93LmMueW91dHViZUxpZ2h0Ym94IGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBsaWdodGJveCB3aXRoIGEgeW91dHViZSB2aWRlb1xuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLnlvdXR1YmVMaWdodGJveCwge3NyYzogJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9RmxGVGNEU0tuTE0nfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG5cbmltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IG1vZGVscyBmcm9tICdtb2RlbHMnO1xuaW1wb3J0IGggZnJvbSAnaCc7XG5cbmNvbnN0IHlvdXR1YmVMaWdodGJveCA9IHtcbiAgICBjb250cm9sbGVyIChhcmdzKSB7XG4gICAgICAgIGxldCBwbGF5ZXI7XG4gICAgICAgIGNvbnN0IHNob3dMaWdodGJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICBzZXRZb3V0dWJlID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgICAgICAgICAgICAgICAgIHRhZy5zcmMgPSAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaSc7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0U2NyaXB0VGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhZywgZmlyc3RTY3JpcHRUYWcpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBjcmVhdGVQbGF5ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsb3NlVmlkZW8gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHBsYXllcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlVmlkZW8oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzaG93TGlnaHRib3gudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY3JlYXRlUGxheWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ3l0dmlkZW8nLCB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUyOCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTQwJyxcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9JZDogYXJncy5zcmMsXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJbmZvOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZXN0QnJhbmRpbmc6IDBcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnb25TdGF0ZUNoYW5nZSc6IChzdGF0ZSkgPT4gKHN0YXRlLmRhdGEgPT09IDApID8gY2xvc2VWaWRlbygpIDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hvd0xpZ2h0Ym94OiBzaG93TGlnaHRib3gsXG4gICAgICAgICAgICBzZXRZb3V0dWJlOiBzZXRZb3V0dWJlLFxuICAgICAgICAgICAgY2xvc2VWaWRlbzogY2xvc2VWaWRlb1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdmlldyAoY3RybCwgYXJncykge1xuICAgICAgICByZXR1cm4gbSgnI3lvdXR1YmUtbGlnaHRib3gnLCBbXG4gICAgICAgICAgICBtKCdhI3lvdXR1YmUtcGxheS53LWxpZ2h0Ym94LnctaW5saW5lLWJsb2NrLmZhLmZhLXBsYXktY2lyY2xlLmZvbnRjb2xvci1uZWdhdGl2ZS5mYS01eFtocmVmPVxcJ2phdmFzY3JpcHQ6dm9pZCgwKTtcXCddJywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtKGAjbGlnaHRib3gudy1saWdodGJveC1iYWNrZHJvcFtzdHlsZT1cImRpc3BsYXk6JHtjdHJsLnNob3dMaWdodGJveCgpID8gJ2Jsb2NrJyA6ICdub25lJ31cIl1gLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtdmlldycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1mcmFtZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZmlndXJlLnctbGlnaHRib3gtZmlndXJlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnctbGlnaHRib3gtaW1nLnctbGlnaHRib3gtaW1hZ2Vbc3JjPVxcJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LCUzQ3N2ZyUyMHhtbG5zPSUyMmh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJTIyJTIwd2lkdGg9JTIyOTQwJTIyJTIwaGVpZ2h0PSUyMjUyOCUyMi8lM0VcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjeXR2aWRlby5lbWJlZGx5LWVtYmVkLnctbGlnaHRib3gtZW1iZWQnLCB7Y29uZmlnOiBjdHJsLnNldFlvdXR1YmV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXNwaW5uZXIudy1saWdodGJveC1oaWRlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtbGVmdC53LWxpZ2h0Ym94LWluYWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtcmlnaHQudy1saWdodGJveC1pbmFjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3lvdXR1YmUtY2xvc2Uudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtY2xvc2UnLCB7b25jbGljazogY3RybC5jbG9zZVZpZGVvfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXN0cmlwJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgeW91dHViZUxpZ2h0Ym94O1xuIiwiaW1wb3J0IEkxOG4gZnJvbSAnaTE4bi1qcyc7XG5cbmNvbnN0IGhvbWVWTSA9IEkxOG4gPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGkxOG5TdGFydCA9IEkxOG4udHJhbnNsYXRpb25zW0kxOG4uY3VycmVudExvY2FsZSgpXS5wcm9qZWN0cy5ob21lLFxuICAgICAgICAgICAgYmFubmVycyA9IGkxOG5TdGFydC5iYW5uZXJzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYW5uZXJzOiBiYW5uZXJzXG4gICAgICAgIH07XG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGhvbWVWTTtcbiIsIndpbmRvdy5jLnZtcy5wcm9qZWN0ID0gKChtLCBoLCBfLCBtb2RlbHMpID0+IHtcbiAgICByZXR1cm4gKHByb2plY3RfaWQsIHByb2plY3RfdXNlcl9pZCkgPT4ge1xuICAgICAgICBjb25zdCB2bSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICB9KSxcbiAgICAgICAgICAgICAgaWRWTSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgIHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgIGlkVk0uaWQocHJvamVjdF91c2VyX2lkKTtcblxuICAgICAgICBjb25zdCBsUHJvamVjdCA9IHBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgbFVzZXIgPSBwb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy51c2VyRGV0YWlsLmdldFJvd09wdGlvbnMoaWRWTS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgbFJld2FyZCA9IHBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgaXNMb2FkaW5nID0gKCkgPT4geyByZXR1cm4gKGxQcm9qZWN0KCkgfHwgbFVzZXIoKSB8fCBsUmV3YXJkKCkpOyB9O1xuXG4gICAgICAgIGxQcm9qZWN0LmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICBsUmV3YXJkLmxvYWQoKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICAgICAgICBwcm9qZWN0RGV0YWlscyhkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBfLmNvbXBvc2UoXy5maXJzdCwgcHJvamVjdERldGFpbHMpLFxuICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzLFxuICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogcmV3YXJkRGV0YWlscyxcbiAgICAgICAgICAgIGlzTG9hZGluZzogaXNMb2FkaW5nXG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IHJlcGxhY2VEaWFjcml0aWNzIGZyb20gJ3JlcGxhY2VEaWFjcml0aWNzJztcbmltcG9ydCBoIGZyb20gJ2gnO1xuXG5jb25zdCB2bSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICBzdGF0ZTogJ2VxJyxcbiAgICByZXdhcmRfaWQ6ICdlcScsXG4gICAgcHJvamVjdF9pZDogJ2VxJ1xufSksXG4gICAgICBwYXJhbVRvU3RyaW5nID0gKHApID0+IHtcbiAgICAgICAgICByZXR1cm4gKHB8fCcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgIH07XG5cbnZtLnN0YXRlKCcnKTtcbnZtLm9yZGVyKHtcbiAgICBpZDogJ2Rlc2MnXG59KTtcblxudm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gKCkgPT4ge1xuICAgIGNvbnN0IGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB2bTtcbiIsIndpbmRvdy5jLnZtcy5zdGFydCA9ICgoXykgPT4ge1xuICAgIHJldHVybiAoSTE4bikgPT4ge1xuICAgICAgICBjb25zdCBpMThuU3RhcnQgPSBJMThuLnRyYW5zbGF0aW9uc1tJMThuLmN1cnJlbnRMb2NhbGUoKV0ucGFnZXMuc3RhcnQsXG4gICAgICAgICAgICB0ZXN0aW1vbmlhbHMgPSBpMThuU3RhcnQudGVzdGltb25pYWxzLFxuICAgICAgICAgICAgY2F0ZWdvcnlQcm9qZWN0cyA9IGkxOG5TdGFydC5jYXRlZ29yeVByb2plY3RzLFxuICAgICAgICAgICAgcGFuZXMgPSBpMThuU3RhcnQucGFuZXMsXG4gICAgICAgICAgICBxYSA9IGkxOG5TdGFydC5xYTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGVzdGltb25pYWxzOiBfLm1hcCh0ZXN0aW1vbmlhbHMsICh0ZXN0aW1vbmlhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRodW1iVXJsOiB0ZXN0aW1vbmlhbC50aHVtYixcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogdGVzdGltb25pYWwuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGVzdGltb25pYWwubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxzOiB0ZXN0aW1vbmlhbC50b3RhbHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwYW5lczogXy5tYXAocGFuZXMsIChwYW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhbmUubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogcGFuZS5zcmNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBxdWVzdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBjb2xfMTogXy5tYXAocWEuY29sXzEsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjb2xfMjogXy5tYXAocWEuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhdGVnb3J5UHJvamVjdHM6IF8ubWFwKGNhdGVnb3J5UHJvamVjdHMsIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdGVnb3J5LmNhdGVnb3J5X2lkLFxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVQcm9qZWN0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkuc2FtcGxlX3Byb2plY3RfaWRzLnByaW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5zYW1wbGVfcHJvamVjdF9pZHMuc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cuXykpO1xuIiwiaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCdcbmltcG9ydCBoIGZyb20gJ2gnO1xuaW1wb3J0IHBvc3RncmVzdCBmcm9tICdtaXRocmlsLXBvc3RncmVzdCc7XG5pbXBvcnQgcmVwbGFjZURpYWNyaXRpY3MgZnJvbSAncmVwbGFjZURpYWNyaXRpY3MnO1xuXG5jb25zdCB2bSA9IHBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgIHN0YXRlOiAnZXEnLFxuICAgICAgICBnYXRld2F5OiAnZXEnLFxuICAgICAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgICAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgICB9KSxcblxuICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gICAgfTtcblxuLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG52bS5zdGF0ZSgnJyk7XG52bS5nYXRld2F5KCcnKTtcbnZtLm9yZGVyKHtcbiAgICBpZDogJ2Rlc2MnXG59KTtcblxudm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmx0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xufTtcblxudm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xufTtcblxudm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB2bTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IG1vZGVscyBmcm9tICdtb2RlbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG4iLCJpbXBvcnQgbSBmcm9tICdtaXRocmlsJztcbmltcG9ydCByZXBsYWNlRGlhY3JpdGljcyBmcm9tICdyZXBsYWNlRGlhY3JpdGljcyc7XG5cbmNvbnN0IHZtID0gcG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgIGZ1bGxfdGV4dF9pbmRleDogJ0BAJyxcbiAgICAgICAgZGVhY3RpdmF0ZWRfYXQ6ICdpcy5udWxsJ1xuICAgIH0pLFxuXG4gICAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICB9O1xuXG4vLyBTZXQgZGVmYXVsdCB2YWx1ZXNcbnZtLmRlYWN0aXZhdGVkX2F0KG51bGwpLm9yZGVyKHtcbiAgICBpZDogJ2Rlc2MnXG59KTtcblxudm0uZGVhY3RpdmF0ZWRfYXQudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsdGVyID0gSlNPTi5wYXJzZSh2bS5kZWFjdGl2YXRlZF9hdCgpKTtcbiAgICByZXR1cm4gZmlsdGVyO1xufTtcblxudm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB2bTtcbiIsImltcG9ydCBtIGZyb20gJ21pdGhyaWwnO1xuaW1wb3J0IG1vZGVscyBmcm9tICdtb2RlbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBwb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
